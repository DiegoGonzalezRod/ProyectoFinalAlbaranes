const express = require('express');
const cors = require('cors');
require('dotenv').config();

const routers = require('./routes/index');

const dbConnect = require('./config/mongo');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', routers);

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Escuchando en el puerto ${port}`)
})

dbConnect();