const express = require('express');
const cors = require('cors');
const { scrapeIndeedJobs } = require('./scraper/indeedScraper');
const { scrapeLinkedIn } = require('./scraper/linkedinScraper');
const { analyzeCompanyNeeds } = require('./ai/needsAnalyzer');
const { generateApproach } = require('./ai/approachGenerator');
const config = require('./config');

const app = express();
app.use(cors());
app.use(express.json());

// Aggressive lead finding endpoint
app.post('/api/find-leads', async (req, res) => {
  try {
    const { industry, services } = req.body;
    
    // 1. Find companies posting relevant jobs
    const jobQueries = [
      `"${industry}" AND "overwhelmed"`,
      `"${industry}" AND "help needed"`,
      `"${industry}" AND "urgent hiring"`,
      ...services.map(service => `"${industry}" AND "outsource ${service}"`)
    ];
    
    const jobResults = await Promise.all(
      jobQueries.map(query => scrapeIndeedJobs(query))
    );
    
    // 2. Analyze which companies need help
    const analyzedCompanies = await Promise.all(
      jobResults.flat().map(async company => ({
        ...company,
        analysis: await analyzeCompanyNeeds(company)
      }))
    );
    
    // 3. Find decision makers
    const companiesWithContacts = await Promise.all(
      analyzedCompanies.filter(c => c.analysis.includes('High')).map(async company => ({
        ...company,
        contacts: await scrapeLinkedIn(company.company)
      }))
    );
    
    // 4. Generate approaches
    const leads = await Promise.all(
      companiesWithContacts.map(async company => ({
        ...company,
        approaches: await Promise.all(
          company.contacts.map(contact => 
            generateApproach(company, contact)
          )
      }))
    );
    
    res.json({
      success: true,
      count: leads.length,
      leads
    });
    
  } catch (error) {
    console.error('Lead finding error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
