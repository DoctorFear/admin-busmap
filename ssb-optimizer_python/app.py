# testing python service
from flask import Flask, request, jsonify

PYTHON_SERVICE_PORT = 5111

app = Flask(__name__)

# allow POST method
@app.route("/cluster", methods=["POST"])
def cluster_testing_ok():
    data = request.get_json() # get JSON from NodeJS
    print("--> Python get:", len(data), "items")

    # return JSON data:
    return jsonify({
        "message": "Python received data successfully",
        "total_items": len(data),
        "data_sample": data[0:10]
    })

if __name__ == "__main__":
    app.run(port=PYTHON_SERVICE_PORT)