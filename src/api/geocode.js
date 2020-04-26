import axios from '@/libs/api.request'

export const getAddress = (params) => {
    return axios.request({
        method: "get",
        header:{"Access-Control-Allow-Origin": "*"},
        url: '/msc/getGeoAddress?' + params,
    })
}