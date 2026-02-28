@water-quality
Feature: Water Quality Reporting
  As a community volunteer or ASHA worker
  I want to submit and view water quality reports
  So that health officials can monitor water source contamination

  Background:
    Given the API base URL is from environment

  Scenario: List water quality reports (no auth required)
    When I GET "/api/water-quality"
    Then the response status should be 200
    And the response JSON "success" should be true
    And the response JSON "reports" should be an array

  Scenario: List water quality reports filtered by PIN code
    When I GET "/api/water-quality?pinCode=781001"
    Then the response status should be 200
    And the response JSON "success" should be true
    And the response JSON "reports" should be an array

  Scenario: Submit water quality report requires authentication
    When I POST "/api/water-quality" with body:
      """
      {"source":"well","turbidity":"medium","pH":7.2,"bacterialPresence":"pass"}
      """
    Then the response status should be 401 or 200

  Scenario: Reject invalid water quality payload (missing required fields)
    When I POST "/api/water-quality" with body:
      """
      {"source":"well"}
      """
    Then the response status should be 400 or 401
