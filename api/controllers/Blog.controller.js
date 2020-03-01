const BLOG_MODEL_MONGOOSE = require("../models/mongooses/Blog.mongoose");
const Notification = require("../modules/Notification");

module.exports.blogs = (req, res) => {
    const { page, onPage, total, blogs } = res.locals;
    
    res.json(Notification.message("Lấy dữ liệu hoàn tất", "ok", 200, { page, onPage, total, blogs}));
}

module.exports.blog = (req, res) => {
    const { blog, relate_posts } = res.locals;

    res.json(Notification.message("Lấy dữ liệu hoàn tất", "ok", 200, { blog, relate_posts }));
}

module.exports.create = async (req, res) => {
    const { blog } = res.locals;
    
    try {
        const created = await BLOG_MODEL_MONGOOSE.create(blog);
        res.json(Notification.message("Tạo bài viết thành công", "ok", 200, { blog: created }));
    }
    catch(err) {
        res.json(Notification.message(`Có lỗi xảy ra khi tạo bài viết, thông tin ${err}`, "error", 400))
    }
}

module.exports.put = (req, res) => {
    const { id, blog } = res.locals;
    BLOG_MODEL_MONGOOSE.updateOne({url: id}, { $set: blog })
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
            res.json(Notification.message("Cập nhật thất bại, không có bài viết nào hợp lệ", "error", 400));
        }
    })
    .catch(err => {
        res.json(Notification.message(`Có lỗi xảy ra, cập nhật thất bại - Chi tiết lỗi: ${err}`))
    })
}

module.exports.disable = (req, res) => {
    const { id, blog } = res.locals;

    //Query update disable status
    BLOG_MODEL_MONGOOSE.updateOne({_id: id}, { $set: { disable: !blog.disable } })
    .then(result => {
        if(result.n >= 1) {
            if(result.nModified !== 0) {
                res.json(Notification.message("Vô hiệu hóa thành công", "ok", 200));
            }
            else {
                res.json(Notification.message("Không có gì thay đổi trong quá trình vô hiệu hóa bài viết", "error", 400));
            }
        }
        else {
            res.json(Notification.message("Vô hiệu hóa thất bại, không có bài viết nào hợp lệ", "error", 400));
        }
    })
    .catch(err => {
        res.json(Notification.message(`Có lỗi xảy ra, không thể vô hiệu hóa bài viết - chi tiết: ${err}`, "error", 400));
    })
}

module.exports.delete = (req, res) => {
    const { id } = res.locals;
    
    //Query delete category
    BLOG_MODEL_MONGOOSE.deleteOne({_id: id})
    .then(result => {
        //Take a request delete
        if(result.n >= 1) {
            //Delete completed
            if(result.deletedCount !== 0) {
                res.json(Notification.message("Xóa vĩnh viễn bài viết thành công", "ok", 200));
            }
            else {
                res.json(Notification.message("Có lỗi xảy ra trong quá trình xóa vĩnh viễn bài viết, vẫn chưa được xóa", "error", 400));
            }
        }
        else { //Error
            res.json(Notification.message("Không có bài viết trùng khớp để tiến hành xóa vĩnh viễn", "error", 400));
        }
    }) //Error
    .catch(err => {
        res.json(Notification.message(`Có lỗi xảy ra, không thể xóa vĩnh viễn bài viết - chi tiết: ${err}`, "error", 400));
    })
}