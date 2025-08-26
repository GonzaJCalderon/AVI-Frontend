import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import { DatabaseService } from '../src/database/database.service';

const intervencionFull = {
  id: 10,
  derivaciones: [{}],
  hechos_delictivos: [{ id: 100, geo: [{}], relaciones: [{}] }],
  victimas: [{ id: 200, direccion: {}, personas_entrevistadas: [{}] }],
  abusos_sexuales: [{ id: 300, datos: [{}] }],
  acciones_primera_linea: [{}],
  intervenciones_tipo: [{}],
  seguimientos: [{ id: 400, tipo: [{}], detalles: [{}] }],
};

describe('Intervenciones (e2e)', () => {
  let app: INestApplication;

  const prismaMock = {
    intervenciones: {
      findUnique: jest.fn().mockImplementation(({ where: { id } }: any) => {
        if (id === 10) return Promise.resolve({ id: 10 });
        return Promise.resolve(null);
      }),
    },
    $transaction: jest.fn().mockImplementation(async (cb) => {
      const tx = {
        intervenciones: {
          update: jest.fn(),
          findUnique: jest.fn().mockResolvedValue(intervencionFull),
        },
        derivaciones: {
          findFirst: jest.fn().mockResolvedValue({ id: 1 }),
          update: jest.fn(),
        },
        hechosDelictivos: {
          findFirst: jest.fn().mockResolvedValue({ id: 2 }),
          update: jest.fn(),
        },
        hechosDelictivosRelaciones: {
          findFirst: jest.fn().mockResolvedValue({ id: 3 }),
          update: jest.fn(),
        },
        hechosDelictivosGeo: {
          findFirst: jest.fn().mockResolvedValue({ id: 4 }),
          update: jest.fn(),
        },
        accionesPrimeraLinea: {
          findFirst: jest.fn().mockResolvedValue({ id: 5 }),
          update: jest.fn(),
        },
        abusosSexuales: {
          findFirst: jest.fn().mockResolvedValue({ id: 6, tipo_abuso: 0 }),
          update: jest.fn(),
        },
        datosAbusosSexuales: {
          findFirst: jest.fn().mockResolvedValue({ id: 7 }),
          update: jest.fn(),
        },
        victimas: {
          findFirst: jest.fn().mockResolvedValue({ id: 8, direccion_id: 9 }),
          update: jest.fn(),
        },
        direcciones: {
          findUnique: jest.fn().mockResolvedValue({ id: 9 }),
          update: jest.fn(),
        },
        personasEntrevistadas: {
          findFirst: jest.fn().mockResolvedValue({ id: 11, direccion_id: 12 }),
          update: jest.fn(),
        },
        intervencionesTipo: {
          findFirst: jest.fn().mockResolvedValue({ id: 13 }),
          update: jest.fn(),
        },
        seguimientos: {
          findFirst: jest.fn().mockResolvedValue({ id: 14 }),
          update: jest.fn(),
        },
        seguimientosTipo: {
          findFirst: jest.fn().mockResolvedValue({ id: 15 }),
          update: jest.fn(),
        },
        seguimientosDetalle: {
          findFirst: jest.fn().mockResolvedValue({ id: 16 }),
          update: jest.fn(),
        },
      } as any;
      return cb(tx);
    }),
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

  it('PATCH /intervenciones/:id - actualiza intervención completa', async () => {
    const res = await request(app.getHttpServer())
      .patch('/intervenciones/10')
      .send({ intervencion: { coordinador: 'C1' }, accionesPrimeraLinea: 'X' })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(10);
  });

  it('PATCH /intervenciones/:id - 404 si no existe', async () => {
    const res = await request(app.getHttpServer())
      .patch('/intervenciones/999')
      .send({ intervencion: { coordinador: 'C1' } })
      .expect(404);

    expect(res.body.message).toMatch(/no encontrada/i);
  });
});
