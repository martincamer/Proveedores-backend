export const isAdmin = (req, res, next) => {
  if (req.userRole !== 1) {
    // Asegúrate de que el rol de administrador sea el correcto
    return res.status(403).json({
      message: "No tienes permisos de administrador",
    });
  }
  next();
};
