import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import PreferencesService, { ThemePreference } from './preferencesService';

class ThemeService {
  private mediaQuery: MediaQueryList | null = null;
  private currentTheme: ThemePreference = 'system';

  constructor() {
    this.initTheme();
  }

  private async initTheme() {
    // Load theme preference
    this.currentTheme = await PreferencesService.getThemePreference();

    // Apply initial theme
    this.applyTheme();

    // Listen for system theme changes only if using system theme
    if (window.matchMedia) {
      this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.mediaQuery.addEventListener('change', () => {
        if (this.currentTheme === 'system') {
          this.applyTheme();
        }
      });
    }
  }

  public async setTheme(theme: ThemePreference) {
    this.currentTheme = theme;
    await PreferencesService.setThemePreference(theme);
    this.applyTheme();
  }

  private applyTheme() {
    const isDark = this.shouldUseDarkMode();

    // Toggle dark mode class on document
    if (isDark) {
      document.documentElement.classList.add('ion-palette-dark');
    } else {
      document.documentElement.classList.remove('ion-palette-dark');
    }

    // Update status bar on native platforms
    if (Capacitor.isNativePlatform()) {
      this.updateStatusBar(isDark);
    }
  }

  private shouldUseDarkMode(): boolean {
    if (this.currentTheme === 'dark') {
      return true;
    } else if (this.currentTheme === 'light') {
      return false;
    } else {
      // System preference
      return this.getSystemDarkMode();
    }
  }

  private getSystemDarkMode(): boolean {
    if (window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  }

  private async updateStatusBar(isDark: boolean) {
    try {
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
    return this.shouldUseDarkMode();
  }
}

export default new ThemeService();
