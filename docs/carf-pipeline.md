# CARF Deployment & Verification Pipeline

This document details the deployment lifecycle and Change-Aware Rollback Framework (CARF) verification pipeline for Sahaay.

## Overview

Sahaay uses CARF to continuously observe deployments, dynamically adapt rollback sensitivity based on the nature of incoming changes, and guard against regressions without requiring manual operator intervention.

## Pipeline Lifecycle

1. **Commit Intake & Webhook**: Every push to the `main` branch sends a webhook payload to the CARF core API (`https://carf.indevs.in`).
2. **Change-Vector Classification**:
   - **Tier 1**: Deterministic path matcher classifies changed files into `infra`, `dependency`, `config`, `code`, `data`, or `test`.
   - **Tier 2**: Tree-sitter AST structural complexity analysis evaluates cyclomatic depth, nested branching, and loops on code files.
3. **Threshold & Soak Calibration**:
   - Strictest (minimum) error rate threshold across active vectors is computed.
   - Longest (maximum) soak window across active vectors is assigned.
4. **CI Gate**: GitHub Actions runs automated linting, schema migrations, production build, and Cucumber BDD tests.
5. **PM2 Deployment**: CARF triggers zero-downtime cluster reload on the host.
6. **Health Surveillance**:
   - Live HTTP probes check configured health endpoints (`http://127.0.0.1:3000`).
   - If anomaly thresholds or probe failure limits are breached during the soak window, automated rollback restores the previously promoted SHA.
   - If health probes remain stable throughout the window, CARF marks the rollout as `Promoted`.
