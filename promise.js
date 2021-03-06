;
(function (root, factory) {

    "use strict";

    if (typeof define === 'function' && (define.amd || define.cmd)) {
        // AMD or CMD Register as an anonymous module.
        define(factory);
    }
    else if (typeof module != 'undefined' && module.exports) {
        //nodejs support
        module.exports = factory();
    }
    else {
        // Browser globals
        root.Promise = factory();
    }
}(this, function () {

    var Promise;

    //Promise的构造函数
    if ("Promise" in this) {
        Promise = this["Promise"]
    }
    else {
        //定义promise状态
        var State = {
            PENDING: 0,
            FULFILLED: 1,
            REJECTED: 2
        };

        Promise = function (resolver) {

            if (!isFunction(resolver)) {

                throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');

            }

            if (!(this instanceof Promise)) {

                throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");

            }

            this._state = State.PENDING;//默认初始状态为pending

            this._value;//promise的值

            this._subscribers = [];//用于存储then方法的回调的函数队列

            invokeResolver(resolver, this);//进行兑现承诺的行为
        }

        function invokeResolver(resolver, promise) {

            function resolvePromise(value) {

                resolve(promise, value);

            }

            function rejectPromise(reason) {

                reject(promise, reason);

            }

            try {

                resolver(resolvePromise, rejectPromise);

            }
            catch (e) {

                rejectPromise(e);

            }
        }

        //异步调用订阅过的回调
        function invokeCallback(promise) {

            if (promise._state === State.PENDING) {

                return;

            }

            async(function () {//2.2.4

                while (promise._subscribers.length) {
                    var obj = promise._subscribers.shift();//2.2.6
                    try {
                        //先把当前promise的值作为参数传递给fulfillPromise,然后后面根据返回的value值来作为兑现thenPromise的参数,这里是保证调用顺序的基础
                        var value = (promise._state === State.FULFILLED ?
                            (obj.fulfillPromise || function (x) {
                                return x;//2.2.7.3
                            }) :
                            (obj.rejectPromise || function (x) {
                                throw x;//2.2.7.4
                            }))
                        (promise._value);//2.2.2，2.2.3

                    } catch (e) {

                        reject(obj.thenPromise, e);//2.2.7.2

                        continue;
                    }

                    resolve(obj.thenPromise, value);//2.2.7.1

                }

            })

        }

        //todo 提供更好的异步调用方式,区分nodejs和浏览器
        function async(fn) {//3.1

            setTimeout(fn, 0);

        }

        //[[Resolve]](promise, x),这里参数用x,是为了让看代码的人能对照规范不会混淆
        function resolve(promise, x) {

            if (promise === x) {//2.3.1

                reject(promise, new TypeError("it cant't fulfill promise equals value condition"));

            }

            else if (x && x.constructor === Promise) {//2.3.2

                if (x._state === State.PENDING) {//2.3.2.1

                    x.then(function (val) {

                        resolve(promise, val)

                    }, function (reason) {

                        reject(promise, reason);

                    })
                }
                else if (x._state === State.FULFILLED) {//2.3.2.2

                    fulfill(promise, x._value);

                }
                else if (x._state === State.REJECTED) {//2.3.2.3

                    reject(promise, x._value);

                }
            }
            else if (isObjectOrFunction(x)) {

                var isCalled = false;//2.3.3.3.3

                try {

                    var then = x.then;//2.3.3.1

                    if (typeof then == "function") {//2.3.3.3

                        then.call(x, function (val) {

                            isCalled || resolve(promise, val);//2.3.3.3.1

                            isCalled = true;

                        }, function (reason) {

                            isCalled || reject(promise, reason);//2.3.3.3.2

                            isCalled = true;
                        })
                    }

                    else {

                        fulfill(promise, x);//2.3.3.4

                    }

                } catch (e) {

                    isCalled || reject(promise, e);//2.3.3.2 ,2.3.3.3.4

                }
            }
            else {
                fulfill(promise, x);//2.3.4
            }
        }

        function fulfill(promise, value) {

            if (promise._state !== State.PENDING) {

                return;
            }

            promise._state = State.FULFILLED;

            promise._value = value;

            invokeCallback(promise);
        }

        function reject(promise, reason) {

            if (promise._state !== State.PENDING) {

                return;

            }

            promise._state = State.REJECTED;

            promise._value = reason;

            invokeCallback(promise);
        }

        Promise.prototype = {

            constructor: Promise,

            then: function (onFulfilled, onRejected) {

                var self = this;

                var promise = new Promise(function () {
                });

                self._subscribers.push({//2.2.6

                    fulfillPromise: typeof onFulfilled == "function" ? onFulfilled : null,//2.2.1，2.2.5

                    rejectPromise: typeof onRejected == "function" ? onRejected : null,//2.2.1，2.2.5

                    thenPromise: promise
                });

                invokeCallback(self);

                return promise; //2.2.7
            },
            "catch": function (onRejection) {//ie9之前的版本不支持catch关键字为属性名

                return this.then(null, onRejection);

            }

        }

        //以下静态方法为ES6 Promise新增部分
        Promise.resolve = function (value) {

            //ES6:如果value是有then方法的promise,直接返回
            if (value !== null && isFunction(value.then)) {

                return value;
            }

            return new Promise(function (resolve, reject) {

                resolve(value);

            })
        }

        Promise.reject = function (reason) {

            return new Promise(function (resolve, reject) {

                reject(reason);

            })
        }

        Promise.all = function (promises) {

            if (!isArray(promises)) {

                throw new TypeError('parameters passed into all should be array type');

            }

            return new Promise(function (resolve, reject) {
                var results = [],
                    promise,
                    remaining = promises.length;

                function thenResolve(index) {
                    return function (value) {
                        resolveAll(index, value);
                    }
                }

                function resolveAll(index, value) {
                    results[index] = value;
                    if (--remaining == 0) {
                        resolve(results);
                    }
                }

                for (var i = 0; i < remaining; i++) {

                    promise = promises[i];

                    if (promise && isFunction(promise.then)) {

                        promise.then(thenResolve(i), reject);

                    }
                    else {
                        resolveAll(i, promise);
                    }
                }
            })
        }

        Promise.race = function (promises) {
            if (!isArray(promises)) {

                throw new TypeError('parameters passed into all should be array type');

            }

            return new Promise(function (resolve, reject) {

                var promise;

                for (var i = 0; i < promises.length; i++) {

                    promise = promises[i];

                    if (promise && isFunction(promise.then)) {

                        promise.then(resolve, reject);

                    }
                    else {
                        resolve(promise);
                    }
                }
            })
        }

        function isFunction(obj) {

            return !!(obj && obj.constructor && obj.call && obj.apply);
        }

        function isObjectOrFunction(obj) {

            return isFunction(obj) || (typeof obj === "object" && obj !== null);

        }

        function isArray(obj) {

            if ("isArray" in Array) {

                return Array.isArray(obj);

            }

            else {

                return Object.prototype.toString.call(obj) === "[object Array]";

            }
        }
    }

    Promise.prototype.finally = function (fn) {//finally方法非ES6规范中

        return this.then(function (value) {
            fn(value);
        }, function (reason) {
            fn(reason);
        })
    }

    return Promise
}));
