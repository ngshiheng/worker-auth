import { decode, verify } from "@tsndr/cloudflare-worker-jwt";
import type { Handler } from "worktop";
import { parse, stringify } from "worktop/cookie";
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
 * GET /register
 * - Render user registration page html
 */
export const registrationPage: Handler = async function (req, res) {
    res.setHeader("Content-Type", "text/html");
    res.end(REGISTRATION_PAGE);
};

/**
 * GET /hello
 * - Private endpoint
 */
export const hello: Handler = async function (req, res) {
    const cookie = req.headers.get("Cookie");
    if (!cookie) return res.send(403, "Cookie required");

    const { token } = parse(cookie);
    if (!token) return res.send(403, "Token required");

    const isValid = await verify(token, SALT);
    if (!isValid) return res.send(401, "Unauthorized");

    const { email } = decode(token).payload;
    res.send(200, `Hello ${email}, 你好!`);
};

/**
 * POST /register
 * - Create a new `User` record
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
 * - Issue a new JWT to user
 * - Store the JWT in cookie which expires in ONE_HOUR (NOTE: different expiry from JWT)
 */
export const login: Handler = async function (req, res) {
    const input = await req.body<Auth>();

    const email = input && (input.email || "").trim();
    const password = input && (input.password || "");

    if (!input || !email || !password)
        return res.send(422, "Email & password required");

    const token = await Model.login(email, password);
    if (!token) {
        return res.send(404, "User not found");
    }

    const cookie = stringify("token", token, {
        httponly: true,
        maxage: ONE_HOUR,
    });
    res.headers.set("Set-Cookie", cookie);
    res.send(200, "Successfully login");
};

/**
 * POST /logout
 */
export const logout: Handler = async function (req, res) {
    res.headers.set("Set-Cookie", stringify("token", ""));
    res.send(200, "Successfully logout");
};
