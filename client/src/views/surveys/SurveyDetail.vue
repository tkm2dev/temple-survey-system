<template>
  <div class="survey-detail">
    <!-- Header Section -->
    <div class="survey-header mb-4">
      <div class="d-flex justify-content-between align-items-start mb-3">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb">
            <li class="breadcrumb-item">
              <router-link to="/" class="text-decoration-none"
                >หน้าแรก</router-link
              >
            </li>
            <li class="breadcrumb-item">
              <router-link to="/surveys" class="text-decoration-none"
                >ข้อมูลการสำรวจ</router-link
              >
            </li>
            <li class="breadcrumb-item active" aria-current="page">
              รายละเอียดการสำรวจ
            </li>
          </ol>
        </nav>

        <div class="d-flex gap-2">
          <button
            v-if="canEdit"
            class="btn btn-outline-primary btn-sm"
            @click="editSurvey"
          >
            <i class="bi bi-pencil me-1"></i>
            แก้ไข
          </button>
          <button class="btn btn-outline-secondary btn-sm" @click="goBack">
            <i class="bi bi-arrow-left me-1"></i>
            กลับ
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">กำลังโหลด...</span>
      </div>
      <p class="mt-2 text-muted">กำลังโหลดข้อมูลการสำรวจ...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-danger">
      <h5><i class="bi bi-exclamation-triangle me-2"></i>เกิดข้อผิดพลาด</h5>
      <p class="mb-0">{{ error }}</p>
    </div>

    <!-- Survey Details -->
    <div v-else-if="survey" class="survey-content">
      <!-- Status Badge -->
      <div class="mb-4">
        <span :class="getStatusBadgeClass(survey.status)" class="badge fs-6">
          <i :class="getStatusIcon(survey.status)" class="me-1"></i>
          {{ getStatusText(survey.status) }}
        </span>
      </div>

      <!-- Main Information Card -->
      <div class="card mb-4">
        <div class="card-header">
          <h5 class="mb-0">
            <i class="bi bi-info-circle me-2"></i>
            ข้อมูลพื้นฐาน
          </h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <div class="mb-3">
                <label class="form-label fw-bold">ชื่อเป้าหมายการสำรวจ:</label>
                <p class="mb-0">{{ survey.target_name }}</p>
              </div>
              <div class="mb-3">
                <label class="form-label fw-bold">ประเภท:</label>
                <p class="mb-0">{{ survey.survey_type }}</p>
              </div>
              <div class="mb-3">
                <label class="form-label fw-bold">จังหวัด:</label>
                <p class="mb-0">{{ survey.province }}</p>
              </div>
            </div>
            <div class="col-md-6">
              <div class="mb-3">
                <label class="form-label fw-bold">อำเภอ:</label>
                <p class="mb-0">{{ survey.district }}</p>
              </div>
              <div class="mb-3">
                <label class="form-label fw-bold">ตำบล:</label>
                <p class="mb-0">{{ survey.subdistrict }}</p>
              </div>
              <div class="mb-3">
                <label class="form-label fw-bold">ผู้สำรวจ:</label>
                <p class="mb-0">{{ survey.surveyor_name }}</p>
              </div>
            </div>
          </div>

          <div class="row">
            <div class="col-md-6">
              <div class="mb-3">
                <label class="form-label fw-bold">วันที่เริ่มสำรวจ:</label>
                <p class="mb-0">{{ formatDate(survey.survey_date) }}</p>
              </div>
            </div>
            <div class="col-md-6">
              <div class="mb-3">
                <label class="form-label fw-bold">วันที่อัปเดตล่าสุด:</label>
                <p class="mb-0">{{ formatDate(survey.updated_at) }}</p>
              </div>
            </div>
          </div>

          <div v-if="survey.notes" class="mb-3">
            <label class="form-label fw-bold">หมายเหตุ:</label>
            <p class="mb-0">{{ survey.notes }}</p>
          </div>
        </div>
      </div>

      <!-- Temple Details (if survey_type is Temple) -->
      <div
        v-if="survey.survey_type === 'Temple' && survey.temple_details"
        class="card mb-4"
      >
        <div class="card-header">
          <h5 class="mb-0">
            <i class="bi bi-building me-2"></i>
            ข้อมูลวัด
          </h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <div class="mb-3">
                <label class="form-label fw-bold">ชื่อวัด:</label>
                <p class="mb-0">{{ survey.temple_details.temple_name }}</p>
              </div>
              <div class="mb-3">
                <label class="form-label fw-bold">นิกาย:</label>
                <p class="mb-0">{{ survey.temple_details.sect }}</p>
              </div>
              <div class="mb-3">
                <label class="form-label fw-bold">จำนวนพระ:</label>
                <p class="mb-0">{{ survey.temple_details.monk_count }}</p>
              </div>
            </div>
            <div class="col-md-6">
              <div class="mb-3">
                <label class="form-label fw-bold">จำนวนเณร:</label>
                <p class="mb-0">{{ survey.temple_details.novice_count }}</p>
              </div>
              <div class="mb-3">
                <label class="form-label fw-bold">เบอร์โทรศัพท์:</label>
                <p class="mb-0">
                  {{ survey.temple_details.phone || "ไม่ระบุ" }}
                </p>
              </div>
              <div class="mb-3">
                <label class="form-label fw-bold">อีเมล:</label>
                <p class="mb-0">
                  {{ survey.temple_details.email || "ไม่ระบุ" }}
                </p>
              </div>
            </div>
          </div>

          <div v-if="survey.temple_details.description" class="mb-3">
            <label class="form-label fw-bold">รายละเอียดเพิ่มเติม:</label>
            <p class="mb-0">{{ survey.temple_details.description }}</p>
          </div>

          <!-- Coordinates -->
          <div
            v-if="
              survey.temple_details.latitude && survey.temple_details.longitude
            "
            class="mb-3"
          >
            <label class="form-label fw-bold">พิกัด:</label>
            <p class="mb-0">
              {{ survey.temple_details.latitude }},
              {{ survey.temple_details.longitude }}
              <button
                class="btn btn-link btn-sm p-0 ms-2"
                @click="
                  openMap(
                    survey.temple_details.latitude,
                    survey.temple_details.longitude
                  )
                "
              >
                <i class="bi bi-geo-alt"></i> ดูแผนที่
              </button>
            </p>
          </div>
        </div>
      </div>

      <!-- Attachments -->
      <div v-if="attachments.length > 0" class="card mb-4">
        <div class="card-header">
          <h5 class="mb-0">
            <i class="bi bi-paperclip me-2"></i>
            ไฟล์แนบ ({{ attachments.length }})
          </h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div
              v-for="attachment in attachments"
              :key="attachment.id"
              class="col-12 col-sm-6 col-lg-4 mb-3"
            >
              <div class="attachment-item p-3 border rounded">
                <div class="d-flex align-items-center">
                  <i
                    :class="getFileIcon(attachment.file_type)"
                    class="me-2 text-muted"
                  ></i>
                  <div class="flex-grow-1">
                    <h6 class="mb-1">{{ attachment.original_name }}</h6>
                    <small class="text-muted">
                      {{ formatFileSize(attachment.file_size) }} •
                      {{ formatDate(attachment.uploaded_at) }}
                    </small>
                  </div>
                  <button
                    class="btn btn-outline-primary btn-sm"
                    @click="downloadFile(attachment)"
                  >
                    <i class="bi bi-download"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Activity Log -->
      <div v-if="activityLogs.length > 0" class="card">
        <div class="card-header">
          <h5 class="mb-0">
            <i class="bi bi-clock-history me-2"></i>
            ประวัติการดำเนินการ
          </h5>
        </div>
        <div class="card-body">
          <div class="timeline">
            <div
              v-for="log in activityLogs"
              :key="log.id"
              class="timeline-item"
            >
              <div class="timeline-marker">
                <i
                  :class="getActivityIcon(log.action)"
                  class="text-primary"
                ></i>
              </div>
              <div class="timeline-content">
                <div class="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 class="mb-1">{{ log.action }}</h6>
                    <p class="mb-1 text-muted">{{ log.details }}</p>
                    <small class="text-muted">โดย {{ log.user_name }}</small>
                  </div>
                  <small class="text-muted">{{
                    formatDate(log.created_at)
                  }}</small>
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
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import surveyService from "@/services/surveyService";
import moment from "moment";

export default {
  name: "SurveyDetail",
  setup() {
    const route = useRoute();
    const router = useRouter();
    const authStore = useAuthStore();

    const loading = ref(true);
    const error = ref("");
    const survey = ref(null);
    const attachments = ref([]);
    const activityLogs = ref([]);

    // Computed properties
    const canEdit = computed(() => {
      if (!survey.value || !authStore.user) return false;

      // Admin can edit any survey
      if (authStore.user.role === "Admin") return true;

      // Surveyor can edit their own pending surveys
      if (
        authStore.user.role === "Surveyor" &&
        survey.value.surveyor_id === authStore.user.id &&
        survey.value.status === "Pending"
      ) {
        return true;
      }

      return false;
    });

    // Methods
    const loadSurveyDetails = async () => {
      try {
        loading.value = true;
        error.value = "";

        const surveyId = route.params.id;

        // Load survey details
        const surveyResponse = await surveyService.getSurvey(surveyId);
        survey.value = surveyResponse.data;

        // Load attachments
        try {
          const attachmentsResponse = await surveyService.getSurveyAttachments(
            surveyId
          );
          attachments.value = attachmentsResponse.data;
        } catch (err) {
          console.warn("Failed to load attachments:", err);
          attachments.value = [];
        }

        // Load activity logs
        try {
          const logsResponse = await surveyService.getSurveyActivityLogs(
            surveyId
          );
          activityLogs.value = logsResponse.data;
        } catch (err) {
          console.warn("Failed to load activity logs:", err);
          activityLogs.value = [];
        }
      } catch (err) {
        console.error("Error loading survey details:", err);
        error.value =
          err.response?.data?.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล";
      } finally {
        loading.value = false;
      }
    };

    const goBack = () => {
      router.go(-1);
    };

    const editSurvey = () => {
      router.push(`/surveys/${route.params.id}/edit`);
    };

    const getStatusBadgeClass = (status) => {
      const classes = {
        Pending: "badge bg-warning text-dark",
        "In Progress": "badge bg-info text-white",
        Completed: "badge bg-success text-white",
        Approved: "badge bg-success text-white",
        Rejected: "badge bg-danger text-white",
      };
      return classes[status] || "badge bg-secondary";
    };

    const getStatusIcon = (status) => {
      const icons = {
        Pending: "bi-clock",
        "In Progress": "bi-arrow-repeat",
        Completed: "bi-check-circle",
        Approved: "bi-check-circle-fill",
        Rejected: "bi-x-circle",
      };
      return icons[status] || "bi-question-circle";
    };

    const getStatusText = (status) => {
      const texts = {
        Pending: "รอดำเนินการ",
        "In Progress": "กำลังดำเนินการ",
        Completed: "เสร็จสิ้น",
        Approved: "อนุมัติแล้ว",
        Rejected: "ไม่อนุมัติ",
      };
      return texts[status] || status;
    };

    const getFileIcon = (fileType) => {
      if (fileType.startsWith("image/")) return "bi-image";
      if (fileType.includes("pdf")) return "bi-file-earmark-pdf";
      if (fileType.includes("word")) return "bi-file-earmark-word";
      if (fileType.includes("excel") || fileType.includes("spreadsheet"))
        return "bi-file-earmark-excel";
      return "bi-file-earmark";
    };

    const getActivityIcon = (action) => {
      const icons = {
        Create: "bi-plus-circle",
        Update: "bi-pencil-square",
        Delete: "bi-trash",
        Submit: "bi-send",
        Approve: "bi-check-circle",
        Reject: "bi-x-circle",
        Comment: "bi-chat",
      };
      return icons[action] || "bi-circle";
    };

    const formatDate = (dateString) => {
      return moment(dateString).format("DD/MM/YYYY HH:mm");
    };

    const formatFileSize = (bytes) => {
      if (bytes === 0) return "0 Bytes";
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const downloadFile = async (attachment) => {
      try {
        const response = await surveyService.downloadAttachment(attachment.id);
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", attachment.original_name);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (err) {
        console.error("Error downloading file:", err);
      }
    };

    const openMap = (lat, lng) => {
      const url = `https://www.google.com/maps?q=${lat},${lng}`;
      window.open(url, "_blank");
    };

    // Lifecycle
    onMounted(() => {
      loadSurveyDetails();
    });

    return {
      loading,
      error,
      survey,
      attachments,
      activityLogs,
      canEdit,
      loadSurveyDetails,
      goBack,
      editSurvey,
      getStatusBadgeClass,
      getStatusIcon,
      getStatusText,
      getFileIcon,
      getActivityIcon,
      formatDate,
      formatFileSize,
      downloadFile,
      openMap,
    };
  },
};
</script>

<style scoped>
.survey-detail {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.survey-header {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.attachment-item {
  transition: box-shadow 0.2s ease-in-out;
}

.attachment-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* Timeline Styles */
.timeline {
  position: relative;
  padding-left: 2rem;
}

.timeline::before {
  content: "";
  position: absolute;
  left: 1rem;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #e9ecef;
}

.timeline-item {
  position: relative;
  margin-bottom: 2rem;
}

.timeline-marker {
  position: absolute;
  left: -2.5rem;
  top: 0;
  width: 2rem;
  height: 2rem;
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.timeline-content {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border-left: 3px solid var(--primary-color);
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .survey-detail {
    padding: 0.5rem;
  }

  .survey-header {
    padding: 1rem;
  }

  .d-flex.gap-2 {
    flex-direction: column;
  }

  .d-flex.gap-2 .btn {
    width: 100%;
  }

  .timeline {
    padding-left: 1.5rem;
  }

  .timeline-marker {
    left: -2rem;
    width: 1.5rem;
    height: 1.5rem;
  }
}

@media (max-width: 575.98px) {
  .row .col-md-6 {
    margin-bottom: 1rem;
  }
}
</style>
