/*global getIndexOf, fetchData*/

let tagParam = null; // 產品類別 <a href="./index.html?tag=category">
let keywordParam = null; // 搜尋的輸入值 <form action="./index.html" method="GET"><input name="keyword"></form>
let products = null; // GET請求回傳的產品資訊

// 1.DOM樹建立完後取得URL query string資訊 > 2.顯示keyvisual > 3.依照query參數顯示對應的產品 > 4.infinite scroll
document.addEventListener("DOMContentLoaded", () => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const tag = urlParams.get("tag");
    const keyword = urlParams.get("keyword");
    const paging = 0; // 初始化頁面為第0頁

    getKeyvisual();

    if (tag === null && keyword === null) {
        tagParam = "all"; // 首頁tag=null
        getProducts(tagParam, keyword, paging);
    } else if (tag === "women") {
        tagParam = tag;
        getProducts(tagParam, keyword, paging);
        showCurrentLink(tagParam);
    } else if (tag === "men") {
        tagParam = tag;
        getProducts(tagParam, keyword, paging);
        showCurrentLink(tagParam);
    } else if (tag === "accessories") {
        tagParam = tag;
        getProducts(tagParam, keyword, paging);
        showCurrentLink(tagParam);
    } else {
        tagParam = "search";
        keywordParam = keyword;
        getProducts(tagParam, keyword, paging);
    }

    window.addEventListener("scroll", handleScrollToBottom);
});

// 顯示當下類別連結為current樣式
function showCurrentLink(tag) {
    const navLinks = document.querySelectorAll(`.${tag}`);
    for (let i = 0; i < navLinks.length; i++) {
        navLinks[i].classList.add("current");
    }
}

// 使用者滑到視窗底部時，若有下一頁，則顯示下一頁的產品
function handleScrollToBottom() {
    if (products) {
        const documentRelativeBottom = document.documentElement.getBoundingClientRect()
            .bottom; // 文件的底部相較於視窗頂端的距離
        const windowHeight = document.documentElement.clientHeight; // 視窗的高度
        const reachBottom = documentRelativeBottom < windowHeight + 5; // 文件底部和視窗底部的距離
        if (products.next_paging && reachBottom) {
            document.querySelector(".next-paging").style.display = "block"; // 顯示next paging loading動畫
            getProducts(tagParam, keywordParam, products.next_paging); // 顯示下一頁的產品
            products = null; // 避免infinite scroll觸發多次
        }
    }
}

/* =============================================
                Keyvisual
============================================= */
let visualsLength; // 回傳的圖片數量
let index; // 當下圖片和圓點的index

// 1.取得主視覺的資料 > 2.顯示主視覺
function getKeyvisual() {
    document.querySelector(".loading").style.display = "block"; // 顯示loading動畫
    fetchData(
        `https://api.appworks-school.tw/api/1.0/marketing/campaigns`,
        (response) => {
            showKeyvisual(response.data);
            visualsLength = response.data.length;
            document.querySelector(".loading").style.display = "none"; // 結束loading動畫
        }
    );
}

// 1.顯示所有主視覺、圓點 > 2.顯示第一張圖片和圓點樣式為current樣式 > 3.開始自動輪播
/*  <a href="" class="visual current">
        <div class="wording">
            於是<br />我也想要給你<br />一個那麼美好的自己。<br />不朽《與自己和好如初》
        </div>
    </a>
    <div class="steps">
        <div class="circle current"></div>
        <div class="circle"></div>
        <div class="circle"></div>
    </div>  */
function showKeyvisual(data) {
    const keyvisual = document.querySelector(".keyvisual");
    data.map((visualData) => {
        // 活動圖片
        const visual = document.createElement("a");
        visual.className = "visual";
        visual.style.backgroundImage = `url(${visualData.picture})`;
        visual.href = `./product.html?id=${visualData.product_id}`;
        keyvisual.appendChild(visual);

        // 活動文字
        const wording = document.createElement("div");
        wording.className = "wording";
        wording.innerHTML = visualData.story.replace(/\n/g, "<br/>");
        visual.appendChild(wording);
    });

    // 圓點點
    const steps = document.createElement("div");
    steps.className = "steps";
    keyvisual.appendChild(steps);
    for (let i = 0; i < data.length; i++) {
        const circle = document.createElement("div");
        circle.className = "circle";
        steps.appendChild(circle);
    }

    // 剛開始顯示第一張圖片和圓點點
    index = 0;
    showCurrentVisualDot(index);

    // 開始自動輪播
    autoChangeVisual();

    const visuals = document.querySelectorAll(".visual");
    const circles = document.querySelectorAll(".circle");
    // 點擊圓圈時，顯示對應圖片
    circles.forEach((circle) =>
        circle.addEventListener("click", (e) => clickChangeVisual(e))
    );
    // onmouseover移入圖片時，停止輪播
    visuals.forEach((visual) =>
        visual.addEventListener("mouseover", stopChangeVisual)
    );
    // onmouseout移出圖片時，繼續輪播
    visuals.forEach((visual) =>
        visual.addEventListener("mouseout", autoChangeVisual)
    );
}

// 顯示當下圖片和圓點為current樣式
function showCurrentVisualDot(currentIndex) {
    const visualsLength = document.querySelectorAll(".visual");
    const circles = document.querySelectorAll(".circle");
    for (let i = 0; i < circles.length; i++) {
        circles[i].classList.remove("current");
        visualsLength[i].classList.remove("current");
    }
    visualsLength[currentIndex].classList.add("current");
    circles[currentIndex].classList.add("current");
}

// 點擊圓圈時，讓圓圈和對應index的圖片顯示
function clickChangeVisual(event) {
    const targetCircleIndex = getIndexOf(
        event.target,
        document.querySelectorAll(".circle")
    ); // 取得點到的圓圈的index
    showCurrentVisualDot(targetCircleIndex);
    index = targetCircleIndex;
}

let visualTimer; // 儲存定時器的ID

// 每五秒自動往下輪播圖片及顯示對應的圓圈
function autoChangeVisual() {
    visualTimer = setInterval(function () {
        // 如果還沒到最後一張照片就跑下一張圖片；已經到最後一張則顯示第一張
        if (index < visualsLength - 1) {
            showCurrentVisualDot(index + 1);
            index++;
        } else {
            index = 0;
            showCurrentVisualDot(index);
        }
    }, 5000);
}

// 清除定時器
function stopChangeVisual() {
    clearInterval(visualTimer);
}

/* =============================================
                Products
============================================= */

// 1.根據類別、關鍵字和頁數取得產品資料 > 2.顯示產品
function getProducts(category, keywords, page) {
    fetchData(
        `https://api.appworks-school.tw/api/1.0/products/${category}?keyword=${keywords}&paging=${page}`,
        (response) => {
            products = response;
            showProducts(response.data);
        }
    );
}

// 顯示回傳的所有產品
/*  <a class="product" href="">
    <img src="./images/product.jpg" alt="">
    <div class="product-colors">
        <div class="color" style="background-color: #979797;"></div>
    </div>
    <div class="product-title">前開衩扭結洋裝</div>
    <div class="product-price">TWD.799</div>
    </a>   */
function showProducts(data) {
    const productsGroup = document.querySelector(".products");
    if (data.length < 1) {
        productsGroup.innerHTML = `很抱歉，目前沒有符合「${keywordParam}」的產品。`;
        productsGroup.style.padding = "10px 10px 200px";
    } else {
        data.map((productData) => {
            // 產品卡片
            const product = document.createElement("a");
            product.href = `./product.html?id=${productData.id}`;
            product.className = "product";
            productsGroup.appendChild(product);

            // 產品圖片
            const productImg = document.createElement("img");
            productImg.src = productData.main_image;
            productImg.alt = productData.title;
            product.appendChild(productImg);

            // 產品顏色
            const productColors = document.createElement("div");
            productColors.className = "product-colors";
            productData.colors.map((colorCode) => {
                const color = document.createElement("div");
                color.className = "color";
                color.style.backgroundColor = `#${colorCode.code}`;
                productColors.appendChild(color);
            });
            product.appendChild(productColors);

            // 產品名稱
            const productTitle = document.createElement("div");
            productTitle.className = "product-title";
            productTitle.textContent = productData.title;
            product.appendChild(productTitle);

            // 產品價格
            const productPrice = document.createElement("div");
            productPrice.className = "product-price";
            productPrice.textContent = `TWD.${productData.price}`;
            product.appendChild(productPrice);
        });
        document.querySelector(".next-paging").style.display = "none"; // 結束next paging loading
    }
}
