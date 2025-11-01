# Azure Functions API Documentation

Generated: 2025-11-01T01:24:36.182Z

## Overview

This document provides comprehensive documentation for all Azure Functions endpoints.

## Endpoints

### health

- **Route:** `api/health`
- **Method:** `GET`
- **Description:** Health check endpoint that verifies service status and dependencies

### templates

- **Route:** `api/templates`
- **Method:** `GET`
- **Description:** Retrieves available brand templates from SharePoint

### rewrite

- **Route:** `api/rewrite`
- **Method:** `POST`
- **Description:** Uses Azure OpenAI to rewrite text to match brand tone

### brandguidanceagent

- **Route:** `api/brandguidanceagent`
- **Method:** `POST`
- **Description:** Analyzes documents against brand formatting and compliance rules

### convertPdfA

- **Route:** `api/pdf/convert`
- **Method:** `POST`
- **Description:** Converts PDF to text or PDF/A format

### validatePdf

- **Route:** `api/pdf/validate`
- **Method:** `POST`
- **Description:** Validates PDF for WCAG/508 accessibility compliance
