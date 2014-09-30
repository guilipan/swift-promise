# swift-promise

====================

[![Build Status](https://travis-ci.org/guilipan/swift-promise.svg?branch=master)](https://travis-ci.org/guilipan/swift-promise)
[![Coverage Status](https://coveralls.io/repos/guilipan/swift-promise/badge.png?branch=master)](https://coveralls.io/r/guilipan/swift-promise?branch=master)

一个[Promise A+规范](http://promisesaplus.com/)的实现,promise的介绍,请
[点击](http://www.html5rocks.com/zh/tutorials/es6/promises/)

[详细的实现原理](http://www.shaynegui.com/promise-aplus-implementation/)

本实现完全遵循Promise A+规范,全部实现[Promise A+测试用例](https://github.com/promises-aplus/promises-tests)

运行`npm test`可看到效果

### Usage使用方法

```

var getJSON = function(url) {
  var promise = new Promise(function(resolve, reject){
    var client = new XMLHttpRequest();
    client.open("GET", url);
    client.onreadystatechange = handler;
    client.responseType = "json";
    client.setRequestHeader("Accept", "application/json");
    client.send();

    function handler() {
      if (this.readyState === this.DONE) {
        if (this.status === 200) { resolve(this.response); }
        else { reject(this); }
      }
    };
  });

  return promise;
};

getJSON("/posts.json").then(function(json) {
  // continue
}, function(error) {
  // handle errors
});

```

### 链式调用Chaining


```
var promise = new Promise(function (resolve, reject) {
        setTimeout(function(){
            resolve(100);
        },2000)
})

promise.then(function fn1(val){
    return val+100
}).then(function fn2(val){
    alert(val);
})
```

### 错误处理Error Handling

```

var promise = new Promise(function (resolve, reject) {

        setTimeout(function(){
            resolve(100);
        },2000)

})

promise.then(function fn1(val){
    return val+100
}).then(function fn2(val){
    alert(val);
}).catch(function(reason){
    
});
    
```
### ES6中静态方法

#### Promise.resolve

```

Promise.resolve("abc")
    .then(function (val) {
        //val 为"abc"            
    })

            
var p = new Promise(function (resolve) {
    resolve("thenable");  
})

Promise
    .resolve(p)
    .then(function (val) {
      //val 为"thenable"            
    })
           
```

#### Promise.reject

```
Promise
    .reject("abc")
    .then(function (val) {}, function (reason) {
        alert(reason)//为"abc"
    })
    
```

#### Promise.all 

```

var p = new Promise(function(resolve, reject) { resolve(3); });

Promise.all([true, p]).then(function(values) {
  // values == [ true, 3 ]
});

```
#### Promise.race

```

var p1 = new Promise(function(resolve, reject) { setTimeout(resolve, 500, "one"); });
var p2 = new Promise(function(resolve, reject) { setTimeout(resolve, 100, "two"); });

Promise.race([p1, p2]).then(function(value) {
  // value === "two"
});

var p3 = new Promise(function(resolve, reject) { setTimeout(resolve, 100, "three"); });
var p4 = new Promise(function(resolve, reject) { setTimeout(reject, 500, "four"); });

Promise.race([p3, p4]).then(function(value) {
  // value === "three"               
}, function(reason) {
  // Not called
});

var p5 = new Promise(function(resolve, reject) { setTimeout(resolve, 500, "five"); });
var p6 = new Promise(function(resolve, reject) { setTimeout(reject, 100, "six"); });

Promise.race([p5, p6]).then(function(value) {
  // Not called              
}, function(reason) {
  // reason === "six"
});

```


