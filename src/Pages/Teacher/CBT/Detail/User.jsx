import { Box, TextField } from "@mui/material";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import Data from "./Data";
import Table from "./Table";

const User = () => {
  const { students: users } = useSelector((state) => state.studentInGrade);
  const { detail: exam } = useSelector((state) => state.detailExam);
  const { answers } = useSelector((state) => state.allAnswers);

  const [searchTerm, setSearchTerm] = useState("");

  // Fungsi untuk mengubah nilai input pencarian
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Fungsi untuk melakukan pencarian berdasarkan nama siswa
  const searchFilter = (user) => {
    return user.name.toLowerCase().includes(searchTerm.toLowerCase());
  };

  const filteredUsers = users?.filter(searchFilter);

  return (
    <Box
      sx={{
        m: 1,
        width: { xs: "90%", md: "96%" },
        boxShadow: 4,
        borderRadius: 2,
        p: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          mb: 2,
        }}
      >
        <Box
          sx={{
            flex: 1,
          }}
        >
          <TextField
            label="Cari Nama Siswa"
            variant="outlined"
            fullWidth
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </Box>

        <Data />
      </Box>

      <Box sx={{ width: "100%", overflowX: "auto" }}>
        <Table user={filteredUsers} answers={answers} exam={exam} />
      </Box>
    </Box>
  );
};

export default User;
