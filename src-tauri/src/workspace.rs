//! Summarises the shared Claude Code workspace (`~/.claude`) that survives identity switches.

use std::fs;
use std::path::{Path, PathBuf};

use crate::model::WorkspaceSummary;

/// Subdirectories counted as 缓存与日志.
const CACHE_DIRS: &[&str] = &["debug", "logs", "shell-snapshots", "statsig", "todos", "file-history", "paste-cache"];

pub fn root(home: &Path) -> PathBuf {
    home.join(".claude")
}

pub fn summary(home: &Path) -> WorkspaceSummary {
    let root = root(home);
    let skills = count_entries(&root.join("skills"), |p| p.is_dir()) + count_files_recursive(&root.join("commands"), "md", 4);

    let plugins = read_json(&root.join("plugins").join("installed_plugins.json"))
        .and_then(|v| v.get("plugins").and_then(|p| p.as_object()).map(|o| o.len() as u32))
        .unwrap_or(0);

    let mcp_servers = read_json(&home.join(".claude.json"))
        .and_then(|v| v.get("mcpServers").and_then(|m| m.as_object()).map(|o| o.len() as u32))
        .unwrap_or(0);

    let projects_dir = root.join("projects");
    let projects = count_entries(&projects_dir, |p| p.is_dir());
    let sessions = fs::read_dir(&projects_dir)
        .map(|it| {
            it.flatten()
                .map(|e| count_entries(&e.path(), |p| p.extension().is_some_and(|x| x == "jsonl")))
                .sum::<u32>()
        })
        .unwrap_or(0);

    let cache_bytes: u64 = CACHE_DIRS.iter().map(|d| dir_size(&root.join(d), 6)).sum();

    WorkspaceSummary {
        path: root.display().to_string(),
        display_path: "~/.claude".into(),
        skills,
        plugins,
        mcp_servers,
        projects,
        sessions,
        cache_bytes,
    }
}

/// User-level MCP servers live in `~/.claude.json`, next to the workspace directory.
pub const MCP_CONFIG_KEY: &str = "~/.claude.json";

/// Resolves a path inside the workspace, refusing anything that escapes it.
pub fn resolve_inside(home: &Path, sub: &str) -> Result<PathBuf, String> {
    if sub == MCP_CONFIG_KEY {
        let file = home.join(".claude.json");
        return if file.is_file() { Ok(file) } else { Err("尚未创建 ~/.claude.json".into()) };
    }
    let root = root(home);
    if sub.split(['/', '\\']).any(|part| part == "..") {
        return Err("路径无效".into());
    }
    let target = if sub.is_empty() { root.clone() } else { root.join(sub) };
    if target.exists() {
        Ok(target)
    } else if root.exists() {
        Ok(root)
    } else {
        Err("尚未找到 ~/.claude，请先运行一次 Claude Code。".into())
    }
}

fn read_json(path: &Path) -> Option<serde_json::Value> {
    serde_json::from_str(&fs::read_to_string(path).ok()?).ok()
}

fn count_entries(dir: &Path, keep: impl Fn(&Path) -> bool) -> u32 {
    fs::read_dir(dir)
        .map(|it| it.flatten().filter(|e| keep(&e.path())).count() as u32)
        .unwrap_or(0)
}

fn count_files_recursive(dir: &Path, ext: &str, depth: u8) -> u32 {
    let Ok(it) = fs::read_dir(dir) else { return 0 };
    it.flatten()
        .map(|e| {
            let p = e.path();
            if p.is_dir() && depth > 0 {
                count_files_recursive(&p, ext, depth - 1)
            } else if p.extension().is_some_and(|x| x == ext) {
                1
            } else {
                0
            }
        })
        .sum()
}

fn dir_size(dir: &Path, depth: u8) -> u64 {
    let Ok(it) = fs::read_dir(dir) else { return 0 };
    it.flatten()
        .map(|e| match e.metadata() {
            Ok(m) if m.is_dir() && depth > 0 => dir_size(&e.path(), depth - 1),
            Ok(m) if m.is_file() => m.len(),
            _ => 0,
        })
        .sum()
}
