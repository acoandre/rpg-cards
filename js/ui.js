// Ugly global variable holding the current card deck
var card_data = [];
var card_options = card_default_options();

function ui_generate() {
    // Generate output HTML
    var card_html = card_pages_generate_html(card_data, card_options);

    // Open a new window for the output
    // Use a separate window to avoid CSS conflicts
    var tab = window.open("output.html", 'rpg-cards-output');

    // Send the generated HTML to the new window
    // Use a delay to give the new window time to set up a message listener
    setTimeout(function () { tab.postMessage(card_html, '*') }, 100);
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
    ui_clear_all();

    var files = evt.target.files;

    for (var i = 0, f; f = files[i]; i++) {
        var reader = new FileReader();

        reader.onload = function (reader) {
            var data = JSON.parse(this.result);
            ui_add_cards(data);
        };

        reader.readAsText(f);
    }
}

function ui_add_cards(data) {
    card_data = card_data.concat(data);
    ui_update_card_list();
}

function ui_add_new_card() {
    card_data.push(card_default_data());
    ui_update_card_list();
}

function ui_selected_card_index() {
    return parseInt($("#selected_card").val(), 10);
}

function ui_delete_card() {
    card_data.splice(ui_selected_card_index(), 1);
    ui_update_card_list();
}

function ui_update_card_list() {
    $("#total_card_count").text("Deck contains " + card_data.length + " cards.");

    $('#selected_card').empty();
    for (var i = 0; i < card_data.length; ++i) {
        var card = card_data[i];
        $('#selected_card')
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

    URL.revokeObjectURL(url);
}

function ui_update_selected_card() {
    var card = card_data[ui_selected_card_index()];
    if (card) {
        $("#card_title").val(card.title);
        $("#card_icon").val(card.icon);
        $("#card_contents").val(card.contents.join("\n"));
        $("#card_color").val(card.color);

        ui_render_card(card);
    }
}

function ui_render_card(card) {
    var front = card_generate_front(card, card_options);
    var back = card_generate_back(card, card_options);
    $('#preview-container').empty();
    $('#preview-container').html(front + "\n" + back);
}

function ui_open_help() {
    window.open("http://crobi.github.io/rpg-cards/", "_blank");
}

function ui_select_icon() {
    window.open("http://game-icons.net/", "_blank");
}

function ui_setup_color_selector() {
    $.each(card_colors, function (name, val) {
        $(".colorselector-data")
            .append($("<option></option>")
            .attr("value", name)
            .attr("data-color", val)
            .text(name));
    });
    
    $('#default_color_selector').colorselector({
        callback: function (value, color, title) {
            $("#default_color").val(title);
            ui_set_default_color(title);
        }
    });
    $('#card_color_selector').colorselector({
        callback: function (value, color, title) {
            $("#card_color").val(title);
        }
    });
    $(".dropdown-colorselector").addClass("input-group-addon color-input-addon");

    $("#default_color").change(function (e) {
        var color = $("#default_color").val();
        if ($("#default_color_selector option[value='" + color + "']").length > 0) {
            $("#default_color_selector").colorselector("setValue", color);
        } else {
            $("#default_color_selector").colorselector("setValue", "");
            $("#default_color").val(color);
        }
        ui_set_default_color(color);
    });
}

function ui_set_default_color(color) {
    card_options.default_color = color;
}

$(document).ready(function () {
    ui_setup_color_selector();

    $("#button-generate").click(ui_generate);
    $("#button-load").click(function () { $("#file-load").click(); });
    $("#file-load").change(ui_load_files);
    $("#button-load-sample").click(ui_load_sample);
    $("#button-save").click(ui_save_file);
    $("#button-add-card").click(ui_add_new_card);
    $("#button-delete-card").click(ui_delete_card);
    $("#button-help").click(ui_open_help);
    $("#selected_card").change(ui_update_selected_card);

    $(".icon-select-button").click(ui_select_icon);
    
    ui_update_card_list();
});



