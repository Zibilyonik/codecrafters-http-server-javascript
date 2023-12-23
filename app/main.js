const net = require("net");

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
    socket.on("data", (data) => {
        let request_split = data.toString().split("\r\n");
        if (!request_split[0].startsWith("GET")){
            request_split = data.toString().split(",");
        }
        let request_path = request_split[0].split(" ")[1];
        if (request_path == "/"){
            socket.write('HTTP/1.1 200 OK\r\n\r\n')
        } else if (request_path.startsWith("/echo")){
            let response_body = request_path.slice(6);
            console.log(request_split)
            console.log(request_path)
            socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${response_body.length}\r\n\r\n${response_body}`);
        } else if (request_path.endsWith("/user-agent")){
            console.log(request_split + "is the array")
            let request_user_agent = request_split[request_split.length - 1];
            console.log(request_user_agent)
            socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${request_user_agent.length}\r\n\r\n${request_user_agent}`);
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
