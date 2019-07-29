
var user_dicts;
var roulette_array = [];

var startAngle = 0;
var arc = Math.PI / (roulette_array.length / 2);
var spinTimeout = null;

var spinArcStart = 10;
var spinTime = 0;
var spinTimeTotal = 0;

var ctx;

var width;

function byte2Hex(n) {
  var nybHexString = "0123456789ABCDEF";
  return String(nybHexString.substr((n >> 4) & 0x0F,1)) + nybHexString.substr(n & 0x0F,1);
}

function RGB2Color(r,g,b) {
	return '#' + byte2Hex(r) + byte2Hex(g) + byte2Hex(b);
}

function getColor(item, maxitem) {
  var phase = 0;
  var center = 128;
  var width = 127;
  var frequency = Math.PI*2/maxitem;
  
  red   = Math.sin(frequency*item+2+phase) * width + center;
  green = Math.sin(frequency*item+0+phase) * width + center;
  blue  = Math.sin(frequency*item+4+phase) * width + center;
  
  return RGB2Color(red,green,blue);
}

var canvas;

function drawRouletteWheel() {
  canvas = document.getElementById("canvas");

  if (canvas.getContext) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerWidth;
    width = window.innerWidth;

    var outsideRadius = (2/5)*width;
    var textRadius = (16/50)*width;;
    var insideRadius = (125/500)*width;;

    ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, width, width);

    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;

    ctx.font = 'bold 20px Helvetica, Arial';

    for(var i = 0; i < roulette_array.length; i++) {
      var angle = startAngle + i * arc;
      //ctx.fillStyle = colors[i];
      ctx.fillStyle = getColor(i, roulette_array.length);

      ctx.beginPath();
      ctx.arc(width/2, width/2, outsideRadius, angle, angle + arc, false);
      ctx.arc(width/2, width/2, insideRadius, angle + arc, angle, true);
      ctx.stroke();
      ctx.fill();

      ctx.save();
      ctx.shadowOffsetX = -1;
      ctx.shadowOffsetY = -1;
      ctx.shadowBlur    = 0;
      ctx.shadowColor   = "rgb(220,220,220)";
      ctx.fillStyle = "black";
      ctx.translate(width/2 + Math.cos(angle + arc / 2) * textRadius, 
                    width/2 + Math.sin(angle + arc / 2) * textRadius);
      ctx.rotate(angle + arc / 2 + Math.PI / 2);
      var text = roulette_array[i];
      ctx.fillText(text, -ctx.measureText(text).width / 2, 0);
      ctx.restore();
    } 

    //Arrow
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.moveTo(width/2 - 4, width/2 - (outsideRadius + 5));
    ctx.lineTo(width/2 + 4, width/2 - (outsideRadius + 5));
    ctx.lineTo(width/2 + 4, width/2 - (outsideRadius - 5));
    ctx.lineTo(width/2 + 9, width/2 - (outsideRadius - 5));
    ctx.lineTo(width/2 + 0, width/2 - (outsideRadius - 13));
    ctx.lineTo(width/2 - 9, width/2 - (outsideRadius - 5));
    ctx.lineTo(width/2 - 4, width/2 - (outsideRadius - 5));
    ctx.lineTo(width/2 - 4, width/2 - (outsideRadius + 5));
    ctx.fill();
  }
}

function spin() {
  spinAngleStart = Math.random() * 10 + 10;
  spinTime = 0;
  spinTimeTotal = Math.random() * 3 + 4 * 1000;
  rotateWheel();
}

function rotateWheel() {
  spinTime += 30;
  if(spinTime >= spinTimeTotal) {
    stopRotateWheel();
    return;
  }
  var spinAngle = spinAngleStart - easeOut(spinTime, 0, spinAngleStart, spinTimeTotal);
  startAngle += (spinAngle * Math.PI / 180);
  drawRouletteWheel();
  spinTimeout = setTimeout('rotateWheel()', 30);
}

function stopRotateWheel() {
  clearTimeout(spinTimeout);
  var degrees = startAngle * 180 / Math.PI + 90;
  var arcd = arc * 180 / Math.PI;
  var index = Math.floor((360 - degrees % 360) / arcd);
  ctx.save();
  ctx.font = 'bold 30px Helvetica, Arial';
  var text = roulette_array[index]
  ctx.fillText(text, 250 - ctx.measureText(text).width / 2, 250 + 10);
  ctx.restore();
}

function easeOut(t, b, c, d) {
  var ts = (t/=d)*t;
  var tc = ts*t;
  return b+c*(tc + -3*ts + 3*t);
}


// window.onresize =
window.onresize = function(event) {
    drawRouletteWheel();
    console.log(this.canvas.offsetWidth);
};


(function() { 
    // Your web app's Firebase configuration
    var firebaseConfig = {
        apiKey: "AIzaSyCEMGdUHa0fhbf5A3IpLTCajDc6sJAbMMI",
        authDomain: "raffle-workshop.firebaseapp.com",
        databaseURL: "https://raffle-workshop.firebaseio.com",
        projectId: "raffle-workshop",
        storageBucket: "",
        messagingSenderId: "864371302754",
        appId: "1:864371302754:web:c8228176d5d83320958c3b"
    };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);

    // set up the observers 
    var bet_ref = firebase.database().ref("currently_in_round");
    bet_ref.on('value', function(data) { 
        dicts = Object.values(data.val());

        var result = {};
        for (i = 0; i < dicts.length; i++) {
            current_name = dicts[i]["name"];
            current_number = dicts[i]["number_of_coins"];

            if (current_name in result) { 
                var current_array = result[current_name];
                index = current_array[0];
                previous_number = current_array[1];
                result[current_name] = [index, previous_number+current_number];
            } else { 
                mapping_index = Object.keys(result).length;
                result[current_name] = [mapping_index, current_number];
            }
        }

        user_dicts = result;
        
        // add roullet indices
        target = Object.values(result);

        var roulette = [];
        for (i = 0; i < target.length; i++) { 
            current = target[i];
            index = current[0];
            number = current[1];
            console.log(index, number);

            for (j=0; j<number; j++) {
                roulette.push(index);
            }
        }

        roulette_array = roulette;
        drawRouletteWheel();
    });

    // statusss
    var status_ref = firebase.database().ref("status");
    status_ref.on('value', function(data) { 
        is_game_on = data.val()["is_game_on"];
        var current_item = data.val()["current_raffle_item"];
        var current_round = data.val()["current_round"];

        /// track if game is on or not.
        if (is_game_on) { 
            spin();
        } else { 
            firebase.database().ref("currently_in_round").set("");
            user_dicts = null;
        }
    });
})();
