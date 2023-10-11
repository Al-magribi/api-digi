import express from "express";
import AsyncError from "../middleware/AsyncError.js";
import {
  authenticateToken,
  authorizeAdmin,
  authorizeAdminTeacher,
  authorizeStudent,
} from "../middleware/Authenticator.js";
import Answer from "../models/Answer.js";
import cors from "cors";

const router = express.Router();

// MENYINPAN JAWABAN SISWA KE DALAM DATABASE
router.post(
  "/student-answer/save",
  authenticateToken,
  authorizeStudent,
  AsyncError(async (req, res) => {
    try {
      const essay = isNaN(req.body.scoreEssay) ? 0 : req.body.scoreEssay;

      const finalScore = req.body.scorePg + essay;

      const answer = await Answer.create({
        user: req.body.user,
        exam: req.body.exam,
        answer: req.body.answer,
        scorePg: req.body.scorePg,
        scoreEssay: essay,
        finalScore: finalScore,
      });

      return res
        .status(200)
        .json({ message: "Jawaban anda berhasil disimpan", answer });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  })
);

// MENAMPILKAN SELURUH JAWABAN SISWA
router.get(
  "/admin/get-all/:id",
  cors(),
  authenticateToken,
  AsyncError(async (req, res) => {
    try {
      const answers = await Answer.find({ exam: req.params.id });

      return res.status(200).json(answers);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  })
);

// DETAIL JAWABAN SISWA
router.get(
  "/admin/answer-detail/:id",
  AsyncError(async (req, res) => {
    try {
      const answer = await Answer.findById(req.params.id);

      if (!answer) {
        return res.status(404).json({ message: "Data tidak ditemukan" });
      }

      res.status(200).json(answer);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  })
);

// MEMBERIKAN NILAI ESSAY
router.post(
  "/admin/score-essay/:userId/:examId",
  AsyncError(async (req, res) => {
    try {
      const answer = await Answer.findOne({
        user: req.params.userId,
        exam: req.params.examId,
      });

      if (!answer) {
        return res.status(404).json({ message: "Data tidak ditemukan" });
      }

      answer.scoreEssay = req.body.essay;

      answer.finalScore = Number(answer.scorePg) + Number(answer.scoreEssay);

      await answer.save();

      return res.status(200).json({ message: "Berhasil disimpan" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  })
);

// JWABAN SISWA UNTUK SEMUA UJIAN
router.get(
  "/my-answers",
  authenticateToken,
  AsyncError(async (req, res) => {
    try {
      const myAnswers = await Answer.find({ user: req.user.id })
        .select("-answer")
        .populate({ path: "user", select: "-username -password" })
        .populate({
          path: "exam",
          select:
            "-tokenIn -tokenOut -log -questions -durations -choice -essay",
          populate: {
            path: "user",
            select: "-username -password -role",
          },
        });

      if (!myAnswers) {
        return res.status(404).json({ message: "Data tidak ditemukan" });
      }

      return res.status(200).json(myAnswers);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  })
);

export default router;
