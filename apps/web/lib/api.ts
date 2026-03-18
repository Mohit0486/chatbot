import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000',
});

export function withAuth() {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('aibuilder_token') : '';
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  };
}
