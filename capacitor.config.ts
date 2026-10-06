import type { CapacitorConfig } from '@capacitor/cli';

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://alimrandai.netlify.app';

const config: CapacitorConfig = {
  appId: 'com.alimdairy.invoicing',
  appName: 'Al-Imran Dairy',
  webDir: 'public',
  server: {
    url: appUrl,
    cleartext: false,
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
  },
};

export default config;
