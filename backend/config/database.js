const mongoose = require("mongoose");

const connectDatabase = async () => {
    console.log("DB_URI inside database.js:");
    console.log(process.env.DB_URI);

    await mongoose.connect(process.env.DB_URI);

    console.log("MongoDB Connected");
};

module.exports = connectDatabase;