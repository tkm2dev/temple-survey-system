<template>
  <div class="survey-list">
    <!-- Page Header -->
    <div class="survey-header mb-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h1 class="h3 mb-1">
            <i class="bi bi-clipboard-data me-2 text-primary"></i>
            จัดการข้อมูลการสำรวจ
          </h1>
          <p class="text-muted mb-0">
            <i class="bi bi-info-circle me-1"></i>
            การสำรวจทั้งหมด {{ totalRecords }} รายการ
          </p>
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

      <!-- Summary Stats -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="stats-row">
            <div class="stat-item">
              <div class="stat-number">{{ totalRecords }}</div>
              <div class="stat-label">การสำรวจทั้งหมด</div>
            </div>
            <div class="stat-item">
              <div class="stat-number text-secondary">{{ draftCount }}</div>
              <div class="stat-label">ร่าง</div>
            </div>
            <div class="stat-item">
              <div class="stat-number text-warning">{{ pendingCount }}</div>
              <div class="stat-label">รอตรวจสอบ</div>
            </div>
            <div class="stat-item">
              <div class="stat-number text-success">{{ approvedCount }}</div>
              <div class="stat-label">อนุมัติแล้ว</div>
            </div>
            <div class="stat-item">
              <div class="stat-number text-danger">{{ revisionCount }}</div>
              <div class="stat-label">ต้องแก้ไข</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Enhanced Data Table -->
    <EnhancedDataTable
      :items="surveys"
      :loading="loading"
      :current-page="currentPage"
      :total-pages="totalPages"
      :total-records="totalRecords"
      :items-per-page="itemsPerPage"
      :enable-bulk-selection="true"
      :enable-pagination="true"
      :show-actions-column="true"
      :can-bulk-edit="false"
      :can-bulk-status="true"
      :can-bulk-delete="true"
      :header-count="7"
      empty-message="ไม่พบข้อมูลการสำรวจในระบบ"
      item-key-field="target_id"
      @update:current-page="changePage"
      @update:items-per-page="updateItemsPerPage"
      @bulk-status-change="handleBulkStatusChange"
      @bulk-delete="handleBulkDelete"
      @selection-change="handleSelectionChange"
    >
      <!-- Table Headers -->
      <template #headers>
        <th>ชื่อเป้าหมาย</th>
        <th class="d-none d-md-table-cell">ประเภท</th>
        <th class="d-none d-lg-table-cell">ที่อยู่</th>
        <th class="d-none d-lg-table-cell">จังหวัด</th>
        <th>สถานะ</th>
        <th class="d-none d-sm-table-cell">ผู้สร้าง</th>
        <th class="d-none d-md-table-cell">วันที่อัปเดต</th>
      </template>

      <!-- Table Row Content -->
      <template #row="{ item: survey, index }">
        <td>
          <div class="fw-bold">{{ survey.target_name }}</div>
          <div class="small text-muted d-md-none">
            {{ survey.type_name }} • {{ survey.province }}
          </div>
        </td>
        <td class="d-none d-md-table-cell">
          <span class="badge bg-light text-dark">
            {{ survey.type_name }}
          </span>
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
      </template>

      <!-- Actions Column -->
      <template #actions="{ item: survey }">
        <div class="btn-group btn-group-sm">
          <router-link
            :to="`/surveys/${survey.target_id}`"
            class="btn btn-outline-primary"
            title="ดูรายละเอียด"
          >
            <i class="bi bi-eye"></i>
          </router-link>
          <router-link
            :to="`/surveys/${survey.target_id}/edit`"
            class="btn btn-outline-warning"
            title="แก้ไข"
            v-if="authStore.can('edit_survey')"
          >
            <i class="bi bi-pencil"></i>
          </router-link>
          <button
            class="btn btn-outline-danger"
            title="ลบ"
            @click="showDeleteConfirmation(survey)"
            v-if="authStore.can('delete_survey')"
          >
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </template>

      <!-- Bulk Actions -->
      <template #bulk-actions="{ selectedItems }">
        <div class="btn-group btn-group-sm">
          <div class="btn-group btn-group-sm">
            <button
              class="btn btn-outline-success dropdown-toggle"
              data-bs-toggle="dropdown"
            >
              <i class="bi bi-arrow-repeat me-1"></i>
              เปลี่ยนสถานะ
            </button>
            <ul class="dropdown-menu">
              <li>
                <button
                  class="dropdown-item"
                  @click="handleBulkStatusChange(selectedItems, 'Draft')"
                >
                  <i class="bi bi-file-earmark me-2 text-secondary"></i>
                  ร่าง
                </button>
              </li>
              <li>
                <button
                  class="dropdown-item"
                  @click="handleBulkStatusChange(selectedItems, 'Pending Review')"
                >
                  <i class="bi bi-clock me-2 text-warning"></i>
                  รอตรวจสอบ
                </button>
              </li>
              <li>
                <button
                  class="dropdown-item"
                  @click="handleBulkStatusChange(selectedItems, 'Approved')"
                >
                  <i class="bi bi-check-circle me-2 text-success"></i>
                  อนุมัติแล้ว
                </button>
              </li>
              <li>
                <button
                  class="dropdown-item"
                  @click="handleBulkStatusChange(selectedItems, 'Needs Revision')"
                >
                  <i class="bi bi-exclamation-triangle me-2 text-danger"></i>
                  ต้องแก้ไข
                </button>
              </li>
            </ul>
          </div>
          <button
            class="btn btn-outline-danger"
            @click="handleBulkDelete(selectedItems)"
          >
            <i class="bi bi-trash me-1"></i>
            ลบทั้งหมด
          </button>
        </div>
      </template>
    </EnhancedDataTable>

    <!-- Confirmation Modal -->
    <div
      class="modal fade"
      id="confirmationModal"
      tabindex="-1"
      ref="confirmationModal"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ confirmationTitle }}</h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
            ></button>
          </div>
          <div class="modal-body">
            {{ confirmationMessage }}
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
              class="btn"
              :class="confirmationBtnClass"
              @click="executeConfirmedAction"
            >
              {{ confirmationBtnText }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import surveyService from '@/services/surveyService'
import masterDataService from '@/services/masterDataService'
import EnhancedDataTable from '@/components/common/EnhancedDataTable.vue'
import moment from 'moment'

export default {
  name: 'SurveyListEnhanced',
  components: {
    EnhancedDataTable
  },
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    
    // Reactive data
    const loading = ref(false)
    const surveys = ref([])
    const surveyTypes = ref([])
    const currentPage = ref(1)
    const totalPages = ref(1)
    const totalRecords = ref(0)
    const itemsPerPage = ref(20)
    const confirmationTitle = ref('')
    const confirmationMessage = ref('')
    const confirmationBtnText = ref('')
    const confirmationBtnClass = ref('')
    const confirmedAction = ref(null)
    const selectedSurveys = ref([])

    const filters = reactive({
      search: '',
      status: '',
      type_id: '',
      created_by: ''
    })

    // Computed properties
    const draftCount = computed(() => {
      return surveys.value.filter(s => s.status === 'Draft').length
    })

    const pendingCount = computed(() => {
      return surveys.value.filter(s => s.status === 'Pending Review').length
    })

    const approvedCount = computed(() => {
      return surveys.value.filter(s => s.status === 'Approved').length
    })

    const revisionCount = computed(() => {
      return surveys.value.filter(s => s.status === 'Needs Revision').length
    })

    // Methods
    const loadSurveys = async (page = currentPage.value) => {
      try {
        loading.value = true
        
        const params = {
          page,
          limit: itemsPerPage.value,
          search: filters.search.trim(),
          status: filters.status,
          type_id: filters.type_id,
          created_by: filters.created_by,
        }

        // Remove empty parameters
        Object.keys(params).forEach((key) => {
          if (params[key] === "" || params[key] === null || params[key] === undefined) {
            delete params[key]
          }
        })

        const response = await surveyService.getSurveys(params)

        if (response.success) {
          surveys.value = response.data.surveys || []
          currentPage.value = response.data.pagination?.currentPage || 1
          totalPages.value = response.data.pagination?.totalPages || 1
          totalRecords.value = response.data.pagination?.totalRecords || 0
        }
      } catch (error) {
        console.error('Failed to load surveys:', error)
        surveys.value = []
      } finally {
        loading.value = false
      }
    }

    const loadSurveyTypes = async () => {
      try {
        const response = await masterDataService.getSurveyTypes()
        if (response.success) {
          surveyTypes.value = response.data
        }
      } catch (error) {
        console.error('Failed to load survey types:', error)
      }
    }

    const changePage = (page) => {
      currentPage.value = page
      loadSurveys(page)
    }

    const updateItemsPerPage = (newItemsPerPage) => {
      itemsPerPage.value = newItemsPerPage
      currentPage.value = 1
      loadSurveys(1)
    }

    const debouncedSearch = debounce(() => {
      currentPage.value = 1
      loadSurveys(1)
    }, 500)

    const clearFilters = () => {
      filters.search = ''
      filters.status = ''
      filters.type_id = ''
      filters.created_by = ''
      currentPage.value = 1
      loadSurveys(1)
    }

    const showDeleteConfirmation = (survey) => {
      confirmationTitle.value = 'ยืนยันการลบการสำรวจ'
      confirmationMessage.value = `คุณต้องการลบการสำรวจ "${survey.target_name}" หรือไม่?`
      confirmationBtnText.value = 'ลบ'
      confirmationBtnClass.value = 'btn-danger'
      confirmedAction.value = () => deleteSurvey(survey)
      showConfirmationModal()
    }

    const deleteSurvey = async (survey) => {
      try {
        await surveyService.deleteSurvey(survey.target_id)
        surveys.value = surveys.value.filter(s => s.target_id !== survey.target_id)
        totalRecords.value--
        showToast(`ลบการสำรวจ "${survey.target_name}" สำเร็จ`, 'success')
        hideConfirmationModal()
      } catch (error) {
        console.error('Error deleting survey:', error)
        showToast('เกิดข้อผิดพลาดในการลบการสำรวจ', 'error')
      }
    }

    const handleBulkStatusChange = async (items, status) => {
      try {
        const surveyIds = items.map(survey => survey.target_id)
        await surveyService.bulkUpdateStatus(surveyIds, status)
        
        // Update local data
        items.forEach(survey => {
          const localSurvey = surveys.value.find(s => s.target_id === survey.target_id)
          if (localSurvey) {
            localSurvey.status = status
          }
        })
        
        showToast(`อัปเดตสถานะ ${items.length} การสำรวจเป็น "${getStatusText(status)}" สำเร็จ`, 'success')
      } catch (error) {
        console.error('Error bulk status change:', error)
        showToast('เกิดข้อผิดพลาดในการเปลี่ยนสถานะการสำรวจ', 'error')
      }
    }

    const handleBulkDelete = (items) => {
      confirmationTitle.value = 'ยืนยันการลบการสำรวจหลายรายการ'
      confirmationMessage.value = `คุณต้องการลบการสำรวจ ${items.length} รายการหรือไม่?`
      confirmationBtnText.value = 'ลบทั้งหมด'
      confirmationBtnClass.value = 'btn-danger'
      confirmedAction.value = () => bulkDeleteSurveys(items)
      showConfirmationModal()
    }

    const bulkDeleteSurveys = async (items) => {
      try {
        const surveyIds = items.map(survey => survey.target_id)
        await surveyService.bulkDeleteSurveys(surveyIds)
        
        const deletedIds = items.map(survey => survey.target_id)
        surveys.value = surveys.value.filter(survey => !deletedIds.includes(survey.target_id))
        totalRecords.value -= items.length
        
        showToast(`ลบ ${items.length} การสำรวจสำเร็จ`, 'success')
        hideConfirmationModal()
      } catch (error) {
        console.error('Error bulk deleting surveys:', error)
        showToast('เกิดข้อผิดพลาดในการลบการสำรวจ', 'error')
      }
    }

    const handleSelectionChange = (selected) => {
      selectedSurveys.value = selected
    }

    // Helper methods
    const getStatusClass = (status) => {
      const statusClasses = {
        'Draft': 'bg-secondary',
        'Pending Review': 'bg-warning',
        'Approved': 'bg-success',
        'Needs Revision': 'bg-danger'
      }
      return statusClasses[status] || 'bg-secondary'
    }

    const getStatusIcon = (status) => {
      const statusIcons = {
        'Draft': 'bi bi-file-earmark',
        'Pending Review': 'bi bi-clock',
        'Approved': 'bi bi-check-circle',
        'Needs Revision': 'bi bi-exclamation-triangle'
      }
      return statusIcons[status] || 'bi bi-file-earmark'
    }

    const getStatusText = (status) => {
      const statusTexts = {
        'Draft': 'ร่าง',
        'Pending Review': 'รอตรวจสอบ',
        'Approved': 'อนุมัติแล้ว',
        'Needs Revision': 'ต้องแก้ไข'
      }
      return statusTexts[status] || status
    }

    const formatDate = (date) => {
      return moment(date).format('DD/MM/YYYY HH:mm')
    }

    // Utility functions
    function debounce(func, wait) {
      let timeout
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout)
          func(...args)
        }
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
      }
    }

    const showToast = (message, type = 'info') => {
      // Toast implementation here (same as UserList)
      console.log(`${type}: ${message}`)
    }

    // Modal methods
    const showConfirmationModal = () => {
      const modal = new bootstrap.Modal(document.getElementById('confirmationModal'))
      modal.show()
    }

    const hideConfirmationModal = () => {
      const modal = bootstrap.Modal.getInstance(document.getElementById('confirmationModal'))
      if (modal) {
        modal.hide()
      }
    }

    const executeConfirmedAction = () => {
      if (confirmedAction.value) {
        confirmedAction.value()
      }
    }

    // Lifecycle
    onMounted(async () => {
      await Promise.all([
        loadSurveyTypes(),
        loadSurveys()
      ])
    })

    return {
      // Data
      loading,
      surveys,
      surveyTypes,
      currentPage,
      totalPages,
      totalRecords,
      itemsPerPage,
      filters,
      confirmationTitle,
      confirmationMessage,
      confirmationBtnText,
      confirmationBtnClass,
      selectedSurveys,
      authStore,
      
      // Computed
      draftCount,
      pendingCount,
      approvedCount,
      revisionCount,
      
      // Methods
      loadSurveys,
      changePage,
      updateItemsPerPage,
      debouncedSearch,
      clearFilters,
      showDeleteConfirmation,
      deleteSurvey,
      handleBulkStatusChange,
      handleBulkDelete,
      handleSelectionChange,
      getStatusClass,
      getStatusIcon,
      getStatusText,
      formatDate,
      executeConfirmedAction
    }
  }
}
</script>

<style scoped>
.survey-list {
  max-width: 100%;
  margin: 0 auto;
}

.survey-header {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 1.5rem;
}

.stats-row {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 80px;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: bold;
  line-height: 1;
}

.stat-label {
  font-size: 0.75rem;
  color: #6c757d;
  text-align: center;
  margin-top: 0.25rem;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

@media (max-width: 768px) {
  .stats-row {
    justify-content: center;
  }
  
  .survey-header .d-flex {
    flex-direction: column;
    gap: 1rem;
  }
}

@media (max-width: 576px) {
  .stats-row {
    gap: 0.5rem;
  }
  
  .stat-number {
    font-size: 1.25rem;
  }
  
  .stat-label {
    font-size: 0.7rem;
  }
}
</style>
