import db from "../db.js"

// Get all bus stop latitudes and longitudes
export const getBusStopAllLatLng = () => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT busStopID, parentID, lat, lng 
            FROM BusStop
            WHERE lat IS NOT NULL AND lng IS NOT NULL
        `;
        db.query(sql, (err, results) => {
            if (err) {
                return reject(err);
            }
            const res = results.map(row => ({
                busStopID: row.busStopID,
                parentID: row.parentID,
                lat: parseFloat(row.lat),
                lng: parseFloat(row.lng)
            }));
            resolve(res);   
        });
    });
};