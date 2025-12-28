function checkLogin() {
    let currentUser = JSON.parse(localStorage.getItem("currentuser"));
    if (currentUser == null || currentUser.userType == 0) {
        document.querySelector("body").innerHTML = `<div class="access-denied-section">
            <img class="access-denied-img" src="./assets/img/access-denied.webp" alt="">
        </div>`
    } else {
        let nameNode = document.getElementById("name-acc");
        if (nameNode) nameNode.innerHTML = currentUser.fullname;
    }
}

window.onload = function() {
    checkLogin();

    // 1. Sidebar Logic
    const menuIconButton = document.querySelector(".menu-icon-btn");
    const sidebar = document.querySelector(".sidebar");
    if (menuIconButton && sidebar) {
        menuIconButton.addEventListener("click", () => {
            sidebar.classList.toggle("open");
        });
    }

    // 2. Dashboard (Tổng quan)
    if (document.getElementById("amount-user")) {
        document.getElementById("amount-user").innerHTML = getAmoumtUser();
        document.getElementById("amount-product").innerHTML = getAmoumtProduct();
        document.getElementById("doanh-thu").innerHTML = vnd(getMoney());
    }

    // 3. Trang Sản phẩm
    if (document.getElementById("show-product")) {
        showProduct();
    }

    // 4. Trang Khách hàng
    if (document.getElementById("show-user")) {
        showUser();
    }

    // 5. Trang Đơn hàng
    if (document.getElementById("showOrder")) {
        let orders = localStorage.getItem("order") ? JSON.parse(localStorage.getItem("order")) : [];
        showOrder(orders);
    }

    // 6. Trang Thống kê
    if (document.getElementById("showTk")) {
        thongKe(0);
    }
};

const closeButtons = document.querySelectorAll(".modal-close");
const modals = document.querySelectorAll(".modal");

closeButtons.forEach(btn => {
    btn.onclick = function() {
        let modal = btn.closest(".modal");
        modal.classList.remove("open");
        // Nếu là form sản phẩm thì reset data
        if (modal.classList.contains("add-product")) {
            setDefaultValue();
        }
        // Nếu là form user thì reset data
        if (modal.classList.contains("signup")) {
            signUpFormReset();
        }
    }
});

// Click ra ngoài để đóng modal
modals.forEach(modal => {
    modal.onclick = function(e) {
        if (e.target == modal) {
            modal.classList.remove("open");
            if (modal.classList.contains("add-product")) setDefaultValue();
            if (modal.classList.contains("signup")) signUpFormReset();
        }
    }
});


function getMoney() {
    let tongtien = 0;
    let orders = localStorage.getItem("order") ? JSON.parse(localStorage.getItem("order")) : [];
    orders.forEach(item => {
        if(item.trangthai == 1) { // Chỉ tính đơn đã xử lý
            tongtien += item.tongtien;
        }
    });
    return tongtien;
}


/* ==============================================
    QUẢN LÝ KHÁCH HÀNG (USER)
   ============================================== */
   let indexFlag; // Biến cờ đánh dấu user đang sửa

   function showUserArr(arr) {
       let accountHtml = '';
       if (arr.length == 0) {
           accountHtml = `<td colspan="5">Không có dữ liệu</td>`
       } else {
           arr.forEach((account, index) => {
               let tinhtrang = account.status == 0 ? `<span class="status-no-complete">Bị khóa</span>` : `<span class="status-complete">Hoạt động</span>`;
               accountHtml += ` <tr>
               <td>${index + 1}</td>
               <td>${account.fullname}</td>
               <td>${account.phone}</td>
               <td>${formatDate(account.join)}</td>
               <td>${tinhtrang}</td>
               <td class="control control-table">
                   <button class="btn-edit" onclick='editAccount(${account.phone})' ><i class="fa-light fa-pen-to-square"></i></button>
                   <button class="btn-delete" onclick="deleteAcount(${account.phone})"><i class="fa-regular fa-trash"></i></button>
               </td>
           </tr>`
           })
       }
       document.getElementById('show-user').innerHTML = accountHtml;
   }
   
   function showUser() {
       let tinhTrang = parseInt(document.getElementById("tinh-trang-user").value);
       let ct = document.getElementById("form-search-user").value;
       let timeStart = document.getElementById("time-start-user").value;
       let timeEnd = document.getElementById("time-end-user").value;
   
       if (timeEnd < timeStart && timeEnd != "" && timeStart != "") {
           alert("Lựa chọn thời gian sai !");
           return;
       }
   
       let accounts = localStorage.getItem("accounts") ? JSON.parse(localStorage.getItem("accounts")).filter(item => item.userType == 0) : [];
       let result = tinhTrang == 2 ? accounts : accounts.filter(item => item.status == tinhTrang);
   
       result = ct == "" ? result : result.filter((item) => {
           return (item.fullname.toLowerCase().includes(ct.toLowerCase()) || item.phone.toString().toLowerCase().includes(ct.toLowerCase()));
       });
   
       if (timeStart != "" && timeEnd == "") {
           result = result.filter((item) => new Date(item.join) >= new Date(timeStart).setHours(0, 0, 0));
       } else if (timeStart == "" && timeEnd != "") {
           result = result.filter((item) => new Date(item.join) <= new Date(timeEnd).setHours(23, 59, 59));
       } else if (timeStart != "" && timeEnd != "") {
           result = result.filter((item) => new Date(item.join) >= new Date(timeStart).setHours(0, 0, 0) && new Date(item.join) <= new Date(timeEnd).setHours(23, 59, 59));
       }
       showUserArr(result);
   }
   
   function cancelSearchUser() {
       document.getElementById("tinh-trang-user").value = 2;
       document.getElementById("form-search-user").value = "";
       document.getElementById("time-start-user").value = "";
       document.getElementById("time-end-user").value = "";
       showUser();
   }
   
   function openCreateAccount() {
       document.querySelector(".signup").classList.add("open");
       document.querySelectorAll(".edit-account-e").forEach(item => item.style.display = "none");
       document.querySelectorAll(".add-account-e").forEach(item => item.style.display = "block");
       signUpFormReset();
   }
   
   function signUpFormReset() {
       document.getElementById('fullname').value = "";
       document.getElementById('phone').value = "";
       document.getElementById('password').value = "";
       document.querySelector('.form-message-name').innerHTML = '';
       document.querySelector('.form-message-phone').innerHTML = '';
       document.querySelector('.form-message-password').innerHTML = '';
   }
   
   function deleteAcount(phone) {
       let accounts = JSON.parse(localStorage.getItem('accounts'));
       let index = accounts.findIndex(item => item.phone == phone);
       if (confirm("Bạn có chắc muốn xóa?")) {
           accounts.splice(index, 1);
           localStorage.setItem("accounts", JSON.stringify(accounts));
           showUser();
       }
   }
   
   function editAccount(phone) {
       document.querySelector(".signup").classList.add("open");
       document.querySelectorAll(".add-account-e").forEach(item => item.style.display = "none");
       document.querySelectorAll(".edit-account-e").forEach(item => item.style.display = "block");
   
       let accounts = JSON.parse(localStorage.getItem("accounts"));
       let index = accounts.findIndex(item => item.phone == phone);
       indexFlag = index;
   
       document.getElementById("fullname").value = accounts[index].fullname;
       document.getElementById("phone").value = accounts[index].phone;
       document.getElementById("password").value = accounts[index].password;
       document.getElementById("user-status").checked = accounts[index].status == 1 ? true : false;
   }
   
   // Xử lý nút Update Account
   let updateAccount = document.getElementById("btn-update-account");
   if (updateAccount) {
       updateAccount.addEventListener("click", (e) => {
           e.preventDefault();
           let accounts = JSON.parse(localStorage.getItem("accounts"));
           let fullname = document.getElementById("fullname").value;
           let phone = document.getElementById("phone").value;
           let password = document.getElementById("password").value;
   
           if (fullname == "" || phone == "" || password == "") {
               toast({ title: 'Chú ý', message: 'Vui lòng nhập đầy đủ thông tin !', type: 'warning', duration: 3000 });
           } else {
               accounts[indexFlag].fullname = fullname;
               accounts[indexFlag].phone = phone;
               accounts[indexFlag].password = password;
               accounts[indexFlag].status = document.getElementById("user-status").checked ? 1 : 0;
               
               localStorage.setItem("accounts", JSON.stringify(accounts));
               toast({ title: 'Thành công', message: 'Thay đổi thông tin thành công !', type: 'success', duration: 3000 });
               document.querySelector(".signup").classList.remove("open");
               showUser();
           }
       });
   }
   
   // Xử lý nút Add Account
   let addAccount = document.getElementById('signup-button');
   if (addAccount) {
       addAccount.addEventListener("click", (e) => {
           e.preventDefault();
           let fullNameUser = document.getElementById('fullname').value;
           let phoneUser = document.getElementById('phone').value;
           let passwordUser = document.getElementById('password').value;
           
           let valid = true;
   
           if (fullNameUser.length == 0) {
               document.querySelector('.form-message-name').innerHTML = 'Vui lòng nhập họ và tên';
               valid = false;
           } else {
               document.querySelector('.form-message-name').innerHTML = '';
           }
   
           if (phoneUser.length != 10) {
               document.querySelector('.form-message-phone').innerHTML = 'Vui lòng nhập số điện thoại 10 số';
               valid = false;
           } else {
               document.querySelector('.form-message-phone').innerHTML = '';
           }
   
           if (passwordUser.length < 6) {
               document.querySelector('.form-message-password').innerHTML = 'Mật khẩu phải > 6 ký tự';
               valid = false;
           } else {
               document.querySelector('.form-message-password').innerHTML = '';
           }
   
           if (valid) {
               let accounts = localStorage.getItem('accounts') ? JSON.parse(localStorage.getItem('accounts')) : [];
               let checkloop = accounts.some(account => account.phone == phoneUser);
               if (!checkloop) {
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
                   };
                   accounts.push(user);
                   localStorage.setItem('accounts', JSON.stringify(accounts));
                   
                   toast({ title: 'Thành công', message: 'Tạo thành công tài khoản !', type: 'success', duration: 3000 });
                   document.querySelector(".signup").classList.remove("open");
                   
                   // RESET TÌM KIẾM ĐỂ HIỆN USER MỚI NGAY
                   document.getElementById("tinh-trang-user").value = 2;
                   document.getElementById("form-search-user").value = "";
                   showUser();
                   
                   signUpFormReset();
               } else {
                   toast({ title: 'Cảnh báo !', message: 'Số điện thoại đã tồn tại !', type: 'error', duration: 3000 });
               }
           }
       });
   }

function showThongKe(arr, mode) {
    // Merge sản phẩm giống nhau
    let mergeObj = [];
    arr.forEach(item => {
        let check = mergeObj.find(i => i.id == item.id);
        if (check) {
            check.quantity += parseInt(item.quantity);
            check.doanhthu += parseInt(item.price) * parseInt(item.quantity);
        } else {
            let newItem = { ...item };
            newItem.doanhthu = newItem.price * newItem.quantity;
            mergeObj.push(newItem);
        }
    });

    // Sort
    switch (mode) {
        case 1: mergeObj.sort((a, b) => a.quantity - b.quantity); break;
        case 2: mergeObj.sort((a, b) => b.quantity - a.quantity); break;
    }

    // Hiển thị tổng quan
    document.getElementById("quantity-product").innerText = mergeObj.length;
    document.getElementById("quantity-order").innerText = mergeObj.reduce((sum, cur) => sum + cur.quantity, 0);
    document.getElementById("quantity-sale").innerText = vnd(mergeObj.reduce((sum, cur) => sum + cur.doanhthu, 0));

    // Render bảng
    let orderHtml = "";
    mergeObj.forEach((item, index) => {
        orderHtml += `
        <tr>
            <td>${index + 1}</td>
            <td><div class="prod-img-title"><img class="prd-img-tbl" src="${item.img}" alt=""><p>${item.title}</p></div></td>
            <td>${item.quantity}</td>
            <td>${vnd(item.doanhthu)}</td>
            <td><button class="btn-detail product-order-detail" onclick="detailOrderProduct(${item.id})"><i class="fa-regular fa-eye"></i> Chi tiết</button></td>
        </tr>`;
    });
    document.getElementById("showTk").innerHTML = orderHtml;
}

let logoutBtn = document.getElementById("logout-acc");
if(logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem("currentuser");
        window.location.href = "index.html";
    });
}