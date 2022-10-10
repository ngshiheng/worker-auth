import { verify } from "@tsndr/cloudflare-worker-jwt";
import type { Handler } from "worktop";
import { parse, stringify } from "worktop/cookie";
import * as Model from "./model";
import HOME_PAGE from "./templates/index.html";
import REGISTRATION_PAGE from "./templates/register.html";

declare const SALT: string;

interface Auth {
    email: string;
    password: string;
}

/**
 * GET /
 */
export const home: Handler = async function (req, res) {
    res.setHeader("Content-Type", "text/html");
    res.end(HOME_PAGE);
};

/**
 * GET /register
 */
export const registrationPage: Handler = async function (req, res) {
    res.setHeader("Content-Type", "text/html");
    res.end(REGISTRATION_PAGE);
};

/**
 * GET /hello
 */
export const hello: Handler = async function (req, res) {
    const cookie = req.headers.get("Cookie");
    if (!cookie) return res.send(403, "Cookie required");

    const { token } = parse(cookie);
    if (!token) return res.send(403, "Token required");

    const isValid = await verify(token, SALT);
    if (!isValid) return res.send(401, "Unauthorized");

    res.send(200, "Hello, 你好!");
};

/**
 * POST /register
 */
export const register: Handler = async function (req, res) {
    const input = await req.body<Auth>();

    const email = input && (input.email || "").trim();
    const password = input && (input.password || "");

    if (!input || !email || !password)
        return res.send(422, "Email & password required");

    const cookie = await Model.create(email, password);
    if (cookie) {
        res.headers.set("Set-Cookie", cookie);
        res.headers.set("HX-Redirect", "/");
        res.send(302, "User registered successfully");
    } else {
        res.send(409, "User already exist");
    }
};

/**
 * POST /login
 */
export const login: Handler = async function (req, res) {
    const input = await req.body<Auth>();

    const email = input && (input.email || "").trim();
    const password = input && (input.password || "");

    if (!input || !email || !password)
        return res.send(422, "Email & password required");

    const cookie = await Model.login(email, password);

    if (cookie) {
        res.headers.set("Set-Cookie", cookie);
        res.send(200, "Successfully login");
    } else {
        res.send(404, "User not found");
    }
};

/**
 * POST /logout
 */
export const logout: Handler = async function (req, res) {
    res.headers.set("Set-Cookie", stringify("token", ""));
    res.send(200, "Successfully logout");
};
