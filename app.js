const bodyParser = require("body-parser");
const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const session = require("express-session");
const passport = require("passport");
const compression = require("compression");
const flash = require("flash");
const mongoose = require("mongoose");
const config = require("./config");
const loginRouter = require("./routes/login");
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const groupsRouter = require("./routes/groups");
const shiftsRouter = require("./routes/Shifts");
const schedulesRouter = require("./routes/Schedules");

const app = express();

app.use(logger("dev"));
app.use(compression());
app.use(session({ secret: "cats" }));
app.use(bodyParser.json({ limit: "20mb" }));
app.use(bodyParser.urlencoded({ limit: "20mb", extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(passport.initialize());
app.use(passport.session());
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");
app.use(flash());

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

app.use("/login", loginRouter);
app.use("/api", indexRouter);
app.use("/api/users", usersRouter);
app.use("/api/groups", groupsRouter);
app.use("/api/shifts", shiftsRouter);
app.use("/api/schedules", schedulesRouter);
const auth = (req, res, next) => {
    if (!req.isAuthenticated() && req.url !== "/login") {
        console.info("Got unauthenticated call. Redirecting to /login");
        return res.redirect("/login");
    }
    return next();
};
app.use(auth, express.static(path.join(__dirname, "client/build")));
app.get("*", (req, res) => {
    res.sendFile(path.join(`${__dirname}/client/build/index.html`));
});
// catch 404 and forward to error handler
app.use((req, res, next) => {
    next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error");
});
mongoose.connect(
    config.mongoURL,
    (err, conn) => {
        if (err) throw err;
    }
);

module.exports = app;
