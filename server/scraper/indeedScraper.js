const puppeteer = require('puppeteer');

module.exports.scrapeIndeedJobs = async (query) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.goto(`https://www.indeed.com/jobs?q=${encodeURIComponent(query)}`);
  
  const results = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.job_seen_beacon')).map(job => ({
      title: job.querySelector('.jobTitle').innerText,
      company: job.querySelector('.companyName')?.innerText,
      location: job.querySelector('.companyLocation')?.innerText,
      description: job.querySelector('.job-snippet')?.innerText,
      date: job.querySelector('.date')?.innerText,
      link: job.querySelector('.jobTitle a')?.href
    }));
  });

  await browser.close();
  return results.filter(job => job.company);
};
