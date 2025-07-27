<template>
  <div class="enhanced-settings">
    <!-- Page Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="h3 mb-1">
          <i class="bi bi-gear me-2 text-primary"></i>
          การตั้งค่าระบบ
        </h1>
        <p class="text-muted mb-0">
          <i class="bi bi-info-circle me-1"></i>
          จัดการการตั้งค่าส่วนตัวและการตั้งค่าระบบ
        </p>
      </div>
      <div class="d-flex gap-2">
        <button
          @click="refreshSettings"
          class="btn btn-outline-primary"
          :disabled="loading"
        >
          <i class="bi bi-arrow-clockwise me-1" :class="{ spin: loading }"></i>
          <span v-if="loading">กำลังโหลด...</span>
          <span v-else>รีเฟรช</span>
        </button>
        <button
          @click="saveAllChanges"
          class="btn btn-primary"
          :disabled="loading || !hasChanges"
        >
          <i class="bi bi-check-circle me-1"></i>
          บันทึกการเปลี่ยนแปลง
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading && !initialized" class="text-center py-5">
      <div class="spinner-border text-primary me-2"></div>
      <span>กำลังโหลดข้อมูล...</span>
    </div>

    <!-- Main Content -->
    <div v-else>
      <!-- Main Navigation Tabs -->
      <ul class="nav nav-tabs mb-4" role="tablist">
        <li class="nav-item" role="presentation">
          <button
            @click="activeMainTab = 'personal'"
            class="nav-link"
            :class="{ active: activeMainTab === 'personal' }"
            type="button"
          >
            <i class="bi bi-person-gear me-2"></i>
            การตั้งค่าส่วนตัว
          </button>
        </li>
        <li v-if="isAdmin" class="nav-item" role="presentation">
          <button
            @click="activeMainTab = 'system'"
            class="nav-link"
            :class="{ active: activeMainTab === 'system' }"
            type="button"
          >
            <i class="bi bi-sliders me-2"></i>
            การตั้งค่าระบบ
            <span class="badge bg-primary ms-2">Admin</span>
          </button>
        </li>
      </ul>

      <!-- Personal Settings Tab -->
      <div v-if="activeMainTab === 'personal'" class="tab-content">
        <div class="row">
          <!-- Display Settings Card -->
          <div class="col-lg-6 mb-4">
            <div class="card h-100">
              <div class="card-header">
                <h5 class="mb-0">
                  <i class="bi bi-display me-2 text-primary"></i>
                  การแสดงผล
                </h5>
              </div>
              <div class="card-body">
                <div class="mb-3">
                  <label class="form-label fw-bold">ธีมสี</label>
                  <select v-model="personalSettings.theme" class="form-select">
                    <option value="light">สว่าง</option>
                    <option value="dark">มืด</option>
                    <option value="auto">ตามระบบ</option>
                  </select>
                </div>

                <div class="mb-3">
                  <label class="form-label fw-bold">ฟอนต์หลัก</label>
                  <select
                    v-model="personalSettings.fontFamily"
                    class="form-select"
                  >
                    <option value="sarabun">Sarabun - สะระบัน (แนะนำ)</option>
                    <option value="kanit">Kanit - คอน์คริต</option>
                    <option value="prompt">Prompt - พร้อมต์</option>
                    <option value="mali">Mali - มาลี</option>
                    <option value="mitr">Mitr - มิตร</option>
                    <option value="system">ระบบปฏิบัติการ</option>
                  </select>
                </div>

                <div class="mb-3">
                  <label class="form-label fw-bold">ขนาดฟอนต์</label>
                  <select
                    v-model="personalSettings.fontSize"
                    class="form-select"
                  >
                    <option value="small">เล็ก (14px)</option>
                    <option value="medium">ปกติ (16px)</option>
                    <option value="large">ใหญ่ (18px)</option>
                    <option value="extra-large">ใหญ่มาก (20px)</option>
                  </select>
                </div>

                <div class="form-check mb-3">
                  <input
                    v-model="personalSettings.compactMode"
                    class="form-check-input"
                    type="checkbox"
                    id="compactMode"
                  />
                  <label class="form-check-label" for="compactMode">
                    โหมดกะทัดรัด
                  </label>
                </div>

                <div class="form-check mb-3">
                  <input
                    v-model="personalSettings.animations"
                    class="form-check-input"
                    type="checkbox"
                    id="animations"
                  />
                  <label class="form-check-label" for="animations">
                    เปิดใช้งานแอนิเมชั่น
                  </label>
                </div>

                <!-- Font Preview -->
                <div class="mt-4 p-3 bg-light rounded">
                  <h6 class="fw-bold mb-2">ตัวอย่างการแสดงผล</h6>
                  <div
                    class="font-preview"
                    :class="`font-${personalSettings.fontFamily} size-${personalSettings.fontSize}`"
                  >
                    <p class="mb-1">ระบบสำรวจวัดในประเทศไทย</p>
                    <p class="mb-1">Temple Survey System Thailand</p>
                    <p class="text-muted small mb-0">
                      ๐๑๒๓๔๕๖๗๘๙ ABCDEFGHIJKLMNOP
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Notification Settings Card -->
          <div class="col-lg-6 mb-4">
            <div class="card h-100">
              <div class="card-header">
                <h5 class="mb-0">
                  <i class="bi bi-bell me-2 text-warning"></i>
                  การแจ้งเตือน
                </h5>
              </div>
              <div class="card-body">
                <div class="form-check mb-3">
                  <input
                    v-model="personalSettings.notifications.email"
                    class="form-check-input"
                    type="checkbox"
                    id="emailNotification"
                  />
                  <label class="form-check-label" for="emailNotification">
                    แจ้งเตือนทางอีเมล
                  </label>
                </div>

                <div class="form-check mb-3">
                  <input
                    v-model="personalSettings.notifications.browser"
                    class="form-check-input"
                    type="checkbox"
                    id="browserNotification"
                  />
                  <label class="form-check-label" for="browserNotification">
                    แจ้งเตือนบนเบราว์เซอร์
                  </label>
                </div>

                <div class="form-check mb-3">
                  <input
                    v-model="personalSettings.notifications.surveyUpdates"
                    class="form-check-input"
                    type="checkbox"
                    id="surveyUpdates"
                  />
                  <label class="form-check-label" for="surveyUpdates">
                    การอัปเดตข้อมูลการสำรวจ
                  </label>
                </div>

                <div class="form-check mb-3">
                  <input
                    v-model="personalSettings.notifications.systemUpdates"
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

          <!-- Privacy & Data Card -->
          <div class="col-lg-6 mb-4">
            <div class="card h-100">
              <div class="card-header">
                <h5 class="mb-0">
                  <i class="bi bi-shield-lock me-2 text-success"></i>
                  ความเป็นส่วนตัว
                </h5>
              </div>
              <div class="card-body">
                <div class="mb-3">
                  <label class="form-label fw-bold"
                    >การเก็บข้อมูลการใช้งาน</label
                  >
                  <select
                    v-model="personalSettings.dataRetention"
                    class="form-select"
                  >
                    <option value="30">30 วัน</option>
                    <option value="90">90 วัน</option>
                    <option value="180">180 วัน</option>
                    <option value="365">1 ปี</option>
                    <option value="forever">ถาวร</option>
                  </select>
                </div>

                <div class="form-check mb-4">
                  <input
                    v-model="personalSettings.analytics"
                    class="form-check-input"
                    type="checkbox"
                    id="analytics"
                  />
                  <label class="form-check-label" for="analytics">
                    อนุญาตการวิเคราะห์การใช้งาน
                    <small class="text-muted d-block"
                      >ช่วยปรับปรุงระบบให้ดีขึ้น</small
                    >
                  </label>
                </div>

                <div class="d-grid gap-2">
                  <button
                    @click="exportData"
                    class="btn btn-outline-primary"
                    :disabled="exporting"
                  >
                    <i class="bi bi-download me-1"></i>
                    {{ exporting ? "กำลังส่งออก..." : "ส่งออกข้อมูล" }}
                  </button>
                  <button
                    @click="clearCache"
                    class="btn btn-outline-secondary"
                    :disabled="clearing"
                  >
                    <i class="bi bi-trash me-1"></i>
                    {{ clearing ? "กำลังล้าง..." : "ล้างแคช" }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- System Information Card -->
          <div class="col-lg-6 mb-4">
            <div class="card h-100">
              <div class="card-header">
                <h5 class="mb-0">
                  <i class="bi bi-info-circle me-2 text-info"></i>
                  ข้อมูลระบบ
                </h5>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-6 mb-3">
                    <div class="text-muted small">เวอร์ชั่นระบบ</div>
                    <div class="fw-bold">{{ systemInfo.version }}</div>
                  </div>
                  <div class="col-6 mb-3">
                    <div class="text-muted small">วันที่อัปเดตล่าสุด</div>
                    <div class="fw-bold">{{ systemInfo.lastUpdate }}</div>
                  </div>
                  <div class="col-6 mb-3">
                    <div class="text-muted small">เบราว์เซอร์</div>
                    <div class="fw-bold small">{{ systemInfo.browser }}</div>
                  </div>
                  <div class="col-6 mb-3">
                    <div class="text-muted small">ขนาดหน้าจอ</div>
                    <div class="fw-bold">{{ systemInfo.screenSize }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- System Settings Tab (Admin Only) -->
      <div v-if="activeMainTab === 'system' && isAdmin" class="tab-content">
        <!-- System Settings Category Navigation -->
        <div class="card mb-4">
          <div class="card-header">
            <h5 class="mb-0">
              <i class="bi bi-collection me-2"></i>
              หมวดหมู่การตั้งค่า
            </h5>
          </div>
          <div class="card-body">
            <ul class="nav nav-pills" role="tablist">
              <li
                v-for="category in systemCategories"
                :key="category"
                class="nav-item me-2 mb-2"
              >
                <button
                  @click="activeSystemCategory = category"
                  class="nav-link"
                  :class="{ active: activeSystemCategory === category }"
                  type="button"
                >
                  {{ getCategoryDisplayName(category) }}
                  <span class="badge bg-light text-dark ms-2">
                    {{ getCategoryCount(category) }}
                  </span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        <!-- System Settings Grid -->
        <div class="row">
          <div
            v-for="(setting, key) in getCategorySettings(activeSystemCategory)"
            :key="key"
            class="col-lg-6 mb-4"
          >
            <div class="card h-100">
              <div
                class="card-header d-flex justify-content-between align-items-center"
              >
                <h6 class="mb-0 fw-bold">
                  {{ getSettingDisplayName(key) }}
                </h6>
                <div class="d-flex align-items-center">
                  <span
                    v-if="hasSystemSettingChanged(key)"
                    class="badge bg-warning text-dark me-2"
                  >
                    มีการเปลี่ยนแปลง
                  </span>
                  <span
                    v-else-if="setting.is_public"
                    class="badge bg-success me-2"
                  >
                    สาธารณะ
                  </span>
                  <span v-else class="badge bg-secondary me-2"> ส่วนตัว </span>
                </div>
              </div>
              <div class="card-body">
                <p class="text-muted small mb-3">{{ setting.description }}</p>

                <!-- Boolean Setting -->
                <div
                  v-if="setting.type === 'boolean'"
                  class="form-check form-switch"
                >
                  <input
                    :id="key"
                    @change="toggleSystemSetting(key)"
                    :checked="getSystemSettingValue(key)"
                    class="form-check-input"
                    type="checkbox"
                  />
                  <label :for="key" class="form-check-label fw-bold">
                    {{
                      getSystemSettingValue(key) ? "เปิดใช้งาน" : "ปิดใช้งาน"
                    }}
                  </label>
                </div>

                <!-- String Setting -->
                <div v-else-if="setting.type === 'string'">
                  <input
                    v-model="modifiedSystemSettings[key]"
                    type="text"
                    class="form-control"
                    :placeholder="setting.value?.toString() || ''"
                  />
                </div>

                <!-- Number Setting -->
                <div v-else-if="setting.type === 'number'">
                  <input
                    v-model.number="modifiedSystemSettings[key]"
                    type="number"
                    class="form-control"
                    :placeholder="setting.value?.toString() || ''"
                  />
                </div>

                <!-- JSON Setting -->
                <div v-else-if="setting.type === 'json'">
                  <textarea
                    v-model="jsonSystemSettings[key]"
                    @blur="updateJsonSystemSetting(key)"
                    rows="4"
                    class="form-control font-monospace small"
                    :placeholder="JSON.stringify(setting.value, null, 2)"
                  ></textarea>
                </div>
              </div>
              <div class="card-footer bg-light">
                <div
                  class="d-flex justify-content-between align-items-center text-muted small"
                >
                  <span>ประเภท: {{ setting.type }}</span>
                  <span>อัปเดต: {{ formatDate(setting.updated_at) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Changes Summary Alert -->
      <div
        v-if="hasChanges"
        class="alert alert-warning d-flex align-items-center mb-4"
        role="alert"
      >
        <i class="bi bi-exclamation-triangle-fill me-2"></i>
        <div>
          <strong>มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก</strong><br />
          คุณได้ทำการเปลี่ยนแปลงการตั้งค่า {{ totalChanges }} รายการ
          กรุณาบันทึกเพื่อยืนยันการเปลี่ยนแปลง
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error && !initialized" class="text-center py-5">
      <div class="text-danger mb-3">
        <i class="bi bi-exclamation-circle display-1"></i>
      </div>
      <h5 class="text-danger mb-2">เกิดข้อผิดพลาด</h5>
      <p class="text-muted mb-3">{{ error }}</p>
      <button @click="refreshSettings" class="btn btn-primary">
        <i class="bi bi-arrow-clockwise me-1"></i>
        ลองใหม่
      </button>
    </div>

    <!-- Toast Notifications -->
    <div
      v-if="showToast"
      class="toast-container position-fixed bottom-0 end-0 p-3"
      style="z-index: 1055"
    >
      <div class="toast show" role="alert">
        <div class="toast-header">
          <i
            v-if="toastType === 'success'"
            class="bi bi-check-circle-fill text-success me-2"
          ></i>
          <i v-else class="bi bi-exclamation-circle-fill text-danger me-2"></i>
          <strong class="me-auto">การแจ้งเตือน</strong>
          <button
            @click="showToast = false"
            type="button"
            class="btn-close"
          ></button>
        </div>
        <div class="toast-body">
          {{ toastMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from "vue";
import { useAuthStore } from "@/stores/auth";
import settingsService from "@/services/settingsService";

const authStore = useAuthStore();

// State
const loading = ref(false);
const initialized = ref(false);
const error = ref(null);
const activeMainTab = ref("personal");
const activeSystemCategory = ref("verification");
const exporting = ref(false);
const clearing = ref(false);
const showToast = ref(false);
const toastMessage = ref("");
const toastType = ref("success");

// System Settings State
const systemSettings = ref({});
const modifiedSystemSettings = reactive({});
const jsonSystemSettings = reactive({});

// Personal Settings State
const personalSettings = reactive({
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
  version: "1.1.0",
  lastUpdate: "27 กรกฎาคม 2568",
  browser: "",
  screenSize: "",
});

// Check if user is admin
const isAdmin = computed(() => {
  return authStore.user?.role === "Admin";
});

// System settings categories
const systemCategories = computed(() => {
  if (!systemSettings.value) return [];
  return Object.keys(systemSettings.value);
});

// Check if there are changes
const hasChanges = computed(() => {
  const hasPersonalChanges =
    JSON.stringify(personalSettings) !==
    JSON.stringify(getInitialPersonalSettings());
  const hasSystemChanges = Object.keys(modifiedSystemSettings).length > 0;
  return hasPersonalChanges || hasSystemChanges;
});

const totalChanges = computed(() => {
  return (
    Object.keys(modifiedSystemSettings).length +
    (JSON.stringify(personalSettings) !==
    JSON.stringify(getInitialPersonalSettings())
      ? 1
      : 0)
  );
});

// Category display names
const categoryNames = {
  verification: "การยืนยันตัวตน",
  registration: "การลงทะเบียน",
  security: "ความปลอดภัย",
  general: "ทั่วไป",
  notification: "การแจ้งเตือน",
};

// Setting display names
const settingNames = {
  enable_dga_verification: "เปิดใช้การยืนยันตัวตน DGA",
  require_identity_verification: "บังคับการยืนยันตัวตน",
  allow_registration: "อนุญาตการลงทะเบียน",
  auto_approve_police: "อนุมัติเจ้าหน้าที่ตำรวจอัตโนมัติ",
  require_email_verification: "บังคับการยืนยันอีเมล",
  max_login_attempts: "จำนวนครั้งในการเข้าสู่ระบบสูงสุด",
  session_timeout_minutes: "หมดเวลาเซสชัน (นาที)",
  enable_audit_logging: "เปิดใช้การบันทึกกิจกรรม",
  maintenance_mode: "โหมดปิดปรับปรุงระบบ",
  system_name: "ชื่อระบบ",
  max_otp_attempts: "จำนวนครั้งสูงสุดในการกรอก OTP ผิด",
  otp_expiry_minutes: "ระยะเวลาหมดอายุของรหัส OTP (นาที)",
};

// Methods
const getInitialPersonalSettings = () => {
  return settingsService.getDefaultPersonalSettings();
};

const getCategoryDisplayName = (category) => {
  return categoryNames[category] || category;
};

const getCategoryCount = (category) => {
  if (!systemSettings.value || !systemSettings.value[category]) return 0;
  return Object.keys(systemSettings.value[category]).length;
};

const getCategorySettings = (category) => {
  if (!systemSettings.value || !systemSettings.value[category]) return {};
  return systemSettings.value[category];
};

const getSettingDisplayName = (key) => {
  return settingNames[key] || key;
};

const getSystemSettingValue = (key) => {
  if (modifiedSystemSettings[key] !== undefined) {
    return modifiedSystemSettings[key];
  }
  const categorySettings = getCategorySettings(activeSystemCategory.value);
  return categorySettings[key]?.value;
};

const hasSystemSettingChanged = (key) => {
  return modifiedSystemSettings[key] !== undefined;
};

const toggleSystemSetting = (key) => {
  const currentValue = getSystemSettingValue(key);
  modifiedSystemSettings[key] = !currentValue;
};

const updateJsonSystemSetting = (key) => {
  try {
    const parsed = JSON.parse(jsonSystemSettings[key]);
    modifiedSystemSettings[key] = parsed;
  } catch (e) {
    console.warn("Invalid JSON for setting:", key);
  }
};

const formatDate = (dateString) => {
  if (!dateString) return "ไม่ทราบ";
  return new Date(dateString).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const showToastMessage = (message, type = "success") => {
  toastMessage.value = message;
  toastType.value = type;
  showToast.value = true;
  setTimeout(() => {
    showToast.value = false;
  }, 5000);
};

// Fetch system settings (Admin only)
const fetchSystemSettings = async () => {
  if (!isAdmin.value) return;

  try {
    const response = await settingsService.getSystemSettings();

    if (response.success) {
      systemSettings.value = response.data.settings;

      // Initialize JSON settings for display
      Object.keys(systemSettings.value).forEach((category) => {
        Object.entries(systemSettings.value[category]).forEach(
          ([key, setting]) => {
            if (setting.type === "json") {
              jsonSystemSettings[key] = JSON.stringify(setting.value, null, 2);
            }
          }
        );
      });

      console.log("✅ System settings loaded successfully");
    } else {
      throw new Error(response.message || "Failed to fetch system settings");
    }
  } catch (err) {
    console.error("❌ Error fetching system settings:", err);
    error.value =
      err.response?.data?.message ||
      err.message ||
      "เกิดข้อผิดพลาดในการดึงข้อมูลการตั้งค่าระบบ";
  }
};

// Save all changes
const saveAllChanges = async () => {
  try {
    loading.value = true;

    // Save personal settings
    const personalSaved =
      settingsService.savePersonalSettings(personalSettings);

    // Save system settings if admin and has changes
    let systemSaved = true;
    if (isAdmin.value && Object.keys(modifiedSystemSettings).length > 0) {
      const response = await settingsService.bulkUpdateSystemSettings(
        modifiedSystemSettings
      );

      if (response.success) {
        // Update system settings with new values
        Object.entries(modifiedSystemSettings).forEach(([key, value]) => {
          Object.keys(systemSettings.value).forEach((category) => {
            if (systemSettings.value[category][key]) {
              systemSettings.value[category][key].value = value;
              systemSettings.value[category][key].updated_at =
                new Date().toISOString();
            }
          });
        });

        // Clear modified settings
        Object.keys(modifiedSystemSettings).forEach((key) => {
          delete modifiedSystemSettings[key];
        });
      } else {
        systemSaved = false;
        throw new Error(response.message || "Failed to save system settings");
      }
    }

    if (personalSaved && systemSaved) {
      showToastMessage("บันทึกการตั้งค่าสำเร็จ", "success");
    } else {
      showToastMessage("เกิดข้อผิดพลาดในการบันทึกการตั้งค่า", "error");
    }
  } catch (err) {
    console.error("❌ Error saving settings:", err);
    showToastMessage(
      err.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึกการตั้งค่า",
      "error"
    );
  } finally {
    loading.value = false;
  }
};

// Refresh all settings
const refreshSettings = async () => {
  loading.value = true;
  error.value = null;

  try {
    // Clear modified settings
    Object.keys(modifiedSystemSettings).forEach((key) => {
      delete modifiedSystemSettings[key];
    });
    Object.keys(jsonSystemSettings).forEach((key) => {
      delete jsonSystemSettings[key];
    });

    // Load personal settings
    const loadedSettings = settingsService.getPersonalSettings();
    Object.assign(personalSettings, loadedSettings);

    // Reload system settings if admin
    if (isAdmin.value) {
      await fetchSystemSettings();
    }

    initialized.value = true;
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

// Export user data
const exportData = async () => {
  exporting.value = true;

  try {
    const success = await settingsService.exportUserData(
      authStore.user?.id || "unknown"
    );
    if (success) {
      showToastMessage("ส่งออกข้อมูลสำเร็จ", "success");
    } else {
      showToastMessage("เกิดข้อผิดพลาดในการส่งออกข้อมูล", "error");
    }
  } catch (error) {
    console.error("Error exporting data:", error);
    showToastMessage("เกิดข้อผิดพลาดในการส่งออกข้อมูล", "error");
  } finally {
    exporting.value = false;
  }
};

// Clear cache
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
    const success = await settingsService.clearCache();
    if (success) {
      showToastMessage("ล้างแคชเรียบร้อยแล้ว", "success");
    } else {
      showToastMessage("เกิดข้อผิดพลาดในการล้างแคช", "error");
    }
  } catch (error) {
    console.error("Error clearing cache:", error);
    showToastMessage("เกิดข้อผิดพลาดในการล้างแคช", "error");
  } finally {
    clearing.value = false;
  }
};

const updateSystemInfo = () => {
  const info = settingsService.getSystemInfo();
  Object.assign(systemInfo, info);
};

// Watch for font changes to auto-apply
watch(
  () => personalSettings.fontFamily,
  () => {
    settingsService.applyPersonalSettings(personalSettings);
  }
);

watch(
  () => personalSettings.fontSize,
  () => {
    settingsService.applyPersonalSettings(personalSettings);
  }
);

watch(
  () => personalSettings.theme,
  () => {
    settingsService.applyPersonalSettings(personalSettings);
  }
);

// Lifecycle
onMounted(async () => {
  updateSystemInfo();
  await refreshSettings();
});
</script>

<style scoped>
.enhanced-settings {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Font families */
.font-sarabun {
  font-family: "Sarabun", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    sans-serif;
}
.font-kanit {
  font-family: "Kanit", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    sans-serif;
}
.font-prompt {
  font-family: "Prompt", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    sans-serif;
}
.font-mali {
  font-family: "Mali", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    sans-serif;
}
.font-mitr {
  font-family: "Mitr", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    sans-serif;
}
.font-system {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

/* Font sizes */
.size-small {
  font-size: 14px;
  line-height: 1.5;
}
.size-medium {
  font-size: 16px;
  line-height: 1.5;
}
.size-large {
  font-size: 18px;
  line-height: 1.5;
}
.size-extra-large {
  font-size: 20px;
  line-height: 1.5;
}

.font-preview {
  transition: font-family 0.3s ease, font-size 0.3s ease;
  padding: 1rem;
  border-radius: 0.5rem;
  background: #f8f9fa;
}

/* Card hover effects */
.card {
  transition: all 0.2s ease-in-out;
}

.card:hover {
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

/* Enhanced form controls */
.form-select:focus,
.form-control:focus {
  border-color: var(--bs-primary);
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}

.form-check-input:checked {
  background-color: var(--bs-primary);
  border-color: var(--bs-primary);
}

/* Badge styles */
.badge {
  font-size: 0.75rem;
  font-weight: 500;
}

/* Toast container */
.toast-container {
  z-index: 1055;
}

.toast {
  min-width: 300px;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .d-flex.gap-2 {
    flex-direction: column;
    gap: 0.5rem !important;
  }

  .nav-tabs .nav-link {
    font-size: 0.875rem;
    padding: 0.5rem 0.75rem;
  }

  .nav-pills .nav-link {
    font-size: 0.875rem;
    padding: 0.5rem 0.75rem;
    margin-bottom: 0.25rem;
  }

  .card-header h5,
  .card-header h6 {
    font-size: 1rem;
  }

  .col-lg-6 {
    margin-bottom: 1rem;
  }
}

/* Print styles */
@media print {
  .btn,
  .toast-container,
  .no-print {
    display: none !important;
  }

  .card {
    border: 1px solid #000 !important;
    box-shadow: none !important;
    break-inside: avoid;
    margin-bottom: 1rem;
  }

  .badge {
    border: 1px solid #000 !important;
    color: #000 !important;
    background: transparent !important;
  }
}

/* Compact mode */
:global(.compact-mode) .card-body {
  padding: 0.75rem;
}

:global(.compact-mode) .mb-3 {
  margin-bottom: 0.75rem !important;
}

/* No animations */
:global(.no-animations) * {
  animation-duration: 0s !important;
  animation-delay: 0s !important;
  transition-duration: 0s !important;
  transition-delay: 0s !important;
}

/* Accessibility improvements */
.nav-link:focus,
.btn:focus {
  outline: 2px solid var(--bs-primary);
  outline-offset: 2px;
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .card {
    border-color: #000 !important;
  }

  .text-muted {
    color: #000 !important;
  }

  .bg-light {
    background-color: #fff !important;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  :root {
    --bs-body-bg: #1a1a1a;
    --bs-body-color: #e5e5e5;
    --bs-card-bg: #2d2d2d;
  }
}
</style>
