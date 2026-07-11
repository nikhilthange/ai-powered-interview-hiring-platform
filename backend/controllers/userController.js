const User = require('../models/User');
const AppError = require('../utils/appError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * SEARCH USERS
 */
exports.searchUsers = asyncHandler(async (req, res, next) => {
  const { q } = req.query;
  if (!q) {
    return res.status(200).json({ status: 'success', data: { users: [] } });
  }

  // Find users whose name or email matches the search query.
  // We exclude the current user.
  // We only return candidates and recruiters.
  const regex = new RegExp(q, 'i');
  
  const users = await User.find({
    _id: { $ne: req.user._id },
    role: { $in: ['candidate', 'recruiter'] },
    $or: [
      { name: regex },
      { email: regex }
    ]
  })
  .select('name email role profilePicture')
  .limit(20);

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: { users }
  });
});
