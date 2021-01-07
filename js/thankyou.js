// 1.從url取得訂單編號 > 2.顯示訂單編號 > 3.清空localStorage > 4.顯示購物車數量為0
document.addEventListener("DOMContentLoaded", () => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const number = urlParams.get("number");
    document.getElementById("order-number").textContent = number;

    localStorage.removeItem("cart");
    document
        .querySelectorAll(".cart .quantity")
        .forEach((cart) => (cart.textContent = 0));
});
