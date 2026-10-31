//! CCDuo desktop backend: account store, browser windows, proxy checks and workspace summary.

mod browser;
mod model;
mod network;
mod store;
mod workspace;

use std::path::PathBuf;
use std::sync::{Mutex, MutexGuard};

use tauri::{AppHandle, Manager, State};
use tauri_plugin_opener::OpenerExt;

use model::{Account, AccountInput, AppSnapshot, ConnectionResult, ProxyConfig, WorkspaceSummary};
use store::Store;

struct AppState {
    store: Mutex<Store>,
    data_dir: PathBuf,
}

impl AppState {
    fn store(&self) -> Result<MutexGuard<'_, Store>, String> {
        self.store.lock().map_err(|_| "账号数据被占用，请重试".to_string())
    }
}

/// Runs blocking work (network, process spawn, disk scans) off the async runtime.
async fn blocking<T: Send + 'static>(f: impl FnOnce() -> T + Send + 'static) -> Result<T, String> {
    tauri::async_runtime::spawn_blocking(f).await.map_err(|e| e.to_string())
}

fn home_dir(app: &AppHandle) -> Result<PathBuf, String> {
    app.path().home_dir().map_err(|e| e.to_string())
}

#[tauri::command]
fn get_snapshot(state: State<'_, AppState>) -> Result<AppSnapshot, String> {
    Ok(state.store()?.snapshot())
}

#[tauri::command]
fn create_account(input: AccountInput, state: State<'_, AppState>) -> Result<Account, String> {
    state.store()?.create_account(input)
}

#[tauri::command]
fn update_account(id: String, input: AccountInput, state: State<'_, AppState>) -> Result<Account, String> {
    state.store()?.update_account(&id, input)
}

#[tauri::command]
fn switch_account(id: String, state: State<'_, AppState>) -> Result<AppSnapshot, String> {
    state.store()?.switch_account(&id)
}

/// Opens the account's browser window at its startup pages and marks it as waiting for login.
#[tauri::command]
async fn launch_browser(id: String, state: State<'_, AppState>) -> Result<Account, String> {
    let (account, proxy) = {
        let store = state.store()?;
        let account = store.account(&id)?.clone();
        let proxies = store.snapshot().proxies;
        let proxy = network::resolve(account.proxy.as_ref(), &proxies)?;
        (account, proxy)
    };
    let data_dir = state.data_dir.clone();
    let to_launch = account.clone();
    blocking(move || browser::launch(&to_launch, proxy.as_ref(), &data_dir)).await??;
    state.store()?.mark_login_requested(&account.id)
}

#[tauri::command]
async fn test_connection(proxy: ProxyConfig, state: State<'_, AppState>) -> Result<ConnectionResult, String> {
    let pool = state.store()?.snapshot().proxies;
    blocking(move || network::test(&proxy, &pool)).await
}

#[tauri::command]
async fn refresh_proxy_ip(url: String) -> Result<String, String> {
    blocking(move || network::refresh_ip(&url)).await?
}

#[tauri::command]
async fn workspace_summary(app: AppHandle) -> Result<WorkspaceSummary, String> {
    let home = home_dir(&app)?;
    blocking(move || workspace::summary(&home)).await
}

/// Opens `~/.claude/<sub>` in Finder / the default app. Paths outside the workspace are rejected.
#[tauri::command]
fn open_workspace_path(sub: String, app: AppHandle) -> Result<(), String> {
    let target = workspace::resolve_inside(&home_dir(&app)?, &sub)?;
    app.opener()
        .open_path(target.display().to_string(), None::<&str>)
        .map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let data_dir = app.path().app_data_dir()?;
            std::fs::create_dir_all(&data_dir)?;
            app.manage(AppState { store: Mutex::new(Store::load(&data_dir)), data_dir });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_snapshot,
            create_account,
            update_account,
            switch_account,
            launch_browser,
            test_connection,
            refresh_proxy_ip,
            workspace_summary,
            open_workspace_path,
        ])
        .run(tauri::generate_context!())
        .expect("error while running CCDuo");
}
