import type { Handler } from "worktop";
import type { Auth } from "./model";
import * as Model from "./model";

/**
 * POST /registration
 */
export const registration: Handler = async function (req, res) {
    const input = await req.body<Auth>();
    const email = input && (input.email || "").trim();
    const password = input && (input.password || "");

    if (!input || !email) return res.send(422, { error: "email required" });
    if (!input || !password)
        return res.send(422, { error: "password required" });

    const result = await Model.create(email, password);
    if (result) res.send(201, result);
    else res.send(409, { error: "registration error" });
};

/**
 * POST /login
 */
export const login: Handler = async function (req, res) {
    const input = await req.body<Auth>();
    const email = input && (input.email || "").trim();
    const password = input && (input.password || "");

    if (!input || !email) return res.send(422, { error: "email required" });
    if (!input || !password)
        return res.send(422, { error: "password required" });

    const result = await Model.login(email, password);
    if (result) res.send(200, result);
    else res.send(403, { error: "user does not exist" });
};
