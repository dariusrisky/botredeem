const { Telegraf } = require("telegraf");
const { google } = require("googleapis");
require("dotenv").config();
const fs = require("fs");
const path = require("path");

const bot = new Telegraf(process.env.BOT_TOKEN);
const TARGET_ADMIN_CHAT_ID = process.env.TARGET_ADMIN_CHAT_ID;
const ADMIN_IDS = process.env.BROADCAST_ID;
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const RANGE = "Sheet1!A2:c";
const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, "apikey.json"),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});
const sheets = google.sheets({ version: "v4", auth });

bot.command("redeem", async (ctx) => {
  const voucherCode = ctx.message.text.split(" ")[1];
  console.log(voucherCode);
  if (!voucherCode) {
    ctx.reply("Mohon masukkan kode voucher yang valid!");
    return;
  }
  const message = await checkVoucher(voucherCode);
  ctx.reply(message);
  
  if (message.includes("#echovoucherredeem")) {
    await bot.on(["message", "edited_message"], async (ctx) => {
      try {
        const paramVoucher = "#" + voucherCode;
        const message = ctx.message || ctx.editedMessage;
        const text = message.text || message.caption || "";
        if (text.includes("#echovoucherredeem"&&paramVoucher)) {
          await ctx.telegram.forwardMessage(
            TARGET_ADMIN_CHAT_ID,
            message.chat.id,
            message.message_id
          );
          ctx.reply("Terimakasih :)\n Selamat Kode Yang Anda Reedem Adalah Benar\n💎💎💎💎\nDiamond Segera Kami Kirim✔✔\n💎💎💎💎")
          .then(async () => {
            try {
              const res = await sheets.spreadsheets.values.get({
                spreadsheetId: SPREADSHEET_ID,
                range: RANGE,
              });
              
              const rows = res.data.values;
              if (rows) {
                let found = false;
                for (let i = 0; i < rows.length; i++) {
                  const row = rows[i];
                  if (row.length < 3) continue;
                  
                  const [voucher, status, value] = row;
                  if (voucher === voucherCode) {
                    found = true;
                    // Cek Status
                    console.log("Voucher ditemukan!");
                    console.log("Status:", status);
                    console.log("Value:", value);
                    
                    if (status === 'unused') {
                      // Hitung posisi cell untuk diupdate (A1 notation)
                      const updateRow = i + 2;
                      const updateRange = `Sheet1!B${updateRow}`;
                      
                      try {
                        await sheets.spreadsheets.values.update({
                          spreadsheetId: SPREADSHEET_ID,
                          range: updateRange,
                          valueInputOption: "RAW",
                          resource: {
                            values: [["used"]]
                          }
                        });
                        // console.log("Status berhasil diubah dari 'unused' menjadi 'used'");
                        return {
                          status: "used",
                          value: value
                        };
                      } catch (updateErr) {
                        console.error("Error saat update spreadsheet:", updateErr);
                      }
                    } else {
                      console.log("Voucher sudah digunakan sebelumnya!");
                      return {
                        status: status,
                        value: value
                      };
                    }
                    break;
                  }
                }
                
                if (!found) {
                  console.log('Voucher tidak ditemukan');
                  return null;
                }
              } else {
                console.log('Tidak ada data di spreadsheet');
                return null;
              }
            } catch (err) {
              console.error("API mengembalikan error:", err);
              return "Terjadi kesalahan saat mengecek voucher!";
            }
          });
        } else {
          ctx.reply('Terjadi Kesalahan Mohon Cek Kembali Format')
        }
      } catch (error) {
        console.error("Error:", error);
      }
    });
  }
});

async function checkVoucher(voucherCode) {
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
        // cek value rows
        // console.log(row);
        const [voucher, status, value] = row;
        if (voucher === voucherCode) {
          console.log(status);
          return status === "used"
            ? "Voucher sudah digunakan!"
            : "Voucher valid\nVoucher : " +
                value +
                "💎\nSelamat Masukan Userid\n\nBerformat : \n\nUser : [Nama_Player]\nID : [ID_Player]\n#echovoucherredeem\n#**Kode_Voucher";
        }
      }
    }
    return "Voucher tidak ditemukan!";
  } catch (err) {
    console.error("The API returned an error:", err);
    return "Terjadi kesalahan saat mengecek voucher!";
  }
}

bot.command('test', (ctx)=>{
  console.log('bot berhasil ditesting')
})

// const check = checkVoucher('test123');

bot.launch();
