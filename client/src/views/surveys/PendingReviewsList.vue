<template>
  <div class="pending-reviews-container">
    <!-- Header Section -->
    <div class="card mb-4 bg-warning text-dark">
      <div class="card-body">
        <div class="row align-items-center">
          <div class="col-md-8">
            <div class="d-flex align-items-center">
              <div class="warning-icon me-3">
                <i class="bi bi-clock-history fs-2"></i>
              </div>
              <div>
                <h4 class="mb-1">
                  <i class="bi bi-clipboard-check me-2"></i>
                  รายการรอตรวจสอบ
                </h4>
                <p class="mb-0 opacity-75">
                  ข้อมูลวัดที่รออนุมัติจากผู้บังคับบัญชา
                </p>
              </div>
            </div>
          </div>
          <div class="col-md-4 text-end">
            <div class="stats-info">
              <div class="fw-bold fs-3">{{ totalPending }}</div>
              <div class="small">รายการรอตรวจสอบ</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filter and Search Section -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-4">
            <div class="input-group">
              <span class="input-group-text">
                <i class="bi bi-search"></i>
              </span>
              <input
                v-model="searchQuery"
                type="text"
                class="form-control"
                placeholder="ค้นหาชื่อวัด หรือที่อยู่..."
              />
            </div>
          </div>

          <div class="col-md-3">
            <select v-model="filterStatus" class="form-select">
              <option value="">ทุกสถานะ</option>
              <option value="Draft">ร่าง</option>
              <option value="PendingReview">รอตรวจสอบ</option>
              <option value="UnderReview">กำลังตรวจสอบ</option>
              <option value="NeedsRevision">ต้องแก้ไข</option>
            </select>
          </div>

          <div class="col-md-3">
            <select v-model="filterDate" class="form-select">
              <option value="">ทุกช่วงเวลา</option>
              <option value="today">วันนี้</option>
              <option value="week">สัปดาห์นี้</option>
              <option value="month">เดือนนี้</option>
            </select>
          </div>

          <div class="col-md-2">
            <button
              class="btn btn-outline-secondary w-100"
              @click="refreshData"
              :disabled="loading"
            >
              <span
                v-if="loading"
                class="spinner-border spinner-border-sm me-2"
              ></span>
              <i class="bi bi-arrow-clockwise me-1"></i>
              รีเฟรช
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Items List -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">กำลังโหลด...</span>
      </div>
      <p class="mt-2 text-muted">กำลังโหลดข้อมูล...</p>
    </div>

    <div v-else-if="filteredItems.length === 0" class="card">
      <div class="card-body text-center py-5">
        <i class="bi bi-inbox text-muted" style="font-size: 4rem"></i>
        <h5 class="mt-3 text-muted">ไม่มีรายการรอตรวจสอบ</h5>
        <p class="text-muted">
          {{
            searchQuery
              ? "ไม่พบข้อมูลที่ค้นหา"
              : "ยังไม่มีรายการที่ส่งมาตรวจสอบ"
          }}
        </p>
      </div>
    </div>

    <div v-else class="row">
      <div v-for="item in paginatedItems" :key="item.id" class="col-12 mb-3">
        <div class="card border-start border-warning border-3">
          <div class="card-body">
            <div class="row align-items-center">
              <!-- Temple Info -->
              <div class="col-md-6">
                <div class="d-flex align-items-start">
                  <div class="temple-avatar me-3">
                    <i class="bi bi-building text-warning fs-2"></i>
                  </div>
                  <div>
                    <h5 class="card-title mb-1">{{ item.target_name }}</h5>
                    <p class="text-muted mb-1">
                      <i class="bi bi-geo-alt me-1"></i>
                      {{ item.address }}, {{ item.district }},
                      {{ item.province }}
                    </p>
                    <div class="d-flex align-items-center text-muted small">
                      <i class="bi bi-person me-1"></i>
                      บันทึกโดย: {{ item.created_by_name }}
                      <span class="mx-2">•</span>
                      <i class="bi bi-calendar me-1"></i>
                      {{ formatDate(item.created_at) }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Status and Actions -->
              <div class="col-md-6">
                <div class="row">
                  <div class="col-md-6">
                    <div class="status-info">
                      <span
                        class="badge"
                        :class="getStatusBadgeClass(item.status)"
                      >
                        {{ getStatusText(item.status) }}
                      </span>

                      <div class="mt-2">
                        <div class="small text-muted">ส่งตรวจเมื่อ:</div>
                        <div class="fw-medium">
                          {{ formatDate(item.submitted_at) }}
                        </div>
                      </div>

                      <div v-if="item.days_pending > 0" class="mt-2">
                        <div class="small text-muted">รอตรวจมาแล้ว:</div>
                        <div class="text-warning fw-medium">
                          {{ item.days_pending }} วัน
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="col-md-6">
                    <div class="d-grid gap-2">
                      <button
                        class="btn btn-primary btn-sm"
                        @click="viewDetail(item)"
                      >
                        <i class="bi bi-eye me-1"></i>
                        ดูรายละเอียด
                      </button>

                      <div class="btn-group" role="group">
                        <button
                          v-if="canApprove"
                          class="btn btn-success btn-sm"
                          @click="approveItem(item)"
                          :disabled="processing"
                        >
                          <i class="bi bi-check-circle me-1"></i>
                          อนุมัติ
                        </button>

                        <button
                          v-if="canReject"
                          class="btn btn-danger btn-sm"
                          @click="rejectItem(item)"
                          :disabled="processing"
                        >
                          <i class="bi bi-x-circle me-1"></i>
                          ไม่อนุมัติ
                        </button>
                      </div>

                      <button
                        v-if="item.created_by === authStore.user?.id"
                        class="btn btn-outline-secondary btn-sm"
                        @click="editItem(item)"
                      >
                        <i class="bi bi-pencil me-1"></i>
                        แก้ไข
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Additional Details -->
            <div class="row mt-3">
              <div class="col-12">
                <div class="border-top pt-3">
                  <div class="row text-center">
                    <div class="col-md-3">
                      <div class="small text-muted">ประเภทวัด</div>
                      <div class="fw-medium">
                        {{ item.temple_type_name || "ไม่ระบุ" }}
                      </div>
                    </div>
                    <div class="col-md-3">
                      <div class="small text-muted">นิกาย</div>
                      <div class="fw-medium">
                        {{ item.denomination_name || "ไม่ระบุ" }}
                      </div>
                    </div>
                    <div class="col-md-3">
                      <div class="small text-muted">จำนวนพระ</div>
                      <div class="fw-medium">
                        {{ item.monk_count || "ไม่ระบุ" }} รูป
                      </div>
                    </div>
                    <div class="col-md-3">
                      <div class="small text-muted">ไฟล์แนบ</div>
                      <div class="fw-medium">
                        {{ item.attachment_count || 0 }} ไฟล์
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Review Comments -->
            <div v-if="item.review_comments" class="mt-3">
              <div class="alert alert-info">
                <div class="small text-muted">ความเห็นจากผู้ตรวจสอบ:</div>
                <div>{{ item.review_comments }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="card mt-4">
      <div class="card-body">
        <nav aria-label="Page navigation">
          <ul class="pagination justify-content-center mb-0">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <button
                class="page-link"
                @click="currentPage = Math.max(1, currentPage - 1)"
                :disabled="currentPage === 1"
              >
                <i class="bi bi-chevron-left"></i>
                ก่อนหน้า
              </button>
            </li>

            <li
              v-for="page in visiblePages"
              :key="page"
              class="page-item"
              :class="{ active: page === currentPage }"
            >
              <button class="page-link" @click="currentPage = page">
                {{ page }}
              </button>
            </li>

            <li
              class="page-item"
              :class="{ disabled: currentPage === totalPages }"
            >
              <button
                class="page-link"
                @click="currentPage = Math.min(totalPages, currentPage + 1)"
                :disabled="currentPage === totalPages"
              >
                ถัดไป
                <i class="bi bi-chevron-right"></i>
              </button>
            </li>
          </ul>
        </nav>

        <div class="text-center mt-3 text-muted small">
          แสดง {{ (currentPage - 1) * itemsPerPage + 1 }} -
          {{ Math.min(currentPage * itemsPerPage, totalItems) }}
          จาก {{ totalItems }} รายการ
        </div>
      </div>
    </div>

    <!-- Action Modals -->
    <!-- Approve Modal -->
    <div class="modal fade" id="approveModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-success text-white">
            <h5 class="modal-title">
              <i class="bi bi-check-circle me-2"></i>
              ยืนยันการอนุมัติ
            </h5>
            <button
              type="button"
              class="btn-close btn-close-white"
              data-bs-dismiss="modal"
            ></button>
          </div>
          <div class="modal-body">
            <p>
              คุณต้องการอนุมัติข้อมูลวัด
              <strong>{{ selectedItem?.target_name }}</strong> หรือไม่?
            </p>

            <div class="mb-3">
              <label class="form-label">ความเห็นเพิ่มเติม (ไม่บังคับ)</label>
              <textarea
                v-model="approvalComment"
                class="form-control"
                rows="3"
                placeholder="ระบุความเห็นหรือข้อเสนอแนะ..."
              ></textarea>
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
              class="btn btn-success"
              @click="confirmApproval"
              :disabled="processing"
            >
              <span
                v-if="processing"
                class="spinner-border spinner-border-sm me-2"
              ></span>
              <i class="bi bi-check-circle me-2"></i>
              ยืนยันการอนุมัติ
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Reject Modal -->
    <div class="modal fade" id="rejectModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title">
              <i class="bi bi-x-circle me-2"></i>
              ไม่อนุมัติข้อมูล
            </h5>
            <button
              type="button"
              class="btn-close btn-close-white"
              data-bs-dismiss="modal"
            ></button>
          </div>
          <div class="modal-body">
            <p>
              คุณต้องการไม่อนุมัติข้อมูลวัด
              <strong>{{ selectedItem?.target_name }}</strong> หรือไม่?
            </p>

            <div class="mb-3">
              <label class="form-label required">เหตุผลในการไม่อนุมัติ</label>
              <textarea
                v-model="rejectionReason"
                class="form-control"
                rows="4"
                placeholder="กรุณาระบุเหตุผลในการไม่อนุมัติ หรือสิ่งที่ต้องแก้ไข..."
                required
              ></textarea>
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
              @click="confirmRejection"
              :disabled="processing || !rejectionReason.trim()"
            >
              <span
                v-if="processing"
                class="spinner-border spinner-border-sm me-2"
              ></span>
              <i class="bi bi-x-circle me-2"></i>
              ยืนยันการไม่อนุมัติ
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "@/composables/useToast";
import surveyService from "@/services/surveyService";
import { Modal } from "bootstrap";

export default {
  name: "PendingReviewsList",
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();
    const { showToast } = useToast();

    // State
    const loading = ref(false);
    const processing = ref(false);
    const items = ref([]);
    const searchQuery = ref("");
    const filterStatus = ref("");
    const filterDate = ref("");
    const currentPage = ref(1);
    const itemsPerPage = ref(10);
    const selectedItem = ref(null);
    const approvalComment = ref("");
    const rejectionReason = ref("");

    // Modals
    let approveModal = null;
    let rejectModal = null;

    // Computed
    const totalPending = computed(() => {
      return items.value.filter((item) =>
        ["Draft", "PendingReview", "UnderReview", "NeedsRevision"].includes(
          item.status
        )
      ).length;
    });

    const filteredItems = computed(() => {
      let filtered = [...items.value];

      // Search filter
      if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase();
        filtered = filtered.filter(
          (item) =>
            item.target_name?.toLowerCase().includes(query) ||
            item.address?.toLowerCase().includes(query) ||
            item.district?.toLowerCase().includes(query) ||
            item.province?.toLowerCase().includes(query)
        );
      }

      // Status filter
      if (filterStatus.value) {
        filtered = filtered.filter(
          (item) => item.status === filterStatus.value
        );
      }

      // Date filter
      if (filterDate.value) {
        const now = new Date();
        const filterDate = new Date();

        switch (filterDate.value) {
          case "today":
            filterDate.setHours(0, 0, 0, 0);
            filtered = filtered.filter(
              (item) => new Date(item.created_at) >= filterDate
            );
            break;
          case "week":
            filterDate.setDate(now.getDate() - 7);
            filtered = filtered.filter(
              (item) => new Date(item.created_at) >= filterDate
            );
            break;
          case "month":
            filterDate.setMonth(now.getMonth() - 1);
            filtered = filtered.filter(
              (item) => new Date(item.created_at) >= filterDate
            );
            break;
        }
      }

      return filtered;
    });

    const totalItems = computed(() => filteredItems.value.length);
    const totalPages = computed(() =>
      Math.ceil(totalItems.value / itemsPerPage.value)
    );

    const paginatedItems = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value;
      const end = start + itemsPerPage.value;
      return filteredItems.value.slice(start, end);
    });

    const visiblePages = computed(() => {
      const total = totalPages.value;
      const current = currentPage.value;
      const pages = [];

      if (total <= 7) {
        for (let i = 1; i <= total; i++) {
          pages.push(i);
        }
      } else {
        if (current <= 4) {
          for (let i = 1; i <= 5; i++) pages.push(i);
          pages.push("...");
          pages.push(total);
        } else if (current >= total - 3) {
          pages.push(1);
          pages.push("...");
          for (let i = total - 4; i <= total; i++) pages.push(i);
        } else {
          pages.push(1);
          pages.push("...");
          for (let i = current - 1; i <= current + 1; i++) pages.push(i);
          pages.push("...");
          pages.push(total);
        }
      }

      return pages;
    });

    const canApprove = computed(() => {
      return (
        authStore.user?.role === "Admin" ||
        authStore.user?.role === "Supervisor"
      );
    });

    const canReject = computed(() => {
      return (
        authStore.user?.role === "Admin" ||
        authStore.user?.role === "Supervisor"
      );
    });

    // Methods
    const loadPendingItems = async () => {
      loading.value = true;
      try {
        // For now, using mock data. Replace with actual API call
        const mockData = [
          {
            id: 1,
            target_name: "วัดพระแก้ว",
            address: "123 ถนนเจริญกรุง",
            district: "บางรัก",
            province: "กรุงเทพมหานคร",
            status: "PendingReview",
            created_by: 1,
            created_by_name: "พ.ต.ท.สมชาย ใจดี",
            created_at: "2024-01-15T10:30:00Z",
            submitted_at: "2024-01-15T14:00:00Z",
            days_pending: 3,
            temple_type_name: "วัดราชวรวิหาร",
            denomination_name: "มหานิกาย",
            monk_count: 15,
            attachment_count: 5,
            review_comments: null,
          },
          {
            id: 2,
            target_name: "วัดอรุณราชวราราม",
            address: "158 ถนนอรุณอมรินทร์",
            district: "บางกอกใหญ่",
            province: "กรุงเทพมหานคร",
            status: "UnderReview",
            created_by: 2,
            created_by_name: "พ.ต.อ.วิชัย รักดี",
            created_at: "2024-01-14T09:15:00Z",
            submitted_at: "2024-01-14T16:30:00Z",
            days_pending: 4,
            temple_type_name: "วัดวรวิหาร",
            denomination_name: "มหานิกาย",
            monk_count: 25,
            attachment_count: 8,
            review_comments: "กำลังตรวจสอบข้อมูลเพิ่มเติม",
          },
          {
            id: 3,
            target_name: "วัดโพธิ์",
            address: "2 ถนนเจตุพล",
            district: "พระนคร",
            province: "กรุงเทพมหานคร",
            status: "NeedsRevision",
            created_by: 3,
            created_by_name: "พ.ต.ท.นิรันดร์ ยุติธรรม",
            created_at: "2024-01-13T11:45:00Z",
            submitted_at: "2024-01-13T17:20:00Z",
            days_pending: 5,
            temple_type_name: "วัดราชมงคล",
            denomination_name: "มหานิกาย",
            monk_count: 35,
            attachment_count: 12,
            review_comments: "ต้องเพิ่มข้อมูลบุคลากรและรูปถ่ายเพิ่มเติม",
          },
        ];

        items.value = mockData;
      } catch (error) {
        console.error("Error loading pending items:", error);
        showToast("เกิดข้อผิดพลาดในการโหลดข้อมูล", "error");
      } finally {
        loading.value = false;
      }
    };

    const refreshData = () => {
      loadPendingItems();
    };

    const formatDate = (dateString) => {
      if (!dateString) return "-";
      const date = new Date(dateString);
      return date.toLocaleDateString("th-TH", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    const getStatusText = (status) => {
      const statusMap = {
        Draft: "ร่าง",
        PendingReview: "รอตรวจสอบ",
        UnderReview: "กำลังตรวจสอบ",
        NeedsRevision: "ต้องแก้ไข",
        Approved: "อนุมัติแล้ว",
        Rejected: "ไม่อนุมัติ",
      };
      return statusMap[status] || status;
    };

    const getStatusBadgeClass = (status) => {
      const classMap = {
        Draft: "bg-secondary",
        PendingReview: "bg-warning text-dark",
        UnderReview: "bg-info",
        NeedsRevision: "bg-danger",
        Approved: "bg-success",
        Rejected: "bg-dark",
      };
      return classMap[status] || "bg-secondary";
    };

    const viewDetail = (item) => {
      router.push(`/surveys/temples/${item.id}`);
    };

    const editItem = (item) => {
      router.push(`/surveys/temples/${item.id}/edit`);
    };

    const approveItem = (item) => {
      selectedItem.value = item;
      approvalComment.value = "";
      approveModal.show();
    };

    const rejectItem = (item) => {
      selectedItem.value = item;
      rejectionReason.value = "";
      rejectModal.show();
    };

    const confirmApproval = async () => {
      if (!selectedItem.value) return;

      processing.value = true;
      try {
        // Mock API call - replace with actual service call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Update item status
        const itemIndex = items.value.findIndex(
          (item) => item.id === selectedItem.value.id
        );
        if (itemIndex !== -1) {
          items.value[itemIndex].status = "Approved";
          items.value[itemIndex].review_comments = approvalComment.value;
        }

        showToast("อนุมัติข้อมูลสำเร็จ", "success");
        approveModal.hide();
      } catch (error) {
        console.error("Error approving item:", error);
        showToast("เกิดข้อผิดพลาดในการอนุมัติ", "error");
      } finally {
        processing.value = false;
      }
    };

    const confirmRejection = async () => {
      if (!selectedItem.value || !rejectionReason.value.trim()) return;

      processing.value = true;
      try {
        // Mock API call - replace with actual service call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Update item status
        const itemIndex = items.value.findIndex(
          (item) => item.id === selectedItem.value.id
        );
        if (itemIndex !== -1) {
          items.value[itemIndex].status = "NeedsRevision";
          items.value[itemIndex].review_comments = rejectionReason.value;
        }

        showToast("ส่งกลับให้แก้ไขแล้ว", "success");
        rejectModal.hide();
      } catch (error) {
        console.error("Error rejecting item:", error);
        showToast("เกิดข้อผิดพลาดในการส่งกลับ", "error");
      } finally {
        processing.value = false;
      }
    };

    // Lifecycle
    onMounted(async () => {
      await loadPendingItems();

      // Initialize modals
      approveModal = new Modal(document.getElementById("approveModal"));
      rejectModal = new Modal(document.getElementById("rejectModal"));
    });

    return {
      loading,
      processing,
      items,
      searchQuery,
      filterStatus,
      filterDate,
      currentPage,
      itemsPerPage,
      selectedItem,
      approvalComment,
      rejectionReason,
      totalPending,
      filteredItems,
      totalItems,
      totalPages,
      paginatedItems,
      visiblePages,
      canApprove,
      canReject,
      authStore,

      // Methods
      refreshData,
      formatDate,
      getStatusText,
      getStatusBadgeClass,
      viewDetail,
      editItem,
      approveItem,
      rejectItem,
      confirmApproval,
      confirmRejection,
    };
  },
};
</script>

<style scoped>
.pending-reviews-container {
  padding: 1rem;
  max-width: 1400px;
  margin: 0 auto;
}

.warning-icon {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.temple-avatar {
  background: #fff3cd;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.status-info {
  text-align: center;
}

.card {
  border: none;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.form-label.required::after {
  content: " *";
  color: #dc3545;
}

@media (max-width: 768px) {
  .pending-reviews-container {
    padding: 0.5rem;
  }

  .stats-info {
    text-align: left;
    margin-top: 1rem;
  }

  .row.align-items-center > .col-md-6 {
    margin-bottom: 1rem;
  }
}
</style>
