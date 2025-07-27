<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">การตั้งค่าระบบ</h1>
            <p class="mt-2 text-gray-600">จัดการการตั้งค่าการทำงานของระบบ</p>
          </div>
          <div class="flex space-x-3">
            <button
              @click="refreshSettings"
              :disabled="loading"
              class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <svg
                class="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              รีเฟรช
            </button>
            <button
              @click="saveAllChanges"
              :disabled="loading || !hasChanges"
              class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <svg
                class="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              บันทึกการเปลี่ยนแปลง
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div
        v-if="loading && !settings"
        class="flex justify-center items-center py-12"
      >
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
        ></div>
      </div>

      <!-- Settings Content -->
      <div v-else-if="settings" class="space-y-8">
        <!-- Category Tabs -->
        <div class="border-b border-gray-200">
          <nav class="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              v-for="category in categories"
              :key="category"
              @click="activeCategory = category"
              :class="[
                'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm',
                activeCategory === category
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              ]"
            >
              {{ getCategoryDisplayName(category) }}
              <span
                class="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs font-medium"
              >
                {{ getCategoryCount(category) }}
              </span>
            </button>
          </nav>
        </div>

        <!-- Settings for Active Category -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div
            v-for="(setting, key) in getCategorySettings(activeCategory)"
            :key="key"
            class="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h3 class="text-lg font-medium text-gray-900 mb-2">
                  {{ getSettingDisplayName(key) }}
                </h3>
                <p class="text-sm text-gray-600 mb-4">
                  {{ setting.description }}
                </p>

                <!-- Boolean Setting -->
                <div
                  v-if="setting.type === 'boolean'"
                  class="flex items-center"
                >
                  <button
                    @click="toggleSetting(key)"
                    :class="[
                      'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
                      getSettingValue(key) ? 'bg-blue-600' : 'bg-gray-200',
                    ]"
                  >
                    <span
                      :class="[
                        'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200',
                        getSettingValue(key)
                          ? 'translate-x-5'
                          : 'translate-x-0',
                      ]"
                    />
                  </button>
                  <span class="ml-3 text-sm">
                    <span class="font-medium text-gray-900">
                      {{ getSettingValue(key) ? "เปิดใช้งาน" : "ปิดใช้งาน" }}
                    </span>
                  </span>
                </div>

                <!-- String/Text Setting -->
                <div v-else-if="setting.type === 'string'">
                  <input
                    v-model="modifiedSettings[key]"
                    type="text"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    :placeholder="setting.value"
                  />
                </div>

                <!-- Number Setting -->
                <div v-else-if="setting.type === 'number'">
                  <input
                    v-model.number="modifiedSettings[key]"
                    type="number"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    :placeholder="setting.value.toString()"
                  />
                </div>

                <!-- JSON Setting -->
                <div v-else-if="setting.type === 'json'">
                  <textarea
                    v-model="jsonSettings[key]"
                    @blur="updateJsonSetting(key)"
                    rows="4"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-mono text-xs"
                    :placeholder="JSON.stringify(setting.value, null, 2)"
                  />
                </div>
              </div>

              <!-- Setting Status -->
              <div class="ml-4 flex-shrink-0">
                <span
                  v-if="hasSettingChanged(key)"
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
                >
                  มีการเปลี่ยนแปลง
                </span>
                <span
                  v-else-if="setting.is_public"
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                >
                  สาธารณะ
                </span>
                <span
                  v-else
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                >
                  ส่วนตัว
                </span>
              </div>
            </div>

            <!-- Setting Meta Info -->
            <div class="mt-4 pt-4 border-t border-gray-100">
              <div class="flex text-xs text-gray-500 space-x-4">
                <span>ประเภท: {{ setting.type }}</span>
                <span>อัปเดต: {{ formatDate(setting.updated_at) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Changes Summary -->
        <div
          v-if="hasChanges"
          class="bg-yellow-50 border border-yellow-200 rounded-md p-4"
        >
          <div class="flex">
            <div class="flex-shrink-0">
              <svg
                class="h-5 w-5 text-yellow-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-yellow-800">
                มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก
              </h3>
              <div class="mt-2 text-sm text-yellow-700">
                <p>
                  คุณได้ทำการเปลี่ยนแปลงการตั้งค่า
                  {{ Object.keys(modifiedSettings).length }} รายการ
                  กรุณาบันทึกเพื่อยืนยันการเปลี่ยนแปลง
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <div class="text-red-600 mb-4">
          <svg
            class="mx-auto h-12 w-12"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">เกิดข้อผิดพลาด</h3>
        <p class="text-gray-600 mb-4">{{ error }}</p>
        <button
          @click="refreshSettings"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          ลองใหม่
        </button>
      </div>
    </div>

    <!-- Toast Notifications -->
    <div
      v-if="showToast"
      class="fixed bottom-0 right-0 m-6 max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden"
    >
      <div class="p-4">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <svg
              v-if="toastType === 'success'"
              class="h-6 w-6 text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <svg
              v-else
              class="h-6 w-6 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div class="ml-3 w-0 flex-1 pt-0.5">
            <p class="text-sm font-medium text-gray-900">{{ toastMessage }}</p>
          </div>
          <div class="ml-4 flex-shrink-0 flex">
            <button
              @click="showToast = false"
              class="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fill-rule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import axios from "axios";

const authStore = useAuthStore();

// State
const loading = ref(false);
const settings = ref(null);
const error = ref(null);
const activeCategory = ref("authentication");
const modifiedSettings = reactive({});
const jsonSettings = reactive({});
const showToast = ref(false);
const toastMessage = ref("");
const toastType = ref("success");

// Category display names
const categoryNames = {
  authentication: "การยืนยันตัวตน",
  registration: "การลงทะเบียน",
  security: "ความปลอดภัย",
  notification: "การแจ้งเตือน",
  system: "ระบบ",
  maintenance: "การบำรุงรักษา",
};

// Setting display names
const settingNames = {
  enable_dga_verification: "เปิดใช้การยืนยันตัวตน DGA",
  require_identity_verification: "บังคับการยืนยันตัวตน",
  allow_registration: "อนุญาตการลงทะเบียน",
  auto_approve_police: "อนุมัติเจ้าหน้าที่ตำรวจอัตโนมัติ",
  require_email_verification: "บังคับการยืนยันอีเมล",
  allow_phone_registration: "อนุญาตลงทะเบียนด้วยเบอร์โทร",
  max_login_attempts: "จำนวนครั้งในการเข้าสู่ระบบสูงสุด",
  session_timeout_minutes: "หมดเวลาเซสชัน (นาที)",
  enable_audit_logging: "เปิดใช้การบันทึกกิจกรรม",
  maintenance_mode: "โหมดปิดปรับปรุงระบบ",
};

// Computed
const categories = computed(() => {
  if (!settings.value) return [];
  return Object.keys(settings.value);
});

const hasChanges = computed(() => {
  return Object.keys(modifiedSettings).length > 0;
});

// Methods
const getCategoryDisplayName = (category) => {
  return categoryNames[category] || category;
};

const getCategoryCount = (category) => {
  if (!settings.value || !settings.value[category]) return 0;
  return Object.keys(settings.value[category]).length;
};

const getCategorySettings = (category) => {
  if (!settings.value || !settings.value[category]) return {};
  return settings.value[category];
};

const getSettingDisplayName = (key) => {
  return settingNames[key] || key;
};

const getSettingValue = (key) => {
  if (modifiedSettings[key] !== undefined) {
    return modifiedSettings[key];
  }
  const categorySettings = getCategorySettings(activeCategory.value);
  return categorySettings[key]?.value;
};

const hasSettingChanged = (key) => {
  return modifiedSettings[key] !== undefined;
};

const toggleSetting = (key) => {
  const currentValue = getSettingValue(key);
  modifiedSettings[key] = !currentValue;
};

const updateJsonSetting = (key) => {
  try {
    const parsed = JSON.parse(jsonSettings[key]);
    modifiedSettings[key] = parsed;
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

const fetchSettings = async () => {
  try {
    loading.value = true;
    error.value = null;

    const response = await axios.get("/api/settings", {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });

    if (response.data.success) {
      settings.value = response.data.data.settings;

      // Initialize JSON settings for display
      Object.keys(settings.value).forEach((category) => {
        Object.entries(settings.value[category]).forEach(([key, setting]) => {
          if (setting.type === "json") {
            jsonSettings[key] = JSON.stringify(setting.value, null, 2);
          }
        });
      });

      console.log("✅ Settings loaded successfully");
    } else {
      throw new Error(response.data.message || "Failed to fetch settings");
    }
  } catch (err) {
    console.error("❌ Error fetching settings:", err);
    error.value =
      err.response?.data?.message ||
      err.message ||
      "เกิดข้อผิดพลาดในการดึงข้อมูลการตั้งค่า";
  } finally {
    loading.value = false;
  }
};

const saveAllChanges = async () => {
  try {
    loading.value = true;

    const response = await axios.post(
      "/api/settings/bulk-update",
      {
        settings: modifiedSettings,
      },
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      }
    );

    if (response.data.success) {
      // Update settings with new values
      Object.entries(modifiedSettings).forEach(([key, value]) => {
        // Find and update the setting in the correct category
        Object.keys(settings.value).forEach((category) => {
          if (settings.value[category][key]) {
            settings.value[category][key].value = value;
            settings.value[category][key].updated_at = new Date().toISOString();
          }
        });
      });

      // Clear modified settings
      Object.keys(modifiedSettings).forEach((key) => {
        delete modifiedSettings[key];
      });

      showToastMessage("บันทึกการตั้งค่าสำเร็จ", "success");
      console.log("✅ Settings saved successfully");
    } else {
      throw new Error(response.data.message || "Failed to save settings");
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

const refreshSettings = async () => {
  // Clear modified settings
  Object.keys(modifiedSettings).forEach((key) => {
    delete modifiedSettings[key];
  });
  Object.keys(jsonSettings).forEach((key) => {
    delete jsonSettings[key];
  });

  await fetchSettings();
};

// Lifecycle
onMounted(() => {
  fetchSettings();
});
</script>
