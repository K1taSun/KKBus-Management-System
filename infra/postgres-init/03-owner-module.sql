-- 1. Dodanie obsługi Soft Deletes do tras
ALTER TABLE routes ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- 2. Tabela Logów Systemowych (Audit Log)
CREATE TABLE IF NOT EXISTS system_logs (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action_type VARCHAR(100) NOT NULL,
    target_entity VARCHAR(100) NOT NULL,
    payload JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabela Cenników i Zniżek (Pricing Policies - Versioning)
CREATE TABLE IF NOT EXISTS pricing_policies (
    id SERIAL PRIMARY KEY,
    version_name VARCHAR(100) NOT NULL,
    base_price_multiplier DECIMAL(5,2) DEFAULT 1.0,
    student_discount_percent INT DEFAULT 51,
    child_discount_percent INT DEFAULT 30,
    loyalty_point_value DECIMAL(10,2) DEFAULT 0.10, -- 1 pkt = 0.10 PLN
    is_current BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default pricing policy
INSERT INTO pricing_policies (version_name, is_current) VALUES ('Standard 2026', TRUE);

-- 4. Tabela Płatności
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
    status VARCHAR(50) DEFAULT 'Zakończona' CHECK (status IN ('Oczekująca', 'Zakończona', 'Zwrócona')),
    payment_method VARCHAR(50) DEFAULT 'Przelew',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
