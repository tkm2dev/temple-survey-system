<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">การตั้งค่า</h1>
            <p class="mt-2 text-gray-600">จัดการการตั้งค่าส่วนตัวและระบบ</p>
          </div>
          <div class="flex space-x-3">
            <button
              @click="refreshSettings"
              :disabled="loading"
              class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <i
                class="fas fa-sync-alt mr-2"
                :class="{ 'animate-spin': loading }"
              ></i>
              รีเฟรช
            </button>
            <button
              @click="saveAllChanges"
              :disabled="loading || !hasChanges"
              class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <i class="fas fa-save mr-2"></i>
              บันทึกการเปลี่ยนแปลง
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div
        v-if="loading && !initialized"
        class="flex justify-center items-center py-12"
      >
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
        ></div>
      </div>

      <!-- Main Content -->
      <div v-else class="space-y-8">
        <!-- Main Tabs -->
        <div class="border-b border-gray-200">
          <nav class="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              v-for="tab in mainTabs"
              :key="tab.key"
              @click="activeMainTab = tab.key"
              :class="[
                'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center',
                activeMainTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              ]"
            >
              <i :class="tab.icon + ' mr-2'"></i>
              {{ tab.title }}
            </button>
          </nav>
        </div>

        <!-- Personal Settings -->
        <div v-if="activeMainTab === 'personal'" class="space-y-6">
          <!-- Quick Actions Bar -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <h3 class="text-lg font-medium text-gray-900">การกระทำด่วน</h3>
                <div class="flex space-x-2">
                  <button
                    @click="resetToDefaults"
                    class="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <i class="fas fa-undo mr-1"></i>
                    รีเซ็ตเป็นค่าเริ่มต้น
                  </button>
                  <button
                    @click="importSettings"
                    class="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <i class="fas fa-upload mr-1"></i>
                    นำเข้าการตั้งค่า
                  </button>
                  <button
                    @click="exportSettings"
                    class="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <i class="fas fa-download mr-1"></i>
                    ส่งออกการตั้งค่า
                  </button>
                </div>
              </div>
              <div class="text-sm text-gray-500">
                บันทึกล่าสุด: {{ lastSaved || "ยังไม่ได้บันทึก" }}
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Display Preferences -->
            <div
              class="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div class="flex items-center mb-4">
                <i class="fas fa-display text-lg text-gray-600 mr-3"></i>
                <h3 class="text-lg font-medium text-gray-900">การแสดงผล</h3>
              </div>

              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2"
                    >ธีมสี</label
                  >
                  <select
                    v-model="personalSettings.theme"
                    class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="light">สว่าง</option>
                    <option value="dark">มืด</option>
                    <option value="auto">ตามระบบ</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2"
                    >ฟอนต์หลัก</label
                  >
                  <select
                    v-model="personalSettings.fontFamily"
                    class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="sarabun">Sarabun - สะระบัน (แนะนำ)</option>
                    <option value="kanit">Kanit - คอน์คริต</option>
                    <option value="prompt">Prompt - พร้อมต์</option>
                    <option value="mali">Mali - มาลี</option>
                    <option value="mitr">Mitr - มิตร</option>
                    <option value="system">ระบบปฏิบัติการ</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2"
                    >ขนาดฟอนต์</label
                  >
                  <select
                    v-model="personalSettings.fontSize"
                    class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="small">เล็ก (14px)</option>
                    <option value="medium">ปกติ (16px)</option>
                    <option value="large">ใหญ่ (18px)</option>
                    <option value="extra-large">ใหญ่มาก (20px)</option>
                  </select>
                </div>

                <div class="flex items-center">
                  <input
                    v-model="personalSettings.compactMode"
                    type="checkbox"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label class="ml-2 block text-sm text-gray-900">
                    โหมดกะทัดรัด
                  </label>
                </div>

                <div class="flex items-center">
                  <input
                    v-model="personalSettings.animations"
                    type="checkbox"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label class="ml-2 block text-sm text-gray-900">
                    เปิดใช้งานแอนิเมชั่น
                  </label>
                </div>
              </div>

              <!-- Font Preview -->
              <div class="mt-6 p-4 bg-gray-50 rounded-lg">
                <h6 class="text-sm font-medium text-gray-700 mb-2">
                  ตัวอย่างการแสดงผล
                </h6>
                <div
                  class="font-preview"
                  :class="`font-${personalSettings.fontFamily} size-${personalSettings.fontSize}`"
                >
                  <p class="mb-1">ระบบสำรวจวัดในประเทศไทย</p>
                  <p class="mb-1">Temple Survey System Thailand</p>
                  <p class="text-sm text-gray-600">
                    ๐๑๒๓๔๕๖๗๘๙ ABCDEFGHIJKLMNOP
                  </p>
                </div>
              </div>
            </div>

            <!-- Notification Preferences -->
            <div
              class="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div class="flex items-center mb-4">
                <i class="fas fa-bell text-lg text-gray-600 mr-3"></i>
                <h3 class="text-lg font-medium text-gray-900">การแจ้งเตือน</h3>
              </div>

              <div class="space-y-4">
                <div class="flex items-center">
                  <input
                    v-model="personalSettings.notifications.email"
                    type="checkbox"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label class="ml-2 block text-sm text-gray-900">
                    แจ้งเตือนทางอีเมล
                  </label>
                </div>

                <div class="flex items-center">
                  <input
                    v-model="personalSettings.notifications.browser"
                    type="checkbox"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label class="ml-2 block text-sm text-gray-900">
                    แจ้งเตือนบนเบราว์เซอร์
                  </label>
                </div>

                <div class="flex items-center">
                  <input
                    v-model="personalSettings.notifications.surveyUpdates"
                    type="checkbox"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label class="ml-2 block text-sm text-gray-900">
                    การอัปเดตข้อมูลการสำรวจ
                  </label>
                </div>

                <div class="flex items-center">
                  <input
                    v-model="personalSettings.notifications.systemUpdates"
                    type="checkbox"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label class="ml-2 block text-sm text-gray-900">
                    การอัปเดตระบบ
                  </label>
                </div>
              </div>
            </div>

            <!-- Privacy & Data -->
            <div
              class="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div class="flex items-center mb-4">
                <i class="fas fa-shield-alt text-lg text-gray-600 mr-3"></i>
                <h3 class="text-lg font-medium text-gray-900">
                  ความเป็นส่วนตัว
                </h3>
              </div>

              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2"
                    >การเก็บข้อมูลการใช้งาน</label
                  >
                  <select
                    v-model="personalSettings.dataRetention"
                    class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="30">30 วัน</option>
                    <option value="90">90 วัน</option>
                    <option value="180">180 วัน</option>
                    <option value="365">1 ปี</option>
                    <option value="forever">ถาวร</option>
                  </select>
                </div>

                <div class="flex items-center">
                  <input
                    v-model="personalSettings.analytics"
                    type="checkbox"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label class="ml-2 block text-sm text-gray-900">
                    อนุญาตการวิเคราะห์การใช้งาน
                    <span class="text-xs text-gray-500 block"
                      >ช่วยปรับปรุงระบบให้ดีขึ้น</span
                    >
                  </label>
                </div>

                <div class="pt-4 space-y-2">
                  <button
                    @click="exportData"
                    :disabled="exporting"
                    class="w-full sm:w-auto inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <i class="fas fa-download mr-2"></i>
                    {{ exporting ? "กำลังส่งออก..." : "ส่งออกข้อมูล" }}
                  </button>
                  <button
                    @click="clearCache"
                    :disabled="clearing"
                    class="w-full sm:w-auto inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 sm:ml-2"
                  >
                    <i class="fas fa-trash mr-2"></i>
                    {{ clearing ? "กำลังล้าง..." : "ล้างแคช" }}
                  </button>
                </div>
              </div>
            </div>

            <!-- System Information -->
            <div
              class="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div class="flex items-center mb-4">
                <i class="fas fa-info-circle text-lg text-gray-600 mr-3"></i>
                <h3 class="text-lg font-medium text-gray-900">ข้อมูลระบบ</h3>
              </div>

              <div class="space-y-3">
                <div>
                  <dt class="text-sm font-medium text-gray-500">
                    เวอร์ชั่นระบบ
                  </dt>
                  <dd class="text-sm text-gray-900">
                    {{ systemInfo.version }}
                  </dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">
                    วันที่อัปเดตล่าสุด
                  </dt>
                  <dd class="text-sm text-gray-900">
                    {{ systemInfo.lastUpdate }}
                  </dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">เบราว์เซอร์</dt>
                  <dd class="text-sm text-gray-900">
                    {{ systemInfo.browser }}
                  </dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">ขนาดหน้าจอ</dt>
                  <dd class="text-sm text-gray-900">
                    {{ systemInfo.screenSize }}
                  </dd>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- System Settings (Admin Only) -->
        <div v-if="activeMainTab === 'system' && isAdmin" class="space-y-6">
          <!-- Category Tabs for System Settings -->
          <div class="border-b border-gray-200">
            <nav
              class="-mb-px flex space-x-8"
              aria-label="System Settings Categories"
            >
              <button
                v-for="category in systemCategories"
                :key="category"
                @click="activeSystemCategory = category"
                :class="[
                  'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm',
                  activeSystemCategory === category
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

          <!-- System Settings Content -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div
              v-for="(setting, key) in getCategorySettings(
                activeSystemCategory
              )"
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
                      @click="toggleSystemSetting(key)"
                      :class="[
                        'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
                        getSystemSettingValue(key)
                          ? 'bg-blue-600'
                          : 'bg-gray-200',
                      ]"
                    >
                      <span
                        :class="[
                          'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200',
                          getSystemSettingValue(key)
                            ? 'translate-x-5'
                            : 'translate-x-0',
                        ]"
                      />
                    </button>
                    <span class="ml-3 text-sm">
                      <span class="font-medium text-gray-900">
                        {{
                          getSystemSettingValue(key)
                            ? "เปิดใช้งาน"
                            : "ปิดใช้งาน"
                        }}
                      </span>
                    </span>
                  </div>

                  <!-- String Setting -->
                  <div v-else-if="setting.type === 'string'">
                    <input
                      v-model="modifiedSystemSettings[key]"
                      type="text"
                      class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      :placeholder="setting.value?.toString() || ''"
                    />
                  </div>

                  <!-- Number Setting -->
                  <div v-else-if="setting.type === 'number'">
                    <input
                      v-model.number="modifiedSystemSettings[key]"
                      type="number"
                      class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      :placeholder="setting.value?.toString() || ''"
                    />
                  </div>

                  <!-- JSON Setting -->
                  <div v-else-if="setting.type === 'json'">
                    <textarea
                      v-model="jsonSystemSettings[key]"
                      @blur="updateJsonSystemSetting(key)"
                      rows="4"
                      class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-mono text-xs"
                      :placeholder="JSON.stringify(setting.value, null, 2)"
                    />
                  </div>
                </div>

                <!-- Setting Status -->
                <div class="ml-4 flex-shrink-0">
                  <span
                    v-if="hasSystemSettingChanged(key)"
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
        </div>

        <!-- Changes Summary -->
        <div
          v-if="hasChanges"
          class="bg-yellow-50 border border-yellow-200 rounded-md p-4"
        >
          <div class="flex">
            <div class="flex-shrink-0">
              <i class="fas fa-exclamation-triangle text-yellow-400"></i>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-yellow-800">
                มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก
              </h3>
              <div class="mt-2 text-sm text-yellow-700">
                <p>
                  คุณได้ทำการเปลี่ยนแปลงการตั้งค่า
                  {{ totalChanges }} รายการ กรุณาบันทึกเพื่อยืนยันการเปลี่ยนแปลง
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-if="error && !initialized" class="text-center py-12">
        <div class="text-red-600 mb-4">
          <i class="fas fa-exclamation-circle text-4xl"></i>
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
      class="fixed bottom-0 right-0 m-6 max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden z-50"
    >
      <div class="p-4">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <i
              v-if="toastType === 'success'"
              class="fas fa-check-circle text-green-400"
            ></i>
            <i v-else class="fas fa-exclamation-circle text-red-400"></i>
          </div>
          <div class="ml-3 w-0 flex-1 pt-0.5">
            <p class="text-sm font-medium text-gray-900">{{ toastMessage }}</p>
          </div>
          <div class="ml-4 flex-shrink-0 flex">
            <button
              @click="showToast = false"
              class="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from "vue";
import { useAuthStore } from "@/stores/auth";
import axios from "axios";

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
const lastSaved = ref(null);
const isOnline = ref(navigator.onLine);
const creatingBackup = ref(false);
const restoring = ref(false);
const lastBackup = ref(null);

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

// Additional Settings States
const accountSettings = reactive({
  displayName: "",
  email: "",
  phone: "",
});

const securitySettings = reactive({
  twoFactorEnabled: false,
  loginNotifications: true,
  sessionTimeout: "60",
});

const localizationSettings = reactive({
  language: "th",
  dateFormat: "dd/mm/yyyy",
  timeFormat: "24",
  timezone: "Asia/Bangkok",
});

const keyboardSettings = reactive({
  enabled: true,
});

const performanceSettings = reactive({
  itemsPerPage: "25",
  enableCaching: true,
  preloadData: false,
  enableLazyLoading: true,
});

const backupSettings = reactive({
  autoBackup: false,
  frequency: "weekly",
});

const activeDevices = ref([
  {
    id: 1,
    name: "Chrome - Windows 10",
    type: "desktop",
    lastActive: "ตอนนี้",
    current: true,
  },
  {
    id: 2,
    name: "Safari - iPhone",
    type: "mobile",
    lastActive: "2 ชั่วโมงที่แล้ว",
    current: false,
  },
]);

// System information
const systemInfo = reactive({
  version: "1.1.0",
  lastUpdate: "27 กรกฎาคม 2568",
  browser: "",
  screenSize: "",
});

// Main tabs configuration
const mainTabs = computed(() => {
  const tabs = [
    { key: "personal", title: "การตั้งค่าส่วนตัว", icon: "fas fa-user-cog" },
  ];

  if (isAdmin.value) {
    tabs.push({
      key: "system",
      title: "การตั้งค่าระบบ",
      icon: "fas fa-cogs",
    });
  }

  return tabs;
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

// Load personal settings from localStorage
const loadPersonalSettings = () => {
  const saved = localStorage.getItem("app-settings");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      Object.assign(personalSettings, parsed);
    } catch (error) {
      console.error("Error loading personal settings:", error);
    }
  }
};

// Save personal settings to localStorage
const savePersonalSettings = () => {
  try {
    localStorage.setItem("app-settings", JSON.stringify(personalSettings));
    applyPersonalSettings();
    return true;
  } catch (error) {
    console.error("Error saving personal settings:", error);
    return false;
  }
};

// Apply personal settings to DOM
const applyPersonalSettings = () => {
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

  root.style.setProperty(
    "--font-primary",
    fontMap[personalSettings.fontFamily]
  );

  // Apply font size
  const sizeMap = {
    small: "14px",
    medium: "16px",
    large: "18px",
    "extra-large": "20px",
  };

  document.body.style.fontSize = sizeMap[personalSettings.fontSize];

  // Apply theme
  if (personalSettings.theme === "dark") {
    document.documentElement.classList.add("dark");
  } else if (personalSettings.theme === "light") {
    document.documentElement.classList.remove("dark");
  }

  // Apply compact mode
  if (personalSettings.compactMode) {
    document.body.classList.add("compact-mode");
  } else {
    document.body.classList.remove("compact-mode");
  }

  // Apply animations
  if (!personalSettings.animations) {
    document.body.classList.add("no-animations");
  } else {
    document.body.classList.remove("no-animations");
  }
};

// Fetch system settings (Admin only)
const fetchSystemSettings = async () => {
  if (!isAdmin.value) return;

  try {
    const response = await axios.get("/api/settings", {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });

    if (response.data.success) {
      systemSettings.value = response.data.data.settings;

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
      throw new Error(
        response.data.message || "Failed to fetch system settings"
      );
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
    const personalSaved = savePersonalSettings();

    // Save system settings if admin and has changes
    let systemSaved = true;
    if (isAdmin.value && Object.keys(modifiedSystemSettings).length > 0) {
      const response = await axios.post(
        "/api/settings/bulk-update",
        {
          settings: modifiedSystemSettings,
        },
        {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
        }
      );

      if (response.data.success) {
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
        throw new Error(
          response.data.message || "Failed to save system settings"
        );
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

    // Reload personal settings
    loadPersonalSettings();

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
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const data = {
      personalSettings: personalSettings,
      exportDate: new Date().toISOString(),
      user: authStore.user?.username || "unknown",
      version: systemInfo.version,
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

    showToastMessage("ส่งออกข้อมูลสำเร็จ", "success");
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
    if ("caches" in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      );
    }

    sessionStorage.clear();
    showToastMessage("ล้างแคชเรียบร้อยแล้ว", "success");
  } catch (error) {
    console.error("Error clearing cache:", error);
    showToastMessage("เกิดข้อผิดพลาดในการล้างแคช", "error");
  } finally {
    clearing.value = false;
  }
};

const updateSystemInfo = () => {
  systemInfo.browser = navigator.userAgent.split(") ")[0].split(" (")[0];
  systemInfo.screenSize = `${screen.width} × ${screen.height}`;
};

// New Methods
const resetToDefaults = async () => {
  if (!confirm("คุณต้องการรีเซ็ตการตั้งค่าทั้งหมดเป็นค่าเริ่มต้นหรือไม่?")) {
    return;
  }

  Object.assign(personalSettings, getInitialPersonalSettings());
  Object.assign(accountSettings, { displayName: "", email: "", phone: "" });
  Object.assign(securitySettings, {
    twoFactorEnabled: false,
    loginNotifications: true,
    sessionTimeout: "60",
  });
  Object.assign(localizationSettings, {
    language: "th",
    dateFormat: "dd/mm/yyyy",
    timeFormat: "24",
    timezone: "Asia/Bangkok",
  });
  Object.assign(keyboardSettings, { enabled: true });
  Object.assign(performanceSettings, {
    itemsPerPage: "25",
    enableCaching: true,
    preloadData: false,
    enableLazyLoading: true,
  });
  Object.assign(backupSettings, { autoBackup: false, frequency: "weekly" });

  showToastMessage("รีเซ็ตการตั้งค่าเป็นค่าเริ่มต้นเรียบร้อยแล้ว", "success");
};

const importSettings = () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const settings = JSON.parse(e.target.result);

          if (settings.personalSettings) {
            Object.assign(personalSettings, settings.personalSettings);
          }
          if (settings.accountSettings) {
            Object.assign(accountSettings, settings.accountSettings);
          }
          if (settings.securitySettings) {
            Object.assign(securitySettings, settings.securitySettings);
          }
          if (settings.localizationSettings) {
            Object.assign(localizationSettings, settings.localizationSettings);
          }
          if (settings.keyboardSettings) {
            Object.assign(keyboardSettings, settings.keyboardSettings);
          }
          if (settings.performanceSettings) {
            Object.assign(performanceSettings, settings.performanceSettings);
          }
          if (settings.backupSettings) {
            Object.assign(backupSettings, settings.backupSettings);
          }

          showToastMessage("นำเข้าการตั้งค่าสำเร็จ", "success");
        } catch (error) {
          showToastMessage("ไฟล์การตั้งค่าไม่ถูกต้อง", "error");
        }
      };
      reader.readAsText(file);
    }
  };
  input.click();
};

const exportSettings = () => {
  const settingsData = {
    personalSettings,
    accountSettings,
    securitySettings,
    localizationSettings,
    keyboardSettings,
    performanceSettings,
    backupSettings,
    exportDate: new Date().toISOString(),
    version: systemInfo.version,
  };

  const blob = new Blob([JSON.stringify(settingsData, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `settings-${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToastMessage("ส่งออกการตั้งค่าสำเร็จ", "success");
};

const changePassword = () => {
  // Navigate to change password page or open modal
  showToastMessage("คุณสมบัตินี้จะพัฒนาในอนาคต", "info");
};

const toggle2FA = () => {
  securitySettings.twoFactorEnabled = !securitySettings.twoFactorEnabled;
  showToastMessage(
    securitySettings.twoFactorEnabled
      ? "เปิดใช้งาน 2FA แล้ว"
      : "ปิดใช้งาน 2FA แล้ว",
    "success"
  );
};

const toggleLoginNotification = () => {
  securitySettings.loginNotifications = !securitySettings.loginNotifications;
};

const getDeviceIcon = (type) => {
  const icons = {
    desktop: "fas fa-desktop",
    mobile: "fas fa-mobile-alt",
    tablet: "fas fa-tablet-alt",
  };
  return icons[type] || "fas fa-question-circle";
};

const revokeDevice = (deviceId) => {
  if (confirm("คุณต้องการถอดอุปกรณ์นี้ออกหรือไม่?")) {
    const index = activeDevices.value.findIndex((d) => d.id === deviceId);
    if (index > -1) {
      activeDevices.value.splice(index, 1);
      showToastMessage("ถอดอุปกรณ์เรียบร้อยแล้ว", "success");
    }
  }
};

const createBackup = async () => {
  creatingBackup.value = true;

  try {
    // Simulate backup process
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const backupData = {
      personalSettings,
      accountSettings,
      securitySettings,
      localizationSettings,
      keyboardSettings,
      performanceSettings,
      backupSettings,
      timestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    lastBackup.value = new Date().toLocaleString("th-TH");
    showToastMessage("สำรองข้อมูลสำเร็จ", "success");
  } catch (error) {
    showToastMessage("เกิดข้อผิดพลาดในการสำรองข้อมูล", "error");
  } finally {
    creatingBackup.value = false;
  }
};

const restoreFromBackup = () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      restoring.value = true;

      try {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const backupData = JSON.parse(e.target.result);

            // Restore all settings
            if (backupData.personalSettings) {
              Object.assign(personalSettings, backupData.personalSettings);
            }
            if (backupData.accountSettings) {
              Object.assign(accountSettings, backupData.accountSettings);
            }
            if (backupData.securitySettings) {
              Object.assign(securitySettings, backupData.securitySettings);
            }
            if (backupData.localizationSettings) {
              Object.assign(
                localizationSettings,
                backupData.localizationSettings
              );
            }
            if (backupData.keyboardSettings) {
              Object.assign(keyboardSettings, backupData.keyboardSettings);
            }
            if (backupData.performanceSettings) {
              Object.assign(
                performanceSettings,
                backupData.performanceSettings
              );
            }
            if (backupData.backupSettings) {
              Object.assign(backupSettings, backupData.backupSettings);
            }

            showToastMessage("กู้คืนข้อมูลสำเร็จ", "success");
          } catch (error) {
            showToastMessage("ไฟล์สำรองข้อมูลไม่ถูกต้อง", "error");
          } finally {
            restoring.value = false;
          }
        };
        reader.readAsText(file);
      } catch (error) {
        showToastMessage("เกิดข้อผิดพลาดในการกู้คืนข้อมูล", "error");
        restoring.value = false;
      }
    }
  };
  input.click();
};

// Watch for font changes to auto-apply
watch(() => personalSettings.fontFamily, applyPersonalSettings);
watch(() => personalSettings.fontSize, applyPersonalSettings);

// Lifecycle
onMounted(async () => {
  updateSystemInfo();
  await refreshSettings();
});
</script>

<style scoped>
/* Font families */
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

/* Font sizes */
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

.font-preview {
  transition: all 0.3s ease;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .space-x-8 {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .lg\\:grid-cols-2 {
    grid-template-columns: 1fr;
  }
}
</style>
