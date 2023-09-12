/**
 * @license Copyright 2017 DENSO
 * 
 * 画像一覧画面のReactコンポーネント
 * 
 */

'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';

import { Grid, Row, Col } from 'react-bootstrap';

import Content from 'Common/Layout/Content';
import Box from 'Common/Layout/Box';
import BoxColseButton from 'Common/Widget/BoxColseButton';

import MessageModal from 'Assets/Modal/MessageModal';
import WaitingMessage from 'Assets/Modal/WaitingMessage';

import ImageListBox from 'Image/ImageListBox';
import UnitTypeListBox from 'Image/UnitTypeListBox';
import UnitTypeEditModal from 'Image/UnitTypeEditModal';

import { setAuthentication } from 'Authentication/actions.js';
import { changeLoadState } from 'LoadState/actions.js';
import { setWaitingState } from 'WaitState/actions.js';
import { setUnitImages, setUnitTypes, setEditedUnitImage } from './actions.js';

import { FUNCTION_ID_MAP, LAVEL_TYPE, getAuthentication } from 'authentication';　　
import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';

class ImageListPanel extends Component {

    constructor(){
        super();
        this.state = {
            message: {},
        };
    }

    componentDidMount() {
        if (this.props.unitImages) {
            return;
        }

        this.loadAuthentication(() => {
            this.loadUnitImages(() => {
                this.loadUnitTypes();
            });
        });
    }

    /**
     * 権限情報を読み込む
     */
    loadAuthentication(callback) {
        this.props.changeLoadState();
        getAuthentication(FUNCTION_ID_MAP.imageEdit, (auth) => {
            this.props.changeLoadState();
            this.props.setAuthentication(auth);

            if (callback) {
                callback();
            }
        });
    }

    /**
     * ユニット画像を取得する
     */
    loadUnitImages(callback) {
        this.props.changeLoadState();
        sendData(EnumHttpMethod.get, '/api/image/getUnitImages', null, (data, networkError) => {
            this.props.changeLoadState();
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
     * ユニット種別を取得する
     */
    loadUnitTypes(callback) {
        this.props.changeLoadState();
        sendData(EnumHttpMethod.get, '/api/unitType/getUnitTypes', null, (data, networkError) => {
            this.props.changeLoadState();
            if (data) {
                this.props.setUnitTypes(data);
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
     * 空のユニット画像情報を読み込む
     */
    loadNewUnitImage(callback) {
        this.props.changeLoadState();
        sendData(EnumHttpMethod.get, '/api/image/NewUnitImage', null, (unitImage, networkError) => {
            this.props.changeLoadState();
            if (unitImage) {
                this.props.setEditedUnitImage(unitImage);
            }
            if (networkError) {
                this.showNetWorkErrorMessage();
            }
            if (callback) {
                callback(unitImage, networkError);
            }
        });
    }

    /**
     * ユニット画像を削除する
     * @param {any} unitImages
     */
    deleteImages(unitImages) {
        this.props.setWaitingState(true, 'delete');
        sendData(EnumHttpMethod.post, '/api/image/DeleteUnitImages', unitImages, (result, networkError) => {
            this.props.setWaitingState(false);
            if (result) {
                this.setState({
                    message: {
                        show: true,
                        buttonStyle: 'message',
                        title: '削除',
                        message: result.message,
                        onCancel: () => this.clearMessage()
                    }
                });
                if (result.isSuccess) {
                    this.loadUnitImages();
                }   
            }
            if (networkError) {
                this.showNetWorkErrorMessage();
            }
        });
    }

    /**
     * 空のユニット種別を読み込む
     */
    loadNewUnitType(callback) {
        this.props.changeLoadState();
        sendData(EnumHttpMethod.get, '/api/unitType/NewUnitType', null, (unitType, networkError) => {
            this.props.changeLoadState();
            if (networkError) {
                this.showNetWorkErrorMessage();
            }
            if (callback) {
                callback(unitType, networkError);
            }
        });
    }

    /**
     * ユニット種別を保存する
     * @param {any} unitType
     */
    saveUnitType(unitType) {
        this.props.setWaitingState(true, 'save');
        sendData(EnumHttpMethod.post, '/api/unitType/setUnitType', unitType, (result, networkError) => {
            this.props.setWaitingState(false);
            if (result) {
                this.setState({
                    message: {
                        show: true,
                        buttonStyle: 'message',
                        title: 'ユニット種別保存',
                        message: result.message,
                        onCancel: () => {
                            this.clearMessage();
                            if (result.isSuccess) {
                                this.loadUnitImages(() => {
                                    this.loadUnitTypes();
                                });
                                this.setState({ showUnitTypeEditModal: false });
                            }
                        }
                    }
                });
            }
            if (networkError) {
                this.showNetWorkErrorMessage();
            }
        });
    }

    /**
     * ユニット種別を削除する
     * @param {any} typeId
     */
    deleteUnitType(typeId) {
        this.props.setWaitingState(true, 'delete');
        sendData(EnumHttpMethod.get, '/api/unitType/deleteUnitType?typeId=' + typeId, null, (result, networkError) => {
            this.props.setWaitingState(false);
            if (result) {
                this.setState({
                    message: {
                        show: true,
                        buttonStyle: 'message',
                        title: 'ユニット種別削除',
                        message: result.message,
                        onCancel: () => this.clearMessage()
                    }
                });
                if (result.isSuccess) {
                    this.loadUnitTypes();
                }
            }
            if (networkError) {
                this.showNetWorkErrorMessage();
            }
        });
    }

    /**
     * 複数のユニット種別を削除する
     * @param {any} typeIds
     */
    deleteUnitTypes(typeIds) {
        this.props.setWaitingState(true, 'delete');
        sendData(EnumHttpMethod.post, '/api/unitType/deleteUnitTypes', typeIds, (result, networkError) => {
            this.props.setWaitingState(false);
            if (result) {
                this.setState({
                    message: {
                        show: true,
                        buttonStyle: 'message',
                        title: 'ユニット種別削除',
                        message: result.message && result.message.split(/\r\n|\r|\n/).map((line) => <div>{line}</div>),
                        onCancel: () => this.clearMessage()
                    }
                });
                if (result.isSuccess) {
                    this.loadUnitTypes();
                }
            }
            if (networkError) {
                this.showNetWorkErrorMessage();
            }
        });
    }

    /**
     * 編集ボタンクリックイベント
     * @param {any} unitImage
     */
    onEditClick(unitImage) {
        // 編集する画像をセット
        this.props.setEditedUnitImage(unitImage);
        browserHistory.push({ pathname: '/Maintenance/Image/Edit', query: { mode: 'edit' } });
    }

    /**
     * 削除ボタンクリックイベント
     * @param {any} unitImages
     */
    onDeleteClick(unitImages) {
        this.setState({
            message: {
                show: true,
                buttonStyle: 'delete',
                title: '削除',
                message: 'ユニット画像を削除しますか？',
                onOK: () => {
                    this.clearMessage();
                    this.deleteImages(unitImages);
                },
                onCancel: () => this.clearMessage()
            }
        });
    }

    /**
     * 追加ボタンクリック時
     */
    onAddClick() {
        this.loadNewUnitImage((unitImage, networkError) => {
            if (!networkError) {
                browserHistory.push({ pathname: '/Maintenance/Image/Edit', query: { mode: 'add' } });
            }
        });
    }

    /**
     * ユニット種別の保存ボタンがクリックされた時
     * @param {any} unitType
     */
    onSaveUnitTypeClick(unitType) {
        this.setState({
            message: {
                show: true,
                buttonStyle: 'save',
                title: '保存',
                message: '編集内容を保存しますか？',
                onOK: () => {
                    this.clearMessage();
                    this.saveUnitType(unitType)
                },
                onCancel: () => this.clearMessage()
            }
        });
    }

    /**
     * ユニット種別の編集ボタンがクリックされた時
     * @param {any} unitType
     */
    onEditUnitTypeClick(unitType) {
        this.setState({ editedUnitType: unitType, showUnitTypeEditModal: true });
    }

    /**
     * ユニット種別の追加ボタンがクリックされた時
     */
    onAddUnitTypeClick() {
        this.loadNewUnitType((unitType, networkError) => {
            if (!networkError) {
                this.setState({ editedUnitType: unitType, showUnitTypeEditModal: true });
            }
        });
    }

    /**
     * ユニット種別の削除ボタンがクリックされた時
     * @param {any} unitTypes
     */
    onDeleteUnitTypesClick(typeIds) {
        this.setState({
            message: {
                show: true,
                buttonStyle: 'delete',
                title: '削除',
                message: 'ユニット種別を削除しますか？',
                onOK: () => {
                    this.clearMessage();
                    if (typeIds.length == 1) {
                        this.deleteUnitType(typeIds[0]);
                    } else {
                        this.deleteUnitTypes(typeIds);
                    }
                },
                onCancel: () => this.clearMessage()
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
        const { unitImages, unitTypes, isLoading, waitingInfo } = this.props;
        const { message, showUnitTypeEditModal, editedUnitType } = this.state;

        return (
            <Content>
                <Grid fluid>
                    <Row>
                        <Col sm={9}>
                            <ImageListBox
                                isLoading={isLoading}
                                unitImages={unitImages}
                                onEditClick={(unitImage) => this.onEditClick(unitImage)}
                                onDeleteClick={(unitImages) => this.onDeleteClick(unitImages)}
                                onAddClick={() => this.onAddClick()}
                            />
                        </Col>
                        <Col sm={3}>
                            <UnitTypeListBox
                                isLoading={isLoading}
                                unitTypes={unitTypes}
                                onEditClick={(unitType) => this.onEditUnitTypeClick(unitType)}
                                onDeleteClick={(typeIds) => this.onDeleteUnitTypesClick(typeIds)}
                                onAddClick={() => this.onAddUnitTypeClick()}
                            />
                        </Col>
                    </Row>
                </Grid>
                <UnitTypeEditModal
                    unitTypes={unitTypes}
                    unitType={editedUnitType}
                    showModal={showUnitTypeEditModal}
                    onSubmit={(unitType) => this.onSaveUnitTypeClick(unitType)}
                    onCancel={() => this.setState({ showUnitTypeEditModal: false })}
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
        authentication: state.authentication,
        isLoading: state.isLoading,
        waitingInfo: state.waitingInfo,
        unitImages: state.unitImages,
        unitTypes: state.unitTypes
    };
};

//画面更新のアクションを設定します。
const mapDispatchToProps = (dispatch) => {
    return {
        setAuthentication: (auth) => dispatch(setAuthentication(auth)),
        changeLoadState: () => dispatch(changeLoadState()),
        setWaitingState: (isWaiting, type) => dispatch(setWaitingState(isWaiting, type)),
        setUnitImages: (unitImages) => dispatch(setUnitImages(unitImages)),
        setUnitTypes: (unitTypes) => dispatch(setUnitTypes(unitTypes)),
        setEditedUnitImage: (unitImage) => dispatch(setEditedUnitImage(unitImage))      
    };
};

// Wrap the component to inject dispatch and state into it
export default connect(mapStateToProps, mapDispatchToProps)(ImageListPanel);

 