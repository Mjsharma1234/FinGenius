# FinGenius Backend

AI-Powered Finance Manager Backend with ML, Crypto, and Real-time Features

## 🚀 Quick Start

### Local Development
```bash
# Install dependencies
npm install

# Set up environment variables
cp env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

### Production Deployment
```bash
# Build and start
npm start

# Or using Docker
docker build -t fingenius-backend .
docker run -p 3001:3001 fingenius-backend
```

## 🚀 Free Cloud Backend Deployment

### 1. MongoDB Atlas (Free Cloud Database)
- Go to https://www.mongodb.com/cloud/atlas/register and create a free account.
- Create a free cluster (M0).
- Add a database user and password.
- Whitelist your IP (or 0.0.0.0/0 for open access).
- Copy the connection string (e.g., `mongodb+srv://<user>:<password>@cluster0.mongodb.net/fingenius?retryWrites=true&w=majority`).

### 2. Upstash Redis (Free Cloud Redis)
- Go to https://upstash.com/ and sign up.
- Create a free Redis database.
- Copy the REST URL and token.

### 3. Render.com (Free Node.js/Docker Hosting)
- Go to https://render.com/ and sign up.
- Click "New Web Service" → "Connect your GitHub repo".
- Select your repo, set root directory to `backend/`.
- If using Docker: Render will auto-detect your Dockerfile.
- Set environment variables (from `env.example`).
- Click "Create Web Service".

### 4. Connect Frontend
- In your frontend `.env`, set:
  REACT_APP_API_URL=https://your-backend-service.onrender.com/api
- Deploy frontend to Vercel (see main README).

---

**You now have a fully cloud-hosted, free-tier backend and database!**

## 🔧 Environment Variables

Create a `.env` file in the backend directory:

```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/fingenius?retryWrites=true&w=majority

# Upstash Redis
REDIS_URL=https://<your-upstash-url>.upstash.io
REDIS_TOKEN=<your-upstash-token>

# JWT Secret
JWT_SECRET=your_super_secret_key

# App Port
PORT=3001

# Frontend URL (for CORS)
FRONTEND_URL=https://your-frontend.vercel.app
```

## 📊 API Endpoints

### Health Check
- `GET /health` - System health status
- `GET /` - API information

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### AI/ML Services
- `GET /api/ml/insights` - Get AI insights
- `POST /api/ml/fraud-detection` - Fraud detection
- `GET /api/ml/predictions` - Spending predictions
- `POST /api/ml/sentiment-analysis` - Sentiment analysis

### Crypto Services
- `GET /api/crypto/portfolio` - Get crypto portfolio
- `GET /api/crypto/prices` - Get crypto prices
- `POST /api/crypto/connect-wallet` - Connect wallet
- `POST /api/crypto/trade` - Execute trade

### Transactions
- `GET /api/transactions` - Get transactions
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Budgets & Goals
- `GET /api/budgets` - Get budgets
- `POST /api/budgets` - Create budget
- `GET /api/goals` - Get goals
- `POST /api/goals` - Create goal

### Analytics
- `GET /api/analytics/spending` - Spending analytics
- `GET /api/analytics/trends` - Trend analysis
- `GET /api/analytics/reports` - Generate reports

## 🛠️ Troubleshooting

### Common Issues

#### 1. MongoDB Connection Failed
```bash
# Check if MongoDB URI is correct
echo $MONGODB_URI

# Test connection
node -e "require('mongoose').connect(process.env.MONGODB_URI).then(() => console.log('Connected')).catch(console.error)"
```

#### 2. Redis Connection Failed
```bash
# For Upstash, check URL and token
echo $REDIS_URL
echo $REDIS_TOKEN

# For local Redis, check if Redis is running
redis-cli ping
```

#### 3. Port Already in Use
```bash
# Check what's using port 3001
lsof -i :3001

# Kill the process
kill -9 <PID>
```

#### 4. Docker Issues
```bash
# Rebuild Docker image
docker build --no-cache -t fingenius-backend .

# Check Docker logs
docker logs <container_id>
```

### Health Check

Visit `http://localhost:3001/health` to check system status:

```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "environment": "production",
  "version": "1.0.0",
  "database": "connected",
  "redis": "connected",
  "services": {
    "database": {
      "connected": true,
      "readyState": 1,
      "host": "cluster0.mongodb.net"
    },
    "redis": {
      "connected": true,
      "type": "Upstash"
    }
  }
}
```

## 🔒 Security Features

- **Helmet.js**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: API rate limiting
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Request validation
- **Error Handling**: Comprehensive error handling

## 📈 Monitoring

### Logs
- Application logs are written to console
- Use `morgan` for HTTP request logging
- Custom error logging with stack traces

### Metrics
- Memory usage monitoring
- Database connection status
- Redis connection status
- API response times

## 🚀 Performance Optimization

- **Compression**: Gzip compression enabled
- **Caching**: Redis-based caching
- **Connection Pooling**: MongoDB connection pooling
- **Rate Limiting**: Prevents abuse
- **Health Checks**: Automatic health monitoring

## 📝 Development

### Scripts
```bash
npm run dev          # Start development server
npm run test         # Run tests
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run docker:build # Build Docker image
npm run docker:run   # Run Docker container
```

### Adding New Features
1. Create route file in `src/routes/`
2. Add middleware in `src/middleware/`
3. Create services in `src/services/`
4. Add models in `src/models/`
5. Update `server.js` with new routes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details. 