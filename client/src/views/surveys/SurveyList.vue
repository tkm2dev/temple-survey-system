<template>
  <div class="survey-list-container">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="mb-1">จัดการแบบสำรวจ</h2>
        <p class="text-muted mb-0">รายการแบบสำรวจทั้งหมดในระบบ</p>
      </div>
      <div class="btn-group">
        <router-link
          v-if="authStore.can('create_survey')"
          to="/surveys/create"
          class="btn btn-primary"
        >
          <i class="bi bi-plus"></i>
          สร้างแบบสำรวจ
        </router-link>
        <button class="btn btn-success" @click="showImportModal">
          <i class="bi bi-upload"></i>
          นำเข้าข้อมูล
        </button>
        <button class="btn btn-info" @click="exportSurveys">
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
                <h5 class="card-title">แบบสำรวจทั้งหมด</h5>
                <h3 class="mb-0">{{ statistics.total }}</h3>
              </div>
              <div class="align-self-center">
                <i class="bi bi-clipboard-data fs-1"></i>
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
                <h5 class="card-title">เสร็จสิ้นแล้ว</h5>
                <h3 class="mb-0">{{ statistics.completed }}</h3>
              </div>
              <div class="align-self-center">
                <i class="bi bi-check-circle fs-1"></i>
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
                <h5 class="card-title">กำลังดำเนินการ</h5>
                <h3 class="mb-0">{{ statistics.inProgress }}</h3>
              </div>
              <div class="align-self-center">
                <i class="bi bi-clock fs-1"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-danger text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h5 class="card-title">ร่าง</h5>
                <h3 class="mb-0">{{ statistics.draft }}</h3>
              </div>
              <div class="align-self-center">
                <i class="bi bi-file-earmark fs-1"></i>
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
                placeholder="ค้นหาแบบสำรวจ..."
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

          <!-- Status Filter -->
          <div class="col-md-2">
            <select
              class="form-select"
              v-model="filters.status"
              @change="applyFilters"
            >
              <option value="">ทุกสถานะ</option>
              <option value="Draft">ร่าง</option>
              <option value="Pending Review">รอตรวจสอบ</option>
              <option value="Approved">อนุมัติแล้ว</option>
              <option value="Needs Revision">ต้องแก้ไข</option>
            </select>
          </div>

          <!-- Type Filter -->
          <div class="col-md-2">
            <select
              class="form-select"
              v-model="filters.type_id"
              @change="applyFilters"
            >
              <option value="">ทุกประเภท</option>
              <option
                v-for="type in surveyTypes"
                :key="type.type_id"
                :value="type.type_id"
              >
                {{ type.type_name }}
              </option>
            </select>
          </div>

          <!-- Province Filter -->
          <div class="col-md-2">
            <select
              class="form-select"
              v-model="filters.province"
              @change="applyFilters"
            >
              <option value="">ทุกจังหวัด</option>
              <option
                v-for="province in provinces"
                :key="province.id"
                :value="province.name"
              >
                {{ province.name }}
              </option>
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
                  viewMode === 'card' ? 'btn-primary' : 'btn-outline-primary'
                "
                @click="viewMode = 'card'"
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
              @click="bulkUpdateStatus('Approved')"
              :disabled="bulkOperationLoading"
            >
              <i class="bi bi-check-circle"></i> อนุมัติ
            </button>
            <button
              class="btn btn-outline-warning"
              @click="bulkUpdateStatus('Needs Revision')"
              :disabled="bulkOperationLoading"
            >
              <i class="bi bi-exclamation-triangle"></i> ต้องแก้ไข
            </button>
            <button
              class="btn btn-outline-info"
              @click="bulkAssignSurveyor"
              :disabled="bulkOperationLoading"
            >
              <i class="bi bi-person-plus"></i> มอบหมายผู้สำรวจ
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
      <p class="mt-2 text-muted">กำลังโหลดข้อมูลแบบสำรวจ...</p>
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
                  <th
                    scope="col"
                    @click="sortBy('target_name')"
                    class="sortable"
                    :class="getSortClass('target_name')"
                  >
                    ชื่อเป้าหมาย
                  </th>
                  <th scope="col">ประเภท</th>
                  <th scope="col">ที่อยู่</th>
                  <th scope="col">จังหวัด</th>
                  <th
                    scope="col"
                    @click="sortBy('status')"
                    class="sortable"
                    :class="getSortClass('status')"
                  >
                    สถานะ
                  </th>
                  <th scope="col">ผู้สร้าง</th>
                  <th
                    scope="col"
                    @click="sortBy('updated_at')"
                    class="sortable"
                    :class="getSortClass('updated_at')"
                  >
                    วันที่อัปเดต
                  </th>
                  <th scope="col" class="text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="survey in surveys"
                  :key="survey.target_id"
                  :class="{
                    'table-primary': selectedItems.includes(survey.target_id),
                  }"
                >
                  <td>
                    <div class="form-check">
                      <input
                        class="form-check-input"
                        type="checkbox"
                        :value="survey.target_id"
                        v-model="selectedItems"
                      />
                    </div>
                  </td>
                  <td>
                    <div class="survey-info">
                      <strong>{{ survey.target_name }}</strong>
                      <div class="text-muted small mt-1">
                        <i class="bi bi-tag me-1"></i
                        >{{ survey.type_name || "ไม่ระบุประเภท" }}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="badge bg-light text-dark">
                      {{ survey.type_name }}
                    </span>
                  </td>
                  <td>
                    <div class="text-truncate" style="max-width: 200px">
                      {{ survey.address }}
                    </div>
                  </td>
                  <td>{{ survey.province }}</td>
                  <td>
                    <span
                      :class="getStatusBadgeClass(survey.status)"
                      class="badge"
                    >
                      <i :class="getStatusIcon(survey.status)" class="me-1"></i>
                      {{ getStatusText(survey.status) }}
                    </span>
                  </td>
                  <td>
                    <div class="small">{{ survey.created_by_name }}</div>
                  </td>
                  <td>
                    <small class="text-muted">
                      {{ formatDate(survey.updated_at) }}
                    </small>
                  </td>
                  <td class="text-center">
                    <div class="btn-group" role="group">
                      <router-link
                        :to="`/surveys/${survey.target_id}`"
                        class="btn btn-outline-primary btn-sm"
                        title="ดูรายละเอียด"
                      >
                        <i class="bi bi-eye"></i>
                      </router-link>
                      <router-link
                        v-if="canEdit(survey)"
                        :to="`/surveys/${survey.target_id}/edit`"
                        class="btn btn-outline-secondary btn-sm"
                        title="แก้ไข"
                      >
                        <i class="bi bi-pencil"></i>
                      </router-link>
                      <button
                        class="btn btn-outline-danger btn-sm"
                        @click="deleteSurvey(survey.target_id)"
                        title="ลบ"
                        :disabled="deleteLoading[survey.target_id]"
                      >
                        <span
                          v-if="deleteLoading[survey.target_id]"
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

      <!-- Card View -->
      <div v-else class="row">
        <div
          v-for="survey in surveys"
          :key="survey.target_id"
          class="col-12 col-md-6 col-xl-4 mb-3"
        >
          <div
            class="card h-100"
            :class="{
              'border-primary': selectedItems.includes(survey.target_id),
            }"
          >
            <div class="card-body">
              <div
                class="d-flex justify-content-between align-items-start mb-2"
              >
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    :value="survey.target_id"
                    v-model="selectedItems"
                  />
                </div>
                <span class="badge" :class="getStatusBadgeClass(survey.status)">
                  {{ getStatusText(survey.status) }}
                </span>
              </div>

              <h6 class="card-title mb-2 text-truncate">
                {{ survey.target_name }}
              </h6>

              <div class="mb-2">
                <small class="text-muted">
                  <i class="bi bi-tag me-1"></i>{{ survey.type_name }}
                </small>
              </div>

              <div class="mb-2">
                <small class="text-muted text-truncate d-block">
                  <i class="bi bi-geo-alt me-1"></i>{{ survey.address }},
                  {{ survey.province }}
                </small>
              </div>

              <div class="row text-center border-top pt-2 mt-3">
                <div class="col">
                  <small class="text-muted d-block">ผู้สร้าง</small>
                  <small class="fw-bold">{{ survey.created_by_name }}</small>
                </div>
                <div class="col">
                  <small class="text-muted d-block">วันที่อัปเดต</small>
                  <small class="fw-bold">{{
                    formatDate(survey.updated_at)
                  }}</small>
                </div>
              </div>
            </div>

            <div class="card-footer bg-light">
              <div class="d-flex gap-2">
                <router-link
                  :to="`/surveys/${survey.target_id}`"
                  class="btn btn-sm btn-outline-primary flex-grow-1"
                >
                  <i class="bi bi-eye me-1"></i>ดูรายละเอียด
                </router-link>
                <router-link
                  v-if="canEdit(survey)"
                  :to="`/surveys/${survey.target_id}/edit`"
                  class="btn btn-sm btn-outline-secondary"
                >
                  <i class="bi bi-pencil"></i>
                </router-link>
                <button
                  class="btn btn-sm btn-outline-danger"
                  @click="deleteSurvey(survey.target_id)"
                  :disabled="deleteLoading[survey.target_id]"
                >
                  <span
                    v-if="deleteLoading[survey.target_id]"
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
      <div v-if="!loading && surveys.length === 0" class="text-center py-5">
        <div class="empty-state">
          <i class="bi bi-clipboard-data display-1 text-muted mb-3"></i>
          <h5 class="text-muted">ไม่พบแบบสำรวจ</h5>
          <p class="text-muted">
            {{
              searchQuery
                ? "ไม่พบแบบสำรวจที่ตรงกับคำค้นหา"
                : "ยังไม่มีแบบสำรวจในระบบ"
            }}
          </p>
          <router-link
            v-if="!searchQuery"
            to="/surveys/create"
            class="btn btn-primary"
          >
            <i class="bi bi-plus"></i>
            สร้างแบบสำรวจแรก
          </router-link>
        </div>
      </div>

      <!-- Pagination -->
      <div
        v-if="!loading && surveys.length > 0"
        class="d-flex justify-content-between align-items-center mt-4"
      >
        <div class="pagination-info">
          <span class="text-muted">
            แสดง
            {{ (pagination.currentPage - 1) * pagination.itemsPerPage + 1 }} ถึง
            {{
              Math.min(
                pagination.currentPage * pagination.itemsPerPage,
                pagination.totalRecords
              )
            }}
            จาก {{ pagination.totalRecords }} รายการ
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
        <nav aria-label="Survey pagination">
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
              :class="{ disabled: !pagination.hasPrevPage }"
            >
              <button
                class="page-link"
                @click="changePage(pagination.currentPage - 1)"
                :disabled="!pagination.hasPrevPage"
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
              :class="{ disabled: !pagination.hasNextPage }"
            >
              <button
                class="page-link"
                @click="changePage(pagination.currentPage + 1)"
                :disabled="!pagination.hasNextPage"
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
import { ref, reactive, computed, onMounted, watch } from "vue";
import { useAuthStore } from "@/stores/auth";
import api from "@/services/api";
import surveyService from "@/services/surveyService";
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
  name: "SurveyList",
  setup() {
    const authStore = useAuthStore();

    // Data
    const surveys = ref([]);
    const surveyTypes = ref([]);
    const provinces = ref([]);
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
      completed: 0,
      inProgress: 0,
      draft: 0,
    });

    // Filters
    const filters = reactive({
      search: "",
      status: "",
      type_id: "",
      province: "",
      created_by: "",
    });

    // Pagination
    const pagination = reactive({
      currentPage: 1,
      totalPages: 1,
      totalRecords: 0,
      itemsPerPage: 12,
      hasNextPage: false,
      hasPrevPage: false,
    });

    // Computed properties
    const isAllSelected = computed(() => {
      return (
        surveys.value.length > 0 &&
        selectedItems.value.length === surveys.value.length
      );
    });

    const isIndeterminate = computed(() => {
      return (
        selectedItems.value.length > 0 &&
        selectedItems.value.length < surveys.value.length
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
    const loadSurveyTypes = async () => {
      try {
        const response = await api.get("/master-data/survey-types");
        if (response.data.success) {
          surveyTypes.value = response.data.data;
        }
      } catch (error) {
        console.error("Failed to load survey types:", error);
      }
    };

    const loadProvinces = async () => {
      try {
        const response = await api.get("/master-data/provinces");
        if (response.data.success) {
          provinces.value = response.data.data;
        }
      } catch (error) {
        console.error("Failed to load provinces:", error);
      }
    };

    const loadStatistics = async () => {
      try {
        const response = await surveyService.getStatistics();
        Object.assign(statistics, response);
      } catch (error) {
        console.error("Failed to load statistics:", error);
      }
    };

    const loadSurveys = async (page = 1) => {
      loading.value = true;
      try {
        const params = {
          page,
          limit: pagination.itemsPerPage,
          search: filters.search.trim() || searchQuery.value.trim(),
          status: filters.status,
          type_id: filters.type_id,
          province: filters.province,
          created_by: filters.created_by,
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

        const response = await surveyService.getSurveysPaginated(params);

        surveys.value = response.data;
        Object.assign(pagination, {
          currentPage: response.pagination.currentPage,
          totalPages: response.pagination.totalPages,
          totalRecords: response.pagination.total,
          hasNextPage: response.pagination.hasNextPage,
          hasPrevPage: response.pagination.hasPrevPage,
        });

        // Clear selection when loading new data
        selectedItems.value = [];
      } catch (error) {
        console.error("Failed to load surveys:", error);
        surveys.value = [];
        showToast("error", "เกิดข้อผิดพลาด", "ไม่สามารถโหลดข้อมูลแบบสำรวจได้");
      } finally {
        loading.value = false;
      }
    };

    const debouncedSearch = debounce(() => {
      filters.search = searchQuery.value;
      pagination.currentPage = 1;
      loadSurveys();
    }, 500);

    const debounceSearch = () => {
      debouncedSearch();
    };

    const applyFilters = () => {
      pagination.currentPage = 1;
      loadSurveys();
    };

    const clearSearch = () => {
      searchQuery.value = "";
      filters.search = "";
      pagination.currentPage = 1;
      loadSurveys();
    };

    const changePage = (page) => {
      if (page >= 1 && page <= pagination.totalPages) {
        pagination.currentPage = page;
        loadSurveys(page);
      }
    };

    const changeItemsPerPage = () => {
      pagination.currentPage = 1;
      loadSurveys();
    };

    const clearFilters = () => {
      searchQuery.value = "";
      filters.search = "";
      filters.status = "";
      filters.type_id = "";
      filters.province = "";
      filters.created_by = "";
      pagination.currentPage = 1;
      loadSurveys();
    };

    // Bulk operations
    const toggleSelectAll = () => {
      if (isAllSelected.value) {
        selectedItems.value = [];
      } else {
        selectedItems.value = surveys.value.map((survey) => survey.target_id);
      }
    };

    const bulkUpdateStatus = async (status) => {
      if (selectedItems.value.length === 0) {
        showToast("warning", "แจ้งเตือน", "กรุณาเลือกรายการที่ต้องการอัปเดต");
        return;
      }

      try {
        bulkOperationLoading.value = true;
        await surveyService.bulkUpdateStatus(selectedItems.value, status);
        showToast(
          "success",
          "สำเร็จ",
          `อัปเดตสถานะ ${selectedItems.value.length} รายการเรียบร้อยแล้ว`
        );
        selectedItems.value = [];
        await loadSurveys(pagination.currentPage);
        await loadStatistics();
      } catch (error) {
        console.error("Bulk status update failed:", error);
        showToast("error", "เกิดข้อผิดพลาด", "ไม่สามารถอัปเดตสถานะได้");
      } finally {
        bulkOperationLoading.value = false;
      }
    };

    const bulkAssignSurveyor = async () => {
      if (selectedItems.value.length === 0) {
        showToast("warning", "แจ้งเตือน", "กรุณาเลือกรายการที่ต้องการมอบหมาย");
        return;
      }

      // This would typically open a modal to select surveyor
      // For now, we'll show a placeholder message
      showToast(
        "info",
        "ฟีเจอร์กำลังพัฒนา",
        "ฟีเจอร์มอบหมายผู้สำรวจกำลังอยู่ระหว่างการพัฒนา"
      );
    };

    const bulkExport = async () => {
      if (selectedItems.value.length === 0) {
        showToast("warning", "แจ้งเตือน", "กรุณาเลือกรายการที่ต้องการส่งออก");
        return;
      }

      try {
        bulkOperationLoading.value = true;
        const blob = await surveyService.bulkExport(selectedItems.value);

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `surveys_export_${
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
          `คุณต้องการลบแบบสำรวจ ${selectedItems.value.length} รายการใช่หรือไม่?`
        )
      ) {
        return;
      }

      try {
        bulkOperationLoading.value = true;
        await surveyService.bulkDelete(selectedItems.value);
        showToast(
          "success",
          "สำเร็จ",
          `ลบข้อมูล ${selectedItems.value.length} รายการเรียบร้อยแล้ว`
        );
        selectedItems.value = [];
        await loadSurveys(pagination.currentPage);
        await loadStatistics();
      } catch (error) {
        console.error("Bulk delete failed:", error);
        showToast("error", "เกิดข้อผิดพลาด", "ไม่สามารถลบข้อมูลได้");
      } finally {
        bulkOperationLoading.value = false;
      }
    };

    // Single item operations
    const deleteSurvey = async (surveyId) => {
      if (!confirm("คุณต้องการลบแบบสำรวจนี้ใช่หรือไม่?")) {
        return;
      }

      try {
        deleteLoading.value[surveyId] = true;
        await surveyService.deleteSurvey(surveyId);
        showToast("success", "สำเร็จ", "ลบแบบสำรวจเรียบร้อยแล้ว");
        await loadSurveys(pagination.currentPage);
        await loadStatistics();
      } catch (error) {
        console.error("Delete failed:", error);
        showToast("error", "เกิดข้อผิดพลาด", "ไม่สามารถลบแบบสำรวจได้");
      } finally {
        delete deleteLoading.value[surveyId];
      }
    };

    // Export/Import operations
    const exportSurveys = async () => {
      try {
        const blob = await surveyService.exportAll();

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `all_surveys_${
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
      loadSurveys(pagination.currentPage);
    };

    const getSortClass = (field) => {
      if (sortField.value !== field) return "";
      return sortDirection.value === "asc" ? "sort-asc" : "sort-desc";
    };

    // Utility methods
    const canEdit = (survey) => {
      if (authStore.hasRole("Admin")) return true;
      if (
        authStore.hasRole("Surveyor") &&
        survey.created_by === authStore.user?.user_id
      ) {
        return survey.status === "Draft" || survey.status === "Needs Revision";
      }
      return false;
    };

    const getStatusBadgeClass = (status) => {
      const classes = {
        Draft: "bg-secondary",
        "Pending Review": "bg-warning",
        Approved: "bg-success",
        "Needs Revision": "bg-danger",
      };
      return classes[status] || "bg-secondary";
    };

    const getStatusIcon = (status) => {
      const icons = {
        Draft: "bi bi-file-earmark",
        "Pending Review": "bi bi-clock",
        Approved: "bi bi-check-circle",
        "Needs Revision": "bi bi-exclamation-triangle",
      };
      return icons[status] || "bi bi-file-earmark";
    };

    const getStatusText = (status) => {
      const texts = {
        Draft: "ร่าง",
        "Pending Review": "รอตรวจสอบ",
        Approved: "อนุมัติแล้ว",
        "Needs Revision": "ต้องแก้ไข",
      };
      return texts[status] || status;
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
      await Promise.all([
        loadSurveyTypes(),
        loadProvinces(),
        loadStatistics(),
        loadSurveys(),
      ]);
    });

    return {
      authStore,
      surveys,
      surveyTypes,
      provinces,
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
      loadSurveys,
      debounceSearch,
      applyFilters,
      clearSearch,
      changePage,
      changeItemsPerPage,
      clearFilters,
      toggleSelectAll,
      bulkUpdateStatus,
      bulkAssignSurveyor,
      bulkExport,
      bulkDelete,
      deleteSurvey,
      exportSurveys,
      showImportModal,
      sortBy,
      getSortClass,
      canEdit,
      getStatusBadgeClass,
      getStatusIcon,
      getStatusText,
      formatDate,
      showToast,
      removeToast,
    };
  },
};
</script>

<style scoped>
.survey-list-container {
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

.hover-shadow {
  transition: all 0.3s ease;
}

.hover-shadow:hover {
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.text-truncate {
  max-width: 200px;
}

.sortable {
  cursor: pointer;
  user-select: none;
  position: relative;
  padding-right: 20px !important;
}

.sortable:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.sortable::after {
  content: "↕";
  position: absolute;
  right: 8px;
  opacity: 0.3;
  font-size: 12px;
}

.sortable.sort-asc::after {
  content: "↑";
  opacity: 1;
}

.sortable.sort-desc::after {
  content: "↓";
  opacity: 1;
}

.user-avatar-xs {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  overflow: hidden;
  background-color: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-avatar-xs-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-xs {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #007bff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
}

.progress-info .progress {
  background-color: #e9ecef;
}

.progress-bar {
  transition: width 0.6s ease;
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

.card {
  border: 1px solid rgba(0, 0, 0, 0.125);
  transition: all 0.3s ease;
}

.card:hover {
  border-color: rgba(0, 123, 255, 0.25);
}

.empty-state {
  padding: 3rem 1rem;
}

.pagination-info {
  font-size: 0.875rem;
}

.toast-container {
  z-index: 9999;
}

.toast {
  min-width: 300px;
  background-color: white;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.toast-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.btn-outline-primary:hover,
.btn-outline-secondary:hover,
.btn-outline-success:hover,
.btn-outline-danger:hover,
.btn-outline-warning:hover,
.btn-outline-info:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Mobile optimizations */
@media (max-width: 575.98px) {
  .btn-group .btn {
    font-size: 0.875rem;
    padding: 0.25rem 0.5rem;
  }

  .card-title {
    font-size: 0.95rem;
  }

  .pagination {
    font-size: 0.9rem;
  }

  .table-responsive {
    font-size: 0.875rem;
  }

  .stats-card h3 {
    font-size: 1.5rem;
  }

  .toast {
    min-width: 280px;
  }

  .bulk-toolbar {
    flex-direction: column;
    gap: 0.5rem;
  }

  .bulk-toolbar .btn-group {
    width: 100%;
  }

  .bulk-toolbar .btn-group .btn {
    flex: 1;
    font-size: 0.8rem;
    padding: 0.25rem 0.5rem;
  }
}

@media (max-width: 767.98px) {
  .survey-list-container .row .col-md-3 {
    margin-bottom: 1rem;
  }

  .card-body .row.g-3 > .col-md-4,
  .card-body .row.g-3 > .col-md-2 {
    margin-bottom: 0.75rem;
  }
}

/* Status badge styles */
.badge.bg-secondary {
  background-color: #6c757d !important;
}

.badge.bg-warning {
  background-color: #ffc107 !important;
  color: #000 !important;
}

.badge.bg-success {
  background-color: #198754 !important;
}

.badge.bg-danger {
  background-color: #dc3545 !important;
}

/* Table row selection highlight */
.table-primary {
  background-color: rgba(13, 110, 253, 0.1) !important;
}

/* Bulk selection toolbar */
.border-primary {
  border-color: #0d6efd !important;
}

/* Loading spinner */
.spinner-border-sm {
  width: 0.875rem;
  height: 0.875rem;
}

/* Custom checkbox styling */
.form-check-input:indeterminate {
  background-color: #0d6efd;
  border-color: #0d6efd;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3e%3cpath fill='none' stroke='%23fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='3' d='M6 10h8'/%3e%3c/svg%3e");
}

/* Responsive table improvements */
@media (max-width: 991.98px) {
  .table-responsive table {
    min-width: 800px;
  }
}

/* Card hover effects */
.card.border-primary {
  border-color: #0d6efd !important;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.1);
}

/* Smooth transitions */
* {
  transition: all 0.2s ease-in-out;
}

.btn {
  transition: all 0.15s ease-in-out;
}

.card {
  transition: all 0.3s ease;
}
</style>
