var datess = "";
$(document).ready(function () {
    // Initialize DataTable
    var qTimeToDayTable = $('#dataTable').DataTable({
        paging: true,
        searching: true,
        info: true,
        destroy: true,
        colReorder: {
            realtime: true
        },
        "processing": true,
        "serverSide": true,
        "filter": true,
        scrollY: false,
        scrollX: false,
        "ordering": false,
        "ajax": {
            "url": getQtimeToday,
            "type": "POST",
            "datatype": "json",
            data: function (e) {
                e.datefor = $('#Datefor').val();
                e.session = $('#Session').val();
                e.status = $("#statusall").val();
                e.types = $("#types").val();
                e.date = $("#dates").val();
                e.customerId = $("#CustomerId").val();
            },
        },
        columns: [
            { data: "plant", className: 'text-center' },
            { data: "docNo", className: 'text-center' },
            { data: "sellingItem", className: 'text-center' },
            { data: "locationName", className: 'text-center' },
            { data: "customerName", className: 'text-center' },
            { data: "reqName", className: 'text-center' },
            {
                data: "deliveryDate", render: function (data, type, row) {
                    var approvCustomer = row.approvCustomer;
                    var approvRequester = row.approvRequester;
                    const date = new Date(data);
                    const day = String(date.getDate()).padStart(2, '0');
                    var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    var month = monthNames[date.getMonth()];  // Get month name (e.g., 'Nov')
                    const year = date.getFullYear();

                    if (approvRequester == true && approvCustomer == true) {
                        return `
                        <div class="flex items-center justify-center text-success"> 
                            <i class="fa-regular fa-square-check mr-2"></i>
                            ${day} ${month} ${year}
                        </div>
                        `;
                    } else {
                        return `
                        <div class="flex items-center justify-center text-danger">
                            <i class="fa-regular fa-rectangle-xmark mr-2"></i>
                            ${day} ${month} ${year}
                        </div>
                        `;
                    }
                }, className: 'text-center'
            },
            { data: "nextStep", className: 'text-center' },
            {
                data: "changeMoving", render: function (data, type, row) {
                    var id = row.id;
                    var docNo = row.docNo;
                    var deliveryDate = row.deliveryDate;
                    var session = row.session;
                    var remark = row.remark;
                    console.log('gg1', remark);
                    var approvCustomer = row.approvCustomer;
                    var approvRequester = row.approvRequester;
                    if (data == true) {
                        return `
                            <div class="flex justify-center items-center">
                                <button class="QtimeBox-HMCbook" onclick="changeDeliveryDate('${id}', '${docNo}', '${deliveryDate}', '${session}', '${remark}')" data-tw-toggle="modal" data-tw-target="#basic-modal-preview">
                                    <p class="text-center m-0">
                                        เปลี่ยนวัน
                                    </p>
                                </button>
                            </div>
                        `;
                    } else if (approvRequester == true && approvCustomer == false) {
                        return `
                            <div class="flex justify-center items-center">
                                <a class="flex items-center mr-3 justify-center QtimeBox-HMCbook">
                                    <p class="text-center m-0">
                                        HMC จอง
                                    </p>
                                </a>
                            </div>
                        `;
                    } else if (approvRequester == true && approvCustomer == true) {
                        return `
                            <div class="flex justify-center items-center">
                                <a class="flex items-center mr-3 justify-center QtimeBox-complete">
                                    <p class="text-center m-0">
                                        ยืนยัน
                                    </p>
                                </a>
                            </div>
                        `;
                    }
                }, className: 'text-center'
            },
            {
                data: "status", render: function (data, type, row) {
                    var id = row.id;
                    if (data == true) {
                        return `
                            <div class="flex justify-center items-center">
                                <a class="flex items-center mr-3 justify-center QtimeBox-complete" href="/WEB/SellingRequest/DriverConfirm/${id}">
                                    <p class="text-center m-0">
                                        ข้อมูลครบ
                                    </p>
                                </a>
                            </div>
                        `;
                    } else {
                        return `
                            <div class="flex justify-center items-center">
                                <a class="flex items-center mr-3 justify-center QtimeBox-HMCbook">
                                    <p class="text-center m-0">
                                        กรอกข้อมูล
                                    </p>
                                </a>
                            </div>
                        `;
                    }
                }, className: 'text-center'
            }
        ],
        createdRow: function (row, data, dataIndex) {
            $(row).addClass('intro-x'); // Add your custom class
        }
    });

    $(".dataTables_filter").hide();
    $('#searchs').keyup(function () {
        qTimeToDayTable.search($(this).val()).draw();
    })
    $('#statusall').on("change", function () {
        qTimeToDayTable.ajax.reload();
    })
    $('#types').on("change", function () {
        qTimeToDayTable.ajax.reload();
    })

    setInterval(() => {
        if (datess != $("#dates").val()) {
            datess = $("#dates").val()
            qTimeToDayTable.ajax.reload();
        }
    }, 100)
});

function changeDeliveryDate(id, docNo, deliveryDate, session, remark) {
    $('#frmQtimeToDay')[0].reset();
    var dateObj = new Date(deliveryDate);
    // Extract the year, month, and day
    var year = dateObj.getFullYear();
    var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var month = monthNames[dateObj.getMonth()];  // Get month name (e.g., 'Nov')
    var day = dateObj.getDate().toString().padStart(2, '0');  // Ensure two-digit day
    // Format the date as 'dd MMM yyyy'
    var dateNow = `${day} ${month} ${year}`;
    console.log('remark', remark);
    $('.idSelling').val(id);
    $('.docNo').val(docNo);
    $('#delivery-date-fields').val(dateNow);
    $('#session-fields').val(session);
    $('#remark').val(remark);

    $('#id').val(id);
    $('#deliveryDates').val(dateNow);
    $('#sessions').val(session);
}

function submitConfirmDeliveryForm() {
    // Serialize form data
    var formData = $('#frmQtimeToDay').serializeArray(); // Converts to array of name-value pairs
    var id = $('#id').val(); // Retrieve the ID value from the form
    var deliveryDates = $('#delivery-date-fields').val(); // Retrieve the ID value from the form
    var sessions = $('#session-fields').val(); // Retrieve the ID value from the form
    var remark = $('#remark').val(); // Retrieve the ID value from the form
    var Datefor = $('#Datefor').val(); // Retrieve the ID value from the form
    var CustomerId = $('#CustomerId').val(); // Retrieve the ID value from the form
    // Add ID to form data
    formData.push({ name: 'id', value: id });
    formData.push({ name: 'deliveryDates', value: deliveryDates });
    formData.push({ name: 'sessions', value: sessions });
    formData.push({ name: 'remark', value: remark });
    formData.push({ name: 'Datefor', value: Datefor });
    formData.push({ name: 'CustomerId', value: CustomerId });
    // Send AJAX request
    $.ajax({
        url: '/WEB/SellingRequest/ConfirmDelivery',
        type: 'POST',
        data: $.param(formData), // Converts array back to a URL-encoded string
        success: function (response) {
            window.location.href = response.redirectToUrl;
        },
        error: function (xhr, status, error) {
            // Handle error - display error message
            alert("Error confirming delivery: " + (xhr.responseJSON?.message || error));
        }
    });
}