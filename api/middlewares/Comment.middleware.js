const BLOG_MODEL_MONGOOSE = require("../models/mongooses/Blog.mongoose");
const COMMENT_MODEL_MONGOOSE = require("../models/mongooses/Comment.mongoose");
const Pagination = require("../modules/Pagination");
const Notification = require("../modules/Notification");
const Checking = require("../modules/Checking");

module.exports.checkGetComments = async (req, res, next) => {
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
    let comments = await COMMENT_MODEL_MONGOOSE.find({disable: disable}).sort({_id: "desc"}); //get all comments
    const total = await COMMENT_MODEL_MONGOOSE.countDocuments().where("disable", disable); //counts all comments
    
    comments = comments.slice(pagination.start, pagination.end);

    res.locals = {
        ...res.locals,
        total,
        page: Number(page),
        onPage: Number(onpage),
        comments
    }
    next();
}

module.exports.checkGetComment = async (req, res, next) => {
    const { id } = req.params;

    const comment = await Checking.isExists(id, COMMENT_MODEL_MONGOOSE, "_id");
    if(!comment.exists) {
        res.json(Notification.message("Bình luận này không tồn tại", "error", 400));
        return;
    }

    const blog_of_comment = await Checking.isExists(comment.data.blog, BLOG_MODEL_MONGOOSE, "_id");
    
    res.locals = {
        ...res.locals,
        comment: comment.data,
        blog_of_comment: blog_of_comment.data
    }
}

module.exports.checkCreate = async (req, res, next) => {
    let errors = {};
    let { message, name, website, email, blog } = req.body;
    
    if(Checking.isNull(name)) {
        errors.name = Notification.message("Tên người bình luận không được để trống", "error", 404);
    }

    if(Checking.isNull(website)) {
        website = "";
    }
    
    if(Checking.isNull(message)) {
        errors.message = Notification.message("Bình luận không được để trống", "error", 404);
    }

    if(Checking.isNull(email)) {
        errors.email = Notification.message("Email không được để trống", "error", 404);
    }
    else {
        if(!Checking.isEmail(email)) {
            errors.email = Notification.message("Hãy cung cấp email hợp lệ để chúng tôi có thể trả lời bình luận cho bạn", "error", 404);
        }
    }

    //Handle checking blog was be commented
    const takeABlogOfComment = await Checking.isExists(blog, BLOG_MODEL_MONGOOSE, "_id");
    if(!takeABlogOfComment.exists) {
        errors.blog = Notification.message("Bài viết này không tồn tại, không thể bình luận", "error", 404);
    }

    //Handle checking errors
    if(Checking.testError(errors)) {
        res.json(Notification.message("Có lỗi xảy ra", "error", 400, { errors }));
        return;
    }

    //handle disable comment default is false on mongodb

    res.locals = {
        ...res.locals,
        comment: {
            message,
            name,
            website,
            email,
            blog: takeABlogOfComment.data._id,
            disable: false
        }
    }
    next();
}

// module.exports.checkPut = async (req, res, next) => {
    
// }

module.exports.checkDisable = async (req, res, next) => {
    const { id } = req.params;
    const comment = await Checking.isExists(id, COMMENT_MODEL_MONGOOSE, "_id");

    if(!comment.exists) {
        res.json(Notification.message("Bình luận này không tồn tại", "error", 404));
        return;
    }

    res.locals = {
        ...res.locals,
        comment: comment.data,
        id
    }
    next();
}

module.exports.checkDelete = async (req, res, next) => {
    const { id } = req.params;
    const comment = await Checking.isExists(id, COMMENT_MODEL_MONGOOSE, "_id");

    if(!comment.exists) {
        res.json(Notification.message("Bình luận này không tồn tại", "error", 404));
        return;
    }

    res.locals = {
        ...res.locals,
        id
    }
    next();
}