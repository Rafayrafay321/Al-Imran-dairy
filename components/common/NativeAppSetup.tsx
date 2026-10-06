"use client";

import * as React from "react";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";

export function NativeAppSetup() {
  React.useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    void StatusBar.setBackgroundColor({ color: "#2563EB" });
    void StatusBar.setStyle({ style: Style.Light });
  }, []);

  return null;
}
