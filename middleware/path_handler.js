/**
 * 404 Not Found Handler Middleware
 * Handles requests to non-existent endpoints
 */

const notFound = (req, res) => {
  // Log 404 requests
  console.warn(`[404_NOT_FOUND] ${req.method} ${req.originalUrl} from ${req.ip}`);
  
  return res.status(404).json({
    success: 0,
    message: 'Endpoint not found',
    error: 'NOT_FOUND',
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method,
    availableEndpoints: {
      auth: {
        login: 'POST /api/login',
        register: 'POST /api/register'
      },
      users: {
        list: 'GET /api/users/user',
        updateProfile: 'POST /api/users/update-user-profile',
        updateSkills: 'POST /api/users/update-user-skills',
        updateEducation: 'POST /api/users/update-user-education',
        updateExperience: 'POST /api/users/update-user-experience',
        getUserInfo: 'POST /api/users/get-user-info',
        submitUserDetails: 'POST /api/users/submit-user-details'
      },
      health: {
        check: 'GET /health'
      }
    }
  });
};

export default notFound;