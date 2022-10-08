import { Router } from "worktop";
import { listen } from "worktop/cache";
import * as Users from "./routes";

import LANDING_PAGE from "/index.html";

const API = new Router();

API.add("GET", "/", (req, res) => {
    res.setHeader("Content-Type", "text/html");
    res.end(LANDING_PAGE);
});

API.add("POST", "/registration", Users.registration);

listen(API.run);
