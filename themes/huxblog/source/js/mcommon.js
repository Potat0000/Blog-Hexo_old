var fast = "2"
var thetime = 9999
for (var i = 1; i <= 5; i++) {
    var url = 'https://cors-anywhere.herokuapp.com/https://api'
        + (i == 1 ? '' : i.toString()) + '.yubico.com/wsapi/2.0/verify'
    var ping, requestTime, responseTime;
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onloadend = function (response) {
        responseTime = new Date().getTime();
        time = Math.abs(requestTime - responseTime);
        currentNum = response.target.responseURL.substring(47, 48);
        currentNum = currentNum == '.' ? '' : currentNum;
        if (time < thetime) {
            fast = currentNum;
            thetime = time;
        }
    };
    xmlHttp.open("GET", url);
    xmlHttp.setRequestHeader('Cache-Control', 'no-cache');
    requestTime = new Date().getTime();
    xmlHttp.send(null);
}

function decryptAES() {
    var pass = String(document.getElementById("pass").value);
    document.getElementById("pass").disabled = true;
    var proxyUrl = "https://cors-anywhere.herokuapp.com/",
        otpUrl = "https://api" + fast + ".yubico.com/wsapi/2.0/verify?id=1&nonce=pbhungejxdtauzoaqalnmxalgeshxwwd&otp=";
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", proxyUrl + otpUrl + pass, false);
    xmlHttp.send(null);
    function whetherOK(element) { return element.includes("status=OK"); }
    if (xmlHttp.responseText.split("\n").some(whetherOK)) {
        pass = pass.substring(0, 12);
    }
    try {
        var content = CryptoJS.AES.decrypt(document.getElementById("encrypt-blog").innerHTML.trim(), pass);
        content = content.toString(CryptoJS.enc.Utf8);
        content = decodeBase64(content);
        content = unescape(content);
        if (!content == '') {
            document.getElementById("encrypt-blog").style.display = "inline";
            document.getElementById("encrypt-blog").innerHTML = content;
            document.getElementById("encrypt-message").style.display = "none";

            document.getElementById("security").style.display = "none";

            if (document.getElementById("toc-div")) {
                document.getElementById("toc-div").style.display = "inline";
            }
        }
    } catch (e) {
        document.getElementById("pass").placeholder = "Error! Enter Yubico OTP here again.";
        document.getElementById("pass").value = "";
        document.getElementById("pass").disabled = false;
        document.getElementById("pass").focus();
        console.log(e);
    }
}

function htmlDecode(str) {
    var s = "";
    if (str.length == 0) return "";

    s = str.replace(/&gt;/g, "&");
    s = s.replace(/&lt;/g, "<");
    s = s.replace(/&gt;/g, ">");
    s = s.replace(/&nbsp;/g, "    ");
    s = s.replace(/'/g, "\'");
    s = s.replace(/&quot;/g, "\"");
    s = s.replace(/<br>/g, "\n");
    return s;
}

function decodeBase64(content) {
    content = CryptoJS.enc.Base64.parse(content);
    content = CryptoJS.enc.Utf8.stringify(content);
    return content;
}


// add enter to decrypt
addLoadEvent(function () {
    document.getElementById("pass").onkeypress = function (keyPressEvent) {
        if (keyPressEvent.keyCode === 13) {
            decryptAES();
        }
    };
});

function addLoadEvent(func) {
    var oldonload = window.onload;
    if (typeof window.onload != 'function') {
        window.onload = func;
    } else {
        window.onload = function () {
            oldonload();
            func();
        }
    }
}
