const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please add a title"],
      trim: true,
      maxlength: [100, "Title can not be more than 100 characters"],
    },
    description: {
      type: String,
      maxlength: [1000, "Description cannot be more than 1,000 characters."],
    },
    doorTime: {
      type: Date,
    },
    startTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    attraction: [{
      type: mongoose.Schema.ObjectId,
      ref: "Attraction",
      required: true,
    }],
    organizer: {
      type: String,
    },
    image: 
      {
      type: [String],
      required: true,
      default: 'no-image.png'
      }  ,
    sponsored: {
      type: Boolean,
      required: true,
      default: false,
    },
    createdAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    url: {
      type: String,
      required: false,
      match: [
        /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/,
        "Please use a valide url",
      ],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
      default: "5f9ad64912e13f63b848d13e",
    },
    priceLow: {
      type: Number,
      required: true,
    },
    priceHigh: {
      type: Number,
      required: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    bookmarks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    category: {
      type: String,
      required: true,
      enum: [
        "game",
        "theater",
        "family",
        "sports",
        "music",
        "nerdy",
        "musical",
        "speaker",
      ],
    },
    source: {
      type: String,
      enum : [
        "Eventbrite",
        "Ticketmaster",
        "Direct"
      ],
      default: "Direct"
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

module.exports = mongoose.model("Event", EventSchema);
