import axios, { AxiosError } from "axios"
import { getCookies } from "./utils";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true
});

// For server side requests add cookies manually

api.interceptors.request.use(async (config) => {
  const cookies = await getCookies();

  if (cookies) {
    config.headers['Cookie'] = cookies;
  }

  return config;
});


api.interceptors.response.use(
  (response) => {
    console.log(
      `API Response: ${response.config.method?.toUpperCase()} ${response.config.url} ${response.status}`,
      response.data
    );

    return response
  },
  (error) => {
    const axiosError = error as AxiosError<{ message: string | string[] }>
    let errorMessage = axiosError.response?.data.message || axiosError.message

    if (error.response) {
      console.log(
        `API Error: ${axiosError.config?.method?.toUpperCase()} ${axiosError.config?.url} ${axiosError.response?.status} `,
        errorMessage
      );
    } else {
      console.log('API Error:', errorMessage);
    }

    if (Array.isArray(errorMessage)) errorMessage = errorMessage[0]

    return Promise.reject(new Error(errorMessage));
  }
);

