
//--- CONSTANT ---\\
const PORT_SERVER = 5555

// --- import ---\\
const express = require('express');
const app = express();

// Static & middleware
// “Bất cứ khi nào có request đến /..., 
// hãy tìm xem trong thư mục ./navbar-app có file tương ứng không. 
// Nếu có → gửi file đó về trình duyệt.”
app.use(express.static('./navbar-app')); // serve toàn bộ thư mục

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/navbar-app/index.html');
}); 


app.listen(PORT_SERVER, () => {
    console.log('Server is listening on port', PORT_SERVER)
})





