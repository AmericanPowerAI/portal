const OpenAI = require('openai');
const config = require('../config');

const openai = new OpenAI({ apiKey: config.OPENAI_API_KEY });

module.exports.analyzeCompanyNeeds = async (companyData) => {
  const prompt = `
  Analyze this company data and determine if they might need outsourcing services.
  Consider these factors:
  - Job postings indicating growth or staffing needs
  - Recent negative reviews about slow service
  - News about expansion or new contracts
  - Industry trends
  
  Company Data:
  ${JSON.stringify(companyData, null, 2)}
  
  Provide:
  1. Likelihood they need outsourcing (High/Medium/Low)
  2. Specific services they might need
  3. Recommended approach
  4. Key decision maker titles to target
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  return response.choices[0].message.content;
};
