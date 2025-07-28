<template>
  <div class="temple-form-container">
    <!-- Header with Police Identity -->
    <div class="card mb-4 bg-primary text-white">
      <div class="card-body">
        <div class="row align-items-center">
          <div class="col-md-8">
            <div class="d-flex align-items-center">
              <div class="badge-police me-3">
                <i class="bi bi-shield-check fs-2"></i>
              </div>
              <div>
                <h4 class="mb-1">
                  <i class="bi bi-building me-2"></i>
                  แบบฟอร์มบันทึกข้อมูลวัด
                </h4>
                <p class="mb-0 opacity-75">
                  สำหรับเจ้าหน้าที่ตำรวจผู้ปฏิบัติงานภาคสนาม
                </p>
              </div>
            </div>
          </div>
          <div class="col-md-4 text-end">
            <div class="officer-info">
              <div class="small opacity-75">เจ้าหน้าที่บันทึก</div>
              <div class="fw-bold">
                {{ authStore.user?.rank }} {{ authStore.user?.first_name }}
                {{ authStore.user?.last_name }}
              </div>
              <div class="small opacity-75">
                {{ authStore.user?.department }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Form Progress -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="progress-steps">
          <div
            class="step"
            :class="{ active: currentStep >= 1, completed: currentStep > 1 }"
          >
            <div class="step-icon">
              <i class="bi bi-info-circle"></i>
            </div>
            <div class="step-title">ข้อมูลพื้นฐาน</div>
          </div>
          <div
            class="step"
            :class="{ active: currentStep >= 2, completed: currentStep > 2 }"
          >
            <div class="step-icon">
              <i class="bi bi-geo-alt"></i>
            </div>
            <div class="step-title">ที่อยู่และตำแหน่ง</div>
          </div>
          <div
            class="step"
            :class="{ active: currentStep >= 3, completed: currentStep > 3 }"
          >
            <div class="step-icon">
              <i class="bi bi-people"></i>
            </div>
            <div class="step-title">บุคลากร</div>
          </div>
          <div
            class="step"
            :class="{ active: currentStep >= 4, completed: currentStep > 4 }"
          >
            <div class="step-icon">
              <i class="bi bi-bank"></i>
            </div>
            <div class="step-title">บัญชีธนาคาร</div>
          </div>
          <div
            class="step"
            :class="{ active: currentStep >= 5, completed: currentStep > 5 }"
          >
            <div class="step-icon">
              <i class="bi bi-camera"></i>
            </div>
            <div class="step-title">ไฟล์แนบ</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Form Content -->
    <form @submit.prevent="submitForm">
      <!-- Step 1: Basic Information -->
      <div v-if="currentStep === 1" class="card mb-4">
        <div class="card-header bg-light">
          <h5 class="mb-0">
            <i class="bi bi-info-circle text-primary me-2"></i>
            ข้อมูลพื้นฐานของวัด
          </h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-12 mb-3">
              <label class="form-label required">ชื่อวัด</label>
              <input
                v-model="formData.target_name"
                type="text"
                class="form-control form-control-lg"
                placeholder="เช่น วัดพระแก้ว"
                required
                @input="validateStep1"
              />
              <div class="form-text">
                <i class="bi bi-info-circle me-1"></i>
                กรุณาระบุชื่อเต็มของวัดตามป้ายหน้าวัด
              </div>
            </div>

            <div class="col-md-6 mb-3">
              <label class="form-label required">ประเภทวัด</label>
              <select
                v-model="formData.temple_type_id"
                class="form-select"
                required
              >
                <option value="">เลือกประเภทวัด</option>
                <option value="1">วัดราชวรวิหาร</option>
                <option value="2">วัดวรวิหาร</option>
                <option value="3">วัดราชมงคล</option>
                <option value="4">วัดทั่วไป</option>
              </select>
            </div>

            <div class="col-md-6 mb-3">
              <label class="form-label required">สังกัดนิกาย</label>
              <select
                v-model="formData.denomination_id"
                class="form-select"
                required
              >
                <option value="">เลือกนิกาย</option>
                <option value="1">มหานิกาย</option>
                <option value="2">ธรรมยุตนิกาย</option>
              </select>
            </div>

            <div class="col-md-6 mb-3">
              <label class="form-label">จำนวนพระ (รูป)</label>
              <input
                v-model.number="formData.monk_count"
                type="number"
                class="form-control"
                min="0"
                placeholder="จำนวนพระที่ประจำอยู่"
              />
            </div>

            <div class="col-md-6 mb-3">
              <label class="form-label">วันเวลาที่บันทึก</label>
              <input
                v-model="formData.recorded_at"
                type="datetime-local"
                class="form-control"
              />
            </div>

            <div class="col-12 mb-3">
              <label class="form-label">ประวัติและความสำคัญ</label>
              <textarea
                v-model="formData.history_summary"
                class="form-control"
                rows="4"
                placeholder="ระบุประวัติความเป็นมา ความสำคัญทางประวัติศาสตร์ หรือเอกลักษณ์เด่นของวัด"
              ></textarea>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 2: Location -->
      <div v-if="currentStep === 2" class="card mb-4">
        <div class="card-header bg-light">
          <h5 class="mb-0">
            <i class="bi bi-geo-alt text-primary me-2"></i>
            ที่อยู่และตำแหน่งที่ตั้ง
          </h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-12 mb-3">
              <label class="form-label required">ที่อยู่</label>
              <textarea
                v-model="formData.address"
                class="form-control"
                rows="3"
                placeholder="เลขที่ หมู่ ถนน ซอย"
                required
                @input="validateStep2"
              ></textarea>
            </div>

            <div class="col-md-4 mb-3">
              <label class="form-label required">ตำบล/แขวง</label>
              <input
                v-model="formData.subdistrict"
                type="text"
                class="form-control"
                placeholder="ตำบล/แขวง"
                required
              />
            </div>

            <div class="col-md-4 mb-3">
              <label class="form-label required">อำเภอ/เขต</label>
              <input
                v-model="formData.district"
                type="text"
                class="form-control"
                placeholder="อำเภอ/เขต"
                required
              />
            </div>

            <div class="col-md-4 mb-3">
              <label class="form-label required">จังหวัด</label>
              <input
                v-model="formData.province"
                type="text"
                class="form-control"
                placeholder="จังหวัด"
                required
              />
            </div>

            <div class="col-md-6 mb-3">
              <label class="form-label">รหัสไปรษณีย์</label>
              <input
                v-model="formData.postal_code"
                type="text"
                class="form-control"
                placeholder="12345"
                pattern="[0-9]{5}"
              />
            </div>

            <!-- GPS Location -->
            <div class="col-12 mb-3">
              <div class="card bg-light">
                <div class="card-body">
                  <h6 class="card-title">
                    <i class="bi bi-geo-alt-fill text-danger me-2"></i>
                    พิกัด GPS
                  </h6>

                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label class="form-label">ละติจูด (Latitude)</label>
                      <input
                        v-model.number="formData.gps_latitude"
                        type="number"
                        class="form-control"
                        step="any"
                        placeholder="13.7563"
                      />
                    </div>
                    <div class="col-md-6 mb-3">
                      <label class="form-label">ลองจิจูด (Longitude)</label>
                      <input
                        v-model.number="formData.gps_longitude"
                        type="number"
                        class="form-control"
                        step="any"
                        placeholder="100.5018"
                      />
                    </div>
                  </div>

                  <div class="d-grid gap-2 d-md-flex">
                    <button
                      type="button"
                      class="btn btn-success"
                      @click="getCurrentLocation"
                      :disabled="gettingLocation"
                    >
                      <span
                        v-if="gettingLocation"
                        class="spinner-border spinner-border-sm me-2"
                      ></span>
                      <i class="bi bi-crosshair me-2"></i>
                      {{
                        gettingLocation
                          ? "กำลังหาตำแหน่ง..."
                          : "หาตำแหน่งปัจจุบัน"
                      }}
                    </button>

                    <button
                      v-if="formData.gps_latitude && formData.gps_longitude"
                      type="button"
                      class="btn btn-outline-primary"
                      @click="openInGoogleMaps"
                    >
                      <i class="bi bi-map me-2"></i>
                      ดูในแผนที่
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 3: Personnel -->
      <div v-if="currentStep === 3" class="card mb-4">
        <div
          class="card-header bg-light d-flex justify-content-between align-items-center"
        >
          <h5 class="mb-0">
            <i class="bi bi-people text-primary me-2"></i>
            บุคลากรสำคัญ
          </h5>
          <button
            type="button"
            class="btn btn-sm btn-outline-primary"
            @click="addPersonnel"
          >
            <i class="bi bi-plus"></i>
            เพิ่มบุคลากร
          </button>
        </div>
        <div class="card-body">
          <div
            v-if="formData.personnel.length === 0"
            class="text-center py-4 text-muted"
          >
            <i class="bi bi-person-plus" style="font-size: 3rem"></i>
            <p class="mt-2">ยังไม่มีข้อมูลบุคลากร</p>
            <p class="small">กดปุ่ม "เพิ่มบุคลากร" เพื่อเพิ่มข้อมูล</p>
          </div>

          <div
            v-for="(person, index) in formData.personnel"
            :key="index"
            class="personnel-item mb-3"
          >
            <div class="card border-start border-primary border-3">
              <div class="card-body">
                <div
                  class="d-flex justify-content-between align-items-start mb-3"
                >
                  <h6 class="card-title mb-0">
                    <i class="bi bi-person-badge me-2"></i>
                    บุคลากรคนที่ {{ index + 1 }}
                  </h6>
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-danger"
                    @click="removePersonnel(index)"
                  >
                    <i class="bi bi-trash"></i>
                  </button>
                </div>

                <div class="row">
                  <div class="col-md-4 mb-3">
                    <label class="form-label">ตำแหน่ง/หน้าที่</label>
                    <select v-model="person.role" class="form-select">
                      <option value="">เลือกตำแหน่ง</option>
                      <option value="เจ้าอาวาส">เจ้าอาวาส</option>
                      <option value="รองเจ้าอาวาส">รองเจ้าอาวาส</option>
                      <option value="เจ้าคณะ">เจ้าคณะ</option>
                      <option value="กรรมการ">กรรมการ</option>
                      <option value="เหรัญญิก">เหรัญญิก</option>
                      <option value="เลขานุการ">เลขานุการ</option>
                    </select>
                  </div>

                  <div class="col-md-4 mb-3">
                    <label class="form-label">ชื่อ</label>
                    <input
                      v-model="person.first_name"
                      type="text"
                      class="form-control"
                      placeholder="ชื่อ"
                    />
                  </div>

                  <div class="col-md-4 mb-3">
                    <label class="form-label">นามสกุล</label>
                    <input
                      v-model="person.last_name"
                      type="text"
                      class="form-control"
                      placeholder="นามสกุล"
                    />
                  </div>

                  <div class="col-md-6 mb-3">
                    <label class="form-label">เบอร์โทรศัพท์</label>
                    <input
                      v-model="person.phone"
                      type="tel"
                      class="form-control"
                      placeholder="08X-XXX-XXXX"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 4: Bank Accounts -->
      <div v-if="currentStep === 4" class="card mb-4">
        <div
          class="card-header bg-light d-flex justify-content-between align-items-center"
        >
          <h5 class="mb-0">
            <i class="bi bi-bank text-primary me-2"></i>
            บัญชีธนาคาร
          </h5>
          <button
            type="button"
            class="btn btn-sm btn-outline-primary"
            @click="addBankAccount"
          >
            <i class="bi bi-plus"></i>
            เพิ่มบัญชี
          </button>
        </div>
        <div class="card-body">
          <div
            v-if="formData.bankAccounts.length === 0"
            class="text-center py-4 text-muted"
          >
            <i class="bi bi-bank" style="font-size: 3rem"></i>
            <p class="mt-2">ยังไม่มีข้อมูลบัญชีธนาคาร</p>
            <p class="small">กดปุ่ม "เพิ่มบัญชี" เพื่อเพิ่มข้อมูล</p>
          </div>

          <div
            v-for="(account, index) in formData.bankAccounts"
            :key="index"
            class="bank-item mb-3"
          >
            <div class="card border-start border-success border-3">
              <div class="card-body">
                <div
                  class="d-flex justify-content-between align-items-start mb-3"
                >
                  <h6 class="card-title mb-0">
                    <i class="bi bi-credit-card me-2"></i>
                    บัญชีที่ {{ index + 1 }}
                  </h6>
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-danger"
                    @click="removeBankAccount(index)"
                  >
                    <i class="bi bi-trash"></i>
                  </button>
                </div>

                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">ธนาคาร</label>
                    <select v-model="account.bank_name" class="form-select">
                      <option value="">เลือกธนาคาร</option>
                      <option value="ธนาคารกสิกรไทย">ธนาคารกสิกรไทย</option>
                      <option value="ธนาคารกรุงเทพ">ธนาคารกรุงเทพ</option>
                      <option value="ธนาคารกรุงไทย">ธนาคารกรุงไทย</option>
                      <option value="ธนาคารทหารไทยธนชาต">
                        ธนาคารทหารไทยธนชาต
                      </option>
                      <option value="ธนาคารไทยพาณิชย์">ธนาคารไทยพาณิชย์</option>
                      <option value="ธนาคารกรุงศรีอยุธยา">
                        ธนาคารกรุงศรีอยุธยา
                      </option>
                    </select>
                  </div>

                  <div class="col-md-6 mb-3">
                    <label class="form-label">เลขที่บัญชี</label>
                    <input
                      v-model="account.account_number"
                      type="text"
                      class="form-control"
                      placeholder="XXX-X-XXXXX-X"
                    />
                  </div>

                  <div class="col-12 mb-3">
                    <label class="form-label">ชื่อบัญชี</label>
                    <input
                      v-model="account.account_name"
                      type="text"
                      class="form-control"
                      placeholder="ชื่อเจ้าของบัญชี"
                    />
                  </div>

                  <div class="col-12 mb-3">
                    <label class="form-label">ผู้มีอำนาจเบิกจ่าย</label>
                    <textarea
                      v-model="account.signatories"
                      class="form-control"
                      rows="2"
                      placeholder="รายชื่อผู้มีอำนาจเบิกจ่าย (คั่นด้วยเครื่องหมายจุลภาค)"
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 5: Attachments -->
      <div v-if="currentStep === 5" class="card mb-4">
        <div class="card-header bg-light">
          <h5 class="mb-0">
            <i class="bi bi-camera text-primary me-2"></i>
            ไฟล์แนบและรูปภาพ
          </h5>
        </div>
        <div class="card-body">
          <div
            class="upload-area border border-2 border-dashed rounded p-4 text-center mb-4"
          >
            <i
              class="bi bi-cloud-upload text-muted"
              style="font-size: 3rem"
            ></i>
            <h6 class="mt-2">อัปโหลดไฟล์ภาพหรือเอกสาร</h6>
            <p class="text-muted small">
              รองรับไฟล์: JPG, PNG, PDF (ขนาดไม่เกิน 10MB)
            </p>

            <div class="row g-2 mt-3">
              <div class="col-md-6">
                <button
                  type="button"
                  class="btn btn-outline-primary w-100"
                  @click="$refs.fileInput.click()"
                >
                  <i class="bi bi-folder2-open me-2"></i>
                  เลือกไฟล์จากเครื่อง
                </button>
              </div>
              <div class="col-md-6">
                <button
                  type="button"
                  class="btn btn-outline-success w-100"
                  @click="capturePhoto"
                >
                  <i class="bi bi-camera me-2"></i>
                  ถ่ายภาพใหม่
                </button>
              </div>
            </div>

            <input
              ref="fileInput"
              type="file"
              multiple
              accept="image/*,application/pdf"
              @change="handleFileUpload"
              style="display: none"
            />
          </div>

          <!-- File List -->
          <div v-if="formData.attachments.length > 0" class="uploaded-files">
            <h6 class="mb-3">
              <i class="bi bi-paperclip me-2"></i>
              ไฟล์ที่แนบ ({{ formData.attachments.length }} ไฟล์)
            </h6>

            <div class="row">
              <div
                v-for="(file, index) in formData.attachments"
                :key="index"
                class="col-md-6 col-lg-4 mb-3"
              >
                <div class="card">
                  <div class="card-body">
                    <div
                      class="d-flex justify-content-between align-items-start mb-2"
                    >
                      <div class="file-icon">
                        <i class="bi fs-4" :class="getFileIcon(file.type)"></i>
                      </div>
                      <button
                        type="button"
                        class="btn btn-sm btn-outline-danger"
                        @click="removeAttachment(index)"
                      >
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                    <h6 class="card-title text-truncate" :title="file.name">
                      {{ file.name }}
                    </h6>
                    <small class="text-muted">
                      {{ formatFileSize(file.size) }}
                    </small>

                    <div class="mt-2">
                      <input
                        v-model="file.description"
                        type="text"
                        class="form-control form-control-sm"
                        placeholder="คำอธิบายไฟล์"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation Buttons -->
      <div class="card">
        <div class="card-body">
          <div class="d-flex justify-content-between">
            <button
              type="button"
              class="btn btn-outline-secondary"
              @click="previousStep"
              :disabled="currentStep === 1"
            >
              <i class="bi bi-arrow-left me-2"></i>
              ย้อนกลับ
            </button>

            <div class="step-info text-muted align-self-center">
              ขั้นตอนที่ {{ currentStep }} จาก 5
            </div>

            <button
              v-if="currentStep < 5"
              type="button"
              class="btn btn-primary"
              @click="nextStep"
              :disabled="!canProceed"
            >
              ถัดไป
              <i class="bi bi-arrow-right ms-2"></i>
            </button>

            <button
              v-else
              type="submit"
              class="btn btn-success"
              :disabled="saving"
            >
              <span
                v-if="saving"
                class="spinner-border spinner-border-sm me-2"
              ></span>
              <i class="bi bi-check-circle me-2"></i>
              บันทึกข้อมูล
            </button>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, computed, reactive } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "@/composables/useToast";
import surveyService from "@/services/surveyService";

export default {
  name: "TempleFormCreate",
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();
    const { showToast } = useToast();

    // Form state
    const currentStep = ref(1);
    const saving = ref(false);
    const gettingLocation = ref(false);

    // Form data
    const formData = reactive({
      target_name: "",
      temple_type_id: "",
      denomination_id: "",
      monk_count: null,
      recorded_at: new Date().toISOString().slice(0, 16),
      history_summary: "",
      address: "",
      subdistrict: "",
      district: "",
      province: "",
      postal_code: "",
      gps_latitude: null,
      gps_longitude: null,
      personnel: [],
      bankAccounts: [],
      attachments: [],
    });

    // Validation states
    const step1Valid = ref(false);
    const step2Valid = ref(false);

    // Computed
    const canProceed = computed(() => {
      switch (currentStep.value) {
        case 1:
          return step1Valid.value;
        case 2:
          return step2Valid.value;
        case 3:
          return true; // Personnel is optional
        case 4:
          return true; // Bank accounts are optional
        case 5:
          return true; // Attachments are optional
        default:
          return false;
      }
    });

    // Methods
    const validateStep1 = () => {
      step1Valid.value = !!(
        formData.target_name?.trim() &&
        formData.temple_type_id &&
        formData.denomination_id
      );
    };

    const validateStep2 = () => {
      step2Valid.value = !!(
        formData.address?.trim() &&
        formData.subdistrict?.trim() &&
        formData.district?.trim() &&
        formData.province?.trim()
      );
    };

    const nextStep = () => {
      if (canProceed.value && currentStep.value < 5) {
        currentStep.value++;
      }
    };

    const previousStep = () => {
      if (currentStep.value > 1) {
        currentStep.value--;
      }
    };

    const addPersonnel = () => {
      formData.personnel.push({
        role: "",
        first_name: "",
        last_name: "",
        phone: "",
      });
    };

    const removePersonnel = (index) => {
      formData.personnel.splice(index, 1);
    };

    const addBankAccount = () => {
      formData.bankAccounts.push({
        bank_name: "",
        account_number: "",
        account_name: "",
        signatories: "",
      });
    };

    const removeBankAccount = (index) => {
      formData.bankAccounts.splice(index, 1);
    };

    const getCurrentLocation = () => {
      gettingLocation.value = true;

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            formData.gps_latitude = position.coords.latitude;
            formData.gps_longitude = position.coords.longitude;
            showToast("ได้ตำแหน่ง GPS แล้ว", "success");
            gettingLocation.value = false;
          },
          (error) => {
            showToast("ไม่สามารถหาตำแหน่งได้: " + error.message, "error");
            gettingLocation.value = false;
          }
        );
      } else {
        showToast("เบราว์เซอร์ไม่รองรับ GPS", "error");
        gettingLocation.value = false;
      }
    };

    const openInGoogleMaps = () => {
      const url = `https://www.google.com/maps?q=${formData.gps_latitude},${formData.gps_longitude}`;
      window.open(url, "_blank");
    };

    const handleFileUpload = (event) => {
      const files = Array.from(event.target.files);
      files.forEach((file) => {
        if (file.size <= 10 * 1024 * 1024) {
          // 10MB limit
          formData.attachments.push({
            file,
            name: file.name,
            size: file.size,
            type: file.type,
            description: "",
          });
        } else {
          showToast(`ไฟล์ ${file.name} มีขนาดใหญ่เกิน 10MB`, "error");
        }
      });
    };

    const capturePhoto = () => {
      // For mobile device camera capture
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.capture = "camera";
      input.onchange = handleFileUpload;
      input.click();
    };

    const removeAttachment = (index) => {
      formData.attachments.splice(index, 1);
    };

    const getFileIcon = (type) => {
      if (type.startsWith("image/")) return "bi-image text-success";
      if (type === "application/pdf") return "bi-file-pdf text-danger";
      return "bi-file-earmark text-primary";
    };

    const formatFileSize = (bytes) => {
      if (bytes === 0) return "0 Bytes";
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const submitForm = async () => {
      saving.value = true;
      try {
        // Prepare form data
        const submitData = {
          type_id: 1, // Temple type ID
          target_name: formData.target_name,
          address: formData.address,
          subdistrict: formData.subdistrict,
          district: formData.district,
          province: formData.province,
          postal_code: formData.postal_code,
          gps_latitude: formData.gps_latitude,
          gps_longitude: formData.gps_longitude,
          status: "Draft",
          temple_type_id: formData.temple_type_id,
          denomination_id: formData.denomination_id,
          monk_count: formData.monk_count,
          history_summary: formData.history_summary,
          personnel: formData.personnel,
          bankAccounts: formData.bankAccounts,
        };

        const response = await surveyService.createSurveyTarget(submitData);

        showToast("บันทึกข้อมูลวัดสำเร็จ", "success");
        router.push("/surveys/temples");
      } catch (error) {
        console.error("Error saving temple:", error);
        showToast("เกิดข้อผิดพลาดในการบันทึกข้อมูล", "error");
      } finally {
        saving.value = false;
      }
    };

    return {
      currentStep,
      saving,
      gettingLocation,
      formData,
      step1Valid,
      step2Valid,
      canProceed,
      authStore,

      // Methods
      validateStep1,
      validateStep2,
      nextStep,
      previousStep,
      addPersonnel,
      removePersonnel,
      addBankAccount,
      removeBankAccount,
      getCurrentLocation,
      openInGoogleMaps,
      handleFileUpload,
      capturePhoto,
      removeAttachment,
      getFileIcon,
      formatFileSize,
      submitForm,
    };
  },
};
</script>

<style scoped>
.temple-form-container {
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.badge-police {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-steps {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

.progress-steps::before {
  content: "";
  position: absolute;
  top: 20px;
  left: 40px;
  right: 40px;
  height: 2px;
  background: #e9ecef;
  z-index: 0;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
}

.step-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
  color: #6c757d;
}

.step.active .step-icon {
  background: #0d6efd;
  color: white;
}

.step.completed .step-icon {
  background: #198754;
  color: white;
}

.step-title {
  font-size: 0.875rem;
  text-align: center;
  max-width: 80px;
}

.step.active .step-title {
  color: #0d6efd;
  font-weight: 600;
}

.form-label.required::after {
  content: " *";
  color: #dc3545;
}

.upload-area {
  transition: all 0.3s ease;
}

.upload-area:hover {
  border-color: #0d6efd;
  background-color: #f8f9fa;
}

.personnel-item,
.bank-item {
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card {
  border: none;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.officer-info {
  text-align: right;
}

@media (max-width: 768px) {
  .progress-steps {
    flex-wrap: wrap;
    gap: 1rem;
  }

  .progress-steps::before {
    display: none;
  }

  .step-title {
    max-width: none;
  }

  .officer-info {
    text-align: left;
    margin-top: 1rem;
  }
}
</style>
