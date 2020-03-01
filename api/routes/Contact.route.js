const express = require("express");
const route = express.Router();

const middleware = require("../middlewares/Contact.middleware");
const controller = require("../controllers/Contact.controller");

const userMiddleware = require("../middlewares/User.middleware");

route.get("/", middleware.checkGetContacts, controller.contacts);
route.get("/:id", middleware.checkGetContact, controller.contact);
route.post("/", middleware.checkCreate, controller.create);
route.delete("/disable/:id", userMiddleware.checkAuth, userMiddleware.isAdmin_isTester, middleware.checkDisable, controller.disable);
route.delete("/delete/:id", userMiddleware.checkAuth, userMiddleware.isAdmin_isTester, middleware.checkDelete, controller.delete);

module.exports = route;