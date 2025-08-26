import { UsuariosService } from './usuarios.service';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
export declare class UsuariosController {
    private readonly usuariosService;
    constructor(usuariosService: UsuariosService);
    findAll(): Promise<{
        success: boolean;
        data: {
            id: number;
            nombre: string;
            activo: boolean;
            email: string;
            rol: string;
            createdAt: Date;
            updatedAt: Date;
        }[];
    }>;
    update(id: string, dto: UpdateUsuarioDto): Promise<{
        success: boolean;
        data: {
            id: number;
            nombre: string;
            activo: boolean;
            email: string;
            rol: string;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
}
