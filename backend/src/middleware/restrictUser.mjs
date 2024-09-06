export default function restrictUser(allowedRoles) {
    return (req, res, next) => {
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).send('You do not have permission');
      }
      next();
    };
  }
  