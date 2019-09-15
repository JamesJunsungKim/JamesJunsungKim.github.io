var input;
(function ($) {
    // "use strict";

    /*==================================================================
    [ Focus input ]*/
    $('.input100').each(function(){
        $(this).on('blur', function(){
            if($(this).val().trim() != "") {
                $(this).addClass('has-val');
            }
            else {
                $(this).removeClass('has-val');
            }
        })    
    })
  
  
    /*==================================================================
    [ Validate ]*/
    input = $('.validate-input .input100');

    $('.validate-form').on('submit', function(){
        var input_id = input[0].value;

        if (validate(input_id)) { 
            localStorage.setItem("user_name", input_id.toLowerCase());
            window.location.href = "roulette_bet";
        } else { 
            showValidate(input[0]);
        }

        return false 
    });


    $('.validate-form .input100').each(function(){
        $(this).focus(function(){
           hideValidate(this);
        });
    });

    function validate (input) {
        
        if (typeof input == "undefined") { 
            return false 
        }

        var lowercased = input.toLowerCase()
        var names = ["james.kim", "wani.kim"]

        return names.includes(lowercased)
    }

    function showValidate(input) {
        var thisAlert = $(input).parent();

        $(thisAlert).addClass('alert-validate');
    }

    function hideValidate(input) {
        var thisAlert = $(input).parent();

        $(thisAlert).removeClass('alert-validate');
    }


})(jQuery);