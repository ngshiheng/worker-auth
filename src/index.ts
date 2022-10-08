import { Router } from "worktop";
import { listen } from "worktop/cache";
import * as Users from "./routes";

import LANDING_PAGE from "./templates/index.html";
import REGISTER_PAGE from "./templates/register.html";

const API = new Router();

API.add("GET", "/", (req, res) => {
    res.setHeader("Content-Type", "text/html");
    res.end(LANDING_PAGE);
});

API.add("GET", "/register", (req, res) => {
    res.setHeader("Content-Type", "text/html");
    res.end(REGISTER_PAGE);
});

API.add("POST", "/registration", Users.registration);

API.add("POST", "/login", Users.login);

listen(API.run);
