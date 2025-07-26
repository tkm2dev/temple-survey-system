<template>
  <div class="container-fluid">
    <div class="row justify-content-center">
      <div class="col-md-6 col-lg-5">
        <div class="card shadow-sm">
          <div class="card-header bg-primary text-white">
            <h5 class="mb-0">
              <i class="bi bi-key me-2"></i>
              เปลี่ยนรหัสผ่าน
            </h5>
          </div>
          <div class="card-body">
            <form @submit.prevent="handleChangePassword">
              <!-- Current Password -->
              <div class="mb-3">
                <label for="currentPassword" class="form-label">
                  รหัสผ่านปัจจุบัน
                  <span class="text-danger">*</span>
                </label>
                <div class="input-group">
                  <span class="input-group-text">
                    <i class="bi bi-lock"></i>
                  </span>
                  <input
                    id="currentPassword"
                    v-model="form.currentPassword"
                    :type="showCurrentPassword ? 'text' : 'password'"
                    class="form-control"
                    :class="{ 'is-invalid': errors.currentPassword }"
                    placeholder="กรอกรหัสผ่านปัจจุบัน"
                    required
                  />
                  <button
                    type="button"
                    class="btn btn-outline-secondary"
                    @click="showCurrentPassword = !showCurrentPassword"
                  >
                    <i :class="showCurrentPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                  </button>
                </div>
                <div v-if="errors.currentPassword" class="invalid-feedback d-block">
                  {{ errors.currentPassword }}
                </div>
              </div>

              <!-- New Password -->
              <div class="mb-3">
                <label for="newPassword" class="form-label">
                  รหัสผ่านใหม่
                  <span class="text-danger">*</span>
                </label>
                <div class="input-group">
                  <span class="input-group-text">
                    <i class="bi bi-key"></i>
                  </span>
                  <input
                    id="newPassword"
                    v-model="form.newPassword"
                    :type="showNewPassword ? 'text' : 'password'"
                    class="form-control"
                    :class="{ 'is-invalid': errors.newPassword }"
                    placeholder="กรอกรหัสผ่านใหม่"
                    required
                  />
                  <button
                    type="button"
                    class="btn btn-outline-secondary"
                    @click="showNewPassword = !showNewPassword"
                  >
                    <i :class="showNewPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                  </button>
                </div>
                <div v-if="errors.newPassword" class="invalid-feedback d-block">
                  {{ errors.newPassword }}
                </div>
                <div class="form-text">
                  รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร
                </div>
              </div>

              <!-- Confirm New Password -->
              <div class="mb-4">
                <label for="confirmPassword" class="form-label">
                  ยืนยันรหัสผ่านใหม่
                  <span class="text-danger">*</span>
                </label>
                <div class="input-group">
                  <span class="input-group-text">
                    <i class="bi bi-key-fill"></i>
                  </span>
                  <input
                    id="confirmPassword"
                    v-model="form.confirmPassword"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    class="form-control"
                    :class="{ 'is-invalid': errors.confirmPassword }"
                    placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                    required
                  />
                  <button
                    type="button"
                    class="btn btn-outline-secondary"
                    @click="showConfirmPassword = !showConfirmPassword"
                  >
                    <i :class="showConfirmPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                  </button>
                </div>
                <div v-if="errors.confirmPassword" class="invalid-feedback d-block">
                  {{ errors.confirmPassword }}
                </div>
              </div>

              <!-- Error Alert -->
              <div v-if="errorMessage" class="alert alert-danger" role="alert">
                <i class="bi bi-exclamation-triangle me-2"></i>
                {{ errorMessage }}
              </div>

              <!-- Success Alert -->
              <div v-if="successMessage" class="alert alert-success" role="alert">
                <i class="bi bi-check-circle me-2"></i>
                {{ successMessage }}
              </div>

              <!-- Form Actions -->
              <div class="d-flex justify-content-between">
                <button
                  type="button"
                  class="btn btn-secondary"
                  @click="$router.go(-1)"
                >
                  <i class="bi bi-arrow-left me-2"></i>
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  class="btn btn-primary"
                  :disabled="loading"
                >
                  <span v-if="loading">
                    <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                    กำลังเปลี่ยน...
                  </span>
                  <span v-else>
                    <i class="bi bi-check-lg me-2"></i>
                    เปลี่ยนรหัสผ่าน
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Password Tips -->
        <div class="card mt-3">
          <div class="card-body">
            <h6 class="card-title">
              <i class="bi bi-lightbulb text-warning me-2"></i>
              คำแนะนำในการสร้างรหัสผ่าน
            </h6>
            <ul class="mb-0 small text-muted">
              <li>ใช้รหัสผ่านที่มีความยาวอย่างน้อย 8 ตัวอักษร</li>
              <li>ผสมผสานตัวอักษรใหญ่ เล็ก ตัวเลข และสัญลักษณ์</li>
              <li>หลีกเลี่ยงการใช้ข้อมูลส่วนตัว เช่น ชื่อ วันเกิด</li>
              <li>อย่าใช้รหัสผ่านเดิมที่เคยใช้กับบัญชีอื่น</li>
              <li>เปลี่ยนรหัสผ่านเป็นประจำทุก 3-6 เดือน</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import authService from "@/services/authService";

export default {
  name: "ChangePasswordPage",
  setup() {
    const router = useRouter();

    const form = reactive({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    const errors = reactive({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    const showCurrentPassword = ref(false);
    const showNewPassword = ref(false);
    const showConfirmPassword = ref(false);
    const loading = ref(false);
    const errorMessage = ref("");
    const successMessage = ref("");

    const validateForm = () => {
      // Reset errors
      Object.keys(errors).forEach((key) => (errors[key] = ""));

      let isValid = true;

      // Current password validation
      if (!form.currentPassword.trim()) {
        errors.currentPassword = "กรุณากรอกรหัสผ่านปัจจุบัน";
        isValid = false;
      }

      // New password validation
      if (!form.newPassword.trim()) {
        errors.newPassword = "กรุณากรอกรหัสผ่านใหม่";
        isValid = false;
      } else if (form.newPassword.length < 6) {
        errors.newPassword = "รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร";
        isValid = false;
      }

      // Confirm password validation
      if (!form.confirmPassword.trim()) {
        errors.confirmPassword = "กรุณายืนยันรหัสผ่านใหม่";
        isValid = false;
      } else if (form.newPassword !== form.confirmPassword) {
        errors.confirmPassword = "รหัสผ่านใหม่และการยืนยันไม่ตรงกัน";
        isValid = false;
      }

      // Check if new password is same as current
      if (form.currentPassword === form.newPassword) {
        errors.newPassword = "รหัสผ่านใหม่ต้องแตกต่างจากรหัสผ่านปัจจุบัน";
        isValid = false;
      }

      return isValid;
    };

    const handleChangePassword = async () => {
      errorMessage.value = "";
      successMessage.value = "";

      if (!validateForm()) {
        return;
      }

      loading.value = true;

      try {
        const response = await authService.changePassword({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        });

        if (response.success) {
          successMessage.value = response.message;
          
          // Clear form
          Object.keys(form).forEach((key) => (form[key] = ""));
          
          // Redirect after delay
          setTimeout(() => {
            router.push("/profile");
          }, 2000);
        } else {
          errorMessage.value = response.message;
        }
      } catch (error) {
        const message = error.response?.data?.message || "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน";
        errorMessage.value = message;
        console.error("Change password error:", error);
      } finally {
        loading.value = false;
      }
    };

    return {
      form,
      errors,
      showCurrentPassword,
      showNewPassword,
      showConfirmPassword,
      loading,
      errorMessage,
      successMessage,
      handleChangePassword,
    };
  },
};
</script>

<style scoped>
.card {
  border: none;
  border-radius: 12px;
}

.card-header {
  border-radius: 12px 12px 0 0 !important;
  border-bottom: none;
  padding: 1.25rem;
}

.input-group-text {
  background-color: var(--bg-primary);
  border-right: none;
}

.form-control {
  border-left: none;
}

.form-control:focus {
  border-left: none;
  box-shadow: none;
}

.input-group:focus-within .input-group-text {
  border-color: var(--primary-color);
  background-color: rgba(44, 90, 160, 0.1);
}

.alert {
  border-radius: 8px;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.btn {
  border-radius: 8px;
  font-weight: 500;
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary-color), #2c5aa0);
  border: none;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #2c5aa0, var(--primary-color));
  transform: translateY(-1px);
}

/* Mobile optimizations */
@media (max-width: 575.98px) {
  .container-fluid {
    padding: 1rem;
  }
  
  .card {
    margin: 0;
  }
}
</style>
