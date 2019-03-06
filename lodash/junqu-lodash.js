var junqu = {
  /*--------------------------------------Array------------------------------------------------------*/
  chunk: function(array, size = 1) {
    if (size < 1) return array;
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

  compact: array => array.filter(arr=>Boolean(arr)) ,

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

  baseDifference: function(array, values, iteratee, comparator) {
    let valSet;
    if (!comparator) {
      valSet = new Set(values.map(iteratee));
    }
    return array.filter(arr => comparator ? values.findIndex(val => comparator(arr, val)) === -1 : !valSet.has(iteratee(arr)));
  },

  difference: (array, ...values) => !array || !array.length ? [] : junqu.baseDifference(array, junqu.flatten(values), junqu.identity),

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

  drop: (array, n = 1) => n <= 0 ?array:array.slice(n),

  dropRight: function(array, n = 1) {
    if (n <= 0) return array;
    if (n >= array.length) return [];
    n = Math.trunc(n);
    return array.slice(0, array.length - n);
  },

  dropRightWhile: function(array, predicate=junqu.identity){
    if (!array || !array.length) return []
    predicate = junqu.getIteratee(predicate, 3)
    for (let i = array.length - 1; i >= 0; i--) {
      if (!predicate(array[i], i, array)) { // 只需要一个为false,就把前面的元素去除
        return array.slice(0, i+1)
      }
    }
    return []
  },

  // The predicate is invoked with three arguments: (value, index, array).
  // 函数是目的是去除遇到第一个falsely值前的所有元素
  dropWhile: function (array, predicate) {
    if (!array || !array.length) return []
    predicate = junqu.getIteratee(predicate, 3)
    for (let i = 0; i < array.length; i++) {
      if (!predicate(array[i], i, array)) { // 只需要一个为false,就把前面的元素去除
        return array.slice(i)
      }
    }
    return []
  },

  fill: function(array, value, start = 0, end = array.length) {
    for (let i = start; i < end; i++) {
      array[i] = value;
    }
    return array;
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
      if (typeof pairs[i][0] === "string") {
        result[pairs[i][0]] = pairs[i][1];
      }
    }
    return result;
  },

  head: array => Array.isArray(array) && array.length ? array[0] : [],

  indexOf: function(array, value, formIndex = 0) {
    for (let i = formIndex; i < array.length; i++) {
      if (array[i] === value) {
        return i;
      }
    }
    return -1;
  },

  initial: function(array) {
    let result = [];
    for (let i = 0; i < array.length - 1; i++) {
      result.push(array[i]);
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

  lastIndexOf: function(array, value, fromIndex = array.length - 1) {
    for (let i = fromIndex; i >= 0; i--) {
      if (array[i] === value) {
        return i;
      }
    }
    return -1;
  },

  nth: function(array, n = 0) {
    if (n >= 0) {
      return array[n];
    }
    return array[array.length + n];
  },

  pull: function(array, ...values) {
    junqu.remove(array, x => values.includes(x)); // 为了结果，上面才是lodash的结果
    return array;
  },

  pullAll: function(array, values) {
    junqu.remove(array, x => values.includes(x));
    return array;
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

  reverse: function(array) {
    const length = array.length;
    for (let i = 0; i < length / 2; i++) {
      [array[i], array[length - 1 - i]] = [array[length - 1 - i], array[i]];
    }
    return array;
  },

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

  sortedIndex: function(array, value) {
    if (array.length === 0) return 0;
    let length = array.length;
    let leftDigit = 0;
    let rightDigit = length - 1;
    if (value < array[leftDigit]) {
      return 0;
    }
    if (value > array[rightDigit]) {
      return length;
    }
    while (leftDigit - rightDigit > 1) {
      let middle = Math.floor((leftDigit + rightDigit) / 2);
      if (array[middle] > value) {
        rightDigit = middle;
      } else {
        leftDigit = middle;
      }
    }
    return leftDigit;
  },

  tail: function(array) {
    return junqu.slice(array, 1);
  },

  take: function(array, n = 1) {
    return junqu.slice(array, 0, n);
  },

  takeRight: function(array, n = 1) {
    n = n > array.length ? array.length : n;
    return junqu.slice(array, array.length - n);
  },

  union: function(...arrays) {
    let array = junqu.flatten(arrays);
    return Array.from(new Set(array));
  },

  without: function(array, ...values) {
    if (!array.length) return [];
    let reuslt = [];
    for (let val of array) {
      if (!values.includes(val)) {
        reuslt.push(val);
      }
    }
    return reuslt;
  },
  /*---------------------------------------Array Last----------------------------------------------------------*/

  /*-------------------------------------Collection--------------------------------------------------------------*/
  countBy: function(collection, iteratee = junqu.identity) {},

  /*-------------------------------------Collection Last--------------------------------------------------------------*/

  /*----------------------------------Date----------------------------------------------------*/
  now: () => Date.now(),
  /*----------------------------------Date Last----------------------------------------------------*/

  /*----------------------------------Function----------------------------------------------------*/

  after: function() {},

  /*----------------------------------Function Last----------------------------------------------------*/

  /*-------------------------------Lang--------------------------------------------------------*/

  castArray: function(value) {
    return Array.isArray(value) ? value : [value];
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
    if (!value) return [];

    if (junqu.isArrayLike(value)) {
      return junqu.isString(value)
        ? junqu.stringToArray(value)
        : junqu.copyArray(value);
    }
    if (value[Symbol.iterator]) {
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
      return object => (object === null ? undefined : object[value]);
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

// tap(_.castArray('abc'))
// tap(function (value) {
//     let c = []
//     for (let key in value) {
//          c.push(key)
//     }
//     return c
// }(_).length)

// tap(_.dropWhile([1,2,3,4,5], x=>x<3))

// tap(junqSu.differenceWith([1, 1.2, 1.5, 3, 0], [1.9, 3, 0], (a, b) => Math.round(a) === Math.round(b)))