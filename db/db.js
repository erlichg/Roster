const mongoose = require("mongoose");
const Groups = require("./Groups");
const Users = require("./Users");
const Shifts = require("./Shifts");
const Schedules = require("./Schedules");
const Events = require("./Events");
const Roles = require("./Roles");
const Constraints = require("./Constraints");
const Messages = require("./Messages");

const tables = {
    Users,
    Groups,
    Shifts,
    Schedules,
    Events,
    Roles,
    Constraints,
    Messages
};

/**
 * Find objects in collection by query. Resolves to list of objects
 * @param {string} collection - The collection
 * @param {any} query - The query object
 * @param {string[]} populate - Optional List of fields to populate
 */
const find = (collection, query, populate = []) =>
    new Promise((resolve, reject) => {
        let q = tables[collection].find(query);
        populate.forEach(p => {
            q = q.populate(p);
        });
        q.exec((err, objs) => {
            if (err) {
                console.error(err);
                reject(err);
            }
            resolve(objs);
        });
    });

/**
 * Find a single object by id. Resolves to a single object
 * @param {string} collection - The collection
 * @param {string} id - The id of the object
 * @param {string[]} populate - Optional list of fields to populate
 */
const findById = (collection, id, populate = []) =>
    new Promise((resolve, reject) => {
        find(
            collection,
            {
                _id: typeof id === "string" ? mongoose.Types.ObjectId(id) : id
            },
            populate
        )
            .then(objs => resolve(objs[0]))
            .catch(err => {
                console.error(err);
                reject(err);
            });
    });

/**
 * Updates a single object by id. Resolves to the object after update
 * @param {string} collection - The collection
 * @param {string} id - The id of the object
 * @param {any} update - The update object
 * @param {string[]} populate - Optional list of fields to populate
 */
const updateById = (collection, id, update, populate) =>
    new Promise((resolve, reject) => {
        tables[collection].findByIdAndUpdate(
            typeof id === "string" ? mongoose.Types.ObjectId(id) : id,
            update,
            err => {
                if (err) {
                    console.error(err);
                    reject(err);
                }
                findById(collection, id, populate)
                    .then(obj => resolve(obj))
                    .catch(errr => reject(errr));
            }
        );
    });

/**
 * Removes a single object by id. Resolves to the id
 * @param {string} collection - The collection
 * @param {string} id - The id of the object
 */
const removeById = (collection, id, populate) =>
    new Promise((resolve, reject) => {
        findById(collection, id, populate)
            .then(obj => {
                tables[collection].deleteOne(
                    {
                        _id:
                            typeof id === "string"
                                ? mongoose.Types.ObjectId(id)
                                : id
                    },
                    err => {
                        if (err) {
                            console.error(err);
                            reject(err);
                        }
                        resolve(obj);
                    }
                );
            })
            .catch(errr => reject(errr));
    });

/**
 * Add new object to DB
 * @param {string} collection - The collection
 * @param {any} data - The object to add
 */
const add = (collection, data, populate) =>
    new Promise((resolve, reject) => {
        if (data._id) {
            updateById(collection, data._id, data, populate);
        } else if (Array.isArray(data)) {
            tables[collection].insertMany(
                data.filter(o => !o._id),
                (err, docs) => {
                    if (err) {
                        console.error(err);
                        reject(err);
                    }
                    const ans = [];
                    docs.forEach(o => {
                        findById(collection, o._id, populate)
                            .then(obj => {
                                ans.push(obj);
                                if (ans.length === docs.length) {
                                    resolve(ans);
                                }
                            })
                            .catch(errr => reject(errr));
                    });
                }
            );
        } else {
            new tables[collection](data).save((err, o) => {
                if (err) {
                    console.error(err);
                    reject(err);
                }
                findById(collection, o._id, populate)
                    .then(obj => resolve(obj))
                    .catch(errr => reject(errr));
            });
        }
    });

module.exports = {
    tables,
    findById,
    find,
    updateById,
    removeById,
    add
};
