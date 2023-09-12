/**
 * @license Copyright 2021 DENSO
 * 
 * CardIdForm Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';

import TextForm from 'Common/Form/TextForm';
import CardReadErrorModal from 'Assets/Modal/CardReadErrorModal';
import ReadICCardIdModal from 'Assets/Modal/ReadICCardIdModal';
import MessageModal from 'Assets/Modal/MessageModal';

import { cardReader } from 'iccardUtility';
import { createCardReaderInstance, getSerialConnectParameters } from 'iccardUtility';
import { SerialPortErrorCode } from 'glCardReader';

/**
 * カード読み取りフォーム
 * @param {number} icCardType ICカードの種類（FeliCa:0 mifare:1 TypeB:2）
 * @param {string} value カードID
 * @param {string} placeholder プレースホルダー
 * @param {string} validationState 検証結果ステータス
 * @param {string} helpText ヘルプテキスト
 * @param {boolean} disabled 編集不可かどうか
 * @param {function} onChange カードID変更時に呼び出す
 */
export default class CardIdForm extends Component {
    
    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        this.state = {
            showReadCardId: false,
            showCompletedModal: false,
            showReadError: false,
            errorCode: null,
            errorMessage: null
        };        
    }

    /**
     * render
     */
    render() {
        const { icCardType, value, placeholder, validationState, helpText, disabled, maxlength } = this.props;
        const { showCompletedModal, showReadError, showReadCardId, errorCode, errorMessage } = this.state;
        return (
            <div>
                <TextForm 
                    value={value} 
                    onChange={(value) => this.changeCardId(value)}
                    placeholder={placeholder}
                    isReadOnly={disabled}
                    validationState={validationState}
                    helpText={helpText}
                    maxlength={maxlength}
                    addonButton={[{
                        key:'reread',
                        bsStyle: 'primary',
                        label: '読み取り',
                        onClick: () => this.readCardId(icCardType)
                        }]}
                />
                <ReadICCardIdModal
                    show={showReadCardId}
                    onCancel={() => this.cancelReadCardId()}
                />
                <CardReadErrorModal 
                    show={showReadError}
                    errorCode={errorCode}
                    errorMessage={errorMessage}
                    onReread={() => this.readCardId(icCardType)}
                    onCancel={() => this.closeAllModal()}
                />
                <MessageModal
                    show={showCompletedModal}
                    title="カード読み取り完了"
                    bsSize="small"
                    buttonStyle="message"
                    onCancel={() => this.closeAllModal()}
                >
                    読み取り完了しました。
                </MessageModal>
            </div>
        );
    }

    /**
     * カードID変更イベント
     * @param {string} value 変更後の値
     */
    changeCardId(value) {
        if (this.props.onChange) {
            this.props.onChange(value);
        }
    }

    /**
     * ICカードを読み取る
     * @param {number} icCardType ICカード種別
     */
    readCardId(icCardType) {
        const { baudRate, dataBits, stopBits, parity, flowControl } = getSerialConnectParameters();
        createCardReaderInstance(icCardType);
        cardReader.requestCardId(baudRate, dataBits, stopBits, parity, flowControl).then((cardId) => {
            this.completedReadCardId(cardId);
        }, (error) => {
            switch (error.code) {
                case SerialPortErrorCode.CANCELED:
                    break;
                case SerialPortErrorCode.NO_PORT_SELECTED:
                    this.showCardReadErrorModal(null, "カードリーダーを選択してください。");
                    break;
                default:
                    this.showCardReadErrorModal(error.code, error.message);
                    break;
            }
        });
        this.showReadICCardIdModal();
    }

    /**
     * カードID読み取り完了時に呼び出す
     * @param {string} cardId 読み取ったカードID
     */
    completedReadCardId(cardId) {
        this.showCompletedModal();
        this.changeCardId(cardId);
    }

    /**
     * カードID読み取りをキャンセルする
     * @param {string} cardId 読み取ったカードID
     */
    async cancelReadCardId() {
        if (cardReader.isConnected) {
            await cardReader.cancel();
        }
        this.closeAllModal();
    }

    //#region モーダル表示/非表示    

    /**
     * カード読み取りモーダルを表示する
     */
    showReadICCardIdModal() {
        this.setState({
            showCompletedModal: false,
            showReadCardId: true,
            showReadError: false,
            errorCode: null,
            errorMessage: null
        });
    }

    /**
     * 読取り完了モーダル表示
     */
    showCompletedModal() {        
        this.setState({
            showCompletedModal: true
        });
    }

    /**
     * 読み取りエラーモーダルを表示する
     * @param {number} errorCode エラーコード
     * @param {string} errorMessage エラーメッセージ
     */
    showCardReadErrorModal(errorCode, errorMessage) {
        this.setState({
            showReadCardId: false,
            showReadError: true,
            cardReading: false,
            errorCode,
            errorMessage
        });
    }

    /**
     * すべてのモーダル（カード読み取り/エラー/読取り完了）を閉じる
     */
    closeAllModal() {
        this.setState({
            showCompletedModal: false,
            showReadCardId: false,
            showReadError: false,
            errorCode: null,
            errorMessage: null
        });
    }

    //#endregion
}
