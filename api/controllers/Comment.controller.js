const COMMENT_MODEL_MONGOOSE = require("../models/mongooses/Comment.mongoose");
const Notification = require("../modules/Notification");

module.exports.comments = (req, res) => {
    const { page, onPage, total, comments } = res.locals;
    
    res.json(Notification.message("Lấy dữ liệu hoàn tất", "ok", 200, { page, onPage, total, comments}));
}

module.exports.comment = (req, res) => {
    const { blog_of_comment, comment } = res.locals;

    res.json(Notification.message("Lấy dữ liệu hoàn tất", "ok", 200, { blog_of_comment, comment }));
}

module.exports.create = async (req, res) => {
    const { comment } = res.locals;
    
    try {
        const created = await COMMENT_MODEL_MONGOOSE.create(comment);
        res.json(Notification.message("Tạo bình luận thành công", "ok", 200, { comment: created }));
    }
    catch(err) {
        res.json(Notification.message(`Có lỗi xảy ra khi tạo bình luận, thông tin ${err}`, "error", 400))
    }
}

// module.exports.put = (req, res) => {
//     const { id, blog } = res.locals;
//     BLOG_MODEL_MONGOOSE.updateOne({url: id}, { $set: blog })
//     .then(result => {
//         if(result.n >= 1) {
//             if(result.nModified !== 0) {
//                 res.json(Notification.message("Cập nhật thành công", "ok", 200));
//             }
//             else {
//                 res.json(Notification.message("Không có gì thay đổi trong quá trình cập nhật", "ok", 200));
//             }
//         }
//         else {
//             res.json(Notification.message("Cập nhật thất bại, không có bài viết nào hợp lệ", "error", 400));
//         }
//     })
//     .catch(err => {
//         res.json(Notification.message(`Có lỗi xảy ra, cập nhật thất bại - Chi tiết lỗi: ${err}`))
//     })
// }

module.exports.disable = (req, res) => {
    const { id, comment } = res.locals;

    //Query update disable status
    COMMENT_MODEL_MONGOOSE.updateOne({_id: id}, { $set: { disable: !comment.disable } })
    .then(result => {
        if(result.n >= 1) {
            if(result.nModified !== 0) {
                res.json(Notification.message("Vô hiệu hóa thành công", "ok", 200));
            }
            else {
                res.json(Notification.message("Không có gì thay đổi trong quá trình vô hiệu hóa bình luận", "error", 400));
            }
        }
        else {
            res.json(Notification.message("Vô hiệu hóa thất bại, không có bình luận nào hợp lệ", "error", 400));
        }
    })
    .catch(err => {
        res.json(Notification.message(`Có lỗi xảy ra, không thể vô hiệu hóa bình luận - chi tiết: ${err}`, "error", 400));
    })
}

module.exports.delete = (req, res) => {
    const { id } = res.locals;
    
    //Query delete category
    COMMENT_MODEL_MONGOOSE.deleteOne({_id: id})
    .then(result => {
        //Take a request delete
        if(result.n >= 1) {
            //Delete completed
            if(result.deletedCount !== 0) {
                res.json(Notification.message("Xóa vĩnh viễn bình luận thành công", "ok", 200));
            }
            else {
                res.json(Notification.message("Có lỗi xảy ra trong quá trình xóa vĩnh viễn bình luận, vẫn chưa được xóa", "error", 400));
            }
        }
        else { //Error
            res.json(Notification.message("Không có bình luận trùng khớp để tiến hành xóa vĩnh viễn", "error", 400));
        }
    }) //Error
    .catch(err => {
        res.json(Notification.message(`Có lỗi xảy ra, không thể xóa vĩnh viễn bình luận - chi tiết: ${err}`, "error", 400));
    })
}