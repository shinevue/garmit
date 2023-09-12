'use strict';

import { ICCARD_TYPE } from "constant";
import { sendData, EnumHttpMethod } from "http-request";

/**
 * GLソリューションズ製カードリーダー通信クラス
 */
export class GLCardReader{

    /**
     * ベンダーID
     */
    _usbVendorId = 0x298C;

    /**
     * 使用するカード種別（0:FeliCa 1:Mifare 2:typeB）
     */
    _icCardType;

    /**
     * シリアルポート
     */
    _serialPort;

    /**
     * シリアルポートが接続状態かどうか
     */
    _isConnected = false;

    /**
     * 検出したカードID
     */
    _cardId;

    /**
     * エラー発生時の送信先API
     */
    _errorSendUrl;

    /**
     * サウンド再生用
     */
    _audioPlayer;

    /**
     * データ受信用ストリーム
     */
    _serialReader;

    /**
     * 受信最大リトライ数
     */
    _maxRetryCount = 3;

    /**
     * リトライ回数
     */
    _retryCount = 0;

    /**
     * 直前に送信したコマンド情報（再送用）
     */
    _latestSendedCommandInfo;

    /**
     * ACK受信済かどうか
     */
    _ackReceived = false;

    _receivedDataType = Object.freeze({
        nak : 0,
        ack : 1,
        nodata : 2,
        passwordAuthenticated : 3,
        cardDetected : 4,
        canceled: 5,
        deviceLost: 6,
    });

    _ackNakPacketSize = 6;

    _readerCommandInfo = {
        authentication: { 
            command: [
                0x70,//コマンドコード
                0xF0, 0xF0, 0xF0, 0xF0, 0xF0, 0xF0, 0xF0, 0xF0, //deviceID
                0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, //KeyA
                0xBB, 0xBB, 0xBB, 0xBB, 0xBB, 0xBB, 0xBB, 0xBB, //KeyB
                0xCC, 0xCC, 0xCC, 0xCC, 0xCC, 0xCC, 0xCC, 0xCC  //KeyC
            ],
            receivePacketSize: 9,
            includingAckInRecvPacket: true,
        },
        felicaPolling: {
            command: [
                0x00, 0xFF, 0xFF, 0x00, 0x00, 0x01
            ],
            receivePacketSize: 24,
            includingAckInRecvPacket: false,
        },
        mifarePolling: {
            command: [
                0xC0, 0x00, 0x01
            ],
            receivePacketSize: 16,  //mifareのカードIDは4バイトか7バイト
            includingAckInRecvPacket: false,
        },
    }

    /**
     * 接続済かどうか
     */
    get isConnected(){
        return this._isConnected;
    }

    /**
     * コンストラクタ
     * @param {number} icCardType ICカードの種類（FeliCa:0 mifare:1 TypeB:2）
     * @param {string} errorSendUrl エラー発生時の送信先API
     * @param {string} soundUrl カード検出時に鳴らすサウンドファイルのURL 
     */
    constructor(icCardType, errorSendUrl, soundUrl, maxRetryCount = 3){
        this._icCardType = icCardType;
        this._errorSendUrl = errorSendUrl;
        this._maxRetryCount = maxRetryCount;
        if (soundUrl) {
            this._audioPlayer = new Audio(soundUrl);
            this._audioPlayer.loop = false;
        }
    }

    /**
     * カードIDのリクエスト
     * @param {number} baudRate ボーレート      ex:9600
     * @param {number} dataBits データビット    ex:8
     * @param {number} stopBits ストップビット  ex:1
     * @param {string} parity   パリティ        ex:"none"
     * @param {string} flowControl フロー制御   ex:"none"
     * @returns Promiseオブジェクト（カード検出時にresolve 切断、その他エラー時にreject）
     */
    async requestCardId(baudRate, dataBits, stopBits, parity, flowControl){
        return new Promise(async (resolve, reject) => {
            try {
                if (!this._isConnected) {
                    const connected = await this._connect(baudRate, dataBits, stopBits, parity, flowControl);
                    if (!connected) {
                        throw new SerialPortError("canceled", SerialPortErrorCode.CONNECTION_ERROR);
                    }
                }
                
                const result = await this._waitCard();
                switch (result) {
                    case this._receivedDataType.cardDetected:
                        resolve(this._cardId);
                        break;
                    case this._receivedDataType.canceled:
                        throw new SerialPortError("canceled", SerialPortErrorCode.CANCELED);
                    case this._receivedDataType.deviceLost:
                        throw new SerialPortError("Device has been lost.", SerialPortErrorCode.DEVICE_LOST);
                    default:
                        throw new SerialPortError("ICCard not detected.", SerialPortErrorCode.COMMUNICATION_ERROR);
                }
            } catch (e) {
                console.log(e);
                this._sendError(e);
                reject(e);
            }
        });
    }

    /**
     * カードリーダーと接続する
     * @param {number} baudRate ボーレート      ex:9600
     * @param {number} dataBits データビット    ex:8
     * @param {number} stopBits ストップビット  ex:1
     * @param {string} parity   パリティ        ex:"none"
     * @param {string} flowControl フロー制御   ex:"none"
     * @returns 接続成否
     */
    async _connect(baudRate, dataBits, stopBits, parity, flowControl){
        const filter = { usbVendorId: this._usbVendorId };
        try {
            if (!this._serialPort) {
                try {
                    this._serialPort = await navigator.serial.requestPort({ filters: [filter] });
                } catch (error) {
                    throw new SerialPortError(error.message, SerialPortErrorCode.NO_PORT_SELECTED);
                }
                
                this._serialPort.addEventListener("connect", (event) => {
                    console.log('connectEvent');
                });
                this._serialPort.addEventListener("disconnect", async (event) => {
                    //シリアルデバイスが取り外された場合に発火する
                });
            }

            if (!this._isConnected) {
                await this._serialPort.open({baudRate: baudRate, dataBits: dataBits, stopBits: stopBits, parity: parity, flowControl: flowControl});
                this._isConnected = true;
            }

            await this._sleep(10);
            //認証
            await this._authenticateICCardReader();
            //認証結果受信
            const authData = await this._receive();
            if (!authData.done) {
                //キャンセルされていない
                const result = await this._analyseReceiveData(authData.value);
                if (result != this._receivedDataType.passwordAuthenticated) {
                    this._isConnected = false;
                }
            }else{
                this._disconnect();
            }
        } catch (e) {
            this._isConnected = false;
            throw e;
        }
        return this._isConnected;
    }

    /**
     * カード検出待ちコマンド送信
     * @returns 受信結果
     */
    async _waitCard(){
        this._cardId = null;
        let pollingCommandInfo = this._getPollingCommand();
        await this._send(pollingCommandInfo);
        const response = await this._receive();
        if (response && !response.done) {
            const result = await this._analyseReceiveData(response.value);
            return result;
        }else if(response.done){
            return this._receivedDataType.canceled;
        }else{
            return await this._waitCard();
        }
    }

    /**
     * 受信キャンセル
     * （カード待ち状態の場合、this._serialReader.read()で止まっている。それをキャンセルする）
     */
    async cancel(){
        try {
            if (this._serialPort && this._serialPort.readable.locked) {
                await this._serialReader.cancel();
            }else{
                await this._disconnect();
            }
        } catch (e) {
            console.log(e);
        }
    }

    /**
     * 切断する
     */
    async _disconnect(){
        if (this._serialPort) {
            await this._serialPort.close();
            this._isConnected = false;
            this._serialPort = null;
        }
    }

    /**
     * ポーリングコマンドを返却する
     * @returns 
     */
    _getPollingCommand(){
        let pollingCommandInfo;
        switch (this._icCardType) {
            case ICCARD_TYPE.FELICA:
                pollingCommandInfo = this._readerCommandInfo.felicaPolling;
                break;
            case ICCARD_TYPE.MIFARE:
                pollingCommandInfo = this._readerCommandInfo.mifarePolling;
                break;
            default:
                pollingCommandInfo = this._readerCommandInfo.felicaPolling;
                break;
        }
        return pollingCommandInfo;
    }

    /**
     * カードリーダーとの認証
     */
    async _authenticateICCardReader(){    
        await this._send(this._readerCommandInfo.authentication);
    }

    /**
     * データ受信
     * @returns 受信データ
     */
    async _receive(){
        let readObject;
        let tempReadValue;
        let receivedData = new Uint8Array(0);
        let receivePromise;

        if (this._serialPort.readable) {
            this._serialReader = this._serialPort.readable.getReader();
        
            try {
                while(true){
                    tempReadValue = await this._serialReader.read();
                    if (tempReadValue.done) {
                        //this._serialReader.cancel()が呼ばれるとdoneがtrueとなる
                        //cancel()を呼ぶのはカード読込待ち状態を解除する時
                        readObject = {value: receivedData, done: tempReadValue.done};
                        this._serialReader.releaseLock();
                        break;
                    }
                    if(!receivePromise){
                        receivePromise = new Promise(async(resolve) => {
                            await this._sleep(500);
                            resolve();
                        }).then(() => {
                            this._serialReader.releaseLock();
                        });
                    }
                    
                    if (tempReadValue.value) {
                        receivedData = this._concatUint8Array([receivedData, tempReadValue.value]);
                    }
                }
            } catch(e) {
                if(e instanceof TypeError){
                    readObject = {value: receivedData, done: tempReadValue.done};
                }else{
                    //デバイスが取り外された場合は例外となる
                    console.log(e);
                    readObject = null;
                }
            } finally {
                if (!readObject || readObject.done) {
                    await this._disconnect();
                }
            }
        }
        
        return readObject;
    }

    /**
     * uint8Arrayを結合する
     * @param {array[unit8Array]} arrays uint8Arrayの配列
     * @returns 
     */
    _concatUint8Array(arrays) {
        let totalLength = arrays.reduce((acc, value) => acc + value.length, 0);
        if (!arrays.length) return null;
        let result = new Uint8Array(totalLength);
        let length = 0;
        for(let array of arrays) {
          result.set(array, length);
          length += array.length;
        }
      
        return result;
      }

      /**
       * 受信データ解析
       * @param {uint8Array} data 受信データ
       * @returns 受信結果
       */
    async _analyseReceiveData(data){
        if (this._isNAK(data)) {
            return this._receivedDataType.nak;
        }else{
            let readByte = this._removeACK(data);
            if (readByte.length > 0) {
                switch (readByte[5]) {
                    case 0x71: //パスワード認証完了
                        return this._receivedDataType.passwordAuthenticated;
                    case 0x01: //FeliCaカード検出
                        this._playSound();
                        this._cardId = this._getFelicaIDm(readByte).toUpperCase();
                        return this._receivedDataType.cardDetected;
                    case 0xC1:  //Mifareカード検出
                        this._playSound();
                        this._cardId = this._getMifareUId(readByte).toUpperCase();
                        return this._receivedDataType.cardDetected;
                    case 0x31:  //TypeBカード検出
                        break;
                    default:
                        this._retryCount++;
                        if (this._retryCount > this._maxRetryCount) {
                            console.log(readByte);
                            return this._receivedDataType.nodata;
                        }else{
                            console.log(`リトライ${this._retryCount}回目`);
                            await this._send(this._latestSendedCommandInfo);
                            const receivedData = await this._receive();
                            if (!receivedData.done) {
                                return await this._analyseReceiveData(receivedData.value);
                            }else{
                                return this._receivedDataType.canceled;
                            }
                        }
                }
            }else{
                // ACKのみ受信の場合は再度受信メソッドを呼び出す（こうしないとカード検知レスポンスが受信できない）
                this._ackReceived = true;
                const receivedData = await this._receive();
                if (!receivedData) {
                    return this._receivedDataType.deviceLost;
                }else if (!receivedData.done) {
                    return await this._analyseReceiveData(receivedData.value);
                }else{
                    return this._receivedDataType.canceled;
                }
            }
        }
    }

    /**
     * カードリーダーにデータを送信する
     * @param {array[number]} data バイト配列
     */
    async _send(commandInfo){
        let hasSended;
        const packet = this._createSendData(commandInfo.command);
        let uint8a = new Uint8Array(packet);
        let writer;
        this._ackReceived = false;
        try {
            writer = this._serialPort.writable.getWriter();
            writer.write(uint8a);
            this._latestSendedCommandInfo = commandInfo;
            hasSended = true;
        } catch (e) {
            console.log(e);
            hasSended = false;
        } finally {
            writer.releaseLock();
        }
        return hasSended;
    }

    /**
     * 送信パケットを作成する
     * @param {array[number]} data 送信データ
     * @returns 
     */
    _createSendData(data){
        let packet = [0x00, 0x00, 0xFF];
        packet.push(data.length);
        packet.push(this._calcLengthCheckSum(data.length));
        
        packet = packet.concat(data);
        packet.push(this._calcDataCheckSum(data));
        packet.push(0x00);
        return packet;
    }

    /**
     * パケット長チェックサム算出
     * @param {number} length パケット長
     * @returns 
     */
    _calcLengthCheckSum(length){
        //下位1バイトが0となるように
        let mod = length % 0x100;
        return 0x100 - mod;
    }
    
    /**
     * データチェックサム算出
     * @param {array[number]} data バイト配列
     * @returns 
     */
    _calcDataCheckSum(data){
        let sum = 0;
        data.forEach(element => {
            sum += element;
        });
    
        //下位1バイトが0となるように
        let mod = sum % 0x100;
        return 0x100 - mod;
    }

    /**
     * NAK判定
     * @param {array[number]} data 受信データ
     * @returns 
     */
    _isNAK(data){
        const nakPacket = [0x00, 0x00, 0xFF, 0xFF, 0x00, 0x00]
        const result = this._compareBytes(data, nakPacket, 6)
        return result
    }
    
    /**
     * バイト配列の比較
     * @param {array[number]} data1 比較データ1
     * @param {array[number]} data2 比較データ2
     * @param {number} length 比較するバイト数
     * @returns 
     */
    _compareBytes(data1, data2, length){
        let result = true;
        for (let index = 0; index < length; index++) {
            if (data1[index] != data2[index]) {
            result = false
            break
            }
        }
        return result;
    }

    /**
     * 受信データからACKを取り除く
     * @param {array[number]} data 受信データ
     * @returns 
     */
    _removeACK(data){
        const ack = [0x00, 0x00, 0xFF, 0x00, 0xFF, 0x00];
        const result = this._compareBytes(data, ack, 6);
    
        let removedByte = [];
        if (result) {
            for (let i = 0; i < data.length - 6; i++) {
                removedByte[i] = data[i + 6];
            }
        }else{
            removedByte = Array.from(data);
        }
        return removedByte;
    }

    /**
     * エラー内容をサーバーに送信する
     * @param {object} error エラー内容
     * @param {string} url エラー送信先API
     */
    _sendError(error){
        if (!error && !this._errorSendUrl) {
            sendData(EnumHttpMethod.post, this._errorSendUrl, error, null);
        }
    }

    /**
     * IDmを返却する
     * @param {array[number]} data 受信データ
     * @returns IDm
     */
    _getFelicaIDm(data){
        let cardId = "";
        if (data.length >= 14) {
            for (let i = 6; i < 14; i++) {
                var str = '0' + data[i].toString(16);
                cardId += str.substring(str.length - 2, str.length);
            }
        }
        return cardId;
    }

    /**
     * UIdを返却する
     * @param {array[number]} data 
     * @returns UId
     */
    _getMifareUId(data){
        let cardId = "";
        const byteCount = data[9];
        if(data.length >= 10 + byteCount){
            for(let i = 10; i < 10 + byteCount; i++){
                var str = '0' + data[i].toString(16);
                cardId += str.substring(str.length - 2, str.length);
            }
        }
        return cardId;
    }

    /**
     * 指定時間スリープする
     * @param {number} milisec スリープ時間（ミリ秒）
     */
    async _sleep(milisec){
        await new Promise(resolve => setTimeout(resolve, milisec));
      }

      /**
       * 音源ファイル再生
       */
    _playSound(){
        if (this._audioPlayer) {
            this._audioPlayer.play();
        }
    }
}

export const SerialPortErrorCode = Object.freeze({
    NO_PORT_SELECTED: 1,
    CONNECTION_ERROR: 2,
    COMMUNICATION_ERROR: 3,
    CANCELED: 4,
    DEVICE_LOST: 5,
    UNEXPECTED_ERROR: 99,
});

/**
 * シリアルポート用エラークラス
 */
export class SerialPortError extends Error{

    constructor(message, code){
        super(message);
        this.name = "SerialPortError";
        this.code = code;
    }
}