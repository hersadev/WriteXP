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

const PBKDF2_ITERATIONS = 210_000;
const SALT_BYTES = 16;
const KEY_BITS = 256;

/**
 * El hash anterior (FNV-1a truncado a 32 bits, sin sal) tenía colisiones
 * encontrables en segundos: bastaba dar con *cualquier* cadena del mismo hash
 * para entrar. Se conserva sólo para reconocer las cuentas creadas antes del
 * cambio y re-hashearlas en su primer inicio de sesión (ver `signIn`).
 */
function legacyToyHash(value: string): string {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

function subtle(): SubtleCrypto {
  const available = globalThis.crypto?.subtle;
  if (!available) {
    throw new AuthError(
      'Este navegador necesita un contexto seguro (https o localhost) para guardar la contraseña.',
    );
  }
  return available;
}

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array<ArrayBuffer> {
  return Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
}

async function deriveKey(
  password: string,
  salt: Uint8Array<ArrayBuffer>,
  iterations: number,
): Promise<string> {
  const material = await subtle().importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const bits = await subtle().deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
    material,
    KEY_BITS,
  );
  return toBase64(new Uint8Array(bits));
}

/**
 * PBKDF2-SHA256 con sal aleatoria por usuario.
 * Formato almacenado: `pbkdf2$<iteraciones>$<sal base64>$<clave base64>`.
 */
async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const key = await deriveKey(password, salt, PBKDF2_ITERATIONS);
  return `pbkdf2$${PBKDF2_ITERATIONS}$${toBase64(salt)}$${key}`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, iterations, salt, key] = stored.split('$');
  if (scheme !== 'pbkdf2' || !iterations || !salt || !key) return false;

  const computed = await deriveKey(password, fromBase64(salt), Number(iterations));
  return constantTimeEquals(computed, key);
}

function constantTimeEquals(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function publicUser(user: StoredUser): User {
  const { passwordHash: _ignored, ...rest } = user;
  return rest;
}

function delay<T>(value: T, ms = 350): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

/** Crea y persiste el usuario, SIN abrir sesión. Iniciar sesión es cosa de quien llame. */
async function createUserRecord({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}): Promise<StoredUser> {
  const cleanEmail = email.trim().toLowerCase();

  if (readUsers().some((u) => u.email === cleanEmail)) {
    throw new AuthError('Ya existe una cuenta con ese correo. Inicia sesión.');
  }
  if (password.length < 6) {
    throw new AuthError('La contraseña necesita al menos 6 caracteres.');
  }

  const passwordHash = await hashPassword(password);

  // Se relee: derivar la clave tarda cientos de ms y otra alta puede haber
  // escrito mientras tanto.
  const users = readUsers();
  if (users.some((u) => u.email === cleanEmail)) {
    throw new AuthError('Ya existe una cuenta con ese correo. Inicia sesión.');
  }

  const user: StoredUser = {
    id: `u_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    name: name.trim() || cleanEmail.split('@')[0],
    email: cleanEmail,
    createdAt: new Date().toISOString(),
    passwordHash,
  };

  writeUsers([...users, user]);
  return user;
}

/**
 * Sustituye el hash de juguete por PBKDF2 tras un inicio de sesión válido.
 * Así las cuentas antiguas no se quedan fuera ni conservan el hash débil.
 */
async function upgradeLegacyHash(userId: string, password: string): Promise<void> {
  const passwordHash = await hashPassword(password);
  writeUsers(readUsers().map((u) => (u.id === userId ? { ...u, passwordHash } : u)));
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
    const user = await createUserRecord(input);
    localStorage.setItem(SESSION_KEY, user.id);
    return delay(publicUser(user));
  }

  async signIn({ email, password }: { email: string; password: string }): Promise<User> {
    const cleanEmail = email.trim().toLowerCase();
    const user = readUsers().find((u) => u.email === cleanEmail);
    if (!user) {
      throw new AuthError('Correo o contraseña incorrectos.');
    }

    const isLegacy = !user.passwordHash.startsWith('pbkdf2$');
    const ok = isLegacy
      ? user.passwordHash === legacyToyHash(password)
      : await verifyPassword(password, user.passwordHash);

    if (!ok) {
      throw new AuthError('Correo o contraseña incorrectos.');
    }
    if (isLegacy) {
      await upgradeLegacyHash(user.id, password);
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
 * Siembra la cuenta de prueba si no existe. No toca la sesión a propósito:
 * sembrar no es entrar, y hacerlo con `signUp` dejaba al visitante dentro de la
 * app sin haber pulsado nada. Es asíncrona porque derivar el hash lo es; hay que
 * esperarla antes de ofrecer el botón de demo.
 */
export async function ensureDemoUser(): Promise<void> {
  const exists = readUsers().some((u) => u.email === DEMO_CREDENTIALS.email);
  if (!exists) await createUserRecord(DEMO_CREDENTIALS);
}
