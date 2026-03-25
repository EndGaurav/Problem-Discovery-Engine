import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  clusters: [{
    title: String,
    summary: String,
    frequency: Number,
    severity: Number,
    solution: String,
    techStack: String,
    savedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

const Project = mongoose.model('Project', projectSchema);
export default Project;
