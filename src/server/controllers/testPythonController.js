import axios from "axios";

export const getTestPython = async(req, res) => {
    try {
        const response = await axios.get("http://localhost:5111/hello");
        console.log("- NodeJS call Python service:",response.data)
        res.json(response.data);
    } catch(err){
        console.log("!!! Call python service err:", err);
        res.status(500).json({error: err.message});
    }
};