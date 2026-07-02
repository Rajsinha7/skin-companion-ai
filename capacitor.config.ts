import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.skincompanion.ai',
  appName: 'Skin Companion AI',
  webDir: 'dist',
  server: {
    cleartext: true
  }
};

export default config;
