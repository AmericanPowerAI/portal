const tf = require('@tensorflow/tfjs-node');
const fs = require('fs');
const path = require('path');
const natural = require('natural');
const { stemmer } = natural;

// Sample training data - replace with your actual data
const trainingData = [
  // ====================== CALL CENTER (60 examples) ======================
  { text: "Overwhelmed with customer call volume", label: "callCenter" },
  { text: "Need 24/7 bilingual call center agents", label: "callCenter" },
  { text: "Urgent hiring for remote customer support", label: "callCenter" },
  { text: "BPO services needed for tech support", label: "callCenter" },
  { text: "Third-party call center outsourcing", label: "callCenter" },
  { text: "Peak season staffing for call center", label: "callCenter" },
  { text: "Temporary call reps for product launch", label: "callCenter" },
  { text: "Backup team for holiday call surge", label: "callCenter" },
  { text: "50+ call center agents needed immediately", label: "callCenter" },
  { text: "Customer service outsourcing required", label: "callCenter" },
  { text: "Emergency call center staffing", label: "callCenter" },
  { text: "Outsource inbound sales calls", label: "callCenter" },
  { text: "Need call center manager with CRM experience", label: "callCenter" },
  { text: "After-hours call center support", label: "callCenter" },
  { text: "Medical call center representatives", label: "callCenter" },
  { text: "E-commerce customer service team", label: "callCenter" },
  { text: "High-touch client support specialists", label: "callCenter" },
  { text: "Spanish/English call center agents", label: "callCenter" },
  { text: "Outbound telemarketing team", label: "callCenter" },
  { text: "Customer retention specialists", label: "callCenter" },
  { text: "Help desk overflow support", label: "callCenter" },
  { text: "Technical support call center", label: "callCenter" },
  { text: "Insurance claims call handlers", label: "callCenter" },
  { text: "Appointment scheduling agents", label: "callCenter" },
  { text: "Banking customer service reps", label: "callCenter" },
  { text: "Travel booking call center", label: "callCenter" },
  { text: "Utility company call center staff", label: "callCenter" },
  { text: "Warranty support call agents", label: "callCenter" },
  { text: "Catalog sales representatives", label: "callCenter" },
  { text: "Patient scheduling coordinators", label: "callCenter" },
  { text: "Crisis hotline operators", label: "callCenter" },
  { text: "Roadside assistance dispatchers", label: "callCenter" },
  { text: "Virtual receptionist services", label: "callCenter" },
  { text: "Order processing specialists", label: "callCenter" },
  { text: "Complaint resolution team", label: "callCenter" },
  { text: "Membership renewal agents", label: "callCenter" },
  { text: "IT help desk outsourcing", label: "callCenter" },
  { text: "Multilingual customer support", label: "callCenter" },
  { text: "Lead qualification specialists", label: "callCenter" },
  { text: "Event registration call center", label: "callCenter" },
  { text: "Debt collection call agents", label: "callCenter" },
  { text: "Customer satisfaction surveyors", label: "callCenter" },
  { text: "Product support hotline staff", label: "callCenter" },
  { text: "Subscription management team", label: "callCenter" },
  { text: "Emergency response dispatchers", label: "callCenter" },
  { text: "Hotel reservation agents", label: "callCenter" },
  { text: "Car rental customer service", label: "callCenter" },
  { text: "Software support call center", label: "callCenter" },
  { text: "Financial services hotline", label: "callCenter" },
  { text: "Retail customer care center", label: "callCenter" },
  { text: "Wine club membership services", label: "callCenter" },
  { text: "Home security monitoring center", label: "callCenter" },
  { text: "Pet insurance claim handlers", label: "callCenter" },
  { text: "Telehealth appointment schedulers", label: "callCenter" },
  { text: "Student loan support agents", label: "callCenter" },
  { text: "HVAC service dispatchers", label: "callCenter" },
  { text: "Legal intake specialists", label: "callCenter" },
  { text: "Fitness membership sales team", label: "callCenter" },
  { text: "Moving company dispatchers", label: "callCenter" },
  { text: "Tier 2 technical support", label: "callCenter" },

  // ====================== IT/TECH (60 examples) ======================
  { text: "Senior AWS cloud architect needed", label: "it" },
  { text: "Azure DevOps engineer contract", label: "it" },
  { text: "React.js developers wanted", label: "it" },
  { text: "IT staff augmentation services", label: "it" },
  { text: "Kubernetes cluster administrator", label: "it" },
  { text: "Cybersecurity penetration tester", label: "it" },
  { text: "Python backend developer", label: "it" },
  { text: "MSP for network infrastructure", label: "it" },
  { text: "SQL database administrator", label: "it" },
  { text: "Blockchain smart contract developer", label: "it" },
  { text: "API integration specialist", label: "it" },
  { text: "Short-term Kubernetes expert", label: "it" },
  { text: "Terraform infrastructure engineer", label: "it" },
  { text: "Machine learning engineer", label: "it" },
  { text: "Data pipeline architect", label: "it" },
  { text: "Full-stack JavaScript developer", label: "it" },
  { text: "IT project manager contractor", label: "it" },
  { text: "SharePoint migration specialist", label: "it" },
  { text: "ServiceNow implementation expert", label: "it" },
  { text: "VoIP systems administrator", label: "it" },
  { text: "EDI integration consultant", label: "it" },
  { text: "SAP FICO module specialist", label: "it" },
  { text: "Oracle DBA contractor", label: "it" },
  { text: "Power BI dashboard developer", label: "it" },
  { text: "Tableau visualization expert", label: "it" },
  { text: "Snowflake data warehouse engineer", label: "it" },
  { text: "Elasticsearch implementation", label: "it" },
  { text: "Kafka streaming platform admin", label: "it" },
  { text: "Prometheus monitoring specialist", label: "it" },
  { text: "Grafana dashboard developer", label: "it" },
  { text: "Redis cache optimization", label: "it" },
  { text: "MongoDB NoSQL developer", label: "it" },
  { text: "PostgreSQL performance tuning", label: "it" },
  { text: "Neo4j graph database expert", label: "it" },
  { text: "Docker containerization specialist", label: "it" },
  { text: "Jenkins CI/CD pipeline engineer", label: "it" },
  { text: "GitLab DevOps implementation", label: "it" },
  { text: "Ansible automation engineer", label: "it" },
  { text: "Puppet configuration management", label: "it" },
  { text: "Chef infrastructure automation", label: "it" },
  { text: "Istio service mesh expert", label: "it" },
  { text: "Linkerd implementation specialist", label: "it" },
  { text: "Envoy proxy configuration", label: "it" },
  { text: "Nginx load balancing expert", label: "it" },
  { text: "HAProxy configuration specialist", label: "it" },
  { text: "Windows Server migration expert", label: "it" },
  { text: "Active Directory integration", label: "it" },
  { text: "Exchange Online migration", label: "it" },
  { text: "Office 365 deployment specialist", label: "it" },
  { text: "Azure Active Directory consultant", label: "it" },
  { text: "Okta implementation expert", label: "it" },
  { text: "PingFederate configuration", label: "it" },
  { text: "SAML/OAuth integration specialist", label: "it" },
  { text: "OpenID Connect implementation", label: "it" },
  { text: "Zero Trust security architect", label: "it" },
  { text: "SIEM implementation specialist", label: "it" },
  { text: "SOC analyst contractor", label: "it" },
  { text: "Incident response team lead", label: "it" },
  { text: "Forensic cybersecurity expert", label: "it" },
  { text: "PCI DSS compliance consultant", label: "it" },
  { text: "HIPAA security assessment", label: "it" },

  // ====================== DESIGN (50 examples) ======================
  { text: "UI/UX designer for mobile app", label: "design" },
  { text: "Adobe Photoshop expert needed", label: "design" },
  { text: "Freelance graphic designer", label: "design" },
  { text: "Website redesign project", label: "design" },
  { text: "Social media banner creation", label: "design" },
  { text: "Logo and branding specialist", label: "design" },
  { text: "Illustrator for packaging design", label: "design" },
  { text: "3D product renderings needed", label: "design" },
  { text: "Motion graphics designer", label: "design" },
  { text: "Figma expert for wireframes", label: "design" },
  { text: "Canva templates designer", label: "design" },
  { text: "Print design outsourcing", label: "design" },
  { text: "UX research contractor", label: "design" },
  { text: "Children's book illustrator", label: "design" },
  { text: "Infographic designer", label: "design" },
  { text: "Trade show booth designer", label: "design" },
  { text: "PowerPoint template designer", label: "design" },
  { text: "Email newsletter designer", label: "design" },
  { text: "Landing page UI designer", label: "design" },
  { text: "Mobile game artist", label: "design" },
  { text: "Character designer for animation", label: "design" },
  { text: "Architectural visualization", label: "design" },
  { text: "Medical illustration specialist", label: "design" },
  { text: "Fashion technical designer", label: "design" },
  { text: "Jewelry CAD designer", label: "design" },
  { text: "Vehicle wrap designer", label: "design" },
  { text: "Billboard advertising designer", label: "design" },
  { text: "Book cover designer", label: "design" },
  { text: "Magazine layout artist", label: "design" },
  { text: "Restaurant menu designer", label: "design" },
  { text: "Wayfinding signage designer", label: "design" },
  { text: "Trade show exhibit designer", label: "design" },
  { text: "Product label designer", label: "design" },
  { text: "Textile pattern designer", label: "design" },
  { text: "Wall mural artist", label: "design" },
  { text: "Tattoo design illustrator", label: "design" },
  { text: "Storyboard artist", label: "design" },
  { text: "Comic book illustrator", label: "design" },
  { text: "Cartoon character designer", label: "design" },
  { text: "NFT digital artist", label: "design" },
  { text: "AR/VR interface designer", label: "design" },
  { text: "Dashboard UI specialist", label: "design" },
  { text: "Data visualization designer", label: "design" },
  { text: "Icon set designer", label: "design" },
  { text: "Font/typography designer", label: "design" },
  { text: "Packaging structural designer", label: "design" },
  { text: "Retail display designer", label: "design" },
  { text: "Trade show graphics designer", label: "design" },
  { text: "Environmental graphic designer", label: "design" },
  { text: "Exhibit space planner", label: "design" },

  // ====================== GENERAL (30 examples) ======================
  { text: "Temporary office assistants", label: "general" },
  { text: "Virtual assistant outsourcing", label: "general" },
  { text: "Data entry clerks needed", label: "general" },
  { text: "Part-time bookkeeper", label: "general" },
  { text: "Admin support contractor", label: "general" },
  { text: "Outsourced HR coordinator", label: "general" },
  { text: "Short-term project manager", label: "general" },
  { text: "Remote executive assistant", label: "general" },
  { text: "Temporary receptionist", label: "general" },
  { text: "Freelance copywriter needed", label: "general" },
  { text: "Legal document reviewer", label: "general" },
  { text: "Medical transcriptionist", label: "general" },
  { text: "Inventory management specialist", label: "general" },
  { text: "Event planning coordinator", label: "general" },
  { text: "Grant writing specialist", label: "general" },
  { text: "Proofreading contractor", label: "general" },
  { text: "Market research interviewer", label: "general" },
  { text: "Telephone survey conductor", label: "general" },
  { text: "Mystery shopper coordinator", label: "general" },
  { text: "Appointment setter", label: "general" },
  { text: "Lead generation specialist", label: "general" },
  { text: "Customer success manager", label: "general" },
  { text: "Sales development rep", label: "general" },
  { text: "Inside sales contractor", label: "general" },
  { text: "Technical writer", label: "general" },
  { text: "Translation services", label: "general" },
  { text: "Interpreter services", label: "general" },
  { text: "Language tutor", label: "general" },
  { text: "Life coach", label: "general" },
  { text: "Personal assistant", label: "general" }
];

// Prepare data
const categories = [...new Set(trainingData.map(item => item.label))];
const tokenizer = new natural.WordTokenizer();

function textToVector(text) {
  const tokens = tokenizer.tokenize(text.toLowerCase());
  const vector = new Array(categories.length).fill(0);
  
  tokens.forEach(token => {
    const stemmed = stemmer(token);
    trainingData.forEach(item => {
      if (item.text.includes(stemmed)) {
        const index = categories.indexOf(item.label);
        vector[index]++;
      }
    });
  });
  
  return vector;
}

// Prepare tensors
const xs = tf.tensor2d(trainingData.map(item => textToVector(item.text)));
const ys = tf.oneHot(trainingData.map(item => categories.indexOf(item.label)), categories.length);

// Build model
const model = tf.sequential();
model.add(tf.layers.dense({ units: 16, activation: 'relu', inputShape: [categories.length] }));
model.add(tf.layers.dense({ units: categories.length, activation: 'softmax' }));

model.compile({
  optimizer: 'adam',
  loss: 'categoricalCrossentropy',
  metrics: ['accuracy']
});

// Train and save
async function train() {
  await model.fit(xs, ys, { epochs: 50 });
  const savePath = path.join(__dirname, 'models/needs-classifier');
  await model.save(`file://${savePath}`);
  console.log('Model trained and saved at', savePath);
}

train();
