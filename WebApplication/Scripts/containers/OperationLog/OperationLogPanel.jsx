/**
 * Copyright 2017 DENSO Solutions
 * 
 * オペレーションログ画面のReactコンポーネント
 * 
 */

'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import { Grid, Row, Col } from 'react-bootstrap';

import Content from 'Common/Layout/Content';
import DateTimeSpanForm from 'Common/Form/DateTimeSpanForm';

import SearchConditionBox from 'Assets/Condition/SearchConditionBox';
import MessageModal from 'Assets/Modal/MessageModal';

import OperationLogBox from 'OperationLog/OperationLogBox';

import { setAuthentication } from 'Authentication/actions.js';
import { setLookUp, setOperationLogResult, setLoadState, setLoadState_condition, setLoadState_result } from './actions.js';

import { FUNCTION_ID_MAP, LAVEL_TYPE, getAuthentication } from 'authentication';　　
import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';
import { validateDate, VALIDATE_STATE, errorResult, successResult } from 'inputCheck';

const DATE_FORMAT = 'YYYY/MM/DD HH:mm';

class OperationLogPanel extends Component {

    constructor(){
        super();
        this.state = {
            dateFrom: moment().add(-1, 'hours'),
            dateTo: moment(),
            inputCheck: {
                dateFrom: successResult,
                dateTo: successResult
            },
            message: {},
            lastSearchCondition: null
        }
    }

    /**
     * 権限情報を取得する
     */
    loadAuthentication(){
        getAuthentication(FUNCTION_ID_MAP.operationLog, (auth) => {
            this.props.setAuthentication(auth);
        });
    }

    /**
     * マスタデータを読み込む
     */
    loadLookUp() {
        this.props.setLoadState_condition(true);
        sendData(EnumHttpMethod.get, 'api/operationLog/getLookUp', null, (lookUp, networkError) => {
            this.props.setLoadState_condition(false);
            if (lookUp) {
                this.props.setLookUp(lookUp);
            }
            if (networkError) {
                this.showNetWorkErrorMessage();
            }
        });
    }

    /**
     * オペレーションログを読み込む
     * @param {any} searchCondition
     */
    loadData(searchCondition, showMessage = true) {
        this.setState({ lastSearchCondition: searchCondition });    // 今回の検索条件をstateに保存
        this.props.setLoadState_result(true);
        sendData(EnumHttpMethod.post, 'api/operationLog/getOperationLog', searchCondition, (info, networkError) => {
            this.props.setLoadState_result(false);
            if (info) {
                this.props.setOperationLogResult(info.operationLogResult);
                if (showMessage && info.operationLogResult && info.operationLogResult.rows && info.operationLogResult.rows.length === 0) {
                    this.setState({
                        message: {
                            show: true,
                            buttonStyle: 'message',
                            title: '検索',
                            message: '検索条件に該当する操作ログがありません。',
                            onCancel: () => this.clearMessage()
                        }
                    })
                }
            }
            if (networkError) {
                this.showNetWorkErrorMessage();
            }
        });
    }

    /**
     * Componentがマウントされるときに1度だけ呼ばれます。
     */
    componentDidMount() {
        this.loadAuthentication();
        this.loadLookUp();
    }

    /**
     * 検索ボタンクリック
     */
    onSearchClick(condition) {
        const searchCondition = Object.assign({}, condition);
        searchCondition.startDate = this.state.dateFrom;
        searchCondition.endDate = this.state.dateTo;
        this.loadData(searchCondition);
    }

    /**
     * 操作日時指定に変更があったとき
     * @param {any} from
     * @param {any} to
     */
    handleDateChange(from, to) {
        let obj = Object.assign({}, this.state.inputCheck);
        obj.dateFrom = validateDate(from, DATE_FORMAT, false);
        obj.dateTo = validateDate(to, DATE_FORMAT, true);
        if (obj.dateFrom.state == VALIDATE_STATE.success && obj.dateTo.state == VALIDATE_STATE.success && !moment(to).isAfter(from)) {
            obj.dateTo = errorResult('終了日時は開始日時以降となるように設定してください');
        }

        this.setState({ dateFrom: from, dateTo: to, inputCheck: obj });
    }

    /**
     * 入力エラーがあるか
     * @param {any} inputCheck
     */
    hasErrorState(inputCheck) {
        for (let key of Object.keys(inputCheck)) {
            if (inputCheck[key].state === VALIDATE_STATE.error) {
                return true;
            }
        }
        return false;
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
     * render
     */
    render() {
        const { isReadOnly, level, loadAuthentication } = this.props.authentication;
        const { lookUp, operationLogResult, isLoading } = this.props;
        const { dateFrom, dateTo, inputCheck, message, lastSearchCondition } = this.state;

        const searchDisabled = this.hasErrorState(inputCheck);

        return (
            <Content>
                <SearchConditionBox useHotKeys
                    lookUp={lookUp}
                    targets={['loginUsers', 'functions', 'operationTypes']}
                    onSearchClick={(condition) => this.onSearchClick(condition)}
                    onClear={() => this.setState({
                        dateFrom: moment().add(-1, 'hours'),
                        dateTo: moment(),
                        inputCheck: { dateFrom: successResult, dateTo: successResult }
                    })}
                    searchButtonDisabled={searchDisabled || isLoading.result}
                    isLoading={isLoading.condition || !loadAuthentication}
                >
                    <Grid fluid>
                        <Row>
                            <Col md={12}>
                                操作日時：
                                <DateTimeSpanForm
                                    from={dateFrom}
                                    to={dateTo}
                                    format={DATE_FORMAT}
                                    timePicker={true}
                                    onChange={(from, to) => this.handleDateChange(from, to)}
                                    validationFrom={inputCheck.dateFrom}
                                    validationTo={inputCheck.dateTo}
                                />
                            </Col>
                        </Row>
                    </Grid>
                </SearchConditionBox>
                <OperationLogBox
                    dateFrom={lastSearchCondition && lastSearchCondition.startDate}
                    dateTo={lastSearchCondition && lastSearchCondition.endDate}
                    isReadOnly={isReadOnly}
                    isLoading={isLoading.result}
                    operationLogResult={operationLogResult}
                    onColumnSettingChange={lastSearchCondition && (() => this.loadData(lastSearchCondition, false))}
                />
                <MessageModal
                    show={message.show}
                    title={message.title}
                    bsSize="small"
                    buttonStyle={message.buttonStyle}
                    onOK={message.onOK}
                    onCancel={message.onCancel}
                    disabled={isLoading.result}
                >
                    {message.message}
                </MessageModal>
            </Content>
        );
    }    
}

// Which props do we want to inject, given the global state?
// Note: use https://github.com/faassen/reselect for better performance.
const mapStateToProps = (state) => {
    return {
        authentication: state.authentication,
        lookUp: state.lookUp,
        operationLogResult: state.operationLogResult,
        isLoading: state.isLoading
    };
};

//画面更新のアクションを設定します。
const mapDispatchToProps = (dispatch) => {
    return {
        setAuthentication: (auth) => dispatch(setAuthentication(auth)),
        setLookUp: (lookUp) => dispatch(setLookUp(lookUp)),
        setOperationLogResult: (result) => dispatch(setOperationLogResult(result)),
        setLoadState: (isLoading) => dispatch(setLoadState(isLoading)),
        setLoadState_condition: (isLoading) => dispatch(setLoadState_condition(isLoading)),
        setLoadState_result: (isLoading) => dispatch(setLoadState_result(isLoading))
    };
};

// Wrap the component to inject dispatch and state into it
export default connect(mapStateToProps, mapDispatchToProps)(OperationLogPanel);

 