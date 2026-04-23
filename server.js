// ==============================================
// 📦 IMPORTACIONES Y CONFIGURACIÓN INICIAL
// ==============================================
const express = require('express');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para leer JSON en las peticiones
app.use(express.json());

// Configuración de PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'happiness_db',
  password: '123456',
  port: 5432
});

// ==============================================
// 🏠 RUTA DE PRUEBA
// ==============================================
app.get('/', (req, res) => {
  res.send('✅ API funcionando correctamente');
});

// ==============================================
// 👥 RUTAS PARA LA TABLA "alumno"
// ==============================================

// GET: Obtener todos los alumnos
app.get('/alumnos', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM alumno ORDER BY id');
    res.json(resultado.rows);
  } catch (error) {
    console.error('❌ Error GET /alumnos:', error);
    res.status(500).json({ error: 'Error al obtener los alumnos' });
  }
});

// GET: Obtener un alumno por ID (✅ NUEVO - Actividad)
app.get('/alumnos/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validación: ID debe ser numérico
    if (isNaN(id)) {
      return res.status(400).json({ error: 'El id debe ser numérico' });
    }

    const resultado = await pool.query(
      'SELECT * FROM alumno WHERE id = $1',
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'Alumno no encontrado' });
    }

    res.json(resultado.rows[0]);
  } catch (error) {
    console.error('❌ Error GET /alumnos/:id:', error);
    res.status(500).json({ error: 'Error al obtener el alumno' });
  }
});

// POST: Insertar nuevo alumno
app.post('/alumnos', async (req, res) => {
  try {
    const { nombre, apellido, edad, correo } = req.body;

    if (!nombre || !apellido || !edad || !correo) {
      return res.status(400).json({ 
        error: 'Todos los campos son obligatorios: nombre, apellido, edad, correo' 
      });
    }

    const resultado = await pool.query(
      'INSERT INTO alumno (nombre, apellido, edad, correo) VALUES ($1, $2, $3, $4) RETURNING *',
      [nombre, apellido, edad, correo]
    );

    res.status(201).json({
      mensaje: 'Alumno insertado correctamente',
      alumno: resultado.rows[0]
    });

  } catch (error) {
    console.error('❌ Error POST /alumnos:', error);
    if (error.code === '23505') {
      return res.status(409).json({ error: 'El correo ya está registrado' });
    }
    res.status(500).json({ error: 'Error interno al insertar el alumno' });
  }
});

// ==============================================
// 📚 RUTAS PARA LA TABLA "materia"
// ==============================================

// GET: Obtener todas las materias
app.get('/materias', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM materia ORDER BY id');
    res.json(resultado.rows);
  } catch (error) {
    console.error('❌ Error GET /materias:', error);
    res.status(500).json({ error: 'Error al obtener las materias' });
  }
});

// GET: Obtener una materia por ID (✅ NUEVO - Actividad)
app.get('/materias/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validación: ID debe ser numérico
    if (isNaN(id)) {
      return res.status(400).json({ error: 'El id debe ser numérico' });
    }

    const resultado = await pool.query(
      'SELECT * FROM materia WHERE id = $1',
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'Materia no encontrada' });
    }

    res.json(resultado.rows[0]);
  } catch (error) {
    console.error('❌ Error GET /materias/:id:', error);
    res.status(500).json({ error: 'Error al obtener la materia' });
  }
});

// POST: Insertar nueva materia
app.post('/materias', async (req, res) => {
  const { nombre, semestre, creditos } = req.body;

  if (!nombre || semestre === undefined || semestre === null || creditos === undefined || creditos === null) {
    return res.status(400).json({ 
      error: 'Faltan campos obligatorios: nombre, semestre y creditos' 
    });
  }

  try {
    const query = `
      INSERT INTO materia (nombre, semestre, creditos)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const resultado = await pool.query(query, [nombre, parseInt(semestre), parseInt(creditos)]);
    
    res.status(201).json({ 
      mensaje: 'Materia registrada correctamente',
      materia: resultado.rows[0]
    });

  } catch (error) {
    console.error('❌ Error POST /materias:', error);
    res.status(500).json({ error: 'Error al guardar la materia' });
  }
});

// ==============================================
// 🚀 INICIAR SERVIDOR
// ==============================================
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📌 Rutas disponibles:`);
  console.log(`   • GET  /alumnos      → Todos los alumnos`);
  console.log(`   • GET  /alumnos/:id  → Alumno por ID`);
  console.log(`   • POST /alumnos      → Insertar alumno`);
  console.log(`   • GET  /materias     → Todas las materias`);
  console.log(`   • GET  /materias/:id → Materia por ID`);
  console.log(`   • POST /materias     → Insertar materia`);
});