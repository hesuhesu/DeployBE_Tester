const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const dotenv = require('dotenv');
dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY;

// 회원가입 라우터
router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    // 유효성 검사
    if (!username || !password) {
        return res.status(401).json({ message: '모든 필드를 입력해야 합니다.' });
    }

    try {
        // 사용자 생성
        const newUser = new User({ username, password });
        await newUser.save();
        res.status(201).json({ message: '회원가입 성공' });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: '이미 존재하는 사용자입니다.' });
        }
        res.status(500).json({ message: '서버 오류' });
    }
});

// 로그인
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: '아이디 또는 비밀번호가 잘못되었습니다.' });
        }

        // HS256 알고리즘을 사용하여 토큰 생성
        const token = jwt.sign({ id: user._id, username }, SECRET_KEY, { expiresIn: '1h', algorithm: 'HS256' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: '로그인 실패', error: error.message });
    }
});

// 인증 미들웨어
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ message: '토큰이 없습니다.' });

    jwt.verify(token, SECRET_KEY, { algorithms: ['HS256'] }, (err, user) => {
        if (err) return res.status(403).json({ message: '유효하지 않은 토큰입니다.' });
        req.user = user;
        next();
    });
};

module.exports = { router, authenticateToken };