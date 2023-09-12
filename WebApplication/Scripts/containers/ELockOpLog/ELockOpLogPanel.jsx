/**
 * @license Copyright 2020 DENSO
 *
 * ELockOpLog画面
 *
 * 画面のコンテナとして。Reduxに依存したコードを記述します。
 * 画面のロジックはここに記述します。（適宜ファイル分割は行うこと）
 *
 */

'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';
import {FormGroup, Checkbox, HelpBlock} from 'react-bootstrap';

import MessageModal from 'Assets/Modal/MessageModal';
import ELockOpLogBox from 'ELockOpLog/ELockOpLogBox';

import { setAuthentication } from 'Authentication/actions.js';
import { setLookUp, setICCardType, setLoginUser, setELockOpLogResult, setLoadState, setLoadState_condition, setLoadState_result, setSearchCondition, setIsCardOperation } from './actions.js';

import Content from 'Common/Layout/Content';
import SearchConditionBox from 'Assets/Condition/SearchConditionBox';
import DateTimeSpanForm from 'Common/Form/DateTimeSpanForm';
import MultiSelectForm from 'Common/Form/MultiSelectForm';
import ToggleSwitch from 'Common/Widget/ToggleSwitch'

import {
    DATE_TIME_FORMAT, DIGEST_OPTIONS, EXPORT_SPAN,
    MDATA_TYPE_OPTIONS,
    REALTIME_OPTIONS,
    REPORT_TYPE_OPTIONS, SUMMARY_TYPE_OPTION,
    VALUE_TYPE,
    VALUE_TYPE_OPTIONS
} from 'constant';

import { FUNCTION_ID_MAP, LAVEL_TYPE, getAuthentication } from 'authentication';
import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';
import { validateDate, VALIDATE_STATE, errorResult, successResult } from 'inputCheck';
import {getSearchConditionString, getSearchConditionTextStructure, filterSearchCondition } from "searchConditionUtility";
import { getICCardType } from 'iccardUtility';
import EmbeddedReportOutputModal from "Assets/Modal/EmbeddedReportOutputModal";
import EmbeddedReportFormatModal from "Assets/Modal/EmbeddedReportFormatModal";

const DATE_FORMAT = DATE_TIME_FORMAT.dateTime;

const EMBEDDED_REPORT_API_URL = {
    output: '/api/embeddedReport/output/eLockOpLog',
    getFormatResult: '/api/embeddedReport/getELockOpLogFormatResult',
    getFormats: '/api/embeddedReport/getELockOpLogFormats',
    setFormat: '/api/embeddedReport/setELockOpLogFormat',
    deleteFormats: '/api/embeddedReport/deleteELockOpLogFormats',
};

const SEARCH_CONDITION_TYPES = ['locations', 'enterprises', 'tags', 'loginUsers'];
const SEARCH_CONDITION_TYPES_ICCARD = ['locations', 'tags', 'cardIds', 'cardNames', 'enterprises', 'enterpriseNames', 'loginUsers', 'userNames', 'userKanas', 'icTerminals'];

/**
 * ELockOpLog画面のコンポーネント
 */
class ELockOpLogPanel extends Component {

    /**
     * コンストラクタ
     */
    constructor(){
        super();
        this.state = Object.assign(
            {
                inputCheck: {
                    dateFrom: successResult,
                    dateTo: successResult,
                    isLockUnlockSearch: successResult,
                    unlockPurposes: successResult
                },
                inputValue: this.getDefaultInputValue(),
                message: {},
                showEmbeddedReportOutputModal: false,
                showEmbeddedReportFormatModal: false,
                lastSearchCondition: null,
                editingCondition: null
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
        this.loadICCardType();
        this.getLoginUser();
    }

    /**
     * 日付範囲のデフォルト値を返す（初期描画時と条件クリア時に使用）
     */
    getDefaultDateTimeSpan() {
        const t = moment().startOf('minute');
        return {
            dateTo: t,
            dateFrom: t.clone().subtract(1, 'hours'),
        };
    }

    /**
     * 入力値のデフォルトを返す
     */
    getDefaultInputValue() {
        const unlockPurposes = this.props && this.props.lookUp && this.props.lookUp.unlockPurposes ? this.props.lookUp.unlockPurposes.map(item => item.unlockPurposeId.toString()) : [];

        return Object.assign({
            isUnlockSearch: true,
            isLockSearch: true,
            unlockPurposes: unlockPurposes,
        }, this.getDefaultDateTimeSpan())
    }

    clearForm() {
        this.setInputValue(this.getDefaultInputValue());
    }

    /**
     * 権限情報を取得する
     */
    loadAuthentication(){
        getAuthentication(FUNCTION_ID_MAP.eLockOpLog, (auth) => {
            this.props.setAuthentication(auth);
        });
    }

    /**
     * マスタデータを読み込む
     */
    loadLookUp() {
        this.props.setLoadState_condition(true);
        sendData(EnumHttpMethod.get, 'api/eLockOpLog', null, (lookUp, networkError) => {
            this.props.setLoadState_condition(false);
            if (lookUp) {
                this.props.setLookUp(lookUp);
                this.setInputValue({unlockPurposes: this.props.lookUp.unlockPurposes.map(item => item.unlockPurposeId.toString())});
            }
            if (networkError) {
                this.showNetWorkErrorMessage();
            }
        });
    }

    /**
     * 電気錠ログを読み込む
     * @param {any} searchCondition
     */
    loadData(searchCondition, showMessage = true) {
        this.setState({ lastSearchCondition: searchCondition });    // 今回の検索条件をstateに保存
        this.props.setLoadState_result(true);
        sendData(EnumHttpMethod.post, 'api/eLockOpLog/search', searchCondition, (eLockOpResult, networkError) => {
            this.props.setLoadState_result(false);
            if (eLockOpResult) {
                this.props.setELockOpLogResult(eLockOpResult);
                if (showMessage && eLockOpResult && eLockOpResult.rows && eLockOpResult.rows.length === 0) {
                    this.setState({
                        message: {
                            show: true,
                            buttonStyle: 'message',
                            title: '検索',
                            message: '検索条件に該当する電気錠ログがありません。',
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
     * ログインユーザー情報を非同期で読み込む
     */
    getLoginUser() {
        sendData(EnumHttpMethod.get, 'api/user/getLoginUser', null, (loginUser, networkError) => {
            if (networkError) {
                this.setState({showModal: true, modalTitle: "エラー", modalMessage: NETWORKERROR_MESSAGE});
            } else if (loginUser) {
                this.props.setLoginUser(loginUser);
            } else {
                this.setState({showModal: true, modalTitle: "エラー", modalMessage: "ユーザー情報の取得に失敗しました。"});
            }
        });
    }

    /**
     * ICカード種別を読み込む
     */
    loadICCardType() {
        getICCardType((isSuccess, icCardType, networkError) => {
            if (isSuccess) {
                this.props.setICCardType(icCardType);
            } else {
                if (networkError) {
                    this.setState({showModal: true, modalTitle: "エラー", modalMessage: NETWORKERROR_MESSAGE});
                } else {   
                    this.setState({showModal: true, modalTitle: "エラー", modalMessage: "ICカード種別取得に失敗しました。"});   
                }
            }
        });        
    }

    /**
     * 検索ボタンクリック
     */
    onSearchClick(condition) {
        const searchCondition = this.createPostSearchCondition(condition);
        this.loadData(searchCondition);
    }

    /**
     * 検索条件の POST データを生成
     */
    createPostSearchCondition(condition) {
        const { inputValue } = this.state;
        const { isCardOperation } = this.props;
        const unlockPurposes = this.props.lookUp && this.props.lookUp.unlockPurposes &&
            this.props.lookUp.unlockPurposes.filter(item => inputValue.unlockPurposes.includes(item.unlockPurposeId.toString()));
        const searchCondition = {
            lookUp: {
                locations: condition.locations,
                enterprises: condition.enterprises,
                tags: condition.tags,
                loginUsers: condition.loginUsers,
                unlockPurposes: !isCardOperation ? unlockPurposes : null,
                startDate: inputValue.dateFrom,
                endDate: inputValue.dateTo.clone().add(59, 'seconds'),
                icTerminals: condition.icTerminals ? _.cloneDeep(condition.icTerminals) : [],
            },
            isUnlockSearch: inputValue.isUnlockSearch,
            isLockSearch: inputValue.isLockSearch,
            iCCardCondition: {
                cardIds: isCardOperation ? (condition.cardIds ? _.cloneDeep(condition.cardIds) : []) : null,
                cardNames: isCardOperation ? (condition.cardNames ? _.cloneDeep(condition.cardNames) : []) : null,
                enterpriseNames: isCardOperation ? (condition.enterpriseNames ? _.cloneDeep(condition.enterpriseNames) : []) : null,
                userNames: isCardOperation ? (condition.userNames ? _.cloneDeep(condition.userNames) : []) : null,
                userKanas: isCardOperation ? (condition.userKanas ? _.cloneDeep(condition.userKanas) : [] ) : null,           
            },
            isCardOperation: isCardOperation
        };
        return searchCondition;
    }


    /**
     * 帳票タイトルに使用するデフォルト文字列を生成
     * @param {*} searchCondition
     */
    createDefaultConditionText(searchCondition) {
        const lookUp = this.props.lookUp;
        const isCardOperation = this.props.isCardOperation;
        const { inputValue } = this.state;

        const conditionTextStructure = getSearchConditionTextStructure(lookUp, searchCondition);

        conditionTextStructure.unshift({
            label: '条件',
            value: isCardOperation ? 'カード操作' : '画面操作'
        });

        conditionTextStructure.push({
            label: '操作期間',
            value: moment(inputValue.dateFrom).format(DATE_FORMAT) + ' - ' + moment(inputValue.dateTo).format(DATE_FORMAT)
        });

        conditionTextStructure.push({
            label: '操作対象',
            value: [ { name: '開錠', value: inputValue.isUnlockSearch }, { name: '施錠', value: inputValue.isLockSearch } ].filter(item => item.value).map(item => item.name).join(' / ')
        });

        if (!isCardOperation && inputValue.unlockPurposes.length) {
            conditionTextStructure.push({
                label: '開錠目的',
                value: inputValue.unlockPurposes.length === lookUp.unlockPurposes.length ? 'すべて' : lookUp.unlockPurposes.filter(item => inputValue.unlockPurposes.includes(item.unlockPurposeId.toString())).map(item => item.purpose).join(' / ')
            });
        }

        return getSearchConditionString(conditionTextStructure);
    }

    /**
     * 日時指定に変更があったとき
     * @param {any} from
     * @param {any} to
     */
    handleDateChange(from, to) {
        this.setDateTimeSpan(from, to);
    }

    /**
     * 開錠のチェックボックスに変更があったとき
     */
    handleIsUnlockClick () {
        this.setInputValue({isUnlockSearch: !this.state.inputValue.isUnlockSearch});
    }

    /**
     * 施錠のチェックボックスに変更があったとき
     */
    handleIsLockClick () {
        this.setInputValue({isLockSearch: !this.state.inputValue.isLockSearch});
    }

    /**
     * 開錠目的に変更があったとき
     * @param {any} from
     * @param {any} to
     */
    handleUnlockPurposesChange(value) {
        const unlockPurposes = value.slice();
        this.setInputValue({unlockPurposes: unlockPurposes});
    }

    /**
     * 値の変更を行う関数
     * @param {any} from
     * @param {any} to
     */
    setInputValue(obj) {
        const inputValue = Object.assign({}, this.state.inputValue, obj);
        this.setState({ inputValue: inputValue }, () => this.validateInput());
    }

    /**
     * 日付のセット
     * @param {any} from
     * @param {any} to
     */
    setDateTimeSpan(from, to) {
        this.setInputValue({
            dateFrom: from,
            dateTo: to
        });
    }

    /**
     * バリデーションチェック
     */
    validateInput() {
        const inputCheck = Object.assign({}, this.state.inputCheck);
        const inputValue = Object.assign({}, this.state.inputValue);
        const from = inputValue.dateFrom;
        const to = inputValue.dateTo;

        inputCheck.dateFrom = validateDate(from, DATE_FORMAT, false);
        inputCheck.dateTo = validateDate(to, DATE_FORMAT, false);

        if (inputCheck.dateFrom.state == VALIDATE_STATE.success && inputCheck.dateTo.state == VALIDATE_STATE.success && moment(to).isBefore(from)) {
            inputCheck.dateTo = errorResult('終了日時は開始日時以降となるように設定してください');
        }

        if (inputValue.isLockSearch || inputValue.isUnlockSearch) {
            inputCheck.isLockUnlockSearch = successResult;
        } else {
            inputCheck.isLockUnlockSearch = errorResult('開錠・施錠どちらかをチェックしてください');
        }

        this.setState({ inputCheck: inputCheck });
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
     * 帳票出力ボタン押下イベント
     * @param {*} condition
     */
    handleEmbeddedReportOutputButtonClick(condition) {
        //検索条件とオプション検索条件をマージ
        const searchCondition = {...condition, ...this.props.condition};
        const postSearchCondition = this.createPostSearchCondition(condition);
        // props には POST データの構造をセット
        this.props.setSearchCondition(postSearchCondition);

        // createDefaultConditionText には targets を含むマージ結果を引数にする
        this.setState({showEmbeddedReportOutputModal: true, defaultReportTitle: this.createDefaultConditionText(searchCondition)});
    }

    handleEmbeddedReportOutputModalClose() {
        this.setState({showEmbeddedReportOutputModal: false});
    }

    handleEmbeddedReportFormatButtonClick() {
        this.setState({showEmbeddedReportFormatModal: true});
    }

    handleEmbeddedReportFormatModalClose() {
        this.setState({showEmbeddedReportFormatModal: false});
    }

    /**
     * 編集中の検索条件を保管する
     * @param {any} condition
     */
    setEditingCondition(condition) {
        this.setState({ editingCondition: condition });
    }

    /**
     * 検索条件の上部に表示する部品を作成
     * @param {boolean} isCardOperation カード操作条件かどうか
     */
    topConditions(isCardOperation) {
        return <ConditionSwitch
                    isCardOperation={isCardOperation}
                    onChange={(value) => this.changeIsCardOperetion(value, isCardOperation)}
               />
    }

    /**
     * IsCardOperetionを変更する
     * @param {boolean} isCardOperation カード操作条件かどうか
     * @param {boolean} before 変更前のカード操作条件
     */
    changeIsCardOperetion(isCardOperation, before) {
        if (isCardOperation !== before) {
            var condition = _.cloneDeep(this.state.editingCondition);
            var inputValue = _.cloneDeep(this.state.inputValue);
            if (isCardOperation) {
                condition = condition && filterSearchCondition(condition, SEARCH_CONDITION_TYPES_ICCARD);
                inputValue.unlockPurposes = [];
            } else {
                condition = condition && filterSearchCondition(condition, SEARCH_CONDITION_TYPES);
                inputValue.unlockPurposes = this.props && this.props.lookUp && this.props.lookUp.unlockPurposes ? this.props.lookUp.unlockPurposes.map(item => item.unlockPurposeId.toString()) : [];
            }            
            this.setState({ 
                editingCondition: condition,
                inputValue: inputValue
            }, () => this.validateInput());
        }
        this.props.setIsCardOperation(isCardOperation);
    }

    /**
     * render
     */
    render() {
        const { authentication, lookUp, eLockOpLogResult, isLoading, loginUser, icCardType, searchCondition, isCardOperation } = this.props;
        const { isReadOnly, level, loadAuthentication } = authentication;

        const { inputValue, inputCheck, message, lastSearchCondition, showEmbeddedReportOutputModal, showEmbeddedReportFormatModal, defaultReportTitle, editingCondition } = this.state;
        const searchDisabled = this.hasErrorState(inputCheck);
        return (
            <Content>
                <SearchConditionBox
                    topConditions={this.topConditions(isCardOperation)}    
                    lookUp={lookUp}
                    icCardType={icCardType}
                    targets={isCardOperation ? SEARCH_CONDITION_TYPES_ICCARD : SEARCH_CONDITION_TYPES}
                    searchCondition={editingCondition}
                    visibleEmbeddedReportButton={loginUser}
                    onEmbeddedReportOutputButtonClick = {condition => { this.handleEmbeddedReportOutputButtonClick(condition)}}
                    onEmbeddedReportFormatButtonClick = {() => { this.handleEmbeddedReportFormatButtonClick()}}
                    onChange={(condition) => this.setEditingCondition(condition)}
                    onSearchClick={(condition) => this.onSearchClick(condition)}
                    onClear={() => this.clearForm() }
                    searchButtonDisabled={searchDisabled || isLoading.result}
                    isLoading={isLoading.condition || !loadAuthentication}
                >
                    <dl className="garmit-additional-condition">
                        <dt>
                            期間：
                        </dt>
                        <dd>
                            <DateTimeSpanForm
                                from={inputValue.dateFrom}
                                to={inputValue.dateTo}
                                format={DATE_FORMAT}
                                timePicker={true}
                                onChange={(from, to) => this.handleDateChange(from, to)}
                                validationFrom={inputCheck.dateFrom}
                                validationTo={inputCheck.dateTo}
                            />
                        </dd>
                        <dd>
                            <FormGroup className="mt-1" validationState={inputCheck.isLockUnlockSearch.state}>
                                <Checkbox
                                    inline
                                    checked={inputValue.isUnlockSearch}
                                    onClick={() => this.handleIsUnlockClick()}
                                    className="mt-0 mr-2"
                                >
                                    開錠
                                </Checkbox>
                                <Checkbox
                                    inline
                                    checked={inputValue.isLockSearch}
                                    onClick={() => this.handleIsLockClick()}
                                    className="mt-0"
                                >
                                    施錠
                                </Checkbox>
                                { inputCheck.isLockUnlockSearch.state === VALIDATE_STATE.error &&
                                <HelpBlock className="text-error">{inputCheck.isLockUnlockSearch.helpText}</HelpBlock>
                                }
                            </FormGroup>
                        </dd>
                        {!isCardOperation&&
                            <dt>
                                開錠目的：
                            </dt>
                        }                         
                        {!isCardOperation&&
                            <dd>
                                { lookUp && lookUp.unlockPurposes &&
                                    <MultiSelectForm
                                        options={lookUp.unlockPurposes.map(item => ({name: item.purpose.toString(), value: item.unlockPurposeId.toString()}))}
                                        value={inputValue.unlockPurposes}
                                        onChange={value => this.handleUnlockPurposesChange(value)}
                                    />
                                }
                            </dd>
                        }
                    </dl>


                </SearchConditionBox>
                <ELockOpLogBox
                    isReadOnly={isReadOnly}
                    isLoading={isLoading.result}
                    eLockOpLogResult={eLockOpLogResult}
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
                {
                    loginUser &&
                    <EmbeddedReportOutputModal
                        apiUrl={EMBEDDED_REPORT_API_URL}
                        show={showEmbeddedReportOutputModal}
                        onHide={() => { this.handleEmbeddedReportOutputModalClose(); }}
                        enterprises={loginUser && loginUser.enterprises}
                        mainEnterprise={loginUser && loginUser.mainEnterprise}
                        condition={this.props.searchCondition}
                        defaultReportTitle={defaultReportTitle}
                    ></EmbeddedReportOutputModal>
                }
                {
                    loginUser &&
                    <EmbeddedReportFormatModal
                        apiUrl={EMBEDDED_REPORT_API_URL}
                        show={showEmbeddedReportFormatModal}
                        enterprises={loginUser && loginUser.enterprises}
                        mainEnterprise={loginUser && loginUser.mainEnterprise}
                        authentication={authentication}
                        lookUp={lookUp}
                        loginUser={loginUser}
                        onHide={() => { this.handleEmbeddedReportFormatModalClose(); }}
                    >
                    </EmbeddedReportFormatModal>
                }
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
        eLockOpLogResult: state.eLockOpLogResult,
        icCardType: state.icCardType,
        loginUser: state.loginUser,
        authentication: state.authentication,
        lookUp: state.lookUp,
        isLoading: state.isLoading,
        searchCondition: state.searchCondition,
        isCardOperation: state.isCardOperation
    };
};

/**
 * 画面更新のアクションを設定します。
 * storeからActionを受け取り、propsに入れ込みます。
 */
const mapDispatchToProps = (dispatch) => {
    return {
        setAuthentication: (auth) => dispatch(setAuthentication(auth)),
        setLoginUser: (loginUser) => dispatch(setLoginUser(loginUser)),
        setLookUp: (lookUp) => dispatch(setLookUp(lookUp)),
        setSearchCondition: (name) => dispatch(setSearchCondition(name)),
        setICCardType: (icCardType) => dispatch(setICCardType(icCardType)),
        setELockOpLogResult: (result) => dispatch(setELockOpLogResult(result)),
        setLoadState: (isLoading) => dispatch(setLoadState(isLoading)),
        setLoadState_condition: (isLoading) => dispatch(setLoadState_condition(isLoading)),
        setLoadState_result: (isLoading) => dispatch(setLoadState_result(isLoading)),
        setIsCardOperation: (isCardOperation) => dispatch(setIsCardOperation(isCardOperation))
    };
};

// Wrap the component to inject dispatch and state into it
/**
 * mapStateToProps, mapDispatchToPropsをReduxと連携させる
 */
export default connect(mapStateToProps, mapDispatchToProps)(ELockOpLogPanel);

/**
 * 条件切り替えスイッチ
 * @param {string} isCardOperation カード操作条件か
 */
const ConditionSwitch = ({ isCardOperation, onChange: handleChange }) => {
    return (
        <div className='mb-2' style={{marginLeft: '15px'}}>
            <ToggleSwitch
                name="conditionType" 
                defaultValue={false}
                value={isCardOperation}
                swichValues={[
                    {value: false, text: '画面操作'}, 
                    {value: true, text: 'カード操作'}
                ]}
                onChange={(value) => handleChange(value)}
            />
        </div>
    );
}