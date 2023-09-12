/**
 * @license Copyright 2021 DENSO
 * 
 * ラック施開錠端末編集画面
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

import Content from 'Common/Layout/Content';
import { SaveButton, CancelButton } from 'Assets/GarmitButton';
import ICTerminalEditBox from 'RackOperationDevice/Edit/ICTerminalEditBox';
import MessageModal from 'Assets/Modal/MessageModal';
import WaitingMessage from 'Assets/Modal/WaitingMessage';

import { LAVEL_TYPE, readOnlyByLevel } from 'authentication';

/**
 * ラック施開錠端末編集画面のコンポーネント
 */
class RackOperationDeviceEditPanel extends Component {

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
        const { editICTerminal, locations, invalid } = this.props;
        const { modalState, waitingInfo, isLoading } = this.props;
        const { isReadOnly, level } = this.props.authentication;
        const readOnly = readOnlyByLevel(isReadOnly, level, LAVEL_TYPE.administrator);
        
        return (
            <Content>    
                <SaveCancelButton 
                            canSave={!invalid} 
                            disabled={isLoading}
                            onClickSave={() => this.showSaveConfirmModel()}
                            onClickCancel={() => this.handleCancelClick()}                
                />
                <ICTerminalEditBox
                    icTerminalEntity={editICTerminal&&editICTerminal.icTerminalEntity}
                    allowLocations={editICTerminal&&editICTerminal.allowLocations}
                    locations={locations}
                    isLoading={isLoading}
                    isReadOnly={readOnly}
                    onChange={(key, value, isError) => this.props.changeEditICTerminal(key, value, isError)}
                />
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
        this.props.clearEditICTerminal();
        this.transitionScreen();
    }

    //#endregion

    //#region メッセージモーダル関連

    /**
     * 保存確認モーダルを表示
     */
    showSaveConfirmModel() {
        this.props.confirmSave({ targetName: '編集内容', okOperation: 'save'});
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
            this.props.clearEditICTerminal();
        }
        this.props.closeModal();
    }

    //#endregion
    
    //#region 一覧画面遷移

    /**
     * 画面遷移時の処理
     */
    transitionScreen = () => {
        browserHistory.push({ pathname: '/Maintenance/RackOperationDevice' });
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
        locations: state.locations,
        editICTerminal: state.editICTerminal,
        invalid: state.invalid,
        deleteTermNos: state.deleteTermNos,
        updating: state.updating

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
export default connect(mapStateToProps, mapDispatchToProps)(RackOperationDeviceEditPanel);


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
 

 