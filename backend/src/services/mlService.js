const tf = require('@tensorflow/tfjs-node');
const natural = require('natural');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;

class MLService {
  constructor() {
    this.models = {};
    this.tokenizer = new natural.WordTokenizer();
    this.classifier = new natural.BayesClassifier();
    this.isInitialized = false;
  }

  async initialize() {
    try {
      console.log('🤖 Initializing ML Service...');
      
      // Load pre-trained models
      await this.loadModels();
      
      // Initialize fraud detection model
      await this.initializeFraudDetection();
      
      // Initialize spending prediction model
      await this.initializeSpendingPrediction();
      
      // Initialize sentiment analysis
      await this.initializeSentimentAnalysis();
      
      // Initialize anomaly detection
      await this.initializeAnomalyDetection();
      
      this.isInitialized = true;
      console.log('✅ ML Service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize ML Service:', error);
      throw error;
    }
  }

  async loadModels() {
    const modelsDir = path.join(__dirname, '../models');
    
    try {
      // Create models directory if it doesn't exist
      await fs.mkdir(modelsDir, { recursive: true });
      
      // Load TensorFlow.js models
      const modelFiles = await fs.readdir(modelsDir);
      
      for (const file of modelFiles) {
        if (file.endsWith('.json')) {
          const modelName = file.replace('.json', '');
          const modelPath = path.join(modelsDir, modelName);
          
          try {
            this.models[modelName] = await tf.loadLayersModel(`file://${modelPath}`);
            console.log(`📦 Loaded model: ${modelName}`);
          } catch (error) {
            console.warn(`⚠️ Failed to load model ${modelName}:`, error.message);
          }
        }
      }
    } catch (error) {
      console.warn('⚠️ No pre-trained models found, will train new ones');
    }
  }

  async initializeFraudDetection() {
    // Initialize fraud detection model
    if (!this.models.fraudDetection) {
      this.models.fraudDetection = this.createFraudDetectionModel();
    }
    
    // Train with sample data if needed
    await this.trainFraudDetectionModel();
  }

  async initializeSpendingPrediction() {
    // Initialize spending prediction model
    if (!this.models.spendingPrediction) {
      this.models.spendingPrediction = this.createSpendingPredictionModel();
    }
    
    // Train with sample data if needed
    await this.trainSpendingPredictionModel();
  }

  async initializeSentimentAnalysis() {
    // Train sentiment classifier with financial terms
    const positiveTerms = [
      'profit', 'gain', 'increase', 'growth', 'positive', 'good', 'excellent',
      'successful', 'profitable', 'rising', 'bullish', 'optimistic'
    ];
    
    const negativeTerms = [
      'loss', 'decrease', 'decline', 'negative', 'bad', 'poor', 'failing',
      'unprofitable', 'falling', 'bearish', 'pessimistic', 'debt'
    ];
    
    positiveTerms.forEach(term => this.classifier.addDocument(term, 'positive'));
    negativeTerms.forEach(term => this.classifier.addDocument(term, 'negative'));
    
    this.classifier.train();
  }

  async initializeAnomalyDetection() {
    // Initialize anomaly detection using isolation forest
    this.anomalyDetector = {
      threshold: 0.95,
      dataPoints: [],
      mean: 0,
      std: 1
    };
  }

  createFraudDetectionModel() {
    const model = tf.sequential({
      layers: [
        tf.layers.dense({
          units: 64,
          activation: 'relu',
          inputShape: [10]
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({
          units: 32,
          activation: 'relu'
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({
          units: 16,
          activation: 'relu'
        }),
        tf.layers.dense({
          units: 1,
          activation: 'sigmoid'
        })
      ]
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  createSpendingPredictionModel() {
    const model = tf.sequential({
      layers: [
        tf.layers.lstm({
          units: 50,
          returnSequences: true,
          inputShape: [30, 5]
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.lstm({
          units: 50,
          returnSequences: false
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({
          units: 25,
          activation: 'relu'
        }),
        tf.layers.dense({
          units: 1,
          activation: 'linear'
        })
      ]
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mae']
    });

    return model;
  }

  async trainFraudDetectionModel() {
    // Generate synthetic fraud detection training data
    const features = [];
    const labels = [];
    
    // Normal transactions (0)
    for (let i = 0; i < 1000; i++) {
      features.push([
        Math.random() * 1000, // amount
        Math.random() * 24, // hour
        Math.random() * 7, // day of week
        Math.random(), // location similarity
        Math.random(), // merchant category
        Math.random(), // user behavior score
        Math.random(), // device fingerprint
        Math.random(), // transaction frequency
        Math.random(), // amount pattern
        Math.random() // time pattern
      ]);
      labels.push(0);
    }
    
    // Fraudulent transactions (1)
    for (let i = 0; i < 200; i++) {
      features.push([
        Math.random() * 5000 + 1000, // high amount
        Math.random() * 24, // random hour
        Math.random() * 7, // random day
        Math.random() * 0.3, // low location similarity
        Math.random(), // random merchant
        Math.random() * 0.4, // low behavior score
        Math.random(), // different device
        Math.random() * 0.5, // unusual frequency
        Math.random(), // unusual amount pattern
        Math.random() // unusual time pattern
      ]);
      labels.push(1);
    }
    
    const xs = tf.tensor2d(features);
    const ys = tf.tensor2d(labels, [labels.length, 1]);
    
    await this.models.fraudDetection.fit(xs, ys, {
      epochs: 50,
      batchSize: 32,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          if (epoch % 10 === 0) {
            console.log(`Fraud Detection Epoch ${epoch}: loss = ${logs.loss.toFixed(4)}, accuracy = ${logs.acc.toFixed(4)}`);
          }
        }
      }
    });
    
    xs.dispose();
    ys.dispose();
  }

  async trainSpendingPredictionModel() {
    // Generate synthetic spending prediction training data
    const sequences = [];
    const targets = [];
    
    for (let i = 0; i < 500; i++) {
      const sequence = [];
      for (let j = 0; j < 30; j++) {
        sequence.push([
          Math.random() * 1000, // daily spending
          Math.random() * 100, // daily income
          Math.random() * 10, // day of month
          Math.random() * 7, // day of week
          Math.random() * 12 // month
        ]);
      }
      sequences.push(sequence);
      
      // Target is the next day's spending
      targets.push(Math.random() * 1000);
    }
    
    const xs = tf.tensor3d(sequences);
    const ys = tf.tensor2d(targets, [targets.length, 1]);
    
    await this.models.spendingPrediction.fit(xs, ys, {
      epochs: 30,
      batchSize: 16,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          if (epoch % 10 === 0) {
            console.log(`Spending Prediction Epoch ${epoch}: loss = ${logs.loss.toFixed(4)}, mae = ${logs.mae.toFixed(4)}`);
          }
        }
      }
    });
    
    xs.dispose();
    ys.dispose();
  }

  async detectFraud(transactionData) {
    if (!this.isInitialized) {
      throw new Error('ML Service not initialized');
    }
    
    const features = this.extractFraudFeatures(transactionData);
    const input = tf.tensor2d([features]);
    
    const prediction = await this.models.fraudDetection.predict(input);
    const fraudProbability = prediction.dataSync()[0];
    
    input.dispose();
    prediction.dispose();
    
    return {
      isFraudulent: fraudProbability > 0.7,
      probability: fraudProbability,
      riskLevel: this.getRiskLevel(fraudProbability)
    };
  }

  async predictSpending(userId, historicalData) {
    if (!this.isInitialized) {
      throw new Error('ML Service not initialized');
    }
    
    const sequence = this.prepareSpendingSequence(historicalData);
    const input = tf.tensor3d([sequence]);
    
    const prediction = await this.models.spendingPrediction.predict(input);
    const predictedAmount = prediction.dataSync()[0];
    
    input.dispose();
    prediction.dispose();
    
    return {
      predictedAmount: Math.max(0, predictedAmount),
      confidence: 0.85, // Placeholder confidence score
      trend: this.analyzeSpendingTrend(historicalData)
    };
  }

  analyzeSentiment(text) {
    if (!this.isInitialized) {
      throw new Error('ML Service not initialized');
    }
    
    const classification = this.classifier.classify(text);
    const confidence = this.classifier.getClassifications(text);
    
    return {
      sentiment: classification,
      confidence: confidence[0].value,
      keywords: this.extractKeywords(text)
    };
  }

  detectAnomaly(dataPoint) {
    if (!this.isInitialized) {
      throw new Error('ML Service not initialized');
    }
    
    // Simple statistical anomaly detection
    const zScore = Math.abs((dataPoint - this.anomalyDetector.mean) / this.anomalyDetector.std);
    
    return {
      isAnomaly: zScore > 2.5,
      zScore: zScore,
      severity: this.getAnomalySeverity(zScore)
    };
  }

  extractFraudFeatures(transaction) {
    return [
      transaction.amount || 0,
      new Date(transaction.timestamp).getHours(),
      new Date(transaction.timestamp).getDay(),
      transaction.locationSimilarity || 0.5,
      transaction.merchantCategory || 0.5,
      transaction.userBehaviorScore || 0.5,
      transaction.deviceFingerprint || 0.5,
      transaction.frequency || 0.5,
      transaction.amountPattern || 0.5,
      transaction.timePattern || 0.5
    ];
  }

  prepareSpendingSequence(historicalData) {
    const sequence = [];
    const data = historicalData.slice(-30); // Last 30 days
    
    for (let i = 0; i < 30; i++) {
      const dayData = data[i] || {
        spending: 0,
        income: 0,
        dayOfMonth: 1,
        dayOfWeek: 1,
        month: 1
      };
      
      sequence.push([
        dayData.spending || 0,
        dayData.income || 0,
        dayData.dayOfMonth || 1,
        dayData.dayOfWeek || 1,
        dayData.month || 1
      ]);
    }
    
    return sequence;
  }

  extractKeywords(text) {
    const tokens = this.tokenizer.tokenize(text.toLowerCase());
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    
    return tokens.filter(token => 
      token.length > 2 && !stopWords.includes(token)
    ).slice(0, 5);
  }

  getRiskLevel(probability) {
    if (probability < 0.3) return 'LOW';
    if (probability < 0.6) return 'MEDIUM';
    if (probability < 0.8) return 'HIGH';
    return 'CRITICAL';
  }

  getAnomalySeverity(zScore) {
    if (zScore < 2) return 'LOW';
    if (zScore < 3) return 'MEDIUM';
    if (zScore < 4) return 'HIGH';
    return 'CRITICAL';
  }

  analyzeSpendingTrend(historicalData) {
    if (historicalData.length < 2) return 'STABLE';
    
    const recent = historicalData.slice(-7);
    const previous = historicalData.slice(-14, -7);
    
    const recentAvg = recent.reduce((sum, d) => sum + (d.spending || 0), 0) / recent.length;
    const previousAvg = previous.reduce((sum, d) => sum + (d.spending || 0), 0) / previous.length;
    
    const change = ((recentAvg - previousAvg) / previousAvg) * 100;
    
    if (change > 10) return 'INCREASING';
    if (change < -10) return 'DECREASING';
    return 'STABLE';
  }

  async saveModels() {
    const modelsDir = path.join(__dirname, '../models');
    
    for (const [name, model] of Object.entries(this.models)) {
      const modelPath = path.join(modelsDir, name);
      await model.save(`file://${modelPath}`);
      console.log(`💾 Saved model: ${name}`);
    }
  }

  async runPythonScript(scriptPath, args = []) {
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn('python', [scriptPath, ...args]);
      
      let output = '';
      let error = '';
      
      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      pythonProcess.stderr.on('data', (data) => {
        error += data.toString();
      });
      
      pythonProcess.on('close', (code) => {
        if (code === 0) {
          resolve(output);
        } else {
          reject(new Error(`Python script failed: ${error}`));
        }
      });
    });
  }
}

// Singleton instance
const mlService = new MLService();

module.exports = {
  initializeMLModels: () => mlService.initialize(),
  detectFraud: (data) => mlService.detectFraud(data),
  predictSpending: (userId, data) => mlService.predictSpending(userId, data),
  analyzeSentiment: (text) => mlService.analyzeSentiment(text),
  detectAnomaly: (dataPoint) => mlService.detectAnomaly(dataPoint),
  saveModels: () => mlService.saveModels(),
  mlService
}; 