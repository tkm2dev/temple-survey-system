<template>
  <div class="enhanced-data-table">
    <!-- Bulk Selection Toolbar -->
    <BulkSelectionToolbar
      v-if="enableBulkSelection"
      :selected-items="selectedItems"
      :can-bulk-edit="canBulkEdit"
      :can-bulk-status="canBulkStatus"
      :can-bulk-delete="canBulkDelete"
      @bulk-edit="$emit('bulk-edit', $event)"
      @bulk-status-change="$emit('bulk-status-change', $event)"
      @bulk-delete="$emit('bulk-delete', $event)"
      @clear-selection="clearSelection"
    >
      <template #bulk-actions="{ selectedItems }">
        <slot name="bulk-actions" :selectedItems="selectedItems"></slot>
      </template>
    </BulkSelectionToolbar>

    <!-- Table Container -->
    <div class="table-responsive">
      <table class="table table-hover mb-0">
        <thead class="table-light">
          <tr>
            <!-- Select All Checkbox -->
            <th v-if="enableBulkSelection" style="width: 50px">
              <div class="form-check">
                <input
                  class="form-check-input"
                  type="checkbox"
                  :checked="isAllSelected"
                  :indeterminate="isIndeterminate"
                  @change="toggleSelectAll"
                  id="selectAll"
                />
                <label class="form-check-label" for="selectAll">
                  <span class="visually-hidden">เลือกทั้งหมด</span>
                </label>
              </div>
            </th>
            
            <!-- Table Headers -->
            <slot name="headers"></slot>
            
            <!-- Actions Column -->
            <th v-if="showActionsColumn" class="text-center" style="width: 120px">
              การจัดการ
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading" class="text-center">
            <td :colspan="columnCount" class="py-4">
              <div class="d-flex justify-content-center align-items-center">
                <div class="spinner-border spinner-border-sm me-2" role="status">
                  <span class="visually-hidden">กำลังโหลด...</span>
                </div>
                กำลังโหลดข้อมูล...
              </div>
            </td>
          </tr>
          
          <tr v-else-if="items.length === 0" class="text-center">
            <td :colspan="columnCount" class="py-4 text-muted">
              <i class="bi bi-inbox display-1"></i>
              <div class="mt-2">
                <h5>ไม่พบข้อมูล</h5>
                <p class="mb-0">{{ emptyMessage || 'ไม่มีข้อมูลในระบบ' }}</p>
              </div>
            </td>
          </tr>
          
          <tr
            v-else
            v-for="(item, index) in items"
            :key="getItemKey(item, index)"
            :class="{ 'table-active': isSelected(item) }"
          >
            <!-- Selection Checkbox -->
            <td v-if="enableBulkSelection">
              <div class="form-check">
                <input
                  class="form-check-input"
                  type="checkbox"
                  :checked="isSelected(item)"
                  @change="toggleSelection(item)"
                  :id="`select-${getItemKey(item, index)}`"
                />
                <label 
                  class="form-check-label" 
                  :for="`select-${getItemKey(item, index)}`"
                >
                  <span class="visually-hidden">เลือก</span>
                </label>
              </div>
            </td>
            
            <!-- Table Rows -->
            <slot name="row" :item="item" :index="index" :isSelected="isSelected(item)"></slot>
            
            <!-- Actions Column -->
            <td v-if="showActionsColumn" class="text-center">
              <slot name="actions" :item="item" :index="index"></slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <DataTablePagination
      v-if="enablePagination && totalPages > 1"
      :current-page="currentPage"
      :total-pages="totalPages"
      :total-records="totalRecords"
      :items-per-page="itemsPerPage"
      @update:current-page="$emit('update:currentPage', $event)"
      @update:items-per-page="$emit('update:itemsPerPage', $event)"
    />
  </div>
</template>

<script>
import { computed, ref } from 'vue'
import BulkSelectionToolbar from './BulkSelectionToolbar.vue'
import DataTablePagination from './DataTablePagination.vue'

export default {
  name: 'EnhancedDataTable',
  components: {
    BulkSelectionToolbar,
    DataTablePagination
  },
  props: {
    items: {
      type: Array,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    },
    enableBulkSelection: {
      type: Boolean,
      default: true
    },
    enablePagination: {
      type: Boolean,
      default: true
    },
    showActionsColumn: {
      type: Boolean,
      default: true
    },
    canBulkEdit: {
      type: Boolean,
      default: true
    },
    canBulkStatus: {
      type: Boolean,
      default: true
    },
    canBulkDelete: {
      type: Boolean,
      default: true
    },
    currentPage: {
      type: Number,
      default: 1
    },
    totalPages: {
      type: Number,
      default: 1
    },
    totalRecords: {
      type: Number,
      default: 0
    },
    itemsPerPage: {
      type: Number,
      default: 20
    },
    itemKeyField: {
      type: String,
      default: 'id'
    },
    emptyMessage: {
      type: String,
      default: null
    },
    headerCount: {
      type: Number,
      default: 0
    }
  },
  emits: [
    'update:currentPage',
    'update:itemsPerPage', 
    'bulk-edit',
    'bulk-status-change', 
    'bulk-delete',
    'selection-change'
  ],
  setup(props, { emit }) {
    const selectedItems = ref([])

    const columnCount = computed(() => {
      let count = props.headerCount
      if (props.enableBulkSelection) count++
      if (props.showActionsColumn) count++
      return count
    })

    const isAllSelected = computed(() => {
      return props.items.length > 0 && selectedItems.value.length === props.items.length
    })

    const isIndeterminate = computed(() => {
      return selectedItems.value.length > 0 && selectedItems.value.length < props.items.length
    })

    const getItemKey = (item, index) => {
      return item[props.itemKeyField] || item.id || index
    }

    const isSelected = (item) => {
      const itemKey = getItemKey(item)
      return selectedItems.value.some(selected => getItemKey(selected) === itemKey)
    }

    const toggleSelection = (item) => {
      const itemKey = getItemKey(item)
      const index = selectedItems.value.findIndex(selected => getItemKey(selected) === itemKey)
      
      if (index > -1) {
        selectedItems.value.splice(index, 1)
      } else {
        selectedItems.value.push(item)
      }
      
      emit('selection-change', selectedItems.value)
    }

    const toggleSelectAll = () => {
      if (isAllSelected.value) {
        selectedItems.value = []
      } else {
        selectedItems.value = [...props.items]
      }
      emit('selection-change', selectedItems.value)
    }

    const clearSelection = () => {
      selectedItems.value = []
      emit('selection-change', selectedItems.value)
    }

    return {
      selectedItems,
      columnCount,
      isAllSelected,
      isIndeterminate,
      getItemKey,
      isSelected,
      toggleSelection,
      toggleSelectAll,
      clearSelection
    }
  }
}
</script>

<style scoped>
.enhanced-data-table {
  background: white;
  border-radius: 0.375rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
}

.table-responsive {
  border-radius: 0.375rem;
}

.table {
  margin-bottom: 0;
}

.table th {
  border-top: none;
  font-weight: 600;
  color: #495057;
  background-color: #f8f9fa !important;
}

.table td {
  vertical-align: middle;
}

.table-active {
  background-color: rgba(13, 110, 253, 0.075) !important;
}

.form-check-input:checked {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.form-check-input:indeterminate {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

@media (max-width: 768px) {
  .table-responsive {
    font-size: 0.875rem;
  }
}
</style>
