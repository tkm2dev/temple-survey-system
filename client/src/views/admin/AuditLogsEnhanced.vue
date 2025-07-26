<template>
  <div class="audit-logs">
    <!-- Header Section -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="mb-1">Audit Logs</h2>
        <p class="text-muted mb-0">Monitor and track system activities</p>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-outline-primary" @click="refreshData">
          <i class="fas fa-sync-alt me-2"></i>Refresh
        </button>
        <button class="btn btn-outline-success" @click="exportLogs">
          <i class="fas fa-download me-2"></i>Export
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
                  <i class="fas fa-clipboard-list text-primary"></i>
                </div>
              </div>
              <div class="flex-grow-1 ms-3">
                <div class="fw-bold h4 mb-0">{{ statistics.total || 0 }}</div>
                <div class="text-muted">Total Logs</div>
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
                  <i class="fas fa-plus-circle text-success"></i>
                </div>
              </div>
              <div class="flex-grow-1 ms-3">
                <div class="fw-bold h4 mb-0">{{ statistics.creates || 0 }}</div>
                <div class="text-muted">Creates</div>
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
                  <i class="fas fa-edit text-warning"></i>
                </div>
              </div>
              <div class="flex-grow-1 ms-3">
                <div class="fw-bold h4 mb-0">{{ statistics.updates || 0 }}</div>
                <div class="text-muted">Updates</div>
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
                <div class="bg-danger bg-opacity-10 p-3 rounded">
                  <i class="fas fa-trash text-danger"></i>
                </div>
              </div>
              <div class="flex-grow-1 ms-3">
                <div class="fw-bold h4 mb-0">{{ statistics.deletes || 0 }}</div>
                <div class="text-muted">Deletes</div>
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
                placeholder="Search logs..."
                v-model="searchTerm"
                @input="debouncedSearch"
              />
            </div>
          </div>
          <div class="col-md-2">
            <label class="form-label">Action</label>
            <select class="form-select" v-model="selectedAction" @change="applyFilters">
              <option value="">All Actions</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
              <option value="BULK_UPDATE">Bulk Update</option>
              <option value="BULK_DELETE">Bulk Delete</option>
              <option value="LOGIN">Login</option>
              <option value="LOGOUT">Logout</option>
            </select>
          </div>
          <div class="col-md-2">
            <label class="form-label">Table</label>
            <select class="form-select" v-model="selectedTable" @change="applyFilters">
              <option value="">All Tables</option>
              <option v-for="table in tables" :key="table" :value="table">
                {{ formatTableName(table) }}
              </option>
            </select>
          </div>
          <div class="col-md-2">
            <label class="form-label">User</label>
            <select class="form-select" v-model="selectedUser" @change="applyFilters">
              <option value="">All Users</option>
              <option v-for="user in users" :key="user.id" :value="user.id">
                {{ user.name }}
              </option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Date Range</label>
            <div class="d-flex gap-2">
              <input
                type="date"
                class="form-control"
                v-model="dateFrom"
                @change="applyFilters"
              />
              <input
                type="date"
                class="form-control"
                v-model="dateTo"
                @change="applyFilters"
              />
            </div>
          </div>
        </div>
        <div class="row mt-3">
          <div class="col-md-12">
            <button class="btn btn-outline-secondary me-2" @click="clearFilters">
              <i class="fas fa-times me-1"></i>Clear Filters
            </button>
            <button class="btn btn-outline-info" @click="showAdvancedFilters = !showAdvancedFilters">
              <i class="fas fa-sliders-h me-1"></i>Advanced Filters
            </button>
          </div>
        </div>
        
        <!-- Advanced Filters -->
        <div v-if="showAdvancedFilters" class="row mt-3 pt-3 border-top">
          <div class="col-md-3">
            <label class="form-label">IP Address</label>
            <input
              type="text"
              class="form-control"
              placeholder="e.g., 192.168.1.1"
              v-model="selectedIp"
              @input="debouncedSearch"
            />
          </div>
          <div class="col-md-3">
            <label class="form-label">Record ID</label>
            <input
              type="number"
              class="form-control"
              placeholder="Record ID"
              v-model="selectedRecordId"
              @input="debouncedSearch"
            />
          </div>
          <div class="col-md-3">
            <label class="form-label">Time Range</label>
            <select class="form-select" v-model="selectedTimeRange" @change="applyTimeRange">
              <option value="">All Time</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Sort By</label>
            <select class="form-select" v-model="sortBy" @change="applyFilters">
              <option value="created_at">Date</option>
              <option value="action">Action</option>
              <option value="table_name">Table</option>
              <option value="user_name">User</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Enhanced Data Table -->
    <div class="card">
      <div class="card-body p-0">
        <EnhancedDataTable
          :data="auditLogs"
          :columns="tableColumns"
          :loading="loading"
          :totalItems="totalItems"
          :currentPage="currentPage"
          :itemsPerPage="itemsPerPage"
          :selectedItems="selectedItems"
          :showBulkActions="false"
          @update:currentPage="currentPage = $event"
          @update:itemsPerPage="itemsPerPage = $event"
          @update:selectedItems="selectedItems = $event"
          @refresh="refreshData"
          emptyMessage="No audit logs found"
          emptyIcon="fas fa-clipboard-list"
        >
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
                <th>Timestamp</th>
                <th>User</th>
                <th>Action</th>
                <th>Table</th>
                <th>Record ID</th>
                <th>Changes</th>
                <th>IP Address</th>
                <th width="100">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="log in auditLogs"
                :key="log.id"
                :class="{ 'table-active': selectedItems.includes(log.id) }"
              >
                <td>
                  <input
                    type="checkbox"
                    class="form-check-input"
                    :value="log.id"
                    v-model="selectedItems"
                  />
                </td>
                <td>
                  <div class="fw-medium">{{ formatDateTime(log.created_at) }}</div>
                  <small class="text-muted">{{ formatRelativeTime(log.created_at) }}</small>
                </td>
                <td>
                  <div class="d-flex align-items-center">
                    <div class="avatar-sm bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2">
                      {{ getInitials(log.user_name) }}
                    </div>
                    <div>
                      <div class="fw-medium">{{ log.user_name }}</div>
                      <small class="text-muted">{{ log.user_email }}</small>
                    </div>
                  </div>
                </td>
                <td>
                  <span 
                    class="badge" 
                    :class="getActionBadgeClass(log.action)"
                  >
                    <i :class="getActionIcon(log.action)" class="me-1"></i>
                    {{ log.action }}
                  </span>
                </td>
                <td>
                  <span class="badge bg-secondary">
                    {{ formatTableName(log.table_name) }}
                  </span>
                </td>
                <td>
                  <code class="text-info">{{ log.record_id || 'N/A' }}</code>
                </td>
                <td>
                  <div class="changes-summary">
                    <button
                      v-if="hasChanges(log)"
                      class="btn btn-sm btn-outline-info"
                      @click="viewChanges(log)"
                      :title="'View changes for ' + log.action"
                    >
                      <i class="fas fa-eye me-1"></i>
                      View Changes
                    </button>
                    <span v-else class="text-muted">No changes</span>
                  </div>
                </td>
                <td>
                  <code class="text-muted">{{ log.ip_address || 'N/A' }}</code>
                </td>
                <td>
                  <button
                    class="btn btn-sm btn-outline-primary"
                    @click="viewDetails(log)"
                    :title="'View details for log #' + log.id"
                  >
                    <i class="fas fa-info-circle"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </template>
        </EnhancedDataTable>
      </div>
    </div>

    <!-- Log Details Modal -->
    <div class="modal fade" id="logDetailsModal" tabindex="-1" ref="logDetailsModal">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-info-circle me-2"></i>
              Audit Log Details
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body" v-if="selectedLog">
            <div class="row">
              <div class="col-md-6">
                <div class="card border-0 bg-light">
                  <div class="card-body">
                    <h6 class="card-title">
                      <i class="fas fa-info text-primary me-2"></i>Basic Information
                    </h6>
                    <table class="table table-sm table-borderless">
                      <tr>
                        <td class="fw-medium">Log ID:</td>
                        <td><code>{{ selectedLog.id }}</code></td>
                      </tr>
                      <tr>
                        <td class="fw-medium">Timestamp:</td>
                        <td>{{ formatDateTime(selectedLog.created_at) }}</td>
                      </tr>
                      <tr>
                        <td class="fw-medium">User:</td>
                        <td>{{ selectedLog.user_name }} ({{ selectedLog.user_email }})</td>
                      </tr>
                      <tr>
                        <td class="fw-medium">Action:</td>
                        <td>
                          <span class="badge" :class="getActionBadgeClass(selectedLog.action)">
                            {{ selectedLog.action }}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td class="fw-medium">Table:</td>
                        <td><code>{{ selectedLog.table_name }}</code></td>
                      </tr>
                      <tr>
                        <td class="fw-medium">Record ID:</td>
                        <td><code>{{ selectedLog.record_id || 'N/A' }}</code></td>
                      </tr>
                      <tr>
                        <td class="fw-medium">IP Address:</td>
                        <td><code>{{ selectedLog.ip_address || 'N/A' }}</code></td>
                      </tr>
                    </table>
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="card border-0 bg-light">
                  <div class="card-body">
                    <h6 class="card-title">
                      <i class="fas fa-exchange-alt text-warning me-2"></i>Changes Summary
                    </h6>
                    <div v-if="!hasChanges(selectedLog)" class="text-muted">
                      No changes recorded for this action.
                    </div>
                    <div v-else>
                      <div v-if="selectedLog.old_values" class="mb-3">
                        <h6 class="text-danger">
                          <i class="fas fa-minus-circle me-1"></i>Old Values
                        </h6>
                        <pre class="bg-danger bg-opacity-10 p-2 rounded"><code>{{ formatJson(selectedLog.old_values) }}</code></pre>
                      </div>
                      <div v-if="selectedLog.new_values">
                        <h6 class="text-success">
                          <i class="fas fa-plus-circle me-1"></i>New Values
                        </h6>
                        <pre class="bg-success bg-opacity-10 p-2 rounded"><code>{{ formatJson(selectedLog.new_values) }}</code></pre>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Changes Modal -->
    <div class="modal fade" id="changesModal" tabindex="-1" ref="changesModal">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-exchange-alt me-2"></i>
              Changes Details
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body" v-if="selectedLog">
            <div class="row">
              <div class="col-md-6" v-if="selectedLog.old_values">
                <h6 class="text-danger">
                  <i class="fas fa-minus-circle me-1"></i>Before (Old Values)
                </h6>
                <div class="bg-danger bg-opacity-10 p-3 rounded">
                  <pre><code>{{ formatJson(selectedLog.old_values) }}</code></pre>
                </div>
              </div>
              <div class="col-md-6" v-if="selectedLog.new_values">
                <h6 class="text-success">
                  <i class="fas fa-plus-circle me-1"></i>After (New Values)
                </h6>
                <div class="bg-success bg-opacity-10 p-3 rounded">
                  <pre><code>{{ formatJson(selectedLog.new_values) }}</code></pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, nextTick, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/composables/useToast';
import EnhancedDataTable from '@/components/common/EnhancedDataTable.vue';
import auditService from '@/services/auditService';
import { debounce } from 'lodash';
import { Modal } from 'bootstrap';

export default {
  name: 'AuditLogsEnhanced',
  components: {
    EnhancedDataTable,
  },
  setup() {
    const authStore = useAuthStore();
    const { showToast } = useToast();

    // Reactive data
    const auditLogs = ref([]);
    const loading = ref(false);
    const totalItems = ref(0);
    const currentPage = ref(1);
    const itemsPerPage = ref(10);
    const selectedItems = ref([]);
    const statistics = ref({});
    const tables = ref([]);
    const users = ref([]);
    const selectedLog = ref(null);
    const showAdvancedFilters = ref(false);

    // Filter states
    const searchTerm = ref('');
    const selectedAction = ref('');
    const selectedTable = ref('');
    const selectedUser = ref('');
    const selectedIp = ref('');
    const selectedRecordId = ref('');
    const selectedTimeRange = ref('');
    const dateFrom = ref('');
    const dateTo = ref('');
    const sortBy = ref('created_at');

    // Modal refs
    const logDetailsModal = ref(null);
    const changesModal = ref(null);

    // Table columns
    const tableColumns = [
      { key: 'created_at', label: 'Timestamp', sortable: true },
      { key: 'user_name', label: 'User', sortable: true },
      { key: 'action', label: 'Action', sortable: true },
      { key: 'table_name', label: 'Table', sortable: true },
      { key: 'record_id', label: 'Record ID' },
      { key: 'ip_address', label: 'IP Address' },
    ];

    // Computed properties
    const hasPermission = computed(() => (permission) => {
      return authStore.hasPermission(permission);
    });

    const isAllSelected = computed(() => {
      return auditLogs.value.length > 0 && selectedItems.value.length === auditLogs.value.length;
    });

    const isPartiallySelected = computed(() => {
      return selectedItems.value.length > 0 && selectedItems.value.length < auditLogs.value.length;
    });

    // Methods
    const loadAuditLogs = async () => {
      try {
        loading.value = true;
        const params = {
          page: currentPage.value,
          limit: itemsPerPage.value,
          search: searchTerm.value,
          action: selectedAction.value,
          table_name: selectedTable.value,
          user_id: selectedUser.value,
          ip_address: selectedIp.value,
          record_id: selectedRecordId.value,
          date_from: dateFrom.value,
          date_to: dateTo.value,
          sort: sortBy.value,
        };

        const response = await auditService.getAuditLogs(params);
        auditLogs.value = response.data;
        totalItems.value = response.total;
      } catch (error) {
        console.error('Error loading audit logs:', error);
        showToast('Failed to load audit logs', 'error');
      } finally {
        loading.value = false;
      }
    };

    const loadStatistics = async () => {
      try {
        const response = await auditService.getStatistics();
        statistics.value = response;
      } catch (error) {
        console.error('Error loading statistics:', error);
      }
    };

    const loadTables = async () => {
      try {
        const response = await auditService.getTables();
        tables.value = response;
      } catch (error) {
        console.error('Error loading tables:', error);
      }
    };

    const loadUsers = async () => {
      try {
        const response = await auditService.getUsers();
        users.value = response;
      } catch (error) {
        console.error('Error loading users:', error);
      }
    };

    const refreshData = async () => {
      selectedItems.value = [];
      await Promise.all([
        loadAuditLogs(),
        loadStatistics(),
        loadTables(),
        loadUsers()
      ]);
    };

    const debouncedSearch = debounce(() => {
      currentPage.value = 1;
      loadAuditLogs();
    }, 300);

    const applyFilters = () => {
      currentPage.value = 1;
      loadAuditLogs();
    };

    const applyTimeRange = () => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      switch (selectedTimeRange.value) {
        case 'today':
          dateFrom.value = today.toISOString().split('T')[0];
          dateTo.value = now.toISOString().split('T')[0];
          break;
        case 'yesterday':
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          dateFrom.value = yesterday.toISOString().split('T')[0];
          dateTo.value = yesterday.toISOString().split('T')[0];
          break;
        case 'week':
          const weekStart = new Date(today);
          weekStart.setDate(weekStart.getDate() - weekStart.getDay());
          dateFrom.value = weekStart.toISOString().split('T')[0];
          dateTo.value = now.toISOString().split('T')[0];
          break;
        case 'month':
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          dateFrom.value = monthStart.toISOString().split('T')[0];
          dateTo.value = now.toISOString().split('T')[0];
          break;
        case 'quarter':
          const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
          dateFrom.value = quarterStart.toISOString().split('T')[0];
          dateTo.value = now.toISOString().split('T')[0];
          break;
        default:
          dateFrom.value = '';
          dateTo.value = '';
      }
      applyFilters();
    };

    const clearFilters = () => {
      searchTerm.value = '';
      selectedAction.value = '';
      selectedTable.value = '';
      selectedUser.value = '';
      selectedIp.value = '';
      selectedRecordId.value = '';
      selectedTimeRange.value = '';
      dateFrom.value = '';
      dateTo.value = '';
      sortBy.value = 'created_at';
      currentPage.value = 1;
      loadAuditLogs();
    };

    const toggleSelectAll = () => {
      if (isAllSelected.value) {
        selectedItems.value = [];
      } else {
        selectedItems.value = auditLogs.value.map(log => log.id);
      }
    };

    const viewDetails = (log) => {
      selectedLog.value = log;
      const modal = new Modal(logDetailsModal.value);
      modal.show();
    };

    const viewChanges = (log) => {
      selectedLog.value = log;
      const modal = new Modal(changesModal.value);
      modal.show();
    };

    const exportLogs = async () => {
      try {
        const params = {
          search: searchTerm.value,
          action: selectedAction.value,
          table_name: selectedTable.value,
          user_id: selectedUser.value,
          ip_address: selectedIp.value,
          record_id: selectedRecordId.value,
          date_from: dateFrom.value,
          date_to: dateTo.value,
        };

        const response = await auditService.exportLogs(params);
        
        // Create download link
        const blob = new Blob([response], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'audit-logs-export.csv';
        link.click();
        window.URL.revokeObjectURL(url);
        
        showToast('Audit logs exported successfully', 'success');
      } catch (error) {
        console.error('Error exporting audit logs:', error);
        showToast('Failed to export audit logs', 'error');
      }
    };

    const formatDateTime = (dateString) => {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    };

    const formatRelativeTime = (dateString) => {
      const now = new Date();
      const date = new Date(dateString);
      const diffMs = now - date;
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSecs < 60) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return formatDateTime(dateString);
    };

    const formatTableName = (tableName) => {
      return tableName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const getInitials = (name) => {
      if (!name) return '??';
      return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    const getActionBadgeClass = (action) => {
      const classes = {
        'CREATE': 'bg-success',
        'UPDATE': 'bg-warning',
        'DELETE': 'bg-danger',
        'BULK_UPDATE': 'bg-info',
        'BULK_DELETE': 'bg-danger',
        'LOGIN': 'bg-primary',
        'LOGOUT': 'bg-secondary',
      };
      return classes[action] || 'bg-secondary';
    };

    const getActionIcon = (action) => {
      const icons = {
        'CREATE': 'fas fa-plus',
        'UPDATE': 'fas fa-edit',
        'DELETE': 'fas fa-trash',
        'BULK_UPDATE': 'fas fa-edit',
        'BULK_DELETE': 'fas fa-trash-alt',
        'LOGIN': 'fas fa-sign-in-alt',
        'LOGOUT': 'fas fa-sign-out-alt',
      };
      return icons[action] || 'fas fa-question';
    };

    const hasChanges = (log) => {
      return log.old_values || log.new_values;
    };

    const formatJson = (jsonString) => {
      try {
        const obj = JSON.parse(jsonString);
        return JSON.stringify(obj, null, 2);
      } catch {
        return jsonString;
      }
    };

    // Watchers
    watch([currentPage, itemsPerPage], () => {
      loadAuditLogs();
    });

    // Lifecycle
    onMounted(() => {
      refreshData();
    });

    return {
      // Data
      auditLogs,
      loading,
      totalItems,
      currentPage,
      itemsPerPage,
      selectedItems,
      statistics,
      tables,
      users,
      selectedLog,
      showAdvancedFilters,
      searchTerm,
      selectedAction,
      selectedTable,
      selectedUser,
      selectedIp,
      selectedRecordId,
      selectedTimeRange,
      dateFrom,
      dateTo,
      sortBy,
      logDetailsModal,
      changesModal,
      tableColumns,

      // Computed
      hasPermission,
      isAllSelected,
      isPartiallySelected,

      // Methods
      refreshData,
      debouncedSearch,
      applyFilters,
      applyTimeRange,
      clearFilters,
      toggleSelectAll,
      viewDetails,
      viewChanges,
      exportLogs,
      formatDateTime,
      formatRelativeTime,
      formatTableName,
      getInitials,
      getActionBadgeClass,
      getActionIcon,
      hasChanges,
      formatJson,
    };
  },
};
</script>

<style scoped>
.audit-logs {
  padding: 1rem;
}

.table-active {
  background-color: var(--bs-primary-bg-subtle) !important;
}

.avatar-sm {
  width: 32px;
  height: 32px;
  font-size: 0.75rem;
}

.changes-summary {
  max-width: 200px;
}

.badge {
  font-size: 0.75rem;
}

.card {
  border: none;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  max-height: 300px;
  overflow-y: auto;
  font-size: 0.875rem;
}

code {
  font-size: 0.875rem;
  background-color: var(--bs-gray-100);
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
}

.modal-xl {
  max-width: 1200px;
}

@media (max-width: 768px) {
  .audit-logs {
    padding: 0.5rem;
  }
  
  .d-flex.gap-2 {
    flex-direction: column;
    gap: 0.5rem !important;
  }
  
  .changes-summary {
    max-width: 150px;
  }
  
  .avatar-sm {
    width: 24px;
    height: 24px;
    font-size: 0.6rem;
  }
}
</style>
