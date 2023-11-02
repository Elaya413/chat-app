require("dotenv").config();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const db = require("./db/connect");

const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");

db();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

app.use(express.json()); 
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.get("/", (req, res) => {
  res.status(200).send({ message: "Hello world!" });
});

app.use("/api", authRoutes);
app.use("/api", userRoutes);

const PORT = process.env.PORT || 5000;

io.on("connection", (socket) => {
  socket.on("join-room", (data) => {
    socket.join(data);
    console.log(`User ${socket.id} has joined the room.`);
  });
  socket.on("send-message", (data) => {
    console.log("DATA SENT: ", data);
    socket.to(data.room).emit("receive-message", data);
  });
  socket.on("disconnect", () => {
    console.log("Disconnected.", socket.id);
  });
});


server.listen(PORT, () => {
  console.log(`App is running on PORT ${PORT}`);
});

