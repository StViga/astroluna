import { Hono } from 'hono'
import { renderer } from './renderer'
import { corsMiddleware, rateLimit } from './middleware/auth'
import authRoutes from './routes/auth'
import currencyRoutes from './routes/currency'
import type { CloudflareBindings } from './types/database'

const app = new Hono<{ Bindings: CloudflareBindings }>()

// Apply CORS middleware to all routes
app.use('*', corsMiddleware)

// Apply rate limiting to API routes
app.use('/api/*', rateLimit(100, 15 * 60 * 1000)) // 100 requests per 15 minutes

// Use renderer for HTML pages
app.use(renderer)

// Import payment routes
import paymentRoutes from './routes/payments'
import { CheckoutPage } from './components/checkout'

// API routes
app.route('/api/auth', authRoutes)
app.route('/api/currency', currencyRoutes)
app.route('/api/payments', paymentRoutes)

// Health check endpoint
app.get('/api/health', (c) => {
  return c.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'AstroLuna API'
  })
})

// Main landing page
app.get('/', (c) => {
  return c.render(
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>AstroLuna - AI-Powered Astrology & Tarot Readings</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet" />
        <style>{`
          body { 
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
            min-height: 100vh;
          }
          .glow { 
            box-shadow: 0 0 20px rgba(138, 43, 226, 0.5);
          }
          .hero-bg {
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><defs><radialGradient id="grad"><stop offset="0%" stop-color="%23ffffff" stop-opacity="0.1"/><stop offset="100%" stop-color="%23ffffff" stop-opacity="0"/></radialGradient></defs><circle cx="200" cy="200" r="2" fill="white" opacity="0.8"><animate attributeName="opacity" values="0.8;0.3;0.8" dur="3s" repeatCount="indefinite"/></circle><circle cx="800" cy="300" r="1" fill="white" opacity="0.6"><animate attributeName="opacity" values="0.6;0.2;0.6" dur="4s" repeatCount="indefinite"/></circle><circle cx="300" cy="700" r="1.5" fill="white" opacity="0.7"><animate attributeName="opacity" values="0.7;0.1;0.7" dur="5s" repeatCount="indefinite"/></circle><circle cx="600" cy="150" r="1" fill="white" opacity="0.5"><animate attributeName="opacity" values="0.5;0.1;0.5" dur="6s" repeatCount="indefinite"/></circle></svg>');
            background-size: cover;
          }
        `}</style>
      </head>
      <body className="text-white">
        {/* Navigation */}
        <nav className="fixed top-0 w-full z-50 bg-black/20 backdrop-blur-md border-b border-purple-500/20">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-8">
                <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                  AstroLuna
                </h1>
                <div className="hidden md:flex space-x-6">
                  <a href="#services" className="text-gray-300 hover:text-purple-400 transition-colors">Services</a>
                  <a href="/astroscope" className="text-gray-300 hover:text-purple-400 transition-colors">AstroScope</a>
                  <a href="/tarotpath" className="text-gray-300 hover:text-purple-400 transition-colors">TarotPath</a>
                  <a href="/zodiac" className="text-gray-300 hover:text-purple-400 transition-colors">ZodiacTome</a>
                  <a href="/pricing" className="text-gray-300 hover:text-purple-400 transition-colors">Pricing</a>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <select id="currency-selector" className="bg-gray-800/50 border border-gray-600 rounded px-2 py-1 text-sm">
                  <option value="EUR">€ EUR</option>
                  <option value="USD">$ USD</option>
                  <option value="GBP">£ GBP</option>
                </select>
                <select id="language-selector" className="bg-gray-800/50 border border-gray-600 rounded px-2 py-1 text-sm">
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="de">Deutsch</option>
                </select>
                <div id="credits-display" className="bg-gray-800/50 px-3 py-1 rounded text-sm">
                  <i className="fas fa-coins text-yellow-400 mr-1"></i>
                  <span id="credits">0</span> credits
                </div>
                <div id="auth-buttons">
                  <a href="/login" className="bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 rounded-lg hover:glow transition-all inline-block">
                    Login
                  </a>
                  <a href="/signup" className="border border-purple-500 px-4 py-2 rounded-lg hover:bg-purple-500/20 transition-colors inline-block ml-2">
                    Sign Up
                  </a>
                </div>
                <div id="user-menu" className="hidden">
                  <button id="checkout-btn" className="bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-2 rounded-lg hover:glow transition-all mr-2">
                    <i className="fas fa-plus mr-1"></i> Buy Credits
                  </button>
                  <button id="logout-btn" className="text-gray-300 hover:text-white">
                    <i className="fas fa-sign-out-alt mr-1"></i> Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="hero-bg min-h-screen flex items-center justify-center pt-20">
          <div className="text-center max-w-4xl mx-auto px-6">
            <h1 className="text-6xl md:text-7xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
              Discover Your Cosmic Destiny
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
              AI-powered astrology oracle that combines the wisdom of stars and Tarot cards to reveal your personalized cosmic insights
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 rounded-lg text-lg font-semibold hover:glow transition-all">
                <i className="fas fa-cards-blank mr-2"></i>
                Get Tarot Reading
              </button>
              <button className="bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-4 rounded-lg text-lg font-semibold hover:glow transition-all">
                <i className="fas fa-moon mr-2"></i>
                Generate Horoscope
              </button>
            </div>
            <a href="#learn" className="inline-block mt-6 text-purple-400 hover:text-purple-300 underline">
              Learn about zodiac signs
            </a>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-16 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
              What's Inside
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {/* AstroScope */}
              <div className="bg-gray-800/30 backdrop-blur-sm border border-purple-500/30 rounded-xl p-8 hover:border-purple-500/60 transition-colors">
                <div className="text-4xl mb-4 text-purple-400">
                  <i className="fas fa-moon"></i>
                </div>
                <h3 className="text-2xl font-bold mb-4">AstroScope</h3>
                <p className="text-gray-400 mb-6">
                  Personalized monthly horoscopes with key events and favorable dates based on your birth data
                </p>
                <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 py-3 rounded-lg font-semibold hover:glow transition-all">
                  Get Started
                </button>
              </div>

              {/* TarotPath */}
              <div className="bg-gray-800/30 backdrop-blur-sm border border-pink-500/30 rounded-xl p-8 hover:border-pink-500/60 transition-colors">
                <div className="text-4xl mb-4 text-pink-400">
                  <i className="fas fa-cards-blank"></i>
                </div>
                <h3 className="text-2xl font-bold mb-4">TarotPath</h3>
                <p className="text-gray-400 mb-6">
                  AI-generated Tarot card spreads that reveal your lunar path with interactive virtual deck
                </p>
                <button className="w-full bg-gradient-to-r from-pink-600 to-purple-600 py-3 rounded-lg font-semibold hover:glow transition-all">
                  Get Started
                </button>
              </div>

              {/* ZodiacTome */}
              <div className="bg-gray-800/30 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-8 hover:border-cyan-500/60 transition-colors">
                <div className="text-4xl mb-4 text-cyan-400">
                  <i className="fas fa-star-of-david"></i>
                </div>
                <h3 className="text-2xl font-bold mb-4">ZodiacTome</h3>
                <p className="text-gray-400 mb-6">
                  Comprehensive zodiac knowledge base with compatibility analysis and AI-powered insights
                </p>
                <button className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 py-3 rounded-lg font-semibold hover:glow transition-all">
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </section>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>{`
          // Initialize app
          document.addEventListener('DOMContentLoaded', function() {
            console.log('AstroLuna app initialized');
            
            // Check for existing authentication
            const token = localStorage.getItem('auth_token');
            if (token) {
              // Verify token and load user data
              loadUserProfile();
            }
            
            // Load exchange rates
            loadExchangeRates();
          });
          
          async function loadUserProfile() {
            try {
              const token = localStorage.getItem('auth_token');
              const response = await axios.get('/api/auth/profile', {
                headers: { Authorization: \`Bearer \${token}\` }
              });
              
              if (response.data.success) {
                // Update credits display
                document.getElementById('credits').textContent = response.data.credits;
                
                // Update currency selector
                const currencySelector = document.getElementById('currency-selector');
                currencySelector.value = response.data.user.currency || 'EUR';
                
                // Update language selector  
                const languageSelector = document.getElementById('language-selector');
                languageSelector.value = response.data.user.language || 'en';
                
                // Show user menu, hide auth buttons
                document.getElementById('auth-buttons').classList.add('hidden');
                document.getElementById('user-menu').classList.remove('hidden');
                
                // Setup user menu event listeners
                document.getElementById('checkout-btn').addEventListener('click', () => {
                  window.location.href = '/checkout';
                });
                
                document.getElementById('logout-btn').addEventListener('click', () => {
                  localStorage.removeItem('auth_token');
                  window.location.reload();
                });
              }
            } catch (error) {
              console.error('Failed to load profile:', error);
              localStorage.removeItem('auth_token');
              // Keep auth buttons visible for guests
            }
          }
          
          async function loadExchangeRates() {
            try {
              const response = await axios.get('/api/currency/rates');
              if (response.data.success) {
                console.log('Exchange rates loaded:', response.data.rates);
                // Store rates for pricing calculations
                window.exchangeRates = response.data.rates;
              }
            } catch (error) {
              console.error('Failed to load exchange rates:', error);
            }
          }
        `}</script>
      </body>
    </html>
  )
})

// Checkout page
app.get('/checkout', (c) => {
  return c.render(<CheckoutPage />)
})

// Checkout success page
app.get('/checkout/success', (c) => {
  const transactionId = c.req.query('transaction_id') || 'unknown';
  
  return c.render(
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Payment Successful - AstroLuna</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet" />
      </head>
      <body className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 min-h-screen flex items-center justify-center text-white">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-check text-3xl text-white"></i>
            </div>
            <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
            <p className="text-gray-300">Your credits have been added to your account</p>
          </div>
          
          <div className="bg-black/20 backdrop-blur-md p-6 rounded-xl border border-green-500/30 mb-6">
            <p className="text-sm text-gray-400 mb-2">Transaction ID:</p>
            <p className="font-mono text-sm break-all">{transactionId}</p>
          </div>
          
          <div className="space-y-3">
            <a href="/dashboard" className="block w-full bg-gradient-to-r from-purple-600 to-blue-600 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity">
              Go to Dashboard
            </a>
            <a href="/" className="block w-full border border-gray-600 py-3 rounded-lg font-semibold hover:bg-gray-600/20 transition-colors">
              Back to Home
            </a>
          </div>
        </div>
      </body>
    </html>
  )
})

// Checkout cancel page
app.get('/checkout/cancel', (c) => {
  return c.render(
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Payment Cancelled - AstroLuna</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet" />
      </head>
      <body className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 min-h-screen flex items-center justify-center text-white">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="mb-6">
            <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-times text-3xl text-white"></i>
            </div>
            <h1 className="text-3xl font-bold mb-2">Payment Cancelled</h1>
            <p className="text-gray-300">Your payment was cancelled. No charges were made.</p>
          </div>
          
          <div className="space-y-3">
            <a href="/checkout" className="block w-full bg-gradient-to-r from-purple-600 to-blue-600 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity">
              Try Again
            </a>
            <a href="/" className="block w-full border border-gray-600 py-3 rounded-lg font-semibold hover:bg-gray-600/20 transition-colors">
              Back to Home
            </a>
          </div>
        </div>
      </body>
    </html>
  )
})

// Login page
app.get('/login', (c) => {
  return c.render(
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Login - AstroLuna</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 min-h-screen flex items-center justify-center">
        <div className="bg-black/20 backdrop-blur-md p-8 rounded-xl border border-purple-500/30 w-full max-w-md">
          <h1 className="text-3xl font-bold text-center text-white mb-8">Welcome Back</h1>
          <form id="loginForm" className="space-y-6">
            <div>
              <label className="block text-gray-300 mb-2">Email</label>
              <input 
                type="email" 
                name="email" 
                required 
                className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Password</label>
              <input 
                type="password" 
                name="password" 
                required 
                className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                placeholder="••••••••"
              />
            </div>
            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 py-3 rounded-lg font-semibold text-white hover:opacity-90 transition-opacity"
            >
              Sign In
            </button>
          </form>
          <div className="mt-6 text-center">
            <a href="/forgot-password" className="text-purple-400 hover:text-purple-300">Forgot Password?</a>
          </div>
          <div className="mt-4 text-center">
            <span className="text-gray-400">Don't have an account? </span>
            <a href="/signup" className="text-purple-400 hover:text-purple-300">Sign up</a>
          </div>
        </div>
        
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>{`
          document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const data = {
              email: formData.get('email'),
              password: formData.get('password')
            };
            
            try {
              const response = await axios.post('/api/auth/login', data);
              
              if (response.data.success) {
                localStorage.setItem('auth_token', response.data.token);
                window.location.href = '/dashboard';
              }
            } catch (error) {
              const message = error.response?.data?.error || 'Login failed';
              alert(message);
            }
          });
        `}</script>
      </body>
    </html>
  )
})

// Signup page
app.get('/signup', (c) => {
  return c.render(
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Sign Up - AstroLuna</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet" />
      </head>
      <body className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 min-h-screen flex items-center justify-center">
        <div className="bg-black/20 backdrop-blur-md p-8 rounded-xl border border-purple-500/30 w-full max-w-lg">
          <h1 className="text-3xl font-bold text-center text-white mb-8">Join AstroLuna</h1>
          <form id="signupForm" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 mb-2">Full Name</label>
                <input 
                  type="text" 
                  name="full_name" 
                  required 
                  className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Phone</label>
                <input 
                  type="tel" 
                  name="phone" 
                  required 
                  className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                  placeholder="+1234567890"
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Email</label>
              <input 
                type="email" 
                name="email" 
                required 
                className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                placeholder="your@email.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 mb-2">Password</label>
                <input 
                  type="password" 
                  name="password" 
                  required 
                  minLength="6"
                  className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Confirm Password</label>
                <input 
                  type="password" 
                  name="confirm_password" 
                  required 
                  minLength="6"
                  className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 mb-2">Language</label>
                <select name="language" className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none">
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="de">Deutsch</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Currency</label>
                <select name="currency" className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none">
                  <option value="EUR">€ EUR</option>
                  <option value="USD">$ USD</option>
                  <option value="GBP">£ GBP</option>
                </select>
              </div>
            </div>
            <div className="mt-6">
              <label className="flex items-center space-x-3">
                <input type="checkbox" name="privacy_accepted" required className="w-5 h-5 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500" />
                <span className="text-sm text-gray-300">
                  I consent to the <a href="/privacy" className="text-purple-400 hover:text-purple-300 underline">Privacy Policy</a> and 
                  <a href="/terms" className="text-purple-400 hover:text-purple-300 underline"> User Terms</a>
                </span>
              </label>
            </div>
            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 py-3 rounded-lg font-semibold text-white hover:opacity-90 transition-opacity"
            >
              Create Account
            </button>
          </form>
          <div className="mt-6 text-center">
            <span className="text-gray-400">Already have an account? </span>
            <a href="/login" className="text-purple-400 hover:text-purple-300">Sign in</a>
          </div>
        </div>
        
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>{`
          document.getElementById('signupForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const data = {
              full_name: formData.get('full_name'),
              email: formData.get('email'),
              phone: formData.get('phone'),
              password: formData.get('password'),
              confirm_password: formData.get('confirm_password'),
              language: formData.get('language'),
              currency: formData.get('currency'),
              privacy_accepted: formData.get('privacy_accepted') === 'on'
            };
            
            // Validate password match
            if (data.password !== data.confirm_password) {
              alert('Passwords do not match');
              return;
            }
            
            try {
              const response = await axios.post('/api/auth/signup', data);
              
              if (response.data.success) {
                localStorage.setItem('auth_token', response.data.token);
                alert('Account created successfully! Welcome to AstroLuna!');
                window.location.href = '/';
              }
            } catch (error) {
              const message = error.response?.data?.error || 'Registration failed';
              alert(message);
            }
          });
        `}</script>
      </body>
    </html>
  )
})

// 404 handler
app.notFound((c) => {
  return c.render(
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>404 - Page Not Found</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 min-h-screen flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-4">404</h1>
          <p className="text-xl mb-8">The stars couldn't locate this page</p>
          <a href="/" className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 rounded-lg hover:opacity-90 transition-opacity">
            Return to Home
          </a>
        </div>
      </body>
    </html>
  )
})

export default app
