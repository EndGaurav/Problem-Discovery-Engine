import Project from '../models/Project.js';

export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.user.id }).sort('-updatedAt');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createProject = async (req, res) => {
  try {
    const { name } = req.body;
    const project = await Project.create({
      name,
      userId: req.user.id,
      clusters: []
    });
    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const saveClusterToProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const clusterData = req.body;

    const project = await Project.findOne({ _id: projectId, userId: req.user.id });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if cluster already saved (optional)
    const exists = project.clusters.find(c => c.title === clusterData.title);
    if (!exists) {
      project.clusters.push(clusterData);
      await project.save();
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.projectId, userId: req.user.id });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const removeClusterFromProject = async (req, res) => {
  try {
    const { projectId, clusterId } = req.params;
    const project = await Project.findOne({ _id: projectId, userId: req.user.id });
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    project.clusters = project.clusters.filter(c => c._id.toString() !== clusterId);
    await project.save();

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
