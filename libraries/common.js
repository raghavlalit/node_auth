import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';
import moment from 'moment';
import fs from "fs";
import axios from 'axios';

const getCURRDIR = async () => {
    const __filename = fileURLToPath(import.meta.url);
    const dirname = path.dirname(__filename);
    return dirname;
}

export const getDate = async () => {
    let date_ob = new Date();
    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();

    return (year + "-" + month + "-" + date);
};

export const getDateTime = async () => {
    let date_ob = new Date();
    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    let hours = date_ob.getHours();
    let minutes = date_ob.getMinutes();
    let seconds = date_ob.getSeconds();
    return (year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds);
};

export const getUNQID = async (linked_admin_id = 0) => {
    return linked_admin_id > 0 ? linked_admin_id + "-" + uuidv4() : uuidv4();
};

export const getUPcase = async (str) => {
    return str.toUpperCase();
};

export const CLOG = async (str) => {
    console.log(str);
};

export const getFormattedDate = async (date = '') => {
    if (date && date !== '' && date !== '0000-00-00' && date !== '0000-00-00 00:00:00') return moment(date).format("DD/MM/YYYY");
    return '--';
};

export const getFormattedDateTime = (date_time = '') => {
    if (date_time && date_time !== '' && date_time !== '0000-00-00' && date_time !== '0000-00-00 00:00:00') return moment(date_time).format("DD/MM/YYYY hh:mm A");
    return '--';
};

export const getCustomDateFormat = (date = '', format = 'DD/MM/YYYY') => {
    if (date && date !== '' && date !== '0000-00-00' && date !== '0000-00-00 00:00:00') return moment(date).format(format);
    return '';
};

export const timeToMinutes = (hh_mm = '') => {

    if (hh_mm && hh_mm !== '' && hh_mm !== '00:00' && hh_mm !== '00:00:00') {
        hh_mm = hh_mm.split(':');
        let minutes = isNaN(parseInt(hh_mm[0])) ? 0 : (parseInt(hh_mm[0]) * 60);
        minutes = isNaN(parseInt(hh_mm[1])) ? minutes : (minutes + parseInt(hh_mm[1]));
        return minutes;
    }
    return 0;
};

export const minutesToTime = (minutes = 0) => {
    if (minutes && !isNaN(parseInt(minutes))) {
        let mm = minutes % 60;
        let hh = (minutes - mm) / 60;
        let hh_mm = (hh < 10 ? "0" : "") + hh.toString() + ":" + (mm < 10 ? "0" : "") + mm.toString();
        return hh_mm;
    }
    return "00:00";
};

export const minutesToHours = (minutes = 0) => {
    if (!isNaN(parseInt(minutes))) {
        let hr = minutes / 60;
        return hr;
    }
    return 0;
}

export const hoursToMinutes = (hours = 0) => {
    if (!isNaN(parseFloat(hours))) {
        let min = hours * 60;
        return min;
    }
    return 0;
}

export const getRelativeDate = (date = '', duration = { days: 0 }, format = "YYYY-MM-DD") => {
    if (!(date && date !== '' && date !== '0000-00-00' && date !== '0000-00-00 00:00:00')) date = moment();
    return moment(date).add(duration).format(format);
};

export const monthFirstDate = (format = 'YYYY-MM-DD') => moment().startOf('month').format(format);
export const monthLastDate = (format = 'YYYY-MM-DD') => moment().endOf('month').format(format);

export const groupByKey = (list = {}, key) => list.reduce((hash, obj) => ({ ...hash, [obj[key]]: (hash[obj[key]] || []).concat(obj) }), {})

export const writeFile = (folder_path, content = '', file_name) => {

    if (folder_path && file_name) {
        const file_path = path.join(folder_path, file_name);
        try {
            if (!fs.existsSync(folder_path)) {
                fs.mkdirSync(folder_path, { recursive: true });
                fs.chmodSync(folder_path, 0o777);
            }
            fs.writeFileSync(file_path, content);
            console.log(`${file_name} File created successfully.`);
        } catch (err) {
            console.error('Error creating file:', err);
        }
    }
};

export const readFile = (file_path) => {
    try {
        const data = "{}";
        if (fs.existsSync(file_path)) return fs.readFileSync(file_path, 'utf8');
        return data;
    } catch (err) {
        console.error('Error reading file:', err);
        return '';
    }

};

export const pagination = (limit, offset, total_count = 0, curr_page) => {

    const pagination = {
        count: total_count,
        per_page: limit,
        curr_page: curr_page,
        prev_page: offset == 0 ? 0 : 1,
        next_page: (offset + limit) >= total_count ? 0 : 1
    };
    // if (offset == 0) pagination.prev_page = 0;
    //if ((offset + limit) >= total_count) pagination.next_page = 0;
    return pagination;
};

export const apiRequest = async (source = 'hrms', apiName = '', apiSetting = {}) => {
    try {

        const { method = "GET", apiParams = null, headers = {} } = apiSetting;
        const apiUrl = 'URL';
        const targetUrl = `${apiUrl}${apiName}`;

        axios.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded;multipart/form-data";
        axios.defaults.headers.get["Content-Type"] = "application/json;charset=UTF-8";
        axios.defaults.timeout = 1000 * 60; // Wait for 60 seconds

        const options = {
            method,
            url: targetUrl,
            data: apiParams,
            headers,
        };
        const response = await axios(options);
        return response.data;
    } catch (error) {
        return error?.response?.data;
    }
};

export const convertToSnakeCase = async string => string.replace(/[^a-zA-Z1-9 ]/g, '').trim().replace(/ +/g, '_').toLowerCase();

export const getFilterWhereString = async (filter_params, filter_mapping) => {
    const filter_condition = [];
    let filter_condition_str = '';
    if(typeof filter_params === 'object' && Object.keys(filter_params).length > 0){
        for (let key in filter_params) {
            if (filter_params.hasOwnProperty(key)) {
                let val = filter_params[key];
                val = val.trim();
                const { fld, stype } = filter_mapping[key];

                if (val !== "" && val !== "null") {
                    if (stype === "contains") {
                        filter_condition.push(`${fld} like '%${val}%'`);
                    } else {
                        filter_condition.push(`${fld} ${stype} '${val}'`);
                    }
                }
            }
        }
        if (Array.isArray(filter_condition) && filter_condition.length > 0) {
            filter_condition_str = filter_condition.join(" AND ");
        }
    }
    return filter_condition_str;
}


export default getCURRDIR;