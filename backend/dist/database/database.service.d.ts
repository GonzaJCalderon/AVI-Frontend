import { OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
export declare class DatabaseService implements OnModuleInit {
    prisma: PrismaClient;
    onModuleInit(): Promise<void>;
    generarCodigoUnico(): Promise<string>;
    convertirBooleano(valor: any): boolean;
    convertirBooleanoDos(valor: any): boolean;
}
