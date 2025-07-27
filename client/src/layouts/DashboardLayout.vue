<template>
  <div
    class="app-layout"
    :class="{
      'sidebar-open': sidebarOpen,
      'sidebar-collapsed': sidebarCollapsed,
    }"
  >
    <!-- Header -->
    <header class="app-header">
      <nav class="navbar navbar-expand-lg navbar-dark px-3">
        <div class="d-flex align-items-center">
          <!-- Mobile Menu Toggle -->
          <button
            class="navbar- // Load notifications loadNotifications(); // Cleanup on unmount onUnmounted(() => { // Cleanup if needed }); });e me-2"
            type="button"
            @click="toggleSidebar"
          >
            <i class="bi bi-list"></i>
          </button>

          <!-- Desktop Sidebar Toggle -->
          <button
            class="btn btn-link text-white d-none d-lg-block p-0 me-3"
            @click="toggleSidebarCollapse"
          >
            <i class="bi bi-list" style="font-size: 1.25rem"></i>
          </button>

          <!-- Brand -->
          <router-link to="/" class="header-brand">
            <i class="bi bi-building me-2"></i>
            <span class="d-none d-sm-inline">ระบบสำรวจข้อมูลวัด</span>
          </router-link>
        </div>

        <div class="d-flex align-items-center">
          <!-- Notifications -->
          <div
            class="dropdown me-3"
            :class="{ show: notificationDropdownOpen }"
          >
            <button
              class="btn btn-link text-white position-relative p-2"
              @click="toggleNotificationDropdown"
            >
              <i class="bi bi-bell" style="font-size: 1.1rem"></i>
              <span
                v-if="notificationStore.unreadCount > 0"
                class="notification-badge"
              >
                {{
                  notificationStore.unreadCount > 99
                    ? "99+"
                    : notificationStore.unreadCount
                }}
              </span>
            </button>
            <div
              class="dropdown-menu dropdown-menu-end"
              :class="{ show: notificationDropdownOpen }"
              style="width: 320px; max-height: 400px; overflow-y: auto"
            >
              <div
                class="dropdown-header d-flex justify-content-between align-items-center"
              >
                <span>การแจ้งเตือน</span>
                <button
                  v-if="notificationStore.unreadCount > 0"
                  class="btn btn-sm btn-link p-0"
                  @click="markAllAsRead"
                >
                  อ่านทั้งหมด
                </button>
              </div>
              <div class="dropdown-divider"></div>

              <div v-if="notificationStore.loading" class="text-center py-3">
                <div
                  class="spinner-border spinner-border-sm"
                  role="status"
                ></div>
              </div>

              <div
                v-else-if="notificationStore.notifications.length === 0"
                class="text-center py-3 text-muted"
              >
                ไม่มีการแจ้งเตือน
              </div>

              <div v-else>
                <div
                  v-for="notification in notificationStore.notifications.slice(
                    0,
                    5
                  )"
                  :key="notification.notification_id"
                  class="dropdown-item py-2 px-3"
                  :class="{ 'bg-light': !notification.is_read }"
                  @click="markAsRead(notification)"
                >
                  <div class="d-flex">
                    <div class="flex-grow-1">
                      <div class="fw-bold">{{ notification.title }}</div>
                      <div class="small text-muted text-truncate">
                        {{ notification.message }}
                      </div>
                      <div class="small text-muted">
                        {{ formatDate(notification.created_at) }}
                      </div>
                    </div>
                    <div class="ms-2">
                      <span
                        v-if="!notification.is_read"
                        class="badge bg-primary rounded-pill"
                      ></span>
                    </div>
                  </div>
                </div>
                <div class="dropdown-divider"></div>
                <div class="text-center">
                  <router-link to="/notifications" class="dropdown-item small">
                    ดูการแจ้งเตือนทั้งหมด
                  </router-link>
                </div>
              </div>
            </div>
          </div>

          <!-- User Menu -->
          <div class="dropdown" :class="{ show: userDropdownOpen }">
            <button
              class="btn btn-link text-white d-flex align-items-center p-0"
              @click="toggleUserDropdown"
            >
              <div class="d-flex align-items-center">
                <div class="bg-white rounded-circle p-2 me-2">
                  <i class="bi bi-person-fill text-primary"></i>
                </div>
                <div class="d-none d-sm-block text-start">
                  <div class="small">{{ authStore.userName }}</div>
                  <div class="small opacity-75">{{ authStore.userRole }}</div>
                </div>
                <i class="bi bi-chevron-down ms-2"></i>
              </div>
            </button>
            <ul
              class="dropdown-menu dropdown-menu-end"
              :class="{ show: userDropdownOpen }"
            >
              <li>
                <button class="dropdown-item" @click="handleProfileClick">
                  <i class="bi bi-person me-2"></i>
                  ข้อมูลส่วนตัว
                </button>
              </li>
              <li>
                <button class="dropdown-item" @click="handleSettingsClick">
                  <i class="bi bi-gear me-2"></i>
                  การตั้งค่า
                </button>
              </li>
              <li><hr class="dropdown-divider" /></li>
              <li>
                <button class="dropdown-item text-danger" @click="logout">
                  <i class="bi bi-box-arrow-right me-2"></i>
                  ออกจากระบบ
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>

    <!-- Sidebar -->
    <aside class="app-sidebar">
      <nav class="sidebar-nav">
        <ul class="nav flex-column">
          <!-- Dashboard -->
          <li class="nav-item">
            <router-link to="/" class="nav-link" exact-active-class="active">
              <i class="bi bi-house-door"></i>
              <span>หน้าแรก</span>
            </router-link>
          </li>

          <!-- Survey Management -->
          <li class="nav-item">
            <router-link to="/surveys" class="nav-link" active-class="active">
              <i class="bi bi-clipboard-data"></i>
              <span>ข้อมูลการสำรวจ</span>
            </router-link>
          </li>

          <!-- User Management (Admin only) -->
          <li v-if="authStore.hasRole('Admin')" class="nav-item">
            <div class="nav-group">
              <router-link to="/users" class="nav-link" active-class="active">
                <i class="bi bi-people"></i>
                <span>จัดการผู้ใช้งาน</span>
              </router-link>
            </div>
          </li>

          <!-- Master Data (Admin only) -->
          <li v-if="authStore.hasRole('Admin')" class="nav-item">
            <router-link
              to="/master-data"
              class="nav-link"
              active-class="active"
            >
              <i class="bi bi-gear"></i>
              <span>ข้อมูลหลัก</span>
            </router-link>
          </li>

          <!-- Audit Logs (Admin only) -->
          <li v-if="authStore.hasRole('Admin')" class="nav-item">
            <router-link to="/audit" class="nav-link" active-class="active">
              <i class="bi bi-clock-history"></i>
              <span>ประวัติการใช้งาน</span>
            </router-link>
          </li>

          <!-- Divider -->
          <li><hr class="dropdown-divider my-2" /></li>

          <!-- Settings -->
          <li class="nav-item">
            <router-link to="/settings" class="nav-link" active-class="active">
              <i class="bi bi-gear-fill"></i>
              <span>การตั้งค่า</span>
            </router-link>
          </li>
        </ul>
      </nav>
    </aside>

    <!-- Main Content -->
    <main class="app-main">
      <!-- Breadcrumb -->
      <nav v-if="$route.meta.breadcrumb" aria-label="breadcrumb" class="mb-4">
        <ol class="breadcrumb">
          <li
            v-for="(item, index) in $route.meta.breadcrumb"
            :key="index"
            class="breadcrumb-item"
            :class="{ active: index === $route.meta.breadcrumb.length - 1 }"
          >
            <router-link
              v-if="item.to && index !== $route.meta.breadcrumb.length - 1"
              :to="item.to"
            >
              {{ item.text }}
            </router-link>
            <span v-else>{{ item.text }}</span>
          </li>
        </ol>
      </nav>

      <!-- Page Content -->
      <div class="fade-in">
        <router-view />
      </div>
    </main>

    <!-- Mobile Overlay -->
    <div
      v-if="sidebarOpen"
      class="position-fixed w-100 h-100 bg-dark bg-opacity-50 d-lg-none"
      style="top: 0; left: 0; z-index: 1019"
      @click="closeSidebar"
    ></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useNotificationStore } from "@/stores/notification";
import axios from "axios";
import moment from "moment";

const router = useRouter();
const authStore = useAuthStore();
const notificationStore = useNotificationStore();

const sidebarOpen = ref(false);
const sidebarCollapsed = ref(
  localStorage.getItem("sidebar_collapsed") === "true"
);

// Dropdown states
const notificationDropdownOpen = ref(false);
const userDropdownOpen = ref(false);

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};

const closeSidebar = () => {
  sidebarOpen.value = false;
};

const toggleSidebarCollapse = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value;
  localStorage.setItem("sidebar_collapsed", sidebarCollapsed.value.toString());
};

// Dropdown toggles
const toggleNotificationDropdown = () => {
  notificationDropdownOpen.value = !notificationDropdownOpen.value;
  userDropdownOpen.value = false; // Close other dropdown
  if (notificationDropdownOpen.value) {
    loadNotifications();
  }
};

const toggleUserDropdown = () => {
  userDropdownOpen.value = !userDropdownOpen.value;
  notificationDropdownOpen.value = false; // Close other dropdown
};

const closeDropdowns = () => {
  notificationDropdownOpen.value = false;
  userDropdownOpen.value = false;
};

const logout = async () => {
  userDropdownOpen.value = false; // Close dropdown first
  if (confirm("คุณต้องการออกจากระบบหรือไม่?")) {
    try {
      await authStore.logout();
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout error:", error);
      alert("เกิดข้อผิดพลาดในการออกจากระบบ");
    }
  }
};

const loadNotifications = async () => {
  await notificationStore.fetchNotifications({ limit: 10 });
};

const markAsRead = async (notification) => {
  if (!notification.is_read) {
    await notificationStore.markAsRead(notification.notification_id);
  }

  // Close dropdown
  notificationDropdownOpen.value = false;

  // Navigate to related content if available
  if (notification.related_target_id) {
    router.push(`/surveys/${notification.related_target_id}`);
  }
};

const markAllAsRead = async () => {
  await notificationStore.markAllAsRead();
};

const handleProfileClick = () => {
  userDropdownOpen.value = false;
  router.push("/profile");
};

const handleSettingsClick = () => {
  userDropdownOpen.value = false;
  router.push("/settings");
};

const formatDate = (date) => {
  return moment(date).locale("th").fromNow();
};

onMounted(async () => {
  // Initialize
  await nextTick();

  // Add click outside listener to close dropdowns
  document.addEventListener("click", (event) => {
    const target = event.target;
    const notificationDropdown = document.querySelector(
      ".dropdown:has(.bi-bell)"
    );
    const userDropdown = document.querySelector(
      ".dropdown:has(.bi-person-fill)"
    );

    if (notificationDropdown && !notificationDropdown.contains(target)) {
      notificationDropdownOpen.value = false;
    }

    if (userDropdown && !userDropdown.contains(target)) {
      userDropdownOpen.value = false;
    }
  });

  // Load initial notifications
  loadNotifications();
});
</script>

<style scoped>
/* ======================================
   Dashboard Layout Styles
   ====================================== */

.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Header Styles */
.app-header {
  height: 56px;
  background: linear-gradient(135deg, #2c5aa0, #4e7bb8);
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1030;
}

.app-header .navbar {
  height: 100%;
  padding: 0 1rem;
}

.header-brand {
  font-weight: 700;
  font-size: 1.25rem;
  color: white !important;
  text-decoration: none;
  display: flex;
  align-items: center;
}

.header-brand:hover {
  color: rgba(255, 255, 255, 0.9) !important;
}

.navbar-toggler {
  border: none;
  padding: 0.25rem 0.5rem;
  color: white;
  font-size: 1.25rem;
}

.navbar-toggler:focus {
  box-shadow: none;
}

/* Notification Badge */
.notification-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  min-width: 18px;
  height: 18px;
  background-color: #dc3545;
  color: white;
  border-radius: 50%;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

/* Sidebar Styles */
.app-sidebar {
  width: 250px;
  background-color: white;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  position: fixed;
  top: 56px;
  left: 0;
  height: calc(100vh - 56px);
  overflow-y: auto;
  z-index: 1020;
  transition: all 0.3s ease-in-out;
}

.sidebar-collapsed .app-sidebar {
  width: 70px;
}

/* Mobile: Hide sidebar by default */
@media (max-width: 991.98px) {
  .app-sidebar {
    transform: translateX(-100%);
  }

  .sidebar-open .app-sidebar {
    transform: translateX(0);
  }
}

/* Sidebar Navigation */
.sidebar-nav {
  padding: 1rem 0;
}

.sidebar-nav .nav {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-nav .nav-item {
  margin-bottom: 0.25rem;
}

.sidebar-nav .nav-link {
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  color: #212529;
  text-decoration: none;
  border-radius: 0;
  transition: all 0.2s ease-in-out;
  font-weight: 500;
}

.sidebar-nav .nav-link:hover {
  background-color: rgba(44, 90, 160, 0.1);
  color: #2c5aa0;
}

.sidebar-nav .nav-link.active {
  background-color: #2c5aa0;
  color: white;
}

.sidebar-nav .nav-link i {
  width: 20px;
  margin-right: 0.75rem;
  text-align: center;
  font-size: 1.1rem;
}

.sidebar-collapsed .sidebar-nav .nav-link {
  padding: 0.75rem;
  justify-content: center;
}

.sidebar-collapsed .sidebar-nav .nav-link span {
  display: none;
}

.sidebar-collapsed .sidebar-nav .nav-link i {
  margin-right: 0;
}

/* Main Content */
.app-main {
  margin-left: 250px;
  margin-top: 56px;
  padding: 2rem;
  min-height: calc(100vh - 56px);
  transition: margin-left 0.3s ease-in-out;
  background-color: #f8f9fa;
}

.sidebar-collapsed .app-main {
  margin-left: 70px;
}

/* Mobile: Full width content */
@media (max-width: 991.98px) {
  .app-main {
    margin-left: 0;
    padding: 1rem;
  }
}

/* Breadcrumb */
.breadcrumb {
  background-color: transparent;
  padding: 0;
  margin-bottom: 1.5rem;
}

.breadcrumb-item {
  font-size: 0.9rem;
}

.breadcrumb-item + .breadcrumb-item::before {
  content: ">";
  color: #6c757d;
}

.breadcrumb-item.active {
  color: #6c757d;
}

/* Dropdown Menus */
.dropdown {
  position: relative;
}

.dropdown-menu {
  border: none;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  border-radius: 0.5rem;
  display: none;
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 1000;
  background-color: white;
  min-width: 160px;
}

.dropdown-menu.show {
  display: block;
}

.dropdown-item {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  display: flex;
  align-items: center;
  color: #212529;
  text-decoration: none;
}

.dropdown-item:hover {
  background-color: rgba(44, 90, 160, 0.1);
  color: #2c5aa0;
}

.dropdown-item.text-danger {
  color: #dc3545 !important;
}

.dropdown-item.text-danger:hover {
  background-color: rgba(220, 53, 69, 0.1);
  color: #dc3545 !important;
}

.dropdown-divider {
  margin: 0.5rem 0;
}

/* Fade Animation */
.fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Mobile Overlay */
.position-fixed {
  position: fixed !important;
}

/* Loading States */
.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

.dropdown-header {
  font-weight: 600;
  color: #495057;
  padding: 0.5rem 1rem;
}

/* User Menu Styling */
.btn-link {
  border: none;
  background: none;
  text-decoration: none;
}

.btn-link:hover {
  text-decoration: none;
}

/* Navigation Group and Submenu Styles */
.nav-group {
  position: relative;
}

.nav-submenu {
  margin: 0;
  padding: 0;
  list-style: none;
  margin-left: 2rem;
  margin-top: 0.25rem;
}

.nav-sublink {
  font-size: 0.875rem;
  padding: 0.4rem 1rem !important;
  color: rgba(255, 255, 255, 0.75) !important;
  position: relative;
}

.nav-sublink:hover {
  color: white !important;
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-sublink.active {
  color: white !important;
  background-color: rgba(255, 255, 255, 0.2);
  border-left: 3px solid #fff;
}

.nav-sublink .badge {
  font-size: 0.7rem;
  padding: 0.2rem 0.4rem;
  border-radius: 0.75rem;
}

/* Responsive adjustments for submenu */
@media (max-width: 991.98px) {
  .nav-submenu {
    margin-left: 1rem;
  }

  .nav-sublink {
    padding: 0.35rem 0.75rem !important;
  }
}

.btn-link:hover {
  text-decoration: none;
}

/* Notification Dropdown */
.dropdown-menu[style*="width: 320px"] {
  min-width: 320px;
}

/* Responsive Design */
@media (max-width: 575.98px) {
  .app-main {
    padding: 1rem 0.5rem;
  }

  .header-brand .d-none.d-sm-inline {
    display: none !important;
  }
}

@media (max-width: 767.98px) {
  .sidebar-nav .nav-link {
    padding: 1rem 1.5rem;
    font-size: 1rem;
  }

  .sidebar-nav .nav-link i {
    font-size: 1.2rem;
    margin-right: 1rem;
  }
}

/* Print Styles */
@media print {
  .app-header,
  .app-sidebar,
  .dropdown {
    display: none !important;
  }

  .app-main {
    margin-left: 0 !important;
    margin-top: 0 !important;
    padding: 0 !important;
  }
}
</style>
