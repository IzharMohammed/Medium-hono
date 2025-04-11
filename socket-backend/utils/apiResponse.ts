class ApiResponse {
    public statusCode: number;
    public data: any;
    public message: string;
    public success: boolean;
    constructor(statusCode, data, message = "Success") {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400;
    }
}

export { ApiResponse };
