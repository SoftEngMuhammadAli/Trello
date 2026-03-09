import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/User.js';

const getProfile = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});

const updateProfile = asyncHandler(async (req, res) => {
  const updatedUser = await User.findByIdAndUpdate(req.user._id, req.body, {
    new: true,
    runValidators: true,
  }).select('-password');

  res.json({ success: true, user: updatedUser });
});

export { getProfile, updateProfile };