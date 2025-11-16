import math
from ortools.constraint_solver import pywrapcp, routing_enums_pb2



# --------------HAVERSINE DISTANCE FORMULA------------
"""      

-> công thức giữa 2 điểm trên bề mặt hình cầu (Trái Đất)
-> không giống như khoảng cách Euclidean: đường thẳng

#--- Source: https://scikit-learn.org/stable/modules/generated/sklearn.metrics.pairwise.haversine_distances.html
# lat: latitude in radians
# lon: longitude in radians
D(x, y) = 2\arcsin[\sqrt{\sin^2((x_{lat} - y_{lat}) / 2)
                         + \cos(x_{lat})\cos(y_{lat})\
                         sin^2((x_{lon} - y_{lon}) / 2)}]
"""
def haversine_distance(a, b):
    # Radius of our Earth (km)
    R = 6371 
    # Convert latitude and longitude from degrees to radians
    dLat = math.radians(b["lat"] - a["lat"])
    dLng = math.radians(b["lng"] - a["lat"])
    lat1 = math.radians(a["lat"])
    lat2 = math.radians(b["lat"])
    # Calculate using Haversine formula
    h = math.sin(dLat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dLng/2)**2
    return 2 * R * math.asin(math.sqrt(h))
# ----------------------------------------------------

# ------------------DISTANCE MATRIX-------------------
def build_distance_matrix(stops_with_sgu): # đã thêm SGU vào đầu và cuối (bắt đầu và két thúc một route)
    size = len(stops_with_sgu)
    matrix = [[0]*size for _ in range(size)] # 2D với full 0
    for i in range(size):
        for j in range(size):
            if i == j:
                matrix[i][j] = 0
            else:
                matrix[i][j] = haversine_distance(a=stops_with_sgu[i], b=stops_with_sgu[j])
    return matrix
# ----------------------------------------------------


def solve_tsp(distance_matrix):
    size = len(distance_matrix)

    manager = pywrapcp.RoutingIndexManager(size, 1, 0)  # depot = node 0 (sgu)
    routing = pywrapcp.RoutingModel(manager)

    # Distance callback
    def distance_callback(i, j):
        node_i = manager.IndexToNode(i)
        node_j = manager.IndexToNode(j)
        return int(distance_matrix[node_i][node_j] * 1000)  # convert km to m

    transit_callback_idx = routing.RegisterTransitCallback(distance_callback)
    routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_idx)

    # First solution strategy
    search_params = pywrapcp.DefaultRoutingSearchParameters()
    search_params.first_solution_strategy = (
        routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
    )
    search_params.local_search_metaheuristic = (
        routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
    )
    search_params.time_limit.seconds = 1

    # Solve
    solution = routing.SolveWithParameters(search_params)
    if not solution:
        return None

    # Extract route
    index = routing.Start(0)
    order = []

    while not routing.IsEnd(index):
        node = manager.IndexToNode(index)
        order.append(node)
        index = solution.Value(routing.NextVar(index))

    return order  # ví dụ [0, 2, 5, 1, 4, 3, 0]


def solve_tsp_for_clusters(clusters, sgu_location):
    optimized = {}
    
    for cluster_id, stops in clusters.items():
        # 1. Thêm sgu_location vào đầu danh sách
        stops_with_sgu = [sgu_location] + stops

        # 2. Create distance matrix
        dist_matrix = build_distance_matrix(stops_with_sgu)
        
        # 3. Optimize <-- OR-Tools 
        route_order = solve_tsp(dist_matrix) # [0, 2, 5, 1, 4, 3, 0]

        # 4. Convert route index -> busStops
        ordered_stops = []
        for node_index in route_order:
            # Bỏ qua SờGu
            if node_index == 0: continue
            # Append vào theo thứ tự tối ưu
            ordered_stops.append(stops_with_sgu[node_index])

        # Save the ré and return 
        # mỗi cụm, các location được ordered vị trí lại
        optimized[cluster_id] = ordered_stops

    return optimized
