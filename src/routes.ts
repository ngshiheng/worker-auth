import { decode, sign, verify } from "@tsndr/cloudflare-worker-jwt";
import type { Handler } from "worktop";
import { parse, stringify } from "worktop/cookie";
import { uuid } from "worktop/utils";
import * as Model from "./model";
import HOME_PAGE from "./templates/index.html";
import REGISTRATION_PAGE from "./templates/register.html";

declare const ONE_HOUR: number;
declare const SALT: string;

interface Auth {
    email: string;
    password: string;
}

/**
 * GET /
 * - Render home page HTML
 */
export const home: Handler = async function (req, res) {
    res.setHeader("Content-Type", "text/html");
    res.end(HOME_PAGE);
};

/**
 * GET /hello
 * - A private endpoint
 * - Verify JWT
 * - Verify X-CSRF-Token
 */
export const hello: Handler = async function (req, res) {
    const cookie = req.headers.get("Cookie");
    if (!cookie) return res.send(401, "Cookie required");

    const { jwt } = parse(cookie);
    if (!jwt) return res.send(401, "JWT required");

    const headerCSRFToken = req.headers.get("X-CSRF-Token");
    if (!headerCSRFToken) return res.send(401, "CSRF token required");

    const { email, csrfToken } = decode(jwt).payload;
    if (csrfToken !== headerCSRFToken) return res.send(401, "Bad CSRF token");

    const isValid = await verify(jwt, SALT);
    if (!isValid) return res.send(401, "Unauthorized");

    const now = new Date().toUTCString();
    res.send(200, `Hello ${email}, 你好! (${now})`);
};

/**
 * GET /register
 * - Render user registration page HTML
 */
export const registrationPage: Handler = async function (req, res) {
    res.setHeader("Content-Type", "text/html");
    res.end(REGISTRATION_PAGE);
};

/**
 * POST /register
 * - Create a new user record
 * - Redirect user to login page if registration is successful
 */
export const register: Handler = async function (req, res) {
    const input = await req.body<Auth>();

    const email = input && (input.email || "").trim();
    const password = input && (input.password || "");

    if (!input || !email || !password)
        return res.send(422, "Email & password required");

    const isCreated = await Model.create(email, password);
    if (!isCreated) {
        return res.send(409, "User already exist");
    }
    res.headers.set("HX-Redirect", "/");
    return res.send(302, "User registered successfully");
};

/**
 * POST /login
 * - Generate CSRF token
 * - Sign a JWT with CSRF Token claim
 * - Store the JWT in storage Cookie  using Set-Cookie header
 */
export const login: Handler = async function (req, res) {
    const input = await req.body<Auth>();

    const email = input && (input.email || "").trim();
    const password = input && (input.password || "");

    if (!input || !email || !password)
        return res.send(422, "Email & password required");

    const isValid = await Model.login(email, password);
    if (!isValid) {
        return res.send(404, "User not found");
    }

    const exp = Math.floor(Date.now() / 1000) + ONE_HOUR;
    const csrfToken = uuid();
    const jwt = await sign({ email, exp, csrfToken }, SALT);

    const cookie = stringify("jwt", jwt, {
        httponly: true,
        maxage: ONE_HOUR,
        samesite: "Strict",
    });
    res.headers.set("Set-Cookie", cookie);
    res.headers.set("X-CSRF-Token", csrfToken);
    res.send(200, "Logged in");
};

/**
 * POST /logout
 */
export const logout: Handler = async function (req, res) {
    res.headers.set("Set-Cookie", stringify("jwt", ""));
    res.send(200, "Cleared cookie");
};
