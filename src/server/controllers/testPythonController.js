import axios from "axios";
import { getBusStopAllLatLng } from "../models/pythonServiceModel.js";


export const sendListBusStopLatLngToPython = async(req, res) => {
    const PYTHON_SERVICE_PORT = 5111

    try {
        // 1. Lấy dữ liệu lat/lng từ database
        const listBusStopLatLng = await getBusStopAllLatLng();
        console.log("--> Bus stops lat/lng:", listBusStopLatLng.length);

        if (!listBusStopLatLng || listBusStopLatLng.length === 0) {
            return res.status(400).json({ 
                ok: false, 
                error: "Không có bus stops nào có tọa độ" 
            });
        }

        // 2. Gọi Python service, gửi dữ liệu lat/lng
        // Tăng timeout vì clustering có thể mất thời gian (30s cho 500 điểm)
        const response = await axios.post(
            `http://localhost:${PYTHON_SERVICE_PORT}/optimize`, 
            listBusStopLatLng, 
            {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 60000  // 60 seconds timeout - đủ cho thuật toán clustering
            }
        );
        
        // 3. Kiểm tra kết quả từ Python
        if (response.data && !response.data.success) {
            console.error("Python service trả về lỗi:", response.data.error);
            return res.status(500).json({ 
                ok: false, 
                error: response.data.error || "Python service failed",
                pythonResponse: response.data
            });
        }
        
        // 4. Trả về kết quả cho client
        console.log("--> Nhận được kết quả từ Python:", {
            total_clusters: response.data?.stats?.total_clusters,
            total_bus_stops: response.data?.stats?.total_bus_stops
        });
        
        res.json({
            ok: true, 
            pythonResponse: response.data
        });

    } catch(err) {
        console.error("!!! Error sending listBusStopLatLng to python:", err.message);
        
        // Chi tiết lỗi
        if (err.response) {
            console.error("python resp status:", err.response.status);
            console.error("python resp data:", err.response.data);
            return res.status(err.response.status || 500).json({ 
                ok: false,
                error: err.message,
                pythonError: err.response.data 
            });
        } else if (err.code === 'ECONNREFUSED') {
            return res.status(503).json({ 
                ok: false,
                error: "Không thể kết nối đến Python service. Hãy đảm bảo Python service đang chạy trên port " + PYTHON_SERVICE_PORT
            });
        } else if (err.code === 'ETIMEDOUT' || err.code === 'ECONNABORTED') {
            return res.status(504).json({ 
                ok: false,
                error: "Python service timeout. Clustering mất quá nhiều thời gian (>60s)"
            });
        }
        
        return res.status(500).json({ 
            ok: false,
            error: err.message 
        });
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