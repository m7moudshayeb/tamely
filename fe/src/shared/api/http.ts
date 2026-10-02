import axios, { AxiosError } from "axios";
import type { ApiError } from "@tamely/shared/types";
import { API, CSRF_HEADER } from "../constants/api";
import { ApiFailure, SIGNED_OUT_EVENT } from "./errors";

export const http = axios.create({
  baseURL: API.base,
  withCredentials: true,
  headers: { "Content-Type": "application/json", ...CSRF_HEADER },
  timeout: 30_000,
});

http.interceptors.response.use(
  (r) => r,
  (e: AxiosError<ApiError>) => {
    if (!e.response) return Promise.reject(new ApiFailure("You seem to be offline. Check your connection and try again."));
    const body = e.response.data;
    if (e.response.status === 401 && body?.code === "not_connected") window.dispatchEvent(new Event(SIGNED_OUT_EVENT));
    return Promise.reject(new ApiFailure(body?.error || "Something went wrong.", e.response.status, body?.code, body?.fix));
  },
);

export const get = async <T>(url: string, params?: Record<string, string>) => (await http.get<T>(url, { params })).data;
export const post = async <T>(url: string, body?: unknown) => (await http.post<T>(url, body)).data;
export const put = async <T>(url: string, body?: unknown) => (await http.put<T>(url, body)).data;
export const del = async <T>(url: string) => (await http.delete<T>(url)).data;
