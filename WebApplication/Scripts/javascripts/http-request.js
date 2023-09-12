/**
 * @license Copyright 2018 DENSO Solutions
 */

'use strict';

export const EnumHttpMethod = {
    get: 'get',
    post: 'post',
    put: 'put',
    delete: 'delete'
};

export const NETWORKERROR_MESSAGE = "通信エラーが発生しました。";

const HTTP_CODE_SESSIONERROR = 440;
const HTTP_STATUS_NETWORKERROR = 0;

/**
 * データを送信する（非同期）
 * @param {EnumHttpMethod} type 使用するHTTPメソッドのタイプ
 * @param {string} url リクエストを送信するURL
 * @param {*} sendingData 送信するデータ
 * @param {function} callback コールバック関数
 */
export function sendData(type, url, sendingData, callback){
    var xhr = new XMLHttpRequest();

    xhr.open(type, url, true);
    xhr.onload = () => {
        //エラーを確認
        if (!checkHttpState(xhr.status)) {
            return;
        }

        //送信に成功した場合
        if(callback){
            var receiveData = isJSON(xhr.responseText) ? JSON.parse(xhr.responseText) : null;
            callback && callback(receiveData, false);
        }
    }; 
    xhr.onerror = () => {
        //送信に失敗した場合。エラーの確認
        checkHttpState(xhr.status);
        if (xhr.status === HTTP_STATUS_NETWORKERROR) {
            callback && callback(null, true);       //通信エラーの場合、callback関数の第二引数にネットワークエラーかどうかを渡す
        }
    };

    if(type === EnumHttpMethod.post){
        // サーバに対して解析方法を指定する
        xhr.setRequestHeader( 'Content-Type', 'application/json' );
        sendingData=JSON.stringify(sendingData);
    }

    //データをリクエスト。ボディに含めて送信する
    xhr.send(sendingData);
}

/**
 * URLを解析して、クエリ文字列を取得する
 * @param {string} url URL
 * @returns {Array} クエリ文字列
 */
export function getQueryString(url) {
    var queryStrings = {}, max = 0, hash ='', array = '';

    //?を取り除くため、1から始める。複数のクエリ文字列に対応するため、&で区切る
    hash  = url.slice(1).split('&');    
    max = hash.length;
    for (var i = 0; i < max; i++) {
        array = hash[i].split('=');    //keyと値に分割。
        queryStrings[array[0]] = array[1];    //先ほど確保したkeyに、値を代入。
    }

    return queryStrings;
}

/**
 * httpStatusをチェックして、エラーの場合はエラー画面に遷移する
 * @param {number} status httpステータス 
 */
function checkHttpState(status) {
    if (status >= 200 && status < 400) {
        return true;        //成功
    } else if (status === HTTP_CODE_SESSIONERROR) {
        window.location.href = '/Error/SessionError'; //セッションタイムアウトエラー コードは440にする
    } else if (status !== HTTP_STATUS_NETWORKERROR) {
        window.location.href = '/Error';              // 通信エラー以外の場合は、その他アプリケーションエラー
    }
    return false;
}

/**
 * JSON形式化どうか
 * @param {*} resource 
 */
function isJSON(target) {
	try {
		JSON.parse(target);
		return true;
	} catch (e) {
		return false;
	}
}

/**
 * httpリクエスト(Ajax)
 * @param {any} url リクエストを送信するURL
 * @param {any} formData 送信するデータ
 * @param {any} callback コールバック関数
 */
export function sendAjax(url, formData, callback) {
    $.ajax({
        url: url,
        method: 'POST',
        processData: false,
        contentType: false,
        data: formData
    }).done((data, status, xhr) => {
        callback && callback(data, false);
        return data;
    }).fail((xhr, status, errorThrown) => {
        const networkError = xhr.status === HTTP_STATUS_NETWORKERROR;
        callback && callback(null, networkError);
        return;
    });
}
