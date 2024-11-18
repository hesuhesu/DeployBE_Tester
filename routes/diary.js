const express = require("express");
const router = express.Router();
const Diary = require('../models/Diary');

router.get('/', (req, res) => {
    res.send('다이어리 가능');
});

// 글 하나 조회
router.get("/read", async (req, res) => {
    try {
        const diary = await Diary.findOne({ _id : req.query._id });
        res.json({ list: diary });
    } catch (err) {
        res.json({ message: false });
    }
});

// 글 전체 목록 조회
router.get("/all_read", async(req, res) => {
    try {
        const diary = await Diary.find().sort({ createdAt: -1 });
        res.json({ list: diary });
    } catch (error) {
        console.log(error);
        res.json({ message: false });
    }
});

// 글 쓰기
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
        realContent: req.body.realContent,
        imgData: req.body.imgData,
        category: req.body.category,
        createdAt: createdAt
      };
      const diary = new Diary(obj);
      await diary.save();
      res.json({ message: "게시글이 업로드 되었습니다." });
    } catch (error) {
        console.log(error);
        res.json({ message: false });
    }
})

// 카테고리 별 검색
router.get("/search", async (req, res) => {
    try {
        const diary = await Diary.find({ category : req.query.category }).sort({ createdAt: -1 });
        res.json({ list: diary });
    } catch (err) {
        res.json({ message: false });
    }
});

// 글 업데이트
router.put("/update", async (req,res) => {
    try {
        
        await Diary.updateOne(
            {_id: req.body._id},
            {
                $set: {
                    title: req.body.title,
                    content: req.body.content,
                    realContent: req.body.realContent,
                    imgData: req.body.imgData,
                    category: req.body.category
                }
            }
        );
        res.json({ message : "게시글이 수정되었습니다." })
    } catch (error) {
        res.json({ message: false });
    }
});

// 글 삭제 
router.delete("/delete", async(req,res) => {
    try {
       await Diary.deleteOne({_id: req.query._id })
       res.json({ message: true });
    } catch (error) {
       res.json({ message: false });
    }
});

module.exports = router;