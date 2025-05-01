module.exports = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  PROXY_SERVERS: process.env.PROXY_SERVERS ? process.env.PROXY_SERVERS.split(',') : [],
  SEARCH_QUERIES: [
    "companies outsourcing call center work",
    "IT staffing agencies with overflow",
    "companies hiring remote web designers",
    "businesses needing photo editing services",
    "companies with hiring freezes but growing demand"
  ]
};
