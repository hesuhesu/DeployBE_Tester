const express = require("express");
const router = express.Router();
const Diary = require('../models/Diary');
const { authenticateToken } = require('./auth');

router.get('/', (req, res) => {
    res.send('다이어리 가능');
});

// 글 하나 조회
router.get("/read_detail", async (req, res) => {
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

router.get("/one_page_read", async(req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; // 현재 페이지 (기본값: 1)
        const limit = parseInt(req.query.limit) || 10; // 한 페이지당 아이템 수 (기본값: 10)
        const skip = (page - 1) * limit; // 건너뛸 문서 수

        var diaries, totalDiaries;

        if (req.query.category === '전체'){
            diaries = await Diary.find()
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });
            totalDiaries = await Diary.countDocuments();
        }
        else {
            diaries = await Diary.find({ category : req.query.category })
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });
            totalDiaries = await Diary.countDocuments({ category : req.query.category });
        }

        res.status(200).json({
            success: true,
            list: diaries,
            currentPage: page,
            totalPages: Math.ceil(totalDiaries / limit),
            totalItems: totalDiaries,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '서버 에러가 발생했습니다.',
            error: error.message,
        });
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

// 댓글 추가
router.post("/add_comment", authenticateToken, async (req, res) => {
    try {
        const { diaryId, content } = req.body;
        const { username } = req.user;
        const diary = await Diary.findById(diaryId);
        if (!diary) {
            return res.status(404).json({ message: "일기를 찾을 수 없습니다." });
        }

        // 댓글 추가
        diary.comments.push({ username, content });
        await diary.save();

        res.json({ message: "댓글이 추가되었습니다.", username, comments: diary.comments });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "댓글 추가에 실패했습니다.", error: error.message });
    }
});

// 댓글 삭제
router.delete("/delete_comment", authenticateToken, async (req, res) => {
    try {
        const { diaryId, index } = req.body; // 댓글 내용
        const { username } = req.user;
        const diary = await Diary.findById(diaryId);
        if (!diary) {
            return res.status(404).json({ message: "일기를 찾을 수 없습니다." });
        }

        // 요청한 인덱스가 유효한지 확인
        if (index < 0 || index >= diary.comments.length) {
            return res.status(400).json({ message: "유효하지 않은 댓글 인덱스입니다." });
        }

        // 댓글 작성자가 요청한 사용자와 일치하는지 확인
        const comment = diary.comments[index];
        if (comment.username !== username) {
            return res.status(403).json({ message: "댓글을 삭제할 권한이 없습니다." });
        }

        // 댓글 삭제
        diary.comments.splice(index, 1);
        await diary.save();

        res.json({ message: "댓글이 삭제되었습니다.", comments: diary.comments });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "댓글 삭제에 실패했습니다.", error: error.message });
    }
});

// 댓글 조회
router.get("/comments", async (req, res) => {
    try {
        const { diaryId } = req.query;

        const diary = await Diary.findById(diaryId);
        if (!diary) {
            return res.status(404).json({ message: "일기를 찾을 수 없습니다." });
        }

        res.json({ comments: diary.comments });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "댓글 조회에 실패했습니다.", error: error.message });
    }
});

// 카테고리 별 검색
router.get("/search", async (req, res) => {
    try {
        const diary = await Diary.find({ title: { $regex: req.query.title, $options: 'i' } }).sort({ createdAt: -1 });
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