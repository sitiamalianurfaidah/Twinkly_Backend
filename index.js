const express = require('express');
const cors = require('cors');  
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const upload = require('./src/utils/upload.middleware'); 

const corsOptions = {
    origin: 'http://localhost:5050',  
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],  
    optionsSuccessStatus: 200, 
};

app.use(cors(corsOptions));

app.use(express.json());

app.use('/store', require('./src/routes/store.route'));
app.use('/user', require('./src/routes/user.route'));
app.use('/item', require('./src/routes/item.route'));
app.use('/transaction', require('./src/routes/transaction.route'));
app.get('/', (req, res) => {
    res.json({ message: 'CORS berhasil dikonfigurasi!' });
});

app.use((req, res, next) => {
    console.log('CORS request:', req.method, req.url);
    next();
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});