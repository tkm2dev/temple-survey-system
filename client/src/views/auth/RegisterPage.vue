<template>
  <div class="register-container">
    <div class="register-card">
      <div class="register-header">
        <div class="header-icon">
          <i class="bi bi-person-plus-fill"></i>
        </div>
        <h2 class="register-title">ลงทะเบียนใช้งาน</h2>
        <p class="register-subtitle">
          ระบบสำรวจข้อมูลวัด สำหรับเจ้าหน้าที่ตำรวจ
        </p>
      </div>

      <!-- Show success/error messages -->
      <div v-if="registerSuccess" class="alert alert-success" role="alert">
        <i class="bi bi-check-circle me-2"></i>
        {{ registerSuccess }}
      </div>

      <div v-if="registerError" class="alert alert-danger" role="alert">
        <i class="bi bi-exclamation-triangle me-2"></i>
        {{ registerError }}
      </div>

      <form @submit.prevent="handleRegister" class="register-form">
        <!-- Personal Information Section -->
        <div class="form-section">
          <h5 class="section-title">
            <i class="bi bi-person me-2"></i>
            ข้อมูลส่วนตัว
          </h5>

          <div class="row">
            <div class="col-lg-6 mb-3">
              <label class="form-label required">ยศ</label>
              <div class="input-group">
                <span class="input-group-text">
                  <i class="bi bi-award"></i>
                </span>
                <select
                  v-model="form.rank"
                  class="form-select"
                  :class="{ 'is-invalid': errors.rank }"
                  required
                  @change="validateField('rank')"
                >
                  <option value="">เลือกยศ</option>
                  <option value="ส.ต.ต.">ส.ต.ต. (สิบตำรวจตรี)</option>
                  <option value="ส.ต.ท.">ส.ต.ท. (สิบตำรวจโท)</option>
                  <option value="ส.ต.อ.">ส.ต.อ. (สิบตำรวจเอก)</option>
                  <option value="จ.ส.ต.">จ.ส.ต. (จ่าสิบตำรวจ)</option>
                  <option value="ด.ต.">ด.ต. (ดาบตำรวจ)</option>
                  <option value="ร.ต.ต.">ร.ต.ต. (ร้อยตำรวจตรี)</option>
                  <option value="ร.ต.ท.">ร.ต.ท. (ร้อยตำรวจโท)</option>
                  <option value="ร.ต.อ.">ร.ต.อ. (ร้อยตำรวจเอก)</option>
                  <option value="พ.ต.ต.">พ.ต.ต. (พันตำรวจตรี)</option>
                  <option value="พ.ต.ท.">พ.ต.ท. (พันตำรวจโท)</option>
                  <option value="พ.ต.อ.">พ.ต.อ. (พันตำรวจเอก)</option>
                  <option value="อื่นๆ">อื่นๆ</option>
                </select>
                <div v-if="errors.rank" class="invalid-feedback">
                  {{ errors.rank }}
                </div>
              </div>
            </div>

            <div class="col-lg-6 mb-3">
              <label class="form-label required">เลขบัตรประจำตัวประชาชน</label>
              <div class="input-group">
                <span class="input-group-text">
                  <i class="bi bi-credit-card"></i>
                </span>
                <input
                  v-model="form.idcard"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': errors.idcard }"
                  placeholder="x-xxxx-xxxxx-xx-x"
                  maxlength="17"
                  required
                  @input="formatNationalId"
                  @blur="validateField('idcard')"
                />
                <div v-if="errors.idcard" class="invalid-feedback">
                  {{ errors.idcard }}
                </div>
              </div>
            </div>
          </div>

          <div class="row">
            <div class="col-lg-6 mb-3">
              <label class="form-label required">ชื่อ</label>
              <div class="input-group">
                <span class="input-group-text">
                  <i class="bi bi-person"></i>
                </span>
                <input
                  v-model="form.first_name"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': errors.first_name }"
                  placeholder="ชื่อจริง"
                  required
                  @blur="validateField('first_name')"
                />
                <div v-if="errors.first_name" class="invalid-feedback">
                  {{ errors.first_name }}
                </div>
              </div>
            </div>

            <div class="col-lg-6 mb-3">
              <label class="form-label required">นามสกุล</label>
              <div class="input-group">
                <span class="input-group-text">
                  <i class="bi bi-person"></i>
                </span>
                <input
                  v-model="form.last_name"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': errors.last_name }"
                  placeholder="นามสกุล"
                  required
                  @blur="validateField('last_name')"
                />
                <div v-if="errors.last_name" class="invalid-feedback">
                  {{ errors.last_name }}
                </div>
              </div>
            </div>
          </div>

          <div class="row">
            <div class="col-lg-6 mb-3">
              <label class="form-label required">อีเมล</label>
              <div class="input-group">
                <span class="input-group-text">
                  <i class="bi bi-envelope"></i>
                </span>
                <input
                  v-model="form.email"
                  type="email"
                  class="form-control"
                  :class="{ 'is-invalid': errors.email }"
                  placeholder="example@police.go.th"
                  required
                  @blur="validateField('email')"
                />
                <div v-if="errors.email" class="invalid-feedback">
                  {{ errors.email }}
                </div>
              </div>
            </div>

            <div class="col-lg-6 mb-3">
              <label class="form-label required">เบอร์โทรศัพท์</label>
              <div class="input-group">
                <span class="input-group-text">
                  <i class="bi bi-telephone"></i>
                </span>
                <input
                  v-model="form.phone"
                  type="tel"
                  class="form-control"
                  :class="{ 'is-invalid': errors.phone }"
                  placeholder="08x-xxx-xxxx"
                  required
                  @input="formatPhoneNumber"
                  @blur="validateField('phone')"
                />
                <div v-if="errors.phone" class="invalid-feedback">
                  {{ errors.phone }}
                </div>
              </div>
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label">Line ID</label>
            <div class="input-group">
              <span class="input-group-text">
                <i class="bi bi-chat-dots"></i>
              </span>
              <input
                v-model="form.line_id"
                type="text"
                class="form-control"
                placeholder="Line ID (ไม่บังคับ)"
              />
            </div>
            <div class="form-text">
              <i class="bi bi-info-circle me-1"></i>
              สำหรับการติดต่อสื่อสารผ่าน Line
            </div>
          </div>
        </div>

        <!-- Work Information Section -->
        <div class="form-section">
          <h5 class="section-title">
            <i class="bi bi-building me-2"></i>
            ข้อมูลการปฏิบัติงาน
          </h5>

          <div class="mb-3">
            <label class="form-label required">สังกัด</label>
            <div class="input-group">
              <span class="input-group-text">
                <i class="bi bi-building"></i>
              </span>
              <select
                v-model="form.department"
                class="form-select"
                :class="{ 'is-invalid': errors.department }"
                required
                @change="validateField('department')"
              >
                <option value="">เลือกสังกัด</option>
                <option value="สำนักงานตำรวจแห่งชาติ">
                  สำนักงานตำรวจแห่งชาติ
                </option>
                <option value="สำนักงานผู้บัญชาการตำรวจแห่งชาติ">
                  สำนักงานผู้บัญชาการตำรวจแห่งชาติ
                </option>
                <option value="กองบัญชาการตำรวจนครบาล">
                  กองบัญชาการตำรวจนครบาล
                </option>
                <option value="กองบัญชาการตำรวจท่องเที่ยว">
                  กองบัญชาการตำรวจท่องเที่ยว
                </option>
                <option value="กองบัญชาการตำรวจปราบปรามยาเสพติด">
                  กองบัญชาการตำรวจปราบปรามยาเสพติด
                </option>
                <option value="กองบัญชาการตำรวจตระเวนชายแดน">
                  กองบัญชาการตำรวจตระเวนชายแดน
                </option>
                <option value="กรมตำรวจ">กรมตำรวจ</option>
                <option value="สำนักงานตำรวจภูธรภาค 1">
                  สำนักงานตำรวจภูธรภาค 1
                </option>
                <option value="สำนักงานตำรวจภูธรภาค 2">
                  สำนักงานตำรวจภูธรภาค 2
                </option>
                <option value="สำนักงานตำรวจภูธรภาค 3">
                  สำนักงานตำรวจภูธรภาค 3
                </option>
                <option value="สำนักงานตำรวจภูธรภาค 4">
                  สำนักงานตำรวจภูธรภาค 4
                </option>
                <option value="สำนักงานตำรวจภูธรภาค 5">
                  สำนักงานตำรวจภูธรภาค 5
                </option>
                <option value="สำนักงานตำรวจภูธรภาค 6">
                  สำนักงานตำรวจภูธรภาค 6
                </option>
                <option value="สำนักงานตำรวจภูธรภาค 7">
                  สำนักงานตำรวจภูธรภาค 7
                </option>
                <option value="สำนักงานตำรวจภูธรภาค 8">
                  สำนักงานตำรวจภูธรภาค 8
                </option>
                <option value="สำนักงานตำรวจภูธรภาค 9">
                  สำนักงานตำรวจภูธรภาค 9
                </option>
              </select>
              <div v-if="errors.department" class="invalid-feedback">
                {{ errors.department }}
              </div>
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label required">สถานีตำรวจ/หน่วยงาน</label>
            <div class="input-group">
              <span class="input-group-text">
                <i class="bi bi-geo-alt"></i>
              </span>
              <input
                v-model="form.station"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.station }"
                placeholder="เช่น สถานีตำรวจภูธรเมือง, กองกำกับการ X"
                required
                @blur="validateField('station')"
              />
              <div v-if="errors.station" class="invalid-feedback">
                {{ errors.station }}
              </div>
            </div>
            <div class="form-text">
              <i class="bi bi-info-circle me-1"></i>
              ระบุสถานีตำรวจหรือหน่วยงานที่ปฏิบัติงานอยู่ในปัจจุบัน
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label">ตำแหน่งงาน</label>
            <div class="input-group">
              <span class="input-group-text">
                <i class="bi bi-person-workspace"></i>
              </span>
              <input
                v-model="form.position"
                type="text"
                class="form-control"
                placeholder="เช่น เจ้าหน้าที่สืบสวน, ผู้กำกับสถานี, เจ้าหน้าที่ธุรการ"
              />
            </div>
          </div>
        </div>

        <!-- Account Information Section -->
        <div class="form-section">
          <h5 class="section-title">
            <i class="bi bi-key me-2"></i>
            ข้อมูลบัญชีผู้ใช้
          </h5>

          <div class="mb-3">
            <label class="form-label required">ชื่อผู้ใช้</label>
            <div class="input-group">
              <span class="input-group-text">
                <i class="bi bi-person-circle"></i>
              </span>
              <input
                v-model="form.username"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.username }"
                placeholder="ชื่อผู้ใช้ (a-z, 0-9, _ เท่านั้น)"
                required
                @blur="checkUsername"
                @input="validateField('username')"
              />
              <div v-if="usernameChecking" class="input-group-text">
                <div class="spinner-border spinner-border-sm" role="status">
                  <span class="visually-hidden">กำลังตรวจสอบ...</span>
                </div>
              </div>
              <div v-if="errors.username" class="invalid-feedback">
                {{ errors.username }}
              </div>
            </div>
            <div class="form-text">
              <i class="bi bi-info-circle me-1"></i>
              ชื่อผู้ใช้ต้องมีความยาว 3-20 ตัวอักษร
              ใช้ภาษาอังกฤษและตัวเลขเท่านั้น
            </div>
          </div>

          <div class="row">
            <div class="col-lg-6 mb-3">
              <label class="form-label required">รหัสผ่าน</label>
              <div class="input-group">
                <span class="input-group-text">
                  <i class="bi bi-lock"></i>
                </span>
                <input
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  class="form-control"
                  :class="{ 'is-invalid': errors.password }"
                  placeholder="รหัสผ่าน"
                  required
                  @input="validateField('password')"
                />
                <button
                  type="button"
                  class="btn btn-outline-secondary"
                  @click="showPassword = !showPassword"
                >
                  <i
                    :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"
                  ></i>
                </button>
                <div v-if="errors.password" class="invalid-feedback">
                  {{ errors.password }}
                </div>
              </div>
              <!-- Password Strength Indicator -->
              <div v-if="form.password" class="password-strength mt-2">
                <div class="strength-meter">
                  <div
                    class="strength-fill"
                    :class="passwordStrength.class"
                    :style="{ width: passwordStrength.percentage + '%' }"
                  ></div>
                </div>
                <small class="strength-text" :class="passwordStrength.class">
                  ความแข็งแกร่ง: {{ passwordStrength.text }}
                </small>
              </div>
            </div>

            <div class="col-lg-6 mb-3">
              <label class="form-label required">ยืนยันรหัสผ่าน</label>
              <div class="input-group">
                <span class="input-group-text">
                  <i class="bi bi-lock-fill"></i>
                </span>
                <input
                  v-model="form.confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  class="form-control"
                  :class="{ 'is-invalid': errors.confirmPassword }"
                  placeholder="ยืนยันรหัสผ่าน"
                  required
                  @input="validateField('confirmPassword')"
                />
                <button
                  type="button"
                  class="btn btn-outline-secondary"
                  @click="showConfirmPassword = !showConfirmPassword"
                >
                  <i
                    :class="
                      showConfirmPassword ? 'bi bi-eye-slash' : 'bi bi-eye'
                    "
                  ></i>
                </button>
                <div v-if="errors.confirmPassword" class="invalid-feedback">
                  {{ errors.confirmPassword }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Terms and Conditions Section -->
        <div class="form-section">
          <div class="form-check mb-3">
            <input
              v-model="form.acceptTerms"
              type="checkbox"
              class="form-check-input"
              :class="{ 'is-invalid': errors.acceptTerms }"
              id="acceptTerms"
              required
            />
            <label class="form-check-label" for="acceptTerms">
              ฉันยอมรับ
              <a
                href="#"
                @click.prevent="showTerms = true"
                class="text-primary"
              >
                ข้อกำหนดและเงื่อนไข
              </a>
              และ
              <a
                href="#"
                @click.prevent="showPrivacy = true"
                class="text-primary"
              >
                นโยบายความเป็นส่วนตัว
              </a>
            </label>
            <div v-if="errors.acceptTerms" class="invalid-feedback d-block">
              {{ errors.acceptTerms }}
            </div>
          </div>

          <div class="alert alert-info">
            <i class="bi bi-info-circle me-2"></i>
            <strong>หมายเหตุ:</strong>
            บัญชีของท่านจะอยู่ในสถานะ "รออนุมัติ"
            และจะต้องได้รับการอนุมัติจากผู้ดูแลระบบก่อนจึงจะสามารถใช้งานได้
            บทบาทและสิทธิ์การใช้งานจะถูกกำหนดโดยผู้ดูแลระบบ
          </div>
        </div>

        <!-- Submit Button -->
        <div class="form-actions">
          <button
            type="submit"
            class="btn btn-primary btn-lg w-100"
            :disabled="loading"
          >
            <span
              v-if="loading"
              class="spinner-border spinner-border-sm me-2"
              role="status"
            >
              <span class="visually-hidden">กำลังประมวลผล...</span>
            </span>
            <i v-else class="bi bi-person-plus me-2"></i>
            {{ loading ? "กำลังลงทะเบียน..." : "ลงทะเบียน" }}
          </button>

          <div class="text-center mt-3">
            <p class="mb-0">
              มีบัญชีแล้ว?
              <router-link
                to="/auth/login"
                class="text-primary text-decoration-none"
              >
                เข้าสู่ระบบ
              </router-link>
            </p>
          </div>
        </div>
      </form>
    </div>

    <!-- Terms Modal -->
    <div
      v-if="showTerms"
      class="modal show d-block"
      tabindex="-1"
      style="background-color: rgba(0, 0, 0, 0.5)"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">ข้อกำหนดและเงื่อนไข</h5>
            <button
              type="button"
              class="btn-close"
              @click="showTerms = false"
            ></button>
          </div>
          <div class="modal-body terms-content">
            <h6>1. การใช้งานระบบ</h6>
            <p>
              ระบบนี้พัฒนาขึ้นเพื่อการสำรวจข้อมูลวัดสำหรับเจ้าหน้าที่ตำรวจ
              ผู้ใช้ต้องใช้งานตามวัตถุประสงค์ที่กำหนดเท่านั้น
            </p>

            <h6>2. ความรับผิดชอบของผู้ใช้</h6>
            <p>
              ผู้ใช้มีความรับผิดชอบในการรักษาความปลอดภัยของบัญชี
              และใช้งานระบบอย่างเหมาะสม
            </p>

            <h6>3. การรักษาข้อมูล</h6>
            <p>
              ข้อมูลที่บันทึกในระบบจะถูกเก็บรักษาตามมาตรฐานความปลอดภัยและกฎหมายที่เกี่ยวข้อง
            </p>

            <h6>4. การเปลี่ยนแปลงข้อกำหนด</h6>
            <p>
              ทางระบบขอสงวนสิทธิ์ในการเปลี่ยนแปลงข้อกำหนดโดยไม่ต้องแจ้งให้ทราบล่วงหน้า
            </p>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              @click="showTerms = false"
            >
              ปิด
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Privacy Modal -->
    <div
      v-if="showPrivacy"
      class="modal show d-block"
      tabindex="-1"
      style="background-color: rgba(0, 0, 0, 0.5)"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">นโยบายความเป็นส่วนตัว</h5>
            <button
              type="button"
              class="btn-close"
              @click="showPrivacy = false"
            ></button>
          </div>
          <div class="modal-body privacy-content">
            <h6>การเก็บรวบรวมข้อมูล</h6>
            <p>
              เราเก็บรวบรวมข้อมูลส่วนบุคคลที่จำเป็นสำหรับการใช้งานระบบเท่านั้น
            </p>

            <h6>การใช้ข้อมูล</h6>
            <p>
              ข้อมูลจะถูกใช้เพื่อการดำเนินงานของระบบและการติดต่อสื่อสารที่จำเป็น
            </p>

            <h6>การปกป้องข้อมูล</h6>
            <p>เรามีมาตรการรักษาความปลอดภัยข้อมูลตามมาตรฐานสากล</p>

            <h6>สิทธิของเจ้าของข้อมูล</h6>
            <p>ท่านมีสิทธิ์ในการเข้าถึง แก้ไข หรือลบข้อมูลส่วนบุคคลของท่าน</p>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              @click="showPrivacy = false"
            >
              ปิด
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, watch } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { useToast } from "@/composables/useToast";

export default {
  name: "RegisterPage",
  setup() {
    const router = useRouter();
    const { showToast } = useToast();

    // Form state
    const form = reactive({
      rank: "",
      idcard: "",
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      line_id: "",
      department: "",
      station: "",
      position: "",
      username: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    });

    // Error state
    const errors = reactive({
      rank: "",
      idcard: "",
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      department: "",
      station: "",
      username: "",
      password: "",
      confirmPassword: "",
      acceptTerms: "",
    });

    // UI state
    const loading = ref(false);
    const registerError = ref("");
    const registerSuccess = ref("");
    const showPassword = ref(false);
    const showConfirmPassword = ref(false);
    const showTerms = ref(false);
    const showPrivacy = ref(false);
    const usernameChecking = ref(false);

    // Password strength computation
    const passwordStrength = computed(() => {
      const password = form.password;
      if (!password) return { class: "", percentage: 0, text: "" };

      let score = 0;
      let feedback = [];

      // Length check
      if (password.length >= 8) score += 25;
      else feedback.push("อย่างน้อย 8 ตัวอักษร");

      // Uppercase check
      if (/[A-Z]/.test(password)) score += 25;
      else feedback.push("ตัวพิมพ์ใหญ่");

      // Lowercase check
      if (/[a-z]/.test(password)) score += 25;
      else feedback.push("ตัวพิมพ์เล็ก");

      // Number check
      if (/\d/.test(password)) score += 25;
      else feedback.push("ตัวเลข");

      let strengthClass, strengthText;
      if (score < 25) {
        strengthClass = "weak";
        strengthText = "อ่อนแอ";
      } else if (score < 50) {
        strengthClass = "fair";
        strengthText = "พอใช้";
      } else if (score < 75) {
        strengthClass = "good";
        strengthText = "ดี";
      } else {
        strengthClass = "strong";
        strengthText = "แข็งแกร่ง";
      }

      if (feedback.length > 0) {
        strengthText += ` (ขาด: ${feedback.join(", ")})`;
      }

      return {
        class: strengthClass,
        percentage: score,
        text: strengthText,
      };
    });

    // Format national ID
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

      form.idcard = value;
    };

    // Format phone number
    const formatPhoneNumber = (event) => {
      let value = event.target.value.replace(/\D/g, "");
      if (value.length > 10) value = value.slice(0, 10);

      if (value.length >= 3) {
        value = value.replace(
          /(\d{3})(\d{0,3})(\d{0,4})/,
          (match, p1, p2, p3) => {
            let formatted = p1;
            if (p2) formatted += "-" + p2;
            if (p3) formatted += "-" + p3;
            return formatted;
          }
        );
      }

      form.phone = value;
    };

    // Validate individual field
    const validateField = (fieldName) => {
      errors[fieldName] = "";

      switch (fieldName) {
        case "rank":
          if (!form.rank) {
            errors.rank = "กรุณาเลือกยศ";
          }
          break;

        case "idcard":
          const nationalId = form.idcard.replace(/\D/g, "");
          if (!nationalId) {
            errors.idcard = "กรุณากรอกเลขบัตรประจำตัวประชาชน";
          } else if (nationalId.length !== 13) {
            errors.idcard = "เลขบัตรประจำตัวประชาชนต้องมี 13 หลัก";
          } else if (!isValidNationalId(nationalId)) {
            errors.idcard = "เลขบัตรประจำตัวประชาชนไม่ถูกต้อง";
          }
          break;

        case "first_name":
          if (!form.first_name.trim()) {
            errors.first_name = "กรุณากรอกชื่อ";
          } else if (form.first_name.trim().length < 2) {
            errors.first_name = "ชื่อต้องมีความยาวอย่างน้อย 2 ตัวอักษร";
          }
          break;

        case "last_name":
          if (!form.last_name.trim()) {
            errors.last_name = "กรุณากรอกนามสกุล";
          } else if (form.last_name.trim().length < 2) {
            errors.last_name = "นามสกุลต้องมีความยาวอย่างน้อย 2 ตัวอักษร";
          }
          break;

        case "email":
          if (!form.email.trim()) {
            errors.email = "กรุณากรอกอีเมล";
          } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            errors.email = "รูปแบบอีเมลไม่ถูกต้อง";
          }
          break;

        case "phone":
          const phone = form.phone.replace(/\D/g, "");
          if (!phone) {
            errors.phone = "กรุณากรอกเบอร์โทรศัพท์";
          } else if (phone.length !== 10) {
            errors.phone = "เบอร์โทรศัพท์ต้องมี 10 หลัก";
          } else if (!/^(08|09|02|03|04|05|07)/.test(phone)) {
            errors.phone = "รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง";
          }
          break;

        case "department":
          if (!form.department) {
            errors.department = "กรุณาเลือกสังกัด";
          }
          break;

        case "station":
          if (!form.station.trim()) {
            errors.station = "กรุณากรอกสถานีตำรวจ/หน่วยงาน";
          }
          break;

        case "username":
          if (!form.username.trim()) {
            errors.username = "กรุณากรอกชื่อผู้ใช้";
          } else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) {
            errors.username =
              "ชื่อผู้ใช้ได้เฉพาะตัวอักษรภาษาอังกฤษ ตัวเลข และ _";
          } else if (form.username.length < 3 || form.username.length > 20) {
            errors.username = "ชื่อผู้ใช้ต้องมีความยาว 3-20 ตัวอักษร";
          }
          break;

        case "password":
          if (!form.password) {
            errors.password = "กรุณากรอกรหัสผ่าน";
          } else if (form.password.length < 8) {
            errors.password = "รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร";
          }
          // Also validate confirm password if it's filled
          if (form.confirmPassword && form.password !== form.confirmPassword) {
            errors.confirmPassword = "รหัสผ่านไม่ตรงกัน";
          } else if (
            form.confirmPassword &&
            form.password === form.confirmPassword
          ) {
            errors.confirmPassword = "";
          }
          break;

        case "confirmPassword":
          if (!form.confirmPassword) {
            errors.confirmPassword = "กรุณายืนยันรหัสผ่าน";
          } else if (form.password !== form.confirmPassword) {
            errors.confirmPassword = "รหัสผ่านไม่ตรงกัน";
          }
          break;
      }
    };

    // Validate Thai National ID
    const isValidNationalId = (id) => {
      if (id.length !== 13) return false;

      let sum = 0;
      for (let i = 0; i < 12; i++) {
        sum += parseInt(id.charAt(i)) * (13 - i);
      }

      const remainder = sum % 11;
      const checkDigit = (11 - remainder) % 10;

      return checkDigit === parseInt(id.charAt(12));
    };

    // Check username availability
    const checkUsername = async () => {
      if (!form.username || errors.username) return;

      usernameChecking.value = true;
      try {
        const response = await axios.get(
          `/api/auth/check-username/${form.username}`
        );
        if (!response.data.data.available) {
          errors.username = "ชื่อผู้ใช้นี้ถูกใช้งานแล้ว";
        }
      } catch (error) {
        console.error("Username check error:", error);
        showToast("เกิดข้อผิดพลาดในการตรวจสอบชื่อผู้ใช้", "error");
      } finally {
        usernameChecking.value = false;
      }
    };

    // Validate entire form
    const validateForm = () => {
      // Clear all errors first
      Object.keys(errors).forEach((key) => {
        errors[key] = "";
      });

      let isValid = true;

      // Validate required fields
      const requiredFields = [
        "rank",
        "idcard",
        "first_name",
        "last_name",
        "email",
        "phone",
        "department",
        "station",
        "username",
        "password",
        "confirmPassword",
      ];

      requiredFields.forEach((field) => {
        validateField(field);
        if (errors[field]) {
          isValid = false;
        }
      });

      // Validate terms acceptance
      if (!form.acceptTerms) {
        errors.acceptTerms = "กรุณายอมรับข้อกำหนดและเงื่อนไข";
        isValid = false;
      }

      return isValid;
    };

    // Handle form submission
    const handleRegister = async () => {
      registerError.value = "";
      registerSuccess.value = "";

      if (!validateForm()) {
        showToast("กรุณาตรวจสอบข้อมูลที่กรอกให้ถูกต้อง", "error");
        return;
      }

      loading.value = true;

      try {
        const registrationData = {
          username: form.username.trim(),
          password: form.password,
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          email: form.email.trim(),
          phone: form.phone.replace(/\D/g, ""),
          line_id: form.line_id.trim() || null,
          rank: form.rank,
          position: form.position.trim() || null,
          department: form.department,
          station: form.station.trim(),
          idcard: form.idcard.replace(/\D/g, ""),
        };

        const response = await axios.post(
          "/api/auth/register",
          registrationData
        );

        if (response.data.success) {
          registerSuccess.value = response.data.message;
          showToast(response.data.message, "success");

          // Redirect to login page after 3 seconds
          setTimeout(() => {
            router.push("/auth/login");
          }, 3000);
        }
      } catch (error) {
        console.error("Registration error:", error);
        const errorMessage =
          error.response?.data?.message || "เกิดข้อผิดพลาดในการลงทะเบียน";
        registerError.value = errorMessage;
        showToast(errorMessage, "error");
      } finally {
        loading.value = false;
      }
    };

    // Watch for username changes
    watch(
      () => form.username,
      (newUsername) => {
        if (newUsername && newUsername.length >= 3) {
          validateField("username");
        }
      }
    );

    return {
      form,
      errors,
      loading,
      registerError,
      registerSuccess,
      showPassword,
      showConfirmPassword,
      showTerms,
      showPrivacy,
      usernameChecking,
      passwordStrength,
      formatNationalId,
      formatPhoneNumber,
      validateField,
      checkUsername,
      handleRegister,
    };
  },
};
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
}

.register-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  width: 100%;
  max-width: 800px;
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

.register-header {
  background: linear-gradient(135deg, #2c5aa0 0%, #3498db 100%);
  color: white;
  padding: 2.5rem 2rem;
  text-align: center;
}

.header-icon {
  font-size: 3.5rem;
  margin-bottom: 1rem;
  opacity: 0.9;
}

.register-title {
  margin: 0 0 0.5rem 0;
  font-weight: 600;
  font-size: 1.8rem;
}

.register-subtitle {
  margin: 0;
  opacity: 0.9;
  font-size: 1rem;
}

.register-form {
  padding: 2rem;
}

.form-section {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
}

.form-section:not(:last-child) {
  border-bottom: 1px solid #e9ecef;
}

.section-title {
  color: #2c5aa0;
  margin-bottom: 1.5rem;
  font-weight: 600;
  font-size: 1.1rem;
}

.form-label.required::after {
  content: " *";
  color: #dc3545;
}

.input-group-text {
  background-color: #f8f9fa;
  border-right: none;
  color: #6c757d;
  min-width: 45px;
  justify-content: center;
}

.form-control,
.form-select {
  border-left: none;
  transition: all 0.3s ease;
}

.form-control:focus,
.form-select:focus {
  border-left: none;
  box-shadow: 0 0 0 0.2rem rgba(44, 90, 160, 0.25);
}

.input-group:focus-within .input-group-text {
  border-color: #2c5aa0;
  background-color: rgba(44, 90, 160, 0.1);
  color: #2c5aa0;
}

.password-strength {
  margin-top: 0.5rem;
}

.strength-meter {
  height: 4px;
  background-color: #e9ecef;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 0.25rem;
}

.strength-fill {
  height: 100%;
  transition: all 0.3s ease;
}

.strength-fill.weak {
  background-color: #dc3545;
}

.strength-fill.fair {
  background-color: #fd7e14;
}

.strength-fill.good {
  background-color: #ffc107;
}

.strength-fill.strong {
  background-color: #28a745;
}

.strength-text.weak {
  color: #dc3545;
}

.strength-text.fair {
  color: #fd7e14;
}

.strength-text.good {
  color: #ffc107;
}

.strength-text.strong {
  color: #28a745;
}

.btn-primary {
  background: linear-gradient(135deg, #2c5aa0 0%, #3498db 100%);
  border: none;
  font-weight: 600;
  transition: all 0.3s ease;
  padding: 0.75rem 1.5rem;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(44, 90, 160, 0.4);
}

.btn-outline-secondary {
  border-color: #6c757d;
  transition: all 0.3s ease;
}

.btn-outline-secondary:hover {
  transform: translateY(-1px);
}

.alert {
  border: none;
  border-radius: 10px;
  margin-bottom: 1.5rem;
}

.alert-success {
  background-color: #d1e7dd;
  color: #0a3622;
}

.alert-danger {
  background-color: #f8d7da;
  color: #58151c;
}

.alert-info {
  background-color: #cff4fc;
  color: #055160;
}

.form-text {
  font-size: 0.875rem;
  color: #6c757d;
  margin-top: 0.25rem;
}

.form-check-input:checked {
  background-color: #2c5aa0;
  border-color: #2c5aa0;
}

.modal-content {
  border: none;
  border-radius: 15px;
}

.modal-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  border-radius: 15px 15px 0 0;
}

.terms-content h6,
.privacy-content h6 {
  color: #2c5aa0;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.terms-content h6:first-child,
.privacy-content h6:first-child {
  margin-top: 0;
}

.form-actions {
  margin-top: 2rem;
}

/* Mobile optimizations */
@media (max-width: 767.98px) {
  .register-container {
    padding: 1rem 0.5rem;
  }

  .register-header {
    padding: 2rem 1rem;
  }

  .header-icon {
    font-size: 3rem;
  }

  .register-title {
    font-size: 1.5rem;
  }

  .register-subtitle {
    font-size: 0.9rem;
  }

  .register-form {
    padding: 1.5rem;
  }

  .form-section {
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
  }

  .section-title {
    font-size: 1rem;
  }

  .modal-dialog {
    margin: 1rem;
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

/* Loading spinner animation */
.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}
</style>
