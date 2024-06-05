let tabBox = document.getElementById('tabBox');
let navBox = document.getElementById('navBox');
var context="事件记录";
var tagcontext="事件";
var dates=1;
var color1 = {"lowlowstress": "#E0F7FA",
"lowstress": "#B2EBF2",
"middle": "#80DEEA",
"highstress": "#4DD0E1",
"highhighstress":"#26C6DA",
"weeknone":"white",
"weekselected":"#26C6DA"};

/*var color1 = {"lowlowstress": "#b3e6ff",
"lowstress": "#57cafe",
"middle": "#3a8ee4",
"highstress": "#ec6091",
"highhighstress":"#eb5c6e",
"weeknone":"white",
"weekselected":"#eb5c6e"}; */

//选项卡的要粘贴过来
function OnInput(event){
  context=event.target.value;
}

function TAGSInput(event){
  tagcontext=event.target.value;
}

function updateContent() {
  const datePicker = document.getElementById("datePicker");
  const selectedDate = datePicker.value;
  const currentDate = new Date();
  const inputDate = new Date(selectedDate);
  

  // 获取星期几的名称
  const daysOfWeek = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
  const dayOfWeek = daysOfWeek[inputDate.getDay()];
  const circlecolor = document.getElementsByClassName('circleweek');
  Array.from(circlecolor).forEach(
    function(circle){circle.style.backgroundColor = color1["weeknone"];}
  )
  document.getElementById(`circle-${inputDate.getDay()}`).style.backgroundColor = color1["weekselected"];

  //获取年月日
  const year = inputDate.getFullYear(); // 获取年份
  const month = inputDate.getMonth() + 1; // 获取月份，月份从0开始所以加1
  const day = inputDate.getDate(); // 获取日期
  const dayofyear = year+"年"+month+"月"+day+"日";

  // 获取星期几对应的编号
  const daysnumberofWeek = [0,1,2,3,4,5,6];
  dates = daysnumberofWeek[inputDate.getDay()];

  //改名
  const titleElement = document.getElementById("date-display");
  titleElement.textContent = dayofyear;//dayOfWeek;
  
  //修改日期选择器透明度
  datePicker.style.opacity = (datePicker.style.opacity === "0") ? "1" : "0";
  const datechange = d3.select("#date-display")
  .on("click",function(event){
    datePicker.style.opacity = (datePicker.style.opacity === "0") ? "1" : "0";
  })

  //切换不同的花
    const imgElement = document.getElementById('flower');
    imgElement.src = `img/Group ${dates}.png`;

  drawChart(dates);
}


async function drawChart(dates) { 
    console.log(dates)
    // 1. Access data
    //tags 
    const tag = "week/data/2024-3-1"+dates+"/tags.csv"
    const tags = await d3.csv(tag)
    //HR
    const pathHR = "week/data/2024-3-1"+dates+"/HR.csv"//"./1128-1/HR1128.csv"
    const dataset1 = await d3.csv(pathHR) 
    //IBI
    const pathIBI = "week/data/2024-3-1"+dates+"/IBI.csv"
    const dataIBI1 = await d3.csv(pathIBI);
    //TEMP
    const pathTEMP = "week/data/2024-3-1"+dates+"/TEMP.csv"
    const dataset3 = await d3.csv(pathTEMP)
    const TEMPvalue = Object.values(dataset3); 
    //SCR
    const pathSCR = "week/data/2024-3-1"+dates+"/SCR.csv"
    const dataSCR1 = await d3.csv(pathSCR);
    //Accessors
    const HRAccessor = d=>d.HR;
    const EDAccessor = d => d.EDA;
    const TEMPAccessor = d => d.TEMP;
    //1900字符串转时间
    const dateParseH = d3.timeParse("%H:%M");
    const dateAccessorH = d => dateParseH(d.TIME.slice(-5));
    //监测当天字符串转时间
    const dateParse = d3.timeParse("%Y/%m/%d %H:%M");
    const dateAccessor1 = d => dateParse(d.TIME);
    //SCR-------------------------------------  
    SCRtime = [];
    for(i=0;i<dataSCR1.length;i++){
        SCRtime.push(parseInt(dataSCR1[i].peak_end_times_stamp));
    }
    //dataset1添加时间
    const T0 = parseInt(dataset1[0].TIMESTAMP);
    let T00 = 0;
    for (i=0;i<dataset1.length;i++){
        dataset1[i].HR = parseFloat(dataset1[i].HR);
        dataset1[i].TIMESTAMP =  T00 + T0;
        T00+=1;
    }
    //TEMP------------------------每秒的平均值 TEMPvalueAVE 
    const TEMPvalueAVE = [];
    TEMPstart = parseInt(TEMPvalue[0].TIMESTAMP);
    var sumTEMP  = 0;
    tempitem = {};
    averagetemp = 0;
    for(i=0;i<TEMPvalue.length;i++){
      sumTEMP+=parseFloat(TEMPvalue[i].TEMP);
      if ((i+1)%4 == 0){
        TEMPstart = TEMPstart+1;
        tempitem.TIMESTAMP = TEMPstart;
        tempitem.TEMP = (sumTEMP/4).toFixed(2);
        TEMPvalueAVE.push(tempitem);
        averagetemp += sumTEMP;
        sumTEMP=0;
        tempitem={};
        }
    }
    averagetemp = (averagetemp/TEMPvalue.length).toFixed(2);
    //把SCR和TEMP加到HR里面------------------------------------
    map = {};
    result = [];
    itemmach = {};
    baseline = 0;
    for(i=0;i<dataset1.length;i++){
        baseline += parseFloat(dataset1[i].HR);
        if(!TEMPvalueAVE[i]){
            dataset1[i].TEMP = averagetemp;
        }else{
            dataset1[i].TEMP = TEMPvalueAVE[i].TEMP;}
        if(SCRtime[i]){
            ind = dataset1.findIndex(d => d.TIMESTAMP == SCRtime[i]);
            if(ind != -1){dataset1[ind].SCR = 1;}
        }
    }
    HRbaseline = (baseline/dataset1.length).toFixed(2);
    console.log("HRbaseline:"+HRbaseline);
    console.log("现在我们有了每秒对应的HR和TEMP,以及这一秒有无SCR")
    console.log(dataset1)
    //以上是基本的dataset1--------------



    //筛选掉不合格的IBI
    dataIBI1.filter( d => 450<= parseFloat(d.IBI)*1000<=1250);
    const IBIminute = [];//分钟的平均IBI
    timejiange = 300;//这里
    function IBIminu(t,t0){
        if(t-t0<=timejiange){//60s//这里改了
            return true;
        }else{
            return false;
        }
    }
    numn = 0;  
    linshi = [];
    ceshi = [];
    IBIlinshi = 0;
    jishu = 0;
    chushiTIME = parseInt(dataIBI1[0].TIME);
    itemzong = {};
    handle = [];
    TTOstart = chushiTIME;
    TIMESS = 0;
    baselinehrv = 0;
    edaaverage = 0;
    n=0;

    for(i=0;i<dataIBI1.length;i++){
        IBIvalue = parseFloat(dataIBI1[i].IBI)*1000;//IBI单位从s改成ms
        thistime = parseInt(dataIBI1[i].TTO)/* - parseFloat(dataIBI1[0].TTO)*/ + chushiTIME;//这一行的时间戳
        if(IBIminu(thistime,TTOstart)){
            linshi.push(IBIvalue);
            IBIlinshi= IBIlinshi + IBIvalue;
            continue;   
        }
        TTOstart = TTOstart + timejiange;//60s//在这里改了
        //超出范围之后
        jishumin = i-1;//第i个的IBI数值并没有算进linshi里
        if(linshi.length==0){avg=0; itemzong.L = 0;}else{avg = IBIlinshi/linshi.length;}
        //判断这两分钟内是不是一个IBI都没有，否则算出IBI平均值   
        IBIminute.push(avg);//将这几分钟的平均值加入数组
        itemzong.L = linshi.length;//这几分钟内有几个IBI     
        itemzong.IBIAVG = avg;//这几分钟的IBI平均值
        //parseInt(parseFloat(dataIBI1[jishumin].TTO) - parseFloat(dataIBI1[0].TTO) + chushiTIME);
        TIMESS =new Date((TTOstart) * 1000).toLocaleString().replace(/:\d{1,2}$/,'');//这里，两分钟end的时间，而非时间戳
        //TIMESS1=parseInt(parseFloat(dataIBI1[i].TTO) - parseFloat(dataIBI1[0].TTO) + chushiTIME);
        itemzong.TIME = TIMESS;
        itemzong.TIMESTAMP = TTOstart;
        
        //加SCR、TEMP、HR
        const HRHRVS = dataset1.findIndex(item=>item.TIMESTAMP === TTOstart-timejiange);//这里，持续的时间
        const HRHRVE = dataset1.findIndex(item=>item.TIMESTAMP === TTOstart);
        HRM = 0;
        TEMPM = 0;
        SCRC = 0;
        if (HRHRVS == -1 || HRHRVE ==-1){
          itemzong.HR = 0;
          itemzong.EDA = 0;
          itemzong.TEMP = 0;
          itemzong.SCRS = 0;
        }else{
        //求两分钟的平均TEMP、平均HR，以及SCR个数
          for(n=0;n<timejiange;n++){//这里
            HRM = parseFloat(HRM) + parseFloat(dataset1[HRHRVS+n].HR);
            TEMPM = TEMPM + parseFloat(dataset1[HRHRVS+n].TEMP);
            if(dataset1[HRHRVS+n].SCR){SCRC += 1;}
          }
          itemzong.HR = parseFloat((HRM/(timejiange)).toFixed(2));
          itemzong.TEMP = parseFloat((TEMPM/(timejiange)).toFixed(2));
          itemzong.SCRS = SCRC;

        }
        //加SCR、TEMP、HR
    
        //SDNN
        SQAR=0;
        for(n=0;n<linshi.length;n++){
          SQAR =  SQAR + Math.pow((linshi[n]-avg), 2);
        }
        let SDNNavg = Math.sqrt(SQAR/(linshi.length-1));//样本标准差 单位ms
        if(isNaN(SDNNavg)){SDNNavg=0;}
        if(SDNNavg>250){SDNNavg=250;}
        itemzong.SDNN = parseFloat(SDNNavg.toFixed(2));
        baselinehrv = baselinehrv + itemzong.SDNN;
        handle.push(itemzong);
        TIMESS = 0;
        numn = i;
        linshi = [];
        ceshi = [];
        linshi.unshift(IBIvalue);//在linshi这个数组最前面加上现在这个没被加进去的IBI
        IBIlinshi = IBIvalue;
        jishu++;
        itemzong ={};
    }

    //求平均滤波
    avgHR = [];
    for(i=0;i<handle.length;i++){
      if(i==0){avgHR.push(HRbaseline);continue;}
      if(i==1 || i==handle.length-1 || i==handle.length-2){
        avgHR.push(handle[i].HR);
        }else{
        avg1 = ((parseFloat(handle[i-2].HR) + parseFloat(handle[i-1].HR) + parseFloat(handle[i].HR) + parseFloat(handle[i+1].HR )+ parseFloat(handle[i+2].HR))/5).toFixed(2);
        avgHR.push(avg1);}
    }
    res=handle.map((item,index)=>{
          return {...item,HR:parseFloat(avgHR[index])}
    })
    //求平均滤波
    
    baselinehrv = baselinehrv/handle.length;
    console.log("baselinehrv "+baselinehrv)
    console.log("现在的完整数组为handle:");
    console.log(handle);


    //1900年的时间-------------------------------------------------------------------
    const oriTIME = [];
    const dateParsetest = d3.timeParse("%H:%M");
    const strA = "9:00"; 
    const strB = "19:00"; 
    starttime = parseInt(handle[0].TIME.slice(-5,-3));
    endtime = parseInt(handle[handle.length-1].TIME.slice(-5,-3))+1;
    starttimemin = handle[0].TIME.slice(-5);
    endtimemin = handle[handle.length-1].TIME.slice(-5);
    const A = dateParsetest(strA);
    const B = dateParsetest(strB);
    oriTIME.push(A);
    oriTIME.push(B);
    console.log(oriTIME)
    const C = dateParsetest((parseInt(strA)-1)+":58");
    const D = dateParsetest(parseInt(strB)+":58");
    dataobj1 = res.filter((d=>dateAccessorH(d)>C && dateAccessorH(d)<D));
    console.log("dataobj1为筛选时间后的数组:")
    console.log(dataobj1);

    //定义画布
    const width = 1200
    let dimensions = {
    width: width,
    height: width,
    radius: width / 2,
    margin: {
      top: 0,
      right: 120,
      bottom: 0,
      left: 120,
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
      Math.cos(angle - Math.PI / 2) * dimensions.boundedRadius/1.2 * offset,
      Math.sin(angle - Math.PI / 2) * dimensions.boundedRadius/1.2 * offset,
    ]//定位

    //创建画布--------------------------------------------------------------------
    d3.select("#wrapper").html("")//<div id='tooltip'>123123</div>
    const wrapper = d3.select("#wrapper")//是整体的画布
    .append("svg")
    .attr("id","svg")
    .attr("width", dimensions.width)
    .attr("height", dimensions.height)
    const bounds1 = wrapper.append("g").attr("id","bounds1")//画布里创建靠右的组
    .style("transform", `translate(${
      width-dimensions.margin.right-dimensions.boundedRadius/1.6
      }px, ${
      dimensions.margin.top + dimensions.boundedRadius/1.8
      }px)`)
    //创建画布--------------------------------------------------------------------
   
    //创建圆圈画布-----------------------------------------------------------------
    d3.select("#left").html("")
    const circlewrapper = d3.select("#left")
    .append("svg")
    .attr("id","leftsvg")
    .attr("width", dimensions.width*2/3)
    .attr("height", dimensions.height*2/3)
    const boundscircle = circlewrapper.append("g").attr("id","boundscircle")
    .style("transform", `translate(${
      dimensions.width/3-80
      }px, ${
      dimensions.height/5-20
      }px)`)
    //创建圆圈画布-----------------------------------------------------------------

    //动画-----------------------------------------------------------------
    /*const donghua = [800,1200,1600,2000];
    bounds1.selectAll("#backgroundcircle")
    .data(donghua)
    .join("circle")
    .attr("id","backgroundcircle")
    .attr("cx",0)
    .attr("cy",0)
    .attr("r",0)
        .attr("fill","none")
        .attr("stroke", "white")
        .attr("opacity","0")
        .attr("stroke-width",2)
        .attr("stroke-dasharray","2,2,2")
        .transition()
        .duration(Math.random()*3000)
        .attr("stroke", "#b3e6ff")
        .attr("r",function(d){return d*Math.random()})
        .attr("opacity","1")
        .transition().on("start",function repeatmove(){
            d3.active(this)
            .transition()
            .duration(Math.random()*3000)
            .attr("stroke", "white")
            .attr("r",10)
            .attr("opacity","0")
            .ease(d3.easeCubic)
            .transition()
            .duration(Math.random()*3000)
            .attr("stroke", "#b3e6ff")
            .attr("r",function(d){return d*Math.random()})
            .attr("opacity","1")
            .ease(d3.easeCubic)
            .transition().on("start",repeatmove)})*/
    //动画-----------------------------------------------------------------
    
    //tooltip--------------------------------------------------------------------
    const parent = document.getElementById('wrapper');
    let tooltip = document.createElement('div');
    const tooltipheight ="200px";
    const tooltipwidth = "200px";
    tooltip.id="tooltip";
    /*parent.appendChild(tooltip);
    tooltip.style.opacity= "1";
    tooltip.style.position="absolute";
    tooltip.style.top="0";
    tooltip.style.left="0";
    tooltip.style.width= tooltipwidth;
    tooltip.style.height= tooltipheight;
    tooltip.style.borderRadius="50%";
    tooltip.style.padding="10 10";
    tooltip.style.background="white";
    tooltip.style.textAlign="center";
    tooltip.style.lineHeight="1.4em";
    tooltip.style.fontSize="1.3em";
    tooltip.style.border="1px dashed grey";
    tooltip.style.zIndex= "10";
    tooltip.style.pointerEvents="none";
    tooltip.style.position="absolute";
    tooltip.style.color =  "grey";
    tooltip.style.forceCenter="auto";*/
    /*tooltip.style.display="flex";*/
    tooltip.style.alignItems= "center"; /* 垂直居中 */
    tooltip.style.justifyContent="center"; /* 水平居中 */

    const tooltip2 = d3.select("#tooltip")
    tooltip2    
      .style("transform", `translate(${
      width-dimensions.margin.right-dimensions.boundedRadius/1.6-100
      }px, ${
      dimensions.margin.top + dimensions.boundedRadius/1.8-100
      }px)`)
    //tooltip--------------------------------------------------------------------


    //刻度
    //时间对应到角度
    const angleScale1 = d3.scaleTime()//时间对应到角度
        .domain(d3.extent(oriTIME))
        .range([0, Math.PI * 2]);
    //--------------------------EDA--------------------------------------------------------------------------------------
    const getXFromDataPoint = (d, offset = 0.8) => getCoordinatesForAngle(
        angleScale1(dateAccessorH(d)),
        0.3
        )[0]
    const getYFromDataPoint = (d, offset = 0.8) => getCoordinatesForAngle(
        angleScale1(dateAccessorH(d)),
        0.3
        )[1]
    const EDARadiusScale = d3.scaleSqrt()//平方根
        .domain(d3.extent(dataobj1, EDAccessor))
        .range([1, 20])
    //EDA-------------------------------

    //TEMP------------------------------
    const TEMPRadiusScale = d3.scaleSqrt()//平方根
        .domain(d3.extent(dataobj1, TEMPAccessor))
        .range([1, 6])
    //TEMP------------------------------
    
    //外围
    const peripherals = bounds1.append("g")
    const hours = d3.timeHours(...angleScale1.domain()) 

    // HRV
    const HRVAccessor = d=>d.SDNN;
    const SCRAccessor = d=>d.SCRS;

    const radiusScaleHRV = d3.scaleLinear()
    .domain(d3.extent([10,250]))
    .range([width*0.1, width*0.3])//dimensions.boundedRadius 直径
    .nice()
    const radiusScaleHR = d3.scaleLinear()
    .domain(d3.extent([40,180]))
    .range([width*0.001, width*0.46])//dimensions.boundedRadius 直径
    .nice()
  
    //分割线
    timecircle = dimensions.boundedRadius/1.7;


    //画背景线
      //tags标签
    const basetag = bounds1.append("circle")
      .attr("r",timecircle)
      .attr("class","baseline1")
      .attr("cx","0")
      .attr("cy","0")
      .attr("stroke-width","2")
      .attr("stroke","white")
      //.attr("opacity","0.2")
      .attr("stroke-dasharray","2,2,2")


    HRbaseline = parseFloat(HRbaseline);
    const HRquarter = (timecircle-HRbaseline)/4;

    for(k=1;k<4;k++){//同心圆刻度线
      quarterr = HRbaseline+k*HRquarter;

      bounds1.append("circle")
      .attr("r",quarterr)
      .attr("class","baseline1")
      .attr("cx","0")
      .attr("cy","0")
      .attr("stroke-width","2")
      .attr("stroke","white")
      .attr("stroke-dasharray","2,2,2")
    }


    //时间刻度
    const annotationGroup = bounds1.append("g");
    const drawTimehour = (angle,offset,text)=>{
      const [x2, y2] = getCoordinatesForAngle(angle, offset-0.05)  
      annotationGroup.append("text")
      .attr("class", "annotation-text")
      .attr("x", d=>{if(x2>0){return x2-15}else{return x2-12}})
      .attr("y", d=>{if(y2>0){return y2+3}else{return y2-3}})
      .text(text)
      .attr("fill", function(d){return color1["highstress"]})
    }

    //时间刻度
    /*for(i=parseInt(strA);i<parseInt(strB);i++){
      drawTimehour(angleScale1(dateParseH(i + ":00")), 0.7,i+":00");
    }*/
    //drawTimehour(0, 0.6, strA);




    //draw hrv--------------------------------------------
    const linearscr = d3.scaleLinear().domain(d3.extent(dataobj1, SCRAccessor)).range([1,0.1]);

    var π = Math.PI,
    τ = 2 * π,
    n = 360;
    //console.log(dataobj1.filter(d=> d.SDNN != 0))
    const HRVRadiusScalexuxian = d3.scaleSqrt()//平方根
      .domain([0,250])//d3.extent(dataobj1, HRVAccessor)
      .range([HRbaseline/7, HRbaseline/3])//50
    const HRVRScale = d3.scaleSqrt()//平方根
      .domain(d3.extent(dataobj1, HRVAccessor))//
      .range([10, 0.2])//50

    //以下是一组
    const areaHRGenerator = d3.areaRadial()//这个是外壳造型
      .angle(d => angleScale1(dateAccessorH(d)))
      .outerRadius(d=>radiusScaleHR(HRAccessor(d)))
      .innerRadius(d=>radiusScaleHR(HRbaseline/2))
      .curve(d3.curveNatural); 
        
    //blur
    var blurscr = bounds1.append("defs");
    var blurr = blurscr.append("filter")
      .attr("id","blur")
      .append("feGaussianBlur")
      .attr("stdDeviation", 0.2);

    //试一下线
    const getXFromDataPointline = (d, offset = 0.8) => getCoordinatesForAngle(//offset 显示宽度？ coordinate坐标
      angleScale1(dateAccessorH(d)),
      offset
      )[0]
    const getYFromDataPointline = (d, offset = 0.8) => getCoordinatesForAngle(
      angleScale1(dateAccessorH(d)),
      offset
      )[1]

    const illus = bounds1.append("g");
    const lineGroup = bounds1.append("g").attr("z-index","3")
    const masks = lineGroup.append("defs")
    const masks2 = lineGroup.append("defs")


    const drawAnnotation = (angle, offset) => {
      const [x1, y1] = getCoordinatesForAngle(angle, offset)
      const [x2, y2] = getCoordinatesForAngle(angle, offset+0.1)  
      annotationGroup.append("line")
        .attr("class", "annotation-line")
        .attr("x1", x1)
        .attr("x2", x2)
        .attr("y1", y1)
        .attr("y2", y2)
    }
    const drawAnnotationmin = (angle, offset) => {
      const [x1, y1] = getCoordinatesForAngle(angle, offset)
      const [x2, y2] = getCoordinatesForAngle(angle, offset+0.1)  
      const [x3, y3] = getCoordinatesForAngle(angle, offset+0.3) 
      annotationGroup.append("line")
        .attr("class", "annotation-line-min")
        .attr("stroke","grey")
        .attr("stroke-width",1)
        .attr("x1", x1)
        .attr("x2", x2)
        .attr("y1", y1)
        .attr("y2", y2)
    }

    //蒙版
      //水墨
    const mask = masks.append("mask").attr("id","mask1")

    mask.append("rect")
      .attr("width", width*0.5)
      .attr("height",width*0.5)
      .attr("fill","black")

    const areaHRV2 = mask.append("path")
      .datum(dataobj1)
      .attr("d", areaHRGenerator(dataobj1))   
      .style("fill","white")
      .attr("stroke","none")
      .attr("opacity","1")

      //水墨
    //蒙版

    //全是一个半径
    const areaHRGenerator1 = d3.areaRadial()
        .angle(d => angleScale1(dateAccessorH(d)))
        .outerRadius(d=>radiusScaleHR(HRbaseline/3))
        .innerRadius(d=>4*HRVRadiusScalexuxian(HRVAccessor(d)))
        .curve(d3.curveNatural); 

    const mask2 = masks2.append("mask").attr("id","maskmm")
    mask2.append("rect")
        .attr("width", width*0.5)
        .attr("height",width*0.5)
        .attr("fill","black")
 
    const areaHRV3 = mask2.append("path")
        .datum(dataobj1)
        .attr("d", areaHRGenerator1(dataobj1))   
        .style("fill","white")
        .attr("stroke","none")
        .attr("opacity","1")


    datapath = [];
    dataobj1.forEach( d=>{     
      p = [];   
      item={}
      item.SCRS = d.SCRS;
      item.TIME = d.TIME;
      item.outR = HRAccessor(d);
      item.SDNN = d.SDNN;
      p.push(item);
      item = {};
      datapath.push(p);
    })


    const mous = d3.select("#mous");

    var HRt = dataobj1.map(d=>d.HR);
    var HRVt = dataobj1.map(d=>d.SDNN);
    var SCRt = dataobj1.map(d=>d.SCRS);

    let m;



    for(i=0;i<datapath.length;i++){//我希望每一个两分钟的块都能突出来
      const Ht = HRt[i];
      const SDNNt = HRVt[i];
      const SCt = SCRt[i];

      var dblcircle = bounds1.append("g");
      

      let illustrate = illus.append("g").datum(datapath[i])
      illustrate.selectAll(".round").data(datapath[i])
        .join("path")
        .attr("class","round")
        .attr("d",
          d3.arc()
              .outerRadius(timecircle+6)
              .innerRadius(timecircle-6)
              .startAngle(function(d) { return angleScale1(dateAccessorH(d))-0.1; })
              .endAngle(function(d) { return angleScale1(dateAccessorH(d))+0.1; })
          )
          .attr("stroke","none")
          .on("dblclick", function(event){
            var coords = d3.pointer(event);
            dblcircle.append("circle")
            .attr("cx", coords[0])
            .attr("cy", coords[1])
            .attr("stroke","black")
            .attr("stroke-width",2)
            .attr("r", 5)
            .attr("class", "dotdbl")
          })
          .attr("opacity","0")
          .attr("fill","white")
          .transition()
          .duration(i*300)
          .attr("opacity","1")
          .attr("fill",function(d) {
            if(d.SCRS == 0){m  = "lowlowstress"}
            else if((d.SCRS >= 1 && d.SCRS < 5)){m = "lowstress"}
            else if(d.SCRS >= 5 && d.SCRS < 10){m = "middle"}
            else if(d.SCRS >= 10 && d.SCRS <= 15){m = "highhighstress"}
            else {m = "highstress"}
            return color1[m];
          })


          //HR，上面是外边框
          let g = lineGroup.append("g").datum(datapath[i])
          const pathes = g.selectAll(".biodata")
            .data(datapath[i])
            .join("path")
            .attr("class","biodata")
            .attr("stroke","none")
            .attr("id",function(d){
              if(d.SCRS == 0){return "lowlowstressHR"}
              else if((d.SCRS >= 1 && d.SCRS < 5)){return "lowstressHR"}
              else if(d.SCRS >= 5 && d.SCRS < 10){return "middleHR"}
              else if(d.SCRS >= 10 && d.SCRS <= 15){return "highhighstressHR"}
              else {return "highstressHR"}
            })
            .attr("d",
              d3.arc()
                .outerRadius(d=>radiusScaleHR(d.outR)+HRVRScale(d.SDNN)/1.5)
                .innerRadius(d=>radiusScaleHR(d.outR)-HRVRScale(d.SDNN)/1.5)
                .startAngle(function(d) { return angleScale1(dateAccessorH(d)); })
                .endAngle(function(d) { return (angleScale1(dateAccessorH(d))+HRVRScale(d.SDNN)/6); })
            )
            .on("dblclick",(event,d)=>{
              drawtagline(angleScale1(dateParseH(d.TIME.slice(-5))),0.7);
            })
            .attr("opacity","0")
            .attr("fill","white")
            .transition()
            .duration(i*300)
            .attr("opacity","0.8")
            .attr("fill",function(d) { 
                if(d.SCRS == 0){m  = "lowlowstress"}
                else if((d.SCRS >= 1 && d.SCRS < 5)){m = "lowstress"}
                else if(d.SCRS >= 5 && d.SCRS < 10){m = "middle"}
                else if(d.SCRS >= 10 && d.SCRS <= 15){m = "highhighstress"}
                else {m = "highstress"}
                return color1[m];
            } )


      }


    d3.select("#date-display")
      .on("mousedown",(event,d)=>{            
        d3.selectAll("#biodata")
          .transition()
          .duration(1000)
          .attr("opacity","0.8")
          .attr("fill", function(d) { 
            return "grey";
          })
          .attr("d",
            d3.arc()
              .outerRadius(d=>radiusScaleHR(d.outR)+20)
              .innerRadius(0)
              .startAngle(function(d) { return angleScale1(dateAccessorH(d))-0.01; })
              .endAngle(function(d) { return angleScale1(dateAccessorH(d))+0.01 }))

        
          d3.select("#date-display").on("dblclick",(event,d)=>{
            d3.selectAll("#biodata")
            .transition()
            .duration(2000)
            .ease(d3.easeBounce)
            .attr("opacity","1")
            .attr("fill",function(d) { 
              if(d.SCRS == 0 && d.SDNN >= baselinehrv && d.HR <= HRbaseline){m  = "lowlowstress"}
              else if((d.SCRS == 0 && d.SDNN >= baselinehrv) || (d.SDNN >= baselinehrv && d.HR <= HRbaseline) || (d.SCRS == 0 && d.HR <= HRbaseline)){m = "lowstress"}
              else if(d.SCRS == 0 || d.SDNN >= baselinehrv || d.HR <= HRbaseline){m = "middle"}
              else if(d.SCRS != 0 && d.SDNN < baselinehrv && d.HR > HRbaseline){m = "highhighstress"}
              else {m = "highstress"}
              return color1[m]
            })
            .attr("transform","scale(1)" )
            .style("filter","blurmouseover")               
            .style("mask",'url(#mask1)')
          })
      })



      //半透明-----------------------------------------------------------------------------------------------------------------------
      //外边缘//定位
      d3.selectAll('.round')
        .on('mouseover', function(event,d) {
          //左侧的类
          const notimp = 0;
          if(d.SCRS == 0){
            d3.select("#vlows").attr("opacity",1)
            d3.select("#lstres").attr("opacity",notimp)
            d3.select("#mstress").attr("opacity",notimp)
            d3.select("#hstress").attr("opacity",notimp)
            d3.select("#vhighs").attr("opacity",notimp)
  
          }
          else if(d.SCRS >= 1 && d.SCRS < 5){
              d3.select("#vlows").attr("opacity",notimp)
              d3.select("#lstres").attr("opacity",1)
              d3.select("#mstress").attr("opacity",notimp)
              d3.select("#hstress").attr("opacity",notimp)
              d3.select("#vhighs").attr("opacity",notimp)
          }
          else if(d.SCRS >= 5 && d.SCRS < 10){
              d3.select("#vlows").attr("opacity",notimp)
              d3.select("#lstres").attr("opacity",notimp)
              d3.select("#mstress").attr("opacity",1)
              d3.select("#hstress").attr("opacity",notimp)
              d3.select("#vhighs").attr("opacity",notimp)
          }
          else if(d.SCRS >= 10 && d.SCRS <= 15){
              d3.select("#vlows").attr("opacity",notimp)
              d3.select("#lstres").attr("opacity",notimp)
              d3.select("#mstress").attr("opacity",notimp)
              d3.select("#hstress").attr("opacity",1)
              d3.select("#vhighs").attr("opacity",notimp)
          }
          else {
              d3.select("#vlows").attr("opacity",notimp)
              d3.select("#lstres").attr("opacity",notimp)
              d3.select("#mstress").attr("opacity",notimp)
              d3.select("#hstress").attr("opacity",notimp)
              d3.select("#vhighs").attr("opacity",1)
          }
          //左侧的类

          // 鼠标悬停时，添加"faded"类到所有非当前path元素
          const currentPath = d3.select(this);
          d3.selectAll('.round')
            .classed('faded', function() {
              return this !== currentPath.node();
            });

          d3.select(this)
            .transition() // 可选，为变换添加一个平滑的过渡效果
            .duration(150) // 可选，过渡持续时间，单位为毫秒
            .attr('transform', 'scale(1.02)');
          
          const t = mous.style("opacity", 1)
          .html(
              function(){
                if(d.SCRS == 0){return "非常好"}
                else if((d.SCRS >= 1 && d.SCRS < 5)){return "轻微压力"}
                else if(d.SCRS >= 5 && d.SCRS < 10){return "有压力"}
                else if(d.SCRS >= 10 && d.SCRS <= 15){return "较高压力"}
                else {return "高压力"}
              }
          );
        })
        .on("mousemove",(event,d)=>{
          return mous.style('top', event.pageY+'px').style('left',event.pageX+'px')
        })
        .on('mouseout', function() {
          // 鼠标移出时，移除所有path元素上的"faded"类
          d3.selectAll('.round').classed('faded', false);
          mous.style("opacity", 0);

          d3.select(this)
          .transition() // 可选，为变换添加一个平滑的过渡效果
          .duration(150) // 可选，过渡持续时间，单位为毫秒
          .attr('transform', 'scale(1)');

          d3.select("#vlows").attr("opacity",1)
          d3.select("#lstres").attr("opacity",1)
          d3.select("#mstress").attr("opacity",1)
          d3.select("#hstress").attr("opacity",1)
          d3.select("#vhighs").attr("opacity",1)
        });


      //HR
      d3.selectAll('.biodata')
      .on('mouseover', function(event,d) {
        //左侧的圆圈vlows,lstres,mstress,hstress,vhighs

        const notimp = 0;

        if(d.SCRS == 0){
          d3.select("#vlows").attr("opacity",1)
          d3.select("#lstres").attr("opacity",notimp)
          d3.select("#mstress").attr("opacity",notimp)
          d3.select("#hstress").attr("opacity",notimp)
          d3.select("#vhighs").attr("opacity",notimp)

        }
        else if(d.SCRS >= 1 && d.SCRS < 5){
            d3.select("#vlows").attr("opacity",notimp)
            d3.select("#lstres").attr("opacity",1)
            d3.select("#mstress").attr("opacity",notimp)
            d3.select("#hstress").attr("opacity",notimp)
            d3.select("#vhighs").attr("opacity",notimp)
        }
        else if(d.SCRS >= 5 && d.SCRS < 10){
            d3.select("#vlows").attr("opacity",notimp)
            d3.select("#lstres").attr("opacity",notimp)
            d3.select("#mstress").attr("opacity",1)
            d3.select("#hstress").attr("opacity",notimp)
            d3.select("#vhighs").attr("opacity",notimp)
        }
        else if(d.SCRS >= 10 && d.SCRS <= 15){
            d3.select("#vlows").attr("opacity",notimp)
            d3.select("#lstres").attr("opacity",notimp)
            d3.select("#mstress").attr("opacity",notimp)
            d3.select("#hstress").attr("opacity",1)
            d3.select("#vhighs").attr("opacity",notimp)
        }
        else {
            d3.select("#vlows").attr("opacity",notimp)
            d3.select("#lstres").attr("opacity",notimp)
            d3.select("#mstress").attr("opacity",notimp)
            d3.select("#hstress").attr("opacity",notimp)
            d3.select("#vhighs").attr("opacity",1)
        }

        // 鼠标悬停时，添加"faded"类到所有非当前path元素
        const currentPath = d3.select(this);

        d3.selectAll('.biodata')
          .classed('faded', function() {
            return this !== currentPath.node();
          });
        d3.select(this)
          .transition() // 可选，为变换添加一个平滑的过渡效果
          .duration(150) // 可选，过渡持续时间，单位为毫秒
          .attr('transform', 'scale(1.02)');
        
        const t = mous.style("opacity", 1).html(
          function(){
            if(d.SCRS == 0){return ":)"}
            else if((d.SCRS >= 1 && d.SCRS < 5)){return ":]"}
            else if(d.SCRS >= 5 && d.SCRS < 10){return ":|"}
            else if(d.SCRS >= 10 && d.SCRS <= 15){return ":/"}
            else {return ":("}
          }
          //"生理数据<br><br>"+"HR:"+d.outR+"<br>"+"HRV:"+d.SDNN+"<br>"+"SCR:"+d.SCRS
          )

        //显示时间刻度
        const drawshowtime = (angle,offset,text)=>{
            const [x1, y1] = getCoordinatesForAngle(angle, offset)
            const [x2, y2] = getCoordinatesForAngle(angle, offset)  
            annotationGroup.append("text")
              .attr("id","showtime")
              .attr("class", "annotation-text")
              .attr("color","red")
              .attr("opacity","0.3")
              .attr("x", d=>{if(x2>0){return x2+7}else{return x2-30}})
              .attr("y", d=>{if(y2>0){return y2+15}else{return y2-15}})
              .text(text)
        }
        const showtime = drawshowtime(angleScale1(dateParseH(d.TIME.slice(-5))), 0.7, d.TIME.slice(-5));
        //显示时间刻度

        //改变文本
        /*tooltip2.html(`
          <br><strong>生理数据</strong><br>
          <strong>HR:</strong> ${d.outR}<br>
          <strong>HRV:</strong>${d.SDNN}<br>
          <strong>SCR:</strong>${d.SCRS}<br>
        `);*/
        //改变文本

        //左侧时间和标签
        const timedisplay = d3.select(".timedisplay");
        timedisplay.html(`<strong>${d.TIME.slice(-5)}</strong>`)
        //左侧时间和标签
      })
      .on("mousemove",(event,d)=>{
        return mous.style('top', event.pageY+'px').style('left',event.pageX+'px')
      })
      .on('mouseout', function(event,d) {
        // 鼠标移出时，移除所有path元素上的"faded"类
        d3.selectAll('.biodata').classed('faded', false);
        d3.select(this)
        .transition() // 可选，为变换添加一个平滑的过渡效果
        .duration(150) // 可选，过渡持续时间，单位为毫秒
        .attr('transform', 'scale(1)');


        d3.select("#showtime").remove();
        mous.style("opacity", 0);

        d3.select("#vlows").attr("opacity",1)
        d3.select("#lstres").attr("opacity",1)
        d3.select("#mstress").attr("opacity",1)
        d3.select("#hstress").attr("opacity",1)
        d3.select("#vhighs").attr("opacity",1)

      });
    
      //半透明-----------------------------------------------------------------------------------------------------------------------

      //tags-----------------------------------------------------------------------------------------------------------------------
      const getXFromDataPointtags = (d, offset = 0.8) => getCoordinatesForAngle(//offset 显示宽度？ coordinate坐标
      angleScale1(dateAccessorH(d)),
      0.7
      )[0]
      const getYFromDataPointtags = (d, offset = 0.8) => getCoordinatesForAngle(
      angleScale1(dateAccessorH(d)),
      0.7
      )[1]
      Ttags = [];
      //console.log(tags);
      
      for(i=0;i<tags.length;i++){
        itemtags = {};
        if(i==0 && tags.length-1 !=0){//按两下是高压
          //console.log("i=0")
          if(parseInt(tags[i].TIMESTAMP)+2>parseInt(tags[i+1].TIMESTAMP)){
            itemtags.H = tags[i].TIMESTAMP;
            itemtags.L = 0;
            itemtags.TIME = new Date(parseInt(tags[i].TIMESTAMP) * 1000).toLocaleString().replace(/:\d{1,2}$/,'');

          }else{
            itemtags.L = tags[i].TIMESTAMP;
            itemtags.H = 0;
            itemtags.TIME = new Date(parseInt(tags[i].TIMESTAMP) * 1000).toLocaleString().replace(/:\d{1,2}$/,'');
          } 
        }

        if(i==0 && tags.length-1 ==0){//按两下是高压
            itemtags.L = tags[i].TIMESTAMP;
            itemtags.H = 0;
            itemtags.TIME = new Date(parseInt(tags[i].TIMESTAMP) * 1000).toLocaleString().replace(/:\d{1,2}$/,'');
        }
        if(i==tags.length-1 && tags.length-1 !=0){
          if(parseInt(tags[i-1].TIMESTAMP)+2>parseInt(tags[i].TIMESTAMP)){
            continue;
          }else{
            itemtags.L = tags[i].TIMESTAMP;
            itemtags.H = 0;
            itemtags.TIME = new Date(parseInt(tags[i].TIMESTAMP) * 1000).toLocaleString().replace(/:\d{1,2}$/,'');
          }
        }
        if(i != 0 && i != tags.length -1){
          if(parseInt(tags[i-1].TIMESTAMP)+2>parseInt(tags[i].TIMESTAMP)){
            continue;
          }else{
            if(parseInt(tags[i].TIMESTAMP)+2>parseInt(tags[i+1].TIMESTAMP)){
              itemtags.H = tags[i].TIMESTAMP;
              itemtags.L = 0;
              itemtags.TIME = new Date(parseInt(tags[i].TIMESTAMP) * 1000).toLocaleString().replace(/:\d{1,2}$/,'');
            }else{
              //console.log("111")
              itemtags.L = tags[i].TIMESTAMP;
              itemtags.H = 0;
              itemtags.TIME= new Date(parseInt(tags[i].TIMESTAMP) * 1000).toLocaleString().replace(/:\d{1,2}$/,'');
            }
          }
        }
        Ttags.push(itemtags)
      }
      
      //console.log("Ttags")
      //console.log(Ttags)
      //Ttags = Ttags.filter(d => parseInt(d.H) < parseInt(dataobj1[dataobj1.length-1].TIMESTAMP) && parseInt(d.L) < parseInt(dataobj1[dataobj1.length-1].TIMESTAMP))
      const tagsGroupH = bounds1.append("g").attr("z-index","10")


      //种类 single/double
      const areaHRVtagsH = tagsGroupH.selectAll("path")
        .data(Ttags.filter(d =>parseInt(d.H) !=0))
        .enter()
        .append("path")
        .attr("transform", d => {
          x = getXFromDataPointtags(d, 1);
          y = getYFromDataPointtags(d, 1);
          return "translate(" + x + "," + y + ")"}
        )
        .attr("d",d3.arc()
          .outerRadius(8)
          .innerRadius(4)
          .startAngle(0)
          .endAngle(Math.PI*2))
        .attr("fill", "white")
        .style("stroke","#152329")
        .attr("stroke-width","1.5")
        .attr("opacity","1")
        .on("click",(event,d) => {
          const t = mous.style("opacity", 1).html("时间<br><br>"+new Date(parseInt(d.H) * 1000).toLocaleString().replace(/:\d{1,2}$/,' ').slice(-6))
          d3.select(event.currentTarget)
            .transition()
            .duration(300)
            .attr("fill","#FFFF33")
            .attr("d",d3.arc()
              .outerRadius(20)
              .innerRadius(8)
              .startAngle(0)
              .endAngle(Math.PI*2))
            .transition()
            .duration(2000)
            .attr("d",d3.arc()
              .outerRadius(8)
              .innerRadius(4)
              .startAngle(0)
              .endAngle(Math.PI*2))
            .attr("fill","white")
            //mous.style("opacity", 0)
        })

      const tagsGroupL = bounds1.append("g").attr("z-index","10")
      const areaHRVtagsL = tagsGroupL.selectAll("circle")
        .data(Ttags.filter(d =>parseInt(d.L)!=0))
        .enter()
        .append("circle")
        .attr("fill","white")
        .attr("cx", d => (getXFromDataPointtags(d, 1)))
        .attr("cy", d =>  (getYFromDataPointtags(d, 1)))
        .attr("r","8")
        .style("stroke","#152329")
        .attr("stroke-width","1.5")
        .attr("opacity","1")
        .on("click",(event,d) => {
          const t = mous.style("opacity", 1).html("时间<br><br>"+new Date(parseInt(d.L) * 1000).toLocaleString().replace(/:\d{1,2}$/,' ').slice(-6))
          d3.select(event.currentTarget)
            .transition()
            .duration(300)
            .attr("r","20")
            .attr("fill","#e0f2f2")
            .transition()
            .duration(2000)
            .attr("r","8")
            .attr("fill","white")
            //mous.style("opacity", 0)

          /*d3.select('.tagdescription').html(
            "TAGS:<br>这会儿在洗盘子"
          );*/
        })
      //tags

      //记录


      //x和y坐标
      const getCoordinatesForAnglerect = (banjing, angle, offset = 0.8) => [//偏移量是1    ？？？？
        Math.cos(angle - Math.PI / 2) * banjing ,//PI=pai.Math.PI = 3.14 = 180°
        Math.sin(angle - Math.PI / 2) * banjing ,//cos²x+sin²x=1
      ]

      const getXFromDataPointrect = (d, offset = 0.8) => getCoordinatesForAnglerect(//offset 显示宽度？ coordinate坐标
        radiusScaleHRV(HRVAccessor(d)),
        angleScale1(dateAccessorH(d)),
        0.845
        )[0]
      const getYFromDataPointrect = (d, offset = 0.8) => getCoordinatesForAnglerect(
        radiusScaleHRV(HRVAccessor(d)),
        angleScale1(dateAccessorH(d)),
        0.845
        )[1]
      //x和y坐标

      //HRV的基线
      const basecircle = bounds1.append("circle")
        .attr("r", d=> radiusScaleHR(HRbaseline))
        .attr("class","baseline")
        .attr("fill","none")
        .attr("cx","0")
        .attr("cy","0")
        .attr("stroke-width","2")
        .attr("stroke","white")
        .attr("stroke-dasharray","0.5,1,4")

      //基准圆
      const basecircle0 = bounds1.append("circle")
        .attr("r", "260px")
        .attr("class","baseline0")
        .attr("fill","none")
        .attr("cx","0")
        .attr("cy","0")
        .attr("stroke-width","2")
        .attr("stroke","white")
        .attr("stroke-dasharray","4,4,4")


      //起始位置
      starttriangle = d3.symbol().type(d3.symbolTriangle).size(20);
      const tickLabelBackgrounds = peripherals.append("path")
        .attr("transform", "translate(0,"+(-radiusScaleHR(baseline))+") rotate(90)")
        .attr("d",starttriangle)
        .attr("fill", "grey")

      //记录
      const ipt = d3.select("#ipt");//输入
      calculate = 0;

    //随着鼠标转的圆
      document.addEventListener('mousemove', function(event) {
        var circle = document.getElementById('followmousemove');
        var tracker = document.getElementById('tracker');

        var circleRect = circle.getBoundingClientRect();

        var circleX = circleRect.left + circleRect.width / 2;
        var circleY = circleRect.top + circleRect.height / 2;

        var angle = Math.atan2(event.clientY - circleY, event.clientX - circleX);

        var radius = circleRect.width / 2-12; // 减去tracker的一半宽度以保持其完全在圆内
        var trackerX = radius * Math.cos(angle) + circleRect.width / 2 - tracker.offsetWidth / 2;
        var trackerY = radius * Math.sin(angle) + circleRect.height / 2 - tracker.offsetHeight / 2;

        tracker.style.left = `${trackerX}px`;
        tracker.style.top = `${trackerY}px`;

        let trace = document.createElement('div');
        trace.classList.add('trace');
        trace.style.width = '8px';
        trace.style.height = '8px';
        trace.style.left = `${trackerX}px`;
        trace.style.top = `${trackerY}px`;
    

        // Add the trace to the container
        circle.appendChild(trace);

        setTimeout(() => {
          trace.style.opacity = '0';
          // Remove the trace after the transition
          trace.addEventListener('transitionend', () => {
            trace.remove();
          });
        }, 1000); // Adjust time as needed
    });
    //随着鼠标转的圆


      //创建tags;贴纸
      const annotationGroup1 = bounds1.append("g");
      const drawtagline = (angle, offset) => {
        const [x2, y2] = getCoordinatesForAngle(angle, offset);
        const [x3, y3] = getCoordinatesForAngle(angle, offset-0.2);
        xnote = 0;
        tnote = 0;
        linel = 40;

        annotationGroup1.append("line")
          .attr("class", "annotation-line")
          .attr("x1", x3)
          .attr("x2", x2)
          .attr("y1", y3)
          .attr("y2", y2)

        const textcircle = annotationGroup1.append("g");
        textcircle.append("circle").attr("class","imageselect")
          .attr("r","5px")
          .attr("fill","#FFFF33")//tag的颜色
          .attr("cx",x2)
          .attr("cy",y2)
          .on("click",(event)=>{
              calculate += 1;
              if(calculate % 2 ==1){
              d3.select(event.currentTarget)
                .transition()
                .duration(200)
                .attr("fill","red")
              }else{
              d3.select(event.currentTarget)
                .transition()
                .duration(200)
                .attr("fill","blue")    
              }
              
              //修改icon
              var mouseX = event.pageX;
              var mouseY = event.pageY;

              document.getElementById("image-selector").style.display="block";
              document.getElementById("image-selector").style.left = mouseX + 'px'; 
              document.getElementById("image-selector").style.top = mouseY + 'px';
 

            // 获取当前点击的path元素
            var currentPath = event.currentTarget;
            document.querySelectorAll('.image-option').forEach(function(img) {
                  img.onclick = function() {
                    // 获取选中的图片URL
                    var imgUrl = this.getAttribute('data-img');
  
                    // 获取点击的path的位置和尺寸信息
                    var bbox = currentPath.getBBox();
                    var x = bbox.x + bbox.width / 2; // 根据需要调整这个位置
                    var y = bbox.y + bbox.height / 2; // 根据需要调整这个位置
              
                    // 创建一个新的image元素并设置属性
                    var svgImage = document.createElementNS('http://www.w3.org/2000/svg', 'image');
                    svgImage.setAttributeNS('http://www.w3.org/1999/xlink', 'href', imgUrl);
                    svgImage.setAttribute('x', x);
                    svgImage.setAttribute('y', y);
                    svgImage.setAttribute('width', bbox.width*2); // 可调整为适合的尺寸
                    svgImage.setAttribute('height', bbox.height*2); // 可调整为适合的尺寸
                    
                    // 将新的image元素添加到SVG容器中
                    currentPath.parentNode.appendChild(svgImage);
              
                    // 隐藏图片选择器
                    document.getElementById('image-selector').style.display = 'none';

                    //注释文本
                    textcircle.append("text")
                    .attr("class","textdisplay")
                    .text("记录")
                    .attr("font-size","0.6em")
                    .attr("fill","white")
                    .attr("x",x2+10)
                    .attr("y",y2)
                    .on("click",(event,d)=>{
                      const inputArea = d3.select("#inputarea");

                      var mouseX = event.pageX;
                      var mouseY = event.pageY;
                      document.getElementById("ipt").style.left = mouseX + 'px';
                      document.getElementById("ipt").style.top = mouseY + 'px'; 

                      document.getElementById("ipt").style.display = '';
                      inputArea.node().focus();
                      d3.select(event.currentTarget).attr("opacity","1");
                    })
                    .on("mouseout",function(event,d){
                      d3.select(event.currentTarget).attr("opacity","0")
                      document.getElementById("ipt").style.display = 'none';
                      d3.select(event.currentTarget).text(context).attr("font-size","1em");
                    })
                    .on("mouseover",function(event,d){
                      d3.select(event.currentTarget).attr("opacity","1")
                    })
                  };
            });

          })

         //注释文本
          textcircle.append("text")
          .attr("class","textdisplay")
          .text("")
          .attr("font-size","0.6em")
          .attr("fill","#3a8ee4")
          .attr("x",x2+10)
          .attr("y",y2)
          .on("click",(event,d)=>{
            const inputArea = d3.select("#inputarea");

            var mouseX = event.pageX;
            var mouseY = event.pageY;
            document.getElementById("ipt").style.left = mouseX + 'px';
            document.getElementById("ipt").style.top = mouseY + 'px'; 

            document.getElementById("ipt").style.display = '';
            inputArea.node().focus();
            d3.select(event.currentTarget).attr("opacity","1");
          })
          .on("mouseout",function(event,d){
            d3.select(event.currentTarget).attr("opacity","0")
            document.getElementById("ipt").style.display = 'none';
            d3.select(event.currentTarget).text(context).attr("font-size","1em");
          })
          .on("mouseover",function(event,d){
            d3.select(event.currentTarget).attr("opacity","1")
          })
      }


      for(i=0;i<Ttags.length;i++){
        drawtagline(angleScale1(dateParseH(Ttags[i].TIME.slice(-5))),0.7);
      }

    //圆的映射-----------------------------------------------------------------
    const yuan = dimensions.width*1/5;

    //画大圆
    // 创建滤镜元素
    var defs = boundscircle.append("defs");
    const filter = defs.append('filter')
    .attr('id', 'inner-shadow')
    .attr('x', '-50%')
    .attr('y', '-50%')
    .attr('width', '200%')
    .attr('height', '200%');

    // 首先创建模糊效果
    filter.append('feGaussianBlur')
        .attr('in', 'SourceAlpha')
        .attr('stdDeviation', 4)
        .attr('result', 'blurred');

    // 再使用feOffset偏移阴影
    filter.append('feOffset')
        .attr('dx', 2)
        .attr('dy', 2)
        .attr('result', 'offsetBlur');

    // 使用feComposite将阴影限制在原图形内部
    filter.append('feComposite')
        .attr('in', 'blurred')
        .attr('in2', 'SourceAlpha')
        .attr('operator', 'arithmetic')
        .attr('k2', '-1')
        .attr('k3', '1')
        .attr('result', 'shadow');

    // 合并图形和阴影
    filter.append('feComposite')
        .attr('in', 'shadow')
        .attr('in2', 'SourceGraphic')
        .attr('operator', 'over');

    boundscircle.append('circle')
    .attr("id","dayuan")
    .attr('cx', "0")
    .attr('cy', "0")
    .attr('r', yuan)
    .style('fill', "white")
    .attr("opacity","0.8")
    .style('stroke', 'none')
    .style("filter",'url(#inner-shadow)');

    const xiangqiecircle =[];
    var vlows = 0;
    var lstres = 0;
    var mstress = 0;
    var hstress = 0;
    var vhighs = 0;

    for(i=0;i<handle.length;i++){
      if(handle[i].SCRS == 0){vlows+=1;}
      else if((handle[i].SCRS >= 1 && handle[i].SCRS < 5)){lstres+=1;}
      else if(handle[i].SCRS >= 5 && handle[i].SCRS < 10){mstress+=1;}
      else if(handle[i].SCRS >= 10 && handle[i].SCRS <= 15){hstress+=1;}
      else {vhighs+=1;}
    }

    const SScale = d3.scaleLinear()
    .domain(d3.extent([vlows,lstres,mstress,hstress,vhighs]))
    .range([0, (vlows+lstres+mstress+hstress+vhighs)*1.5])
    .nice()

    var itemyuan = {};
    itemyuan.radius = SScale(vlows);
    itemyuan.label = "放松";
    itemyuan.image = "img/stress5.png";
    itemyuan.id = "vlows";
    itemyuan.color = color1["lowlowstress"];
    xiangqiecircle.push(itemyuan);

    var itemyuan = {};
    itemyuan.radius = SScale(lstres);
    itemyuan.label = "轻微压力";
    itemyuan.image = "img/stress4.png";
    itemyuan.id = "lstres";
    itemyuan.color = color1["lowstress"];
    xiangqiecircle.push(itemyuan);

    var itemyuan = {};
    itemyuan.radius = SScale(mstress);
    itemyuan.label = "有压力";
    itemyuan.id = "mstress";
    itemyuan.image = "img/stress3.png";
    itemyuan.color = color1["middle"];
    xiangqiecircle.push(itemyuan);

    var itemyuan = {};
    itemyuan.radius = SScale(hstress);
    itemyuan.label = "较高压力";
    itemyuan.id = "hstress";
    itemyuan.image = "img/stress2.png";
    itemyuan.color = color1["highstress"];
    xiangqiecircle.push(itemyuan);

    var itemyuan = {};
    itemyuan.radius = SScale(vhighs);
    itemyuan.label = "高压力";
    itemyuan.image = "img/stress1.png";
    itemyuan.id = "vhighs";
    itemyuan.color = color1["highhighstress"];
    xiangqiecircle.push(itemyuan);

    // 创建力布局
    const simulation = d3.forceSimulation(xiangqiecircle)
    .force('boundary', alpha => {
      xiangqiecircle.forEach(d => {
            const dist = Math.sqrt((d.x) ** 2 + (d.y) ** 2);
            const delta = (dist + d.radius) - yuan;
            if (delta > 0) {
                // 小圆在大圆内部超出边界，需要将其向内推
                d.x -= delta * (d.x) / dist * alpha;
                d.y -= delta * (d.y) / dist * alpha;
            }
        });
    })
    .force('charge', d3.forceManyBody().strength(4))
    .force('center', d3.forceCenter(0, 0))
    .force('collision', d3.forceCollide().radius(function(d) {return d.radius;}))
    .on('tick', ticked);

    function ticked() {
      const selectcircle = boundscircle.selectAll('circle.boundscircle')
        .data(xiangqiecircle, function(d) { return d.id; }) 

      selectcircle.enter()
          .append('circle')
          .attr('class', 'boundscircle')
          .attr('id', function(d) { return d.id; }) 
          .attr('r', function(d) {return d.radius;})
          .merge(selectcircle)
          .attr('cx', function(d) {return d.x;})
          .attr('cy', function(d) {return d.y;})
          .attr("fill",function(d) { return d.color; })

      //文本
      const texts = boundscircle.selectAll('text.yuanlabel')
          .data(xiangqiecircle, function(d) { return d.id; });

      texts.enter()
          .append('text')
          .attr('class', 'yuanlabel')
          .attr('id', function(d) { return `label-${d.id}`; })
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .text(function(d) { if(d.radius>40){return d.label; }else{return "";}})
          .style("font-size","30px")
          .merge(texts)
          .attr('x', function(d) { return d.x; })
          .attr('y', function(d) { return d.y; })
          .attr("fill","white");
      //文本

      selectcircle.exit().remove();
    }

    simulation.alpha(1).restart();
    //圆的映射-----------------------------------------------------------------

}
//drawChart()
