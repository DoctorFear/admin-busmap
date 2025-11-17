# testing python service
from flask import Flask, request, jsonify
from cluster import cluster_busStop
from tsp import solve_tsp_for_clusters
import traceback

PYTHON_SERVICE_PORT = 5111
# const center = { lat: 10.759983082120561, lng: 106.68225725256899 }; // Center: SGU
SGU_LAT = 10.759983082120561
SGU_LNG = 106.68225725256899


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

        # 2. Clustering: run model to clustering ~500 location to ~10 cluster (K-means)
        clustering_result = cluster_busStop(data)
        print(f"\n\n->_<- Clustering result:\n\n", clustering_result["clusters"])


        # ----------------------------------------------------
        sgu_location = {"lat": SGU_LAT, "lng": SGU_LNG}
        clusters = clustering_result["clusters"]
        # Optimize
        optimized_routes = solve_tsp_for_clusters(clusters=clusters, sgu_location=sgu_location)
        # ----------------------------------------------------

        print(f"\n\n->_<- Route result after optimized:\n\n", optimized_routes)
        
        # 3. Return JSON data to NodeJS with status code 200 (OK)
        return jsonify({
            "success": True,
            "optimizedRoutes": optimized_routes
        }), 200
        
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