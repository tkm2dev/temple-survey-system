<template>
  <div class="master-data-list-container">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="mb-1">จัดการข้อมูลหลัก</h2>
        <p class="text-muted mb-0">รายการข้อมูลหลักทั้งหมดในระบบ</p>
      </div>
      <div class="btn-group">
        <button class="btn btn-primary" @click="createMasterData">
          <i class="bi bi-plus"></i>
          เพิ่มข้อมูลหลัก
        </button>
        <button class="btn btn-success" @click="showImportModal">
          <i class="bi bi-upload"></i>
          นำเข้าข้อมูล
        </button>
        <button class="btn btn-info" @click="exportData">
          <i class="bi bi-download"></i>
          ส่งออกข้อมูล
        </button>
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
                placeholder="ค้นหาข้อมูลหลัก..."
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

          <!-- Category Filter -->
          <div class="col-md-2">
            <select
              class="form-select"
              v-model="filters.category"
              @change="applyFilters"
            >
              <option value="">ทุกหมวดหมู่</option>
              <option
                v-for="category in categories"
                :key="category.id"
                :value="category.key"
              >
                {{ category.name }}
              </option>
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
              <option value="active">ใช้งาน</option>
              <option value="inactive">ไม่ใช้งาน</option>
              <option value="draft">ร่าง</option>
            </select>
          </div>

          <!-- Date Range -->
          <div class="col-md-2">
            <input
              type="date"
              class="form-control"
              v-model="filters.dateFrom"
              @change="applyFilters"
              placeholder="วันที่เริ่ม"
            />
          </div>
          <div class="col-md-2">
            <input
              type="date"
              class="form-control"
              v-model="filters.dateTo"
              @change="applyFilters"
              placeholder="วันที่สิ้นสุด"
            />
          </div>
        </div>

        <!-- Advanced Search Toggle -->
        <div class="mt-3">
          <button
            class="btn btn-outline-primary btn-sm"
            @click="showAdvancedSearch = !showAdvancedSearch"
          >
            <i class="bi bi-sliders"></i>
            {{ showAdvancedSearch ? "ซ่อน" : "แสดง" }}การค้นหาขั้นสูง
          </button>
        </div>

        <!-- Advanced Search Panel -->
        <div v-if="showAdvancedSearch" class="mt-3 p-3 bg-light rounded">
          <div class="row g-3">
            <div class="col-md-3">
              <label class="form-label">ประเภทข้อมูล</label>
              <select class="form-select" v-model="advancedFilters.dataType">
                <option value="">ทั้งหมด</option>
                <option value="text">ข้อความ</option>
                <option value="number">ตัวเลข</option>
                <option value="json">JSON</option>
                <option value="boolean">Boolean</option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label">ผู้สร้าง</label>
              <input
                type="text"
                class="form-control"
                v-model="advancedFilters.createdBy"
                placeholder="ชื่อผู้สร้าง"
              />
            </div>
            <div class="col-md-3">
              <label class="form-label">คำอธิบาย</label>
              <input
                type="text"
                class="form-control"
                v-model="advancedFilters.description"
                placeholder="คำอธิบาย"
              />
            </div>
            <div class="col-md-3">
              <label class="form-label">&nbsp;</label>
              <div>
                <button
                  class="btn btn-primary btn-sm me-2"
                  @click="applyAdvancedSearch"
                >
                  <i class="bi bi-search"></i> ค้นหา
                </button>
                <button
                  class="btn btn-secondary btn-sm"
                  @click="clearAdvancedSearch"
                >
                  <i class="bi bi-arrow-clockwise"></i> รีเซ็ต
                </button>
              </div>
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
              @click="bulkUpdateStatus('active')"
              :disabled="bulkOperationLoading"
            >
              <i class="bi bi-check-circle"></i> เปิดใช้งาน
            </button>
            <button
              class="btn btn-outline-warning"
              @click="bulkUpdateStatus('inactive')"
              :disabled="bulkOperationLoading"
            >
              <i class="bi bi-pause-circle"></i> ปิดใช้งาน
            </button>
            <button
              class="btn btn-outline-info"
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
      <p class="mt-2 text-muted">กำลังโหลดข้อมูลหลัก...</p>
    </div>

    <!-- Data Table -->
    <div v-else class="card">
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
                  @click="sortBy('key')"
                  class="sortable"
                  :class="getSortClass('key')"
                >
                  Key
                </th>
                <th
                  scope="col"
                  @click="sortBy('category')"
                  class="sortable"
                  :class="getSortClass('category')"
                >
                  หมวดหมู่
                </th>
                <th scope="col">ค่าข้อมูล</th>
                <th scope="col">คำอธิบาย</th>
                <th
                  scope="col"
                  @click="sortBy('status')"
                  class="sortable"
                  :class="getSortClass('status')"
                >
                  สถานะ
                </th>
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
                v-for="item in masterData"
                :key="item.id"
                :class="{ 'table-primary': selectedItems.includes(item.id) }"
              >
                <td>
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      :value="item.id"
                      v-model="selectedItems"
                    />
                  </div>
                </td>
                <td>
                  <code class="bg-light p-1 rounded">{{ item.key }}</code>
                </td>
                <td>
                  <span class="badge bg-secondary">{{
                    item.category || "ไม่ระบุ"
                  }}</span>
                </td>
                <td>
                  <div class="value-preview">
                    <span v-if="item.data_type === 'json'" class="text-muted">
                      <i class="bi bi-braces"></i> JSON Object
                    </span>
                    <span
                      v-else-if="
                        typeof item.value === 'string' && item.value.length > 50
                      "
                      :title="item.value"
                    >
                      {{ item.value.substring(0, 50) }}...
                    </span>
                    <span v-else>{{ formatValue(item.value) }}</span>
                  </div>
                </td>
                <td>
                  <span :title="item.description">
                    {{
                      item.description
                        ? item.description.length > 30
                          ? item.description.substring(0, 30) + "..."
                          : item.description
                        : "-"
                    }}
                  </span>
                </td>
                <td>
                  <div class="form-check form-switch">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      :checked="item.status === 'active'"
                      @change="
                        updateStatus(
                          item.id,
                          $event.target.checked ? 'active' : 'inactive'
                        )
                      "
                      :disabled="statusUpdateLoading[item.id]"
                    />
                    <label class="form-check-label">
                      {{ item.status === "active" ? "ใช้งาน" : "ไม่ใช้งาน" }}
                    </label>
                  </div>
                </td>
                <td>
                  <small class="text-muted">
                    {{ formatDate(item.created_at) }}
                    <div v-if="item.created_by">โดย: {{ item.created_by }}</div>
                  </small>
                </td>
                <td class="text-center">
                  <div class="btn-group" role="group">
                    <button
                      class="btn btn-outline-primary btn-sm"
                      @click="viewItem(item)"
                      title="ดูรายละเอียด"
                    >
                      <i class="bi bi-eye"></i>
                    </button>
                    <button
                      class="btn btn-outline-secondary btn-sm"
                      @click="editItem(item)"
                      title="แก้ไข"
                    >
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button
                      class="btn btn-outline-danger btn-sm"
                      @click="deleteItem(item.id)"
                      title="ลบ"
                      :disabled="deleteLoading[item.id]"
                    >
                      <span
                        v-if="deleteLoading[item.id]"
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

    <!-- Empty State -->
    <div v-if="!loading && masterData.length === 0" class="text-center py-5">
      <div class="empty-state">
        <i class="bi bi-database display-1 text-muted mb-3"></i>
        <h5 class="text-muted">ไม่พบข้อมูลหลัก</h5>
        <p class="text-muted">
          {{
            searchQuery
              ? "ไม่พบข้อมูลที่ตรงกับคำค้นหา"
              : "ยังไม่มีข้อมูลหลักในระบบ"
          }}
        </p>
        <button
          v-if="!searchQuery"
          class="btn btn-primary"
          @click="createMasterData"
        >
          <i class="bi bi-plus"></i>
          เพิ่มข้อมูลหลักแรก
        </button>
      </div>
    </div>

    <!-- Pagination -->
    <div
      v-if="!loading && masterData.length > 0"
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
            <option value="10">10 รายการ</option>
            <option value="25">25 รายการ</option>
            <option value="50">50 รายการ</option>
            <option value="100">100 รายการ</option>
          </select>
        </div>
      </div>
      <nav aria-label="Master data pagination">
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
import { useRouter } from "vue-router";
import masterDataService from "@/services/masterDataService";
import { useToast } from "@/composables/useToast";

export default {
  name: "MasterDataList",
  setup() {
    const router = useRouter();
    const { showToast } = useToast();

    // Reactive state
    const masterData = ref([]);
    const categories = ref([]);
    const loading = ref(false);
    const bulkOperationLoading = ref(false);
    const searchQuery = ref("");
    const showAdvancedSearch = ref(false);

    // Filters
    const filters = reactive({
      category: "",
      status: "",
      dateFrom: "",
      dateTo: "",
    });

    const advancedFilters = reactive({
      dataType: "",
      createdBy: "",
      description: "",
    });

    // Pagination
    const pagination = reactive({
      currentPage: 1,
      itemsPerPage: 10,
      total: 0,
      totalPages: 0,
    });

    // Sorting
    const sort = reactive({
      field: "created_at",
      order: "desc",
    });

    // Selection
    const selectedItems = ref([]);

    // Loading states
    const statusUpdateLoading = reactive({});
    const deleteLoading = reactive({});

    // Toast messages
    const toasts = ref([]);

    // Computed properties
    const isAllSelected = computed(() => {
      return (
        masterData.value.length > 0 &&
        selectedItems.value.length === masterData.value.length
      );
    });

    const isIndeterminate = computed(() => {
      return (
        selectedItems.value.length > 0 &&
        selectedItems.value.length < masterData.value.length
      );
    });

    const visiblePages = computed(() => {
      const delta = 2;
      const range = [];
      const rangeWithDots = [];

      for (
        let i = Math.max(2, pagination.currentPage - delta);
        i <=
        Math.min(pagination.totalPages - 1, pagination.currentPage + delta);
        i++
      ) {
        range.push(i);
      }

      if (pagination.currentPage - delta > 2) {
        rangeWithDots.push(1, "...");
      } else {
        rangeWithDots.push(1);
      }

      rangeWithDots.push(...range);

      if (pagination.currentPage + delta < pagination.totalPages - 1) {
        rangeWithDots.push("...", pagination.totalPages);
      } else if (pagination.totalPages > 1) {
        rangeWithDots.push(pagination.totalPages);
      }

      return rangeWithDots.filter(
        (page, index, arr) => arr.indexOf(page) === index
      );
    });

    // Methods
    const fetchMasterData = async () => {
      try {
        loading.value = true;
        const params = {
          page: pagination.currentPage,
          limit: pagination.itemsPerPage,
          sortBy: sort.field,
          sortOrder: sort.order,
          search: searchQuery.value || undefined,
          ...filters,
          ...advancedFilters,
        };

        const response = await masterDataService.getMasterDataPaginated(params);
        masterData.value = response.data || [];
        pagination.total = response.total || 0;
        pagination.totalPages = Math.ceil(
          pagination.total / pagination.itemsPerPage
        );
      } catch (error) {
        console.error("Error fetching master data:", error);
        showToast("เกิดข้อผิดพลาดในการโหลดข้อมูลหลัก", "error");
      } finally {
        loading.value = false;
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await masterDataService.getCategories();
        categories.value = response.data || [];
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    // Search and filter methods
    let searchTimeout = null;
    const debounceSearch = () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        pagination.currentPage = 1;
        fetchMasterData();
      }, 500);
    };

    const clearSearch = () => {
      searchQuery.value = "";
      pagination.currentPage = 1;
      fetchMasterData();
    };

    const applyFilters = () => {
      pagination.currentPage = 1;
      fetchMasterData();
    };

    const applyAdvancedSearch = () => {
      pagination.currentPage = 1;
      fetchMasterData();
    };

    const clearAdvancedSearch = () => {
      Object.keys(advancedFilters).forEach((key) => {
        advancedFilters[key] = "";
      });
      pagination.currentPage = 1;
      fetchMasterData();
    };

    // Pagination methods
    const changePage = (page) => {
      if (page >= 1 && page <= pagination.totalPages) {
        pagination.currentPage = page;
        fetchMasterData();
      }
    };

    const changeItemsPerPage = () => {
      pagination.currentPage = 1;
      fetchMasterData();
    };

    // Sorting methods
    const sortBy = (field) => {
      if (sort.field === field) {
        sort.order = sort.order === "asc" ? "desc" : "asc";
      } else {
        sort.field = field;
        sort.order = "asc";
      }
      fetchMasterData();
    };

    const getSortClass = (field) => {
      if (sort.field !== field) return "";
      return sort.order === "asc" ? "sort-asc" : "sort-desc";
    };

    // Selection methods
    const toggleSelectAll = () => {
      if (isAllSelected.value) {
        selectedItems.value = [];
      } else {
        selectedItems.value = masterData.value.map((item) => item.id);
      }
    };

    // CRUD methods
    const createMasterData = () => {
      router.push({ name: "CreateMasterData" });
    };

    const viewItem = (item) => {
      router.push({ name: "MasterDataDetail", params: { id: item.id } });
    };

    const editItem = (item) => {
      router.push({ name: "EditMasterData", params: { id: item.id } });
    };

    const deleteItem = async (id) => {
      if (!confirm("คุณแน่ใจหรือไม่ที่จะลบข้อมูลนี้?")) {
        return;
      }

      try {
        deleteLoading[id] = true;
        await masterDataService.deleteMasterData(id);

        masterData.value = masterData.value.filter((item) => item.id !== id);
        pagination.total--;

        showToast("ลบข้อมูลเรียบร้อยแล้ว", "success");

        // If current page is empty, go to previous page
        if (masterData.value.length === 0 && pagination.currentPage > 1) {
          pagination.currentPage--;
          fetchMasterData();
        }
      } catch (error) {
        console.error("Error deleting master data:", error);
        showToast("เกิดข้อผิดพลาดในการลบข้อมูล", "error");
      } finally {
        deleteLoading[id] = false;
      }
    };

    const updateStatus = async (id, status) => {
      try {
        statusUpdateLoading[id] = true;
        await masterDataService.updateMasterData(id, { status });

        const item = masterData.value.find((item) => item.id === id);
        if (item) {
          item.status = status;
        }

        showToast(
          `${status === "active" ? "เปิด" : "ปิด"}ใช้งานข้อมูลเรียบร้อยแล้ว`,
          "success"
        );
      } catch (error) {
        console.error("Error updating status:", error);
        showToast("เกิดข้อผิดพลาดในการเปลี่ยนสถานะ", "error");
      } finally {
        statusUpdateLoading[id] = false;
      }
    };

    // Bulk operations
    const bulkUpdateStatus = async (status) => {
      if (selectedItems.value.length === 0) return;

      try {
        bulkOperationLoading.value = true;
        await masterDataService.bulkStatusChange(selectedItems.value, status);

        // Update local data
        masterData.value.forEach((item) => {
          if (selectedItems.value.includes(item.id)) {
            item.status = status;
          }
        });

        selectedItems.value = [];
        showToast(
          `${status === "active" ? "เปิด" : "ปิด"}ใช้งานข้อมูลเรียบร้อยแล้ว`,
          "success"
        );
      } catch (error) {
        console.error("Error bulk updating status:", error);
        showToast("เกิดข้อผิดพลาดในการเปลี่ยนสถานะแบบกลุ่ม", "error");
      } finally {
        bulkOperationLoading.value = false;
      }
    };

    const bulkDelete = async () => {
      if (selectedItems.value.length === 0) return;

      if (
        !confirm(
          `คุณแน่ใจหรือไม่ที่จะลบข้อมูล ${selectedItems.value.length} รายการ?`
        )
      ) {
        return;
      }

      try {
        bulkOperationLoading.value = true;
        await masterDataService.bulkDeleteMasterData(selectedItems.value);

        // Remove deleted items from local data
        masterData.value = masterData.value.filter(
          (item) => !selectedItems.value.includes(item.id)
        );
        pagination.total -= selectedItems.value.length;

        selectedItems.value = [];
        showToast("ลบข้อมูลเรียบร้อยแล้ว", "success");

        // If current page is empty, go to previous page
        if (masterData.value.length === 0 && pagination.currentPage > 1) {
          pagination.currentPage--;
          fetchMasterData();
        }
      } catch (error) {
        console.error("Error bulk deleting:", error);
        showToast("เกิดข้อผิดพลาดในการลบข้อมูลแบบกลุ่ม", "error");
      } finally {
        bulkOperationLoading.value = false;
      }
    };

    const bulkExport = async () => {
      if (selectedItems.value.length === 0) return;

      try {
        bulkOperationLoading.value = true;
        const blob = await masterDataService.bulkExport(selectedItems.value);

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `master-data-export-${
          new Date().toISOString().split("T")[0]
        }.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        showToast("ส่งออกข้อมูลเรียบร้อยแล้ว", "success");
      } catch (error) {
        console.error("Error bulk exporting:", error);
        showToast("เกิดข้อผิดพลาดในการส่งออกข้อมูล", "error");
      } finally {
        bulkOperationLoading.value = false;
      }
    };

    const exportData = async () => {
      try {
        const params = {
          search: searchQuery.value,
          ...filters,
          ...advancedFilters,
        };

        const blob = await masterDataService.exportMasterData(params);

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `master-data-full-export-${
          new Date().toISOString().split("T")[0]
        }.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        showToast("ส่งออกข้อมูลเรียบร้อยแล้ว", "success");
      } catch (error) {
        console.error("Error exporting data:", error);
        showToast("เกิดข้อผิดพลาดในการส่งออกข้อมูล", "error");
      }
    };

    const showImportModal = () => {
      // TODO: Implement import modal
      showToast("ฟีเจอร์นำเข้าข้อมูลจะพัฒนาในอนาคต", "info");
    };

    // Utility methods
    const formatValue = (value) => {
      if (value === null || value === undefined) return "-";
      if (typeof value === "boolean") return value ? "จริง" : "เท็จ";
      if (typeof value === "object") return JSON.stringify(value);
      return value;
    };

    const formatDate = (dateString) => {
      if (!dateString) return "-";
      return new Date(dateString).toLocaleDateString("th-TH", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    const removeToast = (toastId) => {
      const index = toasts.value.findIndex((toast) => toast.id === toastId);
      if (index > -1) {
        toasts.value.splice(index, 1);
      }
    };

    // Watchers
    watch(
      () => [
        filters.category,
        filters.status,
        filters.dateFrom,
        filters.dateTo,
      ],
      () => {
        applyFilters();
      }
    );

    // Lifecycle
    onMounted(() => {
      fetchMasterData();
      fetchCategories();
    });

    return {
      // State
      masterData,
      categories,
      loading,
      bulkOperationLoading,
      searchQuery,
      showAdvancedSearch,
      filters,
      advancedFilters,
      pagination,
      sort,
      selectedItems,
      statusUpdateLoading,
      deleteLoading,
      toasts,

      // Computed
      isAllSelected,
      isIndeterminate,
      visiblePages,

      // Methods
      fetchMasterData,
      debounceSearch,
      clearSearch,
      applyFilters,
      applyAdvancedSearch,
      clearAdvancedSearch,
      changePage,
      changeItemsPerPage,
      sortBy,
      getSortClass,
      toggleSelectAll,
      createMasterData,
      viewItem,
      editItem,
      deleteItem,
      updateStatus,
      bulkUpdateStatus,
      bulkDelete,
      bulkExport,
      exportData,
      showImportModal,
      formatValue,
      formatDate,
      removeToast,
    };
  },
};
</script>

<style scoped>
.master-data-list-container {
  padding: 1rem;
}

.sortable {
  cursor: pointer;
  user-select: none;
  position: relative;
}

.sortable:hover {
  background-color: rgba(0, 123, 255, 0.1);
}

.sortable::after {
  content: "";
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-style: solid;
  opacity: 0.3;
}

.sort-asc::after {
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-bottom: 4px solid #333;
  opacity: 1;
}

.sort-desc::after {
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 4px solid #333;
  opacity: 1;
}

.value-preview {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty-state {
  padding: 3rem 1rem;
}

.pagination-info {
  font-size: 0.875rem;
}

.table-responsive {
  border-radius: 0.375rem;
}

.toast-container .toast {
  min-width: 300px;
}

@media (max-width: 768px) {
  .master-data-list-container {
    padding: 0.5rem;
  }

  .d-flex.justify-content-between.align-items-center {
    flex-direction: column;
    gap: 1rem;
  }

  .pagination-info {
    order: 2;
  }

  .pagination {
    order: 1;
  }
}
</style>
