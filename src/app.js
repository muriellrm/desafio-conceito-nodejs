const express = require("express");
const cors = require("cors");

const { uuid, isUuid } = require('uuidv4');

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];


function logRequests(req, res, next) {
  const { method, url } = req;

  const logLabel = `[${method.toUpperCase()}] ${url}`;

  console.time(logLabel);

  next(); // Proximo middleware

  console.timeEnd(logLabel);
}

function validateRepositoryId(req, res, next) {
  const { id } = req.params;

  if(!isUuid(id)){
      return res.status(400).json({ error: "Invalid repository ID."});
  }

  return next();

}

app.use(logRequests);
app.use('/repositories/:id', validateRepositoryId);

app.get("/repositories", (req, res) => {

  const { title } = req.query;

  const results = title ? repositories.filter(repository => repository.title.includes(title)) : repositories;

  return res.json(results);


});

app.post("/repositories", (req, res) => {
  const { title, url, techs } = req.body;

  const repository = { id: uuid(), title, url, techs, likes: 0 };

  repositories.push(repository);

  return res.json(repository);

});

app.put("/repositories/:id", (req, res) => {
  const { id } = req.params;
  const { title, url, techs } = req.body;

  const repositoryIndex = repositories.findIndex(repository => repository.id === id);

  if (repositoryIndex < 0) {
    return res.status(400).json({ error: 'Repository not found.' });
  }

  const repository = { id, title, url, techs, likes: repositories[repositoryIndex].likes }

  repositories[repositoryIndex] = repository;

  return res.json(repository);
});

app.delete("/repositories/:id", (req, res) => {
  const { id } = req.params;

  const repositoryIndex = repositories.findIndex(repository => repository.id === id);

  if (repositoryIndex < 0) {
    return res.status(400).json({ error: 'Repository not found.' });
  }
  repositories.splice(repositoryIndex, 1);

  return res.status(204).send();
});

app.post("/repositories/:id/like", (req, res) => {
  const { id } = req.params;

  const repositoryIndex = repositories.findIndex(repository => repository.id === id);

  if (repositoryIndex < 0) {
    return res.status(400).json({ error: 'Repository not found.' });
  }

  repositories[repositoryIndex].likes +=1;

  return res.status(200).json(repositories[repositoryIndex]);
});

module.exports = app;
