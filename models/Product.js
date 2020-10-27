const mongoose = require('mongoose');

// REQUIRED FIELDS
// productName
// category (wine, beer, liquor, apparel, merchandise, gifts)
// attraction

const ProductSchema = new mongoose.Schema({
   productName: {
      type: String,
      trim: true,
      required: [true, "Please add a product name"]
   },
   description: String,
   releaseYear: Date,
   size: {
      type: String,
      enum: ['wine standard', 'wine magnum', 'half barrel', 'sixth barrel']
   },
   category: {
      type: String,
      enum: ['wine', 'beer', 'liquor', 'apparel', 'merchandise', 'gifts'],
      required: [true, "Please select a proper category"]
   },
   createdAt: {
      type: Date,
      default: Date.now
   },
   attraction: {
      type: mongoose.Schema.ObjectId,
      ref: 'Attraction',
      required: true
   },
   brand: String
});

module.exports = mongoose.model('Product', ProductSchema);