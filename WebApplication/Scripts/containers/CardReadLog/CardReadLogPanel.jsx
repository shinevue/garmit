/**
 * @license Copyright 2018 DENSO
 *
 * カード読み取りログ画面
 *
 * 画面のコンテナとして。Reduxに依存したコードを記述します。
 * 画面のロジックはここに記述します。（適宜ファイル分割は行うこと）
 *
 */
'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import  { Checkbox } from 'react-bootstrap';

import * as Actions from './actions';
import { setAuthentication } from 'Authentication/actions.js';
import { setSearchCondition, setEditingCondition } from 'SearchCondition/actions.js';
import { setDisplayState, setSearchResult } from 'SearchResult/actions.js';
import { closeModal } from 'ModalState/actions.js';
import { changeLoadState } from 'LoadState/actions.js';

import Content from 'Common/Layout/Content';
import SearchConditionBox from 'Assets/Condition/SearchConditionBox';
import DateTimeSpanForm from 'Common/Form/DateTimeSpanForm';

import MessageModal from 'Assets/Modal/MessageModal';

import CardReadLogListBox from 'CardReadLog/CardReadLogListBox';

import { validateDate, VALIDATE_STATE, errorResult } from 'inputCheck';
import { FUNCTION_ID_MAP, getAuthentication, readOnlyByLevel, LAVEL_TYPE } from 'authentication';



import { DATE_TIME_FORMAT} from 'constant';

const DATE_FORMAT = DATE_TIME_FORMAT.dateTime;

const SEARCH_CONDITION_TYPES = ['cardIds', 'cardNames', 'enterprises', 'enterpriseNames', 'loginUsers', 'userNames', 'userKanas', 'icTerminals'];

/**
 * カード読み取りログ画面のコンポーネント
 */
class CardReadLogPanel extends Component {

    /**
     * コンストラクタ
     */
    constructor(){
        super();
    }

    /**
     * 最初のレンダリング時にクライアントに一度だけ呼び出されます。
     * Componentがレンダリングされた直後に呼び出されるメソッドです。
     * ここでsetStateを行うと、renderがもう一度呼び出されるためあまり行わないほうがよいです。
     */
    componentDidMount() {
        this.loadAuthentication();
        this.props.requestInitInfo();
        this.setDefaultDateTimeCondition()

        garmitFrame.refresh();
    }

    /**
     * render
     */
    render() {
        const { searchCondition, editingDateCondition, dateSpecified, validateDate, searchResult, invaildSearch, authentication, isLoading, modalState } = this.props;
        const { loadAuthentication } = authentication;

        return (
            <Content>
                <SearchConditionBox
                    targets={SEARCH_CONDITION_TYPES}
                    icCardType={searchCondition.icCardType}
                    lookUp={searchCondition.lookUp}
                    searchCondition={searchCondition.editingCondition}
                    onChange={(condition) => this.changeConditon(condition)}
                    onSearchClick={(condition) => this.searchCardReadLogList(condition)}
                    onClear={() => this.setDefaultDateTimeCondition()}
                    searchButtonDisabled={invaildSearch || isLoading}
                    isLoading={isLoading || !loadAuthentication}
                >
                    <dl className="garmit-additional-condition">
                        <dt>
                            読み取り日時：
                        </dt>
                        <dd className={'mb-1'} style={{paddingTop: "7px"}}>
                            <Checkbox className="ma-1 mt-0" checked={!dateSpecified} onClick={() => this.changeDateSpecified()}>期間を指定しない</Checkbox>
                            <DateTimeSpanForm
                                from={editingDateCondition.startDate}
                                to={editingDateCondition.endDate}
                                format={DATE_FORMAT}
                                timePicker={true}
                                isReadOnly={!dateSpecified}
                                onChange={(from, to) => this.changeDateCondition(from, to)}
                                validationFrom={validateDate.startDate}
                                validationTo={validateDate.endDate}
                            />
                        </dd>
                    </dl>
                </SearchConditionBox>
                <CardReadLogListBox
                    cardReadLogResult={searchResult.result}
                    tableSetting={searchResult.displayState}
                    isLoading={isLoading}
                    onTableSettingChange={(setting) => this.props.setDisplayState(setting)}
                    onColumnSettingChanged={() => this.props.requestGetCardReadLogLis(false)}
                />
                <MessageModal
                    title={modalState.title}
                    show={modalState.show}
                    bsSize={"sm"}
                    buttonStyle={modalState.buttonStyle}
                    onCancel={() => this.props.closeModal()}
                    disabled={isLoading}
                >
                    {modalState.message}
                </MessageModal>
            </Content>
        );
    }

    //#region 権限情報読み込み

    /**
     * 権限情報を読み込む
     */
     loadAuthentication() {
        getAuthentication(FUNCTION_ID_MAP.cardReadLog, (auth) => {
            this.props.setAuthentication(auth);
        });
    }

    //#endregion

    //#region 検索条件

    /**
     * 検索条件を変更する
     * @param {object} target 検索条件
     */
    changeConditon(target) {
        var condition = _.cloneDeep(target);
        this.props.setEditingCondition(condition)
    }

    /**
     * 日付範囲を指定するかどうかを変更する
     */
    changeDateSpecified() {
        const { editingDateCondition, dateSpecified } = this.props;
        this.setDateCondittion(editingDateCondition.startDate, editingDateCondition.endDate, !dateSpecified);
    }

    /**
     * 読み取り日時条件を変更する
     * @param {date} start 開始日時
     * @param {date} end 終了日時
     */
    changeDateCondition(start, end) {
        this.setDateCondittion(start, end, this.props.dateSpecified);
    }

    /**
     * 日付範囲のデフォルト値を返す（初期描画時と条件クリア時に使用）
     */
     getDefaultDateTimeSpan() {
        const t = moment().startOf('minute');
        return {
            dateTo: t.clone(),
            dateFrom: t.clone().subtract(1, 'months'),
        };
    }

    /**
     * 期間のデフォルトをpropsに設定する
     */
    setDefaultDateTimeCondition() {
        const dateTime = this.getDefaultDateTimeSpan();
        this.setDateCondittion(dateTime.dateFrom, dateTime.dateTo, true);
    }

    
    /**
     * 期間条件を設定する
     * @param {any} from 開始日時
     * @param {any} to 終了日時
     * @param {bool} dateSpecified 日付範囲を指定するか
     */
    setDateCondittion(from, to, dateSpecified = true) {
        const obj = Object.assign({}, this.props.validateDate);
        if (dateSpecified) {
            obj.startDate = validateDate(from, DATE_FORMAT, false);
            obj.endDate = validateDate(to, DATE_FORMAT, false);
            if (obj.startDate.state == VALIDATE_STATE.success && obj.endDate.state == VALIDATE_STATE.success && !moment(to).isAfter(from)) {
                obj.endDate = errorResult('終了日は開始日以降となるように設定してください');
            }
        } else {
            obj.startDate = null;
            obj.endDate = null;
        }
        this.props.setEditingDateCondition(from, to, dateSpecified, obj);
    }

    //#endregion

    //#region 検索

    /**
     * カード読み取り一覧を検索する
     * @param {object} condition 固定検索条件
     */
    searchCardReadLogList(condition) {
        const { editingDateCondition, dateSpecified } = this.props;
        const lastCondition = this.makeLastSearchCondition(condition, editingDateCondition, dateSpecified);
        this.props.setLastSearchCondition(lastCondition);
        this.props.requestGetCardReadLogLis(true);
    }

    /**
     * カード読み取りログ検索時に送信する検索条件を作成する
     * @param {object} condition 固定検索条件
     * @param {object} dateCondition 日付範囲条件
     * @param {boolean} dateSpecified 日付範囲を指定しているか
     * @returns 
     */
    makeLastSearchCondition(condition, dateCondition, dateSpecified) {    
        const lastCondition = {
            lookUp: {
                enterprises: condition.enterprises ? _.cloneDeep(condition.enterprises) : [],
                loginUsers: condition.loginUsers ? _.cloneDeep(condition.loginUsers) : [],
                icTerminals: condition.icTerminals ? _.cloneDeep(condition.icTerminals) : []
            },
            iCCardCondition: {
                cardIds: condition.cardIds ? _.cloneDeep(condition.cardIds) : [],
                cardNames: condition.cardNames ? _.cloneDeep(condition.cardNames) : [],
                enterpriseNames: condition.enterpriseNames ? _.cloneDeep(condition.enterpriseNames) : [],
                userNames: condition.userNames ? _.cloneDeep(condition.userNames) : [],
                userKanas: condition.userKanas ? _.cloneDeep(condition.userKanas) : []
            }
        };
        if (dateSpecified) {
            lastCondition.lookUp.startDate = dateCondition.startDate.format('YYYY-MM-DD HH:mm') + ':00';
            lastCondition.lookUp.endDate = dateCondition.endDate.format('YYYY-MM-DD HH:mm') + ' :59';
        }
        return lastCondition;
    }

    //#endregion

}

// Which props do we want to inject, given the global state?
// Note: use https://github.com/faassen/reselect for better performance.

/**
 * storeからstateを受け取り、propsに入れ込みます。
 */
const mapStateToProps = (state) => {
    return {
        searchCondition: state.searchCondition,
        editingDateCondition: state.editingDateCondition,
        dateSpecified: state.dateSpecified,
        validateDate: state.validateDate,
        lastSearchCondition: state.lastSearchCondition,
        searchResult: state.searchResult,
        invaildSearch: state.invaildSearch,
        authentication: state.authentication,
        isLoading: state.isLoading,
        modalState: state.modalState
    };
};

/**
 * 画面更新のアクションを設定します。
 * storeからActionを受け取り、propsに入れ込みます。
 */
const mapDispatchToProps = (dispatch) => {
    return {
        ...bindActionCreators(Actions, dispatch),
        setAuthentication: (auth) => dispatch(setAuthentication(auth)),
        setSearchCondition: (condition) => dispatch(setSearchCondition(condition)),
        setDisplayState: (setting) => dispatch(setDisplayState(setting)),
        setSearchResult: (result) => dispatch(setSearchResult(result)),
        setEditingCondition: (condition) => dispatch(setEditingCondition(condition)),
        changeLoadState:() => dispatch(changeLoadState()),
        closeModal: () => dispatch(closeModal())
    };
};

// Wrap the component to inject dispatch and state into it
/**
 * mapStateToProps, mapDispatchToPropsをReduxと連携させる
 */
export default connect(mapStateToProps, mapDispatchToProps)(CardReadLogPanel);

