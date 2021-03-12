const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const checkIfExistsUserAccount = users.some(
    (user) => user.username === username
  );

  if (!checkIfExistsUserAccount) {
    return response.status(404).json({ error: "User does not exist" });
  }

  return next();
}

function checksExistsTodo(request, response, next) {
  const { username } = request.headers;
  const { id } = request.params;

  const user = users.find((user) => user.username === username);

  const checkIfExistsTodo = user.todos.some((todo) => todo.id === id);

  if (!checkIfExistsTodo) {
    return response.status(404).json({ error: "Todo does not exist" });
  }

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const checkIfExistsUserAccount = users.some(
    (user) => user.username === username
  );

  if (checkIfExistsUserAccount) {
    return response.status(400).json({ error: "Username is already in use" });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(user);

  return response.status(201).send(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;

  const user = users.find((currentUser) => currentUser.username === username);

  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { title, deadline } = request.body;

  const userIndex = users.findIndex(
    (currentUser) => currentUser.username === username
  );

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  users[userIndex].todos.push(todo);

  return response.status(201).json(todo);
});

app.put(
  "/todos/:id",
  checksExistsUserAccount,
  checksExistsTodo,
  (request, response) => {
    const { username } = request.headers;
    const { title, deadline } = request.body;
    const { id } = request.params;

    const userIndex = users.findIndex(
      (currentUser) => currentUser.username === username
    );

    const todoIndex = users[userIndex].todos.findIndex(
      (currentTodo) => currentTodo.id === id
    );

    const todosUpdated = users[userIndex].todos.map((currentTodo) => {
      if (currentTodo.id === id) {
        Object.assign(currentTodo, { title, deadline: new Date(deadline) });
        return currentTodo;
      }

      return currentTodo;
    });

    users[userIndex].todos = todosUpdated;

    return response.json(users[userIndex].todos[todoIndex]);
  }
);

app.patch(
  "/todos/:id/done",
  checksExistsUserAccount,
  checksExistsTodo,
  (request, response) => {
    const { username } = request.headers;
    const { id } = request.params;

    const userIndex = users.findIndex(
      (currentUser) => currentUser.username === username
    );

    const todoIndex = users[userIndex].todos.findIndex(
      (currentTodo) => currentTodo.id === id
    );

    const todosUpdated = users[userIndex].todos.map((currentTodo) => {
      if (currentTodo.id === id) {
        Object.assign(currentTodo, { done: true });
        return currentTodo;
      }

      return currentTodo;
    });

    users[userIndex].todos = todosUpdated;

    return response.json(users[userIndex].todos[todoIndex]);
  }
);

app.delete(
  "/todos/:id",
  checksExistsUserAccount,
  checksExistsTodo,
  (request, response) => {
    const { username } = request.headers;
    const { id } = request.params;

    const userIndex = users.findIndex(
      (currentUser) => currentUser.username === username
    );

    const todosUpdated = users[userIndex].todos.filter(
      (currentTodo) => currentTodo.id !== id
    );

    users[userIndex].todos = todosUpdated;

    return response.status(204).send();
  }
);

module.exports = app;
