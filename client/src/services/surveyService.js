import api from "./api";

// Survey Service
export const surveyService = {
  // Get all surveys
  async getSurveys(params = {}) {
    const response = await api.get("/surveys", { params });
    return response.data;
  },

  // Get single survey
  async getSurvey(id) {
    const response = await api.get(`/surveys/${id}`);
    return response.data;
  },

  // Create survey
  async createSurvey(formData) {
    const response = await api.post("/surveys", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Update survey
  async updateSurvey(id, formData) {
    const response = await api.put(`/surveys/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Delete survey
  async deleteSurvey(id) {
    const response = await api.delete(`/surveys/${id}`);
    return response.data;
  },

  // Get survey attachments
  async getSurveyAttachments(surveyId) {
    const response = await api.get(`/surveys/${surveyId}/attachments`);
    return response.data;
  },

  // Download attachment
  async downloadAttachment(attachmentId) {
    const response = await api.get(`/attachments/${attachmentId}/download`, {
      responseType: "blob",
    });
    return response;
  },

  // Get survey activity logs
  async getSurveyActivityLogs(surveyId) {
    const response = await api.get(`/surveys/${surveyId}/activity-logs`);
    return response.data;
  },

  // Update survey status
  async updateSurveyStatus(id, status, notes = "") {
    const response = await api.patch(`/surveys/${id}/status`, {
      status,
      notes,
    });
    return response.data;
  },

  // Get survey statistics
  async getStatistics() {
    const response = await api.get("/surveys/statistics");
    return response.data;
  },

  // Bulk operations
  async bulkUpdateStatus(surveyIds, status) {
    const response = await api.patch("/surveys/bulk/status", {
      surveyIds,
      status,
    });
    return response.data;
  },

  async bulkDeleteSurveys(surveyIds) {
    const response = await api.delete("/surveys/bulk", {
      data: { surveyIds },
    });
    return response.data;
  },
};

export default surveyService;
