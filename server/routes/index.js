const routes = require("express").Router();
const controller = require("../controller/controller");

routes.post("/register", controller.register);
routes.post("/signIn", controller.signIn);
routes.post("/exchangeToken", controller.exchangeToken);
routes.post("/forgotPassword", controller.forgotPassword);
routes.post("/signOut", controller.signOut);
routes.post("/checkSSO", controller.checkSession);
routes.post("/exchangeCode", controller.exchangeCode);
routes.post("/refreshToken", controller.refreshToken);

module.exports = routes;
