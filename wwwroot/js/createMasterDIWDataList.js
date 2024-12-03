const connection = new signalR.HubConnectionBuilder().withUrl("/scrapListHub").build();
var dates = "";
$(document).ready(function () {
    // Initialize DataTable
    var masterDIWData = $('#dataTable').DataTable({
        destroy: true,
        colReorder: {
            realtime: true
        },
        ajax: {
            url: getMasterDIWData,
            type: "POST",
            dataType: "json",
            data: function (e) {
                e.date = $("#dates").val();
                e.type = $("#typeall").val();
            }, // Adjust based on your JSON structure
            error: function (jqXHR, textStatus, errorThrown) {
                console.error('AJAX Error:', textStatus, errorThrown);
                console.error('Response:', jqXHR.responseText);
            }
        },
        columns: [
            {
                data: null, // Use null for dynamic index
                render: function (data, type, row, meta) {
                    return meta.row + 1; // Row index + 1
                }, className: 'text-center'
            },
            {
                data: "type", render: function (data) {
                    console.log('data', data);
                    if (data == '1')
                        return `ชื่อกรมโรงาน`;
                    else if (data == '2')
                        return `ประเภทของเสีย`;
                    else if (data == '3')
                        return `ชื่อของเสีย`;
                    else if (data == '4')
                        return `ประเภทรถ`;
                }, className: 'text-center'
            },
            { data: "name", className: 'text-center' },
            { data: "createdBy", className: 'text-center' },
            { data: "updatedBy", className: 'text-center' },
            {
                data: "updatedAt",
                render: function (data) {
                    const date = new Date(data);
                    const day = String(date.getDate()).padStart(2, '0');
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const year = date.getFullYear();
                    return `${day}-${month}-${year}`;
                }, className: 'text-center'
            },
            {
                data: "id",
                render: function (data) {
                    return `
                                <div class="flex flex-wrap justify-center items-center">
                                    <a class="btn btn-border-none mr-2" href="/WEB/Environment/EditMasterDIWData/${data}">
                                        <div class="w-8 h-8 bg-primary/10 dark:bg-primary/20 text-primary/80 flex items-center justify-center rounded-full">
                                            <i class="fa-solid fa-pencil w-4 h-4"></i>
                                        </div>
                                    </a>
                                    <div class="flex items-center justify-center">
                                        <i class="fa-solid fa-chevron-right w-4 h-4 mr-1"></i>
                                    </div>
                                </div>
                            `;
                }, className: 'text-center w-40'
            }
        ]
    });

    $(".dataTables_filter").hide();
    $('#searchs').keyup(function () {
        masterDIWData.search($(this).val()).draw();
    })
    $('#typeall').on("change", function () {
        masterDIWData.ajax.reload();
    })

    setInterval(() => {
        if (dates != $("#dates").val()) {
            dates = $("#dates").val()
            masterDIWData.ajax.reload();
        }
    }, 100)

    // Start SignalR connection
    connection.start().then(() => {
        console.log("SignalR Connected");

        // Listen for SignalR event to reload DataTable
        connection.on("CreateMasterDIWDataList", function (newData) {
            if (!newData) {
                console.error("Received data is undefined");
                return;
            }
            masterDIWData.ajax.reload(null, false); // Reload the DataTable without resetting pagination
        });
    }).catch(err => console.error(err.toString()));
});