const mongoose = require('mongoose');

// The URI user provided (with password)
const uri = "mongodb+srv://ppranavi0805_db_user:nabhzKBbgoN2W02Z@cluster0.je3rrfz.mongodb.net/";

console.log("Testing connection to:", uri.replace(/:([^:@]+)@/, ':****@')); // Hide password in logs

mongoose.connect(uri)
    .then(() => {
        console.log("✅ Connection SUCCESSFUL!");
        console.log("Connected to database:", mongoose.connection.name);
        process.exit(0);
    })
    .catch(err => {
        console.error("❌ Connection FAILED");
        console.error(err);
        process.exit(1);
    });
