const express = require("express");
const db = require("../db/db");

const router = express.Router();

router.get("/", (req, res, next) => {
    db.find("Groups")
        .then(groups => res.json(groups))
        .catch(err => {
            console.error(err);
            return res.json([]);
        });
});
router.post("/", (req, res, next) => {
    db.add("Groups", req.body)
        .then(u => res.json(u))
        .catch(err => {
            console.error(err);
            return res.status(505).send(`Failed to insert object: ${err}`);
        });
});
router.put("/:id", (req, res, next) => {
    const { id } = req.params;
    db.updateById("Groups", id, { $set: req.body })
        .then(u => res.json(u))
        .catch(err => {
            console.error(err);
            return res.status(505).send(`Failed to update object: ${err}`);
        });
});
router.delete("/:id", (req, res, next) => {
    const { id } = req.params;
    db.removeById("Groups", id)
        .then(u => res.json(u))
        .catch(err => {
            console.error(err);
            return res.status(505).send(`Failed to delete object: ${err}`);
        });
});

module.exports = router;
