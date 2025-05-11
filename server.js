const express = require("express");
const cookieParser = require("cookie-parser")
const cors = require("cors")
// const bodyParser = require("body-parser")
const app = express();
const PORT = 3000;

const { connectDb } = require("./src/config/database");
const authRouter = require("./src/routers/auth")
const loanRouter = require("./src/routers/loan")
const statsRouter = require("./src/routers/stats")

// app.use(bodyParser.json())
app.use(express.json())
app.use(cookieParser())
 

app.use(cors({ origin: "https://calm-crumble-e0c16d.netlify.app", credentials: true }));

app.use("/",authRouter)
app.use("/",loanRouter)
app.use("/",statsRouter)

connectDb()
  .then(() => {
    console.log("Database connect successfully");
    app.listen(PORT, () => {
      console.log("Server running on the http://localhost:3000/");
    });
  })
  .catch((err) => {
    console.log("Failed to Connect Database!!!");
  });
