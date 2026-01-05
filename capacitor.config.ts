import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sam.agua',
  appName: 'SAM Água',
  webDir: 'dist',
  server: {
    url: 'https://20e92bba-4c2f-4541-86f8-2b18fe587bce.lovableproject.com?forceHideBadge=true',
    cleartext: true
  }
};

export default config;
