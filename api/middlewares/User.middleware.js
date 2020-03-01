const jwt = require("jsonwebtoken");
const USER_MODEL_MONGOOSE = require("../models/mongooses/User.mongoose");
const Pagination = require("../modules/Pagination");
const Notification = require("../modules/Notification");
const Checking = require("../modules/Checking");
const Password = require("../modules/Password");
const SetPermission = require("../modules/SetPermission");

module.exports.checkGetUsers = async (req, res, next) => {
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

    let USERS_MONGOOSE = await USER_MODEL_MONGOOSE.find({disable: disable}).sort({_id: "desc"});
    const total = await USER_MODEL_MONGOOSE.countDocuments().where("disable", disable);
    //---Fetch Users
    USERS_MONGOOSE = USERS_MONGOOSE.slice(pagination.start, pagination.end);

    res.locals = {
        ...res.locals,
        page: Number(page),
        onPage: Number(onpage),
        total,
        USERS_MONGOOSE
    }
    next();
}

module.exports.checkGetUser = async (req, res, next) => {
    const { id } = req.params;
    const { userLogin } = res.locals;

    if(id === "user_authorization") {
        let data = {
            _id: userLogin,
            username: userLogin.username,
            permission: userLogin.permission,
            firstname: userLogin.firstname,
            lastname: userLogin.lastname
        }
        res.json(Notification.message("Xác thực thành công", "auth", 200, {user: data}));
        return;
    }

    const USER = await Checking.isExists(id, USER_MODEL_MONGOOSE, "_id");
    if(!USER.exists) {
        res.json(Notification.message("Người dùng này không tồn tại, vui lòng kiểm tra lại", "error", 400));
        return;
    }
    else {
        res.locals.user = USER.data;
        next();
    }
}

module.exports.checkCreate = async (req, res, next) => {
    let { username, password, firstname, lastname, email, address, social = []} = req.body;
    let errors = {};
    let usersList = await USER_MODEL_MONGOOSE.countDocuments();
    
    if(usersList > 0) {
        res.json(Notification.message("Vui lòng liên hệ chủ website để được cấp tài khoản", "error", 400));
        return;
    }

    let CheckUsername = Checking.isExists(username, USER_MODEL_MONGOOSE, "username");
    let CheckEmail = Checking.isExists(email, USER_MODEL_MONGOOSE, "email");

    if(Checking.isNull(username)) {
        errors.username = Notification.message("Tên người dùng không được để trống", "error", 404);
    }
    else {
        if((await CheckUsername).exists) {
            errors.username = Notification.message("Tên người dùng này đã tồn tại", "error", 400);
        }
    }

    let password_was_hash = "";
    if(Checking.isNull(password)) {
        errors.password = Notification.message("Mật khẩu không được để trống", "error", 404);
    }
    else {
        if(!Checking.isPassword(password)) {
            errors.password = Notification.message("Mật khẩu phải trên 8 ký tự, chứa chữ hoa, thường, và số", "error", 400);
        }
        else {
            password_was_hash = Password.hash(10, password);
        }
    }

    if(Checking.isNull(firstname)) {
        errors.firstname = Notification.message("Họ người dùng không được để trống", "error", 404);
    }
    if(Checking.isNull(lastname)) {
        errors.lastname = Notification.message("Tên người dùng không được để trống", "error", 404);
    }

    if(Checking.isNull(email)) {
        errors.email = Notification.message("Email không được để trống", "error", 404);
    }
    else {
        if(!Checking.isEmail(email)) {
            errors.email = Notification.message("Email phải có dạng example@gmail.com", "error", 400);
        }
        else {
            if((await CheckEmail).exists) {
                errors.email = Notification.message("Email này đã tồn tại, vui lòng chọn email khác", "error", 400);
            }
        }
    }

    if(Checking.isNull(address)) {
        address = "";
    }
    
    if(social.length <= 0) {
        social = [];
    }

    permission = await SetPermission();
    disable = false;

    if(Checking.testError(errors)) {
        res.json(Notification.message("Có lỗi xảy ra", "error", 400, { errors: errors }));
        return;
    }
    else {
        res.locals = {
            ...res.locals,
            user: {
                username,
                password: await password_was_hash,
                firstname,
                lastname,
                email,
                permission,
                disable,
                social,
                address
            }
        }
        next();
    }
}

module.exports.checkPut = async (req, res, next) => {
    let errors = {};
    const { userLogin } = res.locals;
    const { id } = req.params;
    let { username, password, firstname, lastname, email, address, social = [], permission, disable } = req.body;
    //Check something
    let CheckUsername = Checking.isExists(username, USER_MODEL_MONGOOSE, "username");
    let CheckEmail = Checking.isExists(email, USER_MODEL_MONGOOSE, "email");

    const user = await Checking.isExists(id, USER_MODEL_MONGOOSE, "_id"); //Check id params have exists

    //Check user have a exists
    if(!user.exists) {
        res.json(Notification.message("Người dùng này không tồn tại", "error", 400));
        return;
    }
    else {
        if(userLogin._id != user.data._id && userLogin.permission !== "admin") {
            res.json(Notification.message("Bạn không có quyền cập nhật thông tin tài khoản khác", "error", 400));
            return;
        }
    }

    //Check username
    if(userLogin.permission === "admin") {
        //Not compare
        if(!Checking.compare(username, user.data.username)) {
            //username is null, undefined
            if(Checking.isNull(username)) {
                errors.username = Notification.message("Tên người dùng không được để trống", "error", 404);
            }
            else {
                //Username exists
                if((await CheckUsername).exists) {
                    errors.username = Notification.message("Tên người dùng này đã tồn tại", "error", 400);
                }
            }
        }
    }
    else {
        errors.username = Notification.message("Bạn không có quyền cập nhật tên người dùng, hãy liên hệ quản trị", "error", 400);
    }

    //---Check password
    let password_was_hash = "";
    //**If password status have is on => checking
    if(!Checking.isNull(password) && userLogin.permission !== "admin") {
        //-Get request old password, confirm password
        let { old_password, confirm_password } = req.body;
        //-Compare password old and user.data.password
        let compare_password = Password.compare(old_password, user.data.password);
        //-Not
        if(!(await compare_password)) {
            errors.old_password = Notification.message("Mật khẩu hiện tại không chính xác", "error", 400);
        } //-Equal
        else {
            //-Is password
            if(!Checking.isPassword(password)) {
                errors.password = Notification.message("Mật khẩu phải trên 8 ký tự, chứa chữ hoa, thường, và số", "error", 400);
            } //-compare password comfirm with password new
            else if (confirm_password !== password) {
                errors.password = Notification.message("Mật khẩu xác nhận và mật khẩu mới bạn nhập không giống nhau", "error", 400);
            }
            else {
                //-passed, hash
                password_was_hash = Password.hash(10, password);
            }
        }
    }

    //--Checking simple
    if(Checking.isNull(firstname)) {
        errors.firstname = Notification.message("Họ người dùng không được để trống", "error", 404);
    }

    if(Checking.isNull(lastname)) {
        errors.lastname = Notification.message("Tên người dùng không được để trống", "error", 404);
    }

    //Check email
    if(!Checking.compare(email, user.data.email)) {
        if(Checking.isNull(email)) {
            errors.email = Notification.message("Email không được để trống", "error", 404);
        }
        else {
            if(!Checking.isEmail(email)) {
                errors.email = Notification.message("Email phải có dạng example@gmail.com", "error", 400);
            }
            else {
                if((await CheckEmail).exists) {
                    errors.email = Notification.message("Email này đã tồn tại, vui lòng chọn email khác", "error", 400);
                }
            }
        }
    }

    if(Checking.isNull(address)) {
        address = "";
    }
    
    if(social.length <= 0) {
        social = [];
    }

    if(userLogin.permission === "admin") {
        let listPermission = ["admin", "member", "writer"];
        if(Checking.isNull(permission)) {
            errors.permission = Notification.message("Phân quyền cho tài khoản không được để trống", "error", 404);
        }
        else {
            let result = listPermission.find(e => permission === e);
            if(Checking.isNull(result)) {
                errors.permission = Notification.message("Phân quyền này không tồn tại trong danh sách", "error", 400);
            }
        }
    }

    if(Checking.testError(errors)) {
        res.json(Notification.message("Có lỗi xảy ra", "error", 400, { errors: errors }));
        return;
    }

    let data = userLogin.permission === "admin" ? {
        _id: user.data._id,
        username,
        firstname,
        lastname,
        email,
        address,
        social,
        permission,

    } : {
        _id: user.data._id,
        firstname,
        lastname,
        email,
        address,
        social,
        password,
    };
    
    res.locals = {
        ...res.locals,
        user: data
    }
    next();
}

module.exports.checkDisable = async (req, res, next) => {
    const { id } = req.params; //fetch params
    const { userLogin } = res.locals;
    const user = await Checking.isExists(id, USER_MODEL_MONGOOSE, "_id"); //fetch user

    //User not exists
    if(!user.exists) {
        res.json(Notification.message("Tài khoản này không tồn tại", "error", 404));
        return;
    }

    //Không cho phép tự hủy
    if(userLogin._id == user.data._id && userLogin.username === user.data.username) {
        res.json(Notification.message("Tài khoản này không được quyền xóa chính mình", "error", 400));
    }
    
    res.locals = {
        ...res.locals, //spread data
        user: user.data //sent data
    }
    next();
}

module.exports.checkDelete = async (req, res, next) => {
    const { id } = req.params; //fetch params
    const { userLogin } = res.locals;
    const user = await Checking.isExists(id, USER_MODEL_MONGOOSE, "_id"); //fetch user

    //User not exists
    if(!user.exists) {
        res.json(Notification.message("Tài khoản này không tồn tại", "error", 404));
        return;
    }

    //Không cho phép tự hủy
    if(userLogin._id == user.data._id && userLogin.username === user.data.username) {
        res.json(Notification.message("Tài khoản này không được quyền xóa chính mình", "error", 400));
    }
    
    res.locals = {
        ...res.locals, //spread data
        user: user.data //sent data
    }
    next();
}

module.exports.checkLogin = async (req, res, next) => {
    const { username = "", password = "" } = req.body;
    const user = await Checking.isExists(username, USER_MODEL_MONGOOSE, "username");
    if(!user.exists) {
        res.json(Notification.message("Tên tài khoản không chính xác", "error", 404));
        return;
    }
    
    if(!(await Password.compare(password, user.data.password))) {
        res.json(Notification.message("Mật khẩu không chính xác", "error", 400));
        return;
    }

    res.locals = {
        ...res.locals,
        user
    }
    next();
}

module.exports.checkAuth = (req, res, next) => {
    let headers = req.headers.authorization; //Call headers get authorization
    if(!headers) {
        res.json(Notification.message("Yêu cầu xác thực thất bại, không nhận được mã xác thực, vui lòng đăng nhập", "error", 403));
        return;
    }   
    headers = headers.split(" "); //Cut headers

    //Not error
    if(headers[0] === "Bearer") {
        //Bearer compare, coninute checking token
        jwt.verify(headers[1], process.env.SECRET_PRIVATE, (err, decoded) => {
            if(err) {
                res.json(Notification.message(`Xác thực thất bại - Lỗi: ${err}`, "error", 400));
                return;
            }
            //passed
            //sent data userLogin to checking
            res.locals.userLogin = decoded.data;
            next();
        })
    }
    else {
        //Error
        res.json(Notification.message("Xác thực thất bại", "error", 400));
        return;
    }
}

module.exports.isAdmin_isTester = (req, res, next) => {
    const { userLogin } = res.locals;
    if(userLogin.permission !== "admin" && userLogin.permission !== "tester") {
        res.json(Notification.message("Bạn không có quyền truy cập, thực hiện hành động này", "error", 400));
        return;
    }
    next();
}