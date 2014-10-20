function on_generate() {
    // Generate output HTML
    var card_html = card_pages_generate_html(card_data);

    // Open a new window for the output
    // Use a separate window to avoid CSS conflicts
    var tab = window.open("output.html", 'rpg-cards-output');

    // Send the generated HTML to the new window
    // Use a delay to give the new window time to set up a message listener
    setTimeout(function () { tab.postMessage(card_html, '*') }, 100);
}

function on_load_sample() {
    card_data = card_data_example;
}

$(document).ready(function () {
    $("#button-generate").click(on_generate);
    $("#button-load-sample").click(on_load_sample);
});



