const express = require("express");
const route = express.Router();

const middleware = require("../middlewares/Comment.middleware");
const controller = require("../controllers/Comment.controller");

const userMiddleware = require("../middlewares/User.middleware");

route.get("/", middleware.checkGetComments, controller.comments);
route.get("/:id", middleware.checkGetComment, controller.comment);
route.post("/", middleware.checkCreate, controller.create);
// route.put("/:url", userMiddleware.checkAuth, userMiddleware.isAdmin_isTester, middleware.checkPut, controller.put);
route.delete("/disable/:id", userMiddleware.checkAuth, userMiddleware.isAdmin_isTester, middleware.checkDisable, controller.disable);
route.delete("/delete/:id", userMiddleware.checkAuth, userMiddleware.isAdmin_isTester, middleware.checkDelete, controller.delete);

module.exports = route;