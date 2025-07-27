<template>
  <div class="verification-container">
    <div class="verification-card">
      <!-- Header -->
      <div class="verification-header">
        <div class="gov-logo">
          <i class="bi bi-shield-check"></i>
        </div>
        <h2 class="verification-title">ลงทะเบียน</h2>
        <p class="verification-subtitle">One account. All of Services.</p>
      </div>

      <!-- Progress Steps -->
      <div class="progress-steps">
        <div
          class="step"
          :class="{ active: currentStep >= 1, completed: currentStep > 1 }"
        >
          <div class="step-icon">
            <i class="bi bi-person-check" v-if="currentStep > 1"></i>
            <span v-else>1</span>
          </div>
          <span class="step-label">ข้อตกลงการให้บริการ</span>
        </div>

        <div
          class="step"
          :class="{ active: currentStep >= 2, completed: currentStep > 2 }"
        >
          <div class="step-icon">
            <i class="bi bi-shield-check" v-if="currentStep > 2"></i>
            <span v-else>2</span>
          </div>
          <span class="step-label">พิสูจน์ตัวตน</span>
        </div>

        <div
          class="step"
          :class="{ active: currentStep >= 3, completed: currentStep > 3 }"
        >
          <div class="step-icon">
            <i class="bi bi-person-plus" v-if="currentStep > 3"></i>
            <span v-else>3</span>
          </div>
          <span class="step-label">กรอกข้อมูลผู้ลงทะเบียน</span>
        </div>

        <div
          class="step"
          :class="{ active: currentStep >= 4, completed: currentStep > 4 }"
        >
          <div class="step-icon">
            <i class="bi bi-phone" v-if="currentStep > 4"></i>
            <span v-else>4</span>
          </div>
          <span class="step-label">ยืนยันเบอร์โทรศัพท์มือถือ</span>
        </div>

        <div class="step" :class="{ active: currentStep >= 5 }">
          <div class="step-icon">
            <i class="bi bi-check-circle" v-if="currentStep > 5"></i>
            <span v-else>5</span>
          </div>
          <span class="step-label">ตรวจสอบข้อมูล</span>
        </div>
      </div>

      <!-- Step 1: Terms of Service -->
      <div v-if="currentStep === 1" class="step-content">
        <div class="terms-section">
          <h4>ข้อตกลงและเงื่อนไขการใช้บริการพิสูจน์และยืนยันตัวตนทางดิจิทัล</h4>

          <div class="terms-content">
            <p>
              บริการพิสูจน์และยืนยันตัวตนทางดิจิทัล คือ
              บริการที่ประชาชนใช้ในการพิสูจน์ตัวตนทางดิจิทัลของหน่วยงานรัตบรรพ์
              ๆ ซึ่งจะช่วยลดขั้นตอนการให้บริการ (e-Service)
              หรือยืนยันเว็บทางดิจิทัล (Back Office)
              แต่เราขอให้ท่านตรวจสอบข้อตกลงและเงื่อนไขการใช้บริการ (Single
              Sign-On: SSO) ที่ขาม กส. ที่เจ้าผ่านผ่านท่านต่อต่างใน การบริการ
              (Log in) แผ่นคิดที่ให้ผ่านบริการสร้างยืนยันตัวตนทางดิจิทัล (DGA
              Digital ID Service) ให้เจ้าผ่านกม. ใช้งานระบบได้โดยง่าย ๆ
              ระบบโดยให้ชิดลิงรถครี่งบ่า
              บริ่งให้ขาครี่งจมความรู้ต่างในการรวมองคงครี่งจมการคุมรู้
              ทรฟครี่งก่าวข้าความคิดการทืมกงใจนข้าง
            </p>

            <p>ข้อกำหนดใช้บริการให้กรรการให้บริการนี้ ใน</p>

            <p>
              "ผู้ใช้บริการ" หมายความถึง สำนักงานพัฒนารัฐบาลดิจิทัล
              (องค์การมหาชน)
            </p>

            <p>
              "ผู้ให้บริการ" หมายความถึง
              ผู้ที่ให้ให้บริการในครอบคลุมและผลกับผ่าใช้ต่างหน่องสิจิทัล
            </p>

            <div class="more-terms">
              <p><i class="bi bi-chevron-down"></i></p>
            </div>
          </div>

          <div class="terms-checkbox">
            <div class="form-check">
              <input
                v-model="acceptTerms"
                type="checkbox"
                class="form-check-input"
                id="acceptTerms"
              />
              <label class="form-check-label" for="acceptTerms">
                ข้าพเจ้าได้อ่านและยินยอมให้มีการเก็บรวบรวมใช้หรือเปิดเผยข้อมูลส่วนบุคคลตามที่ระบุในกฎหมายสำคัญ
              </label>
            </div>
          </div>

          <div class="step-actions">
            <button
              type="button"
              class="btn btn-primary btn-lg"
              :disabled="!acceptTerms"
              @click="nextStep"
            >
              ยินยอม
            </button>
            <button
              type="button"
              class="btn btn-outline-secondary btn-lg"
              @click="goBack"
            >
              ไม่ยินยอม
            </button>
          </div>
        </div>
      </div>

      <!-- Step 2: Identity Verification Method Selection -->
      <div v-if="currentStep === 2" class="step-content">
        <div class="verification-methods">
          <h4>พิสูจน์ตัวตน</h4>
          <p class="text-muted mb-4">เลือกวิธีการยืนยันตัวตนที่ท่านต้องการ</p>

          <div class="method-selection">
            <!-- National ID Verification -->
            <div
              class="verification-method"
              :class="{ selected: selectedMethod === 'national_id' }"
              @click="selectMethod('national_id')"
            >
              <div class="method-icon">
                <i class="bi bi-credit-card-2-front"></i>
              </div>
              <div class="method-info">
                <h6>ข้อมูลจากทะเบียนราษฎร์</h6>
                <p>ตรวจสอบตัวตนผ่านเลขบัตรประจำตัวประชาชน 13 หลัก</p>
              </div>
              <div class="method-status">
                <i
                  class="bi bi-circle"
                  v-if="selectedMethod !== 'national_id'"
                ></i>
                <i class="bi bi-check-circle-fill text-primary" v-else></i>
              </div>
            </div>

            <!-- Email Verification -->
            <div
              class="verification-method"
              :class="{ selected: selectedMethod === 'email' }"
              @click="selectMethod('email')"
            >
              <div class="method-icon">
                <i class="bi bi-envelope"></i>
              </div>
              <div class="method-info">
                <h6>ยืนยันผ่านอีเมล</h6>
                <p>รับรหัส OTP ทางอีเมลที่ลงทะเบียนไว้</p>
              </div>
              <div class="method-status">
                <i class="bi bi-circle" v-if="selectedMethod !== 'email'"></i>
                <i class="bi bi-check-circle-fill text-primary" v-else></i>
              </div>
            </div>

            <!-- SMS Verification -->
            <div
              class="verification-method"
              :class="{ selected: selectedMethod === 'sms' }"
              @click="selectMethod('sms')"
            >
              <div class="method-icon">
                <i class="bi bi-phone"></i>
              </div>
              <div class="method-info">
                <h6>ยืนยันผ่าน SMS</h6>
                <p>รับรหัส OTP ทางข้อความโทรศัพท์</p>
              </div>
              <div class="method-status">
                <i class="bi bi-circle" v-if="selectedMethod !== 'sms'"></i>
                <i class="bi bi-check-circle-fill text-primary" v-else></i>
              </div>
            </div>
          </div>

          <div class="step-actions">
            <button
              type="button"
              class="btn btn-primary btn-lg"
              :disabled="!selectedMethod"
              @click="nextStep"
            >
              ดำเนินการต่อ
            </button>
            <button
              type="button"
              class="btn btn-outline-secondary btn-lg"
              @click="prevStep"
            >
              ย้อนกลับ
            </button>
          </div>
        </div>
      </div>

      <!-- Step 3: Identity Verification Process -->
      <div v-if="currentStep === 3" class="step-content">
        <!-- National ID Verification -->
        <div
          v-if="selectedMethod === 'national_id'"
          class="national-id-verification"
        >
          <h4>ตรวจสอบตัวตนจากทะเบียนราษฎร์</h4>
          <p class="text-muted mb-4">
            กรุณากรอกข้อมูลให้ตรงกับบัตรประจำตัวประชาชน
          </p>

          <form @submit.prevent="verifyNationalId">
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label required"
                  >ชื่อจริงภาษาไทย (ไม่ต้องใส่คำนำหน้า)</label
                >
                <input
                  v-model="nationalIdForm.first_name"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': errors.first_name }"
                  placeholder="ชื่อจริง"
                  required
                />
                <div v-if="errors.first_name" class="invalid-feedback">
                  {{ errors.first_name }}
                </div>
              </div>

              <div class="col-md-6 mb-3">
                <label class="form-label required">นามสกุลภาษาไทย</label>
                <input
                  v-model="nationalIdForm.last_name"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': errors.last_name }"
                  placeholder="นามสกุล"
                  required
                />
                <div v-if="errors.last_name" class="invalid-feedback">
                  {{ errors.last_name }}
                </div>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label required">เลขบัตรประจำตัวประชาชน</label>
              <input
                v-model="nationalIdForm.national_id"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.national_id }"
                placeholder="x-xxxx-xxxxx-xx-x"
                maxlength="17"
                required
                @input="formatNationalId"
              />
              <div v-if="errors.national_id" class="invalid-feedback">
                {{ errors.national_id }}
              </div>
            </div>

            <div class="step-actions">
              <button
                type="submit"
                class="btn btn-primary btn-lg"
                :disabled="verifyingId"
              >
                <span
                  v-if="verifyingId"
                  class="spinner-border spinner-border-sm me-2"
                ></span>
                {{ verifyingId ? "กำลังตรวจสอบ..." : "ตรวจสอบตัวตน" }}
              </button>
              <button
                type="button"
                class="btn btn-outline-secondary btn-lg"
                @click="prevStep"
              >
                ย้อนกลับ
              </button>
            </div>
          </form>
        </div>

        <!-- Email/SMS OTP Verification -->
        <div
          v-else-if="selectedMethod === 'email' || selectedMethod === 'sms'"
          class="otp-verification"
        >
          <div v-if="!otpSent">
            <h4>
              {{
                selectedMethod === "email"
                  ? "ยืนยันผ่านอีเมล"
                  : "ยืนยันผ่าน SMS"
              }}
            </h4>
            <p class="text-muted mb-4">
              กรุณากรอก{{
                selectedMethod === "email" ? "อีเมล" : "เบอร์โทรศัพท์"
              }}เพื่อรับรหัส OTP
            </p>

            <form @submit.prevent="sendOtp">
              <div class="mb-3">
                <label class="form-label required">
                  {{
                    selectedMethod === "email" ? "อีเมล" : "เบอร์โทรศัพท์มือถือ"
                  }}
                </label>
                <input
                  v-model="otpForm.target"
                  :type="selectedMethod === 'email' ? 'email' : 'tel'"
                  class="form-control"
                  :class="{ 'is-invalid': errors.target }"
                  :placeholder="
                    selectedMethod === 'email'
                      ? 'example@email.com'
                      : '08x-xxx-xxxx'
                  "
                  required
                />
                <div v-if="errors.target" class="invalid-feedback">
                  {{ errors.target }}
                </div>
              </div>

              <div class="step-actions">
                <button
                  type="submit"
                  class="btn btn-primary btn-lg"
                  :disabled="sendingOtp"
                >
                  <span
                    v-if="sendingOtp"
                    class="spinner-border spinner-border-sm me-2"
                  ></span>
                  {{ sendingOtp ? "กำลังส่งรหัส..." : "ส่งรหัส OTP" }}
                </button>
                <button
                  type="button"
                  class="btn btn-outline-secondary btn-lg"
                  @click="prevStep"
                >
                  ย้อนกลับ
                </button>
              </div>
            </form>
          </div>

          <div v-else>
            <h4>กรอกรหัส OTP</h4>
            <p class="text-muted mb-4">
              รหัส OTP ได้ถูกส่งไปยัง
              <strong>{{ maskedTarget }}</strong>
              <br />
              <small>รหัสจะหมดอายุในอีก {{ formatTime(remainingTime) }}</small>
            </p>

            <form @submit.prevent="verifyOtp">
              <div class="mb-3">
                <label class="form-label required">รหัส OTP (6 หลัก)</label>
                <input
                  v-model="otpForm.otp_code"
                  type="text"
                  class="form-control text-center"
                  :class="{ 'is-invalid': errors.otp_code }"
                  placeholder="••••••"
                  maxlength="6"
                  style="font-size: 1.5rem; letter-spacing: 0.5rem"
                  required
                  @input="otpInput"
                />
                <div v-if="errors.otp_code" class="invalid-feedback">
                  {{ errors.otp_code }}
                </div>
              </div>

              <div class="resend-section mb-3">
                <p class="text-muted mb-2">ไม่ได้รับรหัส?</p>
                <button
                  type="button"
                  class="btn btn-link p-0"
                  :disabled="resendCooldown > 0"
                  @click="resendOtp"
                >
                  {{
                    resendCooldown > 0
                      ? `ส่งใหม่ในอีก ${resendCooldown} วินาที`
                      : "ส่งรหัสใหม่"
                  }}
                </button>
              </div>

              <div class="step-actions">
                <button
                  type="submit"
                  class="btn btn-primary btn-lg"
                  :disabled="verifyingOtp || otpForm.otp_code.length !== 6"
                >
                  <span
                    v-if="verifyingOtp"
                    class="spinner-border spinner-border-sm me-2"
                  ></span>
                  {{ verifyingOtp ? "กำลังยืนยัน..." : "ยืนยัน" }}
                </button>
                <button
                  type="button"
                  class="btn btn-outline-secondary btn-lg"
                  @click="resetOtp"
                >
                  เปลี่ยนวิธี
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Step 4: Registration Form -->
      <div v-if="currentStep === 4" class="step-content">
        <h4>กรอกข้อมูลผู้ลงทะเบียน</h4>
        <p class="text-muted mb-4">กรุณากรอกข้อมูลสำหรับการลงทะเบียนใช้งาน</p>

        <!-- Include the simplified registration form here -->
        <div class="alert alert-info">
          <i class="bi bi-info-circle me-2"></i>
          ข้อมูลบางส่วนถูกกรอกโดยอัตโนมัติจากการยืนยันตัวตน
        </div>

        <!-- Registration form will be included here -->
        <div class="step-actions">
          <button
            type="button"
            class="btn btn-primary btn-lg"
            @click="nextStep"
          >
            ดำเนินการต่อ
          </button>
          <button
            type="button"
            class="btn btn-outline-secondary btn-lg"
            @click="prevStep"
          >
            ย้อนกลับ
          </button>
        </div>
      </div>

      <!-- Step 5: Phone Verification -->
      <div v-if="currentStep === 5" class="step-content">
        <h4>ยืนยันเบอร์โทรศัพท์มือถือ</h4>
        <p class="text-muted mb-4">เพื่อความปลอดภัยในการใช้งาน</p>

        <!-- Phone verification form -->
        <div class="step-actions">
          <button
            type="button"
            class="btn btn-primary btn-lg"
            @click="completeRegistration"
          >
            ยืนยันและลงทะเบียน
          </button>
          <button
            type="button"
            class="btn btn-outline-secondary btn-lg"
            @click="prevStep"
          >
            ย้อนกลับ
          </button>
        </div>
      </div>

      <!-- Success Message -->
      <div v-if="registrationComplete" class="step-content text-center">
        <div class="success-icon mb-4">
          <i
            class="bi bi-check-circle-fill text-success"
            style="font-size: 4rem"
          ></i>
        </div>
        <h4 class="text-success">ลงทะเบียนสำเร็จ!</h4>
        <p class="text-muted mb-4">
          บัญชีของท่านได้ถูกสร้างแล้ว กรุณารอการอนุมัติจากผู้ดูแลระบบ
        </p>
        <router-link to="/auth/login" class="btn btn-primary btn-lg">
          ไปหน้าเข้าสู่ระบบ
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { useToast } from "@/composables/useToast";

export default {
  name: "DigitalVerificationPage",
  setup() {
    const router = useRouter();
    const { showToast } = useToast();

    // State management
    const currentStep = ref(1);
    const acceptTerms = ref(false);
    const selectedMethod = ref("");
    const registrationComplete = ref(false);

    // Form data
    const nationalIdForm = reactive({
      first_name: "",
      last_name: "",
      national_id: "",
      birth_date: "",
    });

    const otpForm = reactive({
      target: "",
      otp_code: "",
      verification_type: "",
    });

    // UI state
    const verifyingId = ref(false);
    const sendingOtp = ref(false);
    const verifyingOtp = ref(false);
    const otpSent = ref(false);
    const maskedTarget = ref("");
    const remainingTime = ref(600); // 10 minutes
    const resendCooldown = ref(0);
    const errors = reactive({});

    // Timer for OTP countdown
    let otpTimer = null;
    let resendTimer = null;

    // Methods
    const nextStep = () => {
      if (currentStep.value < 5) {
        currentStep.value++;
      }
    };

    const prevStep = () => {
      if (currentStep.value > 1) {
        currentStep.value--;
      }
    };

    const goBack = () => {
      router.push("/auth/login");
    };

    const selectMethod = (method) => {
      selectedMethod.value = method;
    };

    const formatNationalId = (event) => {
      let value = event.target.value.replace(/\D/g, "");
      if (value.length > 13) value = value.slice(0, 13);

      if (value.length >= 1) {
        value = value.replace(
          /(\d{1})(\d{0,4})(\d{0,5})(\d{0,2})(\d{0,1})/,
          (match, p1, p2, p3, p4, p5) => {
            let formatted = p1;
            if (p2) formatted += "-" + p2;
            if (p3) formatted += "-" + p3;
            if (p4) formatted += "-" + p4;
            if (p5) formatted += "-" + p5;
            return formatted;
          }
        );
      }

      nationalIdForm.national_id = value;
    };

    const verifyNationalId = async () => {
      clearErrors();

      if (!validateNationalIdForm()) return;

      verifyingId.value = true;

      try {
        const response = await axios.post(
          "/api/verification/verify-national-id",
          {
            national_id: nationalIdForm.national_id.replace(/\D/g, ""),
            first_name: nationalIdForm.first_name.trim(),
            last_name: nationalIdForm.last_name.trim(),
            birth_date: nationalIdForm.birth_date,
          }
        );

        if (response.data.success) {
          showToast("ยืนยันตัวตนสำเร็จ", "success");
          // Store verification data
          sessionStorage.setItem(
            "verification_token",
            response.data.data.verification_token
          );
          sessionStorage.setItem(
            "verified_data",
            JSON.stringify(response.data.data.verified_data)
          );
          nextStep();
        }
      } catch (error) {
        const errorMessage =
          error.response?.data?.message || "เกิดข้อผิดพลาดในการยืนยันตัวตน";
        showToast(errorMessage, "error");
      } finally {
        verifyingId.value = false;
      }
    };

    const sendOtp = async () => {
      clearErrors();

      if (!validateOtpTarget()) return;

      sendingOtp.value = true;

      try {
        const response = await axios.post("/api/verification/send-otp", {
          [selectedMethod.value === "email" ? "email" : "phone"]:
            otpForm.target,
          verification_type: selectedMethod.value,
        });

        if (response.data.success) {
          otpSent.value = true;
          maskedTarget.value = response.data.data.target;
          remainingTime.value = response.data.data.expires_in;
          otpForm.verification_type = selectedMethod.value;

          startOtpTimer();
          showToast(response.data.message, "success");
        }
      } catch (error) {
        const errorMessage =
          error.response?.data?.message || "เกิดข้อผิดพลาดในการส่งรหัส OTP";
        showToast(errorMessage, "error");
      } finally {
        sendingOtp.value = false;
      }
    };

    const verifyOtp = async () => {
      clearErrors();

      if (!validateOtp()) return;

      verifyingOtp.value = true;

      try {
        const response = await axios.post("/api/verification/verify-otp", {
          target: otpForm.target,
          otp_code: otpForm.otp_code,
          verification_type: otpForm.verification_type,
        });

        if (response.data.success) {
          showToast("ยืนยันรหัสสำเร็จ", "success");
          // Store verification token
          sessionStorage.setItem(
            "verification_token",
            response.data.data.verification_token
          );
          stopOtpTimer();
          nextStep();
        }
      } catch (error) {
        const errorMessage =
          error.response?.data?.message || "รหัส OTP ไม่ถูกต้อง";
        showToast(errorMessage, "error");
        errors.otp_code = errorMessage;
      } finally {
        verifyingOtp.value = false;
      }
    };

    const resendOtp = async () => {
      if (resendCooldown.value > 0) return;

      resendCooldown.value = 60;
      startResendTimer();

      await sendOtp();
    };

    const resetOtp = () => {
      otpSent.value = false;
      otpForm.target = "";
      otpForm.otp_code = "";
      maskedTarget.value = "";
      stopOtpTimer();
    };

    const otpInput = (event) => {
      // Only allow numbers
      event.target.value = event.target.value.replace(/\D/g, "");
      otpForm.otp_code = event.target.value;
    };

    const completeRegistration = () => {
      registrationComplete.value = true;
      showToast("ลงทะเบียนสำเร็จ! กรุณารอการอนุมัติจากผู้ดูแลระบบ", "success");
    };

    // Validation methods
    const validateNationalIdForm = () => {
      let isValid = true;

      if (!nationalIdForm.first_name.trim()) {
        errors.first_name = "กรุณากรอกชื่อ";
        isValid = false;
      }

      if (!nationalIdForm.last_name.trim()) {
        errors.last_name = "กรุณากรอกนามสกุล";
        isValid = false;
      }

      const cleanId = nationalIdForm.national_id.replace(/\D/g, "");
      if (!cleanId || cleanId.length !== 13) {
        errors.national_id = "เลขบัตรประจำตัวประชาชนไม่ถูกต้อง";
        isValid = false;
      }

      return isValid;
    };

    const validateOtpTarget = () => {
      if (!otpForm.target.trim()) {
        errors.target = `กรุณากรอก${
          selectedMethod.value === "email" ? "อีเมล" : "เบอร์โทรศัพท์"
        }`;
        return false;
      }

      if (selectedMethod.value === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(otpForm.target)) {
          errors.target = "รูปแบบอีเมลไม่ถูกต้อง";
          return false;
        }
      } else if (selectedMethod.value === "sms") {
        const phoneRegex = /^[0-9]{10}$/;
        const cleanPhone = otpForm.target.replace(/\D/g, "");
        if (!phoneRegex.test(cleanPhone)) {
          errors.target = "รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง";
          return false;
        }
      }

      return true;
    };

    const validateOtp = () => {
      if (!otpForm.otp_code || otpForm.otp_code.length !== 6) {
        errors.otp_code = "กรุณากรอกรหัส OTP 6 หลัก";
        return false;
      }
      return true;
    };

    const clearErrors = () => {
      Object.keys(errors).forEach((key) => {
        errors[key] = "";
      });
    };

    // Timer functions
    const startOtpTimer = () => {
      stopOtpTimer();
      otpTimer = setInterval(() => {
        remainingTime.value--;
        if (remainingTime.value <= 0) {
          stopOtpTimer();
          showToast("รหัส OTP หมดอายุแล้ว กรุณาขอรหัสใหม่", "warning");
        }
      }, 1000);
    };

    const stopOtpTimer = () => {
      if (otpTimer) {
        clearInterval(otpTimer);
        otpTimer = null;
      }
    };

    const startResendTimer = () => {
      stopResendTimer();
      resendTimer = setInterval(() => {
        resendCooldown.value--;
        if (resendCooldown.value <= 0) {
          stopResendTimer();
        }
      }, 1000);
    };

    const stopResendTimer = () => {
      if (resendTimer) {
        clearInterval(resendTimer);
        resendTimer = null;
      }
    };

    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    // Cleanup on unmount
    onUnmounted(() => {
      stopOtpTimer();
      stopResendTimer();
    });

    return {
      currentStep,
      acceptTerms,
      selectedMethod,
      registrationComplete,
      nationalIdForm,
      otpForm,
      verifyingId,
      sendingOtp,
      verifyingOtp,
      otpSent,
      maskedTarget,
      remainingTime,
      resendCooldown,
      errors,
      nextStep,
      prevStep,
      goBack,
      selectMethod,
      formatNationalId,
      verifyNationalId,
      sendOtp,
      verifyOtp,
      resendOtp,
      resetOtp,
      otpInput,
      completeRegistration,
      formatTime,
    };
  },
};
</script>

<style scoped>
.verification-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
}

.verification-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  width: 100%;
  max-width: 900px;
  animation: slideUp 0.6s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.verification-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  text-align: center;
}

.gov-logo {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.9;
}

.verification-title {
  margin: 0 0 0.5rem 0;
  font-weight: 600;
  font-size: 2rem;
}

.verification-subtitle {
  margin: 0;
  opacity: 0.9;
  font-size: 1.1rem;
}

.progress-steps {
  display: flex;
  justify-content: space-between;
  padding: 2rem;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  overflow-x: auto;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  min-width: 120px;
  opacity: 0.5;
  transition: all 0.3s ease;
}

.step.active {
  opacity: 1;
  color: #667eea;
}

.step.completed {
  opacity: 1;
  color: #28a745;
}

.step-icon {
  width: 40px;
  height: 40px;
  border: 2px solid #dee2e6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
  background-color: white;
  font-weight: bold;
  transition: all 0.3s ease;
}

.step.active .step-icon {
  border-color: #667eea;
  background-color: #667eea;
  color: white;
}

.step.completed .step-icon {
  border-color: #28a745;
  background-color: #28a745;
  color: white;
}

.step-label {
  font-size: 0.875rem;
  font-weight: 500;
}

.step-content {
  padding: 2rem;
}

.terms-section h4 {
  color: #2c5aa0;
  margin-bottom: 1.5rem;
}

.terms-content {
  max-height: 300px;
  overflow-y: auto;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  line-height: 1.6;
}

.more-terms {
  text-align: center;
  margin-top: 1rem;
  color: #6c757d;
}

.terms-checkbox {
  margin-bottom: 2rem;
}

.terms-checkbox .form-check-label {
  font-size: 0.9rem;
  line-height: 1.5;
}

.verification-methods h4 {
  color: #2c5aa0;
  margin-bottom: 1rem;
}

.method-selection {
  margin-bottom: 2rem;
}

.verification-method {
  display: flex;
  align-items: center;
  padding: 1.5rem;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.verification-method:hover {
  border-color: #667eea;
  background-color: rgba(102, 126, 234, 0.05);
}

.verification-method.selected {
  border-color: #667eea;
  background-color: rgba(102, 126, 234, 0.1);
}

.method-icon {
  font-size: 2rem;
  color: #667eea;
  margin-right: 1rem;
  min-width: 60px;
  text-align: center;
}

.method-info {
  flex: 1;
}

.method-info h6 {
  margin: 0 0 0.5rem 0;
  color: #2c5aa0;
  font-weight: 600;
}

.method-info p {
  margin: 0;
  color: #6c757d;
  font-size: 0.9rem;
}

.method-status {
  font-size: 1.5rem;
  color: #667eea;
}

.national-id-verification h4,
.otp-verification h4 {
  color: #2c5aa0;
  margin-bottom: 1rem;
}

.resend-section {
  text-align: center;
}

.resend-section .btn-link {
  color: #667eea;
  text-decoration: none;
}

.resend-section .btn-link:hover {
  text-decoration: underline;
}

.step-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

.step-actions .btn {
  min-width: 150px;
}

.success-icon {
  margin-bottom: 2rem;
}

.form-label.required::after {
  content: " *";
  color: #dc3545;
}

.input-group-text {
  background-color: #f8f9fa;
  border-right: none;
  color: #6c757d;
}

.form-control {
  border-left: none;
  transition: all 0.3s ease;
}

.form-control:focus {
  border-left: none;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.btn-outline-secondary {
  border-color: #6c757d;
  transition: all 0.3s ease;
}

.btn-outline-secondary:hover {
  transform: translateY(-1px);
}

/* Mobile responsiveness */
@media (max-width: 767.98px) {
  .verification-container {
    padding: 1rem 0.5rem;
  }

  .verification-header {
    padding: 1.5rem;
  }

  .gov-logo {
    font-size: 2.5rem;
  }

  .verification-title {
    font-size: 1.5rem;
  }

  .progress-steps {
    padding: 1rem;
    gap: 0.5rem;
  }

  .step {
    min-width: 80px;
  }

  .step-icon {
    width: 35px;
    height: 35px;
  }

  .step-label {
    font-size: 0.75rem;
  }

  .step-content {
    padding: 1.5rem;
  }

  .step-actions {
    flex-direction: column;
  }

  .step-actions .btn {
    min-width: auto;
  }

  .verification-method {
    padding: 1rem;
  }

  .method-icon {
    font-size: 1.5rem;
    min-width: 50px;
  }
}

/* Animation for form validation */
.is-invalid {
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
  }
}
</style>
