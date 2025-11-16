import numpy as np
from k_means_constrained import KMeansConstrained

def cluster_busStop(busStops):
    try:
        #---1. Create data (numpy array for model)
        if not busStops or len(busStops) == 0:
            raise ValueError("Danh sách bus stops rỗng")
        
        print(f"- Bắt đầu phân cụm {len(busStops)} bus stops...")
        
        # Create coords array for model
        coords = np.array([[busStop["lat"], busStop["lng"]] for busStop in busStops])
        print(f"- Đã tạo ma trận tọa độ: {coords.shape}")

        # Tính toán n_clusters và constraints dựa trên số lượng bus stops
        n_bus_stops = len(busStops)
        n_buses = 50
        max_students_per_bus = 10  # Mỗi xe tối đa 10 học sinh
        
        # Tính size_min và size_max hợp lý
        # size_min: tối thiểu số bus stops mỗi cluster
        # size_max: tối đa số bus stops mỗi cluster (10 học sinh)
        size_max = max_students_per_bus
        # Tính size_min: đảm bảo có đủ chỗ cho tất cả bus stops
        min_total_capacity = n_buses * size_max
        if n_bus_stops > min_total_capacity:
            raise ValueError(f"Không thể phân cụm: {n_bus_stops} bus stops > {min_total_capacity} (50 xe × {size_max} học sinh/xe)")
        
        # size_min: (vì mình set tất cả xe đều được sử dụng)
        size_min = max(1, n_bus_stops // n_buses - 2)  # Cho phép linh hoạt một chút
        
        print(f"- Cấu hình: {n_buses} clusters, size_min={size_min}, size_max={size_max}")

        #--- 2. Configure model and train
        model = KMeansConstrained(
            n_clusters=n_buses,
            size_min=size_min,
            size_max=size_max,
            random_state=42,
            n_init=10  # Số lần chạy với random seeds khác nhau
        )
        
        print("- Đang training model...")
        # Train model
        labels = model.fit_predict(coords)  # label: cluster
        print("--> Training thành công!")

        #--- 3. Return the result
        print("- Đang nhóm kết quả...")
        # Combine group(cluster) with route
        # Convert keys to string để JSON serialize được
        clusters = {}
        for i, label in enumerate(labels):
            cluster_key = str(int(label))  # Convert int label to string
            if cluster_key not in clusters:
                clusters[cluster_key] = []
            clusters[cluster_key].append(busStops[i])

        # Thống kê: cái nhìn tổng quan về các cụm đã được model phân cụm
        cluster_stats = {
            str(key): len(value) for key, value in clusters.items()
        }
        print(f"--> Done! Đã tạo {len(clusters)} clusters")
        print(f"- Thống kê số bus stops mỗi cluster: {cluster_stats}")

        return {
            "success": True,
            "clusters": clusters,
            "stats": {
                "total_bus_stops": n_bus_stops,
                "total_clusters": len(clusters),
                "cluster_sizes": cluster_stats
            }
        }
        
    except Exception as e:
        print(f"!!! Lỗi trong cluster_busStop: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            "success": False,
            "error": str(e),
            "clusters": {}
        }

