var calendar;
function CustomerNameList() {
    var id = $('#Customer_CustomerName').val();
    $.ajax({
        url: "/WEB/SellingRequest/FitterCustomerName/" + id,
        type: 'POST',
        dataType: "json",
        success: function (response) {
            $('#Selling_DocNo').empty(); // ล้างข้อมูลเก่า
            $('#Selling_DocNo').append('<option value="">Select...</option>'); // เพิ่ม option แรก
            $.each(response.docNumbers, function (index, district) {
                $('#Selling_DocNo').append('<option value="' + district.id + '">' + district.name + '</option>');
            });

            // รีเซ็ตปฏิทิน
            if (response.data) {
                if (calendar) {
                    calendar.destroy(); // ทำลายปฏิทินเก่า
                }
            } else {
                if (calendar) {
                    calendar.destroy(); // ทำลายปฏิทินเก่า
                }
            }
            

            // สร้างปฏิทินใหม่
            initializeCalendar(response);
        },
        error: function (xhr, status, error) {
            console.log('Error:', error);  // แสดงข้อความข้อผิดพลาด
        }
    });
}

function initializeCalendar(response) {
    var calendarEl = document.getElementById('calendar1');
    var availableDates = [];  // Array สำหรับเก็บวันที่ที่มีข้อมูลจาก response
    var availableDate = [];  // Array สำหรับเก็บวันที่ที่มีข้อมูลจาก response

    var dateTime;
    var dateTimes;
    var dateTimeNow = new Date();
    var dayNow = dateTimeNow.getDate().toString().padStart(2, '0'); // วันที่
    var monthNow = dateTimeNow.toLocaleString('en', { month: 'long' }); // ชื่อเดือน
    var yearNow = dateTimeNow.getFullYear(); // ปี
    var toolbarTitle = `${dayNow} ${monthNow} ${yearNow}`;
    // สมมติว่า response.data เป็นอาร์เรย์ของวันที่ที่มีข้อมูล
    // เราจะเก็บวันที่ที่มีข้อมูลในรูปแบบ string (yyyy-mm-dd)
    if (response.data && response.data.length > 0) {
        availableDates = response.data.map(function (event) {
            // Original date string
            var dateStr = event.start;

            // Create a Date object from the string
            var dateObj = new Date(dateStr);

            // Extract the year, month, and day
            var year = dateObj.getFullYear();
            var month = (dateObj.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed, so add 1
            var day = dateObj.getDate().toString().padStart(2, '0');
            dateTime = year + '-' + month + '-' + day;
            // Combine into 'yyyy-mm-dd' format
            return year + '-' + month + '-' + day;
        });
    }

    if (response.dataDayOff && response.dataDayOff.length > 0) {
        availableDate = response.dataDayOff.map(function (event) {
            // Original date string
            var dateStr = event.start;

            // Create a Date object from the string
            var dateObj = new Date(dateStr);

            // Extract the year, month, and day
            var year = dateObj.getFullYear();
            var month = (dateObj.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed, so add 1
            var day = dateObj.getDate().toString().padStart(2, '0');
            dateTimes = year + '-' + month + '-' + day;
            // Combine into 'yyyy-mm-dd' format
            return year + '-' + month + '-' + day;
        });
    }

    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        events: [], // ตั้งค่าเริ่มต้น
        viewDidMount: function (info) {
            // กำหนดวันปัจจุบันสำหรับ title
            const currentDate = new Date(); // วันที่ปัจจุบัน
            const formattedDate = new Intl.DateTimeFormat('en-GB', {
                day: '2-digit', // วันที่ (dd)
                month: 'long', // เดือน (MMMM)
                year: 'numeric' // ปี (yyyy)
            }).format(currentDate);

            // เปลี่ยนข้อความใน fc-toolbar-title
            document.querySelector('.fc-toolbar-title').innerText = formattedDate;
        },
        datesSet: function () {
            // ปรับปรุง Title หลังจากปฏิทินโหลด
            var toolbar = document.querySelector('.fc-toolbar-title');
            if (toolbar) {
                toolbar.textContent = toolbarTitle; // เปลี่ยนหัวเรื่องเป็นวันที่ที่กำหนด
            }
        },
        // Customize day cell content
        dayCellContent: function (info) {
            var dateObj = new Date(info.date);
            var year = dateObj.getFullYear();
            var month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
            var day = dateObj.getDate().toString().padStart(2, '0');
            var dateString = year + '-' + month + '-' + day;
            // Check if the date is available in the availableDates array
            var isAvailable = availableDates.includes(dateString);

            var sessions = [];
            var dayOffsessions = [];

            var session;
            var dayOffsession;
            var id;
            var dayOffId;
            var sellingsId;
            var nextstep;

            response.data.forEach(function (event) {
                var eventDate = event.start.split('T')[0];
                if (eventDate === dateString) {
                    sessions.push({
                        session: event.session,
                        id: event.id,
                        nextstep: event.nextstep,
                        changeMoving: event.changeMoving,
                    });
                }
            });

            response.dataDayOff.forEach(function (event) {
                var eventDate = event.date.split('T')[0];
                if (eventDate === dateString) {
                    dayOffsessions.push({
                        dayOffsession: event.session,
                        sellingsId: event.sellingId,
                        customerId: event.customerId,
                        dayOffId: event.id,
                    });
                }
            });

            var session1 = 'รอบเช้า (08.00 น. -12.00 น.)';
            var session2 = 'รอบบ่าย (13.00 น. -17.00 น.)';
            var sessionId = id;

            var session1Data = sessions.find(s => s.session === session1);
            var session2Data = sessions.find(s => s.session === session2);
            var dayOffSession1Data = dayOffsessions.find(s => s.dayOffsession === session1);
            var dayOffSession2Data = dayOffsessions.find(s => s.dayOffsession === session2);
            var formatDate = formatDateToYYYYMMDD(info.date);

            let buttonMorning = '';
            let buttonAfternoon = '';

            if (session1Data) {
                buttonMorning = `
                    <button class="time-btn" onclick="getConfirmDeliveryDates('${session1Data.id}', '${formatDate}', ${response.customerId}, '${session1Data.session}')" data-date="${info.date}"
                        style="background-color: #00ADEF; border-radius: 5px; color: white; margin-left: 10px; padding: 15px;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sunrise block mx-auto">
                            <path d="M12 2v8"></path>
                            <path d="M5.2 11.2l1.4 1.4"></path>
                            <path d="M2 18h2"></path>
                            <path d="M20 18h2"></path>
                            <path d="M17.4 12.6l1.4-1.4"></path>
                            <path d="M22 22H2"></path>
                            <path d="M8 6l4-4 4 4"></path>
                            <path d="M16 18a4 4 0 00-8 0"></path>
                        </svg>
                        เช้า
                    </button>
                `;
                // ฟ้าเข้ม
            } else if (dayOffSession1Data && dayOffSession1Data.dayOffId != 0 && dayOffSession1Data.customerId == 0 && dayOffSession1Data.sellingsId == 0) {
                buttonMorning = `
                    <button class="time-btn" data-time="afternoon" data-date="${info.date}"
                        style="background-color: #F58321; border-radius: 5px; color: white; margin-left: 10px; padding: 15px;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sunrise block mx-auto">
                            <path d="M12 2v8"></path>
                            <path d="M5.2 11.2l1.4 1.4"></path>
                            <path d="M2 18h2"></path>
                            <path d="M20 18h2"></path>
                            <path d="M17.4 12.6l1.4-1.4"></path>
                            <path d="M22 22H2"></path>
                            <path d="M8 6l4-4 4 4"></path>
                            <path d="M16 18a4 4 0 00-8 0"></path>
                        </svg>
                        เช้า
                    </button>
                `;
                // ส้ม
            } else if (dayOffSession1Data && dayOffSession1Data.dayOffId != 0 && dayOffSession1Data.customerId != 0 && dayOffSession1Data.sellingsId != 0) {
                buttonMorning = `
                    <button class="time-btn" data-time="afternoon" data-date="${info.date}"
                        style="background-color: #FF0000; border-radius: 5px; color: white; margin-left: 10px; padding: 15px;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sunrise block mx-auto">
                            <path d="M12 2v8"></path>
                            <path d="M5.2 11.2l1.4 1.4"></path>
                            <path d="M2 18h2"></path>
                            <path d="M20 18h2"></path>
                            <path d="M17.4 12.6l1.4-1.4"></path>
                            <path d="M22 22H2"></path>
                            <path d="M8 6l4-4 4 4"></path>
                            <path d="M16 18a4 4 0 00-8 0"></path>
                        </svg>
                        เช้า
                    </button>
                `;
                // แดง
            } else {
                buttonMorning = `
                    <button class="time-btn" onclick="changeDeliveryDate('${info.date}', '${session1}')" data-tw-toggle="modal" data-tw-target="#basic-modal-previews" data-time="afternoon" data-date="${info.date}"
                        style="background-color: #808080; border-radius: 5px; color: white; margin-left: 10px; padding: 15px;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sunrise block mx-auto">
                            <path d="M12 2v8"></path>
                            <path d="M5.2 11.2l1.4 1.4"></path>
                            <path d="M2 18h2"></path>
                            <path d="M20 18h2"></path>
                            <path d="M17.4 12.6l1.4-1.4"></path>
                            <path d="M22 22H2"></path>
                            <path d="M8 6l4-4 4 4"></path>
                            <path d="M16 18a4 4 0 00-8 0"></path>
                        </svg>
                        เช้า
                    </button>
                `;
                // เทา
            }

            if (session2Data) {
                buttonAfternoon = `
                    <button class="time-btn mr-5" onclick="getConfirmDeliveryDates('${session2Data.id}', '${formatDate}', ${response.customerId}, '${session2Data.session}')" data-date="${info.date}"
                        style="background-color: #00ADEF; border-radius: 5px; color: white; margin-left: 10px; padding: 15px;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sun block mx-auto">
                            <circle cx="12" cy="12" r="4"></circle>
                            <path d="M12 2v2"></path>
                            <path d="M12 20v2"></path>
                            <path d="M5 5l1.5 1.5"></path>
                            <path d="M17.5 17.5L19 19"></path>
                            <path d="M2 12h2"></path>
                            <path d="M20 12h2"></path>
                            <path d="M5 19l1.5-1.5"></path>
                            <path d="M17.5 6.5L19 5"></path>
                        </svg>
                        บ่าย
                    </button>
                `;
                // ฟ้าเข้ม
            } else if (dayOffSession2Data && dayOffSession2Data.dayOffId != 0 && dayOffSession2Data.customerId == 0 && dayOffSession2Data.sellingsId == 0) {
                buttonAfternoon = `
                    <button class="time-btn mr-5" data-time="afternoon" data-date="${info.date}"
                        style="background-color: #F58321; border-radius: 5px; color: white; margin-left: 10px; padding: 15px;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sun block mx-auto">
                            <circle cx="12" cy="12" r="4"></circle>
                            <path d="M12 2v2"></path>
                            <path d="M12 20v2"></path>
                            <path d="M5 5l1.5 1.5"></path>
                            <path d="M17.5 17.5L19 19"></path>
                            <path d="M2 12h2"></path>
                            <path d="M20 12h2"></path>
                            <path d="M5 19l1.5-1.5"></path>
                            <path d="M17.5 6.5L19 5"></path>
                        </svg>
                        บ่าย
                    </button>
                `;
                // ส้ม
            } else if (dayOffSession2Data && dayOffSession2Data.dayOffId != 0 && dayOffSession2Data.customerId != 0 && dayOffSession2Data.sellingsId != 0) {
                buttonAfternoon = `
                    <button class="time-btn mr-5" data-time="afternoon" data-date="${info.date}"
                        style="background-color: #FF0000; border-radius: 5px; color: white; margin-left: 10px; padding: 15px;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sun block mx-auto">
                            <circle cx="12" cy="12" r="4"></circle>
                            <path d="M12 2v2"></path>
                            <path d="M12 20v2"></path>
                            <path d="M5 5l1.5 1.5"></path>
                            <path d="M17.5 17.5L19 19"></path>
                            <path d="M2 12h2"></path>
                            <path d="M20 12h2"></path>
                            <path d="M5 19l1.5-1.5"></path>
                            <path d="M17.5 6.5L19 5"></path>
                        </svg>
                        บ่าย
                    </button>
                `;
                // สีแดง
            } else {
                buttonAfternoon = `
                    <button class="time-btn mr-5" onclick="changeDeliveryDate('${info.date}', '${session2}')" data-tw-toggle="modal" data-tw-target="#basic-modal-previews" data-time="afternoon" data-date="${info.date}"
                        style="background-color: #808080; border-radius: 5px; color: white; margin-left: 10px; padding: 15px;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sun block mx-auto">
                            <circle cx="12" cy="12" r="4"></circle>
                            <path d="M12 2v2"></path>
                            <path d="M12 20v2"></path>
                            <path d="M5 5l1.5 1.5"></path>
                            <path d="M17.5 17.5L19 19"></path>
                            <path d="M2 12h2"></path>
                            <path d="M20 12h2"></path>
                            <path d="M5 19l1.5-1.5"></path>
                            <path d="M17.5 6.5L19 5"></path>
                        </svg>
                        บ่าย
                    </button>
                `;
                // สีเทา
            }

            var customHtml = `
                <div class="d-flex flex-column align-items-center" cursor: pointer;">
                    <a href="/WEB/SellingRequest/QtimeToday?datefor=${formatDate}">
                        <div>${info.dayNumberText}</div>
                    </a>
                    ${buttonMorning}
                    ${buttonAfternoon}
                </div>            
            `;

            return {
                html: customHtml
            };
        }
    });
    calendar.render();
}

function DocNoList() {
    var id = $('#Selling_DocNo').val();
    $.ajax({
        url: "/WEB/SellingRequest/FitterDocNo/" + id,
        type: 'POST',
        dataType: "json",
        success: function (response) {
            // ResetData
            $('.idselling').val('');
            $('.sellingItem').val('');
            $('.docNo').val('');
            $('.deliveryDates').val('');
            $('.sessions').val('');
            $('.plant').val('');

            // Extract values from the response
            var sellingItem = response.masterScrapList.sellingItem;
            var sellingId = response.selling.id;
            var docNo = response.selling.docNo;
            var deliveryDates = response.selling.deliveryDate;
            var sessions = response.selling.session;
            var plant = response.selling.plant;

            var dateObj = new Date(deliveryDates);
            // Extract the year, month, and day
            var year = dateObj.getFullYear();
            var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            var month = monthNames[dateObj.getMonth()];  // Get month name (e.g., 'Nov')
            var day = dateObj.getDate().toString().padStart(2, '0');  // Ensure two-digit day
            // Format the date as 'dd MMM yyyy'
            var deliveryDate = `${day} ${month} ${year}`;

            // Set values in input fields
            $('.idselling').val(sellingId);
            $('.sellingItem').val(sellingItem);
            $('.docNo').val(docNo);
            $('.deliveryDates').val(deliveryDate);
            $('.sessions').val(sessions);
            $('.plant').val(plant);
        },
        error: function (xhr, status, error) {
            console.log('Error:', error);  // แสดงข้อความข้อผิดพลาด
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    var calendarEl = document.getElementById('calendar1');
    var availableDates = [];  // Array สำหรับเก็บวันที่ที่มีข้อมูลจาก response
    var availableDate = [];  // Array สำหรับเก็บวันที่ที่มีข้อมูลจาก response
    $.ajax({
        url: routeGetDeliveryDate,  // Controller action URL
        type: 'GET',
        dataType: "json",
        success: function (response) {
            var dateTimeNow = new Date();
            var dayNow = dateTimeNow.getDate().toString().padStart(2, '0'); // วันที่
            var monthNow = dateTimeNow.toLocaleString('en', { month: 'long' }); // ชื่อเดือน
            var yearNow = dateTimeNow.getFullYear(); // ปี
            var toolbarTitle = `${dayNow} ${monthNow} ${yearNow}`;
            var dateTime;
            var dateTimes;
            // สมมติว่า response.data เป็นอาร์เรย์ของวันที่ที่มีข้อมูล
            // เราจะเก็บวันที่ที่มีข้อมูลในรูปแบบ string (yyyy-mm-dd)
            if (response.data && response.data.length > 0) {
                availableDates = response.data.map(function (event) {
                    // Original date string
                    var dateStr = event.start;

                    // Create a Date object from the string
                    var dateObj = new Date(dateStr);

                    // Extract the year, month, and day
                    var year = dateObj.getFullYear();
                    var month = (dateObj.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed, so add 1
                    var day = dateObj.getDate().toString().padStart(2, '0');
                    dateTime = year + '-' + month + '-' + day;
                    // Combine into 'yyyy-mm-dd' format
                    return year + '-' + month + '-' + day;
                });
            }

            if (response.dataDayOff && response.dataDayOff.length > 0) {
                availableDate = response.dataDayOff.map(function (event) {
                    // Original date string
                    var dateStr = event.start;

                    // Create a Date object from the string
                    var dateObj = new Date(dateStr);

                    // Extract the year, month, and day
                    var year = dateObj.getFullYear();
                    var month = (dateObj.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed, so add 1
                    var day = dateObj.getDate().toString().padStart(2, '0');
                    dateTimes = year + '-' + month + '-' + day;
                    // Combine into 'yyyy-mm-dd' format
                    return year + '-' + month + '-' + day;
                });
            }

            // Initialize FullCalendar after AJAX call
            calendar = new FullCalendar.Calendar(calendarEl, {
                initialView: 'dayGridMonth',
                viewDidMount: function (info) {
                    // กำหนดวันปัจจุบันสำหรับ title
                    const currentDate = new Date(); // วันที่ปัจจุบัน
                    const formattedDate = new Intl.DateTimeFormat('en-GB', {
                        day: '2-digit', // วันที่ (dd)
                        month: 'long', // เดือน (MMMM)
                        year: 'numeric' // ปี (yyyy)
                    }).format(currentDate);

                    // เปลี่ยนข้อความใน fc-toolbar-title
                    document.querySelector('.fc-toolbar-title').innerText = formattedDate;
                },
                datesSet: function () {
                    // ปรับปรุง Title หลังจากปฏิทินโหลด
                    var toolbar = document.querySelector('.fc-toolbar-title');
                    if (toolbar) {
                        toolbar.textContent = toolbarTitle; // เปลี่ยนหัวเรื่องเป็นวันที่ที่กำหนด
                    }
                },
                // Customize day cell content
                dayCellContent: function (info) {
                    var dateObj = new Date(info.date);
                    var year = dateObj.getFullYear();
                    var month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
                    var day = dateObj.getDate().toString().padStart(2, '0');
                    var dateString = year + '-' + month + '-' + day;
                    // Check if the date is available in the availableDates array
                    var isAvailable = availableDates.includes(dateString);

                    var sessions = [];
                    var dayOffsessions = [];

                    var session;
                    var dayOffsession;
                    var id;
                    var dayOffId;
                    var sellingsId;
                    var nextstep;

                    response.data.forEach(function (event) {
                        var eventDate = event.start.split('T')[0];
                        if (eventDate === dateString) {
                            sessions.push({
                                session: event.session,
                                id: event.id,
                                nextstep: event.nextstep,
                                changeMoving: event.changeMoving,
                            });
                        }
                    });

                    response.dataDayOff.forEach(function (event) {
                        var eventDate = event.date.split('T')[0];
                        if (eventDate === dateString) {
                            dayOffsessions.push({
                                dayOffsession: event.session,
                                sellingsId: event.sellingId,
                                customerId: event.customerId,
                                dayOffId: event.id,
                            });
                        }
                    });

                    var session1 = 'รอบเช้า (08.00 น. -12.00 น.)';
                    var session2 = 'รอบบ่าย (13.00 น. -17.00 น.)';
                    var sessionId = id;

                    var session1Data = sessions.find(s => s.session === session1);
                    var session2Data = sessions.find(s => s.session === session2);
                    var dayOffSession1Data = dayOffsessions.find(s => s.dayOffsession === session1);
                    var dayOffSession2Data = dayOffsessions.find(s => s.dayOffsession === session2);
                    var formatDate = formatDateToYYYYMMDD(info.date);

                    let buttonMorning = '';
                    let buttonAfternoon = '';

                    if (session1Data) {
                        buttonMorning = `
                            <button class="time-btn" onclick="getConfirmDeliveryDate('${session1Data.id}', '${formatDate}', '${session1Data.session}')" data-date="${info.date}"
                                style="background-color: #00ADEF; border-radius: 5px; color: white; margin-left: 10px; padding: 15px;">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sunrise block mx-auto">
                                    <path d="M12 2v8"></path>
                                    <path d="M5.2 11.2l1.4 1.4"></path>
                                    <path d="M2 18h2"></path>
                                    <path d="M20 18h2"></path>
                                    <path d="M17.4 12.6l1.4-1.4"></path>
                                    <path d="M22 22H2"></path>
                                    <path d="M8 6l4-4 4 4"></path>
                                    <path d="M16 18a4 4 0 00-8 0"></path>
                                </svg>
                                เช้า
                            </button>
                        `;
                        // ฟ้าเข้ม
                    } else if (dayOffSession1Data && dayOffSession1Data.dayOffId != 0 && dayOffSession1Data.customerId == 0 && dayOffSession1Data.sellingsId == 0) {
                        buttonMorning = `
                            <button class="time-btn" data-time="afternoon" data-date="${info.date}"
                                style="background-color: #F58321; border-radius: 5px; color: white; margin-left: 10px; padding: 15px;">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sunrise block mx-auto">
                                    <path d="M12 2v8"></path>
                                    <path d="M5.2 11.2l1.4 1.4"></path>
                                    <path d="M2 18h2"></path>
                                    <path d="M20 18h2"></path>
                                    <path d="M17.4 12.6l1.4-1.4"></path>
                                    <path d="M22 22H2"></path>
                                    <path d="M8 6l4-4 4 4"></path>
                                    <path d="M16 18a4 4 0 00-8 0"></path>
                                </svg>
                                เช้า
                            </button>
                        `;
                        // ส้ม
                    } else {
                        buttonMorning = `
                            <button class="time-btn" onclick="changeDeliveryDate('${info.date}', '${session1}')" data-tw-toggle="modal" data-tw-target="#basic-modal-previews" data-time="afternoon" data-date="${info.date}"
                                style="background-color: #808080; border-radius: 5px; color: white; margin-left: 10px; padding: 15px;">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sunrise block mx-auto">
                                    <path d="M12 2v8"></path>
                                    <path d="M5.2 11.2l1.4 1.4"></path>
                                    <path d="M2 18h2"></path>
                                    <path d="M20 18h2"></path>
                                    <path d="M17.4 12.6l1.4-1.4"></path>
                                    <path d="M22 22H2"></path>
                                    <path d="M8 6l4-4 4 4"></path>
                                    <path d="M16 18a4 4 0 00-8 0"></path>
                                </svg>
                                เช้า
                            </button>
                        `;
                        // เทา
                    }

                    if (session2Data) {
                        buttonAfternoon = `
                            <button class="time-btn mr-5" onclick="getConfirmDeliveryDate('${session2Data.id}', '${formatDate}', '${session2Data.session}')" data-date="${info.date}"
                                style="background-color: #00ADEF; border-radius: 5px; color: white; margin-left: 10px; padding: 15px;">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sun block mx-auto">
                                    <circle cx="12" cy="12" r="4"></circle>
                                    <path d="M12 2v2"></path>
                                    <path d="M12 20v2"></path>
                                    <path d="M5 5l1.5 1.5"></path>
                                    <path d="M17.5 17.5L19 19"></path>
                                    <path d="M2 12h2"></path>
                                    <path d="M20 12h2"></path>
                                    <path d="M5 19l1.5-1.5"></path>
                                    <path d="M17.5 6.5L19 5"></path>
                                </svg>
                                บ่าย
                            </button>
                        `;
                        // ฟ้าเข้ม
                    } else if (dayOffSession2Data && dayOffSession2Data.dayOffId != 0 && dayOffSession2Data.customerId == 0 && dayOffSession2Data.sellingsId == 0) {
                        buttonAfternoon = `
                            <button class="time-btn mr-5" data-time="afternoon" data-date="${info.date}"
                                style="background-color: #F58321; border-radius: 5px; color: white; margin-left: 10px; padding: 15px;">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sun block mx-auto">
                                    <circle cx="12" cy="12" r="4"></circle>
                                    <path d="M12 2v2"></path>
                                    <path d="M12 20v2"></path>
                                    <path d="M5 5l1.5 1.5"></path>
                                    <path d="M17.5 17.5L19 19"></path>
                                    <path d="M2 12h2"></path>
                                    <path d="M20 12h2"></path>
                                    <path d="M5 19l1.5-1.5"></path>
                                    <path d="M17.5 6.5L19 5"></path>
                                </svg>
                                บ่าย
                            </button>
                        `;
                        // ส้ม
                    } else {
                        buttonAfternoon = `
                            <button class="time-btn mr-5" onclick="changeDeliveryDate('${info.date}', '${session2}')" data-tw-toggle="modal" data-tw-target="#basic-modal-previews" data-time="afternoon" data-date="${info.date}"
                                style="background-color: #808080; border-radius: 5px; color: white; margin-left: 10px; padding: 15px;">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sun block mx-auto">
                                    <circle cx="12" cy="12" r="4"></circle>
                                    <path d="M12 2v2"></path>
                                    <path d="M12 20v2"></path>
                                    <path d="M5 5l1.5 1.5"></path>
                                    <path d="M17.5 17.5L19 19"></path>
                                    <path d="M2 12h2"></path>
                                    <path d="M20 12h2"></path>
                                    <path d="M5 19l1.5-1.5"></path>
                                    <path d="M17.5 6.5L19 5"></path>
                                </svg>
                                บ่าย
                            </button>
                        `;
                        // เทา
                    }

                    var customHtml = `
                        <div class="d-flex flex-column align-items-center" cursor: pointer;">
                            <a href="/WEB/SellingRequest/QtimeToday?datefor=${formatDate}">
                                <div>${info.dayNumberText}</div>
                            </a>
                            ${buttonMorning}
                            ${buttonAfternoon}
                        </div>            
                    `;
                    
                    return {
                        html: customHtml
                    };
                },
            });
            // Render the calendar
            calendar.render();
        },
        error: function (xhr, status, error) {
            console.log('Error:', error);
        }
    });
});

function formatDateToYYYYMMDD(date) {
    var d = new Date(date);
    var year = d.getFullYear();
    var month = (d.getMonth() + 1).toString().padStart(2, '0'); // เดือนต้องบวก 1 เนื่องจากเริ่มที่ 0
    var day = d.getDate().toString().padStart(2, '0');
    return year + '-' + month + '-' + day;
}

function changeDeliveryDate(dateTime, session) {
    $('#frmQtime')[0].reset();
    $('input[name="answer"]').on('change', function () {
        if ($(this).val() === 'true') { // ถ้าค่าของ Radio Button คือ 'true'
            $('.docNos').closest(".flex").show(); // แสดง
        } else {
            $('.docNos').closest(".flex").hide(); // ซ่อน
        }
    });
    var idselling = $('.idselling').val();
    var dateObj = new Date(dateTime);
    // Extract the year, month, and day
    var year = dateObj.getFullYear();
    var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var month = monthNames[dateObj.getMonth()];  // Get month name (e.g., 'Nov')
    var day = dateObj.getDate().toString().padStart(2, '0');  // Ensure two-digit day
    // Format the date as 'dd MMM yyyy'
    var dateNow = `${day} ${month} ${year}`;

    $('.idSelling').val(idselling);
    $('#delivery-date-fields').val(dateNow);
    $('#session-fields').val(session);

    $('.idSelling').val(idselling);
    $('#deliveryDates').val(dateNow);
    $('#sessions').val(session);
}

function getConfirmDeliveryDate(id, formatDate, session) {
    $.ajax({
        url: "/WEB/SellingRequest/QtimeTodays?datefor=" + formatDate + "&session=" + session,
        type: 'POST',
        dataType: "json",
        success: function (response) {
            window.location.href = response.redirectToUrl;
        },
        error: function (xhr, status, error) {
            console.log('Error:', error);
        }
    });
}

function getConfirmDeliveryDates(id, formatDate, customerId, session) {
    $.ajax({
        url: "/WEB/SellingRequest/QtimeTodays?datefor=" + formatDate + "&customerId=" + customerId + "&session=" + session,
        type: 'POST',
        dataType: "json",
        success: function (response) {
            window.location.href = response.redirectToUrl;
        },
        error: function (xhr, status, error) {
            console.log('Error:', error);
        }
    });
}

function submitConfirmDeliveryForm() {
    // Serialize form data
    var formData = $('#frmQtime').serializeArray(); // Converts to array of name-value pairs
    var id = $('#id').val(); // Retrieve the ID value from the form
    var deliveryDate = $('#deliveryDate').val(); // Retrieve the ID value from the form
    var session = $('#session').val(); // Retrieve the ID value from the form
    var remark = $('#remark').val(); // Retrieve the ID value from the form
    // Add ID to form data
    formData.push({ name: 'id', value: id });
    formData.push({ name: 'deliveryDate', value: deliveryDate });
    formData.push({ name: 'session', value: session });
    formData.push({ name: 'remark', value: remark });
    // Send AJAX request
    $.ajax({
        url: '/WEB/Customer/ConfirmDelivery',
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

function submitChangeDeliveryForm() {
    // Serialize form data
    var formData = $('#frmQtime').serializeArray(); // Converts to array of name-value pairs
    var idSelling = $('.idSelling').val(); // Retrieve the ID value from the form
    var deliveryDates = $('#deliveryDates').val(); // Retrieve the ID value from the form
    var sessions = $('#sessions').val(); // Retrieve the ID value from the form
    var remarks = $('#remarks').val(); // Retrieve the ID value from the form

    // ตรวจสอบว่าเลือก radio button อะไร
    var lockMoving = $('input[name="answer"]:checked').val(); // ค่าจาก radio button ที่ถูกเลือก

    // Add ID to form data
    formData.push({ name: 'idSelling', value: idSelling });
    formData.push({ name: 'deliveryDates', value: deliveryDates });
    formData.push({ name: 'sessions', value: sessions });
    formData.push({ name: 'remarks', value: remarks });
    formData.push({ name: 'lockMoving', value: lockMoving });

    // Send AJAX request
    $.ajax({
        url: '/WEB/SellingRequest/ChangeDelivery',
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