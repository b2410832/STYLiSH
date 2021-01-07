// I. 預設localStorage
// 1. 每個頁面在一開始都要可以取得當下的localStorage cart資料
// 2. 若localStorage裡沒有資料，預設為一個待填入的結構。
// 3. 購物車icon數字要顯示localStorage裡的list.length

let cart;

// 取得並拿出localStorage裡的cart資料，若還沒有資料，給定一個預設的cart物件再拿出
function getLocalStorage() {
    const cartItem = localStorage.getItem("cart");
    if (!cartItem) {
        const initCart = {
            list: [],
            subtotal: 0,
            freight: 60,
            total: 0,
        };
        localStorage.setItem("cart", JSON.stringify(initCart));
    }
    cart = JSON.parse(cartItem); // Object
}

// 將cart的list長度顯示在購物車icon上
function showCartQuantity() {
    const cartQuantity = document.querySelectorAll(".cart .quantity"); // NodeList
    for (let i = 0; i < cartQuantity.length; i++) {
        cart
            ? (cartQuantity[i].textContent = cart.list.length)
            : (cartQuantity[i].textContent = 0);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    getLocalStorage();
    showCartQuantity();
});
