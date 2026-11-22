// Usage: router.post("/", isAuthenticated, authorizeRoles("teacher"), createSubject)
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to do this."
      });
    }
    next();
  };
};

export default authorizeRoles;