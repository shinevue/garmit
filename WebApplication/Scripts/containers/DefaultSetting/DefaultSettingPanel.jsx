/**
 * @license Copyright 2017 DENSO
 * 
 * サンプル画面のReactコンポーネント
 * 
 */

'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import { Grid, Row, Col, ButtonToolbar } from 'react-bootstrap';

import Content from 'Common/Layout/Content';
import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';

import MessageModal from 'Assets/Modal/MessageModal';
import WaitingMessage from 'Assets/Modal/WaitingMessage';

import PointSettingBox from 'DefaultSetting/PointSettingBox';
import RackSettingBox from 'DefaultSetting/RackSettingBox';

import { setAuthentication } from 'Authentication/actions.js';
import { changeLoadState } from 'LoadState/actions.js';
import { setWaitingState } from 'WaitState/actions.js';
import { setSystemSet, setDataTypes } from './actions.js';

import { FUNCTION_ID_MAP, LAVEL_TYPE, getAuthentication } from 'authentication';　　
import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';
import { validateSelect, validateInteger, validateReal, validateText, validateFormatString, successResult, errorResult, VALIDATE_STATE } from 'inputCheck';

const INPUTCHECK_KEYS_DATATYPE = [
    'defaultUpperError',
    'defaultUpperAlarm',
    'defaultLowerAlarm',
    'defaultLowerError',
    'defaultErrorOcBlindTime',
    'defaultAlarmOcBlindTime',
    'defaultErrorRcBlindTime',
    'defaultAlarmRcBlindTime',
    'defaultUnit',
    'defaultFormat'
];

const INPUTCHECK_KEYS_SYSTEMSET = [
    'rackLoadAlarmPercentage'
];

const MAX_LENGTH_DATATYPE = {
    defaultUnit: 10,
    defaultFormat: 10
};

class DefaultSettingPanel extends Component {

    constructor(props){
        super(props);
        this.state = {
            message: {},
            inputCheck: {},
            saving: false
        };
    }

    componentDidMount() {
        this.loadAuthentication(() => {
            this.loadSetting();
        });
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.dataTypes !== nextProps.dataTypes) {
            this.setState({ dataTypes: nextProps.dataTypes });
            this.initDataTypesValidation(nextProps.dataTypes);
        }
        if (this.props.systemSet !== nextProps.systemSet) {
            this.setState({ systemSet: nextProps.systemSet });
            this.initSystemSetValidation(nextProps.systemSet);
        }
    }

    /**
     * 保存ボタンがクリックされた時
     */
    onSaveClick() {
        this.setState({
            message: {
                show: true,
                buttonStyle: 'save',
                title: '保存',
                message: 'デフォルト設定を保存します。よろしいですか？',
                onOK: () => {
                    this.clearMessage();
                    this.saveSetting();
                },
                onCancel: () => this.clearMessage()
            }
        })
    }

    /**
     * データ種別が編集された時
     * @param {any} val
     * @param {any} index
     * @param {any} key
     */
    onDataTypesEdit(val, index, key) {
        const dataTypes = this.state.dataTypes.slice();
        const dataType = Object.assign({}, dataTypes[index]);
        dataType[key] = val;
        dataTypes[index] = dataType;

        const inputCheck = Object.assign({}, this.state.inputCheck);
        const inputCheck_dataTypes = inputCheck.dataTypes.slice();
        const inputCheck_dataType = Object.assign({}, inputCheck_dataTypes[index]);

        if (['defaultUpperError', 'defaultUpperAlarm', 'defaultLowerAlarm', 'defaultLowerError'].indexOf(key) >= 0) {
            inputCheck_dataType.defaultUpperError = this.checkDataTypeValidation(dataType.defaultUpperError, 'defaultUpperError', dataType);
            inputCheck_dataType.defaultUpperAlarm = this.checkDataTypeValidation(dataType.defaultUpperAlarm, 'defaultUpperAlarm', dataType);
            inputCheck_dataType.defaultLowerAlarm = this.checkDataTypeValidation(dataType.defaultLowerAlarm, 'defaultLowerAlarm', dataType);
            inputCheck_dataType.defaultLowerError = this.checkDataTypeValidation(dataType.defaultLowerError, 'defaultLowerError', dataType);
        }
        else {
            inputCheck_dataType[key] = this.checkDataTypeValidation(val, key, dataType);
        }

        inputCheck_dataTypes[index] = inputCheck_dataType;
        inputCheck.dataTypes = inputCheck_dataTypes;

        this.setState({ dataTypes: dataTypes, inputCheck: inputCheck });
    }

    /**
     * システム設定が変更された時
     * @param {any} val
     * @param {any} key
     */
    onSystemSetEdit(val, key) {
        const systemSet = Object.assign({}, this.state.systemSet);
        systemSet[key] = val;

        const inputCheck = Object.assign({}, this.state.inputCheck);
        const inputCheck_systemSet = Object.assign({}, inputCheck.systemSet);
        inputCheck_systemSet[key] = this.checkSystemSetValidation(val, key);

        inputCheck.systemSet = inputCheck_systemSet;

        this.setState({ systemSet: systemSet, inputCheck: inputCheck });        
    }

    /**
     * 設定をロードする
     */
    loadSetting(callback) {
        this.props.changeLoadState();
        sendData(EnumHttpMethod.get, '/api/setting/getSetting', null, (info, networkError) => {
            this.props.changeLoadState();
            if (info) {
                this.props.setSystemSet(info.systemSet);
                this.props.setDataTypes(info.dataTypes);
            }
            if (networkError) {
                this.showNetWorkErrorMessage();
            }
            if (callback) {
                callback(info);
            }
        });
    }

    /**
     * 権限情報を読み込む
     */
    loadAuthentication(callback) {
        this.props.changeLoadState();
        getAuthentication(FUNCTION_ID_MAP.defaultSetting, (auth) => {
            this.props.changeLoadState();
            this.props.setAuthentication(auth);

            if (callback) {
                callback(auth);
            }
        });
    }

    /**
     * デフォルト設定を保存する
     */
    saveSetting() {
        const sendingData = { systemSet: this.state.systemSet, dataTypes: this.state.dataTypes };
        this.props.setWaitingState(true, 'save');
        sendData(EnumHttpMethod.post, '/api/setting/setDefaultSetting', sendingData, (result, networkError) => {
            this.props.setWaitingState(false);
            if (!networkError) {
                if (result) {
                    this.loadSetting();
                }
                this.setState({
                    message: {
                        show: true,
                        buttonStyle: 'message',
                        title: '保存',
                        message: result ? 'デフォルト設定を保存しました。' : 'デフォルト設定の保存に失敗しました。',
                        onCancel: () => this.clearMessage()
                    }
                });
            } else {
                this.showNetWorkErrorMessage();
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
     * データ種別の入力チェックを初期化する
     * @param {any} dataTypes
     */
    initDataTypesValidation(dataTypes) {
        const inputCheck = Object.assign({}, this.state.inputCheck);
        inputCheck.dataTypes = dataTypes.map((dataType) => {
            const obj = {};
            INPUTCHECK_KEYS_DATATYPE.forEach((key) => {
                obj[key] = this.checkDataTypeValidation(dataType[key], key, dataType);
            });

            return obj;
        });

        this.setState({ inputCheck: inputCheck });
    }

    /**
     * システム設定の入力チェックを初期化する
     * @param {any} systemSet
     */
    initSystemSetValidation(systemSet) {
        const inputCheck = Object.assign({}, this.state.inputCheck);

        const obj = {};
        INPUTCHECK_KEYS_SYSTEMSET.forEach((key) => {
            obj[key] = this.checkSystemSetValidation(systemSet[key], key);
        });

        inputCheck.systemSet = obj;

        this.setState({ inputCheck: inputCheck });
    }

    /**
     * データ種別の入力チェックをする
     * @param {any} val
     * @param {any} key
     * @param {any} dataType
     */
    checkDataTypeValidation(val, key, dataType) {
        switch (key) {
            case 'defaultUpperError':
            case 'defaultUpperAlarm':
            case 'defaultLowerAlarm':
            case 'defaultLowerError':
                return this.validateThreshold(val, key, dataType);

            case 'defaultErrorOcBlindTime':
            case 'defaultAlarmOcBlindTime':
            case 'defaultErrorRcBlindTime':
            case 'defaultAlarmRcBlindTime':
                return validateInteger(val, 0, 2147483647, true);

            case 'defaultUnit':
                return validateText(val, MAX_LENGTH_DATATYPE.defaultUnit, true);

            case 'defaultFormat':
                return validateFormatString(val, MAX_LENGTH_DATATYPE.defaultFormat, false);
        }
    }

    /**
     * システム設定の入力チェックをする
     * @param {any} val
     * @param {any} key
     */
    checkSystemSetValidation(val, key) {
        switch (key) {
            case 'rackLoadAlarmPercentage':
                return validateInteger(val, 0, 100, false);
        }
    }

    /**
     * 閾値の入力チェックをする
     * @param {any} val
     * @param {any} key
     * @param {any} dataType
     */
    validateThreshold(val, key, dataType) {
        if (val == null || val == '') {
            return successResult;
        }

        const validation = validateReal(val, -999999, 999999, true);
        if (validation.state === VALIDATE_STATE.error) {
            return validation;
        }

        if (this.isValidOrder(dataType)) {
            return successResult;
        } else {
            return errorResult('');
        }
    }

    /**
     * 閾値の順序が正しいか
     * @param {any} dataType
     */
    isValidOrder(dataType) {
        if (parseFloat(dataType.defaultUpperError) <= parseFloat(dataType.defaultUpperAlarm)) return false;
        if (parseFloat(dataType.defaultUpperError) <= parseFloat(dataType.defaultLowerAlarm)) return false;
        if (parseFloat(dataType.defaultUpperError) <= parseFloat(dataType.defaultLowerError)) return false;
        if (parseFloat(dataType.defaultUpperAlarm) <= parseFloat(dataType.defaultLowerAlarm)) return false;
        if (parseFloat(dataType.defaultUpperAlarm) <= parseFloat(dataType.defaultLowerError)) return false;
        if (parseFloat(dataType.defaultLowerAlarm) <= parseFloat(dataType.defaultLowerError)) return false;
        return true;
    }

    /**
     * 入力エラーがあるか
     */
    hasError() {
        const inputCheck = this.state.inputCheck;

        if (inputCheck.dataTypes) {
            for (let i = 0; i < inputCheck.dataTypes.length; i++) {
                const dataType = inputCheck.dataTypes[i];
                for (let j = 0; j < INPUTCHECK_KEYS_DATATYPE.length; j++) {
                    if (dataType[INPUTCHECK_KEYS_DATATYPE[j]].state === VALIDATE_STATE.error) {
                        return true;
                    }
                }
            }
        }

        if (inputCheck.systemSet) {
            for (let i = 0; i < INPUTCHECK_KEYS_SYSTEMSET.length; i++) {
                if (inputCheck.systemSet[INPUTCHECK_KEYS_SYSTEMSET[i]].state === VALIDATE_STATE.error) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * render
     */
    render() {
        const { isLoading, authentication, waitingInfo } = this.props;
        const { message, systemSet, dataTypes, inputCheck } = this.state;

        const isReadOnly = authentication.isReadOnly || authentication.level !== LAVEL_TYPE.administrator;

        return (
            <Content>
                {!isReadOnly &&
                    <div className="clearfix mb-05">
                        <ButtonToolbar className="pull-right">
                            <Button
                                bsStyle="success"
                                onClick={() => this.onSaveClick()}
                                disabled={this.hasError() || isLoading}
                            >
                                <Icon className="fal fa-save mr-05" />
                                <span>保存</span>
                            </Button>
                        </ButtonToolbar>
                    </div>
                }
                <PointSettingBox
                    isLoading={isLoading}
                    isReadOnly={isReadOnly}
                    dataTypes={dataTypes}
                    maxlength={MAX_LENGTH_DATATYPE}
                    inputCheck={inputCheck && inputCheck.dataTypes}
                    onEdit={(val, i, key) => this.onDataTypesEdit(val, i, key)}
                />
                <RackSettingBox
                    isReadOnly={isReadOnly}
                    isLoading={isLoading}
                    systemSet={systemSet}
                    inputCheck={inputCheck && inputCheck.systemSet}
                    onEdit={(val, key) => this.onSystemSetEdit(val, key)}
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
        systemSet: state.systemSet,
        dataTypes: state.dataTypes        
    };
};

//画面更新のアクションを設定します。
const mapDispatchToProps = (dispatch) => {
    return {
        setAuthentication: (auth) => dispatch(setAuthentication(auth)),
        changeLoadState: () => dispatch(changeLoadState()),
        setWaitingState: (isWaiting, waitingType) => dispatch(setWaitingState(isWaiting, waitingType)),
        setSystemSet: (systemSet) => dispatch(setSystemSet(systemSet)),
        setDataTypes: (dataTypes) => dispatch(setDataTypes(dataTypes))       
    };
};

// Wrap the component to inject dispatch and state into it
export default connect(mapStateToProps, mapDispatchToProps)(DefaultSettingPanel);

 