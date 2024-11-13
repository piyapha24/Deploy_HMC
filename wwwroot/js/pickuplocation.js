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

        connection.on("SignalrDeleted", function (id) {
            const row = table.row(function (idx, data, node) {
                return $(node).data('id') === id;  // ตรวจสอบว่า data-id ตรงกับ id ที่ส่งมาจาก SignalR
            });
            if (row.length) {
                // ลบแถวจาก DataTable
                let table = $('#dataTable').DataTable();
                table.row(row).remove().draw();
            }
        });

        // Listen for SignalR event to insert new data into DataTable
        connection.on("PickupLocationListInsert", function (newData) {
            console.log("Received Data:", newData);  // ตรวจสอบข้อมูลที่ได้รับ

            // ตรวจสอบว่า newData เป็นวัตถุที่ถูกต้อง
            if (!newData || typeof newData !== 'object') {
                console.error("Received data is not an object.");
                return;
            }

            // สร้าง <tr> แบบ custom ด้วย id และ data-id ที่ต้องการ
            let tr = $('<tr>', {
                id: 'row-' + newData.id,  // สร้าง id ให้กับ <tr>
                'data-id': newData.id,    // สร้าง data-id
                class: 'intro-x'     // เพิ่ม class สำหรับ CSS
            });

            // สร้าง <td> สำหรับแต่ละคอลัมน์ในแถว
            tr.append('<td class="text-left">' + newData.plant + '</td>');
            tr.append('<td class="text-left">' + newData.name + '</td>');
            tr.append('<td class="text-left">' + newData.locationName + '</td>');
            tr.append('<td class="text-left">' + newData.address + '</td>');
            tr.append('<td class="text-left">' + newData.contactPerson + '</td>');
            tr.append('<td class="text-left">' + newData.phone + '</td>');

            // สร้าง <td> สำหรับ status (Active/Inactive)
            let statusTd = newData.isActive ?
                '<div class="flex items-center justify-center text-success"><i class="w-4 h-4 mr-2 mt-1 fas fa-check-square"></i> Active</div>' :
                '<div class="flex items-center justify-center text-danger"><i class="w-4 h-4 mr-2 mt-1 fas fa-check-square"></i> Inactive</div>';
            tr.append('<td class="w-40">' + statusTd + '</td>');

            // สร้าง <td> สำหรับปุ่ม Edit และ Delete
            let actionsTd =
                '<td class="w-56">' +
                '<div class="flex justify-center items-center">' +
                '<a href="/WEB/PickupLocation/EditPickupPoint/' + newData.id + '">' +
                '<button class="btn btn-border-none mr-2" aria-expanded="false" type="submit">' +
                '<div class="w-8 h-8 bg-primary/10 dark:bg-primary/20 text-primary/80 flex items-center justify-center rounded-full">' +
                '<i class="fa-solid fa-pencil w-4 h-4"></i>' +
                '</div>' +
                '</button>' +
                '</a>' +
                '<button class="btn btn-border-none mr-2 delete-button" data-id="' + newData.id + '" data-tw-toggle="modal" data-tw-target="#delete-confirmation-modal" onclick="setDeleteId(this)">' +
                '<div class="w-8 h-8 bg-red-200 text-danger flex items-center justify-center rounded-full">' +
                '<i class="fa-solid fa-trash w-4 h-4"></i>' +
                '</div>' +
                '</button>' +
                '</div>' +
                '</td>';

            tr.append(actionsTd);

            // เพิ่มแถวลงใน DataTable
            var table = $('#dataTable').DataTable();
            table.row.add(tr[0]).draw();  // ใช้ [0] เพื่อดึงค่า DOM node ของ <tr> ที่สร้างขึ้น
        });

        // Listen for SignalR event to update existing data in DataTable
        connection.on("PickupLocationListEdit", function (updatedData) {
            console.log("Received Updated Data:", updatedData);

            // ค้นหาแถวที่มี data-id ตรงกับ updatedData.id
            const row = table.row(function (idx, data, node) {
                return $(node).data('id') === updatedData.id;
            });

            if (row.length) {
                // อัปเดตข้อมูลของแถวที่ตรงกับ id
                row.data([
                    updatedData.plant,
                    updatedData.name,
                    updatedData.locationName,
                    updatedData.address,
                    updatedData.contactPerson,
                    updatedData.phone,
                    updatedData.isActive ?
                        '<div class="flex items-center justify-center text-success"><i class="w-4 h-4 mr-2 mt-1 fas fa-check-square"></i> Active</div>' :
                        '<div class="flex items-center justify-center text-danger"><i class="w-4 h-4 mr-2 mt-1 fas fa-check-square"></i> Inactive</div>',
                    '<div class="flex justify-center items-center">' +
                    '<a href="/WEB/PickupLocation/EditPickupPoint/' + updatedData.id + '">' +
                    '<button class="btn btn-border-none mr-2" type="submit">' +
                    '<div class="w-8 h-8 bg-primary/10 dark:bg-primary/20 text-primary/80 flex items-center justify-center rounded-full">' +
                    '<i class="fa-solid fa-pencil w-4 h-4"></i>' +
                    '</div>' +
                    '</button>' +
                    '</a>' +
                    '<button class="btn btn-border-none mr-2 delete-button" data-id="' + updatedData.id + '" data-tw-toggle="modal" data-tw-target="#delete-confirmation-modal" onclick="setDeleteId(this)">' +
                    '<div class="w-8 h-8 bg-red-200 text-danger flex items-center justify-center rounded-full">' +
                    '<i class="fa-solid fa-trash w-4 h-4"></i>' +
                    '</div>' +
                    '</button>' +
                    '</div>'
                ]).draw();
            }
        });

    }).catch(err => console.error(err.toString()));
});