import { Box, Button, TextField } from "@mui/material";
import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import { Editor } from "@tinymce/tinymce-react";
import app from "../../Firebase";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { v4 } from "uuid";
import { getWeb, updateWeb } from "../../../Redux/Web/web_action";
import Loader from "../Components/Loader";
import { WEB_UPDATE_RESET } from "../../../Redux/Web/web_const";

const Setting = ({ web }) => {
  const dispatch = useDispatch();

  const { loading, message, isUpdated } = useSelector((state) => state.upWeb);

  const editorRef = useRef(null);
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [text, setText] = useState("");

  const [logoPreview, setLogoPreview] = useState("");
  const [newLogo, setNewLogo] = useState("");

  const [heroPreview, setHeroPreview] = useState("");
  const [newHero, setNewHero] = useState("");

  const logoHandler = (e) => {
    const preview = e.target.files[0];

    if (preview.size > 1024 * 1024) {
      toast.error("Gambar lebih dari 1mb");

      return;
    }

    setLogoPreview(URL.createObjectURL(preview));
    setNewLogo(preview);
  };

  const heroHandler = (e) => {
    const preview = e.target.files[0];

    if (preview.size > 1024 * 1024) {
      toast.error("Gambar lebih dari 1mb");

      return;
    }

    setHeroPreview(URL.createObjectURL(preview));
    setNewHero(preview);
  };

  useEffect(() => {
    if (web) {
      setName(web?.name);
      setTagline(web?.tagline);
      setAddress(web?.address);
      setEmail(web?.email);
      setPhone(web?.phone);
      setText(web?.visi_misi);
      setLogoPreview(web?.logo);
      setHeroPreview(web?.hero);
    }
  }, [web]);

  const updateHandler = async (e) => {
    e.preventDefault();

    if (newLogo && newHero) {
      const storage = getStorage(app);
      const logoFile = newLogo;
      const logoName =
        v4() + "." + (logoFile.name ? logoFile.name.split(".").pop() : "");
      const logoStorage = ref(storage, `assets/${logoName}`);
      const logo_upload_task = uploadBytesResumable(logoStorage, logoFile);

      const heroFile = newHero;
      const heroName =
        v4() + "." + (heroFile.name ? heroFile.name.split(".").pop() : "");
      const heroStorage = ref(storage, `assets/${heroName}`);
      const hero_upload_task = uploadBytesResumable(heroStorage, heroFile);

      logo_upload_task.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          toast.success(`Uploading logo ${progress.toFixed()}% selesai`);
        },
        (error) => {
          toast.error(`Error ${error.message}`);
        }
      );

      hero_upload_task.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          toast.success(`Uploading hero ${progress.toFixed()}% selesai`);
        },
        (error) => {
          toast.error(`Error ${error.message}`);
        },
        async () => {
          await Promise.all([logo_upload_task, hero_upload_task]);

          const logoUrl = await getDownloadURL(logo_upload_task.snapshot.ref);
          const heroUrl = await getDownloadURL(hero_upload_task.snapshot.ref);

          const data = {
            name: name,
            tagline: tagline,
            address: address,
            email: email,
            phone: phone,
            logo: logoUrl,
            hero: heroUrl,
            visi_misi: text,
          };

          dispatch(updateWeb(web._id, data));
        }
      );
    } else if (newLogo) {
      const storage = getStorage(app);
      const logoFile = newLogo;
      const logoName =
        v4() + "." + (logoFile.name ? logoFile.name.split(".").pop() : "");
      const logoStorage = ref(storage, `assets/${logoName}`);
      const logo_upload_task = uploadBytesResumable(logoStorage, logoFile);

      logo_upload_task.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          toast.success(`Uploading logo ${progress.toFixed()}% selesai`);
        },
        (error) => {
          toast.error(`Error ${error.message}`);
        },
        async () => {
          await Promise.all([logo_upload_task]);

          const logoUrl = await getDownloadURL(logo_upload_task.snapshot.ref);

          const data = {
            name: name,
            tagline: tagline,
            address: address,
            email: email,
            phone: phone,
            logo: logoUrl,
            hero: web?.hero,
            visi_misi: text,
          };

          dispatch(updateWeb(web._id, data));
        }
      );
    } else if (newHero) {
      const storage = getStorage(app);

      const heroFile = newHero;
      const heroName =
        v4() + "." + (heroFile.name ? heroFile.name.split(".").pop() : "");
      const heroStorage = ref(storage, `assets/${heroName}`);
      const hero_upload_task = uploadBytesResumable(heroStorage, heroFile);

      hero_upload_task.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          toast.success(`Uploading hero ${progress.toFixed()}% selesai`);
        },
        (error) => {
          toast.error(`Error ${error.message}`);
        },
        async () => {
          await Promise.all([hero_upload_task]);

          const heroUrl = await getDownloadURL(hero_upload_task.snapshot.ref);

          const data = {
            name: name,
            tagline: tagline,
            address: address,
            email: email,
            phone: phone,
            logo: web?.logo,
            hero: heroUrl,
            visi_misi: text,
          };

          dispatch(updateWeb(web._id, data));
        }
      );

      toast.success("Logo tidak ada, Hero ada");
    } else {
      const data = {
        name: name,
        tagline: tagline,
        address: address,
        email: email,
        phone: phone,
        logo: web?.logo,
        hero: web?.hero,
        visi_misi: text,
      };

      dispatch(updateWeb(web._id, data));
    }
  };

  const id = "6426348b83c37122a65486d6";

  useEffect(() => {
    if (isUpdated) {
      dispatch(getWeb(id));

      dispatch({ type: WEB_UPDATE_RESET });

      toast.success(message);
    }
  }, [dispatch, isUpdated, message, id]);

  return (
    <Box sx={{ p: 1, width: "100%" }}>
      {loading ? (
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Loader />
        </Box>
      ) : (
        <form
          onSubmit={updateHandler}
          style={{ display: "flex", flexDirection: "column" }}
        >
          <Box
            sx={{ display: "flex", flexDirection: { xs: "column", md: "row" } }}
          >
            {/* 1 */}
            <Box sx={{ flex: 1, p: 2 }}>
              <TextField
                sx={{ mb: 2 }}
                fullWidth
                label="Nama Sekolah"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <TextField
                sx={{ mb: 2 }}
                fullWidth
                label="Tagline"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
              />

              <TextField
                sx={{ mb: 2 }}
                fullWidth
                label="alamat"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />

              <TextField
                sx={{ mb: 2 }}
                fullWidth
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <TextField
                sx={{ mb: 2 }}
                fullWidth
                label="No Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />

              <Box
                sx={{
                  display: "flex",
                  height: { xs: 400, md: 200 },
                  flexDirection: { xs: "column", md: "row" },
                }}
              >
                {/* LOGO */}
                <Box
                  sx={{
                    flex: 1,
                    p: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <input
                    accept=".png"
                    id="upload_featured_image"
                    type="file"
                    style={{ display: "none" }}
                    onChange={logoHandler}
                  />
                  <label htmlFor="upload_featured_image">
                    <img
                      src={logoPreview ? logoPreview : web?.logo}
                      alt={web?.name}
                      style={{
                        height: "180px",
                        width: "180px",
                        objectFit: "contain",
                        borderRadius: "50%",
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

                {/* HERO */}
                <Box
                  sx={{
                    flex: 1,
                    p: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <input
                    accept=".jpg"
                    id="upload_hero_image"
                    type="file"
                    style={{ display: "none" }}
                    onChange={heroHandler}
                  />

                  <label htmlFor="upload_hero_image">
                    <img
                      src={heroPreview ? heroPreview : web?.hero}
                      alt={web?.name}
                      style={{
                        height: "180px",
                        width: "280px",
                        objectFit: "cover",
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
              </Box>
            </Box>

            {/* 2 */}
            <Box sx={{ flex: 1, p: 2 }}>
              <Editor
                apiKey={import.meta.env.VITE_TINYMCCE_KEY}
                onInit={(evt, editor) => (editorRef.current = editor)}
                value={text}
                init={{
                  height: 550,
                  width: "100%",
                  menubar: true,
                  plugins: [
                    "advlist",
                    "autolink",
                    "lists",
                    "link",
                    "image",
                    "charmap",
                    "preview",
                    "anchor",
                    "searchreplace",
                    "visualblocks",
                    "code",
                    "fullscreen",
                    "insertdatetime",
                    "media",
                    "table",
                    "code",
                    "help",
                    "wordcount",
                  ],
                  toolbar:
                    "undo redo | blocks | " +
                    "bold italic forecolor | alignleft aligncenter " +
                    "alignright alignjustify | bullist numlist outdent indent | " +
                    "removeformat | help",
                  content_style:
                    "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                  images_upload_url: `${
                    import.meta.env.VITE_URL
                  }/api/images/web-asset/upload`,
                }}
                onEditorChange={setText}
              />
            </Box>
          </Box>
          <Box sx={{ width: "100%", display: "flex", justifyContent: "end" }}>
            <Button variant="contained" color="success" type="submit">
              Update
            </Button>
          </Box>
        </form>
      )}

      <ToastContainer autoClose={2000} />
    </Box>
  );
};

export default Setting;
