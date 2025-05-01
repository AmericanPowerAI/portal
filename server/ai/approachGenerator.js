const OpenAI = require('openai');
const config = require('../config');

const openai = new OpenAI({ apiKey: config.OPENAI_API_KEY });

module.exports.generateApproach = async (companyInfo, contactInfo) => {
  const prompt = `
  Generate a tailored outreach approach for this company and contact:
  
  Company Info:
  ${JSON.stringify(companyInfo, null, 2)}
  
  Contact Info:
  ${JSON.stringify(contactInfo, null, 2)}
  
  Create:
  1. A subject line for email/LinkedIn
  2. Opening line referencing something specific about their company
  3. Value proposition tailored to their likely needs
  4. Specific call-to-action
  5. Follow-up strategy
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  return response.choices[0].message.content;
};
