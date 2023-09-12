/**
 * @license Copyright 2019 DENSO
 * 
 * 電気錠操作画面のReactコンポーネント
 * 
 */

'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import Content from 'Common/Layout/Content';
import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';

import SearchConditionBox from 'Assets/Condition/SearchConditionBox';
import MessageModal from 'Assets/Modal/MessageModal';
import WaitingMessage from 'Assets/Modal/WaitingMessage';

import ElectricLockListBox from 'ElectricLockOperation/ElectricLockListBox';
import ConfirmModal from 'ElectricLockOperation/ConfirmModal';

import { FUNCTION_ID_MAP, getAuthentication } from 'authentication';
　　
import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';

import { setAuthentication } from 'Authentication/actions.js';
import { setLookUp, setSearchCondition } from 'SearchCondition/actions.js';
import { setDisplayState, setSearchResult } from 'SearchResult/actions.js';
import { setWaitingState } from 'WaitState/actions.js';
import { setUnlockPurposeList, setSelectedUnlockPurpose } from 'UnlockPurpose/actions.js';
import { setLoadState, setLoadState_condition, setLoadState_result } from './actions.js';
import { setEmptyELockOpLogExtendedPages, setELockOpLogExtendedPages, setInitialOpenMemo } from './actions.js';

import { convertDateTimeExtendedData, convertNumberExtendedData } from 'assetUtility';
import { getUnlockPurpose, getFirstUnlockPurpose } from 'unlockPurposeUtility';

class ElectricLockListPanel extends Component {

    constructor(){
        super();
        this.state = {
            message: {},
            showConfirmModal: false,
            onlyTargetBoth: true
        };
    }

    /**
     * コンポーネントがマウントされた時
     */
    componentDidMount() {
        this.loadAuthentication();
        this.loadLookUp(() => {
            this.loadUnlockPurposeList(() => {
                this.loadELockOpLogExtendedPages();
            });
        });
    }


    //#region イベント

    /**
     * 検索ボタンがクリックされたとき
     * @param {any} condition
     */
    onSearchClick(condition) {
        this.props.setSearchCondition(condition);
        this.loadERackResult(condition);
    }

    /**
     * データテーブルの表示が変更された時
     * @param {any} setting
     */
    onTableSettingChange(setting) {
        this.props.setDisplayState(setting);
    }

    //#endregion

    //#region API呼び出し関連

    /**
     * 権限情報を取得する
     */
    loadAuthentication() {
        getAuthentication(FUNCTION_ID_MAP.elecKey, (auth) => {
            this.props.setAuthentication(auth);
        });
    }

    /**
     * マスターデータを読み込む
     */
    loadLookUp(callback) {
        this.props.setLoadState_condition(true);
        sendData(EnumHttpMethod.get, '/api/ElectricLockOperation', null, (lookUp, networkError) => {
            this.props.setLoadState_condition(false);
            if (lookUp) {
                this.props.setLookUp(lookUp);
            }
            if (networkError) {
                this.showNetWorkErrorMessage();
            }
            callback && callback(lookUp);
        });
    }

    /**
     * 電気錠設定一覧を読み込む
     * @param {any} condition
     * @param {any} showMessage
     */
    loadERackResult(condition, showMessage = true) {
        this.props.setLoadState_result(true);
        sendData(EnumHttpMethod.post, '/api/ElectricLockOperation/getERackList', condition, (result, networkError) => {
            this.props.setLoadState_result(false);
            if (result) {
                this.props.setSearchResult(result);
                if (showMessage && result.rows && result.rows.length === 0) {
                    this.setState({
                        message: {
                            show: true,
                            buttonStyle: 'message',
                            title: '検索',
                            message: '検索条件に該当する電気錠ラックがありません。',
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
     * 開錠目的のリストを読み込む
     * @param {any} callback
     * @param {boolean} isEdit 編集かどうか
     * @param {string} purposeName 選択したい開錠目的名称 
     */
    loadUnlockPurposeList(callback, isEdit=false, purposeName=null) {
        this.props.setLoadState_condition(true);
        sendData(EnumHttpMethod.get, '/api/unlockPurpose', null, (unlockPurposeList, networkError) => {
            this.props.setLoadState_condition(false);
            if (unlockPurposeList) {
                this.props.setUnlockPurposeList(unlockPurposeList);
                var selectedUnlockPurpose = null;
                if (this.props.unlockPurposeInfo.selectedUnlockPurpose && isEdit) {
                    selectedUnlockPurpose = unlockPurposeList.find((item) => item.unlockPurposeId === this.props.unlockPurposeInfo.selectedUnlockPurpose.unlockPurposeId);
                } else {
                    selectedUnlockPurpose = getUnlockPurpose(unlockPurposeList, purposeName)
                }
                this.props.setSelectedUnlockPurpose(selectedUnlockPurpose || null);
            }
            if (networkError) {
                this.showNetWorkErrorMessage();
            }
            callback && callback(unlockPurposeList);
        });
    }

    /**
     * ラックの状態を変更する
     * @param {any} isLock
     * @param {any} locationIds
     * @param {any} front
     * @param {any} rear
     * @param {any} memo
     * @param {any} purpose
     * @param {any} extendedPages 施解錠詳細情報
     */
    changeRackState(isLock, locationIds, front, rear, memo, purpose, extendedPages) {
        const sendExtendedPages = extendedPages ? convertNumberExtendedData(extendedPages) : [];
        const postData = { locationIds: locationIds, front: front, rear: rear, memo: memo, purpose: purpose ? purpose : '', extendedPages: sendExtendedPages };
        this.props.setWaitingState(true);
        sendData(EnumHttpMethod.post, '/api/ElectricLockOperation/' + (isLock ? 'lockRacks' : 'unlockRacks'), postData, (result, networkError) => {
            this.props.setWaitingState(false);
            if (networkError) {
                this.showNetWorkErrorMessage();
            } else {
                this.setState({
                    message: {
                        show: true,
                        buttonStyle: 'message',
                        title: (result && result.isSuccess) ? '完了' : 'エラー',
                        message: result && result.message,
                        onCancel: () => this.clearMessage()
                    }
                });
            }
        });
    }

    /**
     * 開錠目的を保存する
     * @param {any} unlockPurpose
     */
    saveUnlockPurpose(unlockPurpose, callback) {
        const sendingData = { unlockPurpose: unlockPurpose, functionId: FUNCTION_ID_MAP.elecKey };
        this.props.setWaitingState(true, 'save');
        sendData(EnumHttpMethod.post, '/api/unlockPurpose/save', sendingData, (result, networkError) => {
            this.props.setWaitingState(false);
            if (networkError) {
                this.showNetWorkErrorMessage();
            } else {
                this.setState({
                    message: {
                        show: true,
                        buttonStyle: 'message',
                        title: result ? '保存' : 'エラー',
                        message: result ? '開錠目的を保存しました。' : '開錠目的の保存に失敗しました。',
                        onCancel: () => this.clearMessage()
                    }
                });
                if (result) {
                    this.loadUnlockPurposeList(null, unlockPurpose.unlockPurposeId > 0, unlockPurpose.purpose);
                }
            }
            callback && callback(result);
        });
    }

    /**
     * 開錠目的を削除する
     * @param {any} unlockPurpose
     */
    deleteUnlockPurpose(unlockPurpose) {
        const sendingData = { unlockPurpose: unlockPurpose, functionId: FUNCTION_ID_MAP.elecKey };
        this.props.setWaitingState(true, 'delete');
        sendData(EnumHttpMethod.post, '/api/unlockPurpose/delete', sendingData, (result, networkError) => {
            this.props.setWaitingState(false);
            if (networkError) {
                this.showNetWorkErrorMessage();
            } else {
                this.setState({
                    message: {
                        show: true,
                        buttonStyle: 'message',
                        title: result ? '削除' : 'エラー',
                        message: result ? '開錠目的を削除しました。' : '開錠目的の削除に失敗しました。',
                        onCancel: () => this.clearMessage()
                    }
                });
                if (result) {
                    this.loadUnlockPurposeList();
                }
            }
        });
    }

    /**
     * 施解錠詳細項目情報を読み込む
     * @param {function} callback
     */
    loadELockOpLogExtendedPages(callback) {
        this.props.setLoadState_condition(true);
        sendData(EnumHttpMethod.get, '/api/extendedData/getELockOpen', null, (eLockOpLogExtendedPages, networkError) => {
            this.props.setLoadState_condition(false);
            if (eLockOpLogExtendedPages) {
                this.props.setEmptyELockOpLogExtendedPages(eLockOpLogExtendedPages);
            }
            if (networkError) {
                this.showNetWorkErrorMessage();
            }
            callback && callback();
        });
    }

    /**
     * 電気錠情報リストを読み込む
     * @param {array} locationIds ロケーションIDリスト
     */
    loadElectricLocks(locationIds, callback) {
        this.props.setLoadState(true);
        sendData(EnumHttpMethod.post, '/api/electricLockMap/getElectricLocks', locationIds, (electricLocks, networkError) => {
            this.props.setLoadState(false);
            if (electricLocks) {
                callback && callback(electricLocks);
            }
            if (networkError) {
                this.showNetWorkErrorMessage();
            }
        });
    }
    //#endregion

    //#region その他

    /**
     * 電気錠設定一覧を更新する
     */
    updateERackSetResult(showMessage = true) {
        if (this.props.searchCondition.conditions) {
            this.loadERackResult(this.props.searchCondition.conditions, showMessage);
        }
    }

    /**
     * 開錠対象選択モーダルを表示する
     * @param {array} locationIds ロケーションIDリスト
     * @param {boolaen} onlyTargetBoth 対象が前後のみか（物理錠も含む）
     */
    showUnLockConfirmModal(locationIds, onlyTargetBoth) {
        this.props.setELockOpLogExtendedPages(this.props.emptyELockOpLogExtendedPages);
        this.props.setInitialOpenMemo('');
        const selectedPurpose = getFirstUnlockPurpose(this.props.unlockPurposeInfo.unlockPurposes);
        this.props.setSelectedUnlockPurpose(selectedPurpose);
        this.setState({ showConfirmModal: true, isLock: false, locationIds: locationIds, onlyTargetBoth: onlyTargetBoth });
    }

    /**
     * 施錠対象選択モーダルを表示する
     * @param {array} locationIds ロケーションIDリスト
     * @param {boolaen} onlyTargetBoth 対象が前後のみか（物理錠も含む）
     */
    showLockConfirmModal(locationIds, onlyTargetBoth) {
        this.loadElectricLocks(locationIds, (electricLocks) => {
            const isAllUnlock = this.isAllUnlockOrPhysicalKey(electricLocks)
            if (isAllUnlock && this.isAllSameELockOpLogExtendedPages(electricLocks)) {
                this.props.setELockOpLogExtendedPages(convertDateTimeExtendedData(electricLocks[0].eLockOpLogExtendedPages));
            } else {
                this.props.setELockOpLogExtendedPages(this.props.emptyELockOpLogExtendedPages);
            }
            if (isAllUnlock && this.isAllSameOpenMemo(electricLocks)) {
                this.props.setInitialOpenMemo(electricLocks[0].openMemo)
            } else {
                this.props.setInitialOpenMemo('');
            }  
            this.setState({ showConfirmModal: true, isLock: true, locationIds: locationIds, onlyTargetBoth: onlyTargetBoth });
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
     * メッセージをクリアする
     */
    clearMessage() {
        this.setState({ message: Object.assign({}, this.state.message, { show: false }) });
    }

    /**
     * 全て開錠中もしくは物理錠かどうか
     * @param {array} electricLocks 電気錠リスト
     */
    isAllUnlockOrPhysicalKey(electricLocks) {
        return electricLocks.every((lock) => lock.isUnlock || lock.target === 0);
    }
    
    /**
     * 全て同じ詳細情報かどうかかどうか
     * @param {array} electricLocks 電気錠一覧
     */
    isAllSameELockOpLogExtendedPages(electricLocks) {
        const sourceLock = electricLocks.length > 0 ? electricLocks[0] : null;
        if (sourceLock) {
            return electricLocks.every((lock) => 
            lock.eLockOpLogExtendedPages && 
            lock.eLockOpLogExtendedPages.length > 0 &&
            lock.eLockOpLogExtendedPages.every((page) => {
                const sourcePage = sourceLock.eLockOpLogExtendedPages.find((spage) => spage.pageNo === page.pageNo);
                return page.extendedItems.every((item) => {
                    const sourceItem = sourcePage && sourcePage.extendedItems.find(sitem => sitem.itemId === item.itemId);
                    return sourceItem ? sourceItem.value === item.value : false;
                })
            })
        );
        } else {
            return false;
        }
    }

    /**
     * 全て同じ開錠メモかどうか
     * @param {array} electricLocks 電気錠一覧
     */
    isAllSameOpenMemo(electricLocks) {
        const sourceLock = electricLocks.length > 0 ? electricLocks[0] : null;;
        if (sourceLock) {
            return electricLocks.every((lock) => lock.openMemo === sourceLock.openMemo);
        } else {
            return false;
        }
    }

    //#endregion

    /**
     * render
     */
    render() {
        const { isLoading, searchCondition, searchResult, waitingInfo, unlockPurposeInfo, eLockOpLogExtendedPages, initialOpenMemo } = this.props;
        const { message, showConfirmModal, isLock, locationIds, onlyTargetBoth } = this.state;
        const { isReadOnly, level, loadAuthentication } = this.props.authentication;
        
        return (
            <Content>
                <Button
                    bsStyle="link"
                    href="ElectricLockMap"
                >
                    <Icon className='fa fa-angle-double-right mr-05' />
                    <span>電気錠マップへ</span>
                </Button>
                <SearchConditionBox
                    isLoading={isLoading.condition || !loadAuthentication}
                    targets={['locations', 'enterprises']}
                    lookUp={searchCondition.lookUp}
                    searchCondition={searchCondition.editingCondition}
                    onSearchClick={(condition) => this.onSearchClick(condition)}
                    searchButtonDisabled={isLoading.result}
                />                
                <ElectricLockListBox
                    isReadOnly={isReadOnly}
                    level={level}
                    isLoading={isLoading.result}
                    searchResult={searchResult.result}
                    tableSetting={searchResult.displayState}
                    onTableSettingChange={(setting) => this.onTableSettingChange(setting)}
                    onColumnSettingChange={() => this.updateERackSetResult(false)}
                    onLockClick={(locationIds, onlyTargetBoth) => this.showLockConfirmModal(locationIds, onlyTargetBoth)}
                    onUnlockClick={(locationIds, onlyTargetBoth) => this.showUnLockConfirmModal(locationIds, onlyTargetBoth)}
                    onUpdateClick={() => this.loadERackResult(searchCondition.conditions, false)}
                />
                <ConfirmModal
                    showModal={showConfirmModal}
                    isLock={isLock}
                    unlockPurposes={unlockPurposeInfo.unlockPurposes}
                    selectedUnlockPurpose={unlockPurposeInfo.selectedUnlockPurpose}
                    isErrorUnlockPurpose={unlockPurposeInfo.isError}
                    initialELockOpLogExtendedPages={eLockOpLogExtendedPages}
                    initialMemo={initialOpenMemo}
                    onlyTargetBoth={onlyTargetBoth}
                    onSubmit={(front, rear, memo, purpose, extendedPages) => {
                        this.changeRackState(isLock, locationIds, front, rear, memo, purpose, extendedPages);
                        this.setState({ showConfirmModal: false });
                    }}
                    onCancel={() => this.setState({ showConfirmModal: false })}
                    onChangeUnlockPurpose={(purpose) => this.props.setSelectedUnlockPurpose(purpose)}
                    onSaveUnlockPurpose={(purpose, callback) => this.saveUnlockPurpose(purpose, callback)}
                    onDeleteUnlockPurpose={(purpose) => this.deleteUnlockPurpose(purpose)}
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
        editedERackSets: state.editedERackSets,
        unlockPurposeInfo: state.unlockPurposeInfo,
        eLockOpLogExtendedPages: state.eLockOpLogExtendedPages,
        emptyELockOpLogExtendedPages: state.emptyELockOpLogExtendedPages,
        initialOpenMemo: state.initialOpenMemo
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
        setUnlockPurposeList: (data) => dispatch(setUnlockPurposeList(data)),
        setSelectedUnlockPurpose: (data) => dispatch(setSelectedUnlockPurpose(data)),
        clearSelectedUnlockPurpose: () => dispatch(clearSelectedUnlockPurpose()),
        setEmptyELockOpLogExtendedPages: (data) => dispatch(setEmptyELockOpLogExtendedPages(data)),
        setELockOpLogExtendedPages: (data) => dispatch(setELockOpLogExtendedPages(data)),
        setInitialOpenMemo:(openMemo) => dispatch(setInitialOpenMemo(openMemo))
    };
};

// Wrap the component to inject dispatch and state into it
export default connect(mapStateToProps, mapDispatchToProps)(ElectricLockListPanel);

 