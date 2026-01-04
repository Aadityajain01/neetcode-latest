// middleware/checkRole.ts
export const checkRole = (role: string) => (req: any, res: any, next: any) => {
  if (!req.userRole || req.userRole !== role) {
    return res.status(403).json({ error: 'Forbidden: Admins only' });
  }
  next();
};
