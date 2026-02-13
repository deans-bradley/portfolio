import mongoose from 'mongoose';

/**
 * @typedef {Object} TestimonialSchema
 * @property {string} firstName - Author's first name (required, max 50 chars)
 * @property {string} lastName - Author's last name (required, max 50 chars)
 * @property {string} email - Author's email address (required)
 * @property {string} [linkedinProfileUrl] - Author's LinkedIn profile URL (validated format)
 * @property {string} [company] - Author's company name (max 100 chars)
 * @property {string} [jobTitle] - Author's job title (max 100 chars)
 * @property {string} [avatar] - Base64 encoded avatar image
 * @property {string} message - Testimonial content (required, max 250 chars)
 * @property {boolean} approved - Approval status (default: false)
 * @property {Date} createdAt - Document creation timestamp
 * @property {Date} updatedAt - Document update timestamp
 */

/**
 * Mongoose schema definition for testimonials.
 * Stores testimonial submissions with author information and approval status.
 * @type {mongoose.Schema<TestimonialSchema>}
 */
const testimonialSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    minlength: [5, 'Email must be at least 5 characters'],
    match: [/^[^@]+@[^@]+\.[^@]+$/, 'Please enter a valid email']
  },
  linkedinProfileUrl: {
    type: String,
    required: false,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(value) {
        if (!value) return true;
        const linkedinRegex = /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/i;
        return linkedinRegex.test(value);
      },
      message: 'Please provide a valid LinkedIn profile URL (e.g., https://www.linkedin.com/in/username)'
    }
  },
  company: {
    type: String,
    required: false,
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  jobTitle: {
    type: String,
    required: false,
    trim: true,
    maxlength: [100, 'Job title cannot exceed 100 characters']
  },
  avatar: {
    type: String,
    required: false,
    validate: {
      validator: function(value) {
        if (!value) return true;
        const base64Regex = /^data:image\/(jpeg|jpg|png|gif|webp);base64,[A-Za-z0-9+/]+=*$/;
        return base64Regex.test(value);
      },
      message: 'Avatar must be a valid base64 encoded image'
    }
  },
  message: {
    type: String,
    required: [true, 'Testimonial message is required'],
    trim: true,
    maxlength: [250, 'Testimonial message cannot exceed 250 characters']
  },
  approved: {
    type: Boolean,
    default: false
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

export default mongoose.model('Testimonial', testimonialSchema);