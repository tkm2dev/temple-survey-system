<template>
  <div class="user-list">
    <!-- Header Section -->
    <div class="user-header mb-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 class="mb-1">
            <i class="bi bi-people me-2 text-primary"></i>
            จัดการผู้ใช้งาน
          </h2>
          <p class="text-muted mb-0">
            <i class="bi bi-info-circle me-1"></i>
            ผู้ใช้ทั้งหมด {{ totalUsers }} คน
          </p>
        </div>

        <router-link to="/users/create" class="btn btn-primary">
          <i class="bi bi-plus-circle me-2"></i>
          เพิ่มผู้ใช้ใหม่
        </router-link>
        <button
          @click="refreshUsers"
          class="btn btn-outline-secondary ms-2"
          :disabled="loading"
        >
          <i class="bi bi-arrow-clockwise me-2"></i>
          รีเฟรช
        </button>
      </div>

      <!-- Search and Filter Section -->
      <div class="row">
        <div class="col-md-6 mb-3">
          <div class="input-group">
            <span class="input-group-text">
              <i class="bi bi-search"></i>
            </span>
            <input
              v-model="searchQuery"
              type="text"
              class="form-control"
              placeholder="ค้นหาชื่อ, username, หรือ email..."
              @input="handleSearch"
            />
            <button
              v-if="searchQuery"
              @click="clearSearch"
              class="btn btn-outline-secondary"
              type="button"
            >
              <i class="bi bi-x"></i>
            </button>
          </div>
        </div>

        <div class="col-md-3 mb-3">
          <select
            v-model="selectedRole"
            class="form-select"
            @change="handleFilter"
          >
            <option value="">ทุกบทบาท</option>
            <option value="Admin">ผู้ดูแลระบบ</option>
            <option value="Reviewer">ผู้ตรวจสอบ</option>
            <option value="Surveyor">ผู้สำรวจ</option>
          </select>
        </div>

        <div class="col-md-3 mb-3">
          <select
            v-model="selectedStatus"
            class="form-select"
            @change="handleFilter"
          >
            <option value="">ทุกสถานะการใช้งาน</option>
            <option value="active">ใช้งาน</option>
            <option value="inactive">ไม่ใช้งาน</option>
          </select>
        </div>

        <div class="col-md-3 mb-3">
          <select
            v-model="selectedApprovalStatus"
            class="form-select"
            @change="handleFilter"
          >
            <option value="">ทุกสถานะการอนุมัติ</option>
            <option value="pending">รออนุมัติ</option>
            <option value="approved">อนุมัติแล้ว</option>
            <option value="rejected">ปฏิเสธ</option>
          </select>
        </div>

        <div class="col-md-3 mb-3">
          <select
            v-model="selectedDepartment"
            class="form-select"
            @change="handleFilter"
          >
            <option value="">ทุกหน่วยงาน</option>
            <option v-for="dept in uniqueDepartments" :key="dept" :value="dept">
              {{ dept }}
            </option>
          </select>
        </div>
      </div>

      <!-- Summary Stats -->
      <div class="row">
        <div class="col-12">
          <div class="stats-row">
            <div class="stat-item">
              <div class="stat-number">{{ totalUsers }}</div>
              <div class="stat-label">ผู้ใช้ทั้งหมด</div>
            </div>
            <div class="stat-item">
              <div class="stat-number text-success">{{ activeUsers }}</div>
              <div class="stat-label">เปิดใช้งาน</div>
            </div>
            <div class="stat-item">
              <div class="stat-number text-danger">{{ inactiveUsers }}</div>
              <div class="stat-label">ปิดใช้งาน</div>
            </div>
            <div class="stat-item">
              <div class="stat-number text-primary">{{ onlineUsers }}</div>
              <div class="stat-label">ออนไลน์</div>
            </div>
            <div class="stat-item">
              <div class="stat-number text-warning">{{ adminUsers }}</div>
              <div class="stat-label">Admin</div>
            </div>
            <div class="stat-item">
              <div class="stat-number text-info">{{ reviewerUsers }}</div>
              <div class="stat-label">Reviewer</div>
            </div>
            <div class="stat-item">
              <div class="stat-number text-secondary">{{ surveyorUsers }}</div>
              <div class="stat-label">Surveyor</div>
            </div>
            <div class="stat-separator"></div>
            <div class="stat-item">
              <div class="stat-number text-warning">{{ pendingUsers }}</div>
              <div class="stat-label">รออนุมัติ</div>
            </div>
            <div class="stat-item">
              <div class="stat-number text-success">{{ approvedUsers }}</div>
              <div class="stat-label">อนุมัติแล้ว</div>
            </div>
            <div class="stat-item">
              <div class="stat-number text-danger">{{ rejectedUsers }}</div>
              <div class="stat-label">ปฏิเสธ</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">กำลังโหลด...</span>
      </div>
      <p class="mt-2 text-muted">กำลังโหลดข้อมูลผู้ใช้...</p>
    </div>

    <!-- Users Table/Cards -->
    <div v-else class="user-content">
      <!-- Desktop Table View -->
      <div class="table-responsive d-none d-lg-block">
        <table class="table table-hover">
          <thead class="table-light">
            <tr>
              <th>ชื่อยศ-นามสกุล</th>
              <th>ตำแหน่ง</th>
              <th>หน่วยงาน</th>
              <th>ติดต่อ</th>
              <th>บทบาท</th>
              <th>สถานะ</th>
              <th>การอนุมัติ</th>
              <th class="text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>
                <div class="d-flex align-items-center">
                  <div class="avatar me-3">
                    <div class="avatar-circle">
                      {{ getInitials(user.first_name, user.last_name) }}
                    </div>
                  </div>
                  <div>
                    <div class="fw-medium">
                      {{ user.rank ? user.rank + " " : ""
                      }}{{ user.first_name }} {{ user.last_name }}
                    </div>
                    <div class="text-muted small">@{{ user.username }}</div>
                  </div>
                </div>
              </td>
              <td>
                {{ user.position || "-" }}
              </td>
              <td>
                {{ user.department || "-" }}
              </td>
              <td>
                <div v-if="user.phone">
                  <small
                    ><i class="bi bi-telephone me-1"></i>{{ user.phone }}</small
                  >
                </div>
                <div v-if="user.line_id">
                  <small
                    ><i class="bi bi-line me-1"></i>{{ user.line_id }}</small
                  >
                </div>
                <div v-if="user.email">
                  <small
                    ><i class="bi bi-envelope me-1"></i>{{ user.email }}</small
                  >
                </div>
                <span v-if="!user.phone && !user.line_id && !user.email"
                  >-</span
                >
              </td>
              <td>
                <span :class="getRoleBadgeClass(user.role)" class="badge">
                  <i :class="getRoleIcon(user.role)" class="me-1"></i>
                  {{ getRoleText(user.role) }}
                </span>
              </td>
              <td>
                <div class="form-check form-switch">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    :checked="user.is_active"
                    @change="toggleUserStatus(user.id, $event.target.checked)"
                    :disabled="toggleLoading[user.id]"
                  />
                  <label class="form-check-label">
                    {{ user.is_active ? "ใช้งาน" : "ไม่ใช้งาน" }}
                  </label>
                </div>
              </td>
              <td>
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
                <div class="mt-1">
                  <div
                    class="btn-group btn-group-sm"
                    v-if="user.approval_status === 'pending'"
                  >
                    <button
                      class="btn btn-sm btn-outline-success"
                      @click="updateApprovalStatus(user.id, 'approved')"
                      :disabled="approvalLoading[user.id]"
                      title="อนุมัติ"
                    >
                      <i class="bi bi-check"></i>
                    </button>
                    <button
                      class="btn btn-sm btn-outline-danger"
                      @click="updateApprovalStatus(user.id, 'rejected')"
                      :disabled="approvalLoading[user.id]"
                      title="ปฏิเสธ"
                    >
                      <i class="bi bi-x"></i>
                    </button>
                  </div>
                </div>
              </td>
              <td class="text-center">
                <div class="btn-group" role="group">
                  <button
                    class="btn btn-outline-primary btn-sm"
                    @click="viewUser(user.id)"
                    title="ดูรายละเอียด"
                    :disabled="!user.id || user.id === 'undefined'"
                  >
                    <i class="bi bi-eye"></i>
                  </button>
                  <button
                    class="btn btn-outline-secondary btn-sm"
                    @click="editUser(user.id)"
                    title="แก้ไข"
                    :disabled="!user.id || user.id === 'undefined'"
                  >
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button
                    class="btn btn-outline-danger btn-sm"
                    @click="deleteUser(user.id)"
                    title="ลบ"
                    :disabled="
                      deleteLoading[user.id] ||
                      !user.id ||
                      user.id === 'undefined'
                    "
                  >
                    <span
                      v-if="deleteLoading[user.id]"
                      class="spinner-border spinner-border-sm"
                    ></span>
                    <i v-else class="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile Card View -->
      <div class="d-lg-none">
        <div v-for="user in users" :key="user.id" class="card mb-3 user-card">
          <div class="card-body">
            <div class="d-flex align-items-start justify-content-between mb-3">
              <div class="d-flex align-items-center flex-grow-1">
                <div class="avatar me-3">
                  <div class="avatar-circle">
                    {{ getInitials(user.first_name, user.last_name) }}
                  </div>
                </div>
                <div class="flex-grow-1">
                  <h6 class="mb-1">
                    {{ user.rank ? user.rank + " " : "" }}{{ user.first_name }}
                    {{ user.last_name }}
                  </h6>
                  <small class="text-muted">@{{ user.username }}</small>
                </div>
              </div>

              <div class="form-check form-switch">
                <input
                  class="form-check-input"
                  type="checkbox"
                  :checked="user.is_active"
                  @change="toggleUserStatus(user.id, $event.target.checked)"
                  :disabled="toggleLoading[user.id]"
                />
              </div>
            </div>

            <div class="row mb-3">
              <div class="col-12 mb-2">
                <small class="text-muted">ตำแหน่ง/หน่วยงาน:</small>
                <div>
                  {{ user.position ? user.position : "-" }}
                  {{ user.department ? " / " + user.department : "" }}
                </div>
              </div>

              <div class="col-12 mb-2">
                <small class="text-muted">ติดต่อ:</small>
                <div class="small">
                  <div v-if="user.phone">
                    <i class="bi bi-telephone me-1"></i>{{ user.phone }}
                  </div>
                  <div v-if="user.line_id">
                    <i class="bi bi-line me-1"></i>{{ user.line_id }}
                  </div>
                  <div v-if="user.email">
                    <i class="bi bi-envelope me-1"></i>
                    <a
                      :href="`mailto:${user.email}`"
                      class="text-decoration-none"
                    >
                      {{ user.email }}
                    </a>
                  </div>
                  <span v-if="!user.phone && !user.line_id && !user.email"
                    >-</span
                  >
                </div>
              </div>

              <div class="col-6">
                <small class="text-muted">บทบาท:</small>
                <div>
                  <span :class="getRoleBadgeClass(user.role)" class="badge">
                    <i :class="getRoleIcon(user.role)" class="me-1"></i>
                    {{ getRoleText(user.role) }}
                  </span>
                </div>
              </div>

              <div class="col-6">
                <small class="text-muted">การอนุมัติ:</small>
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
            </div>
            <div class="d-flex gap-2">
              <button
                class="btn btn-outline-primary btn-sm flex-fill"
                @click="viewUser(user.id)"
                :disabled="!user.id || user.id === 'undefined'"
              >
                <i class="bi bi-eye me-1"></i>
                ดู
              </button>
              <button
                class="btn btn-outline-secondary btn-sm flex-fill"
                @click="editUser(user.id)"
                :disabled="!user.id || user.id === 'undefined'"
              >
                <i class="bi bi-pencil me-1"></i>
                แก้ไข
              </button>
              <button
                class="btn btn-outline-danger btn-sm flex-fill"
                @click="deleteUser(user.id)"
                :disabled="
                  deleteLoading[user.id] || !user.id || user.id === 'undefined'
                "
              >
                <span
                  v-if="deleteLoading[user.id]"
                  class="spinner-border spinner-border-sm me-1"
                ></span>
                <i v-else class="bi bi-trash me-1"></i>
                ลบ
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- No Data State -->
      <div v-if="users.length === 0" class="text-center py-5">
        <i class="bi bi-people text-muted" style="font-size: 3rem"></i>
        <h5 class="mt-3">ไม่พบข้อมูลผู้ใช้</h5>
        <p class="text-muted">
          {{
            searchQuery ||
            selectedRole ||
            selectedStatus ||
            selectedApprovalStatus ||
            selectedDepartment
              ? "ไม่มีผู้ใช้ที่ตรงกับเงื่อนไขการค้นหา"
              : "ยังไม่มีผู้ใช้ในระบบ"
          }}
        </p>
        <router-link
          v-if="
            !searchQuery &&
            !selectedRole &&
            !selectedStatus &&
            !selectedApprovalStatus &&
            !selectedDepartment
          "
          to="/users/create"
          class="btn btn-primary"
        >
          <i class="bi bi-plus-circle me-2"></i>
          เพิ่มผู้ใช้แรก
        </router-link>
      </div>

      <!-- Pagination -->
      <div
        v-if="totalPages > 1"
        class="d-flex justify-content-between align-items-center mt-4"
      >
        <div class="text-muted">
          แสดง {{ startRecord }}-{{ endRecord }} จาก {{ totalUsers }} รายการ
        </div>
        <nav>
          <ul class="pagination mb-0">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <button
                class="page-link"
                @click="changePage(currentPage - 1)"
                :disabled="currentPage === 1"
              >
                <i class="bi bi-chevron-left"></i>
              </button>
            </li>

            <li
              v-for="page in visiblePages"
              :key="page"
              class="page-item"
              :class="{ active: page === currentPage }"
            >
              <button class="page-link" @click="changePage(page)">
                {{ page }}
              </button>
            </li>

            <li
              class="page-item"
              :class="{ disabled: currentPage === totalPages }"
            >
              <button
                class="page-link"
                @click="changePage(currentPage + 1)"
                :disabled="currentPage === totalPages"
              >
                <i class="bi bi-chevron-right"></i>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import userService from "@/services/userService";
import moment from "moment";

const router = useRouter();

// State
const loading = ref(true);
const users = ref([]);
const searchQuery = ref("");
const selectedRole = ref("");
const selectedStatus = ref("");
const selectedApprovalStatus = ref("");
const selectedDepartment = ref("");
const currentPage = ref(1);
const totalPages = ref(1);
const totalUsers = ref(0);
const perPage = 20;

// Loading states for individual actions
const toggleLoading = reactive({});
const deleteLoading = reactive({});
const approvalLoading = reactive({});

// Computed properties
const visiblePages = computed(() => {
  const pages = [];
  const start = Math.max(1, currentPage.value - 2);
  const end = Math.min(totalPages.value, currentPage.value + 2);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
});

const activeUsers = computed(() => {
  return users.value.filter((user) => user.is_active).length;
});

const inactiveUsers = computed(() => {
  return users.value.filter((user) => !user.is_active).length;
});

const onlineUsers = computed(() => {
  // Mock online users count - in real app, this would be based on last activity
  return Math.floor(activeUsers.value * 0.3);
});

const adminUsers = computed(() => {
  return users.value.filter((user) => user.role === "Admin").length;
});

const reviewerUsers = computed(() => {
  return users.value.filter((user) => user.role === "Reviewer").length;
});

const surveyorUsers = computed(() => {
  return users.value.filter((user) => user.role === "Surveyor").length;
});

const pendingUsers = computed(() => {
  return users.value.filter((user) => user.approval_status === "pending")
    .length;
});

const approvedUsers = computed(() => {
  return users.value.filter((user) => user.approval_status === "approved")
    .length;
});

const rejectedUsers = computed(() => {
  return users.value.filter((user) => user.approval_status === "rejected")
    .length;
});

const uniqueDepartments = computed(() => {
  const departments = users.value
    .map((user) => user.department)
    .filter((dept) => dept && dept.trim() !== "");
  return [...new Set(departments)].sort();
});

const startRecord = computed(() => {
  return (currentPage.value - 1) * perPage + 1;
});

const endRecord = computed(() => {
  return Math.min(currentPage.value * perPage, totalUsers.value);
});

// Methods
const loadUsers = async () => {
  try {
    loading.value = true;

    const params = {
      page: currentPage.value,
      limit: perPage,
      search: searchQuery.value,
      role: selectedRole.value,
      status: selectedStatus.value,
      approvalStatus: selectedApprovalStatus.value,
      department: selectedDepartment.value,
    };

    const response = await userService.getUsers(params);
    console.log("Users API response:", response); // Debug logging

    if (response.success || response.data) {
      // Handle different response structures
      const userData = response.data || response;
      users.value = userData.users || userData || [];
      totalPages.value =
        userData.totalPages ||
        Math.ceil((userData.total || users.value.length) / perPage) ||
        1;
      totalUsers.value = userData.total || users.value.length;

      // Ensure all users have valid IDs - fix missing or undefined IDs
      users.value = users.value.map((user, index) => {
        if (!user.id) {
          console.warn("User without ID found, assigning temporary ID:", user);
          // Use a combination of index and unique identifier if available
          user.id = user.user_id || user._id || `temp_${index}_${Date.now()}`;
        }
        return user;
      });

      // Debug: Check final user structure
      console.log("Processed users:", users.value);
    } else {
      showToast(
        response.message || "เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้",
        "error"
      );
      users.value = [];
      totalPages.value = 1;
      totalUsers.value = 0;
    }
  } catch (err) {
    console.error("Error loading users:", err);
    const errorMessage =
      err.response?.data?.message || "เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้";
    showToast(errorMessage, "error");
    users.value = [];
    totalPages.value = 1;
    totalUsers.value = 0;
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  currentPage.value = 1;
  loadUsers();
};

const handleFilter = () => {
  currentPage.value = 1;
  loadUsers();
};

const clearSearch = () => {
  searchQuery.value = "";
  currentPage.value = 1;
  loadUsers();
};

const refreshUsers = () => {
  showToast("กำลังรีเฟรชข้อมูล...", "info");
  loadUsers();
};

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    loadUsers();
  }
};

const getInitials = (firstName, lastName) => {
  const first = firstName ? firstName.charAt(0).toUpperCase() : "";
  const last = lastName ? lastName.charAt(0).toUpperCase() : "";
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
  return moment(dateString).format("DD/MM/YYYY");
};

const formatRelativeTime = (dateString) => {
  return moment(dateString).fromNow();
};

// Toast notification function
const showToast = (message, type = "info") => {
  // Create toast element
  const toast = document.createElement("div");
  toast.className = `toast-notification toast-${type}`;
  toast.textContent = message;

  // Add toast to document
  document.body.appendChild(toast);

  // Show toast
  setTimeout(() => {
    toast.classList.add("show");
  }, 100);

  // Remove toast after 3 seconds
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 3000);
};

const toggleUserStatus = async (userId, isActive) => {
  // Validate user ID
  if (!userId || userId === "undefined" || userId === "null") {
    console.error("Invalid user ID for toggle status:", userId);
    showToast("ไม่สามารถเปลี่ยนสถานะผู้ใช้ได้: ไม่พบข้อมูลผู้ใช้", "error");
    return;
  }

  // Convert to string for consistency
  const userIdStr = String(userId);

  try {
    toggleLoading[userIdStr] = true;
    const response = await userService.updateUserStatus(userIdStr, isActive);

    if (response.success || response.data) {
      // Update local state
      const user = users.value.find((u) => String(u.id) === userIdStr);
      if (user) {
        user.is_active = isActive;
      }

      // Show success message
      const action = isActive ? "เปิด" : "ปิด";
      showToast(`${action}ใช้งานผู้ใช้สำเร็จ`, "success");
    } else {
      // Revert checkbox state on failure
      const user = users.value.find((u) => String(u.id) === userIdStr);
      if (user) {
        user.is_active = !isActive;
      }
      showToast(
        response.message || "เกิดข้อผิดพลาดในการอัปเดตสถานะผู้ใช้",
        "error"
      );
    }
  } catch (err) {
    console.error("Error updating user status:", err);

    // Revert checkbox state
    const user = users.value.find((u) => String(u.id) === userIdStr);
    if (user) {
      user.is_active = !isActive;
    }

    const errorMessage =
      err.response?.data?.message || "เกิดข้อผิดพลาดในการอัปเดตสถานะผู้ใช้";
    showToast(errorMessage, "error");
  } finally {
    toggleLoading[userIdStr] = false;
  }
};

const viewUser = (userId) => {
  if (!userId || userId === "undefined" || userId === "null") {
    console.error("Invalid user ID for view:", userId);
    showToast("ไม่พบข้อมูลผู้ใช้ที่ระบุ", "error");
    return;
  }
  console.log("Navigating to view user:", userId);
  router.push(`/users/${userId}`);
};

const editUser = (userId) => {
  if (!userId || userId === "undefined" || userId === "null") {
    console.error("Invalid user ID for edit:", userId);
    showToast("ไม่พบข้อมูลผู้ใช้ที่ระบุ", "error");
    return;
  }
  console.log("Navigating to edit user:", userId);
  router.push(`/users/${userId}/edit`);
};

const updateApprovalStatus = async (userId, status) => {
  // Validate user ID
  if (!userId || userId === "undefined" || userId === "null") {
    console.error("Invalid user ID for approval status update:", userId);
    showToast("ไม่สามารถอัปเดตสถานะการอนุมัติได้: ไม่พบข้อมูลผู้ใช้", "error");
    return;
  }

  // Convert to string for consistency
  const userIdStr = String(userId);

  try {
    approvalLoading[userIdStr] = true;
    const response = await userService.updateUserApprovalStatus(
      userIdStr,
      status
    );

    if (response.success || response.data) {
      // Update local state
      const user = users.value.find((u) => String(u.id) === userIdStr);
      if (user) {
        user.approval_status = status;
      }

      // Show success message
      let statusText = "อัปเดต";
      if (status === "approved") statusText = "อนุมัติ";
      if (status === "rejected") statusText = "ปฏิเสธ";

      showToast(`${statusText}ผู้ใช้สำเร็จ`, "success");
    } else {
      showToast(
        response.message || "เกิดข้อผิดพลาดในการอัปเดตสถานะการอนุมัติ",
        "error"
      );
    }
  } catch (err) {
    console.error("Error updating approval status:", err);
    const errorMessage =
      err.response?.data?.message || "เกิดข้อผิดพลาดในการอัปเดตสถานะการอนุมัติ";
    showToast(errorMessage, "error");
  } finally {
    approvalLoading[userIdStr] = false;
  }
};

const deleteUser = async (userId) => {
  if (!userId || userId === "undefined" || userId === "null") {
    console.error("Invalid user ID for delete:", userId);
    showToast("ไม่สามารถลบผู้ใช้ได้: ไม่พบข้อมูลผู้ใช้", "error");
    return;
  }

  // Convert to string for consistency
  const userIdStr = String(userId);
  const user = users.value.find((u) => String(u.id) === userIdStr);
  const userName = user ? `${user.first_name} ${user.last_name}` : "ผู้ใช้นี้";

  // Check if this is the last admin user
  if (user?.role === "Admin" && adminUsers.value <= 1) {
    showToast("ไม่สามารถลบผู้ดูแลระบบคนสุดท้ายได้", "error");
    return;
  }

  // Enhanced confirmation dialog
  const confirmMessage = `
⚠️ คำเตือน: คุณกำลังจะลบผู้ใช้

ชื่อ: ${userName}
Username: ${user?.username || "ไม่ระบุ"}
Email: ${user?.email || "ไม่ระบุ"}
บทบาท: ${getRoleText(user?.role)}

การดำเนินการนี้ไม่สามารถยกเลิกได้!

คุณแน่ใจหรือไม่ที่จะลบผู้ใช้นี้?`;

  if (!confirm(confirmMessage)) {
    return;
  }

  try {
    deleteLoading[userIdStr] = true;
    const response = await userService.deleteUser(userIdStr);

    if (response.success || response.data) {
      // Remove from local state
      users.value = users.value.filter((u) => String(u.id) !== userIdStr);
      totalUsers.value--;

      // Recalculate pagination if needed
      if (users.value.length === 0 && currentPage.value > 1) {
        currentPage.value--;
        await loadUsers();
      }

      showToast("ลบผู้ใช้สำเร็จ", "success");
    } else {
      showToast(response.message || "เกิดข้อผิดพลาดในการลบผู้ใช้", "error");
    }
  } catch (err) {
    console.error("Error deleting user:", err);
    const errorMessage =
      err.response?.data?.message || "เกิดข้อผิดพลาดในการลบผู้ใช้";
    showToast(errorMessage, "error");
  } finally {
    deleteLoading[userIdStr] = false;
  }
};

// Lifecycle
onMounted(() => {
  loadUsers();
});
</script>

<style scoped>
.user-list {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem;
}

.user-header {
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  margin-bottom: 1.5rem;
}

.stats-row {
  display: flex;
  gap: 1.5rem;
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(var(--bs-primary-rgb), 0.05);
  border-radius: 0.375rem;
  border-left: 4px solid var(--bs-primary);
  flex-wrap: wrap;
}

.stat-separator {
  width: 1px;
  background-color: rgba(var(--bs-primary-rgb), 0.2);
  margin: 0 0.5rem;
}

.stat-item {
  text-align: center;
  flex: 1;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--bs-secondary);
  margin-top: 0.25rem;
}

.avatar-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--bs-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.1);
}

.table {
  background: white;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.table th {
  font-weight: 600;
  border-bottom: 2px solid var(--bs-border-color);
  padding: 1rem 0.75rem;
}

.table td {
  padding: 1rem 0.75rem;
  vertical-align: middle;
}

.user-card {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  border: none;
  transition: all 0.15s ease-in-out;
}

.user-card:hover {
  box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.form-switch .form-check-input {
  cursor: pointer;
}

.form-switch .form-check-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-group .btn {
  border-radius: 0;
}

.btn-group .btn:first-child {
  border-top-left-radius: 0.375rem;
  border-bottom-left-radius: 0.375rem;
}

.btn-group .btn:last-child {
  border-top-right-radius: 0.375rem;
  border-bottom-right-radius: 0.375rem;
}

.badge {
  font-size: 0.75em;
  padding: 0.35em 0.65em;
}

.text-monospace {
  font-family: "Courier New", Courier, monospace;
  font-size: 0.9em;
  background: rgba(var(--bs-secondary-rgb), 0.1);
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
}

/* Search input enhancements */
.input-group .form-control:focus {
  border-color: var(--bs-primary);
  box-shadow: 0 0 0 0.2rem rgba(var(--bs-primary-rgb), 0.25);
}

.input-group .input-group-text {
  background-color: rgba(var(--bs-primary-rgb), 0.1);
  border-color: var(--bs-border-color);
}

/* Pagination styling */
.pagination .page-link {
  border-color: var(--bs-border-color);
  color: var(--bs-primary);
}

.pagination .page-item.active .page-link {
  background-color: var(--bs-primary);
  border-color: var(--bs-primary);
}

.pagination .page-link:hover {
  background-color: rgba(var(--bs-primary-rgb), 0.1);
  border-color: var(--bs-primary);
}

/* Loading states */
.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

/* Empty state styling */
.text-center .bi-people {
  opacity: 0.3;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .user-list {
    padding: 0.5rem;
  }

  .user-header {
    padding: 1rem;
  }

  .d-flex.justify-content-between {
    flex-direction: column;
    gap: 1rem;
  }

  .stats-row {
    gap: 1rem;
    padding: 0.75rem;
  }

  .stat-number {
    font-size: 1.25rem;
  }

  .stat-label {
    font-size: 0.8rem;
  }
}

@media (max-width: 575.98px) {
  .user-header {
    padding: 0.75rem;
  }

  .stats-row {
    flex-direction: column;
    gap: 0.5rem;
    text-align: left;
  }

  .stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
    border-bottom: 1px solid rgba(var(--bs-border-color-rgb), 0.5);
  }

  .stat-item:last-child {
    border-bottom: none;
  }

  .avatar-circle {
    width: 35px;
    height: 35px;
    font-size: 0.8rem;
  }

  .btn {
    font-size: 0.875rem;
  }

  .d-flex.justify-content-between.align-items-center {
    align-items: flex-start !important;
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
.form-select,
.user-card {
  transition: all 0.15s ease-in-out;
}

/* Link styling */
a {
  color: var(--bs-primary);
  text-decoration: none;
}

a:hover {
  color: var(--bs-primary);
  opacity: 0.8;
}

/* Table hover effects */
.table-hover > tbody > tr:hover > * {
  background-color: rgba(var(--bs-primary-rgb), 0.05);
}

/* Custom scrollbar for mobile cards */
@media (max-width: 767.98px) {
  .user-content {
    max-height: 70vh;
    overflow-y: auto;
  }

  .user-content::-webkit-scrollbar {
    width: 4px;
  }

  .user-content::-webkit-scrollbar-track {
    background: transparent;
  }

  .user-content::-webkit-scrollbar-thumb {
    background: var(--bs-border-color);
    border-radius: 2px;
  }

  .user-content::-webkit-scrollbar-thumb:hover {
    background: var(--bs-secondary);
  }
}

/* Enhanced mobile card layout */
@media (max-width: 767.98px) {
  .user-card .card-body {
    padding: 1rem;
  }

  .user-card .d-flex.gap-2 .btn {
    font-size: 0.8rem;
    padding: 0.375rem 0.5rem;
  }
}

/* Print styles */
@media print {
  .btn,
  .pagination,
  .form-switch {
    display: none !important;
  }

  .card {
    box-shadow: none !important;
    border: 1px solid #000 !important;
  }

  .table {
    box-shadow: none !important;
  }
}

/* Toast Notifications */
:global(.toast-notification) {
  position: fixed;
  top: 20px;
  right: 20px;
  min-width: 300px;
  padding: 1rem;
  border-radius: 0.5rem;
  color: white;
  font-weight: 500;
  z-index: 9999;
  transform: translateX(100%);
  transition: transform 0.3s ease-in-out;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

:global(.toast-notification.show) {
  transform: translateX(0);
}

:global(.toast-success) {
  background-color: #198754;
}

:global(.toast-error) {
  background-color: #dc3545;
}

:global(.toast-warning) {
  background-color: #fd7e14;
}

:global(.toast-info) {
  background-color: #0d6efd;
}
</style>
