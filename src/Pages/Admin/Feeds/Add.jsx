import { Box, Fade, TextField, Button } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../Components/Loader";
import { toast } from "react-toastify";
import app from "../../Firebase";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { v4 } from "uuid";
import { ACT_RESET } from "../../../Redux/Act/act_const";
import { addFeeds } from "../../../Redux/Act/act_action";

const Add = ({ open, close }) => {
  const dispatch = useDispatch();

  const { loading, success, message, error } = useSelector(
    (state) => state.newAct
  );

  const imageLink =
    "https://media.sproutsocial.com/uploads/2017/02/10x-featured-social-media-image-size.png";

  const [title, setTitle] = useState("");
  const [image, setImage] = useState("");
  const [preview, setPreview] = useState(imageLink);

  const imageHandler = (e) => {
    const preview = e.target.files[0];

    if (preview.size > 1024 * 1024) {
      toast.error("Gambar lebih dari 1mb");

      return;
    }

    setPreview(URL.createObjectURL(preview));
    setImage(preview);
  };

  const addHandler = (e) => {
    e.preventDefault();

    const storage = getStorage(app);
    const imgFile = image;
    const imgFileName = v4() + "." + imgFile.name.split(".").pop();
    const imgStorageRef = ref(storage, `feeds/${imgFileName}`);
    const imgUploadTask = uploadBytesResumable(imgStorageRef, imgFile);

    imgUploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

        toast.success(`Upload prosess ${progress}%`);
      },
      (error) => {
        toast.error(`Error ${error.message}`);
      },

      async () => {
        const imageData = await getDownloadURL(imgUploadTask.snapshot.ref);

        const data = {
          title: title,
          img: imageData,
        };

        dispatch(addFeeds(data));
      }
    );
  };

  useEffect(() => {
    if (success) {
      toast.success(message);

      setTitle("");

      setPreview(imageLink);

      dispatch({ type: ACT_RESET });
    } else {
      toast.error(error);

      dispatch({ type: ACT_RESET });
    }
  }, [success, message, error]);

  return (
    <div>
      <Fade in={open}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: 350, md: 900 },
            bgcolor: "#ffff",
            boxShadow: 24,
            p: 2,
            display: "flex",
            alignContent: "center",
            justifyContent: "center",
          }}
        >
          {loading ? (
            <Loader />
          ) : (
            <form
              onSubmit={addHandler}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
              }}
            >
              <TextField
                fullWidth
                label="Judul"
                sx={{ mb: 2 }}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <Box sx={{ width: "100%", height: 200, mb: 2 }}>
                <input
                  accept=".jpg"
                  id="upload_featured_image"
                  type="file"
                  style={{ display: "none" }}
                  onChange={imageHandler}
                />
                <label htmlFor="upload_featured_image">
                  <img
                    src={preview}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      cursor: "pointer",
                    }}
                    onMouseOver={(e) => {
                      e.target.style.opacity = "0.6"; // Menambahkan efek opacity saat hover
                    }}
                    onMouseOut={(e) => {
                      e.target.style.opacity = "1"; // Mengembalikan opacity ke nilai semula saat tidak dihover
                    }}
                  />
                </label>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-around",
                  width: "100%",
                  mt: 2,
                }}
              >
                <Button variant="contained" color="success" type="submit">
                  tambah
                </Button>
                <Button variant="contained" color="error" onClick={close}>
                  batalkan
                </Button>
              </Box>
            </form>
          )}
        </Box>
      </Fade>
    </div>
  );
};

export default Add;
