<template>
  <div class="survey-create">
    <!-- Header Section -->
    <div class="survey-header mb-4">
      <div class="d-flex justify-content-between align-items-start mb-3">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb">
            <li class="breadcrumb-item">
              <router-link to="/" class="text-decoration-none"
                >หน้าแรก</router-link
              >
            </li>
            <li class="breadcrumb-item">
              <router-link to="/surveys" class="text-decoration-none"
                >ข้อมูลการสำรวจ</router-link
              >
            </li>
            <li class="breadcrumb-item active" aria-current="page">
              สร้างการสำรวจใหม่
            </li>
          </ol>
        </nav>

        <button class="btn btn-outline-secondary btn-sm" @click="goBack">
          <i class="bi bi-arrow-left me-1"></i>
          กลับ
        </button>
      </div>

      <h2>
        <i class="bi bi-plus-circle me-2"></i>
        สร้างการสำรวจใหม่
      </h2>
    </div>

    <!-- Form Section -->
    <form @submit.prevent="handleSubmit" class="survey-form">
      <!-- Basic Information Card -->
      <div class="card mb-4">
        <div class="card-header">
          <h5 class="mb-0">
            <i class="bi bi-info-circle me-2"></i>
            ข้อมูลพื้นฐาน
          </h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <div class="mb-3">
                <label for="targetName" class="form-label">
                  ชื่อเป้าหมายการสำรวจ <span class="text-danger">*</span>
                </label>
                <input
                  v-model="form.target_name"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': errors.target_name }"
                  id="targetName"
                  placeholder="ระบุชื่อเป้าหมายการสำรวจ"
                  required
                />
                <div v-if="errors.target_name" class="invalid-feedback">
                  {{ errors.target_name }}
                </div>
              </div>
            </div>

            <div class="col-md-6">
              <div class="mb-3">
                <label for="surveyType" class="form-label">
                  ประเภทการสำรวจ <span class="text-danger">*</span>
                </label>
                <select
                  v-model="form.survey_type"
                  class="form-select"
                  :class="{ 'is-invalid': errors.survey_type }"
                  id="surveyType"
                  required
                  @change="onSurveyTypeChange"
                >
                  <option value="">เลือกประเภทการสำรวจ</option>
                  <option
                    v-for="type in surveyTypes"
                    :key="type.id"
                    :value="type.name"
                  >
                    {{ type.name }}
                  </option>
                </select>
                <div v-if="errors.survey_type" class="invalid-feedback">
                  {{ errors.survey_type }}
                </div>
              </div>
            </div>
          </div>

          <div class="row">
            <div class="col-md-4">
              <div class="mb-3">
                <label for="province" class="form-label">
                  จังหวัด <span class="text-danger">*</span>
                </label>
                <select
                  v-model="form.province"
                  class="form-select"
                  :class="{ 'is-invalid': errors.province }"
                  id="province"
                  required
                  @change="onProvinceChange"
                >
                  <option value="">เลือกจังหวัด</option>
                  <option
                    v-for="province in provinces"
                    :key="province.id"
                    :value="province.name"
                  >
                    {{ province.name }}
                  </option>
                </select>
                <div v-if="errors.province" class="invalid-feedback">
                  {{ errors.province }}
                </div>
              </div>
            </div>

            <div class="col-md-4">
              <div class="mb-3">
                <label for="district" class="form-label">
                  อำเภอ <span class="text-danger">*</span>
                </label>
                <select
                  v-model="form.district"
                  class="form-select"
                  :class="{ 'is-invalid': errors.district }"
                  id="district"
                  required
                  :disabled="!form.province"
                  @change="onDistrictChange"
                >
                  <option value="">เลือกอำเภอ</option>
                  <option
                    v-for="district in districts"
                    :key="district.id"
                    :value="district.name"
                  >
                    {{ district.name }}
                  </option>
                </select>
                <div v-if="errors.district" class="invalid-feedback">
                  {{ errors.district }}
                </div>
              </div>
            </div>

            <div class="col-md-4">
              <div class="mb-3">
                <label for="subdistrict" class="form-label">
                  ตำบล <span class="text-danger">*</span>
                </label>
                <select
                  v-model="form.subdistrict"
                  class="form-select"
                  :class="{ 'is-invalid': errors.subdistrict }"
                  id="subdistrict"
                  required
                  :disabled="!form.district"
                >
                  <option value="">เลือกตำบล</option>
                  <option
                    v-for="subdistrict in subdistricts"
                    :key="subdistrict.id"
                    :value="subdistrict.name"
                  >
                    {{ subdistrict.name }}
                  </option>
                </select>
                <div v-if="errors.subdistrict" class="invalid-feedback">
                  {{ errors.subdistrict }}
                </div>
              </div>
            </div>
          </div>

          <div class="row">
            <div class="col-md-6">
              <div class="mb-3">
                <label for="surveyDate" class="form-label">
                  วันที่เริ่มสำรวจ <span class="text-danger">*</span>
                </label>
                <input
                  v-model="form.survey_date"
                  type="date"
                  class="form-control"
                  :class="{ 'is-invalid': errors.survey_date }"
                  id="surveyDate"
                  required
                  :min="today"
                />
                <div v-if="errors.survey_date" class="invalid-feedback">
                  {{ errors.survey_date }}
                </div>
              </div>
            </div>

            <div class="col-md-6">
              <div class="mb-3">
                <label for="surveyor" class="form-label">
                  ผู้สำรวจ <span class="text-danger">*</span>
                </label>
                <select
                  v-model="form.surveyor_id"
                  class="form-select"
                  :class="{ 'is-invalid': errors.surveyor_id }"
                  id="surveyor"
                  required
                  :disabled="isCurrentUserSurveyor"
                >
                  <option value="">เลือกผู้สำรวจ</option>
                  <option
                    v-for="surveyor in surveyors"
                    :key="surveyor.id"
                    :value="surveyor.id"
                  >
                    {{ surveyor.name }}
                  </option>
                </select>
                <div v-if="errors.surveyor_id" class="invalid-feedback">
                  {{ errors.surveyor_id }}
                </div>
              </div>
            </div>
          </div>

          <div class="mb-3">
            <label for="notes" class="form-label">หมายเหตุ</label>
            <textarea
              v-model="form.notes"
              class="form-control"
              :class="{ 'is-invalid': errors.notes }"
              id="notes"
              rows="3"
              placeholder="ระบุหมายเหตุเพิ่มเติม (ถ้ามี)"
            ></textarea>
            <div v-if="errors.notes" class="invalid-feedback">
              {{ errors.notes }}
            </div>
          </div>
        </div>
      </div>

      <!-- Temple Details Card (show only for Temple survey type) -->
      <div v-if="form.survey_type === 'Temple'" class="card mb-4">
        <div class="card-header">
          <h5 class="mb-0">
            <i class="bi bi-building me-2"></i>
            ข้อมูลวัด
          </h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <div class="mb-3">
                <label for="templeName" class="form-label">
                  ชื่อวัด <span class="text-danger">*</span>
                </label>
                <input
                  v-model="templeDetails.temple_name"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': errors.temple_name }"
                  id="templeName"
                  placeholder="ระบุชื่อวัด"
                  required
                />
                <div v-if="errors.temple_name" class="invalid-feedback">
                  {{ errors.temple_name }}
                </div>
              </div>
            </div>

            <div class="col-md-6">
              <div class="mb-3">
                <label for="sect" class="form-label">
                  นิกาย <span class="text-danger">*</span>
                </label>
                <select
                  v-model="templeDetails.sect"
                  class="form-select"
                  :class="{ 'is-invalid': errors.sect }"
                  id="sect"
                  required
                >
                  <option value="">เลือกนิกาย</option>
                  <option
                    v-for="sect in sects"
                    :key="sect.id"
                    :value="sect.name"
                  >
                    {{ sect.name }}
                  </option>
                </select>
                <div v-if="errors.sect" class="invalid-feedback">
                  {{ errors.sect }}
                </div>
              </div>
            </div>
          </div>

          <div class="row">
            <div class="col-md-6">
              <div class="mb-3">
                <label for="monkCount" class="form-label">
                  จำนวนพระ <span class="text-danger">*</span>
                </label>
                <input
                  v-model.number="templeDetails.monk_count"
                  type="number"
                  class="form-control"
                  :class="{ 'is-invalid': errors.monk_count }"
                  id="monkCount"
                  min="0"
                  placeholder="0"
                  required
                />
                <div v-if="errors.monk_count" class="invalid-feedback">
                  {{ errors.monk_count }}
                </div>
              </div>
            </div>

            <div class="col-md-6">
              <div class="mb-3">
                <label for="noviceCount" class="form-label">
                  จำนวนเณร <span class="text-danger">*</span>
                </label>
                <input
                  v-model.number="templeDetails.novice_count"
                  type="number"
                  class="form-control"
                  :class="{ 'is-invalid': errors.novice_count }"
                  id="noviceCount"
                  min="0"
                  placeholder="0"
                  required
                />
                <div v-if="errors.novice_count" class="invalid-feedback">
                  {{ errors.novice_count }}
                </div>
              </div>
            </div>
          </div>

          <div class="row">
            <div class="col-md-6">
              <div class="mb-3">
                <label for="phone" class="form-label">เบอร์โทรศัพท์</label>
                <input
                  v-model="templeDetails.phone"
                  type="tel"
                  class="form-control"
                  :class="{ 'is-invalid': errors.phone }"
                  id="phone"
                  placeholder="0X-XXXX-XXXX"
                />
                <div v-if="errors.phone" class="invalid-feedback">
                  {{ errors.phone }}
                </div>
              </div>
            </div>

            <div class="col-md-6">
              <div class="mb-3">
                <label for="email" class="form-label">อีเมล</label>
                <input
                  v-model="templeDetails.email"
                  type="email"
                  class="form-control"
                  :class="{ 'is-invalid': errors.email }"
                  id="email"
                  placeholder="example@domain.com"
                />
                <div v-if="errors.email" class="invalid-feedback">
                  {{ errors.email }}
                </div>
              </div>
            </div>
          </div>

          <div class="row">
            <div class="col-md-6">
              <div class="mb-3">
                <label for="latitude" class="form-label">ละติจูด</label>
                <input
                  v-model.number="templeDetails.latitude"
                  type="number"
                  class="form-control"
                  :class="{ 'is-invalid': errors.latitude }"
                  id="latitude"
                  step="any"
                  placeholder="13.7563"
                />
                <div v-if="errors.latitude" class="invalid-feedback">
                  {{ errors.latitude }}
                </div>
              </div>
            </div>

            <div class="col-md-6">
              <div class="mb-3">
                <label for="longitude" class="form-label">ลองจิจูด</label>
                <input
                  v-model.number="templeDetails.longitude"
                  type="number"
                  class="form-control"
                  :class="{ 'is-invalid': errors.longitude }"
                  id="longitude"
                  step="any"
                  placeholder="100.5018"
                />
                <div v-if="errors.longitude" class="invalid-feedback">
                  {{ errors.longitude }}
                </div>
              </div>
            </div>
          </div>

          <div class="mb-3">
            <label for="description" class="form-label"
              >รายละเอียดเพิ่มเติม</label
            >
            <textarea
              v-model="templeDetails.description"
              class="form-control"
              :class="{ 'is-invalid': errors.description }"
              id="description"
              rows="3"
              placeholder="ระบุรายละเอียดเพิ่มเติมเกี่ยวกับวัด (ถ้ามี)"
            ></textarea>
            <div v-if="errors.description" class="invalid-feedback">
              {{ errors.description }}
            </div>
          </div>
        </div>
      </div>

      <!-- File Upload Card -->
      <div class="card mb-4">
        <div class="card-header">
          <h5 class="mb-0">
            <i class="bi bi-paperclip me-2"></i>
            ไฟล์แนบ
          </h5>
        </div>
        <div class="card-body">
          <div class="mb-3">
            <input
              ref="fileInput"
              type="file"
              class="form-control"
              multiple
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
              @change="handleFileSelect"
            />
            <div class="form-text">
              รองรับไฟล์: รูปภาพ, PDF, Word, Excel (ขนาดไม่เกิน 10MB ต่อไฟล์)
            </div>
          </div>

          <!-- Selected Files Preview -->
          <div v-if="selectedFiles.length > 0" class="selected-files">
            <h6>ไฟล์ที่เลือก ({{ selectedFiles.length }})</h6>
            <div class="row">
              <div
                v-for="(file, index) in selectedFiles"
                :key="index"
                class="col-12 col-sm-6 col-lg-4 mb-2"
              >
                <div
                  class="file-preview p-2 border rounded d-flex align-items-center"
                >
                  <i
                    :class="getFileIcon(file.type)"
                    class="me-2 text-muted"
                  ></i>
                  <div class="flex-grow-1">
                    <small class="d-block">{{ file.name }}</small>
                    <small class="text-muted">{{
                      formatFileSize(file.size)
                    }}</small>
                  </div>
                  <button
                    type="button"
                    class="btn btn-link btn-sm text-danger p-0"
                    @click="removeFile(index)"
                  >
                    <i class="bi bi-x-circle"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="d-flex gap-3 justify-content-end">
        <button
          type="button"
          class="btn btn-outline-secondary"
          @click="goBack"
          :disabled="loading"
        >
          ยกเลิก
        </button>
        <button type="submit" class="btn btn-primary" :disabled="loading">
          <span
            v-if="loading"
            class="spinner-border spinner-border-sm me-2"
          ></span>
          <i v-else class="bi bi-check-circle me-2"></i>
          สร้างการสำรวจ
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import surveyService from "@/services/surveyService";
import masterDataService from "@/services/masterDataService";
import moment from "moment";

export default {
  name: "SurveyCreate",
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();

    const loading = ref(false);
    const fileInput = ref(null);
    const selectedFiles = ref([]);

    // Master data
    const surveyTypes = ref([]);
    const provinces = ref([]);
    const districts = ref([]);
    const subdistricts = ref([]);
    const sects = ref([]);
    const surveyors = ref([]);

    // Form data
    const form = reactive({
      target_name: "",
      survey_type: "",
      province: "",
      district: "",
      subdistrict: "",
      survey_date: "",
      surveyor_id: "",
      notes: "",
    });

    const templeDetails = reactive({
      temple_name: "",
      sect: "",
      monk_count: 0,
      novice_count: 0,
      phone: "",
      email: "",
      latitude: null,
      longitude: null,
      description: "",
    });

    const errors = ref({});

    // Computed properties
    const today = computed(() => {
      return moment().format("YYYY-MM-DD");
    });

    const isCurrentUserSurveyor = computed(() => {
      return authStore.user?.role === "Surveyor";
    });

    // Methods
    const loadMasterData = async () => {
      try {
        // Load survey types
        const typesResponse = await masterDataService.getSurveyTypes();
        surveyTypes.value = typesResponse.data;

        // Load provinces
        const provincesResponse = await masterDataService.getProvinces();
        provinces.value = provincesResponse.data;

        // Load sects
        const sectsResponse = await masterDataService.getSects();
        sects.value = sectsResponse.data;

        // Load surveyors
        const surveyorsResponse = await masterDataService.getSurveyors();
        surveyors.value = surveyorsResponse.data;

        // If current user is surveyor, auto-select them
        if (isCurrentUserSurveyor.value) {
          form.surveyor_id = authStore.user.id;
        }
      } catch (err) {
        console.error("Error loading master data:", err);
      }
    };

    const onSurveyTypeChange = () => {
      // Reset temple details when survey type changes
      if (form.survey_type !== "Temple") {
        Object.keys(templeDetails).forEach((key) => {
          if (typeof templeDetails[key] === "string") {
            templeDetails[key] = "";
          } else if (typeof templeDetails[key] === "number") {
            templeDetails[key] = 0;
          } else {
            templeDetails[key] = null;
          }
        });
      }
    };

    const onProvinceChange = async () => {
      form.district = "";
      form.subdistrict = "";
      districts.value = [];
      subdistricts.value = [];

      if (form.province) {
        try {
          const response = await masterDataService.getDistricts(form.province);
          districts.value = response.data;
        } catch (err) {
          console.error("Error loading districts:", err);
        }
      }
    };

    const onDistrictChange = async () => {
      form.subdistrict = "";
      subdistricts.value = [];

      if (form.district) {
        try {
          const response = await masterDataService.getSubdistricts(
            form.province,
            form.district
          );
          subdistricts.value = response.data;
        } catch (err) {
          console.error("Error loading subdistricts:", err);
        }
      }
    };

    const handleFileSelect = (event) => {
      const files = Array.from(event.target.files);

      // Validate file size (10MB max per file)
      const maxSize = 10 * 1024 * 1024; // 10MB
      const validFiles = files.filter((file) => {
        if (file.size > maxSize) {
          alert(`ไฟล์ ${file.name} มีขนาดใหญ่เกินไป (เกิน 10MB)`);
          return false;
        }
        return true;
      });

      selectedFiles.value = [...selectedFiles.value, ...validFiles];

      // Clear input
      if (fileInput.value) {
        fileInput.value.value = "";
      }
    };

    const removeFile = (index) => {
      selectedFiles.value.splice(index, 1);
    };

    const getFileIcon = (fileType) => {
      if (fileType.startsWith("image/")) return "bi-image";
      if (fileType.includes("pdf")) return "bi-file-earmark-pdf";
      if (fileType.includes("word")) return "bi-file-earmark-word";
      if (fileType.includes("excel") || fileType.includes("spreadsheet"))
        return "bi-file-earmark-excel";
      return "bi-file-earmark";
    };

    const formatFileSize = (bytes) => {
      if (bytes === 0) return "0 Bytes";
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const validateForm = () => {
      errors.value = {};

      // Basic validation
      if (!form.target_name.trim()) {
        errors.value.target_name = "กรุณาระบุชื่อเป้าหมายการสำรวจ";
      }

      if (!form.survey_type) {
        errors.value.survey_type = "กรุณาเลือกประเภทการสำรวจ";
      }

      if (!form.province) {
        errors.value.province = "กรุณาเลือกจังหวัด";
      }

      if (!form.district) {
        errors.value.district = "กรุณาเลือกอำเภอ";
      }

      if (!form.subdistrict) {
        errors.value.subdistrict = "กรุณาเลือกตำบล";
      }

      if (!form.survey_date) {
        errors.value.survey_date = "กรุณาระบุวันที่เริ่มสำรวจ";
      }

      if (!form.surveyor_id) {
        errors.value.surveyor_id = "กรุณาเลือกผู้สำรวจ";
      }

      // Temple details validation
      if (form.survey_type === "Temple") {
        if (!templeDetails.temple_name.trim()) {
          errors.value.temple_name = "กรุณาระบุชื่อวัด";
        }

        if (!templeDetails.sect) {
          errors.value.sect = "กรุณาเลือกนิกาย";
        }

        if (templeDetails.monk_count < 0) {
          errors.value.monk_count = "จำนวนพระต้องเป็นจำนวนที่ไม่ต่ำกว่า 0";
        }

        if (templeDetails.novice_count < 0) {
          errors.value.novice_count = "จำนวนเณรต้องเป็นจำนวนที่ไม่ต่ำกว่า 0";
        }

        // Email validation
        if (
          templeDetails.email &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(templeDetails.email)
        ) {
          errors.value.email = "รูปแบบอีเมลไม่ถูกต้อง";
        }
      }

      return Object.keys(errors.value).length === 0;
    };

    const handleSubmit = async () => {
      if (!validateForm()) {
        return;
      }

      try {
        loading.value = true;

        // Prepare form data
        const formData = new FormData();

        // Basic form data
        Object.keys(form).forEach((key) => {
          if (form[key] !== null && form[key] !== "") {
            formData.append(key, form[key]);
          }
        });

        // Temple details
        if (form.survey_type === "Temple") {
          Object.keys(templeDetails).forEach((key) => {
            if (templeDetails[key] !== null && templeDetails[key] !== "") {
              formData.append(`temple_${key}`, templeDetails[key]);
            }
          });
        }

        // Files
        selectedFiles.value.forEach((file) => {
          formData.append("attachments", file);
        });

        // Create survey
        const response = await surveyService.createSurvey(formData);

        // Redirect to survey detail
        router.push(`/surveys/${response.data.id}`);
      } catch (err) {
        console.error("Error creating survey:", err);

        if (err.response?.data?.errors) {
          errors.value = err.response.data.errors;
        } else {
          alert("เกิดข้อผิดพลาดในการสร้างการสำรวจ กรุณาลองใหม่อีกครั้ง");
        }
      } finally {
        loading.value = false;
      }
    };

    const goBack = () => {
      router.go(-1);
    };

    // Lifecycle
    onMounted(() => {
      loadMasterData();
    });

    return {
      loading,
      fileInput,
      selectedFiles,
      surveyTypes,
      provinces,
      districts,
      subdistricts,
      sects,
      surveyors,
      form,
      templeDetails,
      errors,
      today,
      isCurrentUserSurveyor,
      onSurveyTypeChange,
      onProvinceChange,
      onDistrictChange,
      handleFileSelect,
      removeFile,
      getFileIcon,
      formatFileSize,
      handleSubmit,
      goBack,
    };
  },
};
</script>

<style scoped>
.survey-create {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.survey-header {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.survey-form {
  max-width: 100%;
}

.file-preview {
  transition: box-shadow 0.2s ease-in-out;
}

.file-preview:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.selected-files {
  border-top: 1px solid #dee2e6;
  padding-top: 1rem;
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .survey-create {
    padding: 0.5rem;
  }

  .survey-header {
    padding: 1rem;
  }

  .d-flex.gap-3 {
    flex-direction: column;
  }

  .d-flex.gap-3 .btn {
    width: 100%;
  }
}

@media (max-width: 575.98px) {
  .row .col-md-6,
  .row .col-md-4 {
    margin-bottom: 1rem;
  }

  .file-preview {
    margin-bottom: 0.5rem;
  }
}
</style>
