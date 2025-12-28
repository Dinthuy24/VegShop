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