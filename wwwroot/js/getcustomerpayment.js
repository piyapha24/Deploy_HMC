﻿$(document).ready(function () {
    var getCustomerPaymentTable = $('#dataTable').DataTable({
        destroy: true,
        colReorder: {
            realtime: true
        },
        ajax: {
            url: getCustomerPayment,
            type: "POST",
            dataType: "json",
            data: function (e) {
                e.date = $("#dates").val();
                e.status = $("#statusall").val();
                e.types = $("#types").val();
            }, // Adjust based on your JSON structure
            error: function (jqXHR, textStatus, errorThrown) {
                console.error('AJAX Error:', textStatus, errorThrown);
                console.error('Response:', jqXHR.responseText);
            }
        },
        columns: [
            { data: "plant", className: 'text-center' },
            { data: "docNo", className: 'text-center' },
            { data: "sellingItem", className: 'text-center' },
            { data: "unitprice", className: 'text-center' },
            { data: "unit", className: 'text-center' },
            { data: "locationName", className: 'text-center' },
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
                data: "status", render: function (data, type, row) {
                    var nextStep = row.nextStep;  // Assuming 'nextStep' is available in your data
                    var statusHTML = '';

                    if (nextStep === "Transfer/Acc/Envi") {
                        statusHTML = `
                <div class="flex justify-center items-center">
                    <a href="/WEB/Customer/ReTransferSlip?sellingId=${row.id}" class="flex items-center mr-3 inProgressBox">${data}</a>
                </div>
            `;
                    } else {
                        statusHTML = `
                <div class="flex justify-center items-center">
                    <a href="/WEB/Customer/TransferSlipDone?sellingId=${row.id}" class="flex items-center mr-3 inProgressBox">${data}</a>
                </div>
            `;
                    }

                    return statusHTML;
                },
                className: 'text-center'
            },
        ],
    });
    $(".dataTables_filter").hide();
    $('#searchs').keyup(function () {
        getCustomerPaymentTable.search($(this).val()).draw();
    })
    $('#statusall').on("change", function () {
        getCustomerPaymentTable.ajax.reload();
    })
    $('#types').on("change", function () {
        getCustomerPaymentTable.ajax.reload();
    })
    setInterval(() => {
        if (dates != $("#dates").val()) {
            dates = $("#dates").val()
            getCustomerPaymentTable.ajax.reload();
        }
    }, 100)
});