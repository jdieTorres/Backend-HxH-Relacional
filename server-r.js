import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

const app = express();
app.use(cors());
app.use(express.json());

const db = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'hunter',
});

// Swagger Configuración
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'HunterxAPI Relacional',
      version: '1.0.0',
      description: 'API para gestionar personajes del universo de Hunter x Hunter en una DB Relacional',
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Servidor local',
      },
    ],
  },
  apis: ['./server-r.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /personajes:
 *   get:
 *     summary: Obtiene todos los personajes
 *     tags: [Personajes]
 *     responses:
 *       200:
 *         description: Lista de personajes obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   nombre:
 *                     type: string
 *                     example: Gon Freecss
 *                   edad:
 *                     type: integer
 *                     example: 14
 *                   altura:
 *                     type: number
 *                     example: 1.57
 *                   peso:
 *                     type: number
 *                     example: 49
 *                   color_ojos:
 *                     type: string
 *                     example: Verde
 *                   color_cabello:
 *                     type: string
 *                     example: Negro
 *                   estado:
 *                     type: string
 *                     example: Vivo
 *                   imagen:
 *                     type: string
 *                     example: https://example.com/gon.jpg
 */
app.get('/personajes', async (req, res) => {
  try {

    const [rows] = await db.query('SELECT * FROM personajes');
    res.json(rows);

  } catch (error) {
    console.error(error);
    res.status(503).json({ error: 'Error al obtener los datos' });
  }
});

/**
 * @swagger
 * /personajes/{nombre}:
 *   get:
 *     summary: Obtiene un personaje por nombre
 *     tags: [Personajes]
 *     parameters:
 *       - in: path
 *         name: nombre
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre del personaje
 *     responses:
 *       200:
 *         description: Personaje encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 nombre:
 *                   type: string
 *                   example: Gon Freecss
 *                 edad:
 *                   type: integer
 *                   example: 14
 *                 altura:
 *                   type: number
 *                   example: 1.57
 *                 peso:
 *                   type: number
 *                   example: 49
 *                 color_ojos:
 *                   type: string
 *                   example: Verde
 *                 color_cabello:
 *                   type: string
 *                   example: Negro
 *                 estado:
 *                   type: string
 *                   example: Vivo
 *                 imagen:
 *                   type: string
 *                   example: https://example.com/gon.jpg
 *       404:
 *         description: Personaje no encontrado
 */
app.get('/personajes/:nombre', async (req, res) => {
  try {

    const { nombre } = req.params;
    const [rows] = await db.query('SELECT * FROM personajes WHERE LOWER(nombre) = LOWER(?)', [nombre]);

    if (rows.length === 0)
      return res.status(404).json({ error: 'Personaje no encontrado' });

    res.json(rows[0]);

  } catch (error) {

    console.error(error);
    res.status(503).json({ error: 'Error al obtener el personaje' });
  }
});

/**
 * @swagger
 * /personajes:
 *   post:
 *     summary: Crea un nuevo personaje
 *     tags: [Personajes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Killua Zoldyck
 *               edad:
 *                 type: integer
 *                 example: 14
 *               altura:
 *                 type: number
 *                 example: 1.58
 *               peso:
 *                 type: number
 *                 example: 49
 *               color_ojos:
 *                 type: string
 *                 example: Azul
 *               color_cabello:
 *                 type: string
 *                 example: Blanco
 *               estado:
 *                 type: string
 *                 example: Vivo
 *               imagen:
 *                 type: string
 *                 example: https://example.com/killua.jpg
 *     responses:
 *       201:
 *         description: Personaje agregado correctamente
 *       400:
 *         description: Falta el nombre obligatorio
 */
app.post('/personajes', async (req, res) => {
  try {

    const { nombre, edad, altura, peso, color_ojos, color_cabello, estado, imagen } = req.body;

    if (!nombre)
      return res.status(400).json({ error: 'Falta el nombre obligatorios' });

    await db.query(
      'INSERT INTO personajes (nombre, edad, altura, peso, color_ojos, color_cabello, estado, imagen) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [nombre, edad, altura, peso, color_ojos, color_cabello, estado, imagen]
    );

    res.status(201).json({ mensaje: 'Personaje agregado correctamente' });

  } catch (error) {

    console.error(error);
    res.status(503).json({ error: 'Error al agregar personaje' });
  }
});

/**
 * @swagger
 * /personajes/{nombre}:
 *   put:
 *     summary: Actualiza un personaje existente
 *     tags: [Personajes]
 *     parameters:
 *       - in: path
 *         name: nombre
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               edad:
 *                 type: integer
 *                 example: 15
 *               altura:
 *                 type: number
 *                 example: 1.59
 *               peso:
 *                 type: number
 *                 example: 50
 *               color_ojos:
 *                 type: string
 *                 example: Azul
 *               color_cabello:
 *                 type: string
 *                 example: Blanco
 *               estado:
 *                 type: string
 *                 example: Vivo
 *               imagen:
 *                 type: string
 *                 example: https://example.com/killua2.jpg
 *     responses:
 *       200:
 *         description: Personaje actualizado correctamente
 *       404:
 *         description: Personaje no encontrado
 */
app.put('/personajes/:nombre', async (req, res) => {
  try {

    const { nombre } = req.params;
    const { edad, altura, peso, color_ojos, color_cabello, estado, imagen } = req.body;

    const [result] = await db.query(
      `UPDATE personajes 
       SET edad=?, altura=?, peso=?, color_ojos=?, color_cabello=?, estado=?, imagen=? 
       WHERE LOWER(nombre) = LOWER(?)`,
      [edad, altura, peso, color_ojos, color_cabello, estado, imagen, nombre]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ error: 'Personaje no encontrado' });

    res.json({ mensaje: 'Personaje actualizado correctamente' });

  } catch (error) {

    console.error(error);
    res.status(503).json({ error: 'Error al actualizar personaje' });
  }
});

/**
 * @swagger
 * /personajes/{nombre}:
 *   delete:
 *     summary: Elimina un personaje
 *     tags: [Personajes]
 *     parameters:
 *       - in: path
 *         name: nombre
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Personaje eliminado correctamente
 *       404:
 *         description: Personaje no encontrado
 */
app.delete('/personajes/:nombre', async (req, res) => {
  try {

    const { nombre } = req.params;
    const [result] = await db.query('DELETE FROM personajes WHERE LOWER(nombre) = LOWER(?)', [nombre]);

    if (result.affectedRows === 0)
      return res.status(404).json({ error: 'Personaje no encontrado' });

    res.json({ mensaje: 'Personaje eliminado correctamente' });

  } catch (error) {

    console.error(error);
    res.status(503).json({ error: 'Error al eliminar personaje' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

