const express = require("express");
const route = express.Router();

const middleware = require("../middlewares/Blog.middleware")
const controller = require("../controllers/Blog.controller")

const userMiddleware = require("../middlewares/User.middleware");

route.get("/", middleware.checkGetBlogs, controller.blogs);
route.get("/:url", middleware.checkGetBlog, controller.blog);
route.post("/", userMiddleware.checkAuth, userMiddleware.isAdmin_isTester, middleware.checkCreate, controller.create);
route.put("/:url", userMiddleware.checkAuth, userMiddleware.isAdmin_isTester, middleware.checkPut, controller.put);
route.delete("/disable/:id", userMiddleware.checkAuth, userMiddleware.isAdmin_isTester, middleware.checkDisable, controller.disable);
route.delete("/delete/:id", userMiddleware.checkAuth, userMiddleware.isAdmin_isTester, middleware.checkDelete, controller.delete);


module.exports = route;