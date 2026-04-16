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

// Ruta para obtener TODOS los alumnos (GET)
app.get('/alumnos', async (req, res) => {
    try {
        const resultado = await pool.query('SELECT * FROM alumno ORDER BY id');
        res.json(resultado.rows);
    } catch (error) {
        console.error('Error al consultar alumnos:', error);
        res.status(500).json({ error: 'Error al obtener los alumnos' });
    }
});

// ==============================================
// 👇 NUEVA RUTA POST - INSERTAR ALUMNOS (PASO 3)
// ==============================================
app.post('/alumnos', async (req, res) => {
    try {
        // 1. Obtener los datos del cuerpo de la petición
        const { nombre, apellido, edad, correo } = req.body;

        // 2. Validar que todos los campos estén presentes
        if (!nombre || !apellido || !edad || !correo) {
            return res.status(400).json({ 
                error: 'Todos los campos son obligatorios: nombre, apellido, edad, correo' 
            });
        }

        // 3. Insertar el nuevo alumno en la base de datos
        const resultado = await pool.query(
            'INSERT INTO alumno (nombre, apellido, edad, correo) VALUES ($1, $2, $3, $4) RETURNING *',
            [nombre, apellido, edad, correo]
        );

        // 4. Responder con éxito (código 201 = Creado)
        res.status(201).json({
            mensaje: 'Alumno insertado correctamente',
            alumno: resultado.rows[0]
        });

    } catch (error) {
        console.error('Error al insertar alumno:', error);
        
        // Si el error es por correo duplicado (código 23505 de PostgreSQL)
        if (error.code === '23505') {
            return res.status(409).json({ 
                error: 'El correo ya está registrado. Usa otro correo.' 
            });
        }
        
        res.status(500).json({ error: 'Error interno al insertar el alumno' });
    }
});
// ==============================================
// 👆 FIN DE LA RUTA POST
// ==============================================

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log(`Prueba la ruta GET: http://localhost:${PORT}/alumnos`);
    console.log(`Prueba la ruta POST: http://localhost:${PORT}/alumnos (usando Postman)`);
});