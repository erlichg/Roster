const express = require("express");
const db = require("../db/db");

const table = "Shifts";
const router = express.Router();

router.get("/", (req, res, next) => {
    db.find(table, {}, ["group"])
        .then(shifts => res.json(shifts))
        .catch(err => {
            console.error(err);
            return res.json([]);
        });
});
router.post("/", (req, res, next) => {
    db.add(table, req.body, ["group"])
        .then(u => res.json(u))
        .catch(err => {
            console.error(err);
            return res.status(505).send(`Failed to insert object: ${err}`);
        });
});
router.put("/:id", (req, res, next) => {
    const { id } = req.params;
    db.updateById(table, id, { $set: req.body }, ["group"])
        .then(u => res.json(u))
        .catch(err => {
            console.error(err);
            return res.status(505).send(`Failed to update object: ${err}`);
        });
});
router.delete("/:id", (req, res, next) => {
    const { id } = req.params;
    db.removeById(table, id)
        .then(u => res.json(u))
        .catch(err => {
            console.error(err);
            return res.status(505).send(`Failed to delete object: ${err}`);
        });
});

module.exports = router;
