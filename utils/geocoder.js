const NodeGeocoder = require('node-geocoder');
const dotenv = require('dotenv');

// Load ENV variables - NOT LOADING!!!!!!!!!!
dotenv.config({ path: './config/config.env'});  //Udemy

const options = {
   provider: process.env.GEOCODER_PROVIDER,
   httpAdapter: 'https',
   apiKey: process.env.GEOCODER_API_KEY,
   formatter: null
}

const geocoder = NodeGeocoder(options);

module.exports = geocoder;