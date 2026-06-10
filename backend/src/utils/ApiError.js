class ApiError extends Error {
    constructor(statuscode, message) {
        super(message); // Error class ka constructor call karenge, taki message set ho jaye
        this.statuscode = statuscode; // status code ko set karenge, taki error handle karne me easy ho
    }
}

export default ApiError;