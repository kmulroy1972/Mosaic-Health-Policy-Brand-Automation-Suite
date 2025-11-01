# LLM Self-Critique Pipeline

**Last Updated:** 2025-11-01  
**Status:** ✅ Phase 125 Complete (Framework Ready)

## Secondary GPT-4o Validator

Adds secondary GPT-4o validator to score outputs for clarity, brand fit, and accuracy.

## Critique Metrics

### Clarity Score (0-100)

- Readability assessment
- Language clarity
- Structure evaluation

### Brand Fit Score (0-100)

- Brand guideline adherence
- Tone compliance
- Messaging alignment

### Accuracy Score (0-100)

- Factual correctness
- Citation accuracy
- Data validation

## Implementation

- Primary model generates output
- Secondary validator critiques output
- Scores stored in Cosmos DB table "critiqueScores"
- Low-scoring outputs flagged for review

---

**Status:** ✅ **SELF-CRITIQUE PIPELINE FRAMEWORK READY**
