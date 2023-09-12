/**
 * @license Copyright 2019 DENSO
 * 
 * 電気錠設定一覧画面のReactコンポーネント
 * 
 */

'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import { getSessionStorage, setSessionStorage, STORAGE_KEY } from 'webStorage';
import { browserHistory } from 'react-router';

import { Row, Col } from 'react-bootstrap';

import Content from 'Common/Layout/Content';
import Button from 'Common/Widget/Button';

import SearchConditionBox from 'Assets/Condition/SearchConditionBox';
import MessageModal from 'Assets/Modal/MessageModal';
import WaitingMessage from 'Assets/Modal/WaitingMessage';

import ElectricLockSettingListBox from 'ElectricLockSetting/ElectricLockSettingListBox';

import { FUNCTION_ID_MAP, LAVEL_TYPE, getAuthentication } from 'authentication';
　　
import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';

import { KEY_TYPE_ID } from 'constant';

import { setAuthentication } from 'Authentication/actions.js';
import { setLookUp, setSearchCondition, setEditingCondition } from 'SearchCondition/actions.js';
import { setDisplayState, setSearchResult } from 'SearchResult/actions.js';
import { setWaitingState } from 'WaitState/actions.js';
import { setLoadState, setLoadState_condition, setLoadState_result, setEditedERackSets } from './actions.js';

class ElectricLockSettingListPanel extends Component {

    constructor(){
        super();
        this.state = {
            message: {},
        };
    }

    /**
     * コンポーネントがマウントされた時
     */
    componentDidMount() {
        this.loadAuthentication();

        if (!this.props.searchCondition.lookUp) {
            this.loadLookUp();
        }

        this.updateERackSetResult(false);

        garmitFrame.refresh();
    }

    /**
     * 検索ボタンがクリックされたとき
     * @param {any} condition
     */
    onSearchClick(condition) {
        this.props.setSearchCondition(condition);
        this.loadERackSetResult(condition);
    }

    /**
     * 編集ボタンがクリックされた時
     * @param {any} eRackSetIds
     */
    onEditClick(eRackSetIds) {
        this.loadERackSets(eRackSetIds, (eRackSets) => {
            if (eRackSets && this.isEditable(eRackSets)) {
                browserHistory.push({ pathname: '/Maintenance/ElectricLockSetting/Edit', query: { mode: 'edit' } });
            } 
        });
    }

    /**
     * 追加ボタンがクリックされた時
     */
    onAddClick() {
        this.props.setEditedERackSets([{
            eRackSetId: -1,
            lockType: KEY_TYPE_ID.electricKey,
            target: 3,
            lockedOpenErrOcBlindTime: 60,
            lockedOpenErrRcBlindTime: 60
        }]);
        browserHistory.push({ pathname: '/Maintenance/ElectricLockSetting/Edit', query: { mode: 'add' } });
    }

    /**
     * 削除ボタンがクリックされた時
     * @param {any} eRackSetIds
     */
    onDeleteClick(eRackSetIds) {
        this.setState({
            message: {
                show: true,
                buttonStyle: 'delete',
                title: '削除',
                message: '選択した電気錠設定を削除してもよろしいですか？',
                onCancel: () => this.clearMessage(),
                onOK: () => {
                    this.clearMessage();
                    this.deleteERackSets(eRackSetIds);
                }
            }
        })
    }

    /**
     * 検索条件が変更されたとき
     * @param {any} condition
     */
    onSearchConditionChange(condition) {
        this.props.setEditingCondition(condition);
    }

    /**
     * データテーブルの表示が変更された時
     * @param {any} setting
     */
    onTableSettingChange(setting) {
        this.props.setDisplayState(setting);
    }

    /**
     * 権限情報を取得する
     */
    loadAuthentication() {
        getAuthentication(FUNCTION_ID_MAP.elecKeyEdit, (auth) => {
            this.props.setAuthentication(auth);
        });
    }

    /**
     * マスターデータを読み込む
     */
    loadLookUp() {
        this.props.setLoadState_condition(true);
        sendData(EnumHttpMethod.get, '/api/ElectricLockSetting', null, (lookUp, networkError) => {
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
     * 電気錠設定一覧を読み込む
     * @param {any} condition
     * @param {any} showMessage
     */
    loadERackSetResult(condition, showMessage = true) {
        this.props.setLoadState_result(true);
        sendData(EnumHttpMethod.post, '/api/ElectricLockSetting/getERackSetList', condition, (result, networkError) => {
            this.props.setLoadState_result(false);
            if (networkError) {
                this.showNetWorkErrorMessage();
            } else {
                this.props.setSearchResult(result);
                if (showMessage && result && result.rows && result.rows.length === 0) {
                    this.setState({
                        message: {
                            show: true,
                            buttonStyle: 'message',
                            title: '検索',
                            message: '検索条件に該当する電気錠設定がありません。',
                            onCancel: () => this.clearMessage()
                        }
                    });
                }
            }
        });
    }

    /**
     * 電気錠設定を読み込む
     * @param {any} eRackSetIds
     * @param {any} callback
     */
    loadERackSets(eRackSetIds, callback) {
        this.props.setLoadState(true);
        sendData(EnumHttpMethod.post, '/api/ElectricLockSetting/getERackSets', eRackSetIds, (eRackSets, networkError) => {
            this.props.setLoadState(false);
            if (networkError) {
                this.showNetWorkErrorMessage();
            } else {
                if (this.isEditable(eRackSets)) {
                    this.props.setEditedERackSets(eRackSets);
                } else {
                    this.showErrorMessage('物理錠が含まれているため、一括編集することができません。');
                } 
            }
            if (callback) {
                callback(eRackSets);
            }
        });
    }

    /**
     * 電気錠設定を削除する
     * @param {any} eRackSetIds
     */
    deleteERackSets(eRackSetIds) {
        const multiple = eRackSetIds.length > 1;
        const method = multiple ? EnumHttpMethod.post : EnumHttpMethod.get;
        const url = multiple ? '/api/ElectricLockSetting/deleteERackSets' : ('/api/ElectricLockSetting/deleteERackSet?eRackSetId=' + eRackSetIds[0]);
        const sendingData = multiple ? eRackSetIds : null;

        this.props.setWaitingState(true, 'delete');
        sendData(method, url, sendingData, (result, networkError) => {
            this.props.setWaitingState(false);
            if (networkError) {
                this.showNetWorkErrorMessage();
            } else {
                if (result && result.isSuccess) {
                    this.updateERackSetResult();
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
     * 電気錠設定一覧を更新する
     */
    updateERackSetResult(showMessage = true) {
        if (this.props.searchCondition.conditions) {
            this.loadERackSetResult(this.props.searchCondition.conditions, showMessage);
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
     * メッセージをクリアする
     */
    clearMessage() {
        this.setState({ message: Object.assign({}, this.state.message, { show: false }) });
    }

    /**
     * 編集可能かどうか
     * @param {array} eRackSets 電気錠ラックリスト
     */
     isEditable(eRackSets) {
        return eRackSets.length === 1 || eRackSets.every((erack) => erack.lockType === KEY_TYPE_ID.electricKey);
    }

    /**
     * render
     */
    render() {
        const { isLoading, searchCondition, searchResult, waitingInfo } = this.props;
        const { message } = this.state;
        const { isReadOnly, level, loadAuthentication } = this.props.authentication;
        
        return (
            <Content>
                {!isReadOnly && (level === LAVEL_TYPE.manager || level === LAVEL_TYPE.administrator) &&
                    <div className="clearfix mb-05">
                        <Button
                            className="pull-right"
                            iconId="add"
                            disabled={isLoading.condition || isLoading.result}
                            onClick={() => this.onAddClick()}
                        >
                            新規登録
                        </Button>
                    </div>
                }
                <SearchConditionBox
                    isLoading={isLoading.condition || !loadAuthentication}
                    targets={['locations', 'enterprises']}
                    lookUp={searchCondition.lookUp}
                    searchCondition={searchCondition.editingCondition}
                    onChange={(condition) => this.onSearchConditionChange(condition)}
                    onSearchClick={(condition) => this.onSearchClick(condition)}
                    searchButtonDisabled={isLoading.result}
                />                
                <ElectricLockSettingListBox
                    isReadOnly={isReadOnly}
                    level={level}
                    isLoading={isLoading.result}
                    searchResult={searchResult.result}
                    tableSetting={searchResult.displayState}
                    onTableSettingChange={(setting) => this.onTableSettingChange(setting)}
                    onColumnSettingChange={() => this.updateERackSetResult(false)}
                    onEditClick={(ids) => this.onEditClick(ids)}
                    onDeleteClick={(ids) => this.onDeleteClick(ids)}
                    onAddClick={() => this.onAddClick()}
                />
                <MessageModal
                    show={message.show}
                    title={message.title}
                    bsSize="small"
                    buttonStyle={message.buttonStyle}
                    onOK={message.onOK}
                    onCancel={message.onCancel}
                >
                    {message.message && message.message.split(/\r\n|\n/).map((str) => <div>{str}</div>)}
                    {message.buttonStyle==='delete'&&
                        <div className="mt-1">   
                            <strong>
                                <div>!!!注意!!</div>
                                <div>電気錠ログも全て削除されます。</div>
                            </strong>                     
                        </div>
                    }
                </MessageModal>
                <WaitingMessage show={waitingInfo.isWaiting} type={waitingInfo.waitingType} />
            </Content>
        );
    }    
}

// Which props do we want to inject, given the global state?
// Note: use https://github.com/faassen/reselect for better performance.
const mapStateToProps = (state) => {
    return {
        authentication: state.authentication,
        searchCondition: state.searchCondition,
        searchResult: state.searchResult,
        waitingInfo: state.waitingInfo,
        isLoading: state.isLoading,
        editedERackSets: state.editedERackSets
    };
};

//画面更新のアクションを設定します。
const mapDispatchToProps = (dispatch) => {
    return {
        setAuthentication: (auth) => dispatch(setAuthentication(auth)),
        setLookUp: (lookUp) => dispatch(setLookUp(lookUp)),
        setEditingCondition: (condition) => dispatch(setEditingCondition(condition)),
        setSearchCondition: (condition) => dispatch(setSearchCondition(condition)),
        setDisplayState: (setting) => dispatch(setDisplayState(setting)),
        setSearchResult: (result) => dispatch(setSearchResult(result)),
        setWaitingState: (isWaiting, waitingType) => dispatch(setWaitingState(isWaiting, waitingType)),
        changeLoadState: () => dispatch(changeLoadState()),
        setLoadState: (isLoading) => dispatch(setLoadState(isLoading)),
        setLoadState_condition: (isLoading) => dispatch(setLoadState_condition(isLoading)),
        setLoadState_result: (isLoading) => dispatch(setLoadState_result(isLoading)),
        setEditedERackSets: (eRackSets) => dispatch(setEditedERackSets(eRackSets))
    };
};

// Wrap the component to inject dispatch and state into it
export default connect(mapStateToProps, mapDispatchToProps)(ElectricLockSettingListPanel);

 