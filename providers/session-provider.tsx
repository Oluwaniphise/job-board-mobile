import { useSessionStore } from "@/stores/session-store";
import { PropsWithChildren, useEffect } from "react";

type SessionContextValue = ReturnType<typeof useSessionStore>;

export function SessionProvider({ children }: PropsWithChildren) {
  const isHydrating = useSessionStore((state) => state.isHydrating);
  const hydrate = useSessionStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (isHydrating) {
    // Keep app from rendering before session is hydrated.
    return null;
  }

  return <>{children}</>;
}

export function useSession() {
  return useSessionStore();
}
