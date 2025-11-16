# testing python service
from flask import Flask, request, jsonify
from cluster import cluster_busStop
import traceback
PYTHON_SERVICE_PORT = 5111

app = Flask(__name__)

# allow POST method
@app.route("/optimize", methods=["POST"])
def optimize():
    try:
        # 1. Get data(list lat/lng) from NodeJS
        data = request.get_json()   # get JSON from NodeJS
        
        if not data:
            return jsonify({
                "success": False,
                "error": "Không nhận được dữ liệu"
            }), 400
        
        print(f"--> Python nhận được {len(data)} bus stops")

        # Clustering: run model to clustering ~500 location to ~10 cluster (K-means)
        result = cluster_busStop(data)
        
        if not result.get("success", False):
            return jsonify(result), 500

        return jsonify(result)
        
    except Exception as e:
        print(f"!!! Lỗi trong optimize endpoint: {str(e)}")
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": f"Lỗi server: {str(e)}"
        }), 500

# Health check endpoint: kiểm tra xem api có hoạt động oke ko, trước khi run phần chính
@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "ssb-optimizer-cluster-route"})

# def cluster_testing_ok():
#     data = request.get_json() # get JSON from NodeJS
#     print("--> Python get:", len(data), "items")

#     # return JSON data:
#     return jsonify({
#         "message": "Python received data successfully",
#         "total_items": len(data),
#         "data_sample": data[0:10]
#     })

if __name__ == "__main__":
    app.run(port=PYTHON_SERVICE_PORT)