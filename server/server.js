const express = require("express");
const path = require("path");
const http = require("http");
const WebSocket = require("ws");

const app = express();

const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

// ARCHIVOS PUBLICOS
app.use(express.static(path.join(__dirname, "../public")));

// LOGIN.HTML
app.get("/", (req, res) => {

    res.sendFile(path.join(__dirname, "../public/login.html"));

});

// LISTA USUARIOS
let usuarios = [];

// NUEVA CONEXION
wss.on("connection", (ws) => {

    console.log("Usuario conectado");

    // RECIBIR MENSAJES
    ws.on("message", (data) => {

        const mensaje = JSON.parse(data);

        // NUEVO USUARIO
        if (mensaje.tipo === "nuevo_usuario") {

            ws.usuario = mensaje.usuario;

            usuarios.push({
                socket: ws,
                nombre: mensaje.usuario
            });

            // ACTUALIZAR USUARIOS
            actualizarUsuarios();

            // MENSAJE SISTEMA
            broadcast({

                tipo: "sistema",
                texto: `${mensaje.usuario} se unió al chat`

            });

        }

        // MENSAJE NORMAL
        if (mensaje.tipo === "mensaje") {

            broadcast({

                tipo: "mensaje",
                usuario: mensaje.usuario,
                texto: mensaje.texto,
                hora: new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                })

            });

        }

    });

    // DESCONECTAR
    ws.on("close", () => {

        if (ws.usuario) {

            usuarios = usuarios.filter(
                u => u.socket !== ws
            );

            actualizarUsuarios();

            broadcast({

                tipo: "sistema",
                texto: `${ws.usuario} abandonó el chat`

            });

        }

    });

});

// ENVIAR A TODOS
function broadcast(data) {

    wss.clients.forEach(cliente => {

        if (cliente.readyState === WebSocket.OPEN) {

            cliente.send(JSON.stringify(data));

        }

    });

}

// ACTUALIZAR USUARIOS
function actualizarUsuarios() {

    const lista = usuarios.map(u => u.nombre);

    broadcast({

        tipo: "usuarios",
        lista: lista

    });

}

// SERVIDOR
server.listen(3000, () => {

    console.log("Servidor iniciado:");
    console.log("http://localhost:3000");

});