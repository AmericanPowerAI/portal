module.exports = {
  // Remove OpenAI config
  SEARCH_QUERIES: [
    "companies outsourcing call center work",
    "IT staffing agencies with overflow",
    "companies hiring remote web designers",
    "businesses needing photo editing services",
    "companies with hiring freezes but growing demand"
  ],
  // Add local model paths
  MODEL_PATHS: {
    needsClassifier: './server/ai/models/needs-classifier',
    approachGenerator: './server/ai/models/approach-generator'
  }
};
