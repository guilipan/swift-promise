var Promise = require("../promise");
var chai = require("chai");
var expect = chai.expect;

describe("ES6 Promises 静态方法测试", function () {

    describe("Promise.resolve方法", function () {

        it("如果参数为普通值,将其作为兑现的值执行", function (done) {
            Promise.resolve("abc").then(function (val) {
                expect(val).to.equal("abc");
                done();
            })
        })

        it("如果参数是一个拥有then方法的对象,将其当作promise返回", function (done) {
            var p = new Promise(function (resolve) {
                resolve("thenable");
                done();
            })
            var ret = Promise.resolve(p);
            expect(ret).to.be.an.instanceOf(Promise);
            expect(ret).to.deep.equal(p);
        })
    });

    describe("Promise.reject方法", function () {
        it("返回一个将参数视为拒绝理由的承喏", function (done) {
            Promise.reject("abc").then(function (val) {
            }, function (reason) {
                expect(reason).to.equal("abc");
                done();
            })
        })
    })

    describe("Promise.all方法", function () {
        it("如果参数不是数组,抛出错误", function () {
            try {
                Promise.all("abc");
            }
            catch (e) {
                expect(e).to.an.instanceOf(TypeError)
                    .and.to.have.property("message", "parameters passed into all should be array type");
            }
        })

        it("如果promise数组全部被正常兑现,返回一个由他们兑现结果组成的数组,顺序为传入的顺序", function (done) {
            var promise1 = Promise.resolve(1);
            var promise2 = Promise.resolve(2);
            var promise3 = Promise.resolve(3);
            var promises = [ promise1, promise2, promise3 ];

            Promise.all(promises).then(function (arr) {
                expect(arr).to.be.an("Array");
                expect(arr).to.deep.equal([1, 2, 3]);
                done();
            });
        })

        it("如果promise数组有被拒绝,第一个被拒绝的promise的理由将会作为返回的promise的理由", function (done) {
            var promise1 = Promise.resolve(1);
            var promise2 = Promise.reject(new Error("2"));
            var promise3 = Promise.reject(new Error("3"));
            var promises = [ promise1, promise2, promise3 ];

            Promise.all(promises).then(function (array) {
                // 这里不会执行到
            }, function (error) {
                // error.message === "2"
                expect(error).to.be.instanceOf(Error)
                    .and.to.have.property("message", "2");
                done();
            });
        })
    })

    describe("Promise.race方法", function () {
        it("如果参数不是数组,抛出错误", function () {
            try {
                Promise.race("abc");
            }
            catch (e) {
                expect(e).to.an.instanceOf(TypeError)
                    .and.to.have.property("message", "parameters passed into all should be array type");
            }
        })

        it("如果全部兑现,第一个被兑现的作为promise的承诺值",function(done){
            var promise1 = new Promise(function(resolve, reject){
                setTimeout(function(){
                    resolve("promise 1");
                }, 200);
            });

            var promise2 = new Promise(function(resolve, reject){
                setTimeout(function(){
                    resolve("promise 2");
                }, 100);
            });

            Promise.race([promise1, promise2]).then(function(result){
                expect(result).to.equal("promise 2");
                done();
            });
        })

        it("如果race的结果中最早的promise被拒绝,第一个被拒绝的作为promise的理由",function(done){
            var promise1 = new Promise(function(resolve, reject){
                setTimeout(function(){
                    resolve("promise 1");
                }, 200);
            });

            var promise2 = new Promise(function(resolve, reject){
                setTimeout(function(){
                    reject(new Error("promise 2"));
                }, 100);
            });

            Promise.race([promise1, promise2]).then(function(resolve){},function(reason){
                expect(reason).to.an.instanceOf(Error)
                    .and.to.have.property("message","promise 2");

                done();

            });
        })
    })

    describe("finally方法",function(){
        it("如果promise兑现最终会执行finally的方法",function(done){
            var promise1 = new Promise(function(resolve, reject){
                setTimeout(function(){
                    resolve("promise 1");
                }, 200);
            });

            promise1.then(function(val){
                return val;
            })
            .finally(function(result){
                expect(result).to.equal("promise 1");
                done();
            })
        })

        it("如果promise出现异常仍然执行finally的回调",function(done){
            var promise1 = new Promise(function(resolve, reject){
                setTimeout(function(){
                    resolve("promise 1");
                }, 200);
            });

            promise1.then(function(){
                throw new Error("error happend");
            })
            .finally(function(e){
                    expect(e).to.an.instanceOf(Error)
                        .and.to.have.property("message","error happend");

                    done();
            })
        })
    })
});


