/**
 * @license Copyright 2021 DENSO
 * 
 * ラック施開錠端末画面
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
import ICTerminalListBox from 'RackOperationDevice/List/ICTerminalListBox';
import MessageModal from 'Assets/Modal/MessageModal';
import WaitingMessage from 'Assets/Modal/WaitingMessage';

import { FUNCTION_ID_MAP, LAVEL_TYPE, readOnlyByLevel, getAuthentication } from 'authentication';

/**
 * ラック施開錠端末一覧画面のコンポーネント
 */
class RackOperationDeviceListPanel extends Component {

    /**
     * コンストラクタ
     */
    constructor(){
        super();
    }

    //#region Reactライフサイクルメソッド

    /**
     * 最初のレンダリング時にクライアントに一度だけ呼び出されます。
     * Componentがレンダリングされた直後に呼び出されるメソッドです。
     * ここでsetStateを行うと、renderがもう一度呼び出されるためあまり行わないほうがよいです。
     */
    componentDidMount() {
        const { authentication } = this.props;
        if (!(authentication&&authentication.level)) {
            this.loadAuthentication();
        }
                
        this.props.requestRefreshICTerminalList();
        
        garmitFrame.refresh();
    }

    /**
     * render
     */
    render() {
        const { searchResult, modalState, waitingInfo, isLoading } = this.props;
        const { isReadOnly, level, loadAuthentication } = this.props.authentication;
        const loading = isLoading || !loadAuthentication;
        const readOnly = readOnlyByLevel(isReadOnly, level, LAVEL_TYPE.administrator);

        return (
            <Content>
                {!readOnly&&
                    <div className="flex-center-right mb-05" >
                        <RegisterButton 
                            disabled={loading} 
                            onClick={() => this.transitionEditingScreen(null, true)}
                        />
                    </div>                
                }
                <ICTerminalListBox
                    isLoading={loading}
                    isReadOnly={readOnly}
                    terminalResult={searchResult.result}
                    tableSetting={searchResult.displayState}
                    onEdit={(termNo) => this.transitionEditingScreen(termNo, false)}
                    onDelete={(termNos) => this.handleDelete(termNos)}
                    onTableSettingChange={(setting) => this.props.setDisplayState(setting)}
                    onColumnSettingChanged={() => this.props.requestRefreshICTerminalList()}
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
     loadAuthentication() {
        getAuthentication(FUNCTION_ID_MAP.rackOperationDevice, (auth) => {
            this.props.setAuthentication(auth);
        });
    }

    //#endregion
    
    //#region イベントハンドラ

    /**
     * 削除ボタンクリックイベント
     * @param {array} termNos 端末番号リスト
     */
    handleDelete(termNos) {
        this.props.setDeleteICTerminalNos(termNos);
        this.props.confirmDelete({ targetName: '選択したラック施開錠端末', okOperation: 'delete'});
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
        }
    }

    /**
     * キャンセルボタンクリックのイベントハンドラ
     */
    handleCancel() {
        this.props.closeModal();
        const { okOperation } = this.props.modalState;
        if (okOperation === 'delete') {
            this.props.setDeleteICTerminalNos(null);
        }
    }

    //#endregion

    //#region 編集画面遷移
    
    /**
     * 編集画面遷移時の処理
     */
    transitionEditingScreen(termNo, isRegister) {
        this.props.requestEditICTerminal(termNo, isRegister, () => {
            browserHistory.push({ pathname: '/Maintenance/RackOperationDevice/Edit' });
        });
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
        searchResult: state.searchResult,  
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
export default connect(mapStateToProps, mapDispatchToProps)(RackOperationDeviceListPanel);

 