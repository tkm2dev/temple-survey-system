<template>
  <div class="master-data-list">
    <!-- Header Section -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="mb-1">Master Data Management</h2>
        <p class="text-muted mb-0">
          Manage system master data and configurations
        </p>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-outline-primary" @click="refreshData">
          <i class="fas fa-sync-alt me-2"></i>Refresh
        </button>
        <button
          class="btn btn-primary"
          @click="showAddModal = true"
          v-if="hasPermission('master_data_create')"
        >
          <i class="fas fa-plus me-2"></i>Add Master Data
        </button>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="row mb-4">
      <div class="col-md-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="flex-shrink-0">
                <div class="bg-primary bg-opacity-10 p-3 rounded">
                  <i class="fas fa-database text-primary"></i>
                </div>
              </div>
              <div class="flex-grow-1 ms-3">
                <div class="fw-bold h4 mb-0">{{ statistics.total || 0 }}</div>
                <div class="text-muted">Total Records</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="flex-shrink-0">
                <div class="bg-success bg-opacity-10 p-3 rounded">
                  <i class="fas fa-check-circle text-success"></i>
                </div>
              </div>
              <div class="flex-grow-1 ms-3">
                <div class="fw-bold h4 mb-0">{{ statistics.active || 0 }}</div>
                <div class="text-muted">Active</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="flex-shrink-0">
                <div class="bg-warning bg-opacity-10 p-3 rounded">
                  <i class="fas fa-pause-circle text-warning"></i>
                </div>
              </div>
              <div class="flex-grow-1 ms-3">
                <div class="fw-bold h4 mb-0">
                  {{ statistics.inactive || 0 }}
                </div>
                <div class="text-muted">Inactive</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="flex-shrink-0">
                <div class="bg-info bg-opacity-10 p-3 rounded">
                  <i class="fas fa-layer-group text-info"></i>
                </div>
              </div>
              <div class="flex-grow-1 ms-3">
                <div class="fw-bold h4 mb-0">
                  {{ statistics.categories || 0 }}
                </div>
                <div class="text-muted">Categories</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row">
          <div class="col-md-3">
            <label class="form-label">Search</label>
            <div class="input-group">
              <span class="input-group-text">
                <i class="fas fa-search"></i>
              </span>
              <input
                type="text"
                class="form-control"
                placeholder="Search master data..."
                v-model="searchTerm"
                @input="debouncedSearch"
              />
            </div>
          </div>
          <div class="col-md-2">
            <label class="form-label">Category</label>
            <select
              class="form-select"
              v-model="selectedCategory"
              @change="applyFilters"
            >
              <option value="">All Categories</option>
              <option
                v-for="category in categories"
                :key="category"
                :value="category"
              >
                {{ category }}
              </option>
            </select>
          </div>
          <div class="col-md-2">
            <label class="form-label">Status</label>
            <select
              class="form-select"
              v-model="selectedStatus"
              @change="applyFilters"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div class="col-md-2">
            <label class="form-label">Data Type</label>
            <select
              class="form-select"
              v-model="selectedType"
              @change="applyFilters"
            >
              <option value="">All Types</option>
              <option value="string">String</option>
              <option value="number">Number</option>
              <option value="boolean">Boolean</option>
              <option value="json">JSON</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Actions</label>
            <div class="d-flex gap-2">
              <button class="btn btn-outline-secondary" @click="clearFilters">
                <i class="fas fa-times me-1"></i>Clear
              </button>
              <button class="btn btn-outline-primary" @click="exportData">
                <i class="fas fa-download me-1"></i>Export
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Enhanced Data Table -->
    <div class="card">
      <div class="card-body p-0">
        <EnhancedDataTable
          :data="masterData"
          :columns="tableColumns"
          :loading="loading"
          :totalItems="totalItems"
          :currentPage="currentPage"
          :itemsPerPage="itemsPerPage"
          :selectedItems="selectedItems"
          @update:currentPage="currentPage = $event"
          @update:itemsPerPage="itemsPerPage = $event"
          @update:selectedItems="selectedItems = $event"
          @refresh="refreshData"
          emptyMessage="No master data found"
          emptyIcon="fas fa-database"
        >
          <!-- Custom bulk actions -->
          <template #bulkActions="{ selectedItems, clearSelection }">
            <button
              class="btn btn-sm btn-outline-success me-2"
              @click="bulkActivate(selectedItems, clearSelection)"
              :disabled="selectedItems.length === 0"
              v-if="hasPermission('master_data_update')"
            >
              <i class="fas fa-check me-1"></i>Activate ({{
                selectedItems.length
              }})
            </button>
            <button
              class="btn btn-sm btn-outline-warning me-2"
              @click="bulkDeactivate(selectedItems, clearSelection)"
              :disabled="selectedItems.length === 0"
              v-if="hasPermission('master_data_update')"
            >
              <i class="fas fa-pause me-1"></i>Deactivate ({{
                selectedItems.length
              }})
            </button>
            <button
              class="btn btn-sm btn-outline-danger"
              @click="bulkDelete(selectedItems, clearSelection)"
              :disabled="selectedItems.length === 0"
              v-if="hasPermission('master_data_delete')"
            >
              <i class="fas fa-trash me-1"></i>Delete ({{
                selectedItems.length
              }})
            </button>
          </template>

          <!-- Custom table content -->
          <template #tableContent>
            <thead class="table-light">
              <tr>
                <th width="40">
                  <input
                    type="checkbox"
                    class="form-check-input"
                    @change="toggleSelectAll"
                    :checked="isAllSelected"
                    :indeterminate="isPartiallySelected"
                  />
                </th>
                <th>Key</th>
                <th>Category</th>
                <th>Value</th>
                <th>Type</th>
                <th>Status</th>
                <th>Description</th>
                <th>Updated</th>
                <th width="120">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in masterData"
                :key="item.id"
                :class="{ 'table-active': selectedItems.includes(item.id) }"
              >
                <td>
                  <input
                    type="checkbox"
                    class="form-check-input"
                    :value="item.id"
                    v-model="selectedItems"
                  />
                </td>
                <td>
                  <div class="fw-medium">{{ item.key }}</div>
                </td>
                <td>
                  <span class="badge bg-secondary">{{ item.category }}</span>
                </td>
                <td>
                  <div class="text-truncate" style="max-width: 200px">
                    <span v-if="item.data_type === 'boolean'">
                      <i
                        class="fas fa-check text-success"
                        v-if="item.value === 'true'"
                      ></i>
                      <i class="fas fa-times text-danger" v-else></i>
                    </span>
                    <span v-else-if="item.data_type === 'json'">
                      <code class="text-info">{{
                        truncateJson(item.value)
                      }}</code>
                    </span>
                    <span v-else>{{ item.value }}</span>
                  </div>
                </td>
                <td>
                  <span
                    class="badge"
                    :class="getTypeBadgeClass(item.data_type)"
                  >
                    {{ item.data_type }}
                  </span>
                </td>
                <td>
                  <span
                    class="badge"
                    :class="{
                      'bg-success': item.status === 'active',
                      'bg-warning': item.status === 'inactive',
                    }"
                  >
                    {{ item.status }}
                  </span>
                </td>
                <td>
                  <div
                    class="text-truncate"
                    style="max-width: 150px"
                    :title="item.description"
                  >
                    {{ item.description || "No description" }}
                  </div>
                </td>
                <td>
                  <small class="text-muted">
                    {{ formatDate(item.updated_at) }}
                  </small>
                </td>
                <td>
                  <div class="btn-group" role="group">
                    <button
                      class="btn btn-sm btn-outline-primary"
                      @click="editItem(item)"
                      :title="'Edit ' + item.key"
                      v-if="hasPermission('master_data_update')"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <button
                      class="btn btn-sm btn-outline-danger"
                      @click="deleteItem(item)"
                      :title="'Delete ' + item.key"
                      v-if="hasPermission('master_data_delete')"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </template>
        </EnhancedDataTable>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div
      class="modal fade"
      id="masterDataModal"
      tabindex="-1"
      ref="masterDataModal"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ editingItem ? "Edit Master Data" : "Add Master Data" }}
            </h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
            ></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveMasterData">
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Key *</label>
                    <input
                      type="text"
                      class="form-control"
                      v-model="formData.key"
                      required
                      :disabled="editingItem"
                    />
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Category *</label>
                    <input
                      type="text"
                      class="form-control"
                      v-model="formData.category"
                      required
                    />
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Data Type *</label>
                    <select
                      class="form-select"
                      v-model="formData.data_type"
                      required
                    >
                      <option value="string">String</option>
                      <option value="number">Number</option>
                      <option value="boolean">Boolean</option>
                      <option value="json">JSON</option>
                    </select>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Status *</label>
                    <select
                      class="form-select"
                      v-model="formData.status"
                      required
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Value *</label>
                <textarea
                  v-if="formData.data_type === 'json'"
                  class="form-control"
                  rows="4"
                  v-model="formData.value"
                  placeholder="Enter valid JSON"
                  required
                ></textarea>
                <select
                  v-else-if="formData.data_type === 'boolean'"
                  class="form-select"
                  v-model="formData.value"
                  required
                >
                  <option value="true">True</option>
                  <option value="false">False</option>
                </select>
                <input
                  v-else
                  :type="formData.data_type === 'number' ? 'number' : 'text'"
                  class="form-control"
                  v-model="formData.value"
                  required
                />
              </div>
              <div class="mb-3">
                <label class="form-label">Description</label>
                <textarea
                  class="form-control"
                  rows="2"
                  v-model="formData.description"
                  placeholder="Optional description"
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
              Cancel
            </button>
            <button
              type="button"
              class="btn btn-primary"
              @click="saveMasterData"
            >
              {{ editingItem ? "Update" : "Add" }} Master Data
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <ConfirmationModal
      ref="confirmationModal"
      :title="confirmationTitle"
      :message="confirmationMessage"
      :confirmText="confirmationAction"
      :variant="confirmationVariant"
      @confirm="executeConfirmedAction"
    />
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, nextTick, watch } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "@/composables/useToast";
import EnhancedDataTable from "@/components/common/EnhancedDataTable.vue";
import ConfirmationModal from "@/components/common/ConfirmationModal.vue";
import masterDataService from "@/services/masterDataService";
import { debounce } from "lodash";
import { Modal } from "bootstrap";

export default {
  name: "MasterDataListEnhanced",
  components: {
    EnhancedDataTable,
    ConfirmationModal,
  },
  setup() {
    const authStore = useAuthStore();
    const { showToast } = useToast();

    // Reactive data
    const masterData = ref([]);
    const loading = ref(false);
    const totalItems = ref(0);
    const currentPage = ref(1);
    const itemsPerPage = ref(10);
    const selectedItems = ref([]);
    const searchTerm = ref("");
    const selectedCategory = ref("");
    const selectedStatus = ref("");
    const selectedType = ref("");
    const categories = ref([]);
    const statistics = ref({});
    const showAddModal = ref(false);
    const editingItem = ref(null);
    const masterDataModal = ref(null);
    const confirmationModal = ref(null);

    // Form data
    const formData = reactive({
      key: "",
      category: "",
      value: "",
      data_type: "string",
      status: "active",
      description: "",
    });

    // Confirmation modal data
    const confirmationTitle = ref("");
    const confirmationMessage = ref("");
    const confirmationAction = ref("");
    const confirmationVariant = ref("danger");
    const pendingAction = ref(null);

    // Table columns
    const tableColumns = [
      { key: "key", label: "Key", sortable: true },
      { key: "category", label: "Category", sortable: true },
      { key: "value", label: "Value" },
      { key: "data_type", label: "Type", sortable: true },
      { key: "status", label: "Status", sortable: true },
      { key: "updated_at", label: "Updated", sortable: true },
    ];

    // Computed properties
    const hasPermission = computed(() => (permission) => {
      return authStore.hasPermission(permission);
    });

    const isAllSelected = computed(() => {
      return (
        masterData.value.length > 0 &&
        selectedItems.value.length === masterData.value.length
      );
    });

    const isPartiallySelected = computed(() => {
      return (
        selectedItems.value.length > 0 &&
        selectedItems.value.length < masterData.value.length
      );
    });

    // Methods
    const loadMasterData = async () => {
      try {
        loading.value = true;
        const params = {
          page: currentPage.value,
          limit: itemsPerPage.value,
          search: searchTerm.value,
          category: selectedCategory.value,
          status: selectedStatus.value,
          data_type: selectedType.value,
        };

        const response = await masterDataService.getMasterData(params);
        masterData.value = response.data;
        totalItems.value = response.total;
      } catch (error) {
        console.error("Error loading master data:", error);
        showToast("Failed to load master data", "error");
      } finally {
        loading.value = false;
      }
    };

    const loadStatistics = async () => {
      try {
        const response = await masterDataService.getStatistics();
        statistics.value = response;
      } catch (error) {
        console.error("Error loading statistics:", error);
      }
    };

    const loadCategories = async () => {
      try {
        const response = await masterDataService.getCategories();
        categories.value = response;
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    };

    const refreshData = async () => {
      selectedItems.value = [];
      await Promise.all([loadMasterData(), loadStatistics(), loadCategories()]);
    };

    const debouncedSearch = debounce(() => {
      currentPage.value = 1;
      loadMasterData();
    }, 300);

    const applyFilters = () => {
      currentPage.value = 1;
      loadMasterData();
    };

    const clearFilters = () => {
      searchTerm.value = "";
      selectedCategory.value = "";
      selectedStatus.value = "";
      selectedType.value = "";
      currentPage.value = 1;
      loadMasterData();
    };

    const toggleSelectAll = () => {
      if (isAllSelected.value) {
        selectedItems.value = [];
      } else {
        selectedItems.value = masterData.value.map((item) => item.id);
      }
    };

    const resetForm = () => {
      Object.assign(formData, {
        key: "",
        category: "",
        value: "",
        data_type: "string",
        status: "active",
        description: "",
      });
    };

    const showModal = () => {
      const modal = new Modal(masterDataModal.value);
      modal.show();
    };

    const hideModal = () => {
      const modal = Modal.getInstance(masterDataModal.value);
      if (modal) modal.hide();
    };

    const editItem = (item) => {
      editingItem.value = item;
      Object.assign(formData, {
        key: item.key,
        category: item.category,
        value: item.value,
        data_type: item.data_type,
        status: item.status,
        description: item.description || "",
      });
      showModal();
    };

    const saveMasterData = async () => {
      try {
        if (formData.data_type === "json") {
          try {
            JSON.parse(formData.value);
          } catch {
            showToast("Invalid JSON format", "error");
            return;
          }
        }

        if (editingItem.value) {
          await masterDataService.updateMasterData(
            editingItem.value.id,
            formData
          );
          showToast("Master data updated successfully", "success");
        } else {
          await masterDataService.createMasterData(formData);
          showToast("Master data created successfully", "success");
        }

        hideModal();
        resetForm();
        editingItem.value = null;
        await refreshData();
      } catch (error) {
        console.error("Error saving master data:", error);
        showToast(
          error.response?.data?.message || "Failed to save master data",
          "error"
        );
      }
    };

    const deleteItem = (item) => {
      confirmationTitle.value = "Delete Master Data";
      confirmationMessage.value = `Are you sure you want to delete "${item.key}"? This action cannot be undone.`;
      confirmationAction.value = "Delete";
      confirmationVariant.value = "danger";
      pendingAction.value = async () => {
        try {
          await masterDataService.deleteMasterData(item.id);
          showToast("Master data deleted successfully", "success");
          await refreshData();
        } catch (error) {
          console.error("Error deleting master data:", error);
          showToast("Failed to delete master data", "error");
        }
      };
      confirmationModal.value.show();
    };

    const bulkActivate = (items, clearSelection) => {
      confirmationTitle.value = "Activate Master Data";
      confirmationMessage.value = `Are you sure you want to activate ${items.length} master data items?`;
      confirmationAction.value = "Activate";
      confirmationVariant.value = "success";
      pendingAction.value = async () => {
        try {
          await masterDataService.bulkUpdateStatus(items, "active");
          showToast(
            `Successfully activated ${items.length} master data items`,
            "success"
          );
          clearSelection();
          await refreshData();
        } catch (error) {
          console.error("Error activating master data:", error);
          showToast("Failed to activate master data", "error");
        }
      };
      confirmationModal.value.show();
    };

    const bulkDeactivate = (items, clearSelection) => {
      confirmationTitle.value = "Deactivate Master Data";
      confirmationMessage.value = `Are you sure you want to deactivate ${items.length} master data items?`;
      confirmationAction.value = "Deactivate";
      confirmationVariant.value = "warning";
      pendingAction.value = async () => {
        try {
          await masterDataService.bulkUpdateStatus(items, "inactive");
          showToast(
            `Successfully deactivated ${items.length} master data items`,
            "success"
          );
          clearSelection();
          await refreshData();
        } catch (error) {
          console.error("Error deactivating master data:", error);
          showToast("Failed to deactivate master data", "error");
        }
      };
      confirmationModal.value.show();
    };

    const bulkDelete = (items, clearSelection) => {
      confirmationTitle.value = "Delete Master Data";
      confirmationMessage.value = `Are you sure you want to delete ${items.length} master data items? This action cannot be undone.`;
      confirmationAction.value = "Delete";
      confirmationVariant.value = "danger";
      pendingAction.value = async () => {
        try {
          await masterDataService.bulkDeleteMasterData(items);
          showToast(
            `Successfully deleted ${items.length} master data items`,
            "success"
          );
          clearSelection();
          await refreshData();
        } catch (error) {
          console.error("Error deleting master data:", error);
          showToast("Failed to delete master data", "error");
        }
      };
      confirmationModal.value.show();
    };

    const executeConfirmedAction = async () => {
      if (pendingAction.value) {
        await pendingAction.value();
        pendingAction.value = null;
      }
    };

    const exportData = async () => {
      try {
        const response = await masterDataService.exportMasterData({
          search: searchTerm.value,
          category: selectedCategory.value,
          status: selectedStatus.value,
          data_type: selectedType.value,
        });

        // Create download link
        const blob = new Blob([response], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "master-data-export.csv";
        link.click();
        window.URL.revokeObjectURL(url);

        showToast("Master data exported successfully", "success");
      } catch (error) {
        console.error("Error exporting master data:", error);
        showToast("Failed to export master data", "error");
      }
    };

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    const getTypeBadgeClass = (type) => {
      const classes = {
        string: "bg-primary",
        number: "bg-success",
        boolean: "bg-warning",
        json: "bg-info",
      };
      return classes[type] || "bg-secondary";
    };

    const truncateJson = (jsonString, maxLength = 50) => {
      if (jsonString.length <= maxLength) return jsonString;
      return jsonString.substring(0, maxLength) + "...";
    };

    // Watchers
    watch([currentPage, itemsPerPage], () => {
      loadMasterData();
    });

    watch(showAddModal, (newValue) => {
      if (newValue) {
        resetForm();
        editingItem.value = null;
        nextTick(() => {
          showModal();
        });
      }
    });

    // Lifecycle
    onMounted(() => {
      refreshData();
    });

    return {
      // Data
      masterData,
      loading,
      totalItems,
      currentPage,
      itemsPerPage,
      selectedItems,
      searchTerm,
      selectedCategory,
      selectedStatus,
      selectedType,
      categories,
      statistics,
      showAddModal,
      editingItem,
      masterDataModal,
      confirmationModal,
      formData,
      tableColumns,
      confirmationTitle,
      confirmationMessage,
      confirmationAction,
      confirmationVariant,

      // Computed
      hasPermission,
      isAllSelected,
      isPartiallySelected,

      // Methods
      refreshData,
      debouncedSearch,
      applyFilters,
      clearFilters,
      toggleSelectAll,
      editItem,
      saveMasterData,
      deleteItem,
      bulkActivate,
      bulkDeactivate,
      bulkDelete,
      executeConfirmedAction,
      exportData,
      formatDate,
      getTypeBadgeClass,
      truncateJson,
    };
  },
};
</script>

<style scoped>
.master-data-list {
  padding: 1rem;
}

.table-active {
  background-color: var(--bs-primary-bg-subtle) !important;
}

.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn-group .btn {
  padding: 0.25rem 0.5rem;
}

.badge {
  font-size: 0.75rem;
}

.card {
  border: none;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.modal-lg {
  max-width: 800px;
}

code {
  font-size: 0.875rem;
  background-color: var(--bs-gray-100);
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
}

@media (max-width: 768px) {
  .master-data-list {
    padding: 0.5rem;
  }

  .d-flex.gap-2 {
    flex-direction: column;
    gap: 0.5rem !important;
  }

  .btn-group {
    flex-direction: column;
  }
}
</style>
