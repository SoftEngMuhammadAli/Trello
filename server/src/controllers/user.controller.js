import asyncHandler from '../utils/asyncHandler.js';
import User, { createDefaultProfile } from '../models/User.js';

const deepMergeObjects = (baseValue, patchValue) => {
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
    merged[key] = deepMergeObjects(baseValue[key], value);
  });
  return merged;
};

const isFilledValue = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'number') return Number.isFinite(value);
  if (typeof value === 'boolean') return value;
  if (typeof value === 'object') {
    return Object.values(value).some((entry) => isFilledValue(entry));
  }
  return false;
};

const calculateProfileCompletion = (profile = {}) => {
  const checkpoints = [
    profile.personal?.firstName,
    profile.personal?.lastName,
    profile.personal?.phoneNumber,
    profile.personal?.personalEmail,
    profile.personal?.dateOfBirth,
    profile.personal?.gender,
    profile.personal?.about,
    profile.personal?.address?.city,
    profile.personal?.address?.country,
    profile.professional?.jobTitle,
    profile.professional?.department,
    profile.professional?.yearsOfExperience,
    profile.professional?.skills,
    profile.schedule?.timeZone,
    profile.education?.degree,
    profile.education?.institution,
    profile.education?.startDate,
    profile.social?.github,
    profile.social?.linkedin,
    profile.account?.status,
  ];

  const filled = checkpoints.filter((entry) => isFilledValue(entry)).length;
  return Math.round((filled / checkpoints.length) * 100);
};

const buildSafeUserPayload = (user) => {
  const raw = typeof user.toObject === 'function' ? user.toObject() : user;
  const safeUser = { ...raw };
  delete safeUser.password;

  const defaultProfile = createDefaultProfile({
    name: safeUser.name,
    email: safeUser.email,
  });
  const mergedProfile = deepMergeObjects(defaultProfile, safeUser.profile || {});
  mergedProfile.completion = calculateProfileCompletion(mergedProfile);

  return {
    ...safeUser,
    profile: mergedProfile,
  };
};

const getProfile = asyncHandler(async (req, res) => {
  res.json({ success: true, user: buildSafeUserPayload(req.user) });
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  if (req.body.name !== undefined) user.name = req.body.name;
  if (req.body.avatar !== undefined) user.avatar = req.body.avatar;

  if (req.body.profile !== undefined) {
    user.profile = deepMergeObjects(user.profile || {}, req.body.profile || {});
    user.markModified('profile');
  }

  const nextPayload = buildSafeUserPayload(user);
  user.profile = nextPayload.profile;
  user.markModified('profile');
  await user.save();

  res.json({ success: true, user: buildSafeUserPayload(user) });
});

export { getProfile, updateProfile };
