import mongoose from 'mongoose';

/**
 * @typedef {Object} ProjectSchema
 * @property {string} name - The project name
 * @property {string} owner - The person/entity that owns the project
 * @property {string} previewImageUrl - The project preview image URL to display on the client
 * @property {Array<string>} techStack - The tech stack used to create the project
 * @property {string} description - The project description
 * @property {string} [repoUrl] - The remote repository URL if available
 * @property {number} order - The display order for the project (positive integer)
 */

/**
 * Mongoose schema definition for projects.
 * Stores project data with the project owner, preview image, and repo URL if available.
 * @type {mongoose.Schema<ProjectSchema>}
 */
const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: [50, 'Project name cannot exceed 50 characters']
  },
  owner: {
    type: String,
    required: [true, 'Project owner name is required'],
    trim: true,
    maxlength: [50, 'Project owner name cannot exceed 50 characters']
  },
  previewImageUrl: {
    type: String,
    required: [true, 'Preview image is required'],
    trim: true,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+\..+/.test(v);
      },
      message: 'Preview image URL must be a valid URL'
    }
  },
  techStack: {
    type: [String],
    required: [true, 'Tech stack is required'],
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'At least one technology must be specified'
    }
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    trim: true
  },
  repoUrl: {
    type: String,
    required: false,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return /^https?:\/\/(www\.)?github\.com\/.+\/.+/.test(v);
      },
      message: 'Repository URL must be a valid GitHub repository URL'
    }
  },
  order: {
    type: Number,
    required: [true, 'Display order is required'],
    min: [1, 'Order must be a positive number'],
    validate: {
      validator: function(v) {
        return Number.isInteger(v) && v > 0;
      },
      message: 'Order must be a positive integer'
    }
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  }
});

export default mongoose.model('Project', projectSchema);