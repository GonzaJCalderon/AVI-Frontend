'use client';

import React from 'react';

const FormularioAccionPage = () => {
  const handlePrint = () => window.print();

  return (
    <main className="bg-white text-black mx-auto max-w-[850px] px-16 py-12 text-[14px] font-sans leading-relaxed print:px-0 print:py-0">
      <div className="space-y-6">

        <h1 className="text-center text-lg font-bold uppercase">Centro de Asistencia a Víctimas del Delito</h1>
        <h2 className="text-center text-base font-semibold uppercase mb-6">Protocolo de Asistencia</h2>

        <div>
          <p><strong>1. DATOS DE LA INTERVENCIÓN</strong></p>
          <p>Fecha: _______________________________ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Coordinador: ___________________________________</p>
          <p>Nro de Ficha: _________________________ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Operador: ______________________________________</p>
          <p className="mt-2">Breve reseña del hecho:</p>
          <div className="border border-black h-20 my-2" />
        </div>

        <div>
          <p><strong>2. DERIVACIÓN</strong></p>
          <p>Nombre y Apellido del Derivador: ____________________________________________ Hora: __________</p>
          <p className="mt-2">
            [ ] CEO 911 &nbsp;&nbsp;&nbsp;&nbsp;
            [ ] Min. Seguridad &nbsp;&nbsp;&nbsp;&nbsp;
            [ ] Min. Público Fiscal &nbsp;&nbsp;&nbsp;&nbsp;
            [ ] Municipio &nbsp;&nbsp;&nbsp;&nbsp;
            [ ] Hospital &nbsp;&nbsp;&nbsp;&nbsp;
            [ ] Centro de Salud &nbsp;&nbsp;&nbsp;&nbsp;
            [ ] Demanda espontánea &nbsp;&nbsp;&nbsp;&nbsp;
            [ ] Otro
          </p>
        </div>

        <div>
          <p><strong>3. DATOS DEL HECHO DELICTIVO</strong></p>
          <p>Número de Expediente: ____________________________ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Nros de Agresores: ________________</p>
          <p className="mt-2">
            [ ] Robo &nbsp; [ ] Homicidio &nbsp; [ ] Violencia de género &nbsp; [ ] Robo con arma de fuego &nbsp; [ ] Homicidio por accidente vial &nbsp; [ ] Abuso sexual simple <br />
            [ ] Robo con arma blanca &nbsp; [ ] Homicidio/Av. Hecho &nbsp; [ ] Abuso sexual agravado &nbsp; [ ] Lesiones &nbsp; [ ] Homicidio por delito &nbsp; [ ] Travestisidio/transfemicidio <br />
            [ ] Lesiones con arma de fuego &nbsp; [ ] Amenazas &nbsp; [ ] Otros &nbsp; [ ] Lesiones con arma blanca &nbsp; [ ] Femicidio
          </p>
          <p className="mt-2">Ubicación geográfica del hecho:</p>
          <div className="border border-black h-10 my-2" />
          <p>Departamento: __________________________________________</p>
          <p>Fecha del hecho: _______________________ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Hora del hecho: _______________________</p>
        </div>

        <div>
          <p><strong>4. ACCIONES REALIZADAS EN PRIMERA LÍNEA</strong></p>
          <div className="border border-black h-24 my-2" />
        </div>

        <div>
          <p><strong>5. ABUSO SEXUAL</strong></p>
          <p>Aplicación del kit: [ ] SI &nbsp;&nbsp;&nbsp;&nbsp; [ ] NO</p>
          <p className="mt-2">Relación entre la víctima y presunto agresor:</p>
          <p>[ ] Conocido &nbsp;&nbsp; [ ] Desconocido &nbsp;&nbsp; [ ] Familiar &nbsp;&nbsp; [ ] Pareja &nbsp;&nbsp; [ ] Otro</p>
          <p className="mt-2">Tipo del lugar del hecho:</p>
          <p>[ ] Institución &nbsp;&nbsp; [ ] Vía Pública &nbsp;&nbsp; [ ] Domicilio particular &nbsp;&nbsp; [ ] Lugar de trabajo &nbsp;&nbsp; [ ] Otro</p>
        </div>

        <div>
          <p><strong>6. VÍCTIMA</strong></p>
          <p>Cantidad de víctimas: ______________________</p>
          <p>Identificación:</p>
          <p>
            DNI: ________________ &nbsp;&nbsp;&nbsp;&nbsp; Apellido: __________________________ &nbsp;&nbsp;&nbsp;&nbsp; Nombres: _______________________________
          </p>
          <p>
            Género: [ ] M &nbsp;&nbsp; [ ] F &nbsp;&nbsp; [ ] X &nbsp;&nbsp;&nbsp;&nbsp;
            Fecha de nacimiento: ___ / ___ / ____ &nbsp;&nbsp;&nbsp;&nbsp; Teléfono: _________________________
          </p>
          <p>
            Domicilio: ___________________________________________________________ &nbsp;&nbsp;&nbsp;&nbsp; Departamento: _______________
          </p>
          <p>
            Ocupación: __________________________________________________________________________________
          </p>
          <p className="mt-2">Persona entrevistada:</p>
          <p>Nombre y Apellido: _______________________________________________________________________</p>
          <p>Domicilio: _________________________________________________________________________________</p>
          <p>Departamento: _____________________________</p>
          <p>Relación con la víctima: ____________________________________________________________________</p>
        </div>

        <div>
          <p><strong>7. TIPO DE INTERVENCIÓN</strong></p>
          <p>
            [ ] Intervención en crisis &nbsp;&nbsp;&nbsp;&nbsp;
            [ ] Intervención social &nbsp;&nbsp;&nbsp;&nbsp;
            [ ] Intervención legal &nbsp;&nbsp;&nbsp;&nbsp;
            [ ] Intervención telefónica &nbsp;&nbsp;&nbsp;&nbsp;
            [ ] Intervención psicológica &nbsp;&nbsp;&nbsp;&nbsp;
            [ ] Intervención médica &nbsp;&nbsp;&nbsp;&nbsp;
            [ ] Intervención domiciliaria &nbsp;&nbsp;&nbsp;&nbsp;
            [ ] Sin intervención &nbsp;&nbsp;&nbsp;&nbsp;
            [ ] Archivo
          </p>
          <p className="mt-2">Detalle de la intervención:</p>
          <div className="border border-black h-24 my-2" />
          <p>¿Se realizó seguimiento?: [ ] SI &nbsp;&nbsp; [ ] NO</p>
          <p className="mt-2">
            Tipo de seguimiento: &nbsp;
            [ ] Asesoramiento legal &nbsp;&nbsp;&nbsp;&nbsp;
            [ ] Tratamiento psicológico &nbsp;&nbsp;&nbsp;&nbsp;
            [ ] Seguimiento legal &nbsp;&nbsp;&nbsp;&nbsp;
            [ ] Archivo
          </p>
        </div>

        {/* Botón imprimir */}
        <div className="flex justify-end mt-8 no-print">
          <button
            onClick={handlePrint}
            className="bg-primary text-white px-6 py-2 rounded hover:bg-primary/90 transition"
          >
            Imprimir formulario
          </button>
        </div>
      </div>
    </main>
  );
};

export default FormularioAccionPage;
