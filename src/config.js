
const API_URL = window.location.protocol === 'https:'
    ? 'https://drbskhealthcare.com/'
    : window.location.hostname === 'drbskhealthcare.in'
        ? 'http://drbskhealthcare.in:4000'
        : 'http://31.97.61.81:4000';

// const API_URL = 'http://31.97.61.81:4000'
// const API_URL =  'http://localhost:5000'
// const API_URL = 'https://mtgxcv03-5000.inc1.devtunnels.ms'

export default API_URL