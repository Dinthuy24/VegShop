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