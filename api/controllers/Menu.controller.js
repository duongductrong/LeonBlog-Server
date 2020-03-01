const MENU_MODEL_MONGOOSE = require("../models/systems/Menu/Menu.system");
const SUBMENU_MODEL_MONGOOSE = require("../models/systems/Menu/Submenu.system");
const Notification = require("../modules/Notification");

module.exports.menu_completed = (req, res) => {
    const { building } = res.locals;

    res.json(Notification.message("Đã lấy được dữ liệu", "ok", 200, { menu: building }));
}

module.exports.listMenu = (req, res) => {
    const { list_menu, page, total, onPage } = res.locals;

    res.json(Notification.message("Đã lấy được dữ liệu", "ok", 200, { menu: list_menu, page, total, onPage }));
}

module.exports.menuItem = (req, res) => {
    const { item } = res.locals;

    res.json(Notification.message("Dã lấy được dữ liệu", "ok", 200, { menu_item: item }));
}

module.exports.createMenuItem = async (req, res) => {
    const { menu } = res.locals;

    try {
        const created = await MENU_MODEL_MONGOOSE.create(menu);
        res.json(Notification.message("Đã tạo danh mục cho menu thành công", "ok", 200, { menu: created }));
    }
    catch(err) {
        res.json(Notification.message(`Có lỗi xảy ra khi tạo danh mục, thông tin ${err}`, "error", 400))
    }
}

module.exports.putMenuItem = (req, res) => {
    const { menu, id } = res.locals;

    MENU_MODEL_MONGOOSE.updateOne({_id: id}, {$set: menu})
    .then(result => {
        if(result.n >= 1) {
            if(result.nModified !== 0) {
                res.json(Notification.message("Cập nhật thành công", "ok", 200));
            }
            else {
                res.json(Notification.message("Không có gì thay đổi trong quá trình cập nhật", "ok", 200));
            }
        }
        else {
            res.json(Notification.message("Cập nhật thất bại, không có danh mục nào hợp lệ", "error", 400));
        }
    })
    .catch(err => {
        res.json(Notification.message(`Có lỗi xảy ra, cập nhật thất bại - Chi tiết lỗi: ${err}`))
    })
}

module.exports.disableMenuItem = (req, res) => {
    const { id, menu } = res.locals;

    //Query update disable status
    MENU_MODEL_MONGOOSE.updateOne({_id: id}, { $set: {disable: !menu.disable} })
    .then(result => {
        if(result.n >= 1) {
            if(result.nModified !== 0) {
                res.json(Notification.message("Vô hiệu hóa thành công", "ok", 200));
            }
            else {
                res.json(Notification.message("Không có gì thay đổi trong quá trình vô hiệu hóa danh mục", "error", 400));
            }
        }
        else {
            res.json(Notification.message("Vô hiệu hóa thất bại, không có danh mục nào hợp lệ", "error", 400));
        }
    })
    .catch(err => {
        res.json(Notification.message(`Có lỗi xảy ra, không thể vô hiệu hóa danh mục - chi tiết: ${err}`, "error", 400));
    })
}

module.exports.deleteMenuItem = (req, res) => {
    const { id } = res.locals;
    
    //Query delete
    MENU_MODEL_MONGOOSE.deleteOne({_id: id})
    .then(result => {
        //Take a request delete
        if(result.n >= 1) {
            //Delete completed
            if(result.deletedCount !== 0) {
                res.json(Notification.message("Xóa vĩnh viễn danh mục thành công", "ok", 200));
            }
            else {
                res.json(Notification.message("Có lỗi xảy ra trong quá trình xóa vĩnh viễn danh mục, vẫn chưa được xóa", "error", 400));
            }
        }
        else { //Error
            res.json(Notification.message("Không có danh mục trùng khớp để tiến hành xóa vĩnh viễn", "error", 400));
        }
    }) //Error
    .catch(err => {
        res.json(Notification.message(`Có lỗi xảy ra, không thể xóa vĩnh viễn danh mục - chi tiết: ${err}`, "error", 400));
    })
}

/* Submenu */

module.exports.listSubMenu = (req, res) => {
    const { list_submenu, page, onPage, total } = res.locals;

    res.json(Notification.message("Đã lấy được dữ liệu", "ok", 200, { list_submenu: list_submenu, page, onPage, total }));
}

module.exports.subMenu = (req, res) => {
    const { subMenu } = res.locals;

    res.json(Notification.message("Dã lấy được dữ liệu", "ok", 200, { sub_menu: subMenu }));
}


module.exports.createSubMenu = async (req, res) => {
    const { subMenu } = res.locals;

    try {
        const created = await SUBMENU_MODEL_MONGOOSE.create(subMenu);
        res.json(Notification.message("Đã tạo danh mục con cho menu thành công", "ok", 200, { subMenu: created }));
    }
    catch(err) {
        res.json(Notification.message(`Có lỗi xảy ra khi tạo danh mục con, thông tin ${err}`, "error", 400))
    }
}

module.exports.putSubMenu = (req, res) => {
    const { subMenu, id } = res.locals;
    console.log(id, subMenu)
    SUBMENU_MODEL_MONGOOSE.updateOne({_id: id}, {$set: subMenu})
    .then(result => {
        if(result.n >= 1) {
            if(result.nModified !== 0) {
                res.json(Notification.message("Cập nhật thành công", "ok", 200));
            }
            else {
                res.json(Notification.message("Không có gì thay đổi trong quá trình cập nhật", "ok", 200));
            }
        }
        else {
            res.json(Notification.message("Cập nhật thất bại, không có danh mục con nào hợp lệ", "error", 400));
        }
    })
    .catch(err => {
        res.json(Notification.message(`Có lỗi xảy ra, cập nhật thất bại - Chi tiết lỗi: ${err}`))
    })
}

module.exports.disableSubMenu = (req, res) => {
    const { id, subMenu } = res.locals;

    //Query update disable status
    SUBMENU_MODEL_MONGOOSE.updateOne({_id: id}, { $set: {disable: !subMenu.disable} })
    .then(result => {
        if(result.n >= 1) {
            if(result.nModified !== 0) {
                res.json(Notification.message("Vô hiệu hóa thành công", "ok", 200));
            }
            else {
                res.json(Notification.message("Không có gì thay đổi trong quá trình vô hiệu hóa danh mục con", "error", 400));
            }
        }
        else {
            res.json(Notification.message("Vô hiệu hóa thất bại, không có danh mục con nào hợp lệ", "error", 400));
        }
    })
    .catch(err => {
        res.json(Notification.message(`Có lỗi xảy ra, không thể vô hiệu hóa danh mục con - chi tiết: ${err}`, "error", 400));
    })
}

module.exports.deleteSubMenu = (req, res) => {
    const { id } = res.locals;
    
    //Query delete
    SUBMENU_MODEL_MONGOOSE.deleteOne({_id: id})
    .then(result => {
        //Take a request delete
        if(result.n >= 1) {
            //Delete completed
            if(result.deletedCount !== 0) {
                res.json(Notification.message("Xóa vĩnh viễn danh mục con thành công", "ok", 200));
            }
            else {
                res.json(Notification.message("Có lỗi xảy ra trong quá trình xóa vĩnh viễn danh mục con, vẫn chưa được xóa", "error", 400));
            }
        }
        else { //Error
            res.json(Notification.message("Không có danh mục con trùng khớp để tiến hành xóa vĩnh viễn", "error", 400));
        }
    }) //Error
    .catch(err => {
        res.json(Notification.message(`Có lỗi xảy ra, không thể xóa vĩnh viễn danh mục con - chi tiết: ${err}`, "error", 400));
    })
}