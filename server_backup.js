const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const https = require('https');
const reviewRoute = require('./routes/review');
const diaryRoute = require('./routes/diary');

dotenv.config();

const app = express();
const PORT = process.env.PORT;
const MONGO_PORT = process.env.MONGO_PORT;
const AUTH_USER = process.env.AUTH;
const AUTH_PASSWORD = process.env.AUTH_PASSWORD;
const READ_WRITE_USER = process.env.READ_WRITE_USER;
const READ_WRITE_PASSWORD = process.env.READ_WRITE_PASSWORD;

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
app.use('/diary', diaryRoute);

// MongoDB Connection
function default_connect() {
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(() => {
    console.log('Connected to MongoDB');
  }).catch((err) => {
    console.error('Failed to connect to MongoDB', err);
  });
}

// 로그인 엔드포인트
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // 사용자 인증 로직
  if (username === AUTH_USER && password === AUTH_PASSWORD) {
    const uri = `mongodb://${READ_WRITE_USER}:${READ_WRITE_PASSWORD}@127.0.0.1:${MONGO_PORT}`;
    if (mongoose.connection.readyState === 1) { mongoose.disconnect(); }
    mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
      .then(() => { console.log('Connected to MongoDB'); })
      .catch(err => { console.error('MongoDB connection error:', err); });
    return res.status(200).send('Login successful');
  } else {
    if (mongoose.connection.readyState === 1) {
      return res.status(200).send('not super user');
    }
    return res.status(401).send('Invalid credentials');
  }
});

// 로그아웃 엔드포인트
app.post('/logout', (req, res) => {
  if (mongoose.connection.readyState === 1) {
    mongoose.disconnect();
    console.log('Logged out successfully');
    default_connect();
    return res.status(200).send('Logout successful');
  } else {
    return res.status(400).send('No user is logged in');
  }
});

default_connect();

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