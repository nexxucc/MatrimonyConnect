# Matrimony Connect

A modern, full-stack matrimony platform built with Node.js, Express, React, and Tailwind CSS.

## Features
- User registration/login with OTP
- Profile management, matchmaking, chat, interests
- Admin dashboard, analytics, payment/report management
- Internationalization (i18n), accessibility, PWA support
- **Demo mode:** Payments are simulated (no real money is involved)

## Demo Payment Notice
> **Payments are simulated for demo purposes. No real money is involved.**

## Deployment Instructions

### Prerequisites
- Node.js (v16+ recommended)
- npm or yarn

### 1. Install dependencies
```bash
cd server && npm install
cd ../client && npm install
```

### 2. Environment Variables
- Copy `server/env.example` to `server/.env` and fill in required values (dummy values are fine for demo)

### 3. Build frontend
```bash
cd client
npm run build
```

### 4. Start backend
```bash
cd ../server
npm start
```

### 5. Serve frontend (optional)
- You can serve the `client/build` folder with any static server or configure Express to serve it.

## Notes
- All payment flows are simulated. To enable real payments, integrate a payment gateway and update the relevant backend/frontend code.
- For production, set secure environment variables and review security best practices.

---

© 2024 Matrimony Connect

## 🌟 Features

### For Users
- **Secure Registration & Authentication**
  - Email/mobile registration with OTP verification
  - JWT-based authentication
  - Password reset functionality

- **Comprehensive Profile Management**
  - Detailed personal information (basic, religious, educational, career)
  - Photo upload with admin approval
  - Privacy settings control
  - Profile completion scoring

- **Advanced Search & Matchmaking**
  - Multi-criteria search (age, religion, caste, location, education, etc.)
  - Daily match suggestions
  - Similar profile recommendations
  - Filter-based search

- **Communication Tools**
  - Send/receive interest requests
  - Chat messaging (premium feature)
  - Interest management (accept/reject/withdraw)
  - Read/unread status tracking

- **Subscription Plans**
  - Free plan with basic features
  - Premium plan with advanced features
  - Secure payment integration (Stripe)
  - Subscription management

### For Administrators
- **User Management**
  - View and manage all users
  - Approve/reject profiles and photos
  - User role management
  - Account activation/deactivation

- **Content Moderation**
  - Profile approval workflow
  - Photo verification system
  - Report management

- **Analytics Dashboard**
  - User statistics
  - Payment analytics
  - Interest tracking
  - Platform insights

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Multer** - File uploads
- **Cloudinary** - Image storage
- **Stripe** - Payment processing
- **Twilio** - SMS/OTP
- **Nodemailer** - Email services

### Frontend
- **React 18** - UI library
- **React Router** - Navigation
- **React Query** - Data fetching
- **React Hook Form** - Form management
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Axios** - HTTP client
- **React Hot Toast** - Notifications

## 📁 Project Structure

```
MatrimonyConnect/
├── server/                 # Backend API
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── utils/             # Utility functions
│   └── index.js           # Server entry point
├── client/                # Frontend React app
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   ├── services/      # API services
│   │   ├── hooks/         # Custom hooks
│   │   └── utils/         # Utility functions
│   └── public/            # Static assets
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/matrimony-connect.git
   cd matrimony-connect
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Environment Setup**

   Create `.env` file in the server directory:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Database
   MONGODB_URI=mongodb://localhost:27017/matrimony-connect
   
   # JWT Secret
   JWT_SECRET=your-super-secret-jwt-key-here
   
   # Client URL
   CLIENT_URL=http://localhost:3000
   
   # Email Configuration (SMTP)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   SMTP_FROM=noreply@matrimonyconnect.com
   
   # SMS Configuration (Twilio)
   TWILIO_ACCOUNT_SID=your-twilio-account-sid
   TWILIO_AUTH_TOKEN=your-twilio-auth-token
   TWILIO_PHONE_NUMBER=your-twilio-phone-number
   
   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   
   # Stripe Configuration
   STRIPE_SECRET_KEY=your-stripe-secret-key
   STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
   ```

4. **Start the development servers**
   ```bash
   # From root directory
   npm run dev
   
   # Or start separately:
   # Terminal 1 - Start backend
   cd server
   npm run dev
   
   # Terminal 2 - Start frontend
   cd client
   npm start
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-otp` - OTP verification
- `POST /api/auth/forgot-password` - Forgot password
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/me` - Get current user

### Profiles
- `GET /api/profiles/me` - Get own profile
- `POST /api/profiles` - Create/update profile
- `GET /api/profiles/:id` - Get profile by ID
- `POST /api/profiles/photos` - Upload photo
- `PUT /api/profiles/photos/:index/primary` - Set primary photo
- `DELETE /api/profiles/photos/:index` - Delete photo

### Search
- `GET /api/search` - Search profiles
- `GET /api/search/daily-matches` - Get daily matches
- `GET /api/search/similar/:id` - Get similar profiles
- `GET /api/search/filters` - Get search filters

### Interests
- `POST /api/interests` - Send interest
- `GET /api/interests/received` - Get received interests
- `GET /api/interests/sent` - Get sent interests
- `PUT /api/interests/:id/respond` - Respond to interest
- `PUT /api/interests/:id/withdraw` - Withdraw interest

### Payments
- `POST /api/payments/create-payment-intent` - Create payment intent
- `POST /api/payments/confirm` - Confirm payment
- `GET /api/payments/history` - Get payment history
- `GET /api/payments/subscription` - Get subscription status

### Admin
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/users` - Get users list
- `GET /api/admin/profiles/pending` - Get pending profiles
- `PUT /api/admin/profiles/:id/approve` - Approve/reject profile
- `PUT /api/admin/users/:id/role` - Update user role

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting
- Input validation and sanitization
- CORS protection
- Helmet security headers
- File upload restrictions
- Admin-only routes protection

## 🎨 UI/UX Features

- Responsive design
- Modern and clean interface
- Smooth animations
- Loading states
- Error handling
- Toast notifications
- Form validation
- Image optimization
- Progressive loading

## 📊 Database Schema

### User Model
- Basic info (email, phone, password)
- Role and verification status
- Subscription details
- Preferences and privacy settings

### Profile Model
- Personal information (name, DOB, gender, etc.)
- Religious and family details
- Education and career information
- Location and lifestyle preferences
- Photos and privacy settings

### Interest Model
- Sender and recipient
- Status (pending, accepted, rejected, withdrawn)
- Messages and timestamps

### Chat Model
- Participants
- Messages with read status
- Last message tracking

### Payment Model
- User and plan details
- Payment status and gateway response
- Subscription period

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB Atlas or local MongoDB
2. Configure environment variables
3. Deploy to platforms like Heroku, Railway, or DigitalOcean

### Frontend Deployment
1. Build the React app: `npm run build`
2. Deploy to platforms like Vercel, Netlify, or AWS S3

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- Email: support@matrimonyconnect.com
- Documentation: [docs.matrimonyconnect.com](https://docs.matrimonyconnect.com)

## 🙏 Acknowledgments

- React team for the amazing framework
- MongoDB for the database
- All the open-source contributors whose libraries made this possible

---

**Made with ❤️ for helping people find their perfect match** 