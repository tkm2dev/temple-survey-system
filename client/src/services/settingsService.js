import api from "./api";

class SettingsService {
  // Get all system settings (Admin only)
  async getSystemSettings() {
    try {
      const response = await api.get("/settings");
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching system settings:", error);
      throw error;
    }
  }

  // Update a single system setting (Admin only)
  async updateSystemSetting(key, value) {
    try {
      const response = await api.post("/settings/update", {
        key,
        value,
      });
      return response.data;
    } catch (error) {
      console.error("❌ Error updating system setting:", error);
      throw error;
    }
  }

  // Bulk update system settings (Admin only)
  async bulkUpdateSystemSettings(settings) {
    try {
      const response = await api.post("/settings/bulk-update", {
        settings,
      });
      return response.data;
    } catch (error) {
      console.error("❌ Error bulk updating system settings:", error);
      throw error;
    }
  }

  // Get public system settings (accessible to all users)
  async getPublicSystemSettings() {
    try {
      const response = await api.get("/settings/public");
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching public system settings:", error);
      throw error;
    }
  }

  // Personal settings management (stored locally)
  getPersonalSettings() {
    try {
      const settings = localStorage.getItem("app-personal-settings");
      return settings
        ? JSON.parse(settings)
        : this.getDefaultPersonalSettings();
    } catch (error) {
      console.error("❌ Error loading personal settings:", error);
      return this.getDefaultPersonalSettings();
    }
  }

  savePersonalSettings(settings) {
    try {
      localStorage.setItem("app-personal-settings", JSON.stringify(settings));
      this.applyPersonalSettings(settings);
      return true;
    } catch (error) {
      console.error("❌ Error saving personal settings:", error);
      return false;
    }
  }

  getDefaultPersonalSettings() {
    return {
      fontFamily: "sarabun",
      fontSize: "medium",
      theme: "light",
      language: "th",
      compactMode: false,
      animations: true,
      notifications: {
        email: true,
        browser: true,
        surveyUpdates: true,
        systemUpdates: false,
      },
      dataRetention: "90",
      analytics: true,
    };
  }

  // Apply personal settings to DOM
  applyPersonalSettings(settings) {
    const root = document.documentElement;

    // Apply font family
    const fontMap = {
      sarabun:
        "'Sarabun', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      kanit:
        "'Kanit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      prompt:
        "'Prompt', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      mali: "'Mali', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      mitr: "'Mitr', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      system:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    };

    root.style.setProperty("--font-primary", fontMap[settings.fontFamily]);

    // Apply font size
    const sizeMap = {
      small: "14px",
      medium: "16px",
      large: "18px",
      "extra-large": "20px",
    };

    document.body.style.fontSize = sizeMap[settings.fontSize];

    // Apply theme
    if (settings.theme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (settings.theme === "light") {
      document.documentElement.classList.remove("dark");
    } else if (settings.theme === "auto") {
      // Apply based on system preference
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      if (mediaQuery.matches) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }

    // Apply compact mode
    if (settings.compactMode) {
      document.body.classList.add("compact-mode");
    } else {
      document.body.classList.remove("compact-mode");
    }

    // Apply animations
    if (!settings.animations) {
      document.body.classList.add("no-animations");
    } else {
      document.body.classList.remove("no-animations");
    }
  }

  // Initialize settings on app load
  initializeSettings() {
    const settings = this.getPersonalSettings();
    this.applyPersonalSettings(settings);
    return settings;
  }

  // Export user data
  async exportUserData(userId) {
    try {
      const personalSettings = this.getPersonalSettings();

      const data = {
        personalSettings,
        exportDate: new Date().toISOString(),
        userId,
        version: "1.1.0",
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `temple-survey-settings-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error("❌ Error exporting user data:", error);
      return false;
    }
  }

  // Clear cache and temporary data
  async clearCache() {
    try {
      // Clear browser caches
      if ("caches" in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      }

      // Clear session storage (keep localStorage for settings)
      sessionStorage.clear();

      return true;
    } catch (error) {
      console.error("❌ Error clearing cache:", error);
      return false;
    }
  }

  // Get system information
  getSystemInfo() {
    return {
      version: "1.1.0",
      lastUpdate: "27 กรกฎาคม 2568",
      browser: this.getBrowserInfo(),
      screenSize: `${screen.width} × ${screen.height}`,
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      onlineStatus: navigator.onLine,
    };
  }

  getBrowserInfo() {
    const userAgent = navigator.userAgent;
    let browserName = "Unknown";
    let browserVersion = "Unknown";

    if (userAgent.indexOf("Chrome") > -1) {
      browserName = "Google Chrome";
      browserVersion = userAgent.match(/Chrome\/([0-9.]+)/)?.[1] || "Unknown";
    } else if (userAgent.indexOf("Firefox") > -1) {
      browserName = "Mozilla Firefox";
      browserVersion = userAgent.match(/Firefox\/([0-9.]+)/)?.[1] || "Unknown";
    } else if (
      userAgent.indexOf("Safari") > -1 &&
      userAgent.indexOf("Chrome") === -1
    ) {
      browserName = "Safari";
      browserVersion = userAgent.match(/Version\/([0-9.]+)/)?.[1] || "Unknown";
    } else if (userAgent.indexOf("Edge") > -1) {
      browserName = "Microsoft Edge";
      browserVersion = userAgent.match(/Edge\/([0-9.]+)/)?.[1] || "Unknown";
    }

    return `${browserName} ${browserVersion}`;
  }

  // Validate settings
  validatePersonalSettings(settings) {
    const defaults = this.getDefaultPersonalSettings();
    const validFontFamilies = [
      "sarabun",
      "kanit",
      "prompt",
      "mali",
      "mitr",
      "system",
    ];
    const validFontSizes = ["small", "medium", "large", "extra-large"];
    const validThemes = ["light", "dark", "auto"];
    const validDataRetention = ["30", "90", "180", "365", "forever"];

    return {
      fontFamily: validFontFamilies.includes(settings.fontFamily)
        ? settings.fontFamily
        : defaults.fontFamily,
      fontSize: validFontSizes.includes(settings.fontSize)
        ? settings.fontSize
        : defaults.fontSize,
      theme: validThemes.includes(settings.theme)
        ? settings.theme
        : defaults.theme,
      language: settings.language || defaults.language,
      compactMode:
        typeof settings.compactMode === "boolean"
          ? settings.compactMode
          : defaults.compactMode,
      animations:
        typeof settings.animations === "boolean"
          ? settings.animations
          : defaults.animations,
      notifications: {
        ...defaults.notifications,
        ...settings.notifications,
      },
      dataRetention: validDataRetention.includes(settings.dataRetention)
        ? settings.dataRetention
        : defaults.dataRetention,
      analytics:
        typeof settings.analytics === "boolean"
          ? settings.analytics
          : defaults.analytics,
    };
  }
}

export default new SettingsService();
