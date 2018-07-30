const express = require("express");
const db = require("../db/db");

const router = express.Router();

router.get("/", (req, res, next) => {
    db.find("Shifts")
        .then(users => res.json(users))
        .catch(err => {
            console.error(err);
            return res.json([]);
        });
});
router.post("/", (req, res, next) => {
    db.add("Shifts", req.body)
        .then(u => res.json(u))
        .catch(err => {
            console.error(err);
            return res.status(505).send(`Failed to insert object: ${err}`);
        });
});
router.put("/:id", (req, res, next) => {
    const { id } = req.params;
    db.updateById("Shifts", id, { $set: req.body }, ["groups"])
        .then(u => res.json(u))
        .catch(err => {
            console.error(err);
            return res.status(505).send(`Failed to update object: ${err}`);
        });
});
router.delete("/:Shifts", (req, res, next) => {
    const { id } = req.params;
    db.removeById("Users", id)
        .then(u => res.json(u))
        .catch(err => {
            console.error(err);
            return res.status(505).send(`Failed to delete object: ${err}`);
        });
});

module.exports = router;
