import axios from "axios";
import { getBusStopAllLatLng } from "../models/pythonServiceModel.js";


export const sendListBusStopLatLngToPython = async(req, res) => {
    const PYTHON_SERVICE_PORT = 5111

    try {
        // 1. Lấy dữ liệu lat/lng từ database
        const listBusStopLatLng = await getBusStopAllLatLng();
        console.log("--> Bus stops lat/lng:", listBusStopLatLng.length);

        // 2. Gọi Python service, gửi dữ liệu lat/lng
        const response = await axios.post(`http://localhost:${PYTHON_SERVICE_PORT}/cluster`, listBusStopLatLng, {
            headers: {
                'Content-Type': 'application/json'
            }, timeout: 10000 // 10 seconds timeout
        });
        
        // 3. Trả về kết quả cho client
        res.json({ok: true, pythonResponse: response.data});

    } catch(err) {
        console.error("!!! Error sending listBusStopLatLng to python:", err.message);
        // Detail: err.response?.data, err.stack
        if (err.response) {
            console.error("python resp:", err.response.status, err.response.data);
        }
        return res.status(500).json({ error: err.message });
    }
    // TESTING
    // try {
    //     const response = await axios.get("http://localhost:5111/hello");
    //     // console.log("- NodeJS call Python service:",response.data)
    //     res.json(response.data);
    // } catch(err){
    //     console.log("!!! Call python service err:", err);
    //     res.status(500).json({error: err.message});
    // }



};