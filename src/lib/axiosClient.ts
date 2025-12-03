"use client"

import axios from "axios"

export const AxiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  // withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  // timeout: 17000,
})