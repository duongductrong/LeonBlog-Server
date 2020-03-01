const CATEGORY_MODEL_MONGOOSE = require("../models/mongooses/Category.mongoose");
const BLOG_MODEL_MONGOOSE = require("../models/mongooses/Blog.mongoose");
const USER_MODEL_MONGOOSE = require("../models/mongooses/Blog.mongoose");
const Pagination = require("../modules/Pagination");
const Notification = require("../modules/Notification");
const Checking = require("../modules/Checking");

module.exports.checkGetCategories = async (req, res, next) => {
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

    let CATEGORIES_MONGOOSE = await CATEGORY_MODEL_MONGOOSE.find({disable: disable});
    const total = await CATEGORY_MODEL_MONGOOSE.countDocuments().where("disable", disable);
    //---Fetch Users
    CATEGORIES_MONGOOSE = CATEGORIES_MONGOOSE.slice(pagination.start, pagination.end);

    res.locals = {
        ...res.locals,
        page: Number(page),
        onPage: Number(onpage),
        total,
        CATEGORIES_MONGOOSE
    }
    next();
}

module.exports.checkGetCategory = async (req, res, next) => {
    const { url } = req.params;
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

    //category has a exists
    const category = await CATEGORY_MODEL_MONGOOSE
    .findOne({url: url}) //Find category with URL Query
    .where("disable", disable) //IF - disable: true -> not exists, ELSE - disable: false -> exists
    
    if(!category) {
        res.json(Notification.message("Thể loại này không tồn tại", "error", 404));
        return;
    }

    let blog = await BLOG_MODEL_MONGOOSE.find({categories: { $in: [category._id] }}); //Find all blog have a exists this category
    const total = [...blog].length; // counts all blog a exists this category

    //get categories
    for(let i = 0; i < blog.length; i++) {
        blog[i].categories = (await CATEGORY_MODEL_MONGOOSE.find({_id: blog[i].categories}))
        .map(e => JSON.stringify(e)) //Covert to JSON.stringify
        blog[i].author = JSON.stringify((await USER_MODEL_MONGOOSE.findOne({_id: blog[i].author}))); //Get Detail Author(User writed)
    }
    
    blog = blog.slice(pagination.start, pagination.end);

    res.locals = {
        ...res.locals,
        page: Number(page),
        onPage: Number(onpage),
        total,
        blog,
        category: category
    }
    next();
}

module.exports.checkCreate = async (req, res, next) => {
    let errors = {};
    let { name = "", url = "", description = "", thumbnail = "" } = req.body;
    //Function check url exists
    const checkUrl = Checking.isExists(url, CATEGORY_MODEL_MONGOOSE, "url");

    //name is null, undefined
    if(Checking.isNull(name)) {
        errors.name = Notification.message("Tên thể loại không được để trống", "error", 404);
    }
    
    //url is null, undefined
    if(Checking.isNull(url)) {
        errors.url = Notification.message("Đường dẫn thể loại không được để trống", "error", 404);
    }
    else {
        //Have a URL ?
        if(!Checking.isUrl(url)) {
            errors.url = Notification.message("Đường dẫn không hợp lệ, không đúng quy chuẩn của hệ thống", "error", 400);
        }
        else {
            //Exists ?
            if((await checkUrl).exists) {
                errors.url = Notification.message("Đường dẫn này đã tồn tại cho một thể loại khác", "error", 400);
            }
        }
    }

    //Check thumbnail
    if(Checking.isNull(thumbnail)) {
        errors.thumbnail = Notification.message("Ảnh thumbnail không được để trống", "error", 404);
    }

    //Check description
    if(Checking.isNull(description)) {
        description = "";
    }

    if(Checking.testError(errors)) {
        res.json(Notification.message("Có lỗi xảy ra", "error", 400, { errors }));
        return;
    }

    res.locals = {
        ...res.locals,
        category: {
            name,
            url,
            description,
            thumbnail
        }
    }
    next();
}

module.exports.checkPut = async (req, res, next) => {
    let errors = {};
    const url_category = req.params.url; //params
    let { name, url, description, thumbnail } = req.body; //value need update
    //take a category have a exists
    const category = await Checking.isExists(url_category, CATEGORY_MODEL_MONGOOSE, "url");
    const checkUrl = Checking.isExists(url, CATEGORY_MODEL_MONGOOSE, "url");

    if(!category.exists) {
        res.json(Notification.message("Thể loại này không tồn tại", "error", 404));
        return;
    }

    //name is null, undefined
    if(Checking.isNull(name)) {
        errors.name = Notification.message("Tên thể loại không được để trống", "error", 404);
    }
    
    //If url new # url old, let's check it
    if(url !== category.data.url) {
        //url is null, undefined
        if(Checking.isNull(url)) {
            errors.url = Notification.message("Đường dẫn thể loại không được để trống", "error", 404);
        }
        else {
            //Have a URL ?
            if(!Checking.isUrl(url)) {
                errors.url = Notification.message("Đường dẫn không hợp lệ, không đúng quy chuẩn của hệ thống", "error", 400);
            }
            else {
                //Exists ?
                if((await checkUrl).exists) {
                    errors.url = Notification.message("Đường dẫn này đã tồn tại cho một thể loại khác", "error", 400);
                }
            }
        }
    }

    //Check thumbnail
    if(Checking.isNull(thumbnail)) {
        errors.thumbnail = Notification.message("Ảnh thumbnail không được để trống", "error", 404);
    }

    //Check description
    if(Checking.isNull(description)) {
        description = "";
    }

    if(Checking.testError(errors)) {
        res.json(Notification.message("Có lỗi xảy ra", "error", 400, { errors }));
        return;
    }

    res.locals = {
        ...res.locals,
        category: {
            name,
            url,
            description,
            thumbnail
        },
        id: url_category
    }
    next();
}

module.exports.checkDisable = async (req, res, next) => {
    const { id } = req.params;

    const category = await Checking.isExists(id, CATEGORY_MODEL_MONGOOSE, "_id");
    if(!category.exists) {
        res.json(Notification.message("Thể loại này không tồn tại", "error", 404));
    }
    else {
        res.locals = {
            ...res.locals,
            id,
            category: category.data
        }
        next();
    }
}

module.exports.checkDelete = async (req, res, next) => {
    const { id } = req.params;

    const category = await Checking.isExists(id, CATEGORY_MODEL_MONGOOSE, "_id");
    if(!category.exists) {
        res.json(Notification.message("Thể loại này không tồn tại", "error", 404));
    }
    else {
        res.locals = {
            ...res.locals,
            id
        }
        next();
    }
}