/**
 * @license Copyright 2020 DENSO
 * 
 * 回線編集画面
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
import { closeModal, confirmSave, changeModalState } from 'ModalState/actions.js';

import { ButtonToolbar } from 'react-bootstrap';

import Content from 'Common/Layout/Content';
import { SaveHotKeyButton, CancelButton } from 'Assets/GarmitButton';
import AssetDetailBox from 'Assets/AssetDetailBox';
import MessageModal from 'Assets/Modal/MessageModal';
import WaitingMessage from 'Assets/Modal/WaitingMessage';
import PatchCableBox from 'Line/Edit/PatchCableBox';

import { LAVEL_TYPE } from 'authentication';

/**
 * 回線編集画面のコンポーネント
 */
class LineEditPanel extends Component {

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
        const { editPatchCableFrom, invalid, isLoading } = this.props;
        const { modalState, waitingInfo } = this.props;
        const { level } = this.props.authentication;
        const isSysAdmin = (level === LAVEL_TYPE.administrator);
        return (
            <Content>
                <div className="flex-center-right mb-05">
                    <ButtonToolbar>
                        <SaveHotKeyButton
                            disabled={!this.canSave(invalid)}
                            className="mr-05"
                            onClick={() => this.showSaveConfirmModel()}
                        />
                        <CancelButton
                            onClick={this.handleCancelClick}
                        />
                    </ButtonToolbar>
                </div>
                <PatchCableBox 
                    patchCableData={editPatchCableFrom.patchCableData}
                    isLoading={isLoading}
                    onChange={(key, value, isError) => this.props.changeEditPatchCableData(key, value, isError)}                    
                />
                {editPatchCableFrom&&
                 editPatchCableFrom.extendedPages.length>0&&
                 this.isShowDetailBox(editPatchCableFrom.extendedPages, isSysAdmin)&&
                    <div className="mb-2">
                        <AssetDetailBox
                            title="詳細情報"
                            id={editPatchCableFrom.patchCableData.patchboardId}
                            pages={editPatchCableFrom.extendedPages}
                            isSysAdmin={isSysAdmin}
                            defaultClose={false}
                            isLoading={isLoading}
                            level={level}
                            onChange={(pages, isError) => this.props.changeEditExtendedPages(pages, isError)}
                        />
                        
                    </div>
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
    
    
    //#region 共通

    /**
     * キャンセルボタンクリックイベント
     */
    handleCancelClick = () => {
        this.props.clearEditInfo();
        this.transitionScreen();
    }

    /**
     * 保存確認モーダルを表示
     */
    showSaveConfirmModel() {
        this.props.confirmSave({ targetName: '編集内容', okOperation: 'save'});
    }

    /**
     * 画面遷移
     */
    transitionScreen() {
        browserHistory.push({ pathname: '/Line' });
    }

    /**
     * 保存が無効かどうか
     * @param {object} invalid 無効状態
     */
    canSave(invalid) {
        return !(invalid.patchCableData || invalid.extendedPages);
    }

    /**
     * 確認モーダルのOKボタン押下イベント
     */
    handleOK() {
        this.props.closeModal();
        if (this.props.modalState.okOperation === 'save') {
            this.props.requestSavePatchCableForm();
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

    //#region 詳細情報

    /**
     * 詳細情報ボックスを表示するかどうか
     * @param {array} extendedPages 詳細情報ページ情報
     * @param {boolean} isSysAdmin システム管理者かどうか
     */
    isShowDetailBox(extendedPages, isSysAdmin) {
        return extendedPages.some((page) => page.extendedItems.some((item) => item.enable && (!item.isSysAdmin || isSysAdmin)));
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
        editPatchCableFrom: state.editPatchCableFrom,
        invalid: state.invalid, 
        isLoading: state.isLoading,
        modalState: state.modalState, 
        waitingInfo: state.waitingInfo
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
export default connect(mapStateToProps, mapDispatchToProps)(LineEditPanel);

 