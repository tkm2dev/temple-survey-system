<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <div class="header-logo">
          <div class="logo-container">
            <!-- Government/Temple Logo -->
            <div class="logo-icon">
              <i class="bi bi-building-fill"></i>
            </div>
            <div class="logo-badge">
              <i class="bi bi-shield-check-fill"></i>
            </div>
          </div>
        </div>
        <h2 class="login-title">เข้าสู่ระบบ</h2>
        <p class="login-subtitle">
          {{ systemSettings.system_name || "ระบบสำรวจข้อมูลวัด" }}
        </p>
        <div class="system-info">
          <small class="text-muted">
            <i class="bi bi-building me-1"></i>
            {{ systemSettings.system_name_public || "สำนักงานตำรวจแห่งชาติ" }}
          </small>
        </div>
      </div>

      <div class="login-form">
        <form
          @submit.prevent="handleLogin"
          :class="{ 'opacity-50': systemSettings.maintenance_mode }"
        >
          <fieldset :disabled="systemSettings.maintenance_mode">
            <div class="mb-3">
              <label for="username" class="form-label">ชื่อผู้ใช้</label>
              <div class="input-group">
                <span class="input-group-text">
                  <i class="bi bi-person"></i>
                </span>
                <input
                  id="username"
                  v-model="form.username"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': errors.username }"
                  placeholder="กรอกชื่อผู้ใช้"
                  required
                  autocomplete="username"
                />
                <div v-if="errors.username" class="invalid-feedback">
                  {{ errors.username }}
                </div>
              </div>
            </div>

            <div class="mb-4">
              <label for="password" class="form-label">รหัสผ่าน</label>
              <div class="input-group">
                <span class="input-group-text">
                  <i class="bi bi-lock"></i>
                </span>
                <input
                  id="password"
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  class="form-control"
                  :class="{ 'is-invalid': errors.password }"
                  placeholder="กรอกรหัสผ่าน"
                  required
                  autocomplete="current-password"
                />
                <button
                  type="button"
                  class="btn btn-outline-secondary"
                  @click="togglePassword"
                >
                  <i
                    :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"
                  ></i>
                </button>
                <div v-if="errors.password" class="invalid-feedback">
                  {{ errors.password }}
                </div>
              </div>
            </div>

            <!-- Remember Me -->
            <div class="form-check mb-3">
              <input
                v-model="form.rememberMe"
                class="form-check-input"
                type="checkbox"
                id="rememberMe"
              />
              <label class="form-check-label" for="rememberMe">
                จดจำการเข้าสู่ระบบ
              </label>
            </div>

            <div class="d-grid gap-2 mb-3">
              <button
                type="submit"
                class="btn btn-primary btn-lg"
                :disabled="authStore.loading"
              >
                <span v-if="authStore.loading">
                  <span
                    class="spinner-border spinner-border-sm me-2"
                    role="status"
                  ></span>
                  กำลังเข้าสู่ระบบ...
                </span>
                <span v-else>
                  <i class="bi bi-box-arrow-in-right me-2"></i>
                  เข้าสู่ระบบ
                </span>
              </button>
            </div>

            <!-- Register Link -->
            <div class="text-center">
              <p class="mb-2 text-muted">ยังไม่มีบัญชีผู้ใช้?</p>
              <div class="d-grid gap-2">
                <router-link
                  v-if="systemSettings.enable_dga_verification"
                  to="/auth/digital-verification"
                  class="btn btn-primary"
                >
                  <i class="bi bi-shield-check me-2"></i>
                  ลงทะเบียนพร้อมยืนยันตัวตน
                </router-link>
                <router-link
                  v-if="systemSettings.allow_registration"
                  to="/auth/register"
                  :class="
                    systemSettings.enable_dga_verification
                      ? 'btn btn-outline-secondary btn-sm'
                      : 'btn btn-primary'
                  "
                >
                  <i class="bi bi-person-plus me-2"></i>
                  {{
                    systemSettings.enable_dga_verification
                      ? "ลงทะเบียนแบบทั่วไป"
                      : "ลงทะเบียนใช้งาน"
                  }}
                </router-link>
              </div>
            </div>
          </fieldset>
        </form>

        <!-- Additional Links -->
        <div class="login-links">
          <div class="row text-center">
            <div class="col-6">
              <a
                href="#"
                @click.prevent="showForgotPassword = true"
                class="text-decoration-none"
              >
                <i class="bi bi-question-circle me-1"></i>
                ลืมรหัสผ่าน?
              </a>
            </div>
            <div class="col-6">
              <a
                href="#"
                @click.prevent="showHelp = true"
                class="text-decoration-none"
              >
                <i class="bi bi-info-circle me-1"></i>
                ช่วยเหลือ
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- System Status -->
    <div class="system-status">
      <div class="status-item">
        <div class="status-indicator" :class="systemStatus.class"></div>
        <span class="status-text">{{ systemStatus.text }}</span>
      </div>
    </div>

    <!-- Forgot Password Modal -->
    <div
      v-if="showForgotPassword"
      class="modal fade show d-block"
      tabindex="-1"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">ลืมรหัสผ่าน</h5>
            <button
              type="button"
              class="btn-close"
              @click="showForgotPassword = false"
            ></button>
          </div>
          <div class="modal-body">
            <p>
              หากท่านลืมรหัสผ่าน กรุณาติดต่อผู้ดูแลระบบเพื่อขอรีเซ็ตรหัสผ่าน
            </p>
            <div class="contact-info">
              <h6>ข้อมูลติดต่อ:</h6>
              <p class="mb-1">
                <i class="bi bi-envelope me-2"></i>
                admin@survey.gov.th
              </p>
              <p class="mb-1">
                <i class="bi bi-telephone me-2"></i>
                02-111-2222
              </p>
              <p class="mb-0">
                <i class="bi bi-clock me-2"></i>
                จันทร์-ศุกร์ 8:30-16:30 น.
              </p>
            </div>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              @click="showForgotPassword = false"
            >
              ปิด
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Help Modal -->
    <div v-if="showHelp" class="modal fade show d-block" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">คู่มือการใช้งาน</h5>
            <button
              type="button"
              class="btn-close"
              @click="showHelp = false"
            ></button>
          </div>
          <div class="modal-body">
            <div class="help-content">
              <h6>การเข้าสู่ระบบ</h6>
              <ul>
                <li>ใช้ชื่อผู้ใช้และรหัสผ่านที่ได้รับการอนุมัติแล้ว</li>
                <li>หากไม่มีบัญชีผู้ใช้ กรุณาลงทะเบียนและรอการอนุมัติ</li>
              </ul>

              <h6>การลงทะเบียน</h6>
              <ul>
                <li>กรอกข้อมูลให้ครบถ้วนและถูกต้อง</li>
                <li>เลือกบทบาทที่เหมาะสมกับหน้าที่ของท่าน</li>
                <li>รอการอนุมัติจากผู้ดูแลระบบ (1-3 วันทำการ)</li>
              </ul>

              <h6>ปัญหาที่พบบ่อย</h6>
              <ul>
                <li>
                  <strong>เข้าสู่ระบบไม่ได้:</strong>
                  ตรวจสอบชื่อผู้ใช้และรหัสผ่าน หรือสถานะการอนุมัติ
                </li>
                <li>
                  <strong>ลืมรหัสผ่าน:</strong> ติดต่อผู้ดูแลระบบเพื่อขอรีเซ็ต
                </li>
                <li>
                  <strong>บัญชีถูกระงับ:</strong> ติดต่อผู้ดูแลระบบเพื่อสอบถาม
                </li>
              </ul>
            </div>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              @click="showHelp = false"
            >
              ปิด
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Backdrop for modals -->
    <div
      v-if="showForgotPassword || showHelp"
      class="modal-backdrop fade show"
    ></div>

    <!-- Toast Container -->
    <div
      class="toast-container position-fixed top-0 end-0 p-3"
      style="z-index: 9999"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast show"
        role="alert"
        :class="toast.class"
      >
        <div class="toast-header">
          <i :class="toast.icon + ' me-2'"></i>
          <strong class="me-auto">{{ toast.title }}</strong>
          <button
            type="button"
            class="btn-close"
            @click="removeToast(toast.id)"
          ></button>
        </div>
        <div class="toast-body">
          {{ toast.message }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import axios from "axios";

export default {
  name: "LoginPage",
  setup() {
    const router = useRouter();
    const route = useRoute();
    const authStore = useAuthStore();

    const form = reactive({
      username: "",
      password: "",
      rememberMe: false,
    });

    const errors = reactive({
      username: "",
      password: "",
    });

    const showPassword = ref(false);
    const loginError = ref("");
    const loginSuccess = ref("");
    const showRegistrationSuccess = ref(false);
    const showForgotPassword = ref(false);
    const showHelp = ref(false);

    // Toast notifications
    const toasts = ref([]);
    let toastId = 0;

    // System settings
    const systemSettings = reactive({
      enable_dga_verification: false,
      allow_registration: true,
      require_identity_verification: false,
      system_name: "ระบบสำรวจข้อมูลวัด",
      maintenance_mode: false,
    });

    // System status based on settings
    const systemStatus = computed(() => {
      if (systemSettings.maintenance_mode) {
        return {
          class: "maintenance",
          text: "ระบบปิดปรับปรุงชั่วคราว",
        };
      }
      return {
        class: "online",
        text: "ระบบพร้อมใช้งาน",
      };
    });

    const fetchSystemSettings = async () => {
      try {
        const response = await axios.get("/api/settings/public");

        // get system settings all
        if (response.data.success) {
          const settings = response.data.data.settings;

          // Update system settings
          if (settings.enable_dga_verification) {
            systemSettings.enable_dga_verification =
              settings.enable_dga_verification.value;
          }
          if (settings.allow_registration) {
            systemSettings.allow_registration =
              settings.allow_registration.value;
          }
          if (settings.require_identity_verification) {
            systemSettings.require_identity_verification =
              settings.require_identity_verification.value;
          }
          if (settings.system_name) {
            systemSettings.system_name = settings.system_name.value;
          }
          if (settings.maintenance_mode) {
            systemSettings.maintenance_mode = settings.maintenance_mode.value;
          }
          if (settings.system_name_public) {
            systemSettings.system_name_public =
              settings.system_name_public.value;
          }

          console.log("✅ System settings loaded:", systemSettings);
        }
      } catch (error) {
        console.warn("Failed to load system settings:", error);
        // Use default values if settings can't be loaded
      }
    };

    // Toast functions
    const showToast = (type, title, message, duration = 5000) => {
      const id = ++toastId;
      const toast = {
        id,
        type,
        title,
        message,
        class: getToastClass(type),
        icon: getToastIcon(type),
      };

      toasts.value.push(toast);

      // Auto remove after duration
      setTimeout(() => {
        removeToast(id);
      }, duration);
    };

    const removeToast = (id) => {
      const index = toasts.value.findIndex((toast) => toast.id === id);
      if (index > -1) {
        toasts.value.splice(index, 1);
      }
    };

    const getToastClass = (type) => {
      switch (type) {
        case "success":
          return "toast-success";
        case "error":
          return "toast-error";
        case "warning":
          return "toast-warning";
        case "info":
          return "toast-info";
        default:
          return "toast-info";
      }
    };

    const getToastIcon = (type) => {
      switch (type) {
        case "success":
          return "bi bi-check-circle-fill text-success";
        case "error":
          return "bi bi-exclamation-triangle-fill text-danger";
        case "warning":
          return "bi bi-exclamation-triangle-fill text-warning";
        case "info":
          return "bi bi-info-circle-fill text-info";
        default:
          return "bi bi-info-circle-fill text-info";
      }
    };

    onMounted(async () => {
      // Load system settings
      await fetchSystemSettings();

      // Show maintenance mode toast if enabled
      if (systemSettings.maintenance_mode) {
        showToast(
          "warning",
          "ระบบปิดปรับปรุงชั่วคราว",
          "ขณะนี้ระบบอยู่ระหว่างการบำรุงรักษา กรุณาติดต่อผู้ดูแลระบบสำหรับข้อมูลเพิ่มเติม",
          8000
        );
      }

      // Check if user just registered
      if (route.query.registered === "true") {
        showToast(
          "success",
          "ลงทะเบียนสำเร็จ!",
          "กรุณารอการอนุมัติจากผู้ดูแลระบบ หลังจากได้รับการอนุมัติแล้วจึงจะสามารถเข้าสู่ระบบได้",
          10000
        );
      }
    });

    const validateForm = () => {
      // Reset errors
      errors.username = "";
      errors.password = "";

      let isValid = true;

      if (!form.username.trim()) {
        errors.username = "กรุณากรอกชื่อผู้ใช้";
        isValid = false;
      }

      if (!form.password.trim()) {
        errors.password = "กรุณากรอกรหัสผ่าน";
        isValid = false;
      } else if (form.password.length < 6) {
        errors.password = "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร";
        isValid = false;
      }

      return isValid;
    };

    const handleLogin = async () => {
      // Check maintenance mode
      if (systemSettings.maintenance_mode) {
        showToast(
          "warning",
          "ระบบปิดปรับปรุง",
          "ระบบปิดปรับปรุงชั่วคราว ไม่สามารถเข้าสู่ระบบได้ในขณะนี้"
        );
        return;
      }

      if (!validateForm()) {
        return;
      }

      try {
        const result = await authStore.login({
          username: form.username.trim(),
          password: form.password,
          rememberMe: form.rememberMe,
        });

        if (result.success) {
          showToast("success", "เข้าสู่ระบบสำเร็จ", result.message);

          // Redirect after short delay
          setTimeout(() => {
            router.push("/");
          }, 1000);
        } else {
          showToast("error", "เข้าสู่ระบบไม่สำเร็จ", result.message);
        }
      } catch (error) {
        showToast("error", "เกิดข้อผิดพลาด", "เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
        console.error("Login error:", error);
      }
    };

    const togglePassword = () => {
      showPassword.value = !showPassword.value;
    };

    return {
      authStore,
      form,
      errors,
      showPassword,
      loginError,
      loginSuccess,
      showRegistrationSuccess,
      showForgotPassword,
      showHelp,
      systemStatus,
      systemSettings,
      toasts,
      handleLogin,
      togglePassword,
      showToast,
      removeToast,
    };
  },
};
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
}

.login-card {
  width: 100%;
  max-width: 450px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  animation: slideInUp 0.6s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header {
  background: linear-gradient(135deg, #2c5aa0 0%, #3498db 100%);
  color: white;
  padding: 3rem 2rem;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.login-header::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.05"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.05"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.03"/><circle cx="10" cy="50" r="0.5" fill="white" opacity="0.03"/><circle cx="90" cy="30" r="0.5" fill="white" opacity="0.03"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  pointer-events: none;
}

.header-logo {
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 1;
}

.logo-container {
  position: relative;
  display: inline-block;
  margin-bottom: 1rem;
}

.logo-icon {
  font-size: 4.5rem;
  color: white;
  opacity: 0.95;
  position: relative;
  z-index: 1;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.logo-badge {
  position: absolute;
  bottom: -8px;
  right: -8px;
  background: #28a745;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  color: white;
  border: 4px solid white;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.3);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.system-info {
  margin-top: 0.5rem;
  position: relative;
  z-index: 1;
}

.system-info small {
  background: rgba(255, 255, 255, 0.1);
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  backdrop-filter: blur(10px);
}

.header-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.9;
}

.login-title {
  margin: 0 0 0.5rem 0;
  font-weight: 600;
  font-size: 2rem;
  position: relative;
  z-index: 1;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.login-subtitle {
  margin: 0;
  opacity: 0.95;
  font-size: 1.1rem;
  position: relative;
  z-index: 1;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.login-form {
  padding: 2rem;
}

.input-group-text {
  background-color: #f8f9fa;
  border-right: none;
  color: #6c757d;
}

.form-control {
  border-left: none;
  transition: all 0.3s ease;
}

.form-control:focus {
  border-left: none;
  box-shadow: 0 0 0 0.2rem rgba(44, 90, 160, 0.25);
}

.input-group:focus-within .input-group-text {
  border-color: #2c5aa0;
  background-color: rgba(44, 90, 160, 0.1);
  color: #2c5aa0;
}

.btn-primary {
  background: linear-gradient(135deg, #2c5aa0 0%, #3498db 100%);
  border: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(44, 90, 160, 0.4);
}

.btn-outline-primary {
  border-color: #2c5aa0;
  color: #2c5aa0;
  transition: all 0.3s ease;
}

.btn-outline-primary:hover {
  background-color: #2c5aa0;
  border-color: #2c5aa0;
  transform: translateY(-1px);
}

.btn-outline-secondary {
  transition: all 0.3s ease;
}

.btn-outline-secondary:hover {
  transform: translateY(-1px);
}

.alert {
  border: none;
  border-radius: 10px;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.alert-success {
  background-color: #d1e7dd;
  color: #0a3622;
}

.alert-danger {
  background-color: #f8d7da;
  color: #58151c;
}

.form-check-input:checked {
  background-color: #2c5aa0;
  border-color: #2c5aa0;
}

.login-links {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e9ecef;
}

.login-links a {
  color: #6c757d;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.login-links a:hover {
  color: #2c5aa0;
}

.system-status {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  background: rgba(255, 255, 255, 0.9);
  padding: 0.5rem 1rem;
  border-radius: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.status-item {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 0.5rem;
}

.status-indicator.online {
  background-color: #28a745;
  animation: pulse 2s infinite;
}

.status-indicator.maintenance {
  background-color: #ffc107;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%,
  50% {
    opacity: 1;
  }
  51%,
  100% {
    opacity: 0.3;
  }
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}

.status-text {
  color: #6c757d;
  font-weight: 500;
}

/* Toast Notifications */
.toast-container {
  z-index: 9999;
}

.toast {
  min-width: 350px;
  margin-bottom: 0.5rem;
  border: none;
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  animation: slideInRight 0.3s ease-out;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.toast-success {
  background-color: #d1e7dd;
  border-left: 4px solid #198754;
}

.toast-success .toast-header {
  background-color: #d1e7dd;
  border-bottom: 1px solid #badbcc;
}

.toast-error {
  background-color: #f8d7da;
  border-left: 4px solid #dc3545;
}

.toast-error .toast-header {
  background-color: #f8d7da;
  border-bottom: 1px solid #f5c2c7;
}

.toast-warning {
  background-color: #fff3cd;
  border-left: 4px solid #ffc107;
}

.toast-warning .toast-header {
  background-color: #fff3cd;
  border-bottom: 1px solid #ffecb5;
}

.toast-info {
  background-color: #cff4fc;
  border-left: 4px solid #0dcaf0;
}

.toast-info .toast-header {
  background-color: #cff4fc;
  border-bottom: 1px solid #b3f0ff;
}

.toast-header {
  padding: 0.75rem 1rem;
  font-weight: 600;
}

.toast-body {
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  line-height: 1.4;
}

.modal-content {
  border: none;
  border-radius: 15px;
}

.modal-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  border-radius: 15px 15px 0 0;
}

.contact-info {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
}

.contact-info h6 {
  color: #2c5aa0;
  margin-bottom: 0.5rem;
}

.help-content h6 {
  color: #2c5aa0;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.help-content h6:first-child {
  margin-top: 0;
}

.help-content ul {
  margin-bottom: 1rem;
}

.help-content li {
  margin-bottom: 0.25rem;
}

/* Mobile optimizations */
@media (max-width: 575.98px) {
  .login-container {
    padding: 1rem;
  }

  .login-header {
    padding: 2rem 1rem;
  }

  .header-icon {
    font-size: 3rem;
  }

  .login-title {
    font-size: 1.5rem;
  }

  .login-subtitle {
    font-size: 1rem;
  }

  .login-form {
    padding: 1.5rem;
  }

  .btn {
    font-size: 1.1rem;
    padding: 0.75rem;
  }

  .system-status {
    bottom: 0.5rem;
    right: 0.5rem;
    padding: 0.4rem 0.8rem;
  }

  /* Mobile toast adjustments */
  .toast-container {
    left: 0.5rem;
    right: 0.5rem;
    top: 1rem !important;
  }

  .toast {
    min-width: auto;
    width: 100%;
  }
}

/* Animation for form validation */
.is-invalid {
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
  }
}

/* Loading spinner animation */
.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}
</style>
