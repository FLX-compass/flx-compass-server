const fs = require('fs');
const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');

// Load ENV vars
dotenv.config({ path: './config/config.env' });

// Load models
const Attraction = require('./models/Attraction');
const Product = require('./models/Product');

// Connect to Database
mongoose.connect(process.env.MONGO_URI, {
   useNewUrlParser: true,
   useCreateIndex: true,
   useFindAndModify: false,
   useUnifiedTopology: true
});

// Read JSON files
const attractions = JSON.parse(
   fs.readFileSync(`${__dirname}/_data/attractions.json`, 'utf-8')
);

const products = JSON.parse(
   fs.readFileSync(`${__dirname}/_data/products.json`, 'utf-8')
);

// Import JSON data into Database
const importData = async () => {
   try {
      await Attraction.create(attractions);
      await Product.create(products);

      console.log('Data imported...'.green.inverse);
      process.exit();
   } catch (err) {
      console.error(err);
   }
}

// Delete data from Database
const deleteData = async() => {
   try {
      await Attraction.deleteMany();
      await Product.deleteMany();

      console.log('Data destroyed...'.red.inverse);
      process.exit(); 
   } catch (err) {
      console.log(err);
   }
}

if(process.argv[2] === '-i') {
   importData();
} else if(process.argv[2] === '-d') {
   deleteData();
}