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
        <i class="bi bi-plus-circle me-2 text-primary"></i>
        สร้างการสำรวจใหม่
      </h2>
      <p class="text-muted mb-0">กรอกข้อมูลการสำรวจให้ครบถ้วนตามขั้นตอน</p>
    </div>

    <!-- Progress Indicator -->
    <SurveyFormProgress
      :current-step="currentFormStep"
      :form-data="form"
      :is-temple-type="isTempleType"
    />

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
                  v-model="form.type_id"
                  class="form-select"
                  :class="{ 'is-invalid': errors.type_id }"
                  id="surveyType"
                  required
                  @change="onSurveyTypeChange"
                >
                  <option value="">เลือกประเภทการสำรวจ</option>
                  <option
                    v-for="type in surveyTypes"
                    :key="type.type_id"
                    :value="type.type_id"
                  >
                    {{ type.type_name }}
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
                  rows="2"
                  placeholder="ระบุที่อยู่โดยละเอียด"
                  required
                ></textarea>
                <div v-if="errors.address" class="invalid-feedback">
                  {{ errors.address }}
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
            <div class="col-md-4">
              <div class="mb-3">
                <label for="postalCode" class="form-label">รหัสไปรษณีย์</label>
                <input
                  v-model="form.postal_code"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': errors.postal_code }"
                  id="postalCode"
                  placeholder="XXXXX"
                  maxlength="5"
                />
                <div v-if="errors.postal_code" class="invalid-feedback">
                  {{ errors.postal_code }}
                </div>
              </div>
            </div>

            <div class="col-md-4">
              <div class="mb-3">
                <label for="latitude" class="form-label"
                  >พิกัด GPS - ละติจูด</label
                >
                <div class="input-group">
                  <input
                    v-model.number="form.gps_latitude"
                    type="number"
                    class="form-control"
                    :class="{ 'is-invalid': errors.gps_latitude }"
                    id="latitude"
                    step="any"
                    placeholder="13.7563"
                  />
                  <button
                    type="button"
                    class="btn btn-outline-secondary"
                    @click="getCurrentLocation"
                    :disabled="gettingLocation"
                    title="ใช้ตำแหน่งปัจจุบัน"
                  >
                    <i
                      v-if="gettingLocation"
                      class="bi bi-arrow-clockwise spin"
                    ></i>
                    <i v-else class="bi bi-geo-alt"></i>
                  </button>
                </div>
                <div v-if="errors.gps_latitude" class="invalid-feedback">
                  {{ errors.gps_latitude }}
                </div>
              </div>
            </div>

            <div class="col-md-4">
              <div class="mb-3">
                <label for="longitude" class="form-label"
                  >พิกัด GPS - ลองจิจูด</label
                >
                <input
                  v-model.number="form.gps_longitude"
                  type="number"
                  class="form-control"
                  :class="{ 'is-invalid': errors.gps_longitude }"
                  id="longitude"
                  step="any"
                  placeholder="100.5018"
                />
                <div v-if="errors.gps_longitude" class="invalid-feedback">
                  {{ errors.gps_longitude }}
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
      <div v-if="isTempleType" class="card mb-4">
        <div class="card-header">
          <h5 class="mb-0">
            <i class="bi bi-building me-2 text-primary"></i>
            ข้อมูลวัด
          </h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <div class="mb-3">
                <label for="templeType" class="form-label">
                  ประเภทวัด <span class="text-danger">*</span>
                </label>
                <select
                  v-model="templeDetails.temple_type_id"
                  class="form-select"
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

            <div class="col-md-6">
              <div class="mb-3">
                <label for="denomination" class="form-label">
                  สังกัด/นิกาย <span class="text-danger">*</span>
                </label>
                <select
                  v-model="templeDetails.denomination_id"
                  class="form-select"
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
                <label for="historySummary" class="form-label">
                  ประวัติสรุป
                </label>
                <textarea
                  v-model="templeDetails.history_summary"
                  class="form-control"
                  :class="{ 'is-invalid': errors.history_summary }"
                  id="historySummary"
                  rows="3"
                  placeholder="ระบุประวัติสรุปของวัด (ถ้ามี)"
                ></textarea>
                <div v-if="errors.history_summary" class="invalid-feedback">
                  {{ errors.history_summary }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Personnel Card -->
      <div class="card mb-4">
        <div
          class="card-header d-flex justify-content-between align-items-center"
        >
          <h5 class="mb-0">
            <i class="bi bi-people me-2 text-info"></i>
            บุคลากรที่เกี่ยวข้อง
          </h5>
          <button
            type="button"
            class="btn btn-sm btn-outline-info"
            @click="addPersonnel"
          >
            <i class="bi bi-plus me-1"></i>
            เพิ่มบุคลากร
          </button>
        </div>
        <div class="card-body">
          <div
            v-if="personnel.length === 0"
            class="text-center text-muted py-3"
          >
            <i class="bi bi-person-plus fs-1 d-block mb-2"></i>
            <p>ยังไม่มีข้อมูลบุคลากร</p>
            <small
              >คลิกปุ่ม "เพิ่มบุคลากร"
              เพื่อเพิ่มข้อมูลบุคลากรที่เกี่ยวข้อง</small
            >
          </div>

          <div v-else>
            <div
              v-for="(person, index) in personnel"
              :key="index"
              class="personnel-item p-3 mb-3 border rounded"
            >
              <div
                class="d-flex justify-content-between align-items-start mb-3"
              >
                <h6 class="mb-0">
                  <i class="bi bi-person me-2"></i>
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
                <div class="col-md-3">
                  <div class="mb-3">
                    <label class="form-label">บทบาท/หน้าที่</label>
                    <select
                      v-model="person.role"
                      class="form-select form-select-sm"
                      :class="{
                        'is-invalid': errors[`personnel_${index}_role`],
                      }"
                    >
                      <option value="">เลือกบทบาท</option>
                      <option value="เจ้าอาวาส">เจ้าอาวาس</option>
                      <option value="รองเจ้าอาวาส">รองเจ้าอาวาส</option>
                      <option value="เลขานุการ">เลขานุการ</option>
                      <option value="เหรัญญิก">เหรัญญิก</option>
                      <option value="กรรมการ">กรรมการ</option>
                      <option value="อื่นๆ">อื่นๆ</option>
                    </select>
                    <div
                      v-if="errors[`personnel_${index}_role`]"
                      class="invalid-feedback"
                    >
                      {{ errors[`personnel_${index}_role`] }}
                    </div>
                  </div>
                </div>

                <div class="col-md-3">
                  <div class="mb-3">
                    <label class="form-label">ชื่อ</label>
                    <input
                      v-model="person.first_name"
                      type="text"
                      class="form-control form-control-sm"
                      :class="{
                        'is-invalid': errors[`personnel_${index}_first_name`],
                      }"
                      placeholder="ชื่อ"
                    />
                    <div
                      v-if="errors[`personnel_${index}_first_name`]"
                      class="invalid-feedback"
                    >
                      {{ errors[`personnel_${index}_first_name`] }}
                    </div>
                  </div>
                </div>

                <div class="col-md-3">
                  <div class="mb-3">
                    <label class="form-label">นามสกุล</label>
                    <input
                      v-model="person.last_name"
                      type="text"
                      class="form-control form-control-sm"
                      :class="{
                        'is-invalid': errors[`personnel_${index}_last_name`],
                      }"
                      placeholder="นามสกุล"
                    />
                    <div
                      v-if="errors[`personnel_${index}_last_name`]"
                      class="invalid-feedback"
                    >
                      {{ errors[`personnel_${index}_last_name`] }}
                    </div>
                  </div>
                </div>

                <div class="col-md-3">
                  <div class="mb-3">
                    <label class="form-label">เบอร์โทรศัพท์</label>
                    <input
                      v-model="person.phone"
                      type="tel"
                      class="form-control form-control-sm"
                      :class="{
                        'is-invalid': errors[`personnel_${index}_phone`],
                      }"
                      placeholder="0X-XXXX-XXXX"
                    />
                    <div
                      v-if="errors[`personnel_${index}_phone`]"
                      class="invalid-feedback"
                    >
                      {{ errors[`personnel_${index}_phone`] }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bank Accounts Card -->
      <div class="card mb-4">
        <div
          class="card-header d-flex justify-content-between align-items-center"
        >
          <h5 class="mb-0">
            <i class="bi bi-bank me-2 text-success"></i>
            บัญชีธนาคาร
          </h5>
          <button
            type="button"
            class="btn btn-sm btn-outline-success"
            @click="addBankAccount"
          >
            <i class="bi bi-plus me-1"></i>
            เพิ่มบัญชี
          </button>
        </div>
        <div class="card-body">
          <div
            v-if="bankAccounts.length === 0"
            class="text-center text-muted py-3"
          >
            <i class="bi bi-bank fs-1 d-block mb-2"></i>
            <p>ยังไม่มีข้อมูลบัญชีธนาคาร</p>
            <small>คลิกปุ่ม "เพิ่มบัญชี" เพื่อเพิ่มข้อมูลบัญชีธนาคาร</small>
          </div>

          <div v-else>
            <div
              v-for="(account, index) in bankAccounts"
              :key="index"
              class="bank-account-item p-3 mb-3 border rounded"
            >
              <div
                class="d-flex justify-content-between align-items-start mb-3"
              >
                <h6 class="mb-0">
                  <i class="bi bi-bank me-2"></i>
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
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label"
                      >ธนาคาร <span class="text-danger">*</span></label
                    >
                    <select
                      v-model="account.bank_name"
                      class="form-select form-select-sm"
                      :class="{
                        'is-invalid': errors[`bank_${index}_bank_name`],
                      }"
                    >
                      <option value="">เลือกธนาคาร</option>
                      <option value="ธนาคารกรุงเทพ">ธนาคารกรุงเทพ</option>
                      <option value="ธนาคารกสิกรไทย">ธนาคารกสิกรไทย</option>
                      <option value="ธนาคารกรุงไทย">ธนาคารกรุงไทย</option>
                      <option value="ธนาคารทหารไทยธนชาต">
                        ธนาคารทหารไทยธนชาต
                      </option>
                      <option value="ธนาคารไทยพาณิชย์">ธนาคารไทยพาณิชย์</option>
                      <option value="ธนาคารกรุงศรีอยุธยา">
                        ธนาคารกรุงศรีอยุธยา
                      </option>
                      <option value="ธนาคารออมสิน">ธนาคารออมสิน</option>
                      <option value="ธนาคารอาคารสงเคราะห์">
                        ธนาคารอาคารสงเคราะห์
                      </option>
                      <option value="ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร">
                        ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร
                      </option>
                      <option value="อื่นๆ">อื่นๆ</option>
                    </select>
                    <div
                      v-if="errors[`bank_${index}_bank_name`]"
                      class="invalid-feedback"
                    >
                      {{ errors[`bank_${index}_bank_name`] }}
                    </div>
                  </div>
                </div>

                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label"
                      >เลขที่บัญชี <span class="text-danger">*</span></label
                    >
                    <input
                      v-model="account.account_number"
                      type="text"
                      class="form-control form-control-sm"
                      :class="{
                        'is-invalid': errors[`bank_${index}_account_number`],
                      }"
                      placeholder="XXX-X-XXXXX-X"
                    />
                    <div
                      v-if="errors[`bank_${index}_account_number`]"
                      class="invalid-feedback"
                    >
                      {{ errors[`bank_${index}_account_number`] }}
                    </div>
                  </div>
                </div>

                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label"
                      >ชื่อบัญชี <span class="text-danger">*</span></label
                    >
                    <input
                      v-model="account.account_name"
                      type="text"
                      class="form-control form-control-sm"
                      :class="{
                        'is-invalid': errors[`bank_${index}_account_name`],
                      }"
                      placeholder="ชื่อบัญชี"
                    />
                    <div
                      v-if="errors[`bank_${index}_account_name`]"
                      class="invalid-feedback"
                    >
                      {{ errors[`bank_${index}_account_name`] }}
                    </div>
                  </div>
                </div>
              </div>

              <div class="row">
                <div class="col-12">
                  <div class="mb-3">
                    <label class="form-label">ผู้มีอำนาจเบิกจ่าย</label>
                    <textarea
                      v-model="account.signatories"
                      class="form-control form-control-sm"
                      :class="{
                        'is-invalid': errors[`bank_${index}_signatories`],
                      }"
                      rows="2"
                      placeholder="ระบุรายนามผู้มีอำนาจเบิกจ่าย (คั่นด้วยจุลภาค)"
                    ></textarea>
                    <div
                      v-if="errors[`bank_${index}_signatories`]"
                      class="invalid-feedback"
                    >
                      {{ errors[`bank_${index}_signatories`] }}
                    </div>
                  </div>
                </div>
              </div>
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
    const fileInput = ref(null);
    const selectedFiles = ref([]);
    const gettingLocation = ref(false);
    const currentFormStep = ref(1);

    // Master data
    const surveyTypes = ref([]);
    const provinces = ref([]);
    const districts = ref([]);
    const subdistricts = ref([]);
    const denominations = ref([]);
    const templeTypes = ref([]);
    const surveyors = ref([]);

    // Form data
    const form = reactive({
      target_name: "",
      type_id: "",
      address: "",
      province: "",
      district: "",
      subdistrict: "",
      postal_code: "",
      gps_latitude: null,
      gps_longitude: null,
      notes: "",
    });

    const templeDetails = reactive({
      temple_type_id: "",
      denomination_id: "",
      monk_count: 0,
      history_summary: "",
    });

    // Personnel array
    const personnel = ref([]);

    // Bank accounts array
    const bankAccounts = ref([]);

    const errors = ref({});

    // Computed properties
    const today = computed(() => {
      return moment().format("YYYY-MM-DD");
    });

    const isCurrentUserSurveyor = computed(() => {
      return authStore.user?.role === "Surveyor";
    });

    const selectedSurveyType = computed(() => {
      return surveyTypes.value.find((type) => type.type_id === form.type_id);
    });

    const isTempleType = computed(() => {
      return selectedSurveyType.value?.type_name === "วัด";
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

        // Load denominations
        const denominationsResponse = await masterDataService.getSects();
        denominations.value = denominationsResponse.data;

        // Load temple types
        const templeTypesResponse = await masterDataService.getTempleTypes();
        templeTypes.value = templeTypesResponse.data;

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
      if (!isTempleType.value) {
        Object.keys(templeDetails).forEach((key) => {
          if (typeof templeDetails[key] === "string") {
            templeDetails[key] = "";
          } else if (typeof templeDetails[key] === "number") {
            templeDetails[key] = 0;
          } else {
            templeDetails[key] = null;
          }
        });

        // Reset personnel and bank accounts for non-temple types
        personnel.value = [];
        bankAccounts.value = [];
      }
    };

    // Personnel management
    const addPersonnel = () => {
      personnel.value.push({
        role: "",
        first_name: "",
        last_name: "",
        phone: "",
      });
    };

    const removePersonnel = (index) => {
      personnel.value.splice(index, 1);
    };

    // Bank account management
    const addBankAccount = () => {
      bankAccounts.value.push({
        bank_name: "",
        account_number: "",
        account_name: "",
        signatories: "",
      });
    };

    const removeBankAccount = (index) => {
      bankAccounts.value.splice(index, 1);
    };

    // GPS location
    const getCurrentLocation = () => {
      if (!navigator.geolocation) {
        alert("เบราว์เซอร์ของคุณไม่รองรับ GPS");
        return;
      }

      gettingLocation.value = true;

      navigator.geolocation.getCurrentPosition(
        (position) => {
          form.gps_latitude = position.coords.latitude;
          form.gps_longitude = position.coords.longitude;
          gettingLocation.value = false;
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("ไม่สามารถใช้ตำแหน่ง GPS ได้");
          gettingLocation.value = false;
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
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

      if (!form.type_id) {
        errors.value.type_id = "กรุณาเลือกประเภทการสำรวจ";
      }

      if (!form.address.trim()) {
        errors.value.address = "กรุณาระบุที่อยู่";
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

      // Temple details validation (only for temple type)
      if (isTempleType.value) {
        if (!templeDetails.temple_type_id) {
          errors.value.temple_type_id = "กรุณาเลือกประเภทวัด";
        }

        if (!templeDetails.denomination_id) {
          errors.value.denomination_id = "กรุณาเลือกสังกัด/นิกาย";
        }

        if (templeDetails.monk_count < 0) {
          errors.value.monk_count = "จำนวนพระต้องเป็นจำนวนที่ไม่ต่ำกว่า 0";
        }

        // Personnel validation
        personnel.value.forEach((person, index) => {
          if (person.role && !person.first_name.trim()) {
            errors.value[`personnel_${index}_first_name`] = "กรุณาระบุชื่อ";
          }
          if (person.role && !person.last_name.trim()) {
            errors.value[`personnel_${index}_last_name`] = "กรุณาระบุนามสกุล";
          }
        });

        // Bank account validation
        bankAccounts.value.forEach((account, index) => {
          if (!account.bank_name) {
            errors.value[`bank_${index}_bank_name`] = "กรุณาเลือกธนาคาร";
          }
          if (!account.account_number.trim()) {
            errors.value[`bank_${index}_account_number`] =
              "กรุณาระบุเลขที่บัญชี";
          }
          if (!account.account_name.trim()) {
            errors.value[`bank_${index}_account_name`] = "กรุณาระบุชื่อบัญชี";
          }
        });
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

        // Set created_by to current user
        formData.append("created_by", authStore.user.user_id);

        // Temple details (only for temple type)
        if (isTempleType.value) {
          Object.keys(templeDetails).forEach((key) => {
            if (templeDetails[key] !== null && templeDetails[key] !== "") {
              formData.append(`temple_details[${key}]`, templeDetails[key]);
            }
          });

          // Personnel data
          personnel.value.forEach((person, index) => {
            if (
              person.role ||
              person.first_name ||
              person.last_name ||
              person.phone
            ) {
              formData.append(`personnel[${index}][role]`, person.role);
              formData.append(
                `personnel[${index}][first_name]`,
                person.first_name
              );
              formData.append(
                `personnel[${index}][last_name]`,
                person.last_name
              );
              formData.append(`personnel[${index}][phone]`, person.phone);
            }
          });

          // Bank accounts data
          bankAccounts.value.forEach((account, index) => {
            if (
              account.bank_name ||
              account.account_number ||
              account.account_name
            ) {
              formData.append(
                `bank_accounts[${index}][bank_name]`,
                account.bank_name
              );
              formData.append(
                `bank_accounts[${index}][account_number]`,
                account.account_number
              );
              formData.append(
                `bank_accounts[${index}][account_name]`,
                account.account_name
              );
              formData.append(
                `bank_accounts[${index}][signatories]`,
                account.signatories
              );
            }
          });
        }

        // Files
        selectedFiles.value.forEach((file, index) => {
          formData.append(`attachments`, file);
        });

        // Create survey
        const response = await surveyService.createSurvey(formData);

        // Show success message
        alert("สร้างการสำรวจสำเร็จ");

        // Redirect to survey detail or list
        if (response.data?.target_id) {
          router.push(`/surveys/${response.data.target_id}`);
        } else {
          router.push("/surveys");
        }
      } catch (err) {
        console.error("Error creating survey:", err);

        if (err.response?.data?.errors) {
          errors.value = err.response.data.errors;
        } else if (err.response?.data?.message) {
          alert(err.response.data.message);
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
      // Data
      loading,
      fileInput,
      selectedFiles,
      gettingLocation,
      currentFormStep,
      surveyTypes,
      provinces,
      districts,
      subdistricts,
      denominations,
      templeTypes,
      surveyors,
      form,
      templeDetails,
      personnel,
      bankAccounts,
      errors,

      // Computed
      today,
      isCurrentUserSurveyor,
      selectedSurveyType,
      isTempleType,

      // Methods
      onSurveyTypeChange,
      onProvinceChange,
      onDistrictChange,
      addPersonnel,
      removePersonnel,
      addBankAccount,
      removeBankAccount,
      getCurrentLocation,
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

.personnel-item,
.bank-account-item {
  background: #f8f9fa;
  transition: all 0.2s ease-in-out;
}

.personnel-item:hover,
.bank-account-item:hover {
  background: #e9ecef;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
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

  .personnel-item,
  .bank-account-item {
    margin-bottom: 1rem;
  }
}

@media (max-width: 575.98px) {
  .row .col-md-6,
  .row .col-md-4,
  .row .col-md-3 {
    margin-bottom: 1rem;
  }

  .file-preview {
    margin-bottom: 0.5rem;
  }

  .personnel-item .row,
  .bank-account-item .row {
    margin: 0;
  }

  .personnel-item .col-md-3,
  .bank-account-item .col-md-4 {
    padding: 0.25rem;
  }
}
</style>
