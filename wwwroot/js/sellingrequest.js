const connection = new signalR.HubConnectionBuilder().withUrl("/scrapListHub").build();

$(document).ready(function () {
    // Initialize DataTable
    var table = $('#dataTable').DataTable({
        paging: true,
        searching: true,
        info: true,
        destroy: true,
        colReorder: {
            realtime: true
        },
    });

    // Start SignalR connection
    connection.start().then(() => {
        console.log(connection.state);

        // Listen for SignalR event to insert new data into DataTable
        connection.on("ReceiveScrapListInsert", function (newData) {
            console.log("Received Data:", newData);  // ตรวจสอบข้อมูลที่ได้รับ

            // ตรวจสอบว่า newData เป็นวัตถุที่ถูกต้อง
            if (!newData || typeof newData !== 'object') {
                console.error("Received data is not an object.");
                return;
            }

            // ฟังก์ชันแปลงวันที่ให้เป็น "dd MMM yyyy"
            function formatDate(dateString) {
                const date = new Date(dateString);
                const options = { day: '2-digit', month: 'short', year: 'numeric' };
                return date.toLocaleDateString('en-GB', options); // 'en-GB' ใช้สำหรับเดือนเป็นภาษาอังกฤษ
            }

            // ฟังก์ชันแปลงราคาเป็นทศนิยม 2 ตำแหน่ง
            function formatPrice(price) {
                return parseFloat(price).toFixed(2); // ใช้ toFixed เพื่อกำหนดทศนิยม 2 ตำแหน่ง
            }

            // ฟังก์ชันแปลง CustomerId เป็น CustomerName
            function getCustomerName(customerId) {
                var customerName = "";
                // ค้นหาชื่อลูกค้าจาก customersList
                $.each(customersList, function (index, customer) {
                    if (customer.Id == customerId) {
                        customerName = customer.CustomerName;
                        return false; // หยุดการค้นหาหลังจากพบลูกค้า
                    }
                });
                return customerName;
            }

            // ค้นหาชื่อลูกค้า
            let customerName = getCustomerName(newData.customerId);

            // สร้าง <tr> แบบ custom ด้วย id และ data-id ที่ต้องการ
            let tr = $('<tr>', {
                id: 'row-' + newData.id,  // สร้าง id ให้กับ <tr>
                'data-id': newData.id,    // สร้าง data-id
                class: 'intro-x'     // เพิ่ม class สำหรับ CSS
            });

            // แปลงวันที่เป็น "dd MMM yyyy"
            let formattedDate = formatDate(newData.contractExpireDate);
            let formattedDate2 = formatDate(newData.contractEffectiveDate);

            // แปลงราคาสำหรับการแสดงผล
            let formattedPrice = formatPrice(newData.price);

            // สร้าง <td> สำหรับแต่ละคอลัมน์ในแถว
            tr.append('<td class="text-left">' + newData.scrapNo + '</td>');
            tr.append('<td class="text-left">' + newData.plant + '</td>');
            tr.append('<td class="text-left text-warning"> Waiting </td>');
            tr.append('<td class="text-left text-success">' + formattedDate2 + '</td>'); // ใช้วันที่ที่แปลงแล้ว
            tr.append('<td class="text-left text-success">' + formattedDate + '</td>');
            tr.append('<td class="text-left text-warning"> Waiting </td>');
            tr.append('<td class="text-left text-warning"> Waiting </td>');
            tr.append('<td class="text-left">' + newData.sellingItem + '</td>');
            tr.append('<td class="text-left">' + newData.customerName + '</td>'); // ใช้ customerName ที่แปลงแล้ว
            tr.append('<td class="text-left">' + formattedPrice + '</td>'); // ใช้ราคาที่แปลงแล้ว
            tr.append('<td class="text-left">' + newData.unit + '</td>');
            tr.append('<td class="text-left text-warning"> Waiting </td>');
            tr.append('<td class="w-40"> <div class="progress mt-3"> <div class="progress-bar w-2/3 bg-success" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">50%</div> </div> </td>');

            // สร้าง <td> สำหรับปุ่ม Edit และ Delete
            let actionsTd =
                '<td class="w-56">' +
                '<div class="flex justify-center items-center">' +
                '<a href="/WEB/MasterScrapList/EditMasterSCR?idscrap=' + newData.id + '&idcus=' + newData.customerId + '">' +
                '<button class="btn btn-border-none mr-2" aria-expanded="false" type="submit">' +
                '<div class="w-8 h-8 bg-primary/10 dark:bg-primary/20 text-primary/80 flex items-center justify-center rounded-full">' +
                '<i class="fa-solid fa-pencil w-4 h-4"></i>' +
                '</div>' +
                '</button>' +
                '</a>' +
                '</div>' +
                '</td>';

            tr.append(actionsTd);

            // เพิ่มแถวลงใน DataTable
            var table = $('#dataTable').DataTable();
            table.row.add(tr[0]).draw();  // ใช้ [0] เพื่อดึงค่า DOM node ของ <tr> ที่สร้างขึ้น
        });

        // Listen for SignalR event to update existing data in DataTable
        connection.on("ReceiveScrapListEdit", function (updatedData) {
            console.log("Received Updated Data:", updatedData);

            // Initialize DataTable if not already initialized
            var table = $('#dataTable').DataTable();

            // ค้นหาแถวที่มี data-id ตรงกับ updatedData.id
            const row = table.row(function (idx, data, node) {
                return $(node).data('id') === updatedData.id;  // Find the row by data-id
            });

            if (row.length) {
                // Function to format date as '21 Nov 2024'
                function formatDate(date) {
                    const options = { year: 'numeric', month: 'short', day: 'numeric' };
                    return new Date(date).toLocaleDateString('en-GB', options);
                }

                // Format the contract expire date
                var formattedDate = updatedData.contractEffectiveDate ?
                    "<span class='text-success'>" + formatDate(updatedData.contractEffectiveDate) + "</span>" :
                    "<span class='text-warning'>Waiting</span>";

                var formattedDate2 = updatedData.contractExpireDate ?
                    "<span class='text-success'>" + formatDate(updatedData.contractExpireDate) + "</span>" :
                    "<span class='text-warning'>Waiting</span>";

                var formattedlimitQtyValue = updatedData.limitQtyValue ?
                    "<span class='text-success'>" + updatedData.limitQtyValue + "</span>" :
                    "<span class='text-warning'>Waiting</span>";

                var formattedindustry = updatedData.industry ?
                    "<span class='text-success'>" + updatedData.industry + "</span>" :
                    "<span class='text-warning'>Waiting</span>";

                // Format the price (if applicable)
                var formattedPrice = updatedData.price ? updatedData.price.toFixed(2) : "0.00";

                // Update the row data
                row.data([
                    updatedData.scrapNo,                  // ScrapNo
                    updatedData.plant,                    // Plant
                    formattedlimitQtyValue,  // Column 3: Status or remaining
                    formattedDate,                        // Contract Expire Date (with text-success)
                    formattedDate2,                       // Column 5: Contract Expiry Date
                    "<span class='text-warning'>Waiting</span>",  // Column 6: Transfer Quantity
                    formattedindustry,  // Column 7: Department Name
                    updatedData.sellingItem,              // Selling Item
                    updatedData.customerName,             // Customer Name
                    formattedPrice,                       // Price
                    updatedData.unit,                     // Unit
                    "SCR",                                // Type (static value as per your example)
                    "<div class='progress mt-3'><div class='progress-bar w-2/3 bg-success' role='progressbar' aria-valuenow='50' aria-valuemin='0' aria-valuemax='100'>50%</div></div>", // Progress Bar
                    "<div class='flex flex-wrap'>" +
                    "<form action='/MasterScrapList/EditMasterSCR' method='get'>" +
                    "<button class='btn btn-border-none mr-2' type='submit'>" +
                    "<div class='w-8 h-8 bg-primary/10 dark:bg-primary/20 text-primary/80 flex items-center justify-center rounded-full'>" +
                    "<i class='fa-solid fa-pencil w-4 h-4'></i>" +
                    "</div>" +
                    "</button>" +
                    "</form>" +
                    "</div>"  // Edit button
                ]).invalidate().draw();  // Invalidate the row to ensure it re-renders
            } else {
                console.warn("Row with data-id " + updatedData.id + " not found.");
            }
        });

    }).catch(err => console.error(err.toString()));
});