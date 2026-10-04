-- Migration: Add audit log table and timestamp indices for request auditing
-- CARF Data Vector: Innocuous audit migration with indexed timestamp columns

CREATE TABLE IF NOT EXISTS request_audit_logs (
    id SERIAL PRIMARY KEY,
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    status_code INTEGER NOT NULL,
    response_time_ms INTEGER,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_request_audit_logs_created_at ON request_audit_logs (created_at);
CREATE INDEX IF NOT EXISTS idx_request_audit_logs_endpoint ON request_audit_logs (endpoint);
