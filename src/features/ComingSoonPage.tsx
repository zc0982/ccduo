import { Hammer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Page } from "@/components/layout/Page";
import { Button, Card } from "@/components/ui";

/** Placeholder for sidebar sections whose screens (02–05) are not built yet. */
export function ComingSoonPage({ title, subtitle }: { title: string; subtitle: string }) {
  const navigate = useNavigate();
  return (
    <Page crumbs={[{ label: "个人工作区", to: "/workspace" }, { label: title }]} title={title} subtitle={subtitle}>
      <Card
        style={{
          marginTop: 35,
          minHeight: 280,
          display: "grid",
          placeItems: "center",
          textAlign: "center",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <Hammer size={32} strokeWidth={1.5} color="var(--color-accent)" aria-hidden />
          <p style={{ fontSize: "var(--text-title)", fontWeight: 500 }}>此页面正在还原中</p>
          <p style={{ color: "var(--color-text-muted)", fontSize: "var(--text-small)" }}>对应原型稿将在后续迭代中实现。</p>
          <Button style={{ marginTop: 12 }} onClick={() => navigate("/accounts")}>
            返回账号管理
          </Button>
        </div>
      </Card>
    </Page>
  );
}
