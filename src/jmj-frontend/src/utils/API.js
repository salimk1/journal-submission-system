import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost",
    withCredentials: true,
});

export default API;