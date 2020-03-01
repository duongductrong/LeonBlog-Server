const jwt = require("jsonwebtoken");
const Notification = require("../modules/Notification");
const USER_MODEL_MONGOOSE = require("../models/mongooses/User.mongoose");

//handle get all users
module.exports.getUsers = (req, res) => {
    const { page, onPage, total, USERS_MONGOOSE } = res.locals;
    res.json(Notification.message("Lấy dữ liệu hoàn tất", "ok", 200, { page, onPage, total, users: USERS_MONGOOSE }));
}

//Handle get a user
module.exports.getUser = (req, res) => {
    const { user } = res.locals;

    res.json(Notification.message("Lấy dữ liệu hoàn tất", "ok", 200, { user }));
}

//Handle create account
module.exports.create =  async (req, res) => {
    const { user } = res.locals;

    try {
        const newUser = await USER_MODEL_MONGOOSE.create(user);
        res.json(Notification.message("Tạo tài khoản thành công", "ok", 200, { user: newUser }));
    }
    catch(err) {
        res.json(Notification.message("Có lỗi xảy ra trong quá trình tạo, vui lòng thử lại", "error", 400));
    }
}

//Handle update account
module.exports.put = async (req, res) => {
    const { user } = res.locals;
    try {
        const updated = await USER_MODEL_MONGOOSE.updateOne({_id: user._id}, {$set: user});
        res.json(Notification.message("Cập nhật tài khoản thành công", "ok", 200));
    }
    catch(err) {
        res.json(Notification.message("Cập nhật tài khoản thất bại, vui lòng kiểm tra lại", "error", 400));
    }
}

//Handle login account
module.exports.login = (req, res) => {
    let { user } = res.locals;

    //sign => token
    jwt.sign(
        user, //data users
        process.env.SECRET_PRIVATE, // secret private
        { expiresIn: '1h' }, //1h expires
        (err, token) => { //callback
            if(err) {
                res.json(Notification.message(err, "error", 400));
            }
            else {
                res.json(Notification.message("Đăng nhập thành công", "ok", 200, { token: token }))
            }
        }
    )
}

//Handle disabel account
module.exports.disable = (req, res) => {
    const { user } = res.locals;
    //Handle request disable account
    USER_MODEL_MONGOOSE.updateOne({_id: user._id}, {$set: {disable: !user.disable}})
    .then(result => {
        //Take a request disable this account
        if(result.n >= 1) {
            //Complete disabled
            if(result.nModified !== 0) {
                res.json(Notification.message(`Vô hiệu hóa tạm thời tài khoản thành công, tài khoản đã được ${!user.disable ? "TẮT" : "BẬT" }`, "ok", 200));
            } //Error
            else { 
                res.json(Notification.message("Yêu cầu vô hiệu hóa được chấp nhận, nhưng không vô hiệu hóa tài khoản thành công", "error", 400));
            }
        }
        else {
            //Error
            res.json(Notification.message("Yêu cầu vô hiệu hóa tài khoản có lỗi xảy ra, vui lòng kiểm tra lại", "error", 400));
        }
    })
    .catch(err => {
        res.json(Notification.message("Có lỗi xảy ra trong quá trình vô hiệu hóa tài khoản", "error", 400));
    })
}

//Handle delete account
module.exports.delete = (req, res) => {
    const { user } = res.locals;
    //Handle delete account
    USER_MODEL_MONGOOSE.deleteOne({_id: user._id})
    .then(result => {
        //Take a request delete
        if(result.n >= 1) {
            //Delete completed
            if(result.deletedCount !== 0) {
                res.json(Notification.message("Xóa vĩnh viễn người dùng thành công", "ok", 200));
            }
            else {
                res.json(Notification.message("Có lỗi xảy ra trong quá trình xóa vĩnh viễn người dùng, vẫn chưa được xóa", "error", 400));
            }
        }
        else { //Error
            res.json(Notification.message("Không có người dùng trùng khớp để tiến hành xóa vĩnh viễn", "error", 400));
        }
    }).catch(err => { //Error
        res.json(Notification.message(`Có lỗi xảy ra trong quá trình xóa, thông tin: ${err}`, "error", 400));
    })
}
