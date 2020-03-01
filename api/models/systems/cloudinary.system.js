const cloudinary = require("cloudinary").v2;
const fs = require("fs");

let config = {
    cloud_name: "xskill",
    api_key: "945986318553276",
    api_secret: "nD3j9X_aOcx_m4jM6q999geo1iA"
}

let config1 = {
    cloud_name: "xskill-store",
    api_key: "451788234465945",
    api_secret: "4qF1rDoxVIb6MS4ickJkuUaT9UI"
}

cloudinary.config(config);

//option setting first
let options = {
    max_results: 500
}

let self = module.exports = {
    resources: (max_results) => {
        return new Promise((resolve, reject) => {
            //resources
            cloudinary.api.resources(options)
            .then(res => {
                resolve(res);
            })
            .catch(err => {
                reject(err);
            })
        })
    },
    uploadSingle: (file) => {
        return new Promise((resolve, reject) => {
            return cloudinary.uploader.upload(file,{ folder: "blog" })
            .then(result => {
                fs.unlinkSync(file) //upload done, delete path
                resolve({
                    public_id: result.public_id,
                    width: result.width,
                    height: result.height,
                    format: result.format,
                    resource_type: result.resource_type,
                    url: result.url,
                    secure_url: result.secure_url,
                    original_filename: result.original_filename
                }) //resolve result
            })
            .catch(err => {
                fs.unlinkSync(file)
                reject(err); //reject result
            })
        })
    },
    uploadMultiple: (file) => {
        return new Promise((resolve, reject) => {
            cloudinary.uploader.upload(file, { folder: "blog" })
            .then(result => {
                fs.unlinkSync(file) //upload done, delete path
                resolve({
                    public_id: result.public_id,
                    width: result.width,
                    height: result.height,
                    format: result.format,
                    resource_type: result.resource_type,
                    url: result.url,
                    secure_url: result.secure_url,
                    original_filename: result.original_filename,
                    // thum1: self.resizeImage(result.public_id, 200, 200),
                    // main: self.resizeImage(result.public_id, 500, 500),
                    // thum2: self.resizeImage(result.public_id, 300, 300)
                }) //resolve result
            })
            .catch(err => {
                fs.unlinkSync(file)
                reject(err); //reject result
            })
        })
    },
    delete: (id) => {
        return new Promise((resolve, reject) => {
            cloudinary.uploader.destroy(id)
            .then(res => {
                resolve(res);
            })
            .catch(err => {
                reject(err);
            })
        })
    },
    resizeImage: (public_id, w, h) => {
        return cloudinary.url(public_id, {
            width: w,
            height: h,
            crop: "scale",
            format: "jpg"
        })
    }
}