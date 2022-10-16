import {
    hello,
    home,
    login,
    logout,
    register,
    registrationPage,
} from "@src/routes";
import { Router } from "worktop";
import { listen } from "worktop/cache";

const API = new Router();

API.add("GET", "/", home);
API.add("GET", "/hello", hello);
API.add("GET", "/register", registrationPage);
API.add("POST", "/register", register);
API.add("POST", "/login", login);
API.add("POST", "/logout", logout);

listen(API.run);
