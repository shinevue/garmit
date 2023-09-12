/**
 * @license Copyright 2021 DENSO
 * 
 * ICカード画面
 * 
 * 画面のコンテナとして。Reduxに依存したコードを記述します。
 * 画面のロジックはここに記述します。（適宜ファイル分割は行うこと）
 * 
 */
'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { browserHistory } from 'react-router';

import * as Actions from './actions.js';
import { setAuthentication } from 'Authentication/actions.js';
import { setDisplayState, setSearchResult } from 'SearchResult/actions.js';
import { setSearchCondition, setEditingCondition } from 'SearchCondition/actions.js';
import { setICCardSearchCondition, setEditingICCardCondition, setValidateICCardCondition } from 'ICCardSearchCondition/actions.js';
import { closeModal, confirmDelete } from 'ModalState/actions.js';
import { changeLoadState } from 'LoadState/actions.js';

import Content from 'Common/Layout/Content';
import SearchConditionBox from 'Assets/Condition/SearchConditionBox';
import { RegisterButton } from 'Assets/GarmitButton';
import MessageModal from 'Assets/Modal/MessageModal';
import WaitingMessage from 'Assets/Modal/WaitingMessage';

import ICCardListBox from 'ICCard/List/ICCardListBox';
import ICCardCondition from 'Assets/Condition/ICCardCondition';

import { VALIDATE_STATE, successResult } from 'inputCheck';
import { FUNCTION_ID_MAP, getAuthentication, readOnlyByLevel, LAVEL_TYPE } from 'authentication';


//検索条件のターゲット
const SEARCH_TARGETS = ['cardIds', 'cardNames', 'enterprises', 'enterpriseNames', 'loginUsers', 'userNames', 'userKanas', 'allowLocations'];

const OK_OPERATION_DELETE = 'delete';

/**
 * ICカード一覧画面のコンポーネント
 */
class ICCardListPanel extends Component {

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
        const { lookUp } = this.props.searchCondition;
        const { authentication } = this.props;

        if (!(authentication&&authentication.level)) {
            this.loadAuthentication();
        }

        if (!lookUp) {
            this.props.requestInitInfo();
            this.setDefaultICCardSearchCondition();
        }
        
        garmitFrame.refresh();
    }

    /**
     * render
     */
    render() {
        const { searchCondition, icCardSearchCondition, searchResult, searchDisabled } = this.props;
        const { modalState, waitingInfo, isLoading } = this.props;
        const { isReadOnly, level, loadAuthentication } = this.props.authentication;
        const loading = isLoading || !loadAuthentication;
        const readOnly = readOnlyByLevel(isReadOnly, level, LAVEL_TYPE.operator);

        return (
            <Content>
                {!readOnly&&
                    <div className="flex-center-right mb-05" >
                        <RegisterButton 
                            disabled={loading} 
                            onClick={() => this.props.requestGetNewICCard(this.transitionScreen)}
                        />
                    </div>                
                }
                <SearchConditionBox
                    targets={SEARCH_TARGETS}
                    icCardType={searchCondition.icCardType}
                    lookUp={searchCondition.lookUp}
                    searchCondition={searchCondition.editingCondition}
                    onChange={(condition) => this.changeSearchCondition(condition)}
                    onSearchClick={(condition) => this.searchICCardList(condition)}
                    onClear={() => this.clearCondition()}
                    searchButtonDisabled={searchDisabled || loading}
                    isLoading={loading}
                >
                    <ICCardCondition
                        condition={icCardSearchCondition.editingCondition}
                        validate={icCardSearchCondition.validate}
                        onChange={(condition, validate) => this.changeICCardCondition(condition, validate)}
                    />
                </SearchConditionBox>
                <ICCardListBox
                    isLoading={loading}
                    isReadOnly={readOnly}
                    icCardResult={searchResult.result}
                    tableSetting={searchResult.displayState}
                    onTableSettingChange={(setting) => this.props.setDisplayState(setting)}
                    onColumnSettingChanged={() => this.props.requestSearchList(false)}
                    onEdit={(nos) => this.handleEditClick(nos)}
                    onDelete={(nos) => this.handleDeletelick(nos)}                    
                />
                <MessageModal
                    show={modalState.show}
                    title={modalState.title}
                    bsSize="small"
                    buttonStyle={modalState.buttonStyle}
                    onOK={() => this.handleOK()}
                    onCancel={() => this.handleCloseModal()}
                    disabled={loading}
                >
                    {modalState.message && modalState.message.split(/\r\n|\n/).map((str) => <div>{str}</div>)}
                </MessageModal>
                <WaitingMessage show={waitingInfo.isWaiting} type={waitingInfo.waitingType} />
            </Content>
        );
    }
    
    //#region 権限情報読み込み
    
    /**
     * 権限情報を読み込む
     */
     loadAuthentication() {
        getAuthentication(FUNCTION_ID_MAP.icCard, (auth) => {
            this.props.setAuthentication(auth);
        });
    }

    //#endregion

    //#region 編集/削除関連

    /**
     * 編集ボタンクリックイベント
     * @param {array} cardNos カードNo一覧
     */
     handleEditClick(cardNos) {         
         if (cardNos.length === 1 ) {
            this.props.requestGetICCard(cardNos[0], this.transitionScreen);
         } else {
            this.props.requestGetICCards(cardNos, this.transitionScreen);
         }
    }

    /**
     * 削除ボタンクリックイベント
     * @param {array} nos カードNo一覧
     */
    handleDeletelick(nos) {
        this.props.setDeleteICCardNos(nos);
        this.props.confirmDelete({ targetName: '選択したICカード情報', okOperation: OK_OPERATION_DELETE});
    }

    //#endregion
    
    //#region メッセージモーダル

    /**
     * メッセージモーダルの確認ボタンクリックイベント
     */
     handleOK() {
        this.props.closeModal();
        const { okOperation } = this.props.modalState;
        if (okOperation === OK_OPERATION_DELETE) {
            this.props.requestDeleteICCards();
        }
    }

    /**
     * メッセージモーダルの閉じる（キャンセル）ボタンクリックイベント
     */
    handleCloseModal() {
        this.props.closeModal();
        const { okOperation } = this.props.modalState;
        if (okOperation === OK_OPERATION_DELETE) {
            this.props.setDeleteICCardNos(null);       //クリア
        }
    }

    //#endregion
    
    //#region 検索関連

    /**
     * 検索条件を変更する
     * @param {object} target 検索条件（固定項目）
     */
    changeSearchCondition(target) {
        var condition = _.cloneDeep(target);
        this.props.setEditingCondition(condition);
    }

    /**
     * ICカード検索条件を変更する
     * @param {object} target 検索条件（IOカード）
     * @param {object} validate 入力検証結果
     */
    changeICCardCondition(target, validate) {        
        var condition = _.cloneDeep(target);
        this.props.setEditingICCardCondition(condition, validate);
        if (this.hasError(validate, condition.dateSpecified)) {
            this.props.setSearchDisabled(true);
        } else { 
            this.props.setSearchDisabled(false);            
        }
    }

    /**
     * ICカード一覧を検索する
     * @param {object} condition 検索条件（固定項目）
     */
     searchICCardList(condition) {
        this.props.setSearchCondition(condition);
        this.props.setICCardSearchCondition(this.props.icCardSearchCondition.editingCondition);
        this.props.requestSearchList(true);
    }

    /**
     * 検索条件をクリアする
     */
    clearCondition() {
        this.setDefaultICCardSearchCondition();
        this.props.setSearchDisabled(false);
    }
    
    /**
     * 日付範囲のデフォルト値を返す（初期描画時と条件クリア時に使用）
     */
     getDefaultDateTimeSpan() {
        const t = moment().startOf('date');
        return {
            dateFrom: t.clone().subtract(3, 'months'),
            dateTo: t.clone().add(3, 'months'),
        };
    }

    /**
     * ICカード検索条件をデフォルトを返す
     */
    setDefaultICCardSearchCondition() {
        const condition = Object.assign({
                                dateSpecified: true,
                                isAdmin: true,
                                isNonAdmin: true,
                                isValid: true,
                                isInvalid: true,
                            }, this.getDefaultDateTimeSpan())
        this.props.setEditingICCardCondition(condition, { dateFrom: successResult, dateTo: successResult });
    }
    
    /**
     * 入力エラーがあるか
     * @param {object} validate 検証結果
     * @param {boolean} dateSpecified 日付期間を使用しているかどうか
     */
    hasError(validate, dateSpecified) {
        for (let key of Object.keys(validate)) {
            if (!dateSpecified && (key === 'dateFrom' || key === 'dateTo')) {
                continue;
            }
            if (validate[key].state === VALIDATE_STATE.error) {
                return true;
            }
        }
        return false;
    }

    //#endregion

    //#region 編集画面遷移
    
    /**
     * 画面遷移時の処理
     */
     transitionScreen = () => {
        browserHistory.push({ pathname: '/Maintenance/ICCard/Edit' });
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
        authentication: state.authentication,
        waitingInfo: state.waitingInfo,
        isLoading: state.isLoading,
        modalState: state.modalState,
        searchCondition: state.searchCondition,
        icCardSearchCondition: state.icCardSearchCondition,
        searchResult: state.searchResult,    
        searchDisabled: state.searchDisabled
    };
};

/**
 * 画面更新のアクションを設定します。
 * storeからActionを受け取り、propsに入れ込みます。
 */
const mapDispatchToProps = (dispatch) => {
    return {
        ...bindActionCreators(Actions, dispatch),
        closeModal: () => dispatch(closeModal()),
        setAuthentication: (auth) => dispatch(setAuthentication(auth)),
        setSearchCondition: (condition) => dispatch(setSearchCondition(condition)),
        setDisplayState: (setting) => dispatch(setDisplayState(setting)),
        setSearchResult: (result) => dispatch(setSearchResult(result)),
        setEditingCondition: (condition) => dispatch(setEditingCondition(condition)),
        setICCardSearchCondition: (condition) => dispatch(setICCardSearchCondition(condition)),
        setEditingICCardCondition: (condition, validate) => dispatch(setEditingICCardCondition(condition, validate)),
        setValidateICCardCondition: (validate) => dispatch(setValidateICCardCondition(validate)),
        changeLoadState:() => dispatch(changeLoadState()),
        confirmDelete:(data) => dispatch(confirmDelete(data))
    };
};

// Wrap the component to inject dispatch and state into it
/**
 * mapStateToProps, mapDispatchToPropsをReduxと連携させる
 */
export default connect(mapStateToProps, mapDispatchToProps)(ICCardListPanel);

 