<template>
  <div class="bulk-selection-toolbar" v-if="selectedItems.length > 0">
    <div class="card border-primary">
      <div class="card-body py-2">
        <div class="d-flex justify-content-between align-items-center">
          <div class="d-flex align-items-center">
            <i class="bi bi-check-circle text-primary me-2"></i>
            <span class="fw-bold">เลือกแล้ว {{ selectedItems.length }} รายการ</span>
            <button 
              class="btn btn-link p-0 ms-2 text-decoration-none"
              @click="clearSelection"
            >
              <small>ล้างการเลือก</small>
            </button>
          </div>
          
          <div class="d-flex gap-2">
            <slot name="bulk-actions" :selectedItems="selectedItems">
              <!-- Default bulk actions -->
              <button 
                v-if="canBulkEdit"
                class="btn btn-outline-primary btn-sm"
                @click="$emit('bulk-edit', selectedItems)"
              >
                <i class="bi bi-pencil me-1"></i>
                แก้ไขหลายรายการ
              </button>
              
              <button 
                v-if="canBulkStatus"
                class="btn btn-outline-warning btn-sm"
                @click="$emit('bulk-status-change', selectedItems)"
              >
                <i class="bi bi-toggle-on me-1"></i>
                เปลี่ยนสถานะ
              </button>
              
              <button 
                v-if="canBulkDelete"
                class="btn btn-outline-danger btn-sm"
                @click="$emit('bulk-delete', selectedItems)"
              >
                <i class="bi bi-trash me-1"></i>
                ลบหลายรายการ
              </button>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BulkSelectionToolbar',
  props: {
    selectedItems: {
      type: Array,
      required: true
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
    }
  },
  emits: ['bulk-edit', 'bulk-status-change', 'bulk-delete', 'clear-selection'],
  setup(props, { emit }) {
    const clearSelection = () => {
      emit('clear-selection')
    }

    return {
      clearSelection
    }
  }
}
</script>

<style scoped>
.bulk-selection-toolbar {
  position: sticky;
  top: 0;
  z-index: 1020;
  margin-bottom: 1rem;
}

.bulk-selection-toolbar .card {
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

@media (max-width: 576px) {
  .bulk-selection-toolbar .d-flex {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .bulk-selection-toolbar .d-flex:last-child {
    flex-direction: row;
    justify-content: center;
  }
}
</style>
