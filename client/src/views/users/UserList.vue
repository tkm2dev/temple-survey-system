<template>
  <div class="user-list-container">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="mb-1">จัดการผู้ใช้งาน</h2>
        <p class="text-muted mb-0">รายการผู้ใช้งานทั้งหมดในระบบ</p>
      </div>
      <div class="btn-group">
        <router-link to="/users/create" class="btn btn-primary">
          <i class="bi bi-plus"></i>
          เพิ่มผู้ใช้ใหม่
        </router-link>
        <button class="btn btn-success" @click="showImportModal">
          <i class="bi bi-upload"></i>
          นำเข้าข้อมูล
        </button>
        <button class="btn btn-info" @click="exportUsers">
          <i class="bi bi-download"></i>
          ส่งออกข้อมูล
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="row mb-4">
      <div class="col-md-3">
        <div class="card bg-primary text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h5 class="card-title">ผู้ใช้ทั้งหมด</h5>
                <h3 class="mb-0">{{ statistics.total }}</h3>
              </div>
              <div class="align-self-center">
                <i class="bi bi-people fs-1"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-success text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h5 class="card-title">ใช้งานอยู่</h5>
                <h3 class="mb-0">{{ statistics.active }}</h3>
              </div>
              <div class="align-self-center">
                <i class="bi bi-person-check fs-1"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-warning text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h5 class="card-title">รออนุมัติ</h5>
                <h3 class="mb-0">{{ statistics.pending }}</h3>
              </div>
              <div class="align-self-center">
                <i class="bi bi-clock fs-1"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-secondary text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h5 class="card-title">ไม่ใช้งาน</h5>
                <h3 class="mb-0">{{ statistics.inactive }}</h3>
              </div>
              <div class="align-self-center">
                <i class="bi bi-person-x fs-1"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <!-- Search -->
          <div class="col-md-4">
            <div class="input-group">
              <span class="input-group-text">
                <i class="bi bi-search"></i>
              </span>
              <input
                type="text"
                class="form-control"
                placeholder="ค้นหาชื่อ, username, อีเมล..."
                v-model="searchQuery"
                @input="debounceSearch"
              />
              <button
                class="btn btn-outline-secondary"
                type="button"
                @click="clearSearch"
                v-if="searchQuery"
              >
                <i class="bi bi-x"></i>
              </button>
            </div>
          </div>

          <!-- Role Filter -->
          <div class="col-md-2">
            <select
              class="form-select"
              v-model="filters.role"
              @change="applyFilters"
            >
              <option value="">ทุกบทบาท</option>
              <option value="Admin">ผู้ดูแล</option>
              <option value="Reviewer">ผู้ตรวจ</option>
              <option value="Surveyor">ผู้สำรวจ</option>
            </select>
          </div>

          <!-- Status Filter -->
          <div class="col-md-2">
            <select
              class="form-select"
              v-model="filters.status"
              @change="applyFilters"
            >
              <option value="">ทุกสถานะ</option>
              <option value="1">ใช้งาน</option>
              <option value="0">ไม่ใช้งาน</option>
            </select>
          </div>

          <!-- Approval Filter -->
          <div class="col-md-2">
            <select
              class="form-select"
              v-model="filters.approval"
              @change="applyFilters"
            >
              <option value="">ทุกการอนุมัติ</option>
              <option value="approved">อนุมัติแล้ว</option>
              <option value="pending">รออนุมัติ</option>
              <option value="rejected">ปฏิเสธ</option>
            </select>
          </div>

          <!-- View Mode Toggle -->
          <div class="col-md-2">
            <div class="btn-group w-100" role="group">
              <button
                type="button"
                class="btn"
                :class="
                  viewMode === 'table' ? 'btn-primary' : 'btn-outline-primary'
                "
                @click="viewMode = 'table'"
              >
                <i class="bi bi-table"></i>
              </button>
              <button
                type="button"
                class="btn"
                :class="
                  viewMode === 'grid' ? 'btn-primary' : 'btn-outline-primary'
                "
                @click="viewMode = 'grid'"
              >
                <i class="bi bi-grid-3x3-gap"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bulk Selection Toolbar -->
    <div v-if="selectedItems.length > 0" class="card mb-3 border-primary">
      <div class="card-body py-2">
        <div class="d-flex justify-content-between align-items-center">
          <div class="d-flex align-items-center">
            <span class="badge bg-primary me-2">{{
              selectedItems.length
            }}</span>
            <span class="text-muted">รายการที่เลือก</span>
          </div>
          <div class="btn-group btn-group-sm">
            <button
              class="btn btn-outline-success"
              @click="bulkUpdateStatus(true)"
              :disabled="bulkOperationLoading"
            >
              <i class="bi bi-person-check"></i> เปิดใช้งาน
            </button>
            <button
              class="btn btn-outline-secondary"
              @click="bulkUpdateStatus(false)"
              :disabled="bulkOperationLoading"
            >
              <i class="bi bi-person-x"></i> ปิดใช้งาน
            </button>
            <button
              class="btn btn-outline-info"
              @click="bulkApprove"
              :disabled="bulkOperationLoading"
            >
              <i class="bi bi-check-circle"></i> อนุมัติ
            </button>
            <button
              class="btn btn-outline-warning"
              @click="bulkReject"
              :disabled="bulkOperationLoading"
            >
              <i class="bi bi-x-circle"></i> ปฏิเสธ
            </button>
            <button
              class="btn btn-outline-secondary"
              @click="bulkExport"
              :disabled="bulkOperationLoading"
            >
              <i class="bi bi-download"></i> ส่งออก
            </button>
            <button
              class="btn btn-outline-danger"
              @click="bulkDelete"
              :disabled="bulkOperationLoading"
            >
              <i class="bi bi-trash"></i> ลบ
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">กำลังโหลด...</span>
      </div>
      <p class="mt-2 text-muted">กำลังโหลดข้อมูลผู้ใช้งาน...</p>
    </div>

    <!-- Content -->
    <div v-else>
      <!-- Table View -->
      <div v-if="viewMode === 'table'" class="card">
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-hover">
              <thead class="table-light">
                <tr>
                  <th scope="col" style="width: 40px">
                    <div class="form-check">
                      <input
                        class="form-check-input"
                        type="checkbox"
                        :checked="isAllSelected"
                        @change="toggleSelectAll"
                        :indeterminate="isIndeterminate"
                      />
                    </div>
                  </th>
                  <th scope="col">รูปประจำตัว</th>
                  <th
                    scope="col"
                    @click="sortBy('first_name')"
                    class="sortable"
                    :class="getSortClass('first_name')"
                  >
                    ชื่อผู้ใช้
                  </th>
                  <th scope="col">ตำแหน่ง</th>
                  <th scope="col">หน่วยงาน</th>
                  <th scope="col">ติดต่อ</th>
                  <th
                    scope="col"
                    @click="sortBy('role')"
                    class="sortable"
                    :class="getSortClass('role')"
                  >
                    บทบาท
                  </th>
                  <th scope="col">สถานะ</th>
                  <th scope="col">การอนุมัติ</th>
                  <th
                    scope="col"
                    @click="sortBy('created_at')"
                    class="sortable"
                    :class="getSortClass('created_at')"
                  >
                    วันที่สร้าง
                  </th>
                  <th scope="col" class="text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="user in users"
                  :key="user.user_id"
                  :class="{
                    'table-primary': selectedItems.includes(user.user_id),
                  }"
                >
                  <td>
                    <div class="form-check">
                      <input
                        class="form-check-input"
                        type="checkbox"
                        :value="user.user_id"
                        v-model="selectedItems"
                      />
                    </div>
                  </td>
                  <td>
                    <div class="user-avatar-wrapper">
                      <img
                        v-if="user.profile_image"
                        :src="getProfileImageUrl(user.profile_image)"
                        :alt="`${user.first_name} ${user.last_name}`"
                        class="user-avatar"
                        @error="handleImageError"
                      />
                      <div v-else class="avatar-circle">
                        {{ getInitials(user.first_name, user.last_name) }}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="user-info">
                      <div class="fw-medium">
                        <span v-if="user.rank" class="text-muted me-1">{{
                          user.rank
                        }}</span>
                        {{ user.first_name }} {{ user.last_name }}
                      </div>
                      <small class="text-muted">@{{ user.username }}</small>
                    </div>
                  </td>
                  <td>
                    <span v-if="user.position" class="badge bg-light text-dark">
                      {{ user.position }}
                    </span>
                    <span v-else class="text-muted">-</span>
                  </td>
                  <td>
                    <span v-if="user.department" class="badge bg-secondary">
                      {{ user.department }}
                    </span>
                    <span v-else class="text-muted">-</span>
                  </td>
                  <td>
                    <div class="contact-info">
                      <div v-if="user.email" class="mb-1">
                        <i class="bi bi-envelope me-1"></i>
                        <small>{{ user.email }}</small>
                      </div>
                      <div v-if="user.phone">
                        <i class="bi bi-telephone me-1"></i>
                        <small>{{ user.phone }}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="badge" :class="getRoleBadgeClass(user.role)">
                      {{ getRoleText(user.role) }}
                    </span>
                  </td>
                  <td>
                    <div class="form-check form-switch">
                      <input
                        class="form-check-input"
                        type="checkbox"
                        :id="`status-${user.user_id}`"
                        :checked="user.is_active"
                        @change="toggleUserStatus(user)"
                      />
                      <label
                        class="form-check-label"
                        :for="`status-${user.user_id}`"
                      >
                        <span
                          class="badge"
                          :class="
                            user.is_active ? 'bg-success' : 'bg-secondary'
                          "
                        >
                          {{ user.is_active ? "ใช้งาน" : "ปิดใช้งาน" }}
                        </span>
                      </label>
                    </div>
                  </td>
                  <td>
                    <span
                      class="badge"
                      :class="getApprovalBadgeClass(user.approval_status)"
                    >
                      {{ getApprovalStatusText(user.approval_status) }}
                    </span>
                  </td>
                  <td>
                    <small class="text-muted">
                      {{ formatDate(user.created_at) }}
                      <div v-if="user.created_by_name">
                        โดย: {{ user.created_by_name }}
                      </div>
                    </small>
                  </td>
                  <td class="text-center">
                    <div class="btn-group" role="group">
                      <router-link
                        :to="`/users/${user.user_id}`"
                        class="btn btn-outline-primary btn-sm"
                        title="ดูรายละเอียด"
                      >
                        <i class="bi bi-eye"></i>
                      </router-link>
                      <router-link
                        :to="`/users/${user.user_id}/edit`"
                        class="btn btn-outline-secondary btn-sm"
                        title="แก้ไข"
                      >
                        <i class="bi bi-pencil"></i>
                      </router-link>
                      <button
                        class="btn btn-outline-danger btn-sm"
                        @click="deleteUser(user.user_id)"
                        title="ลบ"
                        :disabled="deleteLoading[user.user_id]"
                      >
                        <span
                          v-if="deleteLoading[user.user_id]"
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
        </div>
      </div>

      <!-- Grid View -->
      <div v-else class="row">
        <div
          v-for="user in users"
          :key="user.user_id"
          class="col-12 col-md-6 col-xl-4 mb-3"
        >
          <div
            class="card h-100"
            :class="{ 'border-primary': selectedItems.includes(user.user_id) }"
          >
            <div class="card-body">
              <div
                class="d-flex justify-content-between align-items-start mb-3"
              >
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    :value="user.user_id"
                    v-model="selectedItems"
                  />
                </div>
                <div class="user-avatar-wrapper">
                  <img
                    v-if="user.profile_image"
                    :src="getProfileImageUrl(user.profile_image)"
                    :alt="`${user.first_name} ${user.last_name}`"
                    class="user-avatar"
                    @error="handleImageError"
                  />
                  <div v-else class="avatar-circle">
                    {{ getInitials(user.first_name, user.last_name) }}
                  </div>
                </div>
              </div>

              <h6 class="card-title mb-2">
                <span v-if="user.rank" class="text-muted me-1">{{
                  user.rank
                }}</span>
                {{ user.first_name }} {{ user.last_name }}
              </h6>
              <p class="text-muted small mb-3">@{{ user.username }}</p>

              <div class="mb-2">
                <small class="text-muted">ตำแหน่ง: </small>
                <span v-if="user.position" class="badge bg-light text-dark">{{
                  user.position
                }}</span>
                <span v-else class="text-muted">-</span>
              </div>

              <div class="mb-2">
                <small class="text-muted">หน่วยงาน: </small>
                <span v-if="user.department" class="badge bg-secondary">{{
                  user.department
                }}</span>
                <span v-else class="text-muted">-</span>
              </div>

              <div class="mb-3">
                <div v-if="user.email" class="mb-1">
                  <i class="bi bi-envelope me-1"></i>
                  <small>{{ user.email }}</small>
                </div>
                <div v-if="user.phone">
                  <i class="bi bi-telephone me-1"></i>
                  <small>{{ user.phone }}</small>
                </div>
              </div>

              <div
                class="d-flex justify-content-between align-items-center mb-3"
              >
                <span class="badge" :class="getRoleBadgeClass(user.role)">
                  {{ getRoleText(user.role) }}
                </span>
                <span
                  class="badge"
                  :class="getApprovalBadgeClass(user.approval_status)"
                >
                  {{ getApprovalStatusText(user.approval_status) }}
                </span>
              </div>

              <div class="text-center">
                <div class="form-check form-switch d-inline-block">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    :id="`grid-status-${user.user_id}`"
                    :checked="user.is_active"
                    @change="toggleUserStatus(user)"
                  />
                  <label
                    class="form-check-label"
                    :for="`grid-status-${user.user_id}`"
                  >
                    <span
                      class="badge"
                      :class="user.is_active ? 'bg-success' : 'bg-secondary'"
                    >
                      {{ user.is_active ? "ใช้งาน" : "ปิดใช้งาน" }}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div class="card-footer bg-light">
              <div class="d-flex gap-2">
                <router-link
                  :to="`/users/${user.user_id}`"
                  class="btn btn-sm btn-outline-primary flex-grow-1"
                >
                  <i class="bi bi-eye me-1"></i>ดูรายละเอียด
                </router-link>
                <router-link
                  :to="`/users/${user.user_id}/edit`"
                  class="btn btn-sm btn-outline-secondary"
                >
                  <i class="bi bi-pencil"></i>
                </router-link>
                <button
                  class="btn btn-sm btn-outline-danger"
                  @click="deleteUser(user.user_id)"
                  :disabled="deleteLoading[user.user_id]"
                >
                  <span
                    v-if="deleteLoading[user.user_id]"
                    class="spinner-border spinner-border-sm"
                  ></span>
                  <i v-else class="bi bi-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!loading && users.length === 0" class="text-center py-5">
        <div class="empty-state">
          <i class="bi bi-people display-1 text-muted mb-3"></i>
          <h5 class="text-muted">ไม่พบผู้ใช้งาน</h5>
          <p class="text-muted">
            {{
              searchQuery
                ? "ไม่พบผู้ใช้งานที่ตรงกับคำค้นหา"
                : "ยังไม่มีผู้ใช้งานในระบบ"
            }}
          </p>
          <router-link
            v-if="!searchQuery"
            to="/users/create"
            class="btn btn-primary"
          >
            <i class="bi bi-plus"></i>
            เพิ่มผู้ใช้งานคนแรก
          </router-link>
        </div>
      </div>

      <!-- Pagination -->
      <div
        v-if="!loading && users.length > 0"
        class="d-flex justify-content-between align-items-center mt-4"
      >
        <div class="pagination-info">
          <span class="text-muted">
            แสดง
            {{ (pagination.currentPage - 1) * pagination.itemsPerPage + 1 }} ถึง
            {{
              Math.min(
                pagination.currentPage * pagination.itemsPerPage,
                pagination.total
              )
            }}
            จาก {{ pagination.total }} รายการ
          </span>
          <div class="mt-1">
            <select
              class="form-select form-select-sm d-inline-block w-auto"
              v-model="pagination.itemsPerPage"
              @change="changeItemsPerPage"
            >
              <option value="12">12 รายการ</option>
              <option value="24">24 รายการ</option>
              <option value="48">48 รายการ</option>
              <option value="96">96 รายการ</option>
            </select>
          </div>
        </div>
        <nav aria-label="User pagination">
          <ul class="pagination mb-0">
            <li
              class="page-item"
              :class="{ disabled: pagination.currentPage === 1 }"
            >
              <button
                class="page-link"
                @click="changePage(1)"
                :disabled="pagination.currentPage === 1"
              >
                <i class="bi bi-chevron-double-left"></i>
              </button>
            </li>
            <li
              class="page-item"
              :class="{ disabled: pagination.currentPage === 1 }"
            >
              <button
                class="page-link"
                @click="changePage(pagination.currentPage - 1)"
                :disabled="pagination.currentPage === 1"
              >
                <i class="bi bi-chevron-left"></i>
              </button>
            </li>
            <li
              v-for="page in visiblePages"
              :key="page"
              class="page-item"
              :class="{ active: page === pagination.currentPage }"
            >
              <button
                v-if="page !== '...'"
                class="page-link"
                @click="changePage(page)"
              >
                {{ page }}
              </button>
              <span v-else class="page-link">...</span>
            </li>
            <li
              class="page-item"
              :class="{
                disabled: pagination.currentPage === pagination.totalPages,
              }"
            >
              <button
                class="page-link"
                @click="changePage(pagination.currentPage + 1)"
                :disabled="pagination.currentPage === pagination.totalPages"
              >
                <i class="bi bi-chevron-right"></i>
              </button>
            </li>
            <li
              class="page-item"
              :class="{
                disabled: pagination.currentPage === pagination.totalPages,
              }"
            >
              <button
                class="page-link"
                @click="changePage(pagination.totalPages)"
                :disabled="pagination.currentPage === pagination.totalPages"
              >
                <i class="bi bi-chevron-double-right"></i>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>

    <!-- Toast Messages -->
    <div class="toast-container position-fixed bottom-0 end-0 p-3">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast show"
        role="alert"
      >
        <div class="toast-header">
          <i :class="toast.icon" class="me-2"></i>
          <strong class="me-auto">{{ toast.title }}</strong>
          <button
            type="button"
            class="btn-close"
            @click="removeToast(toast.id)"
          ></button>
        </div>
        <div class="toast-body">{{ toast.message }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import userService from "@/services/userService";
import moment from "moment";

// Debounce utility
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default {
  name: "UserList",
  setup() {
    const authStore = useAuthStore();

    // Data
    const users = ref([]);
    const loading = ref(false);
    const viewMode = ref("table");
    const selectedItems = ref([]);
    const bulkOperationLoading = ref(false);
    const deleteLoading = ref({});
    const searchQuery = ref("");
    const sortField = ref("");
    const sortDirection = ref("asc");
    const toasts = ref([]);

    // Statistics
    const statistics = reactive({
      total: 0,
      active: 0,
      inactive: 0,
      pending: 0,
    });

    // Filters
    const filters = reactive({
      search: "",
      role: "",
      status: "",
      approval: "",
      department: "",
    });

    // Pagination
    const pagination = reactive({
      currentPage: 1,
      totalPages: 1,
      total: 0,
      itemsPerPage: 12,
    });

    // Computed properties
    const isAllSelected = computed(() => {
      return (
        users.value.length > 0 &&
        selectedItems.value.length === users.value.length
      );
    });

    const isIndeterminate = computed(() => {
      return (
        selectedItems.value.length > 0 &&
        selectedItems.value.length < users.value.length
      );
    });

    const visiblePages = computed(() => {
      const pages = [];
      const current = pagination.currentPage;
      const total = pagination.totalPages;
      const range = 2;

      let start = Math.max(1, current - range);
      let end = Math.min(total, current + range);

      // Adjust range if needed
      if (end - start < range * 2) {
        if (start === 1) {
          end = Math.min(total, start + range * 2);
        } else {
          start = Math.max(1, end - range * 2);
        }
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      return pages;
    });

    // Methods
    const loadStatistics = async () => {
      try {
        // Calculate statistics from loaded users data
        const totalUsers = users.value.length;
        const activeUsers = users.value.filter((user) => user.is_active).length;
        const inactiveUsers = users.value.filter(
          (user) => !user.is_active
        ).length;
        const pendingUsers = users.value.filter(
          (user) => user.approval_status === "pending"
        ).length;

        Object.assign(statistics, {
          total: totalUsers,
          active: activeUsers,
          inactive: inactiveUsers,
          pending: pendingUsers,
        });
      } catch (error) {
        console.error("Failed to load statistics:", error);
      }
    };

    const loadUsers = async (page = 1) => {
      loading.value = true;
      try {
        const params = {
          page,
          limit: pagination.itemsPerPage,
          search: filters.search.trim() || searchQuery.value.trim(),
          role: filters.role,
          status: filters.status,
          approval_status: filters.approval,
          department: filters.department,
          sort_field: sortField.value,
          sort_direction: sortDirection.value,
        };

        // Remove empty parameters
        Object.keys(params).forEach((key) => {
          if (
            params[key] === "" ||
            params[key] === null ||
            params[key] === undefined
          ) {
            delete params[key];
          }
        });

        const response = await userService.getUsers(params);

        if (response.success || response.data) {
          const userData = response.data || response;
          users.value = userData.users || userData || [];
          Object.assign(pagination, {
            currentPage: userData.pagination?.currentPage || page,
            totalPages:
              userData.pagination?.totalPages ||
              Math.ceil(
                (userData.total || users.value.length) / pagination.itemsPerPage
              ) ||
              1,
            total:
              userData.pagination?.total ||
              userData.total ||
              users.value.length,
          });

          // Update statistics after loading users
          await loadStatistics();
        }

        // Clear selection when loading new data
        selectedItems.value = [];
      } catch (error) {
        console.error("Failed to load users:", error);
        showToast("error", "เกิดข้อผิดพลาด", "ไม่สามารถโหลดข้อมูลผู้ใช้งานได้");
      } finally {
        loading.value = false;
      }
    };

    const debouncedSearch = debounce(() => {
      filters.search = searchQuery.value;
      pagination.currentPage = 1;
      loadUsers();
    }, 500);

    const debounceSearch = () => {
      debouncedSearch();
    };

    const applyFilters = () => {
      pagination.currentPage = 1;
      loadUsers();
    };

    const clearSearch = () => {
      searchQuery.value = "";
      filters.search = "";
      pagination.currentPage = 1;
      loadUsers();
    };

    const changePage = (page) => {
      if (page >= 1 && page <= pagination.totalPages) {
        pagination.currentPage = page;
        loadUsers(page);
      }
    };

    const changeItemsPerPage = () => {
      pagination.currentPage = 1;
      loadUsers();
    };

    // Bulk operations
    const toggleSelectAll = () => {
      if (isAllSelected.value) {
        selectedItems.value = [];
      } else {
        selectedItems.value = users.value.map((user) => user.user_id);
      }
    };

    const bulkUpdateStatus = async (status) => {
      if (selectedItems.value.length === 0) {
        showToast("warning", "แจ้งเตือן", "กรุณาเลือกรายการที่ต้องการอัปเดต");
        return;
      }

      try {
        bulkOperationLoading.value = true;
        await userService.bulkUpdateStatus(selectedItems.value, status);
        showToast(
          "success",
          "สำเร็จ",
          `อัปเดตสถานะ ${selectedItems.value.length} รายการเรียบร้อยแล้ว`
        );
        selectedItems.value = [];
        await loadUsers(pagination.currentPage);
      } catch (error) {
        console.error("Bulk status update failed:", error);
        showToast("error", "เกิดข้อผิดพลาด", "ไม่สามารถอัปเดตสถานะได้");
      } finally {
        bulkOperationLoading.value = false;
      }
    };

    const bulkApprove = async () => {
      if (selectedItems.value.length === 0) {
        showToast("warning", "แจ้งเตือน", "กรุณาเลือกรายการที่ต้องการอนุมัติ");
        return;
      }

      try {
        bulkOperationLoading.value = true;
        await userService.bulkApprove(selectedItems.value);
        showToast(
          "success",
          "สำเร็จ",
          `อนุมัติ ${selectedItems.value.length} รายการเรียบร้อยแล้ว`
        );
        selectedItems.value = [];
        await loadUsers(pagination.currentPage);
        await loadStatistics();
      } catch (error) {
        console.error("Bulk approve failed:", error);
        showToast("error", "เกิดข้อผิดพลาด", "ไม่สามารถอนุมัติได้");
      } finally {
        bulkOperationLoading.value = false;
      }
    };

    const bulkReject = async () => {
      if (selectedItems.value.length === 0) {
        showToast("warning", "แจ้งเตือน", "กรุณาเลือกรายการที่ต้องการปฏิเสธ");
        return;
      }

      try {
        bulkOperationLoading.value = true;
        await userService.bulkReject(selectedItems.value);
        showToast(
          "success",
          "สำเร็จ",
          `ปฏิเสธ ${selectedItems.value.length} รายการเรียบร้อยแล้ว`
        );
        selectedItems.value = [];
        await loadUsers(pagination.currentPage);
        await loadStatistics();
      } catch (error) {
        console.error("Bulk reject failed:", error);
        showToast("error", "เกิดข้อผิดพลาด", "ไม่สามารถปฏิเสธได้");
      } finally {
        bulkOperationLoading.value = false;
      }
    };

    const bulkExport = async () => {
      if (selectedItems.value.length === 0) {
        showToast("warning", "แจ้งเตือน", "กรุณาเลือกรายการที่ต้องการส่งออก");
        return;
      }

      try {
        bulkOperationLoading.value = true;
        const blob = await userService.bulkExport(selectedItems.value);

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `users_export_${
          new Date().toISOString().split("T")[0]
        }.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        showToast(
          "success",
          "สำเร็จ",
          `ส่งออกข้อมูล ${selectedItems.value.length} รายการเรียบร้อยแล้ว`
        );
        selectedItems.value = [];
      } catch (error) {
        console.error("Bulk export failed:", error);
        showToast("error", "เกิดข้อผิดพลาด", "ไม่สามารถส่งออกข้อมูลได้");
      } finally {
        bulkOperationLoading.value = false;
      }
    };

    const bulkDelete = async () => {
      if (selectedItems.value.length === 0) {
        showToast("warning", "แจ้งเตือน", "กรุณาเลือกรายการที่ต้องการลบ");
        return;
      }

      if (
        !confirm(
          `คุณต้องการลบผู้ใช้งาน ${selectedItems.value.length} รายการใช่หรือไม่?`
        )
      ) {
        return;
      }

      try {
        bulkOperationLoading.value = true;
        await userService.bulkDelete(selectedItems.value);
        showToast(
          "success",
          "สำเร็จ",
          `ลบข้อมูล ${selectedItems.value.length} รายการเรียบร้อยแล้ว`
        );
        selectedItems.value = [];
        await loadUsers(pagination.currentPage);
        await loadStatistics();
      } catch (error) {
        console.error("Bulk delete failed:", error);
        showToast("error", "เกิดข้อผิดพลาด", "ไม่สามารถลบข้อมูลได้");
      } finally {
        bulkOperationLoading.value = false;
      }
    };

    // Single item operations
    const toggleUserStatus = async (user) => {
      try {
        const newStatus = !user.is_active;
        await userService.updateUserStatus(user.user_id, {
          is_active: newStatus,
        });
        user.is_active = newStatus;
        showToast(
          "success",
          "สำเร็จ",
          `${newStatus ? "เปิด" : "ปิด"}ใช้งานผู้ใช้ "${user.first_name} ${
            user.last_name
          }" สำเร็จ`
        );
        await loadStatistics();
      } catch (error) {
        console.error("Error toggling user status:", error);
        showToast("error", "เกิดข้อผิดพลาด", "ไม่สามารถเปลี่ยนสถานะผู้ใช้ได้");
      }
    };

    const deleteUser = async (userId) => {
      if (!confirm("คุณต้องการลบผู้ใช้งานนี้ใช่หรือไม่?")) {
        return;
      }

      try {
        deleteLoading.value[userId] = true;
        await userService.deleteUser(userId);
        showToast("success", "สำเร็จ", "ลบผู้ใช้งานเรียบร้อยแล้ว");
        await loadUsers(pagination.currentPage);
        await loadStatistics();
      } catch (error) {
        console.error("Delete failed:", error);
        showToast("error", "เกิดข้อผิดพลาด", "ไม่สามารถลบผู้ใช้งานได้");
      } finally {
        delete deleteLoading.value[userId];
      }
    };

    // Export/Import operations
    const exportUsers = async () => {
      try {
        const blob = await userService.exportAll();

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `all_users_${
          new Date().toISOString().split("T")[0]
        }.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        showToast("success", "สำเร็จ", "ส่งออกข้อมูลทั้งหมดเรียบร้อยแล้ว");
      } catch (error) {
        console.error("Export failed:", error);
        showToast("error", "เกิดข้อผิดพลาด", "ไม่สามารถส่งออกข้อมูลได้");
      }
    };

    const showImportModal = () => {
      // This would typically open an import modal
      showToast(
        "info",
        "ฟีเจอร์กำลังพัฒนา",
        "ฟีเจอร์นำเข้าข้อมูลกำลังอยู่ระหว่างการพัฒนา"
      );
    };

    // Sorting
    const sortBy = (field) => {
      if (sortField.value === field) {
        sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
      } else {
        sortField.value = field;
        sortDirection.value = "asc";
      }
      loadUsers(pagination.currentPage);
    };

    const getSortClass = (field) => {
      if (sortField.value !== field) return "";
      return sortDirection.value === "asc" ? "sort-asc" : "sort-desc";
    };

    // Utility methods
    const getRoleText = (role) => {
      const roleMap = {
        Admin: "ผู้ดูแล",
        Reviewer: "ผู้ตรวจ",
        Surveyor: "ผู้สำรวจ",
      };
      return roleMap[role] || role;
    };

    const getRoleBadgeClass = (role) => {
      const classes = {
        Admin: "bg-danger",
        Reviewer: "bg-warning",
        Surveyor: "bg-info",
      };
      return classes[role] || "bg-secondary";
    };

    const getApprovalStatusText = (status) => {
      const statusMap = {
        pending: "รออนุมัติ",
        approved: "อนุมัติแล้ว",
        rejected: "ปฏิเสธ",
      };
      return statusMap[status] || status;
    };

    const getApprovalBadgeClass = (status) => {
      const classes = {
        approved: "bg-success",
        pending: "bg-warning",
        rejected: "bg-danger",
      };
      return classes[status] || "bg-secondary";
    };

    const getInitials = (firstName, lastName) => {
      const first = firstName ? firstName.charAt(0).toUpperCase() : "";
      const last = lastName ? lastName.charAt(0).toUpperCase() : "";
      return first + last;
    };

    const getProfileImageUrl = (imagePath) => {
      return `${
        import.meta.env.VITE_API_BASE_URL
      }/uploads/profiles/${imagePath}`;
    };

    const handleImageError = (event) => {
      event.target.style.display = "none";
    };

    const formatDate = (date) => {
      return moment(date).locale("th").format("DD MMM YYYY");
    };

    // Toast notification system
    const showToast = (type, title, message) => {
      const toast = {
        id: Date.now(),
        type,
        title,
        message,
        icon: getToastIcon(type),
      };
      toasts.value.push(toast);
      setTimeout(() => removeToast(toast.id), 5000);
    };

    const getToastIcon = (type) => {
      const icons = {
        success: "bi bi-check-circle text-success",
        error: "bi bi-x-circle text-danger",
        warning: "bi bi-exclamation-triangle text-warning",
        info: "bi bi-info-circle text-info",
      };
      return icons[type] || "bi bi-info-circle";
    };

    const removeToast = (id) => {
      const index = toasts.value.findIndex((toast) => toast.id === id);
      if (index > -1) {
        toasts.value.splice(index, 1);
      }
    };

    // Lifecycle
    onMounted(async () => {
      await loadUsers();
    });

    return {
      authStore,
      users,
      loading,
      viewMode,
      selectedItems,
      bulkOperationLoading,
      deleteLoading,
      searchQuery,
      sortField,
      sortDirection,
      toasts,
      statistics,
      filters,
      pagination,
      isAllSelected,
      isIndeterminate,
      visiblePages,
      loadUsers,
      debounceSearch,
      applyFilters,
      clearSearch,
      changePage,
      changeItemsPerPage,
      toggleSelectAll,
      bulkUpdateStatus,
      bulkApprove,
      bulkReject,
      bulkExport,
      bulkDelete,
      toggleUserStatus,
      deleteUser,
      exportUsers,
      showImportModal,
      sortBy,
      getSortClass,
      getRoleText,
      getRoleBadgeClass,
      getApprovalStatusText,
      getApprovalBadgeClass,
      getInitials,
      getProfileImageUrl,
      handleImageError,
      formatDate,
      showToast,
      removeToast,
    };
  },
};
</script>

<style scoped>
/* Statistics Cards */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.stat-card.stat-total {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-card.stat-active {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
}

.stat-card.stat-inactive {
  background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%);
}

.stat-card.stat-pending {
  background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%);
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.9;
  margin-bottom: 0;
}

/* Search and Filters */
.search-wrapper {
  position: relative;
}

.search-input {
  padding-left: 3rem;
  border-radius: 25px;
  border: 1px solid #dee2e6;
  transition: all 0.3s ease;
}

.search-input:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  z-index: 2;
}

.clear-search {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  z-index: 2;
}

.clear-search:hover {
  color: #dc3545;
}

/* Filters */
.filters-section {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.filter-select {
  border-radius: 6px;
  border: 1px solid #dee2e6;
  transition: border-color 0.3s ease;
}

.filter-select:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

/* Bulk Operations Toolbar */
.bulk-toolbar {
  background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  border-left: 4px solid #007bff;
}

.bulk-toolbar .btn {
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
  border-radius: 20px;
  font-size: 0.875rem;
  padding: 0.5rem 1rem;
}

/* View Toggle */
.view-toggle .btn {
  border-radius: 6px;
  transition: all 0.3s ease;
}

.view-toggle .btn.active {
  background: #007bff;
  border-color: #007bff;
  color: white;
}

/* Data Table */
.data-table {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.table {
  margin-bottom: 0;
}

.table thead th {
  background: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
  font-weight: 600;
  padding: 1rem;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.3s ease;
}

.table thead th:hover {
  background: #e9ecef;
}

.table thead th.sortable {
  position: relative;
}

.table thead th.sortable::after {
  content: "↕";
  position: absolute;
  right: 1rem;
  opacity: 0.5;
}

.table thead th.sort-asc::after {
  content: "↑";
  opacity: 1;
  color: #007bff;
}

.table thead th.sort-desc::after {
  content: "↓";
  opacity: 1;
  color: #007bff;
}

.table tbody td {
  padding: 1rem;
  vertical-align: middle;
  border-top: 1px solid #dee2e6;
}

.table tbody tr:hover {
  background: #f8f9fa;
}

/* User Avatar */
.user-avatar-wrapper {
  position: relative;
  width: 40px;
  height: 40px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #dee2e6;
}

.avatar-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
  border: 2px solid #dee2e6;
}

/* Status badges and toggles */
.badge {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.375rem 0.75rem;
  border-radius: 12px;
}

.form-switch .form-check-input {
  width: 2.5rem;
  height: 1.25rem;
  cursor: pointer;
}

.form-switch .form-check-input:checked {
  background-color: #28a745;
  border-color: #28a745;
}

/* Action buttons */
.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  border-radius: 4px;
}

.btn-outline-primary:hover {
  background: #007bff;
  border-color: #007bff;
  color: white;
}

.btn-outline-danger:hover {
  background: #dc3545;
  border-color: #dc3545;
  color: white;
}

/* Grid View */
.grid-view .card {
  border-radius: 12px;
  transition: all 0.3s ease;
  border: 2px solid #dee2e6;
}

.grid-view .card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.grid-view .card.border-primary {
  border-color: #007bff !important;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.grid-view .user-avatar-wrapper {
  width: 60px;
  height: 60px;
}

.grid-view .user-avatar {
  width: 60px;
  height: 60px;
}

.grid-view .avatar-circle {
  width: 60px;
  height: 60px;
  font-size: 1.25rem;
}

/* Pagination */
.pagination {
  margin-bottom: 0;
}

.page-link {
  border-radius: 6px;
  margin: 0 0.125rem;
  border: 1px solid #dee2e6;
  color: #007bff;
  transition: all 0.3s ease;
}

.page-link:hover {
  background: #e9ecef;
  border-color: #adb5bd;
  color: #0056b3;
}

.page-item.active .page-link {
  background: #007bff;
  border-color: #007bff;
  color: white;
}

.page-item.disabled .page-link {
  color: #6c757d;
  background: #fff;
  border-color: #dee2e6;
  cursor: not-allowed;
}

/* Items per page selector */
.items-per-page {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.items-per-page select {
  width: auto;
  min-width: 80px;
}

/* Loading states */
.loading-overlay {
  position: relative;
}

.loading-overlay::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

/* Toast notifications */
.toast-container {
  z-index: 1050;
}

.toast {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: none;
}

.toast-header {
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  border-radius: 8px 8px 0 0;
}

.toast-body {
  padding: 0.75rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }

  .stat-number {
    font-size: 2rem;
  }

  .bulk-toolbar {
    text-align: center;
  }

  .bulk-toolbar .btn {
    margin-right: 0.25rem;
    font-size: 0.8rem;
    padding: 0.375rem 0.75rem;
  }

  .table-responsive {
    font-size: 0.875rem;
  }

  .user-avatar-wrapper,
  .user-avatar,
  .avatar-circle {
    width: 32px;
    height: 32px;
  }

  .avatar-circle {
    font-size: 0.75rem;
  }

  .pagination {
    justify-content: center;
  }

  .pagination .page-link {
    padding: 0.375rem 0.75rem;
    font-size: 0.875rem;
  }
}

@media (max-width: 576px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .filters-section {
    padding: 0.75rem;
  }

  .filters-section .row > * {
    margin-bottom: 0.5rem;
  }

  .bulk-toolbar .btn {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
  }

  .view-toggle {
    margin-bottom: 1rem;
  }

  .items-per-page {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
  }

  .pagination .page-link {
    padding: 0.25rem 0.5rem;
    font-size: 0.8rem;
  }
}

/* Custom scrollbar for tables */
.table-responsive::-webkit-scrollbar {
  height: 6px;
}

.table-responsive::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.table-responsive::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 10px;
}

.table-responsive::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Animation for bulk operations */
@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(0, 123, 255, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(0, 123, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(0, 123, 255, 0);
  }
}

.bulk-toolbar.animate {
  animation: pulse 2s infinite;
}

/* Enhanced focus states for accessibility */
.btn:focus,
.form-control:focus,
.form-select:focus,
.form-check-input:focus {
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  outline: none;
}

/* Dark mode support (if needed) */
@media (prefers-color-scheme: dark) {
  .data-table {
    background: #2d3748;
    color: #e2e8f0;
  }

  .table thead th {
    background: #4a5568;
    color: #e2e8f0;
    border-color: #4a5568;
  }

  .table tbody td {
    border-color: #4a5568;
  }

  .table tbody tr:hover {
    background: #4a5568;
  }

  .filters-section {
    background: #4a5568;
    color: #e2e8f0;
  }

  .bulk-toolbar {
    background: #4a5568;
    color: #e2e8f0;
  }
}
</style>
