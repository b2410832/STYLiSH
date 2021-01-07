/*global getLocalStorage, getIndexOf, cart, showCartQuantity, TPDirect, login*/

/* =============================================
             Cart Detail
============================================= */

// 1.DOM樹建立完後，取得localStorage資料 > 2.依照資料顯示產品於購物車
document.addEventListener("DOMContentLoaded", () => {
    getLocalStorage();
    showCartList();

    // 確認結帳
    document
        .getElementById("checkout")
        .addEventListener("click", (event) => handleClickCheckout(event));
});

// 顯示購物車資料
/* <div class="row">
    <div class="summary">
        <div class="mainImg">
            <img src="./images/shoppingcart-item.jpg" alt="">
        </div>
        <div class="details">
            前開衩扭結洋裝<br/>
            201807201824<br/><br/>
            顏色：白色<br/>
            尺寸：S
        </div>
    </div>
    <div class="qty">
        <select>
            <option value="1">1</option>
            <option value="2">2</option>
        </select>
    </div>
    <div class="price">NT. 799</div>
    <div class="subtotal">NT. 799</div>
    <div class="remove-item">
        <img src="./images/cart-remove.png" alt="">
    </div>
</div>  */
function showCartList() {
    if (cart.list.length > 0) {
        const itemList = document.querySelector(".item-list");
        for (let i = 0; i < cart.list.length; i++) {
            const row = document.createElement("div");
            row.className = "row";
            itemList.appendChild(row);
            const summary = document.createElement("div");
            summary.className = "summary";
            row.appendChild(summary);
            // 產品圖片
            const mainImg = document.createElement("div");
            mainImg.className = "mainImg";
            summary.appendChild(mainImg);
            const img = document.createElement("img");
            img.src = cart.list[i].main_image;
            img.alt = cart.list[i].name;
            mainImg.appendChild(img);
            // 產品細節
            const details = document.createElement("div");
            details.className = "details";
            details.innerHTML = `${cart.list[i].name}<br/>${cart.list[i].id}<br/><br/>顏色：${cart.list[i].color.name}<br/>尺寸：${cart.list[i].size}`;
            summary.appendChild(details);
            // 數量
            const qty = document.createElement("div");
            qty.className = "qty";
            row.appendChild(qty);
            const select = document.createElement("select");
            qty.appendChild(select);
            for (let s = 1; s < cart.list[i].stock + 1; s++) {
                const option = document.createElement("option");
                option.textContent = s;
                option.setAttribute("value", s);
                select.appendChild(option);
            }
            select.value = cart.list[i].qty; // 選單顯示localStorage儲存的數量
            // 單價
            const price = document.createElement("div");
            price.className = "price";
            price.textContent = `NT. ${cart.list[i].price}`;
            row.appendChild(price);
            // 小計
            const subtotal = document.createElement("div");
            subtotal.className = "subtotal";
            subtotal.textContent = `NT. ${
                cart.list[i].price * cart.list[i].qty
            }`;
            row.appendChild(subtotal);
            // 垃圾桶
            const remove = document.createElement("div");
            remove.className = "remove-item";
            row.appendChild(remove);
            const removeImg = document.createElement("img");
            removeImg.src = "./images/cart-remove.png";
            removeImg.alt = "remove";
            remove.appendChild(removeImg);
        }

        // 註冊選單改變數量時的事件監聽器
        const select = document.querySelectorAll("select");
        for (let i = 0; i < select.length; i++) {
            select[i].addEventListener("change", (e) => handleQtyChange(e));
        }

        // 註冊垃圾桶點擊時的事件監聽器
        const remove = document.querySelectorAll(".item-list .remove-item");
        for (let i = 0; i < remove.length; i++) {
            remove[i].addEventListener("click", (e) => handleRemoveProduct(e));
        }
    } else {
        document.querySelector(".item-list").innerHTML =
            "<h4>購物車裡空空的耶</h4>";
        document
            .querySelector(".confirm .pay button")
            .setAttribute("disabled", true);
    }

    showConfirmPrice();
}

// 顯示localStorage的總金額、運費、應付金額
function showConfirmPrice() {
    document.querySelector(".confirm .subtotal .number").textContent =
        cart.subtotal;
    document.querySelector(".confirm .shipping .number").textContent =
        cart.freight;
    document.querySelector(".confirm .total .number").textContent = cart.total;
}

function handleQtyChange(event) {
    // 取得點擊到的數量 > 找到點擊的產品index > 更新cart.list中同index的產品的數量
    const newQty = event.target.value; // <option value="1">1</option>
    const targetProductIndex = getIndexOf(
        event.target.parentNode.parentNode,
        document.querySelectorAll(".item-list .row")
    );
    cart.list[targetProductIndex].qty = newQty;

    // 將新的cart資料放回localStorage
    restoreLocalStorage(cart.list);

    // 取得新的localStorage資料 > 顯示到小計&確認金額上
    getLocalStorage();
    document.querySelectorAll(".item-list .subtotal")[
        targetProductIndex
    ].textContent = `NT. ${
        cart.list[targetProductIndex].price * cart.list[targetProductIndex].qty
    }`;
    showConfirmPrice();
}

function handleRemoveProduct(event) {
    // 找到點擊刪除的產品 > 刪除cart.list中同index的產品（filter出不是被點擊到的產品）
    const targetProductIndex = getIndexOf(
        event.target.parentNode.parentNode,
        document.querySelectorAll(".item-list .row")
    );
    let newCartList = cart.list.filter(
        (item, index) => targetProductIndex !== index
    );
    alert("已從購物車中清除");

    // 將新的cart資料放回localStorage
    restoreLocalStorage(newCartList);

    // 清除購物車清單畫面 > 取得新的localStorage資料 > 顯示到購物車清單&確認金額&購物車icon上
    document.querySelector(".item-list").innerHTML = "";
    getLocalStorage();
    showCartList();
    showCartQuantity();
}

// 將新的cart資料放回localStorage
function restoreLocalStorage(cartList) {
    let subTotal = cartList.reduce(
        (acc, listItem) => (acc += listItem.price * listItem.qty),
        0
    );
    let newCart = {
        list: cartList,
        subtotal: subTotal,
        freight: 60,
        total: subTotal + cart.freight,
    };
    localStorage.setItem("cart", JSON.stringify(newCart));
}

/* =============================================
                Checkout
============================================= */

function handleClickCheckout(e) {
    const recipientName = document.getElementById("recipient-name").value;
    const recipientEmail = document.getElementById("recipient-email").value;
    const recipientPhone = document.getElementById("recipient-phone").value;
    const recipientAddress = document.getElementById("recipient-address").value;
    // 如果input是空白或格式不正確，彈出警示窗
    if (isInputBlank(recipientName)) {
        alert("請輸入正確的收件人姓名");
    } else if (isInputBlank(recipientEmail) || !emailIsValid(recipientEmail)) {
        alert("請輸入正確的Email");
    } else if (isInputBlank(recipientPhone) || !phoneIsValid(recipientPhone)) {
        alert("請輸入正確的手機號碼");
    } else if (isInputBlank(recipientAddress)) {
        alert("請輸入正確的收件地址");
    } else {
        onSubmit(e); // 取得TapPay prime字串
    }
}

// 檢查表格input是否為空白
function isInputBlank(value) {
    return value.trim().length === 0;
}

// 檢查email格式是否正確
function emailIsValid(email) {
    // RFC email validation
    return /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.test(
        email
    );
}

// 檢查phone格式是否正確
function phoneIsValid(phone) {
    return /^09\d{8}$/.test(phone);
}

// 設定TapPay欄位外觀
let fields = {
    number: {
        element: document.getElementById("card-number"),
        placeholder: "**** **** **** ****",
    },
    expirationDate: {
        element: document.getElementById("card-expiration-date"),
        placeholder: "MM / YY",
    },
    ccv: {
        element: document.getElementById("card-ccv"),
        placeholder: "ccv",
    },
};

TPDirect.card.setup({
    fields: fields,
    styles: {
        input: {
            color: "black",
        },
    },
});

function onSubmit(event) {
    event.preventDefault();
    // 取得 TapPay Fields 的 status
    const tappayStatus = TPDirect.card.getTappayFieldsStatus();
    // 確認是否可以 getPrime
    if (tappayStatus.canGetPrime === false) {
        alert("信用卡資訊填寫錯誤");
        return;
    }
    // 取得TapPay的prime字串
    TPDirect.card.getPrime((result) => {
        // failed
        if (result.status !== 0) {
            alert("get prime error " + result.msg);
            return;
        }
        // success
        let data = {
            prime: result.card.prime, // TapPay
            order: {
                shipping: "delivery",
                payment: "credit_card",
                subtotal: cart.subtotal,
                freight: cart.freight,
                total: cart.total,
                recipient: {
                    name: document.getElementById("recipient-name").value,
                    phone: document.getElementById("recipient-phone").value,
                    email: document.getElementById("recipient-email").value,
                    address: document.getElementById("recipient-address").value,
                    time: document.querySelector(
                        "input[name='delivery-time']:checked"
                    ).value,
                },
                list: cart.list.map((product) => {
                    return {
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        color: product.color,
                        size: product.size,
                        qty: product.qty,
                    };
                }),
            },
        };

        document.querySelector(".loading").style.display = "block"; // 顯示loading動畫

        // 1.POST訂單資料到checkout API > 2.取得訂單編號 > 3.放到url query string > 4.跳轉到thank you頁面
        fetch("https://api.appworks-school.tw/api/1.0/order/checkout", {
            method: "POST",
            body: JSON.stringify(data),
            headers: new Headers({
                "Content-Type": "application/json",
                Authorization: login ? login.data.acess_token : null,
            }),
        })
            .then((res) => res.json())
            .then(
                (result) =>
                    (window.location.href = `./thankyou.html?number=${result.data.number}`)
            )
            .catch((error) => console.error("Error:", error));
    });
}
