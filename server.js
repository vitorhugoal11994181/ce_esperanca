// server.js (responsável só pelo keep-alive)
const express = require("express");
const app = express();

app.get("/", (req, res) => res.send("Bot online!"));
app.listen(3000, () => console.log("Keep-alive ativo na porta 3000"));
