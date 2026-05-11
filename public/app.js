
// ===============================
// LOGIN
// ===============================

function entrarChat() {

    let nombre = document.getElementById("nombre").value.trim();

    // SI ESTA VACIO
    if (nombre === "") {

        nombre = "Usuario_" + Math.floor(100 + Math.random() * 900);

    }

    // GUARDAR USUARIO
    sessionStorage.setItem("usuario", nombre);

    // IR AL CHAT
    window.location.href = "chat.html";

}


// ===============================
// CHAT
// ===============================

document.addEventListener("DOMContentLoaded", () => {

    // SOLO CHAT
    if (!window.location.pathname.includes("chat.html")) {

        return;

    }

    // OBTENER USUARIO
    const usuario = sessionStorage.getItem("usuario");

    // SI NO EXISTE
    if (!usuario) {

        window.location.href = "login.html";

        return;

    }

    // MOSTRAR USUARIO ARRIBA
    const usuarioNombre = document.getElementById("usuarioNombre");

    usuarioNombre.innerText = usuario;

    // ELEMENTOS
    const input = document.querySelector(".chat-input input");

    const boton = document.querySelector(".chat-input button");

    const messages = document.querySelector(".messages");

    const sidebar = document.querySelector(".sidebar");

    // SOCKET
    const socket = new WebSocket("ws://localhost:3000");

    // ===============================
    // CONECTAR
    // ===============================

    socket.onopen = () => {

        console.log("Conectado");

        socket.send(JSON.stringify({

            tipo: "nuevo_usuario",

            usuario: usuario

        }));

    };

    // ===============================
    // RECIBIR MENSAJES
    // ===============================

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

    // ===============================
    // ENVIAR MENSAJE
    // ===============================

    function enviarMensaje() {

        const texto = input.value.trim();

        // VACIO
        if (texto === "") {

            return;

        }

        // ENVIAR
        socket.send(JSON.stringify({

            tipo: "mensaje",

            usuario: usuario,

            texto: texto

        }));

        // LIMPIAR
        input.value = "";

    }

    // BOTON
    boton.addEventListener("click", () => {

        enviarMensaje();

    });

    // ENTER
    input.addEventListener("keydown", (e) => {

        if (e.key === "Enter") {

            enviarMensaje();

        }

    });

});