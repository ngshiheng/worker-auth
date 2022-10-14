import { PBKDF2 } from "worktop/crypto";
import type { KV } from "worktop/kv";
import * as DB from "worktop/kv";
import { toHEX } from "worktop/utils";

declare const ONE_DAY: number;
declare const ONE_HOUR: number;
declare const SALT: string;
declare const USERS: KV.Namespace;

export interface User {
    email: string;
    password: string;
    created_at: number;
}

/**
 * Find a user record by email
 */
export function find(email: string) {
    return DB.read<User>(USERS, email, "json");
}

/**
 * Force-write a user record
 * - User will be auto-deleted after ONE_DAY
 */
export function save(email: string, user: Partial<User>) {
    return DB.write(USERS, email, user, { expirationTtl: ONE_DAY });
}

/**
 * Create a new user record
 * - Check if the user already exists
 * - Hash user password with PBKDF2
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

    const userInfo: Partial<User> = {
        email,
        password: hashedPassword,
        created_at: Date.now(),
    };
    return await save(email, userInfo);
}

/**
 * Login as user
 * - Check if the user already exists
 * - Compare hashed passwords
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

    return hashedPassword === user.password;
}
