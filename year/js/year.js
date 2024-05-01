function Society(){
    window.location.href = "../society/society.html";
}

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

function getDaysInMonth(year, month) {//获取一个选定的月中有多少天
    return new Date(year, month, 0).getDate();
}

function updateYear(){
    const datePicker = document.getElementById("datePicker");
    const selectedDate = datePicker.value;
    const currentDate = new Date();
    const inputDate = new Date(selectedDate);

    //获取年月日
    const year = inputDate.getFullYear(); // 获取年份
    const month = inputDate.getMonth()+1; // 获取月份，月份从0开始所以加1
    const day = inputDate.getDate(); // 获取日期
    const dayofyear = "   "+year+"年";

    const monthid = month-1;

    //改名
    const titleElement = document.getElementById("date-display");
    titleElement.textContent = dayofyear;

    //修改日期选择器透明度
    datePicker.style.opacity = (datePicker.style.opacity === "0") ? "1" : "0";
    const datechange = d3.select("#date-display")
    .on("click",function(event){
      datePicker.style.opacity = (datePicker.style.opacity === "0") ? "1" : "0";
    })

    drawChartYear(year,month,inputDate);
}

//建立12个月，每个月当天的监测时间以及SCR，两类
var everymonth = [];

//设立一个圆的时间间隔
var lowinterval = 4;
var middleinterval = 7;
var highinterval = 10;

async function drawChartYear(year,month,inputDate){
    

    for(m=0;m<12;m++){
        const days = getDaysInMonth(year, m+1);//获取m对应的这个月有多少天
        
        //每一个圆均分成30份，三个层次是监测时间，颜色是每天的情绪情况？
        const Adaydata = [];
        var calcuAmonth = {};
        var SCRscalcu = 0;
        var strAcalcu = 0;

        for(j=0;j<days;j++){//一个圆，需要days个数据,包括监测时间以及当天的SCR
            var itemeveryday = {};


            const strA = parseInt(8*Math.random())+2; 
            //不需要转时间戳
            if(strA<lowinterval){Timeint = 0}else if(strA>=lowinterval && strA< middleinterval){Timeint = 1;}else{Timeint=2;}


            const SCRs = Math.random();//开整一个模拟scr
            var Emo = 1;
            if(SCRs>0.5){Emo = 1;}else{Emo = 0;}

            itemeveryday.TIMEINTERVAL = Timeint;//时间戳的区别
            itemeveryday.EMO = Emo;

            SCRscalcu += parseInt(SCRs*2);
            strAcalcu += strA;

            Adaydata.push(itemeveryday);
            itemeveryday = {};
        }

        calcuAmonth.SCRs = SCRscalcu;
        calcuAmonth.TIMEs = strAcalcu;
        everymonth.push(calcuAmonth);
        calcuAmonth = {};
        SCRscalcu = 0;
        strAcalcu = 0;

        //console.log(Adaydata)

        //开始画这一个圆 yearwrapper+m //画图！------------------------------------
        const dateParsetest = d3.timeParse("%H:%M");
        
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
        const width =200;
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
    
        const getCoordinatesForAngle = (angle,length,offset = 0.8) => [//偏移量
            Math.cos(angle - Math.PI / 2) * length * offset,
            Math.sin(angle - Math.PI / 2) * length * offset,
        ]

        //创建画布--------------------------------------------------------------------
        d3.select(`#yearwrapper${m}`).html("");
        const wrapper = d3.select(`#yearwrapper${m}`)//是整体的画布
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

        //外围
        const peripherals = bounds.append("g")

        datapath = [];
        Adaydata.forEach( d=>{     
          p = [];   
          item={}
          item.EMO = d.EMO;
          item.TIMEINTERVAL = d.TIMEINTERVAL;
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
        const annotationGroup = bounds.append("g");
        const drawLine = (angle, length, offset) => {
            const [x1, y1] = getCoordinatesForAngle(angle,20, offset)
            const [x2, y2] = getCoordinatesForAngle(angle,length, offset)
            annotationGroup.append("line")
              .attr("class", "annotation-line")
              .attr("x1", x1)
              .attr("x2", x2)
              .attr("y1", y1)
              .attr("y2", y2)
        }


        const illus = bounds.append("g").attr("id",`yearpath${m}`).attr("class","illus");
        for(i=0;i<datapath.length;i++){
            let illustrate = illus.append("g").datum(datapath[i])
            illustrate.selectAll(".round").data(datapath[i])
                .join("path")
                .attr("class","round")
                .attr("d", d3.arc()
                    .outerRadius(function(d){
                        return d.TIMEINTERVAL*20+22;
                    })  
                    .innerRadius(function(d){
                        return d.TIMEINTERVAL*20+18;
                    })  
                    .startAngle(function(d) { drawLine((Math.PI*2)/days*i, d.TIMEINTERVAL*20+20, 1);return  (Math.PI*2)/days*i;})  // 弧度为单位的起始角度
                    .endAngle(function(d) { return (Math.PI*2)/days*(i+1); })  // 弧度为单位的结束角度
                )
                .attr("stroke","none")
                .attr("fill",function(d) {
                  if(d.EMO == 0){return color1["lowlowstress"]}
                  else{return color1["highhighstress"]}
                })  

        }

        //添加文字
        illus.append("text")
        .attr("class", "yeartext")
        .attr("id",`yeartext${m}`)
        .attr("x", -12)
        .attr("y", 8)
        .text(function(d){return `${m+1}月`})
        .attr("fill", function(d){{return color1["highhighstress"]}})
        .attr("font-size","1em")
        .on("click",function(event){
            const currentTEXT = d3.select(this);
            d3.selectAll(".yeartext")          
            .classed('faded', function() {
                return this !== currentTEXT.node();
            });
        })

    }

    //画本月的情绪柱状图
    console.log(everymonth)

    createBarChart("#chartthisyear", everymonth, "SCRs", '压力情况');

    //画CHART！
    function createBarChart(containerId, data, valueKey, title) {
        const width = 250, height = 150, margin = { top: 10, right: 10, bottom: 20, left: 20 };

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
             .call(d3.axisBottom(x));

        svg.append("g")
             .call(d3.axisLeft(y));

        svg.selectAll(".bar")
             .data(data)
             .join("rect")
             .attr("class", "bar")
             .attr("id",(d, i) => `${valueKey}-bar-${i}`)
             .attr("fill","#0055ca")
             .attr("x", (d,i) =>  (width/12)*i+ width/24)
             .attr("width", width/12)
             .attr("y", d => y(Number(d[valueKey])))
             .attr("height", d => height - y(Number(d[valueKey])))
             .attr("stroke","white");

        svg.append("text")
             .attr("text-anchor", "middle")
             .attr("x", width / 2)
             .attr("y", -5)
             .style("font-size", "16px")
             .text(title);
    }


}