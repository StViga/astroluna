# AstroLuna - AI-Powered Astrology Platform

## Project Overview
- **Name**: AstroLuna  
- **Goal**: AI-powered astrology platform providing personalized natal charts, compatibility analysis, and astrological insights
- **Features**: User authentication, subscription system, AI-generated astrology content, personal library, payment processing with SPC Gateway, multi-currency support

## 🚀 Live Demo URLs
- **Development Server**: http://localhost:3005
- **Public Demo**: https://3005-imyext7r0v8p73x6olo44-6532622b.e2b.dev
- **GitHub**: Repository ready for deployment

## 🎨 Visual Features
- **Cosmic Background**: Stunning nebula and starfield backgrounds
- **Glassmorphism UI**: Semi-transparent panels with backdrop blur effects  
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Smooth Animations**: Elegant transitions and hover effects
- **Dark Theme**: Space-themed dark interface with cosmic gradients

## 📊 Currently Completed Features

### ✅ Frontend Dashboard (React + TypeScript)
- **Authentication System**: Login, registration, email verification, password reset (English interface)
- **Dashboard Home**: Statistics overview, quick actions, recent generations, subscription status (English interface)
- **Navigation**: Responsive sidebar with subscription tracking and progress indicators (English interface)
- **User Interface**: Cosmic theme with nebula backgrounds, glassmorphism effects, English text throughout
- **Payment Integration**: Complete SPC Payment Gateway integration with multi-currency support
- **State Management**: Zustand for authentication, payments, and subscriptions
- **Visual Design**: Space-themed backgrounds with cosmic nebulas, constellations, and starfields

### ✅ Functional Entry URIs
- `/` - Public homepage with cosmic design (English)
- `/services` - Comprehensive services overview (English)
- `/pricing` - Interactive pricing with currency selector and payment integration (English) 
- `/about` - Company story, team, and values (English)
- `/contact` - Contact form and support information (English)
- `/auth/login` - User login page (English)
- `/auth/register` - User registration (English)
- `/dashboard` - Main dashboard with subscription tracking (English)
- `/dashboard/generate` - AI content generation with usage tracking (English)
- `/dashboard/library` - User's saved content library (English)
- `/dashboard/billing` - Full subscription management, payment history, and checkout (English)
- `/dashboard/profile` - User profile settings (English)

### ✅ Technical Architecture
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS with custom cosmic theme and real space backgrounds
- **State**: Zustand for auth, payments, and subscriptions
- **Routing**: React Router with protected routes
- **Icons**: Heroicons
- **Build**: Vite with hot reload
- **Payment Gateway**: SPC Payment (Sandbox integration)
- **Currency**: NBU API for real-time UAH/USD/EUR conversion
- **UI Effects**: Glassmorphism, backdrop blur, and smooth animations
- **Backgrounds**: Real cosmic imagery (nebulas, starfields, constellations)
- **Localization**: Complete English interface throughout

## 🔧 Data Architecture & Payment System
- **Data Models**: User, Subscription, PaymentHistory, Generation, AIProvider
- **Payment Gateway**: SPC Payment Gateway with sandbox configuration
- **Currency Support**: Multi-currency (USD, EUR, UAH) with NBU API conversion
- **Subscription Plans**: Free, Cosmic Starter ($9.99/month), Astro Pro ($24.99/month), Cosmic Master ($49.99/month)
- **Authentication**: JWT tokens with refresh mechanism
- **Payment Processing**: Secure card processing with 3DS support
- **Test Cards**: 4111 1111 1111 1111 (Exp: 12/25, CVV: 123, 3DS: 111)

## 📋 Features Not Yet Implemented

### 🚧 Backend Integration  
- Node.js + Express API server connection
- PostgreSQL database setup and migrations
- AI provider integration (Gemini 1.5 Flash)
- ✅ **Payment processing (SPC Gateway - COMPLETED)**

### 🚧 AI Generation Features
- Natal chart generation with birth data
- Compatibility analysis between users
- Personalized astrological forecasts
- Content saving and library management

### 🚧 Advanced Features
- Email notifications and verification
- Advanced user analytics
- Mobile app (React Native)
- Social sharing capabilities

## 🎯 Recommended Next Steps

1. **Backend Setup**: Initialize Node.js server and connect to frontend
2. **Database Integration**: Set up PostgreSQL with user and subscription tables
3. **AI Integration**: Connect Gemini API for astrology content generation
4. ✅ **Payment System**: SPC Gateway integration completed with multi-currency support
5. **Subscription Management**: Implement subscription lifecycle and webhooks
6. **Testing**: Add comprehensive test coverage
7. **Deployment**: Deploy to production environment

## 👥 User Guide
1. **Registration**: Create account with email verification
2. **Dashboard**: View statistics and manage account
3. **Subscription**: Choose and manage subscription plans with secure payment processing
4. **Generation**: Create astrological content using AI (usage tracked by plan)
5. **Library**: Save and organize generated content
6. **Billing**: Full subscription management, payment history, and plan upgrades
6. **Profile**: Update personal information and preferences

## 🚀 Deployment
- **Platform**: Railway (Fullstack Node.js + PostgreSQL)
- **Status**: 🚂 Ready for Railway deployment
- **Tech Stack**: React + TypeScript + Node.js + Express + PostgreSQL
- **Database**: PostgreSQL with automated migrations
- **Last Updated**: October 3, 2024

### 🚂 Railway Deployment
1. Создайте новый проект на [Railway](https://railway.app)
2. Подключите GitHub репозиторий: `https://github.com/StViga/astroluna`
3. Добавьте PostgreSQL сервис к проекту
4. Настройте environment variables (см. `.env.example`)
5. Railway автоматически деплоит при push в main branch

**Подробная инструкция**: [RAILWAY_DEPLOYMENT.md](RAILWAY_DEPLOYMENT.md)

## 💡 Architecture Highlights
- Monorepo structure with separate client/server workspaces
- Type-safe development with comprehensive TypeScript
- Modern React patterns with hooks and context
- Responsive design optimized for all devices
- Scalable authentication and authorization system
- Credit-based monetization model ready for implementation

---

**🌟 Current Status**: Complete frontend website with stunning cosmic UI design, full English localization, comprehensive payment system integration, and breathtaking space-themed backgrounds. Includes homepage, services, interactive pricing with currency conversion, about, contact, and dashboard pages with full subscription management. Ready for backend integration and AI features implementation.

**🎨 Visual Highlights**:
- **5 Complete Public Pages**: Home, Services, Interactive Pricing, About, Contact
- **5 Dashboard Pages**: Home, Generate, Library, Full Billing Management, Profile
- **Payment Integration**: Complete checkout flow with SPC Gateway
- **Multi-Currency Support**: USD, EUR, UAH with real-time NBU conversion
- **Real Space Imagery**: Cosmic nebula and starfield backgrounds from actual space photography
- **Glassmorphism Design**: Semi-transparent panels with backdrop blur effects
- **Smooth Animations**: Hover effects, scale transforms, and elegant transitions
- **Professional UI**: Space-themed color palette with cosmic gradients
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **English Localization**: Complete interface translation throughout all pages

**💳 Payment System Features**:
- **SPC Payment Gateway**: Sandbox integration with test card support
- **Multi-Currency**: Dynamic USD/EUR/UAH conversion using NBU API
- **Subscription Plans**: Free, Starter ($9.99), Pro ($24.99), Master ($49.99)
- **Secure Checkout**: 3DS authentication and SSL encryption
- **Payment History**: Transaction tracking and subscription management
- **Usage Tracking**: Generation limits and progress indicators