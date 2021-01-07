/*global FB*/

// 登出事件處理器
document.getElementById("signout").addEventListener("click", () => {
    FB.logout();
    window.location.href = "./index.html";
});
