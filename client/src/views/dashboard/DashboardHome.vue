<template>
  <div class="dashboard-home">
    <!-- Page Header with Refresh Button -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="h3 mb-1 d-flex align-items-center">
          <i class="bi bi-house-door me-2 text-primary"></i>
          สวัสดี, {{ authStore.userName }}!
        </h1>
        <p class="text-muted mb-0">
          <i class="bi bi-calendar-event me-1"></i>
          ยินดีต้อนรับสู่ระบบสำรวจข้อมูลวัด - {{ currentDate }}
        </p>
      </div>
      <div class="d-flex gap-2">
        <button
          @click="exportDashboard"
          class="btn btn-outline-primary btn-sm"
          :disabled="exporting"
        >
          <i class="bi bi-download me-1"></i>
          <span v-if="exporting">กำลังส่งออก...</span>
          <span v-else>ส่งออกรายงาน</span>
        </button>
        <button
          @click="refreshData"
          class="btn btn-primary btn-sm"
          :disabled="loading"
        >
          <i class="bi bi-arrow-clockwise me-1" :class="{ spin: loading }"></i>
          อัปเดต
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading && !stats.totalSurveys" class="text-center py-5">
      <div class="spinner-border text-primary me-2"></div>
      <span>กำลังโหลดข้อมูล...</span>
    </div>

    <!-- Main Dashboard Content -->
    <div v-else>
      <!-- Primary Stats Cards -->
      <div class="row mb-4">
        <div class="col-12 col-sm-6 col-xl-3 mb-3">
          <div
            class="card stats-card bg-gradient-primary text-white border-0 shadow-sm"
          >
            <div class="card-body position-relative">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <div class="h2 mb-0 fw-bold">
                    {{ formatNumber(stats.totalSurveys) }}
                  </div>
                  <div class="opacity-90">ข้อมูลการสำรวจทั้งหมด</div>
                  <div class="small mt-1">
                    <i class="bi bi-trending-up me-1"></i>
                    +{{ stats.newSurveysThisMonth || 0 }} เดือนนี้
                  </div>
                </div>
                <div class="fs-1 opacity-50">
                  <i class="bi bi-clipboard-data"></i>
                </div>
              </div>
              <div class="progress mt-2" style="height: 4px">
                <div
                  class="progress-bar bg-white"
                  style="width: 100%; opacity: 0.3"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-xl-3 mb-3">
          <div
            class="card stats-card bg-gradient-success text-white border-0 shadow-sm"
          >
            <div class="card-body position-relative">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <div class="h2 mb-0 fw-bold">
                    {{ formatNumber(stats.approvedSurveys) }}
                  </div>
                  <div class="opacity-90">อนุมัติแล้ว</div>
                  <div class="small mt-1">
                    {{
                      getPercentage(stats.approvedSurveys, stats.totalSurveys)
                    }}% ของทั้งหมด
                  </div>
                </div>
                <div class="fs-1 opacity-50">
                  <i class="bi bi-check-circle"></i>
                </div>
              </div>
              <div class="progress mt-2" style="height: 4px">
                <div
                  class="progress-bar bg-white"
                  :style="`width: ${getPercentage(
                    stats.approvedSurveys,
                    stats.totalSurveys
                  )}%; opacity: 0.6;`"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-xl-3 mb-3">
          <div
            class="card stats-card bg-gradient-warning text-dark border-0 shadow-sm"
          >
            <div class="card-body position-relative">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <div class="h2 mb-0 fw-bold">
                    {{ formatNumber(stats.pendingSurveys) }}
                  </div>
                  <div class="opacity-90">รอการตรวจสอบ</div>
                  <div class="small mt-1">
                    <i class="bi bi-clock me-1"></i>
                    ต้องดำเนินการ
                  </div>
                </div>
                <div class="fs-1 opacity-50">
                  <i class="bi bi-clock-history"></i>
                </div>
              </div>
              <div class="progress mt-2" style="height: 4px">
                <div
                  class="progress-bar bg-dark"
                  :style="`width: ${getPercentage(
                    stats.pendingSurveys,
                    stats.totalSurveys
                  )}%; opacity: 0.6;`"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-xl-3 mb-3">
          <div
            class="card stats-card bg-gradient-info text-white border-0 shadow-sm"
          >
            <div class="card-body position-relative">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <div class="h2 mb-0 fw-bold">
                    {{ formatNumber(stats.totalUsers) }}
                  </div>
                  <div class="opacity-90">ผู้ใช้งานทั้งหมด</div>
                  <div class="small mt-1">
                    <i class="bi bi-person-check me-1"></i>
                    {{ stats.activeUsers || 0 }} ออนไลน์
                  </div>
                </div>
                <div class="fs-1 opacity-50">
                  <i class="bi bi-people"></i>
                </div>
              </div>
              <div class="progress mt-2" style="height: 4px">
                <div
                  class="progress-bar bg-white"
                  :style="`width: ${getPercentage(
                    stats.activeUsers,
                    stats.totalUsers
                  )}%; opacity: 0.6;`"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Secondary Stats Row -->
      <div class="row mb-4">
        <div class="col-md-6 col-xl-3 mb-3">
          <div class="card border-start border-primary border-4">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="flex-grow-1">
                  <div class="text-muted small">วันนี้</div>
                  <div class="h5 mb-0">
                    {{ stats.todaySurveys || 0 }} รายการ
                  </div>
                </div>
                <div class="text-primary">
                  <i class="bi bi-calendar-day fs-3"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-6 col-xl-3 mb-3">
          <div class="card border-start border-success border-4">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="flex-grow-1">
                  <div class="text-muted small">สัปดาห์นี้</div>
                  <div class="h5 mb-0">{{ stats.weekSurveys || 0 }} รายการ</div>
                </div>
                <div class="text-success">
                  <i class="bi bi-calendar-week fs-3"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-6 col-xl-3 mb-3">
          <div class="card border-start border-warning border-4">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="flex-grow-1">
                  <div class="text-muted small">เดือนนี้</div>
                  <div class="h5 mb-0">
                    {{ stats.monthSurveys || 0 }} รายการ
                  </div>
                </div>
                <div class="text-warning">
                  <i class="bi bi-calendar-month fs-3"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-6 col-xl-3 mb-3">
          <div class="card border-start border-info border-4">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="flex-grow-1">
                  <div class="text-muted small">อัตราผ่าน</div>
                  <div class="h5 mb-0">{{ stats.completionRate }}%</div>
                </div>
                <div class="text-info">
                  <i class="bi bi-graph-up fs-3"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts and Analytics Row -->
      <div class="row mb-4">
        <div class="col-12 col-lg-8 mb-4">
          <div class="card">
            <div
              class="card-header d-flex justify-content-between align-items-center"
            >
              <h5 class="mb-0">
                <i class="bi bi-graph-up me-2"></i>
                แนวโน้มการสำรวจรายเดือน
              </h5>
              <div class="btn-group btn-group-sm">
                <button
                  @click="setChartPeriod('6months')"
                  class="btn"
                  :class="
                    chartPeriod === '6months'
                      ? 'btn-primary'
                      : 'btn-outline-primary'
                  "
                >
                  6 เดือน
                </button>
                <button
                  @click="setChartPeriod('1year')"
                  class="btn"
                  :class="
                    chartPeriod === '1year'
                      ? 'btn-primary'
                      : 'btn-outline-primary'
                  "
                >
                  1 ปี
                </button>
              </div>
            </div>
            <div class="card-body">
              <div v-if="chartsLoading" class="text-center py-4">
                <div class="spinner-border text-primary"></div>
              </div>
              <div v-else class="chart-container" style="height: 300px">
                <canvas ref="trendsChart"></canvas>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-lg-4 mb-4">
          <div class="card h-100">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="bi bi-pie-chart me-2"></i>
                สัดส่วนสถานะ
              </h5>
            </div>
            <div class="card-body d-flex flex-column">
              <div
                v-if="chartsLoading"
                class="text-center py-4 flex-grow-1 d-flex align-items-center justify-content-center"
              >
                <div class="spinner-border text-primary"></div>
              </div>
              <div v-else-if="hasStatusData" class="flex-grow-1">
                <div class="chart-container" style="height: 250px">
                  <canvas ref="statusChart"></canvas>
                </div>
              </div>
              <div
                v-else
                class="text-center py-4 text-muted flex-grow-1 d-flex flex-column align-items-center justify-content-center"
              >
                <i class="bi bi-pie-chart display-4"></i>
                <p class="mt-2 mb-0">ไม่มีข้อมูล</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity and Quick Actions -->
      <div class="row">
        <!-- Recent Surveys -->
        <div class="col-12 col-lg-7 mb-4">
          <div class="card">
            <div
              class="card-header d-flex justify-content-between align-items-center"
            >
              <h5 class="mb-0">
                <i class="bi bi-clock-history me-2"></i>
                ข้อมูลการสำรวจล่าสุด
              </h5>
              <router-link to="/surveys" class="btn btn-sm btn-outline-primary">
                <i class="bi bi-arrow-right me-1"></i>
                ดูทั้งหมด
              </router-link>
            </div>
            <div class="card-body p-0">
              <div v-if="surveysLoading" class="text-center py-4">
                <div class="spinner-border text-primary"></div>
                <div class="mt-2 text-muted">กำลังโหลดข้อมูล...</div>
              </div>

              <div
                v-else-if="recentSurveys.length === 0"
                class="text-center py-5 text-muted"
              >
                <i class="bi bi-inbox display-1 opacity-25"></i>
                <p class="mt-3 mb-0">ยังไม่มีข้อมูลการสำรวจ</p>
              </div>

              <div v-else class="table-responsive">
                <table class="table table-hover mb-0">
                  <thead class="table-light">
                    <tr>
                      <th class="border-0">ชื่อเป้าหมาย</th>
                      <th class="border-0 d-none d-md-table-cell">ประเภท</th>
                      <th class="border-0 d-none d-lg-table-cell">จังหวัด</th>
                      <th class="border-0">สถานะ</th>
                      <th class="border-0 d-none d-sm-table-cell">
                        วันที่อัปเดต
                      </th>
                      <th class="border-0 text-center">การดำเนินการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="survey in recentSurveys"
                      :key="survey.target_id"
                      class="border-0"
                    >
                      <td class="border-0">
                        <div class="fw-bold text-dark">
                          {{ survey.target_name || "ไม่ระบุชื่อ" }}
                        </div>
                        <div class="small text-muted d-md-none">
                          {{ survey.type_name || survey.survey_type }}
                        </div>
                      </td>
                      <td class="border-0 d-none d-md-table-cell">
                        <span class="badge bg-light text-dark">
                          {{ survey.type_name || survey.survey_type }}
                        </span>
                      </td>
                      <td class="border-0 d-none d-lg-table-cell">
                        {{ survey.province || "ไม่ระบุ" }}
                      </td>
                      <td class="border-0">
                        <span
                          class="badge"
                          :class="getStatusBadgeClass(survey.status)"
                        >
                          <i
                            :class="getStatusIcon(survey.status)"
                            class="me-1"
                          ></i>
                          {{ getStatusText(survey.status) }}
                        </span>
                      </td>
                      <td class="border-0 d-none d-sm-table-cell">
                        <div class="small text-muted">
                          {{ formatDateRelative(survey.updated_at) }}
                        </div>
                      </td>
                      <td class="border-0 text-center">
                        <router-link
                          :to="`/surveys/${survey.target_id}`"
                          class="btn btn-sm btn-outline-primary"
                          title="ดูรายละเอียด"
                        >
                          <i class="bi bi-eye"></i>
                        </router-link>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Sidebar -->
        <div class="col-12 col-lg-5">
          <!-- Quick Actions -->
          <div class="card mb-4">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="bi bi-lightning-fill me-2"></i>
                การดำเนินการด่วน
              </h5>
            </div>
            <div class="card-body">
              <div class="d-grid gap-2">
                <router-link
                  v-if="authStore.can('create_survey')"
                  to="/surveys/create"
                  class="btn btn-primary btn-lg"
                >
                  <i class="bi bi-plus-circle me-2"></i>
                  สร้างการสำรวจใหม่
                </router-link>

                <router-link
                  v-if="authStore.hasRole('Admin')"
                  to="/users/create"
                  class="btn btn-outline-secondary"
                >
                  <i class="bi bi-person-plus me-2"></i>
                  เพิ่มผู้ใช้ใหม่
                </router-link>

                <router-link
                  v-if="authStore.hasRole('Admin')"
                  to="/master-data"
                  class="btn btn-outline-secondary"
                >
                  <i class="bi bi-database me-2"></i>
                  จัดการข้อมูลหลัก
                </router-link>

                <router-link
                  v-if="authStore.hasRole('Admin')"
                  to="/audit"
                  class="btn btn-outline-info"
                >
                  <i class="bi bi-shield-check me-2"></i>
                  ตรวจสอบประวัติ
                </router-link>
              </div>
            </div>
          </div>

          <!-- System Notifications -->
          <div class="card">
            <div
              class="card-header d-flex justify-content-between align-items-center"
            >
              <h5 class="mb-0">
                <i class="bi bi-bell me-2"></i>
                การแจ้งเตือนระบบ
              </h5>
              <span class="badge bg-primary">{{
                systemNotifications.length
              }}</span>
            </div>
            <div class="card-body">
              <div
                v-if="systemNotifications.length === 0"
                class="text-center py-3 text-muted"
              >
                <i class="bi bi-bell-slash fs-1 opacity-25"></i>
                <p class="mt-2 mb-0 small">ไม่มีการแจ้งเตือน</p>
              </div>

              <div v-else class="notification-list">
                <div
                  v-for="notification in systemNotifications.slice(0, 5)"
                  :key="notification.id"
                  class="notification-item d-flex align-items-start mb-3 pb-3 border-bottom"
                >
                  <div class="notification-icon me-3 mt-1">
                    <i
                      :class="notification.icon"
                      :style="`color: ${notification.color}`"
                    ></i>
                  </div>
                  <div class="flex-grow-1">
                    <div class="fw-bold small">{{ notification.title }}</div>
                    <div class="small text-muted">
                      {{ notification.message }}
                    </div>
                    <div class="small text-muted">
                      {{ formatDateRelative(notification.date) }}
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
</template>

<script setup>
import {
  ref,
  reactive,
  onMounted,
  computed,
  nextTick,
  watch,
  onUnmounted,
} from "vue";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "@/composables/useToast";
import dashboardService from "@/services/dashboardService";
import moment from "moment";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

// Stores and composables
const authStore = useAuthStore();
const { showToast } = useToast();

// State
const loading = ref(false);
const exporting = ref(false);
const surveysLoading = ref(false);
const chartsLoading = ref(false);
const chartPeriod = ref("6months");

// Data
const stats = reactive({
  totalSurveys: 0,
  approvedSurveys: 0,
  pendingSurveys: 0,
  draftSurveys: 0,
  rejectedSurveys: 0,
  totalUsers: 0,
  activeUsers: 0,
  todaySurveys: 0,
  weekSurveys: 0,
  monthSurveys: 0,
  newSurveysThisMonth: 0,
  completionRate: 0,
});

const recentSurveys = ref([]);
const systemNotifications = ref([]);
const chartData = reactive({
  statusDistribution: [],
  typeDistribution: [],
  monthlyTrends: [],
});

// Chart references
const statusChart = ref(null);
const trendsChart = ref(null);
let statusChartInstance = null;
let trendsChartInstance = null;

// Computed
const currentDate = computed(() => {
  return moment().locale("th").format("dddd ที่ DD MMMM YYYY");
});

const hasStatusData = computed(() => {
  return stats.totalSurveys > 0;
});

// Methods
const formatNumber = (num) => {
  return dashboardService.formatNumber(num);
};

const getPercentage = (part, total) => {
  return dashboardService.getPercentage(part, total);
};

const refreshData = async () => {
  loading.value = true;
  try {
    await Promise.all([
      loadDashboardStats(),
      loadRecentSurveys(),
      loadSystemNotifications(),
    ]);

    if (hasStatusData.value) {
      await nextTick();
      await createStatusChart();
      await createTrendsChart();
    }

    showToast("ข้อมูลได้รับการอัปเดตแล้ว", "success");
  } catch (error) {
    console.error("Refresh data error:", error);
    showToast("เกิดข้อผิดพลาดในการโหลดข้อมูล", "error");
  } finally {
    loading.value = false;
  }
};

const exportDashboard = async () => {
  exporting.value = true;
  try {
    await dashboardService.exportDashboard({ format: "csv" });
    showToast("ส่งออกรายงานสำเร็จ", "success");
  } catch (error) {
    console.error("Export failed:", error);
    showToast("เกิดข้อผิดพลาดในการส่งออกรายงาน", "error");
  } finally {
    exporting.value = false;
  }
};

const loadDashboardStats = async () => {
  try {
    const response = await dashboardService.getDashboardStats();

    if (response.success) {
      const overview = response.data.overview;
      Object.assign(stats, overview);

      // Update chart data
      chartData.statusDistribution = response.data.charts.statusDistribution;
      chartData.typeDistribution = response.data.charts.typeDistribution;
      chartData.monthlyTrends = response.data.charts.monthlyTrends;
    }
  } catch (error) {
    console.error("Failed to load dashboard stats:", error);
    showToast("ไม่สามารถโหลดสถิติได้", "error");
  }
};

const loadRecentSurveys = async () => {
  surveysLoading.value = true;
  try {
    const response = await dashboardService.getRecentSurveys(6);

    if (response.success) {
      recentSurveys.value = response.data;
    }
  } catch (error) {
    console.error("Failed to load recent surveys:", error);
    showToast("ไม่สามารถโหลดข้อมูลการสำรวจล่าสุดได้", "error");
  } finally {
    surveysLoading.value = false;
  }
};

const loadSystemNotifications = async () => {
  try {
    const response = await dashboardService.getSystemNotifications();

    if (response.success) {
      systemNotifications.value = response.data;
    }
  } catch (error) {
    console.error("Failed to load system notifications:", error);
    // Don't show error toast for notifications as it's not critical
  }
};

const setChartPeriod = async (period) => {
  chartPeriod.value = period;
  chartsLoading.value = true;

  try {
    const months = period === "6months" ? 6 : 12;
    const response = await dashboardService.getMonthlySurveyTrends(months);

    if (response.success) {
      chartData.monthlyTrends = response.data;
      await createTrendsChart();
    }
  } catch (error) {
    console.error("Failed to load trends:", error);
    showToast("ไม่สามารถโหลดข้อมูลแนวโน้มได้", "error");
  } finally {
    chartsLoading.value = false;
  }
};

const createStatusChart = async () => {
  if (
    !hasStatusData.value ||
    !statusChart.value ||
    chartData.statusDistribution.length === 0
  )
    return;

  await nextTick();

  if (statusChartInstance) {
    statusChartInstance.destroy();
  }

  const ctx = statusChart.value.getContext("2d");

  const labels = chartData.statusDistribution.map((item) => item.label);
  const data = chartData.statusDistribution.map((item) => item.value);
  const colors = chartData.statusDistribution.map((item) => item.color);

  statusChartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: colors,
          borderWidth: 3,
          borderColor: "#fff",
          hoverBorderWidth: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            padding: 20,
            usePointStyle: true,
            font: {
              size: 13,
              family: "var(--font-primary)",
            },
          },
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const value = context.parsed;
              const total = stats.totalSurveys;
              const percentage = ((value / total) * 100).toFixed(1);
              return `${context.label}: ${value} รายการ (${percentage}%)`;
            },
          },
        },
      },
      cutout: "60%",
    },
  });
};

const createTrendsChart = async () => {
  if (!trendsChart.value || chartData.monthlyTrends.length === 0) return;

  await nextTick();

  if (trendsChartInstance) {
    trendsChartInstance.destroy();
  }

  const ctx = trendsChart.value.getContext("2d");

  const labels = chartData.monthlyTrends.map((item) => item.month);
  const data = chartData.monthlyTrends.map((item) => item.count);

  trendsChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "จำนวนการสำรวจ",
          data: data,
          borderColor: "#2c5aa0",
          backgroundColor: "rgba(44, 90, 160, 0.1)",
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: "#2c5aa0",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: "rgba(0,0,0,0.1)",
          },
        },
        x: {
          grid: {
            display: false,
          },
        },
      },
      interaction: {
        intersect: false,
        mode: "index",
      },
    },
  });
};

const getStatusBadgeClass = (status) => {
  return dashboardService.getStatusBadgeClass(status);
};

const getStatusIcon = (status) => {
  return dashboardService.getStatusIcon(status);
};

const getStatusText = (status) => {
  return dashboardService.getStatusText(status);
};

const formatDateRelative = (date) => {
  return moment(date).locale("th").fromNow();
};

// Auto-refresh functionality
let refreshInterval = null;

const startAutoRefresh = () => {
  // Refresh every 5 minutes
  refreshInterval = setInterval(() => {
    loadDashboardStats();
    loadRecentSurveys();
    loadSystemNotifications();
  }, 5 * 60 * 1000);
};

const stopAutoRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
};

// Lifecycle
onMounted(async () => {
  await refreshData();
  startAutoRefresh();
});

onUnmounted(() => {
  stopAutoRefresh();
  if (statusChartInstance) {
    statusChartInstance.destroy();
  }
  if (trendsChartInstance) {
    trendsChartInstance.destroy();
  }
});
</script>
<style scoped>
.dashboard-home {
  animation: fadeIn 0.5s ease-in-out;
}

.stats-card {
  transition: all 0.3s ease-in-out;
  position: relative;
  overflow: hidden;
  border: none !important;
}

.stats-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.2) !important;
}

.bg-gradient-primary {
  background: linear-gradient(135deg, #2c5aa0 0%, #4e7bb8 100%);
}

.bg-gradient-success {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
}

.bg-gradient-warning {
  background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%);
}

.bg-gradient-info {
  background: linear-gradient(135deg, #17a2b8 0%, #6f42c1 100%);
}

.chart-container {
  position: relative;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.notification-item {
  transition: background-color 0.2s ease-in-out;
}

.notification-item:hover {
  background-color: rgba(44, 90, 160, 0.05);
  border-radius: 0.375rem;
  margin: -0.25rem;
  padding: 0.25rem !important;
}

.notification-icon {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  font-size: 0.875rem;
}

/* Enhanced table styling */
.table > :not(caption) > * > * {
  padding: 1rem 0.75rem;
}

.table-hover > tbody > tr:hover > * {
  background-color: rgba(44, 90, 160, 0.05);
}

/* Progress bars in stats cards */
.progress {
  background-color: rgba(255, 255, 255, 0.2);
}

.progress-bar {
  transition: width 0.6s ease;
}

/* Card borders */
.border-start {
  border-left-width: 4px !important;
}

/* Mobile responsive adjustments */
@media (max-width: 575.98px) {
  .stats-card .h2 {
    font-size: 1.75rem;
  }

  .stats-card .card-body {
    padding: 1.25rem;
  }

  .table-responsive {
    font-size: 0.875rem;
  }

  .chart-container {
    height: 250px !important;
  }
}

@media (max-width: 767.98px) {
  .d-grid .btn {
    padding: 0.75rem 1rem;
    font-size: 0.95rem;
  }

  .notification-list {
    max-height: 300px;
    overflow-y: auto;
  }
}

@media (max-width: 991.98px) {
  .chart-container {
    height: 250px !important;
  }
}

/* Print styles */
@media print {
  .btn,
  .no-print {
    display: none !important;
  }

  .stats-card {
    break-inside: avoid;
    transform: none !important;
    box-shadow: none !important;
    border: 1px solid #000 !important;
  }

  .card {
    break-inside: avoid;
    box-shadow: none !important;
    border: 1px solid #000 !important;
  }
}

/* Custom scrollbar for notification list */
.notification-list::-webkit-scrollbar {
  width: 4px;
}

.notification-list::-webkit-scrollbar-track {
  background: transparent;
}

.notification-list::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 2px;
}

.notification-list::-webkit-scrollbar-thumb:hover {
  background: var(--text-secondary);
}
</style>
