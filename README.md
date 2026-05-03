# Million Checkboxes - Backend

A real-time collaborative checkbox application with authentication, email verification, and WebSocket synchronization. Users can toggle checkboxes that are shared across all connected clients with a cooldown mechanism.

## 🎯 Features

- **User Authentication** - Register, login, and JWT-based access control
- **Google OAuth Login** - Seamless Google authentication (works on ports 3000, 5000, 8000, 9000)
- **Email Verification** - Mailtrap integration for email confirmation before account activation
- **Real-time Sync** - WebSocket-powered checkbox synchronization across all users
- **Rate Limiting** - 5-second cooldown between checkbox toggles per user
- **Redis Caching** - Fast state management using Valkey (Redis)
- **MongoDB Storage** - Persistent user and data storage
- **JWT Tokens** - Secure access and refresh token system

## 📋 Prerequisites

Before you begin, ensure you have installed:
- **Node.js** (v18 or higher)
- **npm** (comes with Node.js)
- **Docker** & **Docker Compose** (for running Redis/Valkey)
- **MongoDB** (local or cloud - MongoDB Atlas)
- **Google OAuth Credentials** (for Google login)
- **Mailtrap Account** (for email verification)

## 🚀 Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd skull-coder-1_miilion_checkbox
```

### 2. Install Dependencies

```bash
npm install
```

This installs all required packages:
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `socket.io` - Real-time communication
- `ioredis` - Redis client
- `jsonwebtoken` - JWT authentication
- `bcrypt` - Password hashing
- `nodemailer` - Email sending
- `google-auth-library` - Google OAuth verification
- `zod` - Data validation
- And more...

### 3. Setup Environment Variables

Create a `.env` file in the root directory by copying the example:

```bash
cp .env.example .env
```

Fill in your environment variables:

```env
# Server Port
PORT=3000

# MongoDB Connection
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/checkpoint

# JWT Secrets (Generate strong random strings)
JWT_ACCESS_SECRET=your_access_secret_key_here
JWT_REFRESH_SECRET=your_refresh_secret_key_here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration (Mailtrap)
SMTP_USER=your_mailtrap_username
SMTP_PASS=your_mailtrap_password
SMTP_FROM_EMAIL=your_email@example.com

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

#### 📧 Mailtrap Configuration

1. Create an account at [Mailtrap.io](https://mailtrap.io)
2. Create a new project and get your SMTP credentials
3. Add the SMTP username and password to your `.env` file
4. Emails sent during registration will appear in your Mailtrap inbox
5. Users must verify their email before they can fully use the application

#### 🔐 Google OAuth Setup

To enable Google login on ports **3000, 5000, 8000, or 9000**:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable the "Google+ API"
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URIs:
   - `http://localhost:3000`
   - `http://localhost:5000`
   - `http://localhost:8000`
   - `http://localhost:9000`

6. Get your **Client ID** and **Client Secret**
7. Configure your frontend to use the Client ID for Google Sign-In

**Important**: Google OAuth only works on these specific ports due to Google's security restrictions.

### 4. Start Redis/Valkey with Docker

```bash
docker-compose up -d
```

This starts a Valkey container on port `6379`. Verify it's running:

```bash
docker-compose ps
```

### 5. Start the Server

```bash
node index.js
```

Or use a development watcher:

```bash
npm install -g nodemon
nodemon index.js
```

The server will start on the port specified in your `.env` file (default: 3000).

Expected output:
```
Server is started
```

---

## 🔑 Environment Variables Explanation

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `3000`, `5000`, `8000`, `9000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `JWT_ACCESS_SECRET` | Secret for access tokens | Any random string |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens | Any random string |
| `JWT_ACCESS_EXPIRES_IN` | Access token expiration | `15m` (15 minutes) |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiration | `7d` (7 days) |
| `SMTP_USER` | Mailtrap username | From Mailtrap dashboard |
| `SMTP_PASS` | Mailtrap password | From Mailtrap dashboard |
| `SMTP_FROM_EMAIL` | Sender email address | `noreply@yourapp.com` |
| `FRONTEND_URL` | Frontend application URL | `http://localhost:3000` |

---

## 🔐 Authentication Flow

### Registration & Email Verification

```
1. User registers with email & password
   ↓
2. System hashes password with bcrypt
   ↓
3. User document created with isVerified = false
   ↓
4. Verification email sent to Mailtrap
   ↓
5. User clicks link in email to verify
   ↓
6. isVerified set to true
   ↓
7. User can now login
```

### Login

```
1. User provides email & password
   ↓
2. Password verified with bcrypt
   ↓
3. Access Token (JWT) generated
   ↓
4. Refresh Token hashed and stored in Redis
   ↓
5. Both tokens returned to client
```

### Google OAuth Login

```
1. User clicks "Sign in with Google"
   ↓
2. Google returns ID Token
   ↓
3. Server verifies ID Token with google-auth-library
   ↓
4. User created or linked if already exists
   ↓
5. Access & Refresh tokens generated
   ↓
6. Tokens returned to client
```

**Note**: Google login works only on ports **3000, 5000, 8000, 9000** due to OAuth configuration.

---

## 📡 API Endpoints

### Authentication Routes (`/auth`)

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| `POST` | `/auth/register` | Register new user | `{email, password, username}` |
| `POST` | `/auth/login` | Login with credentials | `{email, password}` |
| `POST` | `/auth/google-login` | Login with Google token | `{idToken}` |
| `POST` | `/auth/verify-email` | Verify email address | `{verificationToken}` |
| `POST` | `/auth/refresh` | Refresh access token | `{refreshToken}` |
| `GET` | `/auth/me` | Get current user info | Headers: `Authorization: Bearer <token>` |
| `POST` | `/auth/logout` | Logout user | `{refreshToken}` |

### Checkbox Routes (`/checkbox`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/checkbox` | Get all checkbox states |

### WebSocket Events

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `toggleCheckbox` | Client → Server | `{index, state}` | Toggle a checkbox |
| `update` | Server → Client | `{index, state}` | Checkbox updated |
| `cooldown` | Server → Client | `{message, index}` | Rate limit message |

---

## 📊 Project Structure

```
skull-coder-1_miilion_checkbox/
├── index.js                          # Entry point
├── app.js                            # Express app setup
├── package.json                      # Dependencies
├── docker-compose.yml                # Docker configuration
├── .env.example                      # Environment template
│
├── public/
│   └── index.html                   # Frontend SPA
│
└── src/
    ├── common/
    │   ├── config/
    │   │   ├── auth.db.js           # MongoDB connection
    │   │   └── mail.js              # Email configuration
    │   ├── dto/
    │   │   └── baseDto.js           # Base DTO class
    │   ├── middleware/
    │   │   ├── auth.middleware.js   # JWT verification
    │   │   ├── errorHandler.middleware.js
    │   │   ├── notFound.middleware.js
    │   │   └── validate.middleware.js
    │   └── utils/
    │       ├── api.error.js         # Custom error class
    │       ├── api.response.js      # Standard response format
    │       ├── google.utility.js    # Google OAuth verification
    │       ├── jwt.utils.js         # JWT generation
    │       └── redis-connection.js  # Redis client
    │
    ├── modules/
    │   ├── auth/
    │   │   ├── auth.controller.js   # Request handlers
    │   │   ├── auth.service.js      # Business logic
    │   │   ├── auth.routes.js       # Route definitions
    │   │   ├── auth.model.js        # MongoDB schema
    │   │   └── dto/
    │   │       ├── login.dto.js
    │   │       ├── register.dto.js
    │   │       └── verify-email.dto.js
    │   │
    │   └── checkbox/
    │       ├── checkbox.controller.js
    │       ├── checkbox.service.js
    │       └── checkbox.routes.js
    │
    └── sockets/
        └── socket.js                # WebSocket handlers
```

---

## ✅ Password Requirements

Passwords must contain:
- ✓ At least 8 characters
- ✓ At least one uppercase letter (A-Z)
- ✓ At least one lowercase letter (a-z)
- ✓ At least one number (0-9)
- ✓ At least one special character (@$!%*?&)

**Example**: `MyPassword123!`

---

## 🧪 Testing the Application

### 1. Register a User

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "TestPassword123!"
  }'
```

**Check Mailtrap** for the verification email.

### 2. Verify Email

Click the verification link in the Mailtrap inbox, or use the token:

```bash
curl -X POST http://localhost:3000/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"verificationToken": "token_from_email"}'
```

### 3. Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!"
  }'
```

Response:
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "accessToken": "eyJhbGc...",
  "refreshToken": "refresh_token..."
}
```

### 4. Get User Info

```bash
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 5. Get Checkboxes

```bash
curl -X GET http://localhost:3000/checkbox
```

### 6. Toggle Checkbox (WebSocket)

Open a browser and connect to WebSocket:

```javascript
const socket = io('http://localhost:3000');

// Listen for updates
socket.on('update', (data) => {
  console.log(`Checkbox ${data.index} is now ${data.state}`);
});

// Toggle a checkbox
socket.emit('toggleCheckbox', { index: 0, state: true });

// Listen for cooldown messages
socket.on('cooldown', (data) => {
  console.log(data.message);
});
```

---

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

### MongoDB Connection Error

- Verify `MONGODB_URI` is correct in `.env`
- Ensure MongoDB server is running (local or cloud)
- Check firewall and network access

### Redis Connection Error

```bash
# Verify Docker container is running
docker-compose ps

# View container logs
docker-compose logs valkey

# Restart containers
docker-compose restart
```

### Email Not Sending

- Verify Mailtrap credentials in `.env`
- Check Mailtrap dashboard for the email
- Ensure `SMTP_FROM_EMAIL` is valid

### Google Login Not Working

- Verify you're accessing the app on port 3000, 5000, 8000, or 9000
- Check Google OAuth credentials are correct
- Verify OAuth redirect URIs are configured in Google Cloud Console

### JWT Token Expired

```bash
# Get new access token using refresh token
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "your_refresh_token"}'
```

---

## 📦 Dependencies

- **express** - Web framework
- **mongoose** - MongoDB object modeling
- **socket.io** - Real-time bidirectional communication
- **ioredis** - Redis client library
- **jsonwebtoken** - JWT token generation and verification
- **bcryptjs** - Password hashing
- **nodemailer** - Email sending
- **google-auth-library** - Google OAuth verification
- **cors** - Cross-Origin Resource Sharing
- **zod** - TypeScript-first schema validation
- **dotenv** - Environment variable loader
- **node-cron** - Task scheduling

---

## 🔗 Useful Links

- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Mailtrap Documentation](https://mailtrap.io/blog/nodejs-send-email/)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Socket.io Documentation](https://socket.io/docs/)
- [Express.js Guide](https://expressjs.com/)
- [JWT.io](https://jwt.io/)

---

## 📝 License

ISC

---

## 👤 Author

Skull Coder

---

## 🎓 Notes for Developers

### Cooldown Mechanism
- Users can toggle a checkbox only once every 5 seconds
- The cooldown is enforced using Redis SET with NX (not exists) flag
- Prevents spam and ensures fair usage across all clients

### Real-time Synchronization
- Uses Socket.io for WebSocket connections
- Redis pub/sub pattern distributes updates across instances
- All connected clients receive updates instantly

### Security Considerations
- Passwords hashed with bcryptjs before storing
- JWT tokens expire after set duration
- Refresh tokens stored as hashes in Redis
- Email verification required before full account activation
- CORS configured for specific origins

### Scalability
- Redis handles session and state management
- WebSocket connections can be scaled with Redis pub/sub
- MongoDB supports horizontal scaling with sharding

---

Enjoy building with Million Checkboxes! 🚀
