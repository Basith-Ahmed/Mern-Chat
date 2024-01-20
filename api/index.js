const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const ws = require("ws");

const MessageModel = require('./models/Message')
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
      const { id, username } = data;
      res.json(data);
    });
  } else {
    res.status(401).json("no token");
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const foundUser = await UserModel.findOne({ username: username });
  if (foundUser) {
    const matched = bcrypt.compareSync(password, foundUser.password);
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
    const hashedPassword = bcrypt.hashSync(password, salt);
    const createdUser = await UserModel.create({
      username: username,
      password: hashedPassword,
    });
    jwt.sign(
      { userId: createdUser._id, username },
      secretKey,
      {},
      (err, token) => {
        if (err) throw err;
        res
          .cookie("token", token, { sameSite: "none", secure: true })
          .status(201)
          .json({ id: createdUser._id });
      }
    );
  } catch (err) {
    if (err) throw err;
  }
});

const server = app.listen(4000);

const wss = new ws.WebSocketServer({ server });

wss.on("connection", (connection, req) => {
  // console.log('User connected')
  // connection.send('hello')
  // console.log(req.headers)

  //read user name and id
  const cookies = req.headers.cookie;
  if (cookies) {
    //there might be alot of cookies
    const tokenCookies = cookies
      .split(";")
      .find((str) => str.startsWith("token="));
    if (tokenCookies) {
      const token = tokenCookies.split("=")[1];
      if (token) {
        // console.log(token)
        jwt.verify(token, secretKey, {}, (err, data) => {
          if (err) throw err;
          const { userId, username } = data;
          connection.userId = userId;
          connection.username = username;
        });
      }
    }
  }

connection.on("message", async (message) => { //this message is sent as an object
  const messageData = JSON.parse(message.toString());
  const { recipient, text } = messageData;
  if (recipient && text) { //if both exists
    const messageDocument = await MessageModel.create({
      sender: connection.userId,
      recipient: recipient,
      text: text
    });
    [...wss.clients]
    .filter(client => client.userId === recipient)
    .forEach(client => client.send(JSON.stringify({ text, sender: connection.userId, id: messageDocument._id })))
  }
});

  //notify everyone about online people(when someone connects)
  [...wss.clients].forEach(client => {
    client.send(JSON.stringify({
      online: [...wss.clients].map(clientInfo => ({userId: clientInfo.userId, username: clientInfo.username}))
    }
    ))
  })
});
