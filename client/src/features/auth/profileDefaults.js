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
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: '', lastName: '' };
  if (parts.length === 1) return { firstName: parts[0], lastName: '' };
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
};

export const createDefaultProfile = ({ name = '', email = '' } = {}) => {
  const { firstName, lastName } = splitName(name);
  return {
    personal: {
      firstName,
      lastName,
      phoneNumber: '',
      personalEmail: email || '',
      dateOfBirth: '',
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
      startDate: '',
      endDate: '',
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

export const mergeDeep = (baseValue, patchValue) => {
  if (Array.isArray(patchValue)) return patchValue;
  if (
    patchValue === null ||
    typeof patchValue !== 'object' ||
    baseValue === null ||
    typeof baseValue !== 'object'
  ) {
    return patchValue;
  }

  const merged = { ...baseValue };
  Object.entries(patchValue).forEach(([key, value]) => {
    merged[key] = mergeDeep(baseValue[key], value);
  });
  return merged;
};

export const ensureUserProfile = (user) => {
  if (!user) return user;
  const fallback = createDefaultProfile({ name: user.name, email: user.email });
  return {
    ...user,
    profile: mergeDeep(fallback, user.profile || {}),
  };
};
