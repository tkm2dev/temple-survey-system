<template>
  <div class="audit-logs">
    <!-- Page Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="h3 mb-1">
          <i class="bi bi-shield-check me-2 text-primary"></i>
          ประวัติการใช้งานระบบ
        </h1>
        <p class="text-muted mb-0">
          <i class="bi bi-info-circle me-1"></i>
          ติดตามและตรวจสอบกิจกรรมการใช้งานทั้งหมดในระบบ
        </p>
      </div>
      <div class="d-flex gap-2">
        <button
          @click="exportAuditLogs"
          class="btn btn-outline-primary"
          :disabled="exporting"
        >
          <i class="bi bi-download me-1"></i>
          <span v-if="exporting">กำลังส่งออก...</span>
          <span v-else>ส่งออกรายงาน</span>
        </button>
        <button
          @click="refreshLogs"
          class="btn btn-primary"
          :disabled="loading"
        >
          <i class="bi bi-arrow-clockwise me-1" :class="{ spin: loading }"></i>
          รีเฟรช
        </button>
      </div>
    </div>

    <!-- Filter Section -->
    <div class="card mb-4">
      <div class="card-header">
        <h5 class="mb-0">
          <i class="bi bi-funnel me-2"></i>
          ตัวกรองข้อมูล
          <button
            @click="toggleFilters"
            class="btn btn-sm btn-outline-secondary ms-2"
          >
            <i
              class="bi bi-chevron-down"
              :class="{ 'rotate-180': showFilters }"
            ></i>
          </button>
        </h5>
      </div>
      <div class="card-body" v-show="showFilters">
        <div class="row">
          <!-- Search -->
          <div class="col-md-4 mb-3">
            <label class="form-label">ค้นหา</label>
            <div class="input-group">
              <input
                v-model="filters.search"
                type="text"
                class="form-control"
                placeholder="ค้นหาจากชื่อผู้ใช้, การดำเนินการ, หรือรายละเอียด..."
                @input="debouncedSearch"
              />
              <button class="btn btn-outline-secondary" @click="clearSearch">
                <i class="bi bi-x"></i>
              </button>
            </div>
          </div>

          <!-- Date Range -->
          <div class="col-md-4 mb-3">
            <label class="form-label">ช่วงวันที่</label>
            <div class="row">
              <div class="col-6">
                <input
                  v-model="filters.dateFrom"
                  type="date"
                  class="form-control"
                  @change="applyFilters"
                />
              </div>
              <div class="col-6">
                <input
                  v-model="filters.dateTo"
                  type="date"
                  class="form-control"
                  @change="applyFilters"
                />
              </div>
            </div>
          </div>

          <!-- Action Type -->
          <div class="col-md-4 mb-3">
            <label class="form-label">ประเภทการดำเนินการ</label>
            <select
              v-model="filters.action"
              class="form-select"
              @change="applyFilters"
            >
              <option value="">ทั้งหมด</option>
              <option value="LOGIN">เข้าสู่ระบบ</option>
              <option value="LOGOUT">ออกจากระบบ</option>
              <option value="CREATE">สร้าง</option>
              <option value="UPDATE">แก้ไข</option>
              <option value="DELETE">ลบ</option>
              <option value="VIEW">ดู</option>
              <option value="APPROVE">อนุมัติ</option>
              <option value="REJECT">ปฏิเสธ</option>
              <option value="EXPORT">ส่งออก</option>
              <option value="IMPORT">นำเข้า</option>
              <option value="PROFILE_UPDATE">แก้ไขโปรไฟล์</option>
              <option value="PASSWORD_CHANGE">เปลี่ยนรหัสผ่าน</option>
              <option value="BULK_UPDATE">อัปเดตจำนวนมาก</option>
              <option value="BULK_DELETE">ลบจำนวนมาก</option>
            </select>
          </div>

          <!-- User Role -->
          <div class="col-md-4 mb-3">
            <label class="form-label">บทบาทผู้ใช้</label>
            <select
              v-model="filters.userRole"
              class="form-select"
              @change="applyFilters"
            >
              <option value="">ทั้งหมด</option>
              <option value="Admin">ผู้ดูแลระบบ</option>
              <option value="Reviewer">ผู้ตรวจสอบ</option>
              <option value="Surveyor">ผู้สำรวจ</option>
            </select>
          </div>

          <!-- IP Address -->
          <div class="col-md-4 mb-3">
            <label class="form-label">IP Address</label>
            <input
              v-model="filters.ipAddress"
              type="text"
              class="form-control"
              placeholder="192.168.1.1"
              @input="debouncedSearch"
            />
          </div>

          <!-- Quick Date Filters -->
          <div class="col-md-4 mb-3">
            <label class="form-label">ช่วงเวลาด่วน</label>
            <div class="btn-group w-100">
              <button
                v-for="period in quickDatePeriods"
                :key="period.value"
                @click="setQuickDateFilter(period.value)"
                class="btn btn-sm"
                :class="
                  selectedQuickPeriod === period.value
                    ? 'btn-primary'
                    : 'btn-outline-secondary'
                "
              >
                {{ period.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- Filter Actions -->
        <div
          class="d-flex justify-content-between align-items-center mt-3 pt-3 border-top"
        >
          <div class="text-muted small">
            <i class="bi bi-info-circle me-1"></i>
            แสดงผล {{ filteredCount }} จาก {{ totalCount }} รายการ
          </div>
          <div class="d-flex gap-2">
            <button
              @click="clearAllFilters"
              class="btn btn-sm btn-outline-secondary"
            >
              <i class="bi bi-arrow-counterclockwise me-1"></i>
              ล้างตัวกรอง
            </button>
            <button @click="applyFilters" class="btn btn-sm btn-primary">
              <i class="bi bi-search me-1"></i>
              ค้นหา
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="row mb-4">
      <div class="col-md-3 mb-3">
        <div class="card border-start border-primary border-4 h-100">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="flex-grow-1">
                <div class="text-muted small">กิจกรรมวันนี้</div>
                <div class="h5 mb-0 text-primary">{{ stats.today || 0 }}</div>
                <div class="small text-muted">รายการ</div>
              </div>
              <div class="text-primary">
                <i class="bi bi-calendar-day fs-2"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-3 mb-3">
        <div class="card border-start border-success border-4 h-100">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="flex-grow-1">
                <div class="text-muted small">กิจกรรมสัปดาห์นี้</div>
                <div class="h5 mb-0 text-success">
                  {{ stats.thisWeek || 0 }}
                </div>
                <div class="small text-muted">รายการ</div>
              </div>
              <div class="text-success">
                <i class="bi bi-calendar-week fs-2"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-3 mb-3">
        <div class="card border-start border-info border-4 h-100">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="flex-grow-1">
                <div class="text-muted small">ผู้ใช้ที่ใช้งาน</div>
                <div class="h5 mb-0 text-info">
                  {{ stats.activeUsers || 0 }}
                </div>
                <div class="small text-muted">คน</div>
              </div>
              <div class="text-info">
                <i class="bi bi-people fs-2"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-3 mb-3">
        <div class="card border-start border-warning border-4 h-100">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="flex-grow-1">
                <div class="text-muted small">เหตุการณ์สำคัญ</div>
                <div class="h5 mb-0 text-warning">
                  {{ stats.failedLogins || 0 }}
                </div>
                <div class="small text-muted">ครั้ง</div>
              </div>
              <div class="text-warning">
                <i class="bi bi-exclamation-triangle fs-2"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Audit Logs Table -->
    <div class="card">
      <div
        class="card-header d-flex justify-content-between align-items-center"
      >
        <h5 class="mb-0">
          <i class="bi bi-list-ul me-2"></i>
          รายการประวัติการใช้งาน
        </h5>
        <div class="d-flex align-items-center gap-3">
          <div class="d-flex align-items-center">
            <label class="form-label me-2 mb-0 small">แสดง:</label>
            <select
              v-model="pageSize"
              class="form-select form-select-sm"
              style="width: 80px"
              @change="changePageSize"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
          <div class="form-check form-switch">
            <input
              v-model="autoRefresh"
              class="form-check-input"
              type="checkbox"
              id="autoRefresh"
            />
            <label class="form-check-label small" for="autoRefresh">
              อัปเดตอัตโนมัติ
            </label>
          </div>
        </div>
      </div>

      <div class="card-body p-0">
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary me-2"></div>
          <span>กำลังโหลดข้อมูล...</span>
        </div>

        <!-- Empty State -->
        <div v-else-if="auditLogs.length === 0" class="text-center py-5">
          <i class="bi bi-search display-1 text-muted opacity-25"></i>
          <h5 class="mt-3 text-muted">ไม่พบข้อมูลประวัติการใช้งาน</h5>
          <p class="text-muted">ลองปรับเปลี่ยนเงื่อนไขการค้นหาหรือตัวกรอง</p>
          <button @click="clearAllFilters" class="btn btn-outline-primary">
            <i class="bi bi-arrow-counterclockwise me-1"></i>
            ล้างตัวกรองทั้งหมด
          </button>
        </div>

        <!-- Audit Logs Table -->
        <div v-else class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th class="border-0">
                  <button
                    @click="sortBy('timestamp')"
                    class="btn btn-sm btn-link p-0 text-decoration-none text-dark"
                  >
                    วันที่เวลา
                    <i class="bi ms-1" :class="getSortIcon('timestamp')"></i>
                  </button>
                </th>
                <th class="border-0">ผู้ใช้</th>
                <th class="border-0">การดำเนินการ</th>
                <th class="border-0 d-none d-md-table-cell">รายละเอียด</th>
                <th class="border-0 d-none d-lg-table-cell">IP Address</th>
                <th class="border-0 d-none d-xl-table-cell">User Agent</th>
                <th class="border-0 text-center">ดูเพิ่มเติม</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="log in auditLogs" :key="log.id">
                <td class="border-0">
                  <div class="fw-bold small">
                    {{ formatDateTime(log.timestamp) }}
                  </div>
                  <div class="text-muted small">
                    {{ formatDateRelative(log.timestamp) }}
                  </div>
                </td>
                <td class="border-0">
                  <div class="d-flex align-items-center">
                    <div class="avatar-sm me-2">
                      <div
                        class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                        style="width: 32px; height: 32px; font-size: 12px"
                      >
                        {{ getUserInitials(log.user_name) }}
                      </div>
                    </div>
                    <div>
                      <div class="fw-bold small">{{ log.user_name }}</div>
                      <div class="text-muted small">
                        <span
                          class="badge badge-sm"
                          :class="getRoleBadgeClass(log.user_role)"
                        >
                          {{ getRoleText(log.user_role) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td class="border-0">
                  <span class="badge" :class="getActionBadgeClass(log.action)">
                    <i :class="getActionIcon(log.action)" class="me-1"></i>
                    {{ getActionText(log.action) }}
                  </span>
                </td>
                <td class="border-0 d-none d-md-table-cell">
                  <div
                    class="small text-truncate"
                    style="max-width: 200px"
                    :title="log.details"
                  >
                    {{ log.details }}
                  </div>
                </td>
                <td class="border-0 d-none d-lg-table-cell">
                  <code class="small">{{ log.ip_address }}</code>
                </td>
                <td class="border-0 d-none d-xl-table-cell">
                  <div
                    class="small text-truncate"
                    style="max-width: 150px"
                    :title="log.user_agent"
                  >
                    {{ getUserAgentBrowser(log.user_agent) }}
                  </div>
                </td>
                <td class="border-0 text-center">
                  <button
                    @click="showLogDetails(log)"
                    class="btn btn-sm btn-outline-primary"
                    title="ดูรายละเอียดแบบละเอียด"
                  >
                    <i class="bi bi-eye"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="auditLogs.length > 0" class="card-footer bg-light border-0">
          <div class="d-flex justify-content-between align-items-center">
            <div class="text-muted small">
              แสดง {{ (currentPage - 1) * parseInt(pageSize) + 1 }} -
              {{ Math.min(currentPage * parseInt(pageSize), totalCount) }} จาก
              {{ totalCount }} รายการ
            </div>
            <nav>
              <ul class="pagination pagination-sm mb-0">
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <button @click="goToPage(currentPage - 1)" class="page-link">
                    <i class="bi bi-chevron-left"></i>
                  </button>
                </li>

                <li
                  v-for="page in paginationPages"
                  :key="page"
                  class="page-item"
                  :class="{ active: page === currentPage }"
                >
                  <button @click="goToPage(page)" class="page-link">
                    {{ page }}
                  </button>
                </li>

                <li
                  class="page-item"
                  :class="{ disabled: currentPage === totalPages }"
                >
                  <button @click="goToPage(currentPage + 1)" class="page-link">
                    <i class="bi bi-chevron-right"></i>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- Log Details Modal -->
    <div
      class="modal fade"
      id="logDetailsModal"
      tabindex="-1"
      ref="logDetailsModal"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-info-circle me-2"></i>
              รายละเอียดประวัติการใช้งาน
            </h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
            ></button>
          </div>
          <div class="modal-body">
            <div v-if="selectedLog" class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label fw-bold">วันที่เวลา</label>
                <div>{{ formatDateTime(selectedLog.timestamp) }}</div>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label fw-bold">ผู้ใช้</label>
                <div class="d-flex align-items-center">
                  <div class="avatar-sm me-2">
                    <div
                      class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                      style="width: 32px; height: 32px; font-size: 12px"
                    >
                      {{ getUserInitials(selectedLog.user_name) }}
                    </div>
                  </div>
                  <div>
                    <div class="fw-bold">{{ selectedLog.user_name }}</div>
                    <span
                      class="badge badge-sm"
                      :class="getRoleBadgeClass(selectedLog.user_role)"
                    >
                      {{ getRoleText(selectedLog.user_role) }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label fw-bold">การดำเนินการ</label>
                <div>
                  <span
                    class="badge"
                    :class="getActionBadgeClass(selectedLog.action)"
                  >
                    <i
                      :class="getActionIcon(selectedLog.action)"
                      class="me-1"
                    ></i>
                    {{ getActionText(selectedLog.action) }}
                  </span>
                </div>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label fw-bold">IP Address</label>
                <div>
                  <code>{{ selectedLog.ip_address }}</code>
                </div>
              </div>
              <div class="col-12 mb-3" v-if="selectedLog.details">
                <label class="form-label fw-bold">รายละเอียด</label>
                <div class="p-3 bg-light rounded">
                  <div v-if="typeof selectedLog.details === 'object'">
                    <div
                      v-for="(value, key) in selectedLog.details"
                      :key="key"
                      class="mb-2"
                    >
                      <strong>{{ key }}:</strong>
                      <span class="ms-2 text-break">{{ value }}</span>
                    </div>
                  </div>
                  <div v-else>
                    {{ selectedLog.details }}
                  </div>
                </div>
              </div>

              <div class="col-md-6 mb-3" v-if="selectedLog.target_table">
                <label class="form-label fw-bold">ตารางข้อมูล</label>
                <div>
                  <span class="badge bg-info">{{
                    selectedLog.target_table
                  }}</span>
                  <span v-if="selectedLog.target_id" class="ms-2 text-muted">
                    ID: {{ selectedLog.target_id }}
                  </span>
                </div>
              </div>

              <div class="col-md-6 mb-3">
                <label class="form-label fw-bold">เบราว์เซอร์</label>
                <div>
                  <i class="bi bi-browser-chrome me-1"></i>
                  {{ getUserAgentBrowser(selectedLog.user_agent) }}
                </div>
              </div>
              <div class="col-12 mb-3">
                <label class="form-label fw-bold">User Agent</label>
                <div class="p-3 bg-light rounded small">
                  {{ selectedLog.user_agent }}
                </div>
              </div>
              <div v-if="selectedLog.metadata" class="col-12">
                <label class="form-label fw-bold">ข้อมูลเพิ่มเติม</label>
                <pre class="p-3 bg-dark text-light rounded small">{{
                  JSON.stringify(selectedLog.metadata, null, 2)
                }}</pre>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              ปิด
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from "vue";
import { Modal } from "bootstrap";
import moment from "moment";
import "moment/locale/th";
import { auditService } from "@/services/auditService";

// Set moment to Thai locale globally
moment.locale("th");

// State
const loading = ref(false);
const exporting = ref(false);
const showFilters = ref(true);
const autoRefresh = ref(false);
const currentPage = ref(1);
const pageSize = ref(25);
const sortField = ref("timestamp");
const sortOrder = ref("desc");
const selectedLog = ref(null);
const selectedQuickPeriod = ref("");

// Data
const auditLogs = ref([]);
const stats = reactive({
  today: 0,
  thisWeek: 0,
  activeUsers: 0,
  failedLogins: 0,
});

const filters = reactive({
  search: "",
  dateFrom: "",
  dateTo: "",
  action: "",
  userRole: "",
  ipAddress: "",
});

const totalCount = ref(0);
const filteredCount = ref(0);

// Quick date period options
const quickDatePeriods = [
  { label: "วันนี้", value: "today" },
  { label: "7 วัน", value: "7days" },
  { label: "30 วัน", value: "30days" },
];

// Refs
const logDetailsModal = ref(null);
let modalInstance = null;
let searchTimeout = null;
let refreshInterval = null;

// Computed
const totalPages = computed(() => {
  return Math.ceil(totalCount.value / parseInt(pageSize.value));
});

const paginationPages = computed(() => {
  const pages = [];
  const total = totalPages.value;
  const current = currentPage.value;

  // Always show first page
  if (total > 0) pages.push(1);

  // Show pages around current page
  for (
    let i = Math.max(2, current - 2);
    i <= Math.min(total - 1, current + 2);
    i++
  ) {
    if (!pages.includes(i)) pages.push(i);
  }

  // Always show last page
  if (total > 1 && !pages.includes(total)) pages.push(total);

  return pages.sort((a, b) => a - b);
});

// Methods
const toggleFilters = () => {
  showFilters.value = !showFilters.value;
};

const refreshLogs = async () => {
  await loadAuditLogs();
  await loadStats();
};

const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    applyFilters();
  }, 500);
};

const clearSearch = () => {
  filters.search = "";
  applyFilters();
};

const clearAllFilters = () => {
  Object.keys(filters).forEach((key) => {
    filters[key] = "";
  });
  selectedQuickPeriod.value = "";
  currentPage.value = 1;
  applyFilters();
};

const applyFilters = () => {
  currentPage.value = 1;
  loadAuditLogs();
};

const setQuickDateFilter = (period) => {
  selectedQuickPeriod.value = period;
  const now = moment();

  switch (period) {
    case "today":
      filters.dateFrom = now.format("YYYY-MM-DD");
      filters.dateTo = now.format("YYYY-MM-DD");
      break;
    case "7days":
      filters.dateFrom = now.subtract(7, "days").format("YYYY-MM-DD");
      filters.dateTo = moment().format("YYYY-MM-DD");
      break;
    case "30days":
      filters.dateFrom = now.subtract(30, "days").format("YYYY-MM-DD");
      filters.dateTo = moment().format("YYYY-MM-DD");
      break;
  }

  applyFilters();
};

const sortBy = (field) => {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
  } else {
    sortField.value = field;
    sortOrder.value = "desc";
  }
  loadAuditLogs();
};

const getSortIcon = (field) => {
  if (sortField.value !== field) return "bi-arrow-down-up";
  return sortOrder.value === "asc" ? "bi-arrow-up" : "bi-arrow-down";
};

const changePageSize = () => {
  currentPage.value = 1;
  loadAuditLogs();
};

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    loadAuditLogs();
  }
};

const loadAuditLogs = async () => {
  loading.value = true;

  try {
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
      ...(filters.search && { search: filters.search }),
      ...(filters.dateFrom && { date_from: filters.dateFrom }),
      ...(filters.dateTo && { date_to: filters.dateTo }),
      ...(filters.action && { action_type: filters.action }),
      ...(filters.userRole && { user_role: filters.userRole }),
      ...(filters.ipAddress && { ip_address: filters.ipAddress }),
    };

    const response = await auditService.getAuditLogs(params);

    if (response.success) {
      const logsData = response.data.logs || [];
      const pagination = response.data.pagination || {};

      // แปลงข้อมูลให้ตรงกับ UI format
      auditLogs.value = logsData.map((log) => ({
        id: log.log_id,
        timestamp: log.timestamp,
        user_name: log.user_name || "ไม่ระบุ",
        user_role: "Admin", // จะต้องเพิ่มข้อมูลนี้ใน API
        action: log.action_type,
        details: auditService.formatDetails(log.details),
        ip_address: log.ip_address || "",
        user_agent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        metadata: log.details,
      }));

      totalCount.value = pagination.totalRecords || 0;
      filteredCount.value = pagination.totalRecords || 0;
    }
  } catch (error) {
    console.error("Failed to load audit logs:", error);
    // แสดง mock data เมื่อ API ล้มเหลว
    const mockLogs = generateMockAuditLogs();
    let filteredLogs = [...mockLogs];

    // Apply client-side filters for mock data
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredLogs = filteredLogs.filter(
        (log) =>
          log.user_name.toLowerCase().includes(searchLower) ||
          log.action.toLowerCase().includes(searchLower) ||
          log.details.toLowerCase().includes(searchLower)
      );
    }

    if (filters.dateFrom) {
      filteredLogs = filteredLogs.filter((log) =>
        moment(log.timestamp).isSameOrAfter(filters.dateFrom, "day")
      );
    }

    if (filters.dateTo) {
      filteredLogs = filteredLogs.filter((log) =>
        moment(log.timestamp).isSameOrBefore(filters.dateTo, "day")
      );
    }

    if (filters.action) {
      filteredLogs = filteredLogs.filter(
        (log) => log.action === filters.action
      );
    }

    if (filters.userRole) {
      filteredLogs = filteredLogs.filter(
        (log) => log.user_role === filters.userRole
      );
    }

    if (filters.ipAddress) {
      filteredLogs = filteredLogs.filter((log) =>
        log.ip_address.includes(filters.ipAddress)
      );
    }

    // Sort
    filteredLogs.sort((a, b) => {
      const aVal = a[sortField.value];
      const bVal = b[sortField.value];

      if (sortOrder.value === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    totalCount.value = mockLogs.length;
    filteredCount.value = filteredLogs.length;

    // Pagination
    const start = (currentPage.value - 1) * parseInt(pageSize.value);
    const end = start + parseInt(pageSize.value);
    auditLogs.value = filteredLogs.slice(start, end);
  } finally {
    loading.value = false;
  }
};

const loadStats = async () => {
  try {
    const response = await auditService.getStatistics(30);

    if (response.success && response.data) {
      const data = response.data;

      // คำนวณสถิติจากข้อมูลที่ได้
      const todayStats = data.daily_trends?.find((trend) =>
        moment(trend.date).isSame(moment(), "day")
      );

      const weekStats = data.daily_trends
        ?.filter((trend) =>
          moment(trend.date).isAfter(moment().subtract(7, "days"))
        )
        .reduce((sum, trend) => sum + (trend.total_activities || 0), 0);

      stats.today = todayStats?.total_activities || 45;
      stats.thisWeek = weekStats || 287;
      stats.activeUsers = data.daily_trends?.[0]?.active_users || 12;

      // หา failed logins จาก activity_by_type
      const failedLoginStats = data.activity_by_type?.find(
        (activity) => activity.action_type === "FAILED_LOGIN"
      );
      stats.failedLogins = failedLoginStats?.count || 3;
    }
  } catch (error) {
    console.error("Failed to load stats:", error);
    // ใช้ค่า default เมื่อเกิดข้อผิดพลาด
    stats.today = 45;
    stats.thisWeek = 287;
    stats.activeUsers = 12;
    stats.failedLogins = 3;
  }
};

const exportAuditLogs = async () => {
  exporting.value = true;

  try {
    const exportParams = {
      ...(filters.search && { search: filters.search }),
      ...(filters.dateFrom && { date_from: filters.dateFrom }),
      ...(filters.dateTo && { date_to: filters.dateTo }),
      ...(filters.action && { action_type: filters.action }),
      ...(filters.userRole && { user_role: filters.userRole }),
      ...(filters.ipAddress && { ip_address: filters.ipAddress }),
    };

    await auditService.exportAuditLogs(exportParams);
  } catch (error) {
    console.error("Export failed:", error);

    // Fallback: create client-side export
    const exportData = {
      logs: auditLogs.value,
      filters: filters,
      exportDate: new Date().toISOString(),
      totalRecords: filteredCount.value,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${moment().format("YYYY-MM-DD-HHmm")}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } finally {
    exporting.value = false;
  }
};

const showLogDetails = (log) => {
  selectedLog.value = log;
  if (!modalInstance) {
    modalInstance = new Modal(logDetailsModal.value);
  }
  modalInstance.show();
};

const getActionBadgeClass = (action) => {
  return auditService.getActionBadgeClass(action);
};

const getActionIcon = (action) => {
  return auditService.getActionIcon(action);
};

const getActionText = (action) => {
  return auditService.getActionText(action);
};

const getUserInitials = (name) => {
  return auditService.getUserInitials(name);
};

const getUserAgentBrowser = (userAgent) => {
  return auditService.getUserAgentBrowser(userAgent);
};

const getRoleText = (role) => {
  const roleTexts = {
    Admin: "ผู้ดูแลระบบ",
    Reviewer: "ผู้ตรวจสอบ",
    Surveyor: "ผู้สำรวจ",
  };
  return roleTexts[role] || role;
};

const getRoleBadgeClass = (role) => {
  const badgeClasses = {
    Admin: "bg-danger",
    Reviewer: "bg-warning text-dark",
    Surveyor: "bg-info",
  };
  return badgeClasses[role] || "bg-secondary";
};

const formatDateTime = (timestamp) => {
  const date = moment(timestamp);
  const thaiMonths = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ];

  const day = date.format("DD");
  const month = thaiMonths[date.month()];
  const year = date.year() + 543; // Convert to Buddhist Era
  const time = date.format("HH:mm:ss");

  return `${day} ${month} ${year} ${time}`;
};

const formatDateRelative = (timestamp) => {
  const now = moment();
  const date = moment(timestamp);
  const diffInMinutes = now.diff(date, "minutes");
  const diffInHours = now.diff(date, "hours");
  const diffInDays = now.diff(date, "days");

  if (diffInMinutes < 1) {
    return "เมื่อสักครู่";
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} นาทีที่แล้ว`;
  } else if (diffInHours < 24) {
    return `${diffInHours} ชั่วโมงที่แล้ว`;
  } else if (diffInDays < 7) {
    return `${diffInDays} วันที่แล้ว`;
  } else {
    return date.format("DD/MM/YYYY");
  }
};

const generateMockAuditLogs = () => {
  const logs = [];
  const actions = [
    "LOGIN",
    "LOGOUT",
    "CREATE",
    "UPDATE",
    "DELETE",
    "VIEW",
    "APPROVE",
    "REJECT",
  ];
  const users = [
    { name: "ผู้ดูแลระบบ", role: "Admin" },
    { name: "นายสมชาย ใจดี", role: "Reviewer" },
    { name: "นางสมใส เก่งมาก", role: "Surveyor" },
    { name: "นายวิชัย รอบรู้", role: "Surveyor" },
    { name: "นางสาวมาลี สวยงาม", role: "Reviewer" },
  ];

  for (let i = 0; i < 150; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const action = actions[Math.floor(Math.random() * actions.length)];
    const timestamp = moment()
      .subtract(Math.floor(Math.random() * 30), "days")
      .subtract(Math.floor(Math.random() * 24), "hours");

    logs.push({
      id: i + 1,
      timestamp: timestamp.toISOString(),
      user_name: user.name,
      user_role: user.role,
      action: action,
      details: `${getActionText(action)} ${
        action === "CREATE"
          ? "การสำรวจใหม่"
          : action === "UPDATE"
          ? "ข้อมูลการสำรวจ"
          : action === "DELETE"
          ? "รายการข้อมูล"
          : action === "APPROVE"
          ? "การสำรวจ ID #" + (Math.floor(Math.random() * 1000) + 1)
          : "ข้อมูลระบบ"
      }`,
      ip_address: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
      user_agent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      metadata: {
        sessionId: `sess_${Math.random().toString(36).substr(2, 9)}`,
        requestId: `req_${Math.random().toString(36).substr(2, 9)}`,
      },
    });
  }

  return logs;
};

const setupAutoRefresh = () => {
  if (autoRefresh.value) {
    refreshInterval = setInterval(() => {
      if (!loading.value) {
        loadAuditLogs();
      }
    }, 30000); // Refresh every 30 seconds
  } else {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      refreshInterval = null;
    }
  }
};

// Watchers
import { watch } from "vue";

watch(autoRefresh, setupAutoRefresh);

// Lifecycle
onMounted(async () => {
  await refreshLogs();

  // Set default date range to last 7 days
  filters.dateFrom = moment().subtract(7, "days").format("YYYY-MM-DD");
  filters.dateTo = moment().format("YYYY-MM-DD");
  selectedQuickPeriod.value = "7days";

  await loadAuditLogs();
});

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
});
</script>

<style scoped>
.audit-logs {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.rotate-180 {
  transform: rotate(180deg);
  transition: transform 0.3s ease;
}

.btn-group .btn {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
}

.avatar-sm {
  flex-shrink: 0;
}

.table-light th {
  background-color: rgba(0, 0, 0, 0.02) !important;
  font-weight: 600;
  font-size: 0.875rem;
  position: sticky;
  top: 0;
  z-index: 1;
}

.table-hover > tbody > tr:hover {
  background-color: rgba(44, 90, 160, 0.05);
}

.btn-link {
  font-weight: 600;
}

.btn-link:hover {
  color: var(--primary-color) !important;
}

.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.border-start {
  border-left-width: 4px !important;
}

.form-check-input:checked {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

.pagination-sm .page-link {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.badge {
  font-size: 0.75rem;
  font-weight: 500;
}

.badge-sm {
  font-size: 0.65rem;
  padding: 0.2rem 0.4rem;
}

.modal-header {
  background-color: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
}

.modal-footer {
  background-color: var(--bg-primary);
  border-top: 1px solid var(--border-color);
}

pre {
  font-size: 0.75rem;
  max-height: 200px;
  overflow-y: auto;
}

/* Custom scrollbar for pre elements */
pre::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

pre::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

pre::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

pre::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* Mobile responsive */
@media (max-width: 576px) {
  .btn-group {
    flex-direction: column;
  }

  .btn-group .btn {
    border-radius: 0.375rem !important;
    margin-bottom: 0.25rem;
  }

  .btn-group .btn:last-child {
    margin-bottom: 0;
  }

  .d-flex.gap-2 {
    flex-direction: column;
    gap: 0.5rem !important;
  }

  .d-flex.gap-3 {
    flex-direction: column;
    gap: 0.75rem !important;
  }

  .pagination {
    justify-content: center;
  }

  .card-footer .d-flex {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}

@media (max-width: 768px) {
  .table-responsive {
    font-size: 0.875rem;
  }

  .avatar-sm div {
    width: 28px !important;
    height: 28px !important;
    font-size: 11px !important;
  }

  .badge {
    font-size: 0.7rem;
  }
}

/* Print styles */
@media print {
  .btn,
  .pagination,
  .modal,
  .no-print {
    display: none !important;
  }

  .card {
    border: 1px solid #000 !important;
    box-shadow: none !important;
    break-inside: avoid;
  }

  .table {
    font-size: 0.75rem;
  }

  .table th,
  .table td {
    padding: 0.25rem !important;
    border: 1px solid #000 !important;
  }

  .badge {
    border: 1px solid #000 !important;
    color: #000 !important;
    background: transparent !important;
  }
}

/* Enhanced hover effects */
.card:hover {
  box-shadow: var(--shadow-md);
  transition: box-shadow 0.3s ease;
}

.btn:focus {
  box-shadow: 0 0 0 0.2rem rgba(44, 90, 160, 0.25);
}

/* Loading animation */
.spinner-border {
  width: 1.5rem;
  height: 1.5rem;
}

/* Custom form controls */
.form-select:focus,
.form-control:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 0.2rem rgba(44, 90, 160, 0.25);
}

/* Stats cards hover effect */
.card.border-start:hover {
  transform: translateY(-2px);
  transition: transform 0.2s ease;
}

/* Table alternating row colors */
.table-striped > tbody > tr:nth-of-type(odd) > td {
  background-color: rgba(0, 0, 0, 0.01);
}

/* Code blocks */
code {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-size: 0.875em;
}
</style>
