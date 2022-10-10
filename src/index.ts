import { Router } from "worktop";
import { listen } from "worktop/cache";
import { hello, home, login, register, registrationPage } from "./routes";

const API = new Router();

API.add("GET", "/", home);
API.add("GET", "/register", registrationPage);
API.add("GET", "/hello", hello);
API.add("POST", "/register", register);
API.add("POST", "/login", login);

listen(API.run);
