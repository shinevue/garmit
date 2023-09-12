/**
 * @license Copyright 2017 DENSO
 * 
 * NetworkList画面
 * 
 * 画面のコンテナとして。Reduxに依存したコードを記述します。
 * 画面のロジックはここに記述します。（適宜ファイル分割は行うこと）
 * 
 */
'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import { Row, Col } from 'react-bootstrap';

import { setAuthentication } from 'Authentication/actions.js';
import { setLookUp, setSearchCondition, setEditingCondition } from 'SearchCondition/actions.js';
import { setLocation, setRack, clearRack } from 'DualRack/actions.js';
import { setWaitingState } from 'WaitState/actions.js';

import { requestInitialInfo, requestGetNetworkPathRows } from './actions.js';
import { requestSelectNetworkInfo, requestEditNetworkInfo, requestDeleteNetworks } from './actions.js';
import { setNetworkPaths, setNetworkPath, clearNetworkPath, setTableDisplayState } from './actions.js';
import { setCableTypes, setLoadState } from './actions.js';
import { changeDeleteComfirmModalState, changeMessageModalState, changeConfirmModalState } from './actions.js';
import { setEditingNetworkPath, clearNetworkOneSide, setEditMode } from './actionsEditInfo.js';
import { setUnitDispSetting, setUnit, setPort } from './actionsEditInfo.js';

import Content from 'Common/Layout/Content';
import SearchConditionBox from 'Assets/Condition/SearchConditionBox';
import RackTable from 'Assets/RackView/RackTable';
import UnitInfoBox from 'NetworkConnection/List/UnitInfoBox';
import NetworkInfoBox from 'NetworkConnection/List/NetworkInfoBox';
import NetworkListBox from 'NetworkConnection/List/NetworkListBox';
import MessageModal from 'Assets/Modal/MessageModal';
import WaitingMessage from 'Assets/Modal/WaitingMessage';

import { hasRack } from 'assetUtility';
import { FUNCTION_ID_MAP, getAuthentication } from 'authentication';

/**
 * NetworkList画面のコンポーネント
 */
class NetworkListPanel extends Component {

    /**
     * コンストラクタ
     */
    constructor(){
        super();
    }

    /********************************************
     * React ライフサイクルメソッド
     ********************************************/

    /**
     * 最初のレンダリング時にクライアントに一度だけ呼び出されます。
     * Componentがレンダリングされた直後に呼び出されるメソッドです。
     * ここでsetStateを行うと、renderがもう一度呼び出されるためあまり行わないほうがよいです。
     */
    componentDidMount() {
        const { lookUp, conditions } = this.props.searchCondition;
        const { authentication, routing, cableTypes } = this.props;

        if (!(authentication&&authentication.level)) {
            this.loadAuthentication();
        }
        
        //LookUpがなければ、ロードする
        if (!lookUp || !(cableTypes && cableTypes.length > 0)) {
            this.props.requestInitialInfo();
        }

        //前回の検索条件で、ネットワーク情報を読み込む
        if (routing.locationBeforeTransitions && 
            routing.locationBeforeTransitions.action === 'PUSH' &&
            conditions) {
            this.props.requestGetNetworkPathRows();
        }
    }

    /**
     * render
     */
    render() {
        const { searchCondition, networkPathRows, selectedNetworkPath, tableDisplayState, isLoading, modalInfo, waitingInfo } = this.props;
        const { lookUp, editingCondition } = searchCondition;
        const { isReadOnly, level, loadAuthentication } = this.props.authentication;
        if (selectedNetworkPath) {
            var { networkPathRow, networkPath } = selectedNetworkPath;
        }
        const isRackToAllowed = networkPathRow && networkPathRow.isRackToAllowed;
        const leftRack = networkPath && networkPath.rackFrom;
        const rightRack = selectedNetworkPath && networkPathRow.isRackToAllowed && networkPath.rackTo;
        const highlightUnits = {
            left: networkPath ? [networkPath.unitFrom] : [],
            right: selectedNetworkPath&&networkPathRow.isRackToAllowed&&networkPath.unitTo ? [networkPath.unitTo] : []
        };
        const loading = isLoading || !loadAuthentication;

        return (
            <Content>
                <SearchConditionBox
                    isLoading={loading}
                    lookUp={lookUp}
                    targets={['locations', 'enterprises', 'tags', 'hashTags']}
                    searchCondition={editingCondition}
                    onChange={(condition) => this.props.setEditingCondition(condition)}
                    onSearchClick={(condition) => this.handleSerchClick(condition)} 
                    useHotKeys
                />
                <Row>
                    <Col md={3} smHidden xsHidden >
                        <div className="scroll-pane scroll-pane-md" >
                                <div className="scroll-pane-inner">
                        {leftRack&&hasRack(leftRack)&&
                            <RackTable isLeft={true}
                                       rack={leftRack}
                                       showLocation={true} 
                                       location={leftRack.position}
                                       highlightUnits={highlightUnits.left}
                                       isLoading={loading}
                                       isReadOnly={true}
                                       className="mb-05"
                            />
                        }
                        <UnitInfoBox isHidden={!(networkPath&&networkPath.unitFrom)} 
                                     unit={networkPath&&networkPath.unitFrom} />
                        </div>
                        </div>
                    </Col>
                    <Col sm={12} md={6}>
                        <div className="scroll-pane scroll-pane-md" >
                            <div className="scroll-pane-inner">
                                <NetworkListBox networkPathRows={networkPathRows}
                                                selectedNetworkRow={networkPathRow} 
                                                initialDisplayState={tableDisplayState}
                                                isLoading={loading}
                                                isReadOnly={isReadOnly}
                                                level={level}
                                                onAdd={() => this.dispCreateNetwork()}
                                                onSelect={(network) => this.handleSelectNetwork(network)} 
                                                onEdit={(network) => this.dispEditNetwork(network)} 
                                                onDelete={(network) => this.dispDeleteNetwork(network)} 
                                                onDeleteMultiple={(networkRows) => this.dispDeleteNetworkModal(networkRows)}
                                                onShowPath={() => this.dispNetworkDisplay()}
                                                onChangeTableDisplayState={(setting) => this.props.setTableDisplayState(setting)}
                                />
                                <NetworkInfoBox isHidden={!selectedNetworkPath} network={networkPath&&networkPath.network} />
                            </div>
                        </div>
                    </Col>
                    <Col md={3} smHidden xsHidden >                             
                        <div className="scroll-pane scroll-pane-md" >
                                <div className="scroll-pane-inner">
                        {rightRack&&hasRack(rightRack)&&
                            <RackTable isLeft={false}
                                       rack={rightRack}
                                       showLocation={true} 
                                       location={rightRack.position}
                                       highlightUnits={highlightUnits.right}
                                       isLoading={loading}
                                       isReadOnly={true}
                                       className="mb-05"
                            />
                        }
                        <UnitInfoBox isHidden={!(isRackToAllowed&&networkPath&&networkPath.unitTo)} 
                                     unit={isRackToAllowed&&networkPath&&networkPath.unitTo} />
                        </div>
                        </div>
                    </Col>
                </Row>
                <MessageModal show={modalInfo.delete.show} 
                              title="削除"
                              buttonStyle="delete" 
                              onOK={() => this.deleteNetwrokPaths(modalInfo.delete.targets)} 
                              onCancel={() => this.props.changeDeleteComfirmModalState(false)} >
                              {modalInfo.delete.show&&modalInfo.delete.message}
                </MessageModal>
                <MessageModal show={modalInfo.message.show} 
                              title={modalInfo.message.title} 
                              bsSize="small"
                              buttonStyle="message" 
                              onCancel={() => {modalInfo.message.callback ? modalInfo.message.callback() : this.props.changeMessageModalState(false)}} >
                              {modalInfo.message.show&&
                                  this.makeMessage(modalInfo.message.message, modalInfo.message.attenstion)
                              }
                </MessageModal>
                <WaitingMessage show={waitingInfo.isWaiting} type={waitingInfo.waitingType} />
            </Content>
        );
    }

    /**
     * メッセージを作成する
     * @param {string} message メッセージ
     * @param {string} attenstion 注意メッセージ
     * @returns {array} メッセージ
     */
    makeMessage(message, attenstion) {
        var messages = [];
        messages.push(<div>{message}</div>);
                
        if (attenstion) {
            messages.push(<strong><div className="mt-1" >!!!注意!!!</div></strong>);
            messages.push(<strong>{attenstion}</strong>)
        }

        return messages;        
    }

    /********************************************
     * 認証情報取得
     ********************************************/
    loadAuthentication(){
        getAuthentication(FUNCTION_ID_MAP.networkConnection, (auth) => {
            this.props.setAuthentication(auth);
        });
    }
   
    /********************************************
     * イベントハンドラ
     ********************************************/

    /**
     * 検索ボタン押下イベント
     * @param {*} condition 
     */
    handleSerchClick(condition) {
        this.props.setSearchCondition(condition);
        this.props.requestGetNetworkPathRows();
    }

    /**
     * ネットワーク選択イベント
     * @param {object} networkRow 選択したネットワーク行情報
     */
    handleSelectNetwork(networkRow) {
        if (networkRow) {
            this.props.requestSelectNetworkInfo(networkRow);
        } else {
            this.props.clearNetworkPath();
        }
    }

    /********************************************
     * 画面遷移
     ********************************************/

    /**
     * ネットワーク編集画面（登録モード）を表示する
     */    
    dispCreateNetwork(){
        this.dispNetworkEditPage(null, true);
    }

    /**
     * ネットワーク編集画面（編集モード）を表示する
     * @param {object} networkPath 編集するネットワーク情報
     */
    dispEditNetwork(networkPath){
        this.dispNetworkEditPage(networkPath, true);
    }
    
    /**
     * ネットワーク編集画面（削除モード）を表示する
     * @param {object} networkPath 編集するネットワーク情報
     */
    dispDeleteNetwork(networkRow){
        if (networkRow && networkRow.networkId) {
            this.dispNetworkEditPage(networkRow, false);
        } else {
            this.props.changeMessageModalState(true, '確認', 'ネットワーク接続情報の登録がありません。');
        }
        
    }

    /**
     * 複数のネットワーク情報を削除する
     * @param {array} networkRows ネットワーク行リスト
     */
    dispDeleteNetworkModal(networkRows) {
        let deletenetworkRows = networkRows.filter((row) => row.networkId ? true : false);
        if (deletenetworkRows && deletenetworkRows.length > 0) {
            this.props.changeDeleteComfirmModalState(true, this.makeDeleteMessage(deletenetworkRows), deletenetworkRows);
        } else {
            this.props.changeMessageModalState(true, '確認', 'ネットワーク接続情報の登録がありません。')
        }
    }

    /**
     * ネットワーク接続経路画面を表示する
     */
    dispNetworkDisplay() {
        browserHistory.push({ pathname: '/NetworkConnection/Disp' });
    }

    /**
     * ネットワーク編集ページを表示する
     * @param {object} networkRow 編集対象のネットワーク経路一覧の行情報
     * @param {boolean} isEditMode 編集モードかどうか
     */
    dispNetworkEditPage(networkRow, isEditMode) {
        //編集モード変更
        this.props.setEditMode(isEditMode);

        //編集用のデータをセット
        this.props.requestEditNetworkInfo(networkRow, (result) => {
            result && browserHistory.push({ pathname: '/NetworkConnection/Edit' });
        });

    }

    /**
     * ネットワーク情報をセットする
     * @param {object} rack ラック情報
     * @param {object} unit ユニット情報
     * @param {object} port ポート情報
     * @param {object} isLeft 左側ラックかどうか
     */
    setNetworkConnectInfo(rack, unit, port, portIndex, isLeft) {
        let canConnect = (rack && unit && port && (portIndex !== null)) ? true : false;
        let newPortIndex = !portIndex&&canConnect ? 1 : portIndex;
        this.props.setUnit(unit, canConnect, isLeft);
        this.props.setPort(port, newPortIndex, canConnect, isLeft);
    }

    /********************************************
     * その他
     ********************************************/

    /**
     * 削除メッセージを作成する
     * @param {*} networkRows 
     */
    makeDeleteMessage(networkRows) {
        var message = [ <div className="mb-1">以下に設定されたネットワーク接続情報を削除します。よろしいですか？</div> ];
        var targetNetworks = networkRows.map((row) => {
                                return <li>{row.rackNameFrom + ' / ' + row.unitNameFrom + ' / ' + row.portNoFrom + ( row.portIndexFrom ? ('(' + row.portIndexFrom + ')') : '') }</li>
                            });
        message.push(<ul>{targetNetworks}</ul>);
        return message;
    }

    /**
     * ネットワーク経路を削除する
     * @param {*} networkRows 
     */
    deleteNetwrokPaths(networkRows) {
        this.props.requestDeleteNetworks(networkRows, (result) => {
            result && this.props.changeDeleteComfirmModalState(false);
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
        routing: state.routing,
        authentication: state.authentication,
        cableTypes: state.cableTypes,
        searchCondition: state.searchCondition,
        networkPathRows: state.networkPathRows,
        selectedNetworkPath: state.selectedNetworkPath,
        tableDisplayState: state.tableDisplayState,
        isLoading: state.isLoading,
        modalInfo: state.modalInfo,
        waitingInfo: state.waitingInfo
    };
};

/**
 * 画面更新のアクションを設定します。
 * storeからActionを受け取り、propsに入れ込みます。
 */
const mapDispatchToProps = (dispatch) => {
    return {    
        requestInitialInfo:() => dispatch(requestInitialInfo()),
        requestGetNetworkPathRows:() => dispatch(requestGetNetworkPathRows()),
        requestSelectNetworkInfo:(networkRow) => dispatch(requestSelectNetworkInfo(networkRow)),
        requestEditNetworkInfo:(networkRow, callback) => dispatch(requestEditNetworkInfo(networkRow, callback)),
        requestDeleteNetworks:(networkRows, callback) => dispatch(requestDeleteNetworks(networkRows, callback)),
        setAuthentication:(auth) => dispatch(setAuthentication(auth)),    
        setLookUp: (lookUp) => dispatch(setLookUp(lookUp)),
        setEditingCondition: (condition) => dispatch(setEditingCondition(condition)),
        setSearchCondition: (condition) => dispatch(setSearchCondition(condition)),
        setNetworkPaths:(networkPaths) => dispatch(setNetworkPaths(networkPaths)),
        setNetworkPath:(networkPath) => dispatch(setNetworkPath(networkPath)),
        clearNetworkPath:() => dispatch(clearNetworkPath()),
        setEditingNetworkPath:(networkPath) => dispatch(setEditingNetworkPath(networkPath)),
        setEditMode:(isEditMode)=> dispatch(setEditMode(isEditMode)),
        setLocation:(location, position, isLeft) => dispatch(setLocation(location, position, isLeft)),
        setRack:(rack, isLeft) => dispatch(setRack(rack, isLeft)),
        clearRack:(isLeft) => dispatch(clearRack(isLeft)),
        setUnitDispSetting:(unitDispSetting, isLeft) => dispatch(setUnitDispSetting(unitDispSetting, isLeft)),
        setUnit:(unit, canConnect, isLeft) => dispatch(setUnit(unit, canConnect, isLeft)),
        setPort:(port, portIndex, canConnect, isLeft) => dispatch(setPort(port, portIndex, canConnect, isLeft)),
        clearNetworkOneSide:(isFrom)=> dispatch(clearNetworkOneSide(isFrom)),
        setCableTypes:(cableTypes) => dispatch(setCableTypes(cableTypes)),
        setLoadState:(isLoading) => dispatch(setLoadState(isLoading)),
        changeDeleteComfirmModalState:(show, message, targets, callback) => dispatch(changeDeleteComfirmModalState(show, message, targets, callback)),
        changeMessageModalState:(show, title, message, callback) => dispatch(changeMessageModalState(show, title, message, callback)),
        changeConfirmModalState:(show, title, message, callback) => dispatch(changeConfirmModalState(show, title, message, callback)),
        setWaitingState:(isWaiting, waitingType) => dispatch(setWaitingState(isWaiting, waitingType)),
        setTableDisplayState:(setting) => dispatch(setTableDisplayState(setting))
    };
};

// Wrap the component to inject dispatch and state into it
/**
 * mapStateToProps, mapDispatchToPropsをReduxと連携させる
 */
export default connect(mapStateToProps, mapDispatchToProps)(NetworkListPanel);

 