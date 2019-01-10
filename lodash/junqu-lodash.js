var junqu = function(){
//array
  function chunk(array, size = 1) {
    if (size < 1) return array;
    let result = [[]];
    for (let i = 0; i < array.length; i++) {
        if (result[result.length - 1].length >= size){ // 假如已经填满了，就往后移动
            result.push([]);
        }
        result[result.length - 1].push(array[i]); // 进行元素分割
    }
    return result;
  }

  const compact = function(array){
    let result = [];
    for (let i = 0; i < array.length; i++) {
        if (array[i]){
             result.push(array[i]);
        }
    }
    return result;
  }
  
  return {
    chunk: chunk,
    compact: compact,
  }
}()