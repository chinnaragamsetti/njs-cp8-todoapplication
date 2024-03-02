const express = require("express");
const path = require("path");
const app = express();
app.use(express.json());

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const dbpath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeDb = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server running at port");
    });
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};
initializeDb();

const hasPriorityAndStatusPropertied = (requestQuery) => {
  return (
    requestQuery.status !== undefined && requestQuery.priority !== undefined
  );
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};
const hasTodoProperty = (requestQuery) => {
  return requestQuery.todo !== undefined;
};

app.get("/todos/", async (request, response) => {
  const { search_q = "", priority, status } = request.query;
  let gettodoQuery = null;
  let responsedata = null;

  switch (true) {
    case hasPriorityAndStatusPropertied(request.query):
      gettodoQuery = ` 
    SELECT
    *
    FROM
    todo
    WHERE
    priority ='${priority}'AND status='${status}';`;
      break;

    case hasPriorityProperty(request.query):
      gettodoQuery = ` 
    SELECT
    *
    FROM 
    todo
    WHERE
    priority ='${priority}';`;
      break;

    case hasStatusProperty(request.query):
      gettodoQuery = ` 
    SELECT
    *
    FROM 
    todo
    WHERE 
    status='${status}';`;
      break;
    default:
      gettodoQuery = ` 
    SELECT
    *
    FROM 
    todo
    WHERE 
    todo='${search_q}';`;
  }

  responsedata = await db.all(gettodoQuery);
  response.send(responsedata);
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const todoQuery = `SELECT * FROM todo
  WHERE id=${todoId};`;
  const dbtodoQuery = await db.all(todoQuery);
  response.send(dbtodoQuery);
});

app.post("/todos/", async (request, response) => {
  const todoDetails = request.body;
  const { id, todo, priority, status } = todoDetails;
  const addQuery = `
    INSERT INTO 
    todo(id,todo,priority,status)
    VALUES 
    (
        ${id},
        '${todo}',
        '${priority}',
        '${status}'
    );`;
  await db.run(addQuery);
  response.send("Todo Successfully Added");
});

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const todoDetails = request.body;
  const { status, search_q, priority } = todoDetails;
  let responsestring = null;
  let addQuery = null;
  switch (true) {
    case status !== undefined:
      responsestring = "Status";
      addQuery = `UPDATE
    todo
    SET 
    status='${status}'
    WHERE 
    id=${todoId};`;
      break;

    case priority !== undefined:
      responsestring = "Priority";
      addQuery = `UPDATE
    todo
    SET 
    priority='${priority}'
     WHERE 
     id=${todoId};`;
      break;

    case todo !== undefined:
      responsestring = "Todo";
      addQuery = `UPDATE
    todo
    SET
    todo='${search_q}'
     WHERE 
     id=${todoId};`;
      break;
  }

  await db.run(addQuery);
  response.send(`${responsestring} Updated`);
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
    DELETE FROM
    todo
    WHERE 
    id=${todoId};
    `;
  await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
