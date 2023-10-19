import express from "express";
import multer from "multer";
import path from "path";

const router = express.Router();

const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/images");
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

const audioStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/audio");
  },

  filename: (req, file, cb) => {
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
const uploadAudio = multer({ storage: audioStorage });

router.post("/image", uploadImage.single("file"), (req, res) => {
  try {
    const imageLink =
      req.protocol + "://" + req.get("host") + "/images/" + req.file.filename;

    res.status(200).json({ location: imageLink });
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

router.post("/audio", uploadAudio.single("audio"), (req, res) => {
  try {
    const audioLink =
      req.protocol + "://" + req.get("host") + "/audios/" + req.file.filename;

    res.status(200).json({ location: audioLink });
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

export default router;
