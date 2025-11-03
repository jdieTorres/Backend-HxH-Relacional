import express from "express";
import cors from "cors";
import pkg from "pg";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;
const app = express();

app.use(cors());
app.use(express.json());

// Conexión a PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool.connect()
  .then(() => console.log("Conectado a PostgreSQL"))
  .catch(err => console.error("Error de conexión:", err));

// Swagger Configuración
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "HunterxAPI PostgreSQL",
      version: "1.0.0",
      description: "API para gestionar personajes del universo de Hunter x Hunter en PostgreSQL",
    },
    servers: [
      {
        url: "https://backend-hxh-relacional.onrender.com/",
        description: "Servidor en Render",
      },
    ],
  },
  apis: ["./server-r.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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
 *                     example: 157
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
app.get("/personajes", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM personajes");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(503).json({ error: "Error al obtener los datos" });
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
 *       404:
 *         description: Personaje no encontrado
 */
app.get("/personajes/:nombre", async (req, res) => {
  try {
    const { nombre } = req.params;
    const result = await pool.query(
      "SELECT * FROM personajes WHERE LOWER(nombre) = LOWER($1)",
      [nombre]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Personaje no encontrado" });

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(503).json({ error: "Error al obtener el personaje" });
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
 *                 example: 158
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
app.post("/personajes", async (req, res) => {
  try {
    const { nombre, edad, altura, peso, color_ojos, color_cabello, estado, imagen } = req.body;

    if (!nombre)
      return res.status(400).json({ error: "Falta el nombre obligatorio" });

    await pool.query(
      `INSERT INTO personajes (nombre, edad, altura, peso, color_ojos, color_cabello, estado, imagen)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [nombre, edad, altura, peso, color_ojos, color_cabello, estado, imagen]
    );

    res.status(201).json({ mensaje: "Personaje agregado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(503).json({ error: "Error al agregar personaje" });
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
 *                 example: 159
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
app.put("/personajes/:nombre", async (req, res) => {
  try {
    const { nombre } = req.params;
    const { edad, altura, peso, color_ojos, color_cabello, estado, imagen } = req.body;

    const result = await pool.query(
      `UPDATE personajes
       SET edad=$1, altura=$2, peso=$3, color_ojos=$4, color_cabello=$5, estado=$6, imagen=$7
       WHERE LOWER(nombre) = LOWER($8)`,
      [edad, altura, peso, color_ojos, color_cabello, estado, imagen, nombre]
    );

    if (result.rowCount === 0)
      return res.status(404).json({ error: "Personaje no encontrado" });

    res.json({ mensaje: "Personaje actualizado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(503).json({ error: "Error al actualizar personaje" });
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
app.delete("/personajes/:nombre", async (req, res) => {
  try {
    const { nombre } = req.params;
    const result = await pool.query(
      "DELETE FROM personajes WHERE LOWER(nombre) = LOWER($1)",
      [nombre]
    );

    if (result.rowCount === 0)
      return res.status(404).json({ error: "Personaje no encontrado" });

    res.json({ mensaje: "Personaje eliminado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(503).json({ error: "Error al eliminar personaje" });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en https://backend-hxh-relacional.onrender.com/`);
});






