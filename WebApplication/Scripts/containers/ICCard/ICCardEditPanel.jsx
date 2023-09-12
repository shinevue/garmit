/**
 * @license Copyright 2021 DENSO
 * 
 * ICカード画面
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
import { closeModal, confirmSave, changeModalState } from 'ModalState/actions.js';
import { LAVEL_TYPE, readOnlyByLevel } from 'authentication';

import Content from 'Common/Layout/Content';
import ICCardEditBox from 'ICCard/Edit/ICCardEditBox';
import ICCardEditBulkBox from 'ICCard/Edit/ICCardEditBulkBox';
import MessageModal from 'Assets/Modal/MessageModal';
import WaitingMessage from 'Assets/Modal/WaitingMessage';
import { SaveButton, CancelButton } from 'Assets/GarmitButton';

/**
 * ICカード編集画面のコンポーネント
 */
class ICCardEditPanel extends Component {

    /**
     * コンストラクタ
     */
     constructor(){
        super();
    }
    
    /**
     * コンポーネントがマウントされた時
     */
    componentDidMount() {
        garmitFrame.refresh();
    }
    
    /**
     * render
     */
    render() {
        const { editICCard, invalid, editBulkKeys, bulkICCard, eRackLocations, loginUsers, useEnterprise, useLoginUser } = this.props;
        const { modalState, waitingInfo, isLoading } = this.props;
        const { lookUp, icCardType } = this.props.searchCondition;
        if (lookUp) {
            var { enterprises } = lookUp;
        }
        const { isReadOnly, level } = this.props.authentication;
        const readOnly = readOnlyByLevel(isReadOnly, level, LAVEL_TYPE.operator);
        const isBulk = editICCard ? false : true;
        
        return (
            <Content>    
                <SaveCancelButton 
                            canSave={!invalid} 
                            disabled={isLoading}
                            onClickSave={() => this.showSaveConfirmModel(isBulk)}
                            onClickCancel={() => this.handleCancelClick()} 
                />
                {!isBulk?
                    <ICCardEditBox
                        icCardType={icCardType}
                        icCardEntity={editICCard.icCardEntity}
                        allowLocations={editICCard.allowLocations}
                        useEnterprise={useEnterprise}
                        useLoginUser={useLoginUser}
                        enterprises={enterprises}
                        loginUsers={loginUsers}
                        locations={eRackLocations}
                        isLoading={isLoading}
                        isReadOnly={readOnly}
                        onChange={(key, value, isError) => this.props.changeEditICCard(key, value, isError)}
                        onChangeUseEnterprise={(useEnterprise) => this.changeUserEnterprise(useEnterprise)}
                        onChangeUseLoginUser={(useLoginUser) => this.props.changeUseLoginUser(useLoginUser)}
                        onChangeEnterprise={(enterpriseId) => this.props.requestChnageEnterprise(enterpriseId)}
                        onChangeInvalid={(invalid) => this.chanegInvalid(invalid)}
                    />
                    :
                    <ICCardEditBulkBox                    
                        editKeys={editBulkKeys} 
                        icCardEntity={bulkICCard}
                        isLoading={isLoading}
                        onChange={(keys, value, isError) => this.props.changeEditBulkICCard(keys, value, isError)}  
                    />
                }
                <MessageModal show={modalState.show} 
                              title={modalState.title} 
                              bsSize="small"
                              buttonStyle={modalState.buttonStyle}
                              onOK={() => this.handleOK()}
                              onCancel={() => this.handleCloseModal()}>
                    {modalState.message && modalState.message.split(/\r\n|\n/).map((str) => <div>{str}</div>)}
                </MessageModal>
                <WaitingMessage show={waitingInfo.isWaiting} type={waitingInfo.waitingType} />
            </Content>
        );
    }

    //#region 保存/キャンセル    

    /**
     * キャンセルボタンクリックイベント
     */
    handleCancelClick() {
        this.props.clearEditInfo();
        this.transitionScreen();
    }

    //#endregion

    //#region メッセージモーダル関連

    /**
     * 保存確認モーダルを表示
     */
    showSaveConfirmModel(isBulk) {
        var okOperation = 'save'
        if (isBulk) {
            okOperation = 'saveBulk';
        }
        this.props.confirmSave({ targetName: '編集内容', okOperation: okOperation});
    }
    
    
    /**
     * 確認モーダルのOKボタン押下イベント
     */
    handleOK() {
        this.props.closeModal();
        if (this.props.modalState.okOperation === 'saveBulk') {
            this.props.requestSaveICCards();
        } else {
            this.props.requestSaveICCard();
        }
    }

    /**
     * モーダルクローズイベント
     */
    handleCloseModal() {
        if (this.props.modalState.okOperation === "transition") {
            this.props.clearEditInfo();
            this.transitionScreen();         //保存に成功した場合、画面移動
        }
        this.props.closeModal();
    }

    //#endregion

    //#region 一覧画面遷移

    /**
     * 画面遷移時の処理
     */
     transitionScreen = () => {
        browserHistory.push({ pathname: '/Maintenance/ICCard' });
    }

    //#endregion

    //#region その他関数

    /**
     * 所属から選択するかどうかを変更する
     * @param {boolean} useEnterprise 所属から選択するかどうか
     */
    changeUserEnterprise(useEnterprise) {
        this.props.changeUseEnterprise(useEnterprise);
        if (!useEnterprise) {
            this.props.requestChnageEnterprise(null);       //OFFに変更されたら、ログインユーザーの所属に変更
        }    
    }

    /**
     * 保存が無効かどうかを変更する
     * @param {boolean} invalid 保存が無効かどうか
     */
    chanegInvalid(invalid) {
        if (this.props.invalid !== invalid) {
            this.props.chanegeInvalid(invalid);
        }
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
        icCardType: state.icCardType,
        editICCard: state.editICCard,
        invalid: state.invalid,
        editBulkKeys: state.editBulkKeys,
        bulkICCard: state.bulkICCard,
        deleteICCardNos: state.deleteICCardNos,
        eRackLocations: state.eRackLocations,
        loginUsers: state.loginUsers,
        useEnterprise: state.useEnterprise,
        useLoginUser: state.useLoginUser,
        isAdmin: state.isAdmin
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
        confirmSave:(data) => dispatch(confirmSave(data)),
        changeModalState:(data) => dispatch(changeModalState(data))
    };
};

// Wrap the component to inject dispatch and state into it
/**
 * mapStateToProps, mapDispatchToPropsをReduxと連携させる
 */
export default connect(mapStateToProps, mapDispatchToProps)(ICCardEditPanel);

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
 