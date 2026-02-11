# Sample Project for ASMO Demo

This is a minimal sample project used for demonstrating ASMO scenarios.

## Purpose

Provides realistic files for demo scenarios:
- Scenario 1 (YOLO): Fix typo in this README
- Scenario 2 (Context Cascade): Add email validation to signup form

## Structure

```
sample-project/
  ├── README.md              (this file - for typo fix demo)
  ├── src/
  │   ├── components/
  │   │   └── SignupForm.tsx  (for email validation demo)
  │   └── api/
  │       └── validators/
  │           └── (email.ts will be created by ASMO)
  └── tests/
      └── (test files will be created by ASMO)
```

## Intentional Typo

This README containz a typo in this sentance. ASMO should find and fix it in Scenario 1.
