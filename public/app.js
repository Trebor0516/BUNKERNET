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
