import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const createWorkingHours = () => ({
  monday: { enabled: true, start: '09:00', end: '17:00' },
  tuesday: { enabled: true, start: '09:00', end: '17:00' },
  wednesday: { enabled: true, start: '09:00', end: '17:00' },
  thursday: { enabled: true, start: '09:00', end: '17:00' },
  friday: { enabled: true, start: '09:00', end: '17:00' },
  saturday: { enabled: false, start: '', end: '' },
  sunday: { enabled: false, start: '', end: '' },
});

const splitName = (name = '') => {
  const tokens = name.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return { firstName: '', lastName: '' };
  if (tokens.length === 1) return { firstName: tokens[0], lastName: '' };
  return {
    firstName: tokens[0],
    lastName: tokens.slice(1).join(' '),
  };
};

const createDefaultProfile = ({ name = '', email = '' } = {}) => {
  const { firstName, lastName } = splitName(name);
  return {
    personal: {
      firstName,
      lastName,
      phoneNumber: '',
      personalEmail: email || '',
      dateOfBirth: null,
      gender: '',
      maritalStatus: '',
      about: '',
      tags: [],
      address: {
        streetAddress: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
      },
      guardian: {
        name: '',
        relationship: '',
        contactNumber: '',
      },
    },
    professional: {
      jobTitle: '',
      department: '',
      yearsOfExperience: '',
      workLocation: '',
      skills: [],
      certifications: [],
    },
    schedule: {
      timeZone: 'UTC',
      workingHours: createWorkingHours(),
    },
    education: {
      degree: '',
      fieldOfStudy: '',
      institution: '',
      startDate: null,
      endDate: null,
      description: '',
    },
    social: {
      github: '',
      linkedin: '',
      website: '',
      x: '',
    },
    account: {
      status: 'offline',
      secondaryEmail: '',
    },
    completion: 0,
  };
};

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8 },
    avatar: { type: String, default: '' },
    profile: {
      type: mongoose.Schema.Types.Mixed,
      default: () => createDefaultProfile(),
    },
    workspaces: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Workspace' }],
  },
  { timestamps: { createdAt: true, updatedAt: true } },
);

userSchema.pre('validate', function applyDefaultProfile(next) {
  if (!this.profile || typeof this.profile !== 'object') {
    this.profile = createDefaultProfile({ name: this.name, email: this.email });
    return next();
  }

  const defaults = createDefaultProfile({ name: this.name, email: this.email });
  this.profile.personal = { ...defaults.personal, ...(this.profile.personal || {}) };
  this.profile.personal.address = {
    ...defaults.personal.address,
    ...(this.profile.personal?.address || {}),
  };
  this.profile.personal.guardian = {
    ...defaults.personal.guardian,
    ...(this.profile.personal?.guardian || {}),
  };
  this.profile.professional = { ...defaults.professional, ...(this.profile.professional || {}) };
  this.profile.schedule = { ...defaults.schedule, ...(this.profile.schedule || {}) };
  this.profile.schedule.workingHours = {
    ...defaults.schedule.workingHours,
    ...(this.profile.schedule?.workingHours || {}),
  };
  this.profile.education = { ...defaults.education, ...(this.profile.education || {}) };
  this.profile.social = { ...defaults.social, ...(this.profile.social || {}) };
  this.profile.account = { ...defaults.account, ...(this.profile.account || {}) };

  if (!this.profile.personal.firstName?.trim()) {
    this.profile.personal.firstName = defaults.personal.firstName;
  }
  if (!this.profile.personal.lastName?.trim()) {
    this.profile.personal.lastName = defaults.personal.lastName;
  }
  if (!this.profile.personal.personalEmail?.trim()) {
    this.profile.personal.personalEmail = defaults.personal.personalEmail;
  }

  this.profile.completion =
    typeof this.profile.completion === 'number' ? this.profile.completion : defaults.completion;

  next();
});

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(rawPassword) {
  return bcrypt.compare(rawPassword, this.password);
};

export default mongoose.model('User', userSchema);
export { createDefaultProfile };
