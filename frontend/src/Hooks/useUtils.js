export default function useUtils() {

    return {
        sum(arr, key) {
            var total = 0
            for (var i = 0, _len = arr.length; i < _len; i++) {
                total += parseFloat(arr[i][key])
            }
            if (!isNaN(total)) {
                return total.toFixed(2)
            }
            return '';
        },
        average(arr, key) {
            var total = this.sum(arr, key);
            var len = arr.length;
            var avg = total / len;
            if (avg)
                return avg.toFixed(2);
            return ''
        },
        min(arr, key) {
            if (!arr.length) return ''
            return Math.min.apply(null, arr.map((item) => item[key]));
        },
        max(arr, key) {
            if (!arr.length) return ''
            return Math.max.apply(null, arr.map((item) => item[key]));
        },
        percentValue(val, max) {
            let num = parseFloat(val) / parseFloat(max)
            return num.toFixed(2);
        },
        toPercent(val, max) {
            let num = this.percentValue(val, max) * 100;
            return num.toFixed(2);
        },
        trimChar (str, charlist) {
            if (typeof charlist == 'undefined') {
                charlist = '\\s';
            }
            let pattern = '^[' + charlist + ']*(.*?)[' + charlist + ']*$';
            return str.replace(new RegExp(pattern), '$1')
        },
        parseRoutePath(path) {
            let pageName = "";
            let pageAction = "";
            let routePath = "/";
            let fieldName = "";
            let fieldValue = "";
            if (path) {
                path = this.trimChar(path, "/");
                const arrPath = path.split("/");
                pageName = arrPath[0] || "index";
                pageAction = arrPath[1] || "index";
                fieldName = arrPath[2] || "";
                fieldValue = arrPath[3] || "";
                if(fieldName && !fieldValue){
                    pageAction = "index"
                }
                routePath = `${pageName}/${pageAction}`;
            }
            return { pageName, pageAction, fieldName, fieldValue, routePath, path }
        },
        extend(obj, src) {
            for (var key in src) {
                if (src.hasOwnProperty(key)) obj[key] = src[key];
            }
            return obj;
        },
        setApiPath(path, queryObj) {
            if (queryObj) {
                var str = [];
                for (var key in queryObj) {
                    var value = queryObj[key]
                    if (queryObj.hasOwnProperty(key) && value !== '') {
                        str.push(encodeURIComponent(key) + "=" + encodeURIComponent(value));
                    }
                }
                var qs = str.join("&");
                if (path.indexOf('?') > 0) {
                    path = path + '&' + qs;
                }
                else {
                    path = path + '?' + qs;
                }
            }
            return this.joinPaths([process.env.REACT_APP_API_PATH, path]);
        },
        setImgUrl(src, imgSize = 'small') {
            if (src) {
                if (src.includes('/temp/') || src.includes(`/${imgSize}/`)) {
                    return this.getFileFullPath(src);
                }
                src = src.toString().split(",")[0]; //if multiple image, use the first
                let isExternalFile = this.isExternalFile(src);
                if (imgSize && !isExternalFile) {
                    let paths = src.toString().split('/');
                    paths.splice(-1, 0, imgSize);
                    src = paths.join('/');
                }
                return this.getFileFullPath(src);
            }
            return "images/no-image-available.png";
        },
        randomColor() {
            var letters = '0123456789ABCDEF';
            var color = '#';
            for (var i = 0; i < 6; i++) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
        },
        randomChars(length = 10, characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*') {
            var result = [];
            var charactersLength = characters.length;
            for (var i = 0; i < length; i++) {
                result.push(characters.charAt(Math.floor(Math.random() * charactersLength)));
            }
            return result.join('');
        },
        randomStr(length = 10, characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
            var result = [];
            var charactersLength = characters.length;
            for (var i = 0; i < length; i++) {
                result.push(characters.charAt(Math.floor(Math.random() * charactersLength)));
            }
            return result.join('');
        },
        randomNum(length=10) {
            return Math.floor(Math.pow(10, length - 1) + Math.random() * 9 * Math.pow(10, length - 1));
        },
        // return uuid/v4
        uuid: function () {
            var dt = new Date().getTime();
            var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = (dt + Math.random() * 16) % 16 | 0;
                dt = Math.floor(dt / 16);
                return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
            });
            return uuid;
        },
        //return javascript date object in iso date (YYYY-MM-DD)
        formatDate(value) {
            var date = new Date(value);
            var month = '' + (date.getMonth() + 1), day = '' + date.getDate(), year = date.getFullYear();
            if (month.length < 2)
                month = '0' + month;
            if (day.length < 2)
                day = '0' + day;
            return [year, month, day].join('-');
        },
        //return current date object in iso format (YYYY-MM-DD)
        dateNow() {
            return new Date().toISOString().split('T')[0];
        },
        //return current date object in iso format (YYYY-MM-DD) (YYYY-MM-DD HH:mm:ss)
        dateTimeNow() {
            return new Date().toISOString().slice(0, 19).replace('T', ' ');
        },
        timeNow() {
            return new Date().toLocaleTimeString();
        },
        toArray(val) {
            if (val) {
                if (Array.isArray(val)) {
                    return val;
                }
                else {
                    return val.split(",");
                }
            }
            else {
                return [];
            }
        },
        serializeQuery(params, prefix) {
            const query = Object.keys(params).map((key) => {
                const value = params[key];

                if (params.constructor === Array)
                    key = `${prefix}[]`;
                else if (params.constructor === Object)
                    key = (prefix ? `${prefix}[${key}]` : key);

                if (typeof value === 'object')
                    return this.serializeQuery(value, key);
                else
                    return `${key}=${encodeURIComponent(value)}`;
            });

            return [].concat.apply([], query).join('&');
        },
        trim(str, charlist) {
            if (typeof charlist === 'undefined') {
                charlist = '\\s';
            }
            let pattern = '^[' + charlist + ']*(.*?)[' + charlist + ']*$';
            return str.replace(new RegExp(pattern), '$1')
        },
        /**
         * Joins 2 paths together without duplicate separators
         * @param parts the parts of the url to join. eg: ['http://google.com/', '/path/']
         * @returns {string} The combined path
         */
        joinPaths(parts) {
            let separator = '/';
            return parts.map(function (part) {
                if (part) {
                    return part.trim().replace(/(^[/]*|[/]*$)/g, '');
                }
                return ""
            }).join(separator);
        },
        getFileFullPath(path) {
            let isFullPath = path.startsWith("https://") || path.startsWith("http://");
            if (isFullPath) {
                return path;
            }
            return this.joinPaths([process.env.REACT_APP_API_URL, path]);
        },
        isExternalFile(path) {
            let fullPath = this.getFileFullPath(path);
            let baseUrl = process.env.REACT_APP_API_URL; //app base url
            let isLocalFile = fullPath.startsWith(baseUrl);
            return !isLocalFile;
        },
        debounce() {
            let timeout = null;
            return function (fnc, delayMs) {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    fnc();
                }, delayMs || 500);
            };
        },
        strEllipsis(string, maxLength) {
            if (!string) return string;
            if (maxLength < 1) return string;
            if (string.length <= maxLength) return string;
            if (maxLength === 1) return string.substring(0, 1) + '...';

            var midpoint = Math.ceil(string.length / 2);
            var toremove = string.length - maxLength;
            var lstrip = Math.ceil(toremove / 2);
            var rstrip = toremove - lstrip;
            return string.substring(0, midpoint - lstrip) + '...'
                + string.substring(midpoint + rstrip);
        },
        capitalize(value) {
            if (!value) return ''
            value = value.toString()
            return value.charAt(0).toUpperCase() + value.slice(1)
        },

        readable(value) {
            if (!value) return ''
            return value.replace(/[^a-zA-Z0-9]/g, ' ');
        },
        humanDate(value) {
            const date = new Date(value)
            if (isNaN(date)) {
                return value
            }
            return new Intl.DateTimeFormat('default', { dateStyle: 'medium' }).format(date);
        },
        humanTime(value) {
            const date = new Date(value)
            if (isNaN(date)) {
                return value
            }
            return date.toLocaleTimeString();
        },
        humanDatetime(value) {
            //example 'Mar. 10, 2021, 4:13:32 p.m.'
            const date = new Date(value)
            if (isNaN(date)) {
                return value
            }
            return new Intl.DateTimeFormat('default', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
        },
        relativeDate(value) {
            const date = new Date(value)
            if (isNaN(date)) {
                return value
            }
            const formatter = new Intl.RelativeTimeFormat(undefined, {
                numeric: 'auto'
            });

            const divisions = [
                { amount: 60, name: 'seconds' },
                { amount: 60, name: 'minutes' },
                { amount: 24, name: 'hours' },
                { amount: 7, name: 'days' },
                { amount: 4.34524, name: 'weeks' },
                { amount: 12, name: 'months' },
                { amount: Number.POSITIVE_INFINITY, name: 'years' }
            ];

            let duration = (date - new Date()) / 1000;
            for (let i = 0; i <= divisions.length; i++) {
                const division = divisions[i];
                if (Math.abs(duration) < division.amount) {
                    return formatter.format(Math.round(duration), division.name);
                }
                duration /= division.amount;
            }
        },
        approximate(num, precision) {
            precision = precision || 2;
            return (+(Math.round(+(num + 'e' + precision)) + 'e' + -precision)).toFixed(precision);
        },
        lower(value) {
            return value || value === 0 ? value.toString().toLowerCase() : '';
        },

        upper(value) {
            return value || value === 0 ? value.toString().toUpperCase() : '';
        },

        truncate(value, length, dots) {
            length = length || 15;
            dots = dots || "...";
            if (!value || typeof value !== 'string') return '';
            if (value.length <= length) return value;
            return value.substring(0, length) + dots;
        },
        currency(value, currency, fraction) {
            currency = currency || "USD";
            fraction = fraction || 2;
            var formatter = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency,
                minimumFractionDigits: fraction
            });
            return formatter.format(value);
        },
        formatSize(bytes) {
            let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
            if (bytes === 0) return '0 Byte';
            let i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
            return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
        }

    }
}
