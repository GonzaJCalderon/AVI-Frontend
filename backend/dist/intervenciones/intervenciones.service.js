"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntervencionesService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
let IntervencionesService = class IntervencionesService {
    databaseService;
    constructor(databaseService) {
        this.databaseService = databaseService;
    }
    async findAll() {
        const { prisma } = this.databaseService;
        try {
            const intervenciones = await prisma.intervenciones.findMany({
                where: { eliminado: false, estado: "activa" },
                select: {
                    id: true,
                    numero_intervencion: true,
                    fecha: true,
                    coordinador: true,
                    operador: true,
                    fecha_creacion: true,
                    resena_hecho: true,
                    derivaciones: {
                        select: {
                            id: true,
                            tipo_derivacion_id: true,
                        },
                    },
                    hechos_delictivos: {
                        select: {
                            id: true,
                        },
                    },
                    victimas: {
                        select: {
                            id: true,
                        },
                    },
                    abusos_sexuales: {
                        select: {
                            id: true,
                        },
                    },
                    acciones_primera_linea: {
                        select: {
                            id: true,
                        },
                    },
                    intervenciones_tipo: {
                        select: {
                            id: true,
                        },
                    },
                    seguimientos: {
                        select: {
                            id: true,
                            tipo: {
                                select: {
                                    id: true,
                                },
                            },
                            detalles: {
                                select: {
                                    id: true,
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    fecha_creacion: "desc",
                },
            });
            return intervenciones;
        }
        catch (error) {
            console.error("Error al obtener intervenciones:", error);
            throw error;
        }
    }
    async findOne(id) {
        const { prisma } = this.databaseService;
        try {
            const intervencion = await prisma.intervenciones.findUnique({
                where: { id },
                include: {
                    derivaciones: {
                        include: {
                            tipo_derivaciones: true,
                        },
                    },
                    hechos_delictivos: {
                        include: {
                            geo: {
                                include: {
                                    departamentos: true,
                                },
                            },
                            relaciones: true,
                        },
                    },
                    victimas: {
                        include: {
                            direccion: true,
                            generos: true,
                            personas_entrevistadas: {
                                include: {
                                    direccion: true,
                                },
                            },
                        },
                    },
                    abusos_sexuales: {
                        include: {
                            datos: true,
                        },
                    },
                    acciones_primera_linea: true,
                    intervenciones_tipo: true,
                    seguimientos: {
                        include: {
                            tipo: true,
                            detalles: true,
                        },
                    },
                },
            });
            return intervencion;
        }
        catch (error) {
            console.error("Error al obtener intervención:", error);
            throw error;
        }
    }
    async createIntervencion(createIntervencionDto) {
        const { prisma } = this.databaseService;
        try {
            const result = await prisma.$transaction(async (tx) => {
                const codigo = await this.databaseService.generarCodigoUnico();
                const intervencion = await tx.intervenciones.create({
                    data: {
                        numero_intervencion: codigo,
                        fecha: new Date(),
                        coordinador: createIntervencionDto.intervencion.coordinador,
                        operador: createIntervencionDto.intervencion.operador,
                        resena_hecho: createIntervencionDto.intervencion.resena_hecho,
                    },
                });
                const derivacion = await tx.derivaciones.create({
                    data: {
                        intervencion_id: intervencion.id,
                        tipo_derivacion_id: createIntervencionDto.derivacion.motivos,
                        derivador: createIntervencionDto.derivacion.derivador,
                        fecha_derivacion: new Date(createIntervencionDto.derivacion.hora),
                    },
                });
                const hechoDelictivo = await tx.hechosDelictivos.create({
                    data: {
                        intervencion_id: intervencion.id,
                        expediente: createIntervencionDto.hechoDelictivo.expediente,
                        num_agresores: createIntervencionDto.hechoDelictivo.numAgresores,
                    },
                });
                const tipoHecho = createIntervencionDto.hechoDelictivo.tipoHecho;
                await tx.hechosDelictivosRelaciones.create({
                    data: {
                        hecho_delictivo_id: hechoDelictivo.id,
                        robo: this.databaseService.convertirBooleano(tipoHecho.robo),
                        robo_arma_fuego: this.databaseService.convertirBooleano(tipoHecho.roboArmaFuego),
                        robo_arma_blanca: this.databaseService.convertirBooleano(tipoHecho.roboArmaBlanca),
                        amenazas: this.databaseService.convertirBooleano(tipoHecho.amenazas),
                        lesiones: this.databaseService.convertirBooleano(tipoHecho.lesiones),
                        lesiones_arma_fuego: this.databaseService.convertirBooleano(tipoHecho.lesionesArmaFuego),
                        lesiones_arma_blanca: this.databaseService.convertirBooleano(tipoHecho.lesionesArmaBlanca),
                        homicidio_delito: this.databaseService.convertirBooleano(tipoHecho.homicidioDelito),
                        homicidio_accidente_vial: this.databaseService.convertirBooleano(tipoHecho.homicidioAccidenteVial),
                        homicidio_av_hecho: this.databaseService.convertirBooleano(tipoHecho.homicidioAvHecho),
                        femicidio: this.databaseService.convertirBooleano(tipoHecho.femicidio),
                        travestisidio_transfemicidio: this.databaseService.convertirBooleano(tipoHecho.travestisidioTransfemicidio),
                        violencia_genero: this.databaseService.convertirBooleano(tipoHecho.violenciaGenero),
                        otros: this.databaseService.convertirBooleano(tipoHecho.otros),
                    },
                });
                await tx.hechosDelictivosGeo.create({
                    data: {
                        hecho_delictivo_id: hechoDelictivo.id,
                        domicilio: createIntervencionDto.hechoDelictivo.ubicacion.calleBarrio,
                        departamento_id: createIntervencionDto.hechoDelictivo.ubicacion.departamento,
                    },
                });
                await tx.accionesPrimeraLinea.create({
                    data: {
                        intervencion_id: intervencion.id,
                        acciones: createIntervencionDto.accionesPrimeraLinea,
                        user_audit: 1,
                    },
                });
                const abusoSexual = createIntervencionDto.abusoSexual;
                let tipoAbuso = 0;
                if (abusoSexual.simple)
                    tipoAbuso = 1;
                if (abusoSexual.agravado)
                    tipoAbuso = 2;
                const abuso = await tx.abusosSexuales.create({
                    data: {
                        intervencion_id: intervencion.id,
                        tipo_abuso: tipoAbuso,
                    },
                });
                await tx.datosAbusosSexuales.create({
                    data: {
                        abuso_sexual_id: abuso.id,
                        kit: createIntervencionDto.datosAbusoSexual.kit,
                        relacion: createIntervencionDto.datosAbusoSexual.relacion,
                        relacion_otro: createIntervencionDto.datosAbusoSexual.relacionOtro,
                        lugar_hecho: createIntervencionDto.datosAbusoSexual.lugarHecho,
                        lugar_otro: createIntervencionDto.datosAbusoSexual.lugarOtro,
                    },
                });
                const direccionVictima = await tx.direcciones.create({
                    data: {
                        calle_nro: createIntervencionDto.victima.direccion.calleNro,
                        barrio: createIntervencionDto.victima.direccion.barrio,
                        departamento: createIntervencionDto.victima.direccion.departamento.toString(),
                        localidad: createIntervencionDto.victima.direccion.localidad.toString(),
                    },
                });
                const victima = await tx.victimas.create({
                    data: {
                        dni: createIntervencionDto.victima.dni,
                        nombre: createIntervencionDto.victima.nombre,
                        genero_id: createIntervencionDto.victima.genero,
                        fecha_nacimiento: new Date(createIntervencionDto.victima.fechaNacimiento),
                        telefono: createIntervencionDto.victima.telefono,
                        ocupacion: createIntervencionDto.victima.ocupacion,
                        direccion_id: direccionVictima.id,
                        intervencion_id: intervencion.id,
                        cantidad_victima_por_hecho: 1,
                    },
                });
                const direccionEntrevistada = await tx.direcciones.create({
                    data: {
                        calle_nro: createIntervencionDto.personaEntrevistada.direccion.calleNro,
                        barrio: createIntervencionDto.personaEntrevistada.direccion.barrio,
                        departamento: createIntervencionDto.personaEntrevistada.direccion.departamento.toString(),
                        localidad: createIntervencionDto.personaEntrevistada.direccion.localidad.toString(),
                    },
                });
                const personaEntrevistada = await tx.personasEntrevistadas.create({
                    data: {
                        nombre: createIntervencionDto.personaEntrevistada.nombre,
                        relacion_victima: createIntervencionDto.personaEntrevistada.relacionVictima,
                        direccion_id: direccionEntrevistada.id,
                        victima_id: victima.id,
                    },
                });
                const tipoIntervencion = createIntervencionDto.tipoIntervencion;
                await tx.intervencionesTipo.create({
                    data: {
                        intervencion_id: intervencion.id,
                        crisis: this.databaseService.convertirBooleano(tipoIntervencion.crisis),
                        telefonica: this.databaseService.convertirBooleano(tipoIntervencion.telefonica),
                        domiciliaria: this.databaseService.convertirBooleano(tipoIntervencion.domiciliaria),
                        psicologica: this.databaseService.convertirBooleano(tipoIntervencion.psicologica),
                        medica: this.databaseService.convertirBooleano(tipoIntervencion.medica),
                        social: this.databaseService.convertirBooleano(tipoIntervencion.social),
                        legal: this.databaseService.convertirBooleano(tipoIntervencion.legal),
                        sin_intervencion: this.databaseService.convertirBooleano(tipoIntervencion.sinIntervencion),
                        archivo_caso: this.databaseService.convertirBooleano(tipoIntervencion.archivoCaso),
                    },
                });
                const seguimiento = await tx.seguimientos.create({
                    data: {
                        intervencion_id: intervencion.id,
                        hubo: this.databaseService.convertirBooleanoDos(createIntervencionDto.seguimiento.realizado),
                    },
                });
                const seguimientoTipo = createIntervencionDto.seguimiento.tipo;
                await tx.seguimientosTipo.create({
                    data: {
                        seguimiento_id: seguimiento.id,
                        asesoramientolegal: this.databaseService.convertirBooleano(seguimientoTipo.asesoramientoLegal),
                        tratamientopsicologico: this.databaseService.convertirBooleano(seguimientoTipo.tratamientoPsicologico),
                        seguimientolegal: this.databaseService.convertirBooleano(seguimientoTipo.seguimientoLegal),
                        archivocaso: this.databaseService.convertirBooleano(seguimientoTipo.archivoCaso),
                    },
                });
                await tx.seguimientosDetalle.create({
                    data: {
                        seguimiento_id: seguimiento.id,
                        detalle: createIntervencionDto.detalleSeguimiento,
                    },
                });
                return {
                    codigo,
                    data: {
                        intervencion_id: intervencion.id,
                        derivacion_id: derivacion.id,
                        hecho_delictivo_id: hechoDelictivo.id,
                        victima_id: victima.id,
                        persona_entrevistada_id: personaEntrevistada.id,
                        seguimiento_id: seguimiento.id,
                    },
                };
            });
            return result;
        }
        catch (error) {
            console.error("Error en transacción:", error);
            throw error;
        }
    }
    async updateRelatedEntity(tx, model, where, data) {
        if (!data)
            return;
        const entity = await model.findFirst({ where });
        if (entity) {
            const updateData = Object.entries(data).reduce((acc, [key, value]) => {
                if (value !== undefined)
                    acc[key] = value;
                return acc;
            }, {});
            if (Object.keys(updateData).length > 0)
                await model.update({ where: { id: entity.id }, data: updateData });
        }
    }
    async updateIntervencion(id, update) {
        const { prisma } = this.databaseService;
        try {
            const exists = await prisma.intervenciones.findUnique({ where: { id } });
            if (!exists)
                return null;
            const result = await prisma.$transaction(async (tx) => {
                if (update.intervencion) {
                    await tx.intervenciones.update({
                        where: { id },
                        data: {
                            coordinador: update.intervencion.coordinador ?? undefined,
                            operador: update.intervencion.operador ?? undefined,
                            resena_hecho: update.intervencion.resena_hecho ?? undefined,
                        },
                    });
                }
                if (update.derivacion) {
                    await this.updateRelatedEntity(tx, tx.derivaciones, { intervencion_id: id }, {
                        derivador: update.derivacion.derivador,
                        tipo_derivacion_id: update.derivacion.motivos,
                        fecha_derivacion: update.derivacion.hora
                            ? new Date(update.derivacion.hora)
                            : undefined,
                    });
                }
                if (update.hechoDelictivo) {
                    const hecho = await tx.hechosDelictivos.findFirst({
                        where: { intervencion_id: id },
                    });
                    if (hecho) {
                        await this.updateRelatedEntity(tx, tx.hechosDelictivos, { id: hecho.id }, {
                            expediente: update.hechoDelictivo.expediente,
                            num_agresores: update.hechoDelictivo.numAgresores,
                        });
                        if (update.hechoDelictivo.tipoHecho) {
                            await this.updateRelatedEntity(tx, tx.hechosDelictivosRelaciones, { hecho_delictivo_id: hecho.id }, {
                                robo: update.hechoDelictivo.tipoHecho.robo,
                                robo_arma_fuego: update.hechoDelictivo.tipoHecho.roboArmaFuego,
                                robo_arma_blanca: update.hechoDelictivo.tipoHecho.roboArmaBlanca,
                                amenazas: update.hechoDelictivo.tipoHecho.amenazas,
                                lesiones: update.hechoDelictivo.tipoHecho.lesiones,
                                lesiones_arma_fuego: update.hechoDelictivo.tipoHecho.lesionesArmaFuego,
                                lesiones_arma_blanca: update.hechoDelictivo.tipoHecho.lesionesArmaBlanca,
                                homicidio_delito: update.hechoDelictivo.tipoHecho.homicidioDelito,
                                homicidio_accidente_vial: update.hechoDelictivo.tipoHecho.homicidioAccidenteVial,
                                homicidio_av_hecho: update.hechoDelictivo.tipoHecho.homicidioAvHecho,
                                femicidio: update.hechoDelictivo.tipoHecho.femicidio,
                                travestisidio_transfemicidio: update.hechoDelictivo.tipoHecho.travestisidioTransfemicidio,
                                violencia_genero: update.hechoDelictivo.tipoHecho.violenciaGenero,
                                otros: update.hechoDelictivo.tipoHecho.otros,
                            });
                        }
                        if (update.hechoDelictivo.ubicacion) {
                            await this.updateRelatedEntity(tx, tx.hechosDelictivosGeo, { hecho_delictivo_id: hecho.id }, {
                                domicilio: update.hechoDelictivo.ubicacion.calleBarrio,
                                departamento_id: update.hechoDelictivo.ubicacion.departamento,
                            });
                        }
                    }
                }
                if (update.accionesPrimeraLinea !== undefined) {
                    const apl = await tx.accionesPrimeraLinea.findFirst({
                        where: { intervencion_id: id },
                    });
                    if (apl) {
                        await tx.accionesPrimeraLinea.update({
                            where: { id: apl.id },
                            data: { acciones: update.accionesPrimeraLinea },
                        });
                    }
                }
                if (update.abusoSexual || update.datosAbusoSexual) {
                    const abuso = await tx.abusosSexuales.findFirst({
                        where: { intervencion_id: id },
                    });
                    if (abuso) {
                        if (update.abusoSexual) {
                            let tipoAbuso = abuso.tipo_abuso ?? 0;
                            if (update.abusoSexual.simple !== undefined ||
                                update.abusoSexual.agravado !== undefined) {
                                if (update.abusoSexual.simple)
                                    tipoAbuso = 1;
                                if (update.abusoSexual.agravado)
                                    tipoAbuso = 2;
                            }
                            await tx.abusosSexuales.update({
                                where: { id: abuso.id },
                                data: { tipo_abuso: tipoAbuso },
                            });
                        }
                        if (update.datosAbusoSexual) {
                            const datos = await tx.datosAbusosSexuales.findFirst({
                                where: { abuso_sexual_id: abuso.id },
                            });
                            if (datos) {
                                await tx.datosAbusosSexuales.update({
                                    where: { id: datos.id },
                                    data: {
                                        kit: update.datosAbusoSexual.kit ?? undefined,
                                        relacion: update.datosAbusoSexual.relacion ?? undefined,
                                        relacion_otro: update.datosAbusoSexual.relacionOtro ?? undefined,
                                        lugar_hecho: update.datosAbusoSexual.lugarHecho ?? undefined,
                                        lugar_otro: update.datosAbusoSexual.lugarOtro ?? undefined,
                                    },
                                });
                            }
                        }
                    }
                }
                if (update.victima) {
                    const victima = await tx.victimas.findFirst({
                        where: { intervencion_id: id },
                    });
                    if (victima) {
                        await tx.victimas.update({
                            where: { id: victima.id },
                            data: {
                                dni: update.victima.dni ?? undefined,
                                nombre: update.victima.nombre ?? undefined,
                                genero_id: update.victima.genero ?? undefined,
                                fecha_nacimiento: update.victima.fechaNacimiento
                                    ? new Date(update.victima.fechaNacimiento)
                                    : undefined,
                                telefono: update.victima.telefono ?? undefined,
                                ocupacion: update.victima.ocupacion ?? undefined,
                            },
                        });
                        if (update.victima.direccion) {
                            const dir = await tx.direcciones.findUnique({
                                where: { id: victima.direccion_id },
                            });
                            if (dir) {
                                await tx.direcciones.update({
                                    where: { id: dir.id },
                                    data: {
                                        calle_nro: update.victima.direccion.calleNro ?? undefined,
                                        barrio: update.victima.direccion.barrio ?? undefined,
                                        departamento: update.victima.direccion.departamento?.toString() ??
                                            undefined,
                                        localidad: update.victima.direccion.localidad?.toString() ??
                                            undefined,
                                    },
                                });
                            }
                        }
                    }
                }
                if (update.personaEntrevistada) {
                    const victima = await tx.victimas.findFirst({
                        where: { intervencion_id: id },
                    });
                    if (victima) {
                        const pe = await tx.personasEntrevistadas.findFirst({
                            where: { victima_id: victima.id },
                        });
                        if (pe) {
                            await tx.personasEntrevistadas.update({
                                where: { id: pe.id },
                                data: {
                                    nombre: update.personaEntrevistada.nombre ?? undefined,
                                    relacion_victima: update.personaEntrevistada.relacionVictima ?? undefined,
                                },
                            });
                            if (update.personaEntrevistada.direccion) {
                                const dir = await tx.direcciones.findUnique({
                                    where: { id: pe.direccion_id },
                                });
                                if (dir) {
                                    await tx.direcciones.update({
                                        where: { id: dir.id },
                                        data: {
                                            calle_nro: update.personaEntrevistada.direccion.calleNro ??
                                                undefined,
                                            barrio: update.personaEntrevistada.direccion.barrio ??
                                                undefined,
                                            departamento: update.personaEntrevistada.direccion.departamento?.toString() ??
                                                undefined,
                                            localidad: update.personaEntrevistada.direccion.localidad?.toString() ??
                                                undefined,
                                        },
                                    });
                                }
                            }
                        }
                    }
                }
                if (update.tipoIntervencion) {
                    const tipo = await tx.intervencionesTipo.findFirst({
                        where: { intervencion_id: id },
                    });
                    if (tipo) {
                        await tx.intervencionesTipo.update({
                            where: { id: tipo.id },
                            data: {
                                crisis: update.tipoIntervencion.crisis ?? undefined,
                                telefonica: update.tipoIntervencion.telefonica ?? undefined,
                                domiciliaria: update.tipoIntervencion.domiciliaria ?? undefined,
                                psicologica: update.tipoIntervencion.psicologica ?? undefined,
                                medica: update.tipoIntervencion.medica ?? undefined,
                                social: update.tipoIntervencion.social ?? undefined,
                                legal: update.tipoIntervencion.legal ?? undefined,
                                sin_intervencion: update.tipoIntervencion.sinIntervencion ?? undefined,
                                archivo_caso: update.tipoIntervencion.archivoCaso ?? undefined,
                            },
                        });
                    }
                }
                if (update.seguimiento || update.detalleSeguimiento !== undefined) {
                    const seg = await tx.seguimientos.findFirst({
                        where: { intervencion_id: id },
                    });
                    if (seg) {
                        if (update.seguimiento) {
                            await tx.seguimientos.update({
                                where: { id: seg.id },
                                data: {
                                    hubo: update.seguimiento.realizado ?? undefined,
                                },
                            });
                            if (update.seguimiento.tipo) {
                                const tipo = await tx.seguimientosTipo.findFirst({
                                    where: { seguimiento_id: seg.id },
                                });
                                if (tipo) {
                                    await tx.seguimientosTipo.update({
                                        where: { id: tipo.id },
                                        data: {
                                            asesoramientolegal: update.seguimiento.tipo.asesoramientoLegal ?? undefined,
                                            tratamientopsicologico: update.seguimiento.tipo.tratamientoPsicologico ??
                                                undefined,
                                            seguimientolegal: update.seguimiento.tipo.seguimientoLegal ?? undefined,
                                            archivocaso: update.seguimiento.tipo.archivoCaso ?? undefined,
                                        },
                                    });
                                }
                            }
                        }
                        if (update.detalleSeguimiento !== undefined) {
                            const det = await tx.seguimientosDetalle.findFirst({
                                where: { seguimiento_id: seg.id },
                            });
                            if (det) {
                                await tx.seguimientosDetalle.update({
                                    where: { id: det.id },
                                    data: { detalle: update.detalleSeguimiento },
                                });
                            }
                        }
                    }
                }
                return tx.intervenciones.findUnique({
                    where: { id },
                    include: {
                        derivaciones: true,
                        hechos_delictivos: { include: { geo: true, relaciones: true } },
                        victimas: {
                            include: { direccion: true, personas_entrevistadas: true },
                        },
                        abusos_sexuales: { include: { datos: true } },
                        acciones_primera_linea: true,
                        intervenciones_tipo: true,
                        seguimientos: { include: { tipo: true, detalles: true } },
                    },
                });
            });
            return result;
        }
        catch (error) {
            console.error("Error al actualizar intervención:", error);
            throw error;
        }
    }
    async eliminarLogico(id) {
        const { prisma } = this.databaseService;
        return prisma.intervenciones.update({
            where: { id },
            data: { eliminado: true, estado: "eliminada" },
        });
    }
    async cerrarIntervencion(id) {
        const { prisma } = this.databaseService;
        return prisma.intervenciones.update({
            where: { id },
            data: { estado: "cerrada" },
        });
    }
    async archivarIntervencion(id) {
        const { prisma } = this.databaseService;
        return prisma.intervenciones.update({
            where: { id },
            data: { estado: "archivada" },
        });
    }
    async findAllNoActivas() {
        const { prisma } = this.databaseService;
        try {
            const intervenciones_no_activas = await prisma.intervenciones.findMany({
                where: { NOT: { estado: "activa" } },
                select: {
                    id: true,
                    numero_intervencion: true,
                    fecha: true,
                    coordinador: true,
                    operador: true,
                    fecha_creacion: true,
                    resena_hecho: true,
                    eliminado: true,
                    estado: true,
                    derivaciones: {
                        select: {
                            id: true,
                            tipo_derivacion_id: true,
                        },
                    },
                    hechos_delictivos: {
                        select: {
                            id: true,
                        },
                    },
                    victimas: {
                        select: {
                            id: true,
                        },
                    },
                    abusos_sexuales: {
                        select: {
                            id: true,
                        },
                    },
                    acciones_primera_linea: {
                        select: {
                            id: true,
                        },
                    },
                    intervenciones_tipo: {
                        select: {
                            id: true,
                        },
                    },
                    seguimientos: {
                        select: {
                            id: true,
                            tipo: {
                                select: {
                                    id: true,
                                },
                            },
                            detalles: {
                                select: {
                                    id: true,
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    fecha_creacion: "desc",
                },
            });
            return intervenciones_no_activas;
        }
        catch (error) {
            console.error("Error al obtener intervenciones:", error);
            throw error;
        }
    }
};
exports.IntervencionesService = IntervencionesService;
exports.IntervencionesService = IntervencionesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], IntervencionesService);
//# sourceMappingURL=intervenciones.service.js.map