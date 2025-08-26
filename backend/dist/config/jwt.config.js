"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtConfig = void 0;
exports.jwtConfig = {
    secret: process.env.JWT_SECRET || "tu-secreto-super-seguro",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "tu-refresh-secreto-super-seguro",
    expiresIn: process.env.JWT_EXPIRES_IN || "15m",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
};
//# sourceMappingURL=jwt.config.js.map