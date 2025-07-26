<template>
  <div class="master-data">
    <!-- Header Section -->
    <div class="master-data-header mb-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 class="mb-1">
            <i class="bi bi-database-gear me-2 text-primary"></i>
            จัดการข้อมูลหลัก
          </h2>
          <p class="text-muted mb-0">
            <i class="bi bi-info-circle me-1"></i>
            จัดการข้อมูลหลักของระบบสำรวจวัด
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
          <button @click="showImportModal" class="btn btn-success">
            <i class="bi bi-upload me-2"></i>
            นำเข้าข้อมูล
          </button>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="row">
        <div class="col-md-3 mb-3">
          <div class="stat-card">
            <div class="stat-icon bg-primary">
              <i class="bi bi-building"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ totalTemples }}</div>
              <div class="stat-label">วัดทั้งหมด</div>
            </div>
          </div>
        </div>
        <div class="col-md-3 mb-3">
          <div class="stat-card">
            <div class="stat-icon bg-success">
              <i class="bi bi-geo-alt"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ totalProvinces }}</div>
              <div class="stat-label">จังหวัด</div>
            </div>
          </div>
        </div>
        <div class="col-md-3 mb-3">
          <div class="stat-card">
            <div class="stat-icon bg-warning">
              <i class="bi bi-map"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ totalDistricts }}</div>
              <div class="stat-label">อำเภอ</div>
            </div>
          </div>
        </div>
        <div class="col-md-3 mb-3">
          <div class="stat-card">
            <div class="stat-icon bg-warning">
              <i class="bi bi-people"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ users.length }}</div>
              <div class="stat-label">ผู้ใช้งาน</div>
            </div>
          </div>
        </div>
        <div class="col-md-3 mb-3">
          <div class="stat-card">
            <div class="stat-icon bg-info">
              <i class="bi bi-signpost"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ totalSubDistricts }}</div>
              <div class="stat-label">ตำบล</div>
            </div>
          </div>
        </div>
        <div class="col-md-3 mb-3">
          <div class="stat-card">
            <div class="stat-icon bg-secondary">
              <i class="bi bi-award"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ policeRanks.length }}</div>
              <div class="stat-label">ยศตำรวจ</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs Section -->
    <div class="master-data-content">
      <ul class="nav nav-tabs mb-4" role="tablist">
        <li class="nav-item" role="presentation">
          <button
            class="nav-link active"
            data-bs-toggle="tab"
            data-bs-target="#temples-tab"
            type="button"
            role="tab"
          >
            <i class="bi bi-building me-2"></i>
            ข้อมูลวัด
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button
            class="nav-link"
            data-bs-toggle="tab"
            data-bs-target="#locations-tab"
            type="button"
            role="tab"
          >
            <i class="bi bi-geo-alt me-2"></i>
            ข้อมูลที่ตั้ง
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button
            class="nav-link"
            data-bs-toggle="tab"
            data-bs-target="#users-tab"
            type="button"
            role="tab"
          >
            <i class="bi bi-people me-2"></i>
            ข้อมูลผู้ใช้งาน
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button
            class="nav-link"
            data-bs-toggle="tab"
            data-bs-target="#import-history-tab"
            type="button"
            role="tab"
          >
            <i class="bi bi-clock-history me-2"></i>
            ประวัติการนำเข้า
          </button>
        </li>
      </ul>

      <div class="tab-content">
        <!-- Temples Tab -->
        <div class="tab-pane fade show active" id="temples-tab" role="tabpanel">
          <div class="temples-section">
            <!-- Search and Filter -->
            <div class="row mb-3">
              <div class="col-md-6 mb-3">
                <div class="input-group">
                  <span class="input-group-text">
                    <i class="bi bi-search"></i>
                  </span>
                  <input
                    v-model="templeSearch"
                    type="text"
                    class="form-control"
                    placeholder="ค้นหาชื่อวัด..."
                    @input="searchTemples"
                  />
                </div>
              </div>
              <div class="col-md-3 mb-3">
                <select
                  v-model="selectedProvince"
                  class="form-select"
                  @change="filterByProvince"
                >
                  <option value="">ทุกจังหวัด</option>
                  <option
                    v-for="province in provinces"
                    :key="province.id"
                    :value="province.id"
                  >
                    {{ province.name }}
                  </option>
                </select>
              </div>
              <div class="col-md-3 mb-3">
                <select
                  v-model="selectedDistrict"
                  class="form-select"
                  @change="filterByDistrict"
                  :disabled="!selectedProvince"
                >
                  <option value="">ทุกอำเภอ</option>
                  <option
                    v-for="district in filteredDistricts"
                    :key="district.id"
                    :value="district.id"
                  >
                    {{ district.name }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Temples Table -->
            <div class="table-responsive">
              <table class="table table-hover">
                <thead class="table-light">
                  <tr>
                    <th>ชื่อวัด</th>
                    <th>ที่อยู่</th>
                    <th>จังหวัด</th>
                    <th>อำเภอ</th>
                    <th>ตำบล</th>
                    <th>รหัสไปรษณีย์</th>
                    <th class="text-center">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="loading">
                    <td colspan="7" class="text-center py-4">
                      <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">กำลังโหลด...</span>
                      </div>
                      <p class="mt-2 mb-0">กำลังโหลดข้อมูล...</p>
                    </td>
                  </tr>
                  <tr v-else-if="filteredTemples.length === 0">
                    <td colspan="7" class="text-center py-4">
                      <i
                        class="bi bi-building text-muted"
                        style="font-size: 2rem"
                      ></i>
                      <p class="mt-2 mb-0">ไม่พบข้อมูลวัด</p>
                    </td>
                  </tr>
                  <tr
                    v-else
                    v-for="temple in paginatedTemples"
                    :key="temple.id"
                  >
                    <td>
                      <div class="fw-medium">{{ temple.name }}</div>
                      <small class="text-muted">ID: {{ temple.id }}</small>
                    </td>
                    <td>{{ temple.address || "-" }}</td>
                    <td>{{ temple.province_name || "-" }}</td>
                    <td>{{ temple.district_name || "-" }}</td>
                    <td>{{ temple.sub_district_name || "-" }}</td>
                    <td>{{ temple.postal_code || "-" }}</td>
                    <td class="text-center">
                      <div class="btn-group" role="group">
                        <button
                          class="btn btn-outline-primary btn-sm"
                          @click="viewTemple(temple.id)"
                          title="ดูรายละเอียด"
                        >
                          <i class="bi bi-eye"></i>
                        </button>
                        <button
                          class="btn btn-outline-secondary btn-sm"
                          @click="editTemple(temple.id)"
                          title="แก้ไข"
                        >
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button
                          class="btn btn-outline-danger btn-sm"
                          @click="deleteTemple(temple.id)"
                          title="ลบ"
                        >
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            <div
              v-if="totalPages > 1"
              class="d-flex justify-content-between align-items-center mt-4"
            >
              <div class="text-muted">
                แสดง {{ startRecord }}-{{ endRecord }} จาก
                {{ filteredTemples.length }} รายการ
              </div>
              <nav>
                <ul class="pagination mb-0">
                  <li
                    class="page-item"
                    :class="{ disabled: currentPage === 1 }"
                  >
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

        <!-- Locations Tab -->
        <div class="tab-pane fade" id="locations-tab" role="tabpanel">
          <div class="locations-section">
            <div class="row">
              <div class="col-md-4 mb-4">
                <div class="card">
                  <div class="card-header">
                    <h6 class="mb-0">
                      <i class="bi bi-geo-alt me-2"></i>
                      จังหวัด ({{ provinces.length }})
                    </h6>
                  </div>
                  <div class="card-body location-list">
                    <div
                      v-for="province in provinces"
                      :key="province.id"
                      class="location-item"
                    >
                      <div
                        class="d-flex justify-content-between align-items-center"
                      >
                        <span>{{ province.name }}</span>
                        <small class="text-muted">{{ province.code }}</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-md-4 mb-4">
                <div class="card">
                  <div class="card-header">
                    <h6 class="mb-0">
                      <i class="bi bi-map me-2"></i>
                      อำเภอ ({{ districts.length }})
                    </h6>
                  </div>
                  <div class="card-body location-list">
                    <div
                      v-for="district in districts.slice(0, 20)"
                      :key="district.id"
                      class="location-item"
                    >
                      <div
                        class="d-flex justify-content-between align-items-center"
                      >
                        <span>{{ district.name }}</span>
                        <small class="text-muted">{{
                          district.province_name
                        }}</small>
                      </div>
                    </div>
                    <div v-if="districts.length > 20" class="text-center mt-2">
                      <small class="text-muted"
                        >... และอีก {{ districts.length - 20 }} อำเภอ</small
                      >
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-md-4 mb-4">
                <div class="card">
                  <div class="card-header">
                    <h6 class="mb-0">
                      <i class="bi bi-signpost me-2"></i>
                      ตำบล ({{ subDistricts.length }})
                    </h6>
                  </div>
                  <div class="card-body location-list">
                    <div
                      v-for="subDistrict in subDistricts.slice(0, 20)"
                      :key="subDistrict.id"
                      class="location-item"
                    >
                      <div
                        class="d-flex justify-content-between align-items-center"
                      >
                        <span>{{ subDistrict.name }}</span>
                        <small class="text-muted">{{
                          subDistrict.district_name
                        }}</small>
                      </div>
                    </div>
                    <div
                      v-if="subDistricts.length > 20"
                      class="text-center mt-2"
                    >
                      <small class="text-muted"
                        >... และอีก {{ subDistricts.length - 20 }} ตำบล</small
                      >
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Users Tab -->
        <div class="tab-pane fade" id="users-tab" role="tabpanel">
          <div class="users-section">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5><i class="bi bi-people me-2"></i>จัดการผู้ใช้งาน</h5>
              <div class="d-flex gap-2">
                <button @click="showAddUserModal" class="btn btn-success">
                  <i class="bi bi-person-plus me-2"></i>
                  เพิ่มผู้ใช้งาน
                </button>
                <button @click="showUserImportModal" class="btn btn-primary">
                  <i class="bi bi-upload me-2"></i>
                  นำเข้าผู้ใช้งาน
                </button>
              </div>
            </div>

            <!-- Users Search and Filter -->
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
                    v-model="userSearchTerm"
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
                <select class="form-select" v-model="selectedStatusFilter">
                  <option value="">สถานะทั้งหมด</option>
                  <option value="active">ใช้งาน</option>
                  <option value="inactive">ไม่ใช้งาน</option>
                  <option value="pending">รออนุมัติ</option>
                </select>
              </div>
            </div>

            <!-- Users Table -->
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
                    <th>สถานะ</th>
                    <th>การจัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in filteredUsers" :key="user.id">
                    <td>{{ user.code }}</td>
                    <td>{{ user.full_name }}</td>
                    <td>
                      <span class="badge" :class="getRankBadgeClass(user.rank)">
                        {{ user.rank || "ไม่ระบุ" }}
                      </span>
                    </td>
                    <td>{{ user.position || "ไม่ระบุ" }}</td>
                    <td>{{ user.department }}</td>
                    <td>{{ user.phone || "-" }}</td>
                    <td>{{ user.line_id || "-" }}</td>
                    <td>
                      <span
                        class="badge"
                        :class="getUserStatusBadgeClass(user.status)"
                      >
                        {{ getUserStatusText(user.status) }}
                      </span>
                    </td>
                    <td>
                      <div class="btn-group btn-group-sm">
                        <button
                          v-if="user.status === 'pending'"
                          class="btn btn-outline-success"
                          @click="approveUser(user.id)"
                          title="อนุมัติ"
                        >
                          <i class="bi bi-check-lg"></i>
                        </button>
                        <button
                          class="btn btn-outline-primary"
                          @click="editUser(user)"
                          title="แก้ไข"
                        >
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button
                          class="btn btn-outline-info"
                          @click="viewUser(user)"
                          title="ดูรายละเอียด"
                        >
                          <i class="bi bi-eye"></i>
                        </button>
                        <button
                          class="btn btn-outline-danger"
                          @click="deleteUser(user.id)"
                          title="ลบ"
                        >
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Import History Tab -->
        <div class="tab-pane fade" id="import-history-tab" role="tabpanel">
          <div class="import-history-section">
            <div class="table-responsive">
              <table class="table table-hover">
                <thead class="table-light">
                  <tr>
                    <th>วันที่นำเข้า</th>
                    <th>ไฟล์</th>
                    <th>จำนวนรายการ</th>
                    <th>สถานะ</th>
                    <th>ผู้นำเข้า</th>
                    <th class="text-center">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="importHistory.length === 0">
                    <td colspan="6" class="text-center py-4">
                      <i
                        class="bi bi-clock-history text-muted"
                        style="font-size: 2rem"
                      ></i>
                      <p class="mt-2 mb-0">ยังไม่มีประวัติการนำเข้าข้อมูล</p>
                    </td>
                  </tr>
                  <tr v-else v-for="history in importHistory" :key="history.id">
                    <td>{{ formatDate(history.created_at) }}</td>
                    <td>
                      <div class="d-flex align-items-center">
                        <i
                          class="bi bi-file-earmark-excel text-success me-2"
                        ></i>
                        {{ history.filename }}
                      </div>
                    </td>
                    <td>{{ history.total_records }}</td>
                    <td>
                      <span
                        :class="getStatusBadgeClass(history.status)"
                        class="badge"
                      >
                        {{ getStatusText(history.status) }}
                      </span>
                    </td>
                    <td>{{ history.imported_by }}</td>
                    <td class="text-center">
                      <button
                        class="btn btn-outline-primary btn-sm"
                        @click="viewImportDetails(history.id)"
                        title="ดูรายละเอียด"
                      >
                        <i class="bi bi-eye"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals here... -->
    <!-- (Continue with your modals from the original file) -->

    <!-- Toast Container -->
    <div
      id="toast-container"
      class="position-fixed top-0 end-0 p-3"
      style="z-index: 1051"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, nextTick } from "vue";
import { useRouter } from "vue-router";
import masterDataService from "@/services/masterDataService";
import moment from "moment";

const router = useRouter();

// State variables
const loading = ref(true);
const importing = ref(false);
const showModal = ref(false);
const selectedFile = ref(null);
const isDragOver = ref(false);
const previewData = ref([]);
const columnMapping = ref({});
const showColumnMapping = ref(false);
const availableColumns = ref([]);

// Required fields for import
const requiredFields = [
  "Name",
  "TAM_NAM_T",
  "AMP_NAM_T",
  "PROV_NAM_T",
  "Latitude",
  "Longitude",
];

// File refs
const fileInputRef = ref(null);

// Data arrays
const temples = ref([]);
const provinces = ref([]);
const districts = ref([]);
const subDistricts = ref([]);
const importHistory = ref([]);
const users = ref([]);
const policeRanks = ref([]);

// Search and filter states
const templeSearch = ref("");
const selectedProvince = ref("");
const selectedDistrict = ref("");
const userSearchTerm = ref("");
const selectedRankFilter = ref("");
const selectedStatusFilter = ref("");
const selectedDepartmentFilter = ref("");

// User management states
const showUserModalState = ref(false);
const showUserDetailModalState = ref(false);
const editingUser = ref(null);
const selectedUser = ref(null);

// Pagination
const currentPage = ref(1);
const perPage = 20;

// Import options
const importOptions = reactive({
  updateExisting: false,
  skipDuplicates: true,
});

// Modal states
const showUserImportModalState = ref(false);
const showRankModalState = ref(false);
const editingRank = ref(null);

// File inputs
const selectedUserFile = ref(null);
const userFileInputRef = ref(null);

// Form data
const rankForm = reactive({
  name: "",
  abbreviation: "",
  level: "",
  order: "",
  color: "#073B4C",
  active: true,
});

const userForm = reactive({
  code: "",
  first_name: "",
  last_name: "",
  email: "",
  rank: "",
  position: "",
  department: "",
  phone: "",
  line_id: "",
  status: "pending",
});

// Computed properties
const totalTemples = computed(() => temples.value.length);
const totalProvinces = computed(() => provinces.value.length);
const totalDistricts = computed(() => districts.value.length);
const totalSubDistricts = computed(() => subDistricts.value.length);

const isColumnMappingValid = computed(() => {
  return requiredFields.every(
    (field) =>
      columnMapping.value[field] && columnMapping.value[field].trim() !== ""
  );
});

const filteredDistricts = computed(() => {
  if (!selectedProvince.value) return [];
  return districts.value.filter(
    (district) => district.province_id === selectedProvince.value
  );
});

const filteredUsers = computed(() => {
  let filtered = users.value;

  if (userSearchTerm.value) {
    const search = userSearchTerm.value.toLowerCase();
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
      (user) => user.department === selectedDepartmentFilter.value
    );
  }

  if (selectedStatusFilter.value) {
    filtered = filtered.filter(
      (user) => user.status === selectedStatusFilter.value
    );
  }

  return filtered;
});

const uniqueDepartments = computed(() => {
  const departments = users.value
    .map((user) => user.department)
    .filter((dept) => dept && dept.trim() !== "");
  return [...new Set(departments)].sort();
});

const filteredTemples = computed(() => {
  let filtered = temples.value;

  if (templeSearch.value) {
    const search = templeSearch.value.toLowerCase();
    filtered = filtered.filter((temple) =>
      temple.name.toLowerCase().includes(search)
    );
  }

  if (selectedProvince.value) {
    filtered = filtered.filter(
      (temple) => temple.province_id === selectedProvince.value
    );
  }

  if (selectedDistrict.value) {
    filtered = filtered.filter(
      (temple) => temple.district_id === selectedDistrict.value
    );
  }

  return filtered;
});

const totalPages = computed(() => {
  return Math.ceil(filteredTemples.value.length / perPage);
});

const paginatedTemples = computed(() => {
  const start = (currentPage.value - 1) * perPage;
  const end = start + perPage;
  return filteredTemples.value.slice(start, end);
});

const visiblePages = computed(() => {
  const pages = [];
  const start = Math.max(1, currentPage.value - 2);
  const end = Math.min(totalPages.value, currentPage.value + 2);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
});

const startRecord = computed(() => {
  return (currentPage.value - 1) * perPage + 1;
});

const endRecord = computed(() => {
  return Math.min(currentPage.value * perPage, filteredTemples.value.length);
});

// Methods
const loadData = async () => {
  try {
    loading.value = true;
    await Promise.all([
      loadTemples(),
      loadLocations(),
      loadUsers(),
      loadPoliceRanks(),
      loadImportHistory(),
    ]);
  } catch (error) {
    console.error("Error loading data:", error);
    showToast("เกิดข้อผิดพลาดในการโหลดข้อมูล", "error");
    await loadMockData();
  } finally {
    loading.value = false;
  }
};

const loadTemples = async () => {
  try {
    const response = await masterDataService.getTemples();
    if (response.success && response.data) {
      temples.value = response.data.temples || response.data || [];
    } else {
      temples.value = getMockTemples();
    }
  } catch (error) {
    console.warn("Failed to load temples from API, using mock data");
    temples.value = getMockTemples();
  }
};

const loadLocations = async () => {
  try {
    const [provincesRes, districtsRes, subDistrictsRes] = await Promise.all([
      masterDataService.getProvinces(),
      masterDataService.getDistricts(),
      masterDataService.getSubDistricts(),
    ]);

    provinces.value = provincesRes.success
      ? provincesRes.data || []
      : getMockProvinces();
    districts.value = districtsRes.success
      ? districtsRes.data || []
      : getMockDistricts();
    subDistricts.value = subDistrictsRes.success
      ? subDistrictsRes.data || []
      : getMockSubDistricts();
  } catch (error) {
    console.warn("Failed to load locations from API, using mock data");
    provinces.value = getMockProvinces();
    districts.value = getMockDistricts();
    subDistricts.value = getMockSubDistricts();
  }
};

const loadUsers = async () => {
  try {
    const response = await masterDataService.getUsers();
    if (response.success && response.data) {
      users.value = response.data;
    } else {
      console.warn("No users data received from API");
      users.value = getMockUsers();
    }
  } catch (error) {
    console.error("Failed to load users:", error);
    users.value = getMockUsers();
  }
};

const loadPoliceRanks = async () => {
  try {
    const response = await masterDataService.getPoliceRanks();
    if (response.success && response.data) {
      policeRanks.value = response.data;
    } else {
      console.warn("No police ranks data received from API");
      policeRanks.value = getMockPoliceRanks();
    }
  } catch (error) {
    console.error("Failed to load police ranks:", error);
    policeRanks.value = getMockPoliceRanks();
  }
};

const loadImportHistory = async () => {
  try {
    const response = await masterDataService.getImportHistory();
    if (response.success && response.data) {
      importHistory.value = response.data;
    } else {
      console.warn("No import history data received from API");
      importHistory.value = getMockImportHistory();
    }
  } catch (error) {
    console.error("Failed to load import history:", error);
    importHistory.value = getMockImportHistory();
  }
};

// Mock data functions
const getMockTemples = () => [
  {
    id: 1,
    name: "วัดพระแก้ว",
    address: "2 ถนนนาพระลาน เขตพระนคร",
    province_name: "กรุงเทพมหานคร",
    district_name: "พระนคร",
    sub_district_name: "พระบรมมหาราชวัง",
    postal_code: "10200",
    province_id: 1,
    district_id: 1,
  },
];

const getMockProvinces = () => [{ id: 1, name: "กรุงเทพมหานคร", code: "10" }];

const getMockDistricts = () => [
  { id: 1, name: "พระนคร", province_id: 1, province_name: "กรุงเทพมหานคร" },
];

const getMockSubDistricts = () => [
  { id: 1, name: "พระบรมมหาราชวัง", district_id: 1, district_name: "พระนคร" },
];

const getMockUsers = () => [
  {
    id: 1,
    code: "POL001",
    first_name: "สมชาย",
    last_name: "ใจดี",
    full_name: "สมชาย ใจดี",
    email: "somchai@police.go.th",
    rank: "สารวัตร",
    position: "หัวหน้าหน่วย",
    department: "สถานีตำรวจนครบาลบางซื่อ",
    phone: "02-123-4567",
    line_id: "@police123",
    status: "active",
    created_at: new Date().toISOString(),
  },
];

const getMockPoliceRanks = () => [
  {
    id: 1,
    name: "สารวัตร",
    abbreviation: "สวท.",
    level: 5,
    order: 1,
    active: true,
  },
];

const getMockImportHistory = () => [
  {
    id: 1,
    filename: "temples_import.csv",
    total_records: 100,
    status: "completed",
    imported_by: "Admin",
    created_at: new Date().toISOString(),
  },
];

// Additional methods would continue here...
const refreshData = () => {
  loadData();
};

const showImportModal = () => {
  showModal.value = true;
};

const hideImportModal = () => {
  showModal.value = false;
  selectedFile.value = null;
  showColumnMapping.value = false;
};

const showAddUserModal = () => {
  editingUser.value = null;
  resetUserForm();
  showUserModalState.value = true;
};

const hideUserModal = () => {
  showUserModalState.value = false;
  editingUser.value = null;
  resetUserForm();
};

const hideUserDetailModal = () => {
  showUserDetailModalState.value = false;
  selectedUser.value = null;
};

const showUserImportModal = () => {
  showUserImportModalState.value = true;
};

const hideUserImportModal = () => {
  showUserImportModalState.value = false;
  selectedUserFile.value = null;
};

const hideRankModal = () => {
  showRankModalState.value = false;
  editingRank.value = null;
  resetRankForm();
};

const resetUserForm = () => {
  Object.assign(userForm, {
    code: "",
    first_name: "",
    last_name: "",
    email: "",
    rank: "",
    position: "",
    department: "",
    phone: "",
    line_id: "",
    status: "pending",
  });
};

const resetRankForm = () => {
  Object.assign(rankForm, {
    name: "",
    abbreviation: "",
    level: "",
    order: "",
    color: "#073B4C",
    active: true,
  });
};

// Utility methods
const formatDate = (dateString) => {
  return moment(dateString).format("DD/MM/YYYY HH:mm");
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const getRankBadgeClass = (rank) => {
  if (!rank) return "bg-secondary";
  if (rank.includes("นาย")) return "bg-success";
  if (rank.includes("สารวัตร")) return "bg-primary";
  if (rank.includes("จ่า")) return "bg-info";
  return "bg-secondary";
};

const getUserStatusBadgeClass = (status) => {
  switch (status) {
    case "active":
      return "bg-success";
    case "inactive":
      return "bg-secondary";
    case "pending":
      return "bg-warning";
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
    default:
      return "ไม่ทราบ";
  }
};

const getStatusBadgeClass = (status) => {
  switch (status) {
    case "completed":
      return "bg-success";
    case "failed":
      return "bg-danger";
    case "processing":
      return "bg-warning";
    default:
      return "bg-secondary";
  }
};

const getStatusText = (status) => {
  switch (status) {
    case "completed":
      return "สำเร็จ";
    case "failed":
      return "ล้มเหลว";
    case "processing":
      return "กำลังประมวลผล";
    default:
      return "ไม่ทราบ";
  }
};

const showToast = (message, type = "info") => {
  // Toast implementation here
  console.log(`Toast: ${message} (${type})`);
};

// Stub methods for functionality
const searchTemples = () => {};
const filterByProvince = () => {};
const filterByDistrict = () => {};
const changePage = (page) => {
  currentPage.value = page;
};
const viewTemple = (id) => {
  console.log("View temple:", id);
};
const editTemple = (id) => {
  console.log("Edit temple:", id);
};
const deleteTemple = (id) => {
  console.log("Delete temple:", id);
};
const viewImportDetails = (id) => {
  console.log("View import:", id);
};
const triggerFileInput = () => {
  fileInputRef.value?.click();
};
const handleFileSelect = (event) => {
  console.log("File selected:", event);
};
const handleDrop = (event) => {
  console.log("File dropped:", event);
};
const clearSelectedFile = () => {
  selectedFile.value = null;
};
const downloadTemplate = () => {
  console.log("Download template");
};
const importData = () => {
  console.log("Import data");
};
const getFieldLabel = (field) => field;
const loadMockData = () => {};

// User management methods
const editUser = (user) => {
  editingUser.value = user;
  Object.assign(userForm, {
    code: user.code,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    rank: user.rank || "",
    position: user.position || "",
    department: user.department,
    phone: user.phone || "",
    line_id: user.line_id || "",
    status: user.status,
  });
  hideUserDetailModal();
  showUserModalState.value = true;
};

const viewUser = (user) => {
  selectedUser.value = user;
  showUserDetailModalState.value = true;
};

const deleteUser = async (userId) => {
  if (confirm("คุณแน่ใจหรือไม่ที่จะลบผู้ใช้งานนี้?")) {
    try {
      const response = await masterDataService.deleteUser(userId);
      if (response.success) {
        users.value = users.value.filter((u) => u.id !== userId);
        showToast("ลบผู้ใช้งานสำเร็จ", "success");
      } else {
        throw new Error(response.message || "ลบผู้ใช้งานไม่สำเร็จ");
      }
    } catch (error) {
      console.error("Delete user error:", error);
      showToast("เกิดข้อผิดพลาด: " + error.message, "error");
    }
  }
};

const approveUser = async (userId) => {
  try {
    const response = await masterDataService.approveUser(userId);
    if (response.success) {
      const userIndex = users.value.findIndex((u) => u.id === userId);
      if (userIndex !== -1) {
        users.value[userIndex].status = "active";
      }
      showToast("อนุมัติผู้ใช้งานสำเร็จ", "success");
    } else {
      throw new Error(response.message || "อนุมัติผู้ใช้งานไม่สำเร็จ");
    }
  } catch (error) {
    console.error("Approve user error:", error);
    showToast("เกิดข้อผิดพลาด: " + error.message, "error");
  }
};

const saveUser = async () => {
  try {
    const userData = {
      code: userForm.code,
      first_name: userForm.first_name,
      last_name: userForm.last_name,
      email: userForm.email,
      rank: userForm.rank,
      position: userForm.position,
      department: userForm.department,
      phone: userForm.phone,
      line_id: userForm.line_id,
      status: userForm.status,
    };

    let response;
    if (editingUser.value) {
      response = await masterDataService.updateUser(
        editingUser.value.id,
        userData
      );
    } else {
      response = await masterDataService.createUser(userData);
    }

    if (response.success) {
      if (editingUser.value) {
        const userIndex = users.value.findIndex(
          (u) => u.id === editingUser.value.id
        );
        if (userIndex !== -1) {
          users.value[userIndex] = {
            ...users.value[userIndex],
            ...userData,
            full_name: `${userData.first_name} ${userData.last_name}`,
          };
        }
        showToast("แก้ไขผู้ใช้งานสำเร็จ", "success");
      } else {
        users.value.push({
          ...userData,
          id: Date.now(),
          full_name: `${userData.first_name} ${userData.last_name}`,
        });
        showToast("เพิ่มผู้ใช้งานสำเร็จ", "success");
      }
      hideUserModal();
    } else {
      throw new Error(response.message || "บันทึกข้อมูลไม่สำเร็จ");
    }
  } catch (error) {
    console.error("Save user error:", error);
    showToast("เกิดข้อผิดพลาด: " + error.message, "error");
  }
};

const saveRank = () => {
  console.log("Save rank:", rankForm);
  hideRankModal();
};

const triggerUserFileInput = () => {
  userFileInputRef.value?.click();
};

const handleUserFileSelect = (event) => {
  console.log("User file selected:", event);
};

const downloadUserTemplate = () => {
  console.log("Download user template");
};

const importUserData = () => {
  console.log("Import user data");
};

// Initialize component
onMounted(() => {
  loadData();
});
</script>

<style scoped>
/* Add your styles here */
.master-data {
  padding: 1rem;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  border: 1px solid rgba(0, 0, 0, 0.125);
}

.stat-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
  margin-right: 1rem;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #212529;
}

.stat-label {
  font-size: 0.875rem;
  color: #6c757d;
}

.location-list {
  max-height: 300px;
  overflow-y: auto;
}

.location-item {
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.upload-zone {
  border: 2px dashed #dee2e6;
  border-radius: 0.5rem;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-zone:hover {
  border-color: #0d6efd;
  background-color: #f8f9fa;
}

.upload-icon {
  font-size: 3rem;
  color: #6c757d;
  margin-bottom: 1rem;
}

.btn-group .btn {
  border-radius: 0.375rem !important;
}

@media (max-width: 768px) {
  .btn-group {
    display: flex;
    flex-direction: column;
  }

  .btn-group .btn {
    margin-bottom: 0.25rem;
  }

  .btn-group .btn:last-child {
    margin-bottom: 0;
  }
}
</style>
