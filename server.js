const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const {v4: uuidv4} = require('uuid'); // 파일 겹침 방지
const fs = require('fs');
const https = require('https');
const diaryRoute = require('./routes/diary');
const { router } = require('./routes/auth');

dotenv.config();

const app = express();
const PORT = process.env.PORT;
const HOST = process.env.HOST;

// Middleware
app.use(express.json({
  limit : "1mb"
}));
app.use(cors()); // CORS 미들웨어 사용

app.use(express.urlencoded({
  limit:"1mb",
  extended: false
}));
app.use(express.static(path.join(__dirname + '/public'))); // 정적 파일 위치 설정

// 기본 경로 라우트
app.get('/', (req, res) => {
  res.send('기본 가능');
});

// Routes Middleware
app.use('/diary', diaryRoute);
app.use('/auth', router);

// multer 설정
const upload = multer({
  storage: multer.diskStorage({
    // 저장할 장소
    destination(req, file, cb) {
      cb(null, 'public/uploads'); // public/uploads
    },
    // 저장할 이미지의 파일명
    filename(req, file, cb) {
      const ext = path.extname(file.originalname); // 파일의 확장자
      console.log('file.originalname', file.originalname);
      // 파일명이 절대 겹치지 않도록 해줘야한다.
      // uuid + 현재시간밀리초 + 파일확장자명
      cb(null, path.basename(file.originalname, ext) + '-' +uuidv4() + Date.now() + ext);
    },
  }),
  // limits: { fileSize: 5 * 1024 * 1024 } // 파일 크기 제한
});

// 하나의 이미지 파일만 가져온다.
app.post('/img', upload.single('img'), (req, res) => {
  // 해당 라우터가 정상적으로 작동하면 public/uploads에 이미지가 업로드된다.
  // 업로드된 이미지의 URL 경로를 프론트엔드로 반환한다.
  console.log('전달받은 파일', req.file);
  console.log('저장된 파일의 이름', req.file.filename);

  // 파일이 저장된 경로를 클라이언트에게 반환해준다.
  const IMG_URL = `${HOST}:${PORT}/uploads/${req.file.filename}`;
  console.log(IMG_URL);
  res.json({ url: IMG_URL, realName: req.file.filename });
});

// 파일 삭제를 위한 /all_delete 라우터 추가
app.delete('/delete_files', (req, res) => {
  const imgFile = req.query.imgData; // 클라이언트에서 파일명 배열을 받아옴
  const deletedImgFiles = [];
  const errorImg = [];

  // 이미지 유효성 검사
  if (!Array.isArray(imgFile) || imgFile.length === 0) {
    return res.json({ message: '모든 파일 삭제 성공'});
  }
  imgFile.forEach(filename => {
    const filePath = path.join(__dirname, 'public/uploads', filename); // 파일 경로 설정
    // 파일 삭제
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('❌ 이미지 파일 삭제 중 오류 발생:', err);
        errorImg.push({ filename, error: err });
      } else {
        console.log('✅ 이미지 파일 삭제 완료:', filename);
        deletedImgFiles.push(filename);
      }
      // 모든 작업이 끝났는지 확인
      if (deletedImgFiles.length + errorImg.length === imgFile.length) {
        return res.json({ message: '이미지, 3D 파일 삭제 성공'});
      }
    });
  });
});

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Only Read Connected to MongoDB');
}).catch((err) => {
  console.error('Failed to connect to MongoDB', err);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

/*
// HTTPS 서버 설정
const sslOptions = {
  key: fs.readFileSync('./privkey.pem'), // 개인 키 파일
  cert: fs.readFileSync('./cert.pem'), // SSL/TLS 인증서 파일
};

// HTTPS 서버 시작
https.createServer(sslOptions, app).listen(PORT, () => {
  console.log(`HTTPS Server running on ${PORT}`);
});
*/