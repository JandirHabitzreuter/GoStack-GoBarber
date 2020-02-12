const { Router } = require('express');
const userController = require('./app/controllers/UserController');
const sessionController = require('./app/controllers/SessionController');

const authMiddleware = require('./app/middleware/auth');
const routes = new Router();



routes.post('/users', userController.store);
routes.post('/sessions', sessionController.store);

// Vai valer somente para as rotas que vieram depois
routes.use(authMiddleware);

routes.put('/users', userController.update);

 module.exports =  routes;
