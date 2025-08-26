// src/database/database.service.ts
import { Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class DatabaseService implements OnModuleInit {
  public prisma: PrismaClient;

  async onModuleInit() {
    this.prisma = new PrismaClient();
    await this.prisma.$connect();
    console.log(
      "✅ Conexión a base de datos PostgreSQL establecida con Prisma"
    );
  }

  /**
   * Genera un código único aleatorio
   * Equivalente a tu función generarCodigoUnico() en PHP
   */
  async generarCodigoUnico(): Promise<string> {
    const year = new Date().getFullYear();

    // Buscar el último número de intervención para el año actual
    const last = await this.prisma.intervenciones.findFirst({
      where: {
        numero_intervencion: {
          endsWith: `-${year}`,
        },
      },
      orderBy: {
        id: "desc",
      },
    });

    let nextNumber = 1;
    if (last) {
      const [num] = last.numero_intervencion.split("-");
      nextNumber = parseInt(num, 10) + 1;
    }

    // Formatear el número con ceros a la izquierda
    const codigo = `${nextNumber.toString().padStart(4, "0")}-${year}`;

    // Verificar unicidad (por si acaso)
    const existe = await this.prisma.intervenciones.findUnique({
      where: { numero_intervencion: codigo },
    });

    return existe ? this.generarCodigoUnico() : codigo;
  }

  /**
   * Convierte booleano a número
   * Equivalente a tu función convertirBooleano() en PHP
   */
  convertirBooleano(valor: any): boolean {
    return Boolean(valor);
  }

  /**
   * Convierte string 'no' a booleano
   * Equivalente a tu función convertirBooleanoDos() en PHP
   */
  convertirBooleanoDos(valor: any): boolean {
    if (typeof valor === "string") {
      return valor !== "no";
    }
    return Boolean(valor);
  }
}
