<template>
  <div class="login-form">
    <form @submit.prevent="handleLogin">
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
            <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
          </button>
          <div v-if="errors.password" class="invalid-feedback">
            {{ errors.password }}
          </div>
        </div>
      </div>

      <!-- Error Alert -->
      <div v-if="loginError" class="alert alert-danger" role="alert">
        <i class="bi bi-exclamation-triangle me-2"></i>
        {{ loginError }}
      </div>

      <!-- Success Alert -->
      <div v-if="loginSuccess" class="alert alert-success" role="alert">
        <i class="bi bi-check-circle me-2"></i>
        {{ loginSuccess }}
      </div>

      <button
        type="submit"
        class="btn btn-primary w-100 py-2"
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
    </form>

    <!-- Demo Accounts Info -->
    <div class="mt-4">
      <div class="card">
        <div class="card-header">
          <h6 class="mb-0">
            <i class="bi bi-info-circle me-2"></i>
            บัญชีสำหรับทดสอบ
          </h6>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-12 col-md-4 mb-2">
              <div
                class="demo-account"
                @click="fillCredentials('admin', 'admin123')"
              >
                <strong>Admin</strong><br />
                <small class="text-muted">admin / admin123</small>
              </div>
            </div>
            <div class="col-12 col-md-4 mb-2">
              <div
                class="demo-account"
                @click="fillCredentials('reviewer', 'reviewer123')"
              >
                <strong>Reviewer</strong><br />
                <small class="text-muted">reviewer / reviewer123</small>
              </div>
            </div>
            <div class="col-12 col-md-4 mb-2">
              <div
                class="demo-account"
                @click="fillCredentials('surveyor', 'surveyor123')"
              >
                <strong>Surveyor</strong><br />
                <small class="text-muted">surveyor / surveyor123</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

export default {
  name: "LoginPage",
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();

    const form = reactive({
      username: "",
      password: "",
    });

    const errors = reactive({
      username: "",
      password: "",
    });

    const showPassword = ref(false);
    const loginError = ref("");
    const loginSuccess = ref("");

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
      loginError.value = "";
      loginSuccess.value = "";

      if (!validateForm()) {
        return;
      }

      try {
        const result = await authStore.login({
          username: form.username.trim(),
          password: form.password,
        });

        if (result.success) {
          loginSuccess.value = result.message;

          // Redirect after short delay
          setTimeout(() => {
            router.push("/");
          }, 1000);
        } else {
          loginError.value = result.message;
        }
      } catch (error) {
        loginError.value = "เกิดข้อผิดพลาดในการเข้าสู่ระบบ";
        console.error("Login error:", error);
      }
    };

    const togglePassword = () => {
      showPassword.value = !showPassword.value;
    };

    const fillCredentials = (username, password) => {
      form.username = username;
      form.password = password;
      // Clear any existing errors
      errors.username = "";
      errors.password = "";
      loginError.value = "";
    };

    return {
      authStore,
      form,
      errors,
      showPassword,
      loginError,
      loginSuccess,
      handleLogin,
      togglePassword,
      fillCredentials,
    };
  },
};
</script>

<style scoped>
.login-form {
  animation: fadeInUp 0.5s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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

.demo-account {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  text-align: center;
}

.demo-account:hover {
  border-color: var(--primary-color);
  background-color: rgba(44, 90, 160, 0.05);
  transform: translateY(-2px);
}

.alert {
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

/* Mobile optimizations */
@media (max-width: 575.98px) {
  .demo-account {
    margin-bottom: 0.5rem;
  }

  .btn {
    font-size: 1.1rem;
    padding: 0.75rem;
  }
}
</style>
