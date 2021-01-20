/* global FB */
/* exported login */

// 儲存從sign in API得到的登入資料
var login;

// 設定 Facebook JavaScript SDK
window.fbAsyncInit = function () {
    FB.init({
        appId: "452527742389754",
        status: true,
        cookie: true,
        xfbml: true,
        version: "v8.0",
    });

    FB.AppEvents.logPageView();

    // 讓每個頁面都可以取得登入狀態和使用者資料，若在profile page且已登入則顯示會員資料到畫面
    FB.getLoginStatus(function (response) {
        if (response.status === "connected") {
            // POST facebook 存取權杖給signin API > 取得使用者資料 > 顯示到profile頁面
            let data = {
                provider: "facebook",
                access_token: response.authResponse.accessToken, //存取權杖
            };

            document.querySelector(".loading").style.display = "block";

            fetch("https://api.appworks-school.tw/api/1.0//user/signin", {
                method: "POST",
                body: JSON.stringify(data),
                headers: new Headers({
                    "Content-Type": "application/json",
                }),
            })
                .then((res) => res.json())
                .then((result) => {
                    login = result;
                    if (window.location.href.includes("profile")) {
                        showProfile(result.data.user);
                    }
                    document.querySelector(".loading").style.display = "none";
                });
        } else if (
            response.status !== "connected" &&
            window.location.href.includes("profile")
        ) {
            document.querySelector(".loading").style.display = "block";
            window.location.href = "./index.html";
        }
    });

    // 註冊點擊會員按鈕時的事件處理器
    document.querySelectorAll(".member").forEach((memberBtn) =>
        memberBtn.addEventListener("click", () => {
            checkLoginState();
        })
    );
};

(function (d, s, id) {
    var js,
        fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {
        return;
    }
    js = d.createElement(s);
    js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
})(document, "script", "facebook-jssdk");

// 顯示會員資料
function showProfile(user) {
    document.getElementById("profile-picture").src = user.picture;
    document.getElementById("profile-name").textContent = user.name;
    document.getElementById("profile-email").textContent = user.email;
}

// 檢查登入狀態（存取權杖），若狀態為已登入FB及stylish則跳轉到會員資料頁面，為其他狀態則進行登入
function checkLoginState() {
    FB.getLoginStatus(function (response) {
        if (response.status === "connected") {
            window.location.href = "./profile.html";
        } else {
            // 取得存取權杖
            FB.login(
                function (response) {
                    if (response.status === "connected") {
                        window.location.href = "./profile.html"; // 跳轉到會員資料頁面
                    }
                },
                {
                    scope: "email",
                    auth_type: "rerequest",
                }
            );
        }
    });
}

// 存取權杖狀態
// {
//     authResponse: {
//         accessToken: "EAAGbklNWDfoBAF89zwtYIrjGk3rvmOof4t1hK4DQkH47zuCUYt6WQHjVYM50oqgThFT6t6PK546jXNnc4tJs0Dw6p2hKgI4FAIXgMigYZC4B3J3M6c0kTQdP9iG4lkoSXMjZBf4T6MECKEjOVHA1UXOjNibzXZAtqyAgsuhjVdIaZCkTHCU4IGLKMnZBZBT3lUMoosmcfd1rYvwthqCW1klYNyxqESQ9hfNLgXXDTaUgZDZD",
//         data_access_expiration_time: 1611195048,
//         expiresIn: 6552,
//         graphDomain: "facebook",
//         signedRequest: "mrU17Js4W9p4cUeq3CeZSCNjQZm698w8MLjVvE-zCck.eyJ1c2VyX2lkIjoiMzY4ODk2MzE1NzgwNTIxNSIsImNvZGUiOiJBUUNyOU96T2hlRWg0bS1heHl1cWowLUE3S29SM3VtdlEyYkJEYlJCY2dGZDZKVllNajl4eWp5eDRnZDZYdURzWGM4U0NYcVBqZDlNTWwtODNzbTNQakItMkRvQWNiQUREYUQzdWM1OGhWQ2tsaTdpS1BjLUtwM25qMnJDUkxfUmZxekUyOUdTT09aMjRCTUdnNkRFakY5VURkaTV6UmZQbFBCdWtlekZIdUJGcnpBbEoyMWlhbmRJZXJzMXJIeVNfWVBmOWZJOEhfT3hUTzJHTUhxTzBOVE00c2lHX1BnNFFnV0lXYnRCYW1zYzV1QXJtdmtUQ2ZNTHF6US1maTY2WlF6YWZtOFdFM1NQanZwemZUWGFJZWdOZms4R3RLUERycVFBc2QwX2Z5SGlBdkJqeVFLbGhUbC1PX1ZFNE9ZMWN0SmlNR1RuU3pjNm9mQlAzVURtSmMyNTBxY3NjOGtFSjVOTGJRbDVtUXdFakt6RThUbTdQYk9ObjhSdDZ4NTRsaEEiLCJhbGdvcml0aG0iOiJITUFDLVNIQTI1NiIsImlzc3VlZF9hdCI6MTYwMzQxOTA0OH0",
//         userID: "3688963157805215"
//     }
//     status: "connected"
// }

// 使用者資料：
// {
//     email: "b2410832@yahoo.com.tw",
//     id: "3688963157805215",
//     name: "陳品琄",
//     picture: {
//         data: {
//             height: 50,
//             is_silhouette: false,
//             url: "https://platform-lookaside.fbsbx.com/platform/profilepic/?asid=3688963157805215&height=50&width=50&ext=1605949631&hash=AeRH_gg6vUGZThPKHr0",
//             width: 50
//         }
//     }
// }
