const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');
const errorHandler = require('./middleware/error');
const connectDb = require('./config/db');

// NEW REPAIR-11-8 branch
// Route files
const attractions = require('./routes/attractions');
const products = require('./routes/products');
const auth = require('./routes/auth');
const users = require('./routes/users');
const events = require('./routes/events');
const webhook = require('./routes/webhook')

// Load envirement files
dotenv.config({ path: './config/config.env' });

// Connect to database
connectDb();

const app = express();

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Dev logging middleware
if(process.env.NODE_ENV === 'development') {
   app.use(morgan('dev'));
}

// File upload middleware
app.use(fileupload());

// Mongo sanitize security middleware
app.use(mongoSanitize());

// Helmet security middleware, security headers
app.use(helmet());

// XSS Clean security middleware, prevent cross site scripting
app.use(xss());

// Express rate limiting
const limiter = rateLimit({
   windowMs: 10 * 60 * 1000,
   max: 100
});

app.use(limiter);

// Prevent HTTP param polution
app.use(hpp());

// Enable CORS
app.use(cors());

// Set static public folder
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, process.env.FILE_UPLOAD_PATH)));

// Mount routers
app.use('/api/v2/attractions', attractions);
app.use('/api/v2/products', products);
app.use('/api/v2/auth', auth);
app.use('/api/v2/users', users);
app.use('/api/v2/events', events);
app.use('/api/v2/webhook', webhook);

app.use(errorHandler);

const PORT = process.env.PORT||5000;

const server = app.listen(
   PORT, 
   console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold)
);

// Handle unhandled rejections
process.on('unhandledRejection', (err, promise) => {
   console.log(`Error: ${err.message}`.red.bold);
   // Close server & exit process
   server.close(() => process.exit(1));
});