/**
 * @license Copyright 2018 DENSO
 * 
 * LineConnectionLog画面
 * 
 * 画面のコンテナとして。Reduxに依存したコードを記述します。
 * 画面のロジックはここに記述します。（適宜ファイル分割は行うこと）
 * 
 */
'use strict';

import React, { Component, createFactory } from 'react';
import { connect } from 'react-redux';
import { Grid, Row, Col, Checkbox } from 'react-bootstrap';

import MessageModal from 'Assets/Modal/MessageModal';
import WaitingMessage from 'Assets/Modal/WaitingMessage';
import LineConnectionLogBox from 'LineConnectionLog/LineConnectionLogBox';
import LineHistEditModal from 'LineConnectionLog/LineHistEditModal'
import CheckboxSwitch from 'Common/Widget/CheckboxSwitch'


import { setAuthentication } from 'Authentication/actions.js';
import { setWaitingState } from 'WaitState/actions.js';
import { setLookUp, setConditionList,　setLineConnectionLogResult, setLineConnectionLogDisplayState, setLoadState, setLoadState_condition, setLoadState_result, setLoadState_coditionList } from './actions.js';


import Content from 'Common/Layout/Content';
import SearchConditionBox from 'Assets/Condition/SearchConditionBox';
import DateTimeSpanForm from 'Common/Form/DateTimeSpanForm';

import { FUNCTION_ID_MAP, LAVEL_TYPE, getAuthentication, readOnlyByLevel } from 'authentication';
import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';
import { validateDate, VALIDATE_STATE, errorResult, successResult } from 'inputCheck';
import { getSearchConditionList, createInitSearchCondition } from 'searchConditionUtility'

const DATE_FORMAT = 'YYYY/MM/DD';

const SEARCH_TARGETS = ['idfConnects', 'inConnects', 'lineIds', 'userNames', 'locations', 'memos'];
const FUNCTION_ID = FUNCTION_ID_MAP.lineConnectionLog;

/**
 * LineConnectionLog画面のコンポーネント
 */
class LineConnectionLogPanel extends Component {

    /**
     * コンストラクタ
     */
    constructor(){
        super();
        this.state = Object.assign({
            inputCheck: {
                dateFrom: successResult,
                dateTo: successResult
            },
            message: {},
            lastSearchCondition: null,
            isBulkLineHist: '',
            lineHistEdit: {
                show: false,
                histIds: [],
                appendix: '',
                misReg: ''
            },
        }, { editingCondition: this.getDefaultEditingCondition() } );
    }

    /**
     * 編集中検索条件のデフォルト値を返す（初期描画時に使用）
     */
    getDefaultEditingCondition() {
        return { 
            isExcludeMisReg: true,
            ...createInitSearchCondition(),
            ...this.getDefaultDateTimeSpan()
        };
    }

    /**
     * 日付範囲のデフォルト値を返す（初期描画時と条件クリア時に使用）
     */
    getDefaultDateTimeSpan() {
        return { 
            dateSpecified: true,    // true: 日付範囲を指定する
            dateFrom: moment({h:0, m:0, s:0, ms:0}).subtract(3, 'months'), 
            dateTo: moment({h:0, m:0, s:0, ms:0}),
        };
    }

    /**
     * 期間をリセットする
     */
    resetDateTimeSpan() {
        const dateTimeSpan = this.getDefaultDateTimeSpan();
        this.setDateTimeSpanState(dateTimeSpan.dateFrom, dateTimeSpan.dateTo, dateTimeSpan.dateSpecified);
    }

    /**
     * 条件クリア時に誤登録を除くを初期化する
     */
    resetMisReg(){
        const editing = Object.assign({}, this.state.editingCondition);
        editing.isExcludeMisReg = true;
        this.setState({ editingCondition: editing });
    }

    /**
     * 条件クリアされたとき
     */
    resetSearchCondition(){
        const condition = {
            ...createInitSearchCondition(SEARCH_TARGETS),
            isExcludeMisReg: true
        };
        this.setState({ editingCondition: condition }, () => this.resetDateTimeSpan());
    }

    /**
     * 権限情報を取得する
     */
    loadAuthentication(){
        getAuthentication(FUNCTION_ID, (auth) => {
            this.props.setAuthentication(auth);
        });
    }

    /**
     * マスタデータを読み込む
     */
    loadLookUp() {
        this.props.setLoadState_condition(true);
        sendData(EnumHttpMethod.get, '/api/lineHist/lookUp', null, (lookUp, networkError) => {
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
     * 検索条件一覧を取得する
     */
    loadSearchConditionList() {
        this.props.setLoadState_coditionList(true);
        getSearchConditionList(FUNCTION_ID, (data, networkError) => {
            this.props.setLoadState_coditionList(false);
            if (data) {
                this.props.setConditionList(data);
            }
            if (networkError) {
                this.showNetWorkErrorMessage();
            }

        })
    }

    /**
     * 回線接続履歴を読み込む
     * @param {any} searchCondition
     */
    loadData(searchCondition, showMessage = true) {
        this.setState({ lastSearchCondition: searchCondition });    // 今回の検索条件をstateに保存
        this.props.setLoadState_result(true);
        sendData(EnumHttpMethod.post, '/api/lineHist/search', searchCondition, (info, networkError) => {
            this.props.setLoadState_result(false);
            if (info) {
                this.props.setLineConnectionLogResult(info.lineHistResult);
                if (showMessage && info.lineHistResult && info.lineHistResult.rows && info.lineHistResult.rows.length === 0) {
                    this.setState({
                        message: {
                            show: true,
                            buttonStyle: 'message',
                            title: '検索',
                            message: '検索条件に該当する回線接続履歴がありません。',
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
     * 回線接続履歴情報を取得する
     * @param {number} histId 履歴ID
     * @param {function} callback コールバック関数
     */
    getLineHist(histId, callback) {
        this.props.setLoadState(true);
        const sendingData = { id: histId }; 
        sendData(EnumHttpMethod.post, '/api/lineHist/getLineHist', sendingData , (data, networkError) => {
            this.props.setLoadState(false);
            if (networkError) {
                this.showNetWorkErrorMessage();
            } else if (data !== null) {
                callback && callback(data);
            } else {
                this.showErrorMessage('回線接続履歴取得に失敗しました。');
            }
        });
    }

    /**
     * 保存ボタンクリック
     * @param {array} histIds 履歴IDリスト
     * @param {any} saveData 保存するデータ
     */
    onSaveClick(histIds, saveData){
        this.setState({
            message: {
                show: true,
                buttonStyle: 'confirm',
                title: '保存確認',
                message: '編集内容を保存しますか？',
                onOK:() => {
                    this.clearMessage();
                    this.saveLineHist(histIds, saveData);
                },
                onCancel: () => this.clearMessage()
            }
        });
    }


    /**
     * 回線接続履歴を保存する
     * @param {array} histIds 履歴IDリスト
     * @param {any} saveData 保存するデータ
     */
    saveLineHist(histIds, saveData) {
        this.props.setWaitingState(true, 'save');
        const { lastSearchCondition } = this.state;
        let sendingData = {...saveData};
        let path = '';
        if(histIds.length === 1){
            sendingData.histId = histIds[0];
            path = '/api/lineHist/saveLineHist';
        }else{
            sendingData.histIds = histIds;
            path = '/api/lineHist/saveLineHists';
        }
        sendData(EnumHttpMethod.post, path, sendingData , (result, networkError) => {
            this.props.setWaitingState(false);            
            if (networkError) {
                this.showNetWorkErrorMessage();
            } else if (result) {
                if (result.isSuccess) {
                    this.setState({
                        message: {
                            show: true,
                            buttonStyle: 'message',
                            title: '保存成功',
                            message: result.message,
                            onCancel: () => {
                                this.clearMessage();
                                this.hideLineHistEditModal();
                                this.loadData(lastSearchCondition);         //回線接続履歴再表示
                            }
                        }
                    })
                } else {
                    this.showErrorMessage(result.message);
                }
            }
            else {
                this.showErrorMessage('回線接続履歴の保存に失敗しました。');
            }
        });
    }


    /**
     * 最初のレンダリング時にクライアントに一度だけ呼び出されます。
     * Componentがレンダリングされた直後に呼び出されるメソッドです。
     * ここでsetStateを行うと、renderがもう一度呼び出されるためあまり行わないほうがよいです。
     */
    componentDidMount() {
        this.loadAuthentication();
        this.loadLookUp();
        this.loadSearchConditionList();
    }

    /**
     * 検索ボタンクリック
     * @param {object} condition 検索条件
     * @param {boolean} isSavedCondition 検索条件を保存したかどうか
     */
    onSearchClick(condition, isSavedCondition) {
        const searchCondition = {
            lookUp: {
                locations: condition.locations ? condition.locations : []
            },
            idfConnects: condition.idfConnects ? condition.idfConnects : [],
            inConnects: condition.inConnects ? condition.inConnects : [],
            lineIds: condition.lineIds ? condition.lineIds : [],
            userNames: condition.userNames ? condition.userNames : [],
            memos: condition.memos ? condition.memos : [],
            isExcludeMisReg: this.state.editingCondition.isExcludeMisReg
        };
        if (this.state.editingCondition.dateSpecified) {
            searchCondition.lookUp.startDate = this.state.editingCondition.dateFrom.format('YYYY-MM-DD') + ' 00:00:00';
            searchCondition.lookUp.endDate = this.state.editingCondition.dateTo.format('YYYY-MM-DD') + ' 23:59:59';
        }
        this.loadData(searchCondition, true, isSavedCondition);
        isSavedCondition && this.loadSearchConditionList();
    }

    /**
     * 編集ボタンクリック
     * @param {array} histIds 履歴IDリスト
     */
    handleEditClick(histIds) {
        if (histIds.length === 1) {
            this.setState({isBulkLineHist: false});
            this.getLineHist(histIds[0], (data) => {
                this.showLineHistEditModal(histIds, data.appendix, data.misReg);
            });
        } else {
            this.setState({isBulkLineHist: true});
            this.showLineHistEditModal(histIds, '', false);
        }
    }

    /**
     * 「期間を指定しない」チェックボックスがクリックされたとき
     */
    handleDateSpecifiedClick() {
        const from = this.state.editingCondition.dateFrom;
        const to = this.state.editingCondition.dateTo;
        const newDateSpecified = !this.state.editingCondition.dateSpecified;

        this.setDateTimeSpanState(from, to, newDateSpecified);
    }

    /**
     * 操作日時指定に変更があったとき
     * @param {any} from
     * @param {any} to
     */
    handleDateChange(from, to) {
        this.setDateTimeSpanState(from, to, this.state.editingCondition.dateSpecified);
    }

    /**
     * 日付のバリデーションチェック
     * @param {any} from
     * @param {any} to
     * @param {bool} dateSpecified
     * @param {function} callback コールバック関数
     */
    setDateTimeSpanState(from, to, dateSpecified = true, callback = null) {
        const obj = Object.assign({}, this.state.inputCheck);
        const editing = Object.assign({}, this.state.editingCondition, {
                            dateFrom: from, 
                            dateTo: to, 
                            dateSpecified: dateSpecified
                        });

        if (dateSpecified) {
            obj.dateFrom = validateDate(from, DATE_FORMAT, false);
            obj.dateTo = validateDate(to, DATE_FORMAT, false);
            if (obj.dateFrom.state == VALIDATE_STATE.success && obj.dateTo.state == VALIDATE_STATE.success && !moment(to).isAfter(from)) {
                obj.dateTo = errorResult('終了日は開始日以降となるように設定してください');
            }
        } else {
            obj.dateFrom = null;
            obj.dateTo = null;
        }
        this.setState({ editingCondition: editing, inputCheck: obj }, () => callback&&callback());
    }

    /**
     * 誤登録を除くが変更されたとき
     */
    handleMisRegChange(){
        const editing = Object.assign({}, this.state.editingCondition);
        editing.isExcludeMisReg = !editing.isExcludeMisReg;
        this.setState({ editingCondition: editing });
    }

    /**
     * 入力エラーがあるか
     * @param {any} inputCheck
     */
    hasErrorState(inputCheck) {
        const dateSpecified = this.state.editingCondition.dateSpecified;
        for (let key of Object.keys(inputCheck)) {
            if (!dateSpecified && (key === 'dateFrom' || key === 'dateTo')) {
                continue;
            }
            if (inputCheck[key].state === VALIDATE_STATE.error) {
                return true;
            }
        }
        return false;
    }

    /**
     * 編集中の検索条件をセットする
     */
    setEditingCondition(condition) {
        const { dateFrom, dateTo, dateSpecified } = condition;
        this.setDateTimeSpanState(dateFrom, dateTo, dateSpecified, () => {
            this.setState({ editingCondition: Object.assign({}, condition) });
        })      
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
     * 回線接続履歴編集モーダルを表示する
     * @param {array} histIds 編集対象の履歴IDリスト
     * @param {string} appendix 初期表示するメモ
     * @param {boolean} misReg 初期表示する誤登録
     */
    showLineHistEditModal(histIds, appendix, misReg) {
        this.setState({
            lineHistEdit: {
                show: true,
                histIds: histIds,
                appendix: appendix,
                misReg: misReg
            }
        });
    }

    /**
     * 回線接続履歴編集モーダルを閉じる
     */
    hideLineHistEditModal() {
        this.setState({
            lineHistEdit: {
                show: false,
                histIds: [],
                appendix: '',
                misReg: ''
            }
        });
    }


    /**
     * render
     */
    render() {
        const { isReadOnly, level, loadAuthentication } = this.props.authentication;
        const { lookUp, conditionList, lineConnectionLogResult, displayState, isLoading, waitingInfo } = this.props;

        const { inputCheck, message, lastSearchCondition, editingCondition, lineHistEdit, isBulkLineHist } = this.state;
        const { dateFrom, dateTo, dateSpecified, isExcludeMisReg } = editingCondition;
        const searchDisabled = this.hasErrorState(inputCheck);

        const readonly = readOnlyByLevel(isReadOnly, level, LAVEL_TYPE.operator);

        return (
            <Content>
                <SearchConditionBox
                    lookUp={lookUp}
                    targets={SEARCH_TARGETS}
                    searchCondition={editingCondition}
                    onChange={(condition) => this.setEditingCondition(condition)}
                    onSearchClick={(condition, isSavedCondition) => this.onSearchClick(condition, isSavedCondition)}
                    onClear={() => this.resetSearchCondition() }
                    searchButtonDisabled={searchDisabled || isLoading.result}
                    isLoading={isLoading.condition || !loadAuthentication || isLoading.conditionList}
                    useHotKeys
                    useSaveConditions
                    conditionList={conditionList}
                    functionId={FUNCTION_ID}
                >
                    <Grid fluid>
                        <Row>
                            <Col xs={12}>
                                <div className="flex-top-left">
                                    <div className="mr-1">
                                        期間：
                                    </div>
                                    <div>
                                        <Checkbox checked={!dateSpecified} onClick={() => this.handleDateSpecifiedClick()} className="mt-0">期間を指定しない</Checkbox>
                                        <DateTimeSpanForm
                                            from={dateFrom}
                                            to={dateTo}
                                            format={DATE_FORMAT}
                                            onChange={(from, to) => this.handleDateChange(from, to)}
                                            validationFrom={inputCheck.dateFrom}
                                            validationTo={inputCheck.dateTo}
                                            isReadOnly={!dateSpecified}
                                        />
                                    </div>
                                </div>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={12}>
                                <div className="mt-2">
                                    <CheckboxSwitch
                                            text="誤登録を除く" 
                                            bsSize="sm"
                                            checked={isExcludeMisReg} 
                                            onChange={() => this.handleMisRegChange()}
                                        />
                                </div>
                            </Col>
                        </Row>
                    </Grid>
                </SearchConditionBox>
                <LineConnectionLogBox
                    dateFrom={lastSearchCondition && lastSearchCondition.lookUp.startDate}
                    dateTo={lastSearchCondition && lastSearchCondition.lookUp.endDate}
                    isReadOnly={readonly}
                    isLoading={isLoading.result}
                    lineConnectionLogResult={lineConnectionLogResult}
                    tableSetting={displayState}
                    onColumnSettingChange={lastSearchCondition && (() => this.loadData(lastSearchCondition, false))}
                    onTableSettingChange={(setting) => this.props.setLineConnectionLogDisplayState(setting)}
                    onEdit={(ids) => this.handleEditClick(ids)}
                />
                <LineHistEditModal 
                    show={lineHistEdit.show}
                    initMemo={lineHistEdit.appendix}
                    initMisReg={lineHistEdit.misReg}
                    onSave={(value) => this.onSaveClick(lineHistEdit.histIds, value)}
                    onCancel={() => this.hideLineHistEditModal()}
                    isBulk={isBulkLineHist}
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
                <WaitingMessage show={waitingInfo.isWaiting} type={waitingInfo.waitingType} />
            </Content>
        );
    }    
}

// Which props do we want to inject, given the global state?
// Note: use https://github.com/faassen/reselect for better performance.

/**
 * storeからstateを受け取り、propsに入れ込みます。
 */
const mapStateToProps = (state) => {
    return {
        lineConnectionLogResult: state.lineConnectionLogResult,
        authentication: state.authentication,
        lookUp: state.lookUp,
        conditionList: state.conditionList,
        displayState: state.displayState,
        isLoading: state.isLoading,
        waitingInfo: state.waitingInfo
    };
};

/**
 * 画面更新のアクションを設定します。
 * storeからActionを受け取り、propsに入れ込みます。
 */
const mapDispatchToProps = (dispatch) => {
    return {
        setAuthentication: (auth) => dispatch(setAuthentication(auth)),
        setLookUp: (lookUp) => dispatch(setLookUp(lookUp)),
        setConditionList: (conditionList) => dispatch(setConditionList(conditionList)),
        setLineConnectionLogResult: (result) => dispatch(setLineConnectionLogResult(result)),
        setLineConnectionLogDisplayState: (setting) => dispatch(setLineConnectionLogDisplayState(setting)),
        setLoadState: (isLoading) => dispatch(setLoadState(isLoading)),
        setLoadState_condition: (isLoading) => dispatch(setLoadState_condition(isLoading)),
        setLoadState_result: (isLoading) => dispatch(setLoadState_result(isLoading)),
        setLoadState_coditionList: (isLoading) => dispatch(setLoadState_coditionList(isLoading)),
        setWaitingState: (isWaiting, waitingType) => dispatch(setWaitingState(isWaiting, waitingType))
    };
};

// Wrap the component to inject dispatch and state into it
/**
 * mapStateToProps, mapDispatchToPropsをReduxと連携させる
 */
export default connect(mapStateToProps, mapDispatchToProps)(LineConnectionLogPanel);

 