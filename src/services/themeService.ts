import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

class ThemeService {
  private mediaQuery: MediaQueryList | null = null;

  constructor() {
    this.initTheme();
  }

  private initTheme() {
    // Check if running on a native platform
    if (Capacitor.isNativePlatform()) {
      this.updateStatusBar();
    }

    // Listen for system theme changes
    if (window.matchMedia) {
      this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.mediaQuery.addEventListener('change', () => {
        this.updateStatusBar();
      });
    }
  }

  private async updateStatusBar() {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    try {
      const isDark = this.isDarkMode();

      if (isDark) {
        await StatusBar.setStyle({ style: Style.Dark });
      } else {
        await StatusBar.setStyle({ style: Style.Light });
      }
    } catch (error) {
      console.error('Error updating status bar:', error);
    }
  }

  public isDarkMode(): boolean {
    if (window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  }
}

export default new ThemeService();
