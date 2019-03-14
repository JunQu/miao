var junqu = {
  /*--------------------------------------Array------------------------------------------------------*/
  chunk: function(array, size = 1) {
    let result = [[]];
    for (let i = 0; i < array.length; i++) {
      if (result[result.length - 1].length >= size) {
        // 假如已经填满了，就往后移动
        result.push([]);
      }
      result[result.length - 1].push(array[i]); //进行元素分割
    }
    return result;
  },

  compact: array => array.filter(arr => Boolean(arr)),

  concat: function(array, ...values) {
    let result = Array.isArray(array) ? [...array] : [array]; // 其他不是数组的情况
    for (let val of values) {
      if (Array.isArray(val)) {
        for (let arrayVal of val) {
          result.push(arrayVal);
        }
      } else {
        result.push(val); // 添加的是一些东西和lodash不一样，例如function foo(){}
      }
    }
    return result;
  },

  baseDifference: function(
    array,
    values,
    iteratee = junqu.identity,
    comparator
  ) {
    let valSet;
    comparator = typeof comparator === "function" ? comparator : undefined;
    if (!comparator) {
      valSet = new Set(values.map(iteratee));
    }
    return array.filter(arr =>
      comparator
        ? values.findIndex(val => comparator(arr, val)) === -1
        : !valSet.has(iteratee(arr))
    );
  },

  difference: (array, ...values) =>
    !array || !array.length
      ? []
      : junqu.baseDifference(array, junqu.flatten(values), junqu.identity),

  differenceBy: function(array, ...values) {
    // 由于没有深度比较以及选择错误(pop)，代码存在巨大缺陷，但是我不改了
    if (!array || !array.length) {
      return [];
    }
    if (!values.length) {
      return array;
    }
    let iteratee =
      values.length > 1 && !Array.isArray(values[values.length - 1])
        ? junqu.getIteratee(values.pop())
        : junqu.identity;
    return junqu.baseDifference(array, junqu.flatten(values), iteratee);
  },

  differenceWith: function(array, ...values) {
    if (!array || !array.length) {
      return [];
    }
    if (!values.length) {
      return array;
    }
    let comparator =
      values.length > 1 && !Array.isArray(values[values.length - 1])
        ? values.pop()
        : undefined;
    return junqu.baseDifference(
      array,
      junqu.flatten(values),
      junqu.identity,
      comparator
    );
  },

  drop: (array, n = 1) => (n <= 0 ? array : array.slice(n)),

  dropRight: function(array, n = 1) {
    if (n <= 0) return array;
    if (n >= array.length) return [];
    n = Math.trunc(n);
    return array.slice(0, array.length - n);
  },

  dropRightWhile: function(array, predicate = junqu.identity) {
    if (!array || !array.length) return [];
    predicate = junqu.getIteratee(predicate, 3);
    for (let i = array.length - 1; i >= 0; i--) {
      if (!predicate(array[i], i, array)) {
        // 只需要一个为false,就把前面的元素去除
        return array.slice(0, i + 1);
      }
    }
    return [];
  },

  // The predicate is invoked with three arguments: (value, index, array).
  // 函数是目的是去除遇到第一个falsely值前的所有元素
  dropWhile: function(array, predicate) {
    if (!array || !array.length) return [];
    predicate = junqu.getIteratee(predicate, 3);
    for (let i = 0; i < array.length; i++) {
      if (!predicate(array[i], i, array)) {
        // 只需要一个为false,就把前面的元素去除
        return array.slice(i);
      }
    }
    return [];
  },

  fill: function(array, value, start = 0, end = array.length) {
    for (let i = start; i < end; i++) {
      array[i] = value;
    }
    return array;
  },

  findIndex: function(array, predicate, fromIndex) {
    fromIndex = fromIndex && fromIndex > 0 ? Math.trunc(fromIndex) : 0;
    predicate = junqu.getIteratee(predicate);
    for (let i = fromIndex; i < array.length; i++) {
      if (predicate(array[i])) {
        return i;
      }
    }
    return -1;
  },

  findLastIndex: function(array, predicate, fromIndex) {
    let length = array.length;
    fromIndex =
      fromIndex && fromIndex >= length ? Math.trunc(fromIndex) : length - 1;
    predicate = junqu.getIteratee(predicate);
    for (let i = fromIndex; i >= 0; i--) {
      if (predicate(array[i])) {
        return i;
      }
    }
    return -1;
  },

  flatten: array =>
    !array || !array.length ? [] : junqu.flattenDepth(array, 1),

  // 这里如果把flattenDepth的path改为Infinity就可以，但是假如为了练习，就用了30S的代码
  flattenDeep: function flattenDeep(array) {
    return [].concat(
      ...array.map(v => (Array.isArray(v) ? flattenDeep(v) : v))
    );
  },

  flattenDepth: function flattenDepth(array, path = 1) {
    return !array || !array.length
      ? []
      : array.reduce(
          (arr, val) =>
            arr.concat(
              Array.isArray(val) && path > 1 ? flattenDepth(val, path - 1) : val
            ),
          []
        );
  },

  fromPairs: function(pairs) {
    let result = {};
    if (pairs.length === 0) return result;
    for (let i = 0; i < pairs.length; i++) {
      result[pairs[i][0]] = pairs[i][1];
    }
    return result;
  },

  head: array => (Array.isArray(array) && array.length ? array[0] : undefined),

  indexOf: function(array, value, formIndex = 0) {
    if (!array || !array.length) {
      return -1;
    }
    formIndex = !formIndex || formIndex < 0 ? 0 : Math.trunc(formIndex);
    for (let i = formIndex; i < array.length; i++) {
      if (array[i] === value) {
        return i;
      }
    }
    return -1;
  },

  initial: array =>
    array && array.length ? array.slice(0, array.length - 1) : [],

  intersection: function(...arrays) {
    if (!arrays || !arrays.length) {
      return [];
    }
    let arrayMapped = arrays.map(value => (Array.isArray(value) ? value : []));
    // 对于不是元素的判断
    if (arrayMapped.length === 1) {
      return arrayMapped[0].length ? arrayMapped[0] : [];
    }
    // 随便取出一个基准
    let result = arrayMapped[0];
    for (let i = 1; i < arrayMapped.length; i++) {
      if (!result.length) {
        return result;
      }
      let arraySet = new Set(arrayMapped[i]);
      result = result.filter(val => arraySet.has(val)); // 对比，过滤不是共同的元素
    }
    return result;
  },

  intersectionBy: function(...arrays) {
    if (!arrays || !arrays.length) {
      return [];
    }
    let iteratee = Array.isArray(arrays[arrays.length - 1])
      ? junqu.identity
      : junqu.getIteratee(arrays.pop(), 2);
    let arrayMapped = arrays.map(arr => (Array.isArray(arr) ? arr : []));
    // 对于不是元素的判断
    if (arrayMapped.length === 1) {
      return arrayMapped[0].length ? arrayMapped[0] : [];
    }
    // 随便取出一个基准
    let result = arrayMapped[0];
    // 我的这个循环效率非常低，Lodash在这里做了大量的缓存
    for (let i = 1; i < arrayMapped.length; i++) {
      if (!result.length) {
        return result;
      }
      let arraySet = new Set(arrayMapped[i].map(iteratee));
      result = result.filter(val => arraySet.has(iteratee(val)));
    }
    return result;
  },

  intersectionWith: function(...arrays) {
    if (!arrays || !arrays.length) {
      return [];
    }
    let comparator =
      typeof arrays[arrays.length - 1] === "function"
        ? arrays.pop()
        : undefined;
    if (!comparator) {
      return junqu.intersection(junqu.flatten(arrays));
    }
    let arrayMapped = arrays.map(arr => (Array.isArray(arr) ? arr : []));
    let result = arrayMapped[0];
    for (let i = 1; i < arrayMapped.length; i++) {
      if (!result.length) {
        return result;
      }
      result = result.filter(
        x => arrayMapped[i].findIndex(y => comparator(x, y)) !== -1
      );
    }
    return result;
  },

  join: function(array, separator = ",") {
    if (array.length === 0) return "";
    let result = array[0].toString();
    for (let i = 1; i < array.length; i++) {
      result = result.concat(separator).concat(array[i]);
    }
    return result;
  },

  last: function(array) {
    if (!array.length) return undefined;
    return array[array.length - 1];
  },

  lastIndexOf: function(array, value, fromIndex) {
    if (!array || !array.length) {
      return -1;
    }
    if (!value) {
      return -1;
    }
    fromIndex =
      fromIndex && fromIndex < array.length
        ? Math.trunc(fromIndex)
        : array.length - 1;
    for (let i = fromIndex; i >= 0; i--) {
      if (array[i] === value) {
        return i;
      }
    }
    return -1;
  },

  nth: function(array, n = 0) {
    if (!array || !array.length) {
      return undefined;
    }
    if (n >= 0) {
      return array[n];
    }
    return array[array.length + n];
  },

  pull: (array, ...values) => junqu.pullAll(array, values),

  basePullAll: function(array, values, iteratee, comparator) {
    let valState;
    let pulled;
    iteratee = iteratee ? iteratee : junqu.identity;
    if (comparator) {
      valState = values.map(iteratee);
      pulled = array.filter(
        a => valState.findIndex(v => comparator(a, v)) === -1
      );
    } else {
      valState = new Set(values.map(iteratee));
      pulled = array.filter(a => !valState.has(iteratee(a)));
    }
    // 强行改变数组
    array.length = 0;
    pulled.forEach(v => array.push(v));
    return array;
  },

  pullAll: (array, values) =>
    Array.isArray(array) && array.length && values && values.length
      ? junqu.basePullAll(array, values, junqu.identity)
      : array,

  pullAllBy: function(array, ...values) {
    let length = values.length;
    if (!(Array.isArray(array) && array.length && values && length)) {
      return array;
    }
    let iteratee =
      Array.isArray(values[length - 1]) || length === 1
        ? junqu.identity
        : junqu.getIteratee(values.pop(), 2);
    return junqu.basePullAll(array, junqu.flatten(values), iteratee);
  },

  pullAllWith: function(array, ...values) {
    let length = values.length;
    if (!(Array.isArray(array) && array.length && values && length)) {
      return array;
    }
    let comparator =
      typeof values[length - 1] === "function" && length > 1
        ? values.pop()
        : undefined;
    return junqu.basePullAll(
      array,
      junqu.flatten(values),
      junqu.identity,
      comparator
    );
  },

  // pullAtIndex 类似的有pullAtValue,但是这里没有
  pullAt: function(array, ...indexes) {
    if (!Array.isArray(array) || !array.length) {
      return [];
    }
    indexes = junqu.flatten(indexes);
    let removed = [];
    array.forEach((v, i) => (indexes.includes(i) ? removed.push(v) : v));
    let pulled = array.filter((arr, i) => !indexes.includes(i));
    array.length = 0;
    pulled.forEach(v => array.push(v));
    return removed;
  },

  remove: function(array, predicate = junqu.identity) {
    let tmp = 0;
    let result = [];
    for (let i = 0; i < array.length - tmp; i++) {
      // 减去tmp的目的是最后一位已经移动，避免多余操作，即复杂度仍然是n
      while (predicate(array[i + tmp])) {
        // 这里不是if而是while是为了判断移动后的当前位置，避免遗漏
        result.push(array[i + tmp]);
        tmp++;
      }
      array[i] = array[i + tmp];
    }
    for (let i = 0; i < tmp; i++) {
      array.pop();
    }
    return result;
  },

  reverse: array => array.reduce((a, b) => [b, ...a], []),

  slice: function(array, start = 0, end = array.length) {
    let length = array.length;
    let result = [];
    if (start < 0) {
      start = -start > length ? 0 : start + length;
    }
    end = end > length ? length : end;
    end = end < 0 ? end + length : end;
    for (let i = start; i < end; i++) {
      // 这里lodash先申请空间，感觉更高效
      result.push(array[i]);
    }
    return result;
  },

  //_.sortedIndex([30, 50], 40);
  sortedIndex: function(array, value) {
    if (!(Array.isArray(array) && array.length)) {
      return -1;
    }
    if (typeof value !== "number") {
      return -1;
    }
    let low = 0;
    let high = array.length - 1;
    let mid;
    while (low < high) {
      // 据说这样能防止溢出
      mid = (high + low) >>> 1;
      if (array[mid] < value) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }
    return high;
  },

  sortedIndexBy: function(array, value, iteratee = junqu.identity) {
    iteratee = junqu.getIteratee(iteratee, 2);
    let arr = array.map(iteratee);
    let val = iteratee(value);
    return junqu.sortedIndex(arr, val);
  },

  sortedIndexOf: function(array, value) {
    if (!(array && array.length)) {
      return -1;
    }
    let i = junqu.sortedIndex(array, value);
    if (array[i] === value && i < array.length) {
      return i;
    }
    return -1;
  },

  sortedLastIndex: function(array, value) {
    if (!(Array.isArray(array) && array.length)) {
      return -1;
    }
    if (typeof value !== "number") {
      return -1;
    }
    let low = 0;
    let high = array.length - 1;
    while (low < high) {
      let mid = (low + high) >>> 1;
      if (array[mid] <= value) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }
    return high;
  },

  sortedLastIndexBy: function(array, value, iteratee = junqu.identity) {
    iteratee = junqu.getIteratee(iteratee, 2);
    let arr = array.map(iteratee);
    let val = iteratee(value);
    return junqu.sortedLastIndex(arr, val);
  },

  sortedLastIndexOf: function(array, value) {
    if (!(array && array.length)) {
      return -1;
    }
    let i = junqu.sortedLastIndex(array, value) - 1;
    if (array[i] === value && i < array.length) {
      return i;
    }
    return -1;
  },

  sortedUniq: function(array) {
    return junqu.sortedUniqBy(array, junqu.identity);
  },

  sortedUniqBy: function(array, iteratee = junqu.identity) {
    if (!(array && array.length)) {
      return [];
    }
    iteratee = junqu.getIteratee(iteratee, 2);
    let result = [array[0]];
    let tmp = iteratee(array[0]);
    return array.reduce((ary, val) => {
      let v = iteratee(val);
      if (!junqu.eq(tmp, v)) {
        result.push(val);
        tmp = v;
      }
      return result;
    }, result);
  },

  tail: function(array) {
    return junqu.slice(array, 1);
  },

  take: (array, n = 1) => (array && array.length ? array.slice(0, n) : []),

  takeRight: function(array, n = 1) {
    if (!(array && array.length)) {
      return [];
    }
    n = n > array.length ? array.length : n;
    return junqu.slice(array, array.length - n);
  },

  takeRightWhile: function(array, predicate = junqu.identity) {
    if (!(Array.isArray(array) && array.length)) {
      return [];
    }
    predicate = junqu.getIteratee(predicate, 3);
    for (let i = array.length - 1; i >= 0; i--) {
      if (!predicate(array[i], i, array)) {
        return array.slice(i + 1, array.length);
      }
    }
    return array.slice();
  },

  takeWhile: function(array, predicate = junqu.identity) {
    if (!(Array.isArray(array) && array.length)) {
      return [];
    }
    predicate = junqu.getIteratee(predicate, 3);
    for (let [i, v] of array.entries()) {
      // entries()得到索引和值
      if (!predicate(v, i, array)) {
        return array.slice(0, i);
      }
    }
    return array.slice();
  },

  union: (...arrays) =>
    arrays.length ? Array.from(new Set(junqu.flatten(arrays))) : [],

  unionBy: function(...arrays) {
    let length = arrays.length;
    if (!length) {
      return [];
    }
    let s = new Set(); // Set缓存
    let valState; // 缓存处理后的
    let result = []; // 存放结果
    let iteratee =
      !Array.isArray(arrays[length - 1]) && length > 1
        ? junqu.getIteratee(arrays.pop(), 2)
        : junqu.identity;
    arrays = junqu.flatten(arrays);
    arrays.forEach(value => {
      valState = iteratee(value);
      if (!s.has(valState)) {
        // 与已经经过的值都不同
        s.add(valState);
        result.push(value);
      }
    });
    return result;
  },

  unionWith: function(...arrays) {
    let length = arrays.length;
    let result = [];
    if (!length) {
      return [];
    }
    arrays = junqu.flatten(arrays);
    let comparator =
      length > 1 && typeof arrays[length - 1] ? arrays.pop() : undefined;
    arrays.forEach(val =>
      result.findIndex(reVal => comparator(val, reVal)) === -1
        ? result.push(val)
        : val
    );
    return result;
  },

  uniq: array => (array && array.length ? Array.from(new Set(array)) : []),

  uniqBy: (array, iteratee) => {
    let length = array.length;
    if (!(array && length)) {
      return [];
    }
    let s = new Set(); // Set缓存
    let valState; // 缓存处理后的
    let result = []; // 存放结果
    iteratee = iteratee ? junqu.getIteratee(iteratee, 2) : junqu.identity;
    array.forEach(value => {
      valState = iteratee(value);
      if (!s.has(valState)) {
        // 与已经经过的值都不同
        s.add(valState);
        result.push(value);
      }
    });
    return result;
  },

  uniqWith: (array, comparator) => {
    let length = array.length;
    let result = [];
    if (!(array && length)) {
      return [];
    }
    comparator = typeof comparator === "function" ? comparator : undefined;
    array.forEach(val =>
      result.findIndex(reVal => comparator(val, reVal)) === -1
        ? result.push(val)
        : val
    );
    return result;
  },

  unzip: function(array) {
    if (!(Array.isArray(array) && array.length)) return [];
    let arrTmp = Array.from({
      length: Math.max(...array.map(a => a.length))
    }).map(x => []);
    // tap(arrTmp)
    return array.reduce(
      (pre, arr) => (arr.forEach((val, i) => pre[i].push(val)), pre),
      arrTmp
    );
    // 我感觉非常难懂这段,push()操作返回的是新数组长度，，，也就是说第二次以后的pre都是拥有两个参数?
  },

  unzipWith: function(array, iteratee) {
    if (!(array && array.length)) {
      return [];
    }
    iteratee = iteratee ? junqu.getIteratee(iteratee) : undefined;
    return junqu.zipWith(...array, iteratee);
  },

  without: (array, ...values) =>
    array && array.length ? array.filter(v => !values.includes(v)) : [],

  baseXor: function(arrays, iteratee, comparator) {
    let length = arrays.length;
    let result = Array(length);
    for (let i = 0; i < length; i++) {
      for (let j = 0; j < length; j++) {
        if (j !== i) {
          result[i] = junqu.baseDifference(
            result[i] || arrays[i],
            arrays[j],
            iteratee,
            comparator
          );
        }
      }
    }
    if (iteratee) {
      result = junqu.unionBy(junqu.flatten(result), iteratee);
    }
    if (comparator) {
      result = junqu.unionWith(junqu.flatten(result), comparator);
    }
    if (!iteratee && !comparator) {
      result = junqu.union(junqu.flatten(result));
    }
    return result;
  },

  // 交集，并集，差集，补集，，令人头秃
  // 这个应该都不是，但是是处理最为麻烦的，考虑[[1,2,2,3],[4,5,1]]的情况
  // 算了，这个处理过于麻烦，直接抄源码了，看源码它也有点束手无措，没有那种干净利落的处理掉
  xor: function(...arrays) {
    let arrs = arrays.map(a => (Array.isArray(a) ? a : []));
    return junqu.baseXor(arrs);
  },

  xorBy: function(...arrays) {
    let iteratee = Array.isArray(arrays[arrays.length - 1])
      ? junqu.identity
      : junqu.getIteratee(arrays.pop(), 2);
    let arrs = arrays.map(a => (Array.isArray(a) ? a : []));
    return junqu.baseXor(arrs, iteratee);
  },

  xorWith: function(...arrays) {
    let comparator =
      typeof arrays[arrays.length - 1] === "function"
        ? arrays.pop()
        : undefined;
    let arrs = arrays.map(a => (Array.isArray(a) ? a : []));
    return junqu.baseXor(arrs, junqu.identity, comparator);
  },

  zip: (...arrays) => (arrays.length ? junqu.zipWith(...arrays) : []),

  zipObject: (props = [], values = []) =>
    props.reduce((obj, key, i) => ((obj[key] = values[i]), obj), {}),

  // 这个挺有意思
  zipObjectDeep: function(props = [], values = []) {
    let result = {};
    // 粗略处理 目的是将'a.b[0].c' 转化为['a','b',0,'c']
    let propsArr = props.map(val =>
      typeof val === "string" ? val.split(/\W+/) : [val]
    );
    // parseInt 大坑
    propsArr = propsArr.map(arr =>
      arr.map(v =>
        parseInt(v, 10) || parseInt(v, 10) === 0 ? parseInt(v, 10) : v
      )
    );

    for (let i = 0; i < propsArr.length; i++) {
      let value = values[i];
      let path = propsArr[i];
      let nested = result; // 暂存结果
      for (let j = 0; j < path.length; j++) {
        let key = path[j];
        let newValue = value;
        if (j !== path.length - 1) {
          // 是否已经存在属性
          let objValue =
            nested && nested.hasOwnProperty(key) ? nested[key] : undefined;
          // 因为不能直接添加属性而不赋值，这一步是为了判断该添加值的类型
          newValue = junqu.isObject(objValue)
            ? objValue
            : typeof path[j + 1] === "number"
            ? []
            : {};
        }
        nested[key] = newValue;
        nested = nested[key]; // 指针后移，，这是这个函数中很久没弄好的(对对象的不熟悉，很多错误操作)，看了源码才知道的操作，
      }
    }
    return result;
  },

  // Array.from 竟然还有这种用法，以及...运算符的巧妙
  zipWith: function(...arrays) {
    if (!arrays.length) {
      return [];
    }
    let length = arrays.length;
    let iteratee =
      length > 1 && typeof arrays[length - 1] === "function"
        ? arrays.pop()
        : undefined;
    let maxLength = Math.max(...arrays.map(a => a.length));
    return Array.from({ length: maxLength }, (_, i) =>
      iteratee ? iteratee(...arrays.map(a => a[i])) : arrays.map(a => a[i])
    );
  },

  /*---------------------------------------Array Last----------------------------------------------------------*/

  /*-------------------------------------Collection--------------------------------------------------------------*/
  countBy: function(collection, iteratee = junqu.identity) {
    let obj = {};
    if (!collection.length) {
      return obj;
    }
    iteratee = junqu.getIteratee(iteratee, 2);
    return collection.reduce((obj, val) => {
      let valTmp = iteratee(val);
      if (obj.hasOwnProperty(valTmp)) {
        ++obj[valTmp];
      } else {
        obj[valTmp] = 1;
      }
      return obj;
    }, obj);
  },

  every: function(collection, predicate = junqu.identity) {
    let length = !collection ? 0 : collection.length;
    predicate = junqu.getIteratee(predicate, 3);
    for (let i = 0; i < length; i++) {
      if (!predicate(collection[i], i, collection)) {
        return false;
      }
    }
    return true;
  },

  filter: function(collection, predicate = junqu.identity) {
    let result = [];
    let length = !collection ? 0 : collection.length;
    // 这算是没解决的遗留的问题，在match我没有去解决，就将就的用if解决一下
    if (junqu.isRegExp(predicate)) {
      return collection;
    }
    predicate = junqu.getIteratee(predicate, 3);
    for (let i = 0; i < length; i++) {
      let val = collection[i];
      if (predicate(val, i, collection)) {
        result.push(val);
      }
    }
    return result;
  },

  find: function(collection, predicate = junqu.identity, fromIndex = 0) {
    if (!(collection && collection.length)) {
      return undefined;
    }
    predicate = junqu.getIteratee(predicate, 3);
    fromIndex =
      typeof fromIndex === "number"
        ? fromIndex < 0
          ? 0
          : Math.trunc(fromIndex)
        : 0;
    for (let i = fromIndex; i < collection.length; i++) {
      let val = collection[i];
      if (predicate(val, i, collection)) {
        return val;
      }
    }
    return undefined;
  },

  findLast: function(
    collection,
    predicate = junqu.identity,
    fromIndex = collection.length - 1
  ) {
    if (!(collection && collection.length)) {
      return undefined;
    }
    predicate = junqu.getIteratee(predicate, 3);
    fromIndex =
      typeof fromIndex === "number"
        ? fromIndex >= collection.length
          ? collection.length - 1
          : Math.trunc(fromIndex)
        : collection.length - 1;
    for (let i = fromIndex; i >= 0; i--) {
      let val = collection[i];
      if (predicate(val, i, collection)) {
        return val;
      }
    }
    return undefined;
  },

  flatMap: (collection, iteratee = junqu.identity) =>
    junqu.flatten(junqu.map(collection, iteratee)),

  flatMapDeep: (collection, iteratee = junqu.identity) =>
    junqu.flattenDeep(junqu.map(collection, iteratee)),

  flatMapDepth: (collection, iteratee = junqu.identity, depth) =>
    junqu.flattenDepth(junqu.map(collection, iteratee), depth),

  // 没有处理非类数组类型
  forEach: function(collection, iteratee = junqu.identity) {
    if (!collection) {
      return collection;
    }
    if (Object.prototype.toString.call(collection) === "[object Object]") {
      return junqu.forIn(collection, iteratee);
    }
    let arr = collection;
    iteratee = junqu.getIteratee(iteratee, 3);
    let length = arr ? arr.length : 0;
    for (let i = 0; i < length; i++) {
      if (iteratee(arr[i], i, arr) === false) {
        break;
      }
    }
    return collection;
  },

  forEachRight: function(collection, iteratee = junqu.identity) {
    if (!collection) {
      return collection;
    }
    if (Object.prototype.toString.call(collection) === "[object Object]") {
      return junqu.forInRight(collection, iteratee);
    }
    let arr = collection;
    iteratee = junqu.getIteratee(iteratee, 3);
    let length = arr ? arr.length : 0;
    for (let i = length - 1; i >= 0; i--) {
      if (iteratee(arr[i], i, arr) === false) {
        break;
      }
    }
    return collection;
  },

  groupBy: function(collection, iteratee = junqu.identity) {
    let arr = Array.isArray(collection)
      ? collection
      : junqu.isObjectLike(collection)
      ? Object.values(collection)
      : [value];
    iteratee = junqu.getIteratee(iteratee, 3);
    return arr.reduce((obj, val) => {
      let key = iteratee(val);
      return (
        obj.hasOwnProperty.call(obj, key)
          ? obj[key].push(val)
          : (obj[key] = [val]),
        obj
      );
    }, {});
  },

  includes: function(collection, value, fromIndex = 0) {
    collection = junqu.isArrayLike(collection)
      ? collection
      : Object.values(collection);
    fromIndex =
      fromIndex >= 0 ? fromIndex : Math.max(fromIndex + collection.length, 0);
    return collection.includes(value, fromIndex);
  },

  //_.invokeMap([[5, 1, 7], [3, 2, 1]], 'sort');
  // // => [[1, 5, 7], [1, 2, 3]]
  invokeMap: function(collection, path, args) {

  },

  keyBy: function(collection, iteratee = junqu.identity) {
    iteratee = junqu.getIteratee(iteratee, 3);
    return collection.reduce(
      (obj, val) => ((obj[iteratee(val)] = val), obj),
      {}
    );
  },

  map: function(collection, iteratee = junqu.identity) {
    if (!collection) {
      return [];
    }
    iteratee = junqu.getIteratee(iteratee, 2);
    let result = [];
    if (
      !junqu.isArrayLike(collection) ||
      Object.prototype.toString.call(collection) === "[object Object]"
    ) {
      junqu.forIn(collection, val => result.push(iteratee(val)));
    } else {
      for (let i = 0; i < collection.length; i++) {
        result.push(iteratee(collection[i], i, collection));
      }
    }
    return result;
  },

  orderBy: function (collection, iteratees=junqu.identity, orders) {
    let coll = Array.isArray(collection) ? collection : Array.from(collection)
    let iters = junqu.flatten([iteratees]).map(t=>junqu.getIteratee(t, 2))
    orders = !orders ? undefined : (Array.isArray(orders) ? orders : [...orders])
    return coll.sort((a,b)=>{
      return iters.reduce((acc, iter, i)=>{
        if (acc === 0) {
          const [a1, a2] = orders&&orders[i]=== 'desc'?[iter(b),iter(a)]:[iter(a),iter(b)]
          acc = a1 > a2 ? 1 : (a1 < a2 ? -1 : 0)
        }
        return acc
      },0)
    })
  },
  
  partition: function(collection, predicate = junqu.identity) {
    predicate = junqu.getIteratee(predicate, 2);
    let result = [[], []];
    let truely = result[0];
    let falsely = result[1];
    if (!(collection && collection.length)) {
      return result;
    }
    for (let val of collection) {
      if (predicate(val)) {
        truely.push(val);
      } else {
        falsely.push(val);
      }
    }
    return result;
  },

  reduce: function(collection, iteratee = junqu.identity, accumulator) {
    if (!(collection && junqu.isObject(collection))) {
      return undefined;
    }
    iteratee = junqu.getIteratee(iteratee, 2);
    // 这个状态调整时看源码才加的，巧妙的
    let accStatus = arguments.length >= 3;
    if (junqu.isArrayLike(collection)) {
      let arr = collection;
      let i = 0;
      accumulator = accStatus || !arr.length ? accumulator : arr[i++];
      for (; i < arr.length; i++) {
        accumulator = iteratee(accumulator, arr[i], i, collection);
      }
    } else {
      junqu.forIn(collection, function(val, index, collection) {
        accumulator = accStatus
          ? iteratee(accumulator, val, index, collection)
          : ((accStatus = true), val);
      });
    }
    return accumulator;
  },

  reduceRight: function(collection, iteratee = junqu.identity, accumulator) {
    if (!(collection && junqu.isObject(collection))) {
      return undefined;
    }
    iteratee = junqu.getIteratee(iteratee, 4);
    let accStatus = arguments.length >= 3;
    if (junqu.isArrayLike(collection)) {
      let arr = collection;
      let i = arr.length - 1;
      accumulator = accStatus || !arr.length ? accumulator : arr[i--];
      for (; i >= 0; i--) {
        accumulator = iteratee(accumulator, arr[i], i, collection);
      }
    } else {
      junqu.forInRight(collection, function(val, index, collection) {
        accumulator = accStatus
          ? iteratee(accumulator, val, index, collection)
          : ((accStatus = true), val);
      });
    }
    return accumulator;
  },

  reject: function(collection, predicate = junqu.identity) {
    let result = [];
    let length = !collection ? 0 : collection.length;
    predicate = junqu.getIteratee(predicate, 3);
    for (let i = 0; i < length; i++) {
      let val = collection[i];
      if (!predicate(val, i, collection)) {
        result.push(val);
      }
    }
    return result;
  },

  sample: function(collection) {
    let arr;
    if (!junqu.isArrayLike(collection)) {
      arr = Object.values(collection);
    } else {
      arr = collection;
    }
    return arr && arr.length
      ? arr[~~((Math.random() * 100) % arr.length)]
      : undefined;
  },

  sampleSize: function(collection, n = 1) {
    if (!collection || n < 1) {
      return [];
    }
    let arr = junqu.isArrayLike(collection)
      ? collection
      : Object.values(Object(collection));
    let len = arr.length;
    while (len) {
      const i = Math.floor(Math.random() * len--);
      [arr[len], arr[i]] = [arr[i], arr[len]];
    }
    return arr.slice(0, n);
  },

  // 这几个随机的代码都来自30s，数学太差想不出
  shuffle: function(collection) {
    if (!collection) {
      return [];
    }
    let arr = junqu.isArrayLike(collection)
      ? collection
      : Object.values(Object(collection));
    let len = arr.length;
    while (len) {
      const i = Math.floor(Math.random() * len--);
      [arr[len], arr[i]] = [arr[i], arr[len]];
    }
    return arr;
  },

  size: function(collection) {
    if (!collection) {
      return 0;
    }
    // 某些特殊字符的长度可能不一样例如'𠮷𠮷' ，这里代码来自阮老师
    if (typeof collection === "string") {
      let re = collection.match(/[\s\S]/gu);
      return re ? re.length : 0;
    }
    if (junqu.isObjectLike(collection)) {
      return Object.keys(collection).length;
    }
    if (junqu.isMap(collection) || junqu.isSet(collection)) {
      return collection.size;
    }
    if (junqu.isArrayLike(collection)) {
      return collection.length;
    }
    return collection.length;
  },

  some: function(collection, predicate = junqu.identity) {
    let length = !collection ? 0 : collection.length;
    predicate = junqu.getIteratee(predicate, 3);
    for (let i = 0; i < length; i++) {
      if (predicate(collection[i], i, collection)) {
        return true;
      }
    }
    return false;
  },

  sortBy: function(collection, iteratees = junqu.identity) {
    if (!collection) {
      return [];
    }
    return junqu.orderBy(collection, iteratees, 'asc')
  },

  /*-------------------------------------Collection Last--------------------------------------------------------------*/

  /*----------------------------------Date----------------------------------------------------*/
  now: () => Date.now(),
  /*----------------------------------Date Last----------------------------------------------------*/

  /*----------------------------------Function----------------------------------------------------*/

  after: function() {},

  /*----------------------------------Function Last----------------------------------------------------*/

  /*-------------------------------Lang--------------------------------------------------------*/

  castArray: function() {
    if (!arguments.length) {
      return [];
    }
    let val = arguments[0];
    return Array.isArray(val) ? val : [val];
  },

  eq: function(value, other) {
    return value === other || (Number.isNaN(value) && Number.isNaN(other));
  },

  gt: function(value, other) {
    if (!(typeof value === "string" && typeof other === "string")) {
      value = parseInt(value);
      other = parseInt(other);
    }
    return value > other;
  },

  gte: function(value, other) {
    if (!(typeof value === "string" && typeof other === "string")) {
      value = parseInt(value);
      other = parseInt(other);
    }
    return value >= other;
  },

  // 后一段的判断函数是只针对IE9以下的判断。在严格模式下，第5版 ECMAScript (ES5) 禁止使用 arguments.callee()
  isArguments: function(value) {
    return (
      (junqu.isObject(value) &&
        Object.prototype.toString.call(value) === "[object Arguments]") ||
      (function(value) {
        return (
          Object.hasOwnProperty.call(value, "callee") &&
          !Object.propertyIsEnumerable.call(value, "callee")
        );
      })(value)
    );
  },

  isArray: function(value) {
    return Array.isArray
      ? Array.isArray(value)
      : Object.prototype.toString.call(value) === "[object Array]";
  },

  // lodash对node方面处理更多
  isArrayBuffer: function(value) {
    return Object.prototype.toString.call(value) === "[object ArrayBuffer]";
  },

  isArrayLike: value =>
    value !== null && typeof value[Symbol.iterator] === "function",

  isArrayLikeObject: function(value) {
    return junqu.isArrayLike(value) && junqu.isObjectLike(value);
  },

  isBoolean: function(value) {
    return (
      typeof value === "boolean" ||
      value === true ||
      value === false ||
      (junqu.isObjectLike(value) &&
        Object.prototype.toString.call(value) === "[object Boolean]")
    );
  },

  isBuffer: function(value) {
    return Buffer.isBuffer(value);
  },

  isDate: function(value) {
    return (
      junqu.isObjectLike(value) &&
      Object.prototype.toString.call(value) === "[object Date]"
    );
  },

  isElement: function(value) {
    return (
      junqu.isObjectLike(value) &&
      value.nodeType === 1 &&
      !junqu.isPlainObject(value)
    );
  },

  // Checks if value is an empty object, collection, map, or set.
  isEmpty: function(value) {
    if (value === null) return true;

    // 这一段估计来自Lodash的修补，于是我也加上了
    if (
      junqu.isArrayLike(value) &&
      (junqu.isArray(value) ||
        typeof value == "string" ||
        typeof value.splice == "function" ||
        junqu.isBuffer(value) ||
        junqu.isTypedArray(value) ||
        junqu.isArguments(value))
    ) {
      return !value.length;
    }
    // 判断属性
    if (junqu.isPrototype(value)) {
      for (let key in value) {
        if (Object.hasOwnProperty.call(value, key) && key !== "constructor") {
          return false;
        }
      }
    }
    // 判断Set和Map
    if (
      Object.prototype.toString.call(value) === "[object Set]" ||
      Object.prototype.toString.call(value) === "[object Map]"
    ) {
      return !value.size;
    }
    // 对象判断
    for (let key in value) {
      if (Object.hasOwnProperty.call(value, key)) {
        return false;
      }
    }
    return true;
  },

  // 最后判断是Error对象为数不多的两个属性，具体可查MDN关于Error对象介绍页面
  isError: function(value) {
    if (!junqu.isObjectLike(value)) {
      return false;
    }
    return (
      Object.prototype.toString.call(value) === "[object Error]" ||
      Object.prototype.toString.call(value) === "[object DOMException]" ||
      (typeof value.message === "string" &&
        typeof value.name === "string" &&
        !junqu.isPlainObject(value))
    );
  },

  // 判断他是不是可数的，与isNaN情况太类似了
  isFinite: function(value) {
    return typeof value === "number" && Number.isFinite(value);
  },

  isFunction: function(value) {
    return typeof value === "function";
  },

  // 基于Number.isInteger()
  isInteger: function(value) {
    return junqu.isFinite(value) && value === Math.floor(value);
  },

  // 安全的，属于自然数的
  isLength: function(value) {
    return (
      typeof value === "number" &&
      value % 1 === 0 &&
      value >= 0 &&
      value <= Number.MAX_SAFE_INTEGER
    );
  },

  /*
   * 全局自带的isNaN坑点：先用ToNumber转换，ToNumber对于非数字字符串返回NaN
   * Number.isNAN 缺陷 Number.isNAN（new Number(NaN)）,虽然这种NaN很奇怪
   * lodah修复了，加个Number判断，后面+号的原因是把Number类型进行转换
   *
   * */
  isNaN: function(value) {
    // 这里必须用==而不用===，原因在lodash源码有特别的解释
    return junqu.isNumber(value) && value != +value;
  },

  isMap: function(value) {
    return (
      junqu.isObjectLike(value) &&
      Object.prototype.toString.call(value) === "[object Map]"
    );
  },

  isMatch: function isMatch(object, source) {
    if (object === source) {
      return true;
    }
    // 这里并没有修复那些存在的问题，比如数组对比，但是过测试，，
    for (let key of Object.keys(source)) {
      if (object.hasOwnProperty(key)) {
        if (
          typeof object[key] === "object" &&
          typeof source[key] === "object"
        ) {
          isMatch(object[key], source[key]);
        } else {
          if (object[key] !== source[key]) {
            return false;
          }
        }
      } else {
        return false;
      }
    }
    return true;
  },

  isMatchWith: function(object, source, customizer) {
    customizer = typeof customizer === "function" ? customizer : undefined;
    // 这里采用==不用全等
    return Object.keys(source).every(key =>
      object.hasOwnProperty(key) && customizer
        ? customizer(object[key], source[key], key, object, source)
        : object[key] == source[key]
    );
  },

  isNil: function(value) {
    return value === null || value === undefined;
  },

  isNull: function(value) {
    return value === null;
  },

  // 加上原型判断是为了判断new Number()创建的对象，前部分仅仅可以判断基本的number类型
  isNumber: function(value) {
    return (
      typeof value === "number" ||
      (junqu.isObjectLike(value) &&
        Object.prototype.toString.call(value) === "[object Number]")
    );
  },

  /*
   * Uses the Object constructor to create an object wrapper for the given value.
   * If the value is null or undefined, create and return an empty object.
   * Οtherwise, return an object of a type that corresponds to the given value.
   * */
  isObject: value => value === Object(value),

  isObjectLike: value => value !== null && typeof value === "object",

  // 使用原生Object构造器(constructor)构建的对象
  isPlainObject: function(value) {
    return (
      (junqu.isObjectLike(value) && value.constructor === Object) ||
      (junqu.isObjectLike(value) && Object.getPrototypeOf(value) === null)
    );
  },

  // Checks if `value` is likely a prototype object.
  // 该函数的目的我目前不是很懂，本段代码均来自源码
  isPrototype: function(value) {
    let constructor = value && value.constructor; // 竟然需要的是falsely
    let proto =
      (typeof constructor === "function" && constructor.prototype) ||
      Object.prototype; // 这一段也不懂它的意义
    return value === proto;
  },

  isRegExp: function(value) {
    return (
      junqu.isObjectLike(value) &&
      Object.prototype.toString.call(value) === "[object RegExp]"
    );
  },

  // 直接使用 Number.isSafeInteger
  isSafeInteger: function(value) {
    return (
      Number.isInteger(value) &&
      value <= Number.MAX_SAFE_INTEGER &&
      value >= Number.MIN_SAFE_INTEGER
    );
  },

  isSet: function(value) {
    return (
      junqu.isObjectLike(value) &&
      Object.prototype.toString.call(value) === "[object Set]"
    );
  },

  // 这里它(Lodash)为什么还需要检查不是数组呢？
  isString: function(value) {
    return (
      typeof value === "string" ||
      (junqu.isObjectLike(value) &&
        Object.prototype.toString.call(value) === "[object String]")
    );
  },

  isSymbol: function(value) {
    return (
      typeof value === "symbol" ||
      (junqu.isObjectLike(value) &&
        Object.prototype.toString.call(value) === "[object Symbol]")
    );
  },

  // TypedArray是缓存数据的一种结构，具体的查询MDN。但是Lodash多了一类型Uint8ClampedArray，我也不了解，但是我也把他加上了
  isTypedArray: function(value) {
    let typedArrayTag = {};
    typedArrayTag["[object Int8Array]"] = true;
    typedArrayTag["[object Uint8Array]"] = true;
    typedArrayTag["[object Uint8ClampedArray]"] = true;
    typedArrayTag["[object Int16Array]"] = true;
    typedArrayTag["[object Uint16Array]"] = true;
    typedArrayTag["[object Int32Array]"] = true;
    typedArrayTag["[object Uint32Array]"] = true;
    typedArrayTag["[object Float32Array]"] = true;
    typedArrayTag["[object Float64Array]"] = true;
    return (
      junqu.isObjectLike(value) &&
      !!typedArrayTag[Object.prototype.toString.call(value)]
    );
  },

  isUndefined: function(value) {
    return value === undefined;
  },

  isWeakMap: function(value) {
    return (
      junqu.isObjectLike(value) &&
      Object.prototype.toString.call(value) === "[object WeakMap]"
    );
  },

  isWeakSet: function(value) {
    return (
      junqu.isObjectLike(value) &&
      Object.prototype.toString.call(value) === "[object WeakSet]"
    );
  },

  // Lodash还对不同的处理，但由于该函数没太多作用就不弄了 less than => lt
  lt: function(value, other) {
    return value < other;
  },

  lte: function(value, other) {
    return value <= other;
  },

  toArray: function(value) {
    if (!value || typeof value === 'number') return [];
    if (junqu.isArrayLike(value)) {
      return junqu.isString(value)
        ? junqu.stringToArray(value)
        : junqu.copyArray(value);
    }
    if (value[Symbol.iterator]) {
      let result = []
      for (let v of value) {
        result.push(v)
      }
      return result
    }
    if (junqu.isMap(value) || junqu.isSet(value)) {
      return [...value];
    }
    return;
  },

  toFinite: function(value) {
    if (junqu.isFinite(value)) {
      return value;
    }
  },

  // toInteger: function (value) {
  //
  // },
  //
  // toLength: function (value) {
  //
  // },
  //
  // toNumber: function (value) {
  //
  // },
  //
  // toPlainObject: function (value) {
  //
  // },
  //
  // toSafeInteger: function (value) {
  //
  // },

  mapToArray: map => [...map],

  // 把非空的字符存入数组
  stringToArray: string => string.match(/[\S]/gu),

  setToArray: set => [...set],

  copyArray: function(source, array = []) {
    for (let i = 0; i < source.length; i++) {
      array[i] = source[i];
    }
    return array;
  },

  /*---------------------------Math----------------------------------------------------------*/
  /*
   *
   * “Math” Methods
   * 这些方法在Lodash里都有判断具体可见createMathOperation方法，
   * 但是它也是一些类型判断，这次我练习的时候，会假设它符合规范的传参数
   * */

  add: (augend, addend) => augend + addend,

  // 这个函数没看懂
  ceil: function(number, precision = 0) {
    let prec = 10 ** precision;
    let num = number * prec;
    num = num % 1 ? Math.trunc(num) + 1 : Math.trunc(num);
    return num / prec;
  },

  divide: (dividend, divisor) => dividend / divisor,

  floor: function(number, precision = 0) {
    let prec = 10 ** precision;
    return Math.trunc(number * prec) / prec;
  },

  // 求出极值（最大值和最小值）
  baseExtremum: (array, iteratee, comparator) =>
    array.reduce((p, v) => (comparator(iteratee(p), iteratee(v)) ? p : v)),

  max: value =>
    value && value.length
      ? junqu.baseExtremum(value, junqu.identity, (x, y) => x > y)
      : undefined,

  maxBy: (value, iteratee = junqu.identity) => {
    iteratee = junqu.getIteratee(iteratee);
    return value && value.length
      ? junqu.baseExtremum(value, iteratee, (x, y) => x > y)
      : undefined;
  },

  mean: array => junqu.meanBy(array, junqu.identity),

  meanBy: function(array, iteratee = junqu.identity) {
    iteratee = junqu.getIteratee(iteratee);
    if (!array || !array.length) return NaN;
    return array.reduce((sum, a, i, arr) => {
      sum += iteratee(a);
      return i === arr.length - 1 ? sum / arr.length : sum;
    }, 0);
  },

  min: value =>
    value && value.length
      ? junqu.baseExtremum(value, junqu.identity, (x, y) => x < y)
      : undefined,

  minBy: (value, iteratee = junqu.identity) => {
    iteratee = junqu.getIteratee(iteratee);
    return value && value.length
      ? junqu.baseExtremum(value, iteratee, (x, y) => x < y)
      : undefined;
  },

  multiply: (multiplier, multiplicand) => multiplier * multiplicand,

  round: function(number, precision = 0) {
    let prec = 10 ** precision;
    return Math.round(number * prec) / prec;
  },

  subtract: (minuend, subtrahend) => minuend - subtrahend,

  sum: array => (array && array.length ? array.reduce((x, y) => x + y) : 0),

  sumBy: (array, iteratee = junqu.identity) => {
    iteratee = junqu.iteratee(iteratee);
    return array && array.length
      ? array.reduce((x, y) => x + iteratee(y), 0)
      : 0;
  },

  /*-----------------------------------Number---------------------------------------------------*/

  clamp: function() {},

  inRange: function() {},

  random: function() {},

  /*----------------------------Number Last--------------------------------------*/

  /*----------------------------Object--------------------------------------*/

  assign: function(obj) {},

  forIn: function(object, iteratee = junqu.identity) {
    if (!(object && junqu.isObjectLike(object))) {
      return object;
    }
    iteratee = junqu.getIteratee(iteratee, 3);
    let keys = [];
    for (let k in object) {
      // 这个判断来自源码，我不太懂
      if (
        !(
          k === "constructor" &&
          (junqu.isPrototype(object) || !Object.hasOwnProperty.call(object, k))
        )
      ) {
        keys.push(k);
      }
    }
    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];
      if (iteratee(object[key], key, object) === false) {
        break;
      }
    }
    return object;
  },

  forInRight: function(object, iteratee = junqu.identity) {
    if (!(object && junqu.isObjectLike(object))) {
      return object;
    }
    object = Object(object);
    iteratee = junqu.getIteratee(iteratee, 3);
    let keys = [];
    for (let k in object) {
      // 这个判断来自源码，我不太懂
      if (
        !(
          k === "constructor" &&
          (junqu.isPrototype(object) || !Object.hasOwnProperty.call(object, k))
        )
      ) {
        keys.push(k);
      }
    }
    for (let i = keys.length - 1; i >= 0; i--) {
      let key = keys[i];
      if (iteratee(object[key], key, object) === false) {
        break;
      }
    }
    return object;
  },

  /*----------------------------Object Last--------------------------------------*/

  /*--------------------------------------Util------------------------------------------------*/
  identity: function(value) {
    return value;
  },

  /*
   *iteratee的几种情况
   * */
  iteratee: function(value) {
    // 是函数则直接可以返回
    if (typeof value === "function") {
      return value;
    }

    // 后面的情况是Object，所以先把null处理了
    if (value === null || value === undefined) {
      return junqu.identity;
    }

    // 是Object情况的处理,进行Object的深度对比
    if (typeof value === "object") {
      return Array.isArray(value)
        ? junqu.matchesProperty(value[0], value[1])
        : junqu.matches(value);
    }

    //  以上都不是，那就是基本类型和Symbol类型，都是可以作为对象属性，转化为寻找属性的函数
    return junqu.property(value);
  },

  getIteratee: function() {
    return arguments.length
      ? junqu.iteratee(arguments[0], arguments[1])
      : junqu.identity;
  },

  property: function(value) {
    // 它只是是key，那就直接去对象里寻找
    if (
      (typeof value === "string" && !/\./.test(value)) ||
      typeof value === "number" ||
      typeof value === "boolean" ||
      junqu.isSymbol(value) ||
      value === null
    ) {
      return object => (!object ? undefined : object[value]);
    } else {
      // 遇到a[0].b.c之类取值，进行额外处理，这里lodash封装了方法_.get(),进行路径查找
      return obj => junqu.baseGet(obj, value);
    }
  },

  get: function(obj, path, defaultValue) {
    let result = junqu.baseGet(obj, path);
    return result ? result : defaultValue;
  },

  baseGet: function(obj, path) {
    if (!obj) return undefined;
    // 为了转为数组，先转String
    // 这里Lodash也有很多处理的，比如对Symbol对象，但是这里只过过简单测试
    let newPath = path.toString();
    // 转为数组
    if (!Array.isArray(path)) {
      //这里处理的非常随意，大概原理是这样。需要的就是把'a[0].b.c' 转为[ 'a', '0', 'b', 'c' ]。
      path = newPath.split(/\W+/);
    }
    let i = 0;
    for (; i < path.length && obj !== undefined && obj !== null; i++) {
      obj = obj[path[i]]; // 层层剥开
    }
    return i && i === path.length ? obj : undefined;
  },

  // lodash这里健壮很多
  // 比较source是否被object包含,没有深度比较，当key不是基本类型就无法比较
  matches: function(source) {
    return object =>
      junqu.isObjectLike(object)
        ? Object.keys(source).every(key => object[key] === source[key])
        : false;
  },

  // 根据传入的是path(String或Array)对比对象的值，例如([a,b,c], 3) 表示对比{a:{b:{c:3}}}
  matchesProperty: function(path, srcValue) {
    // 这里lodash封装了isKey,我这里是不完善的
    if (
      typeof path === "string" ||
      typeof path === "number" ||
      typeof path === "symbol" ||
      typeof path === "boolean"
    ) {
      return obj =>
        obj
          ? obj[path] === srcValue &&
            (srcValue !== undefined || path in Object(obj))
          : false;
    }
    return obj => {
      let value = junqu.get(obj, path);
      if (value === srcValue && value === undefined) {
        // 不做处理了
        return false;
      } else {
        // 没有深度对比，无法比较非基本类型
        return value === srcValue;
      }
    };
  },

  // 不处理Array的情况
  toPath: function(value) {
    if (junqu.isSymbol(value)) {
      return value;
    }
    value = typeof value === "string" ? value : value.toString();
    return value.split(/\W+/);
  }
};

/* --------------------TEST--------------------------------------测试--------------------------------------------------*/
// 便于与lodash联系
let _ = junqu;
// 替换console.log
const tap = function(x, fn = x => x) {
  console.log(fn(x));
  return x;
};

// tap(_.intersectionWith([1, 1.2, 1.5, 3, 0], [1.9, 3, 0, 3.9], (a, b) => Math.round(a) === Math.round(b)))
// tap(junqu.intersectionBy([{ 'x': 1 }], [{ 'x': 2 }, { 'x': 1 }], 'x'))
// tap(_.castArray('abc'))
// tap([[1,2],[2,3],1,2].map(value => Array.isArray(value)?value:[]))
// tap(function (value) {
//     let c = []
//     for (let key in value) {
//          c.push(key)
//     }
//     return c
// }(_).length)
// var myArray = [{ x: 1 }, { x: 2 }, { x: 3 }, { x: 1 }];
// let arr = [1, 1.2, 1.5, 3, 0]
// junqu.pullAllWith(arr, [1.9, 3, 0],(a,b)=> Math.round(a) === Math.round(b));
// tap(arr);
// tap(_.dropWhile([1,2,3,4,5], x=>x<3))
// tap(junqSu.differenceWith([1, 1.2, 1.5, 3, 0], [1.9, 3, 0], (a, b) => Math.round(a) === Math.round(b)))
// tap(_.zipObjectDeep(['a.body[0].cool','a.body[1].coll'], [1, 2]))
// tap(_.countBy(['one', 'two', 'three'], 'length'))
// tap(_.filter(["abc","def"],/ef/))
// const users = [{ name: 'fred', age: 48 }, { name: 'barney', age: 36 }, { name: 'fred', age: 40 }];

