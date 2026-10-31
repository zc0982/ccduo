import { Badge, Spinner } from "@/components/ui";
import type { TestState } from "./useAddAccountFlow";

/** 「连接检测」value: 尚未检测 → 检测中 → 检测通过 / 连接失败. */
export function ConnectionStatus({ test }: { test: TestState }) {
  if (test.status === "idle") return <>尚未检测</>;
  if (test.status === "testing")
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        <Spinner size={14} /> 检测中…
      </span>
    );
  const { ok, message } = test.result;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
      <Badge tone={ok ? "success" : "danger"}>{ok ? "检测通过" : "需要处理"}</Badge>
      <span style={{ color: "var(--color-text-muted)", fontSize: 12 }}>{ok ? latencyLine(test) : message}</span>
    </span>
  );
}

function latencyLine(test: Extract<TestState, { status: "done" }>): string {
  const { latencyMs, exitIp, country } = test.result;
  return [latencyMs != null ? `${latencyMs} ms` : null, exitIp, country].filter(Boolean).join(" · ");
}

export function connectionText(test: TestState): string {
  if (test.status === "idle") return "尚未检测";
  if (test.status === "testing") return "检测中…";
  return test.result.ok ? `检测通过 · ${latencyLine(test)}` : `需要处理 · ${test.result.message}`;
}
