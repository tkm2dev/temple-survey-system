import { ref } from "vue";

// Global toast state
const toasts = ref([]);
let toastId = 0;

export function useToast() {
  const showToast = (message, type = "info", duration = 5000) => {
    const id = ++toastId;
    const toast = {
      id,
      message,
      type,
      visible: true,
      timestamp: Date.now(),
    };

    toasts.value.push(toast);

    // Auto remove toast after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  };

  const removeToast = (id) => {
    const index = toasts.value.findIndex((toast) => toast.id === id);
    if (index > -1) {
      toasts.value[index].visible = false;
      // Remove from array after animation
      setTimeout(() => {
        const currentIndex = toasts.value.findIndex((toast) => toast.id === id);
        if (currentIndex > -1) {
          toasts.value.splice(currentIndex, 1);
        }
      }, 300);
    }
  };

  const clearAllToasts = () => {
    toasts.value.forEach((toast) => {
      toast.visible = false;
    });
    setTimeout(() => {
      toasts.value.splice(0);
    }, 300);
  };

  // Convenience methods
  const showSuccess = (message, duration = 5000) => {
    return showToast(message, "success", duration);
  };

  const showError = (message, duration = 7000) => {
    return showToast(message, "error", duration);
  };

  const showWarning = (message, duration = 6000) => {
    return showToast(message, "warning", duration);
  };

  const showInfo = (message, duration = 5000) => {
    return showToast(message, "info", duration);
  };

  return {
    toasts,
    showToast,
    removeToast,
    clearAllToasts,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
}
