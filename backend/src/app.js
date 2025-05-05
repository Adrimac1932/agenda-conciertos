const express = require('express');
const cors    = require('cors');
const knex    = require('knex');

// Configuración de la base de datos SQLite con Knex
const db = knex({
  client: 'sqlite3',
  connection: { filename: './src/concerts.db' },
  useNullAsDefault: true
});

const app = express();
app.use(cors());
app.use(express.json());

// Inicialización de tablas si no existen
async function initDb() {
  if (!(await db.schema.hasTable('artists'))) {
    await db.schema.createTable('artists', t => {
      t.increments('id').primary();
      t.string('name').notNullable();
      t.string('genre');
      t.string('website');
    });
    console.log('🛠 Tabla artists creada');
  }
  if (!(await db.schema.hasTable('events'))) {
    await db.schema.createTable('events', t => {
      t.increments('id').primary();
      t.integer('artist_id')
        .notNullable()
        .references('id').inTable('artists')
        .onDelete('CASCADE');
      t.string('name').notNullable();
      t.string('date').notNullable();
      t.string('location');
      t.float('price');
    });
    console.log('🛠 Tabla events creada');
  }
}

initDb()
  .then(() => console.log('✅ Base de datos lista'))
  .catch(err => console.error('❌ Error al inicializar BD', err));

// -------------------- CRUD ARTISTS --------------------

app.get('/artists', async (req, res) => {
  try {
    const list = await db('artists').select('*');
    res.json(list);
  } catch (err) {
    console.error('Error al leer artistas:', err);
    res.status(500).json({ error: 'Error al leer artistas' });
  }
});

app.get('/artists/:id', async (req, res) => {
  try {
    const art = await db('artists').where({ id: req.params.id }).first();
    if (!art) return res.status(404).json({ error: 'Artista no encontrado' });
    res.json(art);
  } catch (err) {
    console.error('Error al leer artista:', err);
    res.status(500).json({ error: 'Error al leer artista' });
  }
});

app.post('/artists', async (req, res) => {
  try {
    const [id] = await db('artists').insert({
      name:    req.body.name,
      genre:   req.body.genre,
      website: req.body.website
    });
    res.status(201).json({ id });
  } catch (err) {
    console.error('Error al crear artista:', err);
    res.status(500).json({ error: 'Error al crear artista' });
  }
});

app.put('/artists/:id', async (req, res) => {
  try {
    const count = await db('artists')
      .where({ id: req.params.id })
      .update({
        name:    req.body.name,
        genre:   req.body.genre,
        website: req.body.website
      });
    if (count === 0) return res.status(404).json({ error: 'Artista no encontrado' });
    res.status(204).end();
  } catch (err) {
    console.error('Error al actualizar artista:', err);
    res.status(500).json({ error: 'Error al actualizar artista' });
  }
});

app.delete('/artists/:id', async (req, res) => {
  try {
    const count = await db('artists').where({ id: req.params.id }).del();
    if (count === 0) return res.status(404).json({ error: 'Artista no encontrado' });
    res.status(204).end();
  } catch (err) {
    console.error('Error al eliminar artista:', err);
    res.status(500).json({ error: 'Error al eliminar artista' });
  }
});

// -------------------- CRUD EVENTS --------------------

// 1) Listar todos los eventos
app.get('/events', async (req, res) => {
  try {
    const list = await db('events')
      .join('artists', 'events.artist_id', 'artists.id')
      .select(
        'events.id',
        'events.name as event_name',
        'events.date',
        'events.location',
        'events.price',
        'artists.id   as artist_id',
        'artists.name as artist_name'
      );
    res.json(list);
  } catch (err) {
    console.error('Error al leer eventos:', err);
    res.status(500).json({ error: 'Error al leer eventos' });
  }
});

// 2) Obtener un evento por ID
app.get('/events/:id', async (req, res) => {
  try {
    const ev = await db('events')
      .where('events.id', req.params.id)
      .join('artists', 'events.artist_id', 'artists.id')
      .select(
        'events.id',
        'events.name as event_name',
        'events.date',
        'events.location',
        'events.price',
        'artists.id   as artist_id',
        'artists.name as artist_name'
      )
      .first();
    if (!ev) return res.status(404).json({ error: 'Evento no encontrado' });
    res.json(ev);
  } catch (err) {
    console.error('Error al leer evento:', err);
    res.status(500).json({ error: 'Error al leer evento' });
  }
});

// 3) Crear un evento
app.post('/events', async (req, res) => {
  try {
    const [id] = await db('events').insert({
      artist_id: req.body.artist_id,
      name:      req.body.name,
      date:      req.body.date,
      location:  req.body.location,
      price:     req.body.price
    });
    res.status(201).json({ id });
  } catch (err) {
    console.error('Error al crear evento:', err);
    res.status(500).json({ error: 'Error al crear evento' });
  }
});

// 4) Actualizar un evento
app.put('/events/:id', async (req, res) => {
  try {
    const count = await db('events')
      .where({ id: req.params.id })
      .update({
        artist_id: req.body.artist_id,
        name:      req.body.name,
        date:      req.body.date,
        location:  req.body.location,
        price:     req.body.price
      });
    if (count === 0) return res.status(404).json({ error: 'Evento no encontrado' });
    res.status(204).end();
  } catch (err) {
    console.error('Error al actualizar evento:', err);
    res.status(500).json({ error: 'Error al actualizar evento' });
  }
});

// 5) Eliminar un evento
app.delete('/events/:id', async (req, res) => {
  try {
    const count = await db('events').where({ id: req.params.id }).del();
    if (count === 0) return res.status(404).json({ error: 'Evento no encontrado' });
    res.status(204).end();
  } catch (err) {
    console.error('Error al eliminar evento:', err);
    res.status(500).json({ error: 'Error al eliminar evento' });
  }
});

// Arrancar servidor
const PORT = 8081;
app.listen(PORT, () => {
  console.log(`✔️  Backend escuchando en http://localhost:${PORT}`);
});
