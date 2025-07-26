<template>
  <div class="profile-page">
    <!-- Header -->
    <div class="profile-header mb-4">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h2 class="mb-1">
            <i class="bi bi-person-circle me-2 text-primary"></i>
            ข้อมูลส่วนตัว
          </h2>
          <p class="text-muted mb-0">จัดการข้อมูลส่วนตัวและการตั้งค่าบัญชี</p>
        </div>
        <button v-if="!isEditing" @click="startEditing" class="btn btn-primary">
          <i class="bi bi-pencil me-2"></i>
          แก้ไขข้อมูล
        </button>
      </div>
    </div>

    <!-- Profile Content -->
    <div class="row">
      <!-- Profile Info -->
      <div class="col-lg-8">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">
              <i class="bi bi-info-circle me-2"></i>
              ข้อมูลพื้นฐาน
            </h5>
          </div>
          <div class="card-body">
            <form v-if="isEditing" @submit.prevent="updateProfile">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">ชื่อ *</label>
                  <input
                    v-model="editForm.first_name"
                    type="text"
                    class="form-control"
                    :class="{ 'is-invalid': errors.first_name }"
                    required
                  />
                  <div v-if="errors.first_name" class="invalid-feedback">
                    {{ errors.first_name }}
                  </div>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">นามสกุล *</label>
                  <input
                    v-model="editForm.last_name"
                    type="text"
                    class="form-control"
                    :class="{ 'is-invalid': errors.last_name }"
                    required
                  />
                  <div v-if="errors.last_name" class="invalid-feedback">
                    {{ errors.last_name }}
                  </div>
                </div>
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Username *</label>
                  <input
                    v-model="editForm.username"
                    type="text"
                    class="form-control"
                    :class="{ 'is-invalid': errors.username }"
                    required
                  />
                  <div v-if="errors.username" class="invalid-feedback">
                    {{ errors.username }}
                  </div>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">อีเมล *</label>
                  <input
                    v-model="editForm.email"
                    type="email"
                    class="form-control"
                    :class="{ 'is-invalid': errors.email }"
                    required
                  />
                  <div v-if="errors.email" class="invalid-feedback">
                    {{ errors.email }}
                  </div>
                </div>
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">เบอร์โทรศัพท์</label>
                  <input
                    v-model="editForm.phone"
                    type="tel"
                    class="form-control"
                    :class="{ 'is-invalid': errors.phone }"
                  />
                  <div v-if="errors.phone" class="invalid-feedback">
                    {{ errors.phone }}
                  </div>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">หน่วยงาน</label>
                  <input
                    v-model="editForm.organization"
                    type="text"
                    class="form-control"
                    :class="{ 'is-invalid': errors.organization }"
                  />
                  <div v-if="errors.organization" class="invalid-feedback">
                    {{ errors.organization }}
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">ตำแหน่ง</label>
                <input
                  v-model="editForm.position"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': errors.position }"
                />
                <div v-if="errors.position" class="invalid-feedback">
                  {{ errors.position }}
                </div>
              </div>

              <div class="d-flex gap-2">
                <button
                  type="submit"
                  class="btn btn-primary"
                  :disabled="updating"
                >
                  <span
                    v-if="updating"
                    class="spinner-border spinner-border-sm me-2"
                  ></span>
                  บันทึกการเปลี่ยนแปลง
                </button>
                <button
                  type="button"
                  @click="cancelEditing"
                  class="btn btn-secondary"
                  :disabled="updating"
                >
                  ยกเลิก
                </button>
              </div>
            </form>

            <!-- Display Mode -->
            <div v-else>
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label text-muted">ชื่อ</label>
                  <p class="fw-medium">{{ user.first_name || "-" }}</p>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label text-muted">นามสกุล</label>
                  <p class="fw-medium">{{ user.last_name || "-" }}</p>
                </div>
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label text-muted">Username</label>
                  <p class="fw-medium">{{ user.username || "-" }}</p>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label text-muted">อีเมล</label>
                  <p class="fw-medium">{{ user.email || "-" }}</p>
                </div>
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label text-muted">เบอร์โทรศัพท์</label>
                  <p class="fw-medium">{{ user.phone || "-" }}</p>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label text-muted">หน่วยงาน</label>
                  <p class="fw-medium">{{ user.organization || "-" }}</p>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label text-muted">ตำแหน่ง</label>
                <p class="fw-medium">{{ user.position || "-" }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Password Change -->
        <div class="card mt-4">
          <div class="card-header">
            <h5 class="mb-0">
              <i class="bi bi-shield-lock me-2"></i>
              เปลี่ยนรหัสผ่าน
            </h5>
          </div>
          <div class="card-body">
            <form @submit.prevent="changePassword">
              <div class="mb-3">
                <label class="form-label">รหัสผ่านปัจจุบัน *</label>
                <div class="input-group">
                  <input
                    v-model="passwordForm.current_password"
                    :type="showCurrentPassword ? 'text' : 'password'"
                    class="form-control"
                    :class="{ 'is-invalid': passwordErrors.current_password }"
                    required
                  />
                  <button
                    type="button"
                    class="btn btn-outline-secondary"
                    @click="showCurrentPassword = !showCurrentPassword"
                  >
                    <i
                      :class="
                        showCurrentPassword ? 'bi bi-eye-slash' : 'bi bi-eye'
                      "
                    ></i>
                  </button>
                </div>
                <div
                  v-if="passwordErrors.current_password"
                  class="invalid-feedback d-block"
                >
                  {{ passwordErrors.current_password }}
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">รหัสผ่านใหม่ *</label>
                <div class="input-group">
                  <input
                    v-model="passwordForm.new_password"
                    :type="showNewPassword ? 'text' : 'password'"
                    class="form-control"
                    :class="{ 'is-invalid': passwordErrors.new_password }"
                    required
                    minlength="6"
                  />
                  <button
                    type="button"
                    class="btn btn-outline-secondary"
                    @click="showNewPassword = !showNewPassword"
                  >
                    <i
                      :class="showNewPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"
                    ></i>
                  </button>
                </div>
                <div class="form-text">รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร</div>
                <div
                  v-if="passwordErrors.new_password"
                  class="invalid-feedback d-block"
                >
                  {{ passwordErrors.new_password }}
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">ยืนยันรหัสผ่านใหม่ *</label>
                <div class="input-group">
                  <input
                    v-model="passwordForm.confirm_password"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    class="form-control"
                    :class="{ 'is-invalid': passwordErrors.confirm_password }"
                    required
                  />
                  <button
                    type="button"
                    class="btn btn-outline-secondary"
                    @click="showConfirmPassword = !showConfirmPassword"
                  >
                    <i
                      :class="
                        showConfirmPassword ? 'bi bi-eye-slash' : 'bi bi-eye'
                      "
                    ></i>
                  </button>
                </div>
                <div
                  v-if="passwordErrors.confirm_password"
                  class="invalid-feedback d-block"
                >
                  {{ passwordErrors.confirm_password }}
                </div>
              </div>

              <button
                type="submit"
                class="btn btn-warning"
                :disabled="changingPassword"
              >
                <span
                  v-if="changingPassword"
                  class="spinner-border spinner-border-sm me-2"
                ></span>
                เปลี่ยนรหัสผ่าน
              </button>
            </form>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="col-lg-4">
        <!-- Profile Summary -->
        <div class="card">
          <div class="card-body text-center">
            <div class="profile-avatar mb-3">
              <div class="avatar-large">
                {{ getInitials(user.first_name, user.last_name) }}
              </div>
            </div>
            <h5 class="mb-1">{{ fullName }}</h5>
            <p class="text-muted mb-2">{{ user.username }}</p>
            <span :class="getRoleBadgeClass(user.role)" class="badge">
              <i :class="getRoleIcon(user.role)" class="me-1"></i>
              {{ getRoleText(user.role) }}
            </span>
          </div>
        </div>

        <!-- Account Info -->
        <div class="card mt-4">
          <div class="card-header">
            <h6 class="mb-0">ข้อมูลบัญชี</h6>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <label class="form-label text-muted small"
                >วันที่สร้างบัญชี</label
              >
              <p class="mb-0">{{ formatDate(user.created_at) }}</p>
            </div>
            <div class="mb-3">
              <label class="form-label text-muted small"
                >เข้าสู่ระบบล่าสุด</label
              >
              <p class="mb-0">{{ formatDate(user.last_login_at) }}</p>
            </div>
            <div class="mb-3">
              <label class="form-label text-muted small">สถานะบัญชี</label>
              <p class="mb-0">
                <span
                  :class="
                    user.is_active ? 'badge bg-success' : 'badge bg-danger'
                  "
                >
                  {{ user.is_active ? "ใช้งาน" : "ปิดใช้งาน" }}
                </span>
              </p>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="card mt-4">
          <div class="card-header">
            <h6 class="mb-0">การดำเนินการด่วน</h6>
          </div>
          <div class="card-body">
            <div class="d-grid gap-2">
              <router-link
                to="/settings"
                class="btn btn-outline-primary btn-sm"
              >
                <i class="bi bi-gear me-2"></i>
                การตั้งค่า
              </router-link>
              <router-link
                to="/notifications"
                class="btn btn-outline-info btn-sm"
              >
                <i class="bi bi-bell me-2"></i>
                การแจ้งเตือน
              </router-link>
              <button @click="logout" class="btn btn-outline-danger btn-sm">
                <i class="bi bi-box-arrow-right me-2"></i>
                ออกจากระบบ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import userService from "@/services/userService";
import moment from "moment";

const router = useRouter();
const authStore = useAuthStore();

// State
const isEditing = ref(false);
const updating = ref(false);
const changingPassword = ref(false);
const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

// User data
const user = computed(() => authStore.user || {});
const fullName = computed(() => {
  if (!user.value.first_name && !user.value.last_name)
    return user.value.username;
  return `${user.value.first_name || ""} ${user.value.last_name || ""}`.trim();
});

// Forms
const editForm = reactive({
  first_name: "",
  last_name: "",
  username: "",
  email: "",
  phone: "",
  organization: "",
  position: "",
});

const passwordForm = reactive({
  current_password: "",
  new_password: "",
  confirm_password: "",
});

// Errors
const errors = reactive({});
const passwordErrors = reactive({});

// Methods
const startEditing = () => {
  isEditing.value = true;
  // Populate form with current user data
  Object.keys(editForm).forEach((key) => {
    editForm[key] = user.value[key] || "";
  });
  // Clear errors
  Object.keys(errors).forEach((key) => delete errors[key]);
};

const cancelEditing = () => {
  isEditing.value = false;
  // Clear form
  Object.keys(editForm).forEach((key) => {
    editForm[key] = "";
  });
  // Clear errors
  Object.keys(errors).forEach((key) => delete errors[key]);
};

const updateProfile = async () => {
  try {
    updating.value = true;
    // Clear previous errors
    Object.keys(errors).forEach((key) => delete errors[key]);

    const response = await userService.updateProfile(editForm);

    if (response.success) {
      // Update auth store
      authStore.updateProfile(response.data);
      isEditing.value = false;
      alert("อัปเดตข้อมูลส่วนตัวเรียบร้อยแล้ว");
    } else {
      if (response.errors) {
        Object.assign(errors, response.errors);
      } else {
        alert(response.message || "เกิดข้อผิดพลาดในการอัปเดตข้อมูล");
      }
    }
  } catch (error) {
    console.error("Update profile error:", error);
    alert("เกิดข้อผิดพลาดในการอัปเดตข้อมูล");
  } finally {
    updating.value = false;
  }
};

const changePassword = async () => {
  try {
    changingPassword.value = true;
    // Clear previous errors
    Object.keys(passwordErrors).forEach((key) => delete passwordErrors[key]);

    // Validate passwords match
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      passwordErrors.confirm_password = "รหัสผ่านไม่ตรงกัน";
      return;
    }

    const response = await userService.changePassword({
      current_password: passwordForm.current_password,
      new_password: passwordForm.new_password,
    });

    if (response.success) {
      // Clear form
      Object.keys(passwordForm).forEach((key) => {
        passwordForm[key] = "";
      });
      alert("เปลี่ยนรหัสผ่านเรียบร้อยแล้ว");
    } else {
      if (response.errors) {
        Object.assign(passwordErrors, response.errors);
      } else {
        alert(response.message || "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน");
      }
    }
  } catch (error) {
    console.error("Change password error:", error);
    alert("เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน");
  } finally {
    changingPassword.value = false;
  }
};

const logout = async () => {
  if (confirm("คุณต้องการออกจากระบบหรือไม่?")) {
    authStore.logout();
    router.push("/auth/login");
  }
};

// Utility functions
const getInitials = (firstName, lastName) => {
  const first = firstName ? firstName.charAt(0).toUpperCase() : "";
  const last = lastName ? lastName.charAt(0).toUpperCase() : "";
  return first + last || user.value.username?.charAt(0).toUpperCase() || "?";
};

const getRoleBadgeClass = (role) => {
  const classes = {
    Admin: "bg-danger",
    Reviewer: "bg-warning text-dark",
    Surveyor: "bg-primary",
  };
  return classes[role] || "bg-secondary";
};

const getRoleIcon = (role) => {
  const icons = {
    Admin: "bi bi-shield-fill",
    Reviewer: "bi bi-clipboard-check",
    Surveyor: "bi bi-person-check",
  };
  return icons[role] || "bi bi-person";
};

const getRoleText = (role) => {
  const texts = {
    Admin: "ผู้ดูแลระบบ",
    Reviewer: "ผู้ตรวจสอบ",
    Surveyor: "ผู้สำรวจ",
  };
  return texts[role] || role;
};

const formatDate = (dateString) => {
  if (!dateString) return "-";
  return moment(dateString).format("DD/MM/YYYY HH:mm");
};

onMounted(() => {
  // Any initialization if needed
});
</script>

<style scoped>
.profile-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.profile-header {
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  margin-bottom: 1.5rem;
}

.card {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  border: none;
}

.card-header {
  background-color: rgba(var(--bs-primary-rgb), 0.1);
  border-bottom: 1px solid rgba(var(--bs-primary-rgb), 0.2);
  font-weight: 600;
}

.profile-avatar {
  display: flex;
  justify-content: center;
}

.avatar-large {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--bs-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.5rem;
  box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.1);
}

.form-label.text-muted {
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.fw-medium {
  font-weight: 500;
}

.input-group .btn {
  border-left: none;
}

.input-group .form-control:focus + .btn {
  border-color: var(--bs-primary);
}

.badge {
  font-size: 0.75em;
  padding: 0.35em 0.65em;
}

/* Loading states */
.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

/* Form validation */
.is-invalid {
  border-color: #dc3545;
}

.invalid-feedback {
  display: block;
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

/* Responsive design */
@media (max-width: 768px) {
  .profile-page {
    padding: 0.5rem;
  }

  .profile-header {
    padding: 1rem;
  }

  .d-flex.justify-content-between {
    flex-direction: column;
    gap: 1rem;
  }

  .avatar-large {
    width: 60px;
    height: 60px;
    font-size: 1.25rem;
  }
}

/* Button hover effects */
.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.15);
}

.btn:active {
  transform: translateY(0);
}

/* Card hover effects */
.card:hover {
  box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.1);
}

/* Smooth transitions */
.card,
.btn,
.form-control,
.avatar-large {
  transition: all 0.15s ease-in-out;
}

/* Print styles */
@media print {
  .btn,
  .card:last-child {
    display: none !important;
  }

  .card {
    box-shadow: none !important;
    border: 1px solid #000 !important;
  }
}
</style>
