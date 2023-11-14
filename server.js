const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const db = require("./config/db");
const morgan = require("morgan");

const app = express();
dotenv.config();

app.use(bodyParser.json());
app.use(morgan("dev"));
app.use(cors({ origin: "http://localhost:5173/" }));

app.get("/", (req, res) => {
  res.status(200).send({
    message: "Welcome to react application",
  });
});
app.use("/auth", require("./routes/authRoutes"));
const port = process.env.PORT || 8080;
//listen to server port
app.listen(port, () => {
  console.log("server running on port " + port);
});
