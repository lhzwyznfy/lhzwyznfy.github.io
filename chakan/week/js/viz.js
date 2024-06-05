var AVEReturn = [];//七天的均值

function Month(){
    window.location.href = "../month/month.html";
}

function drawChartWeek(weekDates,weekOfMonth,dates) { 
    console.log(weekDates)
    //周的话，咱就只显示时间和情绪吧！tag
    //画图！
    calcueveryday(weekDates);
}

var weekDates=["2024-4-10","2024-4-11","2024-4-12","2024-4-13","2024-4-14","2024-4-15","2024-4-16"];
drawChartWeek(weekDates,weekOfMonth,dates);



async function calcueveryday(dates){
    var AVEReturn = [];//七天的均值

    for(m=0;m<7;m++){
        //当天的每五分钟情况
        var avemin = [];

        //设置需要return的东西
        var AVEWEEK = {};
        // 1. Access data
        const tag = "data/"+dates[m]+"/tags.csv"
        const pathHR = "data/"+dates[m]+"/HR.csv"
        const pathIBI = "data/"+dates[m]+"/IBI.csv"
        const pathTEMP = "data/"+dates[m]+"/TEMP.csv"
        const pathSCR = "data/"+dates[m]+"/SCR.csv"

        //数据集
        const datasettag = await d3.csv(tag); 
        const datasetHR = await d3.csv(pathHR); 
        const pathsetIBI = await d3.csv(pathIBI);
        const pathsetTEMP = await d3.csv(pathTEMP);
        const TEMPvalue = Object.values(pathsetTEMP); 
        const datasetSCR = await d3.csv(pathSCR);


        //SCR-------------------------------------  
        SCRtime = [];
        for(i=0;i<datasetSCR.length;i++){
            SCRtime.push(parseInt(datasetSCR[i].peak_end_times_stamp));
        }

        //datasetHR添加时间-------------------------------------  
        const T0 = parseInt(datasetHR[0].TIMESTAMP);
        let T00 = 0;
        for (i=0;i<datasetHR.length;i++){
            datasetHR[i].HR = parseFloat(datasetHR[i].HR);
            datasetHR[i].TIMESTAMP =  T00 + T0;
            datasetHR[i].TIME = new Date((T00 + T0) * 1000).toLocaleString().replace(/:\d{1,2}$/,'');
            T00+=1;
        }

        //计算测度项------------------------------------
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
        averagetemp = (averagetemp/TEMPvalue.length).toFixed(2);//TEMP的均值

        //合并测度项------------------------------------
        //把SCR和TEMP加到HR里面------------------------------------
        map = {};
        result = [];
        itemmach = {};
        baseline = 0;
        
        //每秒和每五分钟
        var conmin = 0;
        var interv = 300;
        var itemmin = {};
        var minHR = 0;
        var minTEMP = 0;
        var minSCR = 0;

        for(i=0;i<datasetHR.length;i++){

            baseline += parseFloat(datasetHR[i].HR);

            if(!TEMPvalueAVE[i]){
                datasetHR[i].TEMP = averagetemp;
            }else{
                datasetHR[i].TEMP = TEMPvalueAVE[i].TEMP;}
            if(SCRtime[i]){
                ind = datasetHR.findIndex(d => d.TIMESTAMP == SCRtime[i]);
                if(ind != -1){datasetHR[ind].SCR = 1;}
            }


            if(conmin%interv != 0){
                minHR += parseFloat(datasetHR[i].HR);
                if(!TEMPvalueAVE[i]){minTEMP += averagetemp;}else{
                    minTEMP += parseFloat(TEMPvalueAVE[i].TEMP);
                }

                for(j=0;j<SCRtime.length;j++){
                        if(SCRtime[j]==datasetHR[i].TIMESTAMP){minSCR+=1;}
                        
                }

            }else{
                itemmin.HR = minHR/interv;
                itemmin.TEMP = minTEMP/interv;
                itemmin.SCR = minSCR;
                itemmin.TIME = datasetHR[i].TIME;
                itemmin.TIMESTAMP = datasetHR[i].TIMESTAMP;
                avemin.push(itemmin);

                itemmin = {};
                minHR = 0;
                minTEMP = 0;
                minSCR = 0;
            }

            conmin += 1;

        }

        HRbaseline = (baseline/datasetHR.length).toFixed(2);

        //一整天的均值------------------------------------
        AVEWEEK.TEMPAVE = averagetemp;
        AVEWEEK.HRAVE = HRbaseline;
        AVEWEEK.SCRS = datasetSCR.length;
        AVEReturn.push(AVEWEEK);
        AVEWEEK = {};
        console.log("前"+m+"天的数据")
        console.log(AVEReturn);
        //console.log(avemin)


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
        const dateParsetest = d3.timeParse("%H:%M");
        const strA = "9:00"; 
        const strB = "19:00"; 
        starttime = parseInt(datasetHR[0].TIME.slice(-5,-3));
        endtime = parseInt(datasetHR[datasetHR.length-1].TIME.slice(-5,-3))+1;
        starttimemin = datasetHR[0].TIME.slice(-5);
        endtimemin = datasetHR[datasetHR.length-1].TIME.slice(-5);
        const A = dateParsetest(strA);
        const B = dateParsetest(strB);
        oriTIME.push(A);
        oriTIME.push(B);
        //console.log(oriTIME)
        const C = dateParsetest((parseInt(strA)-1)+":58");
        const D = dateParsetest(parseInt(strB)+":58");

        //定义画布
        const width =150;
        const dimensions = {
        width: width,
        height: width,
        radius: width / 2,
        margin: {
        top: 0,
        right: 20,
        bottom: 0,
        left: 20,
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
        d3.select(`#weekwrapper${m}`).html("");
        const wrapper = d3.select(`#weekwrapper${m}`)//是整体的画布
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
        avemin.forEach( d=>{     
          p = [];   
          item={}
          item.SCRS = d.SCR;
          item.TIME = d.TIME;
          item.HR = HRAccessor(d);
          p.push(item);
          item = {};
          datapath.push(p);
        })

        //console.log(datapath)
        for(k=1;k<4;k++){//同心圆刻度线
            quarterr = k*30;
      
            bounds.append("circle")
            .attr("r",quarterr)
            .attr("class","baseline1")
            .attr("cx","0")
            .attr("cy","0")
            .attr("stroke-width","2")
            .attr("stroke-dasharray","2,2,2")
          }
        
        const illus = bounds.append("g");
        for(i=0;i<datapath.length;i++){
            let illustrate = illus.append("g").datum(datapath[i])
            illustrate.selectAll(".round").data(datapath[i])
                .join("path")
                .attr("class","round")
                .attr("id",`weekpath${m}`)
                .attr("d", d3.arc()
                    .outerRadius(75)  // 以像素为单位的外半径
                    .innerRadius(40)  // 以像素为单位的内半径
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
            .attr("class", "weektext")
            .attr("id",`weektext${m}`)
            .attr("x", -24)
            .attr("y", 10)
            .text(function(d){
                if(m==0){return "周7"}
                else{return `周${m}`}
            })
            .attr("fill", function(d){
                if(m==0 || m==6){return color1["highhighstress"]}
                else{return "#0055ca"}
            })
            .attr("font-size","2em")
            .on("click",function(event){
                const currentTEXT = d3.select(this);

                d3.selectAll(".weektext")          
                .classed('faded', function() {
                    return this !== currentTEXT.node();
                  });

                const selectid = d3.select(event.currentTarget).attr("id").slice("-1");
                const selectTEMP = d3.selectAll("#TEMPAVE-bar-"+selectid);
                const selectHR = d3.selectAll("#HRAVE-bar-"+selectid);
                const selectSCR = d3.selectAll("#SCRS-bar-"+selectid);

                // 先获取每个选中元素的DOM节点
                const selectTEMPNode = selectTEMP.node();
                const selectHRNode = selectHR.node();
                const selectSCRNode = selectSCR.node();

                d3.selectAll(".bar")                
                .classed('faded', function() {
                    return this !== selectTEMPNode && this !== selectHRNode && this !== selectSCRNode;
                  });
            })
    }



    function createBarChart(containerId, data, valueKey, title) {
        const width = 200, height = 200, margin = { top: 20, right: 20, bottom: 30, left: 40 };

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
             .attr("id",(d, i) => `${valueKey}-bar-${i}`)
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

      d3.select("#chartTEMPAVE").html("");
      d3.select("#chartHRAVE").html("");
      d3.select("#chartSCRS").html("");

    createBarChart("#chartTEMPAVE", AVEReturn, 'TEMPAVE', 'Average Temperature');
    createBarChart("#chartHRAVE", AVEReturn, 'HRAVE', 'Average Heart Rate');
    createBarChart("#chartSCRS", AVEReturn, 'SCRS', 'SCRs');


}


