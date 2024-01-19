const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");

const UserModel = require("./models/User");

dotenv.config();

async function connectDb() {
  await mongoose.connect(process.env.MONGO_URL);
  console.log("Connected to database!");
}
connectDb();

const secretKey = process.env.SECRET_KEY;
const salt = bcrypt.genSaltSync(10);

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
  })
);

app.get("/test", (req, res) => {
  res.json("test ok");
});

app.get("/profile", (req, res) => {
  const token = req.cookies?.token;
  if (token) {
    jwt.verify(token, secretKey, {}, (err, data) => {
      if (err) throw err;
      const {id, username} = data
      res.json(data)
    });
  } else {
    res.status(401).json("no token")
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const foundUser = await UserModel.findOne({ username: username });
  if (foundUser) {
    const matched = bcrypt.compareSync(password, foundUser.hashedPassword);
    if (matched) {
      jwt.sign(
        { userId: foundUser._id, username },
        secretKey,
        {},
        (err, token) => {
          res.cookie("token", token, { sameSite: "none", secure: true }).json({
            id: foundUser._id,
          });
        }
      );
    }
  }
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const createdUser = await UserModel.create({
      username,
      password
    });
    jwt.sign(
      { userId: createdUser._id },
      secretKey,
      {},
      (err, token) => {
        if (err) throw err;
        res.cookie("token", token, {sameSite:'none'}).status(201).json({ id: createdUser._id, username });
      });
  } catch (err) {
    if (err) throw err
  }
});

app.listen(4000);
