// Copyright © 2016 TangDongxin

// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the "Software"),
// to deal in the Software without restriction, including without limitation
// the rights to use, copy, modify, merge, publish, distribute, sublicense,
// and/or sell copies of the Software, and to permit persons to whom the
// Software is furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
// OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
// IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
// TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE
// OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

var fs = require('hexo-fs');
var CryptoJS = require("crypto-js");

hexo.extend.filter.register("after_post_render", function (data) {
    // close the encrypt function
    if (!('encrypt' in hexo.config && hexo.config.encrypt && 'enable' in hexo.config.encrypt && hexo.config.encrypt.enable)) {
        return data;
    }
    if (!('default_template' in hexo.config.encrypt && hexo.config.encrypt.default_template)) { // no such template
        hexo.config.encrypt.default_template = '<div id="security"><input type="text"autocomplete="off"style="display:none"><input type="password"style="display:none"><div class="input-group"><span class="input-group-addon"><span class="glyphicon glyphicon-lock"></span></span><input type="password"id="pass"class="form-control"placeholder="Enter Yubico OTP here..."autofocus="autofocus"autocomplete="new-password"onkeydown="EnterPress()"></div></div><div id="encrypt-blog"style="display:none">{{content}}</div><script>function EnterPress(e){var e=e||window.event;if(e.keyCode==13)decryptAES()}</script>';
    }
    if (!('default_abstract' in hexo.config.encrypt && hexo.config.encrypt.default_abstract)) { // no read more info
        hexo.config.encrypt.default_abstract = '请插入Yubikey后输入Yubico OTP</br>Please insert Yubikey and enter Yubico OTP.';
    }
    if (!('default_message' in hexo.config.encrypt && hexo.config.encrypt.default_message)) { // no message
        hexo.config.encrypt.default_message = '请插入Yubikey后输入Yubico OTP</br>Please insert Yubikey and enter Yubico OTP.';
    }

    if (('password' in data && data.password) || ('lock' in data)) {
        // store the origin data
        data.origin = data.content;
        data.encrypt = true;

        if (!('abstract' in data && data.abstract)) {
            data.abstract = hexo.config.encrypt.default_abstract;
        }
        if (!('template' in data && data.template)) {
            data.template = hexo.config.encrypt.default_template;
        }
        if (!('message' in data && data.message)) {
            data.message = hexo.config.encrypt.default_message;
        }

        data.content = escape(data.content);
        data.content = CryptoJS.enc.Utf8.parse(data.content);
        data.content = CryptoJS.enc.Base64.stringify(data.content);
        if (hexo.config.encrypt.pwdfile != undefined) {
            var password = 'default_password';
            var pwdfilePath = hexo.config.encrypt.pwdfile;
            if (fs.existsSync(pwdfilePath)) {
                password = fs.readFileSync(pwdfilePath).toString();
                password = password.replace(/\n/g, '');
            }
            data.content = CryptoJS.AES.encrypt(data.content, String(password)).toString();
        } else {
            data.content = CryptoJS.AES.encrypt(data.content, String(data.password)).toString();
        }
        data.content = data.template.replace('{{content}}', data.content);
        data.content = '<p id="encrypt-message">' + data.message + '</p>' + data.content;
        data.content = '<script src="' + hexo.config.root + 'js/mcommon.js"></script>' + data.content;
        data.content = '<script src="https://cdn.jsdelivr.net/npm/crypto-js@3.1.9-1/crypto-js.min.js"></script>' + data.content;

        data.more = data.abstract;
        data.excerpt = data.more;
    } else {
        // no blogs config
        if (!'blogs' in hexo.config.encrypt || !hexo.config.encrypt.blogs) {
            return data;
        }
        for (var i = 0, len = hexo.config.encrypt.blogs.length; i < len; i++) {
            if ('blogs' in hexo.config.encrypt && data.title.trim() == hexo.config.encrypt.blogs[i].title.trim()) {
                // store the origin data
                data.origin = data.content;
                data.encrypt = true;

                if (!hexo.config.encrypt.blogs[i].abstract) {
                    hexo.config.encrypt.blogs[i].abstract = hexo.config.encrypt.default_abstract;
                }
                if (!hexo.config.encrypt.blogs[i].template) {
                    hexo.config.encrypt.blogs[i].template = hexo.config.encrypt.default_template;
                }
                if (!hexo.config.encrypt.blogs[i].message) {
                    hexo.config.encrypt.blogs[i].message = hexo.config.encrypt.default_message;
                }

                data.content = escape(data.content);
                data.content = CryptoJS.enc.Utf8.parse(data.content);
                data.content = CryptoJS.enc.Base64.stringify(data.content);
                if (hexo.config.encrypt.pwdfile != undefined) {
                    var password = 'default_password';
                    var pwdfilePath = hexo.config.encrypt.pwdfile;
                    if (fs.existsSync(pwdfilePath)) {
                        password = fs.readFileSync(pwdfilePath).toString();
                        password = password.replace(/\n/g, '');
                    }
                    data.content = CryptoJS.AES.encrypt(data.content, String(password)).toString();
                } else {
                    data.content = CryptoJS.AES.encrypt(data.content, hexo.config.encrypt.blogs[i].password).toString();
                }
                data.content = hexo.config.encrypt.blogs[i].template.replace('{{content}}', data.content);
                data.content = '<p id="encrypt-message">' + hexo.config.encrypt.blogs[i].message + '</p>' + data.content;
                data.content = '<script src="' + hexo.config.root + 'js/mcommon.js"></script>' + data.content;
                data.content = '<script src="' + hexo.config.root + 'js/crypto-js.js"></script>' + data.content;

                data.more = hexo.config.encrypt.blogs[i].abstract;
                data.excerpt = data.more;
            }
        }
    }
    return data;
});
