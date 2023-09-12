/**
 * @license Copyright 2019 DENSO
 * 
 * デマンド設定画面のReactコンポーネント
 * 
 */

'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import { browserHistory } from 'react-router';

import { Col, Row, Grid } from 'react-bootstrap'

import Content from 'Common/Layout/Content';
import Button from 'Common/Widget/Button';

import SearchConditionBox from 'Assets/Condition/SearchConditionBox';
import MessageModal from 'Assets/Modal/MessageModal';
import WaitingMessage from 'Assets/Modal/WaitingMessage';
import DemandSettingListBox from 'DemandSetting/DemandSettingListBox';

import { setAuthentication } from 'Authentication/actions.js';
import { setLookUp, setSearchCondition, setEditingCondition } from 'SearchCondition/actions.js';
import { setDisplayState, setSearchResult } from 'SearchResult/actions.js';
import { setWaitingState } from 'WaitState/actions.js';
import { setLoadState, setLoadState_condition, setLoadState_result, setEditedDemandSets } from './actions.js';

import { FUNCTION_ID_MAP, LAVEL_TYPE, getAuthentication } from 'authentication';　　
import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';
import { isSocTrigger } from 'demandSetUtility';

class DemandSettingListPanel extends Component {

    constructor(props){
        super(props);
        this.state = {
            message: {}
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

        this.updateDemandSetResult();

        garmitFrame.refresh();
    }

    /**
     * 検索ボタンがクリックされたとき
     * @param {any} condition
     */
    onSearchClick(condition) {
        this.props.setSearchCondition(condition);
        this.loadDemandSetResult(condition);
    }

    /**
     * 編集ボタンがクリックされた時
     * @param {any} locationIds
     */
    onEditClick(locationIds) {
        this.loadEditedDemandSet(locationIds[0], (demandSets) => {
            if (demandSets) {
                browserHistory.push({ pathname: '/Maintenance/DemandSetting/Edit', query: { mode: 'edit' } });
            }
        });
    }

    /**
     * 追加ボタンがクリックされた時
     */
    onAddClick() {
        const { lookUp } = this.props.searchCondition;
        const newDemandSet = {
            triggerThresholds: lookUp.triggerTypes ? lookUp.triggerTypes.filter((type) => !isSocTrigger(type.triggerId) && type.triggerId).map((type) => ({ triggerType: type })) : []
        };
        this.props.setEditedDemandSets([newDemandSet]);
        browserHistory.push({ pathname: '/Maintenance/DemandSetting/Edit', query: { mode: 'add' } });
    }

    /**
     * 削除ボタンがクリックされた時
     * @param {any} locationIds
     */
    onDeleteClick(locationIds) {
        this.setState({
            message: {
                show: true,
                buttonStyle: 'delete',
                title: '削除',
                message:
                    <div>
                        <p>選択したデマンド設定を削除してもよろしいですか？</p>
                        <div className="mt-1" ><strong>!!!注意!!!</strong></div>
                        <strong>デマンド設定を削除すると、デマンドデータも全て削除されます。</strong>
                    </div>,
                onCancel: () => this.clearMessage(),
                onOK: () => {
                    this.clearMessage();
                    this.deleteDemandSets(locationIds);
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
        getAuthentication(FUNCTION_ID_MAP.pointEdit, (auth) => {    // TODO: 後で変更
            this.props.setAuthentication(auth);
        });
    }

    /**
     * マスターデータを読み込む
     */
    loadLookUp() {
        this.props.setLoadState_condition(true);
        sendData(EnumHttpMethod.get, '/api/DemandSetting', null, (lookUp, networkError) => {
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
     * デマンド設定一覧を読み込む
     * @param {any} condition
     */
    loadDemandSetResult(condition, showMessage = true) {
        this.props.setLoadState_result(true);
        sendData(EnumHttpMethod.post, '/api/DemandSetting/getDemandSetResult', condition, (result, networkError) => {
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
                            message: '検索条件に該当するデマンド設定がありません。',
                            onCancel: () => this.clearMessage()
                        }
                    });
                }
            }
        });
    }

    /**
     * 編集するデマンド設定を読み込む
     * @param {any} locationId
     * @param {any} callback
     */
    loadEditedDemandSet(locationId, callback) {
        this.props.setLoadState(true);
        sendData(EnumHttpMethod.get, '/api/DemandSetting/getDemandSet?locationId=' + locationId, null, (demandSet, networkError) => {
            this.props.setLoadState(false);
            const demandSets = demandSet ? [demandSet] : null;
            if (networkError) {
                this.showNetWorkErrorMessage();
            } else {
                this.props.setEditedDemandSets(demandSets);
            }
            if (callback) {
                callback(demandSets);
            }
        });
    }

    /**
     * デマンド設定を削除する
     */
    deleteDemandSets(locationIds) {
        const multiple = (locationIds.length !== 1);
        const method = multiple ? EnumHttpMethod.post : EnumHttpMethod.get;
        const url = multiple ? '/api/DemandSetting/deleteDemandSets' : ('/api/DemandSetting/deleteDemandSet?locationId=' + locationIds[0]);
        const sendingData = multiple ? locationIds : null;

        this.props.setWaitingState(true, 'delete');
        sendData(method, url, sendingData, (result, networkError) => {
            this.props.setWaitingState(false);
            if (networkError) {
                this.showNetWorkErrorMessage();
            } else {
                if (result && result.isSuccess) {
                    this.loadDemandSetResult(this.props.searchCondition.conditions);
                }
                this.setState({
                    message: {
                        show: true,
                        title: '削除',
                        buttonStyle: 'message',
                        message: result && result.message && result.message.split(/\r\n|\n/).map((str) => <div>{str}</div>),
                        onCancel: () => this.clearMessage()
                    }
                });
            }
        });
    }

    /**
     * デマンド設定一覧を更新する
     */
    updateDemandSetResult(showMessage = true) {
        if (this.props.searchCondition.conditions) {
            this.loadDemandSetResult(this.props.searchCondition.conditions, showMessage);
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
        const { isLoading, searchCondition, searchResult, waitingInfo } = this.props;
        const { message } = this.state;

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
                >
                </SearchConditionBox>
                <DemandSettingListBox
                    isReadOnly={isReadOnly}
                    level={level}
                    isLoading={isLoading.result}
                    demandSetResult={searchResult.result}
                    tableSetting={searchResult.displayState}
                    onTableSettingChange={(setting) => this.onTableSettingChange(setting)}
                    onColumnSettingChange={() => this.updateDemandSetResult(false)}
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
        isLoading: state.isLoading,
        waitingInfo: state.waitingInfo,
        editedDemandSets: state.editedDemandSets
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
        setLoadState: (isLoading) => dispatch(setLoadState(isLoading)),
        setLoadState_condition: (isLoading) => dispatch(setLoadState_condition(isLoading)),
        setLoadState_result: (isLoading) => dispatch(setLoadState_result(isLoading)),
        setWaitingState: (isWaiting, type) => dispatch(setWaitingState(isWaiting, type)),
        setSearchResult: (result) => dispatch(setSearchResult(result)),
        setEditedDemandSets: (demandSets) => dispatch(setEditedDemandSets(demandSets))
    };
};

// Wrap the component to inject dispatch and state into it
export default connect(mapStateToProps, mapDispatchToProps)(DemandSettingListPanel);

 