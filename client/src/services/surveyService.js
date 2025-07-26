import api from "./api";

// Survey Service
export const surveyService = {
  // Get surveys with pagination and filtering
  async getSurveysPaginated(params = {}) {
    try {
      const response = await api.get("/surveys/paginated", { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

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

  // Get survey statistics
  async getStatistics() {
    try {
      const response = await api.get("/surveys/statistics");
      return response.data.data;
    } catch (error) {
      console.error("Failed to get survey statistics:", error);
      return {
        total: 0,
        completed: 0,
        inProgress: 0,
        draft: 0,
      };
    }
  },

  // Advanced search
  async advancedSearch(searchCriteria) {
    try {
      const response = await api.post(
        "/surveys/advanced-search",
        searchCriteria
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Bulk operations
  async bulkUpdate(surveyIds, updateData) {
    try {
      const response = await api.patch("/surveys/bulk/update", {
        ids: surveyIds,
        data: updateData,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async bulkUpdateStatus(surveyIds, status) {
    try {
      const response = await api.patch("/surveys/bulk/status-change", {
        ids: surveyIds,
        status: status,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async bulkDelete(surveyIds) {
    try {
      const response = await api.delete("/surveys/bulk", {
        data: { ids: surveyIds },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async bulkAssign(surveyIds, surveyorId) {
    try {
      const response = await api.patch("/surveys/bulk/assign", {
        ids: surveyIds,
        surveyor_id: surveyorId,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Export operations
  async bulkExport(surveyIds, format = "xlsx") {
    try {
      const response = await api.post(
        "/surveys/bulk/export",
        {
          ids: surveyIds,
          format: format,
        },
        {
          responseType: "blob",
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async exportAll(filters = {}, format = "xlsx") {
    try {
      const response = await api.post(
        "/surveys/export",
        {
          filters: filters,
          format: format,
        },
        {
          responseType: "blob",
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Import operations
  async importSurveys(file, options = {}) {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("options", JSON.stringify(options));

      const response = await api.post("/surveys/import", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async getImportTemplate() {
    try {
      const response = await api.get("/surveys/import/template", {
        responseType: "blob",
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Batch processing
  async batchProcess(operation, surveyIds, data = {}) {
    try {
      const response = await api.post("/surveys/batch-process", {
        operation: operation,
        ids: surveyIds,
        data: data,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async getBatchStatus(batchId) {
    try {
      const response = await api.get(`/surveys/batch-status/${batchId}`);
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Filter options
  async getFilterOptions() {
    try {
      const response = await api.get("/surveys/filter-options");
      return response.data.data;
    } catch (error) {
      console.error("Failed to get filter options:", error);
      return {
        statuses: [],
        types: [],
        provinces: [],
        surveyors: [],
      };
    }
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

  // Legacy bulk operations (keeping for compatibility)
  async bulkDeleteSurveys(surveyIds) {
    const response = await api.delete("/surveys/bulk", {
      data: { surveyIds },
    });
    return response.data;
  },

  // Survey validation
  async validateSurvey(surveyData) {
    try {
      const response = await api.post("/surveys/validate", surveyData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Survey status management
  async updateStatus(id, status, notes = "") {
    try {
      const response = await api.patch(`/surveys/${id}/status`, {
        status: status,
        notes: notes,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async getStatusHistory(id) {
    try {
      const response = await api.get(`/surveys/${id}/status-history`);
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Survey assignment
  async assignSurveyor(id, surveyorId) {
    try {
      const response = await api.patch(`/surveys/${id}/assign`, {
        surveyor_id: surveyorId,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async unassignSurveyor(id) {
    try {
      const response = await api.patch(`/surveys/${id}/unassign`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Error handling
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      const message =
        data?.message || data?.error || "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์";

      switch (status) {
        case 400:
          throw new Error(`ข้อมูลไม่ถูกต้อง: ${message}`);
        case 401:
          throw new Error("ไม่มีสิทธิ์เข้าถึง กรุณาเข้าสู่ระบบใหม่");
        case 403:
          throw new Error("ไม่มีสิทธิ์ดำเนินการนี้");
        case 404:
          throw new Error("ไม่พบข้อมูลที่ต้องการ");
        case 409:
          throw new Error(`ข้อมูลขัดแย้ง: ${message}`);
        case 422:
          throw new Error(`ข้อมูลไม่ครบถ้วน: ${message}`);
        case 429:
          throw new Error("คำขอมากเกินไป กรุณารอสักครู่");
        case 500:
          throw new Error("เกิดข้อผิดพลาดจากเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง");
        default:
          throw new Error(`เกิดข้อผิดพลาด (${status}): ${message}`);
      }
    } else if (error.request) {
      // Network error
      throw new Error(
        "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต"
      );
    } else {
      // Other error
      throw new Error(error.message || "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ");
    }
  },

  // Utility methods
  formatSurveyData(rawData) {
    return {
      ...rawData,
      created_at: new Date(rawData.created_at),
      updated_at: new Date(rawData.updated_at),
      progress: rawData.progress || 0,
    };
  },

  validateSurveyData(surveyData) {
    const errors = [];

    if (!surveyData.target_name?.trim()) {
      errors.push("ชื่อเป้าหมายจำเป็นต้องระบุ");
    }

    if (!surveyData.type_id) {
      errors.push("ประเภทการสำรวจจำเป็นต้องระบุ");
    }

    if (!surveyData.address?.trim()) {
      errors.push("ที่อยู่จำเป็นต้องระบุ");
    }

    if (!surveyData.province?.trim()) {
      errors.push("จังหวัดจำเป็นต้องระบุ");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },
};

export default surveyService;
