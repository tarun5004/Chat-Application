class ApiError extends Error {
    constructor(statusCode, message) {
        super(message); // Error class ka constructor call karenge, taki message set ho jaye
        this.statusCode = statusCode; // status code ko set karenge, taki error handle karne me easy ho
    }
}

export default ApiError;
