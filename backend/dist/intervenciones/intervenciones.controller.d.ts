import { IntervencionesService } from "./intervenciones.service";
import { CreateIntervencionDto } from "./dto/create-intervencion.dto";
import { UpdateIntervencionDto } from "./dto/update-intervencion.dto";
export declare class IntervencionesController {
    private readonly intervencionesService;
    constructor(intervencionesService: IntervencionesService);
    createIntervencion(createIntervencionDto: CreateIntervencionDto): Promise<{
        success: boolean;
        message: string;
        codigo: string;
        data: {
            intervencion_id: number;
            derivacion_id: number;
            hecho_delictivo_id: number;
            victima_id: number;
            persona_entrevistada_id: number;
            seguimiento_id: number;
        };
    }>;
    findAll(): Promise<{
        success: boolean;
        message: string;
        data: {
            id: number;
            numero_intervencion: string;
            fecha: Date;
            coordinador: string | null;
            operador: string | null;
            resena_hecho: string | null;
            fecha_creacion: Date | null;
            derivaciones: {
                id: number;
                tipo_derivacion_id: number | null;
            }[];
            seguimientos: {
                id: number;
                tipo: {
                    id: number;
                }[];
                detalles: {
                    id: number;
                }[];
            }[];
            victimas: {
                id: number;
            }[];
            abusos_sexuales: {
                id: number;
            }[];
            acciones_primera_linea: {
                id: number;
            }[];
            hechos_delictivos: {
                id: number;
            }[];
            intervenciones_tipo: {
                id: number;
            }[];
        }[];
    }>;
    findOne(id: string): Promise<{
        success: boolean;
        message: string;
        data: {
            derivaciones: ({
                tipo_derivaciones: {
                    id: number;
                    descripcion: string | null;
                } | null;
            } & {
                id: number;
                intervencion_id: number | null;
                tipo_derivacion_id: number | null;
                derivador: string | null;
                fecha_derivacion: Date | null;
            })[];
            seguimientos: ({
                tipo: {
                    id: number;
                    seguimiento_id: number | null;
                    asesoramientolegal: boolean | null;
                    tratamientopsicologico: boolean | null;
                    seguimientolegal: boolean | null;
                    archivocaso: boolean | null;
                }[];
                detalles: {
                    id: number;
                    seguimiento_id: number;
                    detalle: string | null;
                }[];
            } & {
                id: number;
                intervencion_id: number | null;
                hubo: boolean | null;
            })[];
            victimas: ({
                generos: {
                    id: number;
                    descripcion: string | null;
                } | null;
                direccion: {
                    id: number;
                    barrio: string | null;
                    departamento: string | null;
                    localidad: string | null;
                    calle_nro: string | null;
                } | null;
                personas_entrevistadas: ({
                    direccion: {
                        id: number;
                        barrio: string | null;
                        departamento: string | null;
                        localidad: string | null;
                        calle_nro: string | null;
                    } | null;
                } & {
                    id: number;
                    nombre: string | null;
                    direccion_id: number | null;
                    relacion_victima: string | null;
                    victima_id: number | null;
                })[];
            } & {
                id: number;
                intervencion_id: number | null;
                cantidad_victima_por_hecho: number | null;
                dni: string | null;
                nombre: string | null;
                genero_id: number | null;
                fecha_nacimiento: Date | null;
                telefono: string | null;
                ocupacion: string | null;
                direccion_id: number | null;
            })[];
            abusos_sexuales: ({
                datos: {
                    id: number;
                    kit: string | null;
                    relacion: string | null;
                    relacion_otro: string | null;
                    lugar_hecho: string | null;
                    lugar_otro: string | null;
                    abuso_sexual_id: number | null;
                }[];
            } & {
                id: number;
                intervencion_id: number | null;
                tipo_abuso: number | null;
            })[];
            acciones_primera_linea: {
                id: number;
                fecha: Date | null;
                intervencion_id: number | null;
                acciones: string | null;
                user_audit: number | null;
            }[];
            hechos_delictivos: ({
                geo: ({
                    departamentos: {
                        id: number;
                        descripcion: string | null;
                        dep_id: number | null;
                    } | null;
                } & {
                    id: number;
                    fecha: Date | null;
                    hecho_delictivo_id: number | null;
                    domicilio: string | null;
                    departamento_id: number | null;
                })[];
                relaciones: {
                    id: number;
                    robo: boolean | null;
                    amenazas: boolean | null;
                    lesiones: boolean | null;
                    femicidio: boolean | null;
                    otros: boolean | null;
                    hecho_delictivo_id: number | null;
                    robo_arma_fuego: boolean | null;
                    robo_arma_blanca: boolean | null;
                    lesiones_arma_fuego: boolean | null;
                    lesiones_arma_blanca: boolean | null;
                    homicidio_delito: boolean | null;
                    homicidio_accidente_vial: boolean | null;
                    homicidio_av_hecho: boolean | null;
                    travestisidio_transfemicidio: boolean | null;
                    violencia_genero: boolean | null;
                }[];
            } & {
                id: number;
                intervencion_id: number | null;
                expediente: string | null;
                num_agresores: number | null;
                fecha_created: Date | null;
            })[];
            intervenciones_tipo: {
                id: number;
                intervencion_id: number | null;
                crisis: boolean | null;
                telefonica: boolean | null;
                domiciliaria: boolean | null;
                psicologica: boolean | null;
                medica: boolean | null;
                social: boolean | null;
                legal: boolean | null;
                sin_intervencion: boolean | null;
                archivo_caso: boolean | null;
            }[];
        } & {
            id: number;
            numero_intervencion: string;
            fecha: Date;
            coordinador: string | null;
            operador: string | null;
            resena_hecho: string | null;
            fecha_creacion: Date | null;
            eliminado: boolean;
            estado: string | null;
        };
    }>;
    update(id: string, updateIntervencionDto: UpdateIntervencionDto): Promise<{
        success: boolean;
        message: string;
        data: {
            derivaciones: {
                id: number;
                intervencion_id: number | null;
                tipo_derivacion_id: number | null;
                derivador: string | null;
                fecha_derivacion: Date | null;
            }[];
            seguimientos: ({
                tipo: {
                    id: number;
                    seguimiento_id: number | null;
                    asesoramientolegal: boolean | null;
                    tratamientopsicologico: boolean | null;
                    seguimientolegal: boolean | null;
                    archivocaso: boolean | null;
                }[];
                detalles: {
                    id: number;
                    seguimiento_id: number;
                    detalle: string | null;
                }[];
            } & {
                id: number;
                intervencion_id: number | null;
                hubo: boolean | null;
            })[];
            victimas: ({
                direccion: {
                    id: number;
                    barrio: string | null;
                    departamento: string | null;
                    localidad: string | null;
                    calle_nro: string | null;
                } | null;
                personas_entrevistadas: {
                    id: number;
                    nombre: string | null;
                    direccion_id: number | null;
                    relacion_victima: string | null;
                    victima_id: number | null;
                }[];
            } & {
                id: number;
                intervencion_id: number | null;
                cantidad_victima_por_hecho: number | null;
                dni: string | null;
                nombre: string | null;
                genero_id: number | null;
                fecha_nacimiento: Date | null;
                telefono: string | null;
                ocupacion: string | null;
                direccion_id: number | null;
            })[];
            abusos_sexuales: ({
                datos: {
                    id: number;
                    kit: string | null;
                    relacion: string | null;
                    relacion_otro: string | null;
                    lugar_hecho: string | null;
                    lugar_otro: string | null;
                    abuso_sexual_id: number | null;
                }[];
            } & {
                id: number;
                intervencion_id: number | null;
                tipo_abuso: number | null;
            })[];
            acciones_primera_linea: {
                id: number;
                fecha: Date | null;
                intervencion_id: number | null;
                acciones: string | null;
                user_audit: number | null;
            }[];
            hechos_delictivos: ({
                geo: {
                    id: number;
                    fecha: Date | null;
                    hecho_delictivo_id: number | null;
                    domicilio: string | null;
                    departamento_id: number | null;
                }[];
                relaciones: {
                    id: number;
                    robo: boolean | null;
                    amenazas: boolean | null;
                    lesiones: boolean | null;
                    femicidio: boolean | null;
                    otros: boolean | null;
                    hecho_delictivo_id: number | null;
                    robo_arma_fuego: boolean | null;
                    robo_arma_blanca: boolean | null;
                    lesiones_arma_fuego: boolean | null;
                    lesiones_arma_blanca: boolean | null;
                    homicidio_delito: boolean | null;
                    homicidio_accidente_vial: boolean | null;
                    homicidio_av_hecho: boolean | null;
                    travestisidio_transfemicidio: boolean | null;
                    violencia_genero: boolean | null;
                }[];
            } & {
                id: number;
                intervencion_id: number | null;
                expediente: string | null;
                num_agresores: number | null;
                fecha_created: Date | null;
            })[];
            intervenciones_tipo: {
                id: number;
                intervencion_id: number | null;
                crisis: boolean | null;
                telefonica: boolean | null;
                domiciliaria: boolean | null;
                psicologica: boolean | null;
                medica: boolean | null;
                social: boolean | null;
                legal: boolean | null;
                sin_intervencion: boolean | null;
                archivo_caso: boolean | null;
            }[];
        } & {
            id: number;
            numero_intervencion: string;
            fecha: Date;
            coordinador: string | null;
            operador: string | null;
            resena_hecho: string | null;
            fecha_creacion: Date | null;
            eliminado: boolean;
            estado: string | null;
        };
    }>;
    eliminarLogico(id: number): Promise<{
        id: number;
        numero_intervencion: string;
        fecha: Date;
        coordinador: string | null;
        operador: string | null;
        resena_hecho: string | null;
        fecha_creacion: Date | null;
        eliminado: boolean;
        estado: string | null;
    }>;
    cerrarIntervencion(id: number): Promise<{
        id: number;
        numero_intervencion: string;
        fecha: Date;
        coordinador: string | null;
        operador: string | null;
        resena_hecho: string | null;
        fecha_creacion: Date | null;
        eliminado: boolean;
        estado: string | null;
    }>;
    archivarIntervencion(id: number): Promise<{
        id: number;
        numero_intervencion: string;
        fecha: Date;
        coordinador: string | null;
        operador: string | null;
        resena_hecho: string | null;
        fecha_creacion: Date | null;
        eliminado: boolean;
        estado: string | null;
    }>;
    findAllNoActivas(): Promise<{
        success: boolean;
        message: string;
        data: {
            id: number;
            numero_intervencion: string;
            fecha: Date;
            coordinador: string | null;
            operador: string | null;
            resena_hecho: string | null;
            fecha_creacion: Date | null;
            eliminado: boolean;
            estado: string | null;
            derivaciones: {
                id: number;
                tipo_derivacion_id: number | null;
            }[];
            seguimientos: {
                id: number;
                tipo: {
                    id: number;
                }[];
                detalles: {
                    id: number;
                }[];
            }[];
            victimas: {
                id: number;
            }[];
            abusos_sexuales: {
                id: number;
            }[];
            acciones_primera_linea: {
                id: number;
            }[];
            hechos_delictivos: {
                id: number;
            }[];
            intervenciones_tipo: {
                id: number;
            }[];
        }[];
    }>;
    updateIntervencion(id: string, updateIntervencionDto: UpdateIntervencionDto): Promise<{
        success: boolean;
        message: string;
        data: {
            derivaciones: {
                id: number;
                intervencion_id: number | null;
                tipo_derivacion_id: number | null;
                derivador: string | null;
                fecha_derivacion: Date | null;
            }[];
            seguimientos: ({
                tipo: {
                    id: number;
                    seguimiento_id: number | null;
                    asesoramientolegal: boolean | null;
                    tratamientopsicologico: boolean | null;
                    seguimientolegal: boolean | null;
                    archivocaso: boolean | null;
                }[];
                detalles: {
                    id: number;
                    seguimiento_id: number;
                    detalle: string | null;
                }[];
            } & {
                id: number;
                intervencion_id: number | null;
                hubo: boolean | null;
            })[];
            victimas: ({
                direccion: {
                    id: number;
                    barrio: string | null;
                    departamento: string | null;
                    localidad: string | null;
                    calle_nro: string | null;
                } | null;
                personas_entrevistadas: {
                    id: number;
                    nombre: string | null;
                    direccion_id: number | null;
                    relacion_victima: string | null;
                    victima_id: number | null;
                }[];
            } & {
                id: number;
                intervencion_id: number | null;
                cantidad_victima_por_hecho: number | null;
                dni: string | null;
                nombre: string | null;
                genero_id: number | null;
                fecha_nacimiento: Date | null;
                telefono: string | null;
                ocupacion: string | null;
                direccion_id: number | null;
            })[];
            abusos_sexuales: ({
                datos: {
                    id: number;
                    kit: string | null;
                    relacion: string | null;
                    relacion_otro: string | null;
                    lugar_hecho: string | null;
                    lugar_otro: string | null;
                    abuso_sexual_id: number | null;
                }[];
            } & {
                id: number;
                intervencion_id: number | null;
                tipo_abuso: number | null;
            })[];
            acciones_primera_linea: {
                id: number;
                fecha: Date | null;
                intervencion_id: number | null;
                acciones: string | null;
                user_audit: number | null;
            }[];
            hechos_delictivos: ({
                geo: {
                    id: number;
                    fecha: Date | null;
                    hecho_delictivo_id: number | null;
                    domicilio: string | null;
                    departamento_id: number | null;
                }[];
                relaciones: {
                    id: number;
                    robo: boolean | null;
                    amenazas: boolean | null;
                    lesiones: boolean | null;
                    femicidio: boolean | null;
                    otros: boolean | null;
                    hecho_delictivo_id: number | null;
                    robo_arma_fuego: boolean | null;
                    robo_arma_blanca: boolean | null;
                    lesiones_arma_fuego: boolean | null;
                    lesiones_arma_blanca: boolean | null;
                    homicidio_delito: boolean | null;
                    homicidio_accidente_vial: boolean | null;
                    homicidio_av_hecho: boolean | null;
                    travestisidio_transfemicidio: boolean | null;
                    violencia_genero: boolean | null;
                }[];
            } & {
                id: number;
                intervencion_id: number | null;
                expediente: string | null;
                num_agresores: number | null;
                fecha_created: Date | null;
            })[];
            intervenciones_tipo: {
                id: number;
                intervencion_id: number | null;
                crisis: boolean | null;
                telefonica: boolean | null;
                domiciliaria: boolean | null;
                psicologica: boolean | null;
                medica: boolean | null;
                social: boolean | null;
                legal: boolean | null;
                sin_intervencion: boolean | null;
                archivo_caso: boolean | null;
            }[];
        } & {
            id: number;
            numero_intervencion: string;
            fecha: Date;
            coordinador: string | null;
            operador: string | null;
            resena_hecho: string | null;
            fecha_creacion: Date | null;
            eliminado: boolean;
            estado: string | null;
        };
    }>;
}
