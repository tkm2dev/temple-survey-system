<template>
  <div class="survey-temple-container">
    <!-- Header Section -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="mb-1">
          <i class="bi bi-building text-warning me-2"></i>
          สำรวจวัด
        </h2>
        <p class="text-muted mb-0">จัดการข้อมูลวัดและการสำรวจ</p>
      </div>
      <div class="btn-group">
        <button class="btn btn-primary" @click="showCreateModal">
          <i class="bi bi-plus"></i>
          เพิ่มวัดใหม่
        </button>
        <button class="btn btn-success" @click="exportData">
          <i class="bi bi-download"></i>
          ส่งออกข้อมูล
        </button>
        <button class="btn btn-outline-secondary" @click="loadTemples">
          <i class="bi bi-arrow-clockwise"></i>
          โหลดใหม่
        </button>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="row mb-4">
      <div class="col-md-3">
        <div class="card bg-primary text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h6 class="card-title">วัดทั้งหมด</h6>
                <h3 class="mb-0">{{ stats.total }}</h3>
              </div>
              <i class="bi bi-building fs-1 opacity-75"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-success text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h6 class="card-title">อนุมัติแล้ว</h6>
                <h3 class="mb-0">{{ stats.approved }}</h3>
              </div>
              <i class="bi bi-check-circle fs-1 opacity-75"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-warning text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h6 class="card-title">รอตรวจสอบ</h6>
                <h3 class="mb-0">{{ stats.pending }}</h3>
              </div>
              <i class="bi bi-clock fs-1 opacity-75"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-secondary text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h6 class="card-title">ร่าง</h6>
                <h3 class="mb-0">{{ stats.draft }}</h3>
              </div>
              <i class="bi bi-file-earmark fs-1 opacity-75"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row">
          <div class="col-md-4">
            <label class="form-label">ค้นหาชื่อวัด</label>
            <input
              v-model="filters.search"
              type="text"
              class="form-control"
              placeholder="พิมพ์ชื่อวัดที่ต้องการค้นหา..."
              @input="applyFilters"
            />
          </div>
          <div class="col-md-3">
            <label class="form-label">จังหวัด</label>
            <select
              v-model="filters.province"
              class="form-select"
              @change="applyFilters"
            >
              <option value="">ทั้งหมด</option>
              <option
                v-for="province in provinces"
                :key="province"
                :value="province"
              >
                {{ province }}
              </option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">สถานะ</label>
            <select
              v-model="filters.status"
              class="form-select"
              @change="applyFilters"
            >
              <option value="">ทั้งหมด</option>
              <option value="Approved">อนุมัติแล้ว</option>
              <option value="Pending Review">รอตรวจสอบ</option>
              <option value="Draft">ร่าง</option>
            </select>
          </div>
          <div class="col-md-2">
            <label class="form-label">&nbsp;</label>
            <div class="d-grid">
              <button class="btn btn-outline-secondary" @click="clearFilters">
                <i class="bi bi-x-circle"></i>
                ล้างตัวกรอง
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Temple List -->
    <div class="card">
      <div
        class="card-header d-flex justify-content-between align-items-center"
      >
        <h5 class="mb-0">รายการวัด</h5>
        <div class="d-flex align-items-center">
          <span class="text-muted me-3"
            >{{ filteredTemples.length }} รายการ</span
          >
          <div class="btn-group btn-group-sm">
            <button
              class="btn"
              :class="
                viewMode === 'table' ? 'btn-primary' : 'btn-outline-primary'
              "
              @click="viewMode = 'table'"
            >
              <i class="bi bi-table"></i>
            </button>
            <button
              class="btn"
              :class="
                viewMode === 'card' ? 'btn-primary' : 'btn-outline-primary'
              "
              @click="viewMode = 'card'"
            >
              <i class="bi bi-grid"></i>
            </button>
          </div>
        </div>
      </div>

      <div class="card-body">
        <!-- Debug Info (ลบออกเมื่อแก้เสร็จแล้ว) -->
        <div class="alert alert-info" v-if="true">
          <small>
            Debug: loading={{ loading }}, temples={{ temples.length }},
            filtered={{ filteredTemples.length }}, paginated={{
              paginatedTemples.length
            }}
          </small>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">กำลังโหลด...</span>
          </div>
          <p class="mt-2 text-muted">กำลังโหลดข้อมูลวัด...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredTemples.length === 0" class="text-center py-5">
          <i class="bi bi-building text-muted" style="font-size: 4rem"></i>
          <h5 class="mt-3 text-muted">ไม่พบข้อมูลวัด</h5>
          <p class="text-muted">
            ยังไม่มีข้อมูลวัดในระบบ หรือไม่มีข้อมูลที่ตรงกับการค้นหา
          </p>
          <button class="btn btn-primary" @click="showCreateModal">
            <i class="bi bi-plus"></i>
            เพิ่มวัดใหม่
          </button>
        </div>

        <!-- Table View -->
        <div v-else-if="viewMode === 'table'" class="table-responsive">
          <table class="table table-hover">
            <thead class="table-dark">
              <tr>
                <th>ชื่อวัด</th>
                <th>ที่อยู่</th>
                <th>จังหวัด</th>
                <th>สถานะ</th>
                <th>จำนวนพระ</th>
                <th>วันที่สร้าง</th>
                <th>การดำเนินการ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="temple in paginatedTemples" :key="temple.id">
                <td>
                  <div class="d-flex align-items-center">
                    <i class="bi bi-building text-warning me-2"></i>
                    <strong>{{ temple.target_name }}</strong>
                  </div>
                </td>
                <td class="text-muted small">
                  {{ temple.address }}<br />
                  {{ temple.subdistrict }}, {{ temple.district }}
                </td>
                <td>{{ temple.province }}</td>
                <td>
                  <span class="badge" :class="getStatusClass(temple.status)">
                    {{ getStatusText(temple.status) }}
                  </span>
                </td>
                <td>
                  <span v-if="temple.monk_count" class="badge bg-info">
                    {{ temple.monk_count }} รูป
                  </span>
                  <span v-else class="text-muted">-</span>
                </td>
                <td class="text-muted">
                  {{ formatDate(temple.created_at) }}
                </td>
                <td>
                  <div class="btn-group btn-group-sm">
                    <button
                      class="btn btn-outline-info"
                      @click="viewDetails(temple)"
                    >
                      <i class="bi bi-eye"></i>
                    </button>
                    <button
                      class="btn btn-outline-warning"
                      @click="editTemple(temple)"
                    >
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button
                      class="btn btn-outline-success"
                      @click="showSurveyModal(temple)"
                    >
                      <i class="bi bi-clipboard-check"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Card View -->
        <div v-else class="row">
          <div
            v-for="temple in paginatedTemples"
            :key="temple.id"
            class="col-md-6 col-lg-4 mb-4"
          >
            <div class="card h-100 shadow-sm">
              <div class="card-body">
                <div
                  class="d-flex justify-content-between align-items-start mb-2"
                >
                  <h6 class="card-title mb-0">
                    <i class="bi bi-building text-warning me-1"></i>
                    {{ temple.target_name }}
                  </h6>
                  <span class="badge" :class="getStatusClass(temple.status)">
                    {{ getStatusText(temple.status) }}
                  </span>
                </div>

                <p class="card-text text-muted small mb-2">
                  <i class="bi bi-geo-alt me-1"></i>
                  {{ temple.address }}<br />
                  {{ temple.subdistrict }}, {{ temple.district }}<br />
                  {{ temple.province }} {{ temple.postal_code }}
                </p>

                <div class="row text-center mb-3">
                  <div class="col-6">
                    <div class="border-end">
                      <div class="h6 mb-0">{{ temple.monk_count || 0 }}</div>
                      <small class="text-muted">พระ</small>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="h6 mb-0">
                      <i class="bi bi-geo-alt-fill text-primary"></i>
                    </div>
                    <small class="text-muted">GPS</small>
                  </div>
                </div>

                <div class="d-grid gap-2">
                  <div class="btn-group">
                    <button
                      class="btn btn-outline-info btn-sm"
                      @click="viewDetails(temple)"
                    >
                      <i class="bi bi-eye me-1"></i>ดูรายละเอียด
                    </button>
                    <button
                      class="btn btn-outline-success btn-sm"
                      @click="showSurveyModal(temple)"
                    >
                      <i class="bi bi-clipboard-check me-1"></i>สำรวจ
                    </button>
                  </div>
                </div>
              </div>
              <div class="card-footer text-muted small">
                <i class="bi bi-calendar me-1"></i>
                สร้างเมื่อ {{ formatDate(temple.created_at) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <nav v-if="totalPages > 1" class="mt-4">
          <ul class="pagination justify-content-center">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <button
                class="page-link"
                @click="currentPage = 1"
                :disabled="currentPage === 1"
              >
                <i class="bi bi-chevron-double-left"></i>
              </button>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <button
                class="page-link"
                @click="currentPage--"
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
              <button class="page-link" @click="currentPage = page">
                {{ page }}
              </button>
            </li>

            <li
              class="page-item"
              :class="{ disabled: currentPage === totalPages }"
            >
              <button
                class="page-link"
                @click="currentPage++"
                :disabled="currentPage === totalPages"
              >
                <i class="bi bi-chevron-right"></i>
              </button>
            </li>
            <li
              class="page-item"
              :class="{ disabled: currentPage === totalPages }"
            >
              <button
                class="page-link"
                @click="currentPage = totalPages"
                :disabled="currentPage === totalPages"
              >
                <i class="bi bi-chevron-double-right"></i>
              </button>
            </li>
          </ul>
          <div class="text-center text-muted small">
            แสดง {{ startIndex + 1 }}-{{ endIndex }} จาก
            {{ filteredTemples.length }} รายการ
          </div>
        </nav>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div class="modal fade" id="templeModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-building me-2"></i>
              {{ editingTemple ? "แก้ไขข้อมูลวัด" : "เพิ่มวัดใหม่" }}
            </h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
            ></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveTemple">
              <div class="row">
                <div class="col-md-8">
                  <label class="form-label"
                    >ชื่อวัด <span class="text-danger">*</span></label
                  >
                  <input
                    v-model="templeForm.target_name"
                    type="text"
                    class="form-control"
                    required
                    placeholder="ระบุชื่อวัด"
                  />
                </div>
                <div class="col-md-4">
                  <label class="form-label">สถานะ</label>
                  <select v-model="templeForm.status" class="form-select">
                    <option value="Draft">ร่าง</option>
                    <option value="Pending Review">รอตรวจสอบ</option>
                    <option value="Approved">อนุมัติแล้ว</option>
                  </select>
                </div>
              </div>

              <div class="row mt-3">
                <div class="col-12">
                  <label class="form-label"
                    >ที่อยู่ <span class="text-danger">*</span></label
                  >
                  <textarea
                    v-model="templeForm.address"
                    class="form-control"
                    rows="2"
                    required
                    placeholder="ระบุที่อยู่ของวัด"
                  ></textarea>
                </div>
              </div>

              <div class="row mt-3">
                <div class="col-md-4">
                  <label class="form-label">ตำบล/แขวง</label>
                  <input
                    v-model="templeForm.subdistrict"
                    type="text"
                    class="form-control"
                  />
                </div>
                <div class="col-md-4">
                  <label class="form-label">อำเภอ/เขต</label>
                  <input
                    v-model="templeForm.district"
                    type="text"
                    class="form-control"
                  />
                </div>
                <div class="col-md-4">
                  <label class="form-label">จังหวัด</label>
                  <input
                    v-model="templeForm.province"
                    type="text"
                    class="form-control"
                  />
                </div>
              </div>

              <div class="row mt-3">
                <div class="col-md-4">
                  <label class="form-label">รหัสไปรษณีย์</label>
                  <input
                    v-model="templeForm.postal_code"
                    type="text"
                    class="form-control"
                  />
                </div>
                <div class="col-md-4">
                  <label class="form-label">ละติจูด (GPS)</label>
                  <input
                    v-model="templeForm.gps_latitude"
                    type="number"
                    step="any"
                    class="form-control"
                  />
                </div>
                <div class="col-md-4">
                  <label class="form-label">ลองจิจูด (GPS)</label>
                  <input
                    v-model="templeForm.gps_longitude"
                    type="number"
                    step="any"
                    class="form-control"
                  />
                </div>
              </div>

              <div class="row mt-3">
                <div class="col-md-6">
                  <label class="form-label">จำนวนพระ</label>
                  <input
                    v-model="templeForm.monk_count"
                    type="number"
                    min="0"
                    class="form-control"
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">ประเภทวัด</label>
                  <select
                    v-model="templeForm.temple_type_id"
                    class="form-select"
                  >
                    <option value="1">วัดราชวรวิหาร</option>
                    <option value="2">วัดวรวิหาร</option>
                    <option value="3">วัดราชมงคล</option>
                    <option value="4">วัดทั่วไป</option>
                  </select>
                </div>
              </div>

              <div class="mt-3">
                <label class="form-label">ประวัติความเป็นมา</label>
                <textarea
                  v-model="templeForm.history_summary"
                  class="form-control"
                  rows="3"
                  placeholder="ระบุประวัติและความสำคัญของวัด"
                ></textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              class="btn btn-primary"
              @click="saveTemple"
              :disabled="saving"
            >
              <span
                v-if="saving"
                class="spinner-border spinner-border-sm me-2"
              ></span>
              {{ editingTemple ? "บันทึกการแก้ไข" : "เพิ่มวัด" }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Survey Modal -->
    <div class="modal fade" id="surveyModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-clipboard-check me-2"></i>
              สำรวจวัด: {{ selectedTemple?.target_name }}
            </h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
            ></button>
          </div>
          <div class="modal-body">
            <div class="alert alert-info">
              <i class="bi bi-info-circle me-2"></i>
              ฟีเจอร์การสำรวจจะเปิดให้ใช้งานในเร็วๆ นี้
            </div>
            <div v-if="selectedTemple" class="card">
              <div class="card-body">
                <h6>ข้อมูลวัด</h6>
                <p><strong>ชื่อ:</strong> {{ selectedTemple.target_name }}</p>
                <p><strong>ที่อยู่:</strong> {{ selectedTemple.address }}</p>
                <p>
                  <strong>จำนวนพระ:</strong>
                  {{ selectedTemple.monk_count || "ไม่ระบุ" }} รูป
                </p>
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
            <button type="button" class="btn btn-primary" disabled>
              เริ่มสำรวจ (เร็วๆ นี้)
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <div class="modal fade" id="detailModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-building me-2"></i>
              รายละเอียดวัด
            </h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
            ></button>
          </div>
          <div class="modal-body">
            <div v-if="selectedTemple" class="row">
              <div class="col-md-8">
                <h4>{{ selectedTemple.target_name }}</h4>
                <p class="text-muted mb-3">{{ selectedTemple.address }}</p>

                <div class="row mb-3">
                  <div class="col-sm-6">
                    <strong>ตำบล/แขวง:</strong> {{ selectedTemple.subdistrict }}
                  </div>
                  <div class="col-sm-6">
                    <strong>อำเภอ/เขต:</strong> {{ selectedTemple.district }}
                  </div>
                </div>

                <div class="row mb-3">
                  <div class="col-sm-6">
                    <strong>จังหวัด:</strong> {{ selectedTemple.province }}
                  </div>
                  <div class="col-sm-6">
                    <strong>รหัสไปรษณีย์:</strong>
                    {{ selectedTemple.postal_code }}
                  </div>
                </div>

                <div class="row mb-3">
                  <div class="col-sm-6">
                    <strong>จำนวนพระ:</strong>
                    {{ selectedTemple.monk_count || "ไม่ระบุ" }} รูป
                  </div>
                  <div class="col-sm-6">
                    <strong>สถานะ:</strong>
                    <span
                      class="badge ms-1"
                      :class="getStatusClass(selectedTemple.status)"
                    >
                      {{ getStatusText(selectedTemple.status) }}
                    </span>
                  </div>
                </div>

                <div v-if="selectedTemple.history_summary" class="mb-3">
                  <strong>ประวัติความเป็นมา:</strong>
                  <p class="mt-2">{{ selectedTemple.history_summary }}</p>
                </div>
              </div>
              <div class="col-md-4">
                <div class="card bg-light">
                  <div class="card-body text-center">
                    <i class="bi bi-geo-alt-fill text-primary fs-1"></i>
                    <h6 class="mt-2">พิกัด GPS</h6>
                    <p class="small mb-1">
                      <strong>ละติจูด:</strong>
                      {{ selectedTemple.gps_latitude || "ไม่ระบุ" }}
                    </p>
                    <p class="small">
                      <strong>ลองจิจูด:</strong>
                      {{ selectedTemple.gps_longitude || "ไม่ระบุ" }}
                    </p>
                    <button
                      v-if="
                        selectedTemple.gps_latitude &&
                        selectedTemple.gps_longitude
                      "
                      class="btn btn-outline-primary btn-sm"
                      @click="openMap(selectedTemple)"
                    >
                      <i class="bi bi-map me-1"></i>ดูในแผนที่
                    </button>
                  </div>
                </div>
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
            <button
              type="button"
              class="btn btn-warning"
              @click="editTemple(selectedTemple)"
            >
              <i class="bi bi-pencil me-1"></i>แก้ไข
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, reactive } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "@/composables/useToast";
import surveyService from "@/services/surveyService";

export default {
  name: "SurveyTempleList",
  setup() {
    console.log("🔧 Setting up SurveyTempleList component...");

    const authStore = useAuthStore();
    const { showToast } = useToast();

    console.log("🔧 Auth store and toast initialized");

    // Reactive data
    const loading = ref(false);
    const saving = ref(false);
    const temples = ref([]);
    const viewMode = ref("table");
    const currentPage = ref(1);
    const itemsPerPage = ref(10);
    const editingTemple = ref(null);
    const selectedTemple = ref(null);

    // Filters
    const filters = reactive({
      search: "",
      province: "",
      status: "",
    });

    // Form data
    const templeForm = reactive({
      target_name: "",
      address: "",
      subdistrict: "",
      district: "",
      province: "",
      postal_code: "",
      gps_latitude: null,
      gps_longitude: null,
      status: "Draft",
      monk_count: null,
      temple_type_id: 1,
      history_summary: "",
    });

    // Computed
    const stats = computed(() => {
      const total = temples.value.length;
      const approved = temples.value.filter(
        (t) => t.status === "Approved"
      ).length;
      const pending = temples.value.filter(
        (t) => t.status === "Pending Review"
      ).length;
      const draft = temples.value.filter((t) => t.status === "Draft").length;

      return { total, approved, pending, draft };
    });

    const provinces = computed(() => {
      const uniqueProvinces = [
        ...new Set(temples.value.map((t) => t.province)),
      ];
      return uniqueProvinces.filter((p) => p).sort();
    });

    const filteredTemples = computed(() => {
      console.log(
        "🔍 Filtering temples. Original count:",
        temples.value.length
      );
      console.log("🔍 Current filters:", {
        search: filters.search,
        province: filters.province,
        status: filters.status,
      });

      let result = temples.value;

      if (filters.search) {
        result = result.filter(
          (temple) =>
            temple.target_name
              .toLowerCase()
              .includes(filters.search.toLowerCase()) ||
            temple.address.toLowerCase().includes(filters.search.toLowerCase())
        );
        console.log("🔍 After search filter:", result.length);
      }

      if (filters.province) {
        result = result.filter(
          (temple) => temple.province === filters.province
        );
        console.log("🔍 After province filter:", result.length);
      }

      if (filters.status) {
        result = result.filter((temple) => temple.status === filters.status);
        console.log("🔍 After status filter:", result.length);
      }

      console.log("🔍 Final filtered result:", result.length);
      return result;
    });

    const totalPages = computed(() =>
      Math.ceil(filteredTemples.value.length / itemsPerPage.value)
    );

    const paginatedTemples = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value;
      const end = start + itemsPerPage.value;
      const result = filteredTemples.value.slice(start, end);
      console.log("📄 Pagination:", {
        currentPage: currentPage.value,
        itemsPerPage: itemsPerPage.value,
        start,
        end,
        filteredCount: filteredTemples.value.length,
        paginatedCount: result.length,
      });
      return result;
    });

    const startIndex = computed(
      () => (currentPage.value - 1) * itemsPerPage.value
    );
    const endIndex = computed(() =>
      Math.min(
        startIndex.value + itemsPerPage.value,
        filteredTemples.value.length
      )
    );

    const visiblePages = computed(() => {
      const pages = [];
      const start = Math.max(1, currentPage.value - 2);
      const end = Math.min(totalPages.value, currentPage.value + 2);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
    });

    // Methods
    const loadTemples = async () => {
      console.log("🚀 Starting loadTemples...");
      loading.value = true;
      try {
        console.log("📡 Calling surveyService.getSurveyTargets...");
        const response = await surveyService.getSurveyTargets({ type_id: 1 }); // วัด
        console.log("📊 API Response:", response);
        temples.value = response.data || [];
        console.log("✅ Temples data set:", temples.value.length, "items");
        showToast("โหลดข้อมูลสำเร็จ", "success");
      } catch (error) {
        console.error("❌ Error loading temples:", error);

        // ใช้ข้อมูลพื้นฐานเมื่อไม่สามารถโหลดได้
        const fallbackData = [
          {
            id: 1,
            target_name: "วัดพระแก้ว",
            address: "2 ถนนณ วรรณพงศ์ แขวงพระบรมมหาราชวัง",
            subdistrict: "พระนคร",
            district: "พระนคร",
            province: "กรุงเทพมหานคร",
            postal_code: "10200",
            status: "Approved",
            monk_count: 15,
            created_at: new Date().toISOString(),
            gps_latitude: 13.751811,
            gps_longitude: 100.491589,
          },
          {
            id: 2,
            target_name: "วัดพระศรีรัตนศาสดาราม",
            address: "ถนนณ วรรณพงศ์ แขวงพระบรมมหาราชวัง",
            subdistrict: "พระนคร",
            district: "พระนคร",
            province: "กรุงเทพมหานคร",
            postal_code: "10200",
            status: "Pending Review",
            monk_count: 12,
            created_at: new Date().toISOString(),
            gps_latitude: 13.7508,
            gps_longitude: 100.4914,
          },
          {
            id: 3,
            target_name: "วัดอรุณราชวรารามราชวรมหาวิหาร",
            address: "34 ถนนอรุณอมรินทร์ แขวงวัดอรุณ",
            subdistrict: "บางกอกใหญ่",
            district: "บางกอกใหญ่",
            province: "กรุงเทพมหานคร",
            postal_code: "10600",
            status: "Draft",
            monk_count: 8,
            created_at: new Date().toISOString(),
            gps_latitude: 13.7436,
            gps_longitude: 100.4873,
          },
          {
            id: 4,
            target_name: "วัดโพธิ์",
            address: "2 ถนนสนามชัย แขวงพระบรมมหาราชวัง",
            subdistrict: "พระนคร",
            district: "พระนคร",
            province: "กรุงเทพมหานคร",
            postal_code: "10200",
            status: "Approved",
            monk_count: 20,
            created_at: new Date().toISOString(),
            gps_latitude: 13.7462,
            gps_longitude: 100.4925,
          },
          {
            id: 5,
            target_name: "วัดราชนัดดาราม",
            address: "ถนนราชนัดดา แขวงดุสิต",
            subdistrict: "ดุสิต",
            district: "ดุสิต",
            province: "กรุงเทพมหานคร",
            postal_code: "10300",
            status: "Pending Review",
            monk_count: 18,
            created_at: new Date().toISOString(),
            gps_latitude: 13.7794,
            gps_longitude: 100.5152,
          },
          {
            id: 6,
            target_name: "วัดสุทัศนเทพวรารามราชวรมหาวิหาร",
            address: "146 ถนนบำรุงเมือง แขวงวัดราชบพิธ",
            subdistrict: "พระนคร",
            district: "พระนคร",
            province: "กรุงเทพมหานคร",
            postal_code: "10200",
            status: "Approved",
            monk_count: 25,
            created_at: new Date().toISOString(),
            gps_latitude: 13.7553,
            gps_longitude: 100.5017,
          },
        ];

        temples.value = fallbackData;
        console.log("🔄 Using fallback data:", temples.value.length, "items");
        showToast("ไม่สามารถโหลดข้อมูลผู้สำรวจได้ ใช้ข้อมูลพื้นฐาน", "warning");
      } finally {
        loading.value = false;
        console.log(
          "🏁 loadTemples completed. Final temples count:",
          temples.value.length
        );
      }
    };

    const applyFilters = () => {
      currentPage.value = 1;
    };

    const clearFilters = () => {
      filters.search = "";
      filters.province = "";
      filters.status = "";
      currentPage.value = 1;
    };

    const showCreateModal = () => {
      editingTemple.value = null;
      resetForm();
      const modal = new bootstrap.Modal(document.getElementById("templeModal"));
      modal.show();
    };

    const editTemple = (temple) => {
      editingTemple.value = temple;
      Object.keys(templeForm).forEach((key) => {
        templeForm[key] = temple[key] || "";
      });
      const modal = new bootstrap.Modal(document.getElementById("templeModal"));
      modal.show();
    };

    const saveTemple = async () => {
      saving.value = true;
      try {
        const data = { ...templeForm, type_id: 1 };

        if (editingTemple.value) {
          await surveyService.updateSurveyTarget(editingTemple.value.id, data);
          showToast("แก้ไขข้อมูลสำเร็จ", "success");
        } else {
          await surveyService.createSurveyTarget(data);
          showToast("เพิ่มวัดใหม่สำเร็จ", "success");
        }

        const modal = bootstrap.Modal.getInstance(
          document.getElementById("templeModal")
        );
        modal.hide();
        loadTemples();
      } catch (error) {
        console.error("Error saving temple:", error);
        showToast("เกิดข้อผิดพลาดในการบันทึก", "error");
      } finally {
        saving.value = false;
      }
    };

    const viewDetails = (temple) => {
      selectedTemple.value = temple;
      const modal = new bootstrap.Modal(document.getElementById("detailModal"));
      modal.show();
    };

    const showSurveyModal = (temple) => {
      selectedTemple.value = temple;
      const modal = new bootstrap.Modal(document.getElementById("surveyModal"));
      modal.show();
    };

    const resetForm = () => {
      Object.keys(templeForm).forEach((key) => {
        if (key === "status") {
          templeForm[key] = "Draft";
        } else if (key === "temple_type_id") {
          templeForm[key] = 1;
        } else {
          templeForm[key] =
            key.includes("_count") ||
            key.includes("latitude") ||
            key.includes("longitude")
              ? null
              : "";
        }
      });
    };

    const getStatusClass = (status) => {
      switch (status) {
        case "Approved":
          return "bg-success";
        case "Pending Review":
          return "bg-warning";
        case "Draft":
          return "bg-secondary";
        default:
          return "bg-secondary";
      }
    };

    const getStatusText = (status) => {
      switch (status) {
        case "Approved":
          return "อนุมัติแล้ว";
        case "Pending Review":
          return "รอตรวจสอบ";
        case "Draft":
          return "ร่าง";
        default:
          return status;
      }
    };

    const formatDate = (dateString) => {
      if (!dateString) return "-";
      return new Date(dateString).toLocaleDateString("th-TH", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    };

    const openMap = (temple) => {
      const url = `https://www.google.com/maps?q=${temple.gps_latitude},${temple.gps_longitude}`;
      window.open(url, "_blank");
    };

    const exportData = async () => {
      try {
        const response = await surveyService.exportSurveyTargets({
          type_id: 1,
        });

        // Create blob and download
        const blob = new Blob([response.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `temple_data_${
          new Date().toISOString().split("T")[0]
        }.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);

        showToast("ส่งออกข้อมูลสำเร็จ", "success");
      } catch (error) {
        console.error("Error exporting data:", error);
        showToast("เกิดข้อผิดพลาดในการส่งออกข้อมูล", "error");
      }
    };

    // Lifecycle
    onMounted(() => {
      console.log("🚀 Component mounted, loading temples...");
      loadTemples();
    });

    return {
      // Reactive data
      loading,
      saving,
      temples,
      viewMode,
      currentPage,
      editingTemple,
      selectedTemple,
      filters,
      templeForm,

      // Computed
      stats,
      provinces,
      filteredTemples,
      totalPages,
      paginatedTemples,
      startIndex,
      endIndex,
      visiblePages,

      // Methods
      loadTemples,
      applyFilters,
      clearFilters,
      showCreateModal,
      editTemple,
      saveTemple,
      viewDetails,
      showSurveyModal,
      getStatusClass,
      getStatusText,
      formatDate,
      openMap,
      exportData,

      // Store
      authStore,
    };
  },
};
</script>

<style scoped>
.survey-temple-container {
  padding: 1rem;
}

.card {
  border: none;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.table th {
  font-weight: 600;
  font-size: 0.875rem;
}

.badge {
  font-size: 0.75rem;
}

.btn-group .btn {
  border-radius: 0.375rem;
}

.btn-group .btn:not(:last-child) {
  margin-right: 0.25rem;
}

.modal-dialog {
  max-width: 800px;
}

.card-body .row {
  margin-bottom: 0.5rem;
}

.pagination {
  margin-bottom: 0;
}

.table-responsive {
  border-radius: 0.375rem;
}

.alert {
  border: none;
  border-radius: 0.5rem;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}
</style>
