const mongoose = require('mongoose');

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
     required: [true, 'Please add a description'],
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
      county: String,
      state: String,
      zipcode: String,
      country: String
    },
   categories: {
     // Array of strings
     type: [String],
     required: true,
     enum: [
       'winery',
       'brewery',
       'distillery',
       'farm',
       'parks & trails',
       'museum',
       'sports & games',
       'restaurant',
       'shopping'
     ]
   },
   lake: {
      type: String,
      enum: [
         'Otisco',
         'Skanateles',
         'Owasco',
         'Cayuga',
         'Seneca',
         'Keuka',
         'Canadaigua',
         'Honeoye',
         'Candice',
         'Hemlock',
         'Conesus'
      ]
   },
   averageRating: Number,
   averageCost: Number,
   photo: {
     type: String,
     default: 'no-photo.jpg'
   },
   compassMember: {
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
   bookmarkedCount: {
     type: Number,
     default: 0
   },
   likedCount: {
     type: Number,
     default: 0
   }
 }
);
 
module.exports = mongoose.model('Attraction', AttractionSchema);