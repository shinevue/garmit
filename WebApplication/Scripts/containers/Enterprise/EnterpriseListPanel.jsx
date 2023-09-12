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
import Button from 'Common/Widget/Button';

import SearchConditionBox from 'Assets/Condition/SearchConditionBox';
import MessageModal from 'Assets/Modal/MessageModal';
import WaitingMessage from 'Assets/Modal/WaitingMessage';
import { RegisterHotKeyButton } from 'Assets/GarmitButton';

import EnterpriseListBox from 'Enterprise/EnterpriseListBox';

import { setAuthentication } from 'Authentication/actions.js';
import { setLookUp, setSearchCondition, setEditingCondition } from 'SearchCondition/actions.js';
import { setDisplayState, setSearchResult } from 'SearchResult/actions.js';
import { setWaitingState } from 'WaitState/actions.js';
import { setLoadState, setLoginUser, setEnterprises, setEditedEnterprises, setLoadState_condition, setLoadState_result } from './actions.js';

import { FUNCTION_ID_MAP, LAVEL_TYPE, getAuthentication } from 'authentication';　　
import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';

class EnterpriseListPanel extends Component {

    constructor(){
        super();
        this.state = {
            message: {}
        }
    }

    /**
     * コンポーネントがマウントされた時
     */
    componentDidMount() {
        this.loadAuthentication();
        this.loadLoginUser();

        if (!this.props.searchCondition.lookUp) {
            this.loadLookUp();
        }

        this.updateEnterpriseResult();

        garmitFrame.refresh();
    }

    /**
     * 検索ボタンがクリックされたとき
     * @param {any} condition
     */
    onSearchClick(condition) {
        this.props.setSearchCondition(condition);
        this.loadEnterpriseResult(condition);
    }

    /**
     * 編集ボタンがクリックされた時
     * @param {any} enterpriseIds
     */
    onEditClick(enterpriseIds) {
        this.loadEditedEnterprises(enterpriseIds, (enterprises, networkError) => {
            if (!networkError) {
                browserHistory.push({ pathname: '/Maintenance/Enterprise/Edit', query: { mode: 'edit' } });
            }
        });
    }

    /**
     * 追加ボタンがクリックされた時
     */
    onAddClick() {
        // 空のユーザーを取得
        this.loadNewEnterprise((enterprise, networkError) => {
            if (!networkError) {
                browserHistory.push({ pathname: '/Maintenance/Enterprise/Edit', query: { mode: 'add' } });
            }
        });
    }

    /**
     * 削除ボタンがクリックされた時
     * @param {any} enterpriseIds
     */
    onDeleteClick(enterpriseIds) {
        this.setState({
            message: {
                show: true,
                title: '削除',
                buttonStyle: 'delete',
                message: '選択した所属を削除してもよろしいですか？',
                onCancel: () => this.clearMessage(),
                onOK: () => {
                    this.clearMessage();
                    this.deleteEnterprises(enterpriseIds);
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
    loadAuthentication(){
        getAuthentication(FUNCTION_ID_MAP.enterpriseEdit, (auth) => {
            this.props.setAuthentication(auth);
        });
    }

    /**
     * マスターデータを読み込む
     */
    loadLookUp() {
        this.props.setLoadState_condition(true);
        sendData(EnumHttpMethod.get, '/api/Enterprise', null, (lookUp, networkError) => {
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
     * ログインユーザー情報を読み込む
     */
    loadLoginUser() {
        this.props.setLoadState_condition(true);
        sendData(EnumHttpMethod.get, '/api/User/getLoginUser', null, (user, networkError) => {
            this.props.setLoadState_condition(false);
            if (user) {
                this.props.setLoginUser(user);
            }
            if (networkError) {
                this.showNetWorkErrorMessage();
            }
        });
    }

    /**
     * 所属情報を読み込む
     * @param {any} condition
     */
    loadEnterpriseResult(condition, showMessage = true) {
        this.props.setLoadState_result(true);
        sendData(EnumHttpMethod.post, '/api/Enterprise/getEnterpriseResult', condition, (searchResult, networkError) => {
            this.props.setLoadState_result(false);
            if (searchResult) {
                this.props.setSearchResult(searchResult);
                if (showMessage && searchResult.rows && searchResult.rows.length === 0) {
                    this.setState({
                        message: {
                            show: true,
                            buttonStyle: 'message',
                            title: '検索',
                            message: '検索条件に該当する所属がありません。',
                            onCancel: () => this.clearMessage()
                        }
                    });
                }
            }
            if (networkError) {
                this.showNetWorkErrorMessage();
            }
        });
    }

    /**
     * 編集する所属を読み込む
     * @param {any} enterpriseIds
     * @param {any} callback
     */
    loadEditedEnterprises(enterpriseIds, callback) {
        this.props.setLoadState_result(true);
        sendData(EnumHttpMethod.post, '/api/Enterprise/getEnterprises', enterpriseIds, (enterprises, networkError) => {
            this.props.setLoadState_result(false);
            if (enterprises) {
                this.props.setEditedEnterprises(enterprises);
            }
            if (networkError) {
                this.showNetWorkErrorMessage();
            }
            if (callback) {
                callback(enterprises, networkError);
            }
        });
    }

    /**
     * 所属を削除する
     * @param {any} enterpriseIds
     */
    deleteEnterprises(enterpriseIds) {
        const multiple = enterpriseIds.length !== 1;
        const method = multiple ? EnumHttpMethod.post : EnumHttpMethod.get;
        const url = multiple ? '/api/Enterprise/deleteEnterprises' : '/api/Enterprise/deleteEnterprise?enterpriseId=' + enterpriseIds[0];
        const sendingData = multiple ? enterpriseIds : null;

        this.props.setWaitingState(true, 'delete');
        sendData(method, url, sendingData, (result, networkError) => {
            this.props.setWaitingState(false);
            if (result) {
                if (result.isSuccess) {
                    this.loadLookUp();
                    this.loadEnterpriseResult(this.props.searchCondition.conditions);
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
     * 空の所属を読み込む
     */
    loadNewEnterprise(callback) {
        this.props.setLoadState(true);
        sendData(EnumHttpMethod.get, '../api/Enterprise/newEnterprise', null, (enterprise, networkError) => {
            this.props.setLoadState(false);
            if (enterprise) {
                this.props.setEditedEnterprises([
                    Object.assign({}, enterprise, {
                        parent: this.getEnterprise(this.props.loginUser.mainEnterprise.enterpriseId, this.props.searchCondition.lookUp.enterprises),
                        allowFunctions: this.props.searchCondition.lookUp.functions
                    })
                ]);
            }
            if (networkError) {
                this.showNetWorkErrorMessage();
            }
            if (callback) {
                callback(enterprise, networkError);
            }
        });
    }

    /**
     * 所属一覧を更新する
     */
    updateEnterpriseResult(showMessage = true) {
        if (this.props.searchCondition.conditions) {
            this.loadEnterpriseResult(this.props.searchCondition.conditions, showMessage);
        }
    }

    /**
     * IDから所属を探して取得する
     * @param {any} id
     * @param {any} enterprises
     */
    getEnterprise(id, enterprises) {
        for (let i = 0; i < enterprises.length; i++) {
            if (enterprises[i].enterpriseId === id) {
                return enterprises[i];
            } else if (enterprises[i].children && enterprises[i].children.length) {
                const enterprise = this.getEnterprise(id, enterprise[i].children);
                if (enterprise) {
                    return enterprise;
                }
            }
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
     * render
     */
    render() {
        const { isReadOnly, level, loadAuthentication } = this.props.authentication;
        const { isLoading, searchCondition, searchResult, waitingInfo, loginUser } = this.props;
        const { lookUp, editingCondition } = searchCondition;
        const { result, displayState } = searchResult;
        const { message } = this.state;
        
        return (
            <Content>
                {!isReadOnly && (level === LAVEL_TYPE.manager || level === LAVEL_TYPE.administrator) &&
                    <div className="clearfix mb-05">
                        <RegisterHotKeyButton
                            className="pull-right"
                            onClick={() => this.onAddClick()}
                            disabled={!lookUp || !loginUser || isLoading.condition || isLoading.result}
                        />
                    </div>
                }
                <SearchConditionBox useHotKeys
                    isLoading={isLoading.condition || !loadAuthentication}
                    targets={["enterprises", "hashTags"]}
                    lookUp={lookUp}
                    searchCondition={editingCondition}
                    onChange={(condition) => this.onSearchConditionChange(condition)}
                    onSearchClick={(condition) => this.onSearchClick(condition)}
                    searchButtonDisabled={isLoading.result}
                />
                <EnterpriseListBox
                    isReadOnly={isReadOnly}
                    level={level}
                    isLoading={isLoading.result}
                    enterpriseResult={result}
                    tableSetting={displayState}
                    onTableSettingChange={(setting) => this.onTableSettingChange(setting)}
                    onColumnSettingChange={() => this.updateEnterpriseResult(false)}
                    onEditClick={(ids) => this.onEditClick(ids)}
                    onDeleteClick={(ids) => this.onDeleteClick(ids)}
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
        enterprises: state.enterprises,
        editedEnterprises: state.editedEnterprises,
        loginUser: state.loginUser
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
        setLoginUser: (user) => dispatch(setLoginUser(user)),
        setEnterprises: (enterprises) => dispatch(setEnterprises(enterprises)),
        setEditedEnterprises: (enterprises) => dispatch(setEditedEnterprises(enterprises)),
        setWaitingState: (isWaiting, type) => dispatch(setWaitingState(isWaiting, type))
    };
};

// Wrap the component to inject dispatch and state into it
export default connect(mapStateToProps, mapDispatchToProps)(EnterpriseListPanel);

 