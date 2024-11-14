const mongoose = require('mongoose');

const DiarySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  createdAt: {
    type: String,
  }
});
  
module.exports = mongoose.model('Review', DiarySchema);