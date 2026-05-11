
// =======================================
// CONEXIÓN WEBSOCKET
// =======================================

const socket = new WebSocket("ws://localhost:3000");

// =======================================
// USUARIO AUTOMÁTICO
// =======================================

const username = "Usuario_" + Math.floor(Math.random() * 1000);

console.log("Nombre asignado:", username);



console.log("Intentando conectar al servidor...");


// =======================================
// CONEXIÓN EXITOSA
// =======================================

socket.onopen = () => {

    console.log("Conectado al servidor WebSocket");

    // Avisar conexión
    socket.send(username + " se unió al chat");

};


// =======================================
// RECIBIR MENSAJES
// =======================================

socket.onmessage = (event) => {

    // Crear elemento HTML
    const messageElement = document.createElement("div");

    // Agregar contenido
    messageElement.textContent = event.data;

    // Mostrar mensaje en pantalla
    messagesContainer.appendChild(messageElement);

};



// =======================================
// ELEMENTOS HTML
// =======================================

const messageInput = document.getElementById("messageInput");

const sendButton = document.getElementById("sendButton");
// =======================================
// ENVIAR CON ENTER
// =======================================

messageInput.addEventListener("keypress", (event) => {

    if (event.key === "Enter") {

        sendMessage();

    }

});



const messagesContainer = document.getElementById("messages");


// =======================================
// ENVIAR MENSAJE
// =======================================

function sendMessage() {

    // Obtener texto escrito
    const message = messageInput.value.trim();

    // Validar mensaje vacío
    if (message === "") {
        return;
    }

    // Enviar mensaje al servidor
    socket.send(username + ": " + message);

    // Limpiar input
    messageInput.value = "";
}

// =======================================
// BOTÓN ENVIAR
// =======================================

sendButton.addEventListener("click", sendMessage);

// =======================================
// DESCONEXIÓN
// =======================================

window.addEventListener("beforeunload", () => {

   const time = new Date().toLocaleTimeString();

socket.send("[" + time + "] " + username + ": " + message);

});

// =======================
// LOGIN
// =======================

function entrarChat() {

    let nombre = document.getElementById("nombre")?.value.trim();

    // SI ESTA VACIO
    if (nombre === "") {

        nombre = "Usuario_" + Math.floor(100 + Math.random() * 900);

    }

    // GUARDAR USUARIO POR PESTAÑA
    sessionStorage.setItem("usuario", nombre);

    // IR AL CHAT
    window.location.href = "chat.html";

}


// =======================
// CHAT
// =======================

document.addEventListener("DOMContentLoaded", () => {

    // SOLO EN CHAT
    if (!window.location.pathname.includes("chat.html")) return;

    // OBTENER USUARIO
    const usuario = sessionStorage.getItem("usuario");

    // SI NO EXISTE
    if (!usuario) {

        window.location.href = "login.html";

        return;

    }

    // MOSTRAR NOMBRE ARRIBA
    document.getElementById("usuarioNombre").innerText = usuario;

    // ELEMENTOS
    const input = document.querySelector(".chat-input input");

    const boton = document.querySelector(".chat-input button");

    const messages = document.querySelector(".messages");

    const sidebar = document.querySelector(".sidebar");

    // CONEXION WEBSOCKET
    const socket = new WebSocket("ws://localhost:3000");

    // CONECTAR
    socket.onopen = () => {

        socket.send(JSON.stringify({

            tipo: "nuevo_usuario",
            usuario: usuario

        }));

    };

    // RECIBIR DATOS
    socket.onmessage = (event) => {

        const data = JSON.parse(event.data);

        // MENSAJE SISTEMA
        if (data.tipo === "sistema") {

            messages.innerHTML += `

                <div class="system-message">
                    ${data.texto}
                </div>

            `;

        }

        // MENSAJE NORMAL
        if (data.tipo === "mensaje") {

            messages.innerHTML += `

            <div class="message">

                <div class="avatar purple">👤</div>

                <div class="message-content">

                    <div class="username purple-name">

                        ${data.usuario}

                    </div>

                    <div class="msg-box purple-box">

                        <p>${data.texto}</p>

                    </div>

                    <div class="time">

                        ${data.hora}

                    </div>

                </div>

            </div>

            `;

        }

        // USUARIOS CONECTADOS
        if (data.tipo === "usuarios") {

            let html = `

                <h2>Usuarios conectados</h2>

            `;

            data.lista.forEach(user => {

                html += `

                <div class="user">

                    <div class="user-left">

                        <div class="avatar green">👤</div>

                        <span>${user}</span>

                    </div>

                    <div class="status active"></div>

                </div>

                `;

            });

            sidebar.innerHTML = html;

        }

        // AUTO SCROLL
        messages.scrollTop = messages.scrollHeight;

    };

    // ENVIAR MENSAJE
    function enviarMensaje() {

        const texto = input.value.trim();

        if (texto === "") return;

        socket.send(JSON.stringify({

            tipo: "mensaje",
            usuario: usuario,
            texto: texto

        }));

        input.value = "";

    }

    // BOTON
    boton.addEventListener("click", enviarMensaje);

    // ENTER
    input.addEventListener("keydown", (e) => {

        if (e.key === "Enter") {

            enviarMensaje();

        }

    });

});

