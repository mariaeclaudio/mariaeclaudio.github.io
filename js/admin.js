//var debug = false;

function getValues(form) {
    values = {};
    $.each($(form).serializeArray(), function (i, field) {
        values[field.name] = field.value;
    });
    return values;
}

function updateTable(form, newId) {
    values = getValues(form);
    if (values['id']) {
        var id = values['id'];
        $('td#td-delete-'+id).html('<button type="button" name="delete" class="btn btn-danger" onclick="deleteItem(\'' + id + '\',\'' + values['title'] + '\')"><i class="glyphicon glyphicon-trash"></i></button>');
        $('td#td-title-'+id).html(values['title']);
        $('td#td-description-'+id).html(values['description']);
        $('td#td-image-'+id).html('<img src="' + values['image'] + '" class="img-responsive" style="max-height: 100px; width: auto">');
        $('td#td-total-'+id).html(values['total'] + ' ' + (values['lot']=='on'?'unità':'€'));
        $('td#td-price-'+id).html(values['price'] + ' €');
        $('td#td-left-'+id).html(values['left'] + ' ' + (values['lot']=='on'?'unità':'€'));
        $('td#td-visible-'+id).html((values['visible']=='on'?'Sì':'No'));
        $('td#td-edit-'+id).html('<button type="button" class="btn btn-warning" onclick="editItem(\'' + id + '\',\'' + values['title'] + '\',\'' +
            values['description'] + '\',\'' + values['image'] + '\',\'' + (values['lot'] == 'on' ? 'true' : 'false') + '\',\'' + values['total'] + '\',\'' + values['price'] +
            '\',\'' + values['left'] + '\',\'' + (values['visible'] == 'on' ? 'true' : 'false') + '\')"><i class="glyphicon glyphicon-edit"></i></button>');
    } else {
        $('table > tbody:last-child').append('<tr>' +
            '<td id="td-delete-' +newId + '"><button type="button" name="delete" class="btn btn-danger" onclick="deleteItem(\'' + newId + '\',\'' + values['title'] + '\')"><i class="glyphicon glyphicon-trash"></i></button></td>' +
            '<td id="td-title-'+newId+'">' + values['title'] + '</td>' +
            '<td id="td-description-'+newId+'">' + values['description'] + '</td>' +
            '<td id="td-image-'+newId+'"><img src="' + values['image'] + '" class="img-responsive" style="max-height: 100px; width: auto"></td>' +
            '<td id="td-total-'+newId+'">' + values['total'] + ' ' + (values['lot']=='on'?'unità':'€') + '</td>' +
            '<td id="td-price-'+newId+'">' + values['price'] + ' €</td>' +
            '<td id="td-left-'+newId+'">' + values['left'] + ' ' + (values['lot']=='on'?'unità':'€') + '</td>' +
            '<td id="td-visible-'+newId+'">'+(values['visible']=='on'?'Sì':'No')+'</td>' +
            '<td id="td-edit-'+newId+'"><button type="button" class="btn btn-warning" onclick="editItem(\'' + newId + '\',\'' + values['title'] + '\',\'' +
            values['description'] + '\',\'' + values['image'] + '\',\'' + (values['lot'] == 'on' ? 'true' : 'false') + '\',\'' + values['total'] + '\',\'' + values['price'] +
            '\',\'' + values['left'] + '\',\'' + (values['visible'] == 'on' ? 'true' : 'false') + '\')"><i class="glyphicon glyphicon-edit"></i></button></td>' +
            '</tr>');
    }
}


var itemToDelete;
function deleteItem(id, title) {
    $('i#delete-title').html(title);
    itemToDelete = id;
    $('#delete-modal').find(".messages").empty();
    $('#delete-modal').modal('show');
}

function deleteRow(id) {
    $('#tr-' + id).remove();
}

function resetForm(form){
    $(form)[0].reset();
    $(form).find('input[type=checkbox]').bootstrapToggle('off');
}

function addItem() {
    resetForm('#edit-product');
    $('#edit-modal').modal('show');
}

function editItem(id, title, description, image, lot, total, price, left, visible) {
    $('#id').val(id);
    $('#title').val(title);
    $('#description').val(description);
    $('#image').val(image);
    if (lot == 'true') {
        $('#lot').bootstrapToggle('on')
    } else {
        $('#lot').bootstrapToggle('off')
    }
    $('#total').val(total);
    $('#price').val(price);
    $('#left').val(left);
    if (visible == 'true') {
        $('#visible').bootstrapToggle('on');
    } else {
        $('#visible').bootstrapToggle('off');
    }
    $('#edit-modal').find(".messages").empty();
    $('#edit-modal').modal('show');
}

$(document).ready(function () {

        //if (!debug) {
            $('form#edit-product input:not([type=hidden]), form#edit-product textarea').addClass('required');
        //}

        $('form#edit-product').validate({
            rules: {
                total: 'digits',
                price: 'digits',
                left: 'digits',
                image: 'url'
            },
            highlight: function (element, errorClass) {
                $(element).parent().addClass("has-error");
            },
            unhighlight: function (element, errorClass) {
                $(element).parent().removeClass("has-error");
            },
            submitHandler: function (form) {
                //console.log(form);
                $.ajax({
                    type: $(form).attr('method'),
                    url: $(form).attr('action'),
                    data: $(form).serialize(),
                    dataType: 'text',
                    encode: true,
                    success: function (id) {
                        $('#edit-modal').modal('hide');
                        //if (debug) {
                            //updateTable(form, '3');
                        //} else {
                            updateTable(form, id);
                        //}
                        resetForm(form);
                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        $(form).find(".messages").append(
                            "<div class='col-sm-10 col-sm-offset-1 alert alert-danger fade in'>" +
                            "<a href='#' class='close' data-dismiss='alert'>&times;</a>" +
                            "<strong>Errore!</strong> Qualcosa è andato storto: " + xhr.responseText +
                            "</div>");
                    }
                });
                return false;
            }
        });

        $('#submit-modal').click(function () {
            $("form#edit-product").submit();
        });

        $('#confirm-delete-btn').click(function () {
            $.ajax({
                type: 'delete',
                url: 'items/' + itemToDelete,
                success: function () {
                    deleteRow(itemToDelete);
                    $('#delete-modal').modal('hide');
                },
                error: function (xhr, ajaxoptions, thrownError) {
                    $('#delete-modal').find(".messages").append(
                        "<div class='col-sm-10 col-sm-offset-1 alert alert-danger fade in'>" +
                        "<a href='#' class='close' data-dismiss='alert'>&times;</a>" +
                        "<strong>Errore!</strong> Qualcosa è andato storto: " + xhr.responseText +
                        "</div>");
                }
            });
        });

    }
);