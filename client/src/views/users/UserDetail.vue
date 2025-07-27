<template>
  <div class="user-detail">
    <div class="container-fluid">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-5">
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
                  <div class="d-flex align-items-center">
                    <div class="avatar-large me-4">
                      {{ getInitials() }}
                    </div>
                    <div>
                      <h3 class="mb-1">
                        {{ user.rank ? user.rank + " " : ""
                        }}{{ user.first_name }} {{ user.last_name }}
                      </h3>
                      <p class="text-muted mb-0">
                        <i class="bi bi-at me-1"></i>
                        {{ user.username }} | {{ user.email }}
                      </p>
                      <div
                        v-if="user.position || user.department"
                        class="text-muted mb-2"
                      >
                        <i class="bi bi-building me-1"></i>
                        {{ user.position
                        }}{{ user.position && user.department ? " / " : ""
                        }}{{ user.department }}
                      </div>
                      <div class="mt-2">
                        <span
                          :class="getRoleBadgeClass(user.role)"
                          class="badge me-2"
                        >
                          <i class="bi bi-person-badge me-1"></i>
                          {{ getRoleText(user.role) }}
                        </span>
                        <span
                          :class="
                            user.is_active
                              ? 'badge bg-success'
                              : 'badge bg-danger'
                          "
                          class="me-2"
                        >
                          <i
                            :class="
                              user.is_active
                                ? 'bi bi-check-circle'
                                : 'bi bi-x-circle'
                            "
                            class="me-1"
                          ></i>
                          {{ user.is_active ? "เปิดใช้งาน" : "ปิดใช้งาน" }}
                        </span>
                        <span
                          :class="getApprovalBadgeClass(user.approval_status)"
                          class="badge"
                        >
                          <i
                            :class="getApprovalIcon(user.approval_status)"
                            class="me-1"
                          ></i>
                          {{ getApprovalText(user.approval_status) }}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <button
                      @click="goBack"
                      class="btn btn-outline-secondary me-2"
                    >
                      <i class="bi bi-arrow-left me-1"></i>
                      กลับ
                    </button>
                    <router-link
                      :to="`/users/${user.id}/edit`"
                      class="btn btn-primary"
                    >
                      <i class="bi bi-pencil me-1"></i>
                      แก้ไข
                    </router-link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- User Information -->
        <div class="row">
          <!-- Left Column -->
          <div class="col-12 col-lg-8">
            <!-- Basic Information -->
            <div class="card mb-4">
              <div class="card-header">
                <h5 class="mb-0">
                  <i class="bi bi-person-lines-fill me-2"></i>
                  ข้อมูลส่วนตัว
                </h5>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label text-muted">ยศ</label>
                    <div class="fw-medium">{{ user.rank || "ไม่ระบุ" }}</div>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label text-muted">ชื่อ</label>
                    <div class="fw-medium">{{ user.first_name }}</div>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label text-muted">นามสกุล</label>
                    <div class="fw-medium">{{ user.last_name }}</div>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label text-muted">ชื่อผู้ใช้</label>
                    <div class="fw-medium">{{ user.username }}</div>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label text-muted">อีเมล</label>
                    <div class="fw-medium">
                      <a
                        :href="`mailto:${user.email}`"
                        class="text-decoration-none"
                      >
                        {{ user.email }}
                      </a>
                    </div>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label text-muted">เบอร์โทรศัพท์</label>
                    <div class="fw-medium">
                      <a
                        v-if="user.phone"
                        :href="`tel:${user.phone}`"
                        class="text-decoration-none"
                      >
                        <i class="bi bi-telephone me-1"></i>{{ user.phone }}
                      </a>
                      <span v-else>ไม่ระบุ</span>
                    </div>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label text-muted">Line ID</label>
                    <div class="fw-medium">
                      <span v-if="user.line_id">
                        <i class="bi bi-line me-1"></i>{{ user.line_id }}
                      </span>
                      <span v-else>ไม่ระบุ</span>
                    </div>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label text-muted">ตำแหน่ง</label>
                    <div class="fw-medium">
                      {{ user.position || "ไม่ระบุ" }}
                    </div>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label text-muted">หน่วยงาน</label>
                    <div class="fw-medium">
                      {{ user.department || "ไม่ระบุ" }}
                    </div>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label text-muted">บทบาท</label>
                    <div>
                      <span :class="getRoleBadgeClass(user.role)" class="badge">
                        {{ getRoleText(user.role) }}
                      </span>
                    </div>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label text-muted">สถานะการใช้งาน</label>
                    <div>
                      <span
                        :class="user.is_active ? 'text-success' : 'text-danger'"
                      >
                        <i
                          :class="
                            user.is_active
                              ? 'bi bi-check-circle'
                              : 'bi bi-x-circle'
                          "
                          class="me-1"
                        ></i>
                        {{ user.is_active ? "เปิดใช้งาน" : "ปิดใช้งาน" }}
                      </span>
                    </div>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label text-muted">สถานะการอนุมัติ</label>
                    <div>
                      <span
                        :class="getApprovalBadgeClass(user.approval_status)"
                        class="badge"
                      >
                        <i
                          :class="getApprovalIcon(user.approval_status)"
                          class="me-1"
                        ></i>
                        {{ getApprovalText(user.approval_status) }}
                      </span>
                    </div>
                  </div>
                  <div v-if="user.notes" class="col-12">
                    <label class="form-label text-muted">หมายเหตุ</label>
                    <div class="fw-medium">{{ user.notes }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Activity Log -->
            <div class="card mb-4">
              <div
                class="card-header d-flex justify-content-between align-items-center"
              >
                <h5 class="mb-0">
                  <i class="bi bi-clock-history me-2"></i>
                  กิจกรรมล่าสุด
                </h5>
                <small class="text-muted">5 รายการล่าสุด</small>
              </div>
              <div class="card-body">
                <div
                  v-if="activities.length === 0"
                  class="text-center py-4 text-muted"
                >
                  <i class="bi bi-inbox display-4"></i>
                  <p class="mt-2 mb-0">ยังไม่มีกิจกรรม</p>
                </div>
                <div v-else>
                  <div
                    v-for="activity in activities"
                    :key="activity.id"
                    class="activity-item d-flex align-items-start mb-3 pb-3 border-bottom"
                  >
                    <div class="activity-icon me-3">
                      <i
                        :class="activity.icon"
                        :style="`color: ${activity.color}`"
                      ></i>
                    </div>
                    <div class="flex-grow-1">
                      <div class="fw-medium">{{ activity.title }}</div>
                      <div class="text-muted small">
                        {{ activity.description }}
                      </div>
                      <div class="text-muted small">
                        <i class="bi bi-clock me-1"></i>
                        {{ formatDate(activity.created_at) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Permissions -->
            <div class="card">
              <div class="card-header">
                <h5 class="mb-0">
                  <i class="bi bi-shield-check me-2"></i>
                  สิทธิ์การใช้งาน
                </h5>
              </div>
              <div class="card-body">
                <div class="row">
                  <div
                    v-for="permission in permissions"
                    :key="permission.key"
                    class="col-md-6 mb-2"
                  >
                    <div class="d-flex align-items-center">
                      <i
                        :class="
                          permission.allowed
                            ? 'bi bi-check-circle text-success'
                            : 'bi bi-x-circle text-danger'
                        "
                        class="me-2"
                      ></i>
                      <span
                        :class="permission.allowed ? 'text-dark' : 'text-muted'"
                      >
                        {{ permission.name }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column -->
          <div class="col-12 col-lg-4">
            <!-- Account Status -->
            <div class="card mb-4">
              <div class="card-header">
                <h6 class="mb-0">
                  <i class="bi bi-info-circle me-2"></i>
                  สถานะบัญชี
                </h6>
              </div>
              <div class="card-body">
                <div class="mb-3">
                  <label class="form-label text-muted small">สร้างเมื่อ</label>
                  <div class="fw-medium">{{ formatDate(user.created_at) }}</div>
                </div>
                <div class="mb-3">
                  <label class="form-label text-muted small"
                    >อัปเดตล่าสุด</label
                  >
                  <div class="fw-medium">{{ formatDate(user.updated_at) }}</div>
                </div>
                <div class="mb-3">
                  <label class="form-label text-muted small"
                    >เข้าสู่ระบบล่าสุด</label
                  >
                  <div class="fw-medium">
                    {{
                      user.last_login
                        ? formatDate(user.last_login)
                        : "ยังไม่เคย"
                    }}
                  </div>
                </div>
                <div>
                  <label class="form-label text-muted small"
                    >สถานะออนไลน์</label
                  >
                  <div>
                    <span :class="isOnline ? 'text-success' : 'text-muted'">
                      <i
                        :class="isOnline ? 'bi bi-circle-fill' : 'bi bi-circle'"
                        class="me-1"
                        style="font-size: 0.7rem"
                      ></i>
                      {{ isOnline ? "ออนไลน์" : "ออฟไลน์" }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Statistics -->
            <div class="card mb-4">
              <div class="card-header">
                <h6 class="mb-0">
                  <i class="bi bi-graph-up me-2"></i>
                  สถิติการใช้งาน
                </h6>
              </div>
              <div class="card-body">
                <div class="row text-center">
                  <div class="col-6 mb-3">
                    <div class="h4 mb-0 text-primary">
                      {{ stats.totalSurveys }}
                    </div>
                    <small class="text-muted">การสำรวจ</small>
                  </div>
                  <div class="col-6 mb-3">
                    <div class="h4 mb-0 text-success">
                      {{ stats.approvedSurveys }}
                    </div>
                    <small class="text-muted">อนุมัติ</small>
                  </div>
                  <div class="col-6">
                    <div class="h4 mb-0 text-warning">
                      {{ stats.pendingSurveys }}
                    </div>
                    <small class="text-muted">รอตรวจ</small>
                  </div>
                  <div class="col-6">
                    <div class="h4 mb-0 text-info">{{ stats.loginCount }}</div>
                    <small class="text-muted">เข้าสู่ระบบ</small>
                  </div>
                </div>
              </div>
            </div>

            <!-- Quick Actions -->
            <div class="card">
              <div class="card-header">
                <h6 class="mb-0">
                  <i class="bi bi-lightning-fill me-2"></i>
                  การดำเนินการ
                </h6>
              </div>
              <div class="card-body">
                <div class="d-grid gap-2">
                  <router-link
                    :to="`/users/${user.id}/edit`"
                    class="btn btn-primary btn-sm"
                  >
                    <i class="bi bi-pencil me-2"></i>
                    แก้ไขข้อมูล
                  </router-link>
                  <button
                    @click="toggleUserStatus"
                    :class="
                      user.is_active
                        ? 'btn btn-warning btn-sm'
                        : 'btn btn-success btn-sm'
                    "
                    :disabled="actionLoading"
                  >
                    <span
                      v-if="actionLoading"
                      class="spinner-border spinner-border-sm me-2"
                    ></span>
                    <i
                      v-else
                      :class="
                        user.is_active
                          ? 'bi bi-pause-circle'
                          : 'bi bi-play-circle'
                      "
                      class="me-2"
                    ></i>
                    {{ user.is_active ? "ปิดใช้งาน" : "เปิดใช้งาน" }}
                  </button>
                  <button
                    @click="changeApprovalStatus"
                    class="btn btn-info btn-sm"
                    :disabled="actionLoading"
                  >
                    <i class="bi bi-check2-all me-2"></i>
                    เปลี่ยนสถานะการอนุมัติ
                  </button>
                  <button
                    @click="resetPassword"
                    class="btn btn-outline-secondary btn-sm"
                    :disabled="actionLoading"
                  >
                    <span
                      v-if="resetLoading"
                      class="spinner-border spinner-border-sm me-2"
                    ></span>
                    <i v-else class="bi bi-key me-2"></i>
                    รีเซ็ตรหัสผ่าน
                  </button>
                  <button
                    @click="deleteUser"
                    class="btn btn-outline-danger btn-sm"
                    :disabled="actionLoading"
                  >
                    <i class="bi bi-trash me-2"></i>
                    ลบผู้ใช้
                  </button>
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
import {
  showSuccessToast,
  showErrorToast,
  showConfirmToast,
} from "@/utils/toast";
import moment from "moment";

const route = useRoute();
const router = useRouter();

// Data
const user = ref({});
const loading = ref(true);
const actionLoading = ref(false);
const resetLoading = ref(false);

// Mock data for activities and stats
const activities = ref([
  {
    id: 1,
    title: "เข้าสู่ระบบ",
    description: "เข้าสู่ระบบผ่าน web browser",
    icon: "bi bi-box-arrow-in-right",
    color: "#28a745",
    created_at: new Date(Date.now() - 3600000),
  },
  {
    id: 2,
    title: "สร้างการสำรวจ",
    description: "สร้างข้อมูลการสำรวจใหม่ - วัดพระแก้ว",
    icon: "bi bi-plus-circle",
    color: "#007bff",
    created_at: new Date(Date.now() - 7200000),
  },
  {
    id: 3,
    title: "อัปเดตโปรไฟล์",
    description: "แก้ไขข้อมูลส่วนตัว",
    icon: "bi bi-person-gear",
    color: "#ffc107",
    created_at: new Date(Date.now() - 86400000),
  },
]);

const stats = reactive({
  totalSurveys: 12,
  approvedSurveys: 8,
  pendingSurveys: 4,
  loginCount: 45,
});

// Computed
const isOnline = computed(() => {
  // Mock online status - in real app, this would be based on last activity
  return (
    user.value.last_login &&
    new Date() - new Date(user.value.last_login) < 300000
  ); // 5 minutes
});

const permissions = computed(() => {
  const rolePermissions = {
    Admin: [
      { key: "view_dashboard", name: "ดูหน้าแดชบอร์ด", allowed: true },
      { key: "manage_users", name: "จัดการผู้ใช้", allowed: true },
      { key: "manage_surveys", name: "จัดการการสำรวจ", allowed: true },
      { key: "manage_master_data", name: "จัดการข้อมูลหลัก", allowed: true },
      { key: "view_audit_logs", name: "ดูประวัติการใช้งาน", allowed: true },
      { key: "export_reports", name: "ส่งออกรายงาน", allowed: true },
    ],
    Reviewer: [
      { key: "view_dashboard", name: "ดูหน้าแดชบอร์ด", allowed: true },
      { key: "manage_users", name: "จัดการผู้ใช้", allowed: false },
      { key: "manage_surveys", name: "จัดการการสำรวจ", allowed: true },
      { key: "manage_master_data", name: "จัดการข้อมูลหลัก", allowed: false },
      { key: "view_audit_logs", name: "ดูประวัติการใช้งาน", allowed: true },
      { key: "export_reports", name: "ส่งออกรายงาน", allowed: true },
    ],
    Surveyor: [
      { key: "view_dashboard", name: "ดูหน้าแดชบอร์ด", allowed: true },
      { key: "manage_users", name: "จัดการผู้ใช้", allowed: false },
      { key: "manage_surveys", name: "จัดการการสำรวจ", allowed: true },
      { key: "manage_master_data", name: "จัดการข้อมูลหลัก", allowed: false },
      { key: "view_audit_logs", name: "ดูประวัติการใช้งาน", allowed: false },
      { key: "export_reports", name: "ส่งออกรายงาน", allowed: false },
    ],
  };

  return rolePermissions[user.value.role] || [];
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
    loading.value = true;
    const response = await userService.getUser(userId);
    user.value = response.data;

    // Set default approval status if not present
    if (!user.value.approval_status) {
      user.value.approval_status = "pending";
    }
  } catch (error) {
    console.error("Error loading user:", error);
    alert("เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้");
    router.push("/users");
  } finally {
    loading.value = false;
  }
};

const toggleUserStatus = async () => {
  if (
    !confirm(
      `คุณแน่ใจว่าต้องการ${
        user.value.is_active ? "ปิด" : "เปิด"
      }ใช้งานผู้ใช้นี้?`
    )
  ) {
    return;
  }

  try {
    actionLoading.value = true;
    await userService.updateUserStatus(user.value.id, !user.value.is_active);

    // Update local state
    user.value.is_active = !user.value.is_active;

    alert(`${user.value.is_active ? "เปิด" : "ปิด"}ใช้งานผู้ใช้สำเร็จ`);
  } catch (error) {
    console.error("Error updating user status:", error);
    alert("เกิดข้อผิดพลาดในการอัปเดตสถานะผู้ใช้");
  } finally {
    actionLoading.value = false;
  }
};

const changeApprovalStatus = async () => {
  // Create options for approval status
  const options = [
    { value: "pending", text: "รออนุมัติ" },
    { value: "approved", text: "อนุมัติ" },
    { value: "rejected", text: "ปฏิเสธ" },
  ];

  // Find current status index
  const currentStatusIndex = options.findIndex(
    (option) => option.value === user.value.approval_status
  );

  // Create options text for prompt
  const optionsText = options
    .map(
      (option, index) =>
        `${index + 1}. ${option.text}${
          currentStatusIndex === index ? " (สถานะปัจจุบัน)" : ""
        }`
    )
    .join("\n");

  // Prompt user for selection
  const selection = prompt(
    `เลือกสถานะการอนุมัติใหม่:\n${optionsText}\n\nกรุณาระบุหมายเลข (1-${options.length}):`,
    currentStatusIndex + 1
  );

  // Check if user cancelled
  if (!selection) return;

  // Convert to number and validate
  const selectedIndex = parseInt(selection) - 1;
  if (
    isNaN(selectedIndex) ||
    selectedIndex < 0 ||
    selectedIndex >= options.length
  ) {
    alert("กรุณาเลือกตัวเลือกที่ถูกต้อง");
    return;
  }

  // If same status, no need to update
  if (selectedIndex === currentStatusIndex) {
    alert("สถานะการอนุมัติไม่มีการเปลี่ยนแปลง");
    return;
  }

  try {
    actionLoading.value = true;

    // Get selected status
    const newStatus = options[selectedIndex].value;

    // Call API to update approval status
    await userService.updateUserApprovalStatus(user.value.id, newStatus);

    // Update local state
    user.value.approval_status = newStatus;

    alert(`เปลี่ยนสถานะการอนุมัติเป็น "${options[selectedIndex].text}" สำเร็จ`);
  } catch (error) {
    console.error("Error updating approval status:", error);
    alert("เกิดข้อผิดพลาดในการอัปเดตสถานะการอนุมัติ");
  } finally {
    actionLoading.value = false;
  }
};

const resetPassword = async () => {
  showConfirmToast("คุณแน่ใจว่าต้องการรีเซ็ตรหัสผ่านผู้ใช้นี้?", async () => {
    try {
      resetLoading.value = true;

      // Mock API call - in real app, this would call a reset password endpoint
      await new Promise((resolve) => setTimeout(resolve, 1000));

      showSuccessToast(
        "รีเซ็ตรหัสผ่านสำเร็จ รหัสผ่านใหม่จะถูกส่งไปยังอีเมลของผู้ใช้"
      );
    } catch (error) {
      console.error("Error resetting password:", error);
      showErrorToast("เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน");
    } finally {
      resetLoading.value = false;
    }
  });
};

const deleteUser = async () => {
  showConfirmToast(
    "คุณแน่ใจว่าต้องการลบผู้ใช้นี้?<br><strong>การดำเนินการนี้ไม่สามารถยกเลิกได้</strong>",
    async () => {
      try {
        actionLoading.value = true;
        await userService.deleteUser(user.value.id);

        showSuccessToast("ลบผู้ใช้สำเร็จ");
        router.push("/users");
      } catch (error) {
        console.error("Error deleting user:", error);
        showErrorToast("เกิดข้อผิดพลาดในการลบผู้ใช้");
      } finally {
        actionLoading.value = false;
      }
    }
  );
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

const getApprovalBadgeClass = (status) => {
  const classes = {
    pending: "bg-warning text-dark",
    approved: "bg-success",
    rejected: "bg-danger",
  };
  return classes[status] || "bg-secondary";
};

const getApprovalIcon = (status) => {
  const icons = {
    pending: "bi bi-hourglass-split",
    approved: "bi bi-check-circle",
    rejected: "bi bi-x-circle",
  };
  return icons[status] || "bi bi-question-circle";
};

const getApprovalText = (status) => {
  const texts = {
    pending: "รออนุมัติ",
    approved: "อนุมัติแล้ว",
    rejected: "ปฏิเสธ",
  };
  return texts[status] || "ไม่ระบุ";
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
.user-detail {
  padding: 1rem;
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
  font-size: 1.8rem;
  box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.1);
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

.badge {
  font-size: 0.75em;
  padding: 0.35em 0.65em;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.fw-medium {
  font-weight: 500 !important;
}

/* Activity items */
.activity-item {
  transition: background-color 0.2s ease-in-out;
}

.activity-item:hover {
  background-color: rgba(var(--bs-primary-rgb), 0.05);
  border-radius: 0.375rem;
  margin: -0.5rem;
  padding: 0.5rem !important;
}

.activity-icon {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  font-size: 0.875rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.1);
}

/* Statistics cards */
.h4 {
  font-weight: 600;
}

/* Permission items */
.bi-check-circle {
  font-size: 1.1rem;
}

.bi-x-circle {
  font-size: 1.1rem;
}

/* Online status indicator */
.bi-circle-fill {
  animation: pulse 2s infinite;
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

/* Button states */
.btn:disabled {
  opacity: 0.6;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .user-detail {
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

  .avatar-large {
    width: 60px;
    height: 60px;
    font-size: 1.4rem;
  }
}

@media (max-width: 575.98px) {
  .card-body {
    padding: 1rem;
  }

  .avatar-large {
    width: 50px;
    height: 50px;
    font-size: 1.2rem;
  }

  .btn {
    font-size: 0.875rem;
  }

  .h4 {
    font-size: 1.25rem;
  }

  .activity-item {
    margin-bottom: 1rem !important;
    padding-bottom: 1rem !important;
  }
}

/* Focus states for accessibility */
.btn:focus {
  outline: none;
}

/* Smooth transitions */
.card,
.btn,
.activity-item {
  transition: all 0.15s ease-in-out;
}

/* Link styling */
a {
  color: var(--bs-primary);
}

a:hover {
  color: var(--bs-primary);
  opacity: 0.8;
}

/* Status badges */
.badge.bg-success {
  background-color: var(--bs-success) !important;
}

.badge.bg-danger {
  background-color: var(--bs-danger) !important;
}

/* Header card special styling */
.card:first-child .card-body {
  padding: 2rem;
}

@media (max-width: 768px) {
  .card:first-child .card-body {
    padding: 1.5rem;
  }
}

@media (max-width: 575.98px) {
  .card:first-child .card-body {
    padding: 1rem;
  }
}

/* Empty state styling */
.text-center .bi-inbox {
  opacity: 0.3;
}

/* Grid improvements for small screens */
@media (max-width: 575.98px) {
  .row.text-center .col-6 {
    margin-bottom: 1rem;
  }
}
</style>
