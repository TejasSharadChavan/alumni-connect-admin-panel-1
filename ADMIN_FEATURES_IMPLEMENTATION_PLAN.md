# Admin Features Implementation Plan

## 🎯 Overview

Comprehensive plan to implement full admin capabilities for campaigns, events, news/posts, and user management with proper database integration and role-based permissions.

---

## 📋 Current Status

### ✅ What Exists

- Admin layout and navigation
- Basic pages for campaigns, events, news, users
- **API Endpoints Completed:**
  - ✅ GET /api/admin/users - List all users with filters
  - ✅ GET /api/admin/users/[id] - Get user details
  - ✅ PUT /api/admin/users/[id] - Update user
  - ✅ DELETE /api/admin/users/[id] - Deactivate user
  - ✅ PUT /api/admin/posts/[id] - Edit post
  - ✅ DELETE /api/admin/posts/[id] - Delete post
  - ✅ GET /api/admin/events - List all events
  - ✅ POST /api/admin/events - Create event
  - ✅ PUT /api/admin/events/[id] - Edit event
  - ✅ DELETE /api/admin/events/[id] - Delete event
  - ✅ GET /api/admin/campaigns - List all campaigns
  - ✅ POST /api/admin/campaigns - Create campaign
  - ✅ PUT /api/admin/campaigns/[id] - Edit campaign
  - ✅ DELETE /api/admin/campaigns/[id] - Delete campaign
  - ✅ GET /api/admin/campaigns/[id]/donations - View donations
- Database schema with all required tables
- Admin middleware utility for permission checks
- Audit logging for all admin actions

### ⚠️ What's Remaining

- **UI Components:** Need dialogs for create/edit operations
- **Users Page:** Need edit user dialog component
- **Events Page:** Need create/edit event dialog component
- **Campaigns Page:** Need create/edit campaign dialog component
- **Posts Page:** Need edit post dialog component

---

## 🚀 Implementation Priority

### Phase 1: Critical Admin APIs (High Priority)

1. **Users Management API** - `/api/admin/users`
2. **Posts Management API** - `/api/admin/posts`
3. **Events Management API** - `/api/admin/events`
4. **Campaigns Management API** - `/api/admin/campaigns`

### Phase 2: Admin UI Components (High Priority)

1. User edit dialog with role/status management
2. Post edit/delete functionality
3. Event create/edit/delete forms
4. Campaign create/edit forms

### Phase 3: Permissions & Security (Critical)

1. Admin-only middleware
2. Role-based access control
3. Audit logging for admin actions
4. Data validation and sanitization

---

## 📊 Detailed Implementation

### 1. Users Management

#### API Endpoints Needed

**GET /api/admin/users**

```typescript
// Fetch all users with filters
Query params: role, status, search, limit, offset
Returns: { users: User[], total: number }
```

**PUT /api/admin/users/[id]**

```typescript
// Update user profile, role, or status
Body: { name?, email?, role?, status?, branch?, department? }
Permissions: Admin only
Audit: Log all changes
```

**DELETE /api/admin/users/[id]**

```typescript
// Soft delete or deactivate user
Permissions: Admin only
Audit: Log deletion
```

#### UI Features

- ✅ List all users with search/filter
- ❌ Edit user dialog (role, status, profile)
- ❌ Bulk actions (approve, reject, deactivate)
- ❌ User activity history
- ❌ Export users to CSV

#### Database Tables

- ✅ `users` table exists
- ✅ `activityLog` table exists for audit

---

### 2. Posts/News Management

#### API Endpoints Needed

**GET /api/admin/posts**

```typescript
// Fetch all posts (not just user's own)
Query params: status, category, author, search
Returns: { posts: Post[], total: number }
```

**PUT /api/admin/posts/[id]**

```typescript
// Edit any post content
Body: { content?, visibility?, status? }
Permissions: Admin only
Audit: Log changes
```

**DELETE /api/admin/posts/[id]**

```typescript
// Delete any post
Permissions: Admin only
Audit: Log deletion
Cascade: Delete comments, reactions
```

**POST /api/admin/posts/[id]/feature**

```typescript
// Feature/pin a post
Permissions: Admin only
```

#### UI Features

- ✅ List all posts
- ❌ Edit post dialog
- ❌ Delete confirmation
- ❌ Feature/pin posts
- ❌ Moderate comments
- ❌ View post analytics

#### Database Tables

- ✅ `posts` table exists
- ✅ `comments` table exists
- ✅ `postReactions` table exists

---

### 3. Events Management

#### API Endpoints Needed

**POST /api/admin/events**

```typescript
// Create event (admin auto-approved)
Body: { title, description, location, startDate, endDate, category, maxAttendees?, isPaid?, price? }
Returns: { event: Event }
```

**PUT /api/admin/events/[id]**

```typescript
// Edit any event
Body: { title?, description?, location?, startDate?, endDate?, status? }
Permissions: Admin only
```

**DELETE /api/admin/events/[id]**

```typescript
// Delete event
Permissions: Admin only
Cascade: Cancel RSVPs, notify attendees
```

**POST /api/admin/events/[id]/approve**

```typescript
// Approve pending event
Permissions: Admin only
```

**POST /api/admin/events/[id]/reject**

```typescript
// Reject pending event
Permissions: Admin only
Body: { reason: string }
```

#### UI Features

- ✅ List all events
- ❌ Create event form
- ❌ Edit event dialog
- ❌ Delete confirmation
- ❌ Approve/reject pending events
- ❌ View attendees list
- ❌ Export attendees

#### Database Tables

- ✅ `events` table exists
- ✅ `rsvps` table exists

---

### 4. Campaigns Management

#### API Endpoints Needed

**GET /api/admin/campaigns**

```typescript
// Fetch all campaigns
Query params: status, category, search
Returns: { campaigns: Campaign[], total: number }
```

**POST /api/admin/campaigns**

```typescript
// Create new campaign
Body: { title, description, category, goalAmount, startDate, endDate, imageUrl? }
Returns: { campaign: Campaign }
```

**PUT /api/admin/campaigns/[id]**

```typescript
// Edit campaign
Body: { title?, description?, goalAmount?, status? }
Permissions: Admin only
```

**DELETE /api/admin/campaigns/[id]**

```typescript
// Delete campaign
Permissions: Admin only
```

**GET /api/admin/campaigns/[id]/donations**

```typescript
// View campaign donations
Returns: { donations: Donation[], total: number }
```

#### UI Features

- ❌ List all campaigns (currently mock data)
- ❌ Create campaign form
- ❌ Edit campaign dialog
- ❌ Delete confirmation
- ❌ View donations list
- ❌ Campaign analytics

#### Database Tables

- ✅ `campaigns` table exists
- ✅ `donations` table exists

---

## 🔒 Security & Permissions

### Role-Based Access Control

```typescript
// Middleware for admin routes
export async function adminOnly(request: NextRequest) {
  const user = await getCurrentUser(request);

  if (!user || user.role !== "admin") {
    return NextResponse.json(
      { error: "Admin access required" },
      { status: 403 }
    );
  }

  return user;
}
```

### Audit Logging

```typescript
// Log all admin actions
await db.insert(activityLog).values({
  userId: admin.id,
  role: "admin",
  action: "update_user_role",
  metadata: JSON.stringify({
    targetUserId: userId,
    oldRole: "student",
    newRole: "alumni",
  }),
  timestamp: new Date().toISOString(),
});
```

### Data Validation

```typescript
// Validate all inputs
const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  role: z.enum(["student", "alumni", "faculty", "admin"]).optional(),
  status: z.enum(["pending", "approved", "rejected", "active"]).optional(),
});
```

---

## 📝 Database Schema Verification

### Users Table

```sql
✅ id, name, email, role, status, branch, cohort, department
✅ All fields exist and properly indexed
```

### Posts Table

```sql
✅ id, userId, content, visibility, status, createdAt
✅ Supports admin moderation
```

### Events Table

```sql
✅ id, organizerId, title, description, location, startDate, endDate
✅ status, category, maxAttendees, approvedBy, approvedAt
✅ Supports admin approval workflow
```

### Campaigns Table

```sql
✅ id, title, description, category, goalAmount, currentAmount
✅ status, startDate, endDate, createdAt
✅ Ready for admin management
```

---

## 🎯 Implementation Steps

### Step 1: Create Admin API Routes (2-3 hours)

1. **Create `/api/admin/users/route.ts`**
   - GET: List all users
   - Filters: role, status, search
   - Pagination support

2. **Create `/api/admin/users/[id]/route.ts`**
   - GET: Get user details
   - PUT: Update user
   - DELETE: Deactivate user

3. **Create `/api/admin/posts/[id]/route.ts`**
   - PUT: Edit post
   - DELETE: Delete post

4. **Create `/api/admin/events/route.ts`**
   - POST: Create event (auto-approved)

5. **Create `/api/admin/events/[id]/route.ts`**
   - PUT: Edit event
   - DELETE: Delete event

6. **Create `/api/admin/campaigns/route.ts`**
   - GET: List campaigns
   - POST: Create campaign

7. **Create `/api/admin/campaigns/[id]/route.ts`**
   - PUT: Edit campaign
   - DELETE: Delete campaign

### Step 2: Update Admin UI Pages (2-3 hours)

1. **Update `admin/users/page.tsx`**
   - Fetch real data from API
   - Add edit user dialog
   - Add role/status change buttons
   - Add search and filters

2. **Update `admin/news/page.tsx`**
   - Add edit post dialog
   - Add delete confirmation
   - Add feature/pin functionality

3. **Update `admin/events/page.tsx`**
   - Add create event button/form
   - Add edit event dialog
   - Add delete confirmation
   - Add approve/reject buttons

4. **Update `admin/campaigns/page.tsx`**
   - Replace mock data with API
   - Add create campaign form
   - Add edit campaign dialog
   - Add delete confirmation

### Step 3: Add Shared Components (1 hour)

1. **Create `components/admin/EditUserDialog.tsx`**
2. **Create `components/admin/EditPostDialog.tsx`**
3. **Create `components/admin/CreateEventDialog.tsx`**
4. **Create `components/admin/CreateCampaignDialog.tsx`**
5. **Create `components/admin/DeleteConfirmDialog.tsx`**

### Step 4: Add Permissions & Security (1 hour)

1. **Create `lib/admin-middleware.ts`**
2. **Add admin checks to all routes**
3. **Add audit logging**
4. **Add input validation**

### Step 5: Testing (1 hour)

1. Test all CRUD operations
2. Test permissions
3. Test data validation
4. Test audit logging

---

## 🎨 UI Components Needed

### EditUserDialog

```typescript
interface EditUserDialogProps {
  user: User;
  open: boolean;
  onClose: () => void;
  onSave: (updates: Partial<User>) => Promise<void>;
}

// Fields: name, email, role, status, branch, department
// Validation: email format, role enum, status enum
// Actions: Save, Cancel
```

### EditPostDialog

```typescript
interface EditPostDialogProps {
  post: Post;
  open: boolean;
  onClose: () => void;
  onSave: (updates: Partial<Post>) => Promise<void>;
}

// Fields: content, visibility, status
// Actions: Save, Cancel, Delete
```

### CreateEventForm

```typescript
interface CreateEventFormProps {
  onSubmit: (event: NewEvent) => Promise<void>;
  onCancel: () => void;
}

// Fields: title, description, location, startDate, endDate
//         category, maxAttendees, isPaid, price, imageUrl
// Validation: dates, capacity, price format
// Actions: Create, Cancel
```

### CreateCampaignForm

```typescript
interface CreateCampaignFormProps {
  onSubmit: (campaign: NewCampaign) => Promise<void>;
  onCancel: () => void;
}

// Fields: title, description, category, goalAmount
//         startDate, endDate, imageUrl
// Validation: dates, amount format
// Actions: Create, Cancel
```

---

## 📊 Expected Outcomes

### For Admins

✅ **Full Control** - Create, edit, delete all content
✅ **User Management** - Change roles, approve/reject users
✅ **Content Moderation** - Edit/delete inappropriate posts
✅ **Event Management** - Create events, approve submissions
✅ **Campaign Management** - Launch and manage fundraising

### For Users

✅ **Better Experience** - Admins can fix issues quickly
✅ **Quality Content** - Moderated posts and events
✅ **Trust** - Professional campaigns and events
✅ **Support** - Admins can help with account issues

### For Platform

✅ **Data Integrity** - All changes logged and audited
✅ **Security** - Role-based access control
✅ **Scalability** - Efficient database queries
✅ **Compliance** - Audit trail for all admin actions

---

## 🔍 Testing Checklist

### Users Management

- [ ] Admin can view all users
- [ ] Admin can search/filter users
- [ ] Admin can edit user profile
- [ ] Admin can change user role
- [ ] Admin can change user status
- [ ] Admin cannot delete themselves
- [ ] All changes are logged

### Posts Management

- [ ] Admin can view all posts
- [ ] Admin can edit any post
- [ ] Admin can delete any post
- [ ] Admin can feature posts
- [ ] Deleting post removes comments/reactions
- [ ] All changes are logged

### Events Management

- [ ] Admin can create events (auto-approved)
- [ ] Admin can edit any event
- [ ] Admin can delete events
- [ ] Admin can approve/reject pending events
- [ ] Deleting event cancels RSVPs
- [ ] Attendees are notified of changes

### Campaigns Management

- [ ] Admin can create campaigns
- [ ] Admin can edit campaigns
- [ ] Admin can delete campaigns
- [ ] Admin can view donations
- [ ] Campaign progress updates correctly
- [ ] All changes are logged

---

## 📈 Success Metrics

### Performance

- API response time < 500ms
- Page load time < 2 seconds
- No N+1 query problems

### Usability

- Admin can complete tasks in < 3 clicks
- Clear error messages
- Confirmation for destructive actions

### Security

- 100% of admin actions logged
- No unauthorized access
- Input validation on all fields

---

## 🚀 Quick Start Implementation

Due to the scope, I recommend implementing in this order:

### Week 1: Users Management (Most Critical)

1. Create admin users API
2. Update users page with real data
3. Add edit user functionality
4. Add role/status management

### Week 2: Content Management

1. Add post edit/delete APIs
2. Update news page with edit/delete
3. Add event create/edit APIs
4. Update events page with CRUD

### Week 3: Campaigns & Polish

1. Create campaigns APIs
2. Update campaigns page
3. Add audit logging
4. Testing and bug fixes

---

## 📝 Notes

- All APIs should check for admin role
- All changes should be logged to activityLog
- All destructive actions need confirmation
- All forms need validation
- All errors need user-friendly messages
- All success actions need toast notifications

---

**Status:** 📋 Planning Complete - Ready for Implementation

**Estimated Time:** 8-10 hours for full implementation

**Priority:** High - Critical for platform management

**Next Step:** Begin with Users Management API and UI
