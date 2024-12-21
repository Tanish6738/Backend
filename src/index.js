import app from './App.js';
import connetdb from './db/index.js';
import dotenv from "dotenv"

dotenv.config({
    path : './env'
})

connetdb()
    .then(()=>{

        app.on('error', (error)=>{
            console.error('Error starting server:', error);
        })
        app.listen(process.env.PORT, ()=>{
            console.log(`Server listening on port ${process.env.PORT}`);
        })
    })
    .catch((error)=>{
        console.error('Error connecting to MongoDB (in db index.js file ):', error);
})






// (async ()=>{
//     try {
//         await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
//         console.log('Connected to MongoDB');
//     } catch (error) {
//         console.error('Error connecting to MongoDB:', error);
//     }
// })()