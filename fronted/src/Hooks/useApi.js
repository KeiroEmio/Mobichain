import axios from 'axios';
import useLocalStore from './useLocalStore';

function useApi() {
    const localStore = useLocalStore();
    const baseURL = 'http://localhost:8060'; // 硬编码的基础 URL

    // If token exists set header
    let token = localStore.getToken();
    if (token) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }

    return {
        removeHeader() {
            axios.defaults.headers.common = {};
        },
        get(apiPath) {
            return axios.get(`${baseURL}${apiPath}`); // 在此处设置完整的 URL
        },

        download(apiPath) {
            return axios({
                url: `${baseURL}${apiPath}`,
                method: 'GET',
                responseType: 'blob', // important for downloading files
            });
        },
        post(apiPath, data) {
            return axios.post(`${baseURL}${apiPath}`, data);
        },

        put(apiPath, formData) {
            return axios.put(`${baseURL}${apiPath}`, formData);
        },

        delete(apiPath) {
            return axios.delete(`${baseURL}${apiPath}`);
        },

        customRequest(data) {
            // 确保这里也使用了完整的 URL
            if (data && data.url) {
                data.url = `${baseURL}${data.url}`;
            }
            return axios(data);
        },

        axios() {
            return axios;
        },
    }
}

export default useApi;
