import { Server } from "socket.io";
import { App } from "uWebSockets.js";
import { logger } from "./logger";

(async () => {
  const uws = App();
  const io = new Server();
  io.attachApp(uws);

  io.on("connection", async (socket) => {
    logger.info(`New connection: ${socket.id}`);
    socket.emit("room", socket.id);

    socket.onAny((event, data) => {
      if (event === "join") {
        return;
      }
      io.to([...socket.rooms]).emit(event, data);
    });

    socket.on("join", (room) => {
      socket.join(room);
      socket.leave(socket.id);
      io.to(room).emit("user-joined", socket.id);
      logger.info(`Socket ${socket.id} joined room ${room}`);
    });

    socket.on("disconnect", () => {
      logger.info(`Connection ${socket.id} disconnected`);
      io.to([...socket.rooms]).emit("user-left", socket.id);
    });
  });

  uws.listen(9632, (token) => {
    if (!token) {
      logger.error("Port 9632 is already in use");
      process.exit(1);
    }
    logger.info("Server started on port 9632");
  });
})();
