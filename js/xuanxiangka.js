let tabBox = document.getElementById('tabBox');
let navBox = document.getElementById('navBox');
let detailList = tabBox.getElementsByTagName('div');
let context="事件记录";
let dates=1;
// click 事件编写
drawChart(1);


function changeClass(activeTab) {
    for (var i = 0; i < navList.length; i++) {
        //  先将className全部置为空
        navList[i].className = '';
        //detailList[i].className = '';
    }
    // DOM元素className赋值的方法，点击谁就给谁添加className= 'active'
    navList[activeTab].className = 'active';
    //detailList[activeTab].className = 'active';
}

function OnInput(event){
    context=event.target.value;
    console.log(context)
  }