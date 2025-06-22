const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const { rateLimit } = require('express-rate-limit');
const {
  getCryptoPrice,
  getWalletBalance,
  getTokenBalance,
  getTransactionHistory,
  getGasPrice,
  sendTransaction,
  getMarketData,
  getPortfolioValue,
  getSupportedNetworks,
  getSupportedTokens
} = require('../services/cryptoService');

// Rate limiting for crypto endpoints
const cryptoLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many crypto requests, please try again later.'
});

// Get Crypto Price
router.get('/price/:symbol',
  cryptoLimiter,
  authenticateToken,
  async (req, res) => {
    try {
      const { symbol } = req.params;
      const price = await getCryptoPrice(symbol);
      
      res.json({
        success: true,
        data: {
          symbol: symbol,
          price: price,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Get crypto price error:', error);
      res.status(500).json({
        error: 'Failed to get crypto price',
        message: error.message
      });
    }
  }
);

// Get Multiple Crypto Prices
router.post('/prices',
  cryptoLimiter,
  authenticateToken,
  [
    body('symbols').isArray().withMessage('Symbols must be an array'),
    body('symbols.*').isString().withMessage('Each symbol must be a string')
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

      const { symbols } = req.body;
      const prices = {};

      for (const symbol of symbols) {
        try {
          const price = await getCryptoPrice(symbol);
          prices[symbol] = price;
        } catch (error) {
          prices[symbol] = null;
          console.warn(`Failed to get price for ${symbol}:`, error.message);
        }
      }

      res.json({
        success: true,
        data: {
          prices: prices,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Get multiple crypto prices error:', error);
      res.status(500).json({
        error: 'Failed to get crypto prices',
        message: error.message
      });
    }
  }
);

// Get Wallet Balance
router.get('/wallet/:address/:network',
  cryptoLimiter,
  authenticateToken,
  async (req, res) => {
    try {
      const { address, network } = req.params;
      
      if (!address || !network) {
        return res.status(400).json({
          error: 'Address and network are required'
        });
      }

      const balance = await getWalletBalance(address, network);
      
      res.json({
        success: true,
        data: balance
      });
    } catch (error) {
      console.error('Get wallet balance error:', error);
      res.status(500).json({
        error: 'Failed to get wallet balance',
        message: error.message
      });
    }
  }
);

// Get Token Balance
router.get('/token/:address/:tokenAddress/:network',
  cryptoLimiter,
  authenticateToken,
  async (req, res) => {
    try {
      const { address, tokenAddress, network } = req.params;
      
      if (!address || !tokenAddress || !network) {
        return res.status(400).json({
          error: 'Address, token address, and network are required'
        });
      }

      const balance = await getTokenBalance(address, tokenAddress, network);
      
      res.json({
        success: true,
        data: balance
      });
    } catch (error) {
      console.error('Get token balance error:', error);
      res.status(500).json({
        error: 'Failed to get token balance',
        message: error.message
      });
    }
  }
);

// Get Transaction History
router.get('/transactions/:address/:network',
  cryptoLimiter,
  authenticateToken,
  async (req, res) => {
    try {
      const { address, network } = req.params;
      const { limit = 50 } = req.query;
      
      if (!address || !network) {
        return res.status(400).json({
          error: 'Address and network are required'
        });
      }

      const history = await getTransactionHistory(address, network, parseInt(limit));
      
      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      console.error('Get transaction history error:', error);
      res.status(500).json({
        error: 'Failed to get transaction history',
        message: error.message
      });
    }
  }
);

// Get Gas Price
router.get('/gas/:network',
  cryptoLimiter,
  authenticateToken,
  async (req, res) => {
    try {
      const { network } = req.params;
      
      if (!network) {
        return res.status(400).json({
          error: 'Network is required'
        });
      }

      const gasPrice = await getGasPrice(network);
      
      res.json({
        success: true,
        data: gasPrice
      });
    } catch (error) {
      console.error('Get gas price error:', error);
      res.status(500).json({
        error: 'Failed to get gas price',
        message: error.message
      });
    }
  }
);

// Send Transaction
router.post('/send',
  cryptoLimiter,
  authenticateToken,
  [
    body('fromAddress').isEthereumAddress().withMessage('From address must be a valid Ethereum address'),
    body('toAddress').isEthereumAddress().withMessage('To address must be a valid Ethereum address'),
    body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
    body('privateKey').isString().withMessage('Private key is required'),
    body('network').optional().isString().withMessage('Network must be a string')
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

      const { fromAddress, toAddress, amount, privateKey, network = 'ethereum' } = req.body;

      const transaction = await sendTransaction(fromAddress, toAddress, amount, privateKey, network);
      
      res.json({
        success: true,
        data: transaction
      });
    } catch (error) {
      console.error('Send transaction error:', error);
      res.status(500).json({
        error: 'Failed to send transaction',
        message: error.message
      });
    }
  }
);

// Get Market Data
router.get('/market/:symbol',
  cryptoLimiter,
  authenticateToken,
  async (req, res) => {
    try {
      const { symbol } = req.params;
      
      if (!symbol) {
        return res.status(400).json({
          error: 'Symbol is required'
        });
      }

      const marketData = await getMarketData(symbol);
      
      res.json({
        success: true,
        data: marketData
      });
    } catch (error) {
      console.error('Get market data error:', error);
      res.status(500).json({
        error: 'Failed to get market data',
        message: error.message
      });
    }
  }
);

// Get Portfolio Value
router.post('/portfolio',
  cryptoLimiter,
  authenticateToken,
  [
    body('wallets').isArray().withMessage('Wallets must be an array'),
    body('wallets.*.address').isEthereumAddress().withMessage('Each wallet must have a valid address'),
    body('wallets.*.network').isString().withMessage('Each wallet must have a network'),
    body('wallets.*.symbol').isString().withMessage('Each wallet must have a symbol')
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

      const { wallets } = req.body;

      const portfolio = await getPortfolioValue(wallets);
      
      res.json({
        success: true,
        data: portfolio
      });
    } catch (error) {
      console.error('Get portfolio value error:', error);
      res.status(500).json({
        error: 'Failed to get portfolio value',
        message: error.message
      });
    }
  }
);

// Get Supported Networks
router.get('/networks',
  authenticateToken,
  async (req, res) => {
    try {
      const networks = await getSupportedNetworks();
      
      res.json({
        success: true,
        data: networks
      });
    } catch (error) {
      console.error('Get supported networks error:', error);
      res.status(500).json({
        error: 'Failed to get supported networks',
        message: error.message
      });
    }
  }
);

// Get Supported Tokens
router.get('/tokens/:network',
  authenticateToken,
  async (req, res) => {
    try {
      const { network } = req.params;
      
      if (!network) {
        return res.status(400).json({
          error: 'Network is required'
        });
      }

      const tokens = await getSupportedTokens(network);
      
      res.json({
        success: true,
        data: tokens
      });
    } catch (error) {
      console.error('Get supported tokens error:', error);
      res.status(500).json({
        error: 'Failed to get supported tokens',
        message: error.message
      });
    }
  }
);

// Get Crypto News
router.get('/news',
  cryptoLimiter,
  authenticateToken,
  async (req, res) => {
    try {
      const { limit = 10, category = 'cryptocurrency' } = req.query;
      
      // This would integrate with a news API like NewsAPI
      // For now, returning mock data
      const news = [
        {
          title: 'Bitcoin reaches new all-time high',
          description: 'Bitcoin has reached a new all-time high as institutional adoption continues to grow.',
          url: 'https://example.com/bitcoin-news',
          publishedAt: new Date().toISOString(),
          source: 'CryptoNews'
        },
        {
          title: 'Ethereum 2.0 upgrade progresses',
          description: 'The Ethereum network continues its transition to proof-of-stake with successful upgrades.',
          url: 'https://example.com/ethereum-news',
          publishedAt: new Date().toISOString(),
          source: 'BlockchainDaily'
        }
      ];

      res.json({
        success: true,
        data: {
          news: news.slice(0, parseInt(limit)),
          category: category,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Get crypto news error:', error);
      res.status(500).json({
        error: 'Failed to get crypto news',
        message: error.message
      });
    }
  }
);

// Get Crypto Market Overview
router.get('/market-overview',
  cryptoLimiter,
  authenticateToken,
  async (req, res) => {
    try {
      const symbols = ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'ADA/USDT', 'SOL/USDT'];
      const marketOverview = {};

      for (const symbol of symbols) {
        try {
          const marketData = await getMarketData(symbol);
          marketOverview[symbol] = marketData;
        } catch (error) {
          console.warn(`Failed to get market data for ${symbol}:`, error.message);
          marketOverview[symbol] = null;
        }
      }

      // Calculate market cap and volume totals
      const totalMarketCap = Object.values(marketOverview)
        .filter(data => data !== null)
        .reduce((sum, data) => sum + (data.marketCap || 0), 0);

      const totalVolume = Object.values(marketOverview)
        .filter(data => data !== null)
        .reduce((sum, data) => sum + (data.volume || 0), 0);

      res.json({
        success: true,
        data: {
          markets: marketOverview,
          summary: {
            totalMarketCap: totalMarketCap,
            totalVolume: totalVolume,
            marketCount: Object.keys(marketOverview).length
          },
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Get market overview error:', error);
      res.status(500).json({
        error: 'Failed to get market overview',
        message: error.message
      });
    }
  }
);

// Get Crypto Price Alerts
router.get('/alerts',
  authenticateToken,
  async (req, res) => {
    try {
      const userId = req.user.id;
      
      // This would fetch user's price alerts from database
      // For now, returning mock data
      const alerts = [
        {
          id: '1',
          userId: userId,
          symbol: 'BTC/USDT',
          targetPrice: 50000,
          condition: 'above', // above or below
          isActive: true,
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          userId: userId,
          symbol: 'ETH/USDT',
          targetPrice: 3000,
          condition: 'below',
          isActive: true,
          createdAt: new Date().toISOString()
        }
      ];

      res.json({
        success: true,
        data: alerts
      });
    } catch (error) {
      console.error('Get price alerts error:', error);
      res.status(500).json({
        error: 'Failed to get price alerts',
        message: error.message
      });
    }
  }
);

// Create Price Alert
router.post('/alerts',
  authenticateToken,
  [
    body('symbol').isString().withMessage('Symbol is required'),
    body('targetPrice').isFloat({ min: 0 }).withMessage('Target price must be a positive number'),
    body('condition').isIn(['above', 'below']).withMessage('Condition must be above or below')
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

      const { symbol, targetPrice, condition } = req.body;
      const userId = req.user.id;

      // This would save the alert to database
      const alert = {
        id: Date.now().toString(),
        userId: userId,
        symbol: symbol,
        targetPrice: targetPrice,
        condition: condition,
        isActive: true,
        createdAt: new Date().toISOString()
      };

      res.json({
        success: true,
        data: alert
      });
    } catch (error) {
      console.error('Create price alert error:', error);
      res.status(500).json({
        error: 'Failed to create price alert',
        message: error.message
      });
    }
  }
);

// Delete Price Alert
router.delete('/alerts/:alertId',
  authenticateToken,
  async (req, res) => {
    try {
      const { alertId } = req.params;
      const userId = req.user.id;

      // This would delete the alert from database
      // For now, just returning success

      res.json({
        success: true,
        message: 'Alert deleted successfully'
      });
    } catch (error) {
      console.error('Delete price alert error:', error);
      res.status(500).json({
        error: 'Failed to delete price alert',
        message: error.message
      });
    }
  }
);

module.exports = router; 