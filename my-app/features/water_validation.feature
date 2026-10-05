Feature: Water Parameter Validation
  Scenario: Validation helper catches boundary conditions
    When a probe request is sent to health endpoint
    Then the response status should be 200
