<template>
  <div class="container-fluid py-4">
    <!-- Header -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h1 class="h2 mb-2">การตั้งค่า</h1>
            <p class="text-muted">จัดการการตั้งค่าส่วนตัวและระบบ</p>
          </div>
          <div class="d-flex gap-2">
            <button
              @click="refreshSettings"
              :disabled="loading"
              class="btn btn-outline-secondary"
            >
              <i
                class="fas fa-sync-alt me-2"
                :class="{ 'fa-spin': loading }"
              ></i>
              รีเฟรช
            </button>
            <button
              @click="saveAllChanges"
              :disabled="loading || !hasChanges"
              class="btn btn-primary"
            >
              <i class="fas fa-save me-2"></i>
              บันทึกการเปลี่ยนแปลง
            </button>
            <button @click="resetToDefaults" class="btn btn-outline-danger">
              <i class="fas fa-undo me-2"></i>
              รีเซ็ต
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Status Banner -->
    <div v-if="!isOnline" class="alert alert-warning mb-4" role="alert">
      <i class="fas fa-wifi me-2"></i>
      ขณะนี้ท่านอยู่ในโหมดออฟไลน์
      การเปลี่ยนแปลงจะถูกบันทึกเมื่อเชื่อมต่ออินเทอร์เน็ตอีกครั้ง
    </div>

    <div v-if="lastSaved" class="alert alert-success mb-4" role="alert">
      <i class="fas fa-check me-2"></i>
      บันทึกการเปลี่ยนแปลงล่าสุด:
      {{ new Date(lastSaved).toLocaleString("th-TH") }}
    </div>

    <!-- Loading State -->
    <div
      v-if="loading && !initialized"
      class="d-flex justify-content-center py-5"
    >
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">กำลังโหลด...</span>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else>
      <!-- Navigation Tabs -->
      <div class="row">
        <div class="col-12">
          <ul class="nav nav-tabs mb-4" id="settingsTabs" role="tablist">
            <li class="nav-item" role="presentation">
              <button
                class="nav-link active"
                id="personal-tab"
                data-bs-toggle="tab"
                data-bs-target="#personal"
                type="button"
                role="tab"
                aria-controls="personal"
                aria-selected="true"
              >
                <i class="fas fa-user me-2"></i>ส่วนบุคคล
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button
                class="nav-link"
                id="security-tab"
                data-bs-toggle="tab"
                data-bs-target="#security"
                type="button"
                role="tab"
                aria-controls="security"
                aria-selected="false"
              >
                <i class="fas fa-shield-alt me-2"></i>ความปลอดภัย
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button
                class="nav-link"
                id="localization-tab"
                data-bs-toggle="tab"
                data-bs-target="#localization"
                type="button"
                role="tab"
                aria-controls="localization"
                aria-selected="false"
              >
                <i class="fas fa-globe me-2"></i>ภาษาและเขตเวลา
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button
                class="nav-link"
                id="performance-tab"
                data-bs-toggle="tab"
                data-bs-target="#performance"
                type="button"
                role="tab"
                aria-controls="performance"
                aria-selected="false"
              >
                <i class="fas fa-tachometer-alt me-2"></i>ประสิทธิภาพ
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button
                class="nav-link"
                id="backup-tab"
                data-bs-toggle="tab"
                data-bs-target="#backup"
                type="button"
                role="tab"
                aria-controls="backup"
                aria-selected="false"
              >
                <i class="fas fa-database me-2"></i>สำรองข้อมูล
              </button>
            </li>
            <li class="nav-item" role="presentation" v-if="isAdmin">
              <button
                class="nav-link"
                id="system-tab"
                data-bs-toggle="tab"
                data-bs-target="#system"
                type="button"
                role="tab"
                aria-controls="system"
                aria-selected="false"
              >
                <i class="fas fa-cogs me-2"></i>ระบบ
              </button>
            </li>
          </ul>
        </div>
      </div>

      <!-- Tab Content -->
      <div class="row">
        <div class="col-12">
          <div class="tab-content" id="settingsTabContent">
            <!-- Personal Settings Tab -->
            <div
              class="tab-pane fade show active"
              id="personal"
              role="tabpanel"
              aria-labelledby="personal-tab"
            >
              <div class="row">
                <div class="col-lg-8">
                  <!-- Account Information -->
                  <div class="card mb-4">
                    <div class="card-header">
                      <h5 class="card-title mb-0">
                        <i class="fas fa-user-circle me-2"></i>ข้อมูลบัญชี
                      </h5>
                    </div>
                    <div class="card-body">
                      <div class="row">
                        <div class="col-md-6 mb-3">
                          <label class="form-label">ชื่อที่แสดง</label>
                          <input
                            type="text"
                            class="form-control"
                            v-model="accountSettings.displayName"
                            placeholder="กรอกชื่อที่ต้องการแสดง"
                          />
                        </div>
                        <div class="col-md-6 mb-3">
                          <label class="form-label">อีเมล</label>
                          <input
                            type="email"
                            class="form-control"
                            v-model="accountSettings.email"
                            placeholder="กรอกอีเมล"
                          />
                        </div>
                      </div>
                      <div class="row">
                        <div class="col-md-6 mb-3">
                          <label class="form-label">เบอร์โทรศัพท์</label>
                          <input
                            type="tel"
                            class="form-control"
                            v-model="accountSettings.phone"
                            placeholder="กรอกเบอร์โทรศัพท์"
                          />
                        </div>
                        <div class="col-md-6 mb-3">
                          <label class="form-label">&nbsp;</label>
                          <div>
                            <button
                              type="button"
                              class="btn btn-outline-primary"
                              @click="changePassword"
                            >
                              <i class="fas fa-key me-2"></i>เปลี่ยนรหัสผ่าน
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Display Settings -->
                  <div class="card mb-4">
                    <div class="card-header">
                      <h5 class="card-title mb-0">
                        <i class="fas fa-desktop me-2"></i>การแสดงผล
                      </h5>
                    </div>
                    <div class="card-body">
                      <div class="row">
                        <div class="col-md-4 mb-3">
                          <label class="form-label">ฟอนต์หลัก</label>
                          <select
                            class="form-select"
                            v-model="personalSettings.fontFamily"
                            @change="previewFont"
                          >
                            <option value="sarabun">
                              Sarabun - สะระบัน (แนะนำ)
                            </option>
                            <option value="kanit">Kanit - คอน์คริต</option>
                            <option value="prompt">Prompt - พร้อมต์</option>
                            <option value="mali">Mali - มาลี</option>
                            <option value="mitr">Mitr - มิตร</option>
                            <option value="system">ระบบปฏิบัติการ</option>
                          </select>
                          <div class="form-text">
                            เลือกฟอนต์ที่ใช้แสดงผลในระบบ
                          </div>
                        </div>
                        <div class="col-md-4 mb-3">
                          <label class="form-label">ธีม</label>
                          <select
                            class="form-select"
                            v-model="personalSettings.theme"
                            @change="applyTheme"
                          >
                            <option value="light">สว่าง</option>
                            <option value="dark">มืด</option>
                            <option value="auto">อัตโนมัติ</option>
                          </select>
                        </div>
                        <div class="col-md-4 mb-3">
                          <label class="form-label">ขนาดฟอนต์</label>
                          <select
                            class="form-select"
                            v-model="personalSettings.fontSize"
                          >
                            <option value="small">เล็ก (14px)</option>
                            <option value="medium">ปกติ (16px)</option>
                            <option value="large">ใหญ่ (18px)</option>
                            <option value="extra-large">ใหญ่มาก (20px)</option>
                          </select>
                        </div>
                      </div>
                      <div class="row">
                        <div class="col-md-6 mb-3">
                          <label class="form-label">ภาษา</label>
                          <select
                            class="form-select"
                            v-model="personalSettings.language"
                          >
                            <option value="th">ไทย</option>
                            <option value="en">English</option>
                          </select>
                        </div>
                        <div class="col-md-6 mb-3">
                          <div class="mt-4">
                            <div class="form-check form-switch mb-2">
                              <input
                                class="form-check-input"
                                type="checkbox"
                                id="compactMode"
                                v-model="personalSettings.compactMode"
                              />
                              <label class="form-check-label" for="compactMode">
                                โหมดกะทัดรัด
                              </label>
                            </div>
                            <div class="form-check form-switch">
                              <input
                                class="form-check-input"
                                type="checkbox"
                                id="animations"
                                v-model="personalSettings.animations"
                              />
                              <label class="form-check-label" for="animations">
                                เปิดใช้งานแอนิเมชั่น
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Font Preview -->
                      <div class="mt-3">
                        <label class="form-label">ตัวอย่างการแสดงผล</label>
                        <div
                          class="p-3 border rounded"
                          :class="`font-${personalSettings.fontFamily} size-${personalSettings.fontSize}`"
                          :style="fontPreviewStyle"
                        >
                          <h6>ระบบสำรวจวัดในประเทศไทย</h6>
                          <p class="mb-1">Temple Survey System Thailand</p>
                          <p class="mb-0 small">๐๑๒๓๔๕๖๗๘๙ ABCDEFGHIJKLMNOP</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Notification Settings -->
                  <div class="card mb-4">
                    <div class="card-header">
                      <h5 class="card-title mb-0">
                        <i class="fas fa-bell me-2"></i>การแจ้งเตือน
                      </h5>
                    </div>
                    <div class="card-body">
                      <div class="form-check form-switch mb-3">
                        <input
                          class="form-check-input"
                          type="checkbox"
                          id="emailNotifications"
                          v-model="personalSettings.notifications.email"
                        />
                        <label
                          class="form-check-label"
                          for="emailNotifications"
                        >
                          แจ้งเตือนทางอีเมล
                        </label>
                      </div>
                      <div class="form-check form-switch mb-3">
                        <input
                          class="form-check-input"
                          type="checkbox"
                          id="browserNotifications"
                          v-model="personalSettings.notifications.browser"
                        />
                        <label
                          class="form-check-label"
                          for="browserNotifications"
                        >
                          แจ้งเตือนบนเบราว์เซอร์
                        </label>
                      </div>
                      <div class="form-check form-switch mb-3">
                        <input
                          class="form-check-input"
                          type="checkbox"
                          id="surveyUpdates"
                          v-model="personalSettings.notifications.surveyUpdates"
                        />
                        <label class="form-check-label" for="surveyUpdates">
                          การอัปเดตข้อมูลการสำรวจ
                        </label>
                      </div>
                      <div class="form-check form-switch mb-3">
                        <input
                          class="form-check-input"
                          type="checkbox"
                          id="systemUpdates"
                          v-model="personalSettings.notifications.systemUpdates"
                        />
                        <label class="form-check-label" for="systemUpdates">
                          การอัปเดตระบบ
                        </label>
                      </div>
                      <div class="form-check form-switch mb-3">
                        <input
                          class="form-check-input"
                          type="checkbox"
                          id="soundEnabled"
                          v-model="personalSettings.soundEnabled"
                        />
                        <label class="form-check-label" for="soundEnabled">
                          เสียงแจ้งเตือน
                        </label>
                      </div>
                    </div>
                  </div>

                  <!-- Data & Privacy -->
                  <div class="card mb-4">
                    <div class="card-header">
                      <h5 class="card-title mb-0">
                        <i class="fas fa-shield-alt me-2"></i
                        >ข้อมูลและความเป็นส่วนตัว
                      </h5>
                    </div>
                    <div class="card-body">
                      <div class="mb-3">
                        <label class="form-label">การเก็บข้อมูลการใช้งาน</label>
                        <select
                          class="form-select"
                          v-model="personalSettings.dataRetention"
                        >
                          <option value="30">30 วัน</option>
                          <option value="90">90 วัน</option>
                          <option value="180">180 วัน</option>
                          <option value="365">1 ปี</option>
                          <option value="forever">ถาวร</option>
                        </select>
                      </div>
                      <div class="form-check form-switch mb-3">
                        <input
                          class="form-check-input"
                          type="checkbox"
                          id="analytics"
                          v-model="personalSettings.analytics"
                        />
                        <label class="form-check-label" for="analytics">
                          อนุญาตการวิเคราะห์การใช้งาน
                        </label>
                        <div class="form-text">ช่วยปรับปรุงระบบให้ดีขึ้น</div>
                      </div>
                      <div class="d-flex gap-2">
                        <button
                          @click="exportUserData"
                          :disabled="exporting"
                          class="btn btn-outline-primary"
                        >
                          <i
                            class="fas fa-download me-2"
                            :class="{ 'fa-spin': exporting }"
                          ></i>
                          {{ exporting ? "กำลังส่งออก..." : "ส่งออกข้อมูล" }}
                        </button>
                        <button
                          @click="clearCache"
                          :disabled="clearing"
                          class="btn btn-outline-secondary"
                        >
                          <i
                            class="fas fa-trash me-2"
                            :class="{ 'fa-spin': clearing }"
                          ></i>
                          {{ clearing ? "กำลังล้าง..." : "ล้างแคช" }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Sidebar -->
                <div class="col-lg-4">
                  <div class="card">
                    <div class="card-header">
                      <h6 class="card-title mb-0">
                        <i class="fas fa-info-circle me-2"></i>ข้อมูลระบบ
                      </h6>
                    </div>
                    <div class="card-body">
                      <div class="mb-3">
                        <small class="text-muted">เวอร์ชัน</small>
                        <div>{{ systemInfo.version }}</div>
                      </div>
                      <div class="mb-3">
                        <small class="text-muted">เบราว์เซอร์</small>
                        <div class="small">{{ systemInfo.browser }}</div>
                      </div>
                      <div class="mb-3">
                        <small class="text-muted">ขนาดหน้าจอ</small>
                        <div>{{ systemInfo.screenSize }}</div>
                      </div>
                      <div class="mb-3">
                        <small class="text-muted">เขตเวลา</small>
                        <div>{{ systemInfo.timezone }}</div>
                      </div>
                      <div class="mb-3">
                        <small class="text-muted">ภาษา</small>
                        <div>{{ systemInfo.language }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Security Tab -->
            <div
              class="tab-pane fade"
              id="security"
              role="tabpanel"
              aria-labelledby="security-tab"
            >
              <div class="row">
                <div class="col-lg-8">
                  <!-- Two-Factor Authentication -->
                  <div class="card mb-4">
                    <div class="card-header">
                      <h5 class="card-title mb-0">
                        <i class="fas fa-shield-alt me-2"></i
                        >การยืนยันตัวตนสองขั้น (2FA)
                      </h5>
                    </div>
                    <div class="card-body">
                      <div
                        class="d-flex justify-content-between align-items-center mb-3"
                      >
                        <div>
                          <h6 class="mb-1">การยืนยันตัวตนสองขั้น</h6>
                          <p class="text-muted small mb-0">
                            เพิ่มความปลอดภัยให้กับบัญชีของคุณ
                          </p>
                        </div>
                        <div class="form-check form-switch">
                          <input
                            class="form-check-input"
                            type="checkbox"
                            id="twoFactorAuth"
                            v-model="securitySettings.twoFactorEnabled"
                            @change="toggle2FA"
                          />
                        </div>
                      </div>
                      <div
                        v-if="securitySettings.twoFactorEnabled"
                        class="alert alert-info"
                      >
                        <i class="fas fa-info-circle me-2"></i>
                        2FA ได้เปิดใช้งานแล้ว คุณจะต้องใช้แอปพลิเคชัน
                        Authenticator ในการเข้าสู่ระบบ
                      </div>
                    </div>
                  </div>

                  <!-- Login Notifications -->
                  <div class="card mb-4">
                    <div class="card-header">
                      <h5 class="card-title mb-0">
                        <i class="fas fa-sign-in-alt me-2"></i
                        >การแจ้งเตือนการเข้าสู่ระบบ
                      </h5>
                    </div>
                    <div class="card-body">
                      <div class="form-check form-switch mb-3">
                        <input
                          class="form-check-input"
                          type="checkbox"
                          id="loginNotifications"
                          v-model="securitySettings.loginNotifications"
                          @change="toggleLoginNotification"
                        />
                        <label
                          class="form-check-label"
                          for="loginNotifications"
                        >
                          แจ้งเตือนเมื่อมีการเข้าสู่ระบบ
                        </label>
                      </div>
                      <div class="mb-3">
                        <label class="form-label">หมดเวลาเซสชัน (นาที)</label>
                        <select
                          class="form-select"
                          v-model="securitySettings.sessionTimeout"
                        >
                          <option value="15">15 นาที</option>
                          <option value="30">30 นาที</option>
                          <option value="60">1 ชั่วโมง</option>
                          <option value="180">3 ชั่วโมง</option>
                          <option value="480">8 ชั่วโมง</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <!-- Active Devices -->
                  <div class="card mb-4">
                    <div class="card-header">
                      <h5 class="card-title mb-0">
                        <i class="fas fa-devices me-2"></i>อุปกรณ์ที่เข้าสู่ระบบ
                      </h5>
                    </div>
                    <div class="card-body">
                      <div
                        v-for="device in activeDevices"
                        :key="device.id"
                        class="d-flex justify-content-between align-items-center border-bottom py-2"
                      >
                        <div class="d-flex align-items-center">
                          <i
                            :class="getDeviceIcon(device.type)"
                            class="me-3 text-muted"
                          ></i>
                          <div>
                            <div class="fw-bold">{{ device.name }}</div>
                            <small class="text-muted"
                              >{{ device.location }} •
                              {{ device.lastActive }}</small
                            >
                          </div>
                        </div>
                        <div>
                          <span
                            v-if="device.current"
                            class="badge bg-success me-2"
                            >ปัจจุบัน</span
                          >
                          <button
                            v-else
                            @click="revokeDevice(device.id)"
                            class="btn btn-sm btn-outline-danger"
                          >
                            ถอด
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Localization Tab -->
            <div
              class="tab-pane fade"
              id="localization"
              role="tabpanel"
              aria-labelledby="localization-tab"
            >
              <div class="row">
                <div class="col-lg-8">
                  <div class="card mb-4">
                    <div class="card-header">
                      <h5 class="card-title mb-0">
                        <i class="fas fa-globe me-2"></i>ภาษาและเขตเวลา
                      </h5>
                    </div>
                    <div class="card-body">
                      <div class="row">
                        <div class="col-md-6 mb-3">
                          <label class="form-label">ภาษา</label>
                          <select
                            class="form-select"
                            v-model="localizationSettings.language"
                          >
                            <option value="th">ไทย</option>
                            <option value="en">English</option>
                            <option value="zh">中文</option>
                            <option value="ja">日本語</option>
                          </select>
                        </div>
                        <div class="col-md-6 mb-3">
                          <label class="form-label">เขตเวลา</label>
                          <select
                            class="form-select"
                            v-model="localizationSettings.timezone"
                          >
                            <option value="Asia/Bangkok">
                              Asia/Bangkok (GMT+7)
                            </option>
                            <option value="Asia/Tokyo">
                              Asia/Tokyo (GMT+9)
                            </option>
                            <option value="America/New_York">
                              America/New_York (GMT-5)
                            </option>
                            <option value="Europe/London">
                              Europe/London (GMT+0)
                            </option>
                          </select>
                        </div>
                      </div>
                      <div class="row">
                        <div class="col-md-6 mb-3">
                          <label class="form-label">รูปแบบวันที่</label>
                          <select
                            class="form-select"
                            v-model="localizationSettings.dateFormat"
                          >
                            <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                            <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                            <option value="yyyy-mm-dd">YYYY-MM-DD</option>
                          </select>
                        </div>
                        <div class="col-md-6 mb-3">
                          <label class="form-label">รูปแบบเวลา</label>
                          <select
                            class="form-select"
                            v-model="localizationSettings.timeFormat"
                          >
                            <option value="24">24 ชั่วโมง</option>
                            <option value="12">12 ชั่วโมง (AM/PM)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Keyboard Shortcuts -->
                  <div class="card mb-4">
                    <div class="card-header">
                      <h5 class="card-title mb-0">
                        <i class="fas fa-keyboard me-2"></i>แป้นพิมพ์ลัด
                      </h5>
                    </div>
                    <div class="card-body">
                      <div class="form-check form-switch mb-3">
                        <input
                          class="form-check-input"
                          type="checkbox"
                          id="keyboardShortcuts"
                          v-model="keyboardSettings.enabled"
                        />
                        <label class="form-check-label" for="keyboardShortcuts">
                          เปิดใช้งานแป้นพิมพ์ลัด
                        </label>
                      </div>
                      <div
                        v-if="keyboardSettings.enabled"
                        class="table-responsive"
                      >
                        <table class="table table-sm">
                          <thead>
                            <tr>
                              <th>การดำเนินการ</th>
                              <th>แป้นพิมพ์ลัด</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>บันทึกการเปลี่ยนแปลง</td>
                              <td><kbd>Ctrl</kbd> + <kbd>S</kbd></td>
                            </tr>
                            <tr>
                              <td>รีเฟรช</td>
                              <td><kbd>F5</kbd></td>
                            </tr>
                            <tr>
                              <td>ค้นหา</td>
                              <td><kbd>Ctrl</kbd> + <kbd>F</kbd></td>
                            </tr>
                            <tr>
                              <td>เมนูช่วยเหลือ</td>
                              <td><kbd>F1</kbd></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Performance Tab -->
            <div
              class="tab-pane fade"
              id="performance"
              role="tabpanel"
              aria-labelledby="performance-tab"
            >
              <div class="row">
                <div class="col-lg-8">
                  <div class="card mb-4">
                    <div class="card-header">
                      <h5 class="card-title mb-0">
                        <i class="fas fa-tachometer-alt me-2"></i
                        >การปรับแต่งประสิทธิภาพ
                      </h5>
                    </div>
                    <div class="card-body">
                      <div class="row">
                        <div class="col-md-6 mb-3">
                          <label class="form-label">จำนวนรายการต่อหน้า</label>
                          <select
                            class="form-select"
                            v-model="performanceSettings.itemsPerPage"
                          >
                            <option value="10">10 รายการ</option>
                            <option value="25">25 รายการ</option>
                            <option value="50">50 รายการ</option>
                            <option value="100">100 รายการ</option>
                          </select>
                        </div>
                        <div class="col-md-6 mb-3">
                          <div class="form-check form-switch mt-4">
                            <input
                              class="form-check-input"
                              type="checkbox"
                              id="enableCaching"
                              v-model="performanceSettings.enableCaching"
                            />
                            <label class="form-check-label" for="enableCaching">
                              เปิดใช้งาน Cache
                            </label>
                          </div>
                        </div>
                      </div>
                      <div class="row">
                        <div class="col-md-6 mb-3">
                          <div class="form-check form-switch">
                            <input
                              class="form-check-input"
                              type="checkbox"
                              id="preloadData"
                              v-model="performanceSettings.preloadData"
                            />
                            <label class="form-check-label" for="preloadData">
                              โหลดข้อมูลล่วงหน้า
                            </label>
                          </div>
                        </div>
                        <div class="col-md-6 mb-3">
                          <div class="form-check form-switch">
                            <input
                              class="form-check-input"
                              type="checkbox"
                              id="enableLazyLoading"
                              v-model="performanceSettings.enableLazyLoading"
                            />
                            <label
                              class="form-check-label"
                              for="enableLazyLoading"
                            >
                              Lazy Loading
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Backup Tab -->
            <div
              class="tab-pane fade"
              id="backup"
              role="tabpanel"
              aria-labelledby="backup-tab"
            >
              <div class="row">
                <div class="col-lg-8">
                  <div class="card mb-4">
                    <div class="card-header">
                      <h5 class="card-title mb-0">
                        <i class="fas fa-database me-2"></i>การสำรองข้อมูล
                      </h5>
                    </div>
                    <div class="card-body">
                      <div class="row">
                        <div class="col-md-6 mb-3">
                          <div class="form-check form-switch">
                            <input
                              class="form-check-input"
                              type="checkbox"
                              id="autoBackup"
                              v-model="backupSettings.autoBackup"
                            />
                            <label class="form-check-label" for="autoBackup">
                              สำรองข้อมูลอัตโนมัติ
                            </label>
                          </div>
                        </div>
                        <div
                          class="col-md-6 mb-3"
                          v-if="backupSettings.autoBackup"
                        >
                          <label class="form-label">ความถี่</label>
                          <select
                            class="form-select"
                            v-model="backupSettings.frequency"
                          >
                            <option value="daily">รายวัน</option>
                            <option value="weekly">รายสัปดาห์</option>
                            <option value="monthly">รายเดือน</option>
                          </select>
                        </div>
                      </div>
                      <div class="row">
                        <div class="col-12 mb-3">
                          <div class="d-flex gap-2">
                            <button
                              @click="createBackup"
                              :disabled="creatingBackup"
                              class="btn btn-primary"
                            >
                              <i
                                class="fas fa-download me-2"
                                :class="{ 'fa-spin': creatingBackup }"
                              ></i>
                              {{
                                creatingBackup
                                  ? "กำลังสำรอง..."
                                  : "สำรองข้อมูลตอนนี้"
                              }}
                            </button>
                            <button
                              @click="restoreFromBackup"
                              :disabled="restoring"
                              class="btn btn-outline-secondary"
                            >
                              <i
                                class="fas fa-upload me-2"
                                :class="{ 'fa-spin': restoring }"
                              ></i>
                              {{
                                restoring ? "กำลังกู้คืน..." : "กู้คืนจากไฟล์"
                              }}
                            </button>
                            <button
                              @click="importSettings"
                              class="btn btn-outline-info"
                            >
                              <i class="fas fa-file-import me-2"></i>
                              นำเข้าการตั้งค่า
                            </button>
                            <button
                              @click="exportSettings"
                              class="btn btn-outline-success"
                            >
                              <i class="fas fa-file-export me-2"></i>
                              ส่งออกการตั้งค่า
                            </button>
                          </div>
                        </div>
                      </div>
                      <div v-if="lastBackup" class="alert alert-info">
                        <i class="fas fa-info-circle me-2"></i>
                        การสำรองข้อมูลล่าสุด: {{ lastBackup }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- System Settings Tab (Admin Only) -->
            <div
              v-if="isAdmin"
              class="tab-pane fade"
              id="system"
              role="tabpanel"
              aria-labelledby="system-tab"
            >
              <div class="row">
                <div class="col-12">
                  <div class="alert alert-warning" role="alert">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    <strong>คำเตือน:</strong>
                    การเปลี่ยนแปลงการตั้งค่าระบบอาจส่งผลกระทบต่อผู้ใช้ทั้งหมด
                    กรุณาใช้ความระมัดระวัง
                  </div>

                  <div
                    v-if="loading"
                    class="d-flex justify-content-center py-4"
                  >
                    <div class="spinner-border text-primary" role="status">
                      <span class="visually-hidden">กำลังโหลด...</span>
                    </div>
                  </div>

                  <div v-else class="row">
                    <div
                      v-for="(setting, key) in systemSettings"
                      :key="key"
                      class="col-lg-6 mb-4"
                    >
                      <div class="card h-100">
                        <div class="card-body">
                          <div
                            class="d-flex justify-content-between align-items-start mb-3"
                          >
                            <div>
                              <h6 class="card-title mb-1">
                                {{ getSystemSettingDisplayName(key) }}
                              </h6>
                              <p class="card-text text-muted small">
                                {{ setting.description }}
                              </p>
                            </div>
                            <div>
                              <span
                                v-if="hasSystemSettingChanged(key)"
                                class="badge bg-warning"
                              >
                                มีการเปลี่ยนแปลง
                              </span>
                              <span
                                v-else-if="setting.is_public"
                                class="badge bg-success"
                              >
                                สาธารณะ
                              </span>
                              <span v-else class="badge bg-secondary">
                                ส่วนตัว
                              </span>
                            </div>
                          </div>

                          <!-- Boolean Setting -->
                          <div
                            v-if="setting.type === 'boolean'"
                            class="form-check form-switch"
                          >
                            <input
                              class="form-check-input"
                              type="checkbox"
                              :id="`system_${key}`"
                              :checked="getSystemSettingValue(key)"
                              @change="toggleSystemSetting(key)"
                            />
                            <label
                              class="form-check-label"
                              :for="`system_${key}`"
                            >
                              {{
                                getSystemSettingValue(key)
                                  ? "เปิดใช้งาน"
                                  : "ปิดใช้งาน"
                              }}
                            </label>
                          </div>

                          <!-- String Setting -->
                          <div v-else-if="setting.type === 'string'">
                            <input
                              v-model="modifiedSystemSettings[key]"
                              type="text"
                              class="form-control"
                              :placeholder="setting.value?.toString() || ''"
                            />
                          </div>

                          <!-- Number Setting -->
                          <div v-else-if="setting.type === 'number'">
                            <input
                              v-model.number="modifiedSystemSettings[key]"
                              type="number"
                              class="form-control"
                              :placeholder="setting.value?.toString() || ''"
                            />
                          </div>

                          <!-- JSON Setting -->
                          <div v-else-if="setting.type === 'json'">
                            <textarea
                              v-model="jsonSystemSettings[key]"
                              @blur="updateJsonSystemSetting(key)"
                              rows="4"
                              class="form-control font-monospace small"
                              :placeholder="
                                JSON.stringify(setting.value, null, 2)
                              "
                            ></textarea>
                          </div>

                          <!-- Setting Meta Info -->
                          <div class="mt-3 pt-3 border-top">
                            <div class="row text-muted small">
                              <div class="col-6">
                                <strong>ประเภท:</strong> {{ setting.type }}
                              </div>
                              <div class="col-6">
                                <strong>อัปเดตล่าสุด:</strong>
                                {{ formatDateTime(setting.updated_at) }}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Container -->
    <ToastContainer />
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, watch, nextTick } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "@/composables/useToast";
import ToastContainer from "@/components/common/ToastContainer.vue";
import enhancedSettingsService from "@/services/enhancedSettingsService";

export default {
  name: "EnhancedSettingsPageBootstrap",
  components: {
    ToastContainer,
  },
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();
    const { showToast } = useToast();

    // Reactive state
    const loading = ref(false);
    const initialized = ref(false);
    const isOnline = ref(navigator.onLine);
    const lastSaved = ref(null);
    const creatingBackup = ref(false);
    const restoring = ref(false);
    const lastBackup = ref(null);

    // Settings data
    const personalSettings = reactive({
      theme: "light",
      fontSize: "medium",
      fontFamily: "sarabun",
      language: "th",
      compactMode: false,
      animations: true,
      emailNotifications: true,
      pushNotifications: true,
      soundEnabled: true,
      dataRetention: "365",
      analytics: true,
      notifications: {
        email: true,
        browser: true,
        surveyUpdates: true,
        systemUpdates: true,
      },
    });

    const accountSettings = reactive({
      displayName: "",
      email: "",
      phone: "",
    });

    const securitySettings = reactive({
      twoFactorEnabled: false,
      loginNotifications: true,
      sessionTimeout: "60",
    });

    const localizationSettings = reactive({
      language: "th",
      dateFormat: "dd/mm/yyyy",
      timeFormat: "24",
      timezone: "Asia/Bangkok",
    });

    const keyboardSettings = reactive({
      enabled: true,
    });

    const performanceSettings = reactive({
      itemsPerPage: "25",
      enableCaching: true,
      preloadData: false,
      enableLazyLoading: true,
    });

    const backupSettings = reactive({
      autoBackup: false,
      frequency: "weekly",
    });

    const systemSettings = ref({});
    const modifiedSystemSettings = ref({});
    const jsonSystemSettings = ref({});

    const activeDevices = ref([
      {
        id: 1,
        name: "Windows PC",
        type: "desktop",
        location: "Bangkok, Thailand",
        lastActive: "2 นาทีที่แล้ว",
        current: true,
      },
      {
        id: 2,
        name: "iPhone 13",
        type: "mobile",
        location: "Bangkok, Thailand",
        lastActive: "1 ชั่วโมงที่แล้ว",
        current: false,
      },
    ]);

    const systemInfo = reactive({
      version: "2.1.0",
      browser: "Chrome",
      screenSize: "1920 × 1080",
      timezone:
        Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Bangkok",
      language: navigator.language || "th",
    });

    // Update system info on mount
    const updateSystemInfo = () => {
      const info = enhancedSettingsService.getSystemInfo();
      Object.assign(systemInfo, {
        browser: info.browser,
        screenSize: info.screenSize,
        timezone: info.timezone,
        language: info.language,
        version: info.version,
      });
    };

    const exporting = ref(false);
    const clearing = ref(false);

    // Computed properties
    const isAdmin = computed(() => authStore.user?.role === "admin");
    const hasChanges = computed(() => {
      // Check if any settings have changed
      return Object.keys(modifiedSystemSettings.value).length > 0;
    });

    const fontPreviewStyle = computed(() => {
      const fontSizes = {
        small: "14px",
        medium: "16px",
        large: "18px",
        "extra-large": "20px",
      };

      const fontFamilies = {
        sarabun: '"Sarabun", sans-serif',
        kanit: '"Kanit", sans-serif',
        prompt: '"Prompt", sans-serif',
        mali: '"Mali", sans-serif',
        mitr: '"Mitr", sans-serif',
        system: "system-ui, -apple-system, sans-serif",
      };

      return {
        fontSize: fontSizes[personalSettings.fontSize] || "16px",
        fontFamily:
          fontFamilies[personalSettings.fontFamily] ||
          "system-ui, -apple-system, sans-serif",
      };
    });

    // Methods
    const showToastMessage = (message, type = "info") => {
      showToast(message, type);
    };

    const refreshSettings = async () => {
      loading.value = true;
      try {
        await loadSettings();
        showToastMessage("รีเฟรชการตั้งค่าเรียบร้อยแล้ว", "success");
      } catch (error) {
        showToastMessage("เกิดข้อผิดพลาดในการรีเฟรช", "error");
      } finally {
        loading.value = false;
      }
    };

    const loadSettings = async () => {
      try {
        // Load personal settings from server
        const personal = await enhancedSettingsService.getPersonalSettings();
        if (personal) {
          Object.assign(personalSettings, personal);
        }

        // Load user profile
        try {
          const profile = await enhancedSettingsService.getUserProfile();
          if (profile) {
            accountSettings.displayName = profile.full_name || "";
            accountSettings.email = profile.email || "";
            accountSettings.phone = profile.phone || "";
          }
        } catch (profileError) {
          console.warn("Could not load user profile:", profileError);
        }

        // Load system settings if admin
        if (isAdmin.value) {
          const system = await enhancedSettingsService.getSystemSettings();
          systemSettings.value = system || {};
        }

        initialized.value = true;
      } catch (error) {
        console.error("Error loading settings:", error);
        showToastMessage("เกิดข้อผิดพลาดในการโหลดการตั้งค่า", "error");
      }
    };

    const saveAllChanges = async () => {
      loading.value = true;
      try {
        // Save personal settings to server
        await enhancedSettingsService.savePersonalSettings(personalSettings);

        // Save account profile if changed
        if (
          accountSettings.displayName ||
          accountSettings.email ||
          accountSettings.phone
        ) {
          try {
            await enhancedSettingsService.updateUserProfile({
              full_name: accountSettings.displayName,
              email: accountSettings.email,
              phone: accountSettings.phone,
            });
          } catch (profileError) {
            console.warn("Could not update profile:", profileError);
            showToastMessage(
              "บันทึกการตั้งค่าส่วนบุคคลสำเร็จ แต่ไม่สามารถอัปเดตโปรไฟล์ได้",
              "warning"
            );
          }
        }

        // Save system settings if admin and there are changes
        if (
          isAdmin.value &&
          Object.keys(modifiedSystemSettings.value).length > 0
        ) {
          await enhancedSettingsService.saveSystemSettings(
            modifiedSystemSettings.value
          );
          modifiedSystemSettings.value = {};
        }

        lastSaved.value = new Date().toISOString();
        showToastMessage("บันทึกการเปลี่ยนแปลงเรียบร้อยแล้ว", "success");
      } catch (error) {
        console.error("Error saving settings:", error);
        showToastMessage(
          "เกิดข้อผิดพลาดในการบันทึก: " +
            (error.response?.data?.message || error.message),
          "error"
        );
      } finally {
        loading.value = false;
      }
    };

    const applyTheme = () => {
      // Apply theme and font settings using the service
      enhancedSettingsService.applyPersonalSettings(personalSettings);
    };

    const previewFont = () => {
      // Apply font preview immediately
      applyTheme();
    };

    const exportUserData = async () => {
      exporting.value = true;
      try {
        await enhancedSettingsService.exportUserData();
        showToastMessage("ส่งออกข้อมูลสำเร็จ", "success");
      } catch (error) {
        console.error("Export error:", error);
        showToastMessage(
          "เกิดข้อผิดพลาดในการส่งออกข้อมูล: " +
            (error.response?.data?.message || error.message),
          "error"
        );
      } finally {
        exporting.value = false;
      }
    };

    const clearCache = async () => {
      if (!confirm("คุณต้องการล้างแคชทั้งหมดหรือไม่?")) {
        return;
      }

      clearing.value = true;
      try {
        await enhancedSettingsService.clearCache();
        showToastMessage("ล้างแคชเรียบร้อยแล้ว", "success");
      } catch (error) {
        console.error("Clear cache error:", error);
        showToastMessage("เกิดข้อผิดพลาดในการล้างแคช", "error");
      } finally {
        clearing.value = false;
      }
    };

    const getSystemSettingDisplayName = (key) => {
      const displayNames = {
        site_name: "ชื่อเว็บไซต์",
        site_description: "คำอธิบายเว็บไซต์",
        maintenance_mode: "โหมดบำรุงรักษา",
        registration_enabled: "เปิดให้สมัครสมาชิก",
        email_verification: "ยืนยันอีเมล",
        max_file_size: "ขนาดไฟล์สูงสุด",
        session_timeout: "หมดเวลาเซสชัน",
      };
      return displayNames[key] || key;
    };

    const getSystemSettingValue = (key) => {
      if (key in modifiedSystemSettings.value) {
        return modifiedSystemSettings.value[key];
      }
      return systemSettings.value[key]?.value;
    };

    const hasSystemSettingChanged = (key) => {
      return key in modifiedSystemSettings.value;
    };

    const toggleSystemSetting = (key) => {
      const currentValue = getSystemSettingValue(key);
      modifiedSystemSettings.value[key] = !currentValue;
    };

    const updateJsonSystemSetting = (key) => {
      try {
        const parsed = JSON.parse(jsonSystemSettings.value[key]);
        modifiedSystemSettings.value[key] = parsed;
      } catch (error) {
        showToastMessage("รูปแบบ JSON ไม่ถูกต้อง", "error");
      }
    };

    const formatDateTime = (dateString) => {
      if (!dateString) return "ไม่ทราบ";
      return new Date(dateString).toLocaleString("th-TH");
    };

    const resetToDefaults = async () => {
      if (
        !confirm("คุณต้องการรีเซ็ตการตั้งค่าทั้งหมดเป็นค่าเริ่มต้นหรือไม่?")
      ) {
        return;
      }

      Object.assign(personalSettings, {
        theme: "light",
        fontSize: "medium",
        language: "th",
        compactMode: false,
        emailNotifications: true,
        pushNotifications: true,
        soundEnabled: true,
      });

      Object.assign(accountSettings, { displayName: "", email: "", phone: "" });
      Object.assign(securitySettings, {
        twoFactorEnabled: false,
        loginNotifications: true,
        sessionTimeout: "60",
      });
      Object.assign(localizationSettings, {
        language: "th",
        dateFormat: "dd/mm/yyyy",
        timeFormat: "24",
        timezone: "Asia/Bangkok",
      });
      Object.assign(keyboardSettings, { enabled: true });
      Object.assign(performanceSettings, {
        itemsPerPage: "25",
        enableCaching: true,
        preloadData: false,
        enableLazyLoading: true,
      });
      Object.assign(backupSettings, { autoBackup: false, frequency: "weekly" });

      showToastMessage(
        "รีเซ็ตการตั้งค่าเป็นค่าเริ่มต้นเรียบร้อยแล้ว",
        "success"
      );
    };

    const importSettings = () => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".json";
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              const settings = JSON.parse(e.target.result);

              if (settings.personalSettings) {
                Object.assign(personalSettings, settings.personalSettings);
              }
              if (settings.accountSettings) {
                Object.assign(accountSettings, settings.accountSettings);
              }
              if (settings.securitySettings) {
                Object.assign(securitySettings, settings.securitySettings);
              }
              if (settings.localizationSettings) {
                Object.assign(
                  localizationSettings,
                  settings.localizationSettings
                );
              }
              if (settings.keyboardSettings) {
                Object.assign(keyboardSettings, settings.keyboardSettings);
              }
              if (settings.performanceSettings) {
                Object.assign(
                  performanceSettings,
                  settings.performanceSettings
                );
              }
              if (settings.backupSettings) {
                Object.assign(backupSettings, settings.backupSettings);
              }

              showToastMessage("นำเข้าการตั้งค่าสำเร็จ", "success");
            } catch (error) {
              showToastMessage("ไฟล์การตั้งค่าไม่ถูกต้อง", "error");
            }
          };
          reader.readAsText(file);
        }
      };
      input.click();
    };

    const exportSettings = () => {
      const settingsData = {
        personalSettings,
        accountSettings,
        securitySettings,
        localizationSettings,
        keyboardSettings,
        performanceSettings,
        backupSettings,
        exportDate: new Date().toISOString(),
        version: systemInfo.version,
      };

      const blob = new Blob([JSON.stringify(settingsData, null, 2)], {
        type: "application/json",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `settings-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToastMessage("ส่งออกการตั้งค่าสำเร็จ", "success");
    };

    const changePassword = () => {
      router.push("/change-password");
    };

    const toggle2FA = () => {
      securitySettings.twoFactorEnabled = !securitySettings.twoFactorEnabled;
      showToastMessage(
        securitySettings.twoFactorEnabled
          ? "เปิดใช้งาน 2FA แล้ว"
          : "ปิดใช้งาน 2FA แล้ว",
        "success"
      );
    };

    const toggleLoginNotification = () => {
      securitySettings.loginNotifications =
        !securitySettings.loginNotifications;
    };

    const getDeviceIcon = (type) => {
      const icons = {
        desktop: "fas fa-desktop",
        mobile: "fas fa-mobile-alt",
        tablet: "fas fa-tablet-alt",
      };
      return icons[type] || "fas fa-question-circle";
    };

    const revokeDevice = (deviceId) => {
      if (confirm("คุณต้องการถอดอุปกรณ์นี้ออกหรือไม่?")) {
        const index = activeDevices.value.findIndex((d) => d.id === deviceId);
        if (index > -1) {
          activeDevices.value.splice(index, 1);
          showToastMessage("ถอดอุปกรณ์เรียบร้อยแล้ว", "success");
        }
      }
    };

    const createBackup = async () => {
      creatingBackup.value = true;

      try {
        // Simulate backup process
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const backupData = {
          personalSettings,
          accountSettings,
          securitySettings,
          localizationSettings,
          keyboardSettings,
          performanceSettings,
          backupSettings,
          timestamp: new Date().toISOString(),
        };

        const blob = new Blob([JSON.stringify(backupData, null, 2)], {
          type: "application/json",
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `backup-${new Date().toISOString().split("T")[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        lastBackup.value = new Date().toLocaleString("th-TH");
        showToastMessage("สำรองข้อมูลสำเร็จ", "success");
      } catch (error) {
        showToastMessage("เกิดข้อผิดพลาดในการสำรองข้อมูล", "error");
      } finally {
        creatingBackup.value = false;
      }
    };

    const restoreFromBackup = () => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".json";
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
          restoring.value = true;

          try {
            const reader = new FileReader();
            reader.onload = async (e) => {
              try {
                const backupData = JSON.parse(e.target.result);

                // Restore all settings
                if (backupData.personalSettings) {
                  Object.assign(personalSettings, backupData.personalSettings);
                }
                if (backupData.accountSettings) {
                  Object.assign(accountSettings, backupData.accountSettings);
                }
                if (backupData.securitySettings) {
                  Object.assign(securitySettings, backupData.securitySettings);
                }
                if (backupData.localizationSettings) {
                  Object.assign(
                    localizationSettings,
                    backupData.localizationSettings
                  );
                }
                if (backupData.keyboardSettings) {
                  Object.assign(keyboardSettings, backupData.keyboardSettings);
                }
                if (backupData.performanceSettings) {
                  Object.assign(
                    performanceSettings,
                    backupData.performanceSettings
                  );
                }
                if (backupData.backupSettings) {
                  Object.assign(backupSettings, backupData.backupSettings);
                }

                showToastMessage("กู้คืนข้อมูลสำเร็จ", "success");
              } catch (error) {
                showToastMessage("ไฟล์สำรองข้อมูลไม่ถูกต้อง", "error");
              } finally {
                restoring.value = false;
              }
            };
            reader.readAsText(file);
          } catch (error) {
            showToastMessage("เกิดข้อผิดพลาดในการกู้คืนข้อมูล", "error");
            restoring.value = false;
          }
        }
      };
      input.click();
    };

    // Watch for online status
    window.addEventListener("online", () => {
      isOnline.value = true;
    });
    window.addEventListener("offline", () => {
      isOnline.value = false;
    });

    // Initialize on mount
    onMounted(async () => {
      loading.value = true;
      updateSystemInfo();
      await loadSettings();
      loading.value = false;
    });

    return {
      loading,
      initialized,
      isOnline,
      lastSaved,
      creatingBackup,
      restoring,
      lastBackup,
      exporting,
      clearing,
      personalSettings,
      accountSettings,
      securitySettings,
      localizationSettings,
      keyboardSettings,
      performanceSettings,
      backupSettings,
      systemSettings,
      modifiedSystemSettings,
      jsonSystemSettings,
      activeDevices,
      systemInfo,
      isAdmin,
      hasChanges,
      fontPreviewStyle,
      refreshSettings,
      saveAllChanges,
      applyTheme,
      previewFont,
      exportUserData,
      clearCache,
      getSystemSettingDisplayName,
      getSystemSettingValue,
      hasSystemSettingChanged,
      toggleSystemSetting,
      updateJsonSystemSetting,
      formatDateTime,
      resetToDefaults,
      importSettings,
      exportSettings,
      changePassword,
      toggle2FA,
      toggleLoginNotification,
      getDeviceIcon,
      revokeDevice,
      createBackup,
      restoreFromBackup,
    };
  },
};
</script>

<style scoped>
.nav-tabs .nav-link {
  border-bottom: 2px solid transparent;
}

.nav-tabs .nav-link.active {
  border-bottom-color: #0d6efd;
}

.card {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  border: 1px solid rgba(0, 0, 0, 0.125);
}

.card-header {
  background-color: rgba(0, 0, 0, 0.03);
  border-bottom: 1px solid rgba(0, 0, 0, 0.125);
}

.form-check-input:checked {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.form-switch .form-check-input {
  width: 2em;
}

kbd {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 0.25rem;
  padding: 0.125rem 0.25rem;
  font-size: 0.75rem;
}

.spinner-border {
  width: 2rem;
  height: 2rem;
}

.badge {
  font-size: 0.75rem;
}

.font-monospace {
  font-family: SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
    "Courier New", monospace;
}

.small {
  font-size: 0.875rem;
}

.fa-spin {
  animation: fa-spin 2s infinite linear;
}

/* Font Families */
.font-sarabun {
  font-family: "Sarabun", sans-serif;
}

.font-kanit {
  font-family: "Kanit", sans-serif;
}

.font-prompt {
  font-family: "Prompt", sans-serif;
}

.font-mali {
  font-family: "Mali", sans-serif;
}

.font-mitr {
  font-family: "Mitr", sans-serif;
}

.font-system {
  font-family: system-ui, -apple-system, sans-serif;
}

/* Font Sizes */
.size-small {
  font-size: 14px;
}

.size-medium {
  font-size: 16px;
}

.size-large {
  font-size: 18px;
}

.size-extra-large {
  font-size: 20px;
}

@keyframes fa-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(359deg);
  }
}
</style>
