/**
 * @license Copyright 2019 DENSO
 * 
 * デマンド設定画面のReactコンポーネント
 * 
 */

'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import { browserHistory } from 'react-router';

import { Col, Row, Grid, ButtonToolbar } from 'react-bootstrap'

import Content from 'Common/Layout/Content';
import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';

import MessageModal from 'Assets/Modal/MessageModal';
import WaitingMessage from 'Assets/Modal/WaitingMessage';

import DemandSettingEditBox from 'DemandSetting/DemandSettingEditBox';
import TriggerSettingBox from 'DemandSetting/TriggerSettingBox';
import SocPointSettingBox from 'DemandSetting/SocPointSettingBox';

import { setDisplayState } from 'SearchResult/actions.js';
import { setWaitingState } from 'WaitState/actions.js';
import { setEditedDemandSets, setLoadState_condition } from './actions.js';

import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';
import { validateReal, validateSelect, successResult, errorResult, VALIDATE_STATE } from 'inputCheck';
import { isSocTrigger } from 'demandSetUtility';

class DemandSettingEditPanel extends Component {

    constructor(props){
        super(props);
        this.state = {
            message: {},
            targetDemandSet: this.props.editedDemandSets[0],
            inputCheck: {
                location: {},
                contractPower: {},
                targetEnergy: {},
                triggerThresholds: []
            },
            points: []
        };
    }

    /**
     * コンポーネントがマウントされる前の処理
     * ここでsetState()をすると、renderは更新されたstateを参照する
     */
    componentWillMount() {
        this.setValidation(this.state.targetDemandSet);
        this.loadPoints(this.state.targetDemandSet.location);
    }

    /**
     * コンポーネントがマウントされた後の処理
     */
    componentDidMount() {
        garmitFrame.refresh();
    }

    /**
     * コンポーネントが新しいPropsを受け取ったとき
     * @param {any} nextProps
     */
    componentWillReceiveProps(nextProps) {
        if (nextProps.editedDemandSets && nextProps.editedDemandSets.length > 0 && nextProps.editedDemandSets != this.props.editedDemandSets) {
            this.setState({ targetDemandSet: nextProps.editedDemandSets[0] });
            this.setValidation(nextProps.editedDemandSets[0]);
        }
    }


    /**
     * 送信するデータを生成する
     * @param {any} demandSet
     */
    createPostData(demandSet) {
        const postData = Object.assign({}, demandSet);

        postData.triggerThresholds = postData.triggerThresholds.map((tt) => Object.assign({}, tt, { locationId: postData.location.locationId }));

        return postData;
    }

    /**
     * ポイントを読み込む
     * @param {any} location
     */
    loadPoints(location) {
        if (!location) {
            return;
        }

        this.props.setLoadState_condition(true);
        sendData(EnumHttpMethod.get, '/api/Point/getSocPoints?locationId=' + location.locationId, null, (points, networkError) => {
            this.props.setLoadState_condition(false);
            if (points) {
                this.setState({ points: points });
            }
            if (networkError) {
                this.showNetWorkErrorMessage();
            }
        });
    }

    /**
     * デマンド設定を読み込む
     * @param {any} location
     */
    loadDemandSet(location, callback) {
        this.props.setLoadState_condition(true);
        sendData(EnumHttpMethod.get, '/api/DemandSetting/getDemandSet?locationId=' + location.locationId, null, (demandSet, networkError) => {
            this.props.setEditedDemandSets(demandSet ? [demandSet] : null);
            this.props.setLoadState_condition(false);
            if (!demandSet) {
                if (networkError) {
                    this.showNetWorkErrorMessage();
                } else {
                    this.showErrorMessage('デマンド設定の呼び出しに失敗しました。');
                }
            }
            if (callback) {
                callback();
            }
        });
    }

    /**
     * 編集内容を保存する
     * @param {any} value
     */
    saveData(value) {
        const isArray = Array.isArray(value);
        const url = isArray ? '/api/DemandSetting/setDemandSets' : '/api/DemandSetting/setDemandSet';
        const postData = isArray ? value.map((v) => this.createPostData(v)) : this.createPostData(value);

        this.props.setWaitingState(true, 'save');
        sendData(EnumHttpMethod.post, url, postData, (result, networkError) => {
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
                        bsSize: (result && result.isSuccess) && 'sm',
                        onCancel: () => {
                            this.clearMessage();
                            if (result && result.isSuccess) {
                                browserHistory.push('/Maintenance/DemandSetting');
                                this.props.setEditedDemandSets(null);
                                this.props.setDisplayState(null);
                            }
                        }
                    }
                });
            }
        });
    }

    /**
     * 保存ボタンクリック
     */
    handleSubmit() {
        // 確認メッセージを表示
        this.setState({
            message: {
                show: true,
                buttonStyle: 'save',
                title: '保存',
                message: '編集内容を保存してよろしいですか？',
                bsSize: 'sm',
                onCancel: () => this.clearMessage(),
                onOK: () => {
                    this.clearMessage();
                    this.saveData(this.state.targetDemandSet);
                }
            }
        });
    }

    /**
     * キャンセルボタンクリック時
     */
    handleCancel() {
        this.props.setEditedDemandSets(null);
        browserHistory.goBack();
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
     * 値が変更されたとき
     * @param {any} val
     * @param {any} key
     */
    onEdit(keyValuePairs) {
        let demandSet = Object.assign({}, this.state.targetDemandSet);
        let inputCheck = Object.assign({}, this.state.inputCheck);

        keyValuePairs.forEach((pair) => {
            demandSet[pair.key] = pair.val;
            if (pair.key in inputCheck) {
                inputCheck[pair.key] = this.checkValidation(pair.val, pair.key);
            }

            if (pair.key == 'location') {
                this.loadPoints(pair.val);
                demandSet.triggerThresholds = demandSet.triggerThresholds.filter((tt) => !isSocTrigger(tt.triggerType.triggerId));
                inputCheck.triggerThresholds = this.checkValidation(demandSet.triggerThresholds, 'triggerThresholds');
            }
        });

        // 値と入力チェックの更新
        this.setState({ targetDemandSet: demandSet, inputCheck: inputCheck });
    }

    /**
     * トリガー設定が変更された時
     * @param {any} tts
     */
    onTriggerSettingChange(tts) {
        const socPointSetting = this.state.targetDemandSet.triggerThresholds.filter((tt) => isSocTrigger(tt.triggerType.triggerId));
        const triggerThresholds = tts.concat(socPointSetting);
        this.onEdit([{ key: 'triggerThresholds', val: triggerThresholds }]);
    }

    /**
     * SOCポイント設定が変更された時
     * @param {any} tts
     */
    onSocPointSettingChange(tts) {
        const triggerSetting = this.state.targetDemandSet.triggerThresholds.filter((tt) => !isSocTrigger(tt.triggerType.triggerId));
        const triggerThresholds = triggerSetting.concat(tts);
        this.onEdit([{ key: 'triggerThresholds', val: triggerThresholds }]);
    }

    /**
     * 入力チェック
     * @param {any} val
     * @param {any} key
     */
    checkValidation(val, key) {
        switch (key) {
            case 'location':
                return val ? (val.hasDemandSet ? errorResult('既にデマンド設定が登録されています') : successResult) : errorResult('必須項目です');

            case 'contractPower':
            case 'targetEnergy':
                return validateReal(val, 0, 999999, true);

            case 'triggerThresholds':
                return this.validateTriggerThresholds(val);
        }
    }

    /**
     * 入力チェック状態をセットする
     * @param {any} demandSet
     * @param {any} callback
     */
    setValidation(demandSet, callback) {
        let inputCheck = Object.assign({}, this.state.inputCheck);

        for (let key of Object.keys(inputCheck)) {
            inputCheck[key] = this.checkValidation(demandSet[key], key);
        }

        this.setState({ inputCheck: inputCheck });
    }

    /**
     * 保存ボタンを使用可能かどうか
     */
    isEnableSave() {
        const { inputCheck } = this.state;
        for (let k of Object.keys(inputCheck)) {
            if (k == 'triggerThresholds') {
                if (inputCheck[k].some((item) => item.pointNo.state == VALIDATE_STATE.error || item.threshold.state == VALIDATE_STATE.error)) {
                    return false;
                }
            }

            if (inputCheck[k].state == VALIDATE_STATE.error) {
                return false;
            }
        }
        return true;
    }

    /**
     * トリガー閾値の入力を検証する
     * @param {any} val
     */
    validateTriggerThresholds(val) {
        return val.map((tt) => ({
            triggerId: tt.triggerType.triggerId,
            pointNo: isSocTrigger(tt.triggerType.triggerId) ? validateSelect(tt.pointNo) : successResult,
            threshold: validateReal(tt.threshold, 0, 999999, !tt.inUseTriggerControl)
        }));
    }

    /**
     * render
     */
    render() {
        const { level } = this.props.authentication;
        const { editedDemandSets, searchCondition, location, waitingInfo, isLoading } = this.props;
        const { message, inputCheck, targetDemandSet, points } = this.state;

        return (
            <Content>
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
                {targetDemandSet && 
                    <DemandSettingEditBox
                        isLoading={isLoading.condition}
                        level={level}
                        mode={location.query.mode}
                        demandSet={targetDemandSet}                        
                        lookUp={searchCondition.lookUp}
                        points={points}
                        inputCheck={inputCheck}
                        onEdit={(pairs) => this.onEdit(pairs)}
                        onSelectLoadDemandSet={(loc) => {
                            this.loadDemandSet(loc);
                            this.loadPoints(loc);
                        }}
                    />
                }
                <TriggerSettingBox
                    isLoading={isLoading.condition}
                    triggerThresholds={targetDemandSet.triggerThresholds.filter((tt) => !isSocTrigger(tt.triggerType.triggerId))}
                    inputCheck={inputCheck && inputCheck.triggerThresholds.filter((item) => !isSocTrigger(item.triggerId))}
                    onEdit={(tts) => this.onTriggerSettingChange(tts)}
                />
                <SocPointSettingBox
                    isLoading={isLoading.condition}
                    triggerThresholds={targetDemandSet.triggerThresholds.filter((tt) => isSocTrigger(tt.triggerType.triggerId))}
                    inputCheck={inputCheck && inputCheck.triggerThresholds.filter((item) => isSocTrigger(item.triggerId))}
                    onEdit={(tts) => this.onSocPointSettingChange(tts)}
                    points={points}
                    triggerTypes={searchCondition.lookUp.triggerTypes.filter((type) => isSocTrigger(type.triggerId))}
                />
                <MessageModal
                    show={message.show}
                    title={message.title}
                    bsSize={message.bsSize}
                    buttonStyle={message.buttonStyle}
                    onOK={message.onOK}
                    onCancel={message.onCancel}
                >
                    {message.message && message.message.split(/\r\n|\n/).map((str) => <div>{str}</div>)}
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
        waitingInfo: state.waitingInfo,
        searchCondition: state.searchCondition,
        editedDemandSets: state.editedDemandSets,
        isLoading: state.isLoading
    };
};

//画面更新のアクションを設定します。
const mapDispatchToProps = (dispatch) => {
    return {
        setWaitingState: (isWaiting, type) => dispatch(setWaitingState(isWaiting, type)),
        setEditedDemandSets: (demandSets) => dispatch(setEditedDemandSets(demandSets)),
        setDisplayState: (setting) => dispatch(setDisplayState(setting)),
        setLoadState_condition: (isLoading) => dispatch(setLoadState_condition(isLoading))
    };
};

// Wrap the component to inject dispatch and state into it
export default connect(mapStateToProps, mapDispatchToProps)(DemandSettingEditPanel);

 