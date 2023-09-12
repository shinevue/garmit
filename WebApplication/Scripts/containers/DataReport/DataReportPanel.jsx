/**
 * @license Copyright 2017 DENSO
 * 
 * DataReport画面
 * 
 * 画面のコンテナとして。Reduxに依存したコードを記述します。
 * 画面のロジックはここに記述します。（適宜ファイル分割は行うこと）
 * 
 */
'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import { setAuthentication } from 'Authentication/actions.js';
import { setInitLookUp, setLoginUser, setMDataType, setDate, setSummaryType, setReportType, setReportInterval, setSearchResult, setRefine, setCsvFileName, setSearchCondition, setIsConvert } from './actions.js';

import Content from 'Common/Layout/Content';

import { FUNCTION_ID_MAP, LAVEL_TYPE, getAuthentication } from 'authentication';
import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';

import SearchConditionBox from 'Assets/Condition/SearchConditionBox';
import MessageModal from 'Assets/Modal/MessageModal';

import ReportTypeSelectForm from 'DataReport/ReportTypeSelectForm';
import DataSearchResultBox from 'DataReport/DataSearchResultBox';
import {
    MDATA_TYPE_OPTIONS,
    VALUE_TYPE,
    VALUE_TYPE_OPTIONS,
    REALTIME_OPTIONS,
    DIGEST_OPTIONS,
    CSV_DATE_TIME_FORMAT,
    SUMMARY_TYPE_OPTION,
    SUMMARY_TYPE,
    REPORT_TYPE_OPTIONS,
    EXPORT_SPAN
} from 'constant';
import { outputReportResult } from 'exportUtility';
import EmbeddedReportOutputModal from "Assets/Modal/EmbeddedReportOutputModal";
import EmbeddedReportFormatModal from "Assets/Modal/EmbeddedReportFormatModal";
import { getSearchConditionTextStructure, getSearchConditionString } from 'searchConditionUtility';


//#region 定数定義
//検索条件
const SEARCH_TARGETS = ["locations", "enterprises", "tags", "egroups", "hashTags"];

// レポート URL
const EMBEDDED_REPORT_API_URL = {
    output: '/api/dataEmbeddedReport/output',
    getFormatResult: '/api/dataEmbeddedReport/getFormatResult',
    getFormats: '/api/dataEmbeddedReport/getFormats',
    setFormat: '/api/dataEmbeddedReport/setFormat',
    deleteFormats: '/api/dataEmbeddedReport/deleteFormats',
};


//#endregion

/**
 * DataReportP画面のコンポーネント
 */
class DataReportPanel extends Component {

    /**
     * コンストラクタ
     */
    constructor() {
        super();
        this.state = {
            isLoading: false,
            showModal: false,
            showEmbeddedReportOutputModal: false,
            showEmbeddedReportFormatModal: false,
            modalTitle: null,
            modalMessage: null,
            defaultReportTitle: ''
        };
    }

    //#region ライフサイクル関数
    /**
     * 最初のレンダリング時にクライアントに一度だけ呼び出されます。
     * Componentがレンダリングされた直後に呼び出されるメソッドです。
     * ここでsetStateを行うと、renderがもう一度呼び出されるためあまり行わないほうがよいです。
     */
    componentDidMount() {
        this.loadAuthentication();
        this.getLookUp();   //ルックアップ取得
        this.getLoginUser();   // ログインユーザー情報（特に enterprises, mainEnterprise）取得
    }

    //#endregion

    //#region データ送受信
    /**
     * 権限情報を取得する
     */
    loadAuthentication(){
        getAuthentication(FUNCTION_ID_MAP.dataReport, (auth) => {
            this.props.setAuthentication(auth);
        });
    }

    /**
     * 画面の初期データを非同期で読み込む
     */
    getLookUp() {
        this.setState({ isLoading: true });
        sendData(EnumHttpMethod.get, 'api/report/data/lookUp', null, (data, networkError) => {
            if (networkError) {
                this.setState({ showModal: true, modalTitle: "エラー", modalMessage: NETWORKERROR_MESSAGE });
            } else if (data && data.lookUp) {
                this.props.setInitLookUp(data.lookUp);
            } else {
                this.setState({ showModal: true, modalTitle: "エラー", modalMessage: "初期情報の取得に失敗しました。" });
            }
            this.setState({ isLoading: false });
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
     * 検索条件をpostして検索結果を取得する
     */
    getSearchResult(searchCondition, isReport) {
        this.setState({ isLoading: true });
        sendData(EnumHttpMethod.post, 'api/report/data/result', searchCondition, (data, networkError) => {
            if (networkError) {
                this.setState({ showModal: true, modalTitle: "エラー", modalMessage: NETWORKERROR_MESSAGE });
            } else if (data && data.requestResult) {
                if (data.requestResult.isSuccess) {
                    if (!isReport) {
                        this.props.setSearchResult(data);
                    } else {
                        outputReportResult(data.reportResult, this.generateCsvFileName(searchCondition));
                    }
                    if (data.reportResult && data.reportResult.rows && data.reportResult.rows.length === 0) {
                        this.setState({ showModal: true, modalTitle: "検索", modalMessage: "検索条件に該当するポイントがありません。" });
                    }
                } else {
                    this.setState({ showModal: true, modalTitle: "エラー", modalMessage: data.requestResult.message });
                }
            } else {
                this.setState({ showModal: true, modalTitle: "エラー", modalMessage: "検索結果の取得に失敗しました。" });
            }
            this.setState({ isLoading: false });
        });
    }

    //#endregion

    /**
     * 検索ボタン押下イベント
     */
    handleSearchClick(condition, data, headerSet) {
        //検索条件とオプション検索条件をマージ
        const searchCondition = { ...condition, ...this.props.condition };
        this.props.setSearchCondition(searchCondition);
        this.getSearchResult(searchCondition);
        this.props.setCsvFileName(this.generateCsvFileName(searchCondition));
    }

    /**
     * レポート出力ボタン押下イベント
     * @param {*} condition
     */
    handleReportClick(condition) {
        const searchCondition = { ...condition, ...this.props.condition };
        this.getSearchResult(searchCondition, true);
    }

    /**
     * 帳票出力ボタン押下イベント
     * @param {*} condition
     */
    handleEmbeddedReportOutputButtonClick(condition) {
        //検索条件とオプション検索条件をマージ
        const searchCondition = {...condition, ...this.props.condition};
        this.props.setSearchCondition(searchCondition);
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
     * 帳票タイトルに使用するデフォルト文字列を生成
     * @param {*} searchCondition
     */
    createDefaultConditionText(searchCondition) {
        const lookUp = this.props.initLookUp;

        const conditionTextStructure = getSearchConditionTextStructure(lookUp, searchCondition);

        const valueType = searchCondition.measuredDataType === MDATA_TYPE_OPTIONS.realTime ? VALUE_TYPE.realTime : VALUE_TYPE.summary;
        conditionTextStructure.push({
            label: '検索データ',
            value: VALUE_TYPE_OPTIONS.find(item => item.value === valueType).text
        });
        const reportType = searchCondition.reportType || REPORT_TYPE_OPTIONS.daily;
        const dateOption = (valueType === VALUE_TYPE.realTime ? REALTIME_OPTIONS : DIGEST_OPTIONS).find(item => item.value === reportType);

        conditionTextStructure.push({
            label: dateOption.name,
            value: reportType === REPORT_TYPE_OPTIONS.period ?
                moment(searchCondition.startDate).format(dateOption.format) + ' - ' + moment(searchCondition.endDate).format(dateOption.format)
                : moment(searchCondition.startDate).format(dateOption.format)
        });

        // 出力間隔 または 積算種別
        if (valueType === VALUE_TYPE.realTime) {
            conditionTextStructure.push({
                label: '出力間隔',
                value: Object.values(EXPORT_SPAN).find(item => item.value === searchCondition.reportInterval).name
            });
        }

        conditionTextStructure.push({
            value: '換算表示' + (searchCondition.isConvert ? 'する' : 'しない')
        });

        return getSearchConditionString(conditionTextStructure);
    }

    /**
     * render
     */
    render() {
        const { authentication, initLookUp, condition, searchResult, displayInfo, validation, csvFileName, loginUser, searchCondition } = this.props;
        const { isReadOnly, level, loadAuthentication } = authentication;
        const { showModal, showEmbeddedReportOutputModal, showEmbeddedReportFormatModal, defaultReportTitle, modalTitle, modalMessage, isLoading } = this.state;
        return (
            <Content>
                <SearchConditionBox
                    targets={SEARCH_TARGETS}
                    visibleReportButton
                    visibleEmbeddedReportButton={loginUser}
                    onEmbeddedReportOutputButtonClick = {condition => { this.handleEmbeddedReportOutputButtonClick(condition)}}
                    onEmbeddedReportFormatButtonClick = {() => { this.handleEmbeddedReportFormatButtonClick()}}
                    lookUp={initLookUp}
                    searchButtonDisabled={!validation.canSearch}
                    isLoading={isLoading || !loadAuthentication}
                    onSearchClick={(condition) => this.handleSearchClick(condition)}
                    onReportClick={(condition) => this.handleReportClick(condition)}
                >
                    <ReportTypeSelectForm
                        condition={condition}
                        validationInfo={{ from: validation.startDate, to: validation.endDate }}
                        onChangeMDataType={(value) => this.props.setMDataType(value)}
                        onChangeDate={(start, end, showEnd) => this.props.setDate({ start: start, end: end, format:condition.format, showEnd:showEnd, isRealTime: (condition.measuredDataType === MDATA_TYPE_OPTIONS.realTime) })}
                        onChangeSummaryType={(type) => this.props.setSummaryType(type)}
                        onChangeReportType={(type, format, startDate, endDate, showEnd) => this.props.setReportType({ type: type, format: format, start: startDate, end: endDate, showEnd: showEnd })}
                        onChangeReportInterval={(interval) => this.props.setReportInterval(interval)}
                        onChangeIsConvert={(isConvert) => this.props.setIsConvert(isConvert)}
                    />
                </SearchConditionBox>
                <DataSearchResultBox
                    data={searchResult ? searchResult.rows : null}
                    headerSet={searchResult ? searchResult.headers : null}
                    dataTypes={initLookUp && initLookUp.dataTypes}
                    csvFileName={csvFileName}
                    isLoading={isLoading}
                />
                <MessageModal
                    title={modalTitle}
                    show={showModal}
                    bsSize={"sm"}
                    buttonStyle={"message"}
                    onCancel={() => this.clearMessageModalInfo()}
                >{modalMessage}
                </MessageModal>
                {
                    loginUser &&
                    <EmbeddedReportOutputModal
                        apiUrl={EMBEDDED_REPORT_API_URL}
                        show={showEmbeddedReportOutputModal}
                        onHide={() => { this.handleEmbeddedReportOutputModalClose(); }}
                        enterprises={loginUser && loginUser.enterprises}
                        mainEnterprise={loginUser && loginUser.mainEnterprise}
                        condition={{lookUp: searchCondition}}
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
                        lookUp={initLookUp}
                        loginUser={loginUser}
                        onHide={() => { this.handleEmbeddedReportFormatModalClose(); }}
                    >
                    </EmbeddedReportFormatModal>
                }
            </Content>
        );
    }

    /**
     * メッセージモーダルをクリアする
     */
    clearMessageModalInfo() {
        this.setState({
            showModal: false,
            modalTitle: null,
            modalMessage: null
        });
    }

    /**
     * CSVファイル名を作成する
     */
    generateCsvFileName(condition) {
        const dateTime = this.getDateTimeString(condition.reportType, condition.startDate, condition.endDate);
        if (condition.measuredDataType === MDATA_TYPE_OPTIONS.realTime) {
            const reportInterval = this.getReportIntervalString(condition.reportInterval);
            return MDATA_TYPE_OPTIONS.realTime + "_" + dateTime + reportInterval;
        }
        else {
            const summaryType = this.getSummaryTypeString(condition.summaryType);
            return MDATA_TYPE_OPTIONS.summary + "_" + dateTime + summaryType;
        }
    }

    /**
     * CSVファイル名の日時情報部分を取得する
     */
    getDateTimeString(reportType, startDate, endDate) {
        const format = this.getFormat(reportType);
        if (reportType === REPORT_TYPE_OPTIONS.period) {
            return moment(startDate).format(format) + "-" + moment(endDate).format(format);
        }
        else {
            return moment(startDate).format(format);
        }
    }

    /**
     * CSVファイル名の出力間隔情報部分を取得する
     */
    getFormat(reportType) {
        switch (reportType) {
            case REPORT_TYPE_OPTIONS.daily:
                return CSV_DATE_TIME_FORMAT.date;
            case REPORT_TYPE_OPTIONS.monthly:
                return CSV_DATE_TIME_FORMAT.month;
            case REPORT_TYPE_OPTIONS.annual:
                return CSV_DATE_TIME_FORMAT.year;
            default:
                return CSV_DATE_TIME_FORMAT.dateTime;
        }
    }

    /**
     * CSVファイル名の出力間隔情報部分を取得する
     */
    getReportIntervalString(reportInterval) {
        switch (reportInterval){
            case EXPORT_SPAN.oneMinute.value:
                return "(1min)";
            case EXPORT_SPAN.fiveMinutes.value:
                return "(5min)";
            case EXPORT_SPAN.tenMinutes.value:
                return "(10min)";
            default:
                return "";
        }
    }

    /**
     * CSVファイル名の積算種別情報部分を取得する
     */
    getSummaryTypeString(summaryType) {
        switch (summaryType) {
            case SUMMARY_TYPE.max.toString():
                return "(max)";
            case SUMMARY_TYPE.min.toString():
                return "(min)";
            case SUMMARY_TYPE.average.toString():
                return "(ave)";
            case SUMMARY_TYPE.snap.toString():
                return "(snp)";
            default:
                return "(diff)";
        }
    }
}

// Which props do we want to inject, given the global state?
// Note: use https://github.com/faassen/reselect for better performance.

/**
 * storeからstateを受け取り、propsに入れ込みます。
 */
const mapStateToProps = (state) => {
    return {
        initLookUp: state.initLookUp,
        loginUser: state.loginUser,
        authentication: state.authentication,
        condition: state.condition,
        searchResult: state.searchResult,
        displayInfo: state.displayInfo,
        validation: state.validation,
        csvFileName: state.csvFileName,
        searchCondition: state.searchCondition
    };
};

/**
 * 画面更新のアクションを設定します。
 * storeからActionを受け取り、propsに入れ込みます。
 */
const mapDispatchToProps = (dispatch) => {
    return {
        setAuthentication: (auth) => dispatch(setAuthentication(auth)),
        setInitLookUp: (data) => dispatch(setInitLookUp(data)),
        setLoginUser: (loginUser) => dispatch(setLoginUser(loginUser)),
        setMDataType: (data) => dispatch(setMDataType(data)),
        setDate: (data) => dispatch(setDate(data)),
        setSummaryType: (data) => dispatch(setSummaryType(data)),
        setReportType: (data) => dispatch(setReportType(data)),
        setReportInterval: (data) => dispatch(setReportInterval(data)),
        setSearchResult: (data) => dispatch(setSearchResult(data)),
        setRefine: (data) => dispatch(setRefine(data)),
        setCsvFileName: (name) => dispatch(setCsvFileName(name)),
        setSearchCondition: (name) => dispatch(setSearchCondition(name)),
        setIsConvert: (isConvert) => dispatch(setIsConvert(isConvert))
    };
};

// Wrap the component to inject dispatch and state into it
/**
 * mapStateToProps, mapDispatchToPropsをReduxと連携させる
 */
export default connect(mapStateToProps, mapDispatchToProps)(DataReportPanel);

 