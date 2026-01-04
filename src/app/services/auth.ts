import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/auth`;

export const login = async (username: string, password: string) => {
  const res = await axios.post(`${API_URL}/login`, {
    username,
    password,
  });

  return res.data;
};
