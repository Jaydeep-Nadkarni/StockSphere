# ⚡ PHASE 5.1 - DUAL LOGIN QUICK REFERENCE

## 🚀 STARTUP COMMANDS

### Terminal 1: Backend
```bash
cd backend
npm start
# Backend runs on http://localhost:5000
```

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
```

---

## 🔗 QUICK LINKS

| Portal | URL | Email | Password |
|--------|-----|-------|----------|
| Admin | `http://localhost:5173/admin/login` | `admin@example.com` | `password123` |
| Manager | `http://localhost:5173/login` | `manager@example.com` | `password123` |
| Clerk | `http://localhost:5173/login` | `clerk@example.com` | `password123` |

---

## 📋 NEW FEATURES

✅ **Separate Admin Portal** - `/admin/login`
✅ **User Management** - Create/Edit/Delete users
✅ **Admin Dashboard** - View and manage users
✅ **User Search** - Search by name/email
✅ **Role Filter** - Filter users by role
✅ **Pagination** - 10 users per page

---

## 🎯 WHAT'S NEW IN PHASE 5.1

### Backend Changes
- Split login into `/api/auth/admin/login` and `/api/auth/login`
- Added complete user management API (`/api/users`)
- New user controller with full CRUD
- Role-based API protection

### Frontend Changes
- New AdminLogin page (`/admin/login`)
- New AdminDashboard page (`/admin/dashboard`)
- Updated Login page for users
- Role-based route protection
- Role-specific sidebar menus

---

## 🔐 QUICK TEST

```bash
# 1. Admin Login
curl -X POST http://localhost:5000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'

# 2. User Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"manager@example.com","password":"password123"}'

# 3. List Users (need JWT token from step 1)
curl http://localhost:5000/api/users \
  -H "Authorization: Bearer {JWT_TOKEN}"
```

---

## 🛠️ COMMON TASKS

### Create a User
1. Login as admin via `/admin/login`
2. Click "Create User" button
3. Fill form (name, email, password, role)
4. Click "Save"

### Edit a User
1. In admin dashboard
2. Find user in list
3. Click "Edit"
4. Update details
5. Click "Save Changes"

### Delete a User
1. In admin dashboard
2. Find user in list
3. Click "Delete"
4. Confirm deletion

### Search Users
1. Type name/email in search box
2. Results filter automatically

### Filter by Role
1. Select role from dropdown
2. List filters to show only that role

---

## 📊 ROLE QUICK VIEW

**Admin (🔐)**
- Login: `/admin/login`
- Can: Create/edit/delete users, full access

**Manager (👨‍💼)**
- Login: `/login`
- Can: Manage products, orders, suppliers, reports

**Clerk (👤)**
- Login: `/login`
- Can: View products, create orders, view customers

---

## 📁 NEW FILES

| File | Location | Purpose |
|------|----------|---------|
| `AdminLogin.jsx` | `frontend/src/pages/` | Admin login page |
| `AdminDashboard.jsx` | `frontend/src/pages/` | User management |
| `userController.js` | `backend/controllers/` | User CRUD logic |
| `userRoutes.js` | `backend/routes/` | User endpoints |

---

## 🔗 API ENDPOINTS

### Auth (Public)
```
POST /api/auth/admin/login    - Admin login
POST /api/auth/login          - User login
GET  /api/auth/me             - Get current user
```

### Users (Admin Only)
```
POST   /api/users             - Create user
GET    /api/users             - List users
GET    /api/users/:id         - Get user
PUT    /api/users/:id         - Update user
DELETE /api/users/:id         - Delete user
```

---

## 🆘 QUICK TROUBLESHOOTING

| Problem | Solution |
|---------|----------|
| Can't login | Check email/password, verify MongoDB running |
| Port in use | Kill process: `lsof -i :5000` → `kill -9 {PID}` |
| Can't create user | Verify logged in as admin, check email unique |
| Users not showing | Verify JWT token valid, check console |
| Button disabled | Check role permissions, verify authentication |

---

## 📚 DOCUMENTATION

- `DUAL_LOGIN_SYSTEM.md` - Complete technical docs
- `QUICK_START_DUAL_LOGIN.md` - Getting started guide
- `IMPLEMENTATION_CHECKLIST.md` - What was implemented
- `ARCHITECTURE_DIAGRAM.md` - System architecture
- `BEFORE_AFTER_COMPARISON.md` - What changed
- `PHASE_5_1_COMPLETION.md` - Phase overview

---

**Status: ✅ Production Ready**
**Version: 5.1**
**Last Updated: January 2025**
