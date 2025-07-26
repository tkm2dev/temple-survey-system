<template>
  <div class="placeholder-page">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-12 col-md-8 col-lg-6">
          <div class="text-center">
            <div class="placeholder-icon mb-4">
              <i
                class="bi bi-person-circle text-primary"
                style="font-size: 4rem"
              ></i>
            </div>

            <h2>ข้อมูลส่วนตัว</h2>
            <p class="text-muted mb-4">
              หน้านี้อยู่ระหว่างการพัฒนา กรุณารอการอัปเดตในเวอร์ชันถัดไป
            </p>

            <div class="d-flex gap-3 justify-content-center">
              <button class="btn btn-outline-secondary" @click="goBack">
                <i class="bi bi-arrow-left me-2"></i>
                กลับหน้าก่อนหน้า
              </button>
              <router-link to="/" class="btn btn-primary">
                <i class="bi bi-house me-2"></i>
                กลับหน้าแรก
              </router-link>
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
  name: "ProfilePage",
  setup() {
    const router = useRouter();

    const goBack = () => {
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
.placeholder-page {
  min-height: 80vh;
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.placeholder-icon {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

@media (max-width: 575.98px) {
  .d-flex.gap-3 {
    flex-direction: column;
  }

  .d-flex.gap-3 .btn,
  .d-flex.gap-3 .btn-link {
    width: 100%;
  }
}
</style>
