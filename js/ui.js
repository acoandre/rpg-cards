// Ugly global variable holding the current card deck
var card_data = [];
var card_options = card_default_options();

function mergeSort(arr, compare) {
    if (arr.length < 2)
        return arr;

    var middle = parseInt(arr.length / 2);
    var left = arr.slice(0, middle);
    var right = arr.slice(middle, arr.length);

    return merge(mergeSort(left, compare), mergeSort(right, compare), compare);
}

function merge(left, right, compare) {
    var result = [];

    while (left.length && right.length) {
        if (compare(left[0], right[0]) <= 0) {
            result.push(left.shift());
        } else {
            result.push(right.shift());
        }
    }

    while (left.length)
        result.push(left.shift());

    while (right.length)
        result.push(right.shift());

    return result;
}

var ui_generate_modal_shown = false;
function ui_generate() {
    // Generate output HTML
    var card_html = card_pages_generate_html(card_data, card_options);

    // Open a new window for the output
    // Use a separate window to avoid CSS conflicts
    var tab = window.open("output.html", 'rpg-cards-output');

    if (ui_generate_modal_shown == false) {
        $("#print-modal").modal('show');
        ui_generate_modal_shown = true;
    }

    // Send the generated HTML to the new window
    // Use a delay to give the new window time to set up a message listener
    setTimeout(function () { tab.postMessage(card_html, '*') }, 500);
}

function ui_load_sample() {
    card_data = card_data_example;
    ui_update_card_list();
}

function ui_clear_all() {
    card_data = [];
    ui_update_card_list();
}

function ui_load_files(evt) {
    // ui_clear_all();

    var files = evt.target.files;

    for (var i = 0, f; f = files[i]; i++) {
        var reader = new FileReader();

        reader.onload = function (reader) {
            var data = JSON.parse(this.result);
            ui_add_cards(data);
        };

        reader.readAsText(f);
    }

    // Reset file input
    $("#file-load-form")[0].reset();
}

function ui_add_cards(data) {
    card_data = card_data.concat(data);
    ui_update_card_list();
}

function ui_add_new_card() {
    card_data.push(card_default_data());
    ui_update_card_list();
    ui_select_card_by_index(card_data.length - 1);
}

function ui_duplicate_card() {
    if (card_data.length > 0) {
        var old_card = ui_selected_card();
        var new_card = $.extend({}, old_card);
        card_data.push(new_card);
        new_card.title = new_card.title + " (Copy)";
    } else {
        card_data.push(card_default_data());
    }
    ui_update_card_list();
    ui_select_card_by_index(card_data.length - 1);
}

function ui_select_card_by_index(index) {
    $("#selected-card").val(index);
    ui_update_selected_card();
}

function ui_selected_card_index() {
    return parseInt($("#selected-card").val(), 10);
}

function ui_selected_card() {
    return card_data[ui_selected_card_index()];
}

function ui_delete_card() {
    card_data.splice(ui_selected_card_index(), 1);
    ui_update_card_list();
}

function ui_update_card_list() {
    $("#total_card_count").text("Deck contains " + card_data.length + " unique cards.");

    $('#selected-card').empty();
    for (var i = 0; i < card_data.length; ++i) {
        var card = card_data[i];
        $('#selected-card')
            .append($("<option></option>")
            .attr("value", i)
            .text(card.title));
    }

    ui_update_selected_card();
}

function ui_save_file() {
    var str = JSON.stringify(card_data, null, "  ");
    var parts = [str];
    var blob = new Blob(parts, { type: 'application/json' });
    var url = URL.createObjectURL(blob);

    var a = $("#file-save-link")[0];
    a.href = url;
    a.download = "rpg_cards.json";
    a.click();

    setTimeout(function () { URL.revokeObjectURL(url); }, 500);
}

function ui_update_selected_card() {
    var card = ui_selected_card();
    if (card) {
        $("#card-title").val(card.title);
        $("#card-title-size").val(card.title_size);
        $("#card-count").val(card.count);
        $("#card-icon").val(card.icon);
        $("#card-icon-back").val(card.icon_back);
        $("#card-contents").val(card.contents.join("\n"));
        $("#card-color").val(card.color).change();
    }

    ui_render_selected_card();
}

function ui_render_selected_card() {
    var card = ui_selected_card();
    $('#preview-container').empty();
    if (card) {
        var front = card_generate_front(card, card_options);
        var back = card_generate_back(card, card_options);
        $('#preview-container').html(front + "\n" + back);
    }
}

function ui_open_help() {
    window.open("http://crobi.github.io/rpg-cards/", "_blank");
}

function ui_select_icon() {
    window.open("http://game-icons.net/", "_blank");
}

function ui_setup_color_selector() {
    // Insert colors
    $.each(card_colors, function (name, val) {
        $(".colorselector-data")
            .append($("<option></option>")
            .attr("value", name)
            .attr("data-color", val)
            .text(name));
    });
    
    // Callbacks for when the user picks a color
    $('#default_color_selector').colorselector({
        callback: function (value, color, title) {
            $("#default-color").val(title);
            ui_set_default_color(title);
        }
    });
    $('#card_color_selector').colorselector({
        callback: function (value, color, title) {
            $("#card-color").val(title);
            ui_set_card_color(value);
        }
    });
    $('#foreground_color_selector').colorselector({
        callback: function (value, color, title) {
            $("#foreground-color").val(title);
            ui_set_foreground_color(value);
        }
    });
    $('#background_color_selector').colorselector({
        callback: function (value, color, title) {
            $("#background-color").val(title);
            ui_set_background_color(value);
        }
    });

    // Styling
    $(".dropdown-colorselector").addClass("input-group-addon color-input-addon");
}

function ui_set_default_color(color) {
    card_options.default_color = color;
    ui_render_selected_card();
}

function ui_set_foreground_color(color) {
    card_options.foreground_color = color;
}

function ui_set_background_color(color) {
    card_options.background_color = color;
}

function ui_change_option() {
    var property = $(this).attr("data-option");
    var value = $(this).val();
    card_options[property] = value;
    ui_render_selected_card();

}

function ui_change_card_title() {
    var title = $("#card-title").val();
    var card = ui_selected_card();
    if (card) {
        card.title = title;
        $("#selected-card option:selected").text(title);
        ui_render_selected_card();
    }
}

function ui_change_card_property() {
    var property = $(this).attr("data-property");
    var value = $(this).val();
    var card = ui_selected_card();
    if (card) {
        card[property] = value;
        ui_render_selected_card();
    }
}

function ui_set_card_color(value) {
    var card = ui_selected_card();
    if (card) {
        card.color = value;
        ui_render_selected_card();
    }
}

function ui_update_card_color_selector(color, input, selector) {
    if ($(selector + " option[value='" + color + "']").length > 0) {
        // Update the color selector to the entered value
        $(selector).colorselector("setValue", color);
    } else {
        // Unknown color - select a neutral color and reset the text value
        $(selector).colorselector("setValue", "");
        input.val(color);
    }
}

function ui_change_card_color() {
    var input = $(this);
    var color = input.val();

    ui_update_card_color_selector(color, input, "#card_color_selector");
    ui_set_card_color(color);
}

function ui_change_default_color() {
    var input = $(this);
    var color = input.val();

    ui_update_card_color_selector(color, input, "#default_color_selector");
    ui_set_default_color(color);
}

function ui_change_default_icon() {
    var value = $(this).val();
    card_options.default_icon = value;
    ui_render_selected_card();
}

function ui_change_card_contents() {
    var value = $(this).val();

    var card = ui_selected_card();
    if (card) {
        card.contents = value.split("\n");
        ui_render_selected_card();
    }
}

function ui_change_default_title_size() {
    card_options.default_title_size = $(this).val();
    ui_render_selected_card();
}

function ui_change_default_icon_size() {
    card_options.icon_inline = $(this).is(':checked');
    ui_render_selected_card();
}

function ui_sort_by_name() {
    card_data = mergeSort(card_data, function (a, b) {
        if (a.title > b.title) {
            return 1;
        }
        if (a.title < b.title) {
            return -1;
        }
        return 0;
    });
    ui_update_card_list();
}

function ui_sort_by_icon() {
    card_data = mergeSort(card_data, function (a, b) {
        if (a.icon > b.icon) {
            return 1;
        }
        if (a.icon < b.icon) {
            return -1;
        }
        return 0;
    });
    ui_update_card_list();
}

function ui_apply_default_color() {
    for (var i = 0; i < card_data.length; ++i) {
        card_data[i].color = card_options.default_color;
    }
    ui_render_selected_card();
}

function ui_apply_default_icon() {
    for (var i = 0; i < card_data.length; ++i) {
        card_data[i].icon = card_options.default_icon;
    }
    ui_render_selected_card();
}

function ui_apply_default_icon_back() {
    for (var i = 0; i < card_data.length; ++i) {
        card_data[i].icon_back = card_options.default_icon;
    }
    ui_render_selected_card();
}

$(document).ready(function () {
    ui_setup_color_selector();
    $('.icon-list').typeahead({source:icon_names});

    $("#button-generate").click(ui_generate);
    $("#button-load").click(function () { $("#file-load").click(); });
    $("#file-load").change(ui_load_files);
    $("#button-clear").click(ui_clear_all);
    $("#button-load-sample").click(ui_load_sample);
    //$("#button-save").click(ui_save_file);
    $("#button-sort-name").click(ui_sort_by_name);
    $("#button-sort-icon").click(ui_sort_by_icon);
    $("#button-add-card").click(ui_add_new_card);
    $("#button-duplicate-card").click(ui_duplicate_card);
    $("#button-delete-card").click(ui_delete_card);
    $("#button-help").click(ui_open_help);
    $("#button-apply-color").click(ui_apply_default_color);
    $("#button-apply-icon").click(ui_apply_default_icon);
    $("#button-apply-icon-back").click(ui_apply_default_icon_back);

    $("#selected-card").change(ui_update_selected_card);

    $("#card-title").change(ui_change_card_title);
    $("#card-title-size").change(ui_change_card_property);
    $("#card-icon").change(ui_change_card_property);
    $("#card-count").change(ui_change_card_property);
    $("#card-icon-back").change(ui_change_card_property);
    $("#card-color").change(ui_change_card_color);
    $("#card-contents").change(ui_change_card_contents);

    $("#page-size").change(ui_change_option);
    $("#page-rows").change(ui_change_option);
    $("#page-columns").change(ui_change_option);
    $("#card-arrangement").change(ui_change_option);
    $("#card-size").change(ui_change_option);
    $("#background-color").change(ui_change_option);

    $("#default-color").change(ui_change_default_color);
    $("#default-icon").change(ui_change_default_icon);
    $("#default-title-size").change(ui_change_default_title_size);
    $("#small-icons").change(ui_change_default_icon_size);

    $(".icon-select-button").click(ui_select_icon);
    
    ui_update_card_list();
});



