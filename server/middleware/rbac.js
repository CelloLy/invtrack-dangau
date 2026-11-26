// Role-Based Access Control Middleware

const allowRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Pengguna belum terautentikasi.' });
    }

    const userRole = req.user.role_name;

    // Master is the superuser and has unrestricted access to all endpoints and operations
    if (userRole === 'Master') {
      return next();
    }

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        message: `Akses ditolak. Peran '${userRole}' tidak memiliki hak akses untuk tindakan ini.` 
      });
    }

    next();
  };
};

module.exports = { allowRoles };
