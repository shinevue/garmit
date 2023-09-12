/**
 * @license Copyright 2017 DENSO
 * 
 * サンプル画面のReactコンポーネント
 * 
 */

'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import { browserHistory } from 'react-router';

import { setWaitingState } from 'WaitState/actions.js';
import { setEditedUnitImage, setUnitImages } from './actions.js';

import Content from 'Common/Layout/Content';

import MessageModal from 'Assets/Modal/MessageModal';
import WaitingMessage from 'Assets/Modal/WaitingMessage';

import ImageEditBox from 'Image/ImageEditBox';

import { sendData, sendAjax, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';

class ImageEditPanel extends Component {

    constructor(){
        super();
        this.state = {
            message: {}
        };
    }

    componentDidMount() {
        
    }

    /**
     * 保存ボタンクリック時
     * @param {any} unitImage
     * @param {any} formData
     */
    onSubmit(unitImage, formData) {
        this.setState({
            message: {
                show: true,
                buttonStyle: 'save',
                title: '保存',
                message: '編集内容を保存しますか？',
                onOK: () => {
                    this.clearMessage();
                    if (formData && unitImage.fileName == this.props.editedUnitImage.fileName) {
                        this.deleteImageFile(this.props.editedUnitImage.url, () => {
                            this.saveData(unitImage, formData);
                        });
                    } else {
                        this.saveData(unitImage, formData);
                    }
                },
                onCancel: () => this.clearMessage()
            }
        });
    }

    /**
     * キャンセルボタンクリック時
     */
    onCancel() {
        this.props.setEditedUnitImage(null);
        browserHistory.goBack();
    }

    /**
     * ユニット画像を保存する
     * @param {any} unitImage
     * @param {any} formData
     */
    saveData(unitImage, formData) {
        // 保存処理
        this.saveImageFile(formData, (fileSaveResult) => {
            if (fileSaveResult.isSuccess) {
                this.saveUnitImage(unitImage, (dbSaveResult) => {
                    if (dbSaveResult) {
                        this.setState({
                            message: {
                                show: true,
                                buttonStyle: 'message',
                                title: '保存',
                                message: 'ユニット画像を保存しました。',
                                onCancel: () => {
                                    this.clearMessage();
                                    browserHistory.goBack();
                                }
                            }
                        });
                    } else {
                        this.setState({
                            message: {
                                show: true,
                                buttonStyle: 'message',
                                title: '保存',
                                message: 'ユニット画像の保存に失敗しました。',
                                onCancel: () => this.clearMessage()
                            }
                        });
                    }
                })
            }
            else {
                this.setState({
                    message: {
                        show: true,
                        buttonStyle: 'message',
                        title: '保存',
                        message: fileSaveResult.message ||  'ユニット画像の保存に失敗しました。',
                        onCancel: () => this.clearMessage()
                    }
                });
            }
        });
    }

    /**
     * 画像情報をDBに登録する
     * @param {any} unitImage
     */
    saveUnitImage(unitImage, callback) {
        this.props.setWaitingState(true, 'save');
        sendData(EnumHttpMethod.post, '/api/image/setUnitImage', unitImage, (result, networkError) => {
            if (result) {
                this.props.setEditedUnitImage(null);
                this.loadUnitImages(() => {
                    this.props.setWaitingState(false, null);
                    if (callback) {
                        callback(result);
                    }
                });
            } else {
                this.props.setWaitingState(false, null);
                if (networkError) {
                    this.showNetWorkErrorMessage();
                } else {
                    if (callback) {
                        callback(result);
                    }
                }
            }
        });
    }

    /**
     * 画像ファイルを画像ディレクトリに保存する
     * @param {any} formData
     * @param {any} callback
     */
    saveImageFile(formData, callback) {
        if (!formData) {
            callback({ isSuccess: true });
            return;
        }

        this.props.setWaitingState(true, 'save');
        sendAjax('/api/image/setImageFile', formData, (result, networkError) => {
            this.props.setWaitingState(false, null);
            if (!networkError) {
                callback && callback(result);
            } else {
                this.showNetWorkErrorMessage();
            }
        });
    }

    /**
     * 画像ファイルを削除する
     * @param {any} url
     * @param {any} callback
     */
    deleteImageFile(url, callback) {
        this.props.setWaitingState(true, 'save');
        sendData(EnumHttpMethod.get, '/api/image/deleteImageFile?imageUrl=' + url, null, (result, networkError) => {
            this.props.setWaitingState(false);
            if (networkError) {
                this.showNetWorkErrorMessage();
            }
            if (callback) {
                callback();
            }
        });
    }

    /**
     * ユニット画像を取得する
     */
    loadUnitImages(callback) {
        sendData(EnumHttpMethod.get, '/api/image/getUnitImages', null, (data, networkError) => {
            if (data) {
                this.props.setUnitImages(data.unitImages);
            }
            if (networkError) {
                this.showNetWorkErrorMessage();
            }
            if (callback) {
                callback();
            }
        });
    }

    /**
     * エラーメッセージを表示する
     * @param {any} message
     */
    showErrorMessage(message) {
        this.setState({
            message: {
                show: true,
                buttonStyle: 'message',
                title: 'エラー',
                message: message,
                onCancel: () => this.clearMessage()
            }
        });
    }

    /**
     * ネットワークエラーメッセージを表示する
     */
    showNetWorkErrorMessage() {
        this.showErrorMessage(NETWORKERROR_MESSAGE);
    }

    /**
     * メッセージを消す
     */
    clearMessage() {
        const message = Object.assign({}, this.state.message);
        message.show = false;
        this.setState({ message: message });
    }

    /**
     * render
     */
    render() {
        const { editedUnitImage, unitTypes, waitingInfo } = this.props;
        const { message } = this.state;
        return (
            <Content>
                <ImageEditBox
                    editedUnitImage={editedUnitImage}
                    unitTypes={unitTypes}
                    onSubmit={(unitImage, formData) => this.onSubmit(unitImage, formData)}
                    onCancel={() => this.onCancel()}
                />
                <MessageModal
                    show={message.show}
                    title={message.title}
                    bsSize="small"
                    buttonStyle={message.buttonStyle}
                    onOK={message.onOK}
                    onCancel={message.onCancel}
                >
                    {message.message}
                </MessageModal>
                <WaitingMessage show={waitingInfo.isWaiting} type={waitingInfo.waitingType} />
            </Content>
        );
    }    
}

// Which props do we want to inject, given the global state?
// Note: use https://github.com/faassen/reselect for better performance.
const mapStateToProps = (state) => {
    return {
        waitingInfo: state.waitingInfo,
        editedUnitImage: state.editedUnitImage,
        unitTypes: state.unitTypes
    };
};

//画面更新のアクションを設定します。
const mapDispatchToProps = (dispatch) => {
    return {
        setWaitingState: (isWaiting, type) => dispatch(setWaitingState(isWaiting, type)),
        setEditedUnitImage: (unitImage) => dispatch(setEditedUnitImage(unitImage)),
        setUnitImages: (unitImages) => dispatch(setUnitImages(unitImages))
    };
};

// Wrap the component to inject dispatch and state into it
export default connect(mapStateToProps, mapDispatchToProps)(ImageEditPanel);

 