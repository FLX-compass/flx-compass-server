const mongoose = require('mongoose');
const slugify = require('slugify');
const geocoder = require('../utils/geocoder');

// REQUIRED FIELDS
// name
// address
// lake
// category

// NOT REQUIRED
// likedCount
// bookmarkedCount
// viewCount
// sponsored - bool
// family - bool

const AttractionSchema = new mongoose.Schema({
   name: {
     type: String,
     required: [true, 'Please add a name'],
     unique: true,
     trim: true,
     maxlength: [100, 'Name can not be more than 100 characters']
   },
   slug: String,
   description: {
     type: String,
     maxlength: [1000, 'Description cannot be more than 1,000 characters.']
   },
   website: {
     type: String,
     match: [
       /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
       'Please use a valid URL with HTTP or HTTPS'
     ]
   },
   phone: {
     type: String,
     maxlength: [20, 'Phone number can not be longer than 20 characters']
   },
   email: {
     type: String,
     match: [
       /^\w+([\.]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
       'Please use a valide email']
   },
   address: {
     type: String,
     required: [true, 'Please add address']
   },
   location: {
      // GeoJSON Point
      type: {
        type: String,
        enum: ['Point']
      },
      coordinates: {
        type: [Number],
        index: '2dsphere'
      },
      formattedAddress: String,
      street: String,
      city: String,
      state: String,
      zipcode: String,
      country: String
    },
   category: {
     // Array of strings
     type: [String],
     required: true,
     enum: [
       'winery',
       'brewery',
       'distillery',
       'farm',
       'parks-trails',
       'museum',
       'sports-games',
       'restaurant',
       'shopping'
     ]
   },
   lake: {
      type: String,
      required: true,
      enum: [
         'Otisco',
         'Skanateles',
         'Owasco',
         'Cayuga',
         'Seneca',
         'Keuka',
         'Canandaigua',
         'Honeoye',
         'Candice',
         'Hemlock',
         'Conesus'
      ]
   },
   avgCost: Number,
   photos: {
      type: Array,
      default: ['no-photo.jpg']
   },
   compassMember: {
     type: Boolean,
     default: false
   },
   sponsored: {
      type: Boolean,
      default: false
   },
   createdAt: {
     type: Date,
     default: Date.now
   },
   viewCount: {
      type: Number,
      default: 0
   },
   family: {
      type: Boolean,
      default: false
   },
   likes: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'User'
      }
   ],
   bookmarks: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'users'
      }
   ],
   user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
      default: "5f9ad64912e13f63b848d13e"
   }
 },
 {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
 }
);

// create Attraction slug from name
AttractionSchema.pre('save', function(next) {
   this.slug = slugify(this.name, { lower: true });
   next();
});

// Geocoder & create location field
AttractionSchema.pre('save', async function(next) {
   const loc = await geocoder.geocode(this.address);
   this.location = {
      type: 'Point',
      coordinates: [loc[0].longitude, loc[0].latitude],
      formattedAddress: loc[0].formattedAddress,
      street: loc[0].streetName,
      city: loc[0].city,
      state: loc[0].stateCode,
      zipcode: loc[0].zipcode,
      country: loc[0].countryCode
   }

   // Do not save address

   this.address = undefined
   next();
});

// Cascade delete products when Attraction is deleted
AttractionSchema.pre('remove', async function (next) {
   console.log(`Products being removed from attraction ${this._id}`);
   await this.model('Product').deleteMany({ attraction: this._id });
   next();
})

// Reverse populate with virtuals
AttractionSchema.virtual('products', {
   ref: 'Product',
   localField: '_id',
   foreignField: 'attraction',
   justOne: false
})
 
module.exports = mongoose.model('Attraction', AttractionSchema);