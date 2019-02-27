var junqu = {
    chunk: function(array, size = 1) {
        if (size < 1) return array
        let result = [[]]
        for (let i = 0; i < array.length; i++) {
            if (result[result.length - 1].length >= size){ // 假如已经填满了，就往后移动
                result.push([])
            }
            result[result.length - 1].push(array[i]) //进行元素分割
        }
        return result
    },

    compact: function(array){
        let result = []
        for (let i = 0; i < array.length; i++) {
            if (array[i]){
                result.push(array[i])
            }
        }
        return result
    },

    concat: function (array, ...values) {
        let result = Array.isArray(array)?[...array]:[array] // 其他不是数组的情况
        for (let val of values) {
            if (Array.isArray(val)) {
                for (let arrayVal of val) {
                    result.push(arrayVal)
                }
            } else {
                result.push(val) // 添加的是一些东西和lodash不一样，例如function foo(){}
            }
        }
        return result
    },

    difference: function (array, ...values) {
        if (!array.length) return []
        let set = new Set()
        let result = []
        for (let val of values) {
            if (Array.isArray(val)) {
                for (let arrVal of val) {
                    set.add(arrVal)
                }
            }else {
                set.add(val)
            }
        }
        for (let val of array) {
            if (!set.has(val)) {
                result.push(val)
            }
        }
        return result
    },
    
    differenceBy: function (array, ...values) {
        const length = values.length
        let result = []
        let iteratee = x=>x
        if (!array.length) return result
        if (!length) return Array.from(array)
        if(typeof values[length - 1] === "function"){
            iteratee = values.pop()
        } else if (values[length - 1] !== null && typeof values[length - 1] === "object") {

        } else {

        }
        const s = new Set(values.map(iteratee))
        return array.filter(x => !s.has(iteratee(x)))
    },

    drop: function (array, n=1) {
        if (n <= 0) return array
        return array.slice(n)
    },

    dropRight: function (array, n=1) {
        if (n <= 0) return array
        if (n > array.length) return []
        return array.slice(array,array.length - n)
    },
    fill: function (array, value, start=0, end=array.length) {
        for (let i = start; i < end; i++) {
            array[i] = value
        }
        return array
    },
    flatten: function (array) {
        let ret = []
        for (let i = 0; i < array.length; i++) {
            if (Array.isArray(array[i])) {
                for (let j = 0; j < array[i].length; j++) {
                    ret.push(array[i][j])
                }
            } else {
                ret.push(array[i])
            }
        }
        return ret
    },

    fromPairs: function (pairs) {
        let result = {}
        if (pairs.length === 0) return  result
        for (let i = 0; i < pairs.length; i++) {
            if (typeof pairs[i][0] === 'string') {
                result[pairs[i][0]] = pairs[i][1]
            }
        }
        return result
    },
    
    indexOf: function (array, value, formIndex=0) {
        for (let i = formIndex; i < array.length; i++) {
            if (array[i] === value) {
                return i
            }
        }
        return -1
    },
    
    head: function (array) {
        return array[0]
    },
    
    initial: function (array) {
        let result = []
        for (let i = 0; i < array.length - 1; i++) {
            result.push(array[i])
        }
        return result
    },
    
    identity: function (value) {
        return value
    },

    join: function (array, separator=',') {
        if (array.length === 0)  return ''
        let result = array[0].toString()
        for (let i = 1; i < array.length; i++) {
            result = result.concat(separator).concat(array[i])
        }
        return result
    },

    last: function (array) {
        if (!array.length) return undefined
        return array[array.length - 1]
    },

    lastIndexOf: function (array, value, fromIndex=array.length-1) {
        for (let i = fromIndex; i >= 0; i--) {
            if (array[i] === value) {
                return i
            }
        }
        return -1
    },

    nth: function (array, n=0) {
        if (n >= 0) {
            return array[n]
        }
        return array[array.length+n]
    },
    
    pull: function (array, ...values) {
        junqu.remove(array,x=> values.includes(x)) // 为了结果，上面才是lodash的结果
        return array
    },

    pullAll:function (array, values) {
        junqu.remove(array,x=> values.includes(x))
        return array
    },

    remove: function (array, predicate = junqu.identity) {
        let tmp = 0
        let result = []
        for (let i = 0; i < array.length - tmp; i++) { // 减去tmp的目的是最后一位已经移动，避免多余操作，即复杂度仍然是n
            while (predicate(array[i+tmp])) {  // 这里不是if而是while是为了判断移动后的当前位置，避免遗漏
                result.push(array[i+tmp])
                tmp++
            }
            array[i] = array[i+tmp]
        }
        for (let i = 0; i < tmp; i++) {
            array.pop()
        }
        return result
    },

    reverse: function (array) {
        const length = array.length
        for (let i = 0; i < length/2; i++) {
            [array[i], array[length - 1 - i]] = [array[length - 1 - i],array[i]]
        }
        return array
    },

    slice: function (array,start=0,end=array.length) {
        let length = array.length
        let result = []
        if (start < 0) {
            start = -start > length ? 0 : start + length
        }
        end = end > length ? length : end
        end = end < 0 ? end + length : end
        for (let i = start; i < end; i++) { // 这里lodash先申请空间，感觉更高效
            result.push(array[i])
        }
        return result
    },

    sortedIndex: function (array, value) {
        if (array.length === 0) return 0
        let length = array.length
        let leftDigit = 0
        let rightDigit = length - 1
        if (value < array[leftDigit]) {
            return 0
        }
        if (value > array[rightDigit]) {
            return length
        }
        while (leftDigit - rightDigit > 1) {
            let middle = Math.floor((leftDigit + rightDigit) / 2)
            if (array[middle] > value) {
                rightDigit = middle
            } else {
                leftDigit = middle
            }
        }
        return leftDigit
    },

    tail: function (array) {
        return junqu.slice(array,1)
    },

    take: function (array, n=1) {
        return junqu.slice(array, 0, n)
    },

    takeRight: function (array, n=1) {
        n = n > array.length ? array.length : n
        return junqu.slice(array, array.length - n)
    },

    union: function (...arrays) {
        let array = junqu.flatten(arrays)
        return Array.from(new Set(array))
    },
    without: function (array, ...values) {
        if (!array.length) return []
        let reuslt = []
        for (let val of array) {
            if (!values.includes(val)) {
                reuslt.push(val)
            }
        }
        return reuslt
    },
    
    eq: function (value, other) {
        return value === other || Number.isNaN(value) && Number.isNaN(other)
    },

    gt: function (value, other) {
        if (!(typeof value === "string" && typeof  other === "string")) {
            value = parseInt(value)
            other = parseInt(other)
        }
        return value > other
    },
    gte: function (value, other) {
        if (!(typeof value === "string" && typeof  other === "string")) {
            value = parseInt(value)
            other = parseInt(other)
        }
        return value >= other
    },

    // 后一段的判断函数是只针对IE9以下的判断。在严格模式下，第5版 ECMAScript (ES5) 禁止使用 arguments.callee()
    isArguments: function (value) {
        return junqu.isObject(value) && Object.prototype.toString.call(value) === '[object Arguments]'|| function (value) {
            return Object.hasOwnProperty.call(value, 'callee') && !Object.propertyIsEnumerable.call(value, 'callee')
        }(value)
    },

    isArray: function (value) {
        return Array.isArray ? Array.isArray(value) : Object.prototype.toString.call(value) === '[object Array]'
    },

    // lodash对node方面处理更多
    isArrayBuffer: function (value) {
        return Object.prototype.toString.call(value) === '[object ArrayBuffer]'
    },
    
    isArrayLike: function (value) {
        
    },
    /*
    * Uses the Object constructor to create an object wrapper for the given value.
    * If the value is null or undefined, create and return an empty object.
    * Οtherwise, return an object of a type that corresponds to the given value.
    * */
    isObject: value => value === Object(value),

    isObjectLike: value => value !== null && typeof value === 'object',

    /*
    * 全局自带的isNaN坑点：先用Number转换，Number对于非数字字符串返回NaN
    * Number.isNAN 缺陷 Number.isNAN（new Number(NaN)）,虽然这种NaN很奇怪
    * lodah修复了，加个Number判断，后面+号的原因是把Number类型进行转换
    * 这里必须用==而不用===，原因在lodash源码有特别的解释
    * */
    isNaN: function (value) {
        return junqu.isNumber(value) && value != +value
    },

    // 加上原型判断是为了判断new Number()创建的对象，前部分仅仅可以判断基本的number类型
    isNumber: function (value) {
        return typeof value === 'number' || junqu.isObjectLike(value) && Object.prototype.toString.call(value) === '[object Number]'
    },

};


/* --------------------TEST--------------------------------------测试--------------------------------------------------*/
// 便于与lodash联系
let _ = junqu;
// 替换console.log
const tap = function (x, fn = x=>x) {
    console.log(fn(x));
    return x
};

// tap(_.chunk(3,[1,2,3,3,4,5],2));
// tap(_.drop([1,2,3],-1))
// tap(_.dropRight([1,2,3]))
// tap(_.fill([4, 6, 8, 10], '*', 1, 3))
// tap(_.flatten([1,[2,[3,[4]]],5]))
// tap(_.join([1,2,3,4],'-'))
// tap(_.last([]))
// tap(_.lastIndexOf([1,2,1,2],2,0))
// tap(_.nth([1,2,3,4,5],-10))
// tap(_.difference([1,2,3,4],[2,3,4,5]))
// tap(_.fromPairs([['a', 1], ['b', 2]]))
// tap(_.head([1,2,3]))
// tap(_.indexOf([1,2,1,2],2,2))
// tap(_.initial([1,2,3]))
// let arr = [1,2,2,2,2,3,4,9,4,4,5,61,72];tap(_.remove(arr,x=>x%2===0));tap(arr) // 方便统计
// let arr = ['a','b','a','c','d',1,2,NaN];tap(_.pull(arr,'a',1,NaN,'c'));tap(arr)
// let arr = ['a',2,3,4,'d',1,2,NaN];_.pullAll(arr,['a',1,NaN,'c']);tap(arr)
// tap(_.reverse([1,2,3,4]))
// tap(_.slice([1,2,3,4,5,6],2,3))
// tap(_.tail([1,2,3,4,5]))
// tap(_.take([1,2,3],5))
// tap(_.takeRight([1,2,3],3))
// tap(_.union([2],[2,1],[1,2,3],[1,3]))
// tap(_.concat(1,[1],2,[[3]],function () {}))
// tap(_.without([1,2,3,4],2,{3:1},4))
// tap(_.differenceBy([{ 'x': 2 }, { 'x': 1 }], [{ 'x': 1 }], 'x')
// tap(_.isObject(new String('')))
// tap(_.isObjectLike(function() { return arguments; }()))
// tap(_.isArguments(function() { return arguments; }()))
// tap(_.isNumber(new Number('abc')))
// tap(_.isNaN(new Number('abc')))
// tap(_.isArrayBuffer(new ArrayBuffer()))