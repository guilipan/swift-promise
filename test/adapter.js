var Promise = require("../promise");

module.exports = {
    resolved: function (value) {
        return new Promise(function (res) {
            res(value);
        });
    },
    rejected: function (reason) {
        return new Promise(function (res, rej) {
            rej(reason);
        });
    },
    deferred: function () {
        var resolve, reject;
        return {
            promise: new Promise(function (res, rej) {
                resolve = res;
                reject = rej;
            }),
            resolve: resolve,
            reject: reject
        };
    }
};