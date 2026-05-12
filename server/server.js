const express = require("express");
const path = require("path");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const {
    guardarMensaje,
    obtenerMensajes
} = require("./database");

// ===============================
// PUBLIC
// ===============================
app.use(express.static(path.join(__dirname, "../public")));

// LOGIN
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/login.html"));
});

// ===============================
// USUARIOS
// ===============================
let usuarios = [];

// ===============================
// CONEXIÓN
// ===============================
wss.on("connection", (ws) => {

    console.log("Usuario conectado");

    // ENVIAR HISTORIAL CON HORA SI EXISTE
    obtenerMensajes((mensajes) => {
        ws.send(JSON.stringify({
            tipo: "historial",
            mensajes: mensajes
        }));
    });

    // ===============================
    // MENSAJES
    // ===============================
    ws.on("message", (data) => {

        try {

            const mensaje = JSON.parse(data.toString());

            // -----------------------
            // NUEVO USUARIO
            // -----------------------
            if (mensaje.tipo === "nuevo_usuario") {

                ws.usuario = mensaje.usuario;

                // evitar duplicados
                usuarios = usuarios.filter(u => u.socket !== ws);

                usuarios.push({
                    socket: ws,
                    nombre: mensaje.usuario
                });

                actualizarUsuarios();

                broadcast({
                    tipo: "sistema",
                    texto: `${mensaje.usuario} se unió al chat`
                });
            }

            // -----------------------
            // MENSAJE NORMAL
            // -----------------------
            if (mensaje.tipo === "mensaje") {

               const hora = new Date().toLocaleTimeString("es-BO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
});

                guardarMensaje(
                    mensaje.usuario,
                    mensaje.texto,
                    hora // 👈 AHORA SE GUARDA LA HORA
                );

                broadcast({
                    tipo: "mensaje",
                    usuario: mensaje.usuario,
                    texto: mensaje.texto,
                    hora: hora
                });
            }

        } catch (error) {
            console.log("Error JSON:", error.message);
        }

    });

    // ===============================
    // DESCONECTAR
    // ===============================
    ws.on("close", () => {

        if (ws.usuario) {

            usuarios = usuarios.filter(u => u.socket !== ws);

            actualizarUsuarios();

            broadcast({
                tipo: "sistema",
                texto: `${ws.usuario} abandonó el chat`
            });
        }

    });

});

// ===============================
// BROADCAST
// ===============================
function broadcast(data) {
    wss.clients.forEach(cliente => {
        if (cliente.readyState === WebSocket.OPEN) {
            cliente.send(JSON.stringify(data));
        }
    });
}

// ===============================
// USUARIOS
// ===============================
function actualizarUsuarios() {
    broadcast({
        tipo: "usuarios",
        lista: usuarios.map(u => u.nombre)
    });
}

// ===============================
// SERVER
// ===============================
server.listen(3000, () => {
    console.log("Servidor iniciado:");
    console.log("http://localhost:3000");
});