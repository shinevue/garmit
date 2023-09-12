/**
 * @license Copyright 2020 DENSO
 * 
 * Patchboard画面
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
import { setLookUp, setSearchCondition, setEditingCondition, setConditionList } from 'SearchCondition/actions.js';
import { setDisplayState, setSearchResult } from 'SearchResult/actions.js';
import { setWaitingState } from 'WaitState/actions.js';

import { Button, ButtonToolbar } from 'react-bootstrap';

import Content from 'Common/Layout/Content';

import { RegisterHotKeyButton } from 'Assets/GarmitButton';
import SearchConditionBox from 'Assets/Condition/SearchConditionBox';
import SpecificationCondition from 'Assets/Condition/SpecificationCondition/SpecificationCondition';
import MessageModal from 'Assets/Modal/MessageModal';
import WaitingMessage from 'Assets/Modal/WaitingMessage';

import PatchboardSearchResultListBox from 'Patchboard/PatchboardSearchResultListBox';
import PatchboardSortModal from 'Patchboard/PatchboardSortModal';

import { FUNCTION_ID_MAP, getAuthentication, LAVEL_TYPE, readOnlyByLevel } from 'authentication';
import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';
import { getSearchConditionList, createInitSearchCondition } from 'searchConditionUtility';
import { getSessionStorage, STORAGE_KEY } from 'webStorage';

const SEARCH_TARGETS = ["patchboardTypes", "patchboardNames", "locations", "patchCableTypes"];
const FUNCTION_ID = FUNCTION_ID_MAP.patchboard;

/**
 * Patchboard画面のコンポーネント
 */
class PatchboardPanel extends Component {

    /**
     * コンストラクタ
     */
    constructor() {
        super();
        this.state = {
            hasSpecificationConditionError: false,
            message: {},
            showSortModal: false
        };
    }

    /**
     * コンポーネントがマウントされる前
     */
    componentWillMount() {
        if (!this.props.searchCondition.editingCondition) {
            this.props.setEditingCondition(createInitSearchCondition(SEARCH_TARGETS))
        }
    }

    /**
     * 最初のレンダリング時にクライアントに一度だけ呼び出されます。
     * Componentがレンダリングされた直後に呼び出されるメソッドです。
     * ここでsetStateを行うと、renderがもう一度呼び出されるためあまり行わないほうがよいです。
     */
    componentDidMount() {
        const { lookUp, conditionList } = this.props.searchCondition;
        const { authentication } = this.props;

        const patchboardId = getSessionStorage(STORAGE_KEY.patchboardId);

        // 権限情報を取得
        if (!(authentication && authentication.level)) {
            this.loadAuthentication(patchboardId);
        }

        // マスターデータを取得
        if (!lookUp) {
            this.loadLookUp();
        }

        //保存済み検索条件一覧を取得
        if (!conditionList || conditionList.length <= 0) {
            this.loadSearchConditionList();
        }

        // 全配線盤を取得
        this.loadPatchboardList();

        // 前回の検索条件で配線盤一覧を読み込む
        if (this.props.searchCondition.conditions) {
            this.loadPatchboardResult(this.props.searchCondition.conditions);
        }

        garmitFrame.refresh();
    }

    /**
     * render
     */
    render() {
        const { searchResult, searchCondition, waitingInfo, isLoading } = this.props;
        const { lookUp, editingCondition, conditions, conditionList } = searchCondition;
        const { hasSpecificationConditionError, message, showSortModal } = this.state;
        const { isReadOnly, level, loadAuthentication } = this.props.authentication;

        const readonly = readOnlyByLevel(isReadOnly, level, LAVEL_TYPE.manager);

        return (
            <Content>
                <ButtonToolbar
                    className="flex-center-right mb-05"
                >
                    <Button
                        disabled={isLoading.condition || isLoading.result}
                        bsStyle="primary"
                        onClick={() => this.setState({ showSortModal: true })}
                    >
                        表示順変更
                    </Button>
                    {!readonly &&
                        <RegisterHotKeyButton
                            disabled={isLoading.condition || isLoading.result || !loadAuthentication}
                            onClick={() => this.handleAddClick()}
                        />
                    }
                </ButtonToolbar>
                <SearchConditionBox useHotKeys useSaveConditions
                    targets={SEARCH_TARGETS}
                    lookUp={lookUp}
                    isLoading={isLoading.condition || !loadAuthentication || isLoading.conditionList}
                    onChange={(condition) => this.onSearchConditionChange(condition)}
                    searchCondition={editingCondition}
                    onSearchClick={(condition, isSavedCondition) => this.handleSearchClick(condition, isSavedCondition)}
                    searchButtonDisabled={isLoading.result || hasSpecificationConditionError}
                    conditionList={conditionList}
                    functionId={FUNCTION_ID}
                >
                    <SpecificationCondition
                        searchItems={lookUp && lookUp.patchboardConditionItems}
                        conditionItems={editingCondition && editingCondition.patchboardConditionItems}
                        onChange={(conditions, isError) => this.onPatchboardConditionItemsChange(conditions, isError)}
                    />
                </SearchConditionBox>
                <PatchboardSearchResultListBox
                    isLoading={isLoading.result}
                    isReadOnly={readonly}
                    patchboardResult={searchResult.result}
                    tableSetting={searchResult.displayState}
                    onTableSettingChange={(setting) => this.props.setDisplayState(setting)}
                    onColumnSettingChanged={() => this.loadPatchboardResult(conditions, false)}
                    onEdit={(ids) => this.handleEditClick(ids)}
                    onDelete={(ids) => this.handleDeleteClick(ids)}
                    onDetail={(id) => this.handleDetailClick(id)}
                />
                <PatchboardSortModal
                    show={showSortModal}
                    onSaved={conditions != null && (() => this.loadPatchboardResult(conditions, false))}
                    onHide={() => this.setState({ showSortModal: false })}
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
                    {message.message && message.message.split(/\r\n|\n/).map((str) => <div>{str}</div>)}
                </MessageModal>
                <WaitingMessage show={waitingInfo.isWaiting} type={waitingInfo.waitingType} />
            </Content>
        );
    }


    /********************************************
     * データ読み込み、保存、削除
     ********************************************/

    /**
     * 権限情報を取得する
     */
    loadAuthentication(patchboardId) {
        getAuthentication(FUNCTION_ID, (auth) => {
            this.props.setAuthentication(auth);
            const { isReadOnly, level } = this.props.authentication;
            const readonly = readOnlyByLevel(isReadOnly, level, LAVEL_TYPE.manager)
            if (!readonly && patchboardId) {
                this.moveToEditPage([patchboardId]);
            }
        });
    }

    /**
     * 画面の初期データを非同期で読み込む
     */
    loadLookUp() {
        this.props.setLoadState_condition(true);
        sendData(EnumHttpMethod.get, '/api/patchboard/lookUp', null, (lookUp, networkError) => {
            this.props.setLoadState_condition(false);
            if (networkError) {
                this.showNetWorkErrorMessage();
            } else if (lookUp) {
                this.props.setLookUp(lookUp);
            } else {
                this.showErrorMessage('初期情報の取得に失敗しました。');
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
     * 全配線盤情報を取得する
     */
    loadPatchboardList() {
        this.props.setLoadState_condition(true);
        sendData(EnumHttpMethod.get, '/api/patchboard/all', null, (patchboards, networkError) => {
            this.props.setLoadState_condition(false);
            if (networkError) {
                this.showNetWorkErrorMessage();
            } else if (patchboards) {
                this.props.setPatchboardList(patchboards);
            } else {
                this.showErrorMessage('初期情報の取得に失敗しました。');
            }
        });
    }

    /**
     * 配線盤一覧を読み込む
     * @param {any} condition
     * @param {any} showMessage
     */
    loadPatchboardResult(condition, showMessage = true) {
        const postData = {
            lookUp: condition,
            patchboardNames: condition.patchboardNames
        };

        this.props.setLoadState_result(true);
        sendData(EnumHttpMethod.post, '/api/patchboard/search', postData, (searchResult, networkError) => {
            this.props.setLoadState_result(false);
            if (networkError) {
                this.showNetWorkErrorMessage();
            } else if (searchResult) {
                this.props.setSearchResult(searchResult);
                if (showMessage && searchResult && searchResult.rows && searchResult.rows.length === 0) {
                    this.setState({
                        message: {
                            show: true,
                            buttonStyle: 'message',
                            title: '検索',
                            message: '検索条件に該当する配線盤がありません。',
                            onCancel: () => this.clearMessage()
                        }
                    });
                }
            } else {
                this.showErrorMessage('配線盤一覧の取得に失敗しました。');
            }
        });
    }

    /**
     * 空の配線盤を取得する
     * @param {any} callback
     */
    loadNewPatchboardForm(callback) {
        this.props.setLoadState(true);
        sendData(EnumHttpMethod.get, '/api/patchboard/newForm', null, (patchboardForm, networkError) => {
            this.props.setLoadState(false);
            if (networkError) {
                this.showNetWorkErrorMessage();
            } else {
                const newPatchboardForm = Object.assign({}, patchboardForm);
                patchboardForm.patchboard.startNo = 1;
                patchboardForm.patchboard.endNo = null;
                this.props.setPatchboardForm(patchboardForm);
            }
            if (callback) {
                callback(patchboardForm)
            }
        });
    }

    /**
     * 配線盤編集情報を取得する
     * @param {any} patchboardId
     * @param {any} callback
     */
    loadPatchboardForm(patchboardId, callback) {
        const postData = { patchboardId: patchboardId };

        this.props.setLoadState(true);
        sendData(EnumHttpMethod.post, '/api/patchboard/form', postData, (patchboardForm, networkError) => {
            this.props.setLoadState(false);
            if (networkError) {
                this.showNetWorkErrorMessage();
            } else {
                this.props.setPatchboardForm(patchboardForm);
            }
            if (callback) {
                callback(patchboardForm);
            }
        });
    }

    /**
     * 配線盤情報を取得する
     * @param {any} patchboardIds
     * @param {any} callback
     */
    loadPatchboards(patchboardIds, callback) {
        const postData = { patchboardIds: patchboardIds };

        this.props.setLoadState(true);
        sendData(EnumHttpMethod.post, '/api/patchboard/bulkGet', postData, (patchboards, networkError) => {
            this.props.setLoadState(false);
            if (networkError) {
                this.showNetWorkErrorMessage();
            } else {
                this.props.setPatchboards(patchboards);
            }
            if (callback) {
                callback(patchboards);
            }
        });
    }

    /**
     * 配線盤情報を削除する
     * @param {any} patchboardIds
     */
    deletePatchboards(patchboardIds) {
        const bulk = patchboardIds.length !== 1;
        const url = bulk ? '/api/patchboard/bulkDelete' : '/api/patchboard/delete';
        const postData = bulk ? { patchboardIds: patchboardIds } : { patchboardId: patchboardIds[0] };

        this.props.setWaitingState(true, 'delete');
        sendData(EnumHttpMethod.post, url, postData, (result, networkError) => {
            this.props.setWaitingState(false);
            if (networkError) {
                this.showNetWorkErrorMessage();
            } else {
                if (result && result.isSuccess) {
                    this.loadPatchboardResult(this.props.searchCondition.conditions);
                    this.loadPatchboardList();
                }
                this.setState({
                    message: {
                        show: true,
                        title: '削除',
                        buttonStyle: 'message',
                        message: result && result.message,
                        onCancel: () => this.clearMessage()
                    }
                });
            }
        });
    }

    /**
     * 配線盤先祖ツリーを取得する
     * @param {any} patchboardId
     * @param {any} callback
     */
    loadAncestorsTree(patchboardId, callback) {
        const postData = { patchboardId: patchboardId };
        this.props.setLoadState(true);
        sendData(EnumHttpMethod.post, '/api/patchboard/tree/ancestors', postData, (trees) => {
            this.props.setLoadState(false);
            if (networkError) {
                this.showNetWorkErrorMessage();
            } else {
                this.props.setPatchboards(patchboards);
            }
            if (callback) {
                callback(patchboardForm);
            }
        });
    }


    /********************************************
     * イベントハンドラ
     ********************************************/

    /**
     * 検索ボタンクリック
     * @param {any} condition
     */
    handleSearchClick(condition, isSavedCondition) {
        this.props.setSearchCondition(condition);
        this.loadPatchboardResult(condition, true);        
        isSavedCondition && this.loadSearchConditionList();
    }

    /**
     * 新規登録ボタンクリック
     */
    handleAddClick() {
        this.moveToEditPage();
    }

    /**
     * 編集ボタンクリック
     * @param {any} patchboardIds
     */
    handleEditClick(patchboardIds) {
        this.moveToEditPage(patchboardIds);
    }

    /**
     * 削除ボタンクリック
     */
    handleDeleteClick(patchboardIds) {
        this.setState({
            message: {
                show: true,
                title: '削除',
                buttonStyle: 'delete',
                message: '選択した配線盤を削除してもよろしいですか？',
                onCancel: () => this.clearMessage(),
                onOK: () => {
                    this.clearMessage();
                    this.deletePatchboards(patchboardIds);
                }
            }
        });
    }

    /**
     * 配線盤系統表示クリック
     * @param {any} patchboardId
     */
    handleDetailClick(patchboardId) {
        this.props.setDispPatchboardId(patchboardId);
        browserHistory.push({ pathname: '/Patchboard/Disp' });
    }

    /**
     * 検索条件が変更されたとき
     * @param {any} condition
     */
    onSearchConditionChange(condition) {
        this.props.setEditingCondition(condition);
    }

    /**
     * 配線盤詳細検索条件が変更された時
     * @param {any} conditions
     * @param {any} isError
     */
    onPatchboardConditionItemsChange(conditions, isError) {
        const editingCondition = Object.assign({}, this.props.searchCondition.editingCondition);
        editingCondition.patchboardConditionItems = conditions;

        this.props.setEditingCondition(editingCondition);
        this.setState({ hasSpecificationConditionError: isError });
    }


    /********************************************
     * その他
     ********************************************/

    /**
     * 編集ページに遷移する
     * @param {any} patchboardIds
     */
    moveToEditPage(patchboardIds) {
        if (!patchboardIds || patchboardIds.length == 0) {
            this.props.setBulkMode(false);
            this.loadNewPatchboardForm((form) => {
                if (form) {
                    browserHistory.push({ pathname: '/Patchboard/Edit' });
                }
            });
        } else if (patchboardIds.length == 1) {
            this.props.setBulkMode(false);
            this.loadPatchboardForm(patchboardIds[0], (form) => {
                if (form) {
                    browserHistory.push({ pathname: '/Patchboard/Edit' });
                }
            });
        } else {
            this.props.setBulkMode(true);
            this.loadPatchboards(patchboardIds, (patchboards) => {
                if (patchboards) {
                    browserHistory.push({ pathname: '/Patchboard/Edit' });
                }
            });
        }
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
     * メッセージを消す
     */
    clearMessage() {
        this.setState({ message: Object.assign({}, this.state.message, { show: false }) });
    }

}

// Which props do we want to inject, given the global state?
// Note: use https://github.com/faassen/reselect for better performance.

/**
 * storeからstateを受け取り、propsに入れ込みます。
 */
const mapStateToProps = (state) => {
    return {
        authentication: state.authentication,
        searchCondition: state.searchCondition,
        searchResult: state.searchResult,
        waitingInfo: state.waitingInfo,
        isLoading: state.isLoading,
        patchboardList: state.patchboardList
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
        setLookUp: (lookUp) => dispatch(setLookUp(lookUp)),
        setEditingCondition: (condition) => dispatch(setEditingCondition(condition)),
        setSearchCondition: (condition) => dispatch(setSearchCondition(condition)),
        setConditionList: (conditionList) => dispatch(setConditionList(conditionList)),
        setDisplayState: (setting) => dispatch(setDisplayState(setting)),
        setSearchResult: (result) => dispatch(setSearchResult(result)),
        setWaitingState: (isWaiting, type) => dispatch(setWaitingState(isWaiting, type))
    };
};

// Wrap the component to inject dispatch and state into it
/**
 * mapStateToProps, mapDispatchToPropsをReduxと連携させる
 */
export default connect(mapStateToProps, mapDispatchToProps)(PatchboardPanel);

 