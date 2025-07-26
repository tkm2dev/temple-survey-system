<template>
  <div class="audit-list">
    <!-- Header Section -->
    <div class="audit-header mb-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 class="mb-1">
            <i class="bi bi-shield-check me-2 text-success"></i>
            ระบบตรวจสอบและอนุมัติ
          </h2>
          <p class="text-muted mb-0">
            <i class="bi bi-info-circle me-1"></i>
            ตรวจสอบและอนุมัติการใช้งานระบบ
          </p>
        </div>

        <div class="d-flex gap-2">
          <button
            @click="refreshData"
            class="btn btn-outline-secondary"
            :disabled="loading"
          >
            <i class="bi bi-arrow-clockwise me-2"></i>
            รีเฟรช
          </button>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="row">
        <div class="col-md-3 mb-3">
          <div class="stat-card">
            <div class="stat-icon bg-warning">
              <i class="bi bi-clock-history"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ pendingUsers }}</div>
              <div class="stat-label">รออนุมัติ</div>
            </div>
          </div>
        </div>
        <div class="col-md-3 mb-3">
          <div class="stat-card">
            <div class="stat-icon bg-success">
              <i class="bi bi-check-circle"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ approvedUsers }}</div>
              <div class="stat-label">อนุมัติแล้ว</div>
            </div>
          </div>
        </div>
        <div class="col-md-3 mb-3">
          <div class="stat-card">
            <div class="stat-icon bg-danger">
              <i class="bi bi-x-circle"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ rejectedUsers }}</div>
              <div class="stat-label">ปฏิเสธ</div>
            </div>
          </div>
        </div>
        <div class="col-md-3 mb-3">
          <div class="stat-card">
            <div class="stat-icon bg-info">
              <i class="bi bi-people"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ totalUsers }}</div>
              <div class="stat-label">ผู้ใช้ทั้งหมด</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs Navigation -->
    <div class="audit-tabs">
      <ul class="nav nav-tabs" role="tablist">
        <li class="nav-item" role="presentation">
          <button
            class="nav-link active"
            data-bs-toggle="tab"
            data-bs-target="#pending-users-tab"
            type="button"
            role="tab"
          >
            <i class="bi bi-clock-history me-2"></i>
            รออนุมัติ ({{ pendingUsers }})
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button
            class="nav-link"
            data-bs-toggle="tab"
            data-bs-target="#approved-users-tab"
            type="button"
            role="tab"
          >
            <i class="bi bi-check-circle me-2"></i>
            อนุมัติแล้ว
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button
            class="nav-link"
            data-bs-toggle="tab"
            data-bs-target="#audit-logs-tab"
            type="button"
            role="tab"
          >
            <i class="bi bi-journal-text me-2"></i>
            ประวัติการตรวจสอบ
          </button>
        </li>
      </ul>

      <div class="tab-content mt-4">
        <!-- Pending Users Tab -->
        <div
          class="tab-pane fade show active"
          id="pending-users-tab"
          role="tabpanel"
        >
          <div class="pending-users-section">
            <!-- Search and Filter -->
            <div class="row mb-3">
              <div class="col-md-6">
                <div class="input-group">
                  <span class="input-group-text">
                    <i class="bi bi-search"></i>
                  </span>
                  <input
                    type="text"
                    class="form-control"
                    placeholder="ค้นหาผู้ใช้งาน..."
                    v-model="searchTerm"
                  />
                </div>
              </div>
              <div class="col-md-3">
                <select class="form-select" v-model="selectedDepartmentFilter">
                  <option value="">หน่วยงานทั้งหมด</option>
                  <option
                    v-for="dept in uniqueDepartments"
                    :key="dept"
                    :value="dept"
                  >
                    {{ dept }}
                  </option>
                </select>
              </div>
              <div class="col-md-3">
                <select class="form-select" v-model="sortBy">
                  <option value="created_at">วันที่สมัคร</option>
                  <option value="full_name">ชื่อ-นามสกุล</option>
                  <option value="department">หน่วยงาน</option>
                </select>
              </div>
            </div>

            <!-- Pending Users Table -->
            <div class="table-responsive">
              <table class="table table-hover">
                <thead class="table-light">
                  <tr>
                    <th>รหัสผู้ใช้</th>
                    <th>ชื่อ-นามสกุล</th>
                    <th>ยศ</th>
                    <th>ตำแหน่ง</th>
                    <th>หน่วยงาน</th>
                    <th>เบอร์โทร</th>
                    <th>Line ID</th>
                    <th>วันที่สมัคร</th>
                    <th>การจัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in filteredPendingUsers" :key="user.id">
                    <td>{{ user.code }}</td>
                    <td>{{ user.full_name }}</td>
                    <td>
                      <span class="badge bg-secondary">
                        {{ user.rank || "ไม่ระบุ" }}
                      </span>
                    </td>
                    <td>{{ user.position || "ไม่ระบุ" }}</td>
                    <td>{{ user.department }}</td>
                    <td>{{ user.phone || "-" }}</td>
                    <td>{{ user.line_id || "-" }}</td>
                    <td>{{ formatDate(user.created_at) }}</td>
                    <td>
                      <div class="btn-group btn-group-sm">
                        <button
                          class="btn btn-outline-info"
                          @click="viewUserDetail(user)"
                          title="ดูรายละเอียด"
                        >
                          <i class="bi bi-eye"></i>
                        </button>
                        <button
                          class="btn btn-outline-success"
                          @click="approveUser(user.id)"
                          title="อนุมัติ"
                        >
                          <i class="bi bi-check-lg"></i>
                        </button>
                        <button
                          class="btn btn-outline-danger"
                          @click="rejectUser(user.id)"
                          title="ปฏิเสธ"
                        >
                          <i class="bi bi-x-lg"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="filteredPendingUsers.length === 0">
                    <td colspan="9" class="text-center text-muted py-4">
                      <i class="bi bi-inbox me-2"></i>
                      ไม่มีผู้ใช้งานที่รออนุมัติ
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Approved Users Tab -->
        <div class="tab-pane fade" id="approved-users-tab" role="tabpanel">
          <div class="approved-users-section">
            <!-- Search and Filter -->
            <div class="row mb-3">
              <div class="col-md-6">
                <div class="input-group">
                  <span class="input-group-text">
                    <i class="bi bi-search"></i>
                  </span>
                  <input
                    type="text"
                    class="form-control"
                    placeholder="ค้นหาผู้ใช้งาน..."
                    v-model="approvedSearchTerm"
                  />
                </div>
              </div>
              <div class="col-md-3">
                <select class="form-select" v-model="approvedStatusFilter">
                  <option value="">สถานะทั้งหมด</option>
                  <option value="active">ใช้งาน</option>
                  <option value="inactive">ไม่ใช้งาน</option>
                </select>
              </div>
            </div>

            <!-- Approved Users Table -->
            <div class="table-responsive">
              <table class="table table-hover">
                <thead class="table-light">
                  <tr>
                    <th>รหัสผู้ใช้</th>
                    <th>ชื่อ-นามสกุล</th>
                    <th>ยศ</th>
                    <th>ตำแหน่ง</th>
                    <th>หน่วยงาน</th>
                    <th>สถานะ</th>
                    <th>วันที่อนุมัติ</th>
                    <th>การจัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in filteredApprovedUsers" :key="user.id">
                    <td>{{ user.code }}</td>
                    <td>{{ user.full_name }}</td>
                    <td>
                      <span class="badge bg-primary">
                        {{ user.rank || "ไม่ระบุ" }}
                      </span>
                    </td>
                    <td>{{ user.position || "ไม่ระบุ" }}</td>
                    <td>{{ user.department }}</td>
                    <td>
                      <span
                        class="badge"
                        :class="
                          user.status === 'active'
                            ? 'bg-success'
                            : 'bg-secondary'
                        "
                      >
                        {{ user.status === "active" ? "ใช้งาน" : "ไม่ใช้งาน" }}
                      </span>
                    </td>
                    <td>{{ formatDate(user.approved_at) }}</td>
                    <td>
                      <div class="btn-group btn-group-sm">
                        <button
                          class="btn btn-outline-info"
                          @click="viewUserDetail(user)"
                          title="ดูรายละเอียด"
                        >
                          <i class="bi bi-eye"></i>
                        </button>
                        <button
                          class="btn btn-outline-warning"
                          @click="toggleUserStatus(user)"
                          :title="
                            user.status === 'active'
                              ? 'ปิดใช้งาน'
                              : 'เปิดใช้งาน'
                          "
                        >
                          <i
                            :class="
                              user.status === 'active'
                                ? 'bi bi-pause'
                                : 'bi bi-play'
                            "
                          ></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="filteredApprovedUsers.length === 0">
                    <td colspan="8" class="text-center text-muted py-4">
                      <i class="bi bi-inbox me-2"></i>
                      ไม่มีข้อมูลผู้ใช้งาน
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Audit Logs Tab -->
        <div class="tab-pane fade" id="audit-logs-tab" role="tabpanel">
          <div class="audit-logs-section">
            <!-- Search and Filter -->
            <div class="row mb-3">
              <div class="col-md-4">
                <div class="input-group">
                  <span class="input-group-text">
                    <i class="bi bi-search"></i>
                  </span>
                  <input
                    type="text"
                    class="form-control"
                    placeholder="ค้นหาประวัติ..."
                    v-model="logSearchTerm"
                  />
                </div>
              </div>
              <div class="col-md-3">
                <select class="form-select" v-model="logActionFilter">
                  <option value="">การกระทำทั้งหมด</option>
                  <option value="approve">อนุมัติ</option>
                  <option value="reject">ปฏิเสธ</option>
                  <option value="activate">เปิดใช้งาน</option>
                  <option value="deactivate">ปิดใช้งาน</option>
                </select>
              </div>
              <div class="col-md-3">
                <input
                  type="date"
                  class="form-control"
                  v-model="logDateFilter"
                  placeholder="วันที่"
                />
              </div>
              <div class="col-md-2">
                <button
                  class="btn btn-outline-secondary w-100"
                  @click="clearLogFilters"
                >
                  <i class="bi bi-x-circle me-1"></i>
                  ล้าง
                </button>
              </div>
            </div>

            <!-- Audit Logs Table -->
            <div class="table-responsive">
              <table class="table table-hover">
                <thead class="table-light">
                  <tr>
                    <th>วันที่/เวลา</th>
                    <th>ผู้ใช้งาน</th>
                    <th>การกระทำ</th>
                    <th>รายละเอียด</th>
                    <th>ผู้ดำเนินการ</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="log in filteredAuditLogs" :key="log.id">
                    <td>{{ formatDateTime(log.created_at) }}</td>
                    <td>
                      <div>
                        <strong>{{ log.target_user_name }}</strong>
                        <br />
                        <small class="text-muted">{{
                          log.target_user_code
                        }}</small>
                      </div>
                    </td>
                    <td>
                      <span
                        class="badge"
                        :class="getActionBadgeClass(log.action)"
                      >
                        {{ getActionText(log.action) }}
                      </span>
                    </td>
                    <td>{{ log.details }}</td>
                    <td>
                      <div>
                        <strong>{{ log.performed_by_name }}</strong>
                        <br />
                        <small class="text-muted">{{
                          log.performed_by_code
                        }}</small>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="filteredAuditLogs.length === 0">
                    <td colspan="5" class="text-center text-muted py-4">
                      <i class="bi bi-inbox me-2"></i>
                      ไม่มีประวัติการตรวจสอบ
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            <nav v-if="auditLogs.length > perPage" class="mt-4">
              <ul class="pagination justify-content-center">
                <li
                  class="page-item"
                  :class="{ disabled: currentLogPage === 1 }"
                >
                  <button
                    class="page-link"
                    @click="currentLogPage = 1"
                    :disabled="currentLogPage === 1"
                  >
                    <i class="bi bi-chevron-double-left"></i>
                  </button>
                </li>
                <li
                  class="page-item"
                  :class="{ disabled: currentLogPage === 1 }"
                >
                  <button
                    class="page-link"
                    @click="currentLogPage--"
                    :disabled="currentLogPage === 1"
                  >
                    <i class="bi bi-chevron-left"></i>
                  </button>
                </li>
                <li
                  class="page-item"
                  v-for="page in visibleLogPages"
                  :key="page"
                  :class="{ active: page === currentLogPage }"
                >
                  <button class="page-link" @click="currentLogPage = page">
                    {{ page }}
                  </button>
                </li>
                <li
                  class="page-item"
                  :class="{ disabled: currentLogPage === totalLogPages }"
                >
                  <button
                    class="page-link"
                    @click="currentLogPage++"
                    :disabled="currentLogPage === totalLogPages"
                  >
                    <i class="bi bi-chevron-right"></i>
                  </button>
                </li>
                <li
                  class="page-item"
                  :class="{ disabled: currentLogPage === totalLogPages }"
                >
                  <button
                    class="page-link"
                    @click="currentLogPage = totalLogPages"
                    :disabled="currentLogPage === totalLogPages"
                  >
                    <i class="bi bi-chevron-double-right"></i>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- User Detail Modal -->
    <div
      v-if="showUserDetailModalState"
      class="modal fade show"
      style="display: block"
      tabindex="-1"
      @click.self="hideUserDetailModal"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-person-lines-fill me-2"></i>
              รายละเอียดผู้ใช้งาน
            </h5>
            <button
              type="button"
              class="btn-close"
              @click="hideUserDetailModal"
            ></button>
          </div>
          <div class="modal-body" v-if="selectedUser">
            <div class="row">
              <div class="col-md-6 mb-3">
                <strong>รหัสผู้ใช้:</strong>
                <p class="mt-1">{{ selectedUser.code }}</p>
              </div>
              <div class="col-md-6 mb-3">
                <strong>อีเมล:</strong>
                <p class="mt-1">{{ selectedUser.email }}</p>
              </div>
            </div>

            <div class="row">
              <div class="col-md-12 mb-3">
                <strong>ชื่อ-นามสกุล:</strong>
                <p class="mt-1">{{ selectedUser.full_name }}</p>
              </div>
            </div>

            <div class="row">
              <div class="col-md-6 mb-3">
                <strong>ยศ:</strong>
                <p class="mt-1">{{ selectedUser.rank || "ไม่ระบุ" }}</p>
              </div>
              <div class="col-md-6 mb-3">
                <strong>ตำแหน่ง:</strong>
                <p class="mt-1">{{ selectedUser.position || "ไม่ระบุ" }}</p>
              </div>
            </div>

            <div class="row">
              <div class="col-md-12 mb-3">
                <strong>หน่วยงาน:</strong>
                <p class="mt-1">{{ selectedUser.department }}</p>
              </div>
            </div>

            <div class="row">
              <div class="col-md-6 mb-3">
                <strong>เบอร์โทรศัพท์:</strong>
                <p class="mt-1">{{ selectedUser.phone || "ไม่ระบุ" }}</p>
              </div>
              <div class="col-md-6 mb-3">
                <strong>Line ID:</strong>
                <p class="mt-1">{{ selectedUser.line_id || "ไม่ระบุ" }}</p>
              </div>
            </div>

            <div class="row">
              <div class="col-md-6 mb-3">
                <strong>สถานะ:</strong>
                <p class="mt-1">
                  <span
                    class="badge"
                    :class="getUserStatusBadgeClass(selectedUser.status)"
                  >
                    {{ getUserStatusText(selectedUser.status) }}
                  </span>
                </p>
              </div>
              <div class="col-md-6 mb-3">
                <strong>วันที่สมัคร:</strong>
                <p class="mt-1">{{ formatDate(selectedUser.created_at) }}</p>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              @click="hideUserDetailModal"
            >
              ปิด
            </button>
            <button
              v-if="selectedUser && selectedUser.status === 'pending'"
              type="button"
              class="btn btn-success me-2"
              @click="approveUser(selectedUser.id)"
            >
              <i class="bi bi-check-lg me-2"></i>
              อนุมัติ
            </button>
            <button
              v-if="selectedUser && selectedUser.status === 'pending'"
              type="button"
              class="btn btn-danger"
              @click="rejectUser(selectedUser.id)"
            >
              <i class="bi bi-x-lg me-2"></i>
              ปฏิเสธ
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useToast } from "../../composables/useToast";
import masterDataService from "../../services/masterDataService";

const { showToast } = useToast();

// Reactive data
const loading = ref(false);
const users = ref([]);
const auditLogs = ref([]);

// Search and filter
const searchTerm = ref("");
const approvedSearchTerm = ref("");
const logSearchTerm = ref("");
const selectedDepartmentFilter = ref("");
const approvedStatusFilter = ref("");
const logActionFilter = ref("");
const logDateFilter = ref("");
const sortBy = ref("created_at");

// Modal states
const showUserDetailModalState = ref(false);
const selectedUser = ref(null);

// Pagination
const currentLogPage = ref(1);
const perPage = 20;

// Computed properties
const totalUsers = computed(() => users.value.length);
const pendingUsers = computed(
  () => users.value.filter((u) => u.status === "pending").length
);
const approvedUsers = computed(
  () => users.value.filter((u) => u.status === "active").length
);
const rejectedUsers = computed(
  () => users.value.filter((u) => u.status === "rejected").length
);

const uniqueDepartments = computed(() => {
  const departments = users.value
    .map((user) => user.department)
    .filter((dept) => dept && dept.trim() !== "");
  return [...new Set(departments)].sort();
});

const filteredPendingUsers = computed(() => {
  let filtered = users.value.filter((u) => u.status === "pending");

  if (searchTerm.value) {
    const search = searchTerm.value.toLowerCase();
    filtered = filtered.filter(
      (user) =>
        user.full_name.toLowerCase().includes(search) ||
        user.code.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search) ||
        (user.department && user.department.toLowerCase().includes(search))
    );
  }

  if (selectedDepartmentFilter.value) {
    filtered = filtered.filter(
      (u) => u.department === selectedDepartmentFilter.value
    );
  }

  // Sort
  filtered.sort((a, b) => {
    if (sortBy.value === "created_at") {
      return new Date(b.created_at) - new Date(a.created_at);
    } else if (sortBy.value === "full_name") {
      return a.full_name.localeCompare(b.full_name);
    } else if (sortBy.value === "department") {
      return a.department.localeCompare(b.department);
    }
    return 0;
  });

  return filtered;
});

const filteredApprovedUsers = computed(() => {
  let filtered = users.value.filter(
    (u) => u.status === "active" || u.status === "inactive"
  );

  if (approvedSearchTerm.value) {
    const search = approvedSearchTerm.value.toLowerCase();
    filtered = filtered.filter(
      (user) =>
        user.full_name.toLowerCase().includes(search) ||
        user.code.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search) ||
        (user.department && user.department.toLowerCase().includes(search))
    );
  }

  if (approvedStatusFilter.value) {
    filtered = filtered.filter((u) => u.status === approvedStatusFilter.value);
  }

  return filtered;
});

const filteredAuditLogs = computed(() => {
  let filtered = auditLogs.value;

  if (logSearchTerm.value) {
    const search = logSearchTerm.value.toLowerCase();
    filtered = filtered.filter(
      (log) =>
        log.target_user_name.toLowerCase().includes(search) ||
        log.target_user_code.toLowerCase().includes(search) ||
        log.performed_by_name.toLowerCase().includes(search) ||
        log.details.toLowerCase().includes(search)
    );
  }

  if (logActionFilter.value) {
    filtered = filtered.filter((log) => log.action === logActionFilter.value);
  }

  if (logDateFilter.value) {
    filtered = filtered.filter((log) => {
      const logDate = new Date(log.created_at).toISOString().split("T")[0];
      return logDate === logDateFilter.value;
    });
  }

  return filtered;
});

const totalLogPages = computed(() =>
  Math.ceil(filteredAuditLogs.value.length / perPage)
);
const visibleLogPages = computed(() => {
  const pages = [];
  const start = Math.max(1, currentLogPage.value - 2);
  const end = Math.min(totalLogPages.value, currentLogPage.value + 2);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  return pages;
});

// Methods
const refreshData = async () => {
  loading.value = true;
  try {
    await Promise.all([loadUsers(), loadAuditLogs()]);
  } catch (error) {
    console.error("Refresh data error:", error);
    showToast("เกิดข้อผิดพลาดในการโหลดข้อมูล", "error");
  } finally {
    loading.value = false;
  }
};

const loadUsers = async () => {
  try {
    const response = await masterDataService.getUsers();
    if (response.success && response.data) {
      users.value = response.data;
    }
  } catch (error) {
    console.error("Error loading users:", error);
    throw error;
  }
};

const loadAuditLogs = async () => {
  try {
    const response = await masterDataService.getAuditLogs();
    if (response.success && response.data) {
      auditLogs.value = response.data;
    }
  } catch (error) {
    console.error("Error loading audit logs:", error);
    // Don't throw error for audit logs as it's not critical
  }
};

const viewUserDetail = (user) => {
  selectedUser.value = user;
  showUserDetailModalState.value = true;
};

const hideUserDetailModal = () => {
  showUserDetailModalState.value = false;
  selectedUser.value = null;
};

const approveUser = async (userId) => {
  try {
    const response = await masterDataService.updateUser(userId, {
      status: "active",
      approved_at: new Date().toISOString(),
    });

    if (response.success) {
      const userIndex = users.value.findIndex((u) => u.id === userId);
      if (userIndex !== -1) {
        users.value[userIndex].status = "active";
        users.value[userIndex].approved_at = new Date().toISOString();
      }

      hideUserDetailModal();
      showToast("อนุมัติผู้ใช้งานสำเร็จ", "success");

      // Log the action
      await logAuditAction(userId, "approve", "อนุมัติการใช้งานระบบ");
      await loadAuditLogs();
    } else {
      throw new Error(response.message || "อนุมัติผู้ใช้งานไม่สำเร็จ");
    }
  } catch (error) {
    console.error("Approve user error:", error);
    showToast("เกิดข้อผิดพลาด: " + error.message, "error");
  }
};

const rejectUser = async (userId) => {
  if (confirm("คุณแน่ใจหรือไม่ที่จะปฏิเสธผู้ใช้งานนี้?")) {
    try {
      const response = await masterDataService.updateUser(userId, {
        status: "rejected",
        rejected_at: new Date().toISOString(),
      });

      if (response.success) {
        const userIndex = users.value.findIndex((u) => u.id === userId);
        if (userIndex !== -1) {
          users.value[userIndex].status = "rejected";
          users.value[userIndex].rejected_at = new Date().toISOString();
        }

        hideUserDetailModal();
        showToast("ปฏิเสธผู้ใช้งานสำเร็จ", "success");

        // Log the action
        await logAuditAction(userId, "reject", "ปฏิเสธการใช้งานระบบ");
        await loadAuditLogs();
      } else {
        throw new Error(response.message || "ปฏิเสธผู้ใช้งานไม่สำเร็จ");
      }
    } catch (error) {
      console.error("Reject user error:", error);
      showToast("เกิดข้อผิดพลาด: " + error.message, "error");
    }
  }
};

const toggleUserStatus = async (user) => {
  const newStatus = user.status === "active" ? "inactive" : "active";
  const action = newStatus === "active" ? "เปิดใช้งาน" : "ปิดใช้งาน";

  if (confirm(`คุณแน่ใจหรือไม่ที่จะ${action}ผู้ใช้งานนี้?`)) {
    try {
      const response = await masterDataService.updateUser(user.id, {
        status: newStatus,
      });

      if (response.success) {
        const userIndex = users.value.findIndex((u) => u.id === user.id);
        if (userIndex !== -1) {
          users.value[userIndex].status = newStatus;
        }

        showToast(`${action}ผู้ใช้งานสำเร็จ`, "success");

        // Log the action
        await logAuditAction(
          user.id,
          newStatus === "active" ? "activate" : "deactivate",
          `${action}ผู้ใช้งาน`
        );
        await loadAuditLogs();
      } else {
        throw new Error(response.message || `${action}ผู้ใช้งานไม่สำเร็จ`);
      }
    } catch (error) {
      console.error("Toggle user status error:", error);
      showToast("เกิดข้อผิดพลาด: " + error.message, "error");
    }
  }
};

const logAuditAction = async (targetUserId, action, details) => {
  try {
    const targetUser = users.value.find((u) => u.id === targetUserId);
    if (!targetUser) return;

    await masterDataService.createAuditLog({
      target_user_id: targetUserId,
      target_user_name: targetUser.full_name,
      target_user_code: targetUser.code,
      action: action,
      details: details,
      performed_by_id: 1, // Current admin user ID
      performed_by_name: "ผู้ดูแลระบบ",
      performed_by_code: "ADMIN001",
    });
  } catch (error) {
    console.error("Log audit action error:", error);
  }
};

const clearLogFilters = () => {
  logSearchTerm.value = "";
  logActionFilter.value = "";
  logDateFilter.value = "";
};

const getUserStatusBadgeClass = (status) => {
  switch (status) {
    case "active":
      return "bg-success";
    case "inactive":
      return "bg-secondary";
    case "pending":
      return "bg-warning";
    case "rejected":
      return "bg-danger";
    default:
      return "bg-secondary";
  }
};

const getUserStatusText = (status) => {
  switch (status) {
    case "active":
      return "ใช้งาน";
    case "inactive":
      return "ไม่ใช้งาน";
    case "pending":
      return "รออนุมัติ";
    case "rejected":
      return "ปฏิเสธ";
    default:
      return "ไม่ระบุ";
  }
};

const getActionBadgeClass = (action) => {
  switch (action) {
    case "approve":
      return "bg-success";
    case "reject":
      return "bg-danger";
    case "activate":
      return "bg-info";
    case "deactivate":
      return "bg-warning";
    default:
      return "bg-secondary";
  }
};

const getActionText = (action) => {
  switch (action) {
    case "approve":
      return "อนุมัติ";
    case "reject":
      return "ปฏิเสธ";
    case "activate":
      return "เปิดใช้งาน";
    case "deactivate":
      return "ปิดใช้งาน";
    default:
      return action;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatDateTime = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Lifecycle
onMounted(() => {
  refreshData();
});
</script>

<style scoped>
.audit-list {
  padding: 1rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border: none;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #6c757d;
  font-weight: 500;
}

.nav-tabs .nav-link {
  border: none;
  border-bottom: 3px solid transparent;
  background: none;
  color: #6c757d;
  font-weight: 500;
  padding: 1rem 1.5rem;
  transition: all 0.3s ease;
}

.nav-tabs .nav-link:hover {
  border-color: #dee2e6;
  color: #495057;
}

.nav-tabs .nav-link.active {
  background-color: transparent;
  border-color: #007bff;
  color: #007bff;
  font-weight: 600;
}

.table th {
  background-color: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
  font-weight: 600;
  color: #495057;
  white-space: nowrap;
}

.table-hover tbody tr:hover {
  background-color: rgba(0, 123, 255, 0.05);
}

.btn-group-sm .btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.modal-content {
  border-radius: 15px;
  border: none;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 15px 15px 0 0;
  border-bottom: none;
}

.modal-header .btn-close {
  filter: invert(1) grayscale(100%) brightness(200%);
}

.badge {
  font-size: 0.75rem;
  padding: 0.375rem 0.75rem;
}

.pagination {
  --bs-pagination-active-bg: #007bff;
  --bs-pagination-active-border-color: #007bff;
}

@media (max-width: 768px) {
  .stat-card {
    padding: 1rem;
  }

  .stat-number {
    font-size: 1.5rem;
  }

  .stat-icon {
    width: 50px;
    height: 50px;
    font-size: 1.25rem;
  }

  .table-responsive {
    font-size: 0.875rem;
  }
}
</style>
