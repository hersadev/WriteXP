import type { User } from '@/types';

/**
 * Contrato de autenticación. La UI sólo conoce esta interfaz, así que
 * cambiar la implementación mock por Supabase/Firebase no toca ninguna pantalla.
 */
export interface AuthService {
  current(): User | null;
  signUp(input: { name: string; email: string; password: string }): Promise<User>;
  signIn(input: { email: string; password: string }): Promise<User>;
  signOut(): Promise<void>;
}

const USERS_KEY = 'writexp.users';
const SESSION_KEY = 'writexp.session';

interface StoredUser extends User {
  passwordHash: string;
}

export class AuthError extends Error {}

function readUsers(): StoredUser[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) ?? '[]') as StoredUser[];
  } catch {
    return [];
  }
}

function writeUsers(users: StoredUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

/**
 * Hash de juguete, suficiente para no dejar la contraseña en claro en el
 * localStorage de un prototipo. NO es seguridad real: cuando se conecte un
 * backend, esta función desaparece junto con toda la clase.
 */
function toyHash(value: string): string {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

function publicUser(user: StoredUser): User {
  const { passwordHash: _ignored, ...rest } = user;
  return rest;
}

function delay<T>(value: T, ms = 350): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

/** Crea y persiste el usuario, SIN abrir sesión. Iniciar sesión es cosa de quien llame. */
function createUserRecord({ name, email, password }: { name: string; email: string; password: string }): StoredUser {
  const cleanEmail = email.trim().toLowerCase();
  const users = readUsers();

  if (users.some((u) => u.email === cleanEmail)) {
    throw new AuthError('Ya existe una cuenta con ese correo. Inicia sesión.');
  }
  if (password.length < 6) {
    throw new AuthError('La contraseña necesita al menos 6 caracteres.');
  }

  const user: StoredUser = {
    id: `u_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    name: name.trim() || cleanEmail.split('@')[0],
    email: cleanEmail,
    createdAt: new Date().toISOString(),
    passwordHash: toyHash(password),
  };

  writeUsers([...users, user]);
  return user;
}

/** Implementación local: usuarios y sesión en localStorage. */
export class LocalAuthService implements AuthService {
  current(): User | null {
    const id = localStorage.getItem(SESSION_KEY);
    if (!id) return null;
    const user = readUsers().find((u) => u.id === id);
    return user ? publicUser(user) : null;
  }

  async signUp(input: { name: string; email: string; password: string }): Promise<User> {
    const user = createUserRecord(input);
    localStorage.setItem(SESSION_KEY, user.id);
    return delay(publicUser(user));
  }

  async signIn({ email, password }: { email: string; password: string }): Promise<User> {
    const cleanEmail = email.trim().toLowerCase();
    const user = readUsers().find((u) => u.email === cleanEmail);

    if (!user || user.passwordHash !== toyHash(password)) {
      throw new AuthError('Correo o contraseña incorrectos.');
    }

    localStorage.setItem(SESSION_KEY, user.id);
    return delay(publicUser(user));
  }

  async signOut(): Promise<void> {
    localStorage.removeItem(SESSION_KEY);
  }
}

export const authService: AuthService = new LocalAuthService();

/** Cuenta de prueba para entrar sin registrarse. */
export const DEMO_CREDENTIALS = { email: 'demo@writexp.app', password: 'demo1234', name: 'Viajero' };

/**
 * Siembra la cuenta de prueba si no existe. Es síncrona y no toca la sesión a
 * propósito: sembrar no es entrar, y hacerlo con `signUp` dejaba al visitante
 * dentro de la app sin haber pulsado nada.
 */
export function ensureDemoUser(): void {
  const exists = readUsers().some((u) => u.email === DEMO_CREDENTIALS.email);
  if (!exists) createUserRecord(DEMO_CREDENTIALS);
}
