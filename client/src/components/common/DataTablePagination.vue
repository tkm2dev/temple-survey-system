<template>
  <div class="data-table-pagination" v-if="totalPages > 1">
    <!-- Pagination Info -->
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div class="pagination-info text-muted">
        <small>
          แสดง {{ startRecord }} ถึง {{ endRecord }} จาก {{ totalRecords }} รายการ
        </small>
      </div>
      
      <!-- Items per page selector -->
      <div class="d-flex align-items-center">
        <label class="form-label me-2 mb-0">แสดงต่อหน้า:</label>
        <select 
          :value="itemsPerPage" 
          @change="$emit('update:itemsPerPage', parseInt($event.target.value))"
          class="form-select form-select-sm"
          style="width: auto"
        >
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
      </div>
    </div>

    <!-- Pagination Controls -->
    <nav aria-label="Page navigation">
      <ul class="pagination justify-content-center mb-0">
        <!-- Previous Button -->
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <button
            class="page-link"
            @click="changePage(currentPage - 1)"
            :disabled="currentPage === 1"
            aria-label="หน้าก่อนหน้า"
          >
            <i class="bi bi-chevron-left"></i>
            <span class="d-none d-sm-inline ms-1">ก่อนหน้า</span>
          </button>
        </li>

        <!-- First Page -->
        <li v-if="currentPage > 3" class="page-item">
          <button class="page-link" @click="changePage(1)">1</button>
        </li>
        <li v-if="currentPage > 4" class="page-item disabled">
          <span class="page-link">...</span>
        </li>

        <!-- Page Numbers -->
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

        <!-- Last Page -->
        <li v-if="currentPage < totalPages - 3" class="page-item disabled">
          <span class="page-link">...</span>
        </li>
        <li v-if="currentPage < totalPages - 2" class="page-item">
          <button class="page-link" @click="changePage(totalPages)">
            {{ totalPages }}
          </button>
        </li>

        <!-- Next Button -->
        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <button
            class="page-link"
            @click="changePage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            aria-label="หน้าถัดไป"
          >
            <span class="d-none d-sm-inline me-1">ถัดไป</span>
            <i class="bi bi-chevron-right"></i>
          </button>
        </li>
      </ul>
    </nav>

    <!-- Jump to Page -->
    <div class="d-flex justify-content-center mt-3" v-if="totalPages > 10">
      <div class="input-group input-group-sm" style="width: 200px">
        <span class="input-group-text">ไปหน้า:</span>
        <input
          v-model="jumpToPage"
          type="number"
          class="form-control"
          :min="1"
          :max="totalPages"
          @keyup.enter="handleJumpToPage"
        />
        <button class="btn btn-outline-secondary" @click="handleJumpToPage">
          <i class="bi bi-arrow-right"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'DataTablePagination',
  props: {
    currentPage: {
      type: Number,
      required: true
    },
    totalPages: {
      type: Number,
      required: true
    },
    totalRecords: {
      type: Number,
      required: true
    },
    itemsPerPage: {
      type: Number,
      default: 20
    }
  },
  emits: ['update:currentPage', 'update:itemsPerPage'],
  setup(props, { emit }) {
    const jumpToPage = ref('')

    const visiblePages = computed(() => {
      const pages = []
      const start = Math.max(1, props.currentPage - 2)
      const end = Math.min(props.totalPages, props.currentPage + 2)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      return pages
    })

    const startRecord = computed(() => {
      return (props.currentPage - 1) * props.itemsPerPage + 1
    })

    const endRecord = computed(() => {
      return Math.min(props.currentPage * props.itemsPerPage, props.totalRecords)
    })

    const changePage = (page) => {
      if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
        emit('update:currentPage', page)
      }
    }

    const handleJumpToPage = () => {
      const page = parseInt(jumpToPage.value)
      if (page >= 1 && page <= props.totalPages) {
        changePage(page)
        jumpToPage.value = ''
      }
    }

    return {
      jumpToPage,
      visiblePages,
      startRecord,
      endRecord,
      changePage,
      handleJumpToPage
    }
  }
}
</script>

<style scoped>
.data-table-pagination {
  padding: 1rem;
  background: #f8f9fa;
  border-top: 1px solid #dee2e6;
  border-radius: 0 0 0.375rem 0.375rem;
}

.pagination-info {
  font-size: 0.875rem;
}

.page-link {
  border-color: #dee2e6;
  color: #6c757d;
}

.page-link:hover {
  background-color: #e9ecef;
  border-color: #adb5bd;
  color: #495057;
}

.page-item.active .page-link {
  background-color: #0d6efd;
  border-color: #0d6efd;
  color: white;
}

.page-item.disabled .page-link {
  color: #6c757d;
  background-color: #fff;
  border-color: #dee2e6;
}

@media (max-width: 576px) {
  .pagination {
    justify-content: center;
  }
  
  .pagination .page-item:not(.active):not(:first-child):not(:last-child) {
    display: none;
  }
}
</style>
