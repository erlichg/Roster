const db = "mydb";
const config = {
    db,
    mongoURL: process.env.MONGO_URL || `mongodb://localhost:27017/${db}`,
    // Authentication
    auth: {
        ldapUrl: "ldap://10.146.130.182",
        baseDN: "dc=corp,dc=emc,dc=com"
    }
};

module.exports = config;
