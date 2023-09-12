/**
 * @license Copyright 2019 DENSO
 * 
 * 電気錠設定編集画面のReactコンポーネント
 * 
 */

'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import { browserHistory } from 'react-router';

import { Col, Row, Grid, ButtonToolbar, Radio } from 'react-bootstrap'

import Content from 'Common/Layout/Content';
import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';

import MessageModal from 'Assets/Modal/MessageModal';
import WaitingMessage from 'Assets/Modal/WaitingMessage';
import ElectricLockSettingEditBox from 'ElectricLockSetting/ElectricLockSettingEditBox';

import { setWaitingState } from 'WaitState/actions.js';
import { setDisplayState } from 'SearchResult/actions.js';
import { setLoadState, setLoadState_condition, setLoadState_result, setEditedERackSets } from './actions.js';

import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';
import { validateInteger, validateSelect, successResult, errorResult, VALIDATE_STATE } from 'inputCheck';
import { ELECTRIC_RACK_TARGET, KEY_TYPE_ID } from 'constant';

const NONE_VALIDATE_RESULT = { state: '', helpText: ''};

class ElectricLockSettingEditPanel extends Component {

    constructor(props){
        super(props);
        this.state = {
            message: {},
            targetERackSet: props.editedERackSets.length > 1 ?
                { lockedOpenErrOcBlindTime: null, lockedOpenErrRcBlindTime: null } : props.editedERackSets[0],
            inputCheck: props.editedERackSets.length > 1 ?                                
                {
                    lockedOpenErrOcBlindTime: {},
                    lockedOpenErrRcBlindTime: {}
                }
                :
                {
                    location: {},
                    target: {},
                    doorPoint: {},
                    keyPoint: {},
                    useOnValueAsDoorCloseValue: {},
                    useOnValueAsKeyLockValue: {},
                    lockedOpenErrOcBlindTime: {},
                    lockedOpenErrRcBlindTime: {}
                },
            checked: {},
            points: [],
            adjustToKeyPoint: true
        };
    }

    /**
     * コンポーネントがマウントされる前の処理
     * ここでsetState()をすると、renderは更新されたstateを参照する
     */
    componentWillMount() {
        this.setValidation(this.state.targetERackSet);
        this.loadPoints(this.state.targetERackSet.location);
    }

    /**
     * コンポーネントがマウントされた後の処理
     */
    componentDidMount() {
        garmitFrame.refresh();
    }

    /**
     * 保存ボタンクリック
     */
    handleSubmit() {
        const { editedERackSets } = this.props;
        const { targetERackSet } = this.state;
        const adjustInterval = editedERackSets.length == 1 && targetERackSet.lockType === KEY_TYPE_ID.electricKey && targetERackSet.keyPoint.recordInterval != targetERackSet.doorPoint.recordInterval;

        // 確認メッセージを表示
        this.setState({
            message: {
                show: true,
                buttonStyle: 'save',
                title: '保存',
                message: '編集内容を保存してよろしいですか？',
                bsSize: 'sm',
                showSelectOption: adjustInterval,
                onCancel: () => this.clearMessage(),
                onOK: () => {
                    this.clearMessage();
                    this.saveData(adjustInterval);
                }
            }
        });
    }

    /**
     * キャンセルボタンクリック時
     */
    handleCancel() {
        this.props.setEditedERackSets(null);
        browserHistory.goBack();
    }

    /**
     * 値が変更されたとき
     * @param {any} keyValuePairs
     */
    onEdit(keyValuePairs) {
        let eRackSet = Object.assign({}, this.state.targetERackSet);
        let inputCheck = Object.assign({}, this.state.inputCheck);

        keyValuePairs.forEach((pair) => {
            eRackSet[pair.key] = pair.val;
            if (pair.key in inputCheck) {
                inputCheck[pair.key] = this.checkValidation(pair.val, pair.key, eRackSet);
            }

            if (pair.key == 'location') {
                this.loadPoints(pair.val);                
            } else if (pair.key == 'keyPoint') {
                inputCheck.doorPoint = this.checkValidation(eRackSet.doorPoint, 'doorPoint', eRackSet);
                if (pair.val == null) {
                    eRackSet.useOnValueAsKeyLockValue = null;
                    inputCheck.useOnValueAsKeyLockValue = this.checkValidation(null, 'useOnValueAsKeyLockValue', eRackSet);
                }
            } else if (pair.key == 'doorPoint') {
                inputCheck.keyPoint = this.checkValidation(eRackSet.keyPoint, 'keyPoint', eRackSet);
                if (pair.val == null) {
                    eRackSet.useOnValueAsDoorCloseValue = null;
                    inputCheck.useOnValueAsDoorCloseValue = this.checkValidation(null, 'useOnValueAsDoorCloseValue', eRackSet);
                }
            }
        });

        // 値と入力チェックの更新
        this.setState({ targetERackSet: eRackSet, inputCheck: inputCheck });
    }

    /**
     * チェック状態が変化したとき
     * @param {any} checked
     * @param {any} key
     */
    onCheckChange(checked, key) {
        const newChecked = Object.assign({}, this.state.checked);
        newChecked[key] = checked;
        this.setState({ checked: newChecked });
    }

    /**
     * ポイントを読み込む
     * @param {any} location
     */
    loadPoints(location) {
        if (!location) {
            return;
        }
        
        const condition = { locations: [location] };
        this.props.setLoadState_condition(true);
        sendData(EnumHttpMethod.get, '/api/Point/getPointByLocation?locationId=' + location.locationId, null, (points, networkError) => {
            this.props.setLoadState_condition(false);
            this.setState({ points: points });
            if (networkError) {
                this.showNetWorkErrorMessage();
            }
        });
    }

    /**
     * 編集内容を保存する
     */
    saveData(adjustInterval) {
        const multiple = this.props.editedERackSets.length > 1;
        const url = multiple ? '/api/ElectricLockSetting/setERackSets' : '/api/ElectricLockSetting/setERackSet';
        const sendingData = multiple ? this.createSendingData() : Object.assign({}, this.state.targetERackSet);

        if (adjustInterval) {
            if (this.state.adjustToKeyPoint) {
                sendingData.doorPoint = Object.assign({}, sendingData.doorPoint, { recordInterval: sendingData.keyPoint.recordInterval });
            } else {
                sendingData.keyPoint = Object.assign({}, sendingData.keyPoint, { recordInterval: sendingData.doorPoint.recordInterval });
            }
        }

        if (!multiple && sendingData.lockType === KEY_TYPE_ID.physicalKey) {
            sendingData.target = ELECTRIC_RACK_TARGET.none;
            sendingData.keyPoint = null;
            sendingData.doorPoint = null;
            sendingData.useOnValueAsKeyLockValue = null;
            sendingData.useOnValueAsDoorCloseValue = null;
            sendingData.lockedOpenErrOcBlindTime = null;
            sendingData.lockedOpenErrRcBlindTime = null;
        }

        this.props.setWaitingState(true, 'save');
        sendData(EnumHttpMethod.post, url, sendingData, (result, networkError) => {
            this.props.setWaitingState(false);
            if (networkError) {
                this.showNetWorkErrorMessage();
            } else {
                this.setState({
                    message: {
                        show: true,
                        buttonStyle: 'message',
                        title: (result && result.isSuccess) ? '保存' : 'エラー',
                        message: result && result.message,
                        onCancel: () => {
                            this.clearMessage();
                            if (result && result.isSuccess) {
                                browserHistory.push('/Maintenance/ElectricLockSetting');
                                this.props.setEditedERackSets(null);
                                this.props.setDisplayState(null);
                            }
                        }
                    }
                });
            }
        });
    }

    /**
     * 送信するデータを生成する(一括)
     */
    createSendingData() {
        const { targetERackSet, checked } = this.state;

        const data = {};
        for (let key of Object.keys(targetERackSet)) {
            if (checked[key]) {
                data[key] = targetERackSet[key];
            }
        }

        return this.props.editedERackSets.map((eRackSet) => Object.assign({}, eRackSet, data));
    }

    /**
     * 入力チェック
     * @param {any} val
     * @param {any} key
     * @param {any} eRackSet
     */
    checkValidation(val, key, eRackSet) {
        const isPhysicalKey = (eRackSet.lockType === KEY_TYPE_ID.physicalKey);
        switch (key) {
            case 'location':
                return val ? successResult : errorResult('必須項目です');

            case 'lockedOpenErrOcBlindTime':
            case 'lockedOpenErrRcBlindTime':
                return isPhysicalKey ? NONE_VALIDATE_RESULT : validateInteger(val, 0, 2147483647, false);

            case 'keyPoint':
            case 'doorPoint':
                if (!isPhysicalKey) {
                    const { keyPoint, doorPoint } = eRackSet;
                    const inputCheck = {
                        keyPoint: validateSelect(keyPoint && keyPoint.pointNo),
                        doorPoint: validateSelect(doorPoint && doorPoint.pointNo)
                    };
                    if (inputCheck.keyPoint.state === VALIDATE_STATE.success && inputCheck.doorPoint.state === VALIDATE_STATE.success) {
                        if (keyPoint.pointNo === doorPoint.pointNo) {
                            return errorResult('電気錠ポイントとドアセンサポイントに同じポイントを指定することはできません');
                        }
                    }
                    return inputCheck[key];
                } else {
                    return NONE_VALIDATE_RESULT;
                }

            case 'target':
                return isPhysicalKey ? NONE_VALIDATE_RESULT : validateSelect(val);

            case 'useOnValueAsDoorCloseValue':
            case 'useOnValueAsKeyLockValue':
                return isPhysicalKey ? NONE_VALIDATE_RESULT : validateSelect(val != null && val.toString());

            default:
                return successResult;
        }
    }

    /**
     * 入力チェック状態をセットする
     * @param {any} eRackSet
     * @param {any} callback
     */
    setValidation(eRackSet, callback) {
        const inputCheck = Object.assign({}, this.state.inputCheck);

        for (let key of Object.keys(inputCheck)) {
            inputCheck[key] = this.checkValidation(eRackSet[key], key, eRackSet);
        }

        this.setState({ inputCheck: inputCheck });
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
     * メッセージをクリアする
     */
    clearMessage() {
        this.setState({ message: Object.assign({}, this.state.message, { show: false }) });
    }

    /**
     * 保存ボタンを使用可能かどうか
     */
    isEnableSave() {
        const { editedERackSets } = this.props;
        const { inputCheck, checked } = this.state;

        const bulk = editedERackSets && editedERackSets.length > 1;

        if (bulk) {
            if (!Object.keys(checked).some((k) => checked[k] == true)) {
                return false;
            }
        }

        return !Object.keys(inputCheck).some((k) => inputCheck[k].state == VALIDATE_STATE.error && (!bulk || checked[k]));
    }

    /**
     * render
     */
    render() {
        const { searchCondition, waitingInfo, isLoading, location, editedERackSets } = this.props;
        const { isReadOnly, level } = this.props.authentication;
        const { message, targetERackSet, inputCheck, points, checked, adjustToKeyPoint } = this.state;

        const bulk = editedERackSets && editedERackSets.length > 1;

        return (
            <Content>
                {(editedERackSets && targetERackSet) &&
                    <div>
                        <Grid fluid>
                            <Row className="mb-05">
                                <ButtonToolbar className="pull-right">
                                    <Button
                                        bsStyle="success"
                                        disabled={!this.isEnableSave() || isLoading.condition}
                                        onClick={() => this.handleSubmit()}
                                    >
                                        <Icon className="fal fa-save mr-05" />
                                        <span>保存</span>
                                    </Button>
                                    <Button
                                        iconId="uncheck"
                                        bsStyle="lightgray"
                                        onClick={() => this.handleCancel()}
                                    >
                                        キャンセル
                                </Button>
                                </ButtonToolbar>
                            </Row>
                        </Grid>
                        <ElectricLockSettingEditBox
                            bulk={bulk}
                            isLoading={isLoading.condition}
                            level={level}
                            mode={location.query.mode}
                            eRackSet={targetERackSet}
                            inputCheck={inputCheck}
                            lookUp={searchCondition.lookUp}
                            points={points}
                            checked={bulk && checked}
                            onEdit={(pairs) => this.onEdit(pairs)}
                            onCheckChange={(checked, key) => this.onCheckChange(checked,key)}
                        />
                        <MessageModal
                            show={message.show}
                            title={message.title}
                            bsSize="small"
                            buttonStyle={message.buttonStyle}
                            onOK={message.onOK}
                            onCancel={message.onCancel}
                        >
                        {message.message && message.message.split(/\r\n|\n/).map((str) => <div>{str}</div>)}
                        {message.showSelectOption &&
                            <div className="mt-1">
                                <div><strong>!!!注意!!!</strong></div>
                                <div>ポイントの収集周期が一致していません。</div>
                                <div>どちらに統一しますか？</div>
                                <Radio
                                    checked={adjustToKeyPoint}
                                    onClick={() => this.setState({ adjustToKeyPoint: true })}
                                >
                                    電気錠ポイント：
                                    {targetERackSet.keyPoint && targetERackSet.keyPoint.recordInterval / 1000}秒
                                </Radio>
                                <Radio
                                    checked={!adjustToKeyPoint}
                                    onClick={() => this.setState({ adjustToKeyPoint: false })}
                                >
                                    ドアポイント：
                                    {targetERackSet.doorPoint && targetERackSet.doorPoint.recordInterval / 1000}秒
                                </Radio>
                            </div>
                        }
                        </MessageModal>
                        <WaitingMessage show={waitingInfo.isWaiting} type={waitingInfo.waitingType} />
                    </div>
                }                
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
        searchCondition: state.searchCondition,
        editedERackSets: state.editedERackSets
    };
};

//画面更新のアクションを設定します。
const mapDispatchToProps = (dispatch) => {
    return {
        setWaitingState: (isWaiting, type) => dispatch(setWaitingState(isWaiting, type)),
        setDisplayState: (setting) => dispatch(setDisplayState(setting)),
        setLoadState: (isLoading) => dispatch(setLoadState(isLoading)),
        setLoadState_condition: (isLoading) => dispatch(setLoadState_condition(isLoading)),
        setLoadState_result: (isLoading) => dispatch(setLoadState_result(isLoading)),
        setEditedERackSets: (eRackSets) => dispatch(setEditedERackSets(eRackSets))
    };
};

// Wrap the component to inject dispatch and state into it
export default connect(mapStateToProps, mapDispatchToProps)(ElectricLockSettingEditPanel);

 