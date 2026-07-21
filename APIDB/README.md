# W3 · A1 — Connecting CRUD to the database

This project replaces the in-memory array from the previous CRUD API assignment with a persistent **SQLite** database.

## Why SQLite was chosen
SQLite is a lightweight, file-based database that requires no separate server process. It is incredibly easy to set up and perfect for small applications, prototyping, and situations where you want data persistence without the overhead of configuring a full database server like PostgreSQL or MySQL.

## Where the database file is stored
The database is stored locally in the root directory of this project in a file named:
\`tasks.db\`

## How to start the project
1. Make sure you have Node.js installed.
2. Install the dependencies:
   \`\`\`bash
   npm install
   \`\`\`
3. Start the server:
   \`\`\`bash
   node index.js
   \`\`\`
   The server will run on \`http://localhost:3000\`. The database file (\`tasks.db\`) will be created automatically if it doesn't exist, and populated with example data on the first run.

## Screenshot of the database viewer
*(Please place your DB Browser for SQLite screenshot here)*
![DB Browser Screenshot](screenshot.png)

## Example SQL Query Executed
Here is an example query used to fetch all tasks that are marked as completed:
\`\`\`sql
SELECT * FROM tasks WHERE done = 1;
\`\`\`

## Optional Extras Implemented
- **Search using SQL**: \`GET /tasks?search=milk\` (using \`LIKE\`)
- **Filter completed tasks**: \`GET /tasks?done=true\` (using \`WHERE\`)
- **Sort alphabetically**: \`GET /tasks\` automatically sorts by title.
- **Return statistics**: \`GET /stats\` returns the count of tasks.
- **Add timestamps**: \`created_at\` and \`updated_at\` are automatically tracked for every task.
