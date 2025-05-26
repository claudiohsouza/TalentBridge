export const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ erro: 'Usuário não autenticado' });
    }

    if (!allowedRoles.includes(req.user.papel)) {
      return res.status(403).json({ erro: 'Acesso não autorizado' });
    }

    next();
  };
}; 