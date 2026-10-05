Feature: Telemetry and Health Ping Verification
  Scenario: Health check endpoint responds cleanly
    When a probe request is sent to health endpoint
    Then the response status should be 200
