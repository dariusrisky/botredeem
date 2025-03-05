const { google } = require("googleapis");
require("dotenv").config();
const fs = require("fs");
const path = require("path");

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const RANGE = "Sheet1!A2:C"; // Range yang lebih luas dari A2 sampai C untuk seluruh kolom
const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, "apikey.json"),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});
const sheets = google.sheets({ version: "v4", auth });

const req = async () => {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
    });
    console.log(res);
    const rows = res.data.values;
    if (rows) {
      // Buat array untuk menyimpan pembaruan
      const updatePromises = rows.map(async (row, index) => {
        const [voucher, status, value] = row;
        // console.log(`Status voucher ${voucher}: ${status}`);
        
          // Misalnya, kita ingin mengganti status menjadi 'used' pada kolom B (status)
        if (status === 'unused') {
          const updatedRow = [...row]; // Menyalin row yang ada
          updatedRow[1] = 'used'; // Mengubah status menjadi 'used'

          // Tentukan range untuk memperbarui berdasarkan baris yang ada
          const updateRange = `Sheet1!B${index + 2}`; // index + 2 karena data mulai dari baris kedua

          // Melakukan update pada status voucher yang 'unused'
          return sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: updateRange,
            valueInputOption: 'RAW',
            resource: {
              values: [[updatedRow[1]]], // Update hanya kolom 'status'
            },
          });
        }
      });

      // Tunggu semua update selesai
      await Promise.all(updatePromises);
      console.log("Data berhasil diperbarui!");
    }
  } catch (err) {
    console.error("The API returned an error:", err);
    return "Terjadi kesalahan saat mengecek voucher!";
  }
};

req();


async () => {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
    });
    // cek auth
    // console.log(res);
    const rows = res.data.values;
    if (rows) {
      for (let row of rows) {
        // console.log(row);
        const [voucher, status, value] = row;
        if(voucher === voucherCode){
          console.log(status);
          // return status
        }else{
          console.log('error')
        }
      }
    }
    return;
  } catch (err) {
    console.error("The API returned an error:", err);
    return "Terjadi kesalahan saat mengecek voucher!";
  }
}



