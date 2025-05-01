const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

module.exports.scrapeLinkedIn = async (companyName) => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto(`https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(companyName)}%20HR%20OR%20Recruiting%20OR%20Talent%20OR%20Hiring%20OR%20Manager`);
  
  await page.waitForTimeout(5000); // Wait for results to load
  
  const contacts = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.entity-result')).map(result => ({
      name: result.querySelector('.entity-result__title-text a')?.innerText,
      title: result.querySelector('.entity-result__primary-subtitle')?.innerText,
      link: result.querySelector('.entity-result__title-text a')?.href
    }));
  });

  await browser.close();
  return contacts.filter(contact => contact.name && contact.title);
};
