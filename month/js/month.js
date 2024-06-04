
let tabBox = document.getElementById('tabBox');
let navBox = document.getElementById('navBox');
var context="事件记录";
var tagcontext="事件";
var dates=1;
var weekOfMonth = 0;

function Year(){
    window.location.href = "../year/year.html";
}

//选项卡的要粘贴过来
function OnInput(event){
  context=event.target.value;
}

function TAGSInput(event){
  tagcontext=event.target.value;
}


var color1 = {"lowlowstress": "#0e51a2",
"lowstress": "#5271ff",
"middle": "#e3f2a5",
"highstress": "#fcea6b",
"highhighstress":"#ffba3b",
"weeknone":"white",
"weekselected":"#ffba3b"};


function updateMonth(){
    const datePicker = document.getElementById("datePicker");
    const selectedDate = datePicker.value;
    const currentDate = new Date();
    const inputDate = new Date(selectedDate);

    //获取年月日
    const year = inputDate.getFullYear(); // 获取年份
    const month = inputDate.getMonth()+1; // 获取月份，月份从0开始所以加1
    const day = inputDate.getDate(); // 获取日期
    const dayofyear = "   "+year+"年"+month+"月";

    const monthid = month-1;

    //计算现在是周几---------------------------------------------------------
    const daysnumberofWeek = [0,1,2,3,4,5,6];
    const dates = daysnumberofWeek[inputDate.getDay()];
    //计算现在是周几---------------------------------------------------------
  
    //颜色
    const circlecolor = document.getElementsByClassName('circleeverymonth');
    Array.from(circlecolor).forEach(
      function(circle){circle.style.backgroundColor = color1["weeknone"];}
    )
    document.getElementById(`everymonth-${month-1}`).style.backgroundColor = color1["weekselected"];
  
    //改名
    const titleElement = document.getElementById("date-display");
    titleElement.textContent = dayofyear;

    //修改日期选择器透明度
    datePicker.style.opacity = (datePicker.style.opacity === "0") ? "1" : "0";
    const datechange = d3.select("#date-display")
    .on("click",function(event){
      datePicker.style.opacity = (datePicker.style.opacity === "0") ? "1" : "0";
    })
  
    const days = getDaysInMonth(year, month);

    drawChartMonth(monthid,days,dates,inputDate);
}

function getDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
}

async function drawChartMonth(monthid,days,date,inputDate){

    var everydaySCR = [];
    for(m=0;m<days;m++){
        const dateParsetest = d3.timeParse("%H:%M");

        const strA = parseInt(3*Math.random())+8; 
        const strB = parseInt(11*Math.random())+13; 


        const A = new Date(2024, 4, 20, strA, 0);
        const B =new Date(2024, 4, 20, strB, 0);//起止时间
        const strAstamp = A.getTime();

        //计算有多少个五分钟
        const difference = B - A;
        const minutes = difference / 1000 / 60;
        const fiveMinuteIntervals = Math.floor(minutes / 5);

        //这个月其中一天的SCR
        var MonthSCR =[];

        //一个月的SCR
        var scrcount = 0;
        for(i=0;i<fiveMinuteIntervals;i++){
            const item = {}
            item.SCRs = parseInt(Math.random()*7);
            scrcount += item.SCRs;

            const timelinshi= strAstamp+i*300;
            item.TIMESTAMP = timelinshi;
            item.TIME = new Date((timelinshi) * 1000).toLocaleString().replace(/:\d{1,2}$/,'');
            MonthSCR.push(item);
        }
        //console.log(MonthSCR);

        //每天的SCR个数
        var itemscr = {}
        itemscr.SCR = scrcount;
        everydaySCR.push(itemscr);
        itemscr = {}

        //画图！------------------------------------
        //Accessors
        var HRAccessor = d=>d.HR;
        var EDAccessor = d => d.EDA;
        var TEMPAccessor = d => d.TEMP;

        //1900字符串转时间
        var dateParseH = d3.timeParse("%H:%M");
        var dateAccessorH = d => dateParseH(d.TIME.slice(-5));

        //监测当天字符串转时间
        var dateParse = d3.timeParse("%Y/%m/%d %H:%M");
        var dateAccessor1 = d => dateParse(d.TIME);

        //1900年的时间
        const oriTIME = [];
        oriTIME.push(dateParsetest("00:00"));
        oriTIME.push(dateParsetest("24:00"));


        //定义画布
        const width =100;
        const dimensions = {
        width: width,
        height: width,
        radius: width / 2,
        margin: {
        top: 0,
        right: 10,
        bottom: 0,
        left: 10,
        },
        }
        dimensions.boundedWidth = dimensions.width
        - dimensions.margin.left
        - dimensions.margin.right
        dimensions.boundedHeight = dimensions.height
            - dimensions.margin.top
            - dimensions.margin.bottom
        dimensions.boundedRadius = dimensions.radius
            - ((dimensions.margin.left + dimensions.margin.right) / 2)
    
        const getCoordinatesForAngle = (angle, offset = 0.8) => [//偏移量
            Math.cos(angle - Math.PI / 2) * dimensions.boundedRadius * offset,
            Math.sin(angle - Math.PI / 2) * dimensions.boundedRadius * offset,
        ]

        //创建画布--------------------------------------------------------------------
        d3.select(`#monthwrapper${m}`).html("");
        const wrapper = d3.select(`#monthwrapper${m}`)//是整体的画布
        .append("svg")
        .attr("id",`svg${m}`)
        .attr("width", dimensions.width)
        .attr("height", dimensions.height)
        const bounds = wrapper.append("g").attr("id",`bounds${m}`)//画布里创建靠右的组
        .style("transform", `translate(${
        width-dimensions.margin.right-dimensions.boundedRadius/2
        }px, ${
        dimensions.margin.top + dimensions.boundedRadius
        }px)`)
        //创建画布--------------------------------------------------------------------    
        
        //刻度
        //时间对应到角度
        const angleScale1 = d3.scaleTime()//时间对应到角度
        .domain(d3.extent(oriTIME))
        .range([0, Math.PI * 2]);
        //

        //外围
        const peripherals = bounds.append("g")
        const hours = d3.timeHours(...angleScale1.domain()) 

        datapath = [];
        MonthSCR.forEach( d=>{     
          p = [];   
          item={}
          item.SCRS = d.SCRs;
          item.TIME = d.TIME;
          item.TIMESTAMP = d.TIMESTAMP;
          p.push(item);
          item = {};
          datapath.push(p);
        })

        for(k=1;k<4;k++){//同心圆刻度线
            quarterr = k*20;
      
            bounds.append("circle")
            .attr("r",quarterr)
            .attr("class","baseline1")
            .attr("cx","0")
            .attr("cy","0")
            .attr("stroke-width","2")
            .attr("stroke-dasharray","2,2,2")
        }

        //console.log(datapath)
        if(m<10){var n="0"+m;}else{n=String(m)}

        const illus = bounds.append("g").attr("id",`monthpath${n}`).attr("class","illus");
        for(i=0;i<datapath.length;i++){
            let illustrate = illus.append("g").datum(datapath[i])
            illustrate.selectAll(".round").data(datapath[i])
                .join("path")
                .attr("class","round")
                .attr("d", d3.arc()
                    .outerRadius(60)  // 以像素为单位的外半径
                    .innerRadius(30)  // 以像素为单位的内半径
                    .startAngle(function(d) { return angleScale1(dateAccessorH(d))-0.1; })  // 弧度为单位的起始角度
                    .endAngle(function(d) { return angleScale1(dateAccessorH(d))+0.1; })  // 弧度为单位的结束角度
                )
                .attr("stroke","none")
                .attr("fill",function(d) {
                  if(d.SCRS == 0){mcol  = "lowlowstress"}
                  else if((d.SCRS >= 1 && d.SCRS < 5)){mcol = "lowstress"}
                  else if(d.SCS >= 5 && d.SCRS < 10){mcol = "middle"}
                  else if(d.SCRS >= 10 && d.SCRS <= 15){mcol = "highhighstress"}
                  else {mcol = "highstress"}
                  return color1[mcol];
                })    
        }


        illus.append("text")
        .attr("class", "monthtext")
        .attr("id",`monthtext${n}`)
        .attr("x", -8)
        .attr("y", 8)
        .text(function(d){return `${m+1}号`})
        .attr("fill", function(d){{return color1["highhighstress"]}})
        .attr("font-size","1em")
        .on("click",function(event){
            const currentTEXT = d3.select(this);
            d3.selectAll(".monthtext")          
            .classed('faded', function() {
                return this !== currentTEXT.node();
              });


            
            
            //console.log(d3.select(event.currentTarget).attr("id"))
            //获取点击的这个时间处于哪一周？
            const selectid = parseInt(d3.select(event.currentTarget).attr("id").slice("-2"));

            const year = inputDate.getFullYear(); // 获取年份
            const month = inputDate.getMonth(); // 获取月份，月份从0开始所以加1

            //点击的时间
            var calcuweek = new Date(year,month,selectid+1);
            //console.log(calcuweek);

            //计算现在是周几---------------------------------------------------------
            const daysnumberofWeek = [0,1,2,3,4,5,6];
            const dates = daysnumberofWeek[calcuweek.getDay()];
            //计算现在是周几---------------------------------------------------------

            //获取一周的日期---------------------------------------------------------
            var weekDates = [];//一周的时间
            var calcumonth = new Date(calcuweek);
            calcumonth.setDate(selectid - dates+1);
            var monththisweek = calcumonth.getDate();
        
            for (var i = 0; i < 7; i++) {
              var sundaynumber = new Date(calcumonth);
              sundaynumber.setDate(calcumonth.getDate() + i);
              var weekday = String(sundaynumber.getDate()); // 获取日期
              if(weekday<10){weekday = "0"+weekday}
              const thisweek = weekday;
              weekDates.push(thisweek);
            }
            //console.log(weekDates)
            //获取一周的日期---------------------------------------------------------

            const selectcircle0 = d3.selectAll("#monthpath"+weekDates[0]);
            const selectcircle1 = d3.selectAll("#monthpath"+weekDates[1]);
            const selectcircle2 = d3.selectAll("#monthpath"+weekDates[2]);
            const selectcircle3 = d3.selectAll("#monthpath"+weekDates[3]);
            const selectcircle4 = d3.selectAll("#monthpath"+weekDates[4]);
            const selectcircle5 = d3.selectAll("#monthpath"+weekDates[5]);
            const selectcircle6 = d3.selectAll("#monthpath"+weekDates[6]);

            // 先获取每个选中元素的DOM节点
            const selectcircle0Node = selectcircle0.node();
            const selectcircle1Node = selectcircle1.node();
            const selectcircle2Node = selectcircle2.node();
            const selectcircle3Node = selectcircle3.node();
            const selectcircle4Node = selectcircle4.node();
            const selectcircle5Node = selectcircle5.node();
            const selectcircle6Node = selectcircle6.node();

            d3.selectAll(".illus")                
            .classed('fadedmonth', function() {
                  return this !== selectcircle0Node && this !== selectcircle1Node && this !== selectcircle2Node && this !==selectcircle3Node && this !== selectcircle4Node && this !== selectcircle5Node && this !== selectcircle6Node;
            });

        })
    }
    //console.log( MonthSCR) 

    //画本周的情绪柱状图
    //生成一下本周每天的SCR个数
    d3.select("#chartthisweek").html("")
    createBarChart("#chartthisweek", everydaySCR, "SCR", '压力情况');

    function createBarChart(containerId, data, valueKey, title) {
        const width = 280, height = 150, margin = { top: 10, right: 10, bottom: 20, left: 20 };

        // 创建柱状图的通用函数
        const svg = d3.select(containerId)
                      .append("svg")
                      .attr("class","svgchart")
                      .attr("width", width + margin.left + margin.right)
                      .attr("height", height + margin.top + margin.bottom)
                      .append("g")
                      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        const x = d3.scaleBand()
                      .range([0, width])
                      .padding(0.1)
                      .domain(data.map(d => d[valueKey]));

        const y = d3.scaleLinear()
                      .domain([0, d3.max(data, d => Number(d[valueKey]))])
                      .range([height, 0]);

        svg.append("g")
             .attr("transform", "translate(0," + height + ")")
             .call(d3.axisBottom(x).tickFormat(""));

        svg.append("g")
             .call(d3.axisLeft(y).tickFormat(""));

        svg.selectAll(".bar")
             .data(data)
             .join("rect")
             .attr("class", "bar")
             //.attr("id",(d, i) => `${valueKey}-bar-${i}`)
             .attr("fill","#0055ca")
             .attr("x", d => x(d[valueKey]))
             .attr("width", x.bandwidth())
             .attr("y", d => y(Number(d[valueKey])))
             .attr("height", d => height - y(Number(d[valueKey])));

        svg.append("text")
             .attr("text-anchor", "middle")
             .attr("x", width / 2)
             .attr("y", -5)
             .style("font-size", "16px")
             .text(title);
      }

}