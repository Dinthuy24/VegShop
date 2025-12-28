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

function vnd(price) {
    return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
}

function formatDate(date) {
    let fm = new Date(date);
    let yyyy = fm.getFullYear();
    let mm = fm.getMonth() + 1;
    let dd = fm.getDate();
    if (dd < 10) dd = "0" + dd;
    if (mm < 10) mm = "0" + mm;
    return dd + "/" + mm + "/" + yyyy;
}

// Hàm khởi tạo ID tự động
function createId(arr) {
    let id = arr.length;
    let check = arr.find((item) => item.id == id);
    while (check != null) {
        id++;
        check = arr.find((item) => item.id == id);
    }
    return id;
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
    QUẢN LÝ SẢN PHẨM (PRODUCT)
   ============================================== */
   let perPage = 12;
   let currentPage = 1;
   let indexCur;
   
   function showProductArr(arr) {
       let productHtml = "";
       if (arr.length == 0) {
           productHtml = `<div class="no-result"><div class="no-result-i"><i class="fa-light fa-face-sad-cry"></i></div><div class="no-result-h">Không có sản phẩm để hiển thị</div></div>`;
       } else {
           arr.forEach(product => {
               let btnCtl = product.status == 1 ?
                   `<button class="btn-delete" onclick="deleteProduct(${product.id})"><i class="fa-regular fa-trash"></i></button>` :
                   `<button class="btn-delete" onclick="changeStatusProduct(${product.id})"><i class="fa-regular fa-eye"></i></button>`;
               productHtml += `
               <div class="list">
                   <div class="list-left">
                       <img src="${product.img}" alt="">
                       <div class="list-info">
                           <h4>${product.title}</h4>
                           <p class="list-note">${product.desc}</p>
                           <span class="list-category">${product.category}</span>
                       </div>
                   </div>
                   <div class="list-right">
                       <div class="list-price">
                           <span class="list-current-price">${vnd(product.price)}</span>                   
                       </div>
                       <div class="list-control">
                           <div class="list-tool">
                               <button class="btn-edit" onclick="editProduct(${product.id})"><i class="fa-light fa-pen-to-square"></i></button>
                               ${btnCtl}
                           </div>                           
                       </div>
                   </div> 
               </div>`;
           });
       }
       document.getElementById("show-product").innerHTML = productHtml;
   }
   
   function showProduct() {
       let selectOp = document.getElementById('the-loai').value;
       let valeSearchInput = document.getElementById('form-search-product').value;
       let products = localStorage.getItem("products") ? JSON.parse(localStorage.getItem("products")) : [];
       let result = [];
   
       if (selectOp == "Tất cả") {
           result = products.filter((item) => item.status == 1);
       } else if (selectOp == "Đã xóa") {
           result = products.filter((item) => item.status == 0);
       } else {
           result = products.filter((item) => item.category == selectOp);
       }
   
       result = valeSearchInput == "" ? result : result.filter(item => {
           return item.title.toString().toUpperCase().includes(valeSearchInput.toString().toUpperCase());
       })
   
       displayList(result, perPage, currentPage);
       setupPagination(result, perPage, currentPage);
   }
   
   function displayList(productAll, perPage, currentPage) {
       let start = (currentPage - 1) * perPage;
       let end = (currentPage - 1) * perPage + perPage;
       let productShow = productAll.slice(start, end);
       showProductArr(productShow);
   }
   
   function setupPagination(productAll, perPage) {
       let page_nav_list = document.querySelector('.page-nav-list');
       if (page_nav_list) {
           page_nav_list.innerHTML = '';
           let page_count = Math.ceil(productAll.length / perPage);
           for (let i = 1; i <= page_count; i++) {
               let li = paginationChange(i, productAll, currentPage);
               page_nav_list.appendChild(li);
           }
       }
   }
   
   function paginationChange(page, productAll, currentPage) {
       let node = document.createElement(`li`);
       node.classList.add('page-nav-item');
       node.innerHTML = `<a href="#">${page}</a>`;
       if (currentPage == page) node.classList.add('active');
       node.addEventListener('click', function() {
           currentPage = page;
           displayList(productAll, perPage, currentPage);
           let t = document.querySelectorAll('.page-nav-item.active');
           for (let i = 0; i < t.length; i++) {
               t[i].classList.remove('active');
           }
           node.classList.add('active');
       })
       return node;
   }
   
   // Xử lý ảnh: Chuyển sang Base64 và kiểm tra dung lượng
   function uploadImage(el) {
       let file = el.files[0];
       if (file) {
           // Kiểm tra dung lượng (giới hạn 800KB để tránh lỗi localStorage)
           if (file.size > 800 * 1024) {
               alert("File ảnh quá lớn (>800KB)! Vui lòng chọn ảnh nhẹ hơn.");
               el.value = "";
               return;
           }
           let reader = new FileReader();
           reader.onload = function(e) {
               document.querySelector(".upload-image-preview").src = e.target.result;
           };
           reader.readAsDataURL(file);
       }
   }
   
   function setDefaultValue() {
       document.querySelector(".upload-image-preview").src = "./assets/img/blank-image.png";
       document.getElementById("ten-san-pham").value = "";
       document.getElementById("gia-moi").value = "";
       document.getElementById("mo-ta").value = "";
       document.getElementById("chon-san-pham").value = "Rau";
   }
   
   function cancelSearchProduct() {
       let products = localStorage.getItem("products") ? JSON.parse(localStorage.getItem("products")).filter(item => item.status == 1) : [];
       document.getElementById('the-loai').value = "Tất cả";
       document.getElementById('form-search-product').value = "";
       displayList(products, perPage, currentPage);
       setupPagination(products, perPage, currentPage);
   }
   
   function deleteProduct(id) {
       let products = JSON.parse(localStorage.getItem("products"));
       let index = products.findIndex(item => item.id == id);
       if (confirm("Bạn có chắc muốn xóa?") == true) {
           products[index].status = 0;
           toast({ title: 'Success', message: 'Xóa sản phẩm thành công !', type: 'success', duration: 3000 });
           localStorage.setItem("products", JSON.stringify(products));
           showProduct();
       }
   }
   
   function changeStatusProduct(id) {
       let products = JSON.parse(localStorage.getItem("products"));
       let index = products.findIndex(item => item.id == id);
       if (confirm("Bạn có chắc chắn muốn hủy xóa?") == true) {
           products[index].status = 1;
           toast({ title: 'Success', message: 'Khôi phục sản phẩm thành công !', type: 'success', duration: 3000 });
           localStorage.setItem("products", JSON.stringify(products));
           showProduct();
       }
   }
   
   // Mở popup Thêm sản phẩm
   let btnAddProduct = document.getElementById("btn-add-product");
   if (btnAddProduct) {
       btnAddProduct.addEventListener("click", () => {
           document.querySelectorAll(".add-product-e").forEach(item => item.style.display = "block");
           document.querySelectorAll(".edit-product-e").forEach(item => item.style.display = "none");
           document.querySelector(".add-product").classList.add("open");
           setDefaultValue();
       });
   }
   
   // Xử lý nút LƯU trong popup Thêm
   let btnAddProductIn = document.getElementById("add-product-button");
   if (btnAddProductIn) {
       btnAddProductIn.addEventListener("click", (e) => {
           e.preventDefault();
           let imgProduct = document.querySelector(".upload-image-preview").src;
           let tenMon = document.getElementById("ten-san-pham").value;
           let price = document.getElementById("gia-moi").value;
           let moTa = document.getElementById("mo-ta").value;
           let categoryText = document.getElementById("chon-san-pham").value;
   
           if (tenMon == "" || price == "" || moTa == "") {
               toast({ title: "Chú ý", message: "Vui lòng nhập đầy đủ thông tin món!", type: "warning", duration: 3000 });
           } else {
               if (isNaN(price)) {
                   toast({ title: "Chú ý", message: "Giá phải ở dạng số!", type: "warning", duration: 3000 });
               } else {
                   let products = localStorage.getItem("products") ? JSON.parse(localStorage.getItem("products")) : [];
                   let product = {
                       id: createId(products),
                       title: tenMon,
                       img: imgProduct,
                       category: categoryText,
                       price: parseInt(price),
                       desc: moTa,
                       status: 1
                   };
                   products.unshift(product);
                   localStorage.setItem("products", JSON.stringify(products));
                   showProduct();
                   document.querySelector(".add-product").classList.remove("open");
                   toast({ title: "Success", message: "Thêm sản phẩm thành công!", type: "success", duration: 3000 });
                   setDefaultValue();
               }
           }
       });
   }
   
   // Mở popup Sửa sản phẩm
   function editProduct(id) {
       let products = localStorage.getItem("products") ? JSON.parse(localStorage.getItem("products")) : [];
       let index = products.findIndex(item => item.id == id);
       indexCur = index; // Lưu lại vị trí đang sửa
   
       document.querySelectorAll(".add-product-e").forEach(item => item.style.display = "none");
       document.querySelectorAll(".edit-product-e").forEach(item => item.style.display = "block");
       document.querySelector(".add-product").classList.add("open");
   
       // Đổ dữ liệu cũ vào form
       document.querySelector(".upload-image-preview").src = products[index].img;
       document.getElementById("ten-san-pham").value = products[index].title;
       document.getElementById("gia-moi").value = products[index].price;
       document.getElementById("mo-ta").value = products[index].desc;
       document.getElementById("chon-san-pham").value = products[index].category;
   }
   
   // Xử lý nút LƯU trong popup Sửa
   let btnUpdateProductIn = document.getElementById("update-product-button");
   if (btnUpdateProductIn) {
       btnUpdateProductIn.addEventListener("click", (e) => {
           e.preventDefault();
           let products = JSON.parse(localStorage.getItem("products"));
           let idProduct = products[indexCur].id;
           let imgProductCur = document.querySelector(".upload-image-preview").src;
           let titleProductCur = document.getElementById("ten-san-pham").value;
           let curProductCur = document.getElementById("gia-moi").value;
           let descProductCur = document.getElementById("mo-ta").value;
           let categoryText = document.getElementById("chon-san-pham").value;
   
           let productadd = {
               id: idProduct,
               title: titleProductCur,
               img: imgProductCur,
               category: categoryText,
               price: parseInt(curProductCur),
               desc: descProductCur,
               status: 1,
           };
           
           products[indexCur] = productadd; // Cập nhật
           localStorage.setItem("products", JSON.stringify(products));
           
           toast({ title: "Success", message: "Sửa sản phẩm thành công!", type: "success", duration: 3000 });
           document.querySelector(".add-product").classList.remove("open");
           showProduct();
       });
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

   /* ==============================================
   QUẢN LÝ ĐƠN HÀNG (ORDER)
   ============================================== */
function showOrder(arr) {
    let orderHtml = "";
    if (arr.length == 0) {
        orderHtml = `<td colspan="6">Không có dữ liệu</td>`
    } else {
        arr.forEach((item) => {
            let status = item.trangthai == 0 ? `<span class="status-no-complete">Chưa xử lý</span>` : `<span class="status-complete">Đã xử lý</span>`;
            let date = formatDate(item.thoigiandat);
            orderHtml += `
            <tr>
                <td>${item.id}</td>
                <td>${item.khachhang}</td>
                <td>${date}</td>
                <td>${vnd(item.tongtien)}</td>                      
                <td>${status}</td>
                <td class="control">
                    <button class="btn-detail" onclick="detailOrder('${item.id}')"><i class="fa-regular fa-eye"></i> Chi tiết</button>
                </td>
            </tr>`;
        });
    }
    document.getElementById("showOrder").innerHTML = orderHtml;
}

function findOrder() {
    let tinhTrang = parseInt(document.getElementById("tinh-trang").value);
    let ct = document.getElementById("form-search-order").value;
    let timeStart = document.getElementById("time-start").value;
    let timeEnd = document.getElementById("time-end").value;

    if (timeEnd < timeStart && timeEnd != "" && timeStart != "") {
        alert("Lựa chọn thời gian sai !");
        return;
    }
    let orders = localStorage.getItem("order") ? JSON.parse(localStorage.getItem("order")) : [];
    let result = tinhTrang == 2 ? orders : orders.filter((item) => item.trangthai == tinhTrang);
    
    result = ct == "" ? result : result.filter((item) => {
        return (item.khachhang.toLowerCase().includes(ct.toLowerCase()) || item.id.toString().toLowerCase().includes(ct.toLowerCase()));
    });

    if (timeStart != "" && timeEnd == "") {
        result = result.filter((item) => new Date(item.thoigiandat) >= new Date(timeStart).setHours(0, 0, 0));
    } else if (timeStart == "" && timeEnd != "") {
        result = result.filter((item) => new Date(item.thoigiandat) <= new Date(timeEnd).setHours(23, 59, 59));
    } else if (timeStart != "" && timeEnd != "") {
        result = result.filter((item) => new Date(item.thoigiandat) >= new Date(timeStart).setHours(0, 0, 0) && new Date(item.thoigiandat) <= new Date(timeEnd).setHours(23, 59, 59));
    }
    showOrder(result);
}

function detailOrder(id) {
    document.querySelector(".modal.detail-order").classList.add("open");
    let orders = localStorage.getItem("order") ? JSON.parse(localStorage.getItem("order")) : [];
    let products = localStorage.getItem("products") ? JSON.parse(localStorage.getItem("products")) : [];
    let order = orders.find((item) => item.id == id);
    let ctDon = getOrderDetails(id);
    
    let spHtml = `<div class="modal-detail-left"><div class="order-item-group">`;
    ctDon.forEach((item) => {
        let detaiSP = products.find(product => product.id == item.id);
        // Fallback nếu sản phẩm đã bị xóa
        let title = detaiSP ? detaiSP.title : "Sản phẩm đã xóa";
        let img = detaiSP ? detaiSP.img : "./assets/img/blank-image.png";
        
        spHtml += `<div class="order-product">
            <div class="order-product-left">
                <img src="${img}" alt="">
                <div class="order-product-info">
                    <h4>${title}</h4>
                    <p class="order-product-note"><i class="fa-light fa-pen"></i> ${item.note}</p>
                    <p class="order-product-quantity">SL: ${item.soluong}<p>
                </div>
            </div>
            <div class="order-product-right">
                <div class="order-product-price">
                    <span class="order-product-current-price">${vnd(item.price)}</span>
                </div>
            </div>
        </div>`;
    });
    spHtml += `</div></div>`;
    
    spHtml += `<div class="modal-detail-right">
        <ul class="detail-order-group">
            <li class="detail-order-item">
                <span class="detail-order-item-left"><i class="fa-light fa-calendar-days"></i> Ngày đặt hàng</span>
                <span class="detail-order-item-right">${formatDate(order.thoigiandat)}</span>
            </li>
            <li class="detail-order-item">
                <span class="detail-order-item-left"><i class="fa-light fa-truck"></i> Hình thức giao</span>
                <span class="detail-order-item-right">${order.hinhthucgiao}</span>
            </li>
            <li class="detail-order-item">
                <span class="detail-order-item-left"><i class="fa-thin fa-person"></i> Người nhận</span>
                <span class="detail-order-item-right">${order.tenguoinhan}</span>
            </li>
            <li class="detail-order-item">
                <span class="detail-order-item-left"><i class="fa-light fa-phone"></i> Số điện thoại</span>
                <span class="detail-order-item-right">${order.sdtnhan}</span>
            </li>
            <li class="detail-order-item tb">
                <span class="detail-order-item-left"><i class="fa-light fa-clock"></i> Thời gian giao</span>
                <p class="detail-order-item-b">${(order.thoigiangiao == "" ? "" : (order.thoigiangiao + " - ")) + formatDate(order.ngaygiaohang)}</p>
            </li>
            <li class="detail-order-item tb">
                <span class="detail-order-item-t"><i class="fa-light fa-location-dot"></i> Địa chỉ nhận</span>
                <p class="detail-order-item-b">${order.diachinhan}</p>
            </li>
            <li class="detail-order-item tb">
                <span class="detail-order-item-t"><i class="fa-light fa-note-sticky"></i> Ghi chú</span>
                <p class="detail-order-item-b">${order.ghichu}</p>
            </li>
        </ul>
    </div>`;
    
    document.querySelector(".modal-detail-order").innerHTML = spHtml;

    let classDetailBtn = order.trangthai == 0 ? "btn-chuaxuly" : "btn-daxuly";
    let textDetailBtn = order.trangthai == 0 ? "Chưa xử lý" : "Đã xử lý";
    document.querySelector(".modal-detail-bottom").innerHTML = `<div class="modal-detail-bottom-left">
        <div class="price-total">
            <span class="thanhtien">Thành tiền</span>
            <span class="price">${vnd(order.tongtien)}</span>
        </div>
    </div>
    <div class="modal-detail-bottom-right">
        <button class="modal-detail-btn ${classDetailBtn}" onclick="changeStatus('${order.id}',this)">${textDetailBtn}</button>
    </div>`;
}

function getOrderDetails(madon) {
    let orderDetails = localStorage.getItem("orderDetails") ? JSON.parse(localStorage.getItem("orderDetails")) : [];
    return orderDetails.filter((item) => item.madon == madon);
}

function changeStatus(id, el) {
    let orders = JSON.parse(localStorage.getItem("order"));
    let order = orders.find((item) => item.id == id);
    order.trangthai = 1;
    el.classList.remove("btn-chuaxuly");
    el.classList.add("btn-daxuly");
    el.innerHTML = "Đã xử lý";
    localStorage.setItem("order", JSON.stringify(orders));
    findOrder(); // Refresh lại danh sách
}

/* ==============================================
   DASHBOARD & THỐNG KÊ
   ============================================== */
   function getAmoumtProduct() {
    let products = localStorage.getItem("products") ? JSON.parse(localStorage.getItem("products")) : [];
    return products.length;
}

function getAmoumtUser() {
    let accounts = localStorage.getItem("accounts") ? JSON.parse(localStorage.getItem("accounts")) : [];
    return accounts.filter(item => item.userType == 0).length;
}

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

function thongKe(mode) {
    let categoryTk = document.getElementById("the-loai-tk").value;
    let ct = document.getElementById("form-search-tk").value;
    let timeStart = document.getElementById("time-start-tk").value;
    let timeEnd = document.getElementById("time-end-tk").value;

    let orders = localStorage.getItem("order") ? JSON.parse(localStorage.getItem("order")) : [];
    let products = localStorage.getItem("products") ? JSON.parse(localStorage.getItem("products")) : [];
    let orderDetails = localStorage.getItem("orderDetails") ? JSON.parse(localStorage.getItem("orderDetails")) : [];
    
    // Tạo mảng thống kê chi tiết
    let arrDetail = [];
    orderDetails.forEach(item => {
        let prod = products.find(p => p.id == item.id);
        if(prod) { // Chỉ thống kê sản phẩm còn tồn tại
            let order = orders.find(o => o.id == item.madon);
            if(order && order.trangthai == 1) { // Chỉ tính đơn đã thành công
                arrDetail.push({
                    id: item.id,
                    madon: item.madon,
                    price: item.price,
                    quantity: item.soluong,
                    category: prod.category,
                    title: prod.title,
                    img: prod.img,
                    time: order.thoigiandat
                });
            }
        }
    });

    // Filter logic
    let result = categoryTk == "Tất cả" ? arrDetail : arrDetail.filter((item) => item.category == categoryTk);
    result = ct == "" ? result : result.filter((item) => item.title.toLowerCase().includes(ct.toLowerCase()));

    if (timeStart != "" && timeEnd == "") {
        result = result.filter((item) => new Date(item.time) > new Date(timeStart).setHours(0, 0, 0));
    } else if (timeStart == "" && timeEnd != "") {
        result = result.filter((item) => new Date(item.time) < new Date(timeEnd).setHours(23, 59, 59));
    } else if (timeStart != "" && timeEnd != "") {
        result = result.filter((item) => new Date(item.time) > new Date(timeStart).setHours(0, 0, 0) && new Date(item.time) < new Date(timeEnd).setHours(23, 59, 59));
    }
    
    showThongKe(result, mode);
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

function detailOrderProduct(id) {
    // Hàm này cần viết lại logic lấy chi tiết các đơn có chứa sản phẩm ID này nếu cần thiết
    // Hiện tại để trống hoặc hiển thị thông báo
    alert("Chức năng xem chi tiết lịch sử bán của sản phẩm này đang phát triển.");
}

let logoutBtn = document.getElementById("logout-acc");
if(logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem("currentuser");
        window.location.href = "index.html";
    });
}