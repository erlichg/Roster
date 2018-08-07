const moment = require("moment");

module.exports = {
    noSpecificDays: {
        label: "No Specific Days",
        isValidOn: m => this.value.indexOf(m.day()) === -1
    },
    vacation: {
        label: "Vacation",
        isValidOn: m => this.value.map(d => moment(d)).indexOf(m) === -1
    }
};
