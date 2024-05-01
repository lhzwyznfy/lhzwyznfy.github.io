
const drawtagline = (angle, offset) => {//定位
    const [x2, y2] = getCoordinatesForAngle(angle, offset+0.3);
    xnote = 0;
    tnote = 0;
    linel = 40;

    if(x2>0){
      xnote = x2+linel;
      tnote = x2+1.5*linel;
    }else{
      xnote = x2-linel;
      tnote = x2-2.5*linel; 
    }

    annotationGroup.append("line")
      .attr("class", "annotation-line")
      .attr("x1", 0)
      .attr("x2", x2)
      .attr("y1", 0)
      .attr("y2", y2)

    annotationGroup.append("line")
      .attr("class", "annotation-line")
      .attr("x1",x2)
      .attr("y1",y2)
      .attr("x2",xnote)
      .attr("y2",y2)

    const textcircle = annotationGroup.append("g");
    textcircle.append("circle")
      .attr("r","5px")
      .attr("fill","black")
      .attr("cx",xnote)
      .attr("cy",y2)
      .on("click",(event,d)=>{
          calculate += 1;
          if(calculate % 2 ==1){
          d3.select(event.currentTarget)
            .transition()
            .duration(200)
            .attr("fill","orange")
          }else{
          d3.select(event.currentTarget)
            .transition()
            .duration(200)
            .attr("fill","black")    
          }
          
          //修改icon
          document.getElementById("image-selector").style.display = 'block';
          // 获取当前点击的path元素
          var currentPath = this;
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
                svgImage.setAttribute('width', bbox.width); // 可调整为适合的尺寸
                svgImage.setAttribute('height', bbox.height); // 可调整为适合的尺寸
                
                // 将新的image元素添加到SVG容器中
                currentPath.parentNode.appendChild(svgImage);
          
                // 隐藏图片选择器
                document.getElementById('image-selector').style.display = 'none';
              };
        });

      })
                   
    textcircle.append("text")
      .text("...")
      .attr("font-size","1.4em")
      .attr("fill","black")
      .attr("x",tnote)
      .attr("y",y2)
      .on("click",(event,d)=>{
        if(document.getElementById("ipt").style.display != 'none'){
          d3.select(event.currentTarget).text(context)
          document.getElementById("ipt").style.display = 'none';
        }else{
          document.getElementById("ipt").style.display = '';
        }

      })

    /*const t = mous.style("opacity", 1).html("时间<br><br>"+new Date(parseInt(d.H) * 1000).toLocaleString().replace(/:\d{1,2}$/,' '))*/
  }

  