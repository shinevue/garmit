/**
 * @license Copyright 2019 DENSO
 * 
 * 制御履歴画面
 * 
 * 画面のコンテナとして。Reduxに依存したコードを記述します。
 * 画面のロジックはここに記述します。（適宜ファイル分割は行うこと）
 * 
 */
'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as Actions from './actions';
import { setAuthentication } from 'Authentication/actions.js';
import { setSearchCondition, setEditingCondition } from 'SearchCondition/actions.js';
import { setDisplayState, setSearchResult } from 'SearchResult/actions.js';
import { closeModal } from 'ModalState/actions.js';
import { changeLoadState } from 'LoadState/actions.js';

import Content from 'Common/Layout/Content';
import SearchConditionBox from 'Assets/Condition/SearchConditionBox';
import MessageModal from 'Assets/Modal/MessageModal';
import ControlLogCondition from 'ControlLog/ControlLogCondition';
import ControlLogListBox from 'ControlLog/ControlLogListBox';

//検索条件のターゲット
const SEARCH_TARGETS = ['locations', 'loginUsers'];

/**
 * 制御履歴画面のコンポーネント
 */
class ControlLogPanel extends Component {

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
        this.props.requestInitInfo();
    }

    /**
     * render
     */
    render() {
        const { searchCondition, editSpecificCondition, controlTypes, searchResult, invaildSearch, modalState, isLoading } = this.props;
        return (
            <Content>
                <SearchConditionBox
                    targets={SEARCH_TARGETS}
                    lookUp={searchCondition.lookUp}
                    searchCondition={searchCondition.editingCondition}
                    onChange={this.changeConditon}
                    onSearchClick={this.searchControlLogList}
                    onClear={this.clearCondition}
                    searchButtonDisabled={invaildSearch}
                    isLoading={isLoading}                    
                >
                    <ControlLogCondition
                        controlTypes={controlTypes}
                        selectedControlTypes={editSpecificCondition.controlTypes}
                        startDate={editSpecificCondition.startDate}
                        endDate={editSpecificCondition.endDate}
                        onChangeDateTime={this.changeDateCondition}
                        onChangeControlTypes={this.changeControlTypeCondition}
                    />
                </SearchConditionBox>
                <ControlLogListBox
                    controlLogResult={searchResult.result}
                    tableSetting={searchResult.displayState}
                    isLoading={isLoading}   
                    onTableSettingChange={(setting) => this.props.setDisplayState(setting)}
                    onColumnSettingChanged={() => this.props.requestGetControlLogList(false)}
                />
                <MessageModal
                    title={modalState.title}
                    show={modalState.show}
                    bsSize={"sm"}
                    buttonStyle={modalState.buttonStyle}
                    onCancel={() => this.props.closeModal()}
                >
                    {modalState.message}
                </MessageModal>
            </Content>
        );
    }
    
    //#region 検索条件

    /**
     * 検索条件を変更する
     * @param {object} target 検索条件
     */
    changeConditon = (target) => {
        var condition = _.cloneDeep(target);
        this.props.setEditingCondition(condition);
    }

    /**
     * 実行日時条件を変更する
     * @param {date} start 開始日時
     * @param {date} end 終了日時
     * @param {boolean} isError エラーかどうか
     */
    changeDateCondition = (start, end, isError) => {
        this.props.setDateCondition(start, end);
        this.props.setInvaild(isError);
    }

    /**
     * 実行種別条件を変更する
     * @param {array} types 実行種別一覧
     * @param {boolean} isError エラーかどうか
     */
    changeControlTypeCondition = (types, isError) => {
        this.props.setControlTypeCondition(types);
        this.props.setInvaild(isError);
    }

    /**
     * 検索条件をクリアする
     */
    clearCondition = () => {
        const { controlTypes } = this.props;
        this.props.setEditingCondition(null);
        this.props.clearSpecificCondition(controlTypes && Object.keys(controlTypes));
    }

    //#endregion

    //#region 検索

    /**
     * 制御ログを検索する
     * @param {object} condition 検索条件
     */
    searchControlLogList = (condition) => {
        this.props.setSearchCondition(condition);
        this.props.setSpecificCondition(this.props.editSpecificCondition);
        this.props.requestGetControlLogList(true);
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
        controlTypes: state.controlTypes,
        searchCondition: state.searchCondition,
        specificCondition: state.specificCondition,
        editSpecificCondition: state.editSpecificCondition,
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
export default connect(mapStateToProps, mapDispatchToProps)(ControlLogPanel);

 