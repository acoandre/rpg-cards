function card_title(text) {
    return '<div class="title">' + text + '</div>';
}

function card_subtitle(text) {
    return '<div class="subtitle">' + text + '</div>';
}

function card_ruler() {
    return '<div class="ruler"></div>';
}

function card_property(name, text) {
    var result = "";
    result += '<div class="property-line">';
    result += '   <h4 class="property-name">' + name.trim() + '</h4>';
    result += '   <p class="property-text">' + text.trim() + '</p>';
    result += '</div>';
    return result;
}

function card_description(name, text) {
    var result = "";
    result += '<div class="description-line">';
    result += '   <h4 class="description-name">' + name.trim() + '</h4>';
    result += '   <p class="description-text">' + text.trim() + '</p>';
    result += '</div>';
    return result;
}

function card_section(text) {
    return '<h3>'+text+'</h3>';
}

function card_fill1() {
    return '<div class="fill-1"></div>';
}
function card_fill2() {
    return '<div class="fill-2"></div>';
}
function card_fill3() {
    return '<div class="fill-3"></div>';
}
function card_fill4() {
    return '<div class="fill-4"></div>';
}

function card_icon(name) {
    var result = "";
    result += '<div class="title-icon-container">';
    result += '    <div class="title-icon icon-' + name + '">';
    result += '    </div>';
    result += '</div>';
    return result;
}

function card_contents(contents) {
    var result = "";
    result += '<div class="content-container">';
    result += contents.map(function (value) {
        var parts = value.split("|").map(function (str) { return str.trim(); });
        switch (parts[0]) {
            case 'subtitle': return card_subtitle(parts[1], parts[2]); break;
            case 'property': return card_property(parts[1], parts[2]); break;
            case 'rule': return card_ruler(); break;
            case 'description': return card_description(parts[1], parts[2]); break;
            case 'text': return card_description("", parts[1]); break;
            case 'fill-1': return card_fill1(); break;
            case 'fill-2': return card_fill2(); break;
            case 'fill-3': return card_fill3(); break;
            case 'fill-4': return card_fill4(); break;
            case 'section': return card_section(parts[1]); break;
            default: return "";
        }
    }).join("\n");
    result += '</div>';
    return result;
}

var card_default_data = {
    count:1,
    title:"",
    icon:"",
    contents:[],
    color: "white"
}

function card(data) {
    var front = "";
    var back = "";

    front += '<div class="card color-' + data.color + '">';
    front += card_icon(data.icon);
    front += card_title(data.title);
    front += card_contents(data.contents);
    front += '</div>';

    var icon_back = data.icon_back || data.icon;
    back += '<div class="card color-' + data.color + '">';
    back += '  <div class="card-back">';
    back += '    <div class="card-back-inner">';
    back += '      <div class="back-icon icon-' + icon_back + '"></div>';
    back += '    </div>';
    back += '  </div>';
    back += '</div>';

    var count = data.count || 1;
    var result = { front: [], back: [] };
    for (var i = 0; i < count; ++i) {
        result.front.push(front);
        result.back.push(back);
    }
    return result;
}

function card_split_pages(data, cards_per_page) {
    var result = [];
    for (var i = 0; i < data.length; i += cards_per_page) {
        var page = data.slice(i, i + cards_per_page);
        result.push(page);
    }
    return result;
}

function cards_flip_left_right(cards) {
    return [
        cards[2], cards[1], cards[0],
        cards[5], cards[4], cards[3],
        cards[8], cards[7], cards[6]
    ];
}

function card_generate_html(datas) {
    var front = [];
    var back = [];

    // Generate HTML for each card
    datas.forEach(function (data) {
        var result = card(data);
        front = front.concat(result.front);
        back = back.concat(result.back);
    });

    // Fill the last page with blank cards
    if (front.length % 9 !== 0) {
        var result = card(card_default_data);
        for (var i = front.length % 9; i < 9; ++i) {
            front = front.concat(result.front);
            back = back.concat(result.back);
        }
    }

    // Split pages
    front_pages = card_split_pages(front, 9);
    back_pages = card_split_pages(back, 9);

    // Clear the previous content of the document
    var parent_element = document.getElementsByClassName("container")[0];
    while (parent_element.hasChildNodes()) {
        parent_element.removeChild(parent_element.lastChild);
    }

    // Add generated HTML to the document
    for (var i = 0; i < front_pages.length; ++i) {
        var page = document.createElement("page");
        page.setAttribute("size", "A4");
        page.innerHTML = front_pages[i].join("\n");
        parent_element.appendChild(page);

        var page = document.createElement("page");
        page.setAttribute("size", "A4");
        page.innerHTML = cards_flip_left_right(back_pages[i]).join("\n");
        parent_element.appendChild(page);
    }
}

//card_generate_html(card_data);