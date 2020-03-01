const route = require("express").Router();
const multer = require("multer");
const fs = require("fs");
const upload = require("../models/systems/multerModel.system");
const Notification = require("../modules/Notification");

const middleware = require("../middlewares/Upload.middleware");
const controller = require("../controllers/Upload.controller");

const userMiddleware = require("../middlewares/User.middleware");

//resources
route.get("/resources", controller.resources);

//upload single
route.post("/singleFile", userMiddleware.checkAuth, userMiddleware.isAdmin_isTester, (req, res, next) => {
    upload.single("image")(req, res, function(err) {
        const file = req.file;
        if (err instanceof multer.MulterError) {
            res.json(Notification.message("Hãy đảm bảo đúng tên field và tệp gửi lên duy nhất phải là hình ảnh", "error", 400));
        }
        else if (err) {
            fs.unlinkSync(file.path); //file error, delete
            res.json(Notification.message("Tệp gửi lên không thể xác định, vui lòng thử lại", "error", 400));
        }
        else {
            next();
        }
    })
}, middleware.checkSingleUpload, controller.singleUpload);
//upload multi
route.post("/multipleFiles", userMiddleware.checkAuth, userMiddleware.isAdmin_isTester, upload.any(), middleware.checkMultipleUpload, controller.multipleUpload);
//delete singple, multiple
route.delete("/deleteSingle", userMiddleware.checkAuth, userMiddleware.isAdmin_isTester, controller.deleteSingle);
route.delete("/deleteMultiple", userMiddleware.checkAuth, userMiddleware.isAdmin_isTester, controller.deleteMultiple);

module.exports = route;