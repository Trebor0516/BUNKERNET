const express = require("express");
const http = require("http");
const path = require("path");
const WebSocket = require("ws");

const {
    guardarMensaje,
    obtenerMensajes
} = require("./database");

// =======================
// EXPRESS
// =======================

const app = express();

app.use(express.static(
    path.join(__dirname, "../public")
));

// =======================
// HTTP SERVER
// =======================

const server = http.createServer(app);

// =======================
// WEBSOCKET SERVER
// =======================

const wss = new WebSocket.Server({
    server
});

// =======================
// USUARIOS CONECTADOS
// =======================

let usuarios = [];

// =======================
// NUEVA CONEXIÓN
// =======================

wss.on("connection", (ws) => {

    console.log("Usuario conectado");

// =======================
// RECIBIR MENSAJES
// =======================

    ws.on("message", (data) => {

        let mensaje;

        try {

            mensaje = JSON.parse(data);

        } catch (error) {

            console.error(
                "JSON inválido:",
                error.message
            );

            return;

        }

// =======================
// NUEVO USUARIO
// =======================

        if (mensaje.tipo === "nuevo_usuario") {

            // EVITAR DUPLICADOS
            usuarios = usuarios.filter(
                u => u.nombre !== mensaje.usuario
            );

            usuarios.push({
                socket: ws,
                nombre: mensaje.usuario
            });

            console.log(
                `${mensaje.usuario} se conectó`
            );

            // ENVIAR HISTORIAL
            obtenerMensajes((mensajes) => {

                ws.send(JSON.stringify({
                    tipo: "historial",
                    mensajes
                }));

            });

            // ACTUALIZAR LISTA
            actualizarUsuarios();

        }

// =======================
// MENSAJE NORMAL
// =======================

        if (mensaje.tipo === "mensaje") {

            // VALIDACIÓN
            if (
                !mensaje.usuario ||
                !mensaje.texto
            ) {
                return;
            }

            // LIMITAR TAMAÑO
            if (mensaje.texto.length > 500) {
                return;
            }

            // GUARDAR SQLITE
            guardarMensaje(
                mensaje.usuario,
                mensaje.texto
            );

            // ENVIAR A TODOS
            usuarios.forEach((u) => {

                if (
                    u.socket.readyState ===
                    WebSocket.OPEN
                ) {

                    u.socket.send(JSON.stringify({
                        tipo: "mensaje",
                        usuario: mensaje.usuario,
                        texto: mensaje.texto
                    }));

                }

            });

        }

    });

// =======================
// DESCONECTAR
// =======================

    ws.on("close", () => {

        usuarios = usuarios.filter(
            u => u.socket !== ws
        );

        console.log("Usuario desconectado");

        actualizarUsuarios();

    });

});

// =======================
// ACTUALIZAR USUARIOS
// =======================

function actualizarUsuarios() {

    const listaUsuarios =
        usuarios.map(u => u.nombre);

    usuarios.forEach((u) => {

        if (
            u.socket.readyState ===
            WebSocket.OPEN
        ) {

            u.socket.send(JSON.stringify({
                tipo: "usuarios",
                usuarios: listaUsuarios
            }));

        }

    });

}

// =======================
// INICIAR SERVIDOR
// =======================

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {

    console.log(
        `Servidor iniciado en puerto ${PORT}`
    );

});