/**
 * @license Copyright 2018 DENSO
 * 
 * ReportSchedule画面
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
import { closeModal, confirmDelete } from 'ModalState/actions.js';
import { setAuthentication } from 'Authentication/actions.js';
import { setDisplayState, setSearchResult } from 'SearchResult/actions.js';
import { changeLoadState } from 'LoadState/actions.js';

import Content from 'Common/Layout/Content';
import { RegisterButton } from 'Assets/GarmitButton';
import ScheduleListBox from 'ReportSchedule/List/ScheduleListBox';
import OutputFileModal from 'ReportSchedule/List/OutputFileModal';
import MessageModal from 'Assets/Modal/MessageModal';
import WaitingMessage from 'Assets/Modal/WaitingMessage';

import { FUNCTION_ID_MAP, LAVEL_TYPE, readOnlyByLevel, getAuthentication } from 'authentication';
import { getSessionStorage, STORAGE_KEY } from 'webStorage';


/**
 * ReportSchedule画面のコンポーネント
 */
class ReportSchedulePanel extends Component {

    //#region React ライフサイクルメソッド

    /**
     * 最初のレンダリング時にクライアントに一度だけ呼び出されます。
     * Componentがレンダリングされた直後に呼び出されるメソッドです。
     * ここでsetStateを行うと、renderがもう一度呼び出されるためあまり行わないほうがよいです。
     */
    componentDidMount() {
        const schedleId = getSessionStorage(STORAGE_KEY.scheduleId);
        this.loadAuthentication(schedleId);
        this.props.requestInitialInfo();            //初期データをロードする
    }

    /**
     * render
     */
    render() {
        const { searchResult, reportOutputFileResult, selectedScheduleId, showDownloadModal } = this.props;
        const { modalState, waitingInfo, isLoading, closeModal } = this.props;
        const { isReadOnly, level, loadAuthentication } = this.props.authentication;
        const loading = isLoading || !loadAuthentication;
        const readOnly = readOnlyByLevel(isReadOnly, level, LAVEL_TYPE.manager)
        return (
            <Content>
                {!readOnly&&
                    <div className="clearfix mb-05" >
                        <RegisterButton className="pull-right" onClick={() => this.transitionScreen(null, true)} />
                    </div>
                }
                <ScheduleListBox isLoading={loading}
                                 isReadOnly={readOnly}
                                 scheduleResult={searchResult.result}
                                 tableSetting={searchResult.displayState}
                                 onDelete={(scheduleIds) => this.handleDelete(scheduleIds)}
                                 onEdit={(scheduleId) => this.transitionScreen(scheduleId, false)}
                                 onDisp={(scheduleId) => this.showOutputFileModal(scheduleId)}
                                 onTableSettingChange={(setting) => this.changeTableSetting(setting)}
                                 onColumnSettingChanged={() => this.refreshScheduleList()}
                />
                <OutputFileModal show={showDownloadModal}
                                 scheduleId={selectedScheduleId}
                                 outputFileResult={reportOutputFileResult}
                                 isLoading ={loading} 
                                 isReadOnly={readOnly}
                                 onDeleteFiles={(scheduleId, fileNos) => this.handleDeleteFiles(scheduleId, fileNos)} 
                                 onHide={() => this.hideOutputFileModal()} 
                />
                <MessageModal show={modalState.show} 
                              title={modalState.title} 
                              bsSize="small"
                              buttonStyle={modalState.buttonStyle}
                              onOK={() => this.handleOK()}
                              onCancel={() => this.handleCancel()}>
                    {modalState.message}
                </MessageModal>
                <WaitingMessage show={waitingInfo.isWaiting} type={waitingInfo.waitingType} />
            </Content>
        );
    }    

    //#endregion

    //#region 権限情報読み込み
    
    /**
     * 権限情報を読み込む
     */
    loadAuthentication(schedleId) {
        getAuthentication(FUNCTION_ID_MAP.reportSchedule, (auth) => {
            this.props.setAuthentication(auth);
            const { isReadOnly, level } = this.props.authentication;              
            if (!readOnlyByLevel(isReadOnly, level, LAVEL_TYPE.manager) && schedleId) {
                this.transitionScreen(schedleId, false);
            }
        });
    }

    //#endregion

    //#region 一覧用関数

    /**
     * 表示設定を変更する
     * @param {any} setting 表示設定情報
     */
    changeTableSetting(setting) {
        this.props.setDisplayState(setting);
    }

    /**
     * スケジュールリストを更新する
     */
    refreshScheduleList() {
        this.props.requestRefreshSchedlueList();
    }

    //#endregion

    //#region 新規・編集・削除

    /**
     * 削除イベントハンドラ
     * @param {array} scheduleIds スケジュールID群
     */
    handleDelete(scheduleIds) {
        this.props.setDeleteScheduleIds(scheduleIds);
        this.props.confirmDelete({ targetName: '選択したスケジュール', okOperation: 'delete'});
    }

    /**
     * ファイル削除イベントハンドラ
     * @param {number} scheduleId スケジュールID
     * @param {array} fileNos ファイル番号
     */
    handleDeleteFiles(scheduleId, fileNos) {
        this.props.setDeleteFileListInfo(scheduleId, fileNos);
        this.props.confirmDelete({ targetName: '選択したファイル', okOperation: 'deleteFiles'});        
    }

    //#endregion

    //#region 出力ファイル一覧モーダル

    /**
     * 出力ファイル一覧モーダルを表示する
     * @param {number} scheduleId スケジュールID
     */
    showOutputFileModal(scheduleId) {
        this.props.requestOutputFileResult(scheduleId);
    }

    /**
     * 出力ファイル一覧モーダルを閉じる
     */
    hideOutputFileModal() {
        this.props.clearSelectedScheduleId();
        this.props.changeShowDownloadModal(false);
    }

    //#endregion

    //#region 確認・メッセージモーダル イベントハンドラ

    /**
     * OKボタンクリックのイベントハンドラ
     */
    handleOK() {
        this.props.closeModal();
        const { okOperation } = this.props.modalState;
        if (okOperation === 'delete') {
            this.props.requestDelete();
        } else if (okOperation === 'deleteFiles') {
            this.props.requestDeleteFiles();
        }
    }

    /**
     * キャンセルボタンクリックのイベントハンドラ
     */
    handleCancel() {
        this.props.closeModal();
        const { okOperation } = this.props.modalState;
        if (okOperation === 'delete') {
            this.props.setDeleteScheduleIds(null);
        } else if (okOperation === 'deleteFiles') {
            this.props.clearDeleteFileListInfo();
        }
    }

    //#endregion

    /**
     * 画面遷移時の処理
     */
    transitionScreen(scheduleId, isRegister) {
        this.props.requestEditSchedule(scheduleId, isRegister, () => {
            browserHistory.push({ pathname: '/ReportSchedule/Edit' });
        });
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
        waitingInfo: state.waitingInfo,
        isLoading: state.isLoading,
        modalState: state.modalState,
        selectedScheduleId: state.selectedScheduleId,
        searchResult: state.searchResult,
        reportOutputFileResult: state.reportOutputFileResult,
        showDownloadModal: state.showDownloadModal
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
        setDisplayState: (setting) => dispatch(setDisplayState(setting)),
        setSearchResult: (result) => dispatch(setSearchResult(result)),
        changeLoadState:() => dispatch(changeLoadState()),
        confirmDelete:(data) => dispatch(confirmDelete(data))
    };
};

// Wrap the component to inject dispatch and state into it
/**
 * mapStateToProps, mapDispatchToPropsをReduxと連携させる
 */
export default connect(mapStateToProps, mapDispatchToProps)(ReportSchedulePanel);

 