import { Hono } from 'hono'
import { renderer } from './renderer'
import { corsMiddleware, rateLimit } from './middleware/auth'
import authRoutes from './routes/auth'
import currencyRoutes from './routes/currency'
const app = new Hono()

// Apply CORS middleware to all routes
app.use('*', corsMiddleware)

// Apply rate limiting to API routes
app.use('/api/*', rateLimit(100, 15 * 60 * 1000)) // 100 requests per 15 minutes

// Use renderer for HTML pages
app.use(renderer)

// Import payment routes
import paymentRoutes from './routes/payments'
import aiServicesRoutes from './routes/ai-services'
import { CheckoutPage } from './components/checkout'

// API routes
app.route('/api/auth', authRoutes)
app.route('/api/currency', currencyRoutes)
app.route('/api/payments', paymentRoutes)
app.route('/api/ai', aiServicesRoutes)

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
        <section className="hero-section">
          <div className="hero-content max-w-4xl mx-auto px-6">
            <div className="moon-icon mx-auto mb-6"></div>
            <h1 className="text-6xl md:text-7xl font-bold mb-6 cosmic-heading">
              Discover Your Cosmic Destiny
            </h1>
            <p className="text-xl md:text-2xl cosmic-text mb-8 leading-relaxed">
              AI-powered astrology oracle that combines the wisdom of stars and Tarot cards to reveal your personalized cosmic insights
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <a href="/tarotpath" className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 rounded-lg text-lg font-semibold hover:glow transition-all inline-block text-center">
                <i className="fas fa-cards-blank mr-2"></i>
                Get Tarot Reading
              </a>
              <a href="/astroscope" className="bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-4 rounded-lg text-lg font-semibold hover:glow transition-all inline-block text-center">
                <i className="fas fa-moon mr-2"></i>
                Generate Horoscope
              </a>
            </div>
            <a href="/zodiac" className="inline-block mt-6 text-purple-400 hover:text-purple-300 underline">
              Learn about zodiac signs
            </a>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-16 cosmic-heading">
              What's Inside
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {/* AstroScope */}
              <div className="astroscope-section service-section">
                <div className="service-content glass-card lunar-glow">
                  <div className="text-4xl mb-4 text-purple-400">
                    <i className="fas fa-moon"></i>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 cosmic-text">AstroScope</h3>
                  <p className="text-gray-300 mb-6">
                    Personalized monthly horoscopes with key events and favorable dates based on your birth data
                  </p>
                  <a href="/astroscope" className="w-full bg-gradient-to-r from-purple-600 to-blue-600 py-3 rounded-lg font-semibold hover:glow transition-all inline-block text-center">
                    Get Started
                  </a>
                </div>
              </div>

              {/* TarotPath */}
              <div className="tarotpath-section service-section">
                <div className="service-content glass-card teal-glow">
                  <div className="text-4xl mb-4 text-pink-400">
                    <i className="fas fa-cards-blank"></i>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 cosmic-text">TarotPath</h3>
                  <p className="text-gray-300 mb-6">
                    AI-generated Tarot card spreads that reveal your lunar path with interactive virtual deck
                  </p>
                  <a href="/tarotpath" className="w-full bg-gradient-to-r from-pink-600 to-purple-600 py-3 rounded-lg font-semibold hover:glow transition-all inline-block text-center">
                    Get Started
                  </a>
                </div>
              </div>

              {/* ZodiacTome */}
              <div className="zodictome-section service-section">
                <div className="service-content glass-card lunar-glow">
                  <div className="text-4xl mb-4 text-cyan-400">
                    <i className="fas fa-star-of-david"></i>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 cosmic-text">ZodiacTome</h3>
                  <p className="text-gray-300 mb-6">
                    Comprehensive zodiac knowledge base with compatibility analysis and AI-powered insights
                  </p>
                  <a href="/zodiac" className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 py-3 rounded-lg font-semibold hover:glow transition-all inline-block text-center">
                    Get Started
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Zodiac Signs Preview */}
        <section className="zodiac-bg service-section">
          <div className="service-content max-w-6xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-16 cosmic-heading">
              Explore All 12 Zodiac Signs
            </h2>
            <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-12 gap-4 mb-12">
              <div className="cosmic-particle">
                <div className="zodiac-sign zodiac-aries mx-auto" title="Aries"></div>
                <p className="cosmic-text mt-2 text-xs">♈ Aries</p>
              </div>
              <div className="cosmic-particle" style="animation-delay: 0.2s;">
                <div className="zodiac-sign zodiac-taurus mx-auto" title="Taurus"></div>
                <p className="cosmic-text mt-2 text-xs">♉ Taurus</p>
              </div>
              <div className="cosmic-particle" style="animation-delay: 0.4s;">
                <div className="zodiac-sign zodiac-gemini mx-auto" title="Gemini"></div>
                <p className="cosmic-text mt-2 text-xs">♊ Gemini</p>
              </div>
              <div className="cosmic-particle" style="animation-delay: 0.6s;">
                <div className="zodiac-sign zodiac-cancer mx-auto" title="Cancer"></div>
                <p className="cosmic-text mt-2 text-xs">♋ Cancer</p>
              </div>
              <div className="cosmic-particle" style="animation-delay: 0.8s;">
                <div className="zodiac-sign zodiac-leo mx-auto" title="Leo"></div>
                <p className="cosmic-text mt-2 text-xs">♌ Leo</p>
              </div>
              <div className="cosmic-particle" style="animation-delay: 1.0s;">
                <div className="zodiac-sign zodiac-virgo mx-auto" title="Virgo"></div>
                <p className="cosmic-text mt-2 text-xs">♍ Virgo</p>
              </div>
              <div className="cosmic-particle" style="animation-delay: 1.2s;">
                <div className="zodiac-sign zodiac-libra mx-auto" title="Libra"></div>
                <p className="cosmic-text mt-2 text-xs">♎ Libra</p>
              </div>
              <div className="cosmic-particle" style="animation-delay: 1.4s;">
                <div className="zodiac-sign zodiac-scorpio mx-auto" title="Scorpio"></div>
                <p className="cosmic-text mt-2 text-xs">♏ Scorpio</p>
              </div>
              <div className="cosmic-particle" style="animation-delay: 1.6s;">
                <div className="zodiac-sign zodiac-sagittarius mx-auto" title="Sagittarius"></div>
                <p className="cosmic-text mt-2 text-xs">♐ Sagittarius</p>
              </div>
              <div className="cosmic-particle" style="animation-delay: 1.8s;">
                <div className="zodiac-sign zodiac-capricorn mx-auto" title="Capricorn"></div>
                <p className="cosmic-text mt-2 text-xs">♑ Capricorn</p>
              </div>
              <div className="cosmic-particle" style="animation-delay: 2.0s;">
                <div className="zodiac-sign zodiac-aquarius mx-auto" title="Aquarius"></div>
                <p className="cosmic-text mt-2 text-xs">♒ Aquarius</p>
              </div>
              <div className="cosmic-particle" style="animation-delay: 2.2s;">
                <div className="zodiac-sign zodiac-pisces mx-auto" title="Pisces"></div>
                <p className="cosmic-text mt-2 text-xs">♓ Pisces</p>
              </div>
            </div>
            <a href="/zodiac" className="inline-block bg-gradient-to-r from-cyan-600 to-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:glow transition-all lunar-glow">
              <i className="fas fa-star-of-david mr-2"></i>
              Explore Detailed Analysis
            </a>
          </div>
        </section>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script dangerouslySetInnerHTML={{__html: `
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
        `}} />
        
        {/* Footer */}
        <footer className="bg-black/30 backdrop-blur-md border-t border-purple-500/20 mt-16">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Brand */}
              <div className="md:col-span-1">
                <h3 className="text-2xl font-bold text-white mb-4">
                  🌙 AstroLuna
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  AI-powered astrology platform providing personalized cosmic insights, tarot readings, and zodiac analysis.
                </p>
              </div>
              
              {/* Services */}
              <div>
                <h4 className="text-white font-semibold mb-4">Services</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="/astroscope" className="text-gray-300 hover:text-purple-400 transition-colors">🌙 AstroScope</a></li>
                  <li><a href="/tarotpath" className="text-gray-300 hover:text-purple-400 transition-colors">🔮 TarotPath</a></li>
                  <li><a href="/zodiac" className="text-gray-300 hover:text-purple-400 transition-colors">⭐ ZodiacTome</a></li>
                  <li><a href="/dashboard" className="text-gray-300 hover:text-purple-400 transition-colors">📊 Dashboard</a></li>
                </ul>
              </div>
              
              {/* Account */}
              <div>
                <h4 className="text-white font-semibold mb-4">Account</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="/login" className="text-gray-300 hover:text-purple-400 transition-colors">Sign In</a></li>
                  <li><a href="/signup" className="text-gray-300 hover:text-purple-400 transition-colors">Sign Up</a></li>
                  <li><a href="/checkout" className="text-gray-300 hover:text-purple-400 transition-colors">Get Credits</a></li>
                </ul>
              </div>
              
              {/* Legal & Contact */}
              <div>
                <h4 className="text-white font-semibold mb-4">Legal</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="/privacy" className="text-gray-300 hover:text-purple-400 transition-colors">Privacy Policy</a></li>
                  <li><a href="/terms" className="text-gray-300 hover:text-purple-400 transition-colors">Terms of Service</a></li>
                  <li><a href="/contact" className="text-gray-300 hover:text-purple-400 transition-colors">Contact</a></li>
                </ul>
              </div>
            </div>
            
            {/* Bottom Bar */}
            <div className="border-t border-purple-500/20 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                © 2024 AstroLuna. All rights reserved.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                  <i className="fab fa-facebook"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                  <i className="fab fa-instagram"></i>
                </a>
              </div>
            </div>
          </div>
        </footer>
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
  const isDemo = c.req.query('demo') === 'true';
  
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
            <h1 className="text-3xl font-bold mb-2">
              {isDemo ? 'Demo Payment Completed!' : 'Payment Successful!'}
            </h1>
            <p className="text-gray-300">
              {isDemo ? 'Demo credits have been simulated' : 'Your credits have been added to your account'}
            </p>
            {isDemo && (
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3 mt-3">
                <p className="text-yellow-300 text-sm">
                  <i className="fas fa-info-circle mr-2"></i>
                  This was a demo transaction - no real payment was processed
                </p>
              </div>
            )}
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

// AstroScope service page
app.get('/astroscope', (c) => {
  return c.render(
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>AstroScope - AI Horoscope Generator</title>
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
        `}</style>
      </head>
      <body className="text-white">
        {/* Navigation */}
        <nav className="fixed top-0 w-full z-50 bg-black/20 backdrop-blur-md border-b border-purple-500/20">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-8">
                <a href="/" className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                  AstroLuna
                </a>
                <div className="hidden md:flex space-x-6">
                  <a href="/astroscope" className="text-purple-400 font-semibold">AstroScope</a>
                  <a href="/tarotpath" className="text-gray-300 hover:text-purple-400 transition-colors">TarotPath</a>
                  <a href="/zodiac" className="text-gray-300 hover:text-purple-400 transition-colors">ZodiacTome</a>
                  <a href="/dashboard" className="text-gray-300 hover:text-purple-400 transition-colors">Dashboard</a>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div id="credits-display" className="bg-gray-800/50 px-3 py-1 rounded text-sm">
                  <i className="fas fa-coins text-yellow-400 mr-1"></i>
                  <span id="credits">0</span> credits
                </div>
                <div id="auth-buttons">
                  <a href="/login" className="bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 rounded-lg hover:glow transition-all inline-block">
                    Login
                  </a>
                </div>
                <div id="user-menu" className="hidden">
                  <button id="logout-btn" className="text-gray-300 hover:text-white">
                    <i className="fas fa-sign-out-alt mr-1"></i> Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="astroscope-bg pt-24 min-h-screen">
          <div className="max-w-4xl mx-auto px-6 py-8">
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                <i className="fas fa-moon mr-3"></i>AstroScope
              </h1>
              <p className="text-xl text-gray-300">
                Get personalized AI-generated horoscopes based on your birth data and current celestial positions
              </p>
            </div>

            {/* Service Options */}
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {/* Personalized Horoscope */}
              <div className="bg-gray-800/30 backdrop-blur-sm border border-purple-500/30 rounded-xl p-8">
                <div className="text-center mb-6">
                  <div className="text-4xl text-purple-400 mb-4">
                    <i className="fas fa-user-astronaut"></i>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Personalized Reading</h3>
                  <p className="text-gray-400 mb-4">
                    Complete horoscope with birth chart analysis, favorable dates, and key cosmic events
                  </p>
                  <div className="text-yellow-400 font-semibold mb-4">
                    <i className="fas fa-coins mr-2"></i>15 credits
                  </div>
                </div>
                
                <form id="personalizedForm" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 mb-2">Birth Date</label>
                      <input type="date" name="birth_date" required 
                        className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-gray-300 mb-2">Birth Time</label>
                      <input type="time" name="birth_time" required 
                        className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2">Birth Location</label>
                    <input type="text" name="birth_location" required placeholder="City, Country"
                      className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2">Reading Period</label>
                    <select name="period" required 
                      className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none">
                      <option value="daily">Daily (Today)</option>
                      <option value="weekly">Weekly (7 days)</option>
                      <option value="monthly" selected>Monthly (30 days)</option>
                    </select>
                  </div>
                  <button type="submit" 
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 py-3 rounded-lg font-semibold hover:glow transition-all">
                    Generate Personalized Horoscope
                  </button>
                </form>
              </div>

              {/* Quick Horoscope */}
              <div className="bg-gray-800/30 backdrop-blur-sm border border-blue-500/30 rounded-xl p-8">
                <div className="text-center mb-6">
                  <div className="text-4xl text-blue-400 mb-4">
                    <i className="fas fa-rocket"></i>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Quick Reading</h3>
                  <p className="text-gray-400 mb-4">
                    Fast horoscope based on your zodiac sign and current planetary positions
                  </p>
                  <div className="text-yellow-400 font-semibold mb-4">
                    <i className="fas fa-coins mr-2"></i>15 credits
                  </div>
                </div>
                
                <form id="quickForm" className="space-y-4">
                  <div>
                    <label className="block text-gray-300 mb-2">Zodiac Sign</label>
                    <select name="zodiac_sign" required 
                      className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none">
                      <option value="">Select your sign</option>
                      <option value="aries">♈ Aries (Mar 21 - Apr 19)</option>
                      <option value="taurus">♉ Taurus (Apr 20 - May 20)</option>
                      <option value="gemini">♊ Gemini (May 21 - Jun 20)</option>
                      <option value="cancer">♋ Cancer (Jun 21 - Jul 22)</option>
                      <option value="leo">♌ Leo (Jul 23 - Aug 22)</option>
                      <option value="virgo">♍ Virgo (Aug 23 - Sep 22)</option>
                      <option value="libra">♎ Libra (Sep 23 - Oct 22)</option>
                      <option value="scorpio">♏ Scorpio (Oct 23 - Nov 21)</option>
                      <option value="sagittarius">♐ Sagittarius (Nov 22 - Dec 21)</option>
                      <option value="capricorn">♑ Capricorn (Dec 22 - Jan 19)</option>
                      <option value="aquarius">♒ Aquarius (Jan 20 - Feb 18)</option>
                      <option value="pisces">♓ Pisces (Feb 19 - Mar 20)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2">Reading Period</label>
                    <select name="period" required 
                      className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none">
                      <option value="daily">Daily (Today)</option>
                      <option value="weekly">Weekly (7 days)</option>
                      <option value="monthly" selected>Monthly (30 days)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2">Focus Areas (Optional)</label>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" name="focus" value="love" className="rounded text-purple-600" />
                        <span>Love & Relationships</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" name="focus" value="career" className="rounded text-purple-600" />
                        <span>Career & Finance</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" name="focus" value="health" className="rounded text-purple-600" />
                        <span>Health & Wellness</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" name="focus" value="spiritual" className="rounded text-purple-600" />
                        <span>Spiritual Growth</span>
                      </label>
                    </div>
                  </div>
                  <button type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 py-3 rounded-lg font-semibold hover:glow transition-all">
                    Generate Quick Horoscope
                  </button>
                </form>
              </div>
            </div>

            {/* Results Section */}
            <div id="results" className="hidden">
              <div className="bg-gray-800/30 backdrop-blur-sm border border-green-500/30 rounded-xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-green-400">
                    <i className="fas fa-magic mr-2"></i>Your Horoscope
                  </h3>
                  <button id="saveReading" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors">
                    <i className="fas fa-save mr-2"></i>Save to Library
                  </button>
                </div>
                <div id="horoscopeContent" className="prose prose-invert max-w-none">
                  {/* Generated content will appear here */}
                </div>
              </div>
            </div>

            {/* Loading State */}
            <div id="loading" className="hidden text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mb-4"></div>
              <p className="text-gray-300">The stars are aligning your cosmic reading...</p>
            </div>
          </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script dangerouslySetInnerHTML={{__html: `
          document.addEventListener('DOMContentLoaded', function() {
            loadUserProfile();
            
            // Setup form handlers
            document.getElementById('personalizedForm').addEventListener('submit', handlePersonalizedForm);
            document.getElementById('quickForm').addEventListener('submit', handleQuickForm);
          });
          
          async function loadUserProfile() {
            try {
              const token = localStorage.getItem('auth_token');
              if (!token) {
                document.getElementById('auth-buttons').classList.remove('hidden');
                return;
              }
              
              const response = await axios.get('/api/auth/profile', {
                headers: { Authorization: \`Bearer \${token}\` }
              });
              
              if (response.data.success) {
                document.getElementById('credits').textContent = response.data.credits;
                document.getElementById('auth-buttons').classList.add('hidden');
                document.getElementById('user-menu').classList.remove('hidden');
                
                document.getElementById('logout-btn').addEventListener('click', () => {
                  localStorage.removeItem('auth_token');
                  window.location.href = '/';
                });
              }
            } catch (error) {
              console.error('Failed to load profile:', error);
              document.getElementById('auth-buttons').classList.remove('hidden');
            }
          }
          
          async function handlePersonalizedForm(e) {
            e.preventDefault();
            
            const token = localStorage.getItem('auth_token');
            if (!token) {
              alert('Please login to generate horoscopes');
              window.location.href = '/login';
              return;
            }
            
            const formData = new FormData(e.target);
            const data = {
              type: 'personalized',
              birth_date: formData.get('birth_date'),
              birth_time: formData.get('birth_time'),
              birth_location: formData.get('birth_location'),
              period: formData.get('period')
            };
            
            await generateHoroscope(data, token);
          }
          
          async function handleQuickForm(e) {
            e.preventDefault();
            
            const token = localStorage.getItem('auth_token');
            if (!token) {
              alert('Please login to generate horoscopes');
              window.location.href = '/login';
              return;
            }
            
            const formData = new FormData(e.target);
            const focusAreas = Array.from(formData.getAll('focus'));
            
            const data = {
              type: 'quick',
              zodiac_sign: formData.get('zodiac_sign'),
              period: formData.get('period'),
              focus_areas: focusAreas
            };
            
            await generateHoroscope(data, token);
          }
          
          async function generateHoroscope(data, token) {
            try {
              document.getElementById('loading').classList.remove('hidden');
              document.getElementById('results').classList.add('hidden');
              
              const response = await axios.post('/api/ai/astroscope/generate', data, {
                headers: { 
                  Authorization: \`Bearer \${token}\`,
                  'Content-Type': 'application/json'
                }
              });
              
              if (response.data.success) {
                const horoscope = response.data.horoscope;
                
                // Create structured horoscope display
                let horoscopeHTML = '<div class="space-y-6">';
                horoscopeHTML += '<div class="text-center mb-6">';
                horoscopeHTML += '<h2 class="text-2xl font-bold text-purple-400 mb-2">' + horoscope.title + '</h2>';
                horoscopeHTML += '</div>';
                
                // Love & Relationships section
                if (horoscope.content.love) {
                  const loveContent = typeof horoscope.content.love === 'string' ? horoscope.content.love : 'Love energies are flowing positively this month.';
                  horoscopeHTML += '<div class="bg-pink-900/20 border border-pink-500/30 rounded-lg p-4">';
                  horoscopeHTML += '<h3 class="text-xl font-semibold text-pink-400 mb-3">';
                  horoscopeHTML += '<i class="fas fa-heart mr-2"></i>Love & Relationships</h3>';
                  horoscopeHTML += '<p class="text-gray-200 leading-relaxed">' + loveContent + '</p>';
                  horoscopeHTML += '</div>';
                }
                
                // Career & Finance section  
                if (horoscope.content.career) {
                  const careerContent = typeof horoscope.content.career === 'string' ? horoscope.content.career : 'Professional opportunities await your attention.';
                  horoscopeHTML += '<div class="bg-green-900/20 border border-green-500/30 rounded-lg p-4">';
                  horoscopeHTML += '<h3 class="text-xl font-semibold text-green-400 mb-3">';
                  horoscopeHTML += '<i class="fas fa-briefcase mr-2"></i>Career & Finance</h3>';
                  horoscopeHTML += '<p class="text-gray-200 leading-relaxed">' + careerContent + '</p>';
                  horoscopeHTML += '</div>';
                }
                
                // Health & Energy section
                if (horoscope.content.health) {
                  const healthContent = typeof horoscope.content.health === 'string' ? horoscope.content.health : 'Focus on maintaining balance in all areas of life.';
                  horoscopeHTML += '<div class="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">';
                  horoscopeHTML += '<h3 class="text-xl font-semibold text-blue-400 mb-3">';
                  horoscopeHTML += '<i class="fas fa-heart-pulse mr-2"></i>Health & Energy</h3>';
                  horoscopeHTML += '<p class="text-gray-200 leading-relaxed">' + healthContent + '</p>';
                  horoscopeHTML += '</div>';
                }
                
                // Personal Growth section
                if (horoscope.content.personal) {
                  const personalContent = typeof horoscope.content.personal === 'string' ? horoscope.content.personal : 'Personal growth opportunities are highlighted.';
                  horoscopeHTML += '<div class="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">';
                  horoscopeHTML += '<h3 class="text-xl font-semibold text-purple-400 mb-3">';
                  horoscopeHTML += '<i class="fas fa-star mr-2"></i>Personal Growth</h3>';
                  horoscopeHTML += '<p class="text-gray-200 leading-relaxed">' + personalContent + '</p>';
                  horoscopeHTML += '</div>';
                }
                
                // Key Dates section
                if (horoscope.content.keyDates && Array.isArray(horoscope.content.keyDates) && horoscope.content.keyDates.length > 0) {
                  horoscopeHTML += '<div class="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">';
                  horoscopeHTML += '<h3 class="text-xl font-semibold text-yellow-400 mb-3">';
                  horoscopeHTML += '<i class="fas fa-calendar-alt mr-2"></i>Key Dates</h3>';
                  horoscopeHTML += '<div class="grid grid-cols-1 md:grid-cols-2 gap-3">';
                  
                  horoscope.content.keyDates.forEach(date => {
                    if (date && typeof date === 'object') {
                      const dateText = typeof date.date === 'string' ? date.date : 'Important Date';
                      const descText = typeof date.description === 'string' ? date.description : 'A day of special significance.';
                      horoscopeHTML += '<div class="bg-gray-800/50 rounded-lg p-3">';
                      horoscopeHTML += '<div class="font-semibold text-yellow-300">' + dateText + '</div>';
                      horoscopeHTML += '<div class="text-sm text-gray-300">' + descText + '</div>';
                      horoscopeHTML += '</div>';
                    }
                  });
                  
                  horoscopeHTML += '</div></div>';
                }
                
                horoscopeHTML += '</div>';
                
                document.getElementById('horoscopeContent').innerHTML = horoscopeHTML;
                document.getElementById('results').classList.remove('hidden');
                
                // Update credits display
                document.getElementById('credits').textContent = response.data.remaining_credits || 0;
                
                // Setup save button
                document.getElementById('saveReading').onclick = () => saveToLibrary(response.data.content_id);
              } else {
                alert(response.data.error || 'Failed to generate horoscope');
              }
            } catch (error) {
              console.error('Generation error:', error);
              let message = 'Failed to generate horoscope';
              if (error.response && error.response.data && error.response.data.error) {
                message = error.response.data.error;
              }
              alert(message);
            } finally {
              document.getElementById('loading').classList.add('hidden');
            }
          }
          
          async function saveToLibrary(readingId) {
            try {
              const token = localStorage.getItem('auth_token');
              const response = await axios.post('/api/ai/save-reading', 
                { reading_id: readingId },
                { headers: { Authorization: \`Bearer \${token}\` } }
              );
              
              if (response.data.success) {
                alert('Reading saved to your library!');
                document.getElementById('saveReading').innerHTML = 
                  '<i class="fas fa-check mr-2"></i>Saved';
                document.getElementById('saveReading').disabled = true;
              }
            } catch (error) {
              console.error('Save error:', error);
              alert('Failed to save reading');
            }
          }
        `}} />
      </body>
    </html>
  )
})

// TarotPath service page
app.get('/tarotpath', (c) => {
  return c.render(
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>TarotPath - AI Tarot Card Readings</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet" />
        <style>{`
          body { 
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
            min-height: 100vh;
          }
          .glow { 
            box-shadow: 0 0 20px rgba(219, 39, 119, 0.5);
          }
          .tarot-card {
            background: linear-gradient(145deg, #2a2a40, #1a1a30);
            border: 2px solid rgba(219, 39, 119, 0.3);
            transition: all 0.3s ease;
          }
          .tarot-card:hover {
            border-color: rgba(219, 39, 119, 0.6);
            transform: translateY(-5px);
          }
        `}</style>
      </head>
      <body className="text-white">
        {/* Navigation */}
        <nav className="fixed top-0 w-full z-50 bg-black/20 backdrop-blur-md border-b border-purple-500/20">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-8">
                <a href="/" className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                  AstroLuna
                </a>
                <div className="hidden md:flex space-x-6">
                  <a href="/astroscope" className="text-gray-300 hover:text-purple-400 transition-colors">AstroScope</a>
                  <a href="/tarotpath" className="text-pink-400 font-semibold">TarotPath</a>
                  <a href="/zodiac" className="text-gray-300 hover:text-purple-400 transition-colors">ZodiacTome</a>
                  <a href="/dashboard" className="text-gray-300 hover:text-purple-400 transition-colors">Dashboard</a>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div id="credits-display" className="bg-gray-800/50 px-3 py-1 rounded text-sm">
                  <i className="fas fa-coins text-yellow-400 mr-1"></i>
                  <span id="credits">0</span> credits
                </div>
                <div id="auth-buttons">
                  <a href="/login" className="bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 rounded-lg hover:glow transition-all inline-block">
                    Login
                  </a>
                </div>
                <div id="user-menu" className="hidden">
                  <button id="logout-btn" className="text-gray-300 hover:text-white">
                    <i className="fas fa-sign-out-alt mr-1"></i> Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="tarotpath-bg pt-24 min-h-screen">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                <i className="fas fa-cards-blank mr-3"></i>TarotPath
              </h1>
              <p className="text-xl text-gray-300">
                Discover your lunar path through AI-generated Tarot card spreads and intuitive guidance
              </p>
            </div>

            {/* Tarot Reading Setup */}
            <div className="bg-gray-800/30 backdrop-blur-sm border border-pink-500/30 rounded-xl p-8 mb-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">5-Card Lunar Path Reading</h3>
                <p className="text-gray-400 mb-4">
                  Explore your past, present, future, and the cosmic forces guiding your journey
                </p>
                <div className="text-yellow-400 font-semibold mb-6">
                  <i className="fas fa-coins mr-2"></i>20 credits
                </div>
              </div>
              
              <form id="tarotForm" className="max-w-lg mx-auto space-y-6">
                <div>
                  <label className="block text-gray-300 mb-2">Your Question or Focus Area</label>
                  <textarea name="question" rows="3" required placeholder="What guidance do you seek from the cards?"
                    className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-pink-500 focus:outline-none resize-none"></textarea>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 mb-2">Reading Type</label>
                    <select name="reading_type" required 
                      className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-pink-500 focus:outline-none">
                      <option value="general">General Guidance</option>
                      <option value="love">Love & Relationships</option>
                      <option value="career">Career & Goals</option>
                      <option value="spiritual">Spiritual Path</option>
                      <option value="decision">Decision Making</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2">Spread Layout</label>
                    <select name="spread_type" required 
                      className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-pink-500 focus:outline-none">
                      <option value="lunar_path">Lunar Path (5 cards)</option>
                      <option value="celtic_cross">Celtic Cross (5 cards)</option>
                      <option value="chakra_flow">Chakra Flow (5 cards)</option>
                      <option value="elements">Four Elements (5 cards)</option>
                    </select>
                  </div>
                </div>
                
                <div className="text-center">
                  <button type="submit" 
                    className="bg-gradient-to-r from-pink-600 to-purple-600 px-8 py-4 rounded-lg font-semibold text-lg hover:glow transition-all">
                    <i className="fas fa-magic mr-2"></i>Draw Your Cards
                  </button>
                </div>
              </form>
            </div>

            {/* Virtual Card Animation */}
            <div id="cardSelection" className="hidden mb-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-pink-400 mb-2">Choose Your Cards</h3>
                <p className="text-gray-400">Focus on your question and select 5 cards from the deck</p>
              </div>
              
              <div className="flex flex-wrap justify-center gap-2 mb-6" id="cardDeck">
                {/* Virtual cards will be generated here */}
              </div>
              
              <div className="text-center">
                <div id="selectedCards" className="flex justify-center gap-4 mb-4 min-h-[120px]">
                  {/* Selected cards will appear here */}
                </div>
                <button id="revealCards" className="hidden bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 rounded-lg font-semibold hover:glow transition-all">
                  <i className="fas fa-eye mr-2"></i>Reveal Your Reading
                </button>
              </div>
            </div>

            {/* Results Section */}
            <div id="results" className="hidden">
              <div className="bg-gray-800/30 backdrop-blur-sm border border-green-500/30 rounded-xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-green-400">
                    <i className="fas fa-magic mr-2"></i>Your Tarot Reading
                  </h3>
                  <button id="saveReading" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors">
                    <i className="fas fa-save mr-2"></i>Save to Library
                  </button>
                </div>
                <div id="readingContent" className="prose prose-invert max-w-none">
                  {/* Generated content will appear here */}
                </div>
              </div>
            </div>

            {/* Loading State */}
            <div id="loading" className="hidden text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400 mb-4"></div>
              <p className="text-gray-300">The cards are revealing their wisdom...</p>
            </div>
          </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script dangerouslySetInnerHTML={{__html: `
          let selectedCardIds = [];
          let readingData = {};
          
          document.addEventListener('DOMContentLoaded', function() {
            loadUserProfile();
            document.getElementById('tarotForm').addEventListener('submit', handleTarotForm);
          });
          
          async function loadUserProfile() {
            try {
              const token = localStorage.getItem('auth_token');
              if (!token) {
                document.getElementById('auth-buttons').classList.remove('hidden');
                return;
              }
              
              const response = await axios.get('/api/auth/profile', {
                headers: { Authorization: \`Bearer \${token}\` }
              });
              
              if (response.data.success) {
                document.getElementById('credits').textContent = response.data.credits;
                document.getElementById('auth-buttons').classList.add('hidden');
                document.getElementById('user-menu').classList.remove('hidden');
                
                document.getElementById('logout-btn').addEventListener('click', () => {
                  localStorage.removeItem('auth_token');
                  window.location.href = '/';
                });
              }
            } catch (error) {
              console.error('Failed to load profile:', error);
              document.getElementById('auth-buttons').classList.remove('hidden');
            }
          }
          
          function handleTarotForm(e) {
            e.preventDefault();
            
            const token = localStorage.getItem('auth_token');
            if (!token) {
              alert('Please login to get tarot readings');
              window.location.href = '/login';
              return;
            }
            
            const formData = new FormData(e.target);
            readingData = {
              question: formData.get('question'),
              reading_type: formData.get('reading_type'),
              spread_type: formData.get('spread_type')
            };
            
            // Hide form and show card selection
            e.target.style.display = 'none';
            document.getElementById('cardSelection').classList.remove('hidden');
            
            generateVirtualDeck();
          }
          
          function generateVirtualDeck() {
            const cardDeck = document.getElementById('cardDeck');
            cardDeck.innerHTML = '';
            
            // Create 78 virtual tarot cards
            for (let i = 1; i <= 78; i++) {
              const card = document.createElement('div');
              card.className = 'tarot-card w-12 h-20 rounded-lg flex items-center justify-center cursor-pointer text-xs font-bold';
              card.textContent = i;
              card.dataset.cardId = i;
              
              card.addEventListener('click', () => selectCard(card, i));
              cardDeck.appendChild(card);
            }
          }
          
          function selectCard(cardElement, cardId) {
            if (selectedCardIds.includes(cardId) || selectedCardIds.length >= 5) return;
            
            selectedCardIds.push(cardId);
            cardElement.style.opacity = '0.3';
            cardElement.style.pointerEvents = 'none';
            
            // Add to selected cards display
            const selectedCards = document.getElementById('selectedCards');
            const selectedCard = document.createElement('div');
            selectedCard.className = 'tarot-card w-16 h-24 rounded-lg flex items-center justify-center font-bold bg-pink-600/20';
            selectedCard.textContent = cardId;
            selectedCards.appendChild(selectedCard);
            
            if (selectedCardIds.length === 5) {
              document.getElementById('revealCards').classList.remove('hidden');
              document.getElementById('revealCards').addEventListener('click', generateReading);
            }
          }
          
          async function generateReading() {
            try {
              const token = localStorage.getItem('auth_token');
              document.getElementById('loading').classList.remove('hidden');
              document.getElementById('cardSelection').style.display = 'none';
              
              const requestData = {
                ...readingData,
                selected_cards: selectedCardIds
              };
              
              const response = await axios.post('/api/ai/tarotpath/generate', requestData, {
                headers: { 
                  Authorization: \`Bearer \${token}\`,
                  'Content-Type': 'application/json'
                }
              });
              
              if (response.data.success) {
                const tarotReading = response.data.tarot_reading;
                
                // Create structured tarot reading display  
                let readingHTML = '<div class="space-y-6">';
                
                // Title section with safe handling
                readingHTML += '<div class="text-center mb-6">';
                const title = (tarotReading && tarotReading.title) ? String(tarotReading.title) : 'Your Tarot Reading';
                readingHTML += '<h2 class="text-2xl font-bold text-pink-400 mb-2">' + title + '</h2>';
                readingHTML += '</div>';
                
                // Cards section with enhanced safety
                if (tarotReading && tarotReading.cards && Array.isArray(tarotReading.cards)) {
                  readingHTML += '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">';
                  
                  for (let i = 0; i < tarotReading.cards.length && i < 5; i++) {
                    const card = tarotReading.cards[i];
                    if (!card || typeof card !== 'object') continue;
                    
                    const cardColors = [
                      'border-purple-500/50 bg-purple-900/20',
                      'border-pink-500/50 bg-pink-900/20', 
                      'border-blue-500/50 bg-blue-900/20',
                      'border-green-500/50 bg-green-900/20',
                      'border-yellow-500/50 bg-yellow-900/20'
                    ];
                    
                    const cardColor = cardColors[i % cardColors.length];
                    
                    // Ultra-safe property extraction
                    let cardName = 'Tarot Card';
                    let cardPosition = 'Position ' + (i + 1);
                    let cardInterpretation = 'Card interpretation available.';
                    
                    try {
                      if (card.name) cardName = String(card.name);
                      if (card.position) cardPosition = String(card.position);  
                      if (card.interpretation) cardInterpretation = String(card.interpretation);
                    } catch (e) {
                      // Fallback values already set
                    }
                    
                    readingHTML += '<div class="' + cardColor + ' border rounded-xl p-4">';
                    readingHTML += '<div class="text-center mb-3">';
                    readingHTML += '<div class="text-2xl mb-2">🃏</div>';
                    readingHTML += '<h3 class="text-lg font-bold text-white mb-1">' + cardName + '</h3>';
                    readingHTML += '<div class="text-sm text-gray-300 font-medium">' + cardPosition + '</div>';
                    readingHTML += '</div>';
                    readingHTML += '<div class="text-sm text-gray-200 leading-relaxed">';
                    
                    // Safe interpretation display
                    const shortInterpretation = cardInterpretation.length > 300 ? 
                      cardInterpretation.substring(0, 300) + '...' : cardInterpretation;
                    readingHTML += shortInterpretation;
                    
                    readingHTML += '</div>';
                    readingHTML += '</div>';
                  }
                  
                  readingHTML += '</div>';
                }
                
                // Overall message section with enhanced safety
                if (tarotReading && tarotReading.overall) {
                  let overallMessage = '';
                  try {
                    overallMessage = String(tarotReading.overall);
                  } catch (e) {
                    overallMessage = 'Trust your intuition and embrace the guidance from the cards.';
                  }
                  
                  if (overallMessage.trim()) {
                    readingHTML += '<div class="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-xl p-6">';
                    readingHTML += '<h3 class="text-xl font-semibold text-purple-300 mb-4">';
                    readingHTML += '<i class="fas fa-crystal-ball mr-2"></i>Overall Guidance</h3>';
                    readingHTML += '<div class="text-gray-200 leading-relaxed">';
                    
                    const shortOverall = overallMessage.length > 1000 ? 
                      overallMessage.substring(0, 1000) + '...' : overallMessage;
                    readingHTML += shortOverall;
                    
                    readingHTML += '</div></div>';
                  }
                }
                
                readingHTML += '</div>';
                
                // Safe DOM manipulation
                const contentElement = document.getElementById('readingContent');
                if (contentElement) {
                  contentElement.innerHTML = readingHTML;
                }
                
                const resultsElement = document.getElementById('results');
                if (resultsElement) {
                  resultsElement.classList.remove('hidden');
                }
                
                // Update credits display safely
                const creditsElement = document.getElementById('credits');
                if (creditsElement) {
                  const remainingCredits = response.data.remaining_credits;
                  creditsElement.textContent = (remainingCredits !== undefined) ? String(remainingCredits) : '0';
                }
                
                // Setup save button safely
                const saveButton = document.getElementById('saveReading');
                if (saveButton && response.data.content_id) {
                  saveButton.onclick = () => saveToLibrary(response.data.content_id);
                }
              } else {
                alert(response.data.error || 'Failed to generate tarot reading');
              }
            } catch (error) {
              console.error('Generation error:', error);
              let message = 'Failed to generate tarot reading';
              if (error.response && error.response.data && error.response.data.error) {
                message = error.response.data.error;
              }
              alert(message);
            } finally {
              document.getElementById('loading').classList.add('hidden');
            }
          }
          
          async function saveToLibrary(readingId) {
            try {
              const token = localStorage.getItem('auth_token');
              const response = await axios.post('/api/ai/save-reading', 
                { reading_id: readingId },
                { headers: { Authorization: \`Bearer \${token}\` } }
              );
              
              if (response.data.success) {
                alert('Reading saved to your library!');
                document.getElementById('saveReading').innerHTML = 
                  '<i class="fas fa-check mr-2"></i>Saved';
                document.getElementById('saveReading').disabled = true;
              }
            } catch (error) {
              console.error('Save error:', error);
              alert('Failed to save reading');
            }
          }
        `}} />
      </body>
    </html>
  )
})

// ZodiacTome service page  
app.get('/zodiac', (c) => {
  return c.render(
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>ZodiacTome - Zodiac Compatibility & Insights</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet" />
        <style>{`
          body { 
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
            min-height: 100vh;
          }
          .glow { 
            box-shadow: 0 0 20px rgba(6, 182, 212, 0.5);
          }
          .zodiac-sign {
            background: url('/static/images/backgrounds/zodiac-wheel-golden.jpg') center/cover no-repeat;
            border: 2px solid rgba(6, 182, 212, 0.3);
            transition: all 0.3s ease;
            position: relative;
          }
          .zodiac-sign::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(145deg, rgba(42, 42, 64, 0.4), rgba(26, 26, 48, 0.4));
            border-radius: inherit;
          }
          .zodiac-sign > * {
            position: relative;
            z-index: 1;
          }
          .zodiac-sign:hover {
            border-color: rgba(6, 182, 212, 0.6);
            transform: translateY(-2px);
          }
          .zodiac-sign:hover::before {
            background: linear-gradient(145deg, rgba(42, 42, 64, 0.2), rgba(26, 26, 48, 0.2));
          }
          .zodiac-sign.selected {
            border-color: #06b6d4;
            box-shadow: 0 0 15px rgba(6, 182, 212, 0.4);
          }
          .zodiac-sign.selected::before {
            background: linear-gradient(145deg, rgba(6, 182, 212, 0.2), rgba(6, 182, 212, 0.1));
          }
        `}</style>
      </head>
      <body className="text-white">
        {/* Navigation */}
        <nav className="fixed top-0 w-full z-50 bg-black/20 backdrop-blur-md border-b border-purple-500/20">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-8">
                <a href="/" className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                  AstroLuna
                </a>
                <div className="hidden md:flex space-x-6">
                  <a href="/astroscope" className="text-gray-300 hover:text-purple-400 transition-colors">AstroScope</a>
                  <a href="/tarotpath" className="text-gray-300 hover:text-purple-400 transition-colors">TarotPath</a>
                  <a href="/zodiac" className="text-cyan-400 font-semibold">ZodiacTome</a>
                  <a href="/dashboard" className="text-gray-300 hover:text-purple-400 transition-colors">Dashboard</a>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div id="credits-display" className="bg-gray-800/50 px-3 py-1 rounded text-sm">
                  <i className="fas fa-coins text-yellow-400 mr-1"></i>
                  <span id="credits">0</span> credits
                </div>
                <div id="auth-buttons">
                  <a href="/login" className="bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 rounded-lg hover:glow transition-all inline-block">
                    Login
                  </a>
                </div>
                <div id="user-menu" className="hidden">
                  <button id="logout-btn" className="text-gray-300 hover:text-white">
                    <i className="fas fa-sign-out-alt mr-1"></i> Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="zodiac-tome-bg pt-24 min-h-screen">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                <i className="fas fa-star-of-david mr-3"></i>ZodiacTome
              </h1>
              <p className="text-xl text-gray-300">
                Comprehensive zodiac knowledge base with AI-powered compatibility analysis and cosmic insights
              </p>
            </div>

            {/* Service Options */}
            <div className="grid lg:grid-cols-2 gap-8 mb-12">
              {/* Compatibility Analysis */}
              <div className="bg-gray-800/20 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-8">
                <div className="text-center mb-6">
                  <div className="text-4xl text-cyan-400 mb-4">
                    <i className="fas fa-heart"></i>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Compatibility Analysis</h3>
                  <p className="text-gray-400 mb-4">
                    Discover cosmic compatibility between two zodiac signs with detailed insights
                  </p>
                  <div className="text-yellow-400 font-semibold mb-4">
                    <i className="fas fa-coins mr-2"></i>10 credits
                  </div>
                </div>
                
                <form id="compatibilityForm" className="space-y-6">
                  <div>
                    <label className="block text-gray-300 mb-3 text-center">Select First Sign</label>
                    <div className="grid grid-cols-4 gap-2" id="firstSignGrid">
                      <div className="zodiac-sign p-3 rounded-lg cursor-pointer text-center" data-sign="aries">
                        <div className="text-2xl mb-1">♈</div>
                        <div className="text-xs">Aries</div>
                      </div>
                      <div className="zodiac-sign p-3 rounded-lg cursor-pointer text-center" data-sign="taurus">
                        <div className="text-2xl mb-1">♉</div>
                        <div className="text-xs">Taurus</div>
                      </div>
                      <div className="zodiac-sign p-3 rounded-lg cursor-pointer text-center" data-sign="gemini">
                        <div className="text-2xl mb-1">♊</div>
                        <div className="text-xs">Gemini</div>
                      </div>
                      <div className="zodiac-sign p-3 rounded-lg cursor-pointer text-center" data-sign="cancer">
                        <div className="text-2xl mb-1">♋</div>
                        <div className="text-xs">Cancer</div>
                      </div>
                      <div className="zodiac-sign p-3 rounded-lg cursor-pointer text-center" data-sign="leo">
                        <div className="text-2xl mb-1">♌</div>
                        <div className="text-xs">Leo</div>
                      </div>
                      <div className="zodiac-sign p-3 rounded-lg cursor-pointer text-center" data-sign="virgo">
                        <div className="text-2xl mb-1">♍</div>
                        <div className="text-xs">Virgo</div>
                      </div>
                      <div className="zodiac-sign p-3 rounded-lg cursor-pointer text-center" data-sign="libra">
                        <div className="text-2xl mb-1">♎</div>
                        <div className="text-xs">Libra</div>
                      </div>
                      <div className="zodiac-sign p-3 rounded-lg cursor-pointer text-center" data-sign="scorpio">
                        <div className="text-2xl mb-1">♏</div>
                        <div className="text-xs">Scorpio</div>
                      </div>
                      <div className="zodiac-sign p-3 rounded-lg cursor-pointer text-center" data-sign="sagittarius">
                        <div className="text-2xl mb-1">♐</div>
                        <div className="text-xs">Sagittarius</div>
                      </div>
                      <div className="zodiac-sign p-3 rounded-lg cursor-pointer text-center" data-sign="capricorn">
                        <div className="text-2xl mb-1">♑</div>
                        <div className="text-xs">Capricorn</div>
                      </div>
                      <div className="zodiac-sign p-3 rounded-lg cursor-pointer text-center" data-sign="aquarius">
                        <div className="text-2xl mb-1">♒</div>
                        <div className="text-xs">Aquarius</div>
                      </div>
                      <div className="zodiac-sign p-3 rounded-lg cursor-pointer text-center" data-sign="pisces">
                        <div className="text-2xl mb-1">♓</div>
                        <div className="text-xs">Pisces</div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-3 text-center">Select Second Sign</label>
                    <div className="grid grid-cols-4 gap-2" id="secondSignGrid">
                      {/* Same grid structure as above */}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-2">Analysis Type</label>
                    <select name="analysis_type" required 
                      className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-cyan-500 focus:outline-none">
                      <option value="romantic">Romantic Compatibility</option>
                      <option value="friendship">Friendship Compatibility</option>
                      <option value="business">Business Partnership</option>
                      <option value="family">Family Dynamics</option>
                      <option value="general">General Compatibility</option>
                    </select>
                  </div>
                  
                  <button type="submit" 
                    className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 py-3 rounded-lg font-semibold hover:glow transition-all">
                    <i className="fas fa-heart mr-2"></i>Analyze Compatibility
                  </button>
                </form>
              </div>

              {/* Zodiac Insights */}
              <div className="bg-gray-800/20 backdrop-blur-sm border border-blue-500/30 rounded-xl p-8">
                <div className="text-center mb-6">
                  <div className="text-4xl text-blue-400 mb-4">
                    <i className="fas fa-star"></i>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Deep Zodiac Insights</h3>
                  <p className="text-gray-400 mb-4">
                    Comprehensive analysis of a single zodiac sign with AI-powered cosmic insights
                  </p>
                  <div className="text-yellow-400 font-semibold mb-4">
                    <i className="fas fa-coins mr-2"></i>10 credits
                  </div>
                </div>
                
                <form id="insightsForm" className="space-y-6">
                  <div>
                    <label className="block text-gray-300 mb-3 text-center">Select Zodiac Sign</label>
                    <div className="grid grid-cols-4 gap-2" id="insightSignGrid">
                      {/* Same grid structure as compatibility */}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-2">Insight Focus</label>
                    <select name="insight_type" required 
                      className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none">
                      <option value="personality">Personality Traits</option>
                      <option value="career">Career & Professional Life</option>
                      <option value="relationships">Love & Relationships</option>
                      <option value="health">Health & Wellness</option>
                      <option value="finances">Money & Finances</option>
                      <option value="spiritual">Spiritual Growth</option>
                      <option value="challenges">Life Challenges & Growth</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-2">Time Period</label>
                    <select name="time_period" required 
                      className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none">
                      <option value="current">Current Influences</option>
                      <option value="monthly">This Month</option>
                      <option value="yearly">This Year</option>
                      <option value="general">General Traits</option>
                    </select>
                  </div>
                  
                  <button type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 py-3 rounded-lg font-semibold hover:glow transition-all">
                    <i className="fas fa-magic mr-2"></i>Generate Insights
                  </button>
                </form>
              </div>
            </div>

            {/* Results Section */}
            <div id="results" className="hidden">
              <div className="bg-gray-800/30 backdrop-blur-sm border border-green-500/30 rounded-xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-green-400">
                    <i className="fas fa-magic mr-2"></i>Your Cosmic Analysis
                  </h3>
                  <button id="saveReading" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors">
                    <i className="fas fa-save mr-2"></i>Save to Library
                  </button>
                </div>
                <div id="analysisContent" className="prose prose-invert max-w-none">
                  {/* Generated content will appear here */}
                </div>
              </div>
            </div>

            {/* Loading State */}
            <div id="loading" className="hidden text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mb-4"></div>
              <p className="text-gray-300">The cosmic library is opening your zodiac insights...</p>
            </div>
          </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script dangerouslySetInnerHTML={{__html: `
          let selectedFirstSign = null;
          let selectedSecondSign = null;
          let selectedInsightSign = null;
          
          document.addEventListener('DOMContentLoaded', function() {
            loadUserProfile();
            setupZodiacGrids();
            document.getElementById('compatibilityForm').addEventListener('submit', handleCompatibilityForm);
            document.getElementById('insightsForm').addEventListener('submit', handleInsightsForm);
          });
          
          function setupZodiacGrids() {
            // Setup zodiac sign grids
            const signs = [
              {sign: 'aries', symbol: '♈', name: 'Aries'},
              {sign: 'taurus', symbol: '♉', name: 'Taurus'},
              {sign: 'gemini', symbol: '♊', name: 'Gemini'},
              {sign: 'cancer', symbol: '♋', name: 'Cancer'},
              {sign: 'leo', symbol: '♌', name: 'Leo'},
              {sign: 'virgo', symbol: '♍', name: 'Virgo'},
              {sign: 'libra', symbol: '♎', name: 'Libra'},
              {sign: 'scorpio', symbol: '♏', name: 'Scorpio'},
              {sign: 'sagittarius', symbol: '♐', name: 'Sagittarius'},
              {sign: 'capricorn', symbol: '♑', name: 'Capricorn'},
              {sign: 'aquarius', symbol: '♒', name: 'Aquarius'},
              {sign: 'pisces', symbol: '♓', name: 'Pisces'}
            ];
            
            // Create second sign grid
            const secondGrid = document.getElementById('secondSignGrid');
            secondGrid.innerHTML = signs.map(s => \`
              <div class="zodiac-sign p-3 rounded-lg cursor-pointer text-center" data-sign="\${s.sign}">
                <div class="text-2xl mb-1">\${s.symbol}</div>
                <div class="text-xs">\${s.name}</div>
              </div>
            \`).join('');
            
            // Create insight sign grid
            const insightGrid = document.getElementById('insightSignGrid');
            insightGrid.innerHTML = signs.map(s => \`
              <div class="zodiac-sign p-3 rounded-lg cursor-pointer text-center" data-sign="\${s.sign}">
                <div class="text-2xl mb-1">\${s.symbol}</div>
                <div class="text-xs">\${s.name}</div>
              </div>
            \`).join('');
            
            // Setup click handlers
            setupSignSelection('firstSignGrid', (sign) => selectedFirstSign = sign);
            setupSignSelection('secondSignGrid', (sign) => selectedSecondSign = sign);
            setupSignSelection('insightSignGrid', (sign) => selectedInsightSign = sign);
          }
          
          function setupSignSelection(gridId, callback) {
            const grid = document.getElementById(gridId);
            grid.addEventListener('click', (e) => {
              const signElement = e.target.closest('.zodiac-sign');
              if (!signElement) return;
              
              // Clear previous selection in this grid
              grid.querySelectorAll('.zodiac-sign').forEach(el => el.classList.remove('selected'));
              
              // Select new sign
              signElement.classList.add('selected');
              callback(signElement.dataset.sign);
            });
          }
          
          async function loadUserProfile() {
            try {
              const token = localStorage.getItem('auth_token');
              if (!token) {
                document.getElementById('auth-buttons').classList.remove('hidden');
                return;
              }
              
              const response = await axios.get('/api/auth/profile', {
                headers: { Authorization: \`Bearer \${token}\` }
              });
              
              if (response.data.success) {
                document.getElementById('credits').textContent = response.data.credits;
                document.getElementById('auth-buttons').classList.add('hidden');
                document.getElementById('user-menu').classList.remove('hidden');
                
                document.getElementById('logout-btn').addEventListener('click', () => {
                  localStorage.removeItem('auth_token');
                  window.location.href = '/';
                });
              }
            } catch (error) {
              console.error('Failed to load profile:', error);
              document.getElementById('auth-buttons').classList.remove('hidden');
            }
          }
          
          async function handleCompatibilityForm(e) {
            e.preventDefault();
            
            const token = localStorage.getItem('auth_token');
            if (!token) {
              alert('Please login to get zodiac analysis');
              window.location.href = '/login';
              return;
            }
            
            if (!selectedFirstSign || !selectedSecondSign) {
              alert('Please select both zodiac signs');
              return;
            }
            
            const formData = new FormData(e.target);
            const data = {
              zodiac_sign: selectedFirstSign,
              analysis_type: 'compatibility',
              target_sign: selectedSecondSign,
              language: 'en'
            };
            
            await generateZodiacAnalysis(data, token);
          }
          
          async function handleInsightsForm(e) {
            e.preventDefault();
            
            const token = localStorage.getItem('auth_token');
            if (!token) {
              alert('Please login to get zodiac analysis');
              window.location.href = '/login';
              return;
            }
            
            if (!selectedInsightSign) {
              alert('Please select a zodiac sign');
              return;
            }
            
            const formData = new FormData(e.target);
            const data = {
              zodiac_sign: selectedInsightSign,
              analysis_type: 'insights',
              language: 'en'
            };
            
            await generateZodiacAnalysis(data, token);
          }
          
          async function generateZodiacAnalysis(data, token) {
            try {
              document.getElementById('loading').classList.remove('hidden');
              document.getElementById('results').classList.add('hidden');
              
              const response = await axios.post('/api/ai/zodiac-tome/generate', data, {
                headers: { 
                  Authorization: \`Bearer \${token}\`,
                  'Content-Type': 'application/json'
                }
              });
              
              if (response.data.success) {
                const zodiacAnalysis = response.data.zodiac_analysis;
                
                // Create structured zodiac analysis display
                let analysisHTML = '<div class="space-y-6">';
                analysisHTML += '<div class="text-center mb-6">';
                analysisHTML += '<h2 class="text-2xl font-bold text-cyan-400 mb-2">' + zodiacAnalysis.title + '</h2>';
                analysisHTML += '</div>';
                
                // Analysis content
                if (zodiacAnalysis.insights) {
                  const insights = zodiacAnalysis.insights;
                  
                  // Full analysis section (main content)
                  if (insights.full_analysis) {
                    analysisHTML += '<div class="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border border-cyan-500/30 rounded-xl p-6 mb-6">';
                    analysisHTML += '<h3 class="text-xl font-semibold text-cyan-300 mb-4">';
                    analysisHTML += '<i class="fas fa-star-of-david mr-2"></i>Cosmic Analysis</h3>';
                    analysisHTML += '<div class="text-gray-200 leading-relaxed prose prose-invert max-w-none">';
                    analysisHTML += insights.full_analysis.substring(0, 1500);
                    if (insights.full_analysis.length > 1500) analysisHTML += '...';
                    analysisHTML += '</div></div>';
                  }
                  
                  // Individual sections if available
                  const sections = [
                    { key: 'love', title: 'Love & Relationships', icon: 'fas fa-heart', color: 'pink' },
                    { key: 'career', title: 'Career & Success', icon: 'fas fa-briefcase', color: 'green' },
                    { key: 'health', title: 'Health & Wellness', icon: 'fas fa-heart-pulse', color: 'blue' },
                    { key: 'spiritual', title: 'Spiritual Growth', icon: 'fas fa-om', color: 'purple' }
                  ];
                  
                  sections.forEach(section => {
                    if (insights[section.key] && insights[section.key].trim()) {
                      analysisHTML += '<div class="bg-' + section.color + '-900/20 border border-' + section.color + '-500/30 rounded-lg p-4">';
                      analysisHTML += '<h3 class="text-lg font-semibold text-' + section.color + '-400 mb-3">';
                      analysisHTML += '<i class="' + section.icon + ' mr-2"></i>' + section.title + '</h3>';
                      analysisHTML += '<p class="text-gray-200 leading-relaxed">' + insights[section.key] + '</p>';
                      analysisHTML += '</div>';
                    }
                  });
                  
                  // Strengths and Growth Areas
                  if (insights.strengths && insights.strengths.length > 0) {
                    analysisHTML += '<div class="bg-green-900/20 border border-green-500/30 rounded-lg p-4">';
                    analysisHTML += '<h3 class="text-lg font-semibold text-green-400 mb-3">';
                    analysisHTML += '<i class="fas fa-trophy mr-2"></i>Strengths</h3>';
                    analysisHTML += '<ul class="list-disc list-inside text-gray-200 space-y-1">';
                    insights.strengths.forEach(strength => {
                      analysisHTML += '<li>' + strength + '</li>';
                    });
                    analysisHTML += '</ul></div>';
                  }
                  
                  if (insights.growth_areas && insights.growth_areas.length > 0) {
                    analysisHTML += '<div class="bg-orange-900/20 border border-orange-500/30 rounded-lg p-4">';
                    analysisHTML += '<h3 class="text-lg font-semibold text-orange-400 mb-3">';
                    analysisHTML += '<i class="fas fa-seedling mr-2"></i>Growth Areas</h3>';
                    analysisHTML += '<ul class="list-disc list-inside text-gray-200 space-y-1">';
                    insights.growth_areas.forEach(area => {
                      analysisHTML += '<li>' + area + '</li>';
                    });
                    analysisHTML += '</ul></div>';
                  }
                }
                
                analysisHTML += '</div>';
                
                document.getElementById('analysisContent').innerHTML = analysisHTML;
                document.getElementById('results').classList.remove('hidden');
                
                // Update credits display  
                document.getElementById('credits').textContent = response.data.remaining_credits || 0;
                
                // Setup save button
                document.getElementById('saveReading').onclick = () => saveToLibrary(response.data.content_id);
              } else {
                alert(response.data.error || 'Failed to generate zodiac analysis');
              }
            } catch (error) {
              console.error('Generation error:', error);
              let message = 'Failed to generate zodiac analysis';
              if (error.response && error.response.data && error.response.data.error) {
                message = error.response.data.error;
              }
              alert(message);
            } finally {
              document.getElementById('loading').classList.add('hidden');
            }
          }
          
          async function saveToLibrary(readingId) {
            try {
              const token = localStorage.getItem('auth_token');
              const response = await axios.post('/api/ai/save-reading', 
                { reading_id: readingId },
                { headers: { Authorization: \`Bearer \${token}\` } }
              );
              
              if (response.data.success) {
                alert('Analysis saved to your library!');
                document.getElementById('saveReading').innerHTML = 
                  '<i class="fas fa-check mr-2"></i>Saved';
                document.getElementById('saveReading').disabled = true;
              }
            } catch (error) {
              console.error('Save error:', error);
              alert('Failed to save analysis');
            }
          }
        `}} />
      </body>
    </html>
  )
})

// Dashboard page
app.get('/dashboard', (c) => {
  return c.render(
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Dashboard - AstroLuna</title>
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
        `}</style>
      </head>
      <body className="text-white">
        {/* Navigation */}
        <nav className="fixed top-0 w-full z-50 bg-black/20 backdrop-blur-md border-b border-purple-500/20">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-8">
                <a href="/" className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                  AstroLuna
                </a>
                <div className="hidden md:flex space-x-6">
                  <a href="/astroscope" className="text-gray-300 hover:text-purple-400 transition-colors">AstroScope</a>
                  <a href="/tarotpath" className="text-gray-300 hover:text-purple-400 transition-colors">TarotPath</a>
                  <a href="/zodiac" className="text-gray-300 hover:text-purple-400 transition-colors">ZodiacTome</a>
                  <a href="/dashboard" className="text-purple-400 font-semibold">Dashboard</a>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div id="credits-display" className="bg-gray-800/50 px-3 py-1 rounded text-sm">
                  <i className="fas fa-coins text-yellow-400 mr-1"></i>
                  <span id="credits">0</span> credits
                </div>
                <button id="checkout-btn" className="bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-2 rounded-lg hover:glow transition-all">
                  <i className="fas fa-plus mr-1"></i> Buy Credits
                </button>
                <button id="logout-btn" className="text-gray-300 hover:text-white">
                  <i className="fas fa-sign-out-alt mr-1"></i> Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="dashboard-bg pt-24 min-h-screen">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2">
                Welcome back, <span id="userName">User</span>!
              </h1>
              <p className="text-gray-400">Manage your cosmic journey and explore your celestial insights</p>
            </div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gray-800/30 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 text-center">
                <div className="text-3xl text-purple-400 mb-2">
                  <i className="fas fa-coins"></i>
                </div>
                <div className="text-2xl font-bold" id="totalCredits">0</div>
                <div className="text-sm text-gray-400">Available Credits</div>
              </div>
              
              <div className="bg-gray-800/30 backdrop-blur-sm border border-blue-500/30 rounded-xl p-6 text-center">
                <div className="text-3xl text-blue-400 mb-2">
                  <i className="fas fa-moon"></i>
                </div>
                <div className="text-2xl font-bold" id="horoscopeCount">0</div>
                <div className="text-sm text-gray-400">Horoscopes</div>
              </div>
              
              <div className="bg-gray-800/30 backdrop-blur-sm border border-pink-500/30 rounded-xl p-6 text-center">
                <div className="text-3xl text-pink-400 mb-2">
                  <i className="fas fa-cards-blank"></i>
                </div>
                <div className="text-2xl font-bold" id="tarotCount">0</div>
                <div className="text-sm text-gray-400">Tarot Readings</div>
              </div>
              
              <div className="bg-gray-800/30 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-6 text-center">
                <div className="text-3xl text-cyan-400 mb-2">
                  <i className="fas fa-star"></i>
                </div>
                <div className="text-2xl font-bold" id="zodiacCount">0</div>
                <div className="text-sm text-gray-400">Zodiac Analysis</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <a href="/astroscope" className="bg-gray-800/30 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 hover:border-purple-500/60 transition-colors block">
                <div className="text-center">
                  <div className="text-4xl text-purple-400 mb-3">
                    <i className="fas fa-moon"></i>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Get Horoscope</h3>
                  <p className="text-gray-400 text-sm">Generate personalized cosmic insights</p>
                </div>
              </a>
              
              <a href="/tarotpath" className="bg-gray-800/30 backdrop-blur-sm border border-pink-500/30 rounded-xl p-6 hover:border-pink-500/60 transition-colors block">
                <div className="text-center">
                  <div className="text-4xl text-pink-400 mb-3">
                    <i className="fas fa-cards-blank"></i>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Draw Tarot Cards</h3>
                  <p className="text-gray-400 text-sm">Reveal your lunar path guidance</p>
                </div>
              </a>
              
              <a href="/zodiac" className="bg-gray-800/30 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-6 hover:border-cyan-500/60 transition-colors block">
                <div className="text-center">
                  <div className="text-4xl text-cyan-400 mb-3">
                    <i className="fas fa-star-of-david"></i>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Zodiac Analysis</h3>
                  <p className="text-gray-400 text-sm">Explore compatibility & insights</p>
                </div>
              </a>
            </div>

            {/* Recent Readings */}
            <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-500/30 rounded-xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">Recent Readings</h3>
                <button id="loadMoreReadings" className="text-purple-400 hover:text-purple-300">
                  <i className="fas fa-refresh mr-1"></i> Refresh
                </button>
              </div>
              
              <div id="recentReadings" className="space-y-4">
                <div className="text-center py-8 text-gray-400">
                  <i className="fas fa-magic text-3xl mb-4"></i>
                  <p>Your cosmic readings will appear here</p>
                  <p className="text-sm">Start your journey by getting your first reading!</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script dangerouslySetInnerHTML={{__html: `
          document.addEventListener('DOMContentLoaded', function() {
            loadDashboard();
            
            // Setup event listeners
            document.getElementById('checkout-btn').addEventListener('click', () => {
              window.location.href = '/checkout';
            });
            
            document.getElementById('logout-btn').addEventListener('click', () => {
              localStorage.removeItem('auth_token');
              window.location.href = '/';
            });
            
            document.getElementById('loadMoreReadings').addEventListener('click', loadRecentReadings);
          });
          
          async function loadDashboard() {
            try {
              const token = localStorage.getItem('auth_token');
              if (!token) {
                window.location.href = '/login';
                return;
              }
              
              const response = await axios.get('/api/auth/profile', {
                headers: { Authorization: \`Bearer \${token}\` }
              });
              
              if (response.data.success) {
                const user = response.data.user;
                
                // Update user info
                document.getElementById('userName').textContent = user.full_name || 'User';
                document.getElementById('credits').textContent = response.data.credits;
                document.getElementById('totalCredits').textContent = response.data.credits;
                
                // Load reading statistics (mock for now)
                document.getElementById('horoscopeCount').textContent = '0';
                document.getElementById('tarotCount').textContent = '0';
                document.getElementById('zodiacCount').textContent = '0';
                
                // Load recent readings
                await loadRecentReadings();
              } else {
                window.location.href = '/login';
              }
            } catch (error) {
              console.error('Failed to load dashboard:', error);
              window.location.href = '/login';
            }
          }
          
          async function loadRecentReadings() {
            try {
              const token = localStorage.getItem('auth_token');
              
              // For now, show placeholder content
              // In a real implementation, this would fetch from API
              const recentReadings = document.getElementById('recentReadings');
              recentReadings.innerHTML = \`
                <div class="text-center py-8 text-gray-400">
                  <i class="fas fa-magic text-3xl mb-4"></i>
                  <p>Your cosmic readings will appear here</p>
                  <p class="text-sm">Start your journey by getting your first reading!</p>
                </div>
              \`;
              
            } catch (error) {
              console.error('Failed to load recent readings:', error);
            }
          }
        `}} />
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
          
          {/* Test Account Info */}
          <div className="mt-6 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
            <h3 className="text-green-400 font-semibold mb-2 text-sm">🌙 Test Accounts Available:</h3>
            <div className="text-xs text-gray-300 space-y-1">
              <div><strong>demo@astroluna.com</strong> / demo123 (150 credits)</div>
              <div><strong>test@astroluna.com</strong> / password (100 credits)</div>
              <div><strong>admin@astroluna.com</strong> / admin123 (500 credits)</div>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <a href="/forgot-password" className="text-purple-400 hover:text-purple-300 text-sm">Forgot Password?</a>
          </div>
          <div className="mt-2 text-center">
            <span className="text-gray-400 text-sm">Don't have an account? </span>
            <a href="/signup" className="text-purple-400 hover:text-purple-300 text-sm">Sign up</a>
          </div>
        </div>
        
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script dangerouslySetInnerHTML={{__html: `
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
              let message = 'Login failed';
              if (error.response && error.response.data && error.response.data.error) {
                message = error.response.data.error;
              }
              alert(message);
            }
          });
        `}} />
        
        {/* Footer */}
        <footer className="fixed bottom-0 left-0 right-0 bg-black/20 backdrop-blur-md border-t border-purple-500/20 py-4">
          <div className="text-center">
            <p className="text-gray-400 text-xs">
              © 2024 AstroLuna. All rights reserved. | 
              <a href="/privacy" className="text-purple-400 hover:text-purple-300 ml-2">Privacy</a> |
              <a href="/terms" className="text-purple-400 hover:text-purple-300 ml-2">Terms</a>
            </p>
          </div>
        </footer>
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
        <script dangerouslySetInnerHTML={{__html: `
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
              let message = 'Registration failed';
              if (error.response && error.response.data && error.response.data.error) {
                message = error.response.data.error;
              }
              alert(message);
            }
          });
        `}} />
        
        {/* Footer */}
        <footer className="fixed bottom-0 left-0 right-0 bg-black/20 backdrop-blur-md border-t border-purple-500/20 py-4">
          <div className="text-center">
            <p className="text-gray-400 text-xs">
              © 2024 AstroLuna. All rights reserved. | 
              <a href="/privacy" className="text-purple-400 hover:text-purple-300 ml-2">Privacy</a> |
              <a href="/terms" className="text-purple-400 hover:text-purple-300 ml-2">Terms</a>
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
})

// Privacy Policy page
app.get('/privacy', (c) => {
  return c.render(
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Privacy Policy - AstroLuna</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 min-h-screen">
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-4xl mx-auto bg-black/20 backdrop-blur-md rounded-xl border border-purple-500/30 p-8">
            <h1 className="text-3xl font-bold text-white mb-8">Privacy Policy</h1>
            <div className="prose prose-invert max-w-none text-gray-300">
              <p className="mb-4">Last updated: October 2024</p>
              
              <h2 className="text-xl font-semibold text-white mt-6 mb-4">Information We Collect</h2>
              <p className="mb-4">
                AstroLuna collects information you provide directly to us, such as when you create an account, 
                use our services, or contact us for support.
              </p>
              
              <h2 className="text-xl font-semibold text-white mt-6 mb-4">How We Use Your Information</h2>
              <p className="mb-4">
                We use the information we collect to provide, maintain, and improve our astrology and tarot services, 
                process transactions, and communicate with you about your account and our services.
              </p>
              
              <h2 className="text-xl font-semibold text-white mt-6 mb-4">Data Security</h2>
              <p className="mb-4">
                We implement appropriate security measures to protect your personal information against unauthorized 
                access, alteration, disclosure, or destruction.
              </p>
              
              <h2 className="text-xl font-semibold text-white mt-6 mb-4">Contact Us</h2>
              <p className="mb-4">
                If you have any questions about this Privacy Policy, please contact us at privacy@astroluna.com.
              </p>
            </div>
            
            <div className="mt-8 text-center">
              <a href="/" className="text-purple-400 hover:text-purple-300">← Back to Home</a>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
})

// Terms of Service page
app.get('/terms', (c) => {
  return c.render(
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Terms of Service - AstroLuna</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 min-h-screen">
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-4xl mx-auto bg-black/20 backdrop-blur-md rounded-xl border border-purple-500/30 p-8">
            <h1 className="text-3xl font-bold text-white mb-8">Terms of Service</h1>
            <div className="prose prose-invert max-w-none text-gray-300">
              <p className="mb-4">Last updated: October 2024</p>
              
              <h2 className="text-xl font-semibold text-white mt-6 mb-4">Acceptance of Terms</h2>
              <p className="mb-4">
                By accessing and using AstroLuna's services, you accept and agree to be bound by the terms 
                and provision of this agreement.
              </p>
              
              <h2 className="text-xl font-semibold text-white mt-6 mb-4">Use License</h2>
              <p className="mb-4">
                Permission is granted to temporarily use AstroLuna's services for personal, non-commercial 
                transitory viewing only.
              </p>
              
              <h2 className="text-xl font-semibold text-white mt-6 mb-4">Service Availability</h2>
              <p className="mb-4">
                AstroLuna provides AI-powered astrology readings for entertainment purposes. Results are 
                generated by artificial intelligence and should not be considered as professional advice.
              </p>
              
              <h2 className="text-xl font-semibold text-white mt-6 mb-4">Disclaimer</h2>
              <p className="mb-4">
                The materials on AstroLuna are provided on an 'as is' basis. AstroLuna makes no warranties, 
                expressed or implied, and hereby disclaims all other warranties including without limitation, 
                implied warranties or conditions of merchantability, fitness for a particular purpose.
              </p>
            </div>
            
            <div className="mt-8 text-center">
              <a href="/" className="text-purple-400 hover:text-purple-300">← Back to Home</a>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
})

// Contact page
app.get('/contact', (c) => {
  return c.render(
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Contact - AstroLuna</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 min-h-screen">
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-2xl mx-auto bg-black/20 backdrop-blur-md rounded-xl border border-purple-500/30 p-8">
            <h1 className="text-3xl font-bold text-white mb-8 text-center">Contact AstroLuna</h1>
            
            <div className="space-y-6 text-gray-300">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-white mb-4">Get in Touch</h2>
                <p className="mb-6">
                  We'd love to hear from you! Whether you have questions about our services, 
                  need support, or want to share feedback.
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-white mb-2">Email Support</h3>
                  <p className="text-purple-400">support@astroluna.com</p>
                </div>
                
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-white mb-2">Business Inquiries</h3>
                  <p className="text-purple-400">hello@astroluna.com</p>
                </div>
              </div>
              
              <div className="text-center mt-8">
                <h3 className="text-lg font-semibold text-white mb-4">Follow Us</h3>
                <div className="flex justify-center space-x-6">
                  <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                    <i className="fab fa-twitter text-xl"></i>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                    <i className="fab fa-facebook text-xl"></i>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                    <i className="fab fa-instagram text-xl"></i>
                  </a>
                </div>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <a href="/" className="text-purple-400 hover:text-purple-300">← Back to Home</a>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
})

// Test checkout page (for development)
app.get('/test-checkout', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Test Checkout</title>
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="p-8 bg-gray-900 text-white">
        <h1 class="text-2xl mb-4">Test Checkout Process</h1>
        <div class="space-x-4 mb-4">
            <button onclick="testLogin()" class="bg-blue-600 px-4 py-2 rounded">1. Login</button>
            <button onclick="testCheckout()" class="bg-green-600 px-4 py-2 rounded">2. Open Checkout</button>
        </div>
        <div id="result" class="bg-gray-800 p-4 rounded"></div>

        <script>
            let authToken = null;
            
            async function testLogin() {
                try {
                    const response = await fetch('/api/auth/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email: 'test@example.com',
                            password: 'testpass'
                        })
                    });
                    
                    const data = await response.json();
                    if (data.success) {
                        authToken = data.token;
                        localStorage.setItem('auth_token', authToken);
                        document.getElementById('result').innerHTML = '<p class="text-green-400">✅ Login successful! Token saved. Credits: ' + data.credits + '</p>';
                    } else {
                        document.getElementById('result').innerHTML = '<p class="text-red-400">❌ Login failed: ' + data.error + '</p>';
                    }
                } catch (error) {
                    document.getElementById('result').innerHTML = '<p class="text-red-400">❌ Login error: ' + error.message + '</p>';
                }
            }
            
            async function testCheckout() {
                const token = localStorage.getItem('auth_token');
                if (!token) {
                    document.getElementById('result').innerHTML = '<p class="text-yellow-400">❌ Please login first</p>';
                    return;
                }
                
                // Open checkout page
                window.location.href = '/checkout';
            }
        </script>
    </body>
    </html>
  `);
});

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
