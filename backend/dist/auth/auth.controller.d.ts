import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        refresh_token: string;
        user: {
            id: any;
            email: any;
            nombre: any;
            rol: any;
        };
    }>;
    register(registerDto: RegisterDto): Promise<{
        id: number;
        nombre: string;
        activo: boolean;
        email: string;
        rol: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getProfile(req: any): any;
    refreshTokens(req: any): Promise<{
        access_token: string;
        refresh_token: string;
        user: {
            id: number;
            email: string;
            nombre: string;
            rol: string;
        };
    }>;
    logout(body: {
        refresh_token?: string;
    }): Promise<{
        message: string;
    }>;
}
