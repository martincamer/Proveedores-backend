// Importa el servidor de Express desde tu archivo app.js
import app from "./app.js";
import { ORIGIN, PORT } from "./config.js";

// Importa createServer y Server de http y socket.io respectivamente
import { createServer } from "http";
import { Server } from "socket.io";

// Crea el servidor HTTP utilizando Express
const httpServer = createServer(app);

// Crea el servidor de Socket.io y adjúntalo al servidor HTTP
const io = new Server(httpServer, {
  cors: {
    origin: ORIGIN,
    credentials: true,
  },
});

// Maneja eventos de Socket.io
io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("eliminar-proveedor", (eliminarProveedor) => {
    io.emit("eliminar-proveedor", eliminarProveedor);
  });
  socket.on("nuevo-proveedor", (nuevoProveedor) => {
    io.emit("nuevo-proveedor", nuevoProveedor);
  });
  socket.on("actualizar-proveedor", (actualizarProveedor) => {
    io.emit("actualizar-proveedor", actualizarProveedor);
  });
  socket.on("nuevo-comprobante", (nuevoComprobante) => {
    io.emit("nuevo-comprobante", nuevoComprobante);
  });
  socket.on("nueva-orden", (nuevaOrden) => {
    io.emit("nueva-orden", nuevaOrden);
  });
  socket.on("eliminar-orden", (eliminarOrden) => {
    io.emit("eliminar-orden", eliminarOrden);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
