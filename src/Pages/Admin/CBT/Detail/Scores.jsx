import React, { Fragment, useRef } from "react";
import * as XLSX from "xlsx";
import { useSelector } from "react-redux";
import { Box, Fade, Button } from "@mui/material";

const Scores = ({ open, close }) => {
  const { students: users } = useSelector((state) => state.studentInGrade);
  const { detail: exam } = useSelector((state) => state.detailExam);
  const { answers } = useSelector((state) => state.allAnswers);

  // Download Nilai
  const tableScoreRef = useRef(null);

  const exportScoreToExcel = (tableRef) => {
    // Membuat objek workbook baru
    const workbook = XLSX.utils.book_new();

    // Mendapatkan referensi tabel
    const table = tableRef.current;

    // Mendapatkan data dari tabel
    const tableData = XLSX.utils.table_to_sheet(table);

    // Menambahkan data ke workbook
    XLSX.utils.book_append_sheet(workbook, tableData, "Sheet1");

    // Mengkonversi workbook menjadi file Excel
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    // Membuat file Excel dari buffer
    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    // Menyimpan file Excel
    const fileName = `NILAI_${exam?.name}.xlsx`;
    if (navigator.msSaveBlob) {
      // Mendukung Internet Explorer
      navigator.msSaveBlob(data, fileName);
    } else {
      // Mendukung browser modern
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(data);
      link.download = fileName;
      link.click();
    }
  };

  const exportScoreExcel = () => exportScoreToExcel(tableScoreRef);

  return (
    <div>
      <Fade in={open}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: 350, md: 800 },
            height: 600,
            bgcolor: "#ffff",
            boxShadow: 24,
            p: 2,
            display: "flex",
            justifyContent: "start",
            overflow: "auto",
            flexDirection: "column",
          }}
        >
          <Box
            sx={{
              width: "100%",
              mb: 2,
              display: "flex",
              justifyContent: "end",
            }}
          >
            <Button
              variant="contained"
              color="success"
              onClick={exportScoreExcel}
              sx={{ mr: 2 }}
            >
              Excel
            </Button>

            <Button variant="contained" color="error" onClick={close}>
              TUTUP
            </Button>
          </Box>
          <table className="greenTable" width="100%" ref={tableScoreRef}>
            <thead>
              <tr>
                <th>NIS</th>
                <th>Nama Siswa</th>
                <th>Kelas</th>
                <th>PG</th>
                <th>Essay</th>
                <th>Nilai</th>
              </tr>
            </thead>
            <tbody>
              {users?.map((user) => {
                const studentAnswer = answers?.find(
                  (answer) =>
                    answer.user === user?._id && answer.exam === exam?._id
                );
                return (
                  <tr key={user._id}>
                    <td>{user.nis}</td>
                    <td>{user.name}</td>
                    <td>{user.class}</td>
                    <td>
                      {studentAnswer
                        ? Number(studentAnswer?.scorePg).toFixed()
                        : null}
                    </td>
                    <td>
                      {studentAnswer
                        ? Number(studentAnswer?.scoreEssay).toFixed()
                        : null}
                    </td>
                    <td>
                      {studentAnswer
                        ? Number(studentAnswer?.finalScore).toFixed()
                        : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Box>
      </Fade>
    </div>
  );
};

export default Scores;
