const bcrypt = require('bcrypt')
const { isEmail } = require('validator');
const pool = require('../config/dbConfig')

// Define the user schema
const userSchema = 
    `CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL
    )`;

// Create the users table
pool.query(userSchema, (error, results, fields) => {
    if (error) {
        console.error('Error creating user table:', error);
        return;
    }
    console.log('User table created successfully');
});

const User = {
    create: async (email, password) => {
        let ErrorValidator = []
        // valid email ?
        if (!isEmail(email)) {
            ErrorValidator.push({
                code: 'user validator failed',
                message: 'Please enter a valid email',
                path: 'email'
            })
        }
        // valid password ?
        const passwordRegex = /^[a-zA-Z0-9-/'\\*@\&]{8,}$/;
        if (!password.match(passwordRegex)) {
            ErrorValidator.push({
                code: 'user validator failed',
                message: 'Minimum length on password is 8 caracters',
                path: 'password'
            })
        }
        if(ErrorValidator.length === 0) {
            return new Promise(async (resolve, reject) => {
                let infos = { id: '', email: '' }
                const salt = await bcrypt.genSalt()
                const hashPassword = await bcrypt.hash(password, salt)
                pool.query(
                    'INSERT INTO users (email, password) VALUES (?, ?)',
                    [email, hashPassword],
                    (error, results, fields) => {
                        if (error) return reject(error)
                        infos.id = results.insertId
                        infos.email = email
                        resolve(infos);
                    }
                );
            });
        } else {
            return Promise.reject(ErrorValidator);
        }
    },
    findBy: (column, value) => {
        return new Promise((resolve, reject) => {
            let query = '';
            switch(column) {
                case 'email':
                    query = "SELECT * FROM users WHERE email = ?";
                    break;
                case 'id':
                    query = "SELECT * FROM users WHERE id = ?";
                    break;
                default:
                    reject(new Error('Champ non pris en charge'));
                    return;
            }
            pool.query(query, [value], (error, results, fields) => {
                if (error) return reject(error); 
                resolve(results[0]);
            });
        });
    },
    login: function(email, password) {
        return new Promise(async (resolve, reject) => {
            const user = await this.findBy("email", email);
            if (user) {
                const auth = await bcrypt.compare(password, user.password);
                if (auth) {
                    resolve(user.id);
                } else {
                    reject('ErrorCode10002');
                }
            } else {
                reject('ErrorCode10001');
            }
        });
    }
};

module.exports = User;