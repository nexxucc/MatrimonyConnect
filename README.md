# Matrimony Connect

A comprehensive matrimonial platform built with MERN stack (MongoDB, Express.js, React, and Node.js) with advanced features for profile management, matchmaking, communication, and premium subscriptions.

## Features

### User Management

- Multi-channel authentication (email, phone, social)
- OTP verification via SMS, WhatsApp, or email
- Role-based access (Admin, Moderator, Premium, Free)
- Profile verification with ID proof
- Subscription plans with premium features

### Profile Management

- Detailed personal, religious, educational, and professional information
- Multiple photo uploads with privacy controls
- Custom preferences for potential matches
- Family & lifestyle details
- Verification badges and trust indicators

### Search & Matchmaking

- Advanced filtering with 25+ parameters
- Daily recommended matches
- Similar profile suggestions
- Premium search options (save searches, highlighted results)
- Location-based matching

### Communication

- Interest management (send, accept, reject, withdraw)
- In-app messaging with media support
- Contact information sharing (premium)
- Privacy controls and blocking
- User reporting system

### Premium Features

- Boosted visibility in search results
- View contact information of interested users
- Advanced messaging features
- Who viewed my profile
- Priority customer support

### Admin Tools

- User management dashboard
- Profile approval workflows
- Payment tracking and analytics
- Content moderation
- System metrics and reporting

### Success Stories

- Share and browse success stories
- Photo gallery for success stories
- Featured success stories section
- Testimonials and ratings

### Analytics & Reporting

- User behavior analytics
- Demographic insights
- Matching success metrics
- Revenue analytics
- Activity tracking

## Tech Stack

### Backend

- Node.js with Express.js
- MongoDB with Mongoose ODM
- JWT authentication
- Cloudinary for image storage
- Nodemailer for emails
- Twilio for SMS
- WhatsApp Business API integration

### Payment Processing

- Stripe integration
- Razorpay integration (for Indian payments)
- Subscription management

### Security

- Helmet for HTTP security headers
- Rate limiting and request validation
- Secure password hashing
- CSRF protection
- Input sanitization

## Project Structure

```
matrimony-connect/
├── client/               # React frontend
│   ├── public/           # Static files
│   └── src/              # React source code
│       ├── components/   # UI components
│       ├── contexts/     # React contexts
│       ├── pages/        # Page components
│       └── services/     # API services
│
└── server/               # Express backend
    ├── middleware/       # Express middleware
    ├── models/           # Mongoose schemas
    ├── routes/           # API routes
    └── utils/            # Helper utilities
```

## Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- MongoDB (local or Atlas)
- npm or yarn
- Cloudinary account (for image uploads)
- SMTP server access (for emails)
- Twilio account (optional, for SMS)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/your-username/matrimony-connect.git
cd matrimony-connect
```

2. **Install server dependencies**

```bash
cd server
npm install
```

3. **Configure environment variables**

```bash
cp env.example .env
# Edit .env file with your configuration
```

4. **Install client dependencies**

```bash
cd ../client
npm install
```

5. **Start development servers**

   In the server directory:

   ```bash
   npm run dev
   ```

   In the client directory:

   ```bash
   npm start
   ```

6. **Access the application**
   - Backend API: http://localhost:5000
   - Frontend: http://localhost:3000

## Development

### Backend API Testing

```bash
cd server
npm test
```

### Frontend Testing

```bash
cd client
npm test
```

### Building for Production

**Backend**:

```bash
cd server
npm start
```

**Frontend**:

```bash
cd client
npm run build
```

## Deployment

1. Set up a MongoDB database (Atlas recommended for production)
2. Configure all environment variables in .env file
3. Build the React frontend
4. Deploy the Express backend to your hosting provider
5. Set up a reverse proxy to serve the frontend build files

## Security Notes

- Ensure proper environment variable management in production
- Set up rate limiting and input validation
- Configure CORS properly
- Use HTTPS in production
- Keep dependencies updated

## Payment Integration

This application includes payment integration for premium subscriptions. For testing:

- Use Stripe test keys for development
- Use Razorpay test mode
- All payment flows are simulated in demo mode

> **Demo Payment Notice**: Payments are simulated for demo purposes. No real money is involved in the demo version.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Icons by [Heroicons](https://heroicons.com/)
- UI Components with [Tailwind CSS](https://tailwindcss.com/)
- Form validation with [Formik](https://formik.org/) and [Yup](https://github.com/jquense/yup)
- Charts with [Chart.js](https://www.chartjs.org/)

---

© 2024 Matrimony Connect
