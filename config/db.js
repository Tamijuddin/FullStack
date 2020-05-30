const mongoose = require('mongoose')
const config = require('config')
const db = config.get('mongoUri')

const connectDB = async () => {
    try{
        await mongoose.connect(db, { useUnifiedTopology: true , useNewUrlParser: true , useFindAndModify: false} )
        console.log('connected to db')
    }
    catch (err){
        console.error(err.message)
        process.exit(1)
    }
}


module.exports = connectDB;