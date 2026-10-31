# CCDuo 设计规范 · 00 品牌与界面组件

来源：Figma「CCDuo · 桌面应用 UI 与品牌图标」→ `00 · 品牌与界面组件`。
代码落点：`src/styles/tokens.css`（令牌）· `src/components/ui`（组件）· `src/components/brand`（品牌）· 运行时可在侧栏底部「CCDuo / Desktop」进入 `#/design` 查看活体样张。

> 场景定位：**Operate**（桌面管理工具）。结构可预期、密度稳定、控件标准化；不追求打破网格。
> 品牌覆盖：Space Grotesk（字标）与 Inter（拉丁辅助）来自已批准的品牌稿，仅用于字标、副标题与色值标注，正文统一 PingFang SC。

## 1. 品牌

| 元素 | 规格 |
| --- | --- |
| 标志 Duo Cards | 两张 23.8/32 圆角卡片错位叠合：暖白 `#F4EFE6` 在上，琥珀 `#F2A541` 在下，交集为深色 `#101113`。组件 `<DuoCards size>` |
| App Icon | 深色底板 `#17181C`（103/128，圆角 23）承载标志。组件 `<AppIcon size>`；`src-tauri/icons` 由 `pnpm tauri icon src-tauri/app-icon.png` 生成 |
| 字标 | `CCDuo` · Space Grotesk Bold 23/35；副标题 `CLAUDE CODE COMPANION` · Inter Medium 9，全大写，灰色 |
| 尺寸 | 128 / 64 / 32 / 16 px 四档；侧栏使用 32 px 标志 |

## 2. 颜色（Dark）

| Token | 值 | 用途 |
| --- | --- | --- |
| `--color-sunken` | `#0E0F11` | 侧栏底、琥珀按钮上的文字 |
| `--color-canvas` | `#121316` | 应用底、输入框/分段控件底 |
| `--color-surface` | `#202127` | 卡片、表格（叠加 `--shadow-card`） |
| `--color-raised` / `-hover` / `-pressed` | `#2C2D35` / `#35363F` / `#26272E` | 次要按钮、选中项、头像底 |
| `--color-border` | `#2E2F37` | 1 px 分隔线、卡片描边 |
| `--color-border-strong` | `#3D3E48` | 控件描边：次要按钮、输入框、分段控件 |
| `--color-text` | `#F4EFE6` | 主文字（暖白） |
| `--color-text-muted` | `#A3A3A8` | 次要文字、标签、占位 |
| `--color-accent` | `#F2A541` | 主要操作、选中态、品牌图标 |
| `--color-accent-soft` | `#30271D` | 「当前使用 / 需要处理 / 等待登录」徽标底 |
| `--color-success` / `-soft` | `#4FD1A5` / `#182A25` | 检测通过、步骤完成 |
| `--color-danger` / `-soft` | `#F08A6E` / `#33221E` | 破坏性操作、错误 |

> 对比度调整（相对 Figma 初稿）：画布压暗、卡片与次要按钮各提亮一级，控件改用 `border-strong` 描边，卡片加轻投影，保证「页面 → 卡片 → 控件」三层在深色下清晰可辨。

规则：状态**同时用文字与颜色**表达；琥珀只用于“当前 / 主要 / 选中”，不做大面积装饰。

## 3. 字体与字号

正文 `PingFang SC`；数据/路径 `Menlo`；行高统一 1.5。

| Token | 字号/行高 · 字重 | 用途 |
| --- | --- | --- |
| `display` | 26/39 · Semibold | 页面标题、状态页标题 |
| `headline` | 22/33 · Semibold | 当前身份名、工作区名 |
| `figure` | 23/35 · Medium | 摘要里的窗口名 |
| `title` | 17/26 · Medium | 卡片/分区标题 |
| `subtitle` | 16/24 · Medium | 特性标题（使用当前系统网络） |
| `label` | 15/23 · Medium | 步骤名、列表项标题 |
| `body` | 14/21 | 正文、按钮 |
| `small` | 13/20 | 表单标签、输入值、说明 |
| `caption` | 12/18 | 徽标、表头、分段控件 |
| `micro` | 11/17 | 字段提示、侧栏辅助 |
| `nano` | 10/15 | 启动网页格式提示 |

## 4. 布局与间距

- 画板 1440 × 900；侧栏 232 px（`#101113`，右侧 1 px 分隔）；顶栏 76 px（面包屑 13 px，右侧环境标签）。
- 内容左右边距 **36 px**；页面标题距顶栏 32 px；标题 → 首个区块 35 px；区块之间 20–24 px。
- 间距取 4 的倍数（4/8/12/16/20/24/32/36/48）。
- 表单行：标签列 112 px，左对齐、与 36 px 控件垂直居中（上内边距 8 px）；行距 8 px，分段行距 10 px。
- 页脚：分隔线 + 左说明 + 右操作（取消 112 / 主按钮 152，间距 16），或仅说明文字。

## 5. 圆角

| Token | 值 | 用于 |
| --- | --- | --- |
| `--radius-field` | 6 | 输入框、分段选项 |
| `--radius-segment` | 7 | 分段控件容器 |
| `--radius-control` | 8 | 按钮、徽标 |
| `--radius-item` | 10 | 侧栏导航项、36 px 头像 |
| `--radius-card` | 12 | 卡片、表格 |
| `--radius-tile` | 20 | 56 px 身份图块 |
| `--radius-window` | 16 | 窗口 |

## 6. 组件底座（`src/components/ui`）

| 组件 | 变体 / 状态 | 规格 |
| --- | --- | --- |
| `Button` | `primary` 主要 · `secondary` 次要 · `ghost` 轻量 · `danger` 破坏性；`size` md 40 / sm 36；`icon` `iconOnly` `loading` `disabled` | 14 Medium，水平内边距 24，图标 16 + 间距 8 |
| `Badge` | `accent` `success` `neutral` `danger` | 高 28，内边距 12，12 px |
| `Toggle` | on / off / disabled | 40 × 24，圆钮 18；on = 琥珀轨道 + 深色圆钮 |
| `Segmented` | md 36 / sm 32；方向键切换 | 等宽选项；选中 = `raised` 底 + 琥珀 1 px 描边 + 琥珀文字 |
| `TextInput` / `Select` / `TextArea` | md 36 / lg 44；`invalid`；`mono` | `canvas` 底，`border` 描边，聚焦琥珀描边 + 3 px 柔光；错误为 danger 描边 |
| `FormRow` | `inline`（112 px 标签列）/ `stacked`；`hint` / `error` | 提示 11 px 灰，错误 11 px danger 并 `role=alert` |
| `Card` + `CardHeader` | `padding` none/md/lg；`aside` | 内边距 20（标题再缩进 4）/ 48 |
| `Stepper` | done（绿底对勾）· current（琥珀实心）· upcoming（灰） | 圆点 30，连接线 108 |
| `DescriptionList` | `labelWidth` `gap` `valueSize`；项可 `muted` `mono` | 标签 13 灰 / 值 14 暖白 |
| `IconTile` | 36（r10）/ 56（r20）；neutral / accent | 头像与身份图块 |
| `InlineNote` | muted / accent / danger / success；small / micro | 图标 + 单行说明 |
| `Divider` | 水平 / 垂直 | 1 px `border` 色 |
| `Spinner` | — | Lucide `LoaderCircle` 旋转 |

图标统一使用 **Lucide**（1.6 描边用于导航/列表，2 用于按钮内）。

## 7. 交互与动效

- 悬停：次要按钮提亮、导航项 `raised` 55% 底；按下：主按钮加深并下移 1 px。
- 页面进入 320 ms 淡入上移 6 px；步骤切换 180–320 ms。尊重 `prefers-reduced-motion`。
- 焦点：2 px 琥珀 45% 外描边；输入框聚焦改为描边 + 柔光。
- 文本选择仅在输入框内开放；其余区域为桌面应用默认不可选。
