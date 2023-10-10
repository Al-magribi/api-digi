import express from "express";
import AsyncError from "../middleware/AsyncError.js";
import Ebook from "../models/Ebook.js";
import ErrorHandler from "../middleware/ErrorHandler.js";
import {
  authenticateToken,
  authorizeAdmin,
  authorizeAdminTeacher,
  authorizeTeacher,
} from "../middleware/Authenticator.js";

const router = express.Router();

// MENAMPILKAN SEMUA EBOOK
router.get(
  "/all",
  AsyncError(async (req, res) => {
    try {
      const searchTerm = req.query.search || "";

      const query = { title: { $regex: searchTerm, $options: "i" } };

      const ebooks = await Ebook.find(query)
        .sort({ createdAt: -1 })
        .populate({ path: "user", select: "-password -username" });

      res.status(200).json(ebooks);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  })
);

// MENAMPILKAN BUKU BERDASARKAN GURU
router.get(
  "/teacher-ebooks",
  authenticateToken,
  authorizeAdminTeacher,
  async (req, res) => {
    try {
      const { title } = req.query || ""; // Ambil judul dari query string jika ada

      let ebookQuery = { user: req.user.id }; // Query dasar untuk mencari ebook berdasarkan user ID

      // Jika ada judul yang diberikan dalam query string, tambahkan filter berdasarkan judul
      if (title) {
        ebookQuery.title = { $regex: title, $options: "i" }; // Menggunakan regex untuk pencarian tidak bersifat case-sensitive
      }

      const ebooks = await Ebook.find(ebookQuery)
        .sort({ createdAt: -1 })
        .populate("user");

      if (!ebooks) {
        return res.status(404).json({ message: "Data tidak ditemukan" });
      }

      res.status(200).json(ebooks);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
);

// MEMBUAT EBOOK
router.post(
  "/create",
  authenticateToken,
  authorizeAdminTeacher,
  AsyncError(async (req, res) => {
    try {
      const ebook = await Ebook.create(req.body);

      res.status(200).json({ ebook, message: "Ebook Berhasil ditambahkan" });
    } catch (error) {
      res.status(500).json({ error: error });
    }
  })
);

// MEMBACA EBOOK
router.get(
  "/read/:title",
  authenticateToken,
  AsyncError(async (req, res) => {
    try {
      const ebook = await Ebook.findOne({ title: req.params.title });

      if (!ebook) {
        res.status(404).json({ message: "ebook tidak ditemukan tidak" });
      }

      res.status(200).json(ebook);
    } catch (error) {
      res.status(500).json({ error: error });
    }
  })
);

// MENGHAPUS EBOOK
router.delete(
  "/delete/:id",
  authenticateToken,
  authorizeAdminTeacher,
  AsyncError(async (req, res, next) => {
    try {
      const ebook = await Ebook.findById(req.params.id);

      ebook.deleteOne();

      return res.status(201).json({ message: "Ebook berhasil dihapus" });
    } catch (error) {
      return next(new ErrorHandler(error, 500));
    }
  })
);

// DETAIL EBOOK
router.get(
  "/detail/:id",
  authenticateToken,
  AsyncError(async (req, res, next) => {
    const ebook = await Ebook.findById(req.params.id);

    if (!ebook) {
      return next(new ErrorHandler("Ebook tidak ditemukan", 404));
    }

    res.status(200).json(ebook);
  })
);

// MENG-UPDATE EBOOK
router.put(
  "/update/:id",
  authenticateToken,
  authorizeAdminTeacher,
  AsyncError(async (req, res, next) => {
    try {
      let ebook = await Ebook.findById(req.params.id);

      if (!ebook) {
        return nexr(new ErrorHandler("Ebook tidak ditemukan", 404));
      }

      ebook = await Ebook.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });

      return res.status(200).json({ message: "Ebook berhasil diperbarui" });
    } catch (error) {
      return next(new ErrorHandler(error, 500));
    }
  })
);

export default router;
