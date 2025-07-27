<template>
  <div class="pending-users-page">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="h4 mb-1">
          <i class="fas fa-user-clock me-2 text-warning"></i>
          ผู้ใช้งานที่รออนุมัติ
        </h2>
        <p class="text-muted mb-0">จัดการคำขอลงทะเบียนใช้งานระบบ</p>
      </div>
      <div class="d-flex gap-2">
        <button
          class="btn btn-outline-secondary"
          @click="loadPendingUsers"
          :disabled="loading"
        >
          <i class="fas fa-sync-alt me-1" :class="{ 'fa-spin': loading }"></i>
          รีเฟรช
        </button>
        <span class="badge bg-warning fs-6 px-3 py-2">
          {{ pendingUsers.length }} รายการ
        </span>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">กำลังโหลด...</span>
      </div>
      <p class="mt-3 text-muted">กำลังโหลดข้อมูล...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="pendingUsers.length === 0" class="text-center py-5">
      <div class="empty-state">
        <i class="fas fa-user-check fa-4x text-success mb-3"></i>
        <h5>ไม่มีผู้ใช้งานที่รออนุมัติ</h5>
        <p class="text-muted">ทุกคำขอลงทะเบียนได้รับการพิจารณาแล้ว</p>
      </div>
    </div>

    <!-- Pending Users List -->
    <div v-else class="row">
      <div
        v-for="user in pendingUsers"
        :key="user.user_id"
        class="col-md-6 col-lg-4 mb-4"
      >
        <div class="card h-100 shadow-sm border-0">
          <div
            class="card-header bg-light border-0 d-flex justify-content-between align-items-center"
          >
            <div class="d-flex align-items-center">
              <div class="avatar-circle bg-warning text-white me-2">
                {{ getInitials(user.first_name, user.last_name) }}
              </div>
              <div>
                <h6 class="mb-0 fw-bold">
                  {{ user.first_name }} {{ user.last_name }}
                </h6>
                <small class="text-muted">@{{ user.username }}</small>
              </div>
            </div>
            <span class="badge bg-warning">รออนุมัติ</span>
          </div>

          <div class="card-body">
            <div class="user-info mb-3">
              <div class="info-item mb-2">
                <i class="fas fa-envelope text-muted me-2"></i>
                <span class="small">{{ user.email }}</span>
              </div>
              <div v-if="user.phone" class="info-item mb-2">
                <i class="fas fa-phone text-muted me-2"></i>
                <span class="small">{{ user.phone }}</span>
              </div>
              <div v-if="user.line_id" class="info-item mb-2">
                <i class="fab fa-line text-muted me-2"></i>
                <span class="small">{{ user.line_id }}</span>
              </div>
              <div v-if="user.rank_position" class="info-item mb-2">
                <i class="fas fa-medal text-muted me-2"></i>
                <span class="small">{{ user.rank_position }}</span>
              </div>
              <div v-if="user.job_position" class="info-item mb-2">
                <i class="fas fa-briefcase text-muted me-2"></i>
                <span class="small">{{ user.job_position }}</span>
              </div>
              <div v-if="user.agency" class="info-item mb-2">
                <i class="fas fa-building text-muted me-2"></i>
                <span class="small">{{ user.agency }}</span>
              </div>
              <div class="info-item">
                <i class="fas fa-calendar-alt text-muted me-2"></i>
                <span class="small">{{ formatDateTime(user.created_at) }}</span>
              </div>
            </div>

            <div class="action-buttons d-flex gap-2">
              <button
                class="btn btn-success btn-sm flex-fill"
                @click="approveUser(user)"
                :disabled="processing === user.user_id"
              >
                <i class="fas fa-check me-1"></i>
                อนุมัติ
              </button>
              <button
                class="btn btn-danger btn-sm flex-fill"
                @click="showRejectModal(user)"
                :disabled="processing === user.user_id"
              >
                <i class="fas fa-times me-1"></i>
                ปฏิเสธ
              </button>
            </div>

            <div v-if="processing === user.user_id" class="text-center mt-2">
              <div
                class="spinner-border spinner-border-sm text-primary"
                role="status"
              >
                <span class="visually-hidden">กำลังดำเนินการ...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Reject Modal -->
    <div
      class="modal fade"
      id="rejectModal"
      tabindex="-1"
      aria-labelledby="rejectModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="rejectModalLabel">
              <i class="fas fa-times-circle text-danger me-2"></i>
              ปฏิเสธผู้ใช้งาน
            </h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <div v-if="selectedUser" class="mb-3">
              <p class="mb-2">
                <strong>ชื่อ:</strong> {{ selectedUser.first_name }}
                {{ selectedUser.last_name }}
              </p>
              <p class="mb-2">
                <strong>ชื่อผู้ใช้:</strong> {{ selectedUser.username }}
              </p>
              <p class="mb-3">
                <strong>อีเมล:</strong> {{ selectedUser.email }}
              </p>
            </div>

            <div class="mb-3">
              <label for="rejectReason" class="form-label">
                เหตุผลในการปฏิเสธ (ไม่บังคับ)
              </label>
              <textarea
                id="rejectReason"
                v-model="rejectReason"
                class="form-control"
                rows="3"
                placeholder="ระบุเหตุผลในการปฏิเสธ..."
              ></textarea>
            </div>

            <div class="alert alert-warning">
              <i class="fas fa-exclamation-triangle me-2"></i>
              <strong>คำเตือน:</strong> การปฏิเสธนี้ไม่สามารถย้อนกลับได้
            </div>
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
              class="btn btn-danger"
              @click="rejectUser"
              :disabled="processing"
            >
              <i class="fas fa-times me-1"></i>
              ปฏิเสธ
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "@/composables/useToast";
import axios from "axios";
import { Modal } from "bootstrap";

export default {
  name: "PendingUsersPage",
  setup() {
    const authStore = useAuthStore();
    const { showToast } = useToast();

    const pendingUsers = ref([]);
    const loading = ref(false);
    const processing = ref(null);
    const selectedUser = ref(null);
    const rejectReason = ref("");
    const rejectModal = ref(null);

    // Load pending users
    const loadPendingUsers = async () => {
      try {
        loading.value = true;

        const response = await axios.get("/api/auth/pending-users", {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
        });

        if (response.data.success) {
          pendingUsers.value = response.data.data.pending_users;
        }
      } catch (error) {
        console.error("Error loading pending users:", error);

        const message =
          error.response?.data?.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล";
        showToast(message, "error");
      } finally {
        loading.value = false;
      }
    };

    // Approve user
    const approveUser = async (user) => {
      try {
        processing.value = user.user_id;

        const response = await axios.post(
          "/api/auth/approve-user",
          {
            user_id: user.user_id,
            action: "approve",
            reason: null,
          },
          {
            headers: {
              Authorization: `Bearer ${authStore.token}`,
            },
          }
        );

        if (response.data.success) {
          showToast(
            `อนุมัติผู้ใช้งาน ${user.first_name} ${user.last_name} สำเร็จ`,
            "success"
          );
          await loadPendingUsers();
        }
      } catch (error) {
        console.error("Error approving user:", error);

        const message =
          error.response?.data?.message ||
          "เกิดข้อผิดพลาดในการอนุมัติผู้ใช้งาน";
        showToast(message, "error");
      } finally {
        processing.value = null;
      }
    };

    // Show reject modal
    const showRejectModal = (user) => {
      selectedUser.value = user;
      rejectReason.value = "";

      if (!rejectModal.value) {
        rejectModal.value = new Modal(document.getElementById("rejectModal"));
      }
      rejectModal.value.show();
    };

    // Reject user
    const rejectUser = async () => {
      if (!selectedUser.value) return;

      try {
        processing.value = selectedUser.value.user_id;

        const response = await axios.post(
          "/api/auth/approve-user",
          {
            user_id: selectedUser.value.user_id,
            action: "reject",
            reason: rejectReason.value || null,
          },
          {
            headers: {
              Authorization: `Bearer ${authStore.token}`,
            },
          }
        );

        if (response.data.success) {
          showToast(
            `ปฏิเสธผู้ใช้งาน ${selectedUser.value.first_name} ${selectedUser.value.last_name} สำเร็จ`,
            "success"
          );
          rejectModal.value.hide();
          await loadPendingUsers();
        }
      } catch (error) {
        console.error("Error rejecting user:", error);

        const message =
          error.response?.data?.message || "เกิดข้อผิดพลาดในการปฏิเสธผู้ใช้งาน";
        showToast(message, "error");
      } finally {
        processing.value = null;
      }
    };

    // Helper functions
    const getInitials = (firstName, lastName) => {
      return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
    };

    const formatDateTime = (dateString) => {
      return new Date(dateString).toLocaleString("th-TH", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    // Load data on mount
    onMounted(() => {
      loadPendingUsers();
    });

    return {
      pendingUsers,
      loading,
      processing,
      selectedUser,
      rejectReason,
      loadPendingUsers,
      approveUser,
      showRejectModal,
      rejectUser,
      getInitials,
      formatDateTime,
    };
  },
};
</script>

<style scoped>
.pending-users-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.avatar-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
}

.card {
  transition: all 0.3s ease;
  border-radius: 12px;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1) !important;
}

.info-item {
  display: flex;
  align-items: center;
  word-break: break-all;
}

.action-buttons .btn {
  font-size: 13px;
  font-weight: 500;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.action-buttons .btn:hover {
  transform: translateY(-1px);
}

.empty-state {
  padding: 40px 20px;
}

.modal-content {
  border-radius: 12px;
  border: none;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
}

.modal-header {
  border-bottom: 1px solid #f1f3f4;
  padding: 24px;
}

.modal-body {
  padding: 24px;
}

.modal-footer {
  border-top: 1px solid #f1f3f4;
  padding: 20px 24px;
}

.badge {
  border-radius: 20px;
}

@media (max-width: 768px) {
  .pending-users-page {
    padding: 15px;
  }

  .d-flex.justify-content-between {
    flex-direction: column;
    gap: 15px;
  }

  .col-md-6 {
    padding: 0 8px;
  }

  .card-body {
    padding: 15px;
  }
}
</style>
