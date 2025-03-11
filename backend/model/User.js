// const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema(
//     {
//         username:{
//             type: String,
//             required: true,
//             unique: true,
//         },
//         email:{
//             type: String,
//             required: true,
//             unique: true,
//         },
//         password:{
//             type: String,
//             required: true,
//         },
//     },
//     {
//         timestamps: true,
//     }
// );

// module.exports = mongoose.model("User", userSchema);

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ["admin", "user"], // Define valid roles
            default: "user", // Default role is "user"
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("User", userSchema);