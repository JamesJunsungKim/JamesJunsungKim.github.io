
var user_dicts;
// var roulette_array = [1,2,3,4,5,6,6,7,8,9,0,10];
var roulette_array = [0];
var startAngle = 0;
var arc = Math.PI / (roulette_array.length / 2);
var spinTimeout = null;

var spinArcStart = 10;
var spinTime = 0;
var spinTimeTotal = 0;

var ctx;
var half_size;
var width;
var firebase_first_connection = true;
var index_people_dict;
var is_game_running = false;
var game_on_ref;

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

function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
  }
}

var canvas;

function drawRouletteWheel() {
  canvas = document.getElementById("canvas");

  if (canvas.getContext) {
    var scale = (1000/canvas.offsetWidth);
    var outsideRadius = 400/scale;
    half_size = canvas.offsetWidth/2;
    var textRadius = 300/scale;
    var insideRadius = 250/scale;
    arc = Math.PI / (roulette_array.length / 2);

    ctx = canvas.getContext("2d");
    ctx.canvas.width = canvas.offsetWidth;
    ctx.canvas.height = canvas.offsetWidth;
    width = canvas.offsetWidth;
    ctx.clearRect(0, 0, width, width);

    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;

    ctx.font = 'bold 20px Helvetica, Arial';

    for(var i = 0; i < roulette_array.length; i++) {
      var angle = startAngle + i * arc;
      //ctx.fillStyle = colors[i];
      ctx.fillStyle = getColor(i, roulette_array.length);

      ctx.beginPath();
      ctx.arc(half_size, half_size, outsideRadius, angle, angle + arc, false);
      ctx.arc(half_size, half_size, insideRadius, angle + arc, angle, true);
      ctx.stroke();
      ctx.fill();

      ctx.save();
      ctx.shadowOffsetX = -1;
      ctx.shadowOffsetY = -1;
      ctx.shadowBlur    = 0;
      ctx.shadowColor   = "rgb(220,220,220)";
      ctx.fillStyle = "black";
      ctx.translate(half_size + Math.cos(angle + arc / 2) * textRadius, 
                    half_size + Math.sin(angle + arc / 2) * textRadius);
      ctx.rotate(angle + arc / 2 + Math.PI / 2);
      var text = roulette_array[i];
      ctx.fillText(text, -ctx.measureText(text).width / 2, 0);
      ctx.restore();
    } 

    //Arrow
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.moveTo(half_size - 4, half_size - (outsideRadius + 5));
    ctx.lineTo(half_size + 4, half_size - (outsideRadius + 5));
    ctx.lineTo(half_size + 4, half_size - (outsideRadius - 5));
    ctx.lineTo(half_size + 9, half_size - (outsideRadius - 5));
    ctx.lineTo(half_size + 0, half_size - (outsideRadius - 13));
    ctx.lineTo(half_size - 9, half_size - (outsideRadius - 5));
    ctx.lineTo(half_size - 4, half_size - (outsideRadius - 5));
    ctx.lineTo(half_size - 4, half_size - (outsideRadius + 5));
    ctx.fill();
  }
}

function spin() {
  game_on_ref.set(true);
  spinAngleStart = Math.random() * 10 + 10;
  spinTime = 0;
  spinTimeTotal = Math.random() * 3 + 4 * 1000;
  rotateWheel();
}

function rotateWheel() {
  spinTime += spintTimeValue;
  if(spinTime >= spinTimeTotal) {
    stopRotateWheel();
    return;
  }
  var spinAngle = spinAngleStart - easeOut(spinTime, 0, spinAngleStart, spinTimeTotal);
  startAngle += (spinAngle * Math.PI / 180);
  drawRouletteWheel();
  spinTimeout = setTimeout('rotateWheel()', timeOutValue);
}

function stopRotateWheel() {
  clearTimeout(spinTimeout);
  var degrees = startAngle * 180 / Math.PI + 90;
  var arcd = arc * 180 / Math.PI;
  var index = Math.floor((360 - degrees % 360) / arcd);
  ctx.save();
  ctx.font = 'bold 30px Helvetica, Arial';
  index = index % roulette_array.length;
  var index = roulette_array[index]
  var text = index_people_dict[index];

  ctx.fillText(text, half_size - ctx.measureText(text).width / 2, half_size + 10);
  game_on_ref.set(false);
  ctx.restore();
}

var easeOutValue = 5;
var timeOutValue = 20;
var spintTimeValue = 10;
var bet_ref;

function easeOut(t, b, c, d) {
  var ts = (t/=d)*t;
  var tc = ts*t;
  return b+c*(tc + -3*ts + 3*t)*easeOutValue;
}


// window.onresize =
window.onresize = function(event) {
    drawRouletteWheel();
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
    bet_ref = firebase.database().ref("currently_in_round");
    bet_ref.on('value', function(data) { 
        dicts = Object.values(data.val());

        var result = {};
        index_people_dict = {};
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
                index_people_dict[mapping_index] = current_name;
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

            for (j=0; j<number; j++) {
                roulette.push(index);
            }
        }

        roulette_array = roulette;
        console.log(index_people_dict);
        // roulette_array = [1,2,3,4,5,6,7,8];
        drawRouletteWheel();
    });

    // statusss
    var status_ref = firebase.database().ref("status");
    // status_ref.on('value', function(data) { 
    //     is_game_on = data.val()["is_game_on"];
    //     var current_item = data.val()["current_raffle_item"];
    //     var current_round = data.val()["current_round"];

    //     /// track if game is on or not.
    //     if (is_game_on) { 
    //         spin();
    //     } else { 
    //       if (!firebase_first_connection) { 
    //         firebase.database().ref("currently_in_round").set("");
    //         user_dicts = null;
    //       } 
    //     }
        
    //     firebase_first_connection = false;
    // });

    game_on_ref = firebase.database().ref("status/is_game_on");

    $('.roulette-button').click(function() { 
      
      if (is_game_running) { 
        $('.roulette-button').html("Start");
        resetGameData();
      } else { 
        $('.roulette-button').html("Reset");
        shuffleArray(roulette_array);
        spin();
      }
      is_game_running = !is_game_running;
    });

})();

function resetGameData( ) { 
  bet_ref.set("");
  roulette_array = [""];
  // roulette_array = [1,2,3,4,5,6,7,8];
  drawRouletteWheel();
}

function give_everyone(numberOfCoins) { 
  let names = ["janice_song", "bernard_park", "jino_h", "loopy_s", "kevin_yj", "joe_cho", "woody_422", "charlie_brown", "leo_kang", "mathew_l", "noah_oh", "derek_lee", "azki_org", "hana_zn", "mata_j", "owen_kwon", "ggikko_park", "sally_kim", "frank_han", "zoey_lee", "wind_seo","groot_iam", "leo_jungle", "soy_h", "fred_k", "june_han", "nick_lee", "gray_oh", "alex_260", "cindy_k", "leonardo_kim", "henry_jung", "alan_kim", "panini_kim", "damon_ahn", "michael_lee", "neal_p", "spock_p"]

  names.forEach(function(name) { 
  let ref = firebase.database().ref('/member/'+ name+'/available_coins')
  ref.once('value').then(function(snapshot) { 
  let current_coins = snapshot.val();
  ref.set(current_coins+numberOfCoins);
  }); 
  }) 
}
