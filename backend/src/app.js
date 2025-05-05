const express = require('express');
const cors    = require('cors');
const knex    = require('knex');

const db = knex({
    client: 'sqlite3',
    connection: { filename: './src/concerts.db' },
    useNullAsDefault: true
  });

const app = express();
app.use(cors());
app.use(express.json());

//Inicialización de la base de datos

async function initDb() {
    if (!(await db.schema.hasTable('artists'))) {
      await db.schema.createTable('artists', t => {
        t.increments('id').primary();
        t.string('name').notNullable();
        t.string('genre');
        t.string('website');
      });
      console.log('Tabla artists creada');
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
  .then(() => console.log('Base de datos lista'))
  .catch(err => console.error('Error al inicializar BD', err));

//RUTAS CRUD PARA ARTISTS
// Listar todos los artistas
app.get('/artists', async (req, res) => {
    const list = await db('artists').select('*');
    res.json(list);
  });
  
  // Obtener un artista por ID
  app.get('/artists/:id', async (req, res) => {
    const art = await db('artists').where({ id: req.params.id }).first();
    if (!art) return res.status(404).json({ error: 'Artist not found' });
    res.json(art);
  });
  
  // Crear un artista
  app.post('/artists', async (req, res) => {
    const [id] = await db('artists').insert({
      name:    req.body.name,
      genre:   req.body.genre,
      website: req.body.website
    });
    res.status(201).json({ id });
  });
  
  // Actualizar un artista
  app.put('/artists/:id', async (req, res) => {
    const count = await db('artists')
      .where({ id: req.params.id })
      .update({
        name:    req.body.name,
        genre:   req.body.genre,
        website: req.body.website
      });
    if (count === 0) return res.status(404).json({ error: 'Artist not found' });
    res.status(204).end();
  });
  
  // Eliminar un artista
  app.delete('/artists/:id', async (req, res) => {
    const count = await db('artists').where({ id: req.params.id }).del();
    if (count === 0) return res.status(404).json({ error: 'Artist not found' });
    res.status(204).end();
  });
  
//RUTAS CRUD PARA EVENTS
// Listar todos los eventos (con JOIN para tener nombre de artista)
app.get('/events', async (req, res) => {
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
  });
  
  // Obtener un evento por ID
  app.get('/events/:id', async (req, res) => {
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
    if (!ev) return res.status(404).json({ error: 'Event not found' });
    res.json(ev);
  });
  
  // Crear un evento
  app.post('/events', async (req, res) => {
    const [id] = await db('events').insert({
      artist_id: req.body.artist_id,
      name:      req.body.name,
      date:      req.body.date,
      location:  req.body.location,
      price:     req.body.price
    });
    res.status(201).json({ id });
  });
  
  // Actualizar un evento
  app.put('/events/:id', async (req, res) => {
    const count = await db('events')
      .where({ id: req.params.id })
      .update({
        artist_id: req.body.artist_id,
        name:      req.body.name,
        date:      req.body.date,
        location:  req.body.location,
        price:     req.body.price
      });
    if (count === 0) return res.status(404).json({ error: 'Event not found' });
    res.status(204).end();
  });
  
  // Eliminar un evento
  app.delete('/events/:id', async (req, res) => {
    const count = await db('events').where({ id: req.params.id }).del();
    if (count === 0) return res.status(404).json({ error: 'Event not found' });
    res.status(204).end();
  });
  
  // 4) Arrancar el servidor en el puerto 8081
  const PORT = 8081;
  app.listen(PORT, () => {
    console.log(`✔️  Backend escuchando en http://localhost:${PORT}`);
  });
