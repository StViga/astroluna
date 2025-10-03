-- Seed data for AstroLuna platform

-- Price configuration for services
INSERT INTO price_config (service_type, credits_cost, display_name, description) VALUES
('astroscope', 15, 'AstroScope', 'Personalized weekly horoscope with birth chart analysis'),
('tarotpath', 20, 'TarotPath', 'AI-generated 3-card tarot reading with interpretation'),
('zodiac', 10, 'ZodiacTome', 'Comprehensive zodiac sign analysis and insights');

-- Credit packages for purchase  
INSERT INTO credit_packages (name, credits_amount, price_eur, bonus_credits, is_popular, sort_order) VALUES
('Starter Pack', 100, 9.99, 0, FALSE, 1),
('Pro Pack', 500, 39.99, 50, TRUE, 2),
('Premium Pack', 1000, 69.99, 150, FALSE, 3),
('Ultimate Pack', 2500, 149.99, 500, FALSE, 4);

-- Email templates
INSERT INTO email_templates (template_key, subject, html_content, text_content, variables) VALUES
('welcome', 'Welcome to AstroLuna! ✨', 
'<h1>Welcome to AstroLuna, {{fullName}}!</h1><p>Thank you for joining our cosmic community. Your journey of discovery awaits!</p><p><a href="{{loginUrl}}">Login to your account</a></p>',
'Welcome to AstroLuna, {{fullName}}! Thank you for joining our cosmic community. Login: {{loginUrl}}',
'{"fullName": "User full name", "loginUrl": "Login URL"}'::jsonb),

('email_verification', 'Verify your AstroLuna account', 
'<h1>Verify your email address</h1><p>Hello {{fullName}},</p><p>Please click the link below to verify your account:</p><p><a href="{{verifyUrl}}">Verify Account</a></p><p>This link expires in 24 hours.</p>',
'Hello {{fullName}}, please verify your account: {{verifyUrl}}',
'{"fullName": "User full name", "verifyUrl": "Verification URL"}'::jsonb),

('password_reset', 'Reset your AstroLuna password',
'<h1>Reset your password</h1><p>Hello {{fullName}},</p><p>Click the link below to reset your password:</p><p><a href="{{resetUrl}}">Reset Password</a></p><p>This link expires in 1 hour.</p>',
'Hello {{fullName}}, reset your password: {{resetUrl}}',
'{"fullName": "User full name", "resetUrl": "Reset URL"}'::jsonb),

('generation_ready', 'Your {{serviceType}} reading is ready! 🌟',
'<h1>Your cosmic reading is ready!</h1><p>Hello {{fullName}},</p><p>Your {{serviceType}} reading has been generated successfully.</p><p><a href="{{readingUrl}}">View Reading</a></p>',
'Hello {{fullName}}, your {{serviceType}} reading is ready: {{readingUrl}}',
'{"fullName": "User full name", "serviceType": "Service type", "readingUrl": "Reading URL"}'::jsonb);

-- Sample currency rates (will be updated by NBU API)
INSERT INTO currency_rates (currency, rate, date) VALUES
('USD', 37.50, CURRENT_DATE),
('EUR', 1.00, CURRENT_DATE),
('GBP', 1.15, CURRENT_DATE);

-- Demo user for testing (password: demo123)
INSERT INTO users (email, password_hash, full_name, language, currency, is_verified) VALUES
('demo@astroluna.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPjiJdF3C', 'Demo User', 'en', 'EUR', TRUE);

-- Demo user credits
INSERT INTO credits (user_id, balance) 
SELECT id, 500 FROM users WHERE email = 'demo@astroluna.com';