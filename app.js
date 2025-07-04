const express = require("express");
const dotenv = require ('dotenv');
const cookieparser = require("cookie-parser");
const path = require("path");
const db = require("./config/mongoose-connection");
const ownersRouter = require("./routes/ownersRouter");
const usersRouter = require("./routes/usersRouter");
const productsRouter = require("./routes/productsRouter");
const index = require("./routes/index");
const expressSession = require("express-session");
const flash = require("connect-flash");
const orderRouter = require("./routes/orderRouter");




dotenv.config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieparser());
app.use(
    expressSession({
        resave:false,
        saveUninitialized:false,
        secret:process.env.EXPRESS_SESSION_SECRET,
    })
);
app.use(flash());
app.use(express.static(path.join(__dirname,"public")));
app.set("views", path.join(__dirname, "views"));
app.set("view engine","ejs");







//use of routes


    app.use("/",index);
    app.use('/owner', ownersRouter);
    app.use("/users",usersRouter);
    app.use("/products",productsRouter);
    app.use("/orders", orderRouter);
    app.use("/order", orderRouter);


const session = require("express-session");
const MongoStore = require("connect-mongo");

app.use(session({
  secret: process.env.EXPRESS_SESSION_SECRET || "hahahahah",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: "sessions",
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  }
}));




//server connection
const PORT = process.env.PORT || 8080;

app.listen(PORT ,() =>{
    console.log(`server is live on ${PORT}`);
});