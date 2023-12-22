const net = require("net");

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
    socket.on("data", (data) => {
        let request_split = data.toString().split("\r\n");
        let request_path = request_split[0].split(" ")[1];
        let response_body = request_path.split("/")[1];
        if (request_path == "/"){
            socket.write('HTTP/1.1 200 OK\r\n\r\n')
        } else if (request_path.split("/")[0] == "echo"){
            socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${response_body.length}\r\n\r\n${response_body}`);
        }
        else{
            socket.write('HTTP/1.1 404 Not Found\r\n\r\n')
        }   
    })
    socket.on("close", () => {
        socket.end();
        server.close();
    });
});

server.listen(4221, "localhost");
