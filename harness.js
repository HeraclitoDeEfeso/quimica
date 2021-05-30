         
         var massBlue;              // Masa en __ inicial de ___ azul
         var massRed;               // Masa en __ inicial de ___ rojo
         var chartCanvas;
         var chart;
         var bouncing;
         var curTxt;
         var curTxtLen;
         var timer;
         var timer2;
         var timer3;
         var redMass;
         var blueMass;
         var accRed = 0;
         var accBlue = 0;
         var timeNow = 0;
         var dataRed = [];
         var dataBlue = [];
         var maxX = INITIAL_TIME_LENGTH;

         function moveCursor(e){
    		if(!e){e=window.event;}
		    var xpos = e.clientX - chartCanvas.offsetLeft - chart.x;
            if (dataRed.length) {
                redPoint = dataRed.reduce((acc, curr)=> Math.abs(acc.x - xpos / chart.scaleX) < Math.abs(curr.x - xpos / chart.scaleX) ? acc : curr);
                bluePoint = dataBlue.find(p => p.x == redPoint.x);
                curTxt.innerHTML = "<span style='color:red'>" + redPoint.y.toFixed(2) + "<br/><span style='color:blue'>" + bluePoint.y.toFixed(2);
                //curTxt.style.left=e.clientX + 5 +'px';
                //curTxt.style.top=e.clientY - curTxt.offsetHeight - 5 + 'px';
            }
	    }

         function update() {
            timeNow += TIME_INTERVAL;
            let deltaRed = redMass * RED_VEL * TIME_INTERVAL;
            let deltaBlue = blueMass * BLUE_VEL * TIME_INTERVAL;
            accRed += deltaRed;
            accBlue += deltaBlue;
            redMass = redMass - deltaRed + deltaBlue;
            blueMass = blueMass - deltaBlue + deltaRed;
            dataRed.push({x: timeNow * TIME_CHART_FACTOR, y: redMass});
            dataBlue.push({x: timeNow * TIME_CHART_FACTOR, y: blueMass});
            if (timeNow * TIME_CHART_FACTOR > maxX) {
		        var context = document.getElementById("chart").getContext('2d');
                context.clearRect(0, 0, context.canvas.width, context.canvas.height);
		        maxX = maxX * CHART_EXPAND_FACTOR;
		        chart = new LineChart({  
                	canvasId: "chart",  
                	minX: 0,  
                	minY: 0,  
                	maxX: maxX,  
                	maxY: redMass + blueMass,  
                	unitsPerTickX: maxX / 200,  
                	unitsPerTickY: 20  
            	});
	        }
            chart.drawLine(dataRed, "red", 3);  
            chart.drawLine(dataBlue, "blue", 3);
            let oneBallMass = (redMass + blueMass) / BALLS_NUMBER;
            let redBalls = Math.floor(accRed / oneBallMass);
            let blueBalls = Math.floor(accBlue / oneBallMass);
            if (redBalls) {
                bouncing.change(redBalls, "red", "blue");
                accRed -= redBalls * oneBallMass;
            }
            if (blueBalls) {
                bouncing.change(blueBalls, "blue", "red");
                accBlue -= blueBalls * oneBallMass;
            }
            timer3 = setTimeout(bouncing.update.bind(bouncing), REAL_TIME_UPDATE * REAL_TIME_CHANGE_FACTOR);
         }

         function init() {
            massBlue = document.getElementById("massBlue");
            massRed = document.getElementById("massRed");
            chart = new LineChart({  
                canvasId: "chart",  
                minX: 0,  
                minY: 0,  
                maxX: maxX,  
                maxY: Number(massRed.value) + Number(massBlue.value),  
                unitsPerTickX: 1,  
                unitsPerTickY: 20  
            });
            document.getElementById("init").addEventListener(
                'click', 
                (event) => {
                    if(event.target.isStarted) {
                        clearInterval(timer);
                        clearInterval(timer2);
                        clearInterval(timer3);
                        accRed = 0;
                        accBlue = 0;
                        timeNow = 0;
                        dataRed = [];
                        dataBlue = [];
                        maxX = INITIAL_TIME_LENGTH;               
                        var context = document.getElementById("chart").getContext('2d');
                        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
                        context = document.getElementById("bouncing").getContext('2d');
                        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
                        chart = new LineChart({  
                            canvasId: "chart",  
                            minX: 0,  
                            minY: 0,  
                            maxX: maxX,  
                            maxY: Number(massRed.value) + Number(massBlue.value),   
                            unitsPerTickX: maxX / 200,  
                            unitsPerTickY: 20  
                        });        
                        var button = document.getElementById("pause");
                        button.isPaused = false;
                        button.value = "Pause";
                        button.disabled = true;
                        document.getElementById("massBlue").disabled = false;
                        document.getElementById("massRed").disabled = false;
                        event.target.value = "Init";
                        event.target.isStarted = false;
                    } else {
                        redMass = Number(massRed.value);
                        blueMass = Number(massBlue.value);
                        let redBalls = Math.floor(redMass * BALLS_NUMBER / (redMass + blueMass));
                        let blueBalls = BALLS_NUMBER - redBalls;
                        bouncing = new Bouncing(
                            document.getElementById("bouncing"), 
                            5, 
                            "black"
                        );
                        bouncing.add(redBalls, "red");
                        bouncing.add(blueBalls, "blue");
                        dataRed.push({x: timeNow * TIME_CHART_FACTOR, y: redMass});
                        dataBlue.push({x: timeNow * TIME_CHART_FACTOR, y: blueMass});
                        timer = setInterval(bouncing.move.bind(bouncing), REAL_TIME_MOVE);
                        timer2 = setInterval(update, REAL_TIME_UPDATE);
                        document.getElementById("pause").disabled = false;
                        document.getElementById("massBlue").disabled = true;
                        document.getElementById("massRed").disabled = true;
                        event.target.value = "Reset";
                        event.target.isStarted = true;
                    }
                }
            );
            document.getElementById("pause").addEventListener(
                'click', 
                (event) => {
                    if(event.target.isPaused) {
                        event.target.isPaused = false;
                        event.target.value = "Pause";
                        timer = setInterval(bouncing.move.bind(bouncing), REAL_TIME_MOVE);
                        timer2 = setInterval(update, REAL_TIME_UPDATE);    
                    } else {
                        clearInterval(timer);
                        clearInterval(timer2);
                        event.target.isPaused = true;
                        event.target.value = "Continue";
                    }
                }
            );
            chartCanvas = document.getElementById("chart")
            chartCanvas.addEventListener('mouseenter', ()=>chartCanvas.addEventListener('mousemove',moveCursor));
            chartCanvas.addEventListener('mouseleave', ()=>{chartCanvas.removeEventListener('mousemove',moveCursor);curTxt.innerHTML="";});
            curTxt=document.getElementById("cursorText");
        }
