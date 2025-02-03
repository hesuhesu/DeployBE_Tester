const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const dotenv = require('dotenv');
dotenv.config();

const ACCESS_SECRET_KEY = process.env.ACCESS_SECRET_KEY;
const REFRESH_SECRET_KEY = process.env.REFRESH_SECRET_KEY;

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

        // Access Token 생성
        const accessToken = jwt.sign({ id: user._id, username }, ACCESS_SECRET_KEY, { expiresIn: '15m', algorithm: 'HS256' });

        // Refresh Token 생성
        const refreshToken = jwt.sign({ id: user._id, username }, REFRESH_SECRET_KEY, { expiresIn: '7d', algorithm: 'HS256' });
        user.refreshToken = refreshToken;
        await user.save();

        // Refresh Token을 쿠키에 저장
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // 프로덕션 환경에서는 true로 설정
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
        });

        res.json({ accessToken });
    } catch (error) {
        res.status(500).json({ message: '로그인 실패', error: error.message });
    }
});

// Refresh Token을 사용하여 Access Token 재발급
router.post('/token', async (req, res) => {
    const token = req.cookies.refreshToken; // 쿠키에서 refresh token 가져오기
    if (!token) return res.status(401).json({ message: 'Refresh Token이 없습니다.' });

    const user = await User.findOne({ refreshToken: token });
    if (!user) return res.status(403).json({ message: '유효하지 않은 Refresh Token입니다.' });

    jwt.verify(token, REFRESH_SECRET_KEY, (err, userData) => {
        if (err) {
            // Refresh Token이 만료된 경우
            if (err.name === 'TokenExpiredError') {
                return res.status(403).json({ message: 'Refresh Token이 만료되었습니다. 다시 로그인 해주세요.' });
            }
            return res.status(403).json({ message: '유효하지 않은 Refresh Token입니다.' });
        }
        const accessToken = jwt.sign({ id: userData.id, username: userData.username }, ACCESS_SECRET_KEY, { expiresIn: '15m' });
        res.json({ accessToken });
    });
});

// 인증 미들웨어
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ message: '토큰이 없습니다.' });

    jwt.verify(token, ACCESS_SECRET_KEY, { algorithms: ['HS256'] }, (err, user) => {
        if (err) return res.status(403).json({ message: '유효하지 않은 토큰입니다.' });
        req.user = user;
        next();
    });
};

module.exports = { router, authenticateToken };