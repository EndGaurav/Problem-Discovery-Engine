import express from 'express';
import { 
  getProjects, 
  createProject, 
  saveClusterToProject, 
  deleteProject, 
  removeClusterFromProject 
} from '../controllers/projectController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All project routes require auth

router.get('/', getProjects);
router.post('/', createProject);
router.post('/:projectId/save', saveClusterToProject);
router.delete('/:projectId', deleteProject);
router.delete('/:projectId/clusters/:clusterId', removeClusterFromProject);

export default router;
