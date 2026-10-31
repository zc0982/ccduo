import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, errorMessage } from "./api";
import type { Account, AppSnapshot } from "./types";

interface AppData {
  snapshot: AppSnapshot | null;
  loadError: string | null;
  currentAccount: Account | null;
  refresh: () => Promise<void>;
  setSnapshot: (next: AppSnapshot) => void;
  /** Replace or append one account without refetching. */
  putAccount: (account: Account) => void;
}

const AppDataContext = createContext<AppData | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<AppSnapshot | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setSnapshot(await api.snapshot());
      setLoadError(null);
    } catch (error) {
      setLoadError(errorMessage(error));
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const putAccount = useCallback((account: Account) => {
    setSnapshot((prev) => {
      if (!prev) return prev;
      const exists = prev.accounts.some((a) => a.id === account.id);
      return {
        ...prev,
        accounts: exists ? prev.accounts.map((a) => (a.id === account.id ? account : a)) : [...prev.accounts, account],
      };
    });
  }, []);

  const value = useMemo<AppData>(
    () => ({
      snapshot,
      loadError,
      currentAccount: snapshot?.accounts.find((a) => a.id === snapshot.currentAccountId) ?? null,
      refresh,
      setSnapshot,
      putAccount,
    }),
    [snapshot, loadError, refresh, putAccount],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppData {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used inside <AppDataProvider>");
  return ctx;
}
