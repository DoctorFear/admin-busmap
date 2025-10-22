import express from "express";

const app = express();
const PORT = 8888;

// middleware read JSON body
app.use(express.json())

// endpoint
app.get("/", (req, res) => {
    res.send("Express server run successfully!")
});

// run server:
app.listen(PORT, () =>{
    console.log(`Server running at http://localhost:${PORT}`)
});