const http = require("http");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

function formatMessage(price) {
  const date = new Date();
  const timeNowStr = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
  return `1 BTC cost $${Number(price).toFixed(2)} at ${timeNowStr}`;
}

function send(res) {
  res.setHeader("Content-Type", "text/event-stream");

  setInterval(() => {
    axios("https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT")
      .then((response) => {
        const { price } = response.data;
        if (price) {
          res.write(`data: ${formatMessage(price)}\n\n`);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }, 5000);
}

http
  .createServer((req, res) => {
    const url = new URL(`http://${req.headers.host}${req.url}`);

    if (url.pathname === "/stream") {
      send(res);
      return;
    }

    const fileStream = fs.createReadStream(path.join(__dirname, "index.html"));
    fileStream.pipe(res);
  })
  .listen(9000, () => {
    console.log("Server started on 9000");
  });
