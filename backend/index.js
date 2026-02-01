const express = require("express");
const cors = require("cors");
const {Pool} = require("pg"); //Conexión a la base de datos

const app = express();


// middlewares
app.use(cors());
app.use(express.json());


// conexión a la base de datos
const pool = new Pool({
  host: "localhost",
  user: "postgres",
  password: "1988",
  database: "likeme",
  port: 5432,
});


//test de conexión
pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("Error de conexión a la BD:", err);
  } else {
    console.log("Conectado a PostgresSQL:", res.rows[0]);
  }
});


// ruta de prueba
app.get("/", (req, res) => {
  res.send("Servidor Like Me funcionando 🚀");
});


//ruta GET 
app.get("/posts", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM posts");
    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener posts:", error);
    res.status(500).json({error: "Error al obtener posts"});
  }
});


//ruta POST
app.post("/posts", async (req, res) => {
  try {
    console.log("BODY ->", req.body);

    const {titulo, url, descripcion} = req.body;

    const query = 
      "INSERT INTO posts (titulo, img, descripcion, likes) VALUES ($1, $2, $3, 0) RETURNING *";

    const values = [titulo, url, descripcion];

    const {rows} = await pool.query(query, values);
    res.status(201).json (rows[0]);
  } catch (error) {
    console.error("Error al crear post:", error);
    res.status(500).json({error: "Error al crear post"});
  }
});

//PUT para likes
app.put("/posts/like/:id", async (req, res) => {
  try {
    const {id} = req.params;

    const query = 
      "UPDATE posts SET likes = likes + 1 WHERE id = $1 RETURNING *";

      const { rows} = await pool.query (query, [id]);
      res.json (rows[0]);
  } catch (error) {
    console.error ("Error al dar like:", error);
    res.status(500).json({error: "Error al dar like"});
  }
});


//ruta DELETE
app.delete("/posts/:id", async (req, res) => {
  try {
    const {id} = req.params;

    const query = "DELETE FROM posts WHERE id = $1";
    await pool.query(query, [id]);

    res.sendStatus(204);
  } catch (error) {
    console.error("Error al eliminar post:", error);
    res.status(500).json({error: "Error al eliminar post"});
  }
});


// levantar servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
