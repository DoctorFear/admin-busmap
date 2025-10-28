//----------- 0. Basic -----------
/*
    - File: async
*/


/*  JAVASCRIPT
--- JavaScript là “single-threaded”:
    - JavaScript chỉ có một luồng thực thi chính (main thread).
    - Mọi lệnh đều chạy từng dòng một, theo thứ tự — không có hai lệnh chạy song song.
    => synchronous (đồng bộ) & single-threaded (một luồng).

--- Event Loop là cơ chế giúp JavaScript xử lý bất đồng bộ (asynchronous) mà không cần nhiều luồng.
Trong đó: 
    - Call Stack: nơi lưu các hàm đang được thực thi.
    - Web APIs: nơi trình duyệt thực hiện các tác vụ bất đồng bộ (setTimeout, fetch, DOM events, v.v).
    - Callback Queue (Task Queue): nơi lưu các callback (hàm sẽ chạy sau).
    - Event Loop: liên tục quan sát Call Stack; nếu stack trống → nó lấy một hàm trong Queue đẩy vào Stack để thực thi.
        + Khi stack bận → callback phải chờ.
        + Khi stack rảnh → event loop “đưa” callback vào để chạy.
*/

/*
--- Từng bước:
1. console.log('first task') → in ra ngay.
2. setTimeout(...) được gửi sang Web API của trình duyệt (timer).
    - Trình duyệt đếm thời gian (ở đây là 0ms).
    - Khi hết thời gian, callback (()=> console.log('second task')) được đưa vào Callback Queue.
3. JavaScript tiếp tục chạy dòng kế: console.log('next task').
4. Sau khi Stack rỗng, Event Loop thấy có callback trong Queue → đưa nó vào Stack để chạy → in ra 'second task'.
*/
console.log('first task')

setTimeout(() => {
    console.log('Event Loop send this cmd to Callback Queue')
}, 0);

console.log('the second task')

