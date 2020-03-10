const express = require("express");
const route = express.Router();

const middleware = require("../middlewares/User.middleware.js");
const controller = require("../controllers/User.controller.js");

route.get("/", middleware.checkGetUsers, controller.getUsers); //fetch users
route.get("/:id", middleware.checkAuth, middleware.checkGetUser, controller.getUser); //fetch a user
route.post("/", middleware.checkAuth, middleware.isAdmin_isTester, middleware.checkCreate, controller.create); //Sign up
route.post("/login", middleware.checkLogin, controller.login); //Login
route.put("/:id", middleware.checkAuth, middleware.checkPut, controller.put); //Update detail
route.delete("/disable/:id", middleware.checkAuth, middleware.isAdmin_isTester, middleware.checkDisable, controller.disable); //disable account
route.delete("/delete/:id", middleware.checkAuth, middleware.isAdmin_isTester, middleware.checkDelete, controller.delete); //delete account

module.exports = route;