const tf = require('@tensorflow/tfjs-node');
const natural = require('natural');
const config = require('../config');
const { stemmer } = natural;

class LocalNeedsAnalyzer {
  constructor() {
    this.model = null;
    this.categories = ['callCenter', 'it', 'design', 'general'];
    this.keywordMap = {
      callCenter: ['overwhelmed', 'calls', 'phone', 'customer service'],
      it: ['system', 'server', 'network', 'IT'],
      design: ['design', 'photoshop', 'web', 'graphic']
    };
  }

  async loadModel() {
    try {
      this.model = await tf.loadLayersModel(`file://${config.MODEL_PATHS.needsClassifier}/model.json`);
    } catch (err) {
      console.error("Couldn't load model, using rule-based fallback");
      this.model = null;
    }
  }

  analyzeWithRules(text) {
    const scores = {};
    let totalHits = 0;

    this.categories.forEach(category => {
      scores[category] = 0;
      this.keywordMap[category].forEach(keyword => {
        if (text.toLowerCase().includes(keyword)) {
          scores[category]++;
          totalHits++;
        }
      });
    });

    // Normalize scores
    if (totalHits > 0) {
      this.categories.forEach(category => {
        scores[category] = Math.round((scores[category] / totalHits) * 100);
      });
    }

    return scores;
  }

  async analyze(companyData) {
    if (!this.model) await this.loadModel();
    const text = `${companyData.title} ${companyData.description}`.toLowerCase();

    if (this.model) {
      // Use ML model if available
      const input = this.vectorizeText(text);
      const prediction = this.model.predict(input);
      const scores = await prediction.array();
      return this.formatPrediction(scores[0]);
    } else {
      // Fallback to rules
      return this.analyzeWithRules(text);
    }
  }

  vectorizeText(text) {
    const vector = new Array(this.categories.length).fill(0);
    const tokens = new natural.WordTokenizer().tokenize(text);
    
    tokens.forEach(token => {
      const stemmed = stemmer(token);
      this.categories.forEach((category, i) => {
        if (this.keywordMap[category].includes(stemmed)) {
          vector[i]++;
        }
      });
    });

    return tf.tensor2d([vector]);
  }

  formatPrediction(scores) {
    const result = {};
    scores.forEach((score, i) => {
      result[this.categories[i]] = Math.round(score * 100);
    });
    return result;
  }
}

module.exports = new LocalNeedsAnalyzer();
