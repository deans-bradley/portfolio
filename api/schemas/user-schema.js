import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * @typedef {Object} UserSchema
 * @property {string} email - User's email address (unique, lowercase, required)
 * @property {string} password - User's hashed password (required, min 6 chars, not selected by default)
 * @property {string} firstName - User's first name (required, max 50 chars)
 * @property {string} lastName - User's last name (required, max 50 chars)
 * @property {('user'|'admin')} role - User's role (default: 'user')
 * @property {boolean} isActive - Whether the user account is active (default: true)
 * @property {boolean} emailVerified - Whether the user's email is verified (default: false)
 * @property {Date} [lastLogin] - User's last login timestamp
 * @property {Date} createdAt - Document creation timestamp
 * @property {Date} updatedAt - Document update timestamp
 */

/**
 * @typedef {Object} SafeUserObject
 * @property {string} _id - User's unique identifier
 * @property {string} email - User's email address
 * @property {string} firstName - User's first name
 * @property {string} lastName - User's last name
 * @property {('user'|'admin')} role - User's role
 * @property {boolean} isActive - Whether the user is active
 * @property {boolean} emailVerified - Whether email is verified
 * @property {Date} [lastLogin] - Last login timestamp
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} updatedAt - Update timestamp
 */

/**
 * Mongoose schema definition for users.
 * Includes password hashing, email indexing, and utility methods.
 * @type {mongoose.Schema<UserSchema>}
 */
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false
  },
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
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.__v;
      return ret;
    }
  }
});

/**
 * Pre-save middleware that hashes the password before saving.
 * Only runs if the password field has been modified.
 * @this {mongoose.Document}
 */
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Compares a candidate password with the user's hashed password.
 * @async
 * @param {string} candidatePassword - The plain text password to compare
 * @returns {Promise<boolean>} True if passwords match, false otherwise
 * @throws {Error} Throws if comparison fails
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

/**
 * Returns a safe user object with the password field removed.
 * @returns {SafeUserObject} User object without sensitive data
 */
userSchema.methods.toSafeObject = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

/**
 * Finds a user by email address with the password field included.
 * @static
 * @param {string} email - The email address to search for
 * @returns {mongoose.Query<mongoose.Document|null>} Query that resolves to the user or null
 */
userSchema.statics.findByEmailWithPassword = function(email) {
  return this.findOne({ email: email.toLowerCase() }).select('+password');
};

export default mongoose.model('User', userSchema);