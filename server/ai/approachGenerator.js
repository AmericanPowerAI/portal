const templates = {
  callCenter: {
    subject: [
      "Quick help with your call volume",
      "Relief for your overwhelmed team"
    ],
    body: [
      "Hi {name}, I noticed {company} is experiencing high call volumes - we can provide trained agents within 72 hours",
      "{name}, our call center specialists have helped companies like yours reduce wait times by 40%"
    ]
  },
  it: {
    subject: [
      "IT support for your growing needs",
      "Specialized tech talent available"
    ],
    body: [
      "Hello {name}, your recent posts about {tech} match our specialists' skills perfectly",
      "{name}, we've helped companies reduce IT hiring time by 50% while maintaining quality"
    ]
  }
};

class LocalApproachGenerator {
  generate(company, contact) {
    // Determine primary need (highest score)
    const primaryNeed = Object.entries(company.analysis)
      .sort((a, b) => b[1] - a[1])[0][0];
    
    const categoryTemplates = templates[primaryNeed] || templates.general;
    const firstName = contact.name.split(' ')[0];
    
    return {
      subject: this.randomTemplate(categoryTemplates.subject)
        .replace('{company}', company.company),
      body: this.randomTemplate(categoryTemplates.body)
        .replace('{name}', firstName)
        .replace('{company}', company.company)
        .replace('{tech}', this.detectTech(company.description))
    };
  }

  randomTemplate(templates) {
    return templates[Math.floor(Math.random() * templates.length)];
  }

  detectTech(text) {
    const techKeywords = {
      web: ['react', 'angular', 'javascript'],
      cloud: ['aws', 'azure', 'gcp'],
      database: ['sql', 'mongo', 'postgres']
    };
    
    for (const [tech, keywords] of Object.entries(techKeywords)) {
      if (keywords.some(kw => text.includes(kw))) {
        return tech;
      }
    }
    return 'technology';
  }
}

module.exports = new LocalApproachGenerator();
