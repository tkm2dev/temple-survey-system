<template>
  <div class="survey-list">
    <!-- Page Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="h3 mb-1">จัดการข้อมูลการสำรวจ</h1>
        <p class="text-muted mb-0">รายการข้อมูลการสำรวจทั้งหมดในระบบ</p>
      </div>
      <div class="btn-group-mobile">
        <router-link
          v-if="authStore.can('create_survey')"
          to="/surveys/create"
          class="btn btn-primary"
        >
          <i class="bi bi-plus-circle me-2"></i>
          สร้างการสำรวจใหม่
        </router-link>
      </div>
    </div>

    <!-- Filters Card -->
    <div class="card mb-4">
      <div class="card-header">
        <h5 class="mb-0">
          <i class="bi bi-funnel me-2"></i>
          ค้นหาและกรองข้อมูล
        </h5>
      </div>
      <div class="card-body">
        <div class="row g-3">
          <div class="col-12 col-md-6 col-lg-3">
            <label class="form-label">ค้นหา</label>
            <input
              v-model="filters.search"
              type="text"
              class="form-control"
              placeholder="ชื่อเป้าหมาย, ที่อยู่, จังหวัด"
              @input="debouncedSearch"
            />
          </div>
          <div class="col-12 col-md-6 col-lg-3">
            <label class="form-label">สถานะ</label>
            <select
              v-model="filters.status"
              class="form-select"
              @change="loadSurveys"
            >
              <option value="">ทั้งหมด</option>
              <option value="Draft">ร่าง</option>
              <option value="Pending Review">รอตรวจสอบ</option>
              <option value="Approved">อนุมัติแล้ว</option>
              <option value="Needs Revision">ต้องแก้ไข</option>
            </select>
          </div>
          <div class="col-12 col-md-6 col-lg-3">
            <label class="form-label">ประเภทการสำรวจ</label>
            <select
              v-model="filters.type_id"
              class="form-select"
              @change="loadSurveys"
            >
              <option value="">ทั้งหมด</option>
              <option
                v-for="type in surveyTypes"
                :key="type.type_id"
                :value="type.type_id"
              >
                {{ type.type_name }}
              </option>
            </select>
          </div>
          <div class="col-12 col-md-6 col-lg-3 d-flex align-items-end">
            <button
              class="btn btn-outline-secondary w-100"
              @click="clearFilters"
            >
              <i class="bi bi-x-circle me-2"></i>
              ล้างตัวกรอง
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Results Card -->
    <div class="card">
      <div
        class="card-header d-flex justify-content-between align-items-center"
      >
        <div>
          <h5 class="mb-0">รายการข้อมูลการสำรวจ</h5>
          <small class="text-muted">
            แสดง {{ surveys.length }} จาก
            {{ pagination.totalRecords || 0 }} รายการ
          </small>
        </div>

        <!-- View Mode Toggle -->
        <div class="btn-group btn-group-sm d-none d-md-flex" role="group">
          <button
            class="btn btn-outline-secondary"
            :class="{ active: viewMode === 'table' }"
            @click="viewMode = 'table'"
          >
            <i class="bi bi-table"></i>
          </button>
          <button
            class="btn btn-outline-secondary"
            :class="{ active: viewMode === 'card' }"
            @click="viewMode = 'card'"
          >
            <i class="bi bi-grid"></i>
          </button>
        </div>
      </div>

      <div class="card-body p-0">
        <!-- Loading -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">กำลังโหลด...</span>
          </div>
          <div class="mt-2">กำลังโหลดข้อมูล...</div>
        </div>

        <!-- No Data -->
        <div
          v-else-if="surveys.length === 0"
          class="text-center py-5 text-muted"
        >
          <i class="bi bi-inbox display-1"></i>
          <h5 class="mt-3">ไม่พบข้อมูลการสำรวจ</h5>
          <p>
            ลองเปลี่ยนเงื่อนไขการค้นหาหรือ
            <button class="btn btn-link p-0" @click="clearFilters">
              ล้างตัวกรอง
            </button>
          </p>
        </div>

        <!-- Table View -->
        <div v-else-if="viewMode === 'table'" class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th>ชื่อเป้าหมาย</th>
                <th class="d-none d-md-table-cell">ประเภท</th>
                <th class="d-none d-lg-table-cell">ที่อยู่</th>
                <th class="d-none d-lg-table-cell">จังหวัด</th>
                <th>สถานะ</th>
                <th class="d-none d-sm-table-cell">ผู้สร้าง</th>
                <th class="d-none d-md-table-cell">วันที่อัปเดต</th>
                <th class="text-center">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="survey in surveys"
                :key="survey.target_id"
                class="align-middle"
              >
                <td>
                  <div class="fw-bold">{{ survey.target_name }}</div>
                  <div class="small text-muted d-md-none">
                    {{ survey.type_name }} • {{ survey.province }}
                  </div>
                </td>
                <td class="d-none d-md-table-cell">
                  <span class="badge bg-light text-dark">{{
                    survey.type_name
                  }}</span>
                </td>
                <td class="d-none d-lg-table-cell">
                  <div class="text-truncate" style="max-width: 200px">
                    {{ survey.address }}
                  </div>
                </td>
                <td class="d-none d-lg-table-cell">{{ survey.province }}</td>
                <td>
                  <span
                    class="badge status-badge"
                    :class="getStatusClass(survey.status)"
                  >
                    <i :class="getStatusIcon(survey.status)"></i>
                    {{ getStatusText(survey.status) }}
                  </span>
                </td>
                <td class="d-none d-sm-table-cell">
                  <div class="small">{{ survey.created_by_name }}</div>
                </td>
                <td class="d-none d-md-table-cell">
                  <div class="small">{{ formatDate(survey.updated_at) }}</div>
                </td>
                <td class="text-center">
                  <div class="btn-group btn-group-sm">
                    <router-link
                      :to="`/surveys/${survey.target_id}`"
                      class="btn btn-outline-primary"
                      title="ดูรายละเอียด"
                    >
                      <i class="bi bi-eye"></i>
                    </router-link>
                    <router-link
                      v-if="canEdit(survey)"
                      :to="`/surveys/${survey.target_id}/edit`"
                      class="btn btn-outline-secondary"
                      title="แก้ไข"
                    >
                      <i class="bi bi-pencil"></i>
                    </router-link>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Card View -->
        <div v-else class="p-3">
          <div class="row">
            <div
              v-for="survey in surveys"
              :key="survey.target_id"
              class="col-12 col-md-6 col-xl-4 mb-3"
            >
              <div class="card h-100 hover-shadow">
                <div class="card-body">
                  <div
                    class="d-flex justify-content-between align-items-start mb-2"
                  >
                    <h6 class="card-title mb-0 text-truncate">
                      {{ survey.target_name }}
                    </h6>
                    <span
                      class="badge status-badge"
                      :class="getStatusClass(survey.status)"
                    >
                      {{ getStatusText(survey.status) }}
                    </span>
                  </div>

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
                      <small class="fw-bold">{{
                        survey.created_by_name
                      }}</small>
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
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.totalPages > 1" class="card-footer">
        <nav aria-label="Survey pagination">
          <ul class="pagination justify-content-center mb-0">
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
              <button class="page-link" @click="changePage(page)">
                {{ page }}
              </button>
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
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import api from "@/services/api";
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

    const surveys = ref([]);
    const surveyTypes = ref([]);
    const loading = ref(false);
    const viewMode = ref("table");

    const filters = reactive({
      search: "",
      status: "",
      type_id: "",
      created_by: "",
    });

    const pagination = reactive({
      currentPage: 1,
      totalPages: 1,
      totalRecords: 0,
      hasNextPage: false,
      hasPrevPage: false,
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

    const loadSurveys = async (page = 1) => {
      loading.value = true;
      try {
        const params = {
          page,
          limit: 10,
          search: filters.search.trim(),
          status: filters.status,
          type_id: filters.type_id,
          created_by: filters.created_by,
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

        const response = await api.get("/surveys", { params });

        if (response.data.success) {
          surveys.value = response.data.data.surveys;
          Object.assign(pagination, response.data.data.pagination);
        }
      } catch (error) {
        console.error("Failed to load surveys:", error);
        surveys.value = [];
      } finally {
        loading.value = false;
      }
    };

    const debouncedSearch = debounce(() => {
      pagination.currentPage = 1;
      loadSurveys();
    }, 500);

    const changePage = (page) => {
      if (page >= 1 && page <= pagination.totalPages) {
        pagination.currentPage = page;
        loadSurveys(page);
      }
    };

    const clearFilters = () => {
      filters.search = "";
      filters.status = "";
      filters.type_id = "";
      filters.created_by = "";
      pagination.currentPage = 1;
      loadSurveys();
    };

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

    const getStatusClass = (status) => {
      const classes = {
        Draft: "status-draft",
        "Pending Review": "status-pending",
        Approved: "status-approved",
        "Needs Revision": "status-revision",
      };
      return classes[status] || "status-draft";
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

    onMounted(async () => {
      await Promise.all([loadSurveyTypes(), loadSurveys()]);
    });

    return {
      authStore,
      surveys,
      surveyTypes,
      loading,
      viewMode,
      filters,
      pagination,
      visiblePages,
      loadSurveys,
      debouncedSearch,
      changePage,
      clearFilters,
      canEdit,
      getStatusClass,
      getStatusIcon,
      getStatusText,
      formatDate,
    };
  },
};
</script>

<style scoped>
.survey-list {
  animation: fadeIn 0.5s ease-in-out;
}

.hover-shadow {
  transition: box-shadow 0.2s ease-in-out;
}

.hover-shadow:hover {
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.text-truncate {
  max-width: 200px;
}

/* Mobile optimizations */
@media (max-width: 575.98px) {
  .btn-group-mobile .btn {
    width: 100%;
    margin-bottom: 0.5rem;
  }

  .card-title {
    font-size: 0.95rem;
  }

  .pagination {
    font-size: 0.9rem;
  }
}
</style>
