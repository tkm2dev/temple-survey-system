import { defineStore } from "pinia";
import { ref, computed } from "vue";
import authService from "@/services/authService";

export const useAuthStore = defineStore("auth", () => {
  // State
  const token = ref(localStorage.getItem("token"));
  const user = ref(JSON.parse(localStorage.getItem("user") || "null"));
  const loading = ref(false);

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value);
  const userRole = computed(() => user.value?.role);
  const userName = computed(() => {
    if (!user.value) return "";
    return (
      `${user.value.first_name || ""} ${user.value.last_name || ""}`.trim() ||
      user.value.username
    );
  });

  // Actions
  const login = async (credentials) => {
    loading.value = true;
    try {
      const response = await authService.login(credentials);

      if (response.success) {
        const { token: authToken, user: userData } = response.data;

        // Store in state
        token.value = authToken;
        user.value = userData;

        // Store in localStorage
        localStorage.setItem("token", authToken);
        localStorage.setItem("user", JSON.stringify(userData));

        return { success: true, message: response.message };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ";
      return { success: false, message };
    } finally {
      loading.value = false;
    }
  };

  const logout = () => {
    // Clear state
    token.value = null;
    user.value = null;

    // Clear localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const initializeAuth = () => {
    // Auth token is handled by axios interceptor
    return true;
  };

  const updateProfile = (updatedUser) => {
    user.value = { ...user.value, ...updatedUser };
    localStorage.setItem("user", JSON.stringify(user.value));
  };

  const hasRole = (role) => {
    return userRole.value === role;
  };

  const hasAnyRole = (roles) => {
    return roles.includes(userRole.value);
  };

  const can = (permission) => {
    // Define role-based permissions
    const permissions = {
      Admin: [
        "view_all_surveys",
        "create_survey",
        "edit_survey",
        "delete_survey",
        "manage_users",
        "manage_master_data",
        "view_audit_logs",
        "approve_surveys",
      ],
      Reviewer: ["view_all_surveys", "approve_surveys", "edit_survey"],
      Surveyor: ["view_own_surveys", "create_survey", "edit_own_survey"],
    };

    const userPermissions = permissions[userRole.value] || [];
    return userPermissions.includes(permission);
  };

  // Initialize auth on store creation
  initializeAuth();

  return {
    // State
    token,
    user,
    loading,

    // Getters
    isAuthenticated,
    userRole,
    userName,

    // Actions
    login,
    logout,
    initializeAuth,
    updateProfile,
    hasRole,
    hasAnyRole,
    can,
  };
});
