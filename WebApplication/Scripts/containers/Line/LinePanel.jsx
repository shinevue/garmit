/**
 * @license Copyright 2020 DENSO
 * 
 * 回線一覧画面
 * 
 * 画面のコンテナとして。Reduxに依存したコードを記述します。
 * 画面のロジックはここに記述します。（適宜ファイル分割は行うこと）
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

import { Grid } from 'react-bootstrap';

import SearchConditionBox from 'Assets/Condition/SearchConditionBox';

import Content from 'Common/Layout/Content';
import SpecificationCondition from 'Assets/Condition/SpecificationCondition/SpecificationCondition';
import CheckboxSwitch from 'Common/Widget/CheckboxSwitch';
import MessageModal from 'Assets/Modal/MessageModal';

import LineListBox from 'Line/List/LineListBox';
import FileModal from 'Line/List/FileModal';
import FileSelectModal from 'Line/List/FileSelectModal';

import { FUNCTION_ID_MAP, getAuthentication } from 'authentication';
import { getSessionStorage, STORAGE_KEY } from 'webStorage';
import { createInitSearchCondition } from 'searchConditionUtility';

const SEARCH_TARGETS = ["idfConnects", "inConnects", "relConnects", "lineIds", "lineNames", "lineTypes", "userNames", "projectNos", "locations", "memos" ];
const FUNCTION_ID = FUNCTION_ID_MAP.line;

/**
 * 回線一覧画面のコンポーネント
 */
class LinePanel extends Component {

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
            let condition = createInitSearchCondition();
            condition.inUseOnly = false;
            this.props.setEditingCondition(condition);
        }
    }

    /**
     * コンポーネントがマウントされた時
     */
    componentDidMount() {
        const { lookUp } = this.props.searchCondition;
        const { authentication } = this.props;

        if (!(authentication&&authentication.level)) {
            const patchboardId = getSessionStorage(STORAGE_KEY.patchboardId);
            const cableNo = getSessionStorage(STORAGE_KEY.cableNo);
            this.loadAuthentication(patchboardId, cableNo);
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
        const { fileModalInfo, uploadModalInfo } = this.props;
        const { modalState, isLoading } = this.props;
        const { isReadOnly, loadAuthentication } = this.props.authentication;
        const loading = isLoading || !loadAuthentication;

        if (editingCondition) {
            var { patchCableConditionItems, inUseOnly } = editingCondition;
        }

        return (
            <Content>                
                <SearchConditionBox
                    targets={SEARCH_TARGETS}
                    lookUp={lookUp}
                    isLoading={loading}
                    searchCondition={editingCondition}
                    onChange={(condition) => this.props.setEditingCondition(condition)}
                    onSearchClick={(condition, isSavedCondition) => this.searchLineResult(condition, isSavedCondition)}
                    onClear={() => this.clearEditingCondition()}
                    searchButtonDisabled={searchDisabled}
                    useHotKeys
                    useSaveConditions
                    conditionList={conditionList}
                    functionId={FUNCTION_ID}
                >
                    <SpecificationCondition
                        searchItems={lookUp&&lookUp.patchCableConditionItems}
                        conditionItems={patchCableConditionItems}
                        onChange={(conditions, isError) => this.setPatchCableConditionItems(conditions, isError)}
                    />
                    <Grid className="mt-2" fluid>
                        <IncludedUnUseSwitch 
                            includedUnUsed={!inUseOnly}  
                            onChange={(checked) => this.setInUseOnlyConditon(!checked)}
                        />
                    </Grid>
                </SearchConditionBox>                
                <LineListBox
                    isLoading={loading}
                    isReadOnly={isReadOnly}
                    lineResult={searchResult.result}
                    tableSetting={searchResult.displayState}
                    onEdit={(patchboardId, cableNo) => this.props.requestGetPatchCableForm(patchboardId, cableNo, this.transitionScreen)} 
                    onUpload={(patchCableDataList) => this.props.setUploadModalInfo(true, patchCableDataList)}
                    onShowFileList={(patchCableData) => this.showFileModel(patchCableData)}
                    onTableSettingChange={(setting) => this.props.setDisplayState(setting)}
                    onColumnSettingChanged={() => this.props.requestGetLineList(FUNCTION_ID, false, false)}
                />
                <FileModal
                    show={fileModalInfo.show}
                    patchboardId={fileModalInfo.patchCableParameter.patchboardId}
                    cableNo={fileModalInfo.patchCableParameter.cableNo}
                    fileResult={fileModalInfo.fileResult}
                    isLoading={loading}
                    isReadOnly={isReadOnly}
                    onHide={() => this.props.setShowFileModal(false)}
                    onDeleteFiles={(patchCableData, fileNos) => this.props.requestDeleteLineFiles(patchCableData.patchboardId, patchCableData.cableNo, fileNos)}
                    onAddFile={(patchboardId, cableNo) => this.props.setUploadModalInfo(true, [{patchboardId, cableNo}])}
                />
                <FileSelectModal 
                    show={uploadModalInfo.show}
                    patchCableDataList={uploadModalInfo.patchCableParameters}
                    onSave={(PatchCableDataList, fileName, dataString, overwrite) => this.props.requestUploadLineFile(PatchCableDataList, fileName, dataString, overwrite)}
                    onCancel={() => this.props.setUploadModalInfo(false)}
                />
                <MessageModal show={modalState.show} 
                              title={modalState.title} 
                              bsSize="small"
                              buttonStyle={modalState.buttonStyle}
                              onCancel={() => this.handleCloseMessageModal()}>
                    {modalState.message && modalState.message.split(/\r\n|\n/).map((str) => <div>{str}</div>)}
                </MessageModal>
            </Content>
        );
    }

    //#region 権限情報読み込み
    
    /**
     * 権限情報を読み込む
     * @param {number} patchboardId 配線盤ID
     * @param {number} cableNo 線番
     */
    loadAuthentication(patchboardId, cableNo) {
        getAuthentication(FUNCTION_ID, (auth) => {
            this.props.setAuthentication(auth);
            const { isReadOnly } = this.props.authentication;              
            if (!isReadOnly && patchboardId && cableNo) {
                this.props.requestGetPatchCableForm(patchboardId, cableNo, this.transitionScreen)
            }
        });
    }

    //#endregion

    //#region 検索条件

    /**
     * 回線の詳細情報条件をセットする
     * @param {array} conditions 詳細条件リスト
     * @param {boolean} isError 条件でエラーとなっているかどうか
     */
    setPatchCableConditionItems(conditions, isError) {
        const editingCondition = Object.assign({}, this.props.searchCondition.editingCondition);
        editingCondition.patchCableConditionItems = conditions ? _.cloneDeep(conditions) : [];
        this.props.setEditingCondition(editingCondition);
        this.props.setSearchDisabled(isError);
    }

    /**
     * 使用中のみかどうかの検索条件をセットする
     * @param {boolean} inUseOnly 使用中のみ
     */
    setInUseOnlyConditon(inUseOnly) {
        const editingCondition = Object.assign({}, this.props.searchCondition.editingCondition);
        editingCondition.inUseOnly = inUseOnly;
        this.props.setEditingCondition(editingCondition);
    }
    
    /**
     * 条件をクリアする
     */
    clearEditingCondition() { 
        var condition = createInitSearchCondition(SEARCH_TARGETS);
        condition.patchCableConditionItems = [];
        condition.inUseOnly = false;
        this.props.setEditingCondition(condition);
        this.props.setSearchDisabled(false);
    }

    //#endregion

    //#region 検索

    /**
     * 回線を検索する
     * @param {object} condition 検索条件
     */
    searchLineResult(condition, isSavedCondition) {
        const { patchCableConditionItems, inUseOnly } = this.props.searchCondition.editingCondition;
        const searchCondition = _.cloneDeep(condition);
        searchCondition.patchCableConditionItems = patchCableConditionItems ? _.cloneDeep(patchCableConditionItems) : [];
        searchCondition.inUseOnly = inUseOnly;
        this.props.setSearchCondition(searchCondition);
        this.props.requestGetLineList(FUNCTION_ID, isSavedCondition, true);
    }

    //#endregion

    //#region ファイル関連

    /**
     * ファイル一覧モーダル表示
     * @param {object} patchCableData 配線盤ID/線番
     */
    showFileModel(patchCableData) {
        const { patchboardId, cableNo } = patchCableData;
        this.props.setShowFileModal(true, patchCableData);
        this.props.requestGetLineFileList(patchboardId, cableNo)
    }

    //#endregion

    //#region メッセージモーダル

    /**
     * メッセージモーダルを閉じる
     */
    handleCloseMessageModal() {
        const { okOperation } = this.props.modalState;
        this.props.closeModal();
        if (okOperation === 'hideUploadModal') {
            this.props.setUploadModalInfo(false);   //ファイル選択モーダルを閉じる
        }
    }

    //#endregion

    //#region 編集画面遷移

    /**
     * 画面遷移時の処理
     */
    transitionScreen = () => {
        browserHistory.push({ pathname: '/Line/Edit' });
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
        searchDisabled: state.searchDisabled,
        inUseOnly: state.inUseOnly,
        fileModalInfo: state.fileModalInfo,
        uploadModalInfo: state.uploadModalInfo
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
export default connect(mapStateToProps, mapDispatchToProps)(LinePanel);

/**
 * "未使用を含む"スイッチ
 */
const IncludedUnUseSwitch = ({ includedUnUsed, onChange: handleChange }) => {
    return (
        <CheckboxSwitch text="未使用を含む" 
                        bsSize="sm"
                        checked={includedUnUsed} 
                        onChange={(checked) => handleChange(checked)} 
        />
    );
}
