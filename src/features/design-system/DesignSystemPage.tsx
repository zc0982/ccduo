import { useState } from "react";
import { Plus, ShieldCheck } from "lucide-react";
import { AppIcon, DuoCards } from "@/components/brand/DuoCards";
import { Page } from "@/components/layout/Page";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  DescriptionList,
  Divider,
  FormRow,
  InlineNote,
  Segmented,
  Select,
  Stepper,
  TextInput,
  Toggle,
} from "@/components/ui";
import styles from "./DesignSystemPage.module.css";

const SWATCHES = [
  { name: "canvas", token: "--color-canvas", hex: "#121316", outline: true },
  { name: "surface", token: "--color-surface", hex: "#202127" },
  { name: "raised", token: "--color-raised", hex: "#2C2D35" },
  { name: "accent", token: "--color-accent", hex: "#F2A541" },
  { name: "text", token: "--color-text", hex: "#F4EFE6" },
  { name: "success", token: "--color-success", hex: "#4FD1A5" },
  { name: "danger", token: "--color-danger", hex: "#F08A6E" },
];

const TYPE_SCALE = [
  { token: "display", sample: "账号管理", spec: "26 / 39 · Semibold" },
  { token: "headline", sample: "空身份", spec: "22 / 33 · Semibold" },
  { token: "title", sample: "我的账号", spec: "17 / 26 · Medium" },
  { token: "body", sample: "每个账号使用独立身份，工作区内容持续保留。", spec: "14 / 21 · Regular" },
  { token: "small", sample: "浏览器窗口跟随系统连接，无需额外填写代理。", spec: "13 / 20 · Regular" },
  { token: "caption", sample: "账号身份与浏览器窗口一一关联。", spec: "12 / 18 · Regular" },
  { token: "micro", sample: "本地保存 · 始终保留", spec: "11 / 17 · Regular" },
];

/** 00 · 品牌与界面组件 — living reference for the component library. */
export function DesignSystemPage() {
  const [toggle, setToggle] = useState(true);
  const [mode, setMode] = useState<"system" | "custom" | "pool">("system");
  const [match, setMatch] = useState<"ip" | "custom">("ip");

  return (
    <Page
      crumbs={[{ label: "CCDuo" }, { label: "品牌与界面组件" }]}
      title="品牌与界面组件"
      subtitle="按钮承载主要动作，状态同时使用文字与颜色。"
      footer={{ note: "1440 × 900  ·  232 px 侧栏  ·  36 px 内容边距  ·  12 px 卡片圆角" }}
    >
      <div className={styles.grid}>
        <Card className={styles.brand}>
          <CardHeader title="CCDuo" description="Claude Code 的使用搭档" aside={<span className={styles.kicker}>01 / DUO CARDS</span>} />
          <div className={styles.brandBody}>
            <AppIcon size={280} />
            <div>
              <p className={styles.slogan}>独立身份。熟悉的工作区。</p>
              <p className={styles.sloganSub}>
                两张叠合的卡片，代表 Claude 与搭档。
                <br />
                沿用原型中的暖白、琥珀与深色交集。
              </p>
              <div className={styles.sizes}>
                {[128, 64, 32, 16].map((size) => (
                  <figure key={size}>
                    <div className={styles.sizeBox}>
                      <AppIcon size={size} />
                    </div>
                    <figcaption>{size} px</figcaption>
                  </figure>
                ))}
                <figure>
                  <div className={styles.sizeBox}>
                    <DuoCards size={32} />
                  </div>
                  <figcaption>mark</figcaption>
                </figure>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="按钮" />
          <div className={styles.row}>
            {(
              [
                ["primary", "主要操作"],
                ["secondary", "次要操作"],
                ["ghost", "轻量操作"],
                ["danger", "破坏性操作"],
              ] as const
            ).map(([variant, label]) => (
              <div key={variant} className={styles.specimen}>
                <Button variant={variant} icon={variant === "primary" ? <Plus strokeWidth={2} /> : undefined} className={styles.w160}>
                  按钮
                </Button>
                <span>{label}</span>
              </div>
            ))}
          </div>
          <div className={styles.row}>
            <Button variant="primary" loading className={styles.w160}>
              加载中
            </Button>
            <Button disabled className={styles.w160}>
              不可用
            </Button>
            <Button size="sm">小号 36</Button>
          </div>

          <Divider className={styles.divider} />
          <CardHeader title="开关与状态" />
          <div className={styles.row}>
            <Toggle checked={toggle} onChange={setToggle} aria-label="示例开关" />
            <Toggle checked={!toggle} onChange={(v) => setToggle(!v)} aria-label="示例开关（反向）" />
            <Badge tone="success">检测通过</Badge>
            <Badge tone="accent">需要处理</Badge>
            <Badge tone="neutral">未运行</Badge>
            <Badge tone="danger">连接失败</Badge>
          </div>
        </Card>

        <Card>
          <CardHeader title="表单" />
          <div className={styles.form}>
            <FormRow label="浏览器名称" hint="* 系统自动生成窗口名称，也可手动修改。">
              {(id) => <TextInput id={id} defaultValue="20261028-01" />}
            </FormRow>
            <FormRow label="代理主机" error="请填写代理主机">
              {(id) => <TextInput id={id} placeholder="代理主机" invalid />}
            </FormRow>
            <FormRow label="代理 IP">
              <Segmented
                size="md"
                aria-label="代理 IP"
                value={mode}
                onChange={setMode}
                options={[
                  { value: "system", label: "跟随系统" },
                  { value: "custom", label: "添加代理IP" },
                  { value: "pool", label: "选择代理" },
                ]}
              />
            </FormRow>
            <FormRow label="语言">
              <Segmented
                aria-label="语言"
                value={match}
                onChange={setMatch}
                style={{ width: 300 }}
                options={[
                  { value: "ip", label: "基于 IP 匹配" },
                  { value: "custom", label: "自定义" },
                ]}
              />
            </FormRow>
            <FormRow label="系统">
              {(id) => (
                <Select
                  id={id}
                  defaultValue="macos"
                  options={[
                    { value: "macos", label: "macOS" },
                    { value: "windows", label: "Windows" },
                  ]}
                />
              )}
            </FormRow>
          </div>
        </Card>

        <Card>
          <CardHeader title="信息展示" />
          <Stepper steps={["关联浏览器窗口", "添加账号"]} current={1} className={styles.stepper} />
          <DescriptionList
            items={[
              { label: "代理来源", value: "系统网络设置" },
              { label: "代理地址", value: "203.0.113.24:1080", mono: true },
              { label: "连接检测", value: "尚未检测", muted: true },
            ]}
          />
          <InlineNote icon={<ShieldCheck size={20} strokeWidth={1.6} />} className={styles.note}>
            身份与工作区分开管理。
          </InlineNote>
        </Card>

        <Card className={styles.full}>
          <CardHeader title="颜色 / Dark" />
          <div className={styles.swatches}>
            {SWATCHES.map((s) => (
              <figure key={s.name}>
                <div className={styles.swatch} style={{ background: `var(${s.token})`, borderColor: s.outline ? "var(--color-border)" : "transparent" }} />
                <figcaption>
                  <span>{s.name}</span>
                  <code>{s.hex}</code>
                </figcaption>
              </figure>
            ))}
          </div>
        </Card>

        <Card className={styles.full}>
          <CardHeader title="字体" description="中文 PingFang SC · 品牌 Space Grotesk · 拉丁辅助 Inter · 数据 Menlo" />
          <dl className={styles.types}>
            {TYPE_SCALE.map((t) => (
              <div key={t.token}>
                <dt>
                  <code>--text-{t.token}</code>
                  <span>{t.spec}</span>
                </dt>
                <dd style={{ fontSize: `var(--text-${t.token})`, lineHeight: `var(--leading-${t.token})` }}>{t.sample}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </div>
    </Page>
  );
}
