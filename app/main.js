const net = require("net");
const { open, close, fs } = require("fs");
const { argv } = require("process");

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
    socket.on("data", (data) => {
        let request_split = data.toString().split("\r\n");
        let file_flag = argv.find((flag) => flag === "--directory" );
        if (file_flag !== undefined && request_split[0].split(" ")[1].startsWith("/files")){
            let file_path = argv[argv.length - 1] + request_split[0].split(" ")[1].slice(7);
            console.log(file_path);
            open(file_path, "r", (err, fd) => {
                if (err) {
                    socket.write('HTTP/1.1 404 Not Found\r\n\r\n')
                } else {
                    try {
                        let file_data = fs.readFileSync(file_path, "utf8");
                        socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/octet-stream\r\nContent-Length: ${file_data.length}\r\n\r\n${file_data}`);
                    }finally {
                        close(fd, (err) => {
                            if (err) {
                                console.error(err);
                            }
                        });
                } 
                }
            });
        }
        let request_user_agent = "";
        for(let i = 0; i < request_split.length; i++){
            if (request_split[i].startsWith("User-Agent:")){
                request_user_agent = request_split[i].slice(12);
            }
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
            socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${request_user_agent.length}\r\n\r\n${request_user_agent}`);
        }
        else{
            socket.write('HTTP/1.1 404 Not Found\r\n\r\n')
        }   
    })
    socket.on("close", () => {
        socket.end();
        // server.close();
    });
});

server.listen(4221, "localhost");
