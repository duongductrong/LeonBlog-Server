const CONTACT_MODEL_MONGOOSE = require("../models/mongooses/Contact.mongoose");
const Notification = require("../modules/Notification");

module.exports.contacts = (req, res) => {
    const { page, onPage, total, contacts } = res.locals;
    
    res.json(Notification.message("Lấy dữ liệu hoàn tất", "ok", 200, { page, onPage, total, contacts}));
}

module.exports.contact = (req, res) => {
    const { contact } = res.locals;

    res.json(Notification.message("Lấy dữ liệu hoàn tất", "ok", 200, { contact }));
}

module.exports.create = async (req, res) => {
    const { contact } = res.locals;
    
    try {
        const created = await CONTACT_MODEL_MONGOOSE.create(contact);
        res.json(Notification.message("Đã gửi liên hệ, góp ý", "ok", 200, { contact: created }));
    }
    catch(err) {
        res.json(Notification.message(`Có lỗi xảy ra khi gửi liên hệ, thông tin ${err}`, "error", 400))
    }
}

module.exports.disable = (req, res) => {
    const { id, contact } = res.locals;

    //Query update disable status
    CONTACT_MODEL_MONGOOSE.updateOne({_id: id}, { $set: { disable: !contact.disable } })
    .then(result => {
        if(result.n >= 1) {
            if(result.nModified !== 0) {
                res.json(Notification.message("Vô hiệu hóa thành công", "ok", 200));
            }
            else {
                res.json(Notification.message("Không có gì thay đổi trong quá trình vô hiệu hóa liên hệ", "error", 400));
            }
        }
        else {
            res.json(Notification.message("Vô hiệu hóa thất bại, không có liên hệ nào hợp lệ", "error", 400));
        }
    })
    .catch(err => {
        res.json(Notification.message(`Có lỗi xảy ra, không thể vô hiệu hóa liên hệ - chi tiết: ${err}`, "error", 400));
    })
}

module.exports.delete = (req, res) => {
    const { id } = res.locals;
    
    //Query delete category
    CONTACT_MODEL_MONGOOSE.deleteOne({_id: id})
    .then(result => {
        //Take a request delete
        if(result.n >= 1) {
            //Delete completed
            if(result.deletedCount !== 0) {
                res.json(Notification.message("Xóa vĩnh viễn liên hệ thành công", "ok", 200));
            }
            else {
                res.json(Notification.message("Có lỗi xảy ra trong quá trình xóa vĩnh viễn liên hệ, vẫn chưa được xóa", "error", 400));
            }
        }
        else { //Error
            res.json(Notification.message("Không có liên hệ trùng khớp để tiến hành xóa vĩnh viễn", "error", 400));
        }
    }) //Error
    .catch(err => {
        res.json(Notification.message(`Có lỗi xảy ra, không thể xóa vĩnh viễn liên hệ - chi tiết: ${err}`, "error", 400));
    })
}