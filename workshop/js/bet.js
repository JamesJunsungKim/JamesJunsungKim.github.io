var user_input;
var user_path;
var coins_for_this_round = 0;
var total_available_coins = 0;
var is_game_on = false;

var popup_instance = $('#popup');

(function($) { 

    // initial element setup
    $("#unavailable_container").hide();
    $('.initially-hidden').hide();
    popup_instance.hide();

    // focus input
    $('.input100').on('blur', function() { 
        if($(this).val().trim() != "") {
            $(this).addClass('has-val');
        }
        else {
            $(this).removeClass('has-val');
        }
    });

    // firebase
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

    /// setup username
    var user_name = localStorage.getItem('user_name');
    $('#user_name').html(user_name);

    user_path = user_name.replace(".", "_");

    var member_ref = firebase.database().ref("member/" + user_path);
    member_ref.on('value', function(data) {
        var available_coins = data.val()["available_coins"];
        total_available_coins = available_coins;
        $('#available_coins').html(available_coins);

        if (Number(available_coins) <= 0) { 
            $('#bet_container').hide(15);
            show_or_hide_unavailable_container(true);
        } else { 
            $('#bet_container').show(15);
            show_or_hide_unavailable_container(false);
        }
    });

    // statusss
    var game_ref = firebase.database().ref("status");
    game_ref.on('value', function(data) { 
        $('.initially-hidden').show(15);

        is_game_on = data.val()["is_game_on"];
        var current_item = data.val()["current_raffle_item"];
        var current_round = data.val()["current_round"];

        var input_container = $("#input_container");
        var unavailable_container = $("#unavailable_container");
        var betted_element = $('#betted_coins');

        /// track if game is on or not.
        if (is_game_on) { 
            input_container.hide();
            unavailable_container.show(15);
            coins_for_this_round = 0;
            betted_element.val(0);
        } else {
            input_container.show();
            unavailable_container.hide(15);
            betted_element.html("0");
        }

        /// track current item
        $("#current_raffle_item").html(current_item);

        /// track current round
        $("#current_round").html(current_round);
    });

    // button call back
    $('#betting-button').click(function() { 
        coin_input_element = $('#number_of_coins');
        user_input = Number(coin_input_element.val());
        var betted_element = $('#betted_coins');

        if (is_game_on) { 
            show_popup("게임이 진행중이에요");
        } else if (user_input <= 0) { 
            remove_current_input_and_reset_placeholder();
            show_popup("0이상 입력해주세요.");
        } else if  (Number.isInteger(user_input)) { 
    
            if (total_available_coins >= user_input) { 
                var user_ref = firebase.database().ref("member/" + user_path + "/available_coins");
                var bet_ref = firebase.database().ref("currently_in_round");
    
                user_ref.set(total_available_coins-user_input);
                bet_ref.push({
                    name: user_path,
                    number_of_coins: user_input
                });
                show_popup("추가되었습니다!");
                remove_current_input_and_reset_placeholder();
                
                betted_element.html(Number(betted_element.html()) + user_input);
            } else { 
                remove_current_input_and_reset_placeholder();
                show_popup("있는 갯수보다 많이 지원하셨네요.");
            }
        } else { 
            remove_current_input_and_reset_placeholder();
            show_popup("숫자가 아닌거같아요.<br> 다시 입력해주세요.");
        }
    });

    $('.validate-form').on('submit', function(){
        popup_instance.hide();
        return false 
    });
    
    /// popup button callback
    $('.modal-content .close').click(function() { 
        popup_instance.hide();
    });

    $(window).click(function(e){ 
        class_name = e.target.className;

        if (class_name == "modal" || class_name == "modal_content") { 
            popup_instance.hide();
        }
    });

})(jQuery);

function is_popup_displaying() { 
    return !(popup_instance.css("display", "none")) 
}

function show_popup(message) { 
    $('.modal-content .message').html(message);
    popup_instance.show(10).delay(1500).hide(15);
}

function remove_current_input_and_reset_placeholder() { 
    $('.input100').removeClass('has-val');
    $('#number_of_coins').val("");
}

function show_or_hide_unavailable_container(needToShow) { 
    var unavailble_element = $('#unavailable_container');
    var input_container_element = $("#input_container");

    if (needToShow) { 
        unavailble_element.html("코인을 다 쓰셨어요!");
        input_container_element.hide();
        unavailble_element.show(15);
    } else { 
        unavailble_element.html("게임이 진행중 입니다!");
        input_container_element.show(15);
        unavailble_element.hide(15);
    }
}

