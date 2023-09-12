/**
 * @license Copyright 2018 DENSO
 * 
 * NetworkEdit画面
 * 
 * 画面のコンテナとして。Reduxに依存したコードを記述します。
 * 画面のロジックはここに記述します。（適宜ファイル分割は行うこと）
 * 
 */
'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';

import { Row, Col, Clearfix } from 'react-bootstrap';

import { setLocation, setLayoutObject, setRack, clearRack } from 'DualRack/actions.js';
import { setWaitingState } from 'WaitState/actions.js';
import { setEditingNetworkPath } from './actionsEditInfo.js';
import { setUnitDispSetting, setUnit, setPort, setPortIndex, setUnitDispSettingOnly } from './actionsEditInfo.js';
import { changeNetworkInfo, changeNetworkConnect  } from './actionsEditInfo.js';
import { clearNetworkConnect, clearNetworkOneSide } from './actionsEditInfo.js';
import { setLoadState } from './actions.js';
import { changeDeleteComfirmModalState, changeConfirmModalState, changeMessageModalState } from './actions.js';

import Content from 'Common/Layout/Content';
import Button from 'Common/Widget/Button';
import MessageModal from 'Assets/Modal/MessageModal';
import WaitingMessage from 'Assets/Modal/WaitingMessage';
import { DeleteHotKeyButton, SaveHotKeyButton } from 'Assets/GarmitButton';

import LocationOverlaySelector from 'Assets/Overlay/LocationOverlaySelector';
import RackTable from 'Assets/RackView/RackTable';
import UnitPortBox from 'NetworkConnection/Edit/UnitPortBox';
import NetworkSettingBox from 'NetworkConnection/Edit/NetworkSettingBox';
import ConnectLine from 'NetworkConnection/Edit/ConnectLine';

import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';
import { LAVEL_TYPE, readOnlyByLevel } from 'authentication';
import { hasRack, getLayoutObject, makeOmitEditNetworkRackData, makeOmitEditNetworkUnitData, makeNetworkPortSimpleData } from 'assetUtility';

/**
 * NetworkEdit画面のコンポーネント
 */
class NetworkEditPanel extends Component {

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
        if (this.props.routing.locationBeforeTransitions && 
            this.props.routing.locationBeforeTransitions.action === 'POP') {
            this.props.changeMessageModalState(true, 'エラー', '進むボタンから編集はできません。元の画面に戻ります。', () => {
                this.props.changeMessageModalState(false);
                browserHistory.goBack();
            }); 
            return;
        }
    }

    /**
     * render
     */
    render() {
        const { isLoading, modalInfo, searchCondition, layouts, cableTypes, waitingInfo } = this.props;
        const { dualRack, selectedUnitDispSetting, selectedUnit, selectedPort, portIndex, canConnect } = this.props.editInfo;
        const { editingNetworkPath, isEditMode } = this.props.editInfo;
        const { level } = this.props.authentication;
        const { leftRack, rightRack } = dualRack;
        const locations = searchCondition.lookUp.locations;
        const rackTableSelectedUnit = { 
            left: selectedUnitDispSetting.left && { id: selectedUnitDispSetting.left.dispSetId, position: selectedUnitDispSetting.left.position },
            right: selectedUnitDispSetting.right && { id: selectedUnitDispSetting.right.dispSetId, position: selectedUnitDispSetting.right.position }
        };
        const isConnect = this.isConnect(editingNetworkPath&&editingNetworkPath.rackFrom, editingNetworkPath&&editingNetworkPath.rackTo);
        const connectStatus = {
            left: hasRack(editingNetworkPath&&editingNetworkPath.rackFrom) ? true : false,
            right: hasRack(editingNetworkPath&&editingNetworkPath.rackTo) ? true : false
        }
        const readOnly = readOnlyByLevel(false, level, LAVEL_TYPE.operator);
        const networkId = editingNetworkPath&&editingNetworkPath.network&&editingNetworkPath.network.networkId;
        return (
            <Content>
                <Row>
                    <Col sm={4} md={3} >
                        <LocationOverlaySelector 
                                key="left" 
                                container={this} 
                                locationList={locations}
                                layoutList={layouts}
                                hideBreadcrumb={true} 
                                selectedLocation={leftRack.location}
                                selectedLayoutObject={leftRack.layoutObject} 
                                isReadOnly={isLoading||!isEditMode||connectStatus.left}
                                onSelect={(value, position, layoutObject) => this.selectLocation(value, position, layoutObject, true)}
                        />
                        <RackTable isLeft={true} 
                                   className="mt-05 mb-05" 
                                   showLocation={true}
                                   rack={leftRack.rack} 
                                   location={leftRack.location.position}
                                   selectedUnit={rackTableSelectedUnit.left}
                                   onSelectUnit={(unitPosition) => this.selectUnitDispSetting(unitPosition, true)}
                                   isReadOnly={(!isEditMode||connectStatus.left)}
                                   isLoading={isLoading}
                        />
                    </Col>
                    <Col sm={4} md={6} className="asset-center-col-info" >
                        <Clearfix className="asset-center-first-row" >
                            <Col className="networkedit-center-col" md={5} >
                                <UnitPortBox networkId={networkId}
                                             unitDispSetting={selectedUnitDispSetting.left}
                                             unit={selectedUnit.left}
                                             port={selectedPort.left}
                                             portIndex={portIndex.left}
                                             isLeft={true}
                                             isReadOnly={readOnly}
                                             isConnect={connectStatus.left}
                                             isEditMode={isEditMode}
                                             isLoading={isLoading}
                                             onChangeUnit={(unit, invalid) => this.props.setUnit(makeOmitEditNetworkUnitData(unit), !invalid, true)}
                                             onChangePort={(port, portIndex, invalid) => this.props.setPort(makeNetworkPortSimpleData(port), portIndex, !invalid, true)}
                                             onChangePortIndex={(portIndex, invalid) => this.props.setPortIndex(portIndex, !invalid, true)}
                                             onDisconnect={() => this.props.clearNetworkOneSide(true)}
                                />
                            </Col>
                            <Col className="networkedit-center-col" md={2} >
                                <ConnectLine isConnect={isConnect} connectStatus={connectStatus} />
                                <div className="ta-c mt-2 hidden-sm hidden-xs">
                                    {!isConnect && !readOnly && 
                                        <Button iconId="connect" 
                                                disabled={!(canConnect.left && canConnect.right)} 
                                                onClick={() => this.connectNetwrok()} >接続
                                        </Button>}
                                </div>
                            </Col>
                            <Col className="networkedit-center-col" md={5} >
                                <UnitPortBox networkId={networkId}
                                             unitDispSetting={selectedUnitDispSetting.right}
                                             unit={selectedUnit.right}
                                             port={selectedPort.right}
                                             portIndex={portIndex.right}
                                             isLeft={false}
                                             isReadOnly={readOnly}
                                             isConnect={connectStatus.right}
                                             isLoading={isLoading}
                                             isEditMode={isEditMode}
                                             onChangeUnit={(unit, invalid) => this.props.setUnit(makeOmitEditNetworkUnitData(unit), !invalid, false)}
                                             onChangePort={(port, portIndex, invalid) => this.props.setPort(makeNetworkPortSimpleData(port), portIndex, !invalid, false)}
                                             onChangePortIndex={(portIndex, invalid) => this.props.setPortIndex(portIndex, !invalid, false)}
                                             onDisconnect={() => this.props.clearNetworkOneSide(false)}
                                />
                            </Col>
                        </Clearfix>
                        <div className="mt-1 visible-xs visible-sm ta-c">
                            {!isConnect && !readOnly &&
                                <Button iconId="connect" 
                                        disabled={!(canConnect.left && canConnect.right)} 
                                        onClick={() => this.connectNetwrok()} >接続
                                </Button>
                            }
                        </div>
                        <NetworkSettingBox className="mt-1" 
                                           network={editingNetworkPath&&editingNetworkPath.network}
                                           cableTypes={cableTypes}
                                           isReadOnly={!isEditMode} 
                                           level={level}
                                           isLoading={isLoading}
                                           onChange={(network, invalid) => this.hanldeNetworkChanged(network, invalid)}
                        />
                        <div className="ta-c mb-2">
                            {!isEditMode && 
                                <DeleteHotKeyButton
                                    onClick={() => this.props.changeDeleteComfirmModalState(true, 'ネットワーク接続情報を削除します。よろしいですか？')}
                                />
                            }
                            {isEditMode && 
                                <SaveHotKeyButton
                                    disabled={this.invalid()} 
                                    onClick={() => this.props.changeConfirmModalState(true, '保存', '編集中の内容を保存します。よろしいですか？')}
                                />
                            }
                            <Button className="ml-05" 
                                    iconId="uncheck" 
                                    bsStyle="lightgray" 
                                    onClick={() => this.cancelNetworkSave()} >キャンセル
                            </Button>
                        </div>
                    </Col>
                    <Col sm={4} md={3} >
                        <LocationOverlaySelector 
                                key="right" 
                                container={this}                                        
                                locationList={locations}
                                layoutList={layouts}
                                hideBreadcrumb={true} 
                                isRightJustified={true}
                                selectedLocation={rightRack.location}
                                selectedLayoutObject={rightRack.layoutObject} 
                                isReadOnly={isLoading||!isEditMode||connectStatus.right}
                                onSelect={(value, position, layoutObject) => this.selectLocation(value, position, layoutObject, false)}
                        />
                        <Clearfix />                                
                        <RackTable isLeft={false} 
                                   className="mt-05 mb-05" 
                                   showLocation={true}
                                   rack={rightRack.rack} 
                                   location={rightRack.location.position}
                                   selectedUnit={rackTableSelectedUnit.right}
                                   onSelectUnit={(unitPosition) => this.selectUnitDispSetting(unitPosition, false)}
                                   isReadOnly={(!isEditMode || connectStatus.right )}
                                   isLoading={isLoading}
                        />
                    </Col>
                </Row>
                <MessageModal show={modalInfo.delete.show} 
                              title="削除"
                              bsSize="small"
                              buttonStyle="delete" 
                              onOK={() => this.deleteNetworkPath()} 
                              onCancel={() => this.props.changeDeleteComfirmModalState(false)} >
                              {modalInfo.delete.show&&modalInfo.delete.message}
                </MessageModal>
                <MessageModal show={modalInfo.confirm.show} 
                              title={modalInfo.confirm.title}
                              bsSize="small"
                              buttonStyle="save" 
                              onOK={() => this.saveNetworkPath()} 
                              onCancel={() => this.props.changeConfirmModalState(false)} >
                              {modalInfo.confirm.show&&modalInfo.confirm.message}
                </MessageModal>
                <MessageModal show={modalInfo.message.show} 
                              title={modalInfo.message.title} 
                              bsSize="small"
                              buttonStyle="message" 
                              onCancel={() => {modalInfo.message.callback ? modalInfo.message.callback() : this.props.changeMessageModalState(false)}} >
                              {modalInfo.message.show&&modalInfo.message.message}
                </MessageModal>
                <WaitingMessage show={waitingInfo.isWaiting} type={waitingInfo.waitingType} />
            </Content>
        );
    }

    /********************************************
     * データ読み込み、保存、削除
     ********************************************/

    /**
     * ラック情報を取得する
     * @param {number} locationId ロケーションID
     * @param {boolean} needLayoutObject レイアウトオブジェクトが必要かどうか
     * @param {boolean} isLeft 左側ラックかどうか
     * @param {function} callback コールバック関数
     */
    loadRack (locationId, needLayoutObject, isLeft, callback) {
        const postData = { locationId, needLayoutObject };
        sendData(EnumHttpMethod.post, '/api/rack/getRack', postData, (rackInfo, networkError) => {
            if (networkError) {
                this.props.changeMessageModalState(true, 'エラー', NETWORKERROR_MESSAGE);
            } else if(rackInfo) {
                this.props.setRack(makeOmitEditNetworkRackData(rackInfo.rack), isLeft);
                needLayoutObject && this.props.setLayoutObject(getLayoutObject(rackInfo.rack), isLeft);                
                if (callback) {
                    callback(rackInfo.rack.location);
                }
            } else {
                this.props.changeMessageModalState(true, 'エラー', 'データ取得に失敗しました。');
            }
            this.props.setLoadState(false);
        });
    }
        
    /**
     * ユニット表示設定グループを取得する
     * @param {string} dispSetId 表示設定ID
     * @param {object} position 選択した位置（x, y）
     * @param {boolean} isLeft 左側ラックかどうか
     * @param {function} callback コールバック関数
     */
    loadUnitDispSetting(dispSetId, position, isLeft, callback) {
        const queryParameter = '/api/unit/getUnit?dispSetId=' + dispSetId;
        sendData(EnumHttpMethod.get, queryParameter, null, (unitInfo, networkError) => {
            if (networkError) {
                this.props.changeMessageModalState(true, 'エラー', NETWORKERROR_MESSAGE);
            } else if (unitInfo) {
                var unitDispSetting = unitInfo.unitDispSetting;
                if (!unitDispSetting.dispSetId) {
                    //表示設定グループとユニットのどちらも選択した位置を入れておく
                    unitDispSetting.position = Object.assign({}, position);
                    unitDispSetting.units.forEach(unit => {
                        unit.position = Object.assign({}, position);
                    });
                }
            } else {
                this.props.changeMessageModalState(true, 'エラー', 'データ取得に失敗しました。' + (callback ? "ネットワーク一覧に戻ります。": ""), () => {
                    this.props.changeMessageModalState(false);
                    if (callback) {     
                        this.props.setLoadState(false);
                        this.cancelNetworkSave();
                    }
                });
            }
            
            if (callback) {
                callback(unitDispSetting);
            } else {
                unitDispSetting&&this.props.setUnitDispSetting(unitDispSetting, isLeft);    
                unitDispSetting&&this.selectFirstUnit(unitDispSetting.units, isLeft);
                this.props.setLoadState(false);
            }
        });
    }

    /**
     * ネットワーク情報を保存する
     */
    saveNetworkPath() {
        this.props.changeConfirmModalState(false);
        this.props.setWaitingState(true, 'save');
        sendData(EnumHttpMethod.post, '/api/networkPath/setNetworkPath', this.props.editInfo.editingNetworkPath, (result, networkError) => {
            this.props.setWaitingState(false);
            if (networkError) {
                this.props.changeMessageModalState(true, 'エラー', NETWORKERROR_MESSAGE);
            } else if (result) {
                this.props.changeMessageModalState(true, '保存完了', 'ネットワーク接続情報の保存が完了しました。', () => {
                    this.props.changeMessageModalState(false);
                    browserHistory.push({ pathname: '/NetworkConnection' });
                });                 
            } else {
                this.props.changeMessageModalState(true, 'エラー', 'ネットワーク接続情報が保存できません。');
            }
        });
    }

    /**
     * ネットワーク情報を削除する
     */
    deleteNetworkPath() {
        this.props.changeDeleteComfirmModalState(false);
        this.props.setWaitingState(true, 'delete');
        sendData(EnumHttpMethod.post, '/api/networkPath/deleteNetworkPath', this.props.editInfo.editingNetworkPath, (result, networkError) => {
            this.props.setWaitingState(false);
            if (networkError) {
                this.props.changeMessageModalState(true, 'エラー', NETWORKERROR_MESSAGE);
            } else if (result) {
                this.props.changeMessageModalState(true, '削除完了', 'ネットワーク接続情報の削除が完了しました。', () => {
                    this.props.changeMessageModalState(false);
                    browserHistory.push({ pathname: '/NetworkConnection' });
                });                 
            } else {
                this.props.changeMessageModalState(true, 'エラー', 'ネットワーク接続情報が削除できません。');
            }
        });
    }

    /********************************************
     * ロケーション選択
     ********************************************/

    /**
     * ロケーションを選択する
     * @param {object} value ロケーション情報 
     * @param {array} position ロケーションの位置情報
     * @param {object} layoutObject レイアウトオブジェクト
     * @param {boolean} isLeft 左側ラックかどうか
     */
    selectLocation(value, position, layoutObject, isLeft){
        if (value.locationId && value.isAllowed) {
            const needLayoutObject = !layoutObject;
            this.props.setLoadState(true);
            this.loadRack(value.locationId, needLayoutObject, isLeft, (location) => {                
                this.props.setLocation(location, position, isLeft);
                !needLayoutObject && this.props.setLayoutObject(layoutObject, isLeft);
            });
        }
    }
    
    /********************************************
     * ユニット選択関係
     ********************************************/ 
    
    /**
     * ユニット位置を選択する
     * @param {object} unitPosition ユニット位置情報（id: 表示設定ID、positoon: { x, y }： 選択位置) 
     * @param {boolean} isLeft 左側ラックかどうか
     */
    selectUnitDispSetting(unitPosition, isLeft) {
        if (unitPosition.id) {
            this.loadUnitDispSetting(unitPosition.id, unitPosition.position, isLeft);
        }
    }


    /**
     * 表示設定グループ内の最初のユニットを選択する
     * @param {array} units ユニットリスト
     * @param {boolean} isLeft 左側ラックかどうか
     */
    selectFirstUnit(units, isLeft) {
        const unitNoList = units.map((unit) => unit.unitNo);
        const minUnitNo = Math.min.apply(null, unitNoList);
        if (minUnitNo <= 0) {
            var unit = units.find((unit) => unit.unitNo ===  minUnitNo);
        } else {
            var unit = units[0];
        }        
        this.props.setUnit(makeOmitEditNetworkUnitData(unit), false, isLeft);
    }

    /********************************************
     * 編集関係
     ********************************************/

    /**
     * ネットワーク設定情報の変更イベント
     * @param {object} network 変更後のネットワーク設定情報
     * @param {boolean} invalid 保存が無効かどうか
     */
    hanldeNetworkChanged(network, invalid){
        this.props.changeNetworkInfo(network, invalid);
    }

    /**
     * ネットワークを接続する
     */
    connectNetwrok() {
        const { dualRack, selectedUnit, selectedPort, portIndex } = this.props.editInfo;
        if (selectedUnit.left.unitId !== selectedUnit.right.unitId) {
            this.props.changeNetworkConnect(dualRack.leftRack.rack, selectedUnit.left, selectedPort.left, portIndex.left, dualRack.rightRack.rack, selectedUnit.right, selectedPort.right, portIndex.right);
        } else {
            this.props.changeMessageModalState(true, 'エラー', '同一ユニットは接続できません。ユニットを再選択してください。');
        }
    }
    
    /********************************************
     * その他
     ********************************************/
    
    /**
     * 保存が無効かどうか
     */
    invalid(){
        const { invalid } = this.props.editInfo;
        var invalidSave = false;
        for (const key in invalid) {
            if (invalid.hasOwnProperty(key) && invalid[key]) {
                invalidSave = true;
                break; 
            }
        }
        return invalidSave;
    }

    /**
     * 接続中かどうか（片方接続中は含まない）
     * @param {object} rackFrom 接続元ラック情報
     * @param {object} rackTo 接続先ラック情報
     * @returns {boolean} 接続中かどうか
     */
    isConnect(rackFrom, rackTo) {
        return (rackFrom && rackTo) ? true : false;
    }
    
    /**
     * ネットワーク保存をキャンセルする
     */
    cancelNetworkSave(){
        browserHistory.goBack();
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
        searchCondition: state.searchCondition,
        editInfo: state.editInfo,
        layouts: state.layouts,
        cableTypes: state.cableTypes,
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
        setLocation:(location, position, isLeft) => dispatch(setLocation(location, position, isLeft)),
        setLayoutObject:(layoutObject, isLeft) => dispatch(setLayoutObject(layoutObject, isLeft)),
        setRack:(rack, isLeft) => dispatch(setRack(rack, isLeft)),
        clearRack:(isLeft) => dispatch(clearRack(isLeft)),
        setEditingNetworkPath:(networkPath) => dispatch(setEditingNetworkPath(networkPath)),
        setUnitDispSetting:(unitDispSetting, isLeft) => dispatch(setUnitDispSetting(unitDispSetting, isLeft)),
        setUnit:(unit, canConnect, isLeft) => dispatch(setUnit(unit, canConnect, isLeft)),
        setPort:(port, portIndex, canConnect, isLeft) => dispatch(setPort(port, portIndex, canConnect, isLeft)),
        setPortIndex:(portIndex, canConnect, isLeft) => dispatch(setPortIndex(portIndex, canConnect, isLeft)),
        setUnitDispSettingOnly:(unitDispSetting, isLeft) => dispatch(setUnitDispSettingOnly(unitDispSetting, isLeft)),
        changeNetworkInfo:(network, invalid) => dispatch(changeNetworkInfo(network, invalid)),
        changeNetworkConnect:(rackFrom, unitFrom, portFrom, portIndexFrom, rackTo, unitTo, portTo, portIndexTo) => dispatch(changeNetworkConnect(rackFrom, unitFrom, portFrom, portIndexFrom, rackTo, unitTo, portTo, portIndexTo)),
        clearNetworkConnect:()=> dispatch(clearNetworkConnect()),
        clearNetworkOneSide:(isFrom)=> dispatch(clearNetworkOneSide(isFrom)),
        setLoadState:(isLoading) => dispatch(setLoadState(isLoading)),
        changeDeleteComfirmModalState:(show, message, targets, callback) => dispatch(changeDeleteComfirmModalState(show, message, targets, callback)),
        changeMessageModalState:(show, title, message, callback) => dispatch(changeMessageModalState(show, title, message, callback)),
        changeConfirmModalState:(show, title, message, callback) => dispatch(changeConfirmModalState(show, title, message, callback)),
        setWaitingState:(isWaiting, waitingType) => dispatch(setWaitingState(isWaiting, waitingType))
    };
};

// Wrap the component to inject dispatch and state into it
/**
 * mapStateToProps, mapDispatchToPropsをReduxと連携させる
 */
export default connect(mapStateToProps, mapDispatchToProps)(NetworkEditPanel);

 