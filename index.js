const express = require('express');
const cors = require('cors');  
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const upload = require('./src/utils/upload.middleware'); 

const corsOptions = {
    origin: [
        'http://localhost:5050', 
        'https://twinklyfrontend-production.up.railway.app' 
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

app.use(express.json());


app.use((req, res, next) => {
    console.log('CORS request:', req.method, req.url);
    next();
});

app.use('/user', require('./src/routes/user.route'));
app.use('/affirmations', require('./src/routes/affirmations.route'));

app.get('/', (req, res) => {
    res.json({ message: 'CORS berhasil dikonfigurasi!' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});