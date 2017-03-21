//var debug = true;

// left: 37, up: 38, right: 39, down: 40,
// spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
var keys = {37: 1, 38: 1, 39: 1, 40: 1};
function preventDefault(e) {
    e = e || window.event;
    if (e.preventDefault)
        e.preventDefault();
    e.returnValue = false;
}
function preventDefaultForScrollKeys(e) {
    if (keys[e.keyCode]) {
        preventDefault(e);
        return false;
    }
}
function disableScroll() {
    if (window.addEventListener) // older FF
        window.addEventListener('DOMMouseScroll', preventDefault, false);
    window.onwheel = preventDefault; // modern standard
    window.onmousewheel = document.onmousewheel = preventDefault; // older browsers, IE
    window.ontouchmove = preventDefault; // mobile
    document.onkeydown = preventDefaultForScrollKeys;
}
function enableScroll() {
    if (window.removeEventListener)
        window.removeEventListener('DOMMouseScroll', preventDefault, false);
    window.onmousewheel = document.onmousewheel = null;
    window.onwheel = null;
    window.ontouchmove = null;
    document.onkeydown = null;
}

jQuery.extend(jQuery.validator.messages, {
    required: "Campo obbligatorio."
});

disableScroll();

$(document).ready(
    function () {

        var mq1 = window.matchMedia("(min-width: 768px)");
        var mq2 = window.matchMedia("(min-width: 992px)");
        var mq3 = window.matchMedia("(min-width: 1200px)");
        var offsetHeight = 0;
        if (mq1.matches) {
            offsetHeight = 50;
        }
        if (mq2.matches) {
            offsetHeight = 70;
        }
        if (mq3.matches) {
            offsetHeight = 70;
        }

        $('body').scrollspy({target: '#my-navbar', offset: offsetHeight});

        $(".navbar-collapse ul li a[href^='#']").on('click', function (e) {

            target = this.hash;
            // prevent default anchor click behavior
            e.preventDefault();

            // animate
            $('html, body').animate({
                scrollTop: $(this.hash).offset().top - (offsetHeight - 1)
            }, 2000, 'swing', function () {

                // when done, add hash to url
                // (default click behaviour)
                window.location.hash = target;
            });

        });

        $('#navbar-collapse-1').on('show.bs.collapse', function () {
            $("#my-navbar").removeClass("transparent-on-mobile");
        });
        $('#navbar-collapse-1').on('hidden.bs.collapse', function () {
            $("#my-navbar").addClass("transparent-on-mobile");
        });


        $('.wax-seal-img').on('click', function () {
            $(this).addClass('wax-seal-broken');
            $(this).removeClass('wax-seal-closed');
            $('.window').addClass('open');
            $(this).fadeOut("slow");
        });

        $('.window').on('transitionend webkitTransitionEnd oTransitionEnd msTransitionEnd', function () {
            $('.jamb').remove();
            enableScroll();
        });


        $("#myModal").on('hidden.bs.modal', function () {
            $('#dialog-error-message').empty();
            $('#captcha-message').empty();
        });

        var captchaRendered = false;
        $("#myModal").on('shown.bs.modal', function () {
            $('#dialog-error-message').empty();
            if (!captchaRendered) {
                createRecaptcha();
            } else {
                grecaptcha.reset();
            }
            $('#captcha-message').empty();
            captchaRendered = true;
        });

        function createRecaptcha() {
            grecaptcha.render("captcha",
                {
                    sitekey: "6LfExAsTAAAAAKVpoUtj9LosI1r6wFXsoavYhQpo",
                    theme: "light",
                    callback: function (response) {
                        if (response != '') {
                            $('#captcha-message').empty();
                        }
                    }
                }
            );
        }


        var currentForm;
        $('#confirm-button').click(function () {
            /* when the button in the form, display the entered values in the modal */

            currentForm = $('#confirm-form');
            if (currentForm.valid()) {
                $('#modal-text').html('<br/><p>Verifica che le informazioni inserite siano corrette.<br/><br/>' +
                    '<strong>Nome:</strong> \"' + $('#name').val() + '\"<br/>' +
                    '<strong>Cognome:</strong> \"' + $('#lname').val() + '\"<br/>' +
                    '<strong>Presenza:</strong> \"' + $('input[name=presenza]:checked').val() + '\"<br/>' +
                    '<strong>Messaggio:</strong> \"' + $('#comment').val() + '\"</p>'
                );
                $('#myModal').modal('toggle');
            }
        });

        $('.item-button').click(function () {
            /* when the button in the form, display the entered values in the modal */

            currentForm = $('form:has(#' + this.id + ')');
            if (currentForm.valid()) {
                var lot = currentForm.find("input[name=lot]").val();
                var price = currentForm.find("input[name=price]").val();
                var email = currentForm.find("input[name=email]").val();
                var message = currentForm.find("textarea[name=message]").val();
                var regalo;
                var quota = currentForm.find("input[name=quota]").val();
                if (lot == 'false') {
                    regalo = quota + '€';
                } else {
                    regalo = quota * price + '€'
                }
                $('#modal-text').html('<br/><p>Verifica che le informazioni inserite siano corrette.<br/><br/>' +
                    '<strong>Regalo:</strong> ' + regalo + '<br/>' +
                    '<strong>Email:</strong> \"' + email + '\"<br/>' +
                    '<strong>Messaggio:</strong> \"' + (message ? message : "") + '\"</p>'
                );
                $('#myModal').modal('toggle');
            }
        });


        $('#modal-submit').click(function () {
            if (grecaptcha.getResponse() == '') {
                $('#captcha-message').html('Scusaci, dobbiamo assicurarci che tu sia un umano');
            } else {
                $('#myModal').modal('hide');
                currentForm.find("input[name=g-recaptcha-response]").val(grecaptcha.getResponse());
                $(currentForm).submit();
            }
        });

        $.validator.addMethod('lowerthanleft', function(value, element) {
            var quota = value;
            var left = $(element).parents('form').find('input[name=left]').val();
            return parseInt(quota) <= parseInt(left);
        }, "Il regalo non può essere superiore alla quota rimanente");

        $("form.form-item").each(function (key, currentForm) {
            $(currentForm).validate({
                ignore: ".ignore",
                rules: {
                    quota: {
                        required: true,
                        digits: true,
                        lowerthanleft: true
                    },
                    email: "required"
                },
                messages: {
                    quota: {
                        digits: "Inserisci un valore intero"
                    },
                    email: "Inserisci una mail valida",
                },
                highlight: function (element, errorClass) {
                    $(element).parent().addClass("has-error");
                },
                unhighlight: function (element, errorClass) {
                    $(element).parent().removeClass("has-error");
                },
                submitHandler: function (form) {
                    $.ajax({
                        type: $(form).attr('method'),
                        url: $(form).attr('action'),
                        data: $(form).serialize(),
                        encode: true,
                        success: function (left) {
                            $(form)[0].reset();
                            id = $(form).find('input[name=id]').val();
                            $(form).find('input[name=left]').val(left);
                            $("#left-shown-" + id).html(left);
                            $(form).find(".messages").append(
                                "<div class='col-sm-offset-1 col-sm-10 alert alert-success fade in'>" +
                                "<a href='#' class='close' data-dismiss='alert'>&times;</a>" +
                                "<strong>Grazie!</strong> Ti abbiamo inviato una mail con le informazioni per il pagamento." +
                                "</div>");
                            window.setTimeout(function () {
                                $(form).find(".alert").alert('close');
                            }, 10000);
                        },
                        error: function (xhr, ajaxOptions, thrownError) {
                            $(form).find(".messages").append(
                                "<div class='col-sm-offset-1 col-sm-10 alert alert-danger fade in'>" +
                                "<a href='#' class='close' data-dismiss='alert'>&times;</a>" +
                                "<strong>Errore!</strong> Qualcosa è andato storto, probabilmente ti hanno battuto sul tempo, prova a riaggiornare la pagina." +
                                "</div>");
                            window.setTimeout(function () {
                                $(form).find(".alert").alert('close');
                            }, 10000);
                        }
                    });
                    return false;
                }
            })
        });


        $("#confirm-form").validate({
            ignore: ".ignore",
            rules: {
                name: "required",
                lname: "required"
            },
            messages: {
                name: "Inserisci il tuo nome",
                lname: "Inserisci il tuo cognome"
            },
            highlight: function (element, errorClass) {
                $(element).parent().addClass("has-error");
            }

            ,
            unhighlight: function (element, errorClass) {
                $(element).parent().removeClass("has-error");
            }
            ,
            submitHandler: function (form) {
                $.ajax({
                    type: $(form).attr('method'), // define the type of HTTP verb we want to use (POST for our form)
                    url: $(form).attr('action'), // the url where we want to POST
                    data: $(form).serialize(), // our data object
                    //dataType: 'json', // what type of data do we expect back from the server
                    encode: true,
                    success: function (msg) {
                        console.log(msg);
                        //grecaptcha.reset();
                        $('#confirm-form')[0].reset();
                        $(form).find(".messages").append(
                            "<div class='col-sm-offset-1 col-sm-10 alert alert-success fade in'>" +
                            "<a href='#' class='close' data-dismiss='alert'>&times;</a>" +
                            "<strong>Grazie!</strong> Il messaggio ci è stato inviato correttamente" +
                            "</div>");
                        window.setTimeout(function () {
                            $(form).find(".alert").alert('close');
                        }, 10000);
                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        $(form).find(".messages").append(
                            "<div class='col-sm-offset-1 col-sm-10 alert alert-danger fade in'>" +
                            "<a href='#' class='close' data-dismiss='alert'>&times;</a>" +
                            "<strong>Errore!</strong> Qualcosa è andato storto, se il problema persiste contatta Claudio." +
                            "</div>");
                        window.setTimeout(function () {
                            $(form).find(".alert").alert('close');
                        }, 10000);
                    }
                });
                return false;
            }

        });


        //if (debug) {
        //    $('.jamb').remove();
        //    enableScroll();
        //}

    })
;

$(document).on('click', '.navbar-collapse.in', function (e) {
    if ($(e.target).is('a') && $(e.target).attr('class') != 'dropdown-toggle') {
        $(this).collapse('hide');
    }
});

$(window).load(function () {
    $('#overlay').remove();
});




