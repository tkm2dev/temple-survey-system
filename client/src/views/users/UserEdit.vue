<template>
  <div class="user-edit">
    <div class="container-fluid">
      <!-- Loading State -->
      <div v-if="initialLoading" class="text-center py-5">
        <div class="spinner-border text-primary me-2"></div>
        <span>กำลังโหลดข้อมูลผู้ใช้...</span>
      </div>

      <!-- Main Content -->
      <div v-else>
        <!-- Header -->
        <div class="row mb-4">
          <div class="col-12">
            <div class="card">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <h4 class="mb-1">
                      <i class="bi bi-person-gear me-2 text-primary"></i>
                      แก้ไขข้อมูลผู้ใช้
                    </h4>
                    <p class="text-muted mb-0">
                      แก้ไขข้อมูล: {{ user.first_name }} {{ user.last_name }}
                    </p>
                  </div>
                  <div>
                    <button
                      @click="goBack"
                      class="btn btn-outline-secondary me-2"
                      :disabled="loading"
                    >
                      <i class="bi bi-arrow-left me-1"></i>
                      กลับ
                    </button>
                    <button
                      @click="handleSubmit"
                      class="btn btn-primary"
                      :disabled="loading || !isFormValid"
                    >
                      <span
                        v-if="loading"
                        class="spinner-border spinner-border-sm me-2"
                      ></span>
                      <i v-else class="bi bi-check-circle me-1"></i>
                      {{ loading ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง" }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Form -->
        <div class="row">
          <div class="col-12 col-lg-8">
            <!-- User Information -->
            <div class="card mb-4">
              <div class="card-header">
                <h5 class="mb-0">
                  <i class="bi bi-person-lines-fill me-2"></i>
                  ข้อมูลผู้ใช้งาน
                </h5>
              </div>
              <div class="card-body">
                <form @submit.prevent="handleSubmit">
                  <div class="row">
                    <!-- ชื่อ -->
                    <div class="col-md-6 mb-3">
                      <label for="firstName" class="form-label">
                        ชื่อ <span class="text-danger">*</span>
                      </label>
                      <input
                        id="firstName"
                        v-model="form.firstName"
                        type="text"
                        class="form-control"
                        :class="{ 'is-invalid': errors.firstName }"
                        placeholder="กรอกชื่อ"
                        required
                      />
                      <div v-if="errors.firstName" class="invalid-feedback">
                        {{ errors.firstName }}
                      </div>
                    </div>

                    <!-- นามสกุล -->
                    <div class="col-md-6 mb-3">
                      <label for="lastName" class="form-label">
                        นามสกุล <span class="text-danger">*</span>
                      </label>
                      <input
                        id="lastName"
                        v-model="form.lastName"
                        type="text"
                        class="form-control"
                        :class="{ 'is-invalid': errors.lastName }"
                        placeholder="กรอกนามสกุล"
                        required
                      />
                      <div v-if="errors.lastName" class="invalid-feedback">
                        {{ errors.lastName }}
                      </div>
                    </div>

                    <!-- Username -->
                    <div class="col-md-6 mb-3">
                      <label for="username" class="form-label">
                        ชื่อผู้ใช้ (Username) <span class="text-danger">*</span>
                      </label>
                      <input
                        id="username"
                        v-model="form.username"
                        type="text"
                        class="form-control"
                        :class="{ 'is-invalid': errors.username }"
                        placeholder="กรอกชื่อผู้ใช้"
                        required
                      />
                      <div v-if="errors.username" class="invalid-feedback">
                        {{ errors.username }}
                      </div>
                      <div class="form-text">
                        ชื่อผู้ใช้ต้องมีความยาว 3-50 ตัวอักษร ใช้ได้เฉพาะ a-z,
                        A-Z, 0-9, _, -
                      </div>
                    </div>

                    <!-- Email -->
                    <div class="col-md-6 mb-3">
                      <label for="email" class="form-label">
                        อีเมล <span class="text-danger">*</span>
                      </label>
                      <input
                        id="email"
                        v-model="form.email"
                        type="email"
                        class="form-control"
                        :class="{ 'is-invalid': errors.email }"
                        placeholder="example@domain.com"
                        required
                      />
                      <div v-if="errors.email" class="invalid-feedback">
                        {{ errors.email }}
                      </div>
                    </div>

                    <!-- ยศ -->
                    <div class="col-md-6 mb-3">
                      <label for="rank" class="form-label">ยศ</label>
                      <select
                        id="rank"
                        v-model="form.rank"
                        class="form-select"
                        :class="{ 'is-invalid': errors.rank }"
                      >
                        <option value="">เลือกยศ (ถ้ามี)</option>
                        <option value="ส.ต.ต.">สิบตำรวจตรี (ส.ต.ต.)</option>
                        <option value="ส.ต.ท.">สิบตำรวจโท (ส.ต.ท.)</option>
                        <option value="ส.ต.อ.">สิบตำรวจเอก (ส.ต.อ.)</option>
                        <option value="จ.ส.ต.">จ่าสิบตำรวจ (จ.ส.ต.)</option>
                        <option value="ด.ต.">ดาบตำรวจ (ด.ต.)</option>
                        <option value="ร.ต.ต.">ร้อยตำรวจตรี (ร.ต.ต.)</option>
                        <option value="ร.ต.ท.">ร้อยตำรวจโท (ร.ต.ท.)</option>
                        <option value="ร.ต.อ.">ร้อยตำรวจเอก (ร.ต.อ.)</option>
                        <option value="พ.ต.ต.">พันตำรวจตรี (พ.ต.ต.)</option>
                        <option value="พ.ต.ท.">พันตำรวจโท (พ.ต.ท.)</option>
                        <option value="พ.ต.อ.">พันตำรวจเอก (พ.ต.อ.)</option>
                      </select>
                      <div v-if="errors.rank" class="invalid-feedback">
                        {{ errors.rank }}
                      </div>
                    </div>

                    <!-- ตำแหน่ง -->
                    <div class="col-md-6 mb-3">
                      <label for="position" class="form-label">ตำแหน่ง</label>
                      <input
                        id="position"
                        v-model="form.position"
                        type="text"
                        class="form-control"
                        :class="{ 'is-invalid': errors.position }"
                        placeholder="กรอกตำแหน่ง"
                      />
                      <div v-if="errors.position" class="invalid-feedback">
                        {{ errors.position }}
                      </div>
                    </div>

                    <!-- เบอร์โทรศัพท์ -->
                    <div class="col-md-6 mb-3">
                      <label for="phone" class="form-label"
                        >เบอร์โทรศัพท์</label
                      >
                      <input
                        id="phone"
                        v-model="form.phone"
                        type="tel"
                        class="form-control"
                        :class="{ 'is-invalid': errors.phone }"
                        placeholder="กรอกเบอร์โทรศัพท์"
                      />
                      <div v-if="errors.phone" class="invalid-feedback">
                        {{ errors.phone }}
                      </div>
                    </div>

                    <!-- Line ID -->
                    <div class="col-md-6 mb-3">
                      <label for="lineId" class="form-label">Line ID</label>
                      <input
                        id="lineId"
                        v-model="form.lineId"
                        type="text"
                        class="form-control"
                        :class="{ 'is-invalid': errors.lineId }"
                        placeholder="กรอก Line ID"
                      />
                      <div v-if="errors.lineId" class="invalid-feedback">
                        {{ errors.lineId }}
                      </div>
                    </div>

                    <!-- หน่วยงาน -->
                    <div class="col-md-6 mb-3">
                      <label for="department" class="form-label"
                        >หน่วยงาน</label
                      >
                      <input
                        id="department"
                        v-model="form.department"
                        type="text"
                        class="form-control"
                        :class="{ 'is-invalid': errors.department }"
                        placeholder="กรอกหน่วยงาน"
                      />
                      <div v-if="errors.department" class="invalid-feedback">
                        {{ errors.department }}
                      </div>
                    </div>

                    <!-- บทบาท -->
                    <div class="col-md-6 mb-3">
                      <label for="role" class="form-label">
                        บทบาท <span class="text-danger">*</span>
                      </label>
                      <select
                        id="role"
                        v-model="form.role"
                        class="form-select"
                        :class="{ 'is-invalid': errors.role }"
                        required
                      >
                        <option value="">เลือกบทบาท</option>
                        <option value="Admin">ผู้ดูแลระบบ</option>
                        <option value="Reviewer">ผู้ตรวจสอบ</option>
                        <option value="Surveyor">ผู้สำรวจ</option>
                      </select>
                      <div v-if="errors.role" class="invalid-feedback">
                        {{ errors.role }}
                      </div>
                    </div>

                    <!-- สถานะการอนุมัติ -->
                    <div class="col-md-6 mb-3">
                      <label for="approvalStatus" class="form-label"
                        >สถานะการอนุมัติ</label
                      >
                      <select
                        id="approvalStatus"
                        v-model="form.approvalStatus"
                        class="form-select"
                        :class="{ 'is-invalid': errors.approvalStatus }"
                      >
                        <option value="pending">รออนุมัติ</option>
                        <option value="approved">อนุมัติแล้ว</option>
                        <option value="rejected">ปฏิเสธ</option>
                      </select>
                      <div
                        v-if="errors.approvalStatus"
                        class="invalid-feedback"
                      >
                        {{ errors.approvalStatus }}
                      </div>
                    </div>

                    <!-- สถานะ -->
                    <div class="col-md-6 mb-3">
                      <label class="form-label">สถานะการใช้งาน</label>
                      <div class="form-check form-switch">
                        <input
                          id="isActive"
                          v-model="form.isActive"
                          class="form-check-input"
                          type="checkbox"
                          role="switch"
                        />
                        <label for="isActive" class="form-check-label">
                          {{ form.isActive ? "เปิดใช้งาน" : "ปิดใช้งาน" }}
                        </label>
                      </div>
                      <div class="form-text">
                        ผู้ใช้ที่ปิดใช้งานจะไม่สามารถเข้าสู่ระบบได้
                      </div>
                    </div>

                    <!-- หมายเหตุ -->
                    <div class="col-12 mb-3">
                      <label for="notes" class="form-label">หมายเหตุ</label>
                      <textarea
                        id="notes"
                        v-model="form.notes"
                        class="form-control"
                        rows="3"
                        placeholder="หมายเหตุเพิ่มเติม (ไม่บังคับ)"
                      ></textarea>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            <!-- Change Password -->
            <div class="card">
              <div class="card-header">
                <h5 class="mb-0">
                  <i class="bi bi-key me-2"></i>
                  เปลี่ยนรหัสผ่าน
                </h5>
              </div>
              <div class="card-body">
                <div class="alert alert-info">
                  <i class="bi bi-info-circle me-2"></i>
                  เว้นว่างไว้หากไม่ต้องการเปลี่ยนรหัสผ่าน
                </div>

                <div class="row">
                  <!-- รหัสผ่านใหม่ -->
                  <div class="col-md-6 mb-3">
                    <label for="newPassword" class="form-label"
                      >รหัสผ่านใหม่</label
                    >
                    <div class="input-group">
                      <input
                        id="newPassword"
                        v-model="form.newPassword"
                        :type="showNewPassword ? 'text' : 'password'"
                        class="form-control"
                        :class="{ 'is-invalid': errors.newPassword }"
                        placeholder="กรอกรหัสผ่านใหม่"
                      />
                      <button
                        type="button"
                        class="btn btn-outline-secondary"
                        @click="showNewPassword = !showNewPassword"
                      >
                        <i
                          :class="
                            showNewPassword ? 'bi bi-eye-slash' : 'bi bi-eye'
                          "
                        ></i>
                      </button>
                      <div v-if="errors.newPassword" class="invalid-feedback">
                        {{ errors.newPassword }}
                      </div>
                    </div>
                  </div>

                  <!-- ยืนยันรหัสผ่านใหม่ -->
                  <div class="col-md-6 mb-3">
                    <label for="confirmNewPassword" class="form-label"
                      >ยืนยันรหัสผ่านใหม่</label
                    >
                    <div class="input-group">
                      <input
                        id="confirmNewPassword"
                        v-model="form.confirmNewPassword"
                        :type="showConfirmNewPassword ? 'text' : 'password'"
                        class="form-control"
                        :class="{ 'is-invalid': errors.confirmNewPassword }"
                        placeholder="ยืนยันรหัสผ่านใหม่"
                      />
                      <button
                        type="button"
                        class="btn btn-outline-secondary"
                        @click="
                          showConfirmNewPassword = !showConfirmNewPassword
                        "
                      >
                        <i
                          :class="
                            showConfirmNewPassword
                              ? 'bi bi-eye-slash'
                              : 'bi bi-eye'
                          "
                        ></i>
                      </button>
                      <div
                        v-if="errors.confirmNewPassword"
                        class="invalid-feedback"
                      >
                        {{ errors.confirmNewPassword }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Sidebar Info -->
          <div class="col-12 col-lg-4">
            <!-- User Info -->
            <div class="card mb-3">
              <div class="card-header">
                <h6 class="mb-0">
                  <i class="bi bi-person-badge me-2"></i>
                  ข้อมูลปัจจุบัน
                </h6>
              </div>
              <div class="card-body">
                <div class="text-center mb-3">
                  <div class="avatar-large mx-auto mb-2">
                    {{ getInitials() }}
                  </div>
                  <h6 class="mb-0">
                    {{ user.first_name }} {{ user.last_name }}
                  </h6>
                  <small class="text-muted">@{{ user.username }}</small>
                </div>

                <div class="mb-2">
                  <strong>สร้างเมื่อ:</strong><br />
                  <small class="text-muted">{{
                    formatDate(user.created_at)
                  }}</small>
                </div>

                <div class="mb-2">
                  <strong>อัปเดตล่าสุด:</strong><br />
                  <small class="text-muted">{{
                    formatDate(user.updated_at)
                  }}</small>
                </div>

                <div>
                  <strong>เข้าสู่ระบบล่าสุด:</strong><br />
                  <small class="text-muted">{{
                    user.last_login ? formatDate(user.last_login) : "ยังไม่เคย"
                  }}</small>
                </div>
              </div>
            </div>

            <!-- Preview -->
            <div class="card">
              <div class="card-header">
                <h6 class="mb-0">
                  <i class="bi bi-eye me-2"></i>
                  ตัวอย่างหลังแก้ไข
                </h6>
              </div>
              <div class="card-body">
                <div class="d-flex align-items-center mb-3">
                  <div class="avatar me-3">
                    <div class="avatar-circle">
                      {{ getPreviewInitials() }}
                    </div>
                  </div>
                  <div>
                    <div class="fw-medium">
                      {{ form.firstName || "ชื่อ" }}
                      {{ form.lastName || "นามสกุล" }}
                    </div>
                    <div class="text-muted small">
                      @{{ form.username || "username" }}
                    </div>
                  </div>
                </div>

                <div class="mb-2">
                  <strong>อีเมล:</strong>
                  {{ form.email || "email@example.com" }}
                </div>

                <div class="mb-2">
                  <strong>บทบาท:</strong>
                  <span
                    v-if="form.role"
                    :class="getRoleBadgeClass(form.role)"
                    class="badge ms-1"
                  >
                    {{ getRoleText(form.role) }}
                  </span>
                  <span v-else class="text-muted">ยังไม่เลือก</span>
                </div>

                <div>
                  <strong>สถานะ:</strong>
                  <span :class="form.isActive ? 'text-success' : 'text-danger'">
                    <i
                      :class="
                        form.isActive ? 'bi bi-check-circle' : 'bi bi-x-circle'
                      "
                      class="me-1"
                    ></i>
                    {{ form.isActive ? "เปิดใช้งาน" : "ปิดใช้งาน" }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import userService from "@/services/userService";
import moment from "moment";

const route = useRoute();
const router = useRouter();

// Data
const user = ref({});
const initialLoading = ref(true);
const loading = ref(false);
const showNewPassword = ref(false);
const showConfirmNewPassword = ref(false);
const errors = reactive({});

// Form data
const form = reactive({
  firstName: "",
  lastName: "",
  username: "",
  email: "",
  role: "",
  isActive: true,
  notes: "",
  newPassword: "",
  confirmNewPassword: "",
  rank: "",
  position: "",
  phone: "",
  lineId: "",
  department: "",
  approvalStatus: "pending",
});

// Computed
const isFormValid = computed(() => {
  return (
    form.firstName &&
    form.lastName &&
    form.username &&
    form.email &&
    form.role &&
    (!form.newPassword || form.newPassword === form.confirmNewPassword) &&
    Object.keys(errors).length === 0
  );
});

// Methods
const loadUser = async () => {
  // Check if we have a valid user ID
  const userId = route.params.id;
  if (!userId || userId === "undefined") {
    console.error("No valid user ID provided");
    alert("ไม่พบรหัสผู้ใช้ที่ระบุ");
    router.push("/users");
    return;
  }

  try {
    initialLoading.value = true;
    const response = await userService.getUser(userId);
    user.value = response.data;

    // Populate form
    form.firstName = user.value.first_name;
    form.lastName = user.value.last_name;
    form.username = user.value.username;
    form.email = user.value.email;
    form.role = user.value.role;
    form.isActive = user.value.is_active;
    form.notes = user.value.notes || "";
    form.rank = user.value.rank || "";
    form.position = user.value.position || "";
    form.phone = user.value.phone || "";
    form.lineId = user.value.line_id || "";
    form.department = user.value.department || "";
    form.approvalStatus = user.value.approval_status || "pending";
  } catch (error) {
    console.error("Error loading user:", error);
    alert("เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้");
    router.push("/users");
  } finally {
    initialLoading.value = false;
  }
};

const validateForm = () => {
  // Clear previous errors
  Object.keys(errors).forEach((key) => delete errors[key]);

  // Validate firstName
  if (!form.firstName.trim()) {
    errors.firstName = "กรุณากรอกชื่อ";
  } else if (form.firstName.length < 2) {
    errors.firstName = "ชื่อต้องมีความยาวอย่างน้อย 2 ตัวอักษร";
  }

  // Validate lastName
  if (!form.lastName.trim()) {
    errors.lastName = "กรุณากรอกนามสกุล";
  } else if (form.lastName.length < 2) {
    errors.lastName = "นามสกุลต้องมีความยาวอย่างน้อย 2 ตัวอักษร";
  }

  // Validate username
  if (!form.username.trim()) {
    errors.username = "กรุณากรอกชื่อผู้ใช้";
  } else if (form.username.length < 3 || form.username.length > 50) {
    errors.username = "ชื่อผู้ใช้ต้องมีความยาว 3-50 ตัวอักษร";
  } else if (!/^[a-zA-Z0-9_-]+$/.test(form.username)) {
    errors.username = "ชื่อผู้ใช้ใช้ได้เฉพาะ a-z, A-Z, 0-9, _, -";
  }

  // Validate email
  if (!form.email.trim()) {
    errors.email = "กรุณากรอกอีเมล";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = "รูปแบบอีเมลไม่ถูกต้อง";
  }

  // Validate role
  if (!form.role) {
    errors.role = "กรุณาเลือกบทบาท";
  }

  // Validate phone (if provided)
  if (form.phone && !/^[0-9]{9,10}$/.test(form.phone.replace(/[- ]/g, ""))) {
    errors.phone = "กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (9-10 หลัก)";
  }

  // Validate new password if provided
  if (form.newPassword) {
    if (form.newPassword.length < 6) {
      errors.newPassword = "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร";
    }

    if (!form.confirmNewPassword) {
      errors.confirmNewPassword = "กรุณายืนยันรหัสผ่านใหม่";
    } else if (form.newPassword !== form.confirmNewPassword) {
      errors.confirmNewPassword = "รหัสผ่านไม่ตรงกัน";
    }
  }

  return Object.keys(errors).length === 0;
};

const handleSubmit = async () => {
  if (!validateForm()) {
    return;
  }

  // Check if we have a valid user ID
  const userId = route.params.id;
  if (!userId || userId === "undefined") {
    console.error("No valid user ID provided for update");
    alert("ไม่พบรหัสผู้ใช้ที่ระบุ");
    router.push("/users");
    return;
  }

  loading.value = true;

  try {
    const userData = {
      first_name: form.firstName,
      last_name: form.lastName,
      username: form.username,
      email: form.email,
      role: form.role,
      is_active: form.isActive,
      notes: form.notes,
      rank: form.rank || null,
      position: form.position || null,
      phone: form.phone || null,
      line_id: form.lineId || null,
      department: form.department || null,
      approval_status: form.approvalStatus,
    };

    // Add password if provided
    if (form.newPassword) {
      userData.password = form.newPassword;
    }

    await userService.updateUser(userId, userData);

    // Show success message
    alert("อัปเดตข้อมูลผู้ใช้สำเร็จ");

    // Redirect to user list
    router.push("/users");
  } catch (error) {
    console.error("Error updating user:", error);

    if (error.response?.data?.message) {
      alert(`เกิดข้อผิดพลาด: ${error.response.data.message}`);
    } else {
      alert("เกิดข้อผิดพลาดในการอัปเดตข้อมูลผู้ใช้");
    }
  } finally {
    loading.value = false;
  }
};

const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1);
  } else {
    router.push("/users");
  }
};

const getInitials = () => {
  const first = user.value.first_name
    ? user.value.first_name.charAt(0).toUpperCase()
    : "";
  const last = user.value.last_name
    ? user.value.last_name.charAt(0).toUpperCase()
    : "";
  return first + last || "?";
};

const getPreviewInitials = () => {
  const first = form.firstName ? form.firstName.charAt(0).toUpperCase() : "";
  const last = form.lastName ? form.lastName.charAt(0).toUpperCase() : "";
  return first + last || "?";
};

const getRoleBadgeClass = (role) => {
  const classes = {
    Admin: "bg-danger",
    Reviewer: "bg-warning text-dark",
    Surveyor: "bg-primary",
  };
  return classes[role] || "bg-secondary";
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
  if (!dateString) return "ไม่มีข้อมูล";
  return moment(dateString).format("DD/MM/YYYY HH:mm");
};

// Lifecycle
onMounted(() => {
  loadUser();
});
</script>

<style scoped>
.user-edit {
  padding: 1rem;
}

.avatar-circle {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: var(--bs-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.1rem;
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
}

.card {
  border: none;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  border-radius: 0.5rem;
}

.card-header {
  background-color: rgba(var(--bs-primary-rgb), 0.1);
  border-bottom: 1px solid rgba(var(--bs-primary-rgb), 0.2);
  border-radius: 0.5rem 0.5rem 0 0 !important;
}

.form-control:focus,
.form-select:focus {
  border-color: var(--bs-primary);
  box-shadow: 0 0 0 0.2rem rgba(var(--bs-primary-rgb), 0.25);
}

.form-control.is-invalid:focus,
.form-select.is-invalid:focus {
  border-color: var(--bs-danger);
  box-shadow: 0 0 0 0.2rem rgba(var(--bs-danger-rgb), 0.25);
}

.input-group .btn {
  border-color: var(--bs-border-color);
}

.input-group .form-control:focus + .btn {
  border-color: var(--bs-primary);
}

.form-check-input:checked {
  background-color: var(--bs-success);
  border-color: var(--bs-success);
}

.alert {
  border: none;
  border-radius: 0.5rem;
}

.badge {
  font-size: 0.75em;
  padding: 0.35em 0.65em;
}

/* Animation for loading state */
.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

/* Form styling */
.form-text {
  font-size: 0.875em;
  color: var(--bs-secondary);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .user-edit {
    padding: 0.5rem;
  }

  .d-flex.justify-content-between {
    flex-direction: column;
    gap: 1rem;
  }

  .d-flex.justify-content-between > div:last-child {
    display: flex;
    gap: 0.5rem;
  }

  .d-flex.justify-content-between > div:last-child .btn {
    flex: 1;
  }
}

@media (max-width: 575.98px) {
  .card-body {
    padding: 1rem;
  }

  .avatar-circle {
    width: 40px;
    height: 40px;
    font-size: 0.9rem;
  }

  .avatar-large {
    width: 60px;
    height: 60px;
    font-size: 1.2rem;
  }

  .btn {
    font-size: 0.875rem;
  }
}

/* Focus states for accessibility */
.btn:focus,
.form-control:focus,
.form-select:focus,
.form-check-input:focus {
  outline: none;
}

/* Smooth transitions */
.card,
.btn,
.form-control,
.form-select {
  transition: all 0.15s ease-in-out;
}

/* Custom scrollbar for textarea */
textarea.form-control {
  resize: vertical;
  min-height: 80px;
}

/* Invalid feedback positioning */
.input-group .invalid-feedback {
  width: 100%;
  display: block;
}

/* User info styling */
.text-center h6 {
  font-weight: 600;
}

.text-center small {
  font-weight: 400;
}
</style>
