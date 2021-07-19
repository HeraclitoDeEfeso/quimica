         
         var massBlue;              // Sliders
         var massRed;               
         var chartCanvas;           // Chart HTML Canvas
         var chart;                 // Chart object
         var bouncing;              // Bouncing object
         var curTxt;                // Lector valores del chart
         var curTxtLen;
         var timer;                 // Temporizador de movimiento
         var timer2;                // Temporizador de las actualizaciones
         var timer3;                // Temporizador del cambio de particulas
         var redMass;               // Concentraciones
         var blueMass;
         var greenMass = 0;
         var accGreen = 0;          // Acumulador de los cambios en concentracion
         var timeNow = 0;           // Eje del tiempo
         var dataRed = [];          // Valores del chart
         var dataBlue = [];
         var dataGreen = []
         var maxX = INITIAL_TIME_LENGTH;
         var ballMass;              // Concentración que representa una particula
         var Xe;                    // Concentración de producto en equilibrio

         function getXe(K, A, B){
             let b = -(A + B + 1/K);
             let c = A * B;
             let det = b * b - 4 * c;
             let x1 = (-b - Math.sqrt(det)) / 2;
             let x2 = (-b + Math.sqrt(det)) / 2;
             let min = Math.min(x1, x2);
             if (min < 0) {
                 return Math.max(x1, x2);
             } else {
                 return min;
             }
         }

         function moveCursor(e){
    		if(!e){e=window.event;}
		    let xpos = e.clientX - chartCanvas.getBoundingClientRect().x - chart.x;
            if (dataRed.length) {
                redPoint = dataRed.reduce((acc, curr)=> Math.abs(acc.x - xpos / chart.scaleX) < Math.abs(curr.x - xpos / chart.scaleX) ? acc : curr);
                bluePoint = dataBlue.find(p => p.x == redPoint.x);
                greenPoint = dataGreen.find(p => p.x == redPoint.x);
                curTxt.innerHTML = "Concentraciones: <span style='color:red'>&nbsp;&nbsp;" + redPoint.y.toFixed(3) + "</span><span style='color:blue'>&nbsp;&nbsp;" + bluePoint.y.toFixed(3) + "</span><span style='color:green'>&nbsp;&nbsp;" + greenPoint.y.toFixed(3) + "</span>";
                //curTxt.style.left=e.clientX + 5 +'px';
                //curTxt.style.top=e.clientY - curTxt.offsetHeight - 5 + 'px';
            }
	    }

         function update() {
            timeNow += TIME_INTERVAL;
            let newGreen = Xe * (1 - Math.exp(-timeNow));
            let deltaGreen = newGreen - greenMass;
            if (Xe - greenMass < 2 * ballMass) {
                bouncing.add(1, "green");
                bouncing.change(1, "green", "blue");
                bouncing.change(1, "green", "red");
                bouncing.change(1, "blue", "green");
                bouncing.change(1, "red", "green");
            } else {
                accGreen += deltaGreen;
                if (accGreen > 2 * ballMass) {
                    let greenBalls = Math.floor(accGreen / (2 * ballMass));
                    accGreen -= greenBalls * 2 * ballMass;
                    bouncing.change(greenBalls, "blue", "green");
                    bouncing.change(greenBalls, "red", "green");
                    bouncing.del(greenBalls,"blue");
                    bouncing.del(greenBalls,"red");
                }
            }
            redMass -= deltaGreen;
            blueMass -= deltaGreen;
            greenMass += deltaGreen; 
            if (timeNow * TIME_CHART_FACTOR > maxX) {
		        var context = document.getElementById("chart").getContext('2d');
                context.clearRect(0, 0, context.canvas.width, context.canvas.height);
		        maxX = maxX * CHART_EXPAND_FACTOR;
		        chart = new LineChart({  
                	canvasId: "chart",  
                	minX: 0,  
                	minY: 0,  
                	maxX: maxX,  
                	maxY:  Math.max(Number(massRed.max),Number(massBlue.max)) / 1000,
                	unitsPerTickX: maxX / 200,  
                	unitsPerTickY: 20  
            	});
	        }
            dataRed.push({x: timeNow * TIME_CHART_FACTOR, y: redMass});
            dataBlue.push({x: timeNow * TIME_CHART_FACTOR, y: blueMass});
            dataGreen.push({x: timeNow * TIME_CHART_FACTOR, y: greenMass});
            chart.drawLine(dataRed, "red", 3);  
            chart.drawLine(dataBlue, "blue", 3);
            chart.drawLine(dataGreen, "green", 3);
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
                maxY:  Math.max(Number(massRed.max),Number(massBlue.max)) / 1000,
                unitsPerTickX: maxX / 200,  
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
                        accGreen = 0;
                        timeNow = 0;
                        dataRed = [];
                        dataBlue = [];
                        dataGreen = [];
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
                            maxY:  Math.max(Number(massRed.max),Number(massBlue.max)) / 1000,
                            unitsPerTickX: maxX / 200,  
                            unitsPerTickY: 20  
                        });        
                        var button = document.getElementById("pause");
                        button.isPaused = false;
                        button.value = "Pausar";
                        button.disabled = true;
                        document.getElementById("massBlue").disabled = false;
                        document.getElementById("massRed").disabled = false;
                        event.target.value = "Comenzar";
                        event.target.isStarted = false;
                    } else {
                        redMass = Number(massRed.value)/1000;
                        blueMass = Number(massBlue.value)/1000;
                        Xe = getXe(K, redMass, blueMass)
                        greenMass = 0;
                        ballMass = (redMass + blueMass) / BALLS_NUMBER;
                        let redBalls = Math.floor(redMass / ballMass);
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
                        dataGreen.push({x: timeNow * TIME_CHART_FACTOR, y: greenMass});
                        timer = setInterval(bouncing.move.bind(bouncing), REAL_TIME_MOVE);
                        timer2 = setInterval(update, REAL_TIME_UPDATE);
                        document.getElementById("pause").disabled = false;
                        document.getElementById("massBlue").disabled = true;
                        document.getElementById("massRed").disabled = true;
                        event.target.value = "Reiniciar";
                        event.target.isStarted = true;
                    }
                }
            );
            document.getElementById("pause").addEventListener(
                'click', 
                (event) => {
                    if(event.target.isPaused) {
                        event.target.isPaused = false;
                        event.target.value = "Pausar";
                        timer = setInterval(bouncing.move.bind(bouncing), REAL_TIME_MOVE);
                        timer2 = setInterval(update, REAL_TIME_UPDATE);    
                    } else {
                        clearInterval(timer);
                        clearInterval(timer2);
                        event.target.isPaused = true;
                        event.target.value = "Continuar";
                    }
                }
            );
            chartCanvas = document.getElementById("chart")
            chartCanvas.addEventListener('mouseenter', ()=>chartCanvas.addEventListener('mousemove',moveCursor));
            chartCanvas.addEventListener('mouseleave', ()=>{chartCanvas.removeEventListener('mousemove',moveCursor);curTxt.innerHTML="Concentraciones:";});
            curTxt=document.getElementById("cursorText");
        }
