import { sign } from "@tsndr/cloudflare-worker-jwt";
import { stringify } from "worktop/cookie";
import { PBKDF2 } from "worktop/crypto";
import type { KV } from "worktop/kv";
import * as DB from "worktop/kv";
import { toHEX } from "worktop/utils";

declare const USERS: KV.Namespace;
declare const SALT: string;

const ONE_DAY = 86400;

export interface User {
    email: string;
    password: string;
    created_at: number;
    updated_at: number | null;
}

/**
 * Find a `User` record by its <email>
 */
export function find(email: string) {
    return DB.read<User>(USERS, email, "json");
}

/**
 * Force-write a `User` record
 */
export function save(email: string, user: Partial<User>) {
    user.updated_at = Date.now();
    return DB.write(USERS, email, user);
}

/**
 * Create a new `User` record
 * - Check if the user already exists
 * - Hash user password with PBKDF2
 * - Sign a JWT token
 * - Return a HttpOnly cookie
 */
export async function create(email: string, password: string) {
    const user = await find(email);
    if (user) return;

    const hashedPassword = await PBKDF2(
        "SHA-512",
        password,
        SALT,
        100e3,
        64,
    ).then(toHEX);

    const values: Partial<User> = {
        email,
        password: hashedPassword,
        created_at: Date.now(),
    };
    const isCreated = await save(email, values);
    if (!isCreated) return;

    const token = await sign({ email }, SALT);
    const cookie = stringify("token", token, {
        httponly: true,
        maxage: ONE_DAY,
    });
    return cookie;
}

/**
 * Login as user
 * - Check if the user already exists
 * - Compare hashed user password input with saved hashed password
 * - Sign a JWT token
 * - Return a HttpOnly cookie
 */
export async function login(email: string, password: string) {
    const user = await find(email);
    if (!user) return;

    const hashedPassword = await PBKDF2(
        "SHA-512",
        password,
        SALT,
        100e3,
        64,
    ).then(toHEX);

    const isValid = hashedPassword === user.password; // TODO: use timingSafeEqual
    if (!isValid) return;

    const token = await sign({ email }, SALT);
    const cookie = stringify("token", token, {
        httponly: true,
        maxage: ONE_DAY,
    });
    return cookie;
}
