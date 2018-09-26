const _ = require("lodash");
/* eslint-disable */

Array.prototype.asyncForEach = async function(callback) {
    // this represents our array
    for (let index = 0; index < this.length; index++) {
        // We call the callback for each entry
        await callback(this[index], index, this);
    }
};

Array.prototype.hasDuplicates = function(iteratee = i => i) {
    return Object.values(_.countBy(this, iteratee)).filter(i=>i>1).length>0;
}

/* eslint-enable */
