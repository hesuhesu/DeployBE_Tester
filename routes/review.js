const express = require("express");
const router = express.Router();
const Review = require('../models/Review');

// 글 전체 목록 조회
router.get("/read", async(req, res) => {
    try {
        const review = await Review.find().sort({ createdAt: -1 });
        console.log("데이터 보냄");
        res.json({ list: review });
    } catch (error) {
        console.log(error);
        res.json({ message: false });
    }
});

router.post("/write", async(req, res) => {
    try {
      let obj;
      const now = new Date();
      const createdAt = now.toLocaleString('ko-KR', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false
      });
      obj = {
        title: req.body.title,
        content: req.body.content,
        createdAt: createdAt
      };
      const review = new Review(obj);
      await review.save();
      res.json({ message: "게시글이 업로드 되었습니다." });
    } catch (error) {
        console.log(error);
        res.json({ message: false });
    }
})

module.exports = router;