/**
 * @license Copyright 2017 DENSO
 * 
 * UnitMaintenance画面
 * 
 * 画面のコンテナとして。Reduxに依存したコードを記述します。
 * 画面のロジックはここに記述します。（適宜ファイル分割は行うこと）
 * 
 */
'use strict';

import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { FUNCTION_ID_MAP, LAVEL_TYPE, getAuthentication } from 'authentication';
import { setAuthentication } from 'Authentication/actions.js';
import * as Actions from '../RackUnitMaintenance/actions.js';
import { setUnitTypes } from './actions';
import { closeModal, requestShowModal } from 'ModalState/actions';

import { Button, Row, Col } from 'react-bootstrap';

import Content from 'Common/Layout/Content';
import Box from 'Common/Layout/Box';
import BoxColseButton from 'Common/Widget/BoxColseButton';

import { sendData, EnumHttpMethod } from 'http-request';

import PageListBox from 'Assets/PageListBox';
import PageSettingBox from 'Assets/RackUnitPageSetting/PageSettingBox';
import MessageModal from 'Assets/Modal/MessageModal';


/**
 * UnitMaintenance画面のコンポーネント
 */
class UnitMaintenancePanel extends Component {

    /**
     * コンストラクタ
     */
    constructor(){
        super();
        this.state = {
        };
    }

    /**
     * 最初のレンダリング時にクライアントに一度だけ呼び出されます。
     * Componentがレンダリングされた直後に呼び出されるメソッドです。
     * ここでsetStateを行うと、renderがもう一度呼び出されるためあまり行わないほうがよいです。
     */
    componentDidMount() {
        this.loadAuthentication();  //権限取得
        this.props.requestInitialInfo('unit');
    }

    /**
     * 権限情報を読み込む
     */
    loadAuthentication() {
        getAuthentication(FUNCTION_ID_MAP.unitMaintenance, (auth) => {
            this.props.setAuthentication(auth);
        });
    }

    //#region イベントハンドラ
    /**
     * ページ編集ボタンクリックイベント
     */
    handleClickEdit(pageInfo) {
        this.props.requestSelectPage(pageInfo);
    }

    /**
    * ページ保存ボタンクリックイベント
    */
    handleClickSave() {
        this.props.requestSave('unit');     
    }

    /**
     * キャンセルボタンクリックイベント
     */
    handleClickCancel() {
        //編集前のデータを取得
        const initialData = this.props.rackUnitMaintenance.extendedData.find((page) => {
            return page.pageNo === this.props.rackUnitMaintenance.editPage.pageNo
        });
        this.props.requestSelectPage(initialData);
    }
    //#endregion
    
    /**
     * render
     */
    render() {
        const { isReadOnly, level, loadAuthentication } = this.props.authentication;
        const { show, title, message, okOperation } = this.props.modalState;
        const { rackUnitMaintenance, unitTypes, isLoading } = this.props;
        const { extendedData, editPage, processedEditPage, saveState } = rackUnitMaintenance;
        const loading = isLoading || !loadAuthentication;

        return (
            <Content>
                <Row>
                    <Col md={4}>
                        <PageListBox
                            isLoading={loading}
                            extendedData={extendedData}
                            editing={editPage.pageNo}
                            onClickEdit={(clickedPageInfo) => this.handleClickEdit(clickedPageInfo)}
                        />
                    </Col>
                    <Col md={8}>
                        <PageSettingBox
                            isLoading={loading}
                            isReadOnly={isReadOnly}
                            isUnit={true}
                            pageName={editPage.pageName}
                            editPageInfo={processedEditPage}
                            canSave={saveState.canSave}
                            onChangePageName={(value) => this.props.editPageName(value)}
                            onChangeTypes={(types) => this.props.editType(types)}
                            onChangeItem={(itemId, valueObj) => this.props.editItem({ itemId: itemId, valueObj: valueObj })}
                            onClickAllChecked={(value, type) => this.props.changeAllState(value, type)}
                            onChangeOrder={(sortedItems) => this.props.editOrder(sortedItems)}
                            onClickSave={() => this.handleClickSave()}
                            onClickCancel={() => this.handleClickCancel()}
                        />
                    </Col>
                </Row>
                <MessageModal
                    title={title}
                    show={show}
                    bsSize={"sm"}
                    buttonStyle={"message"}
                    onOk={() => okOperation()}
                    onCancel={() => this.props.closeModal()}
                >{message}
                </MessageModal>
            </Content>
        );
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
        rackUnitMaintenance: state.rackUnitMaintenance,
        unitTypes: state.unitTypes,
        isLoading: state.isLoading,
        modalState:state.modalState
    };
};

/**
 * 画面更新のアクションを設定します。
 * storeからActionを受け取り、propsに入れ込みます。
 */
const mapDispatchToProps = (dispatch) => {
    return {
        ...bindActionCreators(Actions, dispatch),
        setAuthentication: (auth) => dispatch(setAuthentication(auth)),
        setUnitTypes: (value) => dispatch(setUnitTypes(value)),
        closeModal: () => dispatch(closeModal()),
        requestShowModal: (data) => dispatch(requestShowModal(data))
    };
};

// Wrap the component to inject dispatch and state into it
/**
 * mapStateToProps, mapDispatchToPropsをReduxと連携させる
 */
export default connect(mapStateToProps, mapDispatchToProps)(UnitMaintenancePanel);

 