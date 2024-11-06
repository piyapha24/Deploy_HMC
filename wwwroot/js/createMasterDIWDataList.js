const connection = new signalR.HubConnectionBuilder().withUrl("/scrapListHub").build();
$(document).ready(function () {
    // Initialize DataTable
    var masterDIWData = $('#dataTable').DataTable({
        destroy: true,
        colReorder: {
            realtime: true
        },
        ajax: {
            url: getMasterDIWData,
            type: "GET",
            dataType: "json",
            dataSrc: "data", // Adjust based on your JSON structure
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
                },
                className: 'text-center'
            },
            { data: "type", className: 'text-center' },
            { data: "name", className: 'text-center' },
            { data: "createdBy", className: 'text-center' },
            {
                data: "updatedAt",
                render: function (data) {
                    const date = new Date(data);
                    const day = String(date.getDate()).padStart(2, '0');
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const year = date.getFullYear();
                    return `${day}-${month}-${year}`;
                },
                className: 'text-center'
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
                },
                className: 'text-center w-40'
            }
        ]
    });

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