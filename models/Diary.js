const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false }); // 댓글 스키마에 _id를 자동 생성하지 않도록 설정

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
  },
  comments: [CommentSchema] // 댓글 배열 추가
});
  
module.exports = mongoose.model('Diary', DiarySchema);