@outbreak-risk
Feature: Outbreak Risk and Early Warning
  As a health official or system
  I want to see outbreak risk by area
  So that we can prioritize interventions and alert local governance

  Background:
    Given the API base URL is from environment

  Scenario: Get outbreak risk for all areas
    When I GET "/api/outbreak-risk"
    Then the response status should be 200
    And the response JSON "success" should be true
    And the response JSON "areas" should be an array
    And the response JSON "since" should be present

  Scenario: Get outbreak risk filtered by PIN code
    When I GET "/api/outbreak-risk?pinCode=781001"
    Then the response status should be 200
    And the response JSON "success" should be true
    And the response JSON "areas" should be an array

  Scenario: Each area has risk level and counts
    When I GET "/api/outbreak-risk"
    Then the response status should be 200
    And the response JSON "success" should be true
    And each item in "areas" has keys "area, risk, symptomCount, waterFailCount"
    And each "risk" in "areas" is one of "low, medium, high"
