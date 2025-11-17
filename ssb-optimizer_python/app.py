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

# Save optimized route for response quickly, cache it in memory
optimized_routes_cache = {}

def reIndexSequenceAfterOptimize(optimized_routes):
    """
    Re-index the sequence of bus stops after optimization.
    Input:
        optimized_routes: {
            "cluster_1": [ {lat, lng, sequence}, ... ],
            "cluster_2": [ {lat, lng, sequence}, ... ],
            ...
        }
    Output:
        optimized_routes with updated sequence starting from 1 
        (structure like the input but only sequence is reindexed for each cluster)
    """
    reindexed_routes = {}
    for cluster_id, stops in optimized_routes.items():
        reindexed_stops = []
        for index, stop in enumerate(stops):
            stop["sequence"] = index + 1
            reindexed_stops.append(stop)
        
        reindexed_routes[cluster_id] = reindexed_stops

    return reindexed_routes

@app.route("/optimize", methods=["POST"])
# ------------------OPTIMIZE ROUTE-------------------
def optimize(isReOptimize=False):
    """Optimize route endpoint
    Input: JSON data from NodeJS with list of bus stops
    Output: JSON data with optimized routes for each cluster (including re-index for sequence column)
    """

    # Nếu có cache và isReOptimize=False thì trả về cache
    # trong trường hợp load lại trang hay back lại trang từ browser, không cần tối ưu lại
    global optimized_routes_cache
    if not isReOptimize and optimized_routes_cache:
        print("--> Trả về kết quả đã cache")
        return jsonify({
            "success": True,
            "optimizedRoutes": optimized_routes_cache
        }), 200
    # Nếu không có cache hoặc isReOptimize=True thì chạy lại từ đầu
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

        # -------------------Optimize------------------
        sgu_location = {"lat": SGU_LAT, "lng": SGU_LNG}
        clusters = clustering_result["clusters"]
        # Optimize
        optimized_routes = solve_tsp_for_clusters(clusters=clusters, sgu_location=sgu_location)
        
        # ------------------Reindexed sequence---------
        optimized_routes_after_reindexed_sequence = reIndexSequenceAfterOptimize(optimized_routes)
        # ----------------------------------------------------

        # ------------------Update cache---------------
        optimized_routes_cache = optimized_routes_after_reindexed_sequence  # Update cache
        print("--> Đã cập nhật cache kết quả tối ưu.")
        # ----------------------------------------------------
        
        print(f"\n\n->_<- Route result after optimized:\n\n", optimized_routes)
        

        # // Lấy clusters dictionary từ Python service
        # // Format: { "0": [busStop1, busStop2, ...], "1": [...], ... }
        # const clusters = pythonResponse.clusters || {};
        # const stats = pythonResponse.stats || {};
        
        # console.log("[1] ->_<- Nhận được clusters từ Python:", {
        #   total_clusters: stats.total_clusters,
        #   total_bus_stops: stats.total_bus_stops,
        #   cluster_sizes: stats.cluster_sizes,
        #   cluster_keys: Object.keys(clusters)
        # });

        # Thêm phần stats cho response (json)
        stats = { 
            "total_clusters": clustering_result["stats"]["total_clusters"],
            "total_bus_stops": clustering_result["stats"]["total_bus_stops"],
            "cluster_sizes": clustering_result["stats"]["cluster_sizes"]
        }
        print(f"--> Thống kê kết quả tối ưu: {stats}")

        # 3. Return JSON data to NodeJS with status code 200 (OK)
        return jsonify({
            "success": True,
            "optimizedRoutes": optimized_routes_after_reindexed_sequence,
            "stats": stats
        }), 200
        
    except Exception as e:
        print(f"!!! Lỗi trong optimize endpoint: {str(e)}")
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": f"Lỗi server: {str(e)}"
        }), 500
# -----------------------=|=--------------------------

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



