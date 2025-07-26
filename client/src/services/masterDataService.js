import api from "./api";

// Master Data Service
export const masterDataService = {
  // Temple management
  async getTemples(params = {}) {
    const response = await api.get("/master-data/temples", { params });
    return response.data;
  },

  async getTemple(id) {
    const response = await api.get(`/master-data/temples/${id}`);
    return response.data;
  },

  async createTemple(templeData) {
    const response = await api.post("/master-data/temples", templeData);
    return response.data;
  },

  async updateTemple(id, templeData) {
    const response = await api.put(`/master-data/temples/${id}`, templeData);
    return response.data;
  },

  async deleteTemple(id) {
    const response = await api.delete(`/master-data/temples/${id}`);
    return response.data;
  },

  // Temple import
  async importTemples(formData) {
    const response = await api.post("/master-data/temples/import", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        console.log(`Temple Upload Progress: ${percentCompleted}%`);
      },
    });
    return response.data;
  },

  // Temple template download
  async downloadTempleTemplate() {
    const response = await api.get("/master-data/temples/template", {
      responseType: "text",
    });
    return {
      success: true,
      data: response.data,
    };
  },

  // Data import
  async importData(formData) {
    const response = await api.post("/master-data/import", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        console.log(`Upload Progress: ${percentCompleted}%`);
      },
    });
    return response.data;
  },

  // Import history
  async getImportHistory(params = {}) {
    const response = await api.get("/master-data/import-history", { params });
    return response.data;
  },

  async getImportDetails(id) {
    const response = await api.get(`/master-data/import-history/${id}`);
    return response.data;
  },

  // Template download
  async downloadTemplate() {
    const response = await api.get("/master-data/template", {
      responseType: "blob",
    });
    return response.data;
  },

  // Statistics
  async getStatistics() {
    const response = await api.get("/master-data/statistics");
    return response.data;
  },

  // Survey Types
  async getSurveyTypes() {
    const response = await api.get("/master-data/survey-types");
    return response.data;
  },

  async createSurveyType(data) {
    const response = await api.post("/master-data/survey-types", data);
    return response.data;
  },

  async updateSurveyType(id, data) {
    const response = await api.put(`/master-data/survey-types/${id}`, data);
    return response.data;
  },

  async deleteSurveyType(id) {
    const response = await api.delete(`/master-data/survey-types/${id}`);
    return response.data;
  },

  // Provinces
  async getProvinces() {
    const response = await api.get("/master-data/provinces");
    return response.data;
  },

  // Districts
  async getDistricts(provinceId = null) {
    const params = provinceId ? { province_id: provinceId } : {};
    const response = await api.get("/master-data/districts", { params });
    return response.data;
  },

  // Subdistricts
  async getSubdistricts(province, district) {
    const response = await api.get(`/master-data/subdistricts`, {
      params: { province, district },
    });
    return response.data;
  },

  async getSubDistricts(districtId = null) {
    const params = districtId ? { district_id: districtId } : {};
    const response = await api.get("/master-data/sub-districts", { params });
    return response.data;
  },

  // Temple Sects
  async getSects() {
    const response = await api.get("/master-data/sects");
    return response.data;
  },

  async createSect(data) {
    const response = await api.post("/master-data/sects", data);
    return response.data;
  },

  async updateSect(id, data) {
    const response = await api.put(`/master-data/sects/${id}`, data);
    return response.data;
  },

  async deleteSect(id) {
    const response = await api.delete(`/master-data/sects/${id}`);
    return response.data;
  },

  // Temple Types
  async getTempleTypes() {
    const response = await api.get("/master-data/temple-types");
    return response.data;
  },

  async createTempleType(data) {
    const response = await api.post("/master-data/temple-types", data);
    return response.data;
  },

  async updateTempleType(id, data) {
    const response = await api.put(`/master-data/temple-types/${id}`, data);
    return response.data;
  },

  async deleteTempleType(id) {
    const response = await api.delete(`/master-data/temple-types/${id}`);
    return response.data;
  },

  // Users (for assignment)
  async getSurveyors() {
    const response = await api.get("/users", {
      params: { role: "Surveyor" },
    });
    return response.data;
  },

  async getReviewers() {
    const response = await api.get("/users", {
      params: { role: "Reviewer" },
    });
    return response.data;
  },

  // User management
  async getUsers(params = {}) {
    const response = await api.get("/master-data/users", { params });
    return response.data;
  },

  async getUser(id) {
    const response = await api.get(`/master-data/users/${id}`);
    return response.data;
  },

  async createUser(userData) {
    const response = await api.post("/master-data/users", userData);
    return response.data;
  },

  async updateUser(id, userData) {
    const response = await api.put(`/master-data/users/${id}`, userData);
    return response.data;
  },

  async deleteUser(id) {
    const response = await api.delete(`/master-data/users/${id}`);
    return response.data;
  },

  // User import
  async importUsers(formData) {
    const response = await api.post("/master-data/users/import", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        console.log(`Upload Progress: ${percentCompleted}%`);
      },
    });
    return response.data;
  },

  // User template download
  async downloadUserTemplate() {
    const response = await api.get("/master-data/users/template", {
      responseType: "text",
    });
    return {
      success: true,
      data: response.data,
    };
  },

  // Police ranks
  async getPoliceRanks() {
    const response = await api.get("/master-data/police-ranks");
    return response.data;
  },

  // Audit system
  async getAuditLogs(params = {}) {
    const response = await api.get("/audit/logs", { params });
    return response.data;
  },

  async createAuditLog(logData) {
    const response = await api.post("/audit/logs", logData);
    return response.data;
  },

  async getAuditStatistics() {
    const response = await api.get("/audit/statistics");
    return response.data;
  },

  // Data validation
  async validateImportData(formData) {
    const response = await api.post("/master-data/validate", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Bulk operations
  async bulkUpdateTemples(updates) {
    const response = await api.patch("/master-data/temples/bulk", { updates });
    return response.data;
  },

  async bulkDeleteTemples(ids) {
    const response = await api.delete("/master-data/temples/bulk", {
      data: { ids },
    });
    return response.data;
  },

  // Export data
  async exportTemples(params = {}) {
    const response = await api.get("/master-data/export/temples", {
      params,
      responseType: "blob",
    });
    return response.data;
  },

  // Search and filter
  async searchTemples(query) {
    const response = await api.get("/master-data/temples/search", {
      params: { q: query },
    });
    return response.data;
  },

  // General master data operations
  async getMasterData(params = {}) {
    const response = await api.get("/master-data", { params });
    return response.data;
  },

  async getMasterDataById(id) {
    const response = await api.get(`/master-data/${id}`);
    return response.data;
  },

  async createMasterData(data) {
    const response = await api.post("/master-data", data);
    return response.data;
  },

  async updateMasterData(id, data) {
    const response = await api.put(`/master-data/${id}`, data);
    return response.data;
  },

  async deleteMasterData(id) {
    const response = await api.delete(`/master-data/${id}`);
    return response.data;
  },

  async getCategories() {
    const response = await api.get("/master-data/categories");
    return response.data;
  },

  async exportMasterData(params = {}) {
    const response = await api.get("/master-data/export", {
      params,
      responseType: "blob",
    });
    return response.data;
  },

  async bulkUpdateStatus(masterDataIds, status) {
    const response = await api.patch("/master-data/bulk/status", {
      masterDataIds,
      status,
    });
    return response.data;
  },

  async bulkDeleteMasterData(masterDataIds) {
    const response = await api.delete("/master-data/bulk", {
      data: { masterDataIds },
    });
    return response.data;
  },

  async getMasterDataByKey(key) {
    const response = await api.get(`/master-data/key/${key}`);
    return response.data;
  },

  async getMasterDataByCategory(category, params = {}) {
    const response = await api.get(`/master-data/category/${category}`, {
      params,
    });
    return response.data;
  },

  async validateJsonValue(value) {
    const response = await api.post("/master-data/validate-json", { value });
    return response.data;
  },

  // Enhanced bulk operations for comprehensive management
  async bulkUpdate(items, updateData) {
    const response = await api.patch("/master-data/bulk/update", {
      items,
      updateData,
    });
    return response.data;
  },

  async bulkStatusChange(ids, status) {
    const response = await api.patch("/master-data/bulk/status-change", {
      ids,
      status,
    });
    return response.data;
  },

  async bulkDelete(ids) {
    const response = await api.delete("/master-data/bulk/delete", {
      data: { ids },
    });
    return response.data;
  },

  async bulkAssign(ids, assignmentData) {
    const response = await api.patch("/master-data/bulk/assign", {
      ids,
      assignmentData,
    });
    return response.data;
  },

  async bulkExport(ids, format = "excel") {
    const response = await api.post(
      "/master-data/bulk/export",
      {
        ids,
        format,
      },
      {
        responseType: "blob",
      }
    );
    return response.data;
  },

  // Advanced pagination and filtering
  async getMasterDataPaginated(params = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = "created_at",
      sortOrder = "desc",
      search = "",
      category = "",
      status = "",
      dateFrom = "",
      dateTo = "",
      ...otherFilters
    } = params;

    const response = await api.get("/master-data/paginated", {
      params: {
        page,
        limit,
        sortBy,
        sortOrder,
        search,
        category,
        status,
        dateFrom,
        dateTo,
        ...otherFilters,
      },
    });
    return response.data;
  },

  // Advanced search with multiple criteria
  async advancedSearch(searchCriteria) {
    const response = await api.post(
      "/master-data/advanced-search",
      searchCriteria
    );
    return response.data;
  },

  // Get filter options for dropdown menus
  async getFilterOptions() {
    const response = await api.get("/master-data/filter-options");
    return response.data;
  },

  // Batch operations with progress tracking
  async batchProcess(operation, data) {
    const response = await api.post(`/master-data/batch/${operation}`, data, {
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        console.log(`Batch Process Progress: ${percentCompleted}%`);
      },
    });
    return response.data;
  },

  // Get batch operation status
  async getBatchStatus(batchId) {
    const response = await api.get(`/master-data/batch/status/${batchId}`);
    return response.data;
  },
};

export default masterDataService;
