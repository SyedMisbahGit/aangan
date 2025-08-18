# Moderation Components Documentation

## Overview
This document outlines the API contracts, interfaces, and component documentation for the moderation system, focusing on the `FlaggedContent` component and its related types.

## Table of Contents
1. [API Contracts](#api-contracts)
2. [Interfaces](#interfaces)
3. [Component Documentation](#component-documentation)
4. [Usage Examples](#usage-examples)
5. [Error Handling](#error-handling)

## API Contracts

### `getFlaggedContent`
Fetches a paginated list of flagged content items.

**Endpoint**: `GET /api/moderation/flagged-content`

**Query Parameters**:
- `status` (optional): Filter by status (`pending` | `resolved` | `rejected`)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response**:
```typescript
{
  data: FlaggedContent[];
  total: number;
  page: number;
  limit: number;
}
```

### `reviewFlaggedContent`
Submits a review decision for a flagged content item.

**Endpoint**: `POST /api/moderation/flagged-content/:id/review`

**Request Body**:
```typescript
{
  action: 'approve' | 'reject' | 'delete';
  note?: string;
}
```

**Response**:
```typescript
{
  success: boolean;
  message: string;
  data: FlaggedContent;
}
```

## Interfaces

### `FlaggedContent`
Represents a single flagged content item.

```typescript
interface FlaggedContent {
  id: string;                   // Unique identifier for the flag
  content_id: string;           // ID of the content being flagged
  content_type: string;         // Type of content (e.g., 'post', 'comment')
  reason: string;               // Reason for flagging
  status: FlagStatus;           // Current status of the flag
  created_at: string;           // ISO timestamp of when the flag was created
  updated_at: string;           // ISO timestamp of the last update
  content: {                    // The actual content that was flagged
    id: string;
    text?: string;              // Content text (if applicable)
    title?: string;             // Content title (if applicable)
    author?: {                  // Author information
      id: string;
      username: string;
    };
  };
}
```

### `FlaggedContentResponse`
Response structure for paginated flagged content.

```typescript
interface FlaggedContentResponse {
  data: FlaggedContent[];       // Array of flagged content items
  total: number;                // Total number of items available
  page: number;                 // Current page number
  limit: number;                // Number of items per page
}
```

### `TableParams`
Pagination and sorting parameters for the content table.

```typescript
interface TableParams {
  pagination?: TablePaginationConfig;  // Ant Design pagination config
  sortField?: string;                  // Field to sort by
  sortOrder?: string;                  // Sort direction ('ascend' | 'descend')
  filters?: Record<string, any>;       // Additional filters
}
```

## Component Documentation

### `FlaggedContent`
A React component that displays and manages flagged content for moderation.

#### Props
```typescript
interface FlaggedContentProps {
  status?: FlagStatus;  // Default: 'pending'
}
```

#### Features
- Paginated table view of flagged content
- Filtering by status
- Action buttons for moderation decisions
- Confirmation modals for actions
- Error handling with retry mechanism
- Loading states

#### State Management
- Uses React Query for data fetching and mutations
- Local state for UI controls (modals, forms, etc.)
- Error boundaries for graceful error handling

#### Example Usage
```tsx
import { FlaggedContent } from './components/moderation/FlaggedContent';

function ModerationDashboard() {
  return (
    <div className="moderation-dashboard">
      <h1>Content Moderation</h1>
      <FlaggedContent status="pending" />
    </div>
  );
}
```

## Usage Examples

### Basic Usage
```tsx
// Display pending flags
<FlaggedContent status="pending" />

// Display resolved flags
<FlaggedContent status="resolved" />
```

### With Custom Pagination
```tsx
const [tableParams, setTableParams] = useState<TableParams>({
  pagination: {
    current: 1,
    pageSize: 20,
  },
});

// Pass the pagination state to the component
<FlaggedContent 
  status="pending"
  onTableChange={setTableParams}
  initialPagination={tableParams.pagination}
/>
```

## Error Handling
The component implements the following error handling strategies:

1. **Loading States**: Shows a loading spinner while fetching data
2. **Error Boundaries**: Catches and displays React errors gracefully
3. **API Error Handling**: Displays user-friendly error messages for API failures
4. **Retry Mechanism**: Allows users to retry failed operations
5. **Form Validation**: Client-side validation for user inputs

### Error States
- **Loading**: Shows a spinner with "Loading..." text
- **Error**: Displays an error message with a retry button
- **Empty State**: Shows a message when no flagged content is found
- **Offline**: Handles network connectivity issues gracefully

## Best Practices

1. **Performance**
   - Use React.memo for performance optimization
   - Implement pagination for large datasets
   - Use useCallback for event handlers

2. **Security**
   - Validate all user inputs
   - Implement proper authentication/authorization
   - Sanitize content before display

3. **Accessibility**
   - Use semantic HTML
   - Add proper ARIA labels
   - Ensure keyboard navigation works

## Troubleshooting

### Common Issues
1. **Missing Data**
   - Check API response structure
   - Verify authentication status
   - Ensure proper error handling

2. **Performance Problems**
   - Check for unnecessary re-renders
   - Implement pagination if not already in place
   - Use React DevTools for profiling

3. **Styling Issues**
   - Check for CSS conflicts
   - Ensure proper theming is applied
   - Verify responsive behavior

## Related Components
- `ContentPreview`: Displays a preview of the flagged content
- `ModerationErrorBoundary`: Error boundary for moderation components
- `ActionDropdown`: Dropdown menu for moderation actions
