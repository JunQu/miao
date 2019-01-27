var junqu = {
    chunk: function(array, size = 1) {
        if (size < 1) return array
        let result = [[]]
        for (let i = 0; i < array.length; i++) {
            if (result[result.length - 1].length >= size){ // 假如已经填满了，就往后移动
                result.push([])
            }
            result[result.length - 1].push(array[i]) // 进行元素分割
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
    identity: function (value) {
        return value
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

// tap(_.chunk([1,2,3,3,4,5],2));
// tap(_.drop([1,2,3],-1))
// tap(_.dropRight([1,2,3]))
// tap(_.fill([4, 6, 8, 10], '*', 1, 3))
tap(_.flatten([1,[2,[3,[4]]],5]))