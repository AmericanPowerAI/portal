const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const config = require('../config');

class JobScraper {
  constructor() {
    this.browser = null;
    this.scrapers = {
      indeed: this.scrapeIndeed,
      linkedin: this.scrapeLinkedIn,
      callcenterjobs: this.scrapeCallCenterJobs,
      dice: this.scrapeDice,
      glassdoor: this.scrapeGlassdoor
    };
  }

  async init() {
    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    });
  }

  async scrape(jobType) {
    if (!this.browser) await this.init();
    const results = [];
    const sites = config.JOB_SITES[jobType.toUpperCase()] || config.JOB_SITES.GENERAL;
    
    for (const site of sites) {
      const domain = new URL(site).hostname.replace('www.', '');
      const scraper = this.scrapers[domain.split('.')[0]] || this.scrapeGeneric;
      
      try {
        const queries = config.SEARCH_QUERIES[jobType.toUpperCase()] || [jobType];
        for (const query of queries) {
          const jobs = await scraper.call(this, site, query);
          results.push(...jobs.map(job => ({ ...job, source: domain, query })));
          await new Promise(resolve => setTimeout(resolve, 2000)); // Rate limiting
        }
      } catch (err) {
        console.error(`Failed to scrape ${site}:`, err.message);
      }
    }

    return results;
  }

  // --- Site-Specific Scrapers ---
  async scrapeIndeed(url, query) {
    const page = await this.browser.newPage();
    await page.goto(`${url}/jobs?q=${encodeURIComponent(query)}&l=`, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    return await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.job_seen_beacon')).map(job => ({
        title: job.querySelector('.jobTitle')?.innerText?.trim(),
        company: job.querySelector('.companyName')?.innerText?.trim(),
        location: job.querySelector('.companyLocation')?.innerText?.trim(),
        description: job.querySelector('.job-snippet')?.innerText?.trim(),
        date: job.querySelector('.date')?.innerText?.trim(),
        link: job.querySelector('.jobTitle a')?.href
      })).filter(job => job.title && job.company);
    }).finally(() => page.close());
  }

  async scrapeLinkedIn(url, query) {
    const page = await this.browser.newPage();
    await page.goto(`${url}/jobs/search/?keywords=${encodeURIComponent(query)}`, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    return await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.jobs-search__results-list li')).map(job => ({
        title: job.querySelector('.base-search-card__title')?.innerText?.trim(),
        company: job.querySelector('.base-search-card__subtitle')?.innerText?.trim(),
        location: job.querySelector('.job-search-card__location')?.innerText?.trim(),
        description: job.querySelector('.base-search-card__snippet')?.innerText?.trim(),
        date: job.querySelector('time')?.datetime,
        link: job.querySelector('a.base-card__full-link')?.href
      })).filter(job => job.title && job.company);
    }).finally(() => page.close());
  }

  async scrapeCallCenterJobs(url) {
    const page = await this.browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    return await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.job-listing')).map(job => ({
        title: job.querySelector('.job-title a')?.innerText?.trim(),
        company: job.querySelector('.company-name')?.innerText?.trim(),
        location: job.querySelector('.job-location')?.innerText?.trim(),
        description: job.querySelector('.job-description')?.innerText?.trim(),
        date: job.querySelector('.post-date')?.innerText?.trim(),
        link: job.querySelector('.job-title a')?.href
      })).filter(job => job.title && job.company);
    }).finally(() => page.close());
  }

  async scrapeDice(url, query) {
    const page = await this.browser.newPage();
    await page.goto(`${url}/jobs?q=${encodeURIComponent(query)}`, {
      waitUntil: 'networkidle2'
    });

    return await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.search-card')).map(job => ({
        title: job.querySelector('.card-title-link')?.innerText?.trim(),
        company: job.querySelector('[data-cy="search-result-company-name"]')?.innerText?.trim(),
        location: job.querySelector('[data-cy="search-result-location"]')?.innerText?.trim(),
        description: job.querySelector('.card-description')?.innerText?.trim(),
        date: job.querySelector('.posted-date')?.innerText?.trim(),
        link: job.querySelector('.card-title-link')?.href
      })).filter(job => job.title && job.company);
    }).finally(() => page.close());
  }

  async scrapeGlassdoor(url, query) {
    const page = await this.browser.newPage();
    await page.goto(`${url}/jobs/searchResults.htm?keyword=${encodeURIComponent(query)}`, {
      waitUntil: 'networkidle2'
    });

    return await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.react-job-listing')).map(job => ({
        title: job.querySelector('[data-test="job-link"]')?.innerText?.trim(),
        company: job.querySelector('[data-test="employer-name"]')?.innerText?.trim(),
        location: job.querySelector('[data-test="location"]')?.innerText?.trim(),
        description: job.querySelector('.job-description')?.innerText?.trim(),
        date: job.querySelector('[data-test="job-age"]')?.innerText?.trim(),
        link: job.querySelector('[data-test="job-link"]')?.href
      })).filter(job => job.title && job.company);
    }).finally(() => page.close());
  }

  async scrapeGeneric(url, query) {
    const page = await this.browser.newPage();
    await page.goto(`${url}/jobs?search=${encodeURIComponent(query)}`, {
      waitUntil: 'domcontentloaded'
    });

    return await page.evaluate(() => {
      // Fallback generic scraping logic
      return Array.from(document.querySelectorAll('div.job, li.job')).map(job => ({
        title: job.querySelector('h2.title, h3.title')?.innerText?.trim(),
        company: job.querySelector('.company, .employer')?.innerText?.trim(),
        location: job.querySelector('.location, .place')?.innerText?.trim(),
        description: job.querySelector('.description, .summary')?.innerText?.trim(),
        date: job.querySelector('.date, .time')?.innerText?.trim(),
        link: job.querySelector('a.job-link, a.title')?.href
      })).filter(job => job.title && job.company);
    }).finally(() => page.close());
  }

  async close() {
    if (this.browser) await this.browser.close();
  }
}

module.exports = new JobScraper();
