# Wholesale Inventory Backend API

## Project Overview

Backend API for Wholesale Inventory and Sales Management System. This is a RESTful API built with Node.js, Express, and MongoDB, implementing JWT-based authentication with role-based access control (RBAC).

**Technology Stack:**
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens)
- **Password Security:** bcryptjs for secure hashing
- **Real-time:** Socket.IO (for future phases)
- **Environment Management:** dotenv

**Architecture:** RESTful API following MVC (Model-View-Controller) pattern with clear separation of concerns.

---

## Prerequisites

Before running the backend, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **MongoDB** (local installation or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account for cloud database)

To verify installations, run:
```bash
node --version
npm --version
```

---

## Installation

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Install Dependencies
```bash
npm install
```

This will install all required packages listed in `package.json`.

### 3. Configure Environment Variables

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Database
MONGO_URI=mongodb://localhost:27017/wholesale_inventory

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_min_32_chars
JWT_EXPIRE=30d

# Server
PORT=5000
NODE_ENV=development

# CORS
CLIENT_URL=http://localhost:5173
```

### 4. Ensure MongoDB is Running

**Local MongoDB:**
```bash
# On Windows (if installed as service, it should already be running)
# Or manually start it:
mongod
```

**MongoDB Atlas (Cloud):**
- Get your connection string from MongoDB Atlas dashboard
- Replace `MONGO_URI` in `.env` with your Atlas connection string

---

## Running the Server

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000` (or your configured PORT).

You should see:
```
✓ MongoDB Connected: localhost

🚀 Server running on port 5000
📡 Environment: development
```

---

## API Endpoints - Authentication (Phase 1)

### 1. User Login (Public)

**Endpoint:** `POST /api/auth/login`

**Description:** Authenticate user with email and password, receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "user@example.com",
      "role": "manager"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

---

### 2. Register New User (Admin Only)

**Endpoint:** `POST /api/auth/register`

**Description:** Create a new user account. Only admins can register new users.

**Authentication:** Required (Bearer token)
**Authorization:** Admin role only

**Request Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "securePassword123",
  "role": "manager"
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439012",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "manager"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
- `400 Bad Request` - Missing required fields or user already exists
- `401 Unauthorized` - Invalid or missing token
- `403 Forbidden` - User is not an admin

---

### 3. Get Current User Profile (Protected)

**Endpoint:** `GET /api/auth/me`

**Description:** Retrieve the profile of the currently authenticated user.

**Authentication:** Required (Bearer token)

**Request Headers:**
```
Authorization: Bearer <jwt_token>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "user@example.com",
      "role": "manager",
      "createdAt": "2024-11-15T10:30:00.000Z"
    }
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or expired token
- `404 Not Found` - User no longer exists

---

## User Roles & Permissions

The system implements three-tier role-based access control:

| Role | Permissions | Notes |
|------|-------------|-------|
| **admin** | • Create users<br/>• Full system access<br/>• Manage all features | Super administrator with complete system control |
| **manager** | • Manage products<br/>• Manage orders<br/>• Manage customers/suppliers<br/>• View reports | Sales manager/operations manager role |
| **clerk** | • Create orders<br/>• View orders | Junior staff with limited access |

---

## Authentication Flow

### Login & Token Generation

```
1. User sends credentials (email, password)
2. Server validates credentials against database
3. Server generates JWT token containing user ID
4. Token is returned to client
5. Client stores token in localStorage
```

### Accessing Protected Routes

```
1. Client makes request to protected endpoint
2. Client includes token in Authorization header: "Bearer <token>"
3. Server extracts and verifies token signature
4. Server decodes token to get user ID
5. Server fetches user from database
6. User object is attached to request
7. Route handler processes request with user context
```

### Token Expiration

- Default expiration: 30 days (configurable via `JWT_EXPIRE`)
- Expired tokens return `401 Unauthorized`
- Client should prompt user to login again

---

## Project Structure

```
backend/
│
├── config/                  # Configuration modules
│   └── db.js               # MongoDB connection setup
│
├── models/                  # Mongoose schemas
│   └── User.js             # User model with auth methods
│
├── controllers/             # Business logic
│   └── authController.js   # Auth route handlers
│
├── routes/                  # API route definitions
│   └── authRoutes.js       # Auth endpoints
│
├── middleware/              # Custom middleware
│   ├── authMiddleware.js   # JWT verification
│   └── roleMiddleware.js   # Role-based access control
│
├── utils/                   # Utility functions
│   └── generateToken.js    # JWT token generation
│
├── server.js               # Express app entry point
├── package.json            # Dependencies & scripts
├── .env.example            # Environment variable template
├── .gitignore              # Git ignore rules
└── README.md               # This file
```

---

## Security Features

### Password Security
- Passwords are hashed using bcryptjs with 10 salt rounds
- Plain text passwords are never stored in database
- Pre-save middleware automatically hashes passwords before storing

### JWT Authentication
- Tokens are signed with a strong secret key
- Token payload contains only user ID (minimal data)
- Tokens include expiration time
- Invalid/expired tokens are rejected with 401 Unauthorized

### Role-Based Access Control
- Routes are protected by role middleware
- Users can only access endpoints permitted for their role
- 403 Forbidden returned when user role lacks permission

### Protected Fields
- Password hash is excluded from all JSON responses
- Password field uses `select: false` to prevent accidental exposure
- Only returned when explicitly selected (e.g., during login)

### Input Validation
- Email format validation using regex
- Password minimum length requirement (6 characters)
- Required field validation on all endpoints
- Type checking with Mongoose schema

### CORS Configuration
- Origins restricted to configured CLIENT_URL
- Credentials allowed for authentication headers
- Specific HTTP methods whitelisted

---

## Error Handling

### Consistent Error Response Format

All errors follow this format:
```json
{
  "success": false,
  "message": "Descriptive error message"
}
```

### HTTP Status Codes

| Code | Meaning | Common Cause |
|------|---------|--------------|
| `200` | OK | Successful GET/POST/PUT/DELETE |
| `201` | Created | Resource successfully created |
| `400` | Bad Request | Missing/invalid input fields |
| `401` | Unauthorized | Missing/invalid JWT token |
| `403` | Forbidden | User role lacks permission |
| `404` | Not Found | Resource or route not found |
| `500` | Server Error | Unhandled exception |

### Error Examples

**Missing Fields (400):**
```json
{
  "success": false,
  "message": "Please provide all required fields: name, email, password, role"
}
```

**Invalid Credentials (401):**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

**Insufficient Permissions (403):**
```json
{
  "success": false,
  "message": "User role 'clerk' is not authorized to access this route"
}
```

---

## Testing the API

### Using Postman

1. **Import Collections:**
   - Create new requests in Postman
   - Use the endpoint examples above

2. **Login & Get Token:**
   - POST to `/api/auth/login`
   - Save the returned token

3. **Set Authorization Header:**
   - Go to "Authorization" tab
   - Type: "Bearer Token"
   - Token: Paste the token from login response

4. **Test Protected Routes:**
   - Use the token to access `/api/auth/me`
   - Create new user with `/api/auth/register` (as admin)

### Using cURL

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

**Get Current User (replace TOKEN with actual token):**
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer TOKEN"
```

### Using Thunder Client or REST Client

Simply configure the base URL: `http://localhost:5000` and test endpoints.

---

## Development Guidelines

### Code Style

- Use consistent indentation (2 spaces)
- Use async/await for asynchronous operations
- Implement proper error handling with try-catch blocks
- Use meaningful, descriptive variable names
- Add comments for complex business logic

### MVC Pattern

- **Models:** Define data schemas and validation
- **Views:** JSON responses (REST API - no templates)
- **Controllers:** Handle business logic and API responses
- **Routes:** Map HTTP methods to controller functions

### Middleware Organization

- Authentication middleware should run before authorization
- Validation middleware should run early
- Error handling middleware should be last

### Database Operations

- Always handle connection errors
- Use async/await for queries
- Implement proper error responses
- Validate data before saving

### API Response Format

**Success:**
```javascript
{
  success: true,
  data: { /* response data */ },
  token?: "jwt_token" // only for auth endpoints
}
```

**Error:**
```javascript
{
  success: false,
  message: "Error description"
}
```

---

## Troubleshooting

### Common Issues & Solutions

#### 1. MongoDB Connection Error
**Error:** `Error connecting to MongoDB: connect ECONNREFUSED`

**Solutions:**
- Ensure MongoDB is running locally: `mongod`
- Or verify MongoDB Atlas connection string in `.env`
- Check firewall isn't blocking port 27017

#### 2. JWT Token Expiration
**Error:** `Not authorized, token failed`

**Solutions:**
- User needs to login again to get fresh token
- Increase `JWT_EXPIRE` in `.env` if needed
- Check system clock is synchronized

#### 3. CORS Errors
**Error:** `Access to XMLHttpRequest blocked by CORS policy`

**Solutions:**
- Verify `CLIENT_URL` in `.env` matches frontend URL
- Ensure frontend includes correct headers
- Check CORS middleware configuration in `server.js`

#### 4. Port Already in Use
**Error:** `Error: listen EADDRINUSE: address already in use :::5000`

**Solutions:**
- Change PORT in `.env` to different number
- Or kill process on port 5000:
  ```bash
  # Windows
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F
  ```

#### 5. MongoDB Validation Errors
**Error:** `User validation failed: email: Error`

**Solutions:**
- Verify email format is valid
- Check password length is at least 6 characters
- Ensure all required fields are provided

---

## Future Phases

This is **Phase 1** of an 8-phase project. Upcoming features include:

- **Phase 2:** Product Management
- **Phase 3:** Order Processing
- **Phase 4:** Customer Management
- **Phase 5:** Supplier Management
- **Phase 6:** Reporting & Analytics
- **Phase 7:** Real-time Notifications (Socket.IO)
- **Phase 8:** Advanced Features & Optimization

Each phase builds on the authentication foundation established in Phase 1.

---

## Contributing

### Code Style
- Follow consistent formatting
- Use descriptive names for variables and functions
- Keep functions focused and single-purpose

### Commit Messages
- Format: `[Feature/Fix/Refactor] Description`
- Example: `[Feature] Add user registration endpoint`

### Branch Naming
- Feature: `feature/description`
- Fix: `fix/description`
- Refactor: `refactor/description`

---

## License

ISC

---

## Support

For issues or questions:
1. Check this README and Troubleshooting section
2. Review error logs in console output
3. Verify environment configuration in `.env`
4. Check MongoDB connection and data

---

**Last Updated:** November 15, 2024
**Version:** 1.0.0
