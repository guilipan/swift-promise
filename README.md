# swift-promise

====================

[![Build Status](https://travis-ci.org/guilipan/swift-promise.svg?branch=master)](https://travis-ci.org/guilipan/swift-promise)

一个[Promise A+规范](http://promisesaplus.com/)的实现,promise的介绍,请
[点击](http://www.html5rocks.com/zh/tutorials/es6/promises/)

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

