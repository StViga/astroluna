-- AstroLuna Test Data
-- Seed file with sample data for development

-- Insert test users
INSERT OR IGNORE INTO users (email, password_hash, full_name, phone, language, currency) VALUES 
  ('alice@example.com', '$2a$10$example_hash_alice', 'Alice Johnson', '+1234567890', 'en', 'EUR'),
  ('bob@example.com', '$2a$10$example_hash_bob', 'Bob Smith', '+1234567891', 'en', 'USD'),
  ('charlie@example.com', '$2a$10$example_hash_charlie', 'Charlie Brown', '+1234567892', 'de', 'GBP');

-- Insert credits for test users
INSERT OR IGNORE INTO credits (user_id, balance) VALUES 
  (1, 100.0),
  (2, 50.0),
  (3, 75.0);

-- Insert sample transactions
INSERT OR IGNORE INTO transactions (user_id, amount_eur, amount_currency, currency, rate_used, rates_timestamp, tx_id, status) VALUES 
  (1, 10.00, 10.00, 'EUR', 1.0, '2024-01-15 10:00:00', 'tx_alice_001', 'completed'),
  (2, 10.00, 11.50, 'USD', 1.15, '2024-01-15 10:00:00', 'tx_bob_001', 'completed'),
  (3, 10.00, 8.50, 'GBP', 0.85, '2024-01-15 10:00:00', 'tx_charlie_001', 'completed');

-- Insert sample generation logs
INSERT OR IGNORE INTO generation_logs (user_id, service_type, params, base_cost, total_cost, status, result_id) VALUES 
  (1, 'astroscope', '{"birth_date": "1990-05-15", "zodiac_sign": "taurus"}', 15, 15, 'completed', 'content_1'),
  (1, 'tarotpath', '{"name": "Alice", "birth_date": "1990-05-15"}', 20, 20, 'completed', 'content_2'),
  (2, 'zodiac_tome', '{"zodiac_sign": "gemini"}', 10, 10, 'completed', 'content_3');

-- Insert sample content
INSERT OR IGNORE INTO content_library (user_id, content_type, title, content, meta) VALUES 
  (1, 'horoscope', 'Monthly Horoscope for Taurus - January 2024', 
   '{"sections": {"love": "This month brings new opportunities in love...", "career": "Financial stability is within reach...", "health": "Focus on mental wellness...", "personal": "Time for self-reflection..."}}',
   '{"birth_date": "1990-05-15", "zodiac_sign": "taurus", "month": "2024-01"}'),
  
  (1, 'tarot_reading', 'Tarot Reading for Alice - January 2024',
   '{"cards": [{"name": "The Sun", "position": "past", "interpretation": "Joy and success in the past"}, {"name": "The Moon", "position": "present", "interpretation": "Illusions and uncertainty now"}, {"name": "The Star", "position": "future", "interpretation": "Hope and guidance ahead"}], "overall": "A journey from clarity through confusion to renewed hope"}',
   '{"name": "Alice", "birth_date": "1990-05-15", "reading_date": "2024-01-15"}'),
  
  (2, 'zodiac_info', 'Gemini Compatibility Analysis',
   '{"compatibility": {"aries": {"score": 85, "description": "High energy match"}, "leo": {"score": 90, "description": "Perfect intellectual connection"}, "scorpio": {"score": 45, "description": "Challenging but growth-oriented"}}, "insights": {"career": "Natural communicator and networker", "love": "Needs mental stimulation in relationships", "health": "Should focus on stress management"}}',
   '{"zodiac_sign": "gemini", "analysis_type": "compatibility"}');

-- Insert sample support ticket
INSERT OR IGNORE INTO support_tickets (user_id, full_name, email, message, status) VALUES 
  (1, 'Alice Johnson', 'alice@example.com', 'I have a question about my horoscope accuracy. Can you help?', 'open');

-- Insert sample exchange rates
INSERT OR IGNORE INTO rates_cache (rates_data, rates_timestamp) VALUES 
  ('{"EUR": 1.0, "USD": 1.15, "GBP": 0.85, "timestamp": "2024-01-15T10:00:00Z"}', '2024-01-15 10:00:00');