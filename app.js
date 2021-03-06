require("./prototypes");
const bodyParser = require("body-parser");
const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const session = require("express-session");
const RedisStore = require("connect-redis")(session);
const redis = require("redis");
const passport = require("passport/lib");
const compression = require("compression");
const flash = require("flash");
const mongoose = require("mongoose");
const ical = require("ical-generator");
const moment = require("moment");
const config = require("./config");
const loginRouter = require("./routes/login");
const logoutRouter = require("./routes/logout");
const indexRouter = require("./routes");
const usersRouter = require("./routes/users");
const groupsRouter = require("./routes/groups");
const shiftsRouter = require("./routes/Shifts");
const schedulesRouter = require("./routes/Schedules");
const EventsRouter = require("./routes/Events");
const RolesRouter = require("./routes/roles");
const ConstraintsRouter = require("./routes/constraints");
const MessagesRouter = require("./routes/Messages");
const db = require("./db/db");

const client = redis.createClient();
const dev = process.env.NODE_ENV === "development";
const app = express();

app.use(logger("dev"));
app.use(compression());
// app.use(session({ secret: "cats", resave: false, saveUninitialized: false }));
app.use(
    session({
        store: new RedisStore({
            host: "localhost",
            port: 6379,
            client,
            ttl: 260
        }),
        secret: "keyboard cat",
        resave: false
    })
);
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
app.use("/logout", logoutRouter);
app.use("/loggeduser", (req, res) => {
    if (dev || req.isAuthenticated()) {
        const { user } = dev ? { user: { mail: "guy.erlich@dell.com" } } : req;
        db.find("Users", { email: user.mail.toLowerCase() }, [
            "groups",
            "role"
        ]).then(users => {
            if (users.length === 1) {
                res.json(users[0]);
            } else {
                res.status(500).end();
            }
        });
    } else {
        res.status(500).end();
    }
});
app.get("/ical", (req, res) => {
    db.find("Schedules", {}, ["shift", "user"]).then(schedules => {
        const merged = [];
        /* eslint-disable no-restricted-syntax */
        for (const s of schedules.sort(
            (a, b) => moment(a.date) - moment(b.date)
        )) {
            const date = s.date;
            const summary = `${s.user.name}: ${s.shift.name}`;
            const existing = merged.find(
                e => e.summary === summary && moment(e.end).isSame(moment(date))
            );
            if (existing) {
                existing.end = moment(date).add(1, "day");
            } else {
                merged.push({
                    start: date,
                    end: moment(date).add(1, "day"),
                    summary
                });
            }
        }
        /* eslint-enable */
        res.send(
            ical({
                domain: "emc.com",
                events: merged.map(s => ({
                    start: moment(s.start),
                    end: moment(s.end),
                    timestamp: moment(),
                    timezone: "Asia/Tel_Aviv",
                    allDay: true,
                    summary: s.summary
                }))
            })
                .ttl(60 * 60)
                .toString()
        );
    });
});
app.use("/api", indexRouter);
app.use("/api/users", usersRouter);
app.use("/api/groups", groupsRouter);
app.use("/api/shifts", shiftsRouter);
app.use("/api/schedules", schedulesRouter);
app.use("/api/events", EventsRouter);
app.use("/api/roles", RolesRouter);
app.use("/api/constraints", ConstraintsRouter);
app.use("/api/messages", MessagesRouter);
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
    res.render("error", {flash: [err]});
});
mongoose.connect(
    config.mongoURL,
    { useNewUrlParser: true },
    (err, conn) => {
        if (err) throw err;
    }
);

module.exports = app;
