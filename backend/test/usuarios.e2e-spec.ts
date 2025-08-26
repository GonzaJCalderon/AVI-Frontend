import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import { DatabaseService } from '../src/database/database.service';

describe('Usuarios (e2e)', () => {
  let app: INestApplication;

  const usuariosData = [
    { id: 1, email: 'a@a.com', nombre: 'A', rol: 'usuario', activo: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 2, email: 'b@b.com', nombre: 'B', rol: 'admin', activo: false, createdAt: new Date(), updatedAt: new Date() },
  ];

  const prismaMock = {
    usuario: {
      findMany: jest.fn().mockResolvedValue(usuariosData),
      findUnique: jest.fn().mockImplementation(({ where: { id } }: any) => {
        return Promise.resolve(usuariosData.find((u) => u.id === id) || null);
      }),
      update: jest.fn().mockImplementation(({ where: { id }, data }: any) => {
        const idx = usuariosData.findIndex((u) => u.id === id);
        if (idx === -1) throw new Error('Not found');
        usuariosData[idx] = {
          ...usuariosData[idx],
          ...data,
          updatedAt: new Date(),
        } as any;
        return Promise.resolve(usuariosData[idx]);
      }),
    },
  } as any;

  const dbMock: Partial<DatabaseService> = {
    prisma: prismaMock,
  } as any;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideProvider(DatabaseService)
      .useValue(dbMock)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /usuarios - debe listar usuarios', async () => {
    const res = await request(app.getHttpServer()).get('/usuarios').expect(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(2);
  });

  it('PATCH /usuarios/:id - actualiza y devuelve usuario', async () => {
    const res = await request(app.getHttpServer())
      .patch('/usuarios/1')
      .send({ nombre: 'Nuevo', rol: 'admin', activo: true })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.nombre).toBe('Nuevo');
    expect(res.body.data.rol).toBe('admin');
    expect(res.body.data.activo).toBe(true);
  });
});
