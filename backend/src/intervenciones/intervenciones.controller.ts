// src/intervenciones/intervenciones.controller.ts
import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpException,
  HttpStatus,
  UseGuards,
  Patch,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { IntervencionesService } from "./intervenciones.service";
import { CreateIntervencionDto } from "./dto/create-intervencion.dto";
import { UpdateIntervencionDto } from "./dto/update-intervencion.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("intervenciones")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("intervenciones")
export class IntervencionesController {
  constructor(private readonly intervencionesService: IntervencionesService) {}

  @Post()
  @ApiOperation({
    summary: "Crear una nueva intervención",
    description:
      "Registra una nueva intervención con todos sus datos relacionados",
  })
  @ApiBody({
    type: CreateIntervencionDto,
    description: "Datos de la intervención a crear",
  })
  @ApiResponse({
    status: 201,
    description: "Intervención creada exitosamente",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        message: {
          type: "string",
          example: "Intervención registrada correctamente.",
        },
        codigo: { type: "string", example: "INT-2024-001" },
        data: { type: "object" },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: "Error interno del servidor",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: false },
        message: {
          type: "string",
          example: "Error al registrar la intervención",
        },
        codigo: { type: "null", example: null },
      },
    },
  })
  async createIntervencion(
    @Body() createIntervencionDto: CreateIntervencionDto
  ) {
    try {
      const result = await this.intervencionesService.createIntervencion(
        createIntervencionDto
      );

      return {
        success: true,
        message: "Intervención registrada correctamente.",
        codigo: result.codigo,
        data: result.data,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: `Error al registrar la intervención: ${error.message}`,
          codigo: null,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get()
  @ApiOperation({
    summary: "Listar todas las intervenciones",
    description: "Obtiene una lista de todas las intervenciones registradas",
  })
  @ApiResponse({
    status: 200,
    description: "Lista de intervenciones obtenida exitosamente",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        message: {
          type: "string",
          example: "Intervenciones obtenidas correctamente.",
        },
        data: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "number", example: 1 },
              numero_intervencion: { type: "string", example: "INT-2024-001" },
              fecha: { type: "string", example: "2024-01-15T00:00:00.000Z" },
              coordinador: { type: "string", example: "Juan Pérez" },
              operador: { type: "string", example: "María García" },
              reseña_hecho: { type: "string", example: "Robo en domicilio..." },
              eliminado: { type: "boolean", example: false },
              estado: { type: "string", example: "activo" },
              fecha_creacion: {
                type: "string",
                example: "2024-01-15T10:30:00.000Z",
              },
              _count: {
                type: "object",
                properties: {
                  derivaciones: { type: "number", example: 1 },
                  hechos_delictivos: { type: "number", example: 1 },
                  victimas: { type: "number", example: 1 },
                  seguimientos: { type: "number", example: 1 },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: "Error interno del servidor",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: false },
        message: {
          type: "string",
          example: "Error al obtener las intervenciones",
        },
        data: { type: "null", example: null },
      },
    },
  })
  async findAll() {
    try {
      const intervenciones = await this.intervencionesService.findAll();

      return {
        success: true,
        message: "Intervenciones obtenidas correctamente.",
        data: intervenciones,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: `Error al obtener las intervenciones: ${error.message}`,
          data: null,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(":id")
  @ApiOperation({
    summary: "Obtener una intervención específica",
    description: "Obtiene los detalles completos de una intervención por su ID",
  })
  @ApiParam({
    name: "id",
    description: "ID de la intervención",
    type: "number",
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: "Intervención obtenida exitosamente",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        message: {
          type: "string",
          example: "Intervención obtenida correctamente.",
        },
        data: {
          type: "object",
          properties: {
            id: { type: "number", example: 1 },
            numero_intervencion: { type: "string", example: "INT-2024-001" },
            fecha: { type: "string", example: "2024-01-15T00:00:00.000Z" },
            coordinador: { type: "string", example: "Juan Pérez" },
            operador: { type: "string", example: "María García" },
            reseña_hecho: { type: "string", example: "Robo en domicilio..." },
            fecha_creacion: {
              type: "string",
              example: "2024-01-15T10:30:00.000Z",
            },
            derivaciones: { type: "array" },
            hechos_delictivos: { type: "array" },
            victimas: { type: "array" },
            personas_entrevistadas: { type: "array" },
            seguimientos: { type: "array" },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "Intervención no encontrada",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: false },
        message: {
          type: "string",
          example: "Intervención no encontrada",
        },
        data: { type: "null", example: null },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: "Error interno del servidor",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: false },
        message: {
          type: "string",
          example: "Error al obtener la intervención",
        },
        data: { type: "null", example: null },
      },
    },
  })
  async findOne(@Param("id") id: string) {
    try {
      const intervencion = await this.intervencionesService.findOne(+id);

      if (!intervencion) {
        throw new HttpException(
          {
            success: false,
            message: "Intervención no encontrada",
            data: null,
          },
          HttpStatus.NOT_FOUND
        );
      }

      return {
        success: true,
        message: "Intervención obtenida correctamente.",
        data: intervencion,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          message: `Error al obtener la intervención: ${error.message}`,
          data: null,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Patch(":id")
  @ApiOperation({
    summary: "Actualizar una intervención",
    description:
      "Actualiza parcial o totalmente una intervención completa por su ID",
  })
  @ApiParam({
    name: "id",
    description: "ID de la intervención",
    type: "number",
  })
  @ApiBody({
    type: UpdateIntervencionDto,
    description: "Campos a actualizar",
    examples: {
      actualizarBasicos: {
        summary: "Actualizar datos básicos y tipo",
        value: {
          intervencion: {
            coordinador: "Coordinador X",
            operador: "Operador Y",
          },
          tipoIntervencion: { crisis: true, telefonica: false },
        },
      },
      actualizarHechoYGeo: {
        summary: "Actualizar hecho delictivo y geolocalización",
        value: {
          hechoDelictivo: {
            expediente: "EXP-123",
            numAgresores: 2,
            tipoHecho: { robo: true, lesiones: false },
            ubicacion: { calleBarrio: "Calle 123", departamento: 5 },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: "Intervención actualizada exitosamente",
  })
  @ApiResponse({ status: 404, description: "Intervención no encontrada" })
  @ApiResponse({ status: 500, description: "Error interno del servidor" })
  async update(
    @Param("id") id: string,
    @Body() updateIntervencionDto: UpdateIntervencionDto
  ) {
    try {
      const updated = await this.intervencionesService.updateIntervencion(
        +id,
        updateIntervencionDto
      );
      if (!updated) {
        throw new HttpException(
          { success: false, message: "Intervención no encontrada", data: null },
          HttpStatus.NOT_FOUND
        );
      }
      return {
        success: true,
        message: "Intervención actualizada correctamente.",
        data: updated,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        {
          success: false,
          message: `Error al actualizar la intervención: ${error.message}`,
          data: null,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Patch(":id/eliminar")
  @ApiOperation({
    summary: "Eliminar una intervención lógicamente",
    description:
      "Elimina una intervención de forma lógica, cambiando su estado a 'eliminado'",
  })
  @ApiParam({
    name: "id",
    description: "ID de la intervención",
    type: "number",
  })
  @ApiResponse({
    status: 200,
    description: "Intervención eliminada lógicamente",
  })
  @ApiResponse({ status: 404, description: "Intervención no encontrada" })
  @ApiResponse({ status: 500, description: "Error interno del servidor" })
  async eliminarLogico(@Param("id") id: number) {
    return this.intervencionesService.eliminarLogico(Number(id));
  }

  @Patch(":id/cerrar")
  @ApiOperation({
    summary: "Cerrar una intervención",
    description: "Cierra una intervención, cambiando su estado a 'cerrado'",
  })
  @ApiParam({
    name: "id",
    description: "ID de la intervención",
    type: "number",
  })
  @ApiResponse({
    status: 200,
    description: "Intervención cerrada exitosamente",
  })
  @ApiResponse({ status: 404, description: "Intervención no encontrada" })
  @ApiResponse({ status: 500, description: "Error interno del servidor" })
  async cerrarIntervencion(@Param("id") id: number) {
    return this.intervencionesService.cerrarIntervencion(Number(id));
  }

  @Patch(":id/archivar")
  @ApiOperation({
    summary: "Archivar una intervención",
    description: "Archiva una intervención, cambiando su estado a 'archivado'",
  })
  @ApiParam({
    name: "id",
    description: "ID de la intervención",
    type: "number",
  })
  @ApiResponse({
    status: 200,
    description: "Intervención archivada exitosamente",
  })
  @ApiResponse({ status: 404, description: "Intervención no encontrada" })
  @ApiResponse({ status: 500, description: "Error interno del servidor" })
  async archivarIntervencion(@Param("id") id: number) {
    return this.intervencionesService.archivarIntervencion(Number(id));
  }

  //listar todas las intervenciones NO ACTIVAS
  @Get("no-activas/all")
  @ApiOperation({
    summary: "Listar todas las intervencione no activas",
    description:
      "Obtiene una lista de todas las intervenciones registradas no activas",
  })
  @ApiResponse({
    status: 200,
    description: "Lista de intervenciones no activas obtenida exitosamente",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        message: {
          type: "string",
          example: "Intervenciones obtenidas correctamente.",
        },
        data: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "number", example: 1 },
              numero_intervencion: { type: "string", example: "INT-2024-001" },
              fecha: { type: "string", example: "2024-01-15T00:00:00.000Z" },
              coordinador: { type: "string", example: "Juan Pérez" },
              operador: { type: "string", example: "María García" },
              reseña_hecho: { type: "string", example: "Robo en domicilio..." },
              estado: { type: "string", example: "cerrado" },
              eliminado: { type: "boolean", example: false },
              fecha_creacion: {
                type: "string",
                example: "2024-01-15T10:30:00.000Z",
              },
              _count: {
                type: "object",
                properties: {
                  derivaciones: { type: "number", example: 1 },
                  hechos_delictivos: { type: "number", example: 1 },
                  victimas: { type: "number", example: 1 },
                  seguimientos: { type: "number", example: 1 },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: "Error interno del servidor",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: false },
        message: {
          type: "string",
          example: "Error al obtener las intervenciones",
        },
        data: { type: "null", example: null },
      },
    },
  })
  async findAllNoActivas() {
    try {
      const intervenciones_no_activas =
        await this.intervencionesService.findAllNoActivas();

      return {
        success: true,
        message: "Intervenciones no activas obtenidas correctamente.",
        data: intervenciones_no_activas,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: `Error al obtener las intervenciones: ${error.message}`,
          data: null,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Patch(":id")
  @ApiOperation({
    summary: "Actualizar completamente una intervención",
  })
  @ApiResponse({
    status: 200,
    description: "Intervención actualizada correctamente",
  })
  @ApiResponse({ status: 404, description: "Intervención no encontrada" })
  @ApiResponse({ status: 400, description: "ID inválido" })
  async updateIntervencion(
    @Param("id") id: string,
    @Body() updateIntervencionDto: UpdateIntervencionDto
  ) {
    const numId = Number(id);
    if (!numId || isNaN(numId)) {
      throw new HttpException(
        { success: false, message: "ID inválido", data: null },
        HttpStatus.BAD_REQUEST
      );
    }
    const result = await this.intervencionesService.updateIntervencion(
      numId,
      updateIntervencionDto
    );
    if (!result) {
      throw new HttpException(
        { success: false, message: "Intervención no encontrada", data: null },
        HttpStatus.NOT_FOUND
      );
    }
    return {
      success: true,
      message: "Intervención actualizada correctamente",
      data: result,
    };
  }
}
