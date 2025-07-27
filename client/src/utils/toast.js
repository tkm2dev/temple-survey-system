/**
 * Toast Notification Utility
 * แทนที่การใช้ alert() ด้วย Toast notifications ที่สวยงาม
 */

export const showToast = (message, type = "info", duration = 3000) => {
  // Remove existing toasts
  const existingToasts = document.querySelectorAll(".custom-toast");
  existingToasts.forEach((toast) => toast.remove());

  // Create toast element
  const toast = document.createElement("div");
  toast.className = `custom-toast toast show position-fixed`;
  toast.style.cssText = `
    top: 20px;
    right: 20px;
    z-index: 9999;
    min-width: 300px;
    max-width: 400px;
    animation: slideInRight 0.3s ease-out;
  `;

  // Toast types and their styles
  const toastStyles = {
    success: {
      bg: "bg-success",
      icon: "bi-check-circle-fill",
      textClass: "text-white",
    },
    error: {
      bg: "bg-danger",
      icon: "bi-exclamation-triangle-fill",
      textClass: "text-white",
    },
    warning: {
      bg: "bg-warning",
      icon: "bi-exclamation-triangle-fill",
      textClass: "text-dark",
    },
    info: {
      bg: "bg-info",
      icon: "bi-info-circle-fill",
      textClass: "text-white",
    },
  };

  const style = toastStyles[type] || toastStyles.info;

  toast.innerHTML = `
    <div class="toast-body ${style.bg} ${
    style.textClass
  } rounded d-flex align-items-center p-3">
      <i class="bi ${style.icon} me-3 fs-5"></i>
      <div class="flex-grow-1">${message}</div>
      <button type="button" class="btn-close btn-close-${
        style.textClass === "text-white" ? "white" : "dark"
      } ms-3" 
              onclick="this.closest('.custom-toast').remove()"></button>
    </div>
  `;

  // Add CSS animation
  if (!document.getElementById("toast-animations")) {
    const styleSheet = document.createElement("style");
    styleSheet.id = "toast-animations";
    styleSheet.textContent = `
      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOutRight {
        from {
          transform: translateX(0);
          opacity: 1;  
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
      .custom-toast.removing {
        animation: slideOutRight 0.3s ease-in forwards;
      }
      
      /* Mobile responsive */
      @media (max-width: 768px) {
        .custom-toast {
          top: 10px !important;
          left: 10px !important;
          right: 10px !important;
          min-width: auto !important;
          max-width: none !important;
        }
      }
    `;
    document.head.appendChild(styleSheet);
  }

  // Add to DOM
  document.body.appendChild(toast);

  // Auto remove after duration
  if (duration > 0) {
    setTimeout(() => {
      toast.classList.add("removing");
      setTimeout(() => {
        if (toast.parentNode) {
          toast.remove();
        }
      }, 300);
    }, duration);
  }

  return toast;
};

// Convenience methods
export const showSuccessToast = (message, duration = 3000) => {
  return showToast(message, "success", duration);
};

export const showErrorToast = (message, duration = 4000) => {
  return showToast(message, "error", duration);
};

export const showWarningToast = (message, duration = 4000) => {
  return showToast(message, "warning", duration);
};

export const showInfoToast = (message, duration = 3000) => {
  return showToast(message, "info", duration);
};

// Confirmation toast (แทน confirm dialog)
export const showConfirmToast = (message, onConfirm, onCancel = null) => {
  const toast = document.createElement("div");
  toast.className = "custom-toast toast show position-fixed";
  toast.style.cssText = `
    top: 20px;
    right: 20px;
    z-index: 9999;
    min-width: 350px;
    max-width: 450px;
    animation: slideInRight 0.3s ease-out;
  `;

  toast.innerHTML = `
    <div class="toast-body bg-warning text-dark rounded p-3">
      <div class="d-flex align-items-start mb-3">
        <i class="bi bi-question-circle-fill me-3 fs-5 mt-1"></i>
        <div class="flex-grow-1">${message}</div>
      </div>
      <div class="d-flex gap-2 justify-content-end">
        <button type="button" class="btn btn-outline-secondary btn-sm px-3" data-action="cancel">
          ยกเลิก
        </button>
        <button type="button" class="btn btn-warning btn-sm px-3" data-action="confirm">
          ตกลง
        </button>
      </div>
    </div>
  `;

  // Handle button clicks
  toast.addEventListener("click", (e) => {
    if (e.target.dataset.action === "confirm") {
      toast.remove();
      if (onConfirm) onConfirm();
    } else if (e.target.dataset.action === "cancel") {
      toast.remove();
      if (onCancel) onCancel();
    }
  });

  document.body.appendChild(toast);
  return toast;
};

// Loading toast for async operations
export const showLoadingToast = (message = "กำลังดำเนินการ...") => {
  const toast = document.createElement("div");
  toast.className = "custom-toast toast show position-fixed";
  toast.style.cssText = `
    top: 20px;
    right: 20px;
    z-index: 9999;
    min-width: 300px;
    animation: slideInRight 0.3s ease-out;
  `;

  toast.innerHTML = `
    <div class="toast-body bg-primary text-white rounded d-flex align-items-center p-3">
      <div class="spinner-border spinner-border-sm me-3" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <div class="flex-grow-1">${message}</div>
    </div>
  `;

  document.body.appendChild(toast);
  return toast;
};
