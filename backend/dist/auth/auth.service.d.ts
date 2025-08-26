import { JwtService } from "@nestjs/jwt";
import { DatabaseService } from "../database/database.service";
export declare class AuthService {
    private readonly databaseService;
    private readonly jwtService;
    constructor(databaseService: DatabaseService, jwtService: JwtService);
    validateUser(email: string, password: string): Promise<any>;
    refreshTokens(refreshToken: string): Promise<{
        access_token: string;
        refresh_token: string;
        user: {
            id: number;
            email: string;
            nombre: string;
            rol: string;
        };
    }>;
    logout(refreshToken: string): Promise<{
        message: string;
    }>;
    login(user: any): Promise<{
        access_token: string;
        refresh_token: string;
        user: {
            id: any;
            email: any;
            nombre: any;
            rol: any;
        };
    }>;
    register(createUserDto: {
        email: string;
        password: string;
        nombre: string;
        rol?: string;
    }): Promise<{
        id: number;
        nombre: string;
        activo: boolean;
        email: string;
        rol: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
