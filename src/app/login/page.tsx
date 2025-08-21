'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';

type LoginResponse =
  | {
      access_token?: string;
      refresh_token?: string;
      token?: string;
      accessToken?: string;
      refreshToken?: string;
      user?: {
        id: string | number;
        email: string;
        nombre?: string;
        rol?: string;
        [k: string]: any;
      };
      [k: string]: any;
    }
  | {
      id: string | number;
      email: string;
      nombre?: string;
      rol?: string;
      access_token?: string;
      refresh_token?: string;
      token?: string;
      accessToken?: string;
      refreshToken?: string;
      [k: string]: any;
    };

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setErrorMsg(null);
  setSubmitting(true);
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        accept: '*/*',
      },
      body: JSON.stringify({
        email: form.email.trim(),
        password: form.password,
      }),
    });

    const text = await res.text();
    let data: LoginResponse | any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    if (!res.ok) {
      const reason =
        (data && (data.message || data.error)) ||
        `Error de autenticación (${res.status})`;
      throw new Error(reason);
    }

    const accessToken =
      (data?.access_token ||
        data?.accessToken ||
        data?.token) as string | undefined;
    const refreshToken =
      (data?.refresh_token || data?.refreshToken) as string | undefined;

    const user =
      (data?.user as any) ??
      (typeof data === 'object' ? data : null);

    if (accessToken) localStorage.setItem('access_token', accessToken);
    if (refreshToken) localStorage.setItem('refresh_token', refreshToken);
    if (accessToken) localStorage.setItem('token', accessToken);
    if (user) localStorage.setItem('user', JSON.stringify(user));

    router.push('/inicio');
  } catch (err: any) {
    setErrorMsg(err?.message || 'No se pudo iniciar sesión');
  } finally {
    setSubmitting(false);
  }
};


  return (
    <Wrapper>
      <div className="left-panel">
        <h1 className="title">Plataforma de Asistencia a Víctimas</h1>
        <h2 className="subtitle">Ministerio de Seguridad y Justicia</h2>
        <img src="/images/logo-png-sin-fondo.png" alt="Logo Mendoza" className="logo" />
      </div>

      <div className="right-panel">
        <form className="form" onSubmit={handleSubmit}>
          <h2>Iniciar sesión</h2>

          {errorMsg && (
            <div
              role="alert"
              style={{
                background: '#ffe6e6',
                color: '#a30000',
                border: '1px solid #ffb3b3',
                borderRadius: 6,
                padding: '8px 10px',
                fontSize: '0.9rem',
              }}
            >
              {errorMsg}
            </div>
          )}

          <label htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="ejemplo@correo.com"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
            required
          />

          <label htmlFor="password">Contraseña</label>
          <div className="password-field">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="********"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
              aria-describedby="password-visibility"
            />
            <button
              id="password-visibility"
              type="button"
              className="toggle-visibility"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>

          <p style={{ textAlign: 'right', fontSize: '0.9rem' }}>
            <a href="/recuperar" style={{ color: '#6d44b8', textDecoration: 'none' }}>
              ¿Olvidaste tu contraseña?
            </a>
          </p>

          <button type="submit" disabled={submitting}>
            {submitting ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>
      </div>
    </Wrapper>
  );
}

function EyeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <path d="M1.5 12s3.5-7.5 10.5-7.5S22.5 12 22.5 12 19 19.5 12 19.5 1.5 12 1.5 12Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M10.6 10.6A3 3 0 0012 15a3 3 0 002.4-1.2M7.1 7.5C4.9 8.8 3.4 10.6 2.5 12c0 0 3.5 7.5 9.5 7.5 2 0 3.7-.5 5.1-1.3M16.9 6.7A10.5 10.5 0 0012 4.5C5 4.5 1.5 12 1.5 12c.5.9 1.3 2.3 2.6 3.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const Wrapper = styled.div`
  height: 100vh;
  display: flex;
  font-family: 'Poppins', 'Roboto', sans-serif !important;

  .left-panel {
    flex: 1;
    background: linear-gradient(135deg, #5b2f9c, #3b0a58);
    color: white;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 2rem;
    text-align: center;
  }

  .title { font-size: 2rem; font-weight: 600; margin-bottom: 0.5rem; }
  .subtitle { font-size: 1rem; font-weight: 300; margin-bottom: 2rem; }

  .logo {
    max-width: 150px;
    background: white;
    padding: 12px;
    border-radius: 12px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  }

  .right-panel {
    flex: 1;
    background-color: #f9f9ff;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2rem;
  }

  .form {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
    max-width: 360px;
  }

  .form h2 { text-align: center; color: #240046; }
  .form label { font-weight: 500; font-size: 0.9rem; color: #240046; }
  .form input {
    height: 40px; padding: 10px; border-radius: 6px; border: 1px solid #ddd;
    background: #f5f5f5; font-family: 'Poppins', sans-serif; width: 100%; box-sizing: border-box;
  }

  .password-field { position: relative; display: flex; align-items: center; }
  .password-field input { padding-right: 44px; }

  .toggle-visibility {
    position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
    height: 28px; width: 28px; display: grid; place-items: center;
    background: transparent; border: none; color: #6d44b8; cursor: pointer; padding: 0;
  }

  .form button[type='submit'] {
    height: 40px; background-color: #6d44b8; color: white; font-weight: bold;
    border: none; border-radius: 6px; cursor: pointer; transition: background 0.3s ease;
  }
  .form button[type='submit']:hover { background-color: #573b8a; }
  .form button[disabled] { opacity: 0.7; cursor: not-allowed; }
`;
