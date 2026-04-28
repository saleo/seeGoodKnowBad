/**
 * uni.request API 封装
 */

const BASE_URL = process.env.VUE_APP_API_URL || 'https://api.example.com';
const TIMEOUT = 30000;

export function request(config) {
  return new Promise((resolve, reject) => {
    uni.request({
      url: config.url.startsWith('http') ? config.url : BASE_URL + config.url,
      method: config.method || 'GET',
      data: config.data || {},
      header: { 'Content-Type': 'application/json', ...config.header },
      timeout: config.timeout || TIMEOUT,
      success: (res) => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve(res.data);
        } else {
          reject({ code: res.statusCode, message: res.data?.message || '请求失败' });
        }
      },
      fail: (err) => reject({ code: -1, message: err.errMsg || '网络错误' }),
    });
  });
}

export const get = (url, data, config) => request({ url, method: 'GET', data, ...config });
export const post = (url, data, config) => request({ url, method: 'POST', data, ...config });
export const put = (url, data, config) => request({ url, method: 'PUT', data, ...config });
export const del = (url, data, config) => request({ url, method: 'DELETE', data, ...config });
