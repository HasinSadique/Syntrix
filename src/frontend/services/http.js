import axios from "axios";

export const http = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

export function extractApiError(error, fallback = "Something went wrong.") {
  return error?.response?.data?.message || fallback;
}
