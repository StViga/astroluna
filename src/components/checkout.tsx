// Checkout page component for AstroLuna

export function CheckoutPage() {
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Checkout - AstroLuna</title>
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
          .step-active { 
            background: linear-gradient(135deg, #8b5cf6, #3b82f6);
            color: white;
          }
          .step-completed {
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
          }
          .step-pending {
            background: rgba(255, 255, 255, 0.1);
            color: rgba(255, 255, 255, 0.6);
          }
        `}</style>
      </head>
      <body className="text-white">
        {/* Navigation */}
        <nav className="fixed top-0 w-full z-50 bg-black/20 backdrop-blur-md border-b border-purple-500/20">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                <a href="/">AstroLuna</a>
              </h1>
              <div className="flex items-center space-x-4">
                <div className="bg-gray-800/50 px-3 py-1 rounded text-sm">
                  <i className="fas fa-coins text-yellow-400 mr-1"></i>
                  <span id="user-credits">0</span> credits
                </div>
                <button id="logout-btn" className="text-gray-300 hover:text-white">
                  <i className="fas fa-sign-out-alt mr-1"></i> Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Checkout Content */}
        <div className="pt-24 pb-12 px-6">
          <div className="max-w-4xl mx-auto">
            
            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex items-center justify-center space-x-4">
                <div className="flex items-center">
                  <div id="step-1" className="step-active w-10 h-10 rounded-full flex items-center justify-center font-semibold">1</div>
                  <span className="ml-2 text-sm">Package Selection</span>
                </div>
                <div className="w-16 h-0.5 bg-gray-600"></div>
                <div className="flex items-center">
                  <div id="step-2" className="step-pending w-10 h-10 rounded-full flex items-center justify-center font-semibold">2</div>
                  <span className="ml-2 text-sm">Billing Info</span>
                </div>
                <div className="w-16 h-0.5 bg-gray-600"></div>
                <div className="flex items-center">
                  <div id="step-3" className="step-pending w-10 h-10 rounded-full flex items-center justify-center font-semibold">3</div>
                  <span className="ml-2 text-sm">Payment</span>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              
              {/* Main Content */}
              <div className="lg:col-span-2">
                
                {/* Step 1: Package Selection */}
                <div id="step-content-1" className="bg-gray-800/30 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 mb-6">
                  <h2 className="text-2xl font-bold mb-6">Choose Your Credit Package</h2>
                  
                  <div className="grid md:grid-cols-2 gap-4" id="credit-packages">
                    {/* Credit packages will be populated by JavaScript */}
                  </div>
                  
                  <div className="mt-6">
                    <button id="next-to-step-2" className="w-full bg-gradient-to-r from-purple-600 to-blue-600 py-3 rounded-lg font-semibold hover:glow transition-all disabled:opacity-50" disabled>
                      Continue to Billing Information
                    </button>
                  </div>
                </div>

                {/* Step 2: Billing Information */}
                <div id="step-content-2" className="bg-gray-800/30 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 mb-6 hidden">
                  <h2 className="text-2xl font-bold mb-6">Billing Information</h2>
                  
                  <form id="billing-form" className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-300 mb-2">Full Name *</label>
                        <input type="text" name="full_name" required className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-gray-300 mb-2">Email *</label>
                        <input type="email" name="email" required className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none" />
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-300 mb-2">Phone *</label>
                        <input type="tel" name="phone" required className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-gray-300 mb-2">Country *</label>
                        <input type="text" name="country" required className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none" />
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-300 mb-2">State/Region *</label>
                        <input type="text" name="state" required className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-gray-300 mb-2">City *</label>
                        <input type="text" name="city" required className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none" />
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-300 mb-2">Address *</label>
                        <input type="text" name="address" required className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-gray-300 mb-2">ZIP Code *</label>
                        <input type="text" name="zip_code" required className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none" />
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
                  </form>
                  
                  <div className="mt-6 flex space-x-4">
                    <button id="back-to-step-1" className="flex-1 border border-gray-600 py-3 rounded-lg font-semibold hover:bg-gray-600/20 transition-colors">
                      Back
                    </button>
                    <button id="next-to-step-3" className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 py-3 rounded-lg font-semibold hover:glow transition-all">
                      Continue to Payment
                    </button>
                  </div>
                </div>

                {/* Step 3: Payment */}
                <div id="step-content-3" className="bg-gray-800/30 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 mb-6 hidden">
                  <h2 className="text-2xl font-bold mb-6">Complete Payment</h2>
                  
                  <div id="payment-processing" className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mb-4"></div>
                    <p>Redirecting to secure payment...</p>
                  </div>
                  
                  <div className="mt-6">
                    <button id="back-to-step-2" className="border border-gray-600 py-3 px-6 rounded-lg font-semibold hover:bg-gray-600/20 transition-colors">
                      Back to Billing
                    </button>
                  </div>
                </div>

              </div>

              {/* Order Summary Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-gray-800/30 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 sticky top-24">
                  <h3 className="text-xl font-bold mb-4">Order Summary</h3>
                  
                  <div id="order-summary" className="space-y-4">
                    <div className="text-gray-400 text-center py-8">
                      Select a package to see pricing
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-600 pt-4 mt-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <i className="fas fa-shield-alt text-green-400"></i>
                      <span className="text-sm text-gray-300">Secure Payment</span>
                    </div>
                    <div className="flex items-center space-x-2 mb-4">
                      <i className="fas fa-credit-card text-blue-400"></i>
                      <span className="text-sm text-gray-300">Visa, MasterCard</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-lock text-purple-400"></i>
                      <span className="text-sm text-gray-300">SSL Encrypted</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>{`
          // Checkout logic will be added here
          let selectedPackage = null;
          let exchangeRates = null;
          let userCurrency = 'EUR';
          
          document.addEventListener('DOMContentLoaded', function() {
            // Check authentication
            const token = localStorage.getItem('auth_token');
            if (!token) {
              window.location.href = '/login';
              return;
            }
            
            loadUserProfile();
            loadCreditPackages();
            setupEventListeners();
          });
          
          async function loadUserProfile() {
            try {
              const token = localStorage.getItem('auth_token');
              const response = await axios.get('/api/auth/profile', {
                headers: { Authorization: \`Bearer \${token}\` }
              });
              
              if (response.data.success) {
                document.getElementById('user-credits').textContent = response.data.credits;
                userCurrency = response.data.user.currency || 'EUR';
                
                // Pre-fill billing form with user data
                const form = document.getElementById('billing-form');
                form.full_name.value = response.data.user.full_name || '';
                form.email.value = response.data.user.email || '';
                form.phone.value = response.data.user.phone || '';
              }
            } catch (error) {
              console.error('Failed to load profile:', error);
              localStorage.removeItem('auth_token');
              window.location.href = '/login';
            }
          }
          
          async function loadCreditPackages() {
            try {
              const response = await axios.get('/api/currency/pricing');
              if (response.data.success) {
                exchangeRates = response.data.rates;
                renderCreditPackages(response.data.pricing);
              }
            } catch (error) {
              console.error('Failed to load packages:', error);
            }
          }
          
          function renderCreditPackages(packages) {
            const container = document.getElementById('credit-packages');
            container.innerHTML = packages.map(pkg => \`
              <div class="package-option border border-gray-600 rounded-lg p-4 cursor-pointer hover:border-purple-500 transition-colors" 
                   data-credits="\${pkg.credits}" 
                   data-bonus="\${pkg.bonus_percent}"
                   data-price-eur="\${pkg.prices.EUR}"
                   data-price-usd="\${pkg.prices.USD}"
                   data-price-gbp="\${pkg.prices.GBP}">
                
                <div class="flex justify-between items-start mb-2">
                  <div>
                    <h4 class="font-bold text-lg">\${pkg.credits} Credits</h4>
                    \${pkg.bonus_percent > 0 ? \`<span class="text-green-400 text-sm">+\${pkg.bonus_percent}% Bonus</span>\` : ''}
                  </div>
                  <div class="text-right">
                    <div class="font-bold text-xl">\${pkg.prices.formatted[userCurrency]}</div>
                    <div class="text-sm text-gray-400">\${pkg.cost_per_credit[userCurrency].toFixed(4)}/credit</div>
                  </div>
                </div>
                
                \${pkg.bonus_percent > 0 ? \`
                  <div class="text-sm text-gray-300">
                    Base: \${pkg.credits} + Bonus: \${Math.floor(pkg.credits * pkg.bonus_percent / 100)} = 
                    <span class="text-green-400 font-semibold">\${pkg.credits + Math.floor(pkg.credits * pkg.bonus_percent / 100)} Total Credits</span>
                  </div>
                \` : ''}
              </div>
            \`).join('');
            
            // Add click handlers
            document.querySelectorAll('.package-option').forEach(option => {
              option.addEventListener('click', () => selectPackage(option));
            });
          }
          
          function selectPackage(option) {
            // Remove previous selection
            document.querySelectorAll('.package-option').forEach(opt => {
              opt.classList.remove('border-purple-500', 'bg-purple-500/10');
            });
            
            // Highlight selected
            option.classList.add('border-purple-500', 'bg-purple-500/10');
            
            selectedPackage = {
              credits: parseInt(option.dataset.credits),
              bonus: parseInt(option.dataset.bonus),
              prices: {
                EUR: parseFloat(option.dataset.priceEur),
                USD: parseFloat(option.dataset.priceUsd),
                GBP: parseFloat(option.dataset.priceGbp)
              }
            };
            
            updateOrderSummary();
            document.getElementById('next-to-step-2').disabled = false;
          }
          
          function updateOrderSummary() {
            if (!selectedPackage) return;
            
            const totalCredits = selectedPackage.credits + Math.floor(selectedPackage.credits * selectedPackage.bonus / 100);
            const price = selectedPackage.prices[userCurrency];
            
            document.getElementById('order-summary').innerHTML = \`
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span>Base Credits</span>
                  <span>\${selectedPackage.credits}</span>
                </div>
                \${selectedPackage.bonus > 0 ? \`
                  <div class="flex justify-between text-green-400">
                    <span>Bonus (\${selectedPackage.bonus}%)</span>
                    <span>+\${Math.floor(selectedPackage.credits * selectedPackage.bonus / 100)}</span>
                  </div>
                \` : ''}
                <div class="border-t border-gray-600 pt-3">
                  <div class="flex justify-between font-bold text-lg">
                    <span>Total Credits</span>
                    <span class="text-purple-400">\${totalCredits}</span>
                  </div>
                  <div class="flex justify-between font-bold text-xl mt-2">
                    <span>Total Price</span>
                    <span class="text-green-400">\${price.toFixed(2)} \${userCurrency}</span>
                  </div>
                </div>
              </div>
            \`;
          }
          
          function setupEventListeners() {
            // Step navigation
            document.getElementById('next-to-step-2').addEventListener('click', () => goToStep(2));
            document.getElementById('back-to-step-1').addEventListener('click', () => goToStep(1));
            document.getElementById('next-to-step-3').addEventListener('click', processPayment);
            document.getElementById('back-to-step-2').addEventListener('click', () => goToStep(2));
            
            // Logout
            document.getElementById('logout-btn').addEventListener('click', () => {
              localStorage.removeItem('auth_token');
              window.location.href = '/';
            });
          }
          
          function goToStep(step) {
            // Hide all steps
            for (let i = 1; i <= 3; i++) {
              document.getElementById(\`step-content-\${i}\`).classList.add('hidden');
              document.getElementById(\`step-\${i}\`).className = 'step-pending w-10 h-10 rounded-full flex items-center justify-center font-semibold';
            }
            
            // Show current step
            document.getElementById(\`step-content-\${step}\`).classList.remove('hidden');
            document.getElementById(\`step-\${step}\`).className = 'step-active w-10 h-10 rounded-full flex items-center justify-center font-semibold';
            
            // Mark completed steps
            for (let i = 1; i < step; i++) {
              document.getElementById(\`step-\${i}\`).className = 'step-completed w-10 h-10 rounded-full flex items-center justify-center font-semibold';
            }
          }
          
          async function processPayment() {
            if (!selectedPackage) {
              alert('Please select a credit package');
              return;
            }
            
            const form = document.getElementById('billing-form');
            const formData = new FormData(form);
            
            // Validate form
            if (!form.checkValidity()) {
              form.reportValidity();
              return;
            }
            
            if (!formData.get('privacy_accepted')) {
              alert('Please accept the privacy policy and terms');
              return;
            }
            
            goToStep(3);
            
            try {
              const paymentData = {
                credits_amount: selectedPackage.credits,
                currency: userCurrency,
                email: formData.get('email'),
                full_name: formData.get('full_name'),
                phone: formData.get('phone'),
                country: formData.get('country'),
                state: formData.get('state'),
                city: formData.get('city'),
                address: formData.get('address'),
                zip_code: formData.get('zip_code'),
                privacy_accepted: true
              };
              
              const token = localStorage.getItem('auth_token');
              const response = await axios.post('/api/payments/checkout/init', paymentData, {
                headers: { Authorization: \`Bearer \${token}\` }
              });
              
              if (response.data.success && response.data.payment_url) {
                // Redirect to payment gateway
                window.location.href = response.data.payment_url;
              } else {
                throw new Error(response.data.error || 'Payment initialization failed');
              }
              
            } catch (error) {
              console.error('Payment processing error:', error);
              const message = error.response?.data?.error || error.message || 'Payment processing failed';
              alert(\`Payment Error: \${message}\`);
              goToStep(2);
            }
          }
        `}</script>
      </body>
    </html>
  );
}