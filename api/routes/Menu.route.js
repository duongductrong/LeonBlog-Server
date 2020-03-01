const route = require("express").Router();

const middleware = require("../middlewares/Menu.middleware");
const controller = require("../controllers/Menu.controller")

const userMiddleware = require("../middlewares/User.middleware");

route.get("/buildingMenu", middleware.buildingMenu, controller.menu_completed); //buidling menu

route.get("/menuItem", middleware.checkListMenu, controller.listMenu); //get list menu item
route.get("/menuItem/:id", middleware.checkMenuItem, controller.menuItem); //get a menu item
route.post("/menuItem", userMiddleware.checkAuth, userMiddleware.isAdmin_isTester, middleware.checkCreateMenuItem, controller.createMenuItem) //create a menu item
route.put("/menuItem/:id", userMiddleware.checkAuth, userMiddleware.isAdmin_isTester, middleware.checkPutMenuItem, controller.putMenuItem); //put a menu item
route.delete("/menuItem/disable/:id", userMiddleware.checkAuth, userMiddleware.isAdmin_isTester, middleware.checkDisableMenuItem, controller.disableMenuItem); //disable menu item
route.delete("/menuItem/delete/:id", userMiddleware.checkAuth, userMiddleware.isAdmin_isTester, middleware.checkDeleteMenuItem, controller.deleteMenuItem); //disable menu item

route.get("/subMenu", middleware.checkListSubMenu, controller.listSubMenu); //get list menu item
route.get("/subMenu/:id", middleware.checkSubMenu, controller.subMenu); //get a menu item
route.post("/subMenu", userMiddleware.checkAuth, userMiddleware.isAdmin_isTester, middleware.checkCreateSubMenu, controller.createSubMenu) //create a menu item
route.put("/subMenu/:id", userMiddleware.checkAuth, userMiddleware.isAdmin_isTester, middleware.checkPutSubMenu, controller.putSubMenu); //put a menu item
route.delete("/subMenu/disable/:id", userMiddleware.checkAuth, userMiddleware.isAdmin_isTester, middleware.checkDisableSubMenu, controller.disableSubMenu); //disable menu item
route.delete("/subMenu/delete/:id", userMiddleware.checkAuth, userMiddleware.isAdmin_isTester, middleware.checkDeleteSubMenu, controller.deleteSubMenu); //disable menu item

module.exports = route