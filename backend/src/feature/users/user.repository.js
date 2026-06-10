import User from './user.model.js';

export const findUserByEmail = (email, includePassword = false) => { //yha hum email se user ko dhund rahe hai, aur agar includePassword false hai to password ko select nahi karenge
    const query = User.findOne({ email });

    if (includePassword) {
        query.select('+password'); //agar includePassword true hai to password ko select karenge
    }

    return query;

};


// createUser Register ke time new user banane ke liye.
export const createUser = (userData) => {
    return User.create(userData);
};

// findUserById - JWT token verify ke baad current user fetch karne ke liye.
export const findUserById = (userId) => {
    return User.findById(userId);
}

// findUserByEmail
// Register me duplicate email check ke liye. Login me user find karne ke liye.

// includePassword = false
// By default password hidden rahega because model me select: false hai. Login ke time password compare karna hota hai, tab:

// findUserByEmail(email, true)