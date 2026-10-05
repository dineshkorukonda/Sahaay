-- Migration: Add audit resolution index
CREATE INDEX IF NOT EXISTS idx_telemetry_audit_status_code ON telemetry_audit_logs(status_code);
