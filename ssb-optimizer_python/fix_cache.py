#!/usr/bin/env python3
"""
Script để fix file optimized_routes_cache.json:
1. Sửa routeID của tất cả bus stops trong mỗi route thành routeID của route đó
2. Đổi route keys từ "0"-"49" thành "1"-"50"
"""

import json

# Đọc file cache hiện tại
with open("optimized_routes_cache.json", "r") as f:
    old_cache = json.load(f)

print(f"->_<- Đọc được {len(old_cache)} routes từ cache")
print(f"   Route keys hiện tại: {list(old_cache.keys())[:5]}...")

# Tạo cache mới
new_cache = {}

for old_route_id_str, stops in old_cache.items():
    # Convert "0"-"49" thành 1-50
    old_route_id = int(old_route_id_str)
    new_route_id = old_route_id + 1
    
    print(f"\n!!! Route {old_route_id} -> Route {new_route_id}")
    print(f"   Số bus stops: {len(stops)}")
    
    # Sửa routeID cho tất cả bus stops trong route này
    fixed_stops = []
    for stop in stops:
        old_stop_route_id = stop.get("routeID", "?")
        stop["routeID"] = new_route_id  # Sửa routeID
        fixed_stops.append(stop)
        
        if old_stop_route_id != new_route_id:
            print(f"   - Stop {stop['busStopID']}: routeID {old_stop_route_id} -> {new_route_id}")
    
    # Lưu vào cache mới với key là new_route_id
    new_cache[str(new_route_id)] = fixed_stops

print(f"\n->_<- Đã fix xong {len(new_cache)} routes")
print(f"   Route keys mới: {list(new_cache.keys())[:5]}...")

# Lưu vào file mới
with open("optimized_routes_cache_fixed.json", "w") as f:
    json.dump(new_cache, f, indent=2)

print(f"\n->_<- Đã lưu kết quả vào optimized_routes_cache_fixed.json")

# Backup file cũ
import shutil
shutil.copy("optimized_routes_cache.json", "optimized_routes_cache_backup.json")
print(f"->_<- Đã backup file cũ vào optimized_routes_cache_backup.json")

# Ghi đè file cache gốc
with open("optimized_routes_cache.json", "w") as f:
    json.dump(new_cache, f, indent=2)

print(f"->_<- Đã ghi đè file optimized_routes_cache.json với kết quả mới")

# Kiểm tra 1 route mẫu
sample_route_id = "1"
if sample_route_id in new_cache:
    print(f"\n--> Kiểm tra Route {sample_route_id}:")
    stops = new_cache[sample_route_id]
    print(f"   - Số stops: {len(stops)}")
    print(f"   - RouteIDs: {set([s['routeID'] for s in stops])}")
    print(f"   - Sequences: {[s['sequence'] for s in stops]}")
    print(f"   - Sample stop: {stops[0]}")
