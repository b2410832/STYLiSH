/*global getLocalStorage, showCartQuantity, getIndexOf, fetchData*/

/* =============================================
             Product Detail
============================================= */
let quantity; // 當下的產品數量
let maxQuantity; // 此產品某顏色某尺寸的庫存
let product; // 回傳的產品細節物件

// 1.DOM樹建立完後取得URL query string資訊 > 2.依照query參數id顯示對應的產品細節
document.addEventListener("DOMContentLoaded", () => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const id = urlParams.get("id");

    getProductDetail(id);

    // 按一次"+"按鈕，數量等於最庫存上限時不動，否則數量值加1
    document.querySelector("#increment").addEventListener("click", () => {
        quantity === maxQuantity ? quantity : quantity++;
        showQty(quantity);
    });

    // 按一次"-"按鈕，數量小於1時不動，否則數量值減1
    document.querySelector("#decrement").addEventListener("click", () => {
        quantity === 1 ? quantity : quantity--;
        showQty(quantity);
    });
});

// 改變產品數量顯示值
function showQty(productQty) {
    document.querySelector(".qty-value").textContent = productQty;
}

// 1.取得產品細節的資料 > 2.顯示產品細節
function getProductDetail(productID) {
    document.querySelector(".loading").style.display = "block"; // 顯示loading動畫
    fetchData(
        `https://api.appworks-school.tw/api/1.0//products/details?id=${productID}`,
        (response) => {
            product = response.data;
            showProductDetail(response.data);
        }
    );
}

// render productList to DOM
function showProductDetail(data) {
    const colorContainer = document.querySelector(".details .colors");
    const sizeContainer = document.querySelector(".details .sizes");
    const reminder = document.querySelector(".details .reminder");
    const imagesContainer = document.querySelector(".description .images");

    // 主要圖片
    document.querySelector(".main-image img").src = `${data.main_image}`;
    document.querySelector(".main-image img").alt = `${data.title}`;
    // 產品細節
    document.querySelector(".details .name").textContent = `${data.title}`;
    document.querySelector(".details .id").textContent = `${data.id}`;
    document.querySelector(".details .price").textContent = `TWD.${data.price}`;
    // <div class="color current" style="background-color: #979797"></div>
    data.colors.map((colorData) => {
        const color = document.createElement("div");
        color.className = "color";
        color.style.backgroundColor = `#${colorData.code}`;
        color.setAttribute("data-color", `${colorData.code}`);
        colorContainer.appendChild(color);
    });
    // <div class="size current"></div>
    data.sizes.map((sizeData) => {
        const size = document.createElement("div");
        size.className = "size";
        size.textContent = `${sizeData}`;
        sizeContainer.appendChild(size);
    });
    const description = data.description.replace(/\r\n/g, "<br/>");
    reminder.innerHTML = `${data.note}<br/><br/>${data.texture}<br/>${description}<br/><br/>清洗：${data.wash}<br/>產地：${data.place}<br/>`;
    // 產品描述
    document.querySelector(".description .story").textContent = `${data.story}`;
    // 產品圖片（先跑前兩張圖片，因為後兩張是重複的）
    for (let i = 0; i < 2; i++) {
        const image = document.createElement("img");
        image.src = `${data.images[i]}`;
        image.alt = `picture${i}`;
        imagesContainer.appendChild(image);
    }
    document.querySelector(".loading").style.display = "none"; // 結束loading動畫

    // 顯示第一個有庫存的顏色尺寸
    initVariant();

    // 點擊顏色
    document
        .querySelectorAll(".color")
        .forEach((colorBtn) =>
            colorBtn.addEventListener("click", (event) =>
                handleColorChange(event)
            )
        );

    // 點擊尺寸
    document
        .querySelectorAll(".size")
        .forEach((sizeBtn) =>
            sizeBtn.addEventListener("click", (event) =>
                handleSizeChange(event)
            )
        );
}

function initVariant() {
    // 顯示初始化產品數量為1
    quantity = 1;
    showQty(quantity);
    
    let initColorIndex = 0;
    showCurrentColor(initColorIndex);
    updateSizeOf(initColorIndex);
    chageMaxQty(initColorIndex);
}

// 顏色按鈕點擊時的event handler
function handleColorChange(e) {
    const colorBtnList = document.querySelectorAll(".color"); //NodeList
    // 每次點擊新顏色時，更新產品數量為1
    quantity = 1;
    showQty(quantity);
    // 清空原有的disabled sizes
    const disabledSizes = document.querySelectorAll(".size.disabled");
    disabledSizes.forEach((disabledSize) =>
        disabledSize.classList.remove("disabled")
    );
    // 更新current color為點擊到的顏色，再根據點擊到的顏色更新尺寸的UI
    let targetColorIndex = getIndexOf(e.target, colorBtnList);
    showCurrentColor(targetColorIndex);
    updateSizeOf(targetColorIndex);
    // 根據點擊到的顏色，找到current尺寸相對的庫存量，更新到產品數量上限
    chageMaxQty(targetColorIndex);
}

// 尺寸按鈕點擊時的event handler
function handleSizeChange(e) {
    const colorBtnList = document.querySelectorAll(".color"); //NodeList
    const sizeBtnList = document.querySelectorAll(".size"); //NodeList
    // 取得觸發事件的size在sizes中的index
    let targetSizeIndex = getIndexOf(e.target, sizeBtnList);
    // 取得所有disabled的sizes
    const disabledSizes = document.querySelectorAll(".size.disabled");
    // 若disabled sizes存在，且如果觸發事件的size不是disabled的話，則設為current size。若disabledSizes不存在，將點擊到的尺寸設為current
    if (disabledSizes.length > 0) {
        disabledSizes.forEach((disabledSize) => {
            if (e.target !== disabledSize) {
                showCurrentSize(targetSizeIndex);
                // 更新產品數量為1
                quantity = 1;
                showQty(quantity);
            }
        });
    } else {
        showCurrentSize(targetSizeIndex);
        // 更新產品數量為1
        quantity = 1;
        showQty(quantity);
    }
    // 根據點擊到的尺寸，找到current顏色相對的庫存量，更新到產品數量上限
    const currentColor = document.querySelector(".color.current");
    const currentColorIndex = getIndexOf(currentColor, colorBtnList);
    chageMaxQty(currentColorIndex);
}

// 改變current顏色（只能有一個，要先清除所有人的current class）
function showCurrentColor(index) {
    const colors = document.querySelectorAll(".color"); // NodeList
    colors.forEach((color) => color.classList.remove("current"));
    colors[index].classList.add("current");
}

// 根據顏色更新尺寸顯示的UI，庫存不足1的顯示disabled，庫存足夠的顯示current
function updateSizeOf(colorIndex) {
    // 過濾出特定顏色的variants array[]
    const colorVariants = product.variants.filter(
        (variant) => variant.color_code === product.colors[colorIndex].code
    );
    // 從最後一個size開始往回跑到第一個（確保只有庫存夠的最小size會是current）
    for (let i = colorVariants.length - 1; i >= 0; i--) {
        colorVariants[i].stock < 1 ? showDisabledSize(i) : showCurrentSize(i);
    }
}

// 根據選到的顏色和尺寸找到相對的庫存量，更新產品數量上限值
function chageMaxQty(colorIndex) {
    const colorVariants = product.variants.filter(
        (variant) => variant.color_code === product.colors[colorIndex].code
    );
    const currentSize = document.querySelector(".size.current").textContent;
    for (let i = 0; i < colorVariants.length; i++) {
        if (currentSize === colorVariants[i].size) {
            maxQuantity = colorVariants[i].stock;
        }
    }
}

// 改變current尺寸(只能有一個，要先清除所有人的current class)
function showCurrentSize(index) {
    const sizes = document.querySelectorAll(".size"); // NodeList
    sizes.forEach((size) => size.classList.remove("current"));
    sizes[index].classList.add("current");
}

// 新增disabled尺寸（可以有多個）
function showDisabledSize(index) {
    const sizes = document.querySelectorAll(".size"); // NodeList
    sizes[index].classList.remove("current");
    sizes[index].classList.add("disabled");
}

/* =============================================
            Add to Cart 
============================================= */
// II. 處理購物車
// 1. 每按一次加入購物車，就要: 取得current產品資訊 > push進list裡 > 設定到localStorage
// 但如果id && color && size 三者一樣，只有數量不一樣的話，會直接更新成新的數量
// 2. alert("已加入購物車");
// 3. 購物車icon數字更新為localStorage裡的list.length
const addCartBtn = document.querySelector(".add-cart");
addCartBtn.addEventListener("click", handleAddCart);
let list = [];

function handleAddCart() {
    // 取得之前的localStorage cart資料，更新到list array（否則跳頁面之後list會重整為空陣列）
    let cart = JSON.parse(localStorage.getItem("cart"));
    list = cart.list;

    // 取得新加入的產品資料
    const colorBtnList = document.querySelectorAll(".color");
    const currentColor = document.querySelector(".color.current");
    const sizeBtnList = document.querySelectorAll(".size");
    const currentSize = document.querySelector(".size.current");
    const qtyValue = document.querySelector(".qty-value").textContent;
    const currentColorIndex = getIndexOf(currentColor, colorBtnList);
    const currentSizeIndex = getIndexOf(currentSize, sizeBtnList);
    let newItem = {
        id: product.id,
        name: product.title,
        price: product.price,
        color: product.colors[currentColorIndex],
        size: product.sizes[currentSizeIndex],
        qty: +qtyValue,
        stock: maxQuantity,
        main_image: product.main_image,
    };
    // 若新產品資料的id && color && size三者都和其中一個list舊產品資料相同，只要更新qty為新的數量; 否則將新的產品資料整個加入list
    function checkSameItem() {
        for (let i = 0; i < list.length; i++) {
            if (
                newItem.id === list[i].id &&
                newItem.color.code === list[i].color.code &&
                newItem.size === list[i].size
            ) {
                list[i].qty = newItem.qty;
                return true;
            }
        }
    }
    let isSame = checkSameItem();
    if (!isSame) {
        list.push(newItem);
    }

    // 更新新的cart資料到localStorage
    let subTotal = list.reduce(
        (acc, listItem) => (acc += listItem.price * listItem.qty),
        0
    );
    const newCart = {
        list: list,
        subtotal: subTotal,
        freight: 60,
        total: subTotal + cart.freight,
    };
    alert("已加入購物車");
    localStorage.setItem("cart", JSON.stringify(newCart));

    // 重新將list的總數量從localStorage拿出並顯示到購物車
    getLocalStorage();
    showCartQuantity();
}
