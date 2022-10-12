import { sign } from "@tsndr/cloudflare-worker-jwt";
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
 * Find a `User` record by email
 */
export function find(email: string) {
    return DB.read<User>(USERS, email, "json");
}

/**
 * Force-write a `User` record
 * User will be auto-deleted after ONE_DAY
 */
export function save(email: string, user: Partial<User>) {
    return DB.write(USERS, email, user, { expirationTtl: ONE_DAY });
}

/**
 * Create a new `User` record
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
 * - Compare input hashed user password against the saved hashed password
 * - Sign a JWT which expires in ONE_HOUR (NOTE: different expiry from cookie)
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

    const isValid = hashedPassword === user.password;
    if (!isValid) return;

    const exp = Math.floor(Date.now() / 1000) + ONE_HOUR;
    return await sign({ email, exp }, SALT);
}
