var settings = {};
settings.DEBUG = true;
settings.PluginPrefix = "[BL]";

// Let various parts of the code trigger reapplication
settings.markForRerun = false;

/*********************************************************

Helper functions

*********************************************************/

function _d(input) {
    var arr = Array.isArray(input) ? input : [input];

    var msg = settings.PluginPrefix;
    $(arr).each(function(){
        msg = msg + " " + (
            this === undefined      ? "(undefined)" :
            this === Object(this)   ? JSON.stringify(this) :
            this
        );
    })

    settings.DEBUG && console.log(msg);
}

// Match a string against a list (strings) of regexes
function _stringMatch(string, matches) {
    _d(["Testing for String:", string, " -- against: ", matches.join(" -- ")]);

    var isMatch = false;
    $(matches).each(function(i) {
        _d(["    Testing against:", this]);

        var re = new RegExp(this);
        if( re.test(string) ) {
            _d("        Match found");
            isMatch = true;

            // end the callback functions
            return false;
        }
    });

    return isMatch;
}

function priceGuideUrl(partID, colorID) {
    var url = 'https://www.bricklink.com/catalogPriceGuide.asp'
            + '?P=' + partID
            + '&colorID=' + colorID
            + '&viewExclude=N&v=Q';

    _d(["Price guide url:", url]);
    return url;

}




/*********************************************************

Shop functions

*********************************************************/

settings.shopUrlsRegexes = [
    "#\/shop.*\"itemType\":\"P\"",
    "#\/shop.*%22itemType%22:%22P%22",
    "#\/shop.*\"itemID\":",
    "#\/shop.*%22itemID%22:",
    "#\/shop.*\"q\":",
    "#\/shop.*%22q%22:",
    "#\/shop.*\"bOnWantedList\":",
    "#\/shop.*%22bOnWantedList%22:",
];

function isPageInShop(href) {
    _d(["Testing for Shop URL:", href])

    var inShop = _stringMatch(href, settings.shopUrlsRegexes);
    _d(["Is Page in shop:", inShop]);

    return inShop;
}

/*********************************************************

Cart functions

*********************************************************/

settings.cartUrlsRegexes = [
    "#\/cart",
    "\/globalcart\.page",
];

function isPageInCart(href) {
    _d(["Testing for Cart URL:", href])

    var inCart = _stringMatch(href, settings.cartUrlsRegexes);
    _d(["Is Page in cart:", inCart]);

    return inCart;
}

/*********************************************************

Wanted List functions

*********************************************************/

settings.wantedListUrlsRegexes = [
    "\/wanted\/buy\.page"
];

function isPageInWantedList(href) {
    _d(["Testing for WantedList URL:", href])

    var inWantedList = _stringMatch(href, settings.wantedListUrlsRegexes);
    _d(["Is Page in WantedLIst:", inWantedList]);

    return inWantedList;
}

/*********************************************************

Price recommendation code

*********************************************************/

function findPrice(text, regex) {
    // because we do a global match JS keeps the index. we have to reset it
    // to make sure we get the match next iteration:
    // https://stackoverflow.com/questions/23298944/regex-prototype-exec-returns-null-on-second-iteration-of-the-search
    regex.lastIndex=0;

    _d(["Finding price in:", text, "--", "Using regex:", regex.toString()])

    // note, despite the /g flag, a regex with exec only matches ONCE. You have
    // to keep reinvoking it: http://2ality.com/2013/08/regexp-g.html
    var match;
    var price = undefined;
    while( match = regex.exec(text) ) {
        // find the lowest price - they list discounts as well
        price = match[1] > price ? price : match[1];
    }

    _d(["Found price:" + price]);
    return price;
}

settings.purchaseRecommendationColors = [
    "#B3B3B3",   // Gray => Can't compute.
    "#FF3300",   // Red => Overpriced!
    "#FF9933",   // Orage => Rather overpriced
    "#FFFF66",   // Yellow => Bit overpriced
    "#6699FF",   // Blue => Fine
    "#CCFF66",   // Light Green => good buy
    "#00CC00"    // Green => Buy!
];


// keep the G flag - we're doing these matches in a loop!
settings.avgPriceRegex = new RegExp("Qty\\s+Avg\\s+Price:\\s*\\$([\\d.]+)", "ig");
settings.curPriceRegex = new RegExp("US\\s+\\$([\\d.]+)", "ig");

function findPriceRecommendation(object, callback){

    // Compute the prices from both the current and avg prices
    _d("Finding average price");
    object.avgPrice = findPrice(object.rawPriceGuide.text(), settings.avgPriceRegex);

    _d("Finding current price");
    object.curPrice = findPrice(object.curDisplayDiv.text(), settings.curPriceRegex);

    //_d(["Currrent Price:", object.curPrice, "--", "Average Price:", object.avgPrice]);

    var ratio = Math.round(object.avgPrice * 1.0 / object.curPrice * 1.0 * 100);
    var index =
        isNaN(ratio) ? 0 :
        ratio < 50 ? 1 :
        ratio < 75 ? 2 :
        ratio < 90 ? 3 :
        ratio < 125 ? 4 :
        ratio < 200 ? 5 :
        6;

    object.ratio    = ratio;
    object.bgcolor  = settings.purchaseRecommendationColors[index];

    callback(object);
}

/*********************************************************

Part detection code

*********************************************************/

settings.imageRegex = new RegExp('/ItemImage/PT/(\\d+)/(\\w+)\\.t[0-2].png');

function findPartsOnPage(callback) {
    var arr = [];
    $("img").each(function(i) {
        _d(["Testing if image is part link:", $(this).attr('src') ])

        var match = settings.imageRegex.exec( $(this).attr('src') );
        if( match != null ) {
            var o = { tag: this, color: match[1], part: match[2] };

            _d(["    Match found -- color:", o.color, "part: ", o.part ]);
            arr.push(o);

            // Execute the callback
            callback(o);
        }
    })
    return arr;
}

/*********************************************************

Part Price Guide code

*********************************************************/

// Background color for the price guide - used to find the right div on the page
settings.priceGuideBGColor = "#C0C0C0";

// 4 tables in the price guide:
// 0) New prices in last 6 months
// 1) Used prices in last 6 months
// 2) New prices currently for sale
// 3) Used prices currently for sale
// We used to use #4, but switching to #2 for better 'price over time' info
settings.priceGuideIndex = 1;

// Example price guide URL:
// https://www.bricklink.com/catalogPriceGuide.asp?P=6005&colorID=11&viewExclude=N&v=Q
function findPriceGuide(object, callback) {
    var url = object.priceGuideUrl = priceGuideUrl(object.part, object.color);

    // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true); // true = async
    xhr.responseType = 'document';
    xhr.onload = function(e) {
        _d(["Loaded URL", url]);

        var content = this.response;

        // Find the table with all the pricing information
        var tr = $(content).find('tr[bgcolor="' + settings.priceGuideBGColor + '"]');

        // Create a proper table out of it, ready for inserting and add it as a property
        object.priceGuideTable = $('<table></table>', {
            width: '100%'
        }).addClass('insertPriceGuideTable');
        object.priceGuideTable.append(tr);

        // Price Guide we use for recommendations
        object.rawPriceGuide = $(tr).children().eq(settings.priceGuideIndex);

        callback(object);

    };
    xhr.send();
}


/*********************************************************

Augment code

*********************************************************/

function runAugmentCode() {
    _d("Augmenting page...");

    // Contains an object like:
    // { tag: <part image HTML tag>, color: colorID, part: partID }
    var partArray = findPartsOnPage(function(object){

        // Which div are we apprending to? It's different from shop/cart.
        object.curDisplayDiv = $(this.inCart || this.inWant
            ? object.tag
                    .parentElement // the image div
                    .parentElement // the image box container div
                    .parentElement // the article table row
            : object.tag
                    .parentElement // the image div
                    .parentElement // the image container div
                    .parentElement // the image box container div
                    .parentElement // the article table row
        )

        // Adds object.priceGuideTable = <html> for inserting
        // Adds object.rawPriceGuide for the price individual price points
        // Adds object.priceGuideUrl
        findPriceGuide(object, function(object){

            // add object.avgPrice & object.curPrice
            // add object.ratio and object.bgcolor
            findPriceRecommendation(object, function(object) {

                // create a link to the price guide and display the ratio
                var bold = $('<b>').appendTo(object.curDisplayDiv);
                var href = $('<a>', {
                    text: "Ratio: " + object.ratio +
                          " - Avg: " + object.avgPrice +
                          " - Price: " + object.curPrice,
                    href: object.priceGuideUrl,
                }).css({
                    color: "#000000"
                }).appendTo(bold);

                $(object.priceGuideTable).appendTo(object.curDisplayDiv);
                $(object.curDisplayDiv).css('background', object.bgcolor);
            })
        });
    });
}

/*********************************************************

Chrome Plugin Functions

*********************************************************/

// https://developer.chrome.com/extensions/messaging#simple
// Called when the user clicks on the plugin icon (initiated from bakground.js).
chrome.runtime.onMessage.addListener(function(req, sender, callback) {
    _d("Manual invoke detected");
    // Let the extension know we ran.
    callback({ ranBLAugment: true });

    settings.markForRerun = true;

    // but do it async
    return true;
});

/*********************************************************

Main code loop

*********************************************************/

function myMain () {
    var jsInitChecktimer = setInterval(checkForJS_Finish, 1000);

    var inShop = isPageInShop(window.location.href);
    var inCart = isPageInCart(window.location.href);
    var inWant = isPageInWantedList(window.location.href)

    // When we're done loading, let's go and augment
    function checkForJS_Finish () {
        //_d("Check for JS FInish");
        this.inShop = inShop;
        this.inCart = inCart;
        this.inWant = inWant;

        if( this.inShop || this.inCart || this.inWant) {
            if( $("div.image") ) {
                clearInterval(jsInitChecktimer);
                runAugmentCode();
            } else {
                _d("still waiting");
            }
        }
    }
}

// Ajax reload, so if the hash changes, rerun the function
// avoid too many hash changes in short succession forcing reruns/duplicates
window.onhashchange = function() {
    _d("Page change detected")
    settings.markForRerun = true;
}

setInterval( function() {
    //_d("Need to run?");
    // Do we need to run again?
    if( settings.markForRerun ) {
        _d("Augmentation Trigger set - reapplying BL Augment: " + window.location.href);
        settings.markForRerun = false;
        myMain();
    }
}, 1000);

myMain();

