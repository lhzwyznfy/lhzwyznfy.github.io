
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

var color1 = {"lowlowstress": "#E0F7FA",
"lowstress": "#B2EBF2",
"middle": "#80DEEA",
"highstress": "#4DD0E1",
"highhighstress":"#26C6DA",
"weeknone":"white",
"weekselected":"#26C6DA"};


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
    var selec = [10,11,12,13,14,15,16];

    function uniqueRandomSelection(array) {
      // 首先打乱数组
      const shuffled = shuffleArray(array.slice()); // 使用 slice() 以不修改原数组
      // 从打乱后的数组中取出前 count 个元素
      return shuffled.slice(0);
  }

    //打乱数组
    function shuffleArray(array) {
      // 从数组的最后一个元素开始，向前进行洗牌
      for (let i = array.length - 1; i > 0; i--) {
          // 随机选取一个不大于当前位置的数组索引
          const j = Math.floor(Math.random() * (i + 1));
          // 交换当前元素与随机选取的元素
          [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }

    const selectarray = uniqueRandomSelection(selec); // 选择7次，每次都不同

    for (m=0;m<7;m++) {
      /*ar sundaynumber = new Date(calcuweek);
      sundaynumber.setDate(calcuweek.getDate() + i);

      const weekyear = sundaynumber.getFullYear(); // 获取年份
      const weekmonth = sundaynumber.getMonth()+1; // 获取月份，月份从0开始所以加1
      const weekday = sundaynumber.getDate(); // 获取日期*/
      //const thisweek = weekyear+"-"+weekmonth+"-"+weekday;
      const dat = selectarray[m];

      const thisweek = "2024-3-"+dat;
      weekDates.push(thisweek);
    }

    console.log(weekDates);

    //获取一周的日期---------------------------------------------------------
    drawChartWeek(weekDates,weekOfMonth,dates);
  } 


