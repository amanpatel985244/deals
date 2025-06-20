const mongoose = require("mongoose");
const config = require("config");
const dbgr = require("debug")("development : mongoose");


mongoose.connect(`${config.get("MONGODB_URI")}/scatch`)
.then(function(){
    dbgr("connected");
})

.catch(function(err){
    dbgr(err);
});

module.exports = mongoose.connection;

// const mongoose = require("mongoose");
// const dotenv = require("dotenv");
// dotenv.config();

// mongoose.connect(process.env.MONGODB_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

// const db = mongoose.connection;
// db.on("error", console.error.bind(console, "MongoDB connection error:"));
// db.once("open", () => console.log("✅ Connected to MongoDB Atlas"));

// module.exports = mongoose.connection;
