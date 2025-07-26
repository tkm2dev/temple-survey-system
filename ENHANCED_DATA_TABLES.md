# Enhanced Data Tables with Pagination and Bulk Operations

## Overview

This document provides comprehensive information about the enhanced data table system that includes advanced pagination and bulk selection functionality across all table/grid features in the application.

## Features

### ✅ Core Features Implemented

1. **Advanced Pagination**

   - Configurable items per page (10, 25, 50, 100)
   - Jump to specific page functionality
   - First, Previous, Next, Last navigation
   - Page range display with ellipsis
   - Responsive design for mobile devices

2. **Bulk Selection System**

   - Select all/none functionality
   - Individual item selection
   - Multi-select with checkboxes
   - Selection counter display
   - Customizable bulk actions

3. **Enhanced Data Tables**

   - Loading states with skeleton UI
   - Empty states with custom messages
   - Sortable columns
   - Responsive design
   - Search and filtering
   - Export functionality

4. **Bulk Operations**
   - Status updates (Active/Inactive)
   - Approval changes (Approved/Pending)
   - Bulk delete operations
   - Confirmation modals
   - Progress feedback

## Component Architecture

### Core Components

#### 1. DataTablePagination.vue

```vue
<!-- Reusable pagination component -->
<DataTablePagination
  :currentPage="currentPage"
  :totalPages="totalPages"
  :itemsPerPage="itemsPerPage"
  :totalItems="totalItems"
  @update:currentPage="currentPage = $event"
  @update:itemsPerPage="itemsPerPage = $event"
/>
```

**Props:**

- `currentPage`: Current active page number
- `totalPages`: Total number of pages
- `itemsPerPage`: Number of items per page
- `totalItems`: Total number of items
- `showJumpToPage`: Enable/disable jump to page feature

**Events:**

- `update:currentPage`: Emitted when page changes
- `update:itemsPerPage`: Emitted when items per page changes

#### 2. BulkSelectionToolbar.vue

```vue
<!-- Reusable bulk selection toolbar -->
<BulkSelectionToolbar
  :selectedItems="selectedItems"
  @clear-selection="selectedItems = []"
>
  <template #actions="{ selectedItems, clearSelection }">
    <!-- Custom bulk actions -->
    <button @click="bulkAction(selectedItems, clearSelection)">
      Action
    </button>
  </template>
</BulkSelectionToolbar>
```

**Props:**

- `selectedItems`: Array of selected item IDs
- `showClearButton`: Show/hide clear selection button

**Events:**

- `clear-selection`: Emitted when clear selection is clicked

**Slots:**

- `actions`: Custom bulk action buttons

#### 3. EnhancedDataTable.vue

```vue
<!-- Comprehensive data table component -->
<EnhancedDataTable
  :data="tableData"
  :columns="tableColumns"
  :loading="loading"
  :totalItems="totalItems"
  :currentPage="currentPage"
  :itemsPerPage="itemsPerPage"
  :selectedItems="selectedItems"
  @update:currentPage="currentPage = $event"
  @update:itemsPerPage="itemsPerPage = $event"
  @update:selectedItems="selectedItems = $event"
  @refresh="refreshData"
/>
```

**Props:**

- `data`: Array of table data
- `columns`: Table column definitions
- `loading`: Loading state
- `totalItems`: Total number of items
- `currentPage`: Current page number
- `itemsPerPage`: Items per page
- `selectedItems`: Selected item IDs
- `showBulkActions`: Enable/disable bulk actions
- `emptyMessage`: Custom empty state message
- `emptyIcon`: Custom empty state icon

**Events:**

- `update:currentPage`: Page change event
- `update:itemsPerPage`: Items per page change event
- `update:selectedItems`: Selection change event
- `refresh`: Refresh data event

**Slots:**

- `bulkActions`: Custom bulk action buttons
- `tableContent`: Custom table content
- `emptyState`: Custom empty state content

## Enhanced Views

### 1. UserListEnhanced.vue

- Complete user management interface
- Role and status management
- Bulk approval changes
- User avatar handling
- Advanced filtering

### 2. SurveyListEnhanced.vue

- Survey management with status workflow
- Type-based filtering
- Bulk status updates
- Survey statistics
- Responsive card layout

### 3. MasterDataListEnhanced.vue

- Master data configuration management
- Category-based organization
- JSON value validation
- Data type handling
- Export functionality

### 4. AuditLogsEnhanced.vue

- Comprehensive audit trail
- Advanced filtering options
- Activity monitoring
- Export capabilities
- User activity tracking

## Backend API Endpoints

### Bulk Operations

#### Users

```javascript
// Bulk status update
PATCH /api/users/bulk/status
{
  "userIds": [1, 2, 3],
  "status": "active"
}

// Bulk approval change
PATCH /api/users/bulk/approval
{
  "userIds": [1, 2, 3],
  "approved": true
}

// Bulk delete
DELETE /api/users/bulk
{
  "userIds": [1, 2, 3]
}
```

#### Surveys

```javascript
// Bulk status update
PATCH /api/surveys/bulk/status
{
  "surveyIds": [1, 2, 3],
  "status": "active"
}

// Bulk delete
DELETE /api/surveys/bulk
{
  "surveyIds": [1, 2, 3]
}
```

#### Master Data

```javascript
// Bulk status update
PATCH /api/master-data/bulk/status
{
  "masterDataIds": [1, 2, 3],
  "status": "active"
}

// Bulk delete
DELETE /api/master-data/bulk
{
  "masterDataIds": [1, 2, 3]
}
```

### Pagination Parameters

All list endpoints support these parameters:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search term
- `sort`: Sort field
- `order`: Sort order (ASC/DESC)

## Usage Examples

### Basic Data Table

```vue
<template>
  <EnhancedDataTable
    :data="users"
    :columns="userColumns"
    :loading="loading"
    :totalItems="totalUsers"
    :currentPage="currentPage"
    :itemsPerPage="itemsPerPage"
    :selectedItems="selectedUsers"
    @update:currentPage="currentPage = $event"
    @update:itemsPerPage="itemsPerPage = $event"
    @update:selectedItems="selectedUsers = $event"
    @refresh="loadUsers"
  >
    <!-- Custom bulk actions -->
    <template #bulkActions="{ selectedItems, clearSelection }">
      <button
        class="btn btn-sm btn-success"
        @click="activateUsers(selectedItems, clearSelection)"
        :disabled="selectedItems.length === 0"
      >
        Activate ({{ selectedItems.length }})
      </button>
    </template>
  </EnhancedDataTable>
</template>

<script>
export default {
  data() {
    return {
      users: [],
      loading: false,
      totalUsers: 0,
      currentPage: 1,
      itemsPerPage: 10,
      selectedUsers: [],
      userColumns: [
        { key: "name", label: "Name", sortable: true },
        { key: "email", label: "Email", sortable: true },
        { key: "status", label: "Status", sortable: true },
      ],
    };
  },
  methods: {
    async loadUsers() {
      // Load users with pagination
    },
    async activateUsers(userIds, clearSelection) {
      // Bulk activate users
      await userService.bulkUpdateStatus(userIds, "active");
      clearSelection();
      this.loadUsers();
    },
  },
};
</script>
```

### Advanced Filtering

```vue
<template>
  <div>
    <!-- Filters -->
    <div class="filters mb-3">
      <input
        v-model="searchTerm"
        @input="debouncedSearch"
        placeholder="Search..."
      />
      <select v-model="statusFilter" @change="applyFilters">
        <option value="">All Status</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
    </div>

    <!-- Data Table -->
    <EnhancedDataTable
      :data="filteredData"
      :columns="columns"
      :loading="loading"
      :totalItems="totalItems"
      :currentPage="currentPage"
      :itemsPerPage="itemsPerPage"
      :selectedItems="selectedItems"
      @update:currentPage="handlePageChange"
      @update:itemsPerPage="handleItemsPerPageChange"
      @update:selectedItems="selectedItems = $event"
      @refresh="refreshData"
    />
  </div>
</template>
```

## Styling and Theming

### CSS Classes

```scss
// Table styling
.enhanced-data-table {
  .table-active {
    background-color: var(--bs-primary-bg-subtle);
  }

  .pagination-controls {
    display: flex;
    justify-content: between;
    align-items: center;
  }

  .bulk-actions {
    background-color: var(--bs-light);
    padding: 0.75rem;
    border-bottom: 1px solid var(--bs-border-color);
  }
}

// Responsive design
@media (max-width: 768px) {
  .enhanced-data-table {
    .pagination-controls {
      flex-direction: column;
      gap: 0.5rem;
    }

    .bulk-actions {
      flex-direction: column;
    }
  }
}
```

## Best Practices

### 1. Performance Optimization

- Use server-side pagination for large datasets
- Implement debounced search
- Lazy load data when possible
- Use virtual scrolling for very large tables

### 2. User Experience

- Provide clear feedback for bulk operations
- Use confirmation modals for destructive actions
- Show loading states during operations
- Implement optimistic updates where appropriate

### 3. Accessibility

- Use proper ARIA labels
- Ensure keyboard navigation
- Provide screen reader support
- Use semantic HTML elements

### 4. Error Handling

- Implement retry mechanisms
- Show user-friendly error messages
- Log errors for debugging
- Provide fallback states

## Migration Guide

### From Basic Tables to Enhanced Tables

1. **Replace existing table components:**

```vue
<!-- Before -->
<table class="table">
  <thead>
    <tr>
      <th>Name</th>
      <th>Email</th>
    </tr>
  </thead>
  <tbody>
    <tr v-for="user in users" :key="user.id">
      <td>{{ user.name }}</td>
      <td>{{ user.email }}</td>
    </tr>
  </tbody>
</table>

<!-- After -->
<EnhancedDataTable
  :data="users"
  :columns="userColumns"
  :loading="loading"
  :totalItems="totalUsers"
  :currentPage="currentPage"
  :itemsPerPage="itemsPerPage"
  :selectedItems="selectedUsers"
  @update:currentPage="currentPage = $event"
  @update:itemsPerPage="itemsPerPage = $event"
  @update:selectedItems="selectedUsers = $event"
/>
```

2. **Add bulk operation methods:**

```javascript
// Add to your component methods
async bulkUpdateStatus(itemIds, status, clearSelection) {
  try {
    await this.service.bulkUpdateStatus(itemIds, status);
    this.showToast('Status updated successfully', 'success');
    clearSelection();
    this.refreshData();
  } catch (error) {
    this.showToast('Failed to update status', 'error');
  }
}
```

3. **Update API endpoints:**

- Add bulk operation routes
- Implement pagination parameters
- Add proper error handling
- Include audit logging

## Troubleshooting

### Common Issues

1. **Pagination not working:**

   - Check if `totalItems` is correctly set
   - Verify API returns correct `total` count
   - Ensure page change events are handled

2. **Bulk operations failing:**

   - Verify selected items array format
   - Check API endpoint exists
   - Validate permissions
   - Review error logs

3. **Performance issues:**

   - Implement server-side pagination
   - Add debouncing to search
   - Use virtual scrolling for large datasets
   - Optimize database queries

4. **Responsive design problems:**
   - Test on different screen sizes
   - Check CSS media queries
   - Verify table overflow handling
   - Test touch interactions

## Contributing

When adding new enhanced tables:

1. Use the `EnhancedDataTable` component
2. Implement proper bulk operations
3. Add comprehensive error handling
4. Include loading and empty states
5. Test responsive design
6. Add audit logging
7. Update documentation

## Support

For technical support or questions about the enhanced data table system:

- Review this documentation
- Check the component source code
- Test with the provided examples
- Report issues with detailed reproduction steps

---

**Last Updated:** December 2024
**Version:** 1.0.0
**Compatibility:** Vue 3.x, Bootstrap 5.x
