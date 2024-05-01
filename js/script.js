function updateContent() {
    const datePicker = document.getElementById("datePicker");
    const selectedDate = datePicker.value;

    // Add your logic here to determine the content based on the selectedDate
    // For example, you can check the selectedDate and change the circle's color accordingly.
    // Here, we change the color to red if the date is in the future, and blue if it's in the past.
    const currentDate = new Date();
    const inputDate = new Date(selectedDate);

    // 获取星期几的名称
    const daysOfWeek = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
    const dayOfWeek = daysOfWeek[inputDate.getDay()];
 
    // 获取星期几对应的编号
    const daysnumberofWeek = [0,1,2,3,4,5,6];
    const dates = daysnumberofWeek[inputDate.getDay()];
    console.log(dates);

    //改名
    const titleElement = document.getElementById("date-display");
    titleElement.textContent = dayOfWeek;
    
    //日期选择器透明度
    //datePicker.style.opacity = (datePicker.style.opacity === "0") ? "1" : "0";

    //切换
    //let tabBox = document.getElementById('tabBox');//现在是datePicker
    //let navBox = document.getElementById('navBox');
    //let navList = navBox.getElementsByTagName('li');
    //let detailList = tabBox.getElementsByTagName('div');

    // click 事件编写
    drawChart(dates);

}

