
/*
* main 
*/
var blogMain = {

    /*
    * RSAEncrypt
    */
    publicKey: "95EECB602CC130262F25497D33599F93E1177B7ADDAD1C8E55579133F52C32D6536EE07859FAA541F21D7D493956A520FC0606C797F53773FCD030D137247C275D6601D30B957F242DE6CCC8D00D5367DE45362A0944262058BA4F8891045C9D30F574E2D0AB8B63316ACFEF3B8FAA588A7C2C07A63BFCA8492CDE4788FEB2F3",
    publicKeyType: "010001",
    
    /*
    * 接口请求
    */
    request: function (method, apiUrlAddress, url,param,successFunc,errorFunc) {
        $.ajax({
            url: url,
            cache: false,
            type: method ? method : 'post',
            contentType: "application/x-www-form-urlencoded; charset=utf-8",
            data: typeof param == 'string' ? param : $.param(param),
            dataType: "json",
            timeout: 6000,
            success: successFunc,
            error: errorFunc
        });
    }
}
