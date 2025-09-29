# AstroLuna - Testing Guide

## 🔗 Access URLs

- **Main Website:** https://3000-imyext7r0v8p73x6olo44-6532622b.e2b.dev
- **Login Page:** https://3000-imyext7r0v8p73x6olo44-6532622b.e2b.dev/login
- **Registration:** https://3000-imyext7r0v8p73x6olo44-6532622b.e2b.dev/signup
- **Checkout:** https://3000-imyext7r0v8p73x6olo44-6532622b.e2b.dev/checkout

## 🧪 Test Accounts

### Pre-configured Test Account
- **Email:** test@example.com
- **Password:** testpass
- **Credits:** 100 (pre-loaded for testing)

### Create New Account
Use the registration form at `/signup` with any valid email and password.

## 💳 Testing Payment System

### Test Credit Packages
1. Login with test account or create new account
2. Navigate to checkout page
3. Select any credit package:
   - **5€ = 50 credits** (no bonus)
   - **20€ = 220 credits** (10% bonus)
   - **100€ = 1,200 credits** (20% bonus)
   - **500€ = 7,000 credits** (40% bonus)
   - **2000€ = 32,000 credits** (60% bonus)

### Test Card Numbers (SPC Sandbox)
- **Visa Success:** 4111 1111 1111 1111
- **MasterCard Success:** 5555 5555 5555 4444
- **Expiry:** 12/25
- **CVV:** 123
- **3DS Code:** 111 (or any code)

### Multi-Currency Testing
- Switch currency in top navigation (EUR/USD/GBP)
- Prices automatically convert using live NBU exchange rates
- Checkout process maintains selected currency

## 🔐 Authentication Flow Testing

### Registration Flow
1. Go to `/signup`
2. Fill required fields:
   - Full Name
   - Email (unique)
   - Phone
   - Password (min 6 characters)
   - Confirm Password
   - Select Language & Currency
   - Accept Privacy Policy
3. Submit → Auto-login with JWT token
4. Redirected to main page with credits displayed

### Login Flow
1. Go to `/login`
2. Enter credentials
3. Submit → JWT stored in localStorage
4. Navigation updates to show credits and "Buy Credits" button

### Password Reset Flow
1. Click "Forgot Password" on login page
2. Enter email
3. In development: reset token shown in console/response
4. Use token to set new password

## 🛒 Checkout Process Testing

### Multi-Step Checkout
1. **Step 1:** Package Selection
   - Choose credit package
   - See real-time pricing in selected currency
   
2. **Step 2:** Billing Information
   - Form pre-filled with user profile data
   - All fields required for payment processing
   
3. **Step 3:** Payment Processing
   - Redirects to SPC Payment Gateway
   - Use test card numbers above
   - Returns to success/cancel pages

### Order Summary
- Real-time calculation of:
  - Base credits
  - Bonus credits (if applicable)
  - Total credits
  - Price in selected currency

## 🔍 API Testing

### Authentication APIs
```bash
# Login
curl -X POST -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass"}' \
  http://localhost:3000/api/auth/login

# Get Profile (use token from login response)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/api/auth/profile
```

### Currency APIs
```bash
# Get current exchange rates
curl http://localhost:3000/api/currency/rates

# Get credit package pricing
curl http://localhost:3000/api/currency/pricing
```

### Payment APIs (requires authentication)
```bash
# Test SPC connection
curl http://localhost:3000/api/payments/test-connection

# Get transaction history (requires auth token)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/api/payments/history
```

## 🚨 Expected Behaviors

### Successful Scenarios
- ✅ Login with test@example.com/testpass → JWT token + profile data
- ✅ Registration with unique email → Auto-login
- ✅ Currency switching → Prices update automatically
- ✅ Package selection → Order summary updates
- ✅ Checkout → Redirects to payment gateway
- ✅ Payment with test cards → Success page

### Error Scenarios
- ❌ Login with wrong password → "Invalid email or password"
- ❌ Registration with existing email → "User already exists"
- ❌ Checkout without login → Redirect to login page
- ❌ Invalid payment data → Error messages

## 💡 Development Notes

- Mock database automatically initializes with test data
- No D1 database setup required for testing
- JWT tokens valid for 7 days
- Exchange rates cached for 24 hours
- SPC integration in sandbox mode

## 🔧 Troubleshooting

### If login doesn't work:
1. Check PM2 logs: `pm2 logs astroluna --nostream`
2. Verify mock database initialization in logs
3. Test API directly with curl commands above

### If payment fails:
1. Ensure using correct test card numbers
2. Check SPC connectivity: `/api/payments/test-connection`
3. Verify all required billing fields are filled

### If pages don't load:
1. Check server status: `pm2 list`
2. Restart if needed: `pm2 restart astroluna`
3. Rebuild if code changed: `npm run build`