import { PBKDF2 } from "worktop/crypto";
import type { KV } from "worktop/kv";
import * as DB from "worktop/kv";
import { toHEX } from "worktop/utils";

declare const USERS: KV.Namespace;
declare const SALT: string;

export interface Auth {
    email: string;
    password: string;
}

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
    if (await save(email, values)) return values;
}

/**
 * Login as `User`
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

    if (hashedPassword == user.password) return user;
}
