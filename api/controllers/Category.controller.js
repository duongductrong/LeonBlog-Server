const CATEGORY_MODEL_MONGOOSE = require("../models/mongooses/Category.mongoose");
const Notification = require("../modules/Notification");

module.exports.categories = (req, res) => {
    const { page, onPage, total, CATEGORIES_MONGOOSE } = res.locals;

    res.json(Notification.message("Lấy dữ liệu hoàn tất", "ok", 200, { page, onPage, total, categories: CATEGORIES_MONGOOSE }));
}

module.exports.category = (req, res) => {
    const { category, blog, page, onPage, total } = res.locals;

    res.json(Notification.message("Lấy dữ liệu hoàn tất", "ok", 200, { page, onPage, total, category, blog_of_category: blog }));
}

module.exports.create = async (req, res) => {
    const { category } = res.locals;
    try {
        const created = await CATEGORY_MODEL_MONGOOSE.create(category);
        res.json(Notification.message("Tạo thẻ thành công", "ok", 200, { category: created }));
    }
    catch(err) {
        res.json(Notification.message(`Có lỗi xảy ra, thông tin ${err}`, "error", 400))
    }
}

module.exports.put = (req, res) => {
    const { id, category } = res.locals;
    CATEGORY_MODEL_MONGOOSE.updateOne({url: id}, { $set: category })
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
            res.json(Notification.message("Cập nhật thất bại, không có thể loại nào hợp lệ", "error", 400));
        }
    })
    .catch(err => {
        res.json(Notification.message(`Có lỗi xảy ra, cập nhật thất bại - Chi tiết lỗi: ${err}`))
    })
}

module.exports.disable = (req, res) => {
    const { id, category } = res.locals;

    //Query update disable status
    CATEGORY_MODEL_MONGOOSE.updateOne({_id: id}, { $set: {disable: !category.disable} })
    .then(result => {
        if(result.n >= 1) {
            if(result.nModified !== 0) {
                res.json(Notification.message("Vô hiệu hóa thành công", "ok", 200));
            }
            else {
                res.json(Notification.message("Không có gì thay đổi trong quá trình vô hiệu hóa thể loại", "error", 400));
            }
        }
        else {
            res.json(Notification.message("Vô hiệu hóa thất bại, không có thể loại nào hợp lệ", "error", 400));
        }
    })
    .catch(err => {
        res.json(Notification.message(`Có lỗi xảy ra, không thể vô hiệu hóa thể loại - chi tiết: ${err}`, "error", 400));
    })
}

module.exports.delete = (req, res) => {
    const { id } = res.locals;
    
    //Query delete category
    CATEGORY_MODEL_MONGOOSE.deleteOne({_id: id})
    .then(result => {
        //Take a request delete
        if(result.n >= 1) {
            //Delete completed
            if(result.deletedCount !== 0) {
                res.json(Notification.message("Xóa vĩnh viễn thể loại thành công", "ok", 200));
            }
            else {
                res.json(Notification.message("Có lỗi xảy ra trong quá trình xóa vĩnh viễn thể loại, vẫn chưa được xóa", "error", 400));
            }
        }
        else { //Error
            res.json(Notification.message("Không có thể loại trùng khớp để tiến hành xóa vĩnh viễn", "error", 400));
        }
    }) //Error
    .catch(err => {
        res.json(Notification.message(`Có lỗi xảy ra, không thể xóa vĩnh viễn thể loại - chi tiết: ${err}`, "error", 400));
    })
}