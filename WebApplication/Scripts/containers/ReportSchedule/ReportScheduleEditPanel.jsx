/**
 * @license Copyright 2019 DENSO
 * 
 * レポートスケジュール画面
 * 
 * 画面のコンテナとして。Reduxに依存したコードを記述します。
 * 画面のロジックはここに記述します。（適宜ファイル分割は行うこと）
 * 
 */
'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { browserHistory } from 'react-router';
import { ButtonToolbar } from 'react-bootstrap';

import * as Actions from './actions.js';
import { setLookUp, setEditingCondition, clearLookUp } from 'SearchCondition/actions.js';
import { closeModal, confirmSave } from 'ModalState/actions.js';
import { changeLoadState } from 'LoadState/actions.js';

import Content from 'Common/Layout/Content';
import ScheduleOverviewBox from 'ReportSchedule/Edit/ScheduleOverviewBox';
import ScheduleConditionBox from 'ReportSchedule/Edit/ScheduleConditionBox';
import OutputInfoBox from 'ReportSchedule/Edit/OutputInfoBox';
import { SaveButton, CancelButton } from 'Assets/GarmitButton';

import MessageModal from 'Assets/Modal/MessageModal';
import WaitingMessage from 'Assets/Modal/WaitingMessage';

/**
 * ReportScheduleEdit画面のコンポーネント
 */
class ReportScheduleEditPanel extends Component {

    //#region render

    /**
     * render
     */
    render() {
        const { editReportSchedule, enterprises, searchCondition, invalid, isLoading } = this.props;
        const { modalState, waitingInfo } = this.props;
        if (searchCondition) {
            var { lookUp, editingCondition } = searchCondition;
        }
        const canEditCondition = (editReportSchedule && editReportSchedule.enterpriseId && editReportSchedule.enterpriseId > 0) ? true : false;

        return (
            <Content>
                <SaveCancelButton canSave={this.canSave(invalid)} 
                                  disabled={isLoading}
                                  onClickSave={() => this.showSaveConfirmModel()}
                                  onClickCancel={() => this.transitionScreen()} 
                />
                <ScheduleOverviewBox enterprises={enterprises} 
                                     schedule={editReportSchedule}
                                     isLoading={isLoading}                                     
                                     onChange={(key, value, isError) => this.props.changeEditScheduleOutview(key, value, isError)}
                                     onChangeEnterprise={(value, isError) => this.props.requestChangeEnterprise(value, isError)}
                />
                <ScheduleConditionBox enterpriseId={editReportSchedule&&editReportSchedule.enterpriseId}
                                      lookUp={lookUp} 
                                      isLoading={isLoading}
                                      condition={editingCondition}
                                      isReadOnly={!canEditCondition} 
                                      onChange={(value, isError) => this.changeCondition(value, isError)}
                />
                <OutputInfoBox  schedule={editReportSchedule}
                                isLoading={isLoading}                                     
                                onChange={(key, value, isError) => this.props.changeEditScheduleOutputInfo(key, value, isError)}
                />
                <MessageModal show={modalState.show} 
                              title={modalState.title} 
                              bsSize="small"
                              buttonStyle={modalState.buttonStyle}
                              onOK={() => this.handleOK()}
                              onCancel={() => this.handleCloseModal()}>
                    {modalState.message}
                </MessageModal>
                <WaitingMessage show={waitingInfo.isWaiting} type={waitingInfo.waitingType} />            
            </Content>
        );
    }

    //#endregion
    
    //#region モーダル関係

    /**
     * 保存確認モーダルを表示する
     */
    showSaveConfirmModel() {
        this.props.confirmSave({ targetName: '編集中スケジュール', okOperation: 'save'});
    }

    /**
     * 確認モーダルのOKボタン押下イベント
     */
    handleOK() {
        this.props.closeModal();
        this.props.requestSave();
    }

    /**
     * モーダルクローズイベント
     */
    handleCloseModal() {
        if (this.props.modalState.okOperation === "transition") {
            this.transitionScreen();         //保存に成功した場合、画面移動
        }
        this.props.closeModal();
    }

    //#endregion

    //#region その他

    /**
     * 検索条件を変更する
     * @param {object} value 変更後の検索条件
     * @param {boolean} isError エラーが発生しているか
     */
    changeCondition(value, isError) {
        this.props.setEditingCondition(value);
        this.props.changeEditScheduleCondition(value, isError);
    }

    /**
     * 画面遷移
     */
    transitionScreen() {
        browserHistory.push({ pathname: '/ReportSchedule' });
    }

    /**
     * 保存可能かどうか
     * @param {object} invalid 無効かどうか
     */
    canSave(invalid) {
        if (invalid.overview || invalid.condition || invalid.output) {
            return false;
        }
        return true;
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
        editReportSchedule: state.editReportSchedule,
        searchCondition: state.searchCondition,
        enterprises: state.enterprises,
        deleteScheduleIds: state.deleteScheduleIds,
        deleteFileListInfo: state.deleteFileListInfo,
        invalid: state.invalid,
        waitingInfo: state.waitingInfo,
        isLoading: state.isLoading,
        modalState: state.modalState
    };
};

/**
 * 画面更新のアクションを設定します。
 * storeからActionを受け取り、propsに入れ込みます。
 */
const mapDispatchToProps = (dispatch) => {
    return {
        ...bindActionCreators(Actions, dispatch),
        setLookUp:(lookUp) => dispatch(setLookUp(lookUp)),
        clearLookUp:() => dispatch(clearLookUp()),
        setEditingCondition:(searchCondition) => dispatch(setEditingCondition(searchCondition)),
        closeModal: () => dispatch(closeModal()),
        changeLoadState:() => dispatch(changeLoadState()),
        confirmSave:(data) => dispatch(confirmSave(data))
    };
};

// Wrap the component to inject dispatch and state into it
/**
 * mapStateToProps, mapDispatchToPropsをReduxと連携させる
 */
export default connect(mapStateToProps, mapDispatchToProps)(ReportScheduleEditPanel);

/**
* 保存キャンセルボタン
*/
const SaveCancelButton = ({canSave, disabled, onClickSave:handleClickSave, onClickCancel:handleClickCancel }) => {
    return (
        <div className="clearfix">
            <ButtonToolbar className="pull-right mb-05">
                <SaveButton
                    disabled={!canSave || disabled}
                    onClick={handleClickSave}
                />
                <CancelButton
                    disabled={disabled}
                    onClick={handleClickCancel}
                />
            </ButtonToolbar>
        </div>
    );
}

 