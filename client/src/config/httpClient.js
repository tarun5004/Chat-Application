import axios from 'axios'
import { env } from "./env"

const httpClient = axios.create({   // Create an Axios instance with the base URL and default headers
    baseURL: env.apiBaseUrl,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default httpClient;

// headers mean that the client will send JSON data in the request body by default, and the server should expect JSON data when processing requests from this client.
// Important: Vite frontend env variable must start with VITE_.

