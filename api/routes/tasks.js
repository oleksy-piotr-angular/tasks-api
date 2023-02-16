const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth'); // import middleware function to authenticate some actions in requests

const TasksController = require('../controllers/tasks'); // take all Expressions (Controllers) with arrow function to use it when we handle Requests below 

router.get('/myTasks', checkAuth, TasksController.get_all_user_tasks /* <= use Expression (Controller) instead whole anonymous arrow function */ ); 

router.post('/create', checkAuth, TasksController.task_create);

router.get('/getTask/:taskId', checkAuth, TasksController.get_user_task);

router.patch('/updateTask/:taskId', checkAuth, TasksController.task_update);

router.delete('/removeTask/:taskId', checkAuth, TasksController.task_delete);

module.exports = router;
