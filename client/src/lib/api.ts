import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  timeout: 1 * 60 * 1000,
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

let refreshPromise: Promise<any> | null = null;

async function getNewAccessToken() {
  if (!refreshPromise) {
    refreshPromise = api
      .post("/auth/refresh", {}, { withCredentials: true })
      .then((res) => {
        console.log(res);
        localStorage.setItem("token", res.data.accessToken);
        return res.data.accessToken;
      })
      .catch((err) => {
        console.log(err);
        localStorage.setItem("token", "");
        throw err; // propagate failure to every waiting caller
      })
      .finally(() => {
        console.log("called finally");
        refreshPromise = null; // reset so the *next* 401 can trigger a fresh call
      });
  }
  return refreshPromise;
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/refresh")
    ) {
      originalRequest._retry = true;

      try {
        const newToken = await getNewAccessToken();
        console.log(newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest); // retry the original call
      } catch (refreshError) {
        // refresh itself failed — refresh token is dead/expired
        localStorage.setItem("token", "");
        // window.location.href = "/signin";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
