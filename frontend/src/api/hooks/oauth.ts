import { api } from "../api";

export function useOAuth() {
  async function google() {
    requestAuthentication("google");
  }

  async function github() {
    requestAuthentication("github");
  }

  async function requestAuthentication(provider: string) {
    const location = window.location.href;
    const state = encodeURIComponent(JSON.stringify({
      returnURL: location
    }));

    const base = (import.meta.env.VITE_BACKEND_URL as string).replace(/\/+$/, "");
    window.location.href = `${base}/auth/${provider}?state=${state}`;
  }


  return { google, github };
}