const Redis = require('redis');

let redisClient = null;
let isConnected = false;

const connectRedis = async () => {
  try {
    if (isConnected && redisClient) {
      console.log('✅ Redis already connected');
      return redisClient;
    }

    // Check if using Upstash (REST API) or standard Redis
    const isUpstash = process.env.REDIS_URL && process.env.REDIS_URL.includes('upstash.io');
    
    if (isUpstash) {
      // For Upstash, we'll use a custom client or REST API
      console.log('✅ Using Upstash Redis (REST API)');
      isConnected = true;
      return createUpstashClient();
    } else {
      // Standard Redis connection
      redisClient = Redis.createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        socket: {
          connectTimeout: 10000,
          lazyConnect: true
        }
      });

      redisClient.on('error', (err) => {
        console.error('❌ Redis Client Error:', err);
        isConnected = false;
      });

      redisClient.on('connect', () => {
        console.log('✅ Redis Client Connected');
        isConnected = true;
      });

      redisClient.on('ready', () => {
        console.log('✅ Redis Client Ready');
        isConnected = true;
      });

      redisClient.on('end', () => {
        console.log('⚠️ Redis Client Disconnected');
        isConnected = false;
      });

      await redisClient.connect();
      return redisClient;
    }
  } catch (error) {
    console.error('❌ Redis connection failed:', error.message);
    // Don't exit process for Redis, as it's not critical
    return null;
  }
};

const createUpstashClient = () => {
  // Simple Upstash REST API client
  const client = {
    async get(key) {
      try {
        const response = await fetch(`${process.env.REDIS_URL}/get/${key}`, {
          headers: {
            'Authorization': `Bearer ${process.env.REDIS_TOKEN}`
          }
        });
        const data = await response.json();
        return data.result;
      } catch (error) {
        console.error('Upstash GET error:', error);
        return null;
      }
    },
    
    async set(key, value, options = {}) {
      try {
        const url = options.expire 
          ? `${process.env.REDIS_URL}/set/${key}/${value}/ex/${options.expire}`
          : `${process.env.REDIS_URL}/set/${key}/${value}`;
          
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.REDIS_TOKEN}`
          }
        });
        const data = await response.json();
        return data.result === 'OK';
      } catch (error) {
        console.error('Upstash SET error:', error);
        return false;
      }
    },
    
    async del(key) {
      try {
        const response = await fetch(`${process.env.REDIS_URL}/del/${key}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.REDIS_TOKEN}`
          }
        });
        const data = await response.json();
        return data.result;
      } catch (error) {
        console.error('Upstash DEL error:', error);
        return 0;
      }
    },
    
    async exists(key) {
      try {
        const response = await fetch(`${process.env.REDIS_URL}/exists/${key}`, {
          headers: {
            'Authorization': `Bearer ${process.env.REDIS_TOKEN}`
          }
        });
        const data = await response.json();
        return data.result > 0;
      } catch (error) {
        console.error('Upstash EXISTS error:', error);
        return false;
      }
    }
  };
  
  return client;
};

const disconnectRedis = async () => {
  try {
    if (redisClient && !process.env.REDIS_URL.includes('upstash.io')) {
      await redisClient.quit();
    }
    isConnected = false;
    console.log('✅ Redis disconnected');
  } catch (error) {
    console.error('❌ Error disconnecting Redis:', error);
  }
};

const getRedisStatus = () => {
  return {
    connected: isConnected,
    type: process.env.REDIS_URL && process.env.REDIS_URL.includes('upstash.io') ? 'Upstash' : 'Standard Redis'
  };
};

module.exports = {
  connectRedis,
  disconnectRedis,
  getRedisStatus
}; 