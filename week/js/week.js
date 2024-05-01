
let tabBox = document.getElementById('tabBox');
let navBox = document.getElementById('navBox');
var context="事件记录";
var tagcontext="事件";
var dates=1;
var weekOfMonth = 0;

//选项卡的要粘贴过来
function OnInput(event){
  context=event.target.value;
}

function TAGSInput(event){
  tagcontext=event.target.value;
}

const color1 = {"lowlowstress": "#b3e6ff",
"lowstress": "#57cafe",
"middle": "#3a8ee4",
"highstress": "#ec6091",
"highhighstress":"#eb5c6e",
"weeknone":"white",
"weekselected":"#0055ca"};

function updateWeek() {
    const datePicker = document.getElementById("datePicker");
    const selectedDate = datePicker.value;
    const currentDate = new Date();
    const inputDate = new Date(selectedDate);

    //获取年月日
    const year = inputDate.getFullYear(); // 获取年份
    const month = inputDate.getMonth()+1; // 获取月份，月份从0开始所以加1
    const day = inputDate.getDate(); // 获取日期
    const dayofyear = year+"年"+month+"月"+day+"日";

    //获取当前是第几周 ------------------------------------------------------
    // 创建一个新的日期对象，设置日期为1号
    const firstDayOfMonth = new Date(year, month-1, 1);
    // 获取1号是星期几
    const dayOfWeekOfFirstDay = firstDayOfMonth.getDay();
    // 计算出1号前面的空白格数，即第一周之前的天数
    const daysBeforeFirstWeek = dayOfWeekOfFirstDay === 0 ? 6 : dayOfWeekOfFirstDay - 1;
    // 计算出日期所在周的索引
    weekIndex = Math.ceil((day + daysBeforeFirstWeek) / 7);
    weekOfMonth=weekIndex;
    //获取当前是第几周 ------------------------------------------------------

    //计算现在是周几---------------------------------------------------------
    const daysnumberofWeek = [0,1,2,3,4,5,6];
    dates = daysnumberofWeek[inputDate.getDay()];
    //计算现在是周几---------------------------------------------------------
  
    //颜色
    const circlecolor = document.getElementsByClassName('circlemonth');
    Array.from(circlecolor).forEach(
      function(circle){circle.style.backgroundColor = color1["weeknone"];}
    )
    document.getElementById(`month-${weekOfMonth-1}`).style.backgroundColor = color1["weekselected"];
  
    //改名
    const titleElement = document.getElementById("date-display");
    titleElement.textContent = dayofyear;

    //修改日期选择器透明度
    datePicker.style.opacity = (datePicker.style.opacity === "0") ? "1" : "0";
    const datechange = d3.select("#date-display")
    .on("click",function(event){
      datePicker.style.opacity = (datePicker.style.opacity === "0") ? "1" : "0";
    })
  
    //获取一周的日期---------------------------------------------------------
    var weekDates = [];//一周的时间
    var calcuweek = new Date(inputDate);
    calcuweek.setDate(day - dates);

    for (var i = 0; i < 7; i++) {
      var sundaynumber = new Date(calcuweek);
      sundaynumber.setDate(calcuweek.getDate() + i);

      const weekyear = sundaynumber.getFullYear(); // 获取年份
      const weekmonth = sundaynumber.getMonth()+1; // 获取月份，月份从0开始所以加1
      const weekday = sundaynumber.getDate(); // 获取日期
      //const thisweek = weekyear+"-"+weekmonth+"-"+weekday;
      const dat = 10+i;
      const thisweek = "2024-3-"+dat;

      weekDates.push(thisweek);
    }
    //获取一周的日期---------------------------------------------------------
    drawChartWeek(weekDates,weekOfMonth,dates);
  } 


