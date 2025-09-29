# AstroLuna - AI-Powered Astrology & Tarot Platform

## Project Overview

**AstroLuna** is a cutting-edge web platform that combines AI-powered astrology services with modern edge computing technology. The platform offers three core services: personalized horoscopes (AstroScope), AI-generated Tarot readings (TarotPath), and comprehensive zodiac knowledge base (ZodiacTome).

**Tech Stack:** Hono Framework + TypeScript + Cloudflare Pages/Workers + D1 Database + TailwindCSS

## 🔗 URLs

- **Development Server:** https://3000-imyext7r0v8p73x6olo44-6532622b.e2b.dev
- **Health Check:** https://3000-imyext7r0v8p73x6olo44-6532622b.e2b.dev/api/health
- **GitHub Repository:** (To be configured)

## ✅ Currently Implemented Features

### 🔐 Authentication System
- **User Registration:** Complete signup flow with validation (/signup)
- **Login/Logout:** JWT-based authentication (/login)
- **Password Reset:** Token-based password recovery system
- **Profile Management:** User profile with credits tracking

### 💰 Credit System & Currency Management
- **Multi-currency Support:** EUR (base), USD, GBP with live exchange rates
- **NBU API Integration:** Real-time currency conversion using National Bank of Ukraine API
- **Credit Packages:** Tiered pricing with bonus credits (5€ = 50 credits, up to 2000€ = 32,000 credits)
- **Transaction History:** Complete audit trail for all credit operations

### 💳 Payment Processing System
- **SPC Payment Gateway:** Full integration with Talentmap secure payment processing
- **Checkout Flow:** Multi-step checkout with package selection, billing info, and secure payment
- **Webhook Processing:** Real-time payment status updates and credit allocation
- **Security:** HMAC signature verification, encrypted payment data, PCI compliance
- **Test Environment:** Sandbox mode with test card numbers (4111 1111 1111 1111)

### 🎨 Frontend UI/UX
- **Modern Design:** Dark theme with purple/blue gradient aesthetics
- **Responsive Layout:** Mobile-first approach with TailwindCSS
- **Interactive Navigation:** Fixed header with service links and currency/language selectors
- **Hero Section:** Stunning landing page with animated starfield background
- **Service Cards:** Visual preview of all three core services
- **Checkout System:** Multi-step checkout process with progress tracking
- **Authentication Pages:** Professional login/signup forms with validation
- **Payment Success/Cancel:** Dedicated result pages with clear status indication

### 🛠 Backend Infrastructure
- **Hono Framework:** Lightweight, fast web framework optimized for Cloudflare Workers
- **TypeScript Support:** Full type safety across the application
- **D1 Database Schema:** Complete relational database design for users, credits, transactions, and content
- **API Routes:** RESTful endpoints for auth, currency, and service management
- **Middleware:** Authentication, CORS, rate limiting, and error handling

## 🚧 Currently Functional API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login  
- `POST /api/auth/reset-password` - Request password reset
- `POST /api/auth/reset-password/confirm` - Set new password
- `GET /api/auth/profile` - Get current user profile

### Currency & Pricing
- `GET /api/currency/rates` - Get current exchange rates
- `GET /api/currency/pricing` - Get credit package pricing in all currencies
- `POST /api/currency/convert` - Convert between currencies
- `GET /api/currency/supported` - List supported currencies
- `POST /api/currency/checkout/quote` - Create fixed-rate checkout quote

### Payment Processing
- `POST /api/payments/checkout/init` - Initialize secure payment with SPC Gateway
- `POST /api/payments/webhook` - Handle payment status webhooks from SPC
- `GET /api/payments/status/:transactionId` - Get transaction status
- `GET /api/payments/history` - Get user's transaction history
- `GET /api/payments/test-connection` - Test SPC API connectivity (dev only)

### System
- `GET /api/health` - Health check endpoint

## 📊 Data Architecture

### Database Tables (Cloudflare D1)
- **users** - User accounts with multi-language/currency preferences
- **credits** - User credit balances and history
- **transactions** - Payment transaction records with exchange rate snapshots
- **generation_logs** - Service usage tracking and cost calculations
- **content_library** - Generated content storage (horoscopes, tarot readings, zodiac info)
- **support_tickets** - Customer support system
- **pricing_config** - Versioned pricing rules and service costs
- **reset_tokens** - Password reset token management
- **rates_cache** - Exchange rate caching with daily refresh

### Service Pricing
- **AstroScope (Horoscopes):** 15 credits per generation
- **TarotPath (Tarot Readings):** 20 credits per generation  
- **ZodiacTome (Zodiac Analysis):** 10 credits per generation

## 🎯 Features Not Yet Implemented

### 🔮 AI Services (High Priority)
- **AstroScope Service:** Gemini API integration for horoscope generation
- **TarotPath Service:** AI-powered Tarot card reading system
- **ZodiacTome Service:** Interactive zodiac compatibility and insights

### 💳 Payment Integration
- **SPC Payment Gateway:** Secure credit card processing via Talentmap
- **Checkout Flow:** Multi-step payment process with order confirmation
- **Webhook Handling:** Payment status updates and credit allocation

### 👤 User Dashboard
- **Profile Management:** Edit personal information and preferences
- **Billing History:** Detailed transaction and credit usage history
- **Content Library:** Access to previously generated readings and horoscopes
- **Download System:** PDF generation for horoscope and tarot readings

### 📧 Communication System
- **Email Notifications:** Registration, payment, and service completion alerts
- **Support System:** Contact form with ticket management
- **Newsletter Integration:** User engagement and retention

### 🌍 Internationalization
- **Multi-language Support:** English, Spanish, German translations
- **Localized Content:** Culture-specific astrology interpretations
- **Regional Pricing:** Currency-based pricing adjustments

## 🚀 Development Workflow

### Local Development
```bash
# Install dependencies
npm install

# Start development server with D1 database
npm run build && pm2 start ecosystem.config.cjs

# View logs
pm2 logs astroluna --nostream

# Reset local database
npm run db:reset
```

### Database Management
```bash
# Apply migrations locally
npm run db:migrate:local

# Seed test data
npm run db:seed

# Database console
npm run db:console:local
```

## 🔄 Next Development Steps

### Immediate Priorities (Next 1-2 Days)
1. **Implement Gemini API Integration** for content generation
2. **Complete SPC Payment Gateway** integration 
3. **Build User Dashboard** with profile and billing management
4. **Create Service Pages** for AstroScope, TarotPath, and ZodiacTome

### Medium-term Goals (Next 3-5 Days)
1. **Deploy to Cloudflare Pages** production environment
2. **Implement Email System** with Nodemailer
3. **Add Multi-language Support** for international users
4. **Comprehensive Testing** and bug fixes

### Future Enhancements
1. **Mobile App** development considerations
2. **Advanced AI Features** like personalized recommendations
3. **Social Features** for sharing readings
4. **Analytics Dashboard** for business insights

## 🛡 Security Considerations

- **JWT Authentication** with secure token management
- **Password Hashing** using bcrypt with salt rounds
- **Rate Limiting** to prevent API abuse  
- **Input Validation** with Zod schemas
- **CORS Configuration** for cross-origin security
- **Environment Variables** for sensitive configuration

## 📱 User Experience Features

- **Responsive Design** optimized for all device sizes
- **Loading States** and smooth animations
- **Error Handling** with user-friendly messages
- **Progressive Enhancement** for optimal performance
- **Accessibility** compliance with WCAG guidelines

## 🔧 Technical Architecture

- **Edge-First Design** leveraging Cloudflare's global network
- **Serverless Functions** for cost-effective scaling
- **Static Asset Optimization** with Cloudflare CDN
- **Database Replication** across multiple regions
- **Monitoring & Logging** for production reliability

---

**Last Updated:** September 29, 2025  
**Development Status:** 🟡 MVP Core Infrastructure Complete, Services Implementation In Progress  
**Production Readiness:** 🔴 Not Yet Ready (Missing Core AI Services)