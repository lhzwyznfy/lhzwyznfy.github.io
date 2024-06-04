
//一次性应该是一个横行的模块
//最上方是一个搜索横栏
//logo+名字信息+【我这一行：三个类型选择】+ 每一天的情绪总结
//加一个滑动翻页？

//为每个div添加图片
document.addEventListener('DOMContentLoaded', RenewEmo(2024,4,20));

document.addEventListener('DOMContentLoaded', () => {
    // 获取所有的circlesociety元素
    const societies = document.querySelectorAll('.circlesociety');

    // 为每个circlesociety添加点击事件监听器
    societies.forEach(society => {
        society.addEventListener('click', function() {
            // 移除之前有active类的元素的active类
            societies.forEach(soc => {
                soc.classList.remove('active');
            });

            // 为被点击的元素添加active类
            this.classList.add('active');

            // 获取并输出label的文本
            const labelText = this.querySelector('.label').textContent;

            updateSociety(labelText);
        });
    });
});


function updateSociety(labelText="情绪"){
    const datePicker = document.getElementById("datePicker");
    const selectedDate = datePicker.value;
    const currentDate = new Date();
    const inputDate = new Date(selectedDate);

    //获取年月日
    const year = inputDate.getFullYear(); // 获取年份
    const month = inputDate.getMonth()+1; // 获取月份，月份从0开始所以加1
    const day = inputDate.getDate(); // 获取日期

    const monthid = month-1;

    //修改日期选择器透明度
    datePicker.style.opacity = (datePicker.style.opacity === "0") ? "1" : "0";
    const datechange = d3.select("#date-display")
    .on("click",function(event){
      datePicker.style.opacity = (datePicker.style.opacity === "0") ? "1" : "0";
    })

    if(labelText=="日志"){RenewJournal(year,month,day)}
    else if(labelText=="时长"){RenewTime(year,month,day)}
    else{RenewEmo(year,month,day)};
}

function RenewEmo(year,month,day){
    const dates = document.querySelectorAll('.datediv');
    const selectdate = document.getElementById("dateselect");
    const selectdate1 = document.getElementById("date-display");
    selectdate.innerHTML=year+"年";
    selectdate1.innerHTML=year+"年"+month+"月"+day+"日";

    for(i=0;i<dates.length;i++){
        const thisday = day+i;
        const writedate =month+"/"+thisday;
       dates[i].innerHTML=writedate  
    }

    const images = [
        'stress1.png',
        'stress2.png',
        'stress3.png',
        'stress4.png',
        'stress5.png'
    ];

    const divs = document.querySelectorAll('.imgdiv');

    divs.forEach(div => {
        div.innerHTML=""
        const randomIndex = parseInt(Math.random()*5);
        const selectedImage =images[randomIndex];
        const img = document.createElement('img');
        img.src = `../img/${selectedImage}`;
        img.alt = '???';
        div.appendChild(img);
       
    });

}

function RenewTime(year,month,day){
    const dates = document.querySelectorAll('.datediv');
    const selectdate = document.getElementById("dateselect");

    const selectdate1 = document.getElementById("date-display");
    selectdate.innerHTML=year+"年";
    selectdate1.innerHTML=year+"年"+month+"月"+day+"日";

    for(i=0;i<dates.length;i++){
        const thisday = day+i;
        const writedate =month+"/"+thisday;
       dates[i].innerHTML=writedate  
    }

    const images = [
        'time1.png',
        'time2.png',
        'time3.png',
        'time4.png',
        'time5.png'
    ];

    const divs = document.querySelectorAll('.imgdiv');

    divs.forEach(div => {
        div.innerHTML=""
        const randomIndex = parseInt(Math.random()*5);
        const selectedImage =images[randomIndex];
        const img = document.createElement('img');
        img.src = `../img/${selectedImage}`;
        img.alt = '???';
        div.appendChild(img);
       
    });

}

function RenewJournal(year,month,day){
    const dates = document.querySelectorAll('.datediv');
    const selectdate = document.getElementById("dateselect");
    const selectdate1 = document.getElementById("date-display");
    selectdate.innerHTML=year+"年";
    selectdate1.innerHTML=year+"年"+month+"月"+day+"日";

    for(i=0;i<dates.length;i++){
        const thisday = day+i;
        const writedate =month+"/"+thisday;
       dates[i].innerHTML=writedate  
    }

    const images = [
        'journal1.png',
        'journal2.png',
        'journal3.png',
        'journal4.png',
        'journal5.png'
    ];

    const divs = document.querySelectorAll('.imgdiv');

    divs.forEach(div => {
        div.innerHTML=""
        const randomIndex = parseInt(Math.random()*5);
        const selectedImage =images[randomIndex];
        const img = document.createElement('img');
        img.src = `../img/${selectedImage}`;
        img.alt = '???';
        div.appendChild(img);
       
    });

}

function Personal(){
    window.location.href = "../index.html";
}