const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const connectDB = require('./config/db');
const { initSocket } = require('./config/socket');

// Load env variables first before anything else
dotenv.config();

if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

const app = express();

// Security Middleware
app.use(helmet()); // sets secure HTTP headers

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiter — max 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Too many requests, please try again later' }
});
app.use('/api', limiter);

// Body Parser
app.use(express.json());

// ROUTES
const authRoutes = require('./routes/auth.routes');

app.use('/api/auth', authRoutes);


// more routes will be added here as we build them:

const donorRoutes = require('./routes/donor.routes');
app.use('/api/donors', donorRoutes);

const requestRoutes = require('./routes/request.routes');
app.use('/api/requests', requestRoutes);

const donationRoutes = require('./routes/donation.routes')
app.use('/api/donations', donationRoutes);

const notificationRoutes = require('./routes/notification.routes')
app.use('/api/notifications', notificationRoutes);

const adminRoutes = require ('./routes/admin.routes')
app.use('/api/admin', adminRoutes);


///SWAGGER 
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./docs/swagger.yaml');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//Health Check
app.get('/', (req, res) => {
  res.json({ message: 'DonateLife API is running', status: 'OK' });
});

//  404 Handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Global Error Handler 
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Something went wrong on the server' });
});

//  Server + Socket.io 
const server = http.createServer(app); // wrap express — required for Socket.io
initSocket(server);                    // initialise Socket.io


// ─── Server ───────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;