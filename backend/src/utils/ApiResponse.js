class ApiResponse {
    constructor(statuscode, data, message = "Success") {
        this.statuscode = statuscode; // status code ko set karenge, taki response handle karne me easy ho
        this.data = data; // response data ko set karenge, taki client ko bhej sake
        this.message = message; // response message ko set karenge, taki client ko samajh me aaye ki kya hua    
        this.success = statuscode < 400; // agar status code 400 se kam hai to success true hoga, warna false hoga
    }
}

export default ApiResponse;