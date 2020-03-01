const Notification = require("../modules/Notification");
const fs = require("fs");

module.exports.checkSingleUpload = (req, res, next) => {
    const file = req.file;
    if(file.mimetype.indexOf("image") === -1) {
        fs.unlinkSync(file.path); // Incorrect file, delete
        res.json(Notification.message("Tệp gửi lên phải là hình ảnh có dạng jpeg, png, jpg, gif...", "error", 404));
        return;
    }
    
    res.locals = {
        ...res.locals,
        file: file
    }
    next();
}

module.exports.checkMultipleUpload = (req, res, next) => {
    const files = req.files;
    for(let i = 0; i < files.length; i++) {
        if(files[i].mimetype.indexOf("image") === -1) {
            files.forEach(e => fs.unlinkSync(e.path)); //unlink all path was be sent
            res.json(Notification.message("Tệp gửi lên có thành phần lỗi, phải là hình ảnh có dạng jpeg, png, jpg, gif...", "error", 404));
            return;
        }
    };
    res.locals = {
        ...res.locals,
        files: files
    }
    next();
}