const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
app.use(bodyParser.json());

// !! IMPORTANTE !!
// O ECS injetará estas variáveis de ambiente automaticamente
// Nós vamos configurar o RDS para NÃO ter usuário/senha,
// e sim usar a autenticação IAM (LabRole), que é mais segura e funciona no Lab.
const pool = new Pool({
  host: process.env.DB_HOST,     // Virá do AWS
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'filmesdb',
  user: process.env.DB_USER,     // Virá do AWS
  password: process.env.DB_PASSWORD, // Virá do AWS
  ssl: {
    rejectUnauthorized: false // Necessário para RDS
  }
});

// Função para criar a tabela se não existir
const initializeDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS filmes (
        id SERIAL PRIMARY KEY,
        titulo VARCHAR(255) NOT NULL,
        diretor VARCHAR(255),
        ano INT,
        genero VARCHAR(100)
      );
    `);
    console.log("Tabela 'filmes' verificada/criada com sucesso.");
  } catch (err) {
    console.error("Erro ao inicializar o banco de dados:", err);
  }
};

// --- ROTAS CRUD ---

// CREATE
app.post('/filmes', async (req, res) => {
  const { titulo, diretor, ano, genero } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO filmes (titulo, diretor, ano, genero) VALUES ($1, $2, $3, $4) RETURNING *',
      [titulo, diretor, ano, genero]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ (All)
app.get('/filmes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM filmes ORDER BY id ASC');
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ (One)
app.get('/filmes/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM filmes WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Filme não encontrado' });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE
app.put('/filmes/:id', async (req, res) => {
  const { id } = req.params;
  const { titulo, diretor, ano, genero } = req.body;
  try {
    const result = await pool.query(
      'UPDATE filmes SET titulo = $1, diretor = $2, ano = $3, genero = $4 WHERE id = $5 RETURNING *',
      [titulo, diretor, ano, genero, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Filme não encontrado' });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE
app.delete('/filmes/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM filmes WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Filme não encontrado' });
    }
    res.status(200).json({ message: 'Filme deletado com sucesso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check para o Load Balancer
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// --- Iniciar Servidor ---
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`API de Filmes rodando na porta ${port}`);
  initializeDb();
});