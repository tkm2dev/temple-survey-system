<template>
  <div class="user-list">
    <!-- Header Section -->
    <div class="user-header mb-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 class="mb-1">
            <i class="bi bi-people me-2 text-primary"></i>
            จัดการผู้ใช้งาน
          </h2>
          <p class="text-muted mb-0">
            <i class="bi bi-info-circle me-1"></i>
            ผู้ใช้ทั้งหมด {{ totalUsers }} คน
          </p>
        </div>

        <div class="d-flex gap-2">
          <router-link to="/users/create" class="btn btn-primary">
            <i class="bi bi-plus-circle me-2"></i>
            เพิ่มผู้ใช้ใหม่
          </router-link>
          <button
            @click="refreshUsers"
            class="btn btn-outline-secondary"
            :disabled="loading"
          >
            <i class="bi bi-arrow-clockwise me-2"></i>
            รีเฟรช
          </button>
        </div>
      </div>

      <!-- Search and Filter Section -->
      <div class="row mb-3">
        <div class="col-md-4 mb-3">
          <div class="input-group">
            <span class="input-group-text">
              <i class="bi bi-search"></i>
            </span>
            <input
              v-model="searchQuery"
              type="text"
              class="form-control"
              placeholder="ค้นหาชื่อ, username, หรือ email..."
              @input="handleSearch"
            />
            <button
              v-if="searchQuery"
              @click="clearSearch"
              class="btn btn-outline-secondary"
              type="button"
            >
              <i class="bi bi-x"></i>
            </button>
          </div>
        </div>

        <div class="col-md-2 mb-3">
          <select
            v-model="selectedRole"
            class="form-select"
            @change="handleFilter"
          >
            <option value="">ทุกบทบาท</option>
            <option value="Admin">ผู้ดูแล</option>
            <option value="Reviewer">ผู้ตรวจ</option>
            <option value="Surveyor">ผู้สำรวจ</option>
          </select>
        </div>

        <div class="col-md-2 mb-3">
          <select
            v-model="selectedStatus"
            class="form-select"
            @change="handleFilter"
          >
            <option value="">ทุกสถานะ</option>
            <option value="1">ใช้งาน</option>
            <option value="0">ไม่ใช้งาน</option>
          </select>
        </div>

        <div class="col-md-2 mb-3">
          <select
            v-model="selectedDepartment"
            class="form-select"
            @change="handleFilter"
          >
            <option value="">ทุกหน่วยงาน</option>
            <option v-for="dept in uniqueDepartments" :key="dept" :value="dept">
              {{ dept }}
            </option>
          </select>
        </div>

        <div class="col-md-2 mb-3">
          <select
            v-model="selectedApprovalStatus"
            class="form-select"
            @change="handleFilter"
          >
            <option value="">ทุกการอนุมัติ</option>
            <option value="pending">รออนุมัติ</option>
            <option value="approved">อนุมัติแล้ว</option>
            <option value="rejected">ปฏิเสธ</option>
          </select>
        </div>
      </div>

      <!-- Summary Stats -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="stats-row">
            <div class="stat-item">
              <div class="stat-number">{{ totalUsers }}</div>
              <div class="stat-label">ผู้ใช้ทั้งหมด</div>
            </div>
            <div class="stat-item">
              <div class="stat-number text-success">{{ activeUsers }}</div>
              <div class="stat-label">เปิดใช้งาน</div>
            </div>
            <div class="stat-item">
              <div class="stat-number text-danger">{{ inactiveUsers }}</div>
              <div class="stat-label">ปิดใช้งาน</div>
            </div>
            <div class="stat-item">
              <div class="stat-number text-warning">{{ adminUsers }}</div>
              <div class="stat-label">Admin</div>
            </div>
            <div class="stat-item">
              <div class="stat-number text-info">{{ reviewerUsers }}</div>
              <div class="stat-label">Reviewer</div>
            </div>
            <div class="stat-item">
              <div class="stat-number text-secondary">{{ surveyorUsers }}</div>
              <div class="stat-label">Surveyor</div>
            </div>
            <div class="stat-separator"></div>
            <div class="stat-item">
              <div class="stat-number text-warning">{{ pendingUsers }}</div>
              <div class="stat-label">รออนุมัติ</div>
            </div>
            <div class="stat-item">
              <div class="stat-number text-success">{{ approvedUsers }}</div>
              <div class="stat-label">อนุมัติแล้ว</div>
            </div>
            <div class="stat-item">
              <div class="stat-number text-danger">{{ rejectedUsers }}</div>
              <div class="stat-label">ปฏิเสธ</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Enhanced Data Table -->
    <EnhancedDataTable
      :items="users"
      :loading="loading"
      :current-page="currentPage"
      :total-pages="totalPages"
      :total-records="totalUsers"
      :items-per-page="itemsPerPage"
      :enable-bulk-selection="true"
      :enable-pagination="true"
      :show-actions-column="true"
      :can-bulk-edit="true"
      :can-bulk-status="true"
      :can-bulk-delete="true"
      :header-count="8"
      empty-message="ไม่พบข้อมูลผู้ใช้ในระบบ"
      item-key-field="user_id"
      @update:current-page="changePage"
      @update:items-per-page="updateItemsPerPage"
      @bulk-edit="handleBulkEdit"
      @bulk-status-change="handleBulkStatusChange"
      @bulk-delete="handleBulkDelete"
      @selection-change="handleSelectionChange"
    >
      <!-- Table Headers -->
      <template #headers>
        <th>รูปประจำตัว</th>
        <th>ชื่อยศ-นามสกุล</th>
        <th>ตำแหน่ง</th>
        <th>หน่วยงาน</th>
        <th>ติดต่อ</th>
        <th>บทบาท</th>
        <th>สถานะ</th>
        <th>การอนุมัติ</th>
      </template>

      <!-- Table Row Content -->
      <template #row="{ item: user, index }">
        <td>
          <div class="user-avatar-wrapper">
            <img
              v-if="user.profile_image"
              :src="getProfileImageUrl(user.profile_image)"
              :alt="`${user.first_name} ${user.last_name}`"
              class="user-avatar"
              @error="handleImageError"
            />
            <div v-else class="avatar-circle">
              {{ getInitials(user.first_name, user.last_name) }}
            </div>
          </div>
        </td>
        <td>
          <div class="d-flex align-items-center">
            <div>
              <div class="fw-medium">
                <span v-if="user.rank" class="text-muted me-1">{{ user.rank }}</span>
                {{ user.first_name }} {{ user.last_name }}
              </div>
              <small class="text-muted">@{{ user.username }}</small>
            </div>
          </div>
        </td>
        <td>
          <span v-if="user.position" class="badge bg-light text-dark">
            {{ user.position }}
          </span>
          <span v-else class="text-muted">-</span>
        </td>
        <td>
          <span v-if="user.department" class="badge bg-secondary">
            {{ user.department }}
          </span>
          <span v-else class="text-muted">-</span>
        </td>
        <td>
          <div class="contact-info">
            <div v-if="user.email">
              <i class="bi bi-envelope me-1"></i>
              <small>{{ user.email }}</small>
            </div>
            <div v-if="user.phone">
              <i class="bi bi-telephone me-1"></i>
              <small>{{ user.phone }}</small>
            </div>
          </div>
        </td>
        <td>
          <span
            class="badge"
            :class="{
              'bg-danger': user.role === 'Admin',
              'bg-warning': user.role === 'Reviewer',
              'bg-info': user.role === 'Surveyor'
            }"
          >
            {{ getRoleText(user.role) }}
          </span>
        </td>
        <td>
          <div class="form-check form-switch">
            <input
              class="form-check-input"
              type="checkbox"
              :id="`status-${user.user_id}`"
              :checked="user.is_active"
              @change="toggleUserStatus(user)"
            />
            <label class="form-check-label" :for="`status-${user.user_id}`">
              <span class="badge" :class="user.is_active ? 'bg-success' : 'bg-secondary'">
                {{ user.is_active ? 'ใช้งาน' : 'ปิดใช้งาน' }}
              </span>
            </label>
          </div>
        </td>
        <td>
          <span
            class="badge"
            :class="{
              'bg-success': user.approval_status === 'approved',
              'bg-warning': user.approval_status === 'pending',
              'bg-danger': user.approval_status === 'rejected'
            }"
          >
            {{ getApprovalStatusText(user.approval_status) }}
          </span>
        </td>
      </template>

      <!-- Actions Column -->
      <template #actions="{ item: user }">
        <div class="btn-group btn-group-sm">
          <router-link
            :to="`/users/${user.user_id}`"
            class="btn btn-outline-primary"
            title="ดูรายละเอียด"
          >
            <i class="bi bi-eye"></i>
          </router-link>
          <router-link
            :to="`/users/${user.user_id}/edit`"
            class="btn btn-outline-warning"
            title="แก้ไข"
          >
            <i class="bi bi-pencil"></i>
          </router-link>
          <button
            class="btn btn-outline-danger"
            title="ลบ"
            @click="showDeleteConfirmation(user)"
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
              <i class="bi bi-toggle-on me-1"></i>
              เปลี่ยนสถานะ
            </button>
            <ul class="dropdown-menu">
              <li>
                <button
                  class="dropdown-item"
                  @click="handleBulkStatusChange(selectedItems, true)"
                >
                  <i class="bi bi-check-circle me-2 text-success"></i>
                  เปิดใช้งาน
                </button>
              </li>
              <li>
                <button
                  class="dropdown-item"
                  @click="handleBulkStatusChange(selectedItems, false)"
                >
                  <i class="bi bi-x-circle me-2 text-secondary"></i>
                  ปิดใช้งาน
                </button>
              </li>
              <li><hr class="dropdown-divider"></li>
              <li>
                <button
                  class="dropdown-item"
                  @click="handleBulkApprovalChange(selectedItems, 'approved')"
                >
                  <i class="bi bi-check-circle me-2 text-success"></i>
                  อนุมัติ
                </button>
              </li>
              <li>
                <button
                  class="dropdown-item"
                  @click="handleBulkApprovalChange(selectedItems, 'rejected')"
                >
                  <i class="bi bi-x-circle me-2 text-danger"></i>
                  ปฏิเสธ
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

    <!-- Toast Container -->
    <div class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 1055">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast show"
        :class="getToastClass(toast.type)"
        role="alert"
        @mouseenter="pauseToast(toast.id)"
        @mouseleave="resumeToast(toast.id)"
      >
        <div class="toast-header">
          <i class="me-2" :class="getToastIcon(toast.type)"></i>
          <strong class="me-auto">{{ getToastTitle(toast.type) }}</strong>
          <button
            type="button"
            class="btn-close"
            @click="removeToast(toast.id)"
          ></button>
        </div>
        <div class="toast-body">
          {{ toast.message }}
        </div>
        <div class="toast-progress">
          <div
            class="toast-progress-bar"
            :class="getProgressBarClass(toast.type)"
            :style="{ width: toast.progress + '%' }"
          ></div>
        </div>
      </div>
    </div>

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
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import userService from '@/services/userService'
import EnhancedDataTable from '@/components/common/EnhancedDataTable.vue'

export default {
  name: 'UserList',
  components: {
    EnhancedDataTable
  },
  setup() {
    const router = useRouter()
    
    // Reactive data
    const loading = ref(false)
    const users = ref([])
    const searchQuery = ref('')
    const selectedRole = ref('')
    const selectedStatus = ref('')
    const selectedDepartment = ref('')
    const selectedApprovalStatus = ref('')
    const currentPage = ref(1)
    const totalPages = ref(1)
    const totalUsers = ref(0)
    const itemsPerPage = ref(20)
    const toasts = ref([])
    const confirmationTitle = ref('')
    const confirmationMessage = ref('')
    const confirmationBtnText = ref('')
    const confirmationBtnClass = ref('')
    const confirmedAction = ref(null)
    const selectedUsers = ref([])

    // Computed properties
    const uniqueDepartments = computed(() => {
      const departments = users.value
        .map((user) => user.department)
        .filter((dept) => dept && dept.trim() !== "")
      return [...new Set(departments)].sort()
    })

    const activeUsers = computed(() => {
      return users.value.filter((user) => user.is_active).length
    })

    const inactiveUsers = computed(() => {
      return users.value.filter((user) => !user.is_active).length
    })

    const adminUsers = computed(() => {
      return users.value.filter((user) => user.role === 'Admin').length
    })

    const reviewerUsers = computed(() => {
      return users.value.filter((user) => user.role === 'Reviewer').length
    })

    const surveyorUsers = computed(() => {
      return users.value.filter((user) => user.role === 'Surveyor').length
    })

    const pendingUsers = computed(() => {
      return users.value.filter((user) => user.approval_status === 'pending').length
    })

    const approvedUsers = computed(() => {
      return users.value.filter((user) => user.approval_status === 'approved').length
    })

    const rejectedUsers = computed(() => {
      return users.value.filter((user) => user.approval_status === 'rejected').length
    })

    // Methods
    const loadUsers = async () => {
      try {
        loading.value = true
        
        const params = {
          page: currentPage.value,
          limit: itemsPerPage.value,
          search: searchQuery.value,
          role: selectedRole.value,
          status: selectedStatus.value,
          approvalStatus: selectedApprovalStatus.value,
          department: selectedDepartment.value,
        }

        const response = await userService.getUsers(params)
        
        if (response.success || response.data) {
          const userData = response.data || response
          users.value = userData.users || userData || []
          totalPages.value = userData.pagination?.totalPages || Math.ceil((userData.total || users.value.length) / itemsPerPage.value) || 1
          totalUsers.value = userData.pagination?.totalRecords || userData.total || users.value.length

          // Ensure all users have valid IDs
          users.value = users.value.map((user, index) => {
            if (!user.user_id) {
              user.user_id = user.id || `temp_${index}_${Date.now()}`
            }
            return user
          })
        }
      } catch (error) {
        console.error('Error loading users:', error)
        showToast('เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้', 'error')
      } finally {
        loading.value = false
      }
    }

    const changePage = (page) => {
      currentPage.value = page
      loadUsers()
    }

    const updateItemsPerPage = (newItemsPerPage) => {
      itemsPerPage.value = newItemsPerPage
      currentPage.value = 1
      loadUsers()
    }

    const handleSearch = () => {
      currentPage.value = 1
      loadUsers()
    }

    const handleFilter = () => {
      currentPage.value = 1
      loadUsers()
    }

    const clearSearch = () => {
      searchQuery.value = ''
      handleSearch()
    }

    const refreshUsers = () => {
      loadUsers()
    }

    const toggleUserStatus = async (user) => {
      try {
        const newStatus = !user.is_active
        await userService.updateUserStatus(user.user_id, { is_active: newStatus })
        user.is_active = newStatus
        showToast(
          `${newStatus ? 'เปิด' : 'ปิด'}ใช้งานผู้ใช้ "${user.first_name} ${user.last_name}" สำเร็จ`,
          'success'
        )
      } catch (error) {
        console.error('Error toggling user status:', error)
        showToast('เกิดข้อผิดพลาดในการเปลี่ยนสถานะผู้ใช้', 'error')
      }
    }

    const showDeleteConfirmation = (user) => {
      confirmationTitle.value = 'ยืนยันการลบผู้ใช้'
      confirmationMessage.value = `คุณต้องการลบผู้ใช้ "${user.first_name} ${user.last_name}" หรือไม่?`
      confirmationBtnText.value = 'ลบ'
      confirmationBtnClass.value = 'btn-danger'
      confirmedAction.value = () => deleteUser(user)
      showConfirmationModal()
    }

    const deleteUser = async (user) => {
      try {
        await userService.deleteUser(user.user_id)
        users.value = users.value.filter(u => u.user_id !== user.user_id)
        totalUsers.value--
        showToast(`ลบผู้ใช้ "${user.first_name} ${user.last_name}" สำเร็จ`, 'success')
        hideConfirmationModal()
      } catch (error) {
        console.error('Error deleting user:', error)
        showToast('เกิดข้อผิดพลาดในการลบผู้ใช้', 'error')
      }
    }

    const handleBulkEdit = (items) => {
      // TODO: Implement bulk edit functionality
      showToast(`เลือกแก้ไข ${items.length} รายการ`, 'info')
    }

    const handleBulkStatusChange = async (items, status) => {
      try {
        const promises = items.map(user => 
          userService.updateUserStatus(user.user_id, { is_active: status })
        )
        await Promise.all(promises)
        
        // Update local data
        items.forEach(user => {
          const localUser = users.value.find(u => u.user_id === user.user_id)
          if (localUser) {
            localUser.is_active = status
          }
        })
        
        showToast(
          `${status ? 'เปิด' : 'ปิด'}ใช้งาน ${items.length} ผู้ใช้สำเร็จ`,
          'success'
        )
      } catch (error) {
        console.error('Error bulk status change:', error)
        showToast('เกิดข้อผิดพลาดในการเปลี่ยนสถานะผู้ใช้', 'error')
      }
    }

    const handleBulkApprovalChange = async (items, status) => {
      try {
        const promises = items.map(user => 
          userService.updateUserApproval(user.user_id, { approval_status: status })
        )
        await Promise.all(promises)
        
        // Update local data
        items.forEach(user => {
          const localUser = users.value.find(u => u.user_id === user.user_id)
          if (localUser) {
            localUser.approval_status = status
          }
        })
        
        showToast(`${getApprovalStatusText(status)} ${items.length} ผู้ใช้สำเร็จ`, 'success')
      } catch (error) {
        console.error('Error bulk approval change:', error)
        showToast('เกิดข้อผิดพลาดในการเปลี่ยนสถานะการอนุมัติ', 'error')
      }
    }

    const handleBulkDelete = (items) => {
      confirmationTitle.value = 'ยืนยันการลบผู้ใช้หลายรายการ'
      confirmationMessage.value = `คุณต้องการลบผู้ใช้ ${items.length} รายการหรือไม่?`
      confirmationBtnText.value = 'ลบทั้งหมด'
      confirmationBtnClass.value = 'btn-danger'
      confirmedAction.value = () => bulkDeleteUsers(items)
      showConfirmationModal()
    }

    const bulkDeleteUsers = async (items) => {
      try {
        const promises = items.map(user => userService.deleteUser(user.user_id))
        await Promise.all(promises)
        
        const deletedIds = items.map(user => user.user_id)
        users.value = users.value.filter(user => !deletedIds.includes(user.user_id))
        totalUsers.value -= items.length
        
        showToast(`ลบ ${items.length} ผู้ใช้สำเร็จ`, 'success')
        hideConfirmationModal()
      } catch (error) {
        console.error('Error bulk deleting users:', error)
        showToast('เกิดข้อผิดพลาดในการลบผู้ใช้', 'error')
      }
    }

    const handleSelectionChange = (selected) => {
      selectedUsers.value = selected
    }

    // Helper methods
    const getRoleText = (role) => {
      const roleMap = {
        'Admin': 'ผู้ดูแล',
        'Reviewer': 'ผู้ตรวจ',
        'Surveyor': 'ผู้สำรวจ'
      }
      return roleMap[role] || role
    }

    const getApprovalStatusText = (status) => {
      const statusMap = {
        'pending': 'รออนุมัติ',
        'approved': 'อนุมัติแล้ว',
        'rejected': 'ปฏิเสธ'
      }
      return statusMap[status] || status
    }

    const getInitials = (firstName, lastName) => {
      const first = firstName ? firstName.charAt(0).toUpperCase() : ''
      const last = lastName ? lastName.charAt(0).toUpperCase() : ''
      return first + last
    }

    const getProfileImageUrl = (imagePath) => {
      return `${import.meta.env.VITE_API_BASE_URL}/uploads/profiles/${imagePath}`
    }

    const handleImageError = (event) => {
      event.target.style.display = 'none'
    }

    // Toast methods
    const showToast = (message, type = 'info', duration = 4000) => {
      const id = Date.now()
      const toast = {
        id,
        message,
        type,
        duration,
        progress: 100,
        isPaused: false
      }
      
      toasts.value.push(toast)
      
      const updateProgress = () => {
        if (!toast.isPaused && toast.progress > 0) {
          toast.progress -= (100 / duration) * 100
          setTimeout(updateProgress, 100)
        } else if (toast.progress <= 0) {
          removeToast(id)
        }
      }
      
      setTimeout(updateProgress, 100)
    }

    const removeToast = (id) => {
      const index = toasts.value.findIndex(toast => toast.id === id)
      if (index > -1) {
        toasts.value.splice(index, 1)
      }
    }

    const pauseToast = (id) => {
      const toast = toasts.value.find(t => t.id === id)
      if (toast) {
        toast.isPaused = true
      }
    }

    const resumeToast = (id) => {
      const toast = toasts.value.find(t => t.id === id)
      if (toast) {
        toast.isPaused = false
      }
    }

    const getToastClass = (type) => {
      const classes = {
        'success': 'border-success',
        'error': 'border-danger',
        'warning': 'border-warning',
        'info': 'border-info'
      }
      return classes[type] || 'border-info'
    }

    const getToastIcon = (type) => {
      const icons = {
        'success': 'bi bi-check-circle-fill text-success',
        'error': 'bi bi-exclamation-triangle-fill text-danger',
        'warning': 'bi bi-exclamation-triangle-fill text-warning',
        'info': 'bi bi-info-circle-fill text-info'
      }
      return icons[type] || 'bi bi-info-circle-fill text-info'
    }

    const getToastTitle = (type) => {
      const titles = {
        'success': 'สำเร็จ',
        'error': 'ผิดพลาด',
        'warning': 'คำเตือน',
        'info': 'ข้อมูล'
      }
      return titles[type] || 'ข้อมูล'
    }

    const getProgressBarClass = (type) => {
      const classes = {
        'success': 'bg-success',
        'error': 'bg-danger',
        'warning': 'bg-warning',
        'info': 'bg-info'
      }
      return classes[type] || 'bg-info'
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
    onMounted(() => {
      loadUsers()
    })

    return {
      // Data
      loading,
      users,
      searchQuery,
      selectedRole,
      selectedStatus,
      selectedDepartment,
      selectedApprovalStatus,
      currentPage,
      totalPages,
      totalUsers,
      itemsPerPage,
      toasts,
      confirmationTitle,
      confirmationMessage,
      confirmationBtnText,
      confirmationBtnClass,
      selectedUsers,
      
      // Computed
      uniqueDepartments,
      activeUsers,
      inactiveUsers,
      adminUsers,
      reviewerUsers,
      surveyorUsers,
      pendingUsers,
      approvedUsers,
      rejectedUsers,
      
      // Methods
      loadUsers,
      changePage,
      updateItemsPerPage,
      handleSearch,
      handleFilter,
      clearSearch,
      refreshUsers,
      toggleUserStatus,
      showDeleteConfirmation,
      deleteUser,
      handleBulkEdit,
      handleBulkStatusChange,
      handleBulkApprovalChange,
      handleBulkDelete,
      handleSelectionChange,
      getRoleText,
      getApprovalStatusText,
      getInitials,
      getProfileImageUrl,
      handleImageError,
      showToast,
      removeToast,
      pauseToast,
      resumeToast,
      getToastClass,
      getToastIcon,
      getToastTitle,
      getProgressBarClass,
      executeConfirmedAction
    }
  }
}
</script>

<style scoped>
.user-list {
  max-width: 100%;
  margin: 0 auto;
}

.user-header {
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
  min-width: 60px;
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

.stat-separator {
  width: 1px;
  height: 40px;
  background: #dee2e6;
  margin: 0 0.5rem;
}

.user-avatar-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e9ecef;
}

.avatar-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 0.875rem;
}

.contact-info div {
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.contact-info div:last-child {
  margin-bottom: 0;
}

.toast-container .toast {
  min-width: 300px;
  max-width: 400px;
  border-width: 2px;
}

.toast-progress {
  height: 3px;
  background: rgba(0,0,0,0.1);
  position: relative;
  overflow: hidden;
}

.toast-progress-bar {
  height: 100%;
  transition: width 0.1s linear;
}

@media (max-width: 768px) {
  .stats-row {
    justify-content: center;
  }
  
  .stat-separator {
    display: none;
  }
  
  .user-header .d-flex {
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
