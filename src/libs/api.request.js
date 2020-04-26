import HttpRequest from '@/libs/axios'
import mapConfig from '@/config/mapConfig'
const baseUrl = process.env.NODE_ENV === 'production' ? mapConfig.baseUrl.pro : mapConfig.baseUrl.dev

const axios = new HttpRequest(baseUrl)
export default axios
