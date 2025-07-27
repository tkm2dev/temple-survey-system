<template>
  <div class="survey-create">
    <!-- Mobile Header -->
    <div class="d-md-none bg-white border-bottom sticky-top">
      <div class="d-flex align-items-center p-3">
        <router-link to="/surveys" class="btn btn-link p-0 me-3">
          <i class="bi bi-arrow-left fs-5"></i>
        </router-link>
        <h5 class="mb-0 flex-grow-1">สร้างแบบสำรวจใหม่</h5>
      </div>
    </div>

    <!-- Desktop Header -->
    <div class="d-none d-md-block survey-header mb-4">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h2 class="mb-1">
            <i class="bi bi-clipboard-plus me-2 text-primary"></i>
            สร้างแบบสำรวจใหม่
          </h2>
          <p class="text-muted mb-0">
            กรอกข้อมูลแบบสำรวจเพื่อเริ่มการเก็บข้อมูล
          </p>
        </div>
        <router-link to="/surveys" class="btn btn-outline-secondary">
          <i class="bi bi-arrow-left me-2"></i>
          กลับ
        </router-link>
      </div>
    </div>

    <!-- Progress Indicator (Mobile First) -->
    <div class="mb-4">
      <SurveyFormProgress :current-step="currentFormStep" :total-steps="4" />
    </div>

    <form @submit.prevent="submitForm" class="survey-form">
      <!-- Step 1: Basic Information -->
      <div v-show="currentFormStep === 1" class="card mb-4">
        <div class="card-header">
          <h5 class="mb-0">
            <i class="bi bi-info-circle me-2 text-primary"></i>
            ข้อมูลพื้นฐาน (1/4)
          </h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-12 col-md-6">
              <div class="mb-3">
                <label for="targetName" class="form-label">
                  ชื่อเป้าหมายการสำรวจ <span class="text-danger">*</span>
                </label>
                <input
                  v-model="form.target_name"
                  type="text"
                  class="form-control form-control-lg"
                  :class="{ 'is-invalid': errors.target_name }"
                  id="targetName"
                  placeholder="กรอกชื่อเป้าหมายการสำรวจ"
                  required
                />
                <div v-if="errors.target_name" class="invalid-feedback">
                  {{ errors.target_name }}
                </div>
              </div>
            </div>

            <div class="col-12 col-md-6">
              <div class="mb-3">
                <label for="surveyType" class="form-label">
                  ประเภทการสำรวจ <span class="text-danger">*</span>
                </label>
                <select
                  v-model="form.type_id"
                  class="form-select form-select-lg"
                  :class="{ 'is-invalid': errors.type_id }"
                  id="surveyType"
                  required
                >
                  <option value="">เลือกประเภทการสำรวจ</option>
                  <option
                    v-for="type in surveyTypes"
                    :key="type.id"
                    :value="type.id"
                  >
                    {{ type.name }}
                  </option>
                </select>
                <div v-if="errors.type_id" class="invalid-feedback">
                  {{ errors.type_id }}
                </div>
              </div>
            </div>
          </div>

          <div class="row">
            <div class="col-12">
              <div class="mb-3">
                <label for="address" class="form-label">
                  ที่อยู่ <span class="text-danger">*</span>
                </label>
                <textarea
                  v-model="form.address"
                  class="form-control"
                  :class="{ 'is-invalid': errors.address }"
                  id="address"
                  rows="3"
                  placeholder="กรอกที่อยู่อย่างละเอียด"
                  required
                ></textarea>
                <div v-if="errors.address" class="invalid-feedback">
                  {{ errors.address }}
                </div>
              </div>
            </div>
          </div>

          <div class="d-flex justify-content-end">
            <button
              type="button"
              class="btn btn-primary btn-lg"
              @click="nextStep"
            >
              ถัดไป <i class="bi bi-arrow-right ms-2"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Step 2: Location Information -->
      <div v-show="currentFormStep === 2" class="card mb-4">
        <div class="card-header">
          <h5 class="mb-0">
            <i class="bi bi-geo-alt me-2 text-primary"></i>
            ข้อมูลที่ตั้ง (2/4)
          </h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-12 col-md-4">
              <div class="mb-3">
                <label for="province" class="form-label">
                  จังหวัด <span class="text-danger">*</span>
                </label>
                <select
                  v-model="form.province"
                  @change="onProvinceChange"
                  class="form-select form-select-lg"
                  :class="{ 'is-invalid': errors.province }"
                  id="province"
                  required
                >
                  <option value="">เลือกจังหวัด</option>
                  <option
                    v-for="province in provinces"
                    :key="province.id"
                    :value="province.id"
                  >
                    {{ province.name }}
                  </option>
                </select>
                <div v-if="errors.province" class="invalid-feedback">
                  {{ errors.province }}
                </div>
              </div>
            </div>

            <div class="col-12 col-md-4">
              <div class="mb-3">
                <label for="district" class="form-label">
                  อำเภอ/เขต <span class="text-danger">*</span>
                </label>
                <select
                  v-model="form.district"
                  @change="onDistrictChange"
                  class="form-select form-select-lg"
                  :class="{ 'is-invalid': errors.district }"
                  id="district"
                  :disabled="!form.province"
                  required
                >
                  <option value="">เลือกอำเภอ/เขต</option>
                  <option
                    v-for="district in districts"
                    :key="district.id"
                    :value="district.id"
                  >
                    {{ district.name }}
                  </option>
                </select>
                <div v-if="errors.district" class="invalid-feedback">
                  {{ errors.district }}
                </div>
              </div>
            </div>

            <div class="col-12 col-md-4">
              <div class="mb-3">
                <label for="subdistrict" class="form-label">
                  ตำบล/แขวง <span class="text-danger">*</span>
                </label>
                <select
                  v-model="form.subdistrict"
                  class="form-select form-select-lg"
                  :class="{ 'is-invalid': errors.subdistrict }"
                  id="subdistrict"
                  :disabled="!form.district"
                  required
                >
                  <option value="">เลือกตำบล/แขวง</option>
                  <option
                    v-for="subdistrict in subdistricts"
                    :key="subdistrict.id"
                    :value="subdistrict.id"
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

          <!-- GPS Location -->
          <div class="row">
            <div class="col-12">
              <div class="card border-0" style="background-color: #f8f9fa">
                <div class="card-body">
                  <div
                    class="d-flex align-items-center justify-content-between mb-3"
                  >
                    <h6 class="mb-0">
                      <i class="bi bi-geo-alt-fill me-2 text-primary"></i>
                      พิกัด GPS
                    </h6>
                    <button
                      type="button"
                      class="btn btn-outline-primary btn-sm"
                      @click="getCurrentLocation"
                      :disabled="gettingLocation"
                    >
                      <span
                        v-if="gettingLocation"
                        class="spinner-border spinner-border-sm me-2"
                      ></span>
                      <i v-else class="bi bi-crosshair me-2"></i>
                      {{
                        gettingLocation
                          ? "กำลังหาตำแหน่ง..."
                          : "ใช้ตำแหน่งปัจจุบัน"
                      }}
                    </button>
                  </div>

                  <div class="row">
                    <div class="col-6">
                      <div class="form-floating">
                        <input
                          v-model="form.latitude"
                          type="number"
                          step="any"
                          class="form-control"
                          id="latitude"
                          placeholder="0.000000"
                        />
                        <label for="latitude">ละติจูด</label>
                      </div>
                    </div>
                    <div class="col-6">
                      <div class="form-floating">
                        <input
                          v-model="form.longitude"
                          type="number"
                          step="any"
                          class="form-control"
                          id="longitude"
                          placeholder="0.000000"
                        />
                        <label for="longitude">ลองจิจูด</label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="d-flex justify-content-between">
            <button
              type="button"
              class="btn btn-outline-secondary btn-lg"
              @click="prevStep"
            >
              <i class="bi bi-arrow-left me-2"></i> ย้อนกลับ
            </button>
            <button
              type="button"
              class="btn btn-primary btn-lg"
              @click="nextStep"
            >
              ถัดไป <i class="bi bi-arrow-right ms-2"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Step 3: Temple Details (only for temple surveys) -->
      <div v-show="currentFormStep === 3" class="card mb-4">
        <div class="card-header">
          <h5 class="mb-0">
            <i class="bi bi-building me-2 text-primary"></i>
            {{ isTempleType ? "ข้อมูลวัด (3/4)" : "ข้อมูลเพิ่มเติม (3/4)" }}
          </h5>
        </div>
        <div class="card-body">
          <div v-if="isTempleType">
            <div class="row">
              <div class="col-12 col-md-6">
                <div class="mb-3">
                  <label for="templeType" class="form-label">
                    ประเภทวัด <span class="text-danger">*</span>
                  </label>
                  <select
                    v-model="templeDetails.temple_type_id"
                    class="form-select form-select-lg"
                    :class="{ 'is-invalid': errors.temple_type_id }"
                    id="templeType"
                    required
                  >
                    <option value="">เลือกประเภทวัด</option>
                    <option
                      v-for="type in templeTypes"
                      :key="type.id"
                      :value="type.id"
                    >
                      {{ type.name }}
                    </option>
                  </select>
                  <div v-if="errors.temple_type_id" class="invalid-feedback">
                    {{ errors.temple_type_id }}
                  </div>
                </div>
              </div>

              <div class="col-12 col-md-6">
                <div class="mb-3">
                  <label for="denomination" class="form-label">
                    สังกัด/นิกาย <span class="text-danger">*</span>
                  </label>
                  <select
                    v-model="templeDetails.denomination_id"
                    class="form-select form-select-lg"
                    :class="{ 'is-invalid': errors.denomination_id }"
                    id="denomination"
                    required
                  >
                    <option value="">เลือกสังกัด/นิกาย</option>
                    <option
                      v-for="denomination in denominations"
                      :key="denomination.id"
                      :value="denomination.id"
                    >
                      {{ denomination.name }}
                    </option>
                  </select>
                  <div v-if="errors.denomination_id" class="invalid-feedback">
                    {{ errors.denomination_id }}
                  </div>
                </div>
              </div>
            </div>

            <div class="row">
              <div class="col-12 col-md-6">
                <div class="mb-3">
                  <label for="monkCount" class="form-label">
                    จำนวนพระ <span class="text-danger">*</span>
                  </label>
                  <input
                    v-model.number="templeDetails.monk_count"
                    type="number"
                    class="form-control form-control-lg"
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

              <div class="col-12 col-md-6">
                <div class="mb-3">
                  <label for="historySummary" class="form-label">
                    ประวัติสรุป
                  </label>
                  <textarea
                    v-model="templeDetails.history_summary"
                    class="form-control"
                    id="historySummary"
                    rows="3"
                    placeholder="ข้อมูลประวัติโดยสรุป"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
          <div v-else>
            <div class="text-center py-5 text-muted">
              <i class="bi bi-info-circle fs-1 d-block mb-3"></i>
              <p>ข้อมูลเพิ่มเติมจะปรากฏขึ้นตามประเภทการสำรวจที่เลือก</p>
            </div>
          </div>

          <div class="d-flex justify-content-between">
            <button
              type="button"
              class="btn btn-outline-secondary btn-lg"
              @click="prevStep"
            >
              <i class="bi bi-arrow-left me-2"></i> ย้อนกลับ
            </button>
            <button
              type="button"
              class="btn btn-primary btn-lg"
              @click="nextStep"
            >
              ถัดไป <i class="bi bi-arrow-right ms-2"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Step 4: Final Review & Files -->
      <div v-show="currentFormStep === 4" class="card mb-4">
        <div class="card-header">
          <h5 class="mb-0">
            <i class="bi bi-check-circle me-2 text-primary"></i>
            สรุปและไฟล์แนบ (4/4)
          </h5>
        </div>
        <div class="card-body">
          <!-- File Upload Section -->
          <div class="mb-4">
            <h6 class="mb-3">
              <i class="bi bi-file-earmark-image me-2 text-primary"></i>
              ไฟล์แนบ
            </h6>

            <div class="row">
              <div class="col-12">
                <div class="mb-3">
                  <label for="files" class="form-label">อัปโลดไฟล์</label>
                  <input
                    @change="handleFileUpload"
                    type="file"
                    class="form-control form-control-lg"
                    id="files"
                    multiple
                    accept="image/*,.pdf,.doc,.docx"
                  />
                  <div class="form-text">
                    รองรับไฟล์ประเภท: รูปภาพ, PDF, Word (ขนาดไม่เกิน 5MB
                    ต่อไฟล์)
                  </div>
                </div>
              </div>
            </div>

            <!-- File Preview -->
            <div v-if="files.length > 0" class="row">
              <div class="col-12">
                <h6>ไฟล์ที่เลือก:</h6>
                <div class="list-group">
                  <div
                    v-for="(file, index) in files"
                    :key="`file-${index}`"
                    class="list-group-item d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <i class="bi bi-file-earmark me-2 text-primary"></i>
                      {{ file.name }}
                      <small class="text-muted ms-2"
                        >({{ formatFileSize(file.size) }})</small
                      >
                    </div>
                    <button
                      type="button"
                      class="btn btn-outline-danger btn-sm"
                      @click="removeFile(index)"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Summary Section -->
          <div class="alert alert-info">
            <h6 class="alert-heading">
              <i class="bi bi-info-circle me-2"></i>
              สรุปข้อมูล
            </h6>
            <hr />
            <p class="mb-1">
              <strong>ชื่อเป้าหมาย:</strong>
              {{ form.target_name || "ยังไม่ระบุ" }}
            </p>
            <p class="mb-1">
              <strong>ประเภทการสำรวจ:</strong>
              {{ selectedSurveyTypeName || "ยังไม่ระบุ" }}
            </p>
            <p class="mb-1">
              <strong>ที่อยู่:</strong> {{ form.address || "ยังไม่ระบุ" }}
            </p>
            <p class="mb-0">
              <strong>ไฟล์แนบ:</strong> {{ files.length }} ไฟล์
            </p>
          </div>

          <div class="d-flex justify-content-between">
            <button
              type="button"
              class="btn btn-outline-secondary btn-lg"
              @click="prevStep"
            >
              <i class="bi bi-arrow-left me-2"></i> ย้อนกลับ
            </button>
            <button
              type="submit"
              class="btn btn-success btn-lg"
              :disabled="isSubmitting"
            >
              <span
                v-if="isSubmitting"
                class="spinner-border spinner-border-sm me-2"
              ></span>
              <i v-else class="bi bi-check-lg me-2"></i>
              {{ isSubmitting ? "กำลังบันทึก..." : "บันทึกแบบสำรวจ" }}
            </button>
          </div>
        </div>
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
import SurveyFormProgress from "@/components/surveys/SurveyFormProgress.vue";
import moment from "moment";

export default {
  name: "SurveyCreate",
  components: {
    SurveyFormProgress,
  },
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();

    const loading = ref(false);
    const isSubmitting = ref(false);
    const gettingLocation = ref(false);
    const currentFormStep = ref(1);

    // Master data
    const surveyTypes = ref([]);
    const provinces = ref([]);
    const districts = ref([]);
    const subdistricts = ref([]);
    const denominations = ref([]);
    const templeTypes = ref([]);
    const positions = ref([]);
    const banks = ref([]);

    // Form data
    const form = reactive({
      target_name: "",
      type_id: "",
      address: "",
      province: "",
      district: "",
      subdistrict: "",
      latitude: "",
      longitude: "",
      surveyor_id: authStore.user?.id || "",
      status: "draft",
      notes: "",
    });

    // Temple specific data
    const templeDetails = reactive({
      temple_type_id: "",
      denomination_id: "",
      monk_count: 0,
      history_summary: "",
    });

    // Files
    const files = ref([]);

    // Personnel and Bank Accounts (for temple surveys)
    const personnel = ref([]);
    const bankAccounts = ref([]);

    // Errors
    const errors = ref({});

    // Computed properties
    const isTempleType = computed(() => {
      const selectedType = surveyTypes.value.find(
        (type) => type.id === form.type_id
      );
      return selectedType?.name?.toLowerCase().includes("วัด") || false;
    });

    const selectedSurveyTypeName = computed(() => {
      const selectedType = surveyTypes.value.find(
        (type) => type.id === form.type_id
      );
      return selectedType?.name || "";
    });

    // Methods
    const nextStep = () => {
      if (validateCurrentStep()) {
        if (currentFormStep.value < 4) {
          currentFormStep.value++;
        }
      }
    };

    const prevStep = () => {
      if (currentFormStep.value > 1) {
        currentFormStep.value--;
      }
    };

    const validateCurrentStep = () => {
      errors.value = {};
      let isValid = true;

      if (currentFormStep.value === 1) {
        if (!form.target_name.trim()) {
          errors.value.target_name = "กรุณากรอกชื่อเป้าหมายการสำรวจ";
          isValid = false;
        }
        if (!form.type_id) {
          errors.value.type_id = "กรุณาเลือกประเภทการสำรวจ";
          isValid = false;
        }
        if (!form.address.trim()) {
          errors.value.address = "กรุณากรอกที่อยู่";
          isValid = false;
        }
      }

      if (currentFormStep.value === 2) {
        if (!form.province) {
          errors.value.province = "กรุณาเลือกจังหวัด";
          isValid = false;
        }
        if (!form.district) {
          errors.value.district = "กรุณาเลือกอำเภอ/เขต";
          isValid = false;
        }
        if (!form.subdistrict) {
          errors.value.subdistrict = "กรุณาเลือกตำบล/แขวง";
          isValid = false;
        }
      }

      if (currentFormStep.value === 3 && isTempleType.value) {
        if (!templeDetails.temple_type_id) {
          errors.value.temple_type_id = "กรุณาเลือกประเภทวัด";
          isValid = false;
        }
        if (!templeDetails.denomination_id) {
          errors.value.denomination_id = "กรุณาเลือกสังกัด/นิกาย";
          isValid = false;
        }
        if (!templeDetails.monk_count || templeDetails.monk_count < 0) {
          errors.value.monk_count = "กรุณาระบุจำนวนพระ";
          isValid = false;
        }
      }

      return isValid;
    };

    const getCurrentLocation = () => {
      if (!navigator.geolocation) {
        alert("เบราว์เซอร์ของคุณไม่รองรับการหาตำแหน่ง GPS");
        return;
      }

      gettingLocation.value = true;

      navigator.geolocation.getCurrentPosition(
        (position) => {
          form.latitude = position.coords.latitude.toFixed(6);
          form.longitude = position.coords.longitude.toFixed(6);
          gettingLocation.value = false;
        },
        (error) => {
          console.error("Error getting location:", error);
          alert(
            "ไม่สามารถหาตำแหน่งได้ กรุณาตรวจสอบการตั้งค่าตำแหน่งในเบราว์เซอร์"
          );
          gettingLocation.value = false;
        }
      );
    };

    const handleFileUpload = (event) => {
      const selectedFiles = Array.from(event.target.files);

      selectedFiles.forEach((file) => {
        if (file.size > 5 * 1024 * 1024) {
          alert(`ไฟล์ ${file.name} มีขนาดใหญ่เกิน 5MB`);
          return;
        }
        files.value.push(file);
      });
    };

    const removeFile = (index) => {
      files.value.splice(index, 1);
    };

    const formatFileSize = (bytes) => {
      if (bytes === 0) return "0 Bytes";
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
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
        } catch (error) {
          console.error("Error loading districts:", error);
        }
      }
    };

    const onDistrictChange = async () => {
      form.subdistrict = "";
      subdistricts.value = [];

      if (form.district) {
        try {
          const response = await masterDataService.getSubdistricts(
            form.district
          );
          subdistricts.value = response.data;
        } catch (error) {
          console.error("Error loading subdistricts:", error);
        }
      }
    };

    const submitForm = async () => {
      if (!validateCurrentStep()) {
        return;
      }

      isSubmitting.value = true;

      try {
        // Prepare form data
        const formData = new FormData();

        // Basic form data
        Object.keys(form).forEach((key) => {
          if (form[key] !== null && form[key] !== "") {
            formData.append(key, form[key]);
          }
        });

        // Temple details if applicable
        if (isTempleType.value) {
          Object.keys(templeDetails).forEach((key) => {
            if (templeDetails[key] !== null && templeDetails[key] !== "") {
              formData.append(`temple_${key}`, templeDetails[key]);
            }
          });
        }

        // Files
        files.value.forEach((file, index) => {
          formData.append(`files`, file);
        });

        // Submit
        const response = await surveyService.createSurvey(formData);

        if (response.data.success) {
          alert("สร้างแบบสำรวจเรียบร้อยแล้ว");
          router.push("/surveys");
        } else {
          throw new Error(response.data.message || "เกิดข้อผิดพลาด");
        }
      } catch (error) {
        console.error("Error creating survey:", error);
        alert("เกิดข้อผิดพลาดในการสร้างแบบสำรวจ");
      } finally {
        isSubmitting.value = false;
      }
    };

    const loadMasterData = async () => {
      loading.value = true;
      try {
        const [
          surveyTypesRes,
          provincesRes,
          denominationsRes,
          templeTypesRes,
          positionsRes,
          banksRes,
        ] = await Promise.all([
          masterDataService.getSurveyTypes(),
          masterDataService.getProvinces(),
          masterDataService.getDenominations(),
          masterDataService.getTempleTypes(),
          masterDataService.getPositions(),
          masterDataService.getBanks(),
        ]);

        surveyTypes.value = surveyTypesRes.data;
        provinces.value = provincesRes.data;
        denominations.value = denominationsRes.data;
        templeTypes.value = templeTypesRes.data;
        positions.value = positionsRes.data;
        banks.value = banksRes.data;
      } catch (error) {
        console.error("Error loading master data:", error);
        alert("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      loadMasterData();
    });

    return {
      loading,
      isSubmitting,
      gettingLocation,
      currentFormStep,
      surveyTypes,
      provinces,
      districts,
      subdistricts,
      denominations,
      templeTypes,
      positions,
      banks,
      form,
      templeDetails,
      files,
      personnel,
      bankAccounts,
      errors,
      isTempleType,
      selectedSurveyTypeName,
      nextStep,
      prevStep,
      validateCurrentStep,
      getCurrentLocation,
      handleFileUpload,
      removeFile,
      formatFileSize,
      onProvinceChange,
      onDistrictChange,
      submitForm,
      loadMasterData,
    };
  },
};
</script>

<style scoped>
.survey-create {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

.survey-header {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
}

.survey-form {
  max-width: 100%;
}

.card {
  border: none;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.2s ease;
}

.card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.card-header {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 1px solid #dee2e6;
  border-radius: 12px 12px 0 0 !important;
}

.form-control-lg,
.form-select-lg {
  font-size: 1.1rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 2px solid #e9ecef;
  transition: all 0.2s ease;
}

.form-control-lg:focus,
.form-select-lg:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.15);
}

.btn-lg {
  padding: 0.75rem 1.5rem;
  font-size: 1.1rem;
  border-radius: 8px;
  font-weight: 500;
}

.sticky-top {
  z-index: 1020;
}

.list-group-item {
  border-radius: 8px;
  margin-bottom: 0.5rem;
  border: 1px solid #e9ecef;
}

.alert {
  border-radius: 12px;
  border: none;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

/* Mobile Optimizations */
@media (max-width: 768px) {
  .survey-create {
    padding: 0.5rem;
  }

  .survey-header {
    padding: 1.5rem;
    border-radius: 8px;
  }

  .card {
    border-radius: 8px;
  }

  .card-header {
    border-radius: 8px 8px 0 0 !important;
  }

  .form-control-lg,
  .form-select-lg {
    font-size: 1rem;
    padding: 0.75rem;
  }

  .btn-lg {
    padding: 0.75rem 1.25rem;
    font-size: 1rem;
  }

  .d-flex.justify-content-between .btn {
    flex: 1;
    margin: 0 0.25rem;
  }

  .row .col-12 {
    margin-bottom: 1rem;
  }
}

@media (max-width: 575.98px) {
  .row .col-12.col-md-6,
  .row .col-12.col-md-4 {
    margin-bottom: 1rem;
  }

  .d-flex.justify-content-between {
    flex-direction: column;
    gap: 0.75rem;
  }

  .d-flex.justify-content-between .btn {
    width: 100%;
    margin: 0;
  }
}
</style>
