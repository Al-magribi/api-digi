import express from "express";
import AsyncError from "../middleware/AsyncError.js";
import {
  authenticateToken,
  authorizeAdmin,
} from "../middleware/Authenticator.js";
import ErrorHandler from "../middleware/ErrorHandler.js";
import Web from "../models/Web.js";
import multer from "multer";
import path from "path";

const router = express.Router();

const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/assets");
  },

  filename: function (req, file, cb) {
    cb(
      null,
      path.parse(file.originalname).name +
        "-" +
        Date.now() +
        path.extname(file.originalname)
    );
  },
});

const uploadImage = multer({ storage: imageStorage });

// MEMBUAT DATA WEB
router.post(
  "/create",
  authenticateToken,
  authorizeAdmin,
  AsyncError(async (req, res, next) => {
    try {
      const web = await Web.create(req.body);

      res.status(200).json(web);
    } catch (error) {
      return next(new ErrorHandler(error, 500));
    }
  })
);

// MENDAPATKAN DATA WEB
router.get(
  "/data",
  AsyncError(async (req, res, next) => {
    try {
      const web = await Web.find();

      res.status(200).json(web);
    } catch (error) {
      return next(new ErrorHandler(error, 500));
    }
  })
);

// DETAIL WEB
router.get(
  "/:id",
  AsyncError(async (req, res, next) => {
    try {
      const web = await Web.findById(req.params.id);

      if (!web) {
        return next(new ErrorHandler("Data tidak ditemukan", 404));
      }

      res.status(200).json(web);
    } catch (error) {
      return next(new ErrorHandler(error, 500));
    }
  })
);

// UPDATE WEB
router.put(
  "/update/:id",
  authenticateToken,
  authorizeAdmin,
  uploadImage.fields([
    { name: "logo", maxCount: 1 },
    { name: "hero", maxCount: 1 },
  ]),
  AsyncError(async (req, res, next) => {
    try {
      let web = await Web.findById(req.params.id);

      if (!web) {
        return next(new ErrorHandler("Data tidak ditemukan", 404));
      }

      const { logo, hero } = req.files;

      const logoName = logo[0].filename;
      const heroName = hero[0].filename;

      const logoLink =
        req.protocol + "://" + req.get("host") + "/assets/" + logoName;

      const heroLink =
        req.protocol + "://" + req.get("host") + "/assets/" + heroName;

      const data = {
        name: req.body.name,
        tagline: req.body.tagline,
        address: req.body.address,
        email: req.body.email,
        phone: req.body.phone,
        logo: logoLink,
        hero: heroLink,
        visi_misi: req.body.text,
      };

      web = await Web.findByIdAndUpdate(req.params.id, data, {
        new: true,
        runValidators: true,
      });

      res.status(200).json({ message: "Berhasil diperbarui" });
    } catch (error) {
      return next(new ErrorHandler(error, 500));
    }
  })
);

export default router;
