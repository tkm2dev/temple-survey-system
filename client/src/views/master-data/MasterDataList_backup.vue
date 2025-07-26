<template>
  <div class="master-data">
    <!-- Header Section -->
    <div class="master-data-header mb-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 class="mb-1">
            <i class="bi bi-database-gear me-2 text-primary"></i>
            จัดการข้อมูลหลัก
          </h2>
          <p class="text-muted mb-0">
            <i class="bi bi-info-circle me-1"></i>
            จัดการข้อมูลหลักของระบบสำรวจวัด
          </p>
        </div>

        <div class="d-flex gap-2">
          <button
            @click="refreshData"
            class="btn btn-outline-secondary"
            :disabled="loading"
          >
            <i class="bi bi-arrow-clockwise me-2"></i>
            รีเฟรช
          </button>
          <button @click="showImportModal" class="btn btn-success">
            <i class="bi bi-upload me-2"></i>
            นำเข้าข้อมูล
          </button>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="row">
        <div class="col-md-3 mb-3">
          <div class="stat-card">
            <div class="stat-icon bg-primary">
              <i class="bi bi-building"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ totalTemples }}</div>
              <div class="stat-label">วัดทั้งหมด</div>
            </div>
          </div>
        </div>
        <div class="col-md-3 mb-3">
          <div class="stat-card">
            <div class="stat-icon bg-success">
              <i class="bi bi-geo-alt"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ totalProvinces }}</div>
              <div class="stat-label">จังหวัด</div>
            </div>
          </div>
        </div>
        <div class="col-md-3 mb-3">
          <div class="stat-card">
            <div class="stat-icon bg-warning">
              <i class="bi bi-map"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ totalDistricts }}</div>
              <div class="stat-label">อำเภอ</div>
            </div>
          </div>
        </div>
        <div class="col-md-3 mb-3">
          <div class="stat-card">
            <div class="stat-icon bg-warning">
              <i class="bi bi-people"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ users.length }}</div>
              <div class="stat-label">ผู้ใช้งาน</div>
            </div>
          </div>
        </div>
        <div class="col-md-3 mb-3">
          <div class="stat-card">
            <div class="stat-icon bg-info">
              <i class="bi bi-signpost"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ totalSubDistricts }}</div>
              <div class="stat-label">ตำบล</div>
            </div>
          </div>
        </div>
        <div class="col-md-3 mb-3">
          <div class="stat-card">
            <div class="stat-icon bg-secondary">
              <i class="bi bi-award"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ policeRanks.length }}</div>
              <div class="stat-label">ยศตำรวจ</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs Section -->
    <div class="master-data-content">
      <ul class="nav nav-tabs mb-4" role="tablist">
        <li class="nav-item" role="presentation">
          <button
            class="nav-link active"
            data-bs-toggle="tab"
            data-bs-target="#temples-tab"
            type="button"
            role="tab"
          >
            <i class="bi bi-building me-2"></i>
            ข้อมูลวัด
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button
            class="nav-link"
            data-bs-toggle="tab"
            data-bs-target="#locations-tab"
            type="button"
            role="tab"
          >
            <i class="bi bi-geo-alt me-2"></i>
            ข้อมูลที่ตั้ง
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button
            class="nav-link"
            data-bs-toggle="tab"
            data-bs-target="#users-tab"
            type="button"
            role="tab"
          >
            <i class="bi bi-people me-2"></i>
            ข้อมูลผู้ใช้งาน
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button
            class="nav-link"
            data-bs-toggle="tab"
            data-bs-target="#import-history-tab"
            type="button"
            role="tab"
          >
            <i class="bi bi-clock-history me-2"></i>
            ประวัติการนำเข้า
          </button>
        </li>
      </ul>

      <div class="tab-content">
        <!-- Temples Tab -->
        <div class="tab-pane fade show active" id="temples-tab" role="tabpanel">
          <div class="temples-section">
            <!-- Search and Filter -->
            <div class="row mb-3">
              <div class="col-md-6 mb-3">
                <div class="input-group">
                  <span class="input-group-text">
                    <i class="bi bi-search"></i>
                  </span>
                  <input
                    v-model="templeSearch"
                    type="text"
                    class="form-control"
                    placeholder="ค้นหาชื่อวัด..."
                    @input="searchTemples"
                  />
                </div>
              </div>
              <div class="col-md-3 mb-3">
                <select
                  v-model="selectedProvince"
                  class="form-select"
                  @change="filterByProvince"
                >
                  <option value="">ทุกจังหวัด</option>
                  <option
                    v-for="province in provinces"
                    :key="province.id"
                    :value="province.id"
                  >
                    {{ province.name }}
                  </option>
                </select>
              </div>
              <div class="col-md-3 mb-3">
                <select
                  v-model="selectedDistrict"
                  class="form-select"
                  @change="filterByDistrict"
                  :disabled="!selectedProvince"
                >
                  <option value="">ทุกอำเภอ</option>
                  <option
                    v-for="district in filteredDistricts"
                    :key="district.id"
                    :value="district.id"
                  >
                    {{ district.name }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Temples Table -->
            <div class="table-responsive">
              <table class="table table-hover">
                <thead class="table-light">
                  <tr>
                    <th>ชื่อวัด</th>
                    <th>ที่อยู่</th>
                    <th>จังหวัด</th>
                    <th>อำเภอ</th>
                    <th>ตำบล</th>
                    <th>รหัสไปรษณีย์</th>
                    <th class="text-center">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="loading">
                    <td colspan="7" class="text-center py-4">
                      <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">กำลังโหลด...</span>
                      </div>
                      <p class="mt-2 mb-0">กำลังโหลดข้อมูล...</p>
                    </td>
                  </tr>
                  <tr v-else-if="filteredTemples.length === 0">
                    <td colspan="7" class="text-center py-4">
                      <i
                        class="bi bi-building text-muted"
                        style="font-size: 2rem"
                      ></i>
                      <p class="mt-2 mb-0">ไม่พบข้อมูลวัด</p>
                    </td>
                  </tr>
                  <tr
                    v-else
                    v-for="temple in paginatedTemples"
                    :key="temple.id"
                  >
                    <td>
                      <div class="fw-medium">{{ temple.name }}</div>
                      <small class="text-muted">ID: {{ temple.id }}</small>
                    </td>
                    <td>{{ temple.address || "-" }}</td>
                    <td>{{ temple.province_name || "-" }}</td>
                    <td>{{ temple.district_name || "-" }}</td>
                    <td>{{ temple.sub_district_name || "-" }}</td>
                    <td>{{ temple.postal_code || "-" }}</td>
                    <td class="text-center">
                      <div class="btn-group" role="group">
                        <button
                          class="btn btn-outline-primary btn-sm"
                          @click="viewTemple(temple.id)"
                          title="ดูรายละเอียด"
                        >
                          <i class="bi bi-eye"></i>
                        </button>
                        <button
                          class="btn btn-outline-secondary btn-sm"
                          @click="editTemple(temple.id)"
                          title="แก้ไข"
                        >
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button
                          class="btn btn-outline-danger btn-sm"
                          @click="deleteTemple(temple.id)"
                          title="ลบ"
                        >
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            <div
              v-if="totalPages > 1"
              class="d-flex justify-content-between align-items-center mt-4"
            >
              <div class="text-muted">
                แสดง {{ startRecord }}-{{ endRecord }} จาก
                {{ filteredTemples.length }} รายการ
              </div>
              <nav>
                <ul class="pagination mb-0">
                  <li
                    class="page-item"
                    :class="{ disabled: currentPage === 1 }"
                  >
                    <button
                      class="page-link"
                      @click="changePage(currentPage - 1)"
                      :disabled="currentPage === 1"
                    >
                      <i class="bi bi-chevron-left"></i>
                    </button>
                  </li>

                  <li
                    v-for="page in visiblePages"
                    :key="page"
                    class="page-item"
                    :class="{ active: page === currentPage }"
                  >
                    <button class="page-link" @click="changePage(page)">
                      {{ page }}
                    </button>
                  </li>

                  <li
                    class="page-item"
                    :class="{ disabled: currentPage === totalPages }"
                  >
                    <button
                      class="page-link"
                      @click="changePage(currentPage + 1)"
                      :disabled="currentPage === totalPages"
                    >
                      <i class="bi bi-chevron-right"></i>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>

        <!-- Locations Tab -->
        <div class="tab-pane fade" id="locations-tab" role="tabpanel">
          <div class="locations-section">
            <div class="row">
              <div class="col-md-4 mb-4">
                <div class="card">
                  <div class="card-header">
                    <h6 class="mb-0">
                      <i class="bi bi-geo-alt me-2"></i>
                      จังหวัด ({{ provinces.length }})
                    </h6>
                  </div>
                  <div class="card-body location-list">
                    <div
                      v-for="province in provinces"
                      :key="province.id"
                      class="location-item"
                    >
                      <div
                        class="d-flex justify-content-between align-items-center"
                      >
                        <span>{{ province.name }}</span>
                        <small class="text-muted">{{ province.code }}</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-md-4 mb-4">
                <div class="card">
                  <div class="card-header">
                    <h6 class="mb-0">
                      <i class="bi bi-map me-2"></i>
                      อำเภอ ({{ districts.length }})
                    </h6>
                  </div>
                  <div class="card-body location-list">
                    <div
                      v-for="district in districts.slice(0, 20)"
                      :key="district.id"
                      class="location-item"
                    >
                      <div
                        class="d-flex justify-content-between align-items-center"
                      >
                        <span>{{ district.name }}</span>
                        <small class="text-muted">{{
                          district.province_name
                        }}</small>
                      </div>
                    </div>
                    <div v-if="districts.length > 20" class="text-center mt-2">
                      <small class="text-muted"
                        >... และอีก {{ districts.length - 20 }} อำเภอ</small
                      >
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-md-4 mb-4">
                <div class="card">
                  <div class="card-header">
                    <h6 class="mb-0">
                      <i class="bi bi-signpost me-2"></i>
                      ตำบล ({{ subDistricts.length }})
                    </h6>
                  </div>
                  <div class="card-body location-list">
                    <div
                      v-for="subDistrict in subDistricts.slice(0, 20)"
                      :key="subDistrict.id"
                      class="location-item"
                    >
                      <div
                        class="d-flex justify-content-between align-items-center"
                      >
                        <span>{{ subDistrict.name }}</span>
                        <small class="text-muted">{{
                          subDistrict.district_name
                        }}</small>
                      </div>
                    </div>
                    <div
                      v-if="subDistricts.length > 20"
                      class="text-center mt-2"
                    >
                      <small class="text-muted"
                        >... และอีก {{ subDistricts.length - 20 }} ตำบล</small
                      >
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Users Tab -->
        <div class="tab-pane fade" id="users-tab" role="tabpanel">
          <div class="users-section">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5><i class="bi bi-people me-2"></i>จัดการผู้ใช้งาน</h5>
              <div class="d-flex gap-2">
                <button @click="showAddUserModal" class="btn btn-success">
                  <i class="bi bi-person-plus me-2"></i>
                  เพิ่มผู้ใช้งาน
                </button>
                <button @click="showUserImportModal" class="btn btn-primary">
                  <i class="bi bi-upload me-2"></i>
                  นำเข้าผู้ใช้งาน
                </button>
              </div>
            </div>

            <!-- Users Search and Filter -->
            <div class="row mb-3">
              <div class="col-md-6">
                <div class="input-group">
                  <span class="input-group-text">
                    <i class="bi bi-search"></i>
                  </span>
                  <input
                    type="text"
                    class="form-control"
                    placeholder="ค้นหาผู้ใช้งาน..."
                    v-model="userSearchTerm"
                  />
                </div>
              </div>
              <div class="col-md-3">
                <select class="form-select" v-model="selectedDepartmentFilter">
                  <option value="">หน่วยงานทั้งหมด</option>
                  <option
                    v-for="dept in uniqueDepartments"
                    :key="dept"
                    :value="dept"
                  >
                    {{ dept }}
                  </option>
                </select>
              </div>
              <div class="col-md-3">
                <select class="form-select" v-model="selectedStatusFilter">
                  <option value="">สถานะทั้งหมด</option>
                  <option value="active">ใช้งาน</option>
                  <option value="inactive">ไม่ใช้งาน</option>
                  <option value="pending">รออนุมัติ</option>
                </select>
              </div>
            </div>

            <!-- Users Table -->
            <div class="table-responsive">
              <table class="table table-hover">
                <thead class="table-light">
                  <tr>
                    <th>รหัสผู้ใช้</th>
                    <th>ชื่อ-นามสกุล</th>
                    <th>ยศ</th>
                    <th>ตำแหน่ง</th>
                    <th>หน่วยงาน</th>
                    <th>เบอร์โทร</th>
                    <th>Line ID</th>
                    <th>สถานะ</th>
                    <th>การจัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in filteredUsers" :key="user.id">
                    <td>{{ user.code }}</td>
                    <td>{{ user.full_name }}</td>
                    <td>
                      <span
                        class="badge"
                        :class="getRankBadgeClass(user.rank)"
                      >
                        {{ user.rank || 'ไม่ระบุ' }}
                      </span>
                    </td>
                    <td>{{ user.position || 'ไม่ระบุ' }}</td>
                    <td>{{ user.department }}</td>
                    <td>{{ user.phone || '-' }}</td>
                    <td>{{ user.line_id || '-' }}</td>
                    <td>
                      <span
                        class="badge"
                        :class="getUserStatusBadgeClass(user.status)"
                      >
                        {{ getUserStatusText(user.status) }}
                      </span>
                    </td>
                    <td>
                      <div class="btn-group btn-group-sm">
                        <button
                          v-if="user.status === 'pending'"
                          class="btn btn-outline-success"
                          @click="approveUser(user.id)"
                          title="อนุมัติ"
                        >
                          <i class="bi bi-check-lg"></i>
                        </button>
                        <button
                          class="btn btn-outline-primary"
                          @click="editUser(user)"
                          title="แก้ไข"
                        >
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button
                          class="btn btn-outline-info"
                          @click="viewUser(user)"
                          title="ดูรายละเอียด"
                        >
                          <i class="bi bi-eye"></i>
                        </button>
                        <button
                          class="btn btn-outline-danger"
                          @click="deleteUser(user.id)"
                          title="ลบ"
                        >
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Import History Tab -->
        <div class="tab-pane fade" id="import-history-tab" role="tabpanel">
          <div class="import-history-section">
            <div class="table-responsive">
              <table class="table table-hover">
                <thead class="table-light">
                  <tr>
                    <th>วันที่นำเข้า</th>
                    <th>ไฟล์</th>
                    <th>จำนวนรายการ</th>
                    <th>สถานะ</th>
                    <th>ผู้นำเข้า</th>
                    <th class="text-center">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="importHistory.length === 0">
                    <td colspan="6" class="text-center py-4">
                      <i
                        class="bi bi-clock-history text-muted"
                        style="font-size: 2rem"
                      ></i>
                      <p class="mt-2 mb-0">ยังไม่มีประวัติการนำเข้าข้อมูล</p>
                    </td>
                  </tr>
                  <tr v-else v-for="history in importHistory" :key="history.id">
                    <td>{{ formatDate(history.created_at) }}</td>
                    <td>
                      <div class="d-flex align-items-center">
                        <i
                          class="bi bi-file-earmark-excel text-success me-2"
                        ></i>
                        {{ history.filename }}
                      </div>
                    </td>
                    <td>{{ history.total_records }}</td>
                    <td>
                      <span
                        :class="getStatusBadgeClass(history.status)"
                        class="badge"
                      >
                        {{ getStatusText(history.status) }}
                      </span>
                    </td>
                    <td>{{ history.imported_by }}</td>
                    <td class="text-center">
                      <button
                        class="btn btn-outline-primary btn-sm"
                        @click="viewImportDetails(history.id)"
                        title="ดูรายละเอียด"
                      >
                        <i class="bi bi-eye"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Import Modal -->
    <div
      v-if="showModal"
      class="modal fade show"
      style="display: block"
      tabindex="-1"
      @click.self="hideImportModal"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-upload me-2"></i>
              นำเข้าข้อมูลจากไฟล์ Excel
            </h5>
            <button
              type="button"
              class="btn-close"
              @click="hideImportModal"
            ></button>
          </div>
          <div class="modal-body">
            <!-- File Upload Area -->
            <div class="upload-area mb-4">
              <div
                class="upload-zone"
                :class="{ 'drag-over': isDragOver }"
                @drop="handleDrop"
                @dragover.prevent="isDragOver = true"
                @dragleave="isDragOver = false"
                @click="triggerFileInput"
              >
                <input
                  ref="fileInputRef"
                  type="file"
                  class="d-none"
                  accept=".csv,.txt"
                  @change="handleFileSelect"
                />
                <div class="upload-content">
                  <i class="bi bi-cloud-upload upload-icon"></i>
                  <h6 class="mb-2">
                    ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์
                  </h6>
                  <p class="text-muted mb-2">
                    รองรับไฟล์ .csv และ .txt (แนะนำสำหรับภาษาไทย)
                  </p>
                  <p class="text-warning mb-0" style="font-size: 0.85em">
                    <i class="bi bi-exclamation-triangle me-1"></i>
                    สำหรับไฟล์ Excel: กรุณาบันทึกเป็น CSV ด้วย UTF-8 encoding
                    เพื่อรองรับภาษาไทย
                  </p>
                </div>
              </div>
            </div>

            <!-- Selected File Info -->
            <div v-if="selectedFile" class="selected-file mb-4">
              <div class="card border-success">
                <div class="card-body">
                  <div
                    class="d-flex align-items-center justify-content-between"
                  >
                    <div class="d-flex align-items-center">
                      <i
                        class="bi bi-file-earmark-excel text-success fs-4 me-3"
                      ></i>
                      <div>
                        <div class="fw-medium">{{ selectedFile.name }}</div>
                        <small class="text-muted">
                          {{ formatFileSize(selectedFile.size) }} |
                          {{ formatDate(new Date(selectedFile.lastModified)) }}
                        </small>
                      </div>
                    </div>
                    <button
                      type="button"
                      class="btn btn-outline-danger btn-sm"
                      @click="clearSelectedFile"
                    >
                      <i class="bi bi-x"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Import Options -->
            <div class="import-options mb-4">
              <h6 class="mb-3">ตัวเลือกการนำเข้า</h6>
              <div class="row">
                <div class="col-md-6 mb-3">
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      v-model="importOptions.updateExisting"
                      id="updateExisting"
                    />
                    <label class="form-check-label" for="updateExisting">
                      อัปเดตข้อมูลที่มีอยู่แล้ว
                    </label>
                  </div>
                </div>
                <div class="col-md-6 mb-3">
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      v-model="importOptions.skipDuplicates"
                      id="skipDuplicates"
                    />
                    <label class="form-check-label" for="skipDuplicates">
                      ข้ามข้อมูลที่ซ้ำกัน
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- Column Mapping and Preview -->
            <div
              v-if="showColumnMapping && previewData.headers"
              class="column-mapping-section mb-4"
            >
              <h6 class="mb-3">
                <i class="bi bi-table me-2"></i>
                การจับคู่คอลัมน์และตัวอย่างข้อมูล
              </h6>

              <!-- Column Mapping -->
              <div class="mb-4">
                <div class="card">
                  <div class="card-header">
                    <h6 class="mb-0">เลือกคอลัมน์ที่ต้องการนำเข้า</h6>
                  </div>
                  <div class="card-body">
                    <div class="row">
                      <div
                        v-for="field in requiredFields"
                        :key="field"
                        class="col-md-6 mb-3"
                      >
                        <label :for="`mapping-${field}`" class="form-label">
                          {{ getFieldLabel(field) }}
                          <span class="text-danger">*</span>
                        </label>
                        <select
                          :id="`mapping-${field}`"
                          class="form-select"
                          v-model="columnMapping[field]"
                        >
                          <option value="">-- เลือกคอลัมน์ --</option>
                          <option
                            v-for="column in availableColumns"
                            :key="column"
                            :value="column"
                          >
                            {{ column }}
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Data Preview -->
              <div class="preview-section">
                <div class="card">
                  <div class="card-header">
                    <h6 class="mb-0">ตัวอย่างข้อมูล (5 บรรทัดแรก)</h6>
                  </div>
                  <div class="card-body">
                    <div class="table-responsive">
                      <table class="table table-sm table-bordered">
                        <thead class="table-light">
                          <tr>
                            <th
                              v-for="header in previewData.headers"
                              :key="header"
                            >
                              {{ header }}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr
                            v-for="(row, index) in previewData.rows"
                            :key="index"
                          >
                            <td
                              v-for="(cell, cellIndex) in row"
                              :key="cellIndex"
                            >
                              {{ cell }}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Template Download -->
            <div class="template-section">
              <h6 class="mb-2">ไฟล์ตัวอย่าง (UTF-8 CSV)</h6>
              <p class="text-muted mb-2">
                ดาวน์โหลดไฟล์ตัวอย่างในรูปแบบ CSV ที่รองรับภาษาไทย
              </p>
              <p class="text-info mb-3" style="font-size: 0.9em">
                <i class="bi bi-info-circle me-1"></i>
                ไฟล์ตัวอย่างจะใช้ encoding UTF-8 เพื่อแสดงภาษาไทยอย่างถูกต้อง
              </p>
              <button
                type="button"
                class="btn btn-outline-info"
                @click="downloadTemplate"
              >
                <i class="bi bi-download me-2"></i>
                ดาวน์โหลดไฟล์ตัวอย่าง (CSV)
              </button>
            </div>
          </div>

          <!-- Help Section for Thai Language -->
          <div class="alert alert-info mt-3">
            <h6>
              <i class="bi bi-lightbulb me-2"></i>วิธีการบันทึกไฟล์ Excel เป็น
              CSV (UTF-8)
            </h6>
            <ol class="mb-0" style="font-size: 0.9em">
              <li>เปิดไฟล์ Excel ของคุณ</li>
              <li>คลิก File → Save As</li>
              <li>
                เลือก File Type เป็น "CSV UTF-8 (Comma delimited) (*.csv)"
              </li>
              <li>คลิก Save</li>
              <li>นำไฟล์ CSV ที่สร้างขึ้นมาใช้กับระบบนี้</li>
            </ol>
          </div>

          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              @click="hideImportModal"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              class="btn btn-success"
              @click="importData"
              :disabled="
                !selectedFile ||
                importing ||
                !showColumnMapping ||
                !isColumnMappingValid
              "
            >
              <span
                v-if="importing"
                class="spinner-border spinner-border-sm me-2"
              ></span>
              <i v-else class="bi bi-upload me-2"></i>
              {{ importing ? "กำลังนำเข้า..." : "นำเข้าข้อมูล" }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Backdrop -->
    <div v-if="showModal" class="modal-backdrop fade show"></div>

    <!-- Rank Modal -->
    <div
      v-if="showRankModalState"
      class="modal fade show"
      style="display: block"
      tabindex="-1"
      @click.self="hideRankModal"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-award me-2"></i>
              {{ editingRank ? "แก้ไขยศตำรวจ" : "เพิ่มยศใหม่" }}
            </h5>
            <button
              type="button"
              class="btn-close"
              @click="hideRankModal"
            ></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveRank">
              <div class="mb-3">
                <label for="rankName" class="form-label"
                  >ชื่อยศ <span class="text-danger">*</span></label
                >
                <input
                  type="text"
                  class="form-control"
                  id="rankName"
                  v-model="rankForm.name"
                  required
                />
              </div>
              <div class="mb-3">
                <label for="rankAbbreviation" class="form-label"
                  >ชื่อย่อ <span class="text-danger">*</span></label
                >
                <input
                  type="text"
                  class="form-control"
                  id="rankAbbreviation"
                  v-model="rankForm.abbreviation"
                  required
                />
              </div>
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="rankLevel" class="form-label"
                    >ระดับ <span class="text-danger">*</span></label
                  >
                  <select
                    class="form-select"
                    id="rankLevel"
                    v-model="rankForm.level"
                    required
                  >
                    <option value="">เลือกระดับ</option>
                    <option v-for="i in 10" :key="i" :value="i">{{ i }}</option>
                  </select>
                </div>
                <div class="col-md-6 mb-3">
                  <label for="rankOrder" class="form-label"
                    >ลำดับ <span class="text-danger">*</span></label
                  >
                  <input
                    type="number"
                    class="form-control"
                    id="rankOrder"
                    v-model="rankForm.order"
                    min="1"
                    required
                  />
                </div>
              </div>
              <div class="mb-3">
                <label for="rankColor" class="form-label">สีตัวอักษร</label>
                <input
                  type="color"
                  class="form-control form-control-color"
                  id="rankColor"
                  v-model="rankForm.color"
                />
              </div>
              <div class="form-check">
                <input
                  class="form-check-input"
                  type="checkbox"
                  v-model="rankForm.active"
                  id="rankActive"
                />
                <label class="form-check-label" for="rankActive">
                  ใช้งาน
                </label>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              @click="hideRankModal"
            >
              ยกเลิก
            </button>
            <button type="button" class="btn btn-primary" @click="saveRank">
              <i class="bi bi-check-lg me-2"></i>
              บันทึก
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Rank Modal Backdrop -->
    <div v-if="showRankModalState" class="modal-backdrop fade show"></div>

    <!-- User Management Modal -->
    <div
      v-if="showUserModalState"
      class="modal fade show"
      style="display: block"
      tabindex="-1"
      @click.self="hideUserModal"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-person-gear me-2"></i>
              {{ editingUser ? 'แก้ไขผู้ใช้งาน' : 'เพิ่มผู้ใช้งานใหม่' }}
            </h5>
            <button
              type="button"
              class="btn-close"
              @click="hideUserModal"
            ></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveUser">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">รหัสผู้ใช้ <span class="text-danger">*</span></label>
                  <input
                    type="text"
                    class="form-control"
                    v-model="userForm.code"
                    required
                    placeholder="เช่น POL001"
                  />
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">อีเมล <span class="text-danger">*</span></label>
                  <input
                    type="email"
                    class="form-control"
                    v-model="userForm.email"
                    required
                    placeholder="example@police.go.th"
                  />
                </div>
              </div>
              
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">ชื่อ <span class="text-danger">*</span></label>
                  <input
                    type="text"
                    class="form-control"
                    v-model="userForm.first_name"
                    required
                    placeholder="ชื่อ"
                  />
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">นามสกุล <span class="text-danger">*</span></label>
                  <input
                    type="text"
                    class="form-control"
                    v-model="userForm.last_name"
                    required
                    placeholder="นามสกุล"
                  />
                </div>
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">ยศ</label>
                  <input
                    type="text"
                    class="form-control"
                    v-model="userForm.rank"
                    placeholder="เช่น สารวัตร"
                  />
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">ตำแหน่ง</label>
                  <input
                    type="text"
                    class="form-control"
                    v-model="userForm.position"
                    placeholder="เช่น หัวหน้าหน่วย"
                  />
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">หน่วยงาน <span class="text-danger">*</span></label>
                <input
                  type="text"
                  class="form-control"
                  v-model="userForm.department"
                  required
                  placeholder="เช่น สถานีตำรวจนครบาลบางซื่อ"
                />
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">เบอร์โทรศัพท์</label>
                  <input
                    type="tel"
                    class="form-control"
                    v-model="userForm.phone"
                    placeholder="เช่น 02-123-4567"
                  />
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Line ID</label>
                  <input
                    type="text"
                    class="form-control"
                    v-model="userForm.line_id"
                    placeholder="เช่น @police123"
                  />
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">สถานะ</label>
                <select class="form-select" v-model="userForm.status">
                  <option value="pending">รออนุมัติ</option>
                  <option value="active">ใช้งาน</option>
                  <option value="inactive">ไม่ใช้งาน</option>
                </select>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="hideUserModal">
              ยกเลิก
            </button>
            <button type="button" class="btn btn-primary" @click="saveUser">
              <i class="bi bi-save me-2"></i>
              {{ editingUser ? 'บันทึกการแก้ไข' : 'เพิ่มผู้ใช้งาน' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- User Detail Modal -->
    <div
      v-if="showUserDetailModalState"
      class="modal fade show"
      style="display: block"
      tabindex="-1"
      @click.self="hideUserDetailModal"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-person-lines-fill me-2"></i>
              รายละเอียดผู้ใช้งาน
            </h5>
            <button
              type="button"
              class="btn-close"
              @click="hideUserDetailModal"
            ></button>
          </div>
          <div class="modal-body" v-if="selectedUser">
            <div class="row">
              <div class="col-md-6 mb-3">
                <strong>รหัสผู้ใช้:</strong>
                <p class="mt-1">{{ selectedUser.code }}</p>
              </div>
              <div class="col-md-6 mb-3">
                <strong>อีเมล:</strong>
                <p class="mt-1">{{ selectedUser.email }}</p>
              </div>
            </div>
            
            <div class="row">
              <div class="col-md-12 mb-3">
                <strong>ชื่อ-นามสกุล:</strong>
                <p class="mt-1">{{ selectedUser.full_name }}</p>
              </div>
            </div>

            <div class="row">
              <div class="col-md-6 mb-3">
                <strong>ยศ:</strong>
                <p class="mt-1">{{ selectedUser.rank || 'ไม่ระบุ' }}</p>
              </div>
              <div class="col-md-6 mb-3">
                <strong>ตำแหน่ง:</strong>
                <p class="mt-1">{{ selectedUser.position || 'ไม่ระบุ' }}</p>
              </div>
            </div>

            <div class="row">
              <div class="col-md-12 mb-3">
                <strong>หน่วยงาน:</strong>
                <p class="mt-1">{{ selectedUser.department }}</p>
              </div>
            </div>

            <div class="row">
              <div class="col-md-6 mb-3">
                <strong>เบอร์โทรศัพท์:</strong>
                <p class="mt-1">{{ selectedUser.phone || 'ไม่ระบุ' }}</p>
              </div>
              <div class="col-md-6 mb-3">
                <strong>Line ID:</strong>
                <p class="mt-1">{{ selectedUser.line_id || 'ไม่ระบุ' }}</p>
              </div>
            </div>

            <div class="row">
              <div class="col-md-6 mb-3">
                <strong>สถานะ:</strong>
                <p class="mt-1">
                  <span
                    class="badge"
                    :class="getUserStatusBadgeClass(selectedUser.status)"
                  >
                    {{ getUserStatusText(selectedUser.status) }}
                  </span>
                </p>
              </div>
              <div class="col-md-6 mb-3">
                <strong>วันที่สร้าง:</strong>
                <p class="mt-1">{{ formatDate(selectedUser.created_at) }}</p>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="hideUserDetailModal">
              ปิด
            </button>
            <button type="button" class="btn btn-primary" @click="editUser(selectedUser)">
              <i class="bi bi-pencil me-2"></i>
              แก้ไข
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- User Import Modal -->
    <div
      v-if="showUserImportModalState"
      class="modal fade show"
      style="display: block"
      tabindex="-1"
      @click.self="hideUserImportModal"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-person-plus me-2"></i>
              นำเข้าข้อมูลผู้ใช้งาน
            </h5>
            <button
              type="button"
              class="btn-close"
              @click="hideUserImportModal"
            ></button>
          </div>
          <div class="modal-body">
            <!-- User Import File Upload -->
            <div class="upload-area mb-4">
              <div class="upload-zone" @click="triggerUserFileInput">
                <input
                  ref="userFileInputRef"
                  type="file"
                  class="d-none"
                  accept=".csv,.txt"
                  @change="handleUserFileSelect"
                />
                <div class="upload-content">
                  <i class="bi bi-cloud-upload upload-icon"></i>
                  <h6 class="mb-2">เลือกไฟล์ข้อมูลผู้ใช้งาน</h6>
                  <p class="text-muted mb-0">รองรับไฟล์ CSV และ TXT (UTF-8)</p>
                </div>
              </div>
            </div>

            <!-- User Import Template Download -->
            <div class="template-section">
              <h6 class="mb-2">ไฟล์ตัวอย่างผู้ใช้งาน</h6>
              <p class="text-muted mb-3">
                ดาวน์โหลดไฟล์ตัวอย่างรูปแบบข้อมูลผู้ใช้งาน
              </p>
              <button
                type="button"
                class="btn btn-outline-info"
                @click="downloadUserTemplate"
              >
                <i class="bi bi-download me-2"></i>
                ดาวน์โหลดไฟล์ตัวอย่าง
              </button>
            </div>

            <!-- User Import Instructions -->
            <div class="alert alert-info mt-3">
              <h6>
                <i class="bi bi-info-circle me-2"></i>รูปแบบข้อมูลผู้ใช้งาน
              </h6>
              <ul class="mb-0" style="font-size: 0.9em">
                <li>รหัสผู้ใช้ (Code)</li>
                <li>ชื่อ (FirstName)</li>
                <li>นามสกุล (LastName)</li>
                <li>อีเมล (Email)</li>
                <li>ยศ (RankName)</li>
                <li>หน่วยงาน (Department)</li>
                <li>สถานะ (Status: active/inactive)</li>
              </ul>
            </div>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              @click="hideUserImportModal"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              class="btn btn-primary"
              @click="importUserData"
              :disabled="!selectedUserFile"
            >
              <i class="bi bi-upload me-2"></i>
              นำเข้าข้อมูล
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- User Import Modal Backdrop -->
    <div v-if="showUserImportModalState" class="modal-backdrop fade show"></div>

    <!-- Toast Container -->
    <div
      id="toast-container"
      class="position-fixed top-0 end-0 p-3"
      style="z-index: 1051"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, nextTick } from "vue";
import { useRouter } from "vue-router";
import masterDataService from "@/services/masterDataService";
import moment from "moment";

const router = useRouter();

// State
const loading = ref(true);
const importing = ref(false);
const showModal = ref(false);
const selectedFile = ref(null);
const isDragOver = ref(false);
const previewData = ref([]);
const columnMapping = ref({});
const showColumnMapping = ref(false);
const availableColumns = ref([]);
const requiredFields = [
  "Name",
  "TAM_NAM_T",
  "AMP_NAM_T",
  "PROV_NAM_T",
  "Latitude",
  "Longitude",
];

// File refs
const fileInputRef = ref(null);

// Data
const temples = ref([]);
const provinces = ref([]);
const districts = ref([]);
const subDistricts = ref([]);
const importHistory = ref([]);

// Users data
const users = ref([]);
const policeRanks = ref([]);

// Search and Filter
const templeSearch = ref("");
const selectedProvince = ref("");
const selectedDistrict = ref("");

// Users search and filter
const userSearchTerm = ref("");
const selectedRankFilter = ref("");
const selectedStatusFilter = ref("");
const selectedDepartmentFilter = ref("");

// User management
const showUserModalState = ref(false);
const showUserDetailModalState = ref(false);
const editingUser = ref(null);
const selectedUser = ref(null);

// Pagination
const currentPage = ref(1);
const perPage = 20;

// Import options
const importOptions = reactive({
  updateExisting: false,
  skipDuplicates: true,
});

// Modal states
const showUserImportModalState = ref(false);
const showRankModalState = ref(false);
const editingRank = ref(null);

// User import
const selectedUserFile = ref(null);
const userFileInputRef = ref(null);

// Rank form
const rankForm = reactive({
  name: "",
  abbreviation: "",
  level: "",
  order: "",
  color: "#073B4C",
  active: true,
});

// User form
const userForm = reactive({
  code: "",
  first_name: "",
  last_name: "",
  email: "",
  rank: "",
  position: "",
  department: "",
  phone: "",
  line_id: "",
  status: "pending",
});

// Computed properties
const totalTemples = computed(() => temples.value.length);
const totalProvinces = computed(() => provinces.value.length);
const totalDistricts = computed(() => districts.value.length);
const totalSubDistricts = computed(() => subDistricts.value.length);

const isColumnMappingValid = computed(() => {
  return requiredFields.every(
    (field) =>
      columnMapping.value[field] && columnMapping.value[field].trim() !== ""
  );
});

const filteredDistricts = computed(() => {
  if (!selectedProvince.value) return [];
  return districts.value.filter(
    (district) => district.province_id === selectedProvince.value
  );
});

const filteredUsers = computed(() => {
  let filtered = users.value;

  // Search by name, code, or email
  if (userSearchTerm.value) {
    const search = userSearchTerm.value.toLowerCase();
    filtered = filtered.filter(
      (user) =>
        user.full_name.toLowerCase().includes(search) ||
        user.code.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search) ||
        (user.department && user.department.toLowerCase().includes(search))
    );
  }

  // Filter by department
  if (selectedDepartmentFilter.value) {
    filtered = filtered.filter(
      (user) => user.department === selectedDepartmentFilter.value
    );
  }

  // Filter by status
  if (selectedStatusFilter.value) {
    filtered = filtered.filter(
      (user) => user.status === selectedStatusFilter.value
    );
  }

  return filtered;
});

const uniqueDepartments = computed(() => {
  const departments = users.value
    .map(user => user.department)
    .filter(dept => dept && dept.trim() !== '');
  return [...new Set(departments)].sort();
});

const filteredTemples = computed(() => {
  let filtered = temples.value;

  // Search by name
  if (templeSearch.value) {
    const search = templeSearch.value.toLowerCase();
    filtered = filtered.filter((temple) =>
      temple.name.toLowerCase().includes(search)
    );
  }

  // Filter by province
  if (selectedProvince.value) {
    filtered = filtered.filter(
      (temple) => temple.province_id === selectedProvince.value
    );
  }

  // Filter by district
  if (selectedDistrict.value) {
    filtered = filtered.filter(
      (temple) => temple.district_id === selectedDistrict.value
    );
  }

  return filtered;
});

const totalPages = computed(() => {
  return Math.ceil(filteredTemples.value.length / perPage);
});

const paginatedTemples = computed(() => {
  const start = (currentPage.value - 1) * perPage;
  const end = start + perPage;
  return filteredTemples.value.slice(start, end);
});

const visiblePages = computed(() => {
  const pages = [];
  const start = Math.max(1, currentPage.value - 2);
  const end = Math.min(totalPages.value, currentPage.value + 2);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
});

const startRecord = computed(() => {
  return (currentPage.value - 1) * perPage + 1;
});

const endRecord = computed(() => {
  return Math.min(currentPage.value * perPage, filteredTemples.value.length);
});

// Methods
const loadData = async () => {
  try {
    loading.value = true;

    // Load data using actual services
    await Promise.all([
      loadTemples(),
      loadLocations(),
      loadUsers(),
      loadPoliceRanks(),
      loadImportHistory(),
    ]);
  } catch (error) {
    console.error("Error loading data:", error);
    showToast("เกิดข้อผิดพลาดในการโหลดข้อมูล", "error");

    // Fallback to mock data
    await loadMockData();
  } finally {
    loading.value = false;
  }
};

const loadTemples = async () => {
  try {
    const response = await masterDataService.getTemples();
    if (response.success && response.data) {
      temples.value = response.data.temples || response.data || [];
    } else {
      // Fallback to mock data
      temples.value = getMockTemples();
    }
  } catch (error) {
    console.warn("Failed to load temples from API, using mock data");
    temples.value = getMockTemples();
  }
};

const loadLocations = async () => {
  try {
    const [provincesRes, districtsRes, subDistrictsRes] = await Promise.all([
      masterDataService.getProvinces(),
      masterDataService.getDistricts(),
      masterDataService.getSubDistricts(),
    ]);

    provinces.value = provincesRes.success
      ? provincesRes.data || []
      : getMockProvinces();
    districts.value = districtsRes.success
      ? districtsRes.data || []
      : getMockDistricts();
    subDistricts.value = subDistrictsRes.success
      ? subDistrictsRes.data || []
      : getMockSubDistricts();
  } catch (error) {
    console.warn("Failed to load locations from API, using mock data");
    provinces.value = getMockProvinces();
    districts.value = getMockDistricts();
    subDistricts.value = getMockSubDistricts();
  }
};

const loadUsers = async () => {
  try {
    const response = await masterDataService.getUsers();
    if (response.success && response.data) {
      users.value = response.data;
    } else {
      console.warn("No users data received from API");
    }
  } catch (error) {
    console.error("Error loading users:", error);
    throw error;
  }
};

const loadPoliceRanks = async () => {
  try {
    const response = await masterDataService.getPoliceRanks();
    if (response.success && response.data) {
      policeRanks.value = response.data;
    } else {
      console.warn("No police ranks data received from API");
    }
  } catch (error) {
    console.error("Error loading police ranks:", error);
    throw error;
  }
};

const loadImportHistory = async () => {
  try {
    const response = await masterDataService.getImportHistory();
    if (response.success && response.data) {
      importHistory.value = response.data.history || response.data || [];
    } else {
      importHistory.value = getMockImportHistory();
    }
  } catch (error) {
    console.warn("Failed to load import history from API, using mock data");
    importHistory.value = getMockImportHistory();
  }
};

// Mock data functions
const getMockTemples = () => [
  {
    id: 1,
    name: "วัดพระแก้ว",
    address: "ถนนหน้าพระลาน แขวงพระบรมมหาราชวัง",
    province_id: 1,
    province_name: "กรุงเทพมหานคร",
    district_id: 1,
    district_name: "พระนคร",
    sub_district_id: 1,
    sub_district_name: "พระบรมมหาราชวัง",
    postal_code: "10200",
  },
  {
    id: 2,
    name: "วัดโพธิ์",
    address: "2 ถนนไทยวัง แขวงพระบรมมหาราชวัง",
    province_id: 1,
    province_name: "กรุงเทพมหานคร",
    district_id: 1,
    district_name: "พระนคร",
    sub_district_id: 1,
    sub_district_name: "พระบรมมหาราชวัง",
    postal_code: "10200",
  },
  {
    id: 3,
    name: "วัดอรุณราชวราราม",
    address: "34 ถนนอรุณอมรินทร์ แขวงวัดอรุณ",
    province_id: 1,
    province_name: "กรุงเทพมหานคร",
    district_id: 2,
    district_name: "บางกอกใหญ่",
    sub_district_id: 2,
    sub_district_name: "วัดอรุณ",
    postal_code: "10600",
  },
];

const getMockPoliceRanks = () => [
  {
    id: 1,
    name: "ผู้บังคับการ",
    abbreviation: "ผบก.",
    level: 10,
    color: "#FF6B35",
    order: 1,
    active: true,
  },
  {
    id: 2,
    name: "รองผู้บังคับการ",
    abbreviation: "รอง ผบก.",
    level: 9,
    color: "#F7931E",
    order: 2,
    active: true,
  },
  {
    id: 3,
    name: "ผู้กำกับการ",
    abbreviation: "ผกก.",
    level: 8,
    color: "#FFD23F",
    order: 3,
    active: true,
  },
  {
    id: 4,
    name: "รองผู้กำกับการ",
    abbreviation: "รอง ผกก.",
    level: 7,
    color: "#06FFA5",
    order: 4,
    active: true,
  },
  {
    id: 5,
    name: "สารวัตร",
    abbreviation: "สวท.",
    level: 6,
    color: "#06D6A0",
    order: 5,
    active: true,
  },
  {
    id: 6,
    name: "รองสารวัตร",
    abbreviation: "รอง สวท.",
    level: 5,
    color: "#118AB2",
    order: 6,
    active: true,
  },
  {
    id: 7,
    name: "ดาบตำรวจ",
    abbreviation: "ด.ต.",
    level: 4,
    color: "#073B4C",
    order: 7,
    active: true,
  },
  {
    id: 8,
    name: "จ่าสิบตำรวจ",
    abbreviation: "จ.ส.ต.",
    level: 3,
    color: "#6C5CE7",
    order: 8,
    active: true,
  },
  {
    id: 9,
    name: "นายสิบตำรวจ",
    abbreviation: "น.ส.ต.",
    level: 2,
    color: "#A29BFE",
    order: 9,
    active: true,
  },
  {
    id: 10,
    name: "ผู้บังคับหมู่",
    abbreviation: "ผบห.",
    level: 1,
    color: "#636E72",
    order: 10,
    active: true,
  },
];

const getMockUsers = () => [
  {
    id: 1,
    code: "POL001",
    first_name: "สมชาย",
    last_name: "ใจดี",
    full_name: "สมชาย ใจดี",
    email: "somchai.j@police.go.th",
    rank_id: 5,
    department: "สถานีตำรวจนครบาลบางซื่อ",
    status: "active",
    created_at: "2024-01-15T08:00:00Z",
  },
  {
    id: 2,
    code: "POL002",
    first_name: "วิไล",
    last_name: "สุขใส",
    full_name: "วิไล สุขใส",
    email: "wilai.s@police.go.th",
    rank_id: 6,
    department: "สถานีตำรวจนครบาลห้วยขวาง",
    status: "active",
    created_at: "2024-02-20T09:30:00Z",
  },
  {
    id: 3,
    code: "POL003",
    first_name: "ประเสริฐ",
    last_name: "มั่นใจ",
    full_name: "ประเสริฐ มั่นใจ",
    email: "prasert.m@police.go.th",
    rank_id: 3,
    department: "สำนักงานตำรวจแห่งชาติ",
    status: "active",
    created_at: "2024-03-10T14:15:00Z",
  },
  {
    id: 4,
    code: "POL004",
    first_name: "สุนีย์",
    last_name: "เก่งกาจ",
    full_name: "สุนีย์ เก่งกาจ",
    email: "sunee.k@police.go.th",
    rank_id: 7,
    department: "สถานีตำรวจนครบาลดินแดง",
    status: "inactive",
    created_at: "2024-04-05T11:45:00Z",
  },
];

const getMockProvinces = () => [
  { id: 1, name: "กรุงเทพมหานคร", code: "10" },
  { id: 2, name: "เชียงใหม่", code: "50" },
  { id: 3, name: "นครราชสีมา", code: "30" },
  { id: 4, name: "กาฬสินธุ์", code: "46" },
];

const getMockDistricts = () => [
  { id: 1, name: "พระนคร", province_id: 1, province_name: "กรุงเทพมหานคร" },
  { id: 2, name: "บางกอกใหญ่", province_id: 1, province_name: "กรุงเทพมหานคร" },
  { id: 3, name: "เมืองเชียงใหม่", province_id: 2, province_name: "เชียงใหม่" },
  { id: 4, name: "กมลาไสย", province_id: 4, province_name: "กาฬสินธุ์" },
];

const getMockSubDistricts = () => [
  { id: 1, name: "พระบรมมหาราชวัง", district_id: 1, district_name: "พระนคร" },
  { id: 2, name: "วัดอรุณ", district_id: 2, district_name: "บางกอกใหญ่" },
  { id: 3, name: "ศรีภูมิ", district_id: 3, district_name: "เมืองเชียงใหม่" },
  { id: 4, name: "กมลาไสย", district_id: 4, district_name: "กมลาไสย" },
];

const getMockImportHistory = () => [
  {
    id: 1,
    filename: "temples_p4.xlsx",
    total_records: 1250,
    status: "completed",
    imported_by: "ผู้ดูแลระบบ",
    created_at: "2024-07-25T10:30:00Z",
  },
  {
    id: 2,
    filename: "temples_update.xlsx",
    total_records: 85,
    status: "failed",
    imported_by: "ผู้ดูแลระบบ",
    created_at: "2024-07-24T14:15:00Z",
  },
];

const loadMockData = async () => {
  temples.value = getMockTemples();
  provinces.value = getMockProvinces();
  districts.value = getMockDistricts();
  subDistricts.value = getMockSubDistricts();
  importHistory.value = getMockImportHistory();
  policeRanks.value = getMockPoliceRanks();
  users.value = getMockUsers();
};

const refreshData = () => {
  showToast("กำลังรีเฟรชข้อมูล...", "info");
  loadData();
};

const searchTemples = () => {
  currentPage.value = 1;
};

const filterByProvince = () => {
  selectedDistrict.value = "";
  currentPage.value = 1;
};

const filterByDistrict = () => {
  currentPage.value = 1;
};

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

// File handling methods
const showImportModal = () => {
  showModal.value = true;
};

const hideImportModal = () => {
  showModal.value = false;
  clearSelectedFile();
};

const triggerFileInput = () => {
  fileInputRef.value.click();
};

const handleFileSelect = async (event) => {
  const file = event.target.files[0];
  if (file && validateFile(file)) {
    selectedFile.value = file;

    try {
      // Parse file for preview and column mapping
      await parseFileForPreview(file);
      showColumnMapping.value = true;
    } catch (error) {
      console.error("Error parsing file for preview:", error);
      showToast(`ไม่สามารถอ่านไฟล์ได้: ${error.message}`, "error");
    }
  }
};

const handleDrop = async (event) => {
  event.preventDefault();
  isDragOver.value = false;

  const files = event.dataTransfer.files;
  if (files.length > 0) {
    const file = files[0];
    if (validateFile(file)) {
      selectedFile.value = file;

      try {
        // Parse file for preview and column mapping
        await parseFileForPreview(file);
        showColumnMapping.value = true;
      } catch (error) {
        console.error("Error parsing file for preview:", error);
        showToast(`ไม่สามารถอ่านไฟล์ได้: ${error.message}`, "error");
      }
    }
  }
};

const validateFile = (file) => {
  const validTypes = ["text/csv", "text/plain", "application/csv"];

  const validExtensions = [".csv", ".txt"];
  const hasValidType = validTypes.includes(file.type);
  const hasValidExtension = validExtensions.some((ext) =>
    file.name.toLowerCase().endsWith(ext)
  );

  // Check for Excel files and show specific message
  if (
    file.name.toLowerCase().endsWith(".xlsx") ||
    file.name.toLowerCase().endsWith(".xls")
  ) {
    showToast(
      "ไฟล์ Excel ไม่รองรับภาษาไทย กรุณาบันทึกเป็นไฟล์ CSV หรือ TXT ด้วย UTF-8 encoding",
      "error"
    );
    return false;
  }

  if (!hasValidType && !hasValidExtension) {
    showToast("กรุณาเลือกไฟล์ CSV (.csv) หรือ Text (.txt) เท่านั้น", "error");
    return false;
  }

  if (file.size > 10 * 1024 * 1024) {
    // 10MB limit
    showToast("ขนาดไฟล์ต้องไม่เกิน 10MB", "error");
    return false;
  }

  return true;
};

const importData = async () => {
  if (!selectedFile.value) {
    showToast("กรุณาเลือกไฟล์ก่อน", "warning");
    return;
  }

  try {
    importing.value = true;

    // Prepare FormData for API call
    const formData = new FormData();
    formData.append("file", selectedFile.value);
    formData.append("columnMappings", JSON.stringify(columnMappings.value));
    formData.append("importOptions", JSON.stringify(importOptions));

    // Call API to import temples
    const response = await masterDataService.importTemples(formData);

    if (response.success) {
      // Refresh temple list from API
      await loadTemples();

      // Add to import history
      const newImportRecord = {
        id: importHistory.value.length + 1,
        filename: selectedFile.value.name,
        total_records: response.data.imported_count || 0,
        status: "completed",
        imported_by: "ผู้ดูแลระบบ",
        created_at: new Date().toISOString(),
      };
      importHistory.value.unshift(newImportRecord);

      showToast(
        `นำเข้าข้อมูลสำเร็จ! จำนวน ${response.data.imported_count || 0} รายการ`,
        "success"
      );
    } else {
      showToast(
        "เกิดข้อผิดพลาดในการนำเข้าข้อมูล: " +
          (response.message || "Unknown error"),
        "error"
      );
    }

    // Close modal and refresh data
    hideImportModal();
  } catch (error) {
    console.error("Import error:", error);
    showToast("เกิดข้อผิดพลาดในการนำเข้าข้อมูล: " + error.message, "error");
  } finally {
    importing.value = false;
  }
};

const mockImportProcess = () => {
  return new Promise((resolve) => {
    setTimeout(resolve, 2000); // Simulate import process
  });
};

// File reading and parsing functions
const readFileData = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target.result;
        resolve(data);
      } catch (error) {
        reject(new Error("ไม่สามารถอ่านไฟล์ได้"));
      }
    };

    reader.onerror = () => {
      reject(new Error("เกิดข้อผิดพลาดในการอ่านไฟล์"));
    };

    // Read files with proper encoding for Thai language
    if (
      file.type === "text/csv" ||
      file.name.endsWith(".csv") ||
      file.name.endsWith(".txt")
    ) {
      // For text files, use UTF-8 encoding
      reader.readAsText(file, "UTF-8");
    } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
      // For Excel files, we need to handle them as binary and use a library
      // For now, inform user to save as CSV/TXT with UTF-8 encoding
      reject(
        new Error(
          "ไฟล์ Excel ไม่รองรับการอ่านภาษาไทยโดยตรง กรุณาบันทึกเป็นไฟล์ CSV หรือ TXT ด้วย encoding UTF-8"
        )
      );
      return;
    } else {
      // Default to UTF-8 text reading
      reader.readAsText(file, "UTF-8");
    }
  });
};

const parseFileForPreview = async (file) => {
  try {
    const data = await readFileData(file);

    // Split by lines and remove empty lines
    const lines = data.split("\n").filter((line) => line.trim());

    if (lines.length < 2) {
      throw new Error("ไฟล์ต้องมีอย่างน้อย 2 บรรทัด (หัวตารางและข้อมูล)");
    }

    // Parse header and data
    const delimiter = lines[0].includes("\t") ? "\t" : ",";
    const headers = lines[0]
      .split(delimiter)
      .map((h) => h.trim().replace(/"/g, ""));
    const dataRows = lines.slice(1, 6).map((line) => {
      // Take first 5 rows for preview
      return line.split(delimiter).map((cell) => cell.trim().replace(/"/g, ""));
    });

    // Set available columns
    availableColumns.value = headers;

    // Initialize column mapping with best guesses
    const mapping = {};
    requiredFields.forEach((field) => {
      const matchingHeader = headers.find(
        (header) =>
          header.toLowerCase().includes(field.toLowerCase()) ||
          field.toLowerCase().includes(header.toLowerCase())
      );
      mapping[field] = matchingHeader || "";
    });
    columnMapping.value = mapping;

    // Set preview data
    previewData.value = {
      headers,
      rows: dataRows,
    };

    return true;
  } catch (error) {
    console.error("Error parsing file for preview:", error);
    throw error;
  }
};

const parseTempleData = (data) => {
  try {
    // Split by lines and remove empty lines
    const lines = data.split("\n").filter((line) => line.trim());

    if (lines.length < 2) {
      throw new Error("ไฟล์ต้องมีอย่างน้อย 2 บรรทัด (หัวตารางและข้อมูล)");
    }

    // Parse header and determine delimiter
    const delimiter = lines[0].includes("\t") ? "\t" : ",";
    const headers = lines[0]
      .split(delimiter)
      .map((h) => h.trim().replace(/"/g, ""));

    // Parse data rows using column mapping
    const parsedData = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i]
        .split(delimiter)
        .map((v) => v.trim().replace(/"/g, ""));

      if (values.length >= 3) {
        // At least some data
        const rowData = {};

        // Map values using column mapping
        requiredFields.forEach((field) => {
          const mappedColumn = columnMapping.value[field];
          if (mappedColumn) {
            const columnIndex = headers.indexOf(mappedColumn);
            if (columnIndex >= 0 && columnIndex < values.length) {
              rowData[field] = values[columnIndex];
            }
          }
        });

        // Validate required fields
        if (
          rowData.Name &&
          rowData.TAM_NAM_T &&
          rowData.AMP_NAM_T &&
          rowData.PROV_NAM_T
        ) {
          // Convert coordinates
          rowData.Latitude = parseFloat(rowData.Latitude) || 0;
          rowData.Longitude = parseFloat(rowData.Longitude) || 0;

          parsedData.push(rowData);
        }
      }
    }

    if (parsedData.length === 0) {
      throw new Error("ไม่พบข้อมูลที่ถูกต้องในไฟล์");
    }

    console.log("Parsed temple data:", parsedData);
    return parsedData;
  } catch (error) {
    console.error("Parse error:", error);
    throw new Error("ไม่สามารถแปลงข้อมูลได้: " + error.message);
  }
};

// Helper functions for location mapping
const getProvinceId = (provinceName) => {
  if (!provinceName) return null;
  const province = provinces.value.find((p) => p.name === provinceName);
  return province ? province.id : null;
};

const getDistrictId = (districtName) => {
  if (!districtName) return null;
  const district = districts.value.find((d) => d.name === districtName);
  return district ? district.id : null;
};

const getSubDistrictId = (subDistrictName) => {
  if (!subDistrictName) return null;
  const subDistrict = subDistricts.value.find(
    (sd) => sd.name === subDistrictName
  );
  return subDistrict ? subDistrict.id : null;
};

const clearSelectedFile = () => {
  selectedFile.value = null;
  showColumnMapping.value = false;
  previewData.value = [];
  columnMapping.value = {};
  availableColumns.value = [];
  if (fileInputRef.value) {
    fileInputRef.value.value = "";
  }
};

const getFieldLabel = (field) => {
  const labels = {
    Name: "ชื่อวัด",
    TAM_NAM_T: "ตำบล",
    AMP_NAM_T: "อำเภอ",
    PROV_NAM_T: "จังหวัด",
    Latitude: "ละติจูด",
    Longitude: "ลองจิจูด",
  };
  return labels[field] || field;
};

const downloadTemplate = async () => {
  try {
    // Call API to get temple template
    const response = await masterDataService.downloadTempleTemplate();

    if (response && response.success) {
      // Create blob from API response
      const blob = new Blob([response.data], {
        type: "text/csv;charset=utf-8;",
      });

      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "temples_template_utf8.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast("ดาวน์โหลดไฟล์ตัวอย่างสำเร็จ", "success");
    } else {
      throw new Error("Failed to download template from API");
    }
  } catch (error) {
    console.error("Template download error:", error);
    showToast("เกิดข้อผิดพลาดในการดาวน์โหลด: " + error.message, "error");
  }
};

// Temple management methods
const viewTemple = (templeId) => {
  showToast("ฟังก์ชันดูรายละเอียดวัดกำลังพัฒนา", "info");
};

const editTemple = (templeId) => {
  showToast("ฟังก์ชันแก้ไขข้อมูลวัดกำลังพัฒนา", "info");
};

const deleteTemple = async (templeId) => {
  if (confirm("คุณแน่ใจหรือไม่ที่จะลบข้อมูลวัดนี้?")) {
    try {
      // Try API delete first
      await masterDataService.deleteTemple(templeId);
      temples.value = temples.value.filter((temple) => temple.id !== templeId);
      showToast("ลบข้อมูลวัดสำเร็จ", "success");
    } catch (error) {
      console.warn("API delete failed, using local delete");
      temples.value = temples.value.filter((temple) => temple.id !== templeId);
      showToast("ลบข้อมูลวัดสำเร็จ (จำลอง)", "success");
    }
  }
};

const viewImportDetails = (historyId) => {
  showToast("ฟังก์ชันดูรายละเอียดการนำเข้าข้อมูลกำลังพัฒนา", "info");
};

// Utility methods
const formatDate = (dateString) => {
  return moment(dateString).format("DD/MM/YYYY HH:mm");
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const getStatusBadgeClass = (status) => {
  const classes = {
    completed: "bg-success",
    failed: "bg-danger",
    processing: "bg-warning text-dark",
  };
  return classes[status] || "bg-secondary";
};

const getStatusText = (status) => {
  const texts = {
    completed: "สำเร็จ",
    failed: "ล้มเหลว",
    processing: "กำลังดำเนินการ",
  };
  return texts[status] || status;
};

// Toast notification function
// User and Rank management functions
const getRankName = (rankId) => {
  const rank = policeRanks.value.find((r) => r.id === rankId);
  return rank ? rank.name : "ไม่ระบุ";
};

const getContrastColor = (hexColor) => {
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5 ? "#000000" : "#FFFFFF";
};

// User management functions
const showAddUserModal = () => {
  editingUser.value = null;
  resetUserForm();
  showUserModalState.value = true;
};

const hideUserModal = () => {
  showUserModalState.value = false;
  editingUser.value = null;
  resetUserForm();
};

const resetUserForm = () => {
  userForm.code = "";
  userForm.first_name = "";
  userForm.last_name = "";
  userForm.email = "";
  userForm.rank = "";
  userForm.position = "";
  userForm.department = "";
  userForm.phone = "";
  userForm.line_id = "";
  userForm.status = "pending";
};

const editUser = (user) => {
  editingUser.value = user;
  userForm.code = user.code;
  userForm.first_name = user.first_name;
  userForm.last_name = user.last_name;
  userForm.email = user.email;
  userForm.rank = user.rank || "";
  userForm.position = user.position || "";
  userForm.department = user.department;
  userForm.phone = user.phone || "";
  userForm.line_id = user.line_id || "";
  userForm.status = user.status;
  hideUserDetailModal();
  showUserModalState.value = true;
};

const viewUser = (user) => {
  selectedUser.value = user;
  showUserDetailModalState.value = true;
};

const hideUserDetailModal = () => {
  showUserDetailModalState.value = false;
  selectedUser.value = null;
};

const saveUser = async () => {
  try {
    const userData = {
      code: userForm.code,
      first_name: userForm.first_name,
      last_name: userForm.last_name,
      full_name: `${userForm.first_name} ${userForm.last_name}`,
      email: userForm.email,
      rank: userForm.rank,
      position: userForm.position,
      department: userForm.department,
      phone: userForm.phone,
      line_id: userForm.line_id,
      status: userForm.status,
    };

    if (editingUser.value) {
      // Update existing user
      const response = await masterDataService.updateUser(editingUser.value.id, userData);
      if (response.success) {
        const userIndex = users.value.findIndex(u => u.id === editingUser.value.id);
        if (userIndex !== -1) {
          users.value[userIndex] = { ...users.value[userIndex], ...userData };
        }
        showToast("อัปเดตผู้ใช้งานสำเร็จ", "success");
      } else {
        throw new Error(response.message || "อัปเดตผู้ใช้งานไม่สำเร็จ");
      }
    } else {
      // Create new user
      const response = await masterDataService.createUser(userData);
      if (response.success) {
        users.value.unshift({ ...userData, id: response.data.id, created_at: new Date().toISOString() });
        showToast("เพิ่มผู้ใช้งานสำเร็จ", "success");
      } else {
        throw new Error(response.message || "เพิ่มผู้ใช้งานไม่สำเร็จ");
      }
    }

    hideUserModal();
  } catch (error) {
    console.error("Save user error:", error);
    showToast("เกิดข้อผิดพลาด: " + error.message, "error");
  }
};

const approveUser = async (userId) => {
  try {
    const response = await masterDataService.updateUser(userId, { status: 'active' });
    if (response.success) {
      const userIndex = users.value.findIndex(u => u.id === userId);
      if (userIndex !== -1) {
        users.value[userIndex].status = 'active';
      }
      showToast("อนุมัติผู้ใช้งานสำเร็จ", "success");
    } else {
      throw new Error(response.message || "อนุมัติผู้ใช้งานไม่สำเร็จ");
    }
  } catch (error) {
    console.error("Approve user error:", error);
    showToast("เกิดข้อผิดพลาด: " + error.message, "error");
  }
};

const deleteUser = async (userId) => {
  if (confirm("คุณแน่ใจหรือไม่ที่จะลบผู้ใช้งานนี้?")) {
    try {
      const response = await masterDataService.deleteUser(userId);
      if (response.success) {
        users.value = users.value.filter(u => u.id !== userId);
        showToast("ลบผู้ใช้งานสำเร็จ", "success");
      } else {
        throw new Error(response.message || "ลบผู้ใช้งานไม่สำเร็จ");
      }
    } catch (error) {
      console.error("Delete user error:", error);
      showToast("เกิดข้อผิดพลาด: " + error.message, "error");
    }
  }
};

const getUserStatusBadgeClass = (status) => {
  switch (status) {
    case 'active':
      return 'bg-success';
    case 'inactive':
      return 'bg-secondary';
    case 'pending':
      return 'bg-warning';
    default:
      return 'bg-secondary';
  }
};

const getUserStatusText = (status) => {
  switch (status) {
    case 'active':
      return 'ใช้งาน';
    case 'inactive':
      return 'ไม่ใช้งาน';
    case 'pending':
      return 'รออนุมัติ';
    default:
      return 'ไม่ระบุ';
  }
};

const getRankBadgeClass = (rank) => {
  // Simple badge class based on rank text
  if (!rank) return 'bg-secondary';
  if (rank.includes('ผู้กำกับการ') || rank.includes('รอง ผบ.')) return 'bg-danger';
  if (rank.includes('สารวัตร')) return 'bg-primary';
  if (rank.includes('จ่า')) return 'bg-info';
  return 'bg-secondary';
};

const showUserImportModal = () => {
  showUserImportModalState.value = true;
};

const hideUserImportModal = () => {
  showUserImportModalState.value = false;
  selectedUserFile.value = null;
  if (userFileInputRef.value) {
    userFileInputRef.value.value = "";
  }
};

const triggerUserFileInput = () => {
  userFileInputRef.value.click();
};

const handleUserFileSelect = (event) => {
  const file = event.target.files[0];
  if (file && (file.name.endsWith(".csv") || file.name.endsWith(".txt"))) {
    selectedUserFile.value = file;
  } else {
    showToast("กรุณาเลือกไฟล์ CSV หรือ TXT เท่านั้น", "error");
  }
};

const downloadUserTemplate = async () => {
  try {
    // Call API to get user template
    const response = await masterDataService.downloadUserTemplate();

    if (response && response.success) {
      // Create blob from API response
      const blob = new Blob([response.data], {
        type: "text/csv;charset=utf-8;",
      });

      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "users_template_utf8.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast("ดาวน์โหลดไฟล์ตัวอย่างผู้ใช้งานสำเร็จ", "success");
    } else {
      throw new Error("Failed to download user template from API");
    }
  } catch (error) {
    console.error("User template download error:", error);
    showToast("เกิดข้อผิดพลาดในการดาวน์โหลด: " + error.message, "error");
  }
};

const importUserData = async () => {
  if (!selectedUserFile.value) {
    showToast("กรุณาเลือกไฟล์ก่อน", "warning");
    return;
  }

  try {
    // Prepare FormData for API call
    const formData = new FormData();
    formData.append("file", selectedUserFile.value);

    // Call API to import users
    const response = await masterDataService.importUsers(formData);

    if (response.success) {
      // Refresh users list from API
      await loadUsers();

      showToast(
        `นำเข้าผู้ใช้งานสำเร็จ! จำนวน ${
          response.data.imported_count || 0
        } รายการ`,
        "success"
      );
      hideUserImportModal();
    } else {
      showToast(
        "เกิดข้อผิดพลาดในการนำเข้าข้อมูล: " +
          (response.message || "Unknown error"),
        "error"
      );
    }
  } catch (error) {
    console.error("Import user error:", error);
    showToast(`เกิดข้อผิดพลาด: ${error.message}`, "error");
  }
};

const showRankModalFunc = (rank = null) => {
  editingRank.value = rank;

  if (rank) {
    // Edit mode
    rankForm.name = rank.name;
    rankForm.abbreviation = rank.abbreviation;
    rankForm.level = rank.level;
    rankForm.order = rank.order;
    rankForm.color = rank.color;
    rankForm.active = rank.active;
  } else {
    // Add mode
    rankForm.name = "";
    rankForm.abbreviation = "";
    rankForm.level = "";
    rankForm.order = policeRanks.value.length + 1;
    rankForm.color = "#073B4C";
    rankForm.active = true;
  }

  showRankModalState.value = true;
};

const hideRankModal = () => {
  showRankModalState.value = false;
  editingRank.value = null;
};

const saveRank = () => {
  if (
    !rankForm.name ||
    !rankForm.abbreviation ||
    !rankForm.level ||
    !rankForm.order
  ) {
    showToast("กรุณากรอกข้อมูลให้ครบถ้วน", "error");
    return;
  }

  if (editingRank.value) {
    // Edit existing rank
    const index = policeRanks.value.findIndex(
      (r) => r.id === editingRank.value.id
    );
    if (index >= 0) {
      policeRanks.value[index] = {
        ...editingRank.value,
        name: rankForm.name,
        abbreviation: rankForm.abbreviation,
        level: parseInt(rankForm.level),
        order: parseInt(rankForm.order),
        color: rankForm.color,
        active: rankForm.active,
      };
      showToast("แก้ไขยศสำเร็จ", "success");
    }
  } else {
    // Add new rank
    const newRank = {
      id: Math.max(...policeRanks.value.map((r) => r.id)) + 1,
      name: rankForm.name,
      abbreviation: rankForm.abbreviation,
      level: parseInt(rankForm.level),
      order: parseInt(rankForm.order),
      color: rankForm.color,
      active: rankForm.active,
    };
    policeRanks.value.push(newRank);

    // Sort by order
    policeRanks.value.sort((a, b) => a.order - b.order);

    showToast("เพิ่มยศใหม่สำเร็จ", "success");
  }

  hideRankModal();
};

const editRank = (rank) => {
  showRankModalFunc(rank);
};

const deleteRank = (rankId) => {
  // Check if rank is being used by any user
  const isInUse = users.value.some((u) => u.rank_id === rankId);

  if (isInUse) {
    showToast("ไม่สามารถลบยศที่มีผู้ใช้งานอยู่", "error");
    return;
  }

  if (confirm("คุณต้องการลบยศนี้หรือไม่?")) {
    policeRanks.value = policeRanks.value.filter((r) => r.id !== rankId);
    showToast("ลบยศสำเร็จ", "success");
  }
};

const showToast = (message, type = "info") => {
  const toast = document.createElement("div");
  toast.className = `toast align-items-center text-white bg-${
    type === "error" ? "danger" : type
  } border-0`;
  toast.setAttribute("role", "alert");
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">
        ${message}
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>
  `;

  const container = document.getElementById("toast-container");
  container.appendChild(toast);

  const bsToast = new bootstrap.Toast(toast);
  bsToast.show();

  toast.addEventListener("hidden.bs.toast", () => {
    container.removeChild(toast);
  });
};

// Lifecycle
onMounted(() => {
  loadData();
});
</script>

<style scoped>
.master-data {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem;
}

.master-data-header {
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  margin-bottom: 1.5rem;
}

.stat-card {
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.15s ease-in-out;
}

.stat-card:hover {
  box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--bs-secondary);
  font-weight: 500;
}

.master-data-content {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  overflow: hidden;
}

.nav-tabs {
  border-bottom: 1px solid var(--bs-border-color);
  padding: 0 1.5rem;
  margin-bottom: 0;
}

.nav-tabs .nav-link {
  border: none;
  border-bottom: 3px solid transparent;
  color: var(--bs-secondary);
  font-weight: 500;
  padding: 1rem 1.5rem;
}

.nav-tabs .nav-link:hover {
  border-color: transparent;
  background-color: rgba(var(--bs-primary-rgb), 0.1);
  color: var(--bs-primary);
}

.nav-tabs .nav-link.active {
  border-color: var(--bs-primary);
  background-color: transparent;
  color: var(--bs-primary);
}

.tab-content {
  padding: 1.5rem;
}

.table {
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.table th {
  font-weight: 600;
  border-bottom: 2px solid var(--bs-border-color);
  padding: 1rem 0.75rem;
  background-color: var(--bs-light);
}

.table td {
  padding: 1rem 0.75rem;
  vertical-align: middle;
}

.btn-group .btn {
  border-radius: 0;
}

.btn-group .btn:first-child {
  border-top-left-radius: 0.375rem;
  border-bottom-left-radius: 0.375rem;
}

.btn-group .btn:last-child {
  border-top-right-radius: 0.375rem;
  border-bottom-right-radius: 0.375rem;
}

.location-list {
  max-height: 400px;
  overflow-y: auto;
}

.location-item {
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(var(--bs-border-color-rgb), 0.5);
}

.location-item:last-child {
  border-bottom: none;
}

/* Upload Area Styles */
.upload-area {
  margin-bottom: 1rem;
}

.upload-zone {
  border: 2px dashed var(--bs-border-color);
  border-radius: 0.5rem;
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  background-color: var(--bs-light);
}

.upload-zone:hover,
.upload-zone.drag-over {
  border-color: var(--bs-primary);
  background-color: rgba(var(--bs-primary-rgb), 0.05);
}

.upload-content {
  color: var(--bs-secondary);
}

.upload-icon {
  font-size: 3rem;
  color: var(--bs-primary);
  margin-bottom: 1rem;
  display: block;
}

.selected-file {
  animation: slideIn 0.3s ease-out;
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

.import-options {
  border-top: 1px solid var(--bs-border-color);
  border-bottom: 1px solid var(--bs-border-color);
  padding: 1rem 0;
}

.template-section {
  background-color: rgba(var(--bs-info-rgb), 0.1);
  border-radius: 0.375rem;
  padding: 1rem;
}

/* Search and Filter Styles */
.input-group .form-control:focus {
  border-color: var(--bs-primary);
  box-shadow: 0 0 0 0.2rem rgba(var(--bs-primary-rgb), 0.25);
}

.input-group .input-group-text {
  background-color: rgba(var(--bs-primary-rgb), 0.1);
  border-color: var(--bs-border-color);
}

/* Pagination styling */
.pagination .page-link {
  border-color: var(--bs-border-color);
  color: var(--bs-primary);
}

.pagination .page-item.active .page-link {
  background-color: var(--bs-primary);
  border-color: var(--bs-primary);
}

.pagination .page-link:hover {
  background-color: rgba(var(--bs-primary-rgb), 0.1);
  border-color: var(--bs-primary);
}

/* Badge styling */
.badge {
  font-size: 0.75em;
  padding: 0.35em 0.65em;
}

/* Modal enhancements */
.modal.show {
  display: block !important;
}

.modal-backdrop {
  background-color: rgba(0, 0, 0, 0.5);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1040;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1050;
  overflow-x: hidden;
  overflow-y: auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-dialog {
  position: relative;
  width: auto;
  margin: 1.75rem;
  pointer-events: auto;
}

.modal-content {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  pointer-events: auto;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 0.3rem;
  box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.5);
  outline: 0;
}

.modal-header {
  background-color: var(--bs-light);
  border-bottom: 1px solid var(--bs-border-color);
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-footer {
  background-color: var(--bs-light);
  border-top: 1px solid var(--bs-border-color);
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .master-data {
    padding: 0.5rem;
  }

  .master-data-header,
  .tab-content {
    padding: 1rem;
  }

  .stat-card {
    padding: 1rem;
  }

  .stat-number {
    font-size: 1.5rem;
  }

  .stat-icon {
    width: 50px;
    height: 50px;
    font-size: 1.25rem;
  }

  .upload-zone {
    padding: 2rem 1rem;
  }

  .upload-content h6 {
    font-size: 1rem;
  }

  .nav-tabs .nav-link {
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
  }
}

@media (max-width: 575.98px) {
  .d-flex.gap-2 {
    flex-direction: column;
  }

  .d-flex.gap-2 .btn {
    width: 100%;
    margin-bottom: 0.5rem;
  }

  .d-flex.gap-2 .btn:last-child {
    margin-bottom: 0;
  }

  .stat-card {
    flex-direction: column;
    text-align: center;
  }

  .table-responsive {
    font-size: 0.875rem;
  }

  .btn-group {
    display: flex;
    flex-direction: column;
  }

  .btn-group .btn {
    border-radius: 0.375rem !important;
    margin-bottom: 0.25rem;
  }

  .btn-group .btn:last-child {
    margin-bottom: 0;
  }
}

/* Loading states */
.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

/* Animation for cards */
.stat-card,
.card {
  transition: all 0.15s ease-in-out;
}

.card:hover {
  box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.1);
}

/* Custom scrollbar for location lists */
.location-list::-webkit-scrollbar {
  width: 6px;
}

.location-list::-webkit-scrollbar-track {
  background: var(--bs-light);
  border-radius: 3px;
}

.location-list::-webkit-scrollbar-thumb {
  background: var(--bs-border-color);
  border-radius: 3px;
}

.location-list::-webkit-scrollbar-thumb:hover {
  background: var(--bs-secondary);
}

/* Focus states for accessibility */
.btn:focus,
.form-control:focus,
.form-select:focus,
.form-check-input:focus {
  outline: none;
}

/* Print styles */
@media print {
  .btn,
  .pagination,
  .nav-tabs {
    display: none !important;
  }

  .master-data-header,
  .master-data-content {
    box-shadow: none !important;
    border: 1px solid #000 !important;
  }

  .table {
    box-shadow: none !important;
  }
}

/* Toast container positioning */
#toast-container {
  z-index: 1055;
}

/* Enhanced file upload area */
.upload-zone.drag-over {
  border-color: var(--bs-success);
  background-color: rgba(var(--bs-success-rgb), 0.1);
}

.upload-zone.drag-over .upload-icon {
  color: var(--bs-success);
  animation: bounce 0.6s ease-in-out;
}

@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

/* Tab content animation */
.tab-pane {
  opacity: 0;
  transition: opacity 0.15s ease-in-out;
}

.tab-pane.show.active {
  opacity: 1;
}

/* Enhanced table styling */
.table > tbody > tr:hover > * {
  background-color: rgba(var(--bs-primary-rgb), 0.05);
}

/* Status badge animations */
.badge {
  transition: all 0.15s ease-in-out;
}

.badge:hover {
  transform: scale(1.05);
}
</style>
