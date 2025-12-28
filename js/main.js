
function vnd(price) {
    return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
}

// Close popup 
const body = document.querySelector("body");
let modalContainer = document.querySelectorAll('.modal');
let modalBox = document.querySelectorAll('.mdl-cnt');
let formLogSign = document.querySelector('.forms');

// Click vùng ngoài sẽ tắt Popup
modalContainer.forEach(item => {
    item.addEventListener('click', closeModal);
});

modalBox.forEach(item => {
    item.addEventListener('click', function (event) {
        event.stopPropagation();
    })
});

function closeModal() {
    modalContainer.forEach(item => {
        item.classList.remove('open');
    });
    body.style.overflow = "auto";
}

// Tăng giảm số lượng
function increasingNumber(e) {
    let qty = e.parentNode.querySelector('.input-qty');
    let maxStock = parseInt(qty.getAttribute("max")); // Lấy max từ thuộc tính HTML
    let currentVal = parseInt(qty.value);

    if (currentVal < maxStock) {
        qty.value = currentVal + 1;
    } else {
        qty.value = maxStock;
        toast({ title: 'Hết hàng', message: 'Số lượng bạn chọn đã đạt mức tối đa trong kho!', type: 'warning', duration: 3000 });
    }
}

function decreasingNumber(e) {
    let qty = e.parentNode.querySelector('.input-qty');
    if (qty.value > qty.min) {
        qty.value = parseInt(qty.value) - 1;
    } else {
        qty.value = qty.min;
    }
}

// --- XỬ LÝ HIỂN THỊ CHI TIẾT SẢN PHẨM ---

function detailProduct(index) {
    let modal = document.querySelector('.modal.product-detail');
    let products = JSON.parse(localStorage.getItem('products'));
    event.preventDefault();
    let infoProduct = products.find(sp => {
        return sp.id === index;
    })

    let modalHtml = `<div class="modal-header">
    <img class="product-image" src="${infoProduct.img}" alt="">
    </div>
    <div class="modal-body">
        <h2 class="product-title">${infoProduct.title}</h2>
        <div class="product-control">
            <div class="priceBox">
                <span class="current-price">${vnd(infoProduct.price)}</span>
            </div>
            <div class="buttons_added">
                <input class="minus is-form" type="button" value="-" onclick="decreasingNumber(this)">
                <input class="input-qty" max="${infoProduct.quantity}" min="1" name="" type="number" value="1">
                <input class="plus is-form" type="button" value="+" onclick="increasingNumber(this)">
            </div>
        </div>
        <p style="margin-bottom: 10px; color: #666;">Tồn kho: <b>${infoProduct.quantity}</b> sản phẩm</p>
        <p class="product-description">${infoProduct.desc}</p>
    </div>
    <div class="notebox">
            <p class="notebox-title">Ghi chú</p>
            <textarea class="text-note" id="popup-detail-note" placeholder="Nhập thông tin cần lưu ý..."></textarea>
    </div>
    <div class="modal-footer">
        <div class="price-total">
            <span class="thanhtien">Thành tiền</span>
            <span class="price">${vnd(infoProduct.price)}</span>
        </div>
        <div class="modal-footer-control">
            <button class="button-dathangngay" data-product="${infoProduct.id}">Đặt hàng ngay</button>
            <button class="button-dat" id="add-cart" onclick="animationCart()"><i class="fa-light fa-basket-shopping"></i></button>
        </div>
    </div>`;

    document.querySelector('#product-detail-content').innerHTML = modalHtml;
    modal.classList.add('open');
    body.style.overflow = "hidden";

    // Cập nhật giá tiền khi tăng giảm 
    let tgbtn = document.querySelectorAll('.is-form');
    let qty = document.querySelector('.product-control .input-qty');
    let priceText = document.querySelector('.price');
    tgbtn.forEach(element => {
        element.addEventListener('click', () => {
            let price = infoProduct.price * parseInt(qty.value);
            priceText.innerHTML = vnd(price);
        });
    });

    // Sự kiện nút Thêm vào giỏ
    let productbtn = document.querySelector('.button-dat');
    if (productbtn) {
        productbtn.addEventListener('click', (e) => {
            addCart(infoProduct.id);
        })
    }

    // Sự kiện nút Mua ngay (Thêm kiểm tra kho)
    let orderNowBtn = document.querySelector('.button-dathangngay');
    if (orderNowBtn) {
        orderNowBtn.addEventListener('click', (e) => {
            if (localStorage.getItem('currentuser')) {
                // Kiểm tra nếu số lượng mua > tồn kho
                if(parseInt(qty.value) > infoProduct.quantity) {
                    toast({ title: 'Lỗi', message: 'Sản phẩm không đủ số lượng!', type: 'error', duration: 3000 });
                    return;
                }
                dathangngay(); // Gọi hàm bên checkout.js (đã được gọi trong detailProduct cũ, ở đây ta gọi trực tiếp logic)
            } else {
                toast({ title: 'Warning', message: 'Vui lòng đăng nhập để mua hàng !', type: 'warning', duration: 3000 });
                openLoginModal();
            }
        })
    }
}

function animationCart() {
    let cartIcon = document.querySelector(".count-product-cart");
    if (cartIcon) {
        cartIcon.style.animation = "slidein ease 1s"
        setTimeout(() => {
            cartIcon.style.animation = "none"
        }, 1000)
    }
}



// Thêm sản phẩm vào giỏ
function addCart(index) {
    let currentuser = JSON.parse(localStorage.getItem('currentuser'));
    let products = JSON.parse(localStorage.getItem('products'));
    let productInfo = products.find(sp => sp.id == index); // Lấy thông tin kho

    let soluong = parseInt(document.querySelector('.input-qty').value);
    let popupDetailNote = document.querySelector('#popup-detail-note').value;
    let note = popupDetailNote == "" ? "Không có ghi chú" : popupDetailNote;
    let productcart = {
        id: index,
        soluong: soluong,
        note: note
    }

    let cart = currentuser ? currentuser.cart : (JSON.parse(localStorage.getItem('giohang')) || []);

    let vitri = cart.findIndex(item => item.id == productcart.id);

    // --- KIỂM TRA TỒN KHO ---
    let totalQty = soluong;
    if (vitri != -1) {
        totalQty += parseInt(cart[vitri].soluong);
    }

    if (totalQty > productInfo.quantity) {
        toast({ title: 'Cảnh báo', message: `Kho chỉ còn ${productInfo.quantity}. `, type: 'warning', duration: 3000 });
        return; // Dừng lại, không thêm
    }
    // ------------------------

    if (vitri == -1) {
        cart.push(productcart);
    } else {
        cart[vitri].soluong = parseInt(cart[vitri].soluong) + soluong;
    }

    if (currentuser) {
        currentuser.cart = cart;
        localStorage.setItem('currentuser', JSON.stringify(currentuser));
    } else {
        localStorage.setItem('giohang', JSON.stringify(cart));
    }

    updateAmount();
    closeModal();
    toast({ title: 'Success', message: 'Thêm thành công sản phẩm vào giỏ hàng', type: 'success', duration: 3000 });
}

// Hiển thị giỏ hàng
function showCart() {
    let currentuser = JSON.parse(localStorage.getItem('currentuser'));
    let cart = [];

    // Lấy dữ liệu giỏ hàng tương ứng
    if (currentuser) {
        cart = currentuser.cart;
    } else {
        cart = JSON.parse(localStorage.getItem('giohang')) || [];
    }

    if (cart.length != 0) {
        document.querySelector('.gio-hang-trong').style.display = 'none';
        document.querySelector('button.thanh-toan').classList.remove('disabled');
        let productcarthtml = '';
        cart.forEach(item => {
            let product = getProduct(item);
            productcarthtml += `<li class="cart-item" data-id="${product.id}">
            <div class="cart-item-info">
                <p class="cart-item-title">
                    ${product.title}
                </p>
                <span class="cart-item-price price" data-price="${product.price}">
                ${vnd(parseInt(product.price))}
                </span>
            </div>
            <p class="product-note"><i class="fa-light fa-pencil"></i><span>${product.note}</span></p>
            <div class="cart-item-control">
                <button class="cart-item-delete" onclick="deleteCartItem(${product.id},this)">Xóa</button>
                <div class="buttons_added">
                    <input class="minus is-form" type="button" value="-" onclick="decreasingNumber(this)">
                    <input class="input-qty" max="100" min="1" name="" type="number" value="${product.soluong}">
                    <input class="plus is-form" type="button" value="+" onclick="increasingNumber(this)">
                </div>
            </div>
        </li>`
        });
        document.querySelector('.cart-list').innerHTML = productcarthtml;
        updateCartTotal();
        saveAmountCart();
    } else {
        document.querySelector('.gio-hang-trong').style.display = 'flex';
        document.querySelector('.cart-list').innerHTML = "";
        document.querySelector('button.thanh-toan').classList.add('disabled');
    }

    // Xử lý sự kiện đóng mở giỏ hàng
    let modalCart = document.querySelector('.modal-cart');
    let containerCart = document.querySelector('.cart-container');
    let themmon = document.querySelector('.them-mon');
    let oldBtn = document.querySelector('.thanh-toan');

    modalCart.onclick = function () {
        closeCart();
    }
    themmon.onclick = function () {
        closeCart();
    }
    containerCart.addEventListener('click', (e) => {
        e.stopPropagation();
    })

    // --- XỬ LÝ NÚT THANH TOÁN (Logic quan trọng) ---
    let newBtn = oldBtn.cloneNode(true);
    oldBtn.parentNode.replaceChild(newBtn, oldBtn);

    newBtn.addEventListener('click', () => {
        // Kiểm tra đăng nhập
        if (localStorage.getItem('currentuser')) {
            // Đã đăng nhập -> Mở trang thanh toán (checkout-page)
            document.querySelector('.checkout-page').classList.add('active');
            if (typeof thanhtoanpage === 'function') thanhtoanpage(1); // Gọi hàm từ checkout.js
            closeCart();
            body.style.overflow = "hidden";
        } else {
            // Chưa đăng nhập -> Hiện thông báo và mở Popup đăng nhập
            closeCart();
            toast({ title: 'Warning', message: 'Vui lòng đăng nhập để thanh toán !', type: 'warning', duration: 3000 });
            openLoginModal();
        }
    });
}

// Xóa sản phẩm khỏi giỏ
function deleteCartItem(id, el) {
    let cartParent = el.parentNode.parentNode;
    cartParent.remove();

    let currentuser = JSON.parse(localStorage.getItem('currentuser'));
    let cart = [];
    if (currentuser) {
        cart = currentuser.cart;
    } else {
        cart = JSON.parse(localStorage.getItem('giohang')) || [];
    }

    let vitri = cart.findIndex(item => item.id == id);
    cart.splice(vitri, 1);

    if (currentuser) {
        currentuser.cart = cart;
        localStorage.setItem('currentuser', JSON.stringify(currentuser));
    } else {
        localStorage.setItem('giohang', JSON.stringify(cart));
    }

    // Nếu trống thì hiển thị giỏ hàng trống
    if (cart.length == 0) {
        document.querySelector('.gio-hang-trong').style.display = 'flex';
        document.querySelector('button.thanh-toan').classList.add('disabled');
    }
    updateCartTotal();
    updateAmount();
}

// Cập nhật tổng tiền
function updateCartTotal() {
    document.querySelector('.text-price').innerText = vnd(getCartTotal());
}

// Lấy tổng tiền
function getCartTotal() {
    let currentuser = JSON.parse(localStorage.getItem('currentuser'));
    let cart = [];
    if (currentuser) {
        cart = currentuser.cart;
    } else {
        cart = JSON.parse(localStorage.getItem('giohang')) || [];
    }

    let tongtien = 0;
    cart.forEach(item => {
        let product = getProduct(item);
        tongtien += (parseInt(product.soluong) * parseInt(product.price));
    });
    return tongtien;
}

// Lấy thông tin sản phẩm
function getProduct(item) {
    let products = JSON.parse(localStorage.getItem('products'));
    let infoProductCart = products.find(sp => item.id == sp.id)
    let product = {
        ...infoProductCart,
        ...item
    }
    return product;
}

// Lấy số lượng hàng
function getAmountCart() {
    let currentuser = JSON.parse(localStorage.getItem('currentuser'));
    let cart = [];
    if (currentuser) {
        cart = currentuser.cart || [];
    } else {
        cart = JSON.parse(localStorage.getItem('giohang')) || [];
    }

    let amount = 0;
    cart.forEach(element => {
        amount += parseInt(element.soluong);
    });
    return amount;
}

// Cập nhật icon số lượng trên Header
function updateAmount() {
    let amount = getAmountCart();
    let countCart = document.querySelector('.count-product-cart');
    if (countCart) {
        countCart.innerText = amount;
    }
}

// Lưu thông tin giỏ hàng khi tăng giảm số lượng trong giỏ
function saveAmountCart() {
    let cartAmountbtn = document.querySelectorAll(".cart-item-control .is-form");
    let currentuser = JSON.parse(localStorage.getItem('currentuser'));
    let cart = [];
    if (currentuser) {
        cart = currentuser.cart;
    } else {
        cart = JSON.parse(localStorage.getItem('giohang')) || [];
    }

    cartAmountbtn.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            let cartItem = btn.closest('.cart-item');
            let id = cartItem.getAttribute("data-id");

            let productId = cart.find(item => item.id == id);
            productId.soluong = parseInt(cartItem.querySelector(".input-qty").value);

            if (currentuser) {
                currentuser.cart = cart;
                localStorage.setItem('currentuser', JSON.stringify(currentuser));
            } else {
                localStorage.setItem('giohang', JSON.stringify(cart));
            }

            updateCartTotal();
            updateAmount();
        })
    });
}

// Mở và đóng giỏ hàng
function openCart() {
    showCart();
    document.querySelector('.modal-cart').classList.add('open');
    body.style.overflow = "hidden";
}

function closeCart() {
    document.querySelector('.modal-cart').classList.remove('open');
    body.style.overflow = "auto";
    updateAmount();
}

// --- TÌM KIẾM SẢN PHẨM ---

document.querySelector(".filter-btn").addEventListener("click", (e) => {
    e.preventDefault();
    document.querySelector(".advanced-search").classList.toggle("open");
})

document.querySelector(".form-search-input").addEventListener("click", (e) => {
    e.preventDefault();
})

function closeSearchAdvanced() {
    document.querySelector(".advanced-search").classList.toggle("open");
}

function openSearchMb() {
    document.querySelector(".header-middle-left").style.display = "none";
    document.querySelector(".header-middle-center").style.display = "block";
    document.querySelector(".header-middle-right-item.close").style.display = "block";
    let liItem = document.querySelectorAll(".header-middle-right-item.open");
    for (let i = 0; i < liItem.length; i++) {
        liItem[i].style.setProperty("display", "none", "important")
    }
}

function closeSearchMb() {
    document.querySelector(".header-middle-left").style.display = "block";
    document.querySelector(".header-middle-center").style.display = "none";
    document.querySelector(".header-middle-right-item.close").style.display = "none";
    let liItem = document.querySelectorAll(".header-middle-right-item.open");
    for (let i = 0; i < liItem.length; i++) {
        liItem[i].style.setProperty("display", "block", "important")
    }
}

// --- XỬ LÝ LOGIN / SIGNUP ---

function openLoginModal() {
    let formsg = document.querySelector('.modal.signup-login');
    let container = document.querySelector('.signup-login .modal-container');
    if (formsg) formsg.classList.add('open');
    if (container) container.classList.add('active'); // Active = hiện tab Login
    body.style.overflow = "hidden";
}

function openSignupModal() {
    let formsg = document.querySelector('.modal.signup-login');
    let container = document.querySelector('.signup-login .modal-container');
    if (formsg) formsg.classList.add('open');
    if (container) container.classList.remove('active'); // Remove active = hiện tab Signup
    body.style.overflow = "hidden";
}

let signupLink = document.querySelector('.signup-link');
let loginLink = document.querySelector('.login-link');
let container = document.querySelector('.signup-login .modal-container');

if (signupLink) {
    signupLink.addEventListener('click', () => {
        container.classList.remove('active');
    });
}

if (loginLink) {
    loginLink.addEventListener('click', () => {
        container.classList.add('active');
    });
}

// Chức năng Đăng ký
let signupButton = document.getElementById('signup-button');
if (signupButton) {
    signupButton.addEventListener('click', (event) => {
        event.preventDefault();
        let fullNameUser = document.getElementById('fullname').value;
        let phoneUser = document.getElementById('phone').value;
        let passwordUser = document.getElementById('password').value;
        let passwordConfirmation = document.getElementById('password_confirmation').value;
        let checkSignup = document.getElementById('checkbox-signup').checked;

        
        if (fullNameUser.length == 0) {
            document.querySelector('.form-message-name').innerHTML = 'Vui lòng nhập họ và tên';
            document.getElementById('fullname').focus();
        } else if (fullNameUser.length < 3) {
            document.getElementById('fullname').value = '';
            document.querySelector('.form-message-name').innerHTML = 'Vui lòng nhập họ và tên lớn hơn 3 kí tự';
        } else {
            document.querySelector('.form-message-name').innerHTML = '';
        }

        if (phoneUser.length == 0) {
            document.querySelector('.form-message-phone').innerHTML = 'Vui lòng nhập vào số điện thoại';
        } else if (phoneUser.length != 10) {
            document.querySelector('.form-message-phone').innerHTML = 'Vui lòng nhập vào số điện thoại 10 số';
            document.getElementById('phone').value = '';
        } else {
            document.querySelector('.form-message-phone').innerHTML = '';
        }

        if (passwordUser.length == 0) {
            document.querySelector('.form-message-password').innerHTML = 'Vui lòng nhập mật khẩu';
        } else if (passwordUser.length < 6) {
            document.querySelector('.form-message-password').innerHTML = 'Vui lòng nhập mật khẩu lớn hơn 6 kí tự';
            document.getElementById('password').value = '';
        } else {
            document.querySelector('.form-message-password').innerHTML = '';
        }

        if (passwordConfirmation.length == 0) {
            document.querySelector('.form-message-password-confi').innerHTML = 'Vui lòng nhập lại mật khẩu';
        } else if (passwordConfirmation !== passwordUser) {
            document.querySelector('.form-message-password-confi').innerHTML = 'Mật khẩu không khớp';
            document.getElementById('password_confirmation').value = '';
        } else {
            document.querySelector('.form-message-password-confi').innerHTML = '';
        }

        if (checkSignup != true) {
            document.querySelector('.form-message-checkbox').innerHTML = 'Vui lòng đồng ý điều khoản';
        } else {
            document.querySelector('.form-message-checkbox').innerHTML = '';
        }

        if (fullNameUser && phoneUser && passwordUser && passwordConfirmation && checkSignup) {
            if (passwordConfirmation == passwordUser) {
                let user = {
                    fullname: fullNameUser,
                    phone: phoneUser,
                    password: passwordUser,
                    address: '',
                    email: '',
                    status: 1,
                    join: new Date(),
                    cart: [],
                    userType: 0
                }
                let accounts = localStorage.getItem('accounts') ? JSON.parse(localStorage.getItem('accounts')) : [];
                let checkloop = accounts.some(account => {
                    return account.phone == user.phone;
                })
                if (!checkloop) {
                    accounts.push(user);
                    localStorage.setItem('accounts', JSON.stringify(accounts));
                    toast({ title: 'Thành công', message: 'Tạo thành công tài khoản !', type: 'success', duration: 3000 });
                    
                    // Chuyển sang tab đăng nhập
                    document.querySelector('.signup-login .modal-container').classList.add('active');
                    // Điền sẵn thông tin
                    document.getElementById('phone-login').value = user.phone;
                    document.getElementById('password-login').focus();
                    
                    // Clear form
                    document.getElementById('fullname').value = '';
                    document.getElementById('phone').value = '';
                    document.getElementById('password').value = '';
                    document.getElementById('password_confirmation').value = '';
                    document.getElementById('checkbox-signup').checked = false;
                } else {
                    toast({ title: 'Thất bại', message: 'Tài khoản đã tồn tại !', type: 'error', duration: 3000 });
                }
            } else {
                toast({ title: 'Thất bại', message: 'Sai mật khẩu !', type: 'error', duration: 3000 });
            }
        }
    })
}

// Chức năng Đăng nhập
let loginBtn = document.getElementById('login-button');
if (loginBtn) {
    loginBtn.addEventListener('click', (event) => {
        event.preventDefault();
        let phonelog = document.getElementById('phone-login').value;
        let passlog = document.getElementById('password-login').value;
        let accounts = JSON.parse(localStorage.getItem('accounts')) || [];

        // Validation
        if (phonelog.length == 0) {
            document.querySelector('.form-message.phonelog').innerHTML = 'Vui lòng nhập vào số điện thoại';
        } else if (phonelog.length != 10) {
            document.querySelector('.form-message.phonelog').innerHTML = 'Vui lòng nhập vào số điện thoại 10 số';
        } else {
            document.querySelector('.form-message.phonelog').innerHTML = '';
        }

        if (passlog.length == 0) {
            document.querySelector('.form-message-check-login').innerHTML = 'Vui lòng nhập mật khẩu';
        } else if (passlog.length < 6) {
            document.querySelector('.form-message-check-login').innerHTML = 'Vui lòng nhập mật khẩu lớn hơn 6 kí tự';
        } else {
            document.querySelector('.form-message-check-login').innerHTML = '';
        }

        if (phonelog && passlog) {
            let vitri = accounts.findIndex(item => item.phone == phonelog);
            if (vitri == -1) {
                toast({ title: 'Error', message: 'Tài khoản của bạn không tồn tại', type: 'error', duration: 3000 });
            } else if (accounts[vitri].password == passlog) {
                if (accounts[vitri].status == 0) {
                    toast({ title: 'Warning', message: 'Tài khoản của bạn đã bị khóa', type: 'warning', duration: 3000 });
                } else {
                    // --- GỘP GIỎ HÀNG KHI ĐĂNG NHẬP THÀNH CÔNG ---
                    let giohangTam = JSON.parse(localStorage.getItem('giohang')) || [];
                    let currentUser = accounts[vitri];

                    if(giohangTam.length > 0) {
                         giohangTam.forEach(itemTam => {
                             let itemUser = currentUser.cart.find(i => i.id == itemTam.id);
                             if(itemUser) {
                                 itemUser.soluong += itemTam.soluong;
                             } else {
                                 currentUser.cart.push(itemTam);
                             }
                         });
                         // Xóa giỏ hàng tạm sau khi gộp
                         localStorage.removeItem('giohang');
                    }
                    
                    // Lưu lại user và danh sách accounts
                    localStorage.setItem('currentuser', JSON.stringify(currentUser));
                    accounts[vitri] = currentUser;
                    localStorage.setItem('accounts', JSON.stringify(accounts));
                    
                    toast({ title: 'Success', message: 'Đăng nhập thành công', type: 'success', duration: 3000 });
                    closeModal();
                    
                    // Cập nhật lại giao diện ngay lập tức
                    kiemtradangnhap();
                    updateAmount();
                    // Nếu đang mở giỏ hàng thì load lại để thấy giỏ hàng đã gộp
                    if(document.querySelector('.modal-cart').classList.contains('open')) {
                        showCart();
                    }
                }
            } else {
                toast({ title: 'Warning', message: 'Sai mật khẩu', type: 'warning', duration: 3000 });
            }
        }
    })
}

// --- LOGIC KIỂM TRA ĐĂNG NHẬP (ĐÃ SỬA LỖI ACCESS DENIED) ---

function kiemtradangnhap() {
    let currentUser = localStorage.getItem('currentuser');
    let authContainer = document.querySelector('.auth-container');
    let menuUser = document.querySelector('.header-middle-right-menu');
    let cartIcon = document.querySelector('.header-middle-right-item.open[onclick="openCart()"]');

    if (currentUser != null) {
        let user = JSON.parse(currentUser);

        // Hiển thị tên tài khoản
        if (authContainer) {
            authContainer.innerHTML = `
                <span class="text-tk">${user.fullname} <i class="fa-sharp fa-solid fa-caret-down"></i></span>
                <span class="text-dndk" style="font-size: 11px; color: gray;">Đã đăng nhập</span>`;
        }

        let menuHtml = '';

        // Kiểm tra Admin hay Khách hàng
        if (user.userType == 1) {
            // === ADMIN ===
            if (cartIcon) cartIcon.style.display = 'none'; // Admin không mua hàng
            menuHtml += `<li><a href="./admin.html"><i class="fa-light fa-gear"></i> Trang quản trị</a></li>`;
            menuHtml += `<li><a href="javascript:;" onclick="logOut()"><i class="fa-light fa-right-from-bracket"></i> Đăng xuất</a></li>`;
        } else {
            // === KHÁCH HÀNG (userType = 0) ===
            // KHÔNG CÓ LOGIC CHẶN ACCESS DENIED Ở ĐÂY!
            if (cartIcon) cartIcon.style.display = 'block'; // Hiện giỏ hàng
            menuHtml += `<li><a href="javascript:;" onclick="myAccount()"><i class="fa-light fa-circle-user"></i> Tài khoản của tôi</a></li>`;
            menuHtml += `<li><a href="javascript:;" onclick="orderHistory()"><i class="fa-regular fa-clipboard-list"></i> Đơn hàng đã mua</a></li>`;
            menuHtml += `<li class="border"><a href="javascript:;" onclick="logOut()"><i class="fa-light fa-right-from-bracket"></i> Đăng xuất</a></li>`;
        }

        if (menuUser) menuUser.innerHTML = menuHtml;

    } else {
        // === CHƯA ĐĂNG NHẬP ===
        if (cartIcon) cartIcon.style.display = 'block'; // Vẫn hiện giỏ hàng
        
        if (authContainer) {
            authContainer.innerHTML = `
                <span class="text-dndk">Đăng nhập / Đăng ký</span>
                <span class="text-tk">Tài khoản <i class="fa-sharp fa-solid fa-caret-down"></i></span>`;
        }

        if (menuUser) {
            menuUser.innerHTML = `
                <li><a id="login" href="javascript:;" onclick="openLoginModal()"><i class="fa-light fa-right-to-bracket"></i> Đăng nhập</a></li>
                <li><a id="signup" href="javascript:;" onclick="openSignupModal()"><i class="fa-light fa-user-plus"></i> Đăng ký</a></li>
            `;
        }
    }
}

// Đăng xuất
function logOut() {
    let accounts = JSON.parse(localStorage.getItem('accounts'));
    let user = JSON.parse(localStorage.getItem('currentuser'));
    
    if (user && accounts) {
        let vitri = accounts.findIndex(item => item.phone == user.phone);
        if (vitri !== -1) {
            accounts[vitri].cart = user.cart; // Lưu giỏ hàng
            localStorage.setItem('accounts', JSON.stringify(accounts));
        }
    }
    
    localStorage.removeItem('currentuser');
    window.location.href = "index.html"; // Quay về trang chủ
}

// Chuyển đổi trang
function myAccount() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.getElementById('trangchu').classList.add('hide');
    document.getElementById('order-history').classList.remove('open');
    document.getElementById('account-user').classList.add('open');
    userInfo();
}

function orderHistory() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.getElementById('account-user').classList.remove('open');
    document.getElementById('trangchu').classList.add('hide');
    document.getElementById('order-history').classList.add('open');
    renderOrderProduct();
}

// Validate Email
function emailIsValid(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function userInfo() {
    let user = JSON.parse(localStorage.getItem('currentuser'));
    if (user) {
        document.getElementById('infoname').value = user.fullname;
        document.getElementById('infophone').value = user.phone;
        document.getElementById('infoemail').value = user.email || '';
        document.getElementById('infoaddress').value = user.address || '';
    }
}

// Thay doi thong tin user
function changeInformation() {
    let accounts = JSON.parse(localStorage.getItem('accounts'));
    let user = JSON.parse(localStorage.getItem('currentuser'));
    let infoname = document.getElementById('infoname');
    let infoemail = document.getElementById('infoemail');
    let infoaddress = document.getElementById('infoaddress');

    user.fullname = infoname.value;
    if (infoemail.value.length > 0) {
        if (!emailIsValid(infoemail.value)) {
            document.querySelector('.inforemail-error').innerHTML = 'Vui lòng nhập lại email!';
            return;
        } else {
            user.email = infoemail.value;
        }
    }

    if (infoaddress.value.length > 0) {
        user.address = infoaddress.value;
    }

    let vitri = accounts.findIndex(item => item.phone == user.phone)
    if(vitri !== -1) {
        accounts[vitri].fullname = user.fullname;
        accounts[vitri].email = user.email;
        accounts[vitri].address = user.address;
        localStorage.setItem('accounts', JSON.stringify(accounts));
    }
    
    localStorage.setItem('currentuser', JSON.stringify(user));
    kiemtradangnhap();
    toast({ title: 'Success', message: 'Cập nhật thông tin thành công !', type: 'success', duration: 3000 });
}

// Đổi mật khẩu 
function changePassword() {
    let currentUser = JSON.parse(localStorage.getItem("currentuser"));
    let passwordCur = document.getElementById('password-cur-info');
    let passwordAfter = document.getElementById('password-after-info');
    let passwordConfirm = document.getElementById('password-comfirm-info');
    let check = true;

    // Validate logic...
    if (passwordCur.value.length == 0) {
        document.querySelector('.password-cur-info-error').innerHTML = 'Vui lòng nhập mật khẩu hiện tại';
        check = false;
    } else document.querySelector('.password-cur-info-error').innerHTML = '';

    if (passwordAfter.value.length == 0) {
        document.querySelector('.password-after-info-error').innerHTML = 'Vui lòng nhập mật khẩu mới';
        check = false;
    } else document.querySelector('.password-after-info-error').innerHTML = '';

    if (passwordConfirm.value.length == 0) {
        document.querySelector('.password-after-comfirm-error').innerHTML = 'Vui lòng nhập mật khẩu xác nhận';
        check = false;
    } else document.querySelector('.password-after-comfirm-error').innerHTML = '';

    if (check) {
        if (passwordCur.value == currentUser.password) {
            if (passwordAfter.value.length < 6) {
                document.querySelector('.password-after-info-error').innerHTML = 'Mật khẩu mới phải >= 6 kí tự';
            } else {
                if (passwordConfirm.value == passwordAfter.value) {
                    currentUser.password = passwordAfter.value;
                    localStorage.setItem('currentuser', JSON.stringify(currentUser));
                    
                    let accounts = JSON.parse(localStorage.getItem('accounts'));
                    let accountChange = accounts.find(acc => acc.phone == currentUser.phone);
                    if(accountChange) {
                        accountChange.password = currentUser.password;
                        localStorage.setItem('accounts', JSON.stringify(accounts));
                    }
                    toast({ title: 'Success', message: 'Đổi mật khẩu thành công !', type: 'success', duration: 3000 });
                    // Clear inputs
                    passwordCur.value = '';
                    passwordAfter.value = '';
                    passwordConfirm.value = '';
                } else {
                    document.querySelector('.password-after-comfirm-error').innerHTML = 'Mật khẩu xác nhận không khớp';
                }
            }
        } else {
            document.querySelector('.password-cur-info-error').innerHTML = 'Mật khẩu hiện tại không đúng';
        }
    }
}

function getProductInfo(id) {
    let products = JSON.parse(localStorage.getItem('products'));
    return products.find(item => item.id == id);
}

// Render Order History
function renderOrderProduct() {
    let currentUser = JSON.parse(localStorage.getItem('currentuser'));
    let order = localStorage.getItem('order') ? JSON.parse(localStorage.getItem('order')) : [];
    let orderHtml = "";
    let arrDonHang = [];
    
    if (currentUser) {
        arrDonHang = order.filter(item => item.khachhang === currentUser.phone);
    }

    // --- THÊM PHẦN LỌC NGÀY ---
    // Tạo bộ lọc nếu chưa có
    let filterSection = document.getElementById("order-history-filter");
    if (!filterSection && document.querySelector(".main-account-header")) {
        let header = document.querySelector(".main-account-header");
        // Thêm HTML cho bộ lọc
        let div = document.createElement("div");
        div.id = "order-history-filter";
        div.style.marginTop = "15px";
        div.innerHTML = `
            <label>Từ ngày: <input type="date" id="history-start" onchange="renderOrderProduct()"></label>
            <label style="margin-left:10px;">Đến ngày: <input type="date" id="history-end" onchange="renderOrderProduct()"></label>
        `;
        header.appendChild(div);
    }

    // Lấy giá trị ngày để lọc
    let startVal = document.getElementById("history-start") ? document.getElementById("history-start").value : "";
    let endVal = document.getElementById("history-end") ? document.getElementById("history-end").value : "";

    if (startVal) {
        arrDonHang = arrDonHang.filter(item => new Date(item.thoigiandat) >= new Date(startVal));
    }
    if (endVal) {
        arrDonHang = arrDonHang.filter(item => new Date(item.thoigiandat) <= new Date(endVal).setHours(23,59,59));
    }
    // ---------------------------

    if (arrDonHang.length == 0) {
        orderHtml = `<div class="empty-order-section"><img src="./assets/img/empty-order.jpg" alt="" class="empty-order-img"><p>Không tìm thấy đơn hàng nào</p></div>`;
    } else {
        
        arrDonHang.forEach(item => {
            let productHtml = `<div class="order-history-group">`;
            let chiTietDon = getOrderDetails(item.id);
            chiTietDon.forEach(sp => {
                let infosp = getProductInfo(sp.id);
                // Fix lỗi nếu sản phẩm bị xóa admin
                let img = infosp ? infosp.img : './assets/img/blank-image.png';
                let title = infosp ? infosp.title : 'Sản phẩm ngừng kinh doanh';
                productHtml += `<div class="order-history">
                    <div class="order-history-left">
                        <img src="${img}" alt="">
                        <div class="order-history-info">
                            <h4>${title}</h4>
                            <p class="order-history-note"><i class="fa-light fa-pen"></i> ${sp.note}</p>
                            <p class="order-history-quantity">x${sp.soluong}</p>
                        </div>
                    </div>
                    <div class="order-history-right">
                        <div class="order-history-price">
                            <span class="order-history-current-price">${vnd(sp.price)}</span>
                        </div>
                    </div>
                </div>`;
            });
            let textCompl = item.trangthai == 1 ? "Đã xử lý" : "Đang xử lý";
            let classCompl = item.trangthai == 1 ? "complete" : "no-complete"
            productHtml += `<div class="order-history-control">
                <div class="order-history-status">
                    <span class="order-history-status-sp ${classCompl}">${textCompl}</span>
                    <button id="order-history-detail" onclick="detailOrder('${item.id}')"><i class="fa-regular fa-eye"></i> Xem chi tiết</button>
                </div>
                <div class="order-history-total">
                    <span class="order-history-total-desc">Tổng tiền: </span>
                    <span class="order-history-toltal-price">${vnd(item.tongtien)}</span>
                </div>
            </div></div>`;
            orderHtml += productHtml;
        });
    }
    document.querySelector(".order-history-section").innerHTML = orderHtml;
}

function getOrderDetails(madon) {
    let orderDetails = localStorage.getItem("orderDetails") ? JSON.parse(localStorage.getItem("orderDetails")) : [];
    return orderDetails.filter(item => item.madon == madon);
}

function formatDate(date) {
    let fm = new Date(date);
    let yyyy = fm.getFullYear();
    let mm = fm.getMonth() + 1;
    let dd = fm.getDate();
    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;
    return dd + '/' + mm + '/' + yyyy;
}

function detailOrder(id) {
    let order = JSON.parse(localStorage.getItem("order"));
    let detail = order.find(item => item.id == id);
    document.querySelector(".modal.detail-order").classList.add("open");
    let detailOrderHtml = `<ul class="detail-order-group">
        <li class="detail-order-item">
            <span class="detail-order-item-left"><i class="fa-light fa-calendar-days"></i> Ngày đặt hàng</span>
            <span class="detail-order-item-right">${formatDate(detail.thoigiandat)}</span>
        </li>
        <li class="detail-order-item">
            <span class="detail-order-item-left"><i class="fa-light fa-truck"></i> Hình thức giao</span>
            <span class="detail-order-item-right">${detail.hinhthucgiao}</span>
        </li>
        <li class="detail-order-item">
            <span class="detail-order-item-left"><i class="fa-light fa-clock"></i> Ngày nhận hàng</span>
            <span class="detail-order-item-right">${(detail.thoigiangiao == "" ? "" : (detail.thoigiangiao + " - ")) + formatDate(detail.ngaygiaohang)}</span>
        </li>
        <li class="detail-order-item">
            <span class="detail-order-item-left"><i class="fa-light fa-location-dot"></i> Địa điểm nhận</span>
            <span class="detail-order-item-right">${detail.diachinhan}</span>
        </li>
        <li class="detail-order-item">
            <span class="detail-order-item-left"><i class="fa-thin fa-person"></i> Người nhận</span>
            <span class="detail-order-item-right">${detail.tenguoinhan}</span>
        </li>
        <li class="detail-order-item">
            <span class="detail-order-item-left"><i class="fa-light fa-phone"></i> Số điện thoại nhận</span>
            <span class="detail-order-item-right">${detail.sdtnhan}</span>
        </li>
    </ul>`
    document.querySelector(".detail-order-content").innerHTML = detailOrderHtml;
}

function createId(arr) {
    let id = arr.length + 1;
    let check = arr.find(item => item.id == "DH" + id)
    while (check != null) {
        id++;
        check = arr.find(item => item.id == "DH" + id)
    }
    return "DH" + id;
}

// Back to top
window.onscroll = () => {
    let backtopTop = document.querySelector(".back-to-top")
    if (document.documentElement.scrollTop > 100) {
        backtopTop.classList.add("active");
    } else {
        backtopTop.classList.remove("active");
    }
}

// Auto hide header
const headerNav = document.querySelector(".header-bottom");
let lastScrollY = window.scrollY;
window.addEventListener("scroll", () => {
    if (lastScrollY < window.scrollY) {
        headerNav.classList.add("hide")
    } else {
        headerNav.classList.remove("hide")
    }
    lastScrollY = window.scrollY;
})

// Page Render Products
function renderProducts(showProduct) {
    let productHtml = '';
    let currentUser = localStorage.getItem('currentuser');
    let isAdmin = false;
    if (currentUser) {
        let user = JSON.parse(currentUser);
        if (user.userType == 1) isAdmin = true;
    }

    if (showProduct.length == 0) {
        document.getElementById("home-title").style.display = "none";
        productHtml = `<div class="no-result"><div class="no-result-h">Tìm kiếm không có kết quả</div><div class="no-result-p">Xin lỗi, chúng tôi không thể tìm được kết quả hợp với tìm kiếm của bạn</div><div class="no-result-i"><i class="fa-light fa-face-sad-cry"></i></div></div>`;
    } else {
        document.getElementById("home-title").style.display = "block";
        showProduct.forEach((product) => {
            productHtml += `<div class="col-product">
            <article class="card-product" >
                <div class="card-header">
                    <a href="#" class="card-image-link" onclick="detailProduct(${product.id})">
                    <img class="card-image" src="${product.img}" alt="${product.title}">
                    </a>
                </div>
                <div class="products-info">
                    <div class="card-content">
                        <div class="card-title">
                            <a href="#" class="card-title-link" onclick="detailProduct(${product.id})">${product.title}</a>
                        </div>
                    </div>
                    <div class="card-footer">
                        <div class="product-price">
                            <span class="current-price">${vnd(product.price)}</span>
                        </div>`;
            if (!isAdmin) {
                productHtml += `<div class="product-buy">
                    <button onclick="detailProduct(${product.id})" class="card-button order-item"><i class="fa-regular fa-cart-shopping-fast"></i> Đặt hàng</button>
                </div>`;
            }
            productHtml += `</div>
                </div>
            </article>
        </div>`;
        });
    }
    document.getElementById('home-products').innerHTML = productHtml;
}

// Find Product
var products = JSON.parse(localStorage.getItem('products')) || [];
var productAll = products.filter(item => item.status == 1);

function searchProducts(mode) {
    let valeSearchInput = document.querySelector('.form-search-input').value;
    let valueCategory = document.getElementById("advanced-search-category-select").value;
    let minPrice = document.getElementById("min-price").value;
    let maxPrice = document.getElementById("max-price").value;

    // Lấy tất cả sản phẩm đang kinh doanh (status == 1)
    let products = JSON.parse(localStorage.getItem('products')) || [];
    let productAll = products.filter(item => item.status == 1);

    // 1. Lọc theo danh mục
    let result = valueCategory == "Tất cả" ? productAll : productAll.filter((item) => {
        return item.category == valueCategory;
    });

    // 2. Lọc theo từ khóa tìm kiếm
    result = valeSearchInput == "" ? result : result.filter(item => {
        return item.title.toString().toUpperCase().includes(valeSearchInput.toString().toUpperCase());
    });

    // 3. Lọc theo giá (Sửa lỗi logic tại đây)
    if (minPrice !== "") {
        result = result.filter(item => item.price >= parseInt(minPrice));
    }
    if (maxPrice !== "") {
        result = result.filter(item => item.price <= parseInt(maxPrice));
    }

    // 4. Sắp xếp
    switch (mode) {
        case 0: // Reset
            document.querySelector('.form-search-input').value = "";
            document.getElementById("advanced-search-category-select").value = "Tất cả";
            document.getElementById("min-price").value = "";
            document.getElementById("max-price").value = "";
            result = productAll; 
            break;
        case 1: // Tăng dần
            result.sort((a, b) => a.price - b.price);
            break;
        case 2: // Giảm dần
            result.sort((a, b) => b.price - a.price);
            break;
    }

    showHomeProduct(result);
}

// Pagination
let perPage = 12;
let currentPage = 1;
let totalPage = 0;
let perProducts = [];

function displayList(productAll, perPage, currentPage) {
    let start = (currentPage - 1) * perPage;
    let end = (currentPage - 1) * perPage + perPage;
    let productShow = productAll.slice(start, end);
    renderProducts(productShow);
}

function showHomeProduct(data) {
    let list = data || JSON.parse(localStorage.getItem('products')).filter(item => item.status == 1);
    displayList(list, perPage, currentPage);
    setupPagination(list, perPage, currentPage);
}

function setupPagination(productAll, perPage) {
    document.querySelector('.page-nav-list').innerHTML = '';
    let page_count = Math.ceil(productAll.length / perPage);
    for (let i = 1; i <= page_count; i++) {
        let li = paginationChange(i, productAll, currentPage);
        document.querySelector('.page-nav-list').appendChild(li);
    }
}

function paginationChange(page, productAll, currentPage) {
    let node = document.createElement(`li`);
    node.classList.add('page-nav-item');
    node.innerHTML = `<a href="javascript:;">${page}</a>`;
    if (currentPage == page) node.classList.add('active');
    node.addEventListener('click', function () {
        currentPage = page;
        displayList(productAll, perPage, currentPage);
        let t = document.querySelectorAll('.page-nav-item.active');
        for (let i = 0; i < t.length; i++) {
            t[i].classList.remove('active');
        }
        node.classList.add('active');
        document.getElementById("home-service").scrollIntoView();
    })
    return node;
}

function showCategory(category) {
    document.getElementById('trangchu').classList.remove('hide');
    document.getElementById('account-user').classList.remove('open');
    document.getElementById('order-history').classList.remove('open');
    let productSearch = productAll.filter(value => {
        return value.category.toString().toUpperCase().includes(category.toUpperCase());
    })
    let currentPageSeach = 1;
    displayList(productSearch, perPage, currentPageSeach);
    setupPagination(productSearch, perPage, currentPageSeach);
    document.getElementById("home-title").scrollIntoView();
}

// Init
window.onload = function () {
    kiemtradangnhap();
    updateAmount();
    updateCartTotal();
    let products = JSON.parse(localStorage.getItem('products')) || [];
    showHomeProduct(products);
};