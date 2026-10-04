# Sahaay Architecture & Deployment Pipeline

## Overview

Sahaay combines smart community health surveillance, disease outbreak prediction, and chronic care management into a unified platform.

## Deployment & CARF Integration

The production runtime is orchestrated via PM2 and monitored by the **Change-Aware Rollback Framework (CARF)**:

```
[Git Push to main]
       │
       ▼
[GitHub Actions CI / Webhook]
       │
       ▼
[CARF Change Classification Engine]
       │ (Analyzes AST complexity, vector types, blast radius)
       ▼
[Dynamic Policy Resolution]
       │ (Assigns error threshold and soak window duration)
       ▼
[PM2 Deployment Execution]
       │ (Zero-downtime reload via deploy.sh)
       ▼
[CARF Health & Soak Probing]
       │
   ┌───┴───┐
   │       │
[Healthy] [Breached]
   │       │
[Succeed] [Automated Rollback to Previous Stable HEAD]
```

### Risk Vectors
1. **Unclassified / Docs**: Baseline threshold, standard monitoring.
2. **Test**: Isolated test harness changes with zero production risk.
3. **Code (Low / High AST)**: Evaluated via Tree-sitter for branch complexity.
4. **Config**: Parameter and environment tuning with standard config soak windows.
5. **Dependency**: Sensitive package additions with lockfile verification.
6. **Infra**: Container and deployment specifications.
7. **Data**: Database schemas and migration auditing.
