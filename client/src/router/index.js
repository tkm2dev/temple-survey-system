import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

// Layout Components
import AuthLayout from "@/layouts/AuthLayout.vue";
import DashboardLayout from "@/layouts/DashboardLayout.vue";

// Auth Pages
import LoginPage from "@/views/auth/LoginPage.vue";
import RegisterPage from "@/views/auth/RegisterPage.vue";
import DigitalVerificationPage from "@/views/auth/DigitalVerificationPage.vue";

// Dashboard Pages
import DashboardHome from "@/views/dashboard/DashboardHome.vue";

// Survey Pages
import SurveyList from "@/views/surveys/SurveyList.vue";
import SurveyDetail from "@/views/surveys/SurveyDetail.vue";
import SurveyCreate from "@/views/surveys/SurveyCreate.vue";
import SurveyEdit from "@/views/surveys/SurveyEdit.vue";

// User Management Pages
import UserList from "@/views/users/UserList.vue";
import UserDetail from "@/views/users/UserDetail.vue";
import UserCreate from "@/views/users/UserCreate.vue";
import UserEdit from "@/views/users/UserEdit.vue";

// Admin Pages
import PendingUsersPage from "@/views/admin/PendingUsersPage.vue";
import SystemSettingsPage from "@/views/admin/SystemSettingsPage.vue";

// Master Data Pages
import MasterDataList from "@/views/master-data/MasterDataList.vue";

// Audit Pages
import AuditLogs from "@/views/audit/AuditLogs.vue";

// Profile Pages
import Profile from "@/views/profile/Profile.vue";

// Settings Pages
import EnhancedSettingsPageBootstrap from "@/views/EnhancedSettingsPageBootstrap.vue";

// Error Pages
import NotFoundPage from "@/views/errors/NotFoundPage.vue";
import UnauthorizedPage from "@/views/errors/UnauthorizedPage.vue";

const routes = [
  // Auth Routes
  {
    path: "/auth",
    component: AuthLayout,
    children: [
      {
        path: "login",
        name: "Login",
        component: LoginPage,
        meta: {
          requiresGuest: true,
          title: "เข้าสู่ระบบ",
        },
      },
      {
        path: "register",
        name: "Register",
        component: RegisterPage,
        meta: {
          requiresGuest: true,
          title: "ลงทะเบียนใช้งาน",
        },
      },
      {
        path: "digital-verification",
        name: "DigitalVerification",
        component: DigitalVerificationPage,
        meta: {
          requiresGuest: true,
          title: "ลงทะเบียนพร้อมยืนยันตัวตน",
        },
      },
    ],
  },

  // Direct register route redirect
  {
    path: "/register",
    redirect: "/register",
  },

  // Dashboard Routes
  {
    path: "/",
    component: DashboardLayout,
    meta: { requiresAuth: true },
    children: [
      // Dashboard Home
      {
        path: "",
        name: "Dashboard",
        component: DashboardHome,
        meta: {
          title: "หน้าแรก",
          breadcrumb: [{ text: "หน้าแรก" }],
        },
      },

      // Survey Management
      {
        path: "surveys",
        name: "SurveyList",
        component: SurveyList,
        meta: {
          title: "จัดการข้อมูลการสำรวจ",
          breadcrumb: [
            { text: "หน้าแรก", to: "/" },
            { text: "ข้อมูลการสำรวจ" },
          ],
        },
      },
      {
        path: "surveys/create",
        name: "SurveyCreate",
        component: SurveyCreate,
        meta: {
          title: "สร้างการสำรวจใหม่",
          roles: ["Admin", "Surveyor"],
          breadcrumb: [
            { text: "หน้าแรก", to: "/" },
            { text: "ข้อมูลการสำรวจ", to: "/surveys" },
            { text: "สร้างใหม่" },
          ],
        },
      },
      {
        path: "surveys/:id",
        name: "SurveyDetail",
        component: SurveyDetail,
        meta: {
          title: "รายละเอียดการสำรวจ",
          breadcrumb: [
            { text: "หน้าแรก", to: "/" },
            { text: "ข้อมูลการสำรวจ", to: "/surveys" },
            { text: "รายละเอียด" },
          ],
        },
      },
      {
        path: "surveys/:id/edit",
        name: "SurveyEdit",
        component: SurveyEdit,
        meta: {
          title: "แก้ไขการสำรวจ",
          roles: ["Admin", "Surveyor"],
          breadcrumb: [
            { text: "หน้าแรก", to: "/" },
            { text: "ข้อมูลการสำรวจ", to: "/surveys" },
            { text: "แก้ไข" },
          ],
        },
      },

      // User Management (Admin only)
      {
        path: "users",
        name: "UserList",
        component: UserList,
        meta: {
          title: "จัดการผู้ใช้งาน",
          roles: ["Admin"],
          breadcrumb: [
            { text: "หน้าแรก", to: "/" },
            { text: "จัดการผู้ใช้งาน" },
          ],
        },
      },
      {
        path: "users/pending",
        name: "PendingUsers",
        component: PendingUsersPage,
        meta: {
          title: "ผู้ใช้งานที่รออนุมัติ",
          roles: ["Admin"],
          breadcrumb: [
            { text: "หน้าแรก", to: "/" },
            { text: "จัดการผู้ใช้งาน", to: "/users" },
            { text: "รออนุมัติ" },
          ],
        },
      },
      {
        path: "users/create",
        name: "UserCreate",
        component: UserCreate,
        meta: {
          title: "สร้างผู้ใช้ใหม่",
          roles: ["Admin"],
          breadcrumb: [
            { text: "หน้าแรก", to: "/" },
            { text: "จัดการผู้ใช้งาน", to: "/users" },
            { text: "สร้างใหม่" },
          ],
        },
      },
      {
        path: "users/:id",
        name: "UserDetail",
        component: UserDetail,
        meta: {
          title: "รายละเอียดผู้ใช้",
          roles: ["Admin"],
          breadcrumb: [
            { text: "หน้าแรก", to: "/" },
            { text: "จัดการผู้ใช้งาน", to: "/users" },
            { text: "รายละเอียด" },
          ],
        },
      },
      {
        path: "users/:id/edit",
        name: "UserEdit",
        component: UserEdit,
        meta: {
          title: "แก้ไขผู้ใช้",
          roles: ["Admin"],
          breadcrumb: [
            { text: "หน้าแรก", to: "/" },
            { text: "จัดการผู้ใช้งาน", to: "/users" },
            { text: "แก้ไข" },
          ],
        },
      },

      // Master Data Management (Admin only)
      {
        path: "master-data",
        name: "MasterDataList",
        component: MasterDataList,
        meta: {
          title: "จัดการข้อมูลหลัก",
          roles: ["Admin"],
          breadcrumb: [{ text: "หน้าแรก", to: "/" }, { text: "ข้อมูลหลัก" }],
        },
      },

      // Audit Logs (Admin only)
      {
        path: "audit",
        name: "AuditLogs",
        component: AuditLogs,
        meta: {
          title: "ประวัติการใช้งาน",
          roles: ["Admin"],
          breadcrumb: [
            { text: "หน้าแรก", to: "/" },
            { text: "ประวัติการใช้งาน" },
          ],
        },
      },

      // Profile
      {
        path: "profile",
        name: "Profile",
        component: Profile,
        meta: {
          title: "ข้อมูลส่วนตัว",
          breadcrumb: [{ text: "หน้าแรก", to: "/" }, { text: "ข้อมูลส่วนตัว" }],
        },
      },

      // Settings - Unified Settings Page
      {
        path: "settings",
        alias: "system-settings",
        name: "Settings",
        component: EnhancedSettingsPageBootstrap,
        meta: {
          title: "การตั้งค่า",
          breadcrumb: [{ text: "หน้าแรก", to: "/" }, { text: "การตั้งค่า" }],
        },
      },
    ],
  },

  // Error Pages
  {
    path: "/unauthorized",
    name: "Unauthorized",
    component: UnauthorizedPage,
    meta: { title: "ไม่มีสิทธิ์เข้าถึง" },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: NotFoundPage,
    meta: { title: "ไม่พบหน้าที่ต้องการ" },
  },

  // Redirect root to login if not authenticated
  {
    path: "/login",
    redirect: "/auth/login",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
});

// Navigation Guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // Set page title
  if (to.meta.title) {
    document.title = `${to.meta.title} | ระบบสำรวจข้อมูลวัด`;
  }

  // Check if route requires authentication
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      return next("/auth/login");
    }

    // Check role-based access
    if (to.meta.roles && !to.meta.roles.includes(authStore.user?.role)) {
      return next("/unauthorized");
    }
  }

  // Check if route is for guests only (login page when already authenticated)
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    return next("/");
  }

  next();
});

export default router;
