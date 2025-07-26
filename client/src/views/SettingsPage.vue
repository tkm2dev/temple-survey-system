<template>
  <div class="settings-page">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="h3 mb-1">การตั้งค่าระบบ</h1>
        <p class="text-muted mb-0">จัดการการตั้งค่าทั่วไปของระบบ</p>
      </div>
      <button @click="saveSettings" class="btn btn-primary" :disabled="saving">
        <i class="fas fa-save me-2"></i>
        <span v-if="saving">กำลังบันทึก...</span>
        <span v-else>บันทึกการตั้งค่า</span>
      </button>
    </div>

    <div class="row">
      <!-- Font Settings -->
      <div class="col-lg-6 mb-4">
        <div class="card">
          <div class="card-header">
            <h5 class="card-title mb-0">
              <i class="fas fa-font me-2"></i>
              การตั้งค่าฟอนต์
            </h5>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <label class="form-label">ฟอนต์หลัก</label>
              <select
                v-model="settings.fontFamily"
                class="form-select"
                @change="previewFont"
              >
                <option value="sarabun">Sarabun - สะระบัน (แนะนำ)</option>
                <option value="kanit">Kanit - คอน์คริต</option>
                <option value="prompt">Prompt - พร้อมต์</option>
                <option value="mali">Mali - มาลี</option>
                <option value="mitr">Mitr - มิตร</option>
                <option value="system">ระบบปฏิบัติการ</option>
              </select>
              <div class="form-text">เลือกฟอนต์ที่ใช้แสดงผลในระบบ</div>
            </div>

            <div class="mb-3">
              <label class="form-label">ขนาดฟอนต์</label>
              <select v-model="settings.fontSize" class="form-select">
                <option value="small">เล็ก (14px)</option>
                <option value="medium">ปกติ (16px)</option>
                <option value="large">ใหญ่ (18px)</option>
                <option value="extra-large">ใหญ่มาก (20px)</option>
              </select>
            </div>

            <!-- Font Preview -->
            <div
              class="font-preview"
              :class="`font-${settings.fontFamily} size-${settings.fontSize}`"
            >
              <h6>ตัวอย่างการแสดงผล</h6>
              <p>ระบบสำรวจวัดในประเทศไทย</p>
              <p>Temple Survey System Thailand</p>
              <p>๐๑๒๓๔๕๖๗๘๙ ABCDEFGHIJKLMNOP</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Display Settings -->
      <div class="col-lg-6 mb-4">
        <div class="card">
          <div class="card-header">
            <h5 class="card-title mb-0">
              <i class="fas fa-display me-2"></i>
              การแสดงผล
            </h5>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <label class="form-label">ธีม</label>
              <select v-model="settings.theme" class="form-select">
                <option value="light">สว่าง</option>
                <option value="dark">มืด</option>
                <option value="auto">ตามระบบ</option>
              </select>
            </div>

            <div class="mb-3">
              <label class="form-label">ภาษา</label>
              <select v-model="settings.language" class="form-select">
                <option value="th">ไทย</option>
                <option value="en">English</option>
              </select>
            </div>

            <div class="mb-3">
              <div class="form-check">
                <input
                  v-model="settings.compactMode"
                  class="form-check-input"
                  type="checkbox"
                  id="compactMode"
                />
                <label class="form-check-label" for="compactMode">
                  โหมดกะทัดรัด
                </label>
                <div class="form-text">
                  ลดขนาดส่วนประกอบต่างๆ เพื่อแสดงข้อมูลได้มากขึ้น
                </div>
              </div>
            </div>

            <div class="mb-3">
              <div class="form-check">
                <input
                  v-model="settings.animations"
                  class="form-check-input"
                  type="checkbox"
                  id="animations"
                />
                <label class="form-check-label" for="animations">
                  เปิดใช้งานแอนิเมชั่น
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Notification Settings -->
      <div class="col-lg-6 mb-4">
        <div class="card">
          <div class="card-header">
            <h5 class="card-title mb-0">
              <i class="fas fa-bell me-2"></i>
              การแจ้งเตือน
            </h5>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <div class="form-check">
                <input
                  v-model="settings.notifications.email"
                  class="form-check-input"
                  type="checkbox"
                  id="emailNotifications"
                />
                <label class="form-check-label" for="emailNotifications">
                  แจ้งเตือนทางอีเมล
                </label>
              </div>
            </div>

            <div class="mb-3">
              <div class="form-check">
                <input
                  v-model="settings.notifications.browser"
                  class="form-check-input"
                  type="checkbox"
                  id="browserNotifications"
                />
                <label class="form-check-label" for="browserNotifications">
                  แจ้งเตือนบนเบราว์เซอร์
                </label>
              </div>
            </div>

            <div class="mb-3">
              <div class="form-check">
                <input
                  v-model="settings.notifications.surveyUpdates"
                  class="form-check-input"
                  type="checkbox"
                  id="surveyUpdates"
                />
                <label class="form-check-label" for="surveyUpdates">
                  การอัปเดตข้อมูลการสำรวจ
                </label>
              </div>
            </div>

            <div class="mb-3">
              <div class="form-check">
                <input
                  v-model="settings.notifications.systemUpdates"
                  class="form-check-input"
                  type="checkbox"
                  id="systemUpdates"
                />
                <label class="form-check-label" for="systemUpdates">
                  การอัปเดตระบบ
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Data & Privacy -->
      <div class="col-lg-6 mb-4">
        <div class="card">
          <div class="card-header">
            <h5 class="card-title mb-0">
              <i class="fas fa-shield-alt me-2"></i>
              ข้อมูลและความเป็นส่วนตัว
            </h5>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <label class="form-label">การเก็บข้อมูลการใช้งาน</label>
              <select v-model="settings.dataRetention" class="form-select">
                <option value="30">30 วัน</option>
                <option value="90">90 วัน</option>
                <option value="180">180 วัน</option>
                <option value="365">1 ปี</option>
                <option value="forever">ถาวร</option>
              </select>
            </div>

            <div class="mb-3">
              <div class="form-check">
                <input
                  v-model="settings.analytics"
                  class="form-check-input"
                  type="checkbox"
                  id="analytics"
                />
                <label class="form-check-label" for="analytics">
                  อนุญาตการวิเคราะห์การใช้งาน
                </label>
                <div class="form-text">ช่วยปรับปรุงระบบให้ดีขึ้น</div>
              </div>
            </div>

            <div class="mb-3">
              <button
                @click="exportData"
                class="btn btn-outline-primary me-2"
                :disabled="exporting"
              >
                <i class="fas fa-download me-2"></i>
                <span v-if="exporting">กำลังส่งออก...</span>
                <span v-else>ส่งออกข้อมูล</span>
              </button>
              <button
                @click="clearCache"
                class="btn btn-outline-secondary"
                :disabled="clearing"
              >
                <i class="fas fa-trash me-2"></i>
                <span v-if="clearing">กำลังล้าง...</span>
                <span v-else>ล้างแคช</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- System Information -->
      <div class="col-12 mb-4">
        <div class="card">
          <div class="card-header">
            <h5 class="card-title mb-0">
              <i class="fas fa-info-circle me-2"></i>
              ข้อมูลระบบ
            </h5>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-6">
                <h6>เวอร์ชั่นระบบ</h6>
                <p class="text-muted">{{ systemInfo.version }}</p>

                <h6>วันที่อัปเดตล่าสุด</h6>
                <p class="text-muted">{{ systemInfo.lastUpdate }}</p>
              </div>
              <div class="col-md-6">
                <h6>เบราว์เซอร์</h6>
                <p class="text-muted">{{ systemInfo.browser }}</p>

                <h6>ขนาดหน้าจอ</h6>
                <p class="text-muted">{{ systemInfo.screenSize }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Success Message -->
    <div
      v-if="showSuccess"
      class="alert alert-success alert-dismissible fade show position-fixed"
      style="top: 20px; right: 20px; z-index: 9999"
    >
      <i class="fas fa-check-circle me-2"></i>
      บันทึกการตั้งค่าเรียบร้อยแล้ว
      <button
        type="button"
        class="btn-close"
        @click="showSuccess = false"
      ></button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from "vue";

// State
const saving = ref(false);
const exporting = ref(false);
const clearing = ref(false);
const showSuccess = ref(false);

// Settings object
const settings = reactive({
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
});

// System information
const systemInfo = reactive({
  version: "1.0.0",
  lastUpdate: "2024-12-19",
  browser: "",
  screenSize: "",
});

// Methods
const loadSettings = () => {
  const saved = localStorage.getItem("app-settings");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      Object.assign(settings, parsed);
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  }
};

const saveSettings = async () => {
  saving.value = true;

  try {
    // Save to localStorage
    localStorage.setItem("app-settings", JSON.stringify(settings));

    // Apply font settings
    applyFontSettings();

    // Show success message
    showSuccess.value = true;
    setTimeout(() => {
      showSuccess.value = false;
    }, 3000);
  } catch (error) {
    console.error("Error saving settings:", error);
    alert("เกิดข้อผิดพลาดในการบันทึกการตั้งค่า");
  } finally {
    saving.value = false;
  }
};

const applyFontSettings = () => {
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
    system: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
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
};

const previewFont = () => {
  applyFontSettings();
};

const exportData = async () => {
  exporting.value = true;

  try {
    // Simulate export process
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const data = {
      settings: settings,
      exportDate: new Date().toISOString(),
      user: "current-user", // This would come from auth store
    };

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
  } catch (error) {
    console.error("Error exporting data:", error);
    alert("เกิดข้อผิดพลาดในการส่งออกข้อมูล");
  } finally {
    exporting.value = false;
  }
};

const clearCache = async () => {
  if (
    !confirm(
      "คุณต้องการล้างแคชทั้งหมดหรือไม่? การดำเนินการนี้จะทำให้ต้องโหลดข้อมูลใหม่"
    )
  ) {
    return;
  }

  clearing.value = true;

  try {
    // Clear various caches
    if ("caches" in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      );
    }

    // Clear sessionStorage (but keep settings in localStorage)
    sessionStorage.clear();

    alert("ล้างแคชเรียบร้อยแล้ว");
  } catch (error) {
    console.error("Error clearing cache:", error);
    alert("เกิดข้อผิดพลาดในการล้างแคช");
  } finally {
    clearing.value = false;
  }
};

const updateSystemInfo = () => {
  systemInfo.browser = navigator.userAgent.split(") ")[0].split(" (")[0];
  systemInfo.screenSize = `${screen.width} × ${screen.height}`;
};

// Watch for settings changes to auto-apply some changes
watch(() => settings.fontFamily, previewFont);
watch(() => settings.fontSize, previewFont);

// Lifecycle
onMounted(() => {
  loadSettings();
  applyFontSettings();
  updateSystemInfo();
});
</script>

<style scoped>
.settings-page {
  max-width: 1200px;
  margin: 0 auto;
}

.font-preview {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  padding: 1rem;
  margin-top: 1rem;
}

.font-sarabun {
  font-family: "Sarabun", sans-serif;
}
.font-kanit {
  font-family: "Kanit", sans-serif;
}
.font-prompt {
  font-family: "Prompt", sans-serif;
}
.font-mali {
  font-family: "Mali", sans-serif;
}
.font-mitr {
  font-family: "Mitr", sans-serif;
}
.font-system {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.size-small {
  font-size: 14px;
}
.size-medium {
  font-size: 16px;
}
.size-large {
  font-size: 18px;
}
.size-extra-large {
  font-size: 20px;
}

.card-header .card-title {
  display: flex;
  align-items: center;
}

.form-text {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .settings-page {
    padding: 0 1rem;
  }

  .btn {
    width: 100%;
    margin-bottom: 0.5rem;
  }

  .btn:last-child {
    margin-bottom: 0;
  }
}
</style>
