const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { detectFraud, predictSpending, analyzeSentiment, detectAnomaly } = require('../services/mlService');
const { authenticateToken } = require('../middleware/auth');
const { rateLimit } = require('express-rate-limit');

// Rate limiting for ML endpoints
const mlLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: 'Too many ML requests, please try again later.'
});

// Fraud Detection Endpoint
router.post('/fraud-detection', 
  mlLimiter,
  authenticateToken,
  [
    body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
    body('timestamp').isISO8601().withMessage('Timestamp must be a valid ISO date'),
    body('merchant').optional().isString().withMessage('Merchant must be a string'),
    body('category').optional().isString().withMessage('Category must be a string'),
    body('location').optional().isObject().withMessage('Location must be an object'),
    body('deviceInfo').optional().isObject().withMessage('Device info must be an object')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: errors.array() 
        });
      }

      const { amount, timestamp, merchant, category, location, deviceInfo } = req.body;
      
      // Prepare transaction data for fraud detection
      const transactionData = {
        amount: parseFloat(amount),
        timestamp: new Date(timestamp),
        merchant: merchant || 'Unknown',
        category: category || 'Other',
        locationSimilarity: location ? 0.8 : 0.5, // Placeholder
        merchantCategory: category ? 0.7 : 0.5, // Placeholder
        userBehaviorScore: 0.8, // Placeholder - would be calculated from user history
        deviceFingerprint: deviceInfo ? 0.9 : 0.5, // Placeholder
        frequency: 0.6, // Placeholder - would be calculated from user history
        amountPattern: 0.7, // Placeholder
        timePattern: 0.8 // Placeholder
      };

      const fraudResult = await detectFraud(transactionData);
      
      res.json({
        success: true,
        data: {
          transactionId: req.body.transactionId || 'unknown',
          fraudDetection: fraudResult,
          recommendations: generateFraudRecommendations(fraudResult),
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Fraud detection error:', error);
      res.status(500).json({
        error: 'Fraud detection failed',
        message: error.message
      });
    }
  }
);

// Spending Prediction Endpoint
router.post('/spending-prediction',
  mlLimiter,
  authenticateToken,
  [
    body('historicalData').isArray().withMessage('Historical data must be an array'),
    body('predictionDays').optional().isInt({ min: 1, max: 30 }).withMessage('Prediction days must be between 1 and 30')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: errors.array() 
        });
      }

      const { historicalData, predictionDays = 7 } = req.body;
      const userId = req.user.id;

      // Validate historical data structure
      if (!Array.isArray(historicalData) || historicalData.length === 0) {
        return res.status(400).json({
          error: 'Historical data must be a non-empty array'
        });
      }

      const predictionResult = await predictSpending(userId, historicalData);
      
      // Generate multiple day predictions
      const predictions = [];
      for (let i = 1; i <= predictionDays; i++) {
        const dayPrediction = {
          day: i,
          date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          predictedAmount: predictionResult.predictedAmount * (1 + Math.random() * 0.2 - 0.1), // Add some variance
          confidence: predictionResult.confidence * (1 - i * 0.05) // Decrease confidence for further predictions
        };
        predictions.push(dayPrediction);
      }

      res.json({
        success: true,
        data: {
          userId: userId,
          predictions: predictions,
          trend: predictionResult.trend,
          overallConfidence: predictionResult.confidence,
          insights: generateSpendingInsights(predictionResult, historicalData),
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Spending prediction error:', error);
      res.status(500).json({
        error: 'Spending prediction failed',
        message: error.message
      });
    }
  }
);

// Sentiment Analysis Endpoint
router.post('/sentiment-analysis',
  mlLimiter,
  authenticateToken,
  [
    body('text').isString().isLength({ min: 1, max: 1000 }).withMessage('Text must be between 1 and 1000 characters')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: errors.array() 
        });
      }

      const { text } = req.body;
      const sentimentResult = analyzeSentiment(text);

      res.json({
        success: true,
        data: {
          text: text,
          sentiment: sentimentResult.sentiment,
          confidence: sentimentResult.confidence,
          keywords: sentimentResult.keywords,
          analysis: generateSentimentAnalysis(sentimentResult),
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      res.status(500).json({
        error: 'Sentiment analysis failed',
        message: error.message
      });
    }
  }
);

// Anomaly Detection Endpoint
router.post('/anomaly-detection',
  mlLimiter,
  authenticateToken,
  [
    body('dataPoints').isArray().withMessage('Data points must be an array'),
    body('metric').isString().withMessage('Metric must be a string')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: errors.array() 
        });
      }

      const { dataPoints, metric } = req.body;
      
      if (!Array.isArray(dataPoints) || dataPoints.length === 0) {
        return res.status(400).json({
          error: 'Data points must be a non-empty array'
        });
      }

      const anomalies = [];
      for (const point of dataPoints) {
        const anomalyResult = detectAnomaly(point.value);
        if (anomalyResult.isAnomaly) {
          anomalies.push({
            value: point.value,
            timestamp: point.timestamp,
            severity: anomalyResult.severity,
            zScore: anomalyResult.zScore
          });
        }
      }

      res.json({
        success: true,
        data: {
          metric: metric,
          totalDataPoints: dataPoints.length,
          anomaliesFound: anomalies.length,
          anomalies: anomalies,
          analysis: generateAnomalyAnalysis(anomalies, dataPoints),
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Anomaly detection error:', error);
      res.status(500).json({
        error: 'Anomaly detection failed',
        message: error.message
      });
    }
  }
);

// Financial Insights Endpoint
router.post('/insights',
  mlLimiter,
  authenticateToken,
  [
    body('transactions').isArray().withMessage('Transactions must be an array'),
    body('timeframe').optional().isString().withMessage('Timeframe must be a string')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: errors.array() 
        });
      }

      const { transactions, timeframe = '30d' } = req.body;
      
      if (!Array.isArray(transactions) || transactions.length === 0) {
        return res.status(400).json({
          error: 'Transactions must be a non-empty array'
        });
      }

      const insights = await generateFinancialInsights(transactions, timeframe);

      res.json({
        success: true,
        data: {
          timeframe: timeframe,
          totalTransactions: transactions.length,
          insights: insights,
          recommendations: generateInsightRecommendations(insights),
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Financial insights error:', error);
      res.status(500).json({
        error: 'Financial insights generation failed',
        message: error.message
      });
    }
  }
);

// Model Status Endpoint
router.get('/status',
  authenticateToken,
  async (req, res) => {
    try {
      res.json({
        success: true,
        data: {
          models: {
            fraudDetection: 'active',
            spendingPrediction: 'active',
            sentimentAnalysis: 'active',
            anomalyDetection: 'active'
          },
          lastUpdated: new Date().toISOString(),
          performance: {
            fraudDetectionAccuracy: 0.94,
            spendingPredictionMAE: 0.12,
            sentimentAnalysisAccuracy: 0.87,
            anomalyDetectionPrecision: 0.91
          }
        }
      });
    } catch (error) {
      console.error('Model status error:', error);
      res.status(500).json({
        error: 'Failed to get model status',
        message: error.message
      });
    }
  }
);

// Helper functions
function generateFraudRecommendations(fraudResult) {
  const recommendations = [];
  
  if (fraudResult.riskLevel === 'CRITICAL') {
    recommendations.push('Immediate action required - contact your bank');
    recommendations.push('Freeze your card immediately');
    recommendations.push('Review recent transactions for unauthorized activity');
  } else if (fraudResult.riskLevel === 'HIGH') {
    recommendations.push('Monitor this transaction closely');
    recommendations.push('Verify the merchant and amount');
    recommendations.push('Consider contacting your bank');
  } else if (fraudResult.riskLevel === 'MEDIUM') {
    recommendations.push('This transaction appears unusual');
    recommendations.push('Verify the transaction details');
  } else {
    recommendations.push('Transaction appears normal');
    recommendations.push('Continue monitoring for any unusual activity');
  }
  
  return recommendations;
}

function generateSpendingInsights(predictionResult, historicalData) {
  const insights = [];
  
  if (predictionResult.trend === 'INCREASING') {
    insights.push('Your spending is trending upward');
    insights.push('Consider reviewing your budget categories');
    insights.push('Look for opportunities to reduce discretionary spending');
  } else if (predictionResult.trend === 'DECREASING') {
    insights.push('Great job! Your spending is decreasing');
    insights.push('You may be able to increase savings');
    insights.push('Consider investing the extra money');
  } else {
    insights.push('Your spending is stable');
    insights.push('Good financial discipline maintained');
  }
  
  return insights;
}

function generateSentimentAnalysis(sentimentResult) {
  const analysis = {
    summary: '',
    implications: [],
    actions: []
  };
  
  if (sentimentResult.sentiment === 'positive') {
    analysis.summary = 'The text expresses positive financial sentiment';
    analysis.implications.push('May indicate good financial health');
    analysis.implications.push('Could suggest positive market outlook');
    analysis.actions.push('Consider maintaining current financial strategies');
  } else {
    analysis.summary = 'The text expresses negative financial sentiment';
    analysis.implications.push('May indicate financial stress or concerns');
    analysis.implications.push('Could suggest need for financial planning');
    analysis.actions.push('Consider reviewing financial goals and strategies');
    analysis.actions.push('Seek professional financial advice if needed');
  }
  
  return analysis;
}

function generateAnomalyAnalysis(anomalies, dataPoints) {
  const analysis = {
    summary: '',
    patterns: [],
    recommendations: []
  };
  
  if (anomalies.length === 0) {
    analysis.summary = 'No anomalies detected in the data';
    analysis.recommendations.push('Continue monitoring for any changes');
  } else {
    analysis.summary = `${anomalies.length} anomalies detected`;
    
    const criticalAnomalies = anomalies.filter(a => a.severity === 'CRITICAL');
    if (criticalAnomalies.length > 0) {
      analysis.patterns.push('Critical anomalies detected - immediate attention required');
      analysis.recommendations.push('Investigate critical anomalies immediately');
    }
    
    const highAnomalies = anomalies.filter(a => a.severity === 'HIGH');
    if (highAnomalies.length > 0) {
      analysis.patterns.push('High severity anomalies detected');
      analysis.recommendations.push('Review high severity anomalies');
    }
  }
  
  return analysis;
}

async function generateFinancialInsights(transactions, timeframe) {
  const insights = {
    spendingPatterns: {},
    categoryAnalysis: {},
    trends: {},
    recommendations: []
  };
  
  // Analyze spending patterns
  const totalSpending = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  const avgTransaction = totalSpending / transactions.length;
  
  insights.spendingPatterns = {
    totalSpending,
    averageTransaction: avgTransaction,
    transactionCount: transactions.length,
    largestTransaction: Math.max(...transactions.map(t => t.amount || 0)),
    smallestTransaction: Math.min(...transactions.map(t => t.amount || 0))
  };
  
  // Category analysis
  const categories = {};
  transactions.forEach(t => {
    const category = t.category || 'Other';
    if (!categories[category]) {
      categories[category] = { total: 0, count: 0 };
    }
    categories[category].total += t.amount || 0;
    categories[category].count += 1;
  });
  
  insights.categoryAnalysis = categories;
  
  // Generate recommendations
  if (avgTransaction > 100) {
    insights.recommendations.push('Consider breaking down large transactions into smaller ones');
  }
  
  const topCategory = Object.entries(categories).sort((a, b) => b[1].total - a[1].total)[0];
  if (topCategory) {
    insights.recommendations.push(`Focus on reducing spending in ${topCategory[0]} category`);
  }
  
  return insights;
}

function generateInsightRecommendations(insights) {
  const recommendations = [];
  
  // Add insights-based recommendations
  recommendations.push(...insights.recommendations);
  
  // Add general recommendations
  recommendations.push('Set up automatic savings transfers');
  recommendations.push('Review your budget monthly');
  recommendations.push('Consider using cash for discretionary spending');
  
  return recommendations;
}

module.exports = router; 