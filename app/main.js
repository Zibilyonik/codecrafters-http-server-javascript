const net = require("net");
const { readFile, access, constants, writeFile } = require("fs");
const { argv } = require("process");


//Functions
const requestSplitter = (request) => {
    let split = request.toString().split("\r\n");
    const type = split[0].split(" ")[0];
    const flag = argv.find((flag) => flag === "--directory" );
    const user_agent = split.find((item) => item.startsWith("User-Agent:")).slice(12);
    let path = split[0].split(" ")[1];
    const body = split[split.length - 1];
    return {split, type, flag, user_agent, path, body};
}
const content_length = (item) => `Content-Length: ${item.length}\r\n\r\n`;

const socket_response = (item) => `${response_ok}Content-Type: text/plain\r\n${content_length(item)}${item}`

//Constants
const response_ok = 'HTTP/1.1 200 OK\r\n';
const response_not_found = 'HTTP/1.1 404 Not Found\r\n\r\n';

//Server
const server = net.createServer((socket) => {
    socket.on("data", async (data) => {
        const obj = requestSplitter(data);
        if (obj.path == "/"){
            socket.write(response_ok + '\r\n');
        } else if (obj.path.startsWith("/echo")){
            const response_body = obj.path.slice(6);
            socket.write(socket_response(response_body));
        } else if (obj.path.endsWith("/user-agent")){
            socket.write(socket_response(obj.user_agent));
        } else if (obj.path.startsWith("/files") && obj.flag != undefined){
            let file_path = argv[argv.length - 1] + obj.split[0].split(" ")[1].slice(7);
            if (request_type === "POST"){
                writeFile(file_path, body, (err) => {
                    if (err){
                        socket.write(response_not_found);
                    }
                    socket.write(`HTTP/1.1 201 OK\r\nContent-Type: application/octet-stream\r\n${content_length(body)}${body}`);
                });
            } else {
                access(file_path, constants.F_OK, (err) =>{
                    if (err){
                        socket.write(response_not_found);
                    }
                    readFile(file_path, "utf-8", (_, body) => {           
                        socket.write(socket_response(body));
                    });
                });
            }
        }
        else{
            socket.write(response_not_found)
        }   
    })
    socket.on("close", () => {
        socket.end();
    });
});

server.listen(4221, "localhost");
