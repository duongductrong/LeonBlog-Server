const bcrypt = require("bcryptjs");

module.exports.hash = async (salt, password) => {
    return new Promise((resolve, reject) => {
        return bcrypt.genSalt(salt,(err, salt) => {
            return bcrypt.hash(password, salt, (err, hash) => {
                if(err) {
                    reject(err);
                }
                else {
                    resolve(hash);
                }
            })
        })
    })
    // // hash password
    // console.log(salt, password)
    // let newSalt = bcrypt.genSaltSync(salt);
    // let hash = bcrypt.hashSync(password, newSalt);
    // return hash;
}

module.exports.compare = async (password = "", password_hashed = "") => {
    return new Promise((resolve, reject) => {
        return bcrypt.compare(password, password_hashed, (err, result) => {
            if(err) {
                reject(err);
            }
            else {
                resolve(result);
            }
        })
    })
}