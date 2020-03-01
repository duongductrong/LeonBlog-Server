const USER_MODEL = require("../models/mongooses/User.mongoose");

module.exports = async () => {
    const USERS = await USER_MODEL.find();
    if(USERS.length <= 0) {
        return "admin";
    }
    else {
        return "member";
    }
}