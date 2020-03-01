const MENU_MODEL_MONGOOSE = require("../models/systems/Menu/Menu.system");
const SUBMENU_MODEL_MONGOOSE = require("../models/systems/Menu/Submenu.system");
const Notification = require("../modules/Notification");
const Checking = require("../modules/Checking");
const Pagination = require("../modules/Pagination");

function getSubmenu(id) {
    return new Promise((resolve, reject) => {
        return SUBMENU_MODEL_MONGOOSE.find({menu: id, disable: false})
        .then(result => {
            resolve(result)
        })
        .catch(err => reject(err));
    })
}

module.exports.buildingMenu = async (req, res, next) => {
    const { disable = false } = req.query;
    let listMenu = await MENU_MODEL_MONGOOSE.find({ disable: disable }) //query all menu item not disable
    
    //get data submenu from menu id
    let list = listMenu.map(el => {
        return {
            ...el._doc,
            submenu: getSubmenu(el._id)
        };
    })

    //loop some menu to get data of submenu
    for(let i = 0 ; i < list.length; i++) {
        list[i].submenu = await list[i].submenu;
    }
    
    res.locals = {
        ...res.locals,
        building: list
    }
    next(); //next function
}

module.exports.checkListMenu = async (req, res, next) => {
    const { disable = false, page = 1, onpage = 10 } = req.query;
    let listMenu = await MENU_MODEL_MONGOOSE.find({ disable: disable }) //query all menu item not disable
    const total = [...listMenu].length;

    let pagination = Pagination(page, onpage);

    listMenu = listMenu.slice(pagination.start, pagination.end);

    res.locals = {
        ...res.locals,
        list_menu: listMenu,
        page: Number(page),
        total,
        onPage: Number(onpage)
    }
    next(); //next function
}

module.exports.checkMenuItem = async (req, res, next) => {
    const { id } = req.params;

    //get item of menu
    const item = await Checking.isExists(id, MENU_MODEL_MONGOOSE, "_id");
    //Check item exist
    if(!item.exists) {
        res.json(Notification.message("Phần tử này của menu không tồn tại", "error", 404));
        return;
    }

    //passed checking, next function
    res.locals = {
        ...res.locals,
        item: item.data
    }
    next();
}

module.exports.checkCreateMenuItem = async (req, res, next) => {
    let errors = {};
    const { label, url } = req.body;

    //check label
    if(Checking.isNull(label)) {
        errors.label = Notification.message("Tên nhãn không được để trống", "error", 404);
    }

    //check url
    if(Checking.isNull(url)) {
        errors.url = Notification.message("Đường dẫn của nhãn không được để trống", "error", 404);
    }
    else {
        if(Checking.isSpace(url) && url !== "#") {
            errors.url = Notification.message("Đường dẫn này không hợp lệ", "error", 400);
        }
    }

    if(Checking.testError(errors)) {
        res.json(Notification.message("Có lỗi xảy ra", "error", 400, { errors }));
        return;
    }

    res.locals = {
        ...res.locals,
        menu: {
            label,
            url,
            disable: false //default mongodb is false
        }
    }
    next();
}

module.exports.checkPutMenuItem = async (req, res, next) => {
    let errors = {};
    const { id } = req.params;
    const { label, url } = req.body;

    //check menu item exists
    const menuItem = await Checking.isExists(id, MENU_MODEL_MONGOOSE, "_id");

    if(!menuItem.exists) {
        res.json(Notification.message("Danh mục menu không tồn tại", "error", 404));
        return;
    }

    //check label
    if(Checking.isNull(label)) {
        errors.label = Notification.message("Tên nhãn không được để trống", "error", 404);
    }

    //check url
    if(menuItem.data.url !== url) {
        if(Checking.isNull(url)) {
            errors.url = Notification.message("Đường dẫn của nhãn không được để trống", "error", 404);
        }
        else {
            if(Checking.isSpace(url)) {
                errors.url = Notification.message("Đường dẫn này không hợp lệ", "error", 400);
            }
        }
    }

    if(Checking.testError(errors)) {
        res.json(Notification.message("Có lỗi xảy ra", "error", 400, { errors }));
        return;
    }

    //sent data for next function
    res.locals = {
        ...res.locals,
        menu: {
            label,
            url
        },
        id
    }
    next();
}

module.exports.checkDisableMenuItem = async (req, res, next) => {
    const { id } = req.params; //get something on params
    const menuItem = await Checking.isExists(id, MENU_MODEL_MONGOOSE, "_id"); //query selected checking to exists

    //condition checking
    if(!menuItem.exists) {
        res.json(Notification.message("Danh mục menu này không tồn tại", "error", 404));
        return;
    }

    //sent data for next function
    res.locals = {
        ...res.locals,
        id,
        menu: menuItem.data
    }
    next();
}

module.exports.checkDeleteMenuItem = async (req, res, next) => {
    const { id } = req.params; //get something on params
    const menuItem = await Checking.isExists(id, MENU_MODEL_MONGOOSE, "_id"); //query selected checking to exists

    //condition checking
    if(!menuItem.exists) {
        res.json(Notification.message("Danh mục menu này không tồn tại", "error", 404));
        return;
    }

    //sent data for next function
    res.locals = {
        ...res.locals,
        id
    }
    next();
}

/* 
    Submenu
*/

module.exports.checkListSubMenu = async (req, res, next) => {
    let { disable = false, page = 1, onpage = 10} = req.query;
    let listSubMenu = await SUBMENU_MODEL_MONGOOSE.find({ disable: disable }) //query all menu item not disable

    const total = [...listSubMenu].length;

    let pagination = Pagination(page, onpage);

    listSubMenu = listSubMenu.slice(pagination.start, pagination.end); 

    res.locals = {
        ...res.locals,
        list_submenu: listSubMenu,
        total,
        page: Number(page),
        onPage: Number(onpage)
    }
    next(); //next function
}

module.exports.checkSubMenu = async (req, res, next) => {
    const { id } = req.params;

    //get subMenu of menu
    const subMenu = await Checking.isExists(id, SUBMENU_MODEL_MONGOOSE, "_id");
    //Check subMenu exist
    if(!subMenu.exists) {
        res.json(Notification.message("Phần tử này của menu không tồn tại", "error", 404));
        return;
    }

    //passed checking, next function
    res.locals = {
        ...res.locals,
        subMenu: subMenu.data
    }
    next();
}

module.exports.checkCreateSubMenu = async (req, res, next) => {
    let errors = {};
    const { menu, label, url } = req.body;
    
    //Check exist
    const checkMenu = Checking.isExists(menu, MENU_MODEL_MONGOOSE, "_id"); //menu exists

    //check menu
    if(Checking.isNull(menu)) {
        errors.menu = Notification.message("Danh mục chứa nhãn con không được để trống", "error", 404);
    }
    else {
        if(!(await checkMenu).exists) {
            errors.menu = Notification.message("Danh mục này không tồn tại", "error", 400);
        }
    }

    //check label
    if(Checking.isNull(label)) {
        errors.label = Notification.message("Tên nhãn không được để trống", "error", 404);
    }

    //check url
    if(Checking.isNull(url)) {
        errors.url = Notification.message("Đường dẫn của nhãn không được để trống", "error", 404);
    }
    else {
        if(Checking.isSpace(url)) {
            errors.url = Notification.message("Đường dẫn này không hợp lệ", "error", 400);
        }
    }

    if(Checking.testError(errors)) {
        res.json(Notification.message("Có lỗi xảy ra", "error", 400, { errors }));
        return;
    }

    res.locals = {
        ...res.locals,
        subMenu: {
            label,
            url,
            menu,
            disable: false //default mongodb is false
        }
    }
    next();
}

module.exports.checkPutSubMenu = async (req, res, next) => {
    let errors = {};
    const { id } = req.params;
    const { menu, label, url } = req.body;
    
    //Check exist
    const subMenu = await Checking.isExists(id, SUBMENU_MODEL_MONGOOSE, "_id");
    const checkMenu = Checking.isExists(menu, MENU_MODEL_MONGOOSE, "_id"); //menu exists

    //check exists
    if(!subMenu.exists) {
        res.json(Notification.message("Danh mục con không tồn tại", "error", 404));
        return;
    }

    //check menu
    if(Checking.isNull(menu)) {
        errors.menu = Notification.message("Danh mục chứa nhãn con không được để trống", "error", 404);
    }
    else {
        if(!(await checkMenu).exists) {
            errors.menu = Notification.message("Danh mục này không tồn tại", "error", 400);
        }
    }

    //check label
    if(Checking.isNull(label)) {
        errors.label = Notification.message("Tên nhãn không được để trống", "error", 404);
    }

    //check url
    if(Checking.isNull(url)) {
        errors.url = Notification.message("Đường dẫn của nhãn không được để trống", "error", 404);
    }
    else {
        if(Checking.isSpace(url)) {
            errors.url = Notification.message("Đường dẫn này không hợp lệ", "error", 400);
        }
    }

    if(Checking.testError(errors)) {
        res.json(Notification.message("Có lỗi xảy ra", "error", 400, { errors }));
        return;
    }

    res.locals = {
        ...res.locals,
        subMenu: {
            label,
            url,
            menu
        },
        id
    }
    next();
}

module.exports.checkDisableSubMenu = async (req, res, next) => {
    const { id } = req.params; //get something on params
    const subMenuItem = await Checking.isExists(id, SUBMENU_MODEL_MONGOOSE, "_id"); //query selected checking to exists

    //condition checking
    if(!subMenuItem.exists) {
        res.json(Notification.message("Danh mục con cho menu này không tồn tại", "error", 404));
        return;
    }

    //sent data for next function
    res.locals = {
        ...res.locals,
        id,
        subMenu: subMenuItem.data
    }
    next();
}

module.exports.checkDeleteSubMenu = async (req, res, next) => {
    const { id } = req.params; //get something on params
    const menuItem = await Checking.isExists(id, SUBMENU_MODEL_MONGOOSE, "_id"); //query selected checking to exists

    //condition checking
    if(!menuItem.exists) {
        res.json(Notification.message("Danh mục menu này không tồn tại", "error", 404));
        return;
    }

    //sent data for next function
    res.locals = {
        ...res.locals,
        id
    }
    next();
}