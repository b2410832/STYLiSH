/* exported fetchData, getIndexOf */

// 1.發送GET請求至url > 2.將回傳結果放入callback的參數
function fetchData(url, callback) {
    fetch(url)
        .then((response) => response.json())
        .then((result) => {
            callback(result);
        })
        .catch((err) => console.log(err));
}

// 取得某元素在NodeList的index
function getIndexOf(element, list) {
    let index;
    for (let i = 0; i < list.length; i++) {
        if (list[i] === element) {
            index = i;
        }
    }
    return index;
}
