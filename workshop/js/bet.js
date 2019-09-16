var user_input;
var user_path;
var coins_for_this_round = 0;
var total_available_coins = 0;
var is_game_on = false;
var currentlySumOfCoins = 0;
var reach_limit = false;
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
    var id = window.location.search.substring(1).split("&")[0].split("id=")[1];

    firebase.database().ref("user_mapping/" + id).once('value').then(function(snapshot) { 
        var name = snapshot.val();
        user_path = name

        $('#user_name').html(name.replace("_", "."));

        var member_ref = firebase.database().ref("member/" + name);
        member_ref.on('value', function(data) {
            var available_coins = data.val()["available_coins"];
            total_available_coins = available_coins;
            $('#available_coins').html(available_coins);

            if (Number(available_coins) <= 0) { 
                handleGameStatusAndShowUnavailableCotainer(true);
            } else { 
                handleGameStatusAndShowUnavailableCotainer(false);
            }
        });
    });

    // dict = {"mathew_l": {"available_coins": 0}, "cindy_k": {"available_coins": 0}, "soy_h": {"available_coins": 0}, "owen_kwon": {"available_coins": 0}, "mata_j": {"available_coins": 0}, "nick_lee": {"available_coins": 0}, "woody_422": {"available_coins": 0}, "neal_p": {"available_coins": 0}, "loopy_s": {"available_coins": 0}, "henry_jung": {"available_coins": 0}, "alex_260": {"available_coins": 0}, "ggikko_park": {"available_coins": 0}, "frank_han": {"available_coins": 0}, "noah_oh": {"available_coins": 0}, "sally_kim": {"available_coins": 0}, "janice_song": {"available_coins": 0}, "groot_iam": {"available_coins": 0}, "azki_org": {"available_coins": 0}, "bernard_park": {"available_coins": 0}, "wani_kim": {"available_coins": 0}, "michael_lee": {"available_coins": 0}, "derek_lee": {"available_coins": 0}, "june_han": {"available_coins": 0}, "gray_oh": {"available_coins": 0}, "wind_seo": {"available_coins": 0}, "zoey_lee": {"available_coins": 0}, "kevin_yj": {"available_coins": 0}, "leo_kang": {"available_coins": 0}, "alan_kim": {"available_coins": 0}, "leonardo_kim": {"available_coins": 0}, "eric_a": {"available_coins": 0}, "fred_k": {"available_coins": 0}, "damon_ahn": {"available_coins": 0}, "jino_h": {"available_coins": 0}, "spock_p": {"available_coins": 0}, "charlie_brown": {"available_coins": 0}, "joe_cho": {"available_coins": 0}, "leo_jungle": {"available_coins": 0}, "james_kim": {"available_coins": 0}, "panini_kim": {"available_coins": 0}}

    // firebase.database().ref("member").set(dict);

    // firebase.database().ref("user_mapping").set({"1AEF829668": "janice_song", "6831E485AD": "zoey_lee", "F31C4AF37C": "michael_lee", "6CD89020F0": "wind_seo", "44D5489766": "mata_j", "E4DB7AA0DE": "damon_ahn", "1D70013E76": "jino_h", "2EA4ABD1AC": "noah_oh", "FC0E329601": "neal_p", "1F4F68D95E": "kevin_yj", "24BF27DAFF": "woody_422", "6D2B8397E4": "groot_iam", "DCD1CEB576": "panini_kim", "84BD6812A0": "soy_h", "A2B5262CC6": "gray_oh", "FE025BE48D": "spock_p", "8BDDD84DD0": "june_han", "B0AB0DE3E0": "cindy_k", "2DA39E7CA5": "mathew_l", "A557804090": "alex_260", "262EE6607C": "charlie_brown", "4E80F7E7F7": "ggikko_park", "201C130F5D": "joe_cho", "93CD5D3ABB": "nick_lee", "49D8342CDE": "owen_kwon", "D11B50030B": "alan_kim", "3342CFBE2F": "derek_lee", "66967125FC": "frank_han", "2C412DD85C": "leo_kang", "C300BB696D": "henry_jung", "37D1259B4C": "azki_org", "1CCC61FD02": "bernard_park", "1DB07ABABC": "loopy_s", "70F1DF7358": "leo_jungle", "81393FB01A": "wani_kim", "49B48E996F": "james_kim", "541C10B4ED": "sally_kim", "9CE06516D1": "eric_a", "8721584E8C": "fred_k", "B73CE22F43": "leonardo_kim"})

    // status
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
        if (is_game_on || reach_limit) { 
            input_container.hide();
            coins_for_this_round = 0;
            betted_element.val(0);

            if (reach_limit) { 
                handleGameStatusAndShowUnavailableCotainer(true, "코인 배팅 한도에 도달했습니다. 일찍 하셨어야..")
            } else { 
                handleGameStatusAndShowUnavailableCotainer(true, "게임이 진행중이에요!");
            }
        } else {
            input_container.show();
            unavailable_container.hide(15);
            betted_element.html("0");
        }

        /// track current item
        // $("#current_raffle_item").html(current_item);

        /// track current round
        // $("#current_round").html(current_round);
    });

    firebase.database().ref("currently_in_round").on('value', function(data) { 
        console.log(data.val());
        // when it needs to reset
        if (data.val() == "") {
            reach_limit = false;
            currentlySumOfCoins = 0;
            $('#betted_coins').html(0);
            remove_current_input_and_reset_placeholder();

            if (total_available_coins != 0) { 
                show_or_hide_unavailable_container(false);
            } else { 
                show_or_hide_unavailable_container(true, "코인을 다 쓰셨어요!");
            }
        } else { 
            dicts = Object.values(data.val());
            
            var result = 0;
            for (i = 0; i < dicts.length; i++) { 
                current_number = dicts[i]["number_of_coins"];
                result += current_number
            }
            currentlySumOfCoins = result;
            reach_limit = (currentlySumOfCoins >= 100);
            if (reach_limit) { 
                handleGameStatusAndShowUnavailableCotainer(true, "코인 배팅 한도에 도달했습니다. 일찍 하셨어야..");
            } else { 
                handleGameStatusAndShowUnavailableCotainer(false);
            }
        }
    });

    // button call back
    $('#betting-button').click(function() { 
        coin_input_element = $('#number_of_coins');
        user_input = Number(coin_input_element.val());
        var betted_element = $('#betted_coins');

        if (reach_limit) { 
            show_or_hide_unavailable_container(true, "코인 배팅 한도에 도달했습니다. 일찍 하셨어야..");
        } else if (is_game_on) { 
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

function show_or_hide_unavailable_container(needToShow, targetText) { 
    var unavailble_element = $('#unavailable_container');
    var input_container_element = $("#input_container");

    if (needToShow) { 
        if (targetText) { 
            unavailble_element.html(targetText);
        } else { 
            unavailble_element.html("코인을 다 쓰셨어요!");
        }

        input_container_element.hide();
        unavailble_element.show(15);
    } else { 
        input_container_element.show(15);
        unavailble_element.hide(15);

        // reset the text for later use
        unavailble_element.html("게임이 진행중 입니다!");
    }
}

function handleGameStatusAndShowUnavailableCotainer(needToShow, targetText) { 

    if (total_available_coins == 0) { 
        show_or_hide_unavailable_container(true, "코인을 다 쓰셨어요!")
    } else if (is_game_on) { 
        show_or_hide_unavailable_container(true, "게임이 진행중 입니다!")
    } else if (reach_limit) { 
        show_or_hide_unavailable_container(true, "코인 배팅 한도에 도달했습니다. 일찍 하셨어야..")
    } else { 
        show_or_hide_unavailable_container(needToShow, targetText);
    }
}



function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
}

function resetJames() { 
    firebase.database().ref("currently_in_round").set("");
}