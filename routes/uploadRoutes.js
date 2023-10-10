// import express from "express";
// import multer from "multer";
// import { ref, uploadBytes, getStorage, getDownloadURL } from "firebase/storage";
// import app from "../firebase.js";
// import { v4 as uuidv4 } from "uuid";

// const router = express.Router();
// const storage = getStorage(app);

// const memoStorage = multer.memoryStorage();
// const upload = multer({ storage: memoStorage });

// router.post("/upload", upload.single("file"), async (req, res) => {
//   try {
//     const file = req.file;
//     const filePath = `exam/${uuidv4()}-${file.originalname}`;
//     const imageRef = ref(storage, filePath);
//     const metatype = { contentType: file.mimetype };
//     await uploadBytes(imageRef, file.buffer, metatype);
//     const downloadURL = await getDownloadURL(imageRef);
//     res.status(200).json({ location: downloadURL });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Failed to upload image" });
//   }
// });

// router.post("/web-asset/upload", upload.single("file"), async (req, res) => {
//   try {
//     const file = req.file;
//     const filePath = `web/${uuidv4()}-${file.originalname}`;
//     const imageRef = ref(storage, filePath);
//     const metatype = { contentType: file.mimetype };
//     await uploadBytes(imageRef, file.buffer, metatype);
//     const downloadURL = await getDownloadURL(imageRef);
//     res.status(200).json({ location: downloadURL });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Failed to upload image" });
//   }
// });

// export default router;

// import { v2 as cloudinary } from "cloudinary";

// cloudinary.config({
//   cloud_name: "pt-edutech",
//   api_key: "688369217314385",
//   api_secret: "uharE576My4aZN-aDWwdsNS8Jt8",
// });

import express from "express";
import cloudinary from "cloudinary";

const router = express.Router();

// Konfigurasi Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

router.post("/uploads", async (req, res) => {
  try {
    if (!req.body.image_url) {
      return res.status(400).json({ error: "No image URL provided" });
    }

    // Unggah gambar ke Cloudinary dari URL yang diberikan
    const result = await cloudinary.uploader.upload(req.body.image_url, {
      folder: "exam", // Simpan di folder "exam" di Cloudinary
    });

    res.json({ public_id: result.public_id, location: result.secure_url });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to upload image" });
  }
});

export default router;
