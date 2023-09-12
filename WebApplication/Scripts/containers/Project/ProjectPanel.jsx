/**
 * @license Copyright 2020 DENSO
 * 
 * 案件画面
 *  
 */
'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import { bindActionCreators } from 'redux';

import * as Actions from './actions.js';
import { setAuthentication } from 'Authentication/actions.js';
import { setDisplayState, setSearchResult } from 'SearchResult/actions.js';
import { setSearchCondition, setEditingCondition } from 'SearchCondition/actions.js';
import { closeModal, confirmDelete } from 'ModalState/actions.js';
import { changeLoadState } from 'LoadState/actions.js';

import Content from 'Common/Layout/Content';

import { RegisterHotKeyButton } from 'Assets/GarmitButton';
import SearchConditionBox from 'Assets/Condition/SearchConditionBox';
import SpecificationCondition from 'Assets/Condition/SpecificationCondition/SpecificationCondition';
import MessageModal from 'Assets/Modal/MessageModal';
import ProjectListBox from 'Project/List/ProjectListBox';

import { FUNCTION_ID_MAP, LAVEL_TYPE, getAuthentication, readOnlyByLevel } from 'authentication';
import { getSessionStorage, STORAGE_KEY } from 'webStorage';
import { createInitSearchCondition } from 'searchConditionUtility';

const SEARCH_TARGETS = [ "projectTypes", "projectNos", "lineTypes", "lineNames", "locations", "lineIds" ];
const FUNCTION_ID = FUNCTION_ID_MAP.project;

/**
 * Project画面のコンポーネント
 */
class ProjectPanel extends Component {

    /**
     * コンストラクタ
     */
    constructor(){
        super();
    }

    /**
     * コンポーネントがマウントされる前
     */
    componentWillMount() {
        const { editingCondition } = this.props.searchCondition;
        if (!editingCondition) {
            this.props.setEditingCondition(createInitSearchCondition())
        }
    }

    /**
     * コンポーネントがマウントされた時
     */
    componentDidMount() {
        const { lookUp } = this.props.searchCondition;
        const { authentication } = this.props;

        if (!(authentication&&authentication.level)) {
            const projectId = getSessionStorage(STORAGE_KEY.projectId);
            const functionId = this.getSessionStorageFunctionId();
            this.loadAuthentication(projectId, functionId);
        }

        if (!lookUp) {
            this.props.requestInitInfo(FUNCTION_ID);
        }

        garmitFrame.refresh();
    }

    /**
     * render
     */
    render() {
        const { searchCondition, searchResult, searchDisabled } = this.props;
        const { lookUp, editingCondition, conditionList } = searchCondition;
        const { modalState, isLoading } = this.props;
        const { isReadOnly, level, loadAuthentication } = this.props.authentication;
        const loading = isLoading || !loadAuthentication;        
        const readOnlyNormal = readOnlyByLevel(isReadOnly, level, LAVEL_TYPE.operator);
        return (
            <Content>
                {!readOnlyNormal&&
                    <div className="flex-center-right mb-05" >
                        <RegisterHotKeyButton disabled={loading} onClick={() => this.props.requestGetProjects(null, true, this.transitionScreen)} />
                    </div>                
                }
                <SearchConditionBox
                    targets={SEARCH_TARGETS}
                    lookUp={lookUp}
                    isLoading={loading}
                    searchCondition={editingCondition}
                    onChange={(condition) => this.props.setEditingCondition(condition)}
                    onSearchClick={(condition, isSavedCondition) => this.searchProjectResult(condition, isSavedCondition)}
                    onClear={() => this.clearEditingCondition()}
                    searchButtonDisabled={searchDisabled}
                    useHotKeys
                    useSaveConditions
                    conditionList={conditionList}
                    functionId={FUNCTION_ID}
                >
                    <SpecificationCondition
                        searchItems={lookUp&&lookUp.projectConditionItems}
                        conditionItems={editingCondition&&editingCondition.projectConditionItems}
                        onChange={(conditions, isError) => this.setProjectConditionItems(conditions, isError)}
                    />
                </SearchConditionBox>
                <ProjectListBox
                    isLoading={loading}
                    isReadOnly={isReadOnly}
                    hideEditButton={readOnlyNormal}
                    projectResult={searchResult.result}
                    tableSetting={searchResult.displayState}
                    onEdit={(ids) => this.props.requestGetProjects(ids, false, this.transitionScreen)} 
                    onTableSettingChange={(setting) => this.props.setDisplayState(setting)}
                    onColumnSettingChanged={() => this.props.requestGetProjectList(FUNCTION_ID, false, false)}
                    
                />
                <MessageModal show={modalState.show} 
                              title={modalState.title} 
                              bsSize="small"
                              buttonStyle={modalState.buttonStyle}
                              onCancel={() => this.props.closeModal()}>
                    {modalState.message && modalState.message.split(/\r\n|\n/).map((str) => <div>{str}</div>)}
                </MessageModal>
            </Content>
        );
    }

    
    //#region 権限情報読み込み
    
    /**
     * 権限情報を読み込む
     * @param {number} projectId 案件ID
     * @param {number} functionId 遷移前の機能ID
     */
    loadAuthentication(projectId, functionId) {
        getAuthentication(FUNCTION_ID, (auth) => {
            this.props.setAuthentication(auth);
            const { isReadOnly } = this.props.authentication;              
            if ((functionId === FUNCTION_ID_MAP.projectSchedule || !isReadOnly) && projectId) {
                this.props.requestGetProjects([ projectId ], false, this.transitionScreen);
            }
        });
    }

    //#endregion

    //#region 検索条件

    /**
     * 案件の詳細情報条件が変更された時
     * @param {array} conditions 詳細条件リスト
     * @param {boolean} isError 条件でエラーとなっているかどうか
     */
    setProjectConditionItems(conditions, isError) {
        const editingCondition = Object.assign({}, this.props.searchCondition.editingCondition);
        editingCondition.projectConditionItems = conditions ? _.cloneDeep(conditions) : [];
        this.props.setEditingCondition(editingCondition);
        this.props.setSearchDisabled(isError);
    }
    
    /**
     * 条件をクリアする
     */
    clearEditingCondition() { 
        var condition = createInitSearchCondition(SEARCH_TARGETS);
        condition.projectConditionItems = [];
        this.props.setEditingCondition(condition);
        this.props.setSearchDisabled(false);
    }

    //#endregion

    //#region 検索

    /**
     * 案件を検索する
     * @param {object} condition 検索条件
     */
    searchProjectResult(condition, isSavedCondition) {
        const { projectConditionItems } = this.props.searchCondition.editingCondition;
        const searchCondition = _.cloneDeep(condition);
        searchCondition.projectConditionItems = projectConditionItems ? _.cloneDeep(projectConditionItems) : [];
        this.props.setSearchCondition(searchCondition);
        this.props.requestGetProjectList(FUNCTION_ID, isSavedCondition, true);
    }

    //#endregion

    //#region 編集画面遷移

    /**
     * 画面遷移時の処理
     */
    transitionScreen = () => {
        browserHistory.push({ pathname: '/Project/Edit' });
    }

    //#endregion

    //#region その他

    /**
     * SesssionStorageから機能IDを取得
     */
    getSessionStorageFunctionId() {
        const functionId = getSessionStorage(STORAGE_KEY.functionId);
        return functionId && parseInt(functionId);
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
        changeLoadState:() => dispatch(changeLoadState()),
        confirmDelete:(data) => dispatch(confirmDelete(data))
    };
};

// Wrap the component to inject dispatch and state into it
/**
 * mapStateToProps, mapDispatchToPropsをReduxと連携させる
 */
export default connect(mapStateToProps, mapDispatchToProps)(ProjectPanel);

 