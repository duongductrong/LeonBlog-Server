const cloudinary = require("../models/systems/cloudinary.system");
const Notification = require("../modules/Notification");
const Pagination = require("../modules/Pagination");
const Checking = require("../modules/Checking");

module.exports.resources = (req, res) => {
    const { max_results = 500 } = req.query;
    cloudinary.resources(max_results)
    .then(result => {
        let pagination, resources, re_resource, total; //variables
        let { page = 1, onpage = 24 } = req.query; //query

        //---check number request query
        [page, onpage].forEach((e) => {
            if(!Checking.isNumber(e)) {
                res.json(Notification.message("Tham số truyền cho phân trang phải là kiểu NUMBER", "error", 400));
                return;
            }
        });

        //---Pagination
        re_resource = result.resources.filter(e => e.public_id.indexOf("blog") !== -1); //filter blog
        total = [...re_resource].length; //counts all resources
        pagination = Pagination(page, onpage);  //pagination
        resources = re_resource.slice(pagination.start, pagination.end); //handle resources
        //response json
        res.json(Notification.message("Lấy dữ liệu thành công", "ok", 200, { resources, total, page: Number(page), onPage: Number(onpage) }))
    })
    .catch(err => {
        res.json(Notification.message(err, "error", 400));
    })
}

module.exports.singleUpload = async (req, res) => {
    const { file } = res.locals;
    
    //upload file single
    cloudinary.uploadSingle(file.path)
    .then(result => { //done
        res.json(Notification.message("Đăng tải thành công", "ok", 200, { file: result }))
    })
    .catch(err => { //error
        let { http_code, message } = err;
        res.json(Notification.message(message, "error", http_code));
    })
}

module.exports.multipleUpload = (req, res) => {
    const { files } = res.locals;
    
    res.json(Notification.message("Lỗi ở đây 1", "error", 400, { error: JSON.stringify(files) }))

    //Call api to upload some file
    let uploaded = files.map(file => {
        return cloudinary.uploadMultiple(file.path)
    });

    res.json(Notification.message("Lỗi ở đây 2", "error", 400, { error: JSON.stringify(uploaded) }))
    return

    //Take promise get result
    Promise.all(uploaded)
    .then(result => { //done
        res.json(Notification.message("Đăng tải thành công", "ok", 200, { files: result }))
    })
    .catch(err => { //error
        let { http_code, message } = err;
        res.json(Notification.message(message, "error", http_code));
    })
}

module.exports.deleteSingle = (req, res) => {
    const { public_id } = req.body;
    //call api destroy (delete file);
    cloudinary.delete(public_id)
    .then(result => { //done
        res.json(Notification.message("Đã xóa tệp thành công", "ok", 200, { result: result.result }));
    })
    .catch(err => { //errors
        let { http_code, message } = err;
        res.json(Notification.message(message, "error", http_code));
    })
}

module.exports.deleteMultiple = (req, res) => {
    const { public_ids } = req.body;

    //check public ids
    if(!Array.isArray(public_ids)) {
        res.json(Notification.message("Xóa nhiều hơn một tệp yêu cầu gửi lên phải là mảng, danh sách", "error", 400));
        return;
    } //Check publics length
    else if(public_ids.length <= 0) {
        res.json(Notification.message("Không có gì để xóa trong danh sách tệp bạn gửi lên", "error", 400));
    }
    else {
        //loop a public_id to delete
        let results = public_ids.map(public_id => {
            return cloudinary.delete(public_id);
        });

        //results delete
        Promise.all(results)
        .then(result => {
            res.json(Notification.message("Đã xóa tất cả tệp đã chọn", "ok", 200, { result }));
        })
        .catch(err => {
            let { http_code, message } = err;
            res.json(Notification.message(message, "error", http_code));
        })
    }
    
}