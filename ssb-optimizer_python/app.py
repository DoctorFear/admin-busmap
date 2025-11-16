# testing python service
from flask import Flask

PYTHON_SERVICE_PORT = 5111

app = Flask(__name__)

@app.route("/hello")
def hello():
    return {"message": "Python optimizer server is running oke"}

if __name__ == "__main__":
    app.run(port=PYTHON_SERVICE_PORT)