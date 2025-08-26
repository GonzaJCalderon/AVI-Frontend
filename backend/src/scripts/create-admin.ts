import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    const hashedPassword = await bcrypt.hash("admin123", 10);

    const adminUser = await prisma.usuario.create({
      data: {
        email: "admin@fav.com",
        password: hashedPassword,
        nombre: "Administrador",
        rol: "admin",
      },
    });

    console.log("Usuario administrador creado exitosamente:", {
      id: adminUser.id,
      email: adminUser.email,
      nombre: adminUser.nombre,
      rol: adminUser.rol,
    });
  } catch (error) {
    console.error("Error al crear usuario administrador:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
