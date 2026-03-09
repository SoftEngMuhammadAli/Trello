const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');

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

module.exports = { getProfile, updateProfile };
