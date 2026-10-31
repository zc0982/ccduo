import { createHashRouter, Navigate, RouterProvider } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { AccountsPage } from "@/features/accounts/AccountsPage";
import { AddAccountPage } from "@/features/add-account/AddAccountPage";
import { ComingSoonPage } from "@/features/ComingSoonPage";
import { DesignSystemPage } from "@/features/design-system/DesignSystemPage";
import { WorkspacePage } from "@/features/workspace/WorkspacePage";
import { AppDataProvider } from "@/lib/store";

const router = createHashRouter([
  {
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/accounts" replace /> },
      { path: "accounts", element: <AccountsPage /> },
      { path: "accounts/new", element: <AddAccountPage /> },
      { path: "workspace", element: <WorkspacePage /> },
      { path: "design", element: <DesignSystemPage /> },
      { path: "proxies", element: <ComingSoonPage title="代理池管理" subtitle="集中维护可复用的代理 IP。" /> },
      { path: "network", element: <ComingSoonPage title="网络环境" subtitle="内置检测，确认出口 IP 与连通性。" /> },
      { path: "windows", element: <ComingSoonPage title="浏览器窗口" subtitle="管理与账号关联的独立浏览器窗口。" /> },
      { path: "system", element: <ComingSoonPage title="系统环境" subtitle="检查本机 Claude Code 与依赖状态。" /> },
      { path: "help", element: <ComingSoonPage title="使用说明" subtitle="了解账号、代理与工作区的关系。" /> },
      { path: "*", element: <Navigate to="/accounts" replace /> },
    ],
  },
], { future: { v7_relativeSplatPath: true } });

export function App() {
  return (
    <AppDataProvider>
      <RouterProvider router={router} future={{ v7_startTransition: true }} />
    </AppDataProvider>
  );
}
