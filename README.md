# CCDuo

Claude Code 的使用搭档：每个账号独立身份与浏览器窗口，工作区（`~/.claude`）跨身份保留。

**技术栈** Tauri 2 · Rust · React 18 · TypeScript · Vite · CSS Modules · Lucide

## 开发

```bash
pnpm install
pnpm dev          # 浏览器预览（http://localhost:1420），使用内置演示数据，无需 Rust
pnpm tauri dev    # 桌面应用（需要 Rust 工具链）
pnpm test         # 单元测试（代理串识别等）
pnpm typecheck
pnpm tauri build  # 打包
```

首次运行桌面端前安装 Rust：`curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`。

浏览器预览中，`localStorage.ccduoMockLaunch = "fail"` 可预览「浏览器打开失败」页。

## 结构

```
src/
  styles/tokens.css        设计令牌（颜色 / 字体 / 间距 / 圆角 / 动效）
  components/ui/           组件底座：Button Badge Toggle Segmented Field FormRow Card Stepper …
  components/brand/        Duo Cards 标志、App Icon、字标
  components/layout/       AppShell · Sidebar · Page（顶栏 + 页头 + 页脚）
  features/accounts/       01 账号管理
  features/workspace/      01 工作区
  features/add-account/    06 分步添加账号（关联窗口 → 确认 → 等待登录 / 打开失败）
  features/design-system/  00 品牌与界面组件（#/design 活体样张）
  lib/                     types（与 Rust 模型对齐）· api（Tauri invoke / 浏览器 mock）· store
src-tauri/src/
  model.rs      serde 模型（camelCase）
  store.rs      账号与代理池持久化（app data / state.json）
  browser.rs    为账号启动独立 Chrome / Firefox 配置目录（代理、UA、启动网页、地理位置）
  network.rs    代理解析、连通性与出口 IP 检测、动态代理刷新
  workspace.rs  ~/.claude 工作区统计与安全打开
docs/design-system.md   设计规范
```

## 已还原的原型

- `00 · 品牌与界面组件` → 令牌、组件底座、`#/design`
- `01 · 账号与工作区` → `#/accounts`、`#/workspace`
- `06 · 分步添加账号` → `#/accounts/new`（跟随系统 / 添加代理IP / 选择代理、确认、等待登录、打开失败）

`02–05`（代理池、浏览器窗口、系统环境、网络环境）在侧栏中以占位页呈现。
