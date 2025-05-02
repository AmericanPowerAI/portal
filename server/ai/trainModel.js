const tf = require('@tensorflow/tfjs-node');
const fs = require('fs');
const path = require('path');
const natural = require('natural');
const { stemmer } = natural;

// Sample training data - replace with your actual data
const trainingData = [
  { text: "overwhelmed with customer calls", label: "callCenter" },
  { text: "need urgent IT support", label: "it" },
  { text: "looking for web designers", label: "design" },
  // Add more examples...
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
