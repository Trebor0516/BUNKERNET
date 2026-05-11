const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Ruta de la base de datos
const dbPath = path.join(__dirname, '../data/chat.db');

// Conexión
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error conectando a SQLite:', err.message);
    } else {
        console.log('Base de datos conectada');
    }
});

// Crear tabla
db.run(`
    CREATE TABLE IF NOT EXISTS mensajes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario TEXT NOT NULL,
        mensaje TEXT NOT NULL,
        fecha DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

// Guardar mensaje
function guardarMensaje(usuario, mensaje) {
    db.run(
        `INSERT INTO mensajes (usuario, mensaje)
         VALUES (?, ?)`,
        [usuario, mensaje],
        (err) => {
            if (err) {
                console.error('Error guardando mensaje:', err.message);
            }
        }
    );
}

// Obtener historial
function obtenerMensajes(callback) {
    db.all(
        `SELECT * FROM mensajes
         ORDER BY fecha ASC`,
        [],
        (err, rows) => {
            if (err) {
                console.error('Error obteniendo mensajes:', err.message);
                callback([]);
            } else {
                callback(rows);
            }
        }
    );
}

// Exportar funciones
module.exports = {
    guardarMensaje,
    obtenerMensajes
};