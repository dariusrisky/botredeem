const { Telegraf } = require('telegraf');
const { google } = require('googleapis');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const bot = new Telegraf(process.env.BOT_TOKEN);
const TARGET_ADMIN_CHAT_ID = process.env.TARGET_ADMIN_CHAT_ID;
const ADMIN_IDS = process.env.BROADCAST_ID;
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const RANGE = 'Sheet1!A2:c';  
const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, 'apikey.json'),  
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const sheets = google.sheets({ version: 'v4', auth });

bot.on(['message', 'edited_message'], async (ctx) => {
  try {
    const message = ctx.message || ctx.editedMessage;
    const text = message.text || message.caption || ''; 
    if (ADMIN_IDS.includes(ctx.from.id)){
      if (text.includes('#echovoucherredeem')) {
        await ctx.telegram.forwardMessage(
          TARGET_ADMIN_CHAT_ID,
          message.chat.id,
          message.message_id
        );
      }

    }
  } catch (error) {
    console.error('Error:', error);
  }
});

async function checkVoucher(voucherCode) {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
    });
    
    const rows = res.data.values;
    if (rows) {
      for (let row of rows) {
        console.log(rows);
        const [voucher, status] = row;
        if (voucher === voucherCode) {
          return status === 'used' ? 'Voucher sudah digunakan!' : 'Voucher valid!\nSelamat Masukan Userid\nBerformat : \nUser : [Nama_Playe]\nID : [ID_Player]\n#echovoucherredeem\n#**Kode_Voucher';
          bot.hear
        }
      }
    }
    return 'Voucher tidak ditemukan!';
  } catch (err) {
    console.error('The API returned an error:', err);
    return 'Terjadi kesalahan saat mengecek voucher!';
  }
}

bot.command('redeem', async (ctx) => {
  const voucherCode = ctx.message.text.split(' ')[1];

  if (!voucherCode) {
    ctx.reply('Mohon masukkan kode voucher yang valid!');
    return;
  }

  const message = await checkVoucher(voucherCode);
  ctx.reply(message);
});

bot.launch();
