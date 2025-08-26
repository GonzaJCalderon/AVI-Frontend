import { DatabaseService } from '../database/database.service';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
export declare class UsuariosService {
    private readonly databaseService;
    constructor(databaseService: DatabaseService);
    findAll(): Promise<{
        id: number;
        nombre: string;
        activo: boolean;
        email: string;
        rol: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    update(id: number, dto: UpdateUsuarioDto): Promise<{
        id: number;
        nombre: string;
        activo: boolean;
        email: string;
        rol: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
