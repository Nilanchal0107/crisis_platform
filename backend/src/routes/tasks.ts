import { Router } from 'express';
import { TaskController } from '../modules/task/task.controller.js';

const router = Router();

router.get('/', TaskController.listTasks);
router.post('/', TaskController.createTask);
router.get('/:id', TaskController.getTaskById);
router.post('/:id/acknowledge', TaskController.acknowledgeTask);
router.post('/:id/dispatch', TaskController.dispatchTask);
router.post('/:id/outcome', TaskController.submitOutcome);
router.post('/:id/updates', TaskController.postUpdate);

export default router;
