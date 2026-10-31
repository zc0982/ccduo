import { useEffect, useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, Clock, Folder, Link, Monitor, Settings, SquareTerminal, TriangleAlert, UserRound } from "lucide-react";
import { Page } from "@/components/layout/Page";
import { Badge, Button, Card, InlineNote, Spinner } from "@/components/ui";
import { api, errorMessage, isTauri } from "@/lib/api";
import type { WorkspaceSummary } from "@/lib/types";
import styles from "./WorkspacePage.module.css";

/** Claude Code keeps user-level MCP servers in `~/.claude.json`, beside the workspace dir. */
const MCP_CONFIG = "~/.claude.json";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${value >= 100 ? Math.round(value) : value.toFixed(1)} ${units[unit]}`;
}

function Row({
  icon: Icon,
  title,
  meta,
  trailing,
}: {
  icon: LucideIcon;
  title: string;
  meta: ReactNode;
  trailing: ReactNode;
}) {
  return (
    <li className={styles.row}>
      <Icon className={styles.rowIcon} size={21} strokeWidth={1.6} aria-hidden />
      <div className={styles.rowText}>
        <span className={styles.rowTitle}>{title}</span>
        <span className={styles.rowMeta}>{meta}</span>
      </div>
      <div className={styles.trailing}>{trailing}</div>
    </li>
  );
}

export function WorkspacePage() {
  const [summary, setSummary] = useState<WorkspaceSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.workspaceSummary().then(setSummary, (e) => setError(errorMessage(e)));
  }, []);

  const open = (sub = "") => {
    api.openWorkspacePath(sub).catch((e) => setError(errorMessage(e)));
  };

  const link = (label: string, sub: string) => (
    <button type="button" className={styles.link} onClick={() => open(sub)} disabled={!isTauri || !summary}>
      {label}
      <ArrowRight size={14} strokeWidth={2} aria-hidden />
    </button>
  );

  const count = (n: number | undefined, unit: string) => (summary ? `${n} ${unit}` : "—");

  return (
    <Page
      crumbs={[{ label: "个人工作区", to: "/workspace" }, { label: "工作区" }]}
      title="工作区"
      subtitle="切换身份时，保留你的工具配置与工作记录。"
      actions={
        <Button variant="primary" className={styles.openButton} onClick={() => open()} disabled={!summary}>
          打开目录
        </Button>
      }
      footer={{ note: isTauri ? "统计来自本机 Claude Code 配置目录。" : "所有账号与检测数值均为设计演示" }}
    >
      <Card className={styles.hero}>
        <Folder className={styles.heroIcon} size={40} strokeWidth={1.5} aria-hidden />
        <div className={styles.heroText}>
          <h2 className={styles.heroTitle}>个人工作区</h2>
          <p className={styles.heroPath}>
            本地保存&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;
            <span className="mono" title={summary?.path}>
              {summary?.displayPath ?? "…"}
            </span>
          </p>
        </div>
        <Badge tone="success">持续保留</Badge>
      </Card>

      {error && (
        <InlineNote tone="danger" className={styles.error}>
          无法读取工作区：{error}
        </InlineNote>
      )}

      <Card className={styles.panels}>
        <section className={styles.column}>
          <header className={styles.columnHead}>
            <h2>工具与偏好</h2>
            <p>跨身份保留，按工作区维护</p>
          </header>
          <ul className={styles.rows}>
            <Row icon={SquareTerminal} title="Skills 与命令" meta={count(summary?.skills, "项")} trailing={link("查看与管理", "skills")} />
            <Row icon={Settings} title="插件" meta={summary ? `${summary.plugins} 个已安装` : "—"} trailing={link("查看与管理", "plugins")} />
            <Row icon={Link} title="MCP 配置" meta={count(summary?.mcpServers, "个服务")} trailing={link("编辑配置", MCP_CONFIG)} />
            <Row icon={UserRound} title="个人设置" meta="偏好与快捷键" trailing={link("打开设置", "settings.json")} />
          </ul>
        </section>

        <div className={styles.split} aria-hidden />

        <section className={styles.column}>
          <header className={styles.columnHead}>
            <h2>记录与存储</h2>
            <p>本机可见的工作上下文</p>
          </header>
          <ul className={styles.rows}>
            <Row icon={Folder} title="项目记录" meta="最近打开与目录" trailing={<span className={styles.stat}>{count(summary?.projects, "个项目")}</span>} />
            <Row icon={Clock} title="会话历史" meta="按项目继续工作" trailing={<span className={styles.stat}>{count(summary?.sessions, "个会话")}</span>} />
            <Row
              icon={Monitor}
              title="缓存与日志"
              meta="诊断与日常维护"
              trailing={<span className={styles.stat}>{summary ? formatBytes(summary.cacheBytes) : <Spinner size={14} />}</span>}
            />
          </ul>
          <InlineNote tone="accent" icon={<TriangleAlert size={20} strokeWidth={1.6} />} className={styles.warning}>
            清理本机 Claude 状态前，单独确认清理范围。
          </InlineNote>
        </section>
      </Card>
    </Page>
  );
}
