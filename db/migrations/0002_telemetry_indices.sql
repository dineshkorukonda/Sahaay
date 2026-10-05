-- Migration: Telemetry health audit index and table definition
CREATE TABLE IF NOT EXISTS telemetry_audit_logs (
    id SERIAL PRIMARY KEY,
    probe_name VARCHAR(128) NOT NULL,
    status_code INTEGER NOT NULL,
    latency_ms NUMERIC(8, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_telemetry_audit_probe_name ON telemetry_audit_logs(probe_name);
CREATE INDEX IF NOT EXISTS idx_telemetry_audit_created_at ON telemetry_audit_logs(created_at);
