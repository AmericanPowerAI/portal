const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose'); // Added MongoDB requirement
const { scrapeIndeedJobs } = require('./scraper/indeedScraper');
const { scrapeLinkedIn } = require('./scraper/linkedinScraper');
const needsAnalyzer = require('./ai/needsAnalyzer');
const approachGenerator = require('./ai/approachGenerator');
const config = require('./config');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection (NEW - Added at the top of middleware)
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/hr-platform", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// EXISTING CODE BELOW (UNCHANGED) ---------------------------------

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
    
    // 2. Analyze which companies need help (LOCAL AI)
    const analyzedCompanies = await Promise.all(
      jobResults.flat().map(async company => ({
        ...company,
        analysis: await needsAnalyzer.analyze(company)
      }))
    );
    
    // 3. Find decision makers
    const companiesWithContacts = await Promise.all(
      analyzedCompanies
        .filter(c => Object.values(c.analysis).some(score => score > 50))
        .map(async company => ({
          ...company,
          contacts: await scrapeLinkedIn(company.company)
        }))
    );
    
    // 4. Generate approaches (LOCAL AI)
    const leads = companiesWithContacts.map(company => ({
      ...company,
      approaches: company.contacts.map(contact => 
        approachGenerator.generate(company, contact)
      )
    }));
    
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
  console.log('Using LOCAL AI models - no API keys required');
});
