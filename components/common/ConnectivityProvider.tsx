"use client";

import * as React from "react";
import { Capacitor } from "@capacitor/core";
import { Network } from "@capacitor/network";

const ConnectivityContext = React.createContext(true);

export function ConnectivityProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = React.useState(true);

  React.useEffect(() => {
    const updateBrowserStatus = () => setIsOnline(navigator.onLine);
    updateBrowserStatus();
    window.addEventListener("online", updateBrowserStatus);
    window.addEventListener("offline", updateBrowserStatus);

    let removeNativeListener: (() => Promise<void>) | undefined;
    if (Capacitor.isNativePlatform()) {
      void Network.getStatus().then((status) => setIsOnline(status.connected));
      void Network.addListener("networkStatusChange", (status) => setIsOnline(status.connected))
        .then((handle) => { removeNativeListener = () => handle.remove(); });
    }

    return () => {
      window.removeEventListener("online", updateBrowserStatus);
      window.removeEventListener("offline", updateBrowserStatus);
      void removeNativeListener?.();
    };
  }, []);

  return <ConnectivityContext.Provider value={isOnline}>{children}</ConnectivityContext.Provider>;
}

export function useConnectivity() {
  const isOnline = React.useContext(ConnectivityContext);
  return { isOnline, isOffline: !isOnline };
}
