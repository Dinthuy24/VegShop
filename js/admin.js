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

unction showThongKe(arr, mode) {
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