import type { KV } from "worktop/kv";
import * as DB from "worktop/kv";

declare const USERS: KV.Namespace;

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
export function save(email: string, user: User) {
    return DB.write(USERS, email, user);
}

/**
 * Create a new `User` record
 */
export async function create(email: string, password: string) {
    const user = await find(email);
    if (user) return;

    const values: User = {
        email,
        password,
        created_at: Date.now(),
        updated_at: null,
    };
    if (!(await save(email, values))) return;
    return values;
}
