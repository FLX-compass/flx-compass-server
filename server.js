const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const connectDb = require('./config/db');

// Route files
const attractions = require('./routes/attractions');

// Load envirement files
dotenv.config({ path: './config/config.env' });

// Connect to database
connectDb();

const app = express();

// Body parser
app.use(express.json());

// Dev logging middleware
if(process.env.NODE_ENV === 'development') {
   app.use(morgan('dev'));
}

// Mount routers
app.use('/api/v2/attractions', attractions);

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