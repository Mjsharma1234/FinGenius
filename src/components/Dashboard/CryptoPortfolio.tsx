import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bitcoin, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Plus, 
  Minus,
  RefreshCw,
  ExternalLink,
  Shield,
  Zap,
  DollarSign,
  Percent
} from 'lucide-react';
import { cryptoService } from '@/services/cryptoService';
import toast from 'react-hot-toast';

interface CryptoAsset {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  balance: number;
  value: number;
  icon: string;
  color: string;
}

interface PortfolioStats {
  totalValue: number;
  totalChange24h: number;
  totalChangePercent24h: number;
  totalBalance: number;
}

const CryptoPortfolio: React.FC = () => {
  const [assets, setAssets] = useState<CryptoAsset[]>([]);
  const [stats, setStats] = useState<PortfolioStats>({
    totalValue: 0,
    totalChange24h: 0,
    totalChangePercent24h: 0,
    totalBalance: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<CryptoAsset | null>(null);
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [tradeAmount, setTradeAmount] = useState('');

  useEffect(() => {
    loadPortfolio();
    const interval = setInterval(loadPortfolio, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadPortfolio = async () => {
    try {
      setRefreshing(true);
      
      // Simulate crypto service calls
      const mockAssets: CryptoAsset[] = [
        {
          id: 'bitcoin',
          symbol: 'BTC',
          name: 'Bitcoin',
          price: 43250.75,
          change24h: 1250.50,
          changePercent24h: 2.98,
          balance: 0.85,
          value: 36763.14,
          icon: '₿',
          color: 'text-orange-500'
        },
        {
          id: 'ethereum',
          symbol: 'ETH',
          name: 'Ethereum',
          price: 2650.25,
          change24h: -45.75,
          changePercent24h: -1.69,
          balance: 5.2,
          value: 13781.30,
          icon: 'Ξ',
          color: 'text-blue-500'
        },
        {
          id: 'cardano',
          symbol: 'ADA',
          name: 'Cardano',
          price: 0.485,
          change24h: 0.025,
          changePercent24h: 5.42,
          balance: 2500,
          value: 1212.50,
          icon: '₳',
          color: 'text-blue-600'
        },
        {
          id: 'solana',
          symbol: 'SOL',
          name: 'Solana',
          price: 98.75,
          change24h: 3.25,
          changePercent24h: 3.40,
          balance: 12.5,
          value: 1234.38,
          icon: '◎',
          color: 'text-purple-500'
        }
      ];

      setAssets(mockAssets);
      
      // Calculate portfolio stats
      const totalValue = mockAssets.reduce((sum, asset) => sum + asset.value, 0);
      const totalChange24h = mockAssets.reduce((sum, asset) => sum + (asset.change24h * asset.balance), 0);
      const totalChangePercent24h = (totalChange24h / totalValue) * 100;
      const totalBalance = mockAssets.reduce((sum, asset) => sum + asset.balance, 0);

      setStats({
        totalValue,
        totalChange24h,
        totalChangePercent24h,
        totalBalance
      });
    } catch (error) {
      console.error('Error loading portfolio:', error);
      toast.error('Failed to load crypto portfolio');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleTrade = (asset: CryptoAsset, type: 'buy' | 'sell') => {
    setSelectedAsset(asset);
    setTradeType(type);
    setShowTradeModal(true);
  };

  const executeTrade = async () => {
    if (!selectedAsset || !tradeAmount) return;

    try {
      const amount = parseFloat(tradeAmount);
      if (isNaN(amount) || amount <= 0) {
        toast.error('Please enter a valid amount');
        return;
      }

      // Simulate trade execution
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`${tradeType === 'buy' ? 'Bought' : 'Sold'} ${amount} ${selectedAsset.symbol}`);
      setShowTradeModal(false);
      setTradeAmount('');
      setSelectedAsset(null);
      
      // Reload portfolio
      loadPortfolio();
    } catch (error) {
      console.error('Trade execution failed:', error);
      toast.error('Trade failed. Please try again.');
    }
  };

  const connectWallet = async () => {
    try {
      toast.loading('Connecting wallet...');
      // Simulate wallet connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Wallet connected successfully!');
    } catch (error) {
      toast.error('Failed to connect wallet');
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="animate-pulse bg-gray-200 rounded-full h-8 w-8"></div>
          <div className="animate-pulse bg-gray-200 rounded h-6 w-32"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse bg-gray-200 rounded h-16"></div>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-lg">
              <Bitcoin className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Crypto Portfolio</h3>
              <p className="text-sm text-gray-500">Real-time blockchain data</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={loadPortfolio}
              disabled={refreshing}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={connectWallet}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Wallet className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Portfolio Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${stats.totalValue.toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">24h Change</p>
                <div className="flex items-center space-x-1">
                  <p className={`text-2xl font-bold ${stats.totalChangePercent24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stats.totalChangePercent24h >= 0 ? '+' : ''}{stats.totalChangePercent24h.toFixed(2)}%
                  </p>
                  {stats.totalChangePercent24h >= 0 ? (
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-600" />
                  )}
                </div>
              </div>
              <Percent className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Balance</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalBalance.toFixed(2)}
                </p>
              </div>
              <Zap className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Assets List */}
        <div className="space-y-3">
          <AnimatePresence>
            {assets.map((asset, index) => (
              <motion.div
                key={asset.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div className={`text-2xl ${asset.color}`}>
                    {asset.icon}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{asset.name}</h4>
                    <p className="text-sm text-gray-500">{asset.balance.toFixed(4)} {asset.symbol}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    ${asset.value.toLocaleString()}
                  </p>
                  <div className="flex items-center space-x-1">
                    <p className={`text-sm ${asset.changePercent24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {asset.changePercent24h >= 0 ? '+' : ''}{asset.changePercent24h.toFixed(2)}%
                    </p>
                    {asset.changePercent24h >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleTrade(asset, 'buy')}
                    className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleTrade(asset, 'sell')}
                    className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <button
              onClick={() => toast.success('Viewing detailed analytics')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors flex items-center space-x-1"
            >
              <span>View Analytics</span>
              <ExternalLink className="h-4 w-4" />
            </button>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Shield className="h-4 w-4" />
              <span>Secure Trading</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Trade Modal */}
      <AnimatePresence>
        {showTradeModal && selectedAsset && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowTradeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className={`text-2xl ${selectedAsset.color}`}>
                  {selectedAsset.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {tradeType === 'buy' ? 'Buy' : 'Sell'} {selectedAsset.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Current Price: ${selectedAsset.price.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount ({selectedAsset.symbol})
                  </label>
                  <input
                    type="number"
                    value={tradeAmount}
                    onChange={(e) => setTradeAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {tradeAmount && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600">
                      Estimated Value: ${(parseFloat(tradeAmount) * selectedAsset.price).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={executeTrade}
                  className={`flex-1 py-2 px-4 rounded-lg text-white font-medium transition-colors ${
                    tradeType === 'buy' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {tradeType === 'buy' ? 'Buy' : 'Sell'} {selectedAsset.symbol}
                </button>
                <button
                  onClick={() => setShowTradeModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CryptoPortfolio; 