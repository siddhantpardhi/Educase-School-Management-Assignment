import { connectDB } from "./database/database.js"
import express from "express"
import cors from "cors"

const app = express()

app.use(express.json())
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}))

import cityRoutes from "./route.js"
app.use("/api/v1", cityRoutes)

connectDB()
.then(() => {
    app.on("error", (error) => {
        console.error("Error: ", error)
        throw error
    })

    app.listen(process.env.PORT || 8000, () => {
        console.log("Server is running on port: ", process.env.PORT)

    })
})
.catch((err) => {
    console.error("MYSQL Connection Failed: ", err)
})

app.use((err, _ , res ,next) => {
    console.error(err.stack);
    res.status(500).send("Something Broke")
    
})