import mongoose from 'mongoose';

const problemSchema = new mongoose.Schema({
  keyword: { type: String, required: true },
  clusters: [
    {
      title: String,
      frequency: Number,
      severity: Number,
      summary: String,
      solution: String,
      techStack: String
    }
  ],
  rawData: [Object],
  createdAt: { type: Date, default: Date.now }
});

const Problem = mongoose.model('Problem', problemSchema);

export default Problem;
