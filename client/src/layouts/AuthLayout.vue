<template>
  <div class="auth-layout">
    <div class="auth-background">
      <div class="container-fluid">
        <div class="row justify-content-center align-items-center min-vh-100">
          <div class="col-12 col-md-6 col-lg-4">
            <div class="auth-card">
              <div class="text-center mb-4">
                <div class="auth-logo mb-3">
                  <i
                    class="bi bi-building text-primary"
                    style="font-size: 3rem"
                  ></i>
                </div>
                <h2 class="text-primary-custom fw-bold">
                  ระบบสำรวจข้อมูลภาคสนาม
                </h2>
                <p class="text-muted">Field Survey Data Collection System</p>
              </div>

              <router-view />

              <div class="text-center mt-4">
                <small class="text-muted">
                  © 2025 Government Agency. All rights reserved.
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "AuthLayout",
};
</script>

<style scoped>
.auth-layout {
  min-height: 100vh;
  background: linear-gradient(135deg, #2c5aa0 0%, #4e7bb8 100%);
  position: relative;
}

.auth-background::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(
      circle at 20% 80%,
      rgba(255, 255, 255, 0.1) 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 80% 20%,
      rgba(255, 255, 255, 0.1) 0%,
      transparent 50%
    );
}

.auth-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 1rem;
  padding: 2.5rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 1;
}

.auth-logo {
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

/* Mobile responsive adjustments */
@media (max-width: 575.98px) {
  .auth-card {
    margin: 1rem;
    padding: 2rem 1.5rem;
  }
}
</style>
