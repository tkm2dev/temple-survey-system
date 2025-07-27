<template>
  <Teleport to="body">
    <div
      class="toast-container position-fixed top-0 end-0 p-3"
      style="z-index: 9999"
    >
      <TransitionGroup name="toast" tag="div">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="['toast', 'show', 'mb-2', `toast-${toast.type}`]"
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <div class="toast-header">
            <div class="toast-icon me-2">
              <i :class="getIconClass(toast.type)"></i>
            </div>
            <strong class="me-auto">{{ getTitle(toast.type) }}</strong>
            <small class="text-muted">{{ getTimeAgo(toast.timestamp) }}</small>
            <button
              type="button"
              class="btn-close btn-close-white"
              @click="removeToast(toast.id)"
              aria-label="Close"
            ></button>
          </div>
          <div class="toast-body">
            {{ toast.message }}
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script>
import { computed } from "vue";
import { useToast } from "@/composables/useToast";

export default {
  name: "ToastContainer",
  setup() {
    const { toasts, removeToast } = useToast();

    const visibleToasts = computed(() => {
      return toasts.value.filter((toast) => toast.visible);
    });

    const getIconClass = (type) => {
      const icons = {
        success: "fas fa-check-circle text-success",
        error: "fas fa-exclamation-circle text-danger",
        warning: "fas fa-exclamation-triangle text-warning",
        info: "fas fa-info-circle text-info",
      };
      return icons[type] || icons.info;
    };

    const getTitle = (type) => {
      const titles = {
        success: "สำเร็จ",
        error: "ข้อผิดพลาด",
        warning: "คำเตือน",
        info: "ข้อมูล",
      };
      return titles[type] || titles.info;
    };

    const getTimeAgo = (timestamp) => {
      const now = Date.now();
      const diff = now - timestamp;
      const seconds = Math.floor(diff / 1000);

      if (seconds < 60) return "เมื่อสักครู่";
      if (seconds < 3600) return `${Math.floor(seconds / 60)} นาทีที่แล้ว`;
      return `${Math.floor(seconds / 3600)} ชั่วโมงที่แล้ว`;
    };

    return {
      toasts: visibleToasts,
      removeToast,
      getIconClass,
      getTitle,
      getTimeAgo,
    };
  },
};
</script>

<style scoped>
.toast-container {
  max-width: 350px;
  width: 100%;
}

.toast {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: none;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border-left: 4px solid transparent;
}

.toast-success {
  border-left-color: #198754;
}

.toast-error {
  border-left-color: #dc3545;
}

.toast-warning {
  border-left-color: #ffc107;
}

.toast-info {
  border-left-color: #0dcaf0;
}

.toast-header {
  background: transparent;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding: 12px 16px;
}

.toast-body {
  padding: 12px 16px;
  font-size: 14px;
  line-height: 1.4;
}

.toast-icon {
  width: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close {
  filter: none;
  opacity: 0.6;
}

.btn-close:hover {
  opacity: 1;
}

/* Toast animations */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-move {
  transition: transform 0.3s ease;
}

@media (max-width: 576px) {
  .toast-container {
    max-width: 100%;
    left: 0;
    right: 0;
    padding: 15px;
  }

  .toast {
    margin: 0 0 10px 0;
  }
}
</style>
