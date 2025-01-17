const bcrypt = require('bcrypt');
const saltRounds = 11;

async function hashPassword(password) {
    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        console.log('Hashed password: ', hashedPassword);
        return hashedPassword;
    } catch (error) {
        console.error("Error hashing password: ", error);
        return null;
    }
}

hashPassword("12345");