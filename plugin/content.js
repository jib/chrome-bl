// var linkArray = $("script").map(function() {
//     console.log("here");
//     return $(this).attr('src');
// }).get();
//
// console.log(linkArray);

/* Sample image links:
"//img.bricklink.com/ItemImage/PT/86/61482.t1.png",
"//img.bricklink.com/ItemImage/PT/11/19220.t1.png",
"//img.bricklink.com/ItemImage/PT/11/4006.t1.png",
"//img.bricklink.com/ItemImage/PT/95/98141.t1.png",
"//img.bricklink.com/ItemImage/PT/104/4865b.t1.png",
"//img.bricklink.com/ItemImage/PT/5/4865b.t1.png",
"//img.bricklink.com/ItemImage/PT/13/4865b.t1.png",
*/
var imageRegex = new RegExp('/ItemImage/PT/(\\d+)/(\\w+)\\.t[0-2].png');

// Using templates: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
// xxx throws error on chrome 53 for 'template note defined'
// var priceGuideUrlTemplate = template`https://www.bricklink.com/catalogPriceGuide.asp?itemType=P&&v=P&priceGroup=Y&prDec=2&itemSeq=1&itemNo=${'part'}&colorID=${'color'}`

// This sections has the new/used price from now & last 6 months. Sample url:
// https://www.bricklink.com/catalogPriceGuide.asp?itemType=P&&v=P&priceGroup=Y&prDec=2&itemSeq=1&itemNo=44302&colorID=3
// Best anchor is the tr/bgcolor, + td + table as it uses no clases, and then get the double
// </tbody></table></td></tr> at the end.
/*
<tr bgcolor="#C0C0C0"><td valign="TOP"><table border="0" width="100%" cellpadding="5" cellspacing="0"><tbody><tr><td><table border="0" cellpadding="0" cellspacing="0" width="100%"><tbody><tr align="RIGHT"><td width="50%"><font face="Verdana" size="-2">Times Sold:</font></td><td width="50%"><font face="Verdana" size="-2"><b>220</b></font></td></tr><tr align="RIGHT"><td><font face="Verdana" size="-2">Total Qty:</font></td><td><font face="Verdana" size="-2"><b>2724</b></font></td></tr><tr align="RIGHT"><td><font face="Verdana" size="-2">Min Price:</font></td><td><font face="Verdana" size="-2"><b>$0.01</b></font></td></tr><tr align="RIGHT"><td><font face="Verdana" size="-2">Avg Price:</font></td><td><font face="Verdana" size="-2"><b>$0.04</b></font></td></tr><tr align="RIGHT"><td><font face="Verdana" size="-2">Qty Avg Price:</font></td><td><font face="Verdana" size="-2"><b>$0.03</b></font></td></tr><tr align="RIGHT"><td><font face="Verdana" size="-2">Max Price:</font></td><td><font face="Verdana" size="-2"><b>$0.38</b></font></td></tr></tbody></table></td></tr></tbody></table></td><td valign="TOP"><table border="0" width="100%" cellpadding="5" cellspacing="0"><tbody><tr><td><table border="0" cellpadding="0" cellspacing="0" width="100%"><tbody><tr align="RIGHT"><td width="50%"><font face="Verdana" size="-2">Times Sold:</font></td><td width="50%"><font face="Verdana" size="-2"><b>322</b></font></td></tr><tr align="RIGHT"><td><font face="Verdana" size="-2">Total Qty:</font></td><td><font face="Verdana" size="-2"><b>2191</b></font></td></tr><tr align="RIGHT"><td><font face="Verdana" size="-2">Min Price:</font></td><td><font face="Verdana" size="-2"><b>$0.00</b></font></td></tr><tr align="RIGHT"><td><font face="Verdana" size="-2">Avg Price:</font></td><td><font face="Verdana" size="-2"><b>$0.03</b></font></td></tr><tr align="RIGHT"><td><font face="Verdana" size="-2">Qty Avg Price:</font></td><td><font face="Verdana" size="-2"><b>$0.02</b></font></td></tr><tr align="RIGHT"><td><font face="Verdana" size="-2">Max Price:</font></td><td><font face="Verdana" size="-2"><b>$0.11</b></font></td></tr></tbody></table></td></tr></tbody></table></td><td valign="TOP"><table border="0" width="100%" cellpadding="5" cellspacing="0"><tbody><tr><td><table border="0" cellpadding="0" cellspacing="0" width="100%"><tbody><tr align="RIGHT"><td width="50%"><font face="Verdana" size="-2">Total Lots:</font></td><td width="50%"><font face="Verdana" size="-2"><b>751</b></font></td></tr><tr align="RIGHT"><td><font face="Verdana" size="-2">Total Qty:</font></td><td><font face="Verdana" size="-2"><b>19570</b></font></td></tr><tr align="RIGHT"><td><font face="Verdana" size="-2">Min Price:</font></td><td><font face="Verdana" size="-2"><b>$0.01</b></font></td></tr><tr align="RIGHT"><td><font face="Verdana" size="-2">Avg Price:</font></td><td><font face="Verdana" size="-2"><b>$0.06</b></font></td></tr><tr align="RIGHT"><td><font face="Verdana" size="-2">Qty Avg Price:</font></td><td><font face="Verdana" size="-2"><b>$0.05</b></font></td></tr><tr align="RIGHT"><td><font face="Verdana" size="-2">Max Price:</font></td><td><font face="Verdana" size="-2"><b>$5.09</b></font></td></tr></tbody></table></td></tr></tbody></table></td><td valign="TOP"><table border="0" width="100%" cellpadding="5" cellspacing="0"><tbody><tr><td><table border="0" cellpadding="0" cellspacing="0" width="100%"><tbody><tr align="RIGHT"><td width="50%"><font face="Verdana" size="-2">Total Lots:</font></td><td width="50%"><font face="Verdana" size="-2"><b>747</b></font></td></tr><tr align="RIGHT"><td><font face="Verdana" size="-2">Total Qty:</font></td><td><font face="Verdana" size="-2"><b>13224</b></font></td></tr><tr align="RIGHT"><td><font face="Verdana" size="-2">Min Price:</font></td><td><font face="Verdana" size="-2"><b>$0.01</b></font></td></tr><tr align="RIGHT"><td><font face="Verdana" size="-2">Avg Price:</font></td><td><font face="Verdana" size="-2"><b>$0.04</b></font></td></tr><tr align="RIGHT"><td><font face="Verdana" size="-2">Qty Avg Price:</font></td><td><font face="Verdana" size="-2"><b>$0.04</b></font></td></tr><tr align="RIGHT"><td><font face="Verdana" size="-2">Max Price:</font></td><td><font face="Verdana" size="-2"><b>$0.47</b></font></td></tr></tbody></table></td></tr></tbody></table></td></tr>
*/
//var priceGuideRegex = new RegExp('<tr bgcolor="#C0C0C0">\\.*?</tbody></table></td></tr></tbody></table></td></tr>', 'ig');
var priceGuideBGColor = "#C0C0C0";

// Replace this part of the text from the price guide with a link to the price guide itself
var linkReplaceText = 'Times Sold:';

// keep the G flag - we're doing these matches in a loop!
var qtyAveragePriceRegex = new RegExp("Qty\\s+Avg\\s+Price:\\s*\\$([\\d.]+)", "ig");
var purchasePriceRegex = new RegExp("Price:\\s+\\w+\\s+\\$([\\d.]+)", "ig");
var purchaseDiv = 'div.buy';

var purchaseRecommendationColors = [
    "#FF3300",   // Red => Overpriced!
    "#FF9933",   // Orage => Rather overpriced
    "#FFFF66",   // Yellow => Bit overpriced
    "#6699FF",   // Blue => Fine
    "#CCFF66",   // Light Green => good buy
    "#00CC00"    // Green => Buy!
];

function priceGuideUrl(part, color) {
    return 'https://www.bricklink.com/catalogPriceGuide.asp'
            + '?P=' + part
            + '&colorID=' + color
            + '&viewExclude=N&v=Q';

}

function findPartImages () {
    var arr = [];
    $("img").each(function(i) {
        var match = imageRegex.exec( $(this).attr('src') );

        if( match != null ) {
            arr.push({ object: this, color: match[1], part: match[2] });
        }
        //console.log("src: " + $(this).attr('src') );
    })
    return arr;
}


function findPrice(regex, text) {
    // because we do a global match JS keeps the index. we have to reset it
    // to make sure we get the match next iteration:
    // https://stackoverflow.com/questions/23298944/regex-prototype-exec-returns-null-on-second-iteration-of-the-search
    regex.lastIndex=0;

    // note, despite the /g flag, a regex with exec only matches ONCE. You have
    // to keep reinvoking it: http://2ality.com/2013/08/regexp-g.html
    var match;
    var price;
    while( match = regex.exec(text) ) {
        console.log(match);
        price = match[1];
    }

    //console.log('price: ' + price );
    return price;
}


function purchaseRecommendation(avgText, purchaseText) {
    // get the average price from the price guide
    var avgPrice = findPrice(qtyAveragePriceRegex, avgText);
    var purchasePrice = findPrice(purchasePriceRegex, purchaseText);
    //console.log( "avg: " + avgPrice + " - purchase: " + purchasePrice );

    var ratio = Math.round(avgPrice*1.0/purchasePrice*1.0 * 100);
    var index =
        ratio < 50 ? 0 :
        ratio < 75 ? 1 :
        ratio < 90 ? 2 :
        ratio < 125 ? 3 :
        ratio < 200 ? 4 :
        5;

    var color = purchaseRecommendationColors[index];
    console.log("ratio: " + ratio + ' - index: ' + index + ' - color: ' + color);

    return {ratio: ratio, color: color};
}

function insertPriceGuide(div, url, id) {
    // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true); // true = async
    xhr.responseType = 'document';
    xhr.onload = function(e) {
        var content = this.response;
        var tr = $(content).find('tr[bgcolor="' + priceGuideBGColor + '"]');

        // Get a purchase recommendation
        var rec = purchaseRecommendation(
                    tr.text(),                          // avg
                    $(div).find(purchaseDiv).text()     // purchase
                );

        // set the background color based on the recommendation:
        // https://stackoverflow.com/questions/15292988/set-background-color-on-div-with-jquery
        $(div).css('background', rec.color);

        /// create a link to the price guide and display the ratio
        var bold = $('<b>').appendTo(div);
        var href = $('<a>', {
            text: "Ratio: " + rec.ratio,
            href: url,
        }).css({
            color: "#000000"
        }).appendTo(bold);

        // display the price guide
        var table = $('<table></table>', {
            width: '100%'
        }).addClass('insertPriceGuideTable');

        table.append(tr);
        table.appendTo(div);

        return true;
    };
    xhr.send();
}

function x () {
    var imgArray = findPartImages();
    console.log(imgArray);

    $(imgArray).each(function(i) {
        var url = priceGuideUrl(this.part, this.color);
        console.log(this, url);

        var div = this.object
                    .parentElement // the image div
                    .parentElement // the image container div
                    .parentElement // the image box container div
                    .parentElement // the article table row

        insertPriceGuide(div, url, i);
    });
}

function myMain () {
    var jsInitChecktimer = setInterval(checkForJS_Finish, 1000);

    var paranoid = 0;
    function checkForJS_Finish () {
        if( $("div.image") ) {
            clearInterval(jsInitChecktimer);
            x();
        } else {
            console.log("still waiting");
        }
    }
}

// Ajax reload, so if the hash changes, rerun the function
window.onhashchange = myMain;

myMain();


