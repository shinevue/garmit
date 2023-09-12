/**
 * Copyright 2017 DENSO Solutions
 * 
 * リアルタイムモニタ画面のReactコンポーネント
 * 
 */

'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import { browserHistory } from 'react-router';

import { Grid, Row, Col } from 'react-bootstrap';

import Content from 'Common/Layout/Content';

import { RegisterHotKeyButton } from 'Assets/GarmitButton';
import SearchConditionBox from 'Assets/Condition/SearchConditionBox';
import MessageModal from 'Assets/Modal/MessageModal';
import WaitingMessage from 'Assets/Modal/WaitingMessage';
import UserListBox from 'User/UserListBox';

import { setAuthentication } from 'Authentication/actions.js';
import { setLookUp, setSearchCondition, setEditingCondition } from 'SearchCondition/actions.js';
import { setDisplayState, setSearchResult } from 'SearchResult/actions.js';
import { setWaitingState } from 'WaitState/actions.js';
import { setLoadState, setLoadState_condition, setLoadState_result, setLoginUsers, setEditedUsers, setSystemSet } from './actions.js';

import { FUNCTION_ID_MAP, LAVEL_TYPE, getAuthentication } from 'authentication';　　
import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';

class UserListPanel extends Component {

    constructor(){
        super();
        this.state = {
            message: {},
        }
    }

    /**
     * コンポーネントがマウントされた時
     */
    componentDidMount() {
        this.loadAuthentication(() => {
            this.loadLookUp(() => {
                this.loadSystemSet();
            });
        });

        // 前回の検索条件で、ユーザー情報を読み込む
        if (this.props.searchCondition.conditions) {
            this.loadLoginUserResult(this.props.searchCondition.conditions);
        }
        garmitFrame.refresh();
    }

    /**
     * 検索ボタンがクリックされたとき
     * @param {any} condition
     */
    onSearchClick(condition) {
        this.props.setSearchCondition(condition);
        this.loadLoginUserResult(condition);
    }

    /**
     * 編集ボタンがクリックされた時
     * @param {any} userIds
     */
    onEditClick(userIds) {
        this.loadEditedUsers(userIds, (users, networkError) => {
            if (!networkError) {
                browserHistory.push({ pathname: '/Maintenance/User/Edit', query: { mode: 'edit' } });
            }
        });
    }

    /**
     * 追加ボタンがクリックされた時
     */
    onAddClick() {
        // 空のユーザーを取得
        this.loadNewUser((user, networkError) => {
            if (!networkError) {
                browserHistory.push({ pathname: '/Maintenance/User/Edit', query: { mode: 'add' } });
            }
        });
    }

    /**
     * 削除ボタンがクリックされた時
     * @param {any} userIds
     */
    onDeleteClick(userIds) {
        this.setState({
            message: {
                show: true,
                title: '削除',
                buttonStyle: 'delete',
                message: '選択したユーザーを削除してもよろしいですか？',
                onCancel: () => this.clearMessage(),
                onOK: () => {
                    this.clearMessage();
                    this.deleteUsers(userIds);
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
    loadAuthentication(callback) {
        this.props.setLoadState_condition(true);
        getAuthentication(FUNCTION_ID_MAP.enterpriseEdit, (auth) => {
            this.props.setLoadState_condition(false);
            this.props.setAuthentication(auth);

            if (callback) {
                callback(auth);
            }
        });
    }

    /**
     * マスターデータを読み込む
     */
    loadLookUp(callback) {
        this.props.setLoadState_condition(true);
        sendData(EnumHttpMethod.get, '/api/User', null, (lookUp, networkError) => {
            this.props.setLoadState_condition(false);
            if (lookUp) {
                this.props.setLookUp(lookUp);
            }
            if (networkError) {
                this.showNetWorkErrorMessage();
            }
            if (callback) {
                callback(lookUp);
            }
        });
    }

    /**
     * システム設定を読み込む
     */
    loadSystemSet(callback) {
        this.props.setLoadState_condition(true);
        sendData(EnumHttpMethod.get, '/api/setting/getSetting', null, (info, networkError) => {
            this.props.setLoadState_condition(false);
            if (info && info.systemSet) {
                this.props.setSystemSet(info.systemSet);
            }
            if (networkError) {
                this.showNetWorkErrorMessage();
            }
            if (callback) {
                callback(info);
            }
        });
    }

    /**
     * ユーザー情報を読み込む
     * @param {any} condition
     */
    loadLoginUserResult(condition, showMessage = true) {
        this.props.setLoadState_result(true);
        sendData(EnumHttpMethod.post, '/api/User/getUserResult', condition, (searchResult, networkError) => {
            this.props.setLoadState_result(false);
            if (searchResult) {
                this.props.setSearchResult(searchResult);
                if (showMessage && searchResult.rows && searchResult.rows.length === 0) {
                    this.setState({
                        message: {
                            show: true,
                            buttonStyle: 'message',
                            title: '検索',
                            message: '検索条件に該当するユーザーがありません。',
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
     * 編集するユーザーを読み込む
     * @param {any} userIds
     * @param {any} callback
     */
    loadEditedUsers(userIds, callback) {
        this.props.setLoadState(true);
        sendData(EnumHttpMethod.post, '/api/User/getUsers', userIds, (users, networkError) => {
            this.props.setLoadState(false);
            if (users) {
                this.props.setEditedUsers(users);
            }
            if (networkError) {
                this.showNetWorkErrorMessage();
            }            
            if (callback) {
                callback(users, networkError);
            }
        });
    }

    /**
     * ユーザーを削除する
     * @param {any} userIds
     */
    deleteUsers(userIds) {
        const multiple = (userIds.length !== 1);
        const method = multiple ? EnumHttpMethod.post : EnumHttpMethod.get;
        const url = multiple ? '/api/User/deleteUsers' : ('/api/User/deleteUser?userId=' + userIds[0]);
        const sendingData = multiple ? userIds : null;

        this.props.setWaitingState(true, 'delete');
        sendData(method, url, sendingData, (result, networkError) => {
            this.props.setWaitingState(false, null);
            if (result) {
                if (result.isSuccess) {
                    this.loadLoginUserResult(this.props.searchCondition.conditions);
                }
                this.setState({
                    message: {
                        show: true,
                        title: '削除',
                        buttonStyle: 'message',
                        message: result.message,
                        onCancel: () => this.clearMessage()
                    }
                });
            }
            if (networkError) {
                this.showNetWorkErrorMessage();
            }
        });
    }

    /**
     * 空のユーザーを読み込む
     */
    loadNewUser(callback) {
        this.props.setLoadState(true);
        sendData(EnumHttpMethod.get, '/api/User/newUser', null, (user, networkError) => {
            this.props.setLoadState(false);
            if (user) {
                this.props.setEditedUsers([user]);
            }
            if (networkError) {
                this.showNetWorkErrorMessage();
            }
            if (callback) {
                callback(user, networkError);
            }
        });
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

    /**
     * render
     */
    render() {
        const { isReadOnly, level, loadAuthentication } = this.props.authentication;
        const { isLoading, searchCondition, searchResult, waitingInfo } = this.props;
        const { message } = this.state;
        
        return (
            <Content>
                {!isReadOnly && (level === LAVEL_TYPE.manager || level === LAVEL_TYPE.administrator) &&
                    <div className="clearfix mb-05">
                        <RegisterHotKeyButton
                            className="pull-right"
                            onClick={() => this.onAddClick()}
                            disabled={isLoading.condition || isLoading.result}
                        />
                    </div>
                }
                <SearchConditionBox useHotKeys
                    isLoading={isLoading.condition || !loadAuthentication}
                    targets={['loginUsers', 'enterprises']}
                    lookUp={searchCondition.lookUp}
                    searchCondition={searchCondition.editingCondition}
                    onChange={(condition) => this.onSearchConditionChange(condition)}
                    onSearchClick={(condition) => this.onSearchClick(condition)}
                    searchButtonDisabled={isLoading.result}
                >
                </SearchConditionBox>
                <UserListBox
                    isReadOnly={isReadOnly}
                    level={level}
                    isLoading={isLoading.result}
                    loginUserResult={searchResult.result}
                    tableSetting={searchResult.displayState}
                    onTableSettingChange={(setting) => this.onTableSettingChange(setting)}
                    onEditClick={(ids) => this.onEditClick(ids)}
                    onDeleteClick={(ids) => this.onDeleteClick(ids)}
                    onAddClick={() => this.onAddClick()}
                    onColumnSettingChange={() => this.loadLoginUserResult(searchCondition.conditions, false)}
                />
                <MessageModal
                    show={message.show}
                    title={message.title}
                    bsSize="small"
                    buttonStyle={message.buttonStyle}
                    onOK={message.onOK}
                    onCancel={message.onCancel}
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
const mapStateToProps = (state) => {
    return {
        authentication: state.authentication,
        searchCondition: state.searchCondition,
        searchResult: state.searchResult,
        waitingInfo: state.waitingInfo,
        isLoading: state.isLoading,
        loginUsers: state.loginUsers,
        editedUsers: state.editedUsers,
        systemSet: state.systemSet
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
        setLoadState: (state) => dispatch(setLoadState(state)),
        setLoadState_condition: (isLoading) => dispatch(setLoadState_condition(isLoading)),
        setLoadState_result: (isLoading) => dispatch(setLoadState_result(isLoading)),
        setLoginUsers: (users) => dispatch(setLoginUsers(users)),
        setEditedUsers: (users) => dispatch(setEditedUsers(users)),
        setSystemSet: (systemSet) => dispatch(setSystemSet(systemSet)),
        setWaitingState: (isWaiting, type) => dispatch(setWaitingState(isWaiting, type))
    };
};

// Wrap the component to inject dispatch and state into it
export default connect(mapStateToProps, mapDispatchToProps)(UserListPanel);

 