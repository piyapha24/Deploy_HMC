const connection = new signalR.HubConnectionBuilder().withUrl("/scrapListHub").build();
$(document).ready(function () {
    // Initialize DataTable
    var dIWData = $('#dataTable').DataTable({
        destroy: true,
        colReorder: {
            realtime: true
        },
        ajax: {
            url: getDIWData,
            type: "GET",
            dataType: "json",
            dataSrc: "data", // Adjust based on your JSON structure
            error: function (jqXHR, textStatus, errorThrown) {
                console.error('AJAX Error:', textStatus, errorThrown);
                console.error('Response:', jqXHR.responseText);
            }
        },
        columns: [
            { data: "plant", className: 'text-center' },
            {
                data: "remainingQty", render: function (data, type, row) {
                    // Add checks for undefined data
                    var datas = data ? parseFloat(data).toFixed(2) : '0.00';
                    var limitQty = row.limitQty || 0;
                    var remainingQty = row.remainingQty || 0;
                    var sum = limitQty - remainingQty;
                    var sums = (sum * 100) / limitQty;

                    // Ensure valid values for sums
                    sums = isNaN(sums) ? 0 : sums;

                    if (sums <= 79)
                        return `<div class="font-medium whitespace-nowrap text-success">${datas} KG</div>`;
                    else if (sums <= 89)
                        return `<div class="font-medium whitespace-nowrap text-warning">${datas} KG</div>`;
                    else if (sums <= 100)
                        return `<div class="font-medium whitespace-nowrap text-danger">${datas} KG</div>`;
                    return `<div class="font-medium whitespace-nowrap text-secondary">${datas} KG</div>`;  // Fallback for invalid sums
                }, className: 'text-center'
            },

            {
                data: "limitQty", render: function (data, type, row) {
                    // Add checks for undefined data
                    var datas = data ? parseFloat(data).toFixed(2) : '0.00';
                    var limitQty = row.limitQty || 0;
                    var remainingQty = row.remainingQty || 0;
                    var sum = limitQty - remainingQty;
                    var sums = (sum * 100) / limitQty;

                    // Ensure valid values for sums
                    sums = isNaN(sums) ? 0 : sums;

                    if (sums <= 79)
                        return `<div class="font-medium whitespace-nowrap text-success">${datas} KG</div>`;
                    else if (sums <= 89)
                        return `<div class="font-medium whitespace-nowrap text-warning">${datas} KG</div>`;
                    else if (sums <= 100)
                        return `<div class="font-medium whitespace-nowrap text-danger">${datas} KG</div>`;
                    return `<div class="font-medium whitespace-nowrap text-secondary">${datas} KG</div>`;  // Fallback for invalid sums
                }, className: 'text-center'
            },

            {
                data: "industryEffectiveDate", render: function (data, type, row) {
                    console.log('data', data);
                    // Check for null/undefined and format the date safely
                    if (!data) return `<div class="font-medium whitespace-nowrap text-secondary">N/A</div>`;
                    const date = new Date(data);
                    const day = String(date.getDate()).padStart(2, '0');
                    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                    const month = monthNames[date.getMonth()]; // Get month abbreviation
                    const year = date.getFullYear();
                    var dates = `${day} ${month} ${year}`;

                    var limitQty = row.limitQty || 0;
                    var remainingQty = row.remainingQty || 0;
                    var sum = limitQty - remainingQty;
                    var sums = (sum * 100) / limitQty;

                    sums = isNaN(sums) ? 0 : sums;

                    if (sums <= 79)
                        return `<div class="font-medium whitespace-nowrap text-success">${dates}</div>`;
                    else if (sums <= 89)
                        return `<div class="font-medium whitespace-nowrap text-warning">${dates}</div>`;
                    else if (sums <= 100)
                        return `<div class="font-medium whitespace-nowrap text-danger">${dates}</div>`;
                    return `<div class="font-medium whitespace-nowrap text-secondary">${dates}</div>`;  // Fallback for invalid sums
                },
                className: 'text-center'
            },

            {
                data: "industryExpireDate", render: function (data, type, row) {
                    // Check for null/undefined and format the date safely
                    if (!data) return `<div class="font-medium whitespace-nowrap text-secondary">N/A</div>`;
                    const date = new Date(data);
                    const day = String(date.getDate()).padStart(2, '0');
                    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                    const month = monthNames[date.getMonth()]; // Get month abbreviation
                    const year = date.getFullYear();
                    var dates = `${day} ${month} ${year}`;

                    var limitQty = row.limitQty || 0;
                    var remainingQty = row.remainingQty || 0;
                    var sum = limitQty - remainingQty;
                    var sums = (sum * 100) / limitQty;

                    sums = isNaN(sums) ? 0 : sums;

                    if (sums <= 79)
                        return `<div class="font-medium whitespace-nowrap text-success">${dates}</div>`;
                    else if (sums <= 89)
                        return `<div class="font-medium whitespace-nowrap text-warning">${dates}</div>`;
                    else if (sums <= 100)
                        return `<div class="font-medium whitespace-nowrap text-danger">${dates}</div>`;
                    return `<div class="font-medium whitespace-nowrap text-secondary">${dates}</div>`;  // Fallback for invalid sums
                },
                className: 'text-center'
            },

            { data: "name", className: 'text-center' },
            { data: "customerName", className: 'text-center' },

            {
                data: "id", render: function (data, type, row) {
                    var limitQty = row.limitQty || 0;
                    var remainingQty = row.remainingQty || 0;
                    var sum = limitQty - remainingQty;
                    var sums = (sum * 100) / limitQty;

                    sums = isNaN(sums) ? 0 : sums;

                    var percentage = sums.toFixed(3);  // Ensure percentage has three decimal places

                    if (sums <= 79)
                        return `
                        <div class="progress mt-3">
                            <div class="progress-bar bg-success" role="progressbar" aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100" style="width: ${percentage}%">${percentage}%</div>
                        </div>
                    `;
                    else if (sums <= 89)
                        return `
                        <div class="progress mt-3">
                            <div class="progress-bar bg-warning" role="progressbar" aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100" style="width: ${percentage}%">${percentage}%</div>
                        </div>
                    `;
                    else if (sums <= 100)
                        return `
                        <div class="progress mt-3">
                            <div class="progress-bar bg-danger" role="progressbar" aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100" style="width: ${percentage}%">${percentage}%</div>
                        </div>
                    `;
                    return `
                    <div class="progress mt-3">
                        <div class="progress-bar bg-secondary" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%">0%</div>
                    </div>
                `;
                }, className: 'text-center w-40'
            },
            {
                data: "id", render: function (data) {
                    return `
                    <div class="flex flex-wrap justify-center items-center">
                        <a class="btn btn-border-none mr-2" href="/WEB/Environment/EditDIWData/${data}">
                            <div class="w-8 h-8 bg-primary/10 dark:bg-primary/20 text-primary/80 flex items-center justify-center rounded-full">
                                <i class="fa-solid fa-pencil w-4 h-4"></i>
                            </div>
                        </a>
                    </div>
                `;
                }, className: 'text-center w-40'
            }
        ],
        createdRow: function (row, data, dataIndex) {
            // Apply the pointer-interactive class to each row
            $(row).addClass('pointer-interactive');
        }
    });

    // Toggle nested table visibility on row click
    $('#dataTable tbody').on('click', '.pointer-interactive', function () {
        var $row = $(this);
        var rowData = dIWData.row($row).data();

        // Check if the nested table already exists
        var nestedTable = $row.next('.nested-table');

        // Toggle nested table visibility
        if (nestedTable.length > 0) {
            nestedTable.toggle();
        } else {
            // Create a new row for the nested table

            var nestedRow = `
                <tr class="nested-table">
                    <td colspan="10">
                        <table class="table-fixed table table-report -mt-2">
                            <thead class="bg-blue-500 m-2 p-2 text-white">
                                <tr>
                                    <th class="whitespace-nowrap" colspan="5">ปริมาณการขนย้าย</th>
                                    <th class="whitespace-nowrap">Scrap No.</th>
                                    <th class="whitespace-nowrap">Selling Item</th>
                                    <th class="text-center whitespace-nowrap">ระยะเวลาเริ่มต้นสัญญา</th>
                                    <th class="text-center whitespace-nowrap">ระยะเวลาสิ้นสุดสัญญา</th>
                                    <th class="text-center whitespace-nowrap">Status</th>
                                    <th class="text-center whitespace-nowrap">Edit</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td class="text-left" colspan="5"><a href="" class="font-medium whitespace-nowrap text-success">200 KG</a></td>
                                    <td class="text-left">HMC-001</td>
                                    <td class="text-left">Paper</td>
                                    <td class="text-center">
                                        <a href="" class="font-medium whitespace-nowrap text-success">01-10-2025</a>
                                    </td>
                                    <td class="text-center">
                                        <a href="" class="font-medium whitespace-nowrap text-success">01-10-2025</a>
                                    </td>
                                    <td class="w-40">
                                        <div class="progress mt-3">
                                            <div class="progress-bar w-2/3 bg-success" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">50%</div>
                                        </div>
                                    </td>
                                    <td class="w-40">
                                        <div class="flex flex-wrap justify-center items-center">
                                            <a class="btn btn-border-none mr-2" aria-expanded="false">
                                                <div class="w-8 h-8 bg-primary/10 dark:bg-primary/20 text-primary/80 flex items-center justify-center rounded-full">
                                                    <i class="fa-solid fa-pencil w-4 h-4"></i>
                                                </div>
                                            </a>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
            `;

            // Insert the nested row after the clicked row
            $row.after(nestedRow);
        }
    });

    // Start SignalR connection
    connection.start().then(() => {
        console.log("SignalR Connected");

        // Listen for SignalR event to reload DataTable
        connection.on("CreateDIWDataList", function (newData) {
            if (!newData) {
                console.error("Received data is undefined");
                return;
            }
            dIWData.ajax.reload(null, false); // Reload the DataTable without resetting pagination
        });
    }).catch(err => console.error(err.toString()));
});