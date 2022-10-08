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

    if (!input || !email) return res.send(422, { email: "required" });
    if (!input || !password) return res.send(422, { password: "required" });

    const result = await Model.create(email, password);
    if (result) res.send(201, result);
    else res.send(500, "error registering user");
};
