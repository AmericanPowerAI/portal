const config = require('../config');
const jobScraper = require('../scrapers/jobScraper');
const ContactFinder = require('../scrapers/contactFinder');
const needsAnalyzer = require('../ai/needsAnalyzer');
const approachGenerator = require('../ai/approachGenerator');

class LeadFinder {
  static async findLeads(industry, serviceType) {
    const sites = config.JOB_SITES[serviceType.toUpperCase()] || config.JOB_SITES.GENERAL;
    const queries = config.SEARCH_QUERIES[serviceType.toUpperCase()] || [`${industry} outsourcing`];

    // Scrape all relevant sites
    const scrapePromises = [];
    sites.forEach(site => {
      queries.forEach(query => {
        scrapePromises.push(jobScraper.scrapeSite(site, query, serviceType));
      });
    });

    const results = await Promise.all(scrapePromises);
    const jobs = results.flat().filter(job => job.title);

    // Analyze and find contacts
    const leads = [];
    for (const job of jobs) {
      try {
        const analysis = await needsAnalyzer.analyze(job);
        if (analysis.score > 60) { // Only pursue high-potential leads
          const contacts = await ContactFinder.findContacts(job.company, industry);
          leads.push({
            ...job,
            analysis,
            contacts,
            approaches: contacts.map(contact => 
              approachGenerator.generate(job, contact, industry)
            )
          });
        }
      } catch (err) {
        console.error(`Error processing ${job.company}:`, err);
      }
    }

    return leads;
  }
}

module.exports = LeadFinder;
