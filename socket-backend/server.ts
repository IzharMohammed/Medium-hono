import { httpServer } from ".";

const server = () => {
    const PORT = 4000;

    // Start the HTTP server and listen on the defined port
    httpServer.listen(PORT, () => {
        console.log(`server is up on port: ${PORT}`);
    });
}
server();

export default server;