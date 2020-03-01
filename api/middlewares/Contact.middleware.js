const CONTACT_MODEL_MONGOOSE = require("../models/mongooses/Contact.mongoose");
const Pagination = require("../modules/Pagination");
const Notification = require("../modules/Notification");
const Checking = require("../modules/Checking");

module.exports.checkGetContacts = async (req, res, next) => {
    const { page = 1, onpage = 10, offset, limit, disable = false } = req.query;
    
    //---check number request query
    [page, onpage].forEach((e) => {
        if(!Checking.isNumber(e)) {
            res.json(Notification.message("Tham số truyền cho phân trang phải là kiểu NUMBER", "error", 400));
            return;
        }
    });

    //---Pagination
    let pagination = Pagination(page, onpage);

    //---get all
    let contacts = await CONTACT_MODEL_MONGOOSE.find({disable: disable}).sort({_id: "desc"}); //get all contacts
    const total = await CONTACT_MODEL_MONGOOSE.countDocuments().where("disable", disable); //counts all contacts
    
    contacts = contacts.slice(pagination.start, pagination.end);

    res.locals = {
        ...res.locals,
        total,
        page: Number(page),
        onPage: Number(onpage),
        contacts
    }
    next();
}

module.exports.checkGetContact = async (req, res, next) => {
    const { id } = req.params;

    const contact = await Checking.isExists(id, CONTACT_MODEL_MONGOOSE, "_id");
    if(!contact.exists) {
        res.json(Notification.message("Liên hệ này không tồn tại", "error", 400));
        return;
    }
    
    res.locals = {
        ...res.locals,
        contact: contact.data
    }
    next();
}

module.exports.checkCreate = async (req, res, next) => {
    let errors = {};
    let { message, name, email } = req.body;
    
    if(Checking.isNull(name)) {
        errors.name = Notification.message("Tên người liên hệ không được để trống", "error", 404);
    }

    if(Checking.isNull(message)) {
        errors.message = Notification.message("Tin nhắn không được để trống", "error", 404);
    }

    if(Checking.isNull(email)) {
        errors.email = Notification.message("Email không được để trống", "error", 404);
    }
    else {
        if(!Checking.isEmail(email)) {
            errors.email = Notification.message("Hãy cung cấp email hợp lệ để chúng tôi có thể phản hồi ý kiến cho bạn", "error", 404);
        }
    }

    //Handle checking errors
    if(Checking.testError(errors)) {
        res.json(Notification.message("Có lỗi xảy ra", "error", 400, { errors }));
        return;
    }

    //handle disable contact default is false on mongodb

    res.locals = {
        ...res.locals,
        contact: {
            message,
            name,
            email,
            disable: false
        }
    }
    next();
}

module.exports.checkDisable = async (req, res, next) => {
    const { id } = req.params;
    const contact = await Checking.isExists(id, CONTACT_MODEL_MONGOOSE, "_id");

    if(!contact.exists) {
        res.json(Notification.message("Liên hệ, góp ý này không tồn tại", "error", 404));
        return;
    }

    res.locals = {
        ...res.locals,
        contact: contact.data,
        id
    }
    next();
}

module.exports.checkDelete = async (req, res, next) => {
    const { id } = req.params;
    const contact = await Checking.isExists(id, CONTACT_MODEL_MONGOOSE, "_id");

    if(!contact.exists) {
        res.json(Notification.message("Liên hệ, góp ý này không tồn tại", "error", 404));
        return;
    }

    res.locals = {
        ...res.locals,
        id
    }
    next();
}