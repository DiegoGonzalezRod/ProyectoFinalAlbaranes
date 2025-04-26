const { default: mongoose } = require('mongoose');
const moongoose = require('mongoose');

const dbConnect = () => {
    const db_uri = process.env.DB_URI;
    mongoose.set('strictQuery', false);
    mongoose.connect(db_uri);
}

mongoose.connection.on('connected', () => console.log('Conectado a la BD'))

mongoose.connection.on('error', (err) => console.log(err.message))

module.exports = dbConnect;