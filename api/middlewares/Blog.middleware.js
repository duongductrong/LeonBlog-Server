const CATEGORY_MODEL_MONGOOSE = require("../models/mongooses/Category.mongoose");
const BLOG_MODEL_MONGOOSE = require("../models/mongooses/Blog.mongoose");
const USER_MODEL_MONGOOSE = require("../models/mongooses/User.mongoose");
const Pagination = require("../modules/Pagination");
const Notification = require("../modules/Notification");
const Checking = require("../modules/Checking");

module.exports.checkGetBlogs = async (req, res, next) => {
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

    //handle route get blogs
    let blogs = await BLOG_MODEL_MONGOOSE.find({disable: disable}).sort({_id: "desc"}); //get all blogs
    const total = await BLOG_MODEL_MONGOOSE.countDocuments().where("disable", disable); //counts all blogs
    
    //get categories
    for(let i = 0; i < blogs.length; i++) {
        blogs[i].categories = (await CATEGORY_MODEL_MONGOOSE.find({_id: blogs[i].categories}))
        .map(e => JSON.stringify(e)) //Covert to JSON.stringify
        blogs[i].author = JSON.stringify((await USER_MODEL_MONGOOSE.findOne({_id: blogs[i].author})));
    }

    //pagination blogs
    blogs = blogs.slice(pagination.start, pagination.end);

    res.locals = {
        ...res.locals,
        page: Number(page),
        onPage: Number(onpage),
        total,
        blogs
    }
    next();
}

module.exports.checkGetBlog = async (req, res, next) => {
    const { url } = req.params;
    const { disable = false } = req.query;

    //Checking exists blog
    // let blog = await Checking.isExists(url, BLOG_MODEL_MONGOOSE, "url");
    
    let blog = await BLOG_MODEL_MONGOOSE.findOne({url : url}) //Find blog with URL
    .where("disable", disable); //Condition disable status 

    //check exists
    if(!blog) {
        res.json(Notification.message("Bài viết này không tồn tại", "error", 404));
        return;
    }

    let relate_posts = (await BLOG_MODEL_MONGOOSE.find({categories: {$in: blog.categories}}));

    //Sửa cấu trúc của categories => return JSON Object
    blog.categories = (await CATEGORY_MODEL_MONGOOSE.find({_id: blog.categories})).map(item => JSON.stringify(item));
    res.locals = {
        ...res.locals,
        blog: blog,
        relate_posts
    }
    next();
}

module.exports.checkCreate = async (req, res, next) => {
    let errors = {};
    let { userLogin } = res.locals;
    const { title, url, categories, description, paragraph, thumbnail } = req.body;

    const checkUrl = Checking.isExists(url, BLOG_MODEL_MONGOOSE, "url"); //Check url was requested
    const checkCategories = Checking.isAllExistsWithId(categories, CATEGORY_MODEL_MONGOOSE); //Check categories was requested

    //Check title
    if(Checking.isNull(title)) {
        errors.title = Notification.message("Tiêu đề không được để trống", "error", 404);
    }

    //Check url
    if(Checking.isNull(url)) {
        errors.url = Notification.message("Đường dẫn không được để trống", "error", 404);
    }
    else {
        if(!Checking.isUrl(url)) {
            errors.url = Notification.message("Đường dẫn không hợp lệ, không chứa khoản trống và các ký tự cấm", "error", 400);
        }
        else if((await checkUrl).exists) {
            errors.url = Notification.message("Đường dẫn này đã tồn tại", "error", 400);
        }
    }

    //Check categories
    if(Checking.isNull(categories) || categories.length <= 0) {
        errors.categories = Notification.message("Thể loại bài viết không được để trống", "error", 404);
    }
    else {
        if(!(await checkCategories).exists) {
            errors.categories = Notification.message("Thể loại có thành phần không tồn tại trong hệ thống hoặc yêu cầu thể loại gửi lên không phải mảng", "error", 400);
        }
    }

    //Check description
    if(Checking.isNull(description)) {
        errors.description = Notification.message("Đoạn miêu tả ngắn cho bài viết không được để trống", "error", 404);
    }

    //Check paragraph
    if(Checking.isNull(paragraph)) {
        errors.paragraph = Notification.message("Nội dung bài viết không được để trống", "error", 404);
    }

    //Handle author
    let author = userLogin._id; //User login'll a author for blog

    //Handle reaction default in mongodb

    //Handle thumbnail
    if(Checking.isNull(thumbnail)) {
        errors.thumbnail = Notification.message("Ảnh thumbnail cho bài viết không được để trống", "error", 404);
    }

    if(Checking.testError(errors)) {
        res.json(Notification.message("Có lỗi xảy ra", "error", 400, { errors }));
        return;
    }

    res.locals = {
        ...res.locals,
        blog: {
            title,
            url,
            categories,
            description,
            paragraph,
            author,
            thumbnail
        }
    }
    next();
}

module.exports.checkPut = async (req, res, next) => {
    let errors = {};
    const { userLogin } = res.locals;
    const url_blog = req.params.url;
    const { title, url, categories, description, paragraph, thumbnail } = req.body;

    const blog = await Checking.isExists(url_blog, BLOG_MODEL_MONGOOSE, "url");

    if(!blog.exists) {
        res.json(Notification.message("Bài viết này không tồn tại", "error", 404));
        return;
    }
    
    const checkUrl = Checking.isExists(url, BLOG_MODEL_MONGOOSE, "url"); //Check url was requested
    const checkCategories = Checking.isAllExistsWithId(categories, CATEGORY_MODEL_MONGOOSE); //Check categories was requested

    //Check title
    if(Checking.isNull(title)) {
        errors.title = Notification.message("Tiêu đề không được để trống", "error", 404);
    }

    //Check url
    if(url !== blog.data.url) {
        if(Checking.isNull(url)) {
            errors.url = Notification.message("Đường dẫn không được để trống", "error", 404);
        }
        else {
            if(!Checking.isUrl(url)) {
                errors.url = Notification.message("Đường dẫn không hợp lệ, không chứa khoản trống và các ký tự cấm", "error", 400);
            }
            else if((await checkUrl).exists) {
                errors.url = Notification.message("Đường dẫn này đã tồn tại", "error", 400);
            }
        }
    }

    //Check categories
    if(Checking.isNull(categories) || categories.length <= 0) {
        errors.categories = Notification.message("Thể loại bài viết không được để trống", "error", 404);
    }
    else {
        if(!(await checkCategories).exists) {
            errors.categories = Notification.message("Thể loại có thành phần không tồn tại trong hệ thống hoặc yêu cầu thể loại gửi lên không phải mảng", "error", 400);
        }
    }

    //Check description
    if(Checking.isNull(description)) {
        errors.description = Notification.message("Đoạn miêu tả ngắn cho bài viết không được để trống", "error", 404);
    }

    //Check paragraph
    if(Checking.isNull(paragraph)) {
        errors.paragraph = Notification.message("Nội dung bài viết không được để trống", "error", 404);
    }

    //Handle author
    //member will be check permission update blog of somebody else
    //admin is not check
    if(userLogin._id != blog.data.author && userLogin.permission !== "admin") {
        errors.author = Notification.message("Đối tượng được cập nhật bài viết phải là chủ bài viết", "error", 400);
    }

    //Handle reaction default in mongodb

    //Handle thumbnail
    if(Checking.isNull(thumbnail)) {
        errors.thumbnail = Notification.message("Ảnh thumbnail cho bài viết không được để trống", "error", 404);
    }

    if(Checking.testError(errors)) {
        res.json(Notification.message("Có lỗi xảy ra", "error", 400, { errors }));
        return;
    }

    res.locals = {
        ...res.locals,
        blog: {
            title,
            url,
            categories,
            description,
            paragraph,
            thumbnail
        },
        id: url_blog
    }
    next();
}

module.exports.checkDisable = async (req, res, next) => {
    const { id } = req.params;

    const blog = await Checking.isExists(id, BLOG_MODEL_MONGOOSE, "_id");
    if(!blog.exists) {
        res.json(Notification.message("Bài viết này không tồn tại", "error", 400));
        return;
    }

    res.locals = {
        ...res.locals,
        blog: blog.data,
        id
    }
    next();
}

module.exports.checkDelete = async (req, res, next) => {
    const { id } = req.params;

    const blog = await Checking.isExists(id, BLOG_MODEL_MONGOOSE, "_id");
    if(!blog.exists) {
        res.json(Notification.message("Bài viết này không tồn tại", "error", 400));
        return;
    }

    res.locals = {
        ...res.locals,
        id
    }
    next();
}