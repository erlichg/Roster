const db = "mydb";
const config = {
    db,
    mongoURL: process.env.MONGO_URL || `mongodb://localhost:27017/${db}`,
    // Authentication
    auth: {
        ldapUrl: "ldap://app.corp.emc.com:3268",
        baseDN: "dc=emc,dc=com"
    }
};

module.exports = config;
