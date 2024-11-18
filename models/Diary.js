const mongoose = require('mongoose');

const DiarySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
  },
  realContent:{
    type: String,
  },
  category:{
    type: String,
  },
  imgData:[String],
  createdAt: {
    type: String,
  }
});
  
module.exports = mongoose.model('Diary', DiarySchema);