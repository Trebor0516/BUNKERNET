
// ===============================
// FIREBASE
// ===============================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {

    getAuth,
    GoogleAuthProvider,
    signInWithPopup

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


// ===============================
// CONFIG FIREBASE
// ===============================

const firebaseConfig = {

    apiKey: "AIzaSyCAY-DfecKMiv3S_sOefx7wj44vykktpUc",

    authDomain: "bunkernet-507ad.firebaseapp.com",

    projectId: "bunkernet-507ad",

    storageBucket: "bunkernet-507ad.firebasestorage.app",

    messagingSenderId: "153333768955",

    appId: "1:153333768955:web:8ca609340ba2b28f17465e"

};


// ===============================
// INICIAR FIREBASE
// ===============================

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const provider = new GoogleAuthProvider();


// ===============================
// LOGIN MANUAL
// ===============================

window.entrarChat = function () {

    let nombre = document.getElementById("nombre")?.value.trim();

    // SI ESTA VACIO
    if (!nombre || nombre === "") {

        nombre = "Usuario_" + Math.floor(100 + Math.random() * 900);

    }

    // GUARDAR USUARIO
    sessionStorage.setItem("usuario", nombre);

    // REDIRIGIR
    window.location.href = "chat.html";

};


// ===============================
// LOGIN GOOGLE
// ===============================

window.loginGoogle = function () {

    signInWithPopup(auth, provider)

    .then((result) => {

        const user = result.user;

        // GUARDAR
        sessionStorage.setItem("usuario", user.displayName);

        // REDIRIGIR
        window.location.href = "chat.html";

    })

    .catch((error) => {

        console.log(error);

        alert("Error al iniciar sesión con Google");

    });

};


// ===============================
// CHAT
// ===============================

document.addEventListener("DOMContentLoaded", () => {

    // SOLO CHAT
    if (!window.location.pathname.includes("chat.html")) {

        return;

    }

    // USUARIO
    const usuario = sessionStorage.getItem("usuario");

    // SI NO EXISTE
    if (!usuario) {

        window.location.href = "login.html";

        return;

    }

    // MOSTRAR USUARIO
    document.getElementById("usuarioNombre").innerText = usuario;

    // ELEMENTOS
    const input = document.querySelector(".chat-input input");

    const boton = document.querySelector(".chat-input button");

    const messages = document.querySelector(".messages");

    const sidebar = document.querySelector(".sidebar");

    // ===============================
    // COLORES
    // ===============================

    const colores = [

        "purple",
        "green",
        "orange",
        "blue",
        "red",
        "pink"

    ];

    // ===============================
    // OBTENER COLOR
    // ===============================

    function obtenerColor(usuario) {

        let suma = 0;

        for (let i = 0; i < usuario.length; i++) {

            suma += usuario.charCodeAt(i);

        }

        return colores[suma % colores.length];

    }

    // ===============================
    // WEBSOCKET
    // ===============================

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

        // ===============================
        // SISTEMA
        // ===============================

        if (data.tipo === "sistema") {

            messages.innerHTML += `

                <div class="system-message">

                    ${data.texto}

                </div>

            `;

        }

        // ===============================
        // MENSAJE NORMAL
        // ===============================

        if (data.tipo === "mensaje") {

            const color = obtenerColor(data.usuario);

            messages.innerHTML += `

                <div class="message">

                    <div class="avatar ${color}">👤</div>

                    <div class="message-content">

                        <div class="username ${color}-name">

                            ${data.usuario}

                        </div>

                        <div class="msg-box ${color}-box">

                            <p>${data.texto}</p>

                        </div>

                        <div class="time">

                            ${data.hora}

                        </div>

                    </div>

                </div>

            `;

        }

        // ===============================
        // USUARIOS CONECTADOS
        // ===============================

        if (data.tipo === "usuarios") {

            let html = `

                <h2>Usuarios conectados</h2>

            `;

            data.lista.forEach(user => {

                const color = obtenerColor(user);

                html += `

                    <div class="user">

                        <div class="user-left">

                            <div class="avatar ${color}">👤</div>

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
    // ERROR SOCKET
    // ===============================

    socket.onerror = (error) => {

        console.log("Error WebSocket:", error);

    };

    // ===============================
    // DESCONECTADO
    // ===============================

    socket.onclose = () => {

        console.log("Desconectado");

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

    // ===============================
    // BOTON
    // ===============================

    boton.addEventListener("click", enviarMensaje);

    // ===============================
    // ENTER
    // ===============================

    input.addEventListener("keydown", (e) => {

        if (e.key === "Enter") {

            enviarMensaje();

        }

    });

});