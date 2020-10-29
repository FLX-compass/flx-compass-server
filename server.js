const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middleware/error');
const connectDb = require('./config/db');


// Route files
const attractions = require('./routes/attractions');
const products = require('./routes/products');
const auth = require('./routes/auth');

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

// Set static public folder
app.use(express.static(path.join(__dirname, 'public')))

// Mount routers
app.use('/api/v2/attractions', attractions);
app.use('/api/v2/products', products);
app.use('/api/v2/auth', auth);

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