// server.js - Servidor Express con ruta /alumnos
const express = require('express');
const pool = require('./db');  // Importamos la conexión a PostgreSQL
const app = express();
const PORT = 3000;

// Middleware para que Express entienda JSON
app.use(express.json());

// Ruta principal de prueba
app.get('/', (req, res) => {
    res.send('API funcionando correctamente');
});

// Ruta para obtener TODOS los alumnos (el SELECT que pide la actividad)
app.get('/alumnos', async (req, res) => {
    try {
        // Consulta SQL para traer todos los alumnos
        const resultado = await pool.query('SELECT * FROM alumno');
        
        // Enviamos los resultados como JSON
        res.json(resultado.rows);
    } catch (error) {
        console.error('Error al consultar alumnos:', error);
        res.status(500).json({ error: 'Error al obtener los alumnos' });
    }
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log(`Prueba la ruta: http://localhost:${PORT}/alumnos`);
});