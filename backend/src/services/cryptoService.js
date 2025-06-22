const Web3 = require('web3');
const { ethers } = require('ethers');
const axios = require('axios');
const ccxt = require('ccxt');
const cron = require('node-cron');

class CryptoService {
  constructor() {
    this.providers = {};
    this.exchanges = {};
    this.priceCache = new Map();
    this.walletBalances = new Map();
    this.isInitialized = false;
    this.updateInterval = null;
  }

  async initialize() {
    try {
      console.log('🔗 Initializing Crypto Service...');
      
      // Initialize Web3 providers
      await this.initializeProviders();
      
      // Initialize exchange connections
      await this.initializeExchanges();
      
      // Start price updates
      this.startPriceUpdates();
      
      // Start balance monitoring
      this.startBalanceMonitoring();
      
      this.isInitialized = true;
      console.log('✅ Crypto Service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Crypto Service:', error);
      throw error;
    }
  }

  async initializeProviders() {
    // Initialize Ethereum provider
    if (process.env.ETHEREUM_RPC_URL) {
      this.providers.ethereum = new Web3(process.env.ETHEREUM_RPC_URL);
      console.log('🔗 Connected to Ethereum network');
    } else {
      this.providers.ethereum = new Web3('https://mainnet.infura.io/v3/your-project-id');
      console.log('⚠️ Using default Ethereum provider');
    }

    // Initialize Polygon provider
    if (process.env.POLYGON_RPC_URL) {
      this.providers.polygon = new Web3(process.env.POLYGON_RPC_URL);
      console.log('🔗 Connected to Polygon network');
    }

    // Initialize BSC provider
    if (process.env.BSC_RPC_URL) {
      this.providers.bsc = new Web3(process.env.BSC_RPC_URL);
      console.log('🔗 Connected to BSC network');
    }

    // Initialize Arbitrum provider
    if (process.env.ARBITRUM_RPC_URL) {
      this.providers.arbitrum = new Web3(process.env.ARBITRUM_RPC_URL);
      console.log('🔗 Connected to Arbitrum network');
    }
  }

  async initializeExchanges() {
    // Initialize Binance
    try {
      this.exchanges.binance = new ccxt.binance({
        apiKey: process.env.BINANCE_API_KEY,
        secret: process.env.BINANCE_SECRET_KEY,
        sandbox: process.env.NODE_ENV === 'development'
      });
      console.log('🔗 Connected to Binance');
    } catch (error) {
      console.warn('⚠️ Failed to connect to Binance:', error.message);
    }

    // Initialize Coinbase Pro
    try {
      this.exchanges.coinbase = new ccxt.coinbasepro({
        apiKey: process.env.COINBASE_API_KEY,
        secret: process.env.COINBASE_SECRET_KEY,
        password: process.env.COINBASE_PASSPHRASE
      });
      console.log('🔗 Connected to Coinbase Pro');
    } catch (error) {
      console.warn('⚠️ Failed to connect to Coinbase Pro:', error.message);
    }

    // Initialize Kraken
    try {
      this.exchanges.kraken = new ccxt.kraken({
        apiKey: process.env.KRAKEN_API_KEY,
        secret: process.env.KRAKEN_SECRET_KEY
      });
      console.log('🔗 Connected to Kraken');
    } catch (error) {
      console.warn('⚠️ Failed to connect to Kraken:', error.message);
    }
  }

  startPriceUpdates() {
    // Update crypto prices every 30 seconds
    this.updateInterval = setInterval(async () => {
      await this.updateCryptoPrices();
    }, 30000);

    // Initial price update
    this.updateCryptoPrices();
  }

  startBalanceMonitoring() {
    // Monitor wallet balances every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
      await this.updateWalletBalances();
    });
  }

  async updateCryptoPrices() {
    try {
      const symbols = [
        'BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'ADA/USDT', 'SOL/USDT',
        'DOT/USDT', 'DOGE/USDT', 'AVAX/USDT', 'MATIC/USDT', 'LINK/USDT'
      ];

      for (const symbol of symbols) {
        try {
          const price = await this.getCryptoPrice(symbol);
          this.priceCache.set(symbol, {
            price: price,
            timestamp: Date.now()
          });
        } catch (error) {
          console.warn(`⚠️ Failed to update price for ${symbol}:`, error.message);
        }
      }
    } catch (error) {
      console.error('❌ Failed to update crypto prices:', error);
    }
  }

  async getCryptoPrice(symbol) {
    try {
      // Try Binance first
      if (this.exchanges.binance) {
        const ticker = await this.exchanges.binance.fetchTicker(symbol);
        return ticker.last;
      }

      // Fallback to CoinGecko API
      const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price`, {
        params: {
          ids: this.getCoinGeckoId(symbol),
          vs_currencies: 'usd'
        }
      });

      const coinId = this.getCoinGeckoId(symbol);
      return response.data[coinId].usd;
    } catch (error) {
      throw new Error(`Failed to get price for ${symbol}: ${error.message}`);
    }
  }

  getCoinGeckoId(symbol) {
    const mapping = {
      'BTC/USDT': 'bitcoin',
      'ETH/USDT': 'ethereum',
      'BNB/USDT': 'binancecoin',
      'ADA/USDT': 'cardano',
      'SOL/USDT': 'solana',
      'DOT/USDT': 'polkadot',
      'DOGE/USDT': 'dogecoin',
      'AVAX/USDT': 'avalanche-2',
      'MATIC/USDT': 'matic-network',
      'LINK/USDT': 'chainlink'
    };
    return mapping[symbol] || 'bitcoin';
  }

  async getWalletBalance(address, network = 'ethereum') {
    try {
      const provider = this.providers[network];
      if (!provider) {
        throw new Error(`Network ${network} not supported`);
      }

      const balance = await provider.eth.getBalance(address);
      const balanceInEth = provider.utils.fromWei(balance, 'ether');
      
      return {
        address: address,
        network: network,
        balance: balanceInEth,
        balanceWei: balance,
        timestamp: Date.now()
      };
    } catch (error) {
      throw new Error(`Failed to get wallet balance: ${error.message}`);
    }
  }

  async getTokenBalance(address, tokenAddress, network = 'ethereum') {
    try {
      const provider = this.providers[network];
      if (!provider) {
        throw new Error(`Network ${network} not supported`);
      }

      // ERC-20 token balance
      const tokenContract = new provider.eth.Contract(this.getERC20ABI(), tokenAddress);
      const balance = await tokenContract.methods.balanceOf(address).call();
      const decimals = await tokenContract.methods.decimals().call();
      
      const balanceInTokens = balance / Math.pow(10, decimals);
      
      return {
        address: address,
        tokenAddress: tokenAddress,
        network: network,
        balance: balanceInTokens,
        balanceRaw: balance,
        decimals: decimals,
        timestamp: Date.now()
      };
    } catch (error) {
      throw new Error(`Failed to get token balance: ${error.message}`);
    }
  }

  async getTransactionHistory(address, network = 'ethereum', limit = 50) {
    try {
      const provider = this.providers[network];
      if (!provider) {
        throw new Error(`Network ${network} not supported`);
      }

      // Get transaction count
      const nonce = await provider.eth.getTransactionCount(address);
      
      // Get recent transactions (this is a simplified approach)
      const transactions = [];
      
      // For a production app, you'd want to use a service like Etherscan API
      // or implement proper transaction history tracking
      
      return {
        address: address,
        network: network,
        transactionCount: nonce,
        transactions: transactions,
        timestamp: Date.now()
      };
    } catch (error) {
      throw new Error(`Failed to get transaction history: ${error.message}`);
    }
  }

  async getGasPrice(network = 'ethereum') {
    try {
      const provider = this.providers[network];
      if (!provider) {
        throw new Error(`Network ${network} not supported`);
      }

      const gasPrice = await provider.eth.getGasPrice();
      const gasPriceGwei = provider.utils.fromWei(gasPrice, 'gwei');
      
      return {
        network: network,
        gasPrice: gasPrice,
        gasPriceGwei: gasPriceGwei,
        timestamp: Date.now()
      };
    } catch (error) {
      throw new Error(`Failed to get gas price: ${error.message}`);
    }
  }

  async sendTransaction(fromAddress, toAddress, amount, privateKey, network = 'ethereum') {
    try {
      const provider = this.providers[network];
      if (!provider) {
        throw new Error(`Network ${network} not supported`);
      }

      const nonce = await provider.eth.getTransactionCount(fromAddress);
      const gasPrice = await provider.eth.getGasPrice();
      const gasLimit = 21000; // Standard ETH transfer

      const transaction = {
        from: fromAddress,
        to: toAddress,
        value: provider.utils.toWei(amount.toString(), 'ether'),
        gas: gasLimit,
        gasPrice: gasPrice,
        nonce: nonce
      };

      const signedTx = await provider.eth.accounts.signTransaction(transaction, privateKey);
      const receipt = await provider.eth.sendSignedTransaction(signedTx.rawTransaction);

      return {
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed,
        status: receipt.status,
        network: network,
        timestamp: Date.now()
      };
    } catch (error) {
      throw new Error(`Failed to send transaction: ${error.message}`);
    }
  }

  async getMarketData(symbol = 'BTC/USDT') {
    try {
      if (this.exchanges.binance) {
        const ticker = await this.exchanges.binance.fetchTicker(symbol);
        
        return {
          symbol: symbol,
          price: ticker.last,
          change: ticker.change,
          changePercent: ticker.percentage,
          high: ticker.high,
          low: ticker.low,
          volume: ticker.baseVolume,
          timestamp: Date.now()
        };
      }

      // Fallback to CoinGecko
      const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${this.getCoinGeckoId(symbol)}`);
      const data = response.data;
      
      return {
        symbol: symbol,
        price: data.market_data.current_price.usd,
        change: data.market_data.price_change_24h,
        changePercent: data.market_data.price_change_percentage_24h,
        high: data.market_data.high_24h.usd,
        low: data.market_data.low_24h.usd,
        volume: data.market_data.total_volume.usd,
        marketCap: data.market_data.market_cap.usd,
        timestamp: Date.now()
      };
    } catch (error) {
      throw new Error(`Failed to get market data: ${error.message}`);
    }
  }

  async getPortfolioValue(wallets) {
    try {
      let totalValue = 0;
      const portfolio = [];

      for (const wallet of wallets) {
        const balance = await this.getWalletBalance(wallet.address, wallet.network);
        const price = await this.getCryptoPrice(`${wallet.symbol}/USDT`);
        
        const value = parseFloat(balance.balance) * price;
        totalValue += value;

        portfolio.push({
          address: wallet.address,
          network: wallet.network,
          symbol: wallet.symbol,
          balance: balance.balance,
          price: price,
          value: value,
          percentage: 0 // Will be calculated after total is known
        });
      }

      // Calculate percentages
      portfolio.forEach(item => {
        item.percentage = totalValue > 0 ? (item.value / totalValue) * 100 : 0;
      });

      return {
        totalValue: totalValue,
        portfolio: portfolio,
        timestamp: Date.now()
      };
    } catch (error) {
      throw new Error(`Failed to get portfolio value: ${error.message}`);
    }
  }

  async updateWalletBalances() {
    // This would update cached wallet balances
    // Implementation depends on your specific requirements
    console.log('🔄 Updating wallet balances...');
  }

  getERC20ABI() {
    return [
      {
        "constant": true,
        "inputs": [{"name": "_owner", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"name": "balance", "type": "uint256"}],
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "decimals",
        "outputs": [{"name": "", "type": "uint8"}],
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "symbol",
        "outputs": [{"name": "", "type": "string"}],
        "type": "function"
      }
    ];
  }

  async getSupportedNetworks() {
    return Object.keys(this.providers).map(network => ({
      name: network,
      rpcUrl: this.providers[network].currentProvider.host,
      chainId: this.providers[network].eth.net.getId()
    }));
  }

  async getSupportedTokens(network = 'ethereum') {
    // Common token addresses for different networks
    const tokens = {
      ethereum: {
        'USDT': '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        'USDC': '0xA0b86a33E6441b8C4C8C8C8C8C8C8C8C8C8C8C8C',
        'DAI': '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        'WETH': '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
      },
      polygon: {
        'USDT': '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
        'USDC': '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
        'DAI': '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
        'WMATIC': '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270'
      }
    };

    return tokens[network] || {};
  }

  stop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    console.log('🛑 Crypto Service stopped');
  }
}

// Singleton instance
const cryptoService = new CryptoService();

module.exports = {
  initializeCryptoService: () => cryptoService.initialize(),
  getCryptoPrice: (symbol) => cryptoService.getCryptoPrice(symbol),
  getWalletBalance: (address, network) => cryptoService.getWalletBalance(address, network),
  getTokenBalance: (address, tokenAddress, network) => cryptoService.getTokenBalance(address, tokenAddress, network),
  getTransactionHistory: (address, network, limit) => cryptoService.getTransactionHistory(address, network, limit),
  getGasPrice: (network) => cryptoService.getGasPrice(network),
  sendTransaction: (fromAddress, toAddress, amount, privateKey, network) => cryptoService.sendTransaction(fromAddress, toAddress, amount, privateKey, network),
  getMarketData: (symbol) => cryptoService.getMarketData(symbol),
  getPortfolioValue: (wallets) => cryptoService.getPortfolioValue(wallets),
  getSupportedNetworks: () => cryptoService.getSupportedNetworks(),
  getSupportedTokens: (network) => cryptoService.getSupportedTokens(network),
  stopCryptoService: () => cryptoService.stop(),
  cryptoService
}; 