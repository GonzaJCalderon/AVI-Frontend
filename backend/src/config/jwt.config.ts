export const jwtConfig = {
  secret: process.env.JWT_SECRET || "tu-secreto-super-seguro",
  refreshSecret:
    process.env.JWT_REFRESH_SECRET || "tu-refresh-secreto-super-seguro",
  expiresIn: process.env.JWT_EXPIRES_IN || "15m",
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
};
