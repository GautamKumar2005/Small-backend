const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.json());

// Stage 0: Create database and table
const dbPath = path.join(__dirname, 'tasks.db');
const db = new Database(dbPath);

// Create table with optional extra (created_at, updated_at)
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    done BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Insert three example tasks only if the table is empty
const countStmt = db.prepare('SELECT COUNT(*) AS count FROM tasks');
const { count } = countStmt.get();

if (count === 0) {
  const insert = db.prepare('INSERT INTO tasks (title, done) VALUES (?, ?)');
  insert.run('Buy groceries', 0);
  insert.run('Read a book', 1);
  insert.run('Complete backend assignment', 0);
}

// RESTful API Endpoints

// GET /tasks
// Optional extras included: search, done filter, and ordered by title
app.get('/tasks', (req, res) => {
  let query = 'SELECT * FROM tasks WHERE 1=1';
  const params = [];

  // Filter completed tasks
  if (req.query.done !== undefined) {
    query += ' AND done = ?';
    params.push(req.query.done === 'true' ? 1 : 0);
  }

  // Search using SQL
  if (req.query.search) {
    query += ' AND title LIKE ?';
    params.push(`%${req.query.search}%`);
  }

  // Sort alphabetically
  query += ' ORDER BY title ASC';

  const stmt = db.prepare(query);
  const tasks = stmt.all(...params);

  // Convert SQLite integer boolean (0,1) back to true/false for JSON
  const formattedTasks = tasks.map(task => ({
    ...task,
    done: Boolean(task.done)
  }));

  res.json(formattedTasks);
});

// GET /stats (Optional extra)
app.get('/stats', (req, res) => {
  const stmt = db.prepare('SELECT COUNT(*) AS count FROM tasks');
  const result = stmt.get();
  res.json({ total_tasks: result.count });
});

// GET /tasks/:id
app.get('/tasks/:id', (req, res) => {
  const stmt = db.prepare('SELECT * FROM tasks WHERE id = ?');
  const task = stmt.get(req.params.id);

  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  task.done = Boolean(task.done);
  res.json(task);
});

// POST /tasks
app.post('/tasks', (req, res) => {
  const { title, done } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Missing title' });
  }

  const isDone = done === true ? 1 : 0;
  const insertStmt = db.prepare('INSERT INTO tasks (title, done) VALUES (?, ?)');
  const info = insertStmt.run(title, isDone);

  const getStmt = db.prepare('SELECT * FROM tasks WHERE id = ?');
  const newTask = getStmt.get(info.lastInsertRowid);
  
  newTask.done = Boolean(newTask.done);

  res.status(201).json(newTask);
});

// PUT /tasks/:id
app.put('/tasks/:id', (req, res) => {
  const id = req.params.id;
  const { title, done } = req.body;

  // Check if task exists
  const getStmt = db.prepare('SELECT * FROM tasks WHERE id = ?');
  const task = getStmt.get(id);

  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  let updateQuery = 'UPDATE tasks SET updated_at = CURRENT_TIMESTAMP';
  const params = [];

  if (title !== undefined) {
    updateQuery += ', title = ?';
    params.push(title);
  }

  if (done !== undefined) {
    updateQuery += ', done = ?';
    params.push(done === true ? 1 : 0);
  }

  updateQuery += ' WHERE id = ?';
  params.push(id);

  const updateStmt = db.prepare(updateQuery);
  updateStmt.run(...params);

  const updatedTask = getStmt.get(id);
  updatedTask.done = Boolean(updatedTask.done);
  
  res.json(updatedTask);
});

// DELETE /tasks/:id
app.delete('/tasks/:id', (req, res) => {
  const id = req.params.id;
  
  const getStmt = db.prepare('SELECT * FROM tasks WHERE id = ?');
  const task = getStmt.get(id);

  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const deleteStmt = db.prepare('DELETE FROM tasks WHERE id = ?');
  deleteStmt.run(id);

  res.json({ message: 'Task deleted successfully' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
