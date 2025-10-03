-- AstroLuna Database Schema
-- PostgreSQL migration for full ТЗ compliance

-- Users table with full profile support
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    language VARCHAR(10) DEFAULT 'en',
    currency VARCHAR(10) DEFAULT 'EUR',
    is_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Credits system
CREATE TABLE credits (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    balance INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transaction history for payments and credit operations
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL, -- 'purchase', 'deduction', 'refund'
    amount_eur DECIMAL(10,2),
    amount_currency DECIMAL(10,2),
    currency VARCHAR(10),
    rate_used DECIMAL(10,4),
    credits_amount INTEGER,
    tx_id VARCHAR(255), -- External payment system transaction ID
    spc_order_id VARCHAR(255), -- SPC specific order ID
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'failed'
    payment_method VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI generations journal
CREATE TABLE generations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    service_type VARCHAR(20) NOT NULL, -- 'astroscope', 'tarotpath', 'zodiac'
    prompt_data JSONB, -- Birth data, question, zodiac sign, etc.
    response_text TEXT,
    credits_used INTEGER,
    generation_time_ms INTEGER,
    ai_provider VARCHAR(50) DEFAULT 'gemini',
    ai_model VARCHAR(50),
    status VARCHAR(20) DEFAULT 'completed', -- 'completed', 'failed'
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Library of saved content
CREATE TABLE library (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    generation_id INTEGER REFERENCES generations(id) ON DELETE CASCADE,
    title VARCHAR(255),
    service_type VARCHAR(20) NOT NULL,
    content_preview TEXT,
    is_favorite BOOLEAN DEFAULT FALSE,
    tags TEXT[], -- Array of tags for categorization
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Price configuration
CREATE TABLE price_config (
    id SERIAL PRIMARY KEY,
    service_type VARCHAR(20) NOT NULL,
    credits_cost INTEGER NOT NULL,
    display_name VARCHAR(100),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Credit packages for purchase
CREATE TABLE credit_packages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    credits_amount INTEGER NOT NULL,
    price_eur DECIMAL(10,2) NOT NULL,
    bonus_credits INTEGER DEFAULT 0,
    is_popular BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Currency rates cache (NBU API)
CREATE TABLE currency_rates (
    id SERIAL PRIMARY KEY,
    currency VARCHAR(10) NOT NULL,
    rate DECIMAL(10,4) NOT NULL,
    date DATE NOT NULL,
    source VARCHAR(50) DEFAULT 'nbu',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(currency, date)
);

-- Currency snapshots for checkout (fixed rates)
CREATE TABLE currency_snapshots (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    rate DECIMAL(10,4) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email templates
CREATE TABLE email_templates (
    id SERIAL PRIMARY KEY,
    template_key VARCHAR(100) UNIQUE NOT NULL,
    subject VARCHAR(255) NOT NULL,
    html_content TEXT NOT NULL,
    text_content TEXT,
    variables JSONB, -- Available template variables
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System logs for audit
CREATE TABLE system_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100),
    resource_id VARCHAR(100),
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    correlation_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_verification_token ON users(email_verification_token);
CREATE INDEX idx_users_reset_token ON users(password_reset_token);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_generations_user_id ON generations(user_id);
CREATE INDEX idx_generations_service_type ON generations(service_type);
CREATE INDEX idx_library_user_id ON library(user_id);
CREATE INDEX idx_library_service_type ON library(service_type);
CREATE INDEX idx_currency_rates_date ON currency_rates(date);
CREATE INDEX idx_currency_snapshots_session ON currency_snapshots(session_id);
CREATE INDEX idx_system_logs_user_id ON system_logs(user_id);
CREATE INDEX idx_system_logs_correlation ON system_logs(correlation_id);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_credits_updated_at BEFORE UPDATE ON credits
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_library_updated_at BEFORE UPDATE ON library
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();