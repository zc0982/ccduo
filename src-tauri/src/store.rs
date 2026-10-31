//! Local persistence: one JSON document in the app data directory.

use std::fs;
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicU32, Ordering};
use std::time::{SystemTime, UNIX_EPOCH};

use crate::model::{Account, AccountInput, AccountStatus, AppSnapshot, ProxyMode};

const STATE_FILE: &str = "state.json";
pub const DEFAULT_ACCOUNT_ID: &str = "default";

pub struct Store {
    path: PathBuf,
    data: AppSnapshot,
}

impl Store {
    /// Loads `state.json`, falling back to a fresh state with the built-in 默认账号.
    /// A corrupt file is kept aside as `state.json.bak` rather than overwritten silently.
    pub fn load(dir: &Path) -> Self {
        let path = dir.join(STATE_FILE);
        let data = match fs::read_to_string(&path) {
            Ok(text) => serde_json::from_str::<AppSnapshot>(&text).unwrap_or_else(|err| {
                eprintln!("[ccduo] state.json unreadable ({err}); starting fresh");
                let _ = fs::rename(&path, dir.join("state.json.bak"));
                Self::initial()
            }),
            Err(_) => Self::initial(),
        };
        Store { path, data }
    }

    fn initial() -> AppSnapshot {
        AppSnapshot {
            accounts: vec![Account {
                id: DEFAULT_ACCOUNT_ID.into(),
                name: "默认账号".into(),
                identity: None,
                proxy: None,
                browser: None,
                status: AccountStatus::Empty,
                created_at: now_ms(),
            }],
            current_account_id: DEFAULT_ACCOUNT_ID.into(),
            proxies: Vec::new(),
        }
    }

    fn save(&self) -> Result<(), String> {
        let text = serde_json::to_string_pretty(&self.data).map_err(|e| e.to_string())?;
        let tmp = self.path.with_extension("json.tmp");
        fs::write(&tmp, text).map_err(|e| format!("无法写入账号数据：{e}"))?;
        fs::rename(&tmp, &self.path).map_err(|e| format!("无法保存账号数据：{e}"))
    }

    pub fn snapshot(&self) -> AppSnapshot {
        self.data.clone()
    }

    pub fn account(&self, id: &str) -> Result<&Account, String> {
        self.data.accounts.iter().find(|a| a.id == id).ok_or_else(|| "账号不存在".to_string())
    }

    pub fn create_account(&mut self, input: AccountInput) -> Result<Account, String> {
        self.validate(&input, None)?;
        let account = Account {
            id: new_id(),
            name: input.name.trim().to_string(),
            identity: None,
            proxy: Some(input.proxy),
            browser: Some(input.browser),
            status: AccountStatus::Empty,
            created_at: now_ms(),
        };
        self.data.accounts.push(account.clone());
        self.save()?;
        Ok(account)
    }

    pub fn update_account(&mut self, id: &str, input: AccountInput) -> Result<Account, String> {
        self.validate(&input, Some(id))?;
        let account = self.data.accounts.iter_mut().find(|a| a.id == id).ok_or("账号不存在")?;
        account.name = input.name.trim().to_string();
        account.proxy = Some(input.proxy);
        account.browser = Some(input.browser);
        let updated = account.clone();
        self.save()?;
        Ok(updated)
    }

    pub fn switch_account(&mut self, id: &str) -> Result<AppSnapshot, String> {
        self.account(id)?;
        self.data.current_account_id = id.to_string();
        self.save()?;
        Ok(self.snapshot())
    }

    pub fn mark_login_requested(&mut self, id: &str) -> Result<Account, String> {
        let account = self.data.accounts.iter_mut().find(|a| a.id == id).ok_or("账号不存在")?;
        if account.status != AccountStatus::Active {
            account.status = AccountStatus::PendingLogin;
        }
        let updated = account.clone();
        self.save()?;
        Ok(updated)
    }

    fn validate(&self, input: &AccountInput, editing: Option<&str>) -> Result<(), String> {
        if input.name.trim().is_empty() {
            return Err("请填写账号名称".into());
        }
        let window = input.browser.name.trim();
        if window.is_empty() {
            return Err("请填写浏览器名称".into());
        }
        let window_taken = self.data.accounts.iter().any(|a| {
            Some(a.id.as_str()) != editing && a.browser.as_ref().is_some_and(|b| b.name.trim() == window)
        });
        if window_taken {
            return Err(format!("浏览器窗口“{window}”已被其他账号使用"));
        }
        if input.browser.startup_urls.is_empty()
            || input
                .browser
                .startup_urls
                .iter()
                .any(|u| !(u.starts_with("http://") || u.starts_with("https://")))
        {
            return Err("启动网页需以 http:// 或 https:// 开头".into());
        }
        match input.proxy.mode {
            ProxyMode::System => Ok(()),
            ProxyMode::Custom => match &input.proxy.custom {
                Some(c) if !c.host.trim().is_empty() && c.port.is_some_and(|p| p > 0) => Ok(()),
                _ => Err("请填写代理主机与端口".into()),
            },
            ProxyMode::Pool => match &input.proxy.pool_proxy_id {
                Some(pid) if self.data.proxies.iter().any(|p| &p.id == pid) => Ok(()),
                _ => Err("所选代理不在代理池中".into()),
            },
        }
    }
}

pub fn now_ms() -> u64 {
    SystemTime::now().duration_since(UNIX_EPOCH).map(|d| d.as_millis() as u64).unwrap_or(0)
}

fn new_id() -> String {
    static COUNTER: AtomicU32 = AtomicU32::new(0);
    format!("acc-{:x}{:03x}", now_ms(), COUNTER.fetch_add(1, Ordering::Relaxed) & 0xfff)
}
