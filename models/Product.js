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
   price: {
      type: Number,
      default: 0
   },
   brand: String
});

// Static method to get average price
ProductSchema.statics.getAvgCost = async function(attractionId) {
   console.log('Calculating avg cost...'.blue);
   const obj = await this.aggregate([
      {
         $match: { attraction: attractionId }
      },
      {
         $group: {
            _id: '$attraction',
            avgCost: { $avg: '$price' }
         }
      }
   ]);
   try {
      await this.model('Attraction').findByIdAndUpdate(attractionId, {
         avgCost: obj[0].avgCost.toFixed(2)
      })
   } catch (err) {
      
   }
}

// Call getAvgCost after save
ProductSchema.post('save', function(){
   this.constructor.getAvgCost(this.attraction);
});

// Call getAvgCost before remove
ProductSchema.pre('remove', function(){
   this.constructor.getAvgCost(this.attraction);
});


module.exports = mongoose.model('Product', ProductSchema);