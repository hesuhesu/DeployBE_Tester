const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const https = require('https');
const reviewRoute = require('./routes/review');

dotenv.config();

const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(express.json());
app.use(cors()); // CORS 미들웨어 사용

app.use(express.urlencoded({ extended: false })); // 내부 url 파서 사용
app.use(express.static(path.join(__dirname + '/public'))); // 정적 파일 위치 설정

// 기본 경로 라우트
app.get('/', (req, res) => {
  res.send('기본 가능');
});

// Routes Middleware
app.use('/review', reviewRoute);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Failed to connect to MongoDB', err);
});

/*
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
*/

// HTTPS 서버 설정
const sslOptions = {
  key: fs.readFileSync('./privkey.pem'), // 개인 키 파일
  cert: fs.readFileSync('./cert.pem'), // SSL/TLS 인증서 파일
};

// HTTPS 서버 시작
https.createServer(sslOptions, app).listen(PORT, () => {
  console.log(`HTTPS Server running on ${PORT}`);
});