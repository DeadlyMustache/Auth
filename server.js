const express = require('express');
const mongoose = require('mongoose');
const config = require('./config');
const controller = require('./controller');

const app = express();
app.use(express.json())

mongoose.connect(config.mongoURI).then(()=>{
    console.log("MongoDB connected.");
}).catch(error => console.log(error));


app.post('/gettoken', controller.gettoken);

app.post('/refreshtoken', controller.refreshtoken);

app.listen(4000);