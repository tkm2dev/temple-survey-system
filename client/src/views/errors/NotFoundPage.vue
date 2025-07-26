<template>
  <div class="error-page">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-12 col-md-8 col-lg-6">
          <div class="text-center">
            <div class="error-illustration mb-4">
              <i class="bi bi-search text-muted" style="font-size: 6rem"></i>
            </div>

            <h1 class="display-1 fw-bold text-primary-custom">404</h1>
            <h2 class="mb-3">ไม่พบหน้าที่ต้องการ</h2>
            <p class="text-muted mb-4">
              ขออภัย เราไม่พบหน้าที่คุณกำลังค้นหา
              ลิงก์อาจเสียหายหรือหน้าดังกล่าวอาจถูกย้ายไปแล้ว
            </p>

            <div class="mb-4">
              <div class="input-group">
                <input
                  v-model="searchQuery"
                  type="text"
                  class="form-control"
                  placeholder="ลองค้นหาสิ่งที่ต้องการ..."
                  @keypress.enter="handleSearch"
                />
                <button class="btn btn-outline-secondary" @click="handleSearch">
                  <i class="bi bi-search"></i>
                </button>
              </div>
            </div>

            <div
              class="d-flex flex-column flex-sm-row gap-3 justify-content-center mb-4"
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

            <!-- Quick Links -->
            <div class="row text-start">
              <div class="col-12">
                <h6 class="mb-3">ลิงก์ที่อาจเป็นประโยชน์:</h6>
                <ul class="list-unstyled">
                  <li class="mb-2">
                    <router-link to="/surveys" class="text-decoration-none">
                      <i class="bi bi-clipboard-data me-2"></i>
                      ข้อมูลการสำรวจ
                    </router-link>
                  </li>
                  <li class="mb-2">
                    <router-link
                      to="/surveys/create"
                      class="text-decoration-none"
                    >
                      <i class="bi bi-plus-circle me-2"></i>
                      สร้างการสำรวจใหม่
                    </router-link>
                  </li>
                  <li class="mb-2">
                    <router-link to="/profile" class="text-decoration-none">
                      <i class="bi bi-person me-2"></i>
                      ข้อมูลส่วนตัว
                    </router-link>
                  </li>
                </ul>
              </div>
            </div>

            <div class="mt-4">
              <small class="text-muted">
                หากปัญหายังคงอยู่ กรุณาติดต่อ:
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
import { ref } from "vue";
import { useRouter } from "vue-router";

export default {
  name: "NotFoundPage",
  setup() {
    const router = useRouter();
    const searchQuery = ref("");

    const goBack = () => {
      // Check if there's history to go back to
      if (window.history.length > 1) {
        router.go(-1);
      } else {
        router.push("/");
      }
    };

    const handleSearch = () => {
      if (searchQuery.value.trim()) {
        // Redirect to surveys list with search query
        router.push({
          path: "/surveys",
          query: { search: searchQuery.value.trim() },
        });
      }
    };

    return {
      searchQuery,
      goBack,
      handleSearch,
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
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

.display-1 {
  font-size: 4rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.list-unstyled a {
  color: var(--text-primary);
  transition: color 0.2s ease-in-out;
}

.list-unstyled a:hover {
  color: var(--primary-color);
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
