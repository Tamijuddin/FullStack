const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const connectDB =  require('./config/db')

const app = express()

connectDB();

PORT = process.env.port || 5000

app.use(express.json({ extended: false }));

app.use('/user',require('./route/user'));
app.use('/posts',require('./route/posts'));
app.use('/profile',require('./route/profile'));
app.use('/auth',require('./route/auth'));
app.use('/about',require('./route/about'));

app.listen(PORT)
