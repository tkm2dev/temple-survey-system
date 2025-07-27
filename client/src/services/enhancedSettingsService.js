import api from "./api";

class EnhancedSettingsService {
  // Get all system settings (Admin only)
  async getSystemSettings() {
    try {
      const response = await api.get("/settings");
      return response.data?.data?.settings || {};
    } catch (error) {
      console.error("❌ Error fetching system settings:", error);
      throw error;
    }
  }

  // Update a single system setting (Admin only)
  async updateSystemSetting(key, value) {
    try {
      const response = await api.put(`/settings/${key}`, { value });
      return response.data;
    } catch (error) {
      console.error("❌ Error updating system setting:", error);
      throw error;
    }
  }

  // Bulk update system settings (Admin only)
  async saveSystemSettings(settings) {
    try {
      const response = await api.post("/settings/bulk-update", { settings });
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
      return response.data?.data?.settings || {};
    } catch (error) {
      console.error("❌ Error fetching public system settings:", error);
      throw error;
    }
  }

  // Get user's personal settings from server
  async getPersonalSettings() {
    try {
      const response = await api.get("/user-settings");
      const serverSettings = response.data?.data?.settings || {};

      // Merge with local defaults for any missing settings
      const defaults = this.getDefaultPersonalSettings();
      return { ...defaults, ...serverSettings };
    } catch (error) {
      console.error("❌ Error fetching personal settings from server:", error);
      // Fallback to local settings
      return this.getLocalPersonalSettings();
    }
  }

  // Save user's personal settings to server
  async savePersonalSettings(settings) {
    try {
      // Validate settings before sending
      const validatedSettings = this.validatePersonalSettings(settings);

      // Save to server
      const response = await api.put("/user-settings", {
        settings: validatedSettings,
      });

      // Also save locally as backup
      this.saveLocalPersonalSettings(validatedSettings);

      // Apply settings to DOM
      this.applyPersonalSettings(validatedSettings);

      return response.data;
    } catch (error) {
      console.error("❌ Error saving personal settings to server:", error);
      // Fallback to local save
      this.saveLocalPersonalSettings(settings);
      this.applyPersonalSettings(settings);
      throw error;
    }
  }

  // Get user profile
  async getUserProfile() {
    try {
      const response = await api.get("/user-settings/profile");
      return response.data?.data || {};
    } catch (error) {
      console.error("❌ Error fetching user profile:", error);
      throw error;
    }
  }

  // Update user profile
  async updateUserProfile(profileData) {
    try {
      const response = await api.put("/user-settings/profile", profileData);
      return response.data;
    } catch (error) {
      console.error("❌ Error updating user profile:", error);
      throw error;
    }
  }

  // Export user data from server
  async exportUserData() {
    try {
      const response = await api.post("/user-settings/export");
      const data = response.data?.data || {};

      // Create and download file
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `temple-survey-data-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error("❌ Error exporting user data:", error);
      throw error;
    }
  }

  // Local storage methods (fallback)
  getLocalPersonalSettings() {
    try {
      const settings = localStorage.getItem("app-personal-settings");
      return settings
        ? JSON.parse(settings)
        : this.getDefaultPersonalSettings();
    } catch (error) {
      console.error("❌ Error loading local personal settings:", error);
      return this.getDefaultPersonalSettings();
    }
  }

  saveLocalPersonalSettings(settings) {
    try {
      localStorage.setItem("app-personal-settings", JSON.stringify(settings));
      return true;
    } catch (error) {
      console.error("❌ Error saving local personal settings:", error);
      return false;
    }
  }

  getDefaultPersonalSettings() {
    return {
      // Display settings
      fontFamily: "sarabun",
      fontSize: "medium",
      theme: "light",
      language: "th",
      compactMode: false,
      animations: true,

      // Notification settings
      emailNotifications: true,
      pushNotifications: true,
      soundEnabled: true,
      notifications: {
        email: true,
        browser: true,
        surveyUpdates: true,
        systemUpdates: false,
      },

      // Security settings
      twoFactorEnabled: false,
      loginNotifications: true,
      sessionTimeout: "60",

      // Localization settings
      timezone: "Asia/Bangkok",
      dateFormat: "dd/mm/yyyy",
      timeFormat: "24",

      // Performance settings
      itemsPerPage: "25",
      enableCaching: true,
      preloadData: false,
      enableLazyLoading: true,

      // Privacy settings
      dataRetention: "365",
      analytics: true,

      // Backup settings
      autoBackup: false,
      backupFrequency: "weekly",

      // Keyboard settings
      keyboardEnabled: true,
    };
  }

  // Apply personal settings to DOM
  applyPersonalSettings(settings) {
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

    document.body.style.fontFamily =
      fontMap[settings.fontFamily] || fontMap.sarabun;

    // Apply font size
    const sizeMap = {
      small: "14px",
      medium: "16px",
      large: "18px",
      "extra-large": "20px",
    };

    document.body.style.fontSize = sizeMap[settings.fontSize] || sizeMap.medium;

    // Apply theme
    if (settings.theme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute("data-bs-theme", "dark");
    } else if (settings.theme === "light") {
      document.documentElement.classList.remove("dark");
      document.documentElement.setAttribute("data-bs-theme", "light");
    } else if (settings.theme === "auto") {
      // Apply based on system preference
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      if (mediaQuery.matches) {
        document.documentElement.classList.add("dark");
        document.documentElement.setAttribute("data-bs-theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        document.documentElement.setAttribute("data-bs-theme", "light");
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
  async initializeSettings() {
    try {
      const settings = await this.getPersonalSettings();
      this.applyPersonalSettings(settings);
      return settings;
    } catch (error) {
      console.error("❌ Error initializing settings:", error);
      const fallbackSettings = this.getLocalPersonalSettings();
      this.applyPersonalSettings(fallbackSettings);
      return fallbackSettings;
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
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
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
    const validSessionTimeouts = ["15", "30", "60", "180", "480"];
    const validDateFormats = ["dd/mm/yyyy", "mm/dd/yyyy", "yyyy-mm-dd"];
    const validTimeFormats = ["12", "24"];
    const validItemsPerPage = ["10", "25", "50", "100"];
    const validBackupFrequencies = ["daily", "weekly", "monthly"];

    return {
      // Display settings
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

      // Notification settings
      emailNotifications:
        typeof settings.emailNotifications === "boolean"
          ? settings.emailNotifications
          : defaults.emailNotifications,
      pushNotifications:
        typeof settings.pushNotifications === "boolean"
          ? settings.pushNotifications
          : defaults.pushNotifications,
      soundEnabled:
        typeof settings.soundEnabled === "boolean"
          ? settings.soundEnabled
          : defaults.soundEnabled,
      notifications: {
        ...defaults.notifications,
        ...settings.notifications,
      },

      // Security settings
      twoFactorEnabled:
        typeof settings.twoFactorEnabled === "boolean"
          ? settings.twoFactorEnabled
          : defaults.twoFactorEnabled,
      loginNotifications:
        typeof settings.loginNotifications === "boolean"
          ? settings.loginNotifications
          : defaults.loginNotifications,
      sessionTimeout: validSessionTimeouts.includes(settings.sessionTimeout)
        ? settings.sessionTimeout
        : defaults.sessionTimeout,

      // Localization settings
      timezone: settings.timezone || defaults.timezone,
      dateFormat: validDateFormats.includes(settings.dateFormat)
        ? settings.dateFormat
        : defaults.dateFormat,
      timeFormat: validTimeFormats.includes(settings.timeFormat)
        ? settings.timeFormat
        : defaults.timeFormat,

      // Performance settings
      itemsPerPage: validItemsPerPage.includes(settings.itemsPerPage)
        ? settings.itemsPerPage
        : defaults.itemsPerPage,
      enableCaching:
        typeof settings.enableCaching === "boolean"
          ? settings.enableCaching
          : defaults.enableCaching,
      preloadData:
        typeof settings.preloadData === "boolean"
          ? settings.preloadData
          : defaults.preloadData,
      enableLazyLoading:
        typeof settings.enableLazyLoading === "boolean"
          ? settings.enableLazyLoading
          : defaults.enableLazyLoading,

      // Privacy settings
      dataRetention: validDataRetention.includes(settings.dataRetention)
        ? settings.dataRetention
        : defaults.dataRetention,
      analytics:
        typeof settings.analytics === "boolean"
          ? settings.analytics
          : defaults.analytics,

      // Backup settings
      autoBackup:
        typeof settings.autoBackup === "boolean"
          ? settings.autoBackup
          : defaults.autoBackup,
      backupFrequency: validBackupFrequencies.includes(settings.backupFrequency)
        ? settings.backupFrequency
        : defaults.backupFrequency,

      // Keyboard settings
      keyboardEnabled:
        typeof settings.keyboardEnabled === "boolean"
          ? settings.keyboardEnabled
          : defaults.keyboardEnabled,
    };
  }
}

export default new EnhancedSettingsService();
