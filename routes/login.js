const express = require("express");
const ActiveDirectory = require("activedirectory");
const config = require("../config");

const router = express.Router();

router.get("/", (req, res) => {
    res.render("login");
});
router.post("/", (req, res) => {
    const c = {
        url: config.auth.ldapUrl,
        baseDN: config.auth.baseDN,
        username: `CORP\\${req.body.username}`,
        password: req.body.password
    };
    console.debug(`Trying to connect to ldap with: ${JSON.stringify(c)}`);
    const ad = new ActiveDirectory(c);
    ad.authenticate(c.username, c.password, (err, auth) => {
        if (err) {
            const error = `ERROR: ${JSON.stringify(err)}`;
            console.error(error);
            req.flash("error", "Wrong username or password");
            return res.redirect("/login");
        }
        if (!auth) {
            const error = "Wrong username or password";
            req.flash("error", error);
            return res.redirect("/login");
        }
        console.debug("Authenticated. Searching for user...");
        return ad.findUser(req.body.username, (err2, user) => {
            if (err2) {
                const error = `ERROR: ${JSON.stringify(err2)}`;
                console.error(error);
                req.flash(
                    "error",
                    `Could not find ${req.body.username} in LDAP directory`
                );
                return res.redirect("/login");
            }
            console.debug("Found. Logging in...");
            return req.logIn(user, err3 => {
                if (err3) {
                    const error = `ERROR: ${JSON.stringify(err3)}`;
                    console.error(error);
                    req.flash("error", "Failed to login");
                    return res.redirect("/login");
                }
                return res.redirect("/");
            });
        });
    });
});

module.exports = router;
