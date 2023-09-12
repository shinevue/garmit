/**
 * @license Copyright 2019 DENSO
 * 
 * コンシューマー一覧画面のReactコンポーネント
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
import SpecificationCondition from 'Assets/Condition/SpecificationCondition/SpecificationCondition';
import MessageModal from 'Assets/Modal/MessageModal';
import WaitingMessage from 'Assets/Modal/WaitingMessage';
import ConsumerListBox from 'Consumer/ConsumerListBox';

import { setAuthentication } from 'Authentication/actions.js';
import { setLookUp, setSearchCondition, setEditingCondition } from 'SearchCondition/actions.js';
import { setDisplayState, setSearchResult } from 'SearchResult/actions.js';
import { setWaitingState } from 'WaitState/actions.js';
import { setLoadState, setLoadState_condition, setLoadState_result, setEditedConsumers } from './actions.js';

import { FUNCTION_ID_MAP, LAVEL_TYPE, getAuthentication } from 'authentication';
import { getSessionStorage, STORAGE_KEY } from 'webStorage';

import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';
import { createInitSearchCondition } from 'searchConditionUtility';

const SEARCH_CONDITION_TYPES = ['locations', 'consumers'];

class ConsumerListPanel extends Component {

    constructor(){
        super();
        this.state = {
            message: {},
            searchButtonDisabled: false
        }
    }

    /**
     * コンポーネントがマウントされる前
     */
    componentWillMount() {
        if (!this.props.searchCondition.editingCondition) {
            this.props.setEditingCondition(createInitSearchCondition())
        }
    }

    /**
     * コンポーネントがマウントされた時
     */
    componentDidMount() {
        const consumerId = getSessionStorage(STORAGE_KEY.consumerId);
        this.loadLookUp(() => {
            this.loadAuthentication(consumerId);
        });        

        // 前回の検索条件で、コンシューマー情報を読み込む
        if (this.props.searchCondition.conditions) {
            this.loadConsumerResult(this.props.searchCondition.conditions);
        }
        garmitFrame.refresh();
    }

    /**
     * 検索ボタンがクリックされたとき
     * @param {any} condition
     */
    onSearchClick(condition) {
        this.props.setSearchCondition(condition);
        this.loadConsumerResult(condition);
    }

    /**
     * 編集ボタンがクリックされた時
     * @param {any} consumerIds
     */
    onEditClick(consumerIds) {
        this.transitionScreen(consumerIds, false);
    }

    /**
     * 追加ボタンがクリックされた時
     */
    onAddClick() {
        this.transitionScreen(null, true);
    }

    /**
     * 削除ボタンがクリックされた時
     * @param {any} consumerIds
     */
    onDeleteClick(consumerIds) {
        this.setState({
            message: {
                show: true,
                title: '削除',
                buttonStyle: 'delete',
                message: '選択したコンシューマーを削除してもよろしいですか？',
                onCancel: () => this.clearMessage(),
                onOK: () => {
                    this.clearMessage();
                    this.deleteConsumers(consumerIds);
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
     * コンシューマー条件が変更された時
     * @param {any} conditions
     * @param {any} isError
     */
    setConsumerConditionItems(conditions, isError) {
        const editingCondition = Object.assign({}, this.props.searchCondition.editingCondition);
        editingCondition.consumerConditionItems = conditions;

        this.props.setEditingCondition(editingCondition);
        this.setState({ searchButtonDisabled: isError });
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
    loadAuthentication(consumerId, callback) {
        this.props.setLoadState_condition(true);
        getAuthentication(FUNCTION_ID_MAP.consumer, (auth) => {
            this.props.setLoadState_condition(false);
            this.props.setAuthentication(auth);
            const { isReadOnly, level } = this.props.authentication;
            if (!isReadOnly && level !== LAVEL_TYPE.normal && consumerId) {
                this.transitionScreen([consumerId], false);
            }
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
        sendData(EnumHttpMethod.get, '/api/Consumer', null, (lookUp, networkError) => {
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
     * コンシューマー情報を読み込む
     * @param {any} condition
     */
    loadConsumerResult(condition, showMessage = true) {
        this.props.setLoadState_result(true);
        sendData(EnumHttpMethod.post, '/api/Consumer/getConsumerResult', condition, (searchResult, networkError) => {
            this.props.setLoadState_result(false);
            if (networkError) {
                this.showNetWorkErrorMessage();
            } else {
                this.props.setSearchResult(searchResult);
                if (showMessage && searchResult && searchResult.rows && searchResult.rows.length === 0) {
                    this.setState({
                        message: {
                            show: true,
                            buttonStyle: 'message',
                            title: '検索',
                            message: '検索条件に該当するコンシューマーがありません。',
                            onCancel: () => this.clearMessage()
                        }
                    });
                }
            }
        });

    }

    /**
     * 編集するコンシューマーを読み込む
     * @param {any} consumerIds
     * @param {any} callback
     */
    loadEditedConsumers(consumerIds, callback) {
        this.props.setLoadState(true);
        sendData(EnumHttpMethod.post, '/api/Consumer/getConsumers', consumerIds, (consumers, networkError) => {
            this.props.setLoadState(false);
            if (networkError) {
                this.showNetWorkErrorMessage();
            } else {
                this.props.setEditedConsumers(consumers);
            }
            if (callback) {
                callback(consumers);
            }
        });
    }

    /**
     * コンシューマーを削除する
     * @param {any} consumerIds
     */
    deleteConsumers(consumerIds) {
        const multiple = (consumerIds.length !== 1);
        const method = multiple ? EnumHttpMethod.post : EnumHttpMethod.get;
        const url = multiple ? '/api/Consumer/deleteConsumers' : ('/api/Consumer/deleteConsumer?consumerId=' + consumerIds[0]);
        const sendingData = multiple ? consumerIds : null;

        this.props.setWaitingState(true, 'delete');
        sendData(method, url, sendingData, (result, networkError) => {
            this.props.setWaitingState(false, null);
            if (networkError) {
                this.showNetWorkErrorMessage();
            } else {
                if (result && result.isSuccess) {
                    this.loadConsumerResult(this.props.searchCondition.conditions);
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
     * 空のコンシューマーを読み込む
     */
    loadNewConsumer(callback) {
        this.props.setLoadState(true);
        sendData(EnumHttpMethod.get, '/api/Consumer/newConsumer', null, (consumer, networkError) => {
            this.props.setLoadState(false);
            if (networkError) {
                this.showNetWorkErrorMessage();
            } else {
                this.props.setEditedConsumers([consumer]);
            }
            if (callback) {
                callback(consumer);
            }
        });
    }

    /**
     * 画面遷移時の処理
     * @param {any} consumerIds
     * @param {any} isRegister
     */
    transitionScreen(consumerIds, isRegister) {
        if (isRegister) {
            // 空のコンシューマーを取得
            this.loadNewConsumer((consumer) => {
                if (consumer) {
                    browserHistory.push({ pathname: '/Consumer/Edit', query: { mode: 'add' } });
                }
            });
        } else {
            this.loadEditedConsumers(consumerIds, (consumers) => {
                if (consumers) {
                    browserHistory.push({ pathname: '/Consumer/Edit', query: { mode: 'edit' } });
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

    /**
     * render
     */
    render() {
        const { isReadOnly, level, loadAuthentication } = this.props.authentication;
        const { isLoading, searchCondition, searchResult, waitingInfo } = this.props;
        const { lookUp, editingCondition, conditions } = searchCondition;
        const { message, searchButtonDisabled } = this.state;


        return (
            <Content>
                {!isReadOnly && (level === LAVEL_TYPE.manager || level === LAVEL_TYPE.administrator) &&
                    <div className="clearfix mb-05">
                        <Button
                            className="pull-right"
                            iconId="add"
                            onClick={() => this.onAddClick()}
                            disabled={isLoading.condition || isLoading.result}
                        >
                            新規登録
                        </Button>
                    </div>
                }
                <SearchConditionBox
                    isLoading={isLoading.condition || !loadAuthentication}
                    targets={SEARCH_CONDITION_TYPES}
                    lookUp={lookUp}
                    searchCondition={editingCondition}
                    onChange={(condition) => this.onSearchConditionChange(condition)}
                    onSearchClick={(condition) => this.onSearchClick(condition)}
                    searchButtonDisabled={isLoading.result || searchButtonDisabled}
                >
                    <SpecificationCondition
                        searchItems={lookUp && lookUp.consumerConditionItems}
                        conditionItems={editingCondition && editingCondition.consumerConditionItems}
                        onChange={(conditions, isError) => this.setConsumerConditionItems(conditions, isError)}
                    />
                </SearchConditionBox>
                <ConsumerListBox
                    isReadOnly={isReadOnly}
                    level={level}
                    isLoading={isLoading.result}
                    consumerResult={searchResult.result}
                    tableSetting={searchResult.displayState}
                    onTableSettingChange={(setting) => this.onTableSettingChange(setting)}
                    onEditClick={(ids) => this.onEditClick(ids)}
                    onDeleteClick={(ids) => this.onDeleteClick(ids)}
                    onAddClick={() => this.onAddClick()}
                    onColumnSettingChange={() => this.loadConsumerResult(conditions, false)}
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
        consumers: state.consumers,
        editedConsumers: state.editedConsumers
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
        setEditedConsumers: (consumers) => dispatch(setEditedConsumers(consumers)),
        setWaitingState: (isWaiting, type) => dispatch(setWaitingState(isWaiting, type))
    };
};

// Wrap the component to inject dispatch and state into it
export default connect(mapStateToProps, mapDispatchToProps)(ConsumerListPanel);

 