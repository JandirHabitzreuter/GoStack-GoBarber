import { Router } from 'express';
import userController from './app/controllers/UserController';
import sessionController from './app/controllers/SessionController';
import fileController from './app/controllers/FileController'
import providerController from './app/controllers/ProviderController';
import AppointmentController from './app/controllers/AppointmentController';
import ScheduleController from './app/controllers/ScheduleController';



import authMiddleware from './app/middleware/auth';
import multerConfig from './config/multer';
import multer from 'multer';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', userController.store);
routes.post('/sessions', sessionController.store);

// Vai valer somente para as rotas que vieram depois
routes.use(authMiddleware);

routes.put('/users', userController.update);

routes.post('/files', upload.single('file'), fileController.store);

routes.get('/providers', providerController.index);

routes.get('/appointments', AppointmentController.index);

routes.get('/schedules', ScheduleController.index);

routes.post('/appointments', AppointmentController.store);

 export default  routes;
