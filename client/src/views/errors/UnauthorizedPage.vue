<template>
  <div class="error-page">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-12 col-md-8 col-lg-6">
          <div class="text-center">
            <div class="error-illustration mb-4">
              <i
                class="bi bi-exclamation-triangle-fill text-warning"
                style="font-size: 6rem"
              ></i>
            </div>

            <h1 class="display-1 fw-bold text-primary-custom">403</h1>
            <h2 class="mb-3">ไม่มีสิทธิ์เข้าถึง</h2>
            <p class="text-muted mb-4">
              ขออภัย คุณไม่มีสิทธิ์เข้าถึงหน้านี้
              กรุณาติดต่อผู้ดูแลระบบหากคุณคิดว่านี่เป็นความผิดพลาด
            </p>

            <div
              class="d-flex flex-column flex-sm-row gap-3 justify-content-center"
            >
              <button class="btn btn-outline-secondary" @click="goBack">
                <i class="bi bi-arrow-left me-2"></i>
                กลับหน้าก่อนหน้า
              </button>
              <router-link to="/" class="btn btn-primary">
                <i class="bi bi-house me-2"></i>
                กลับหน้าแรก
              </router-link>
            </div>

            <div class="mt-4">
              <small class="text-muted">
                หากคุณต้องการความช่วยเหลือ กรุณาติดต่อ:
                <a
                  href="mailto:support@survey.gov.th"
                  class="text-decoration-none"
                >
                  support@survey.gov.th
                </a>
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useRouter } from "vue-router";

export default {
  name: "UnauthorizedPage",
  setup() {
    const router = useRouter();

    const goBack = () => {
      // Check if there's history to go back to
      if (window.history.length > 1) {
        router.go(-1);
      } else {
        router.push("/");
      }
    };

    return {
      goBack,
    };
  },
};
</script>

<style scoped>
.error-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.error-illustration {
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-20px);
  }
  60% {
    transform: translateY(-10px);
  }
}

.display-1 {
  font-size: 4rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

@media (max-width: 575.98px) {
  .display-1 {
    font-size: 3rem;
  }

  .error-illustration i {
    font-size: 4rem !important;
  }
}
</style>
