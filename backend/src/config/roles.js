const allRoles = {
  user: ['manageCommunityProfile', 'createPosts', 'createComments'],
  therapist: ['manageTherapistProfile', 'acceptSessions', 'viewSessionHistory', 'updateAvailability'],
  admin: ['getUsers', 'manageUsers', 'verifyTherapists', 'manageContent', 'viewAnalytics'],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};
