/**
 * @license Copyright 2017 DENSO
 * 
 * UnitMove画面
 * 
 * 画面のコンテナとして。Reduxに依存したコードを記述します。
 * 画面のロジックはここに記述します。（適宜ファイル分割は行うこと）
 * 
 */
'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import { Row, Col, Clearfix } from 'react-bootstrap';

import { setLocation, setLayoutObject, setRack, clearRack, setRackPowerValues } from 'DualRack/actions.js'
import { setAuthentication } from 'Authentication/actions.js';
import { setWaitingState } from 'WaitState/actions.js';
import { setLocations, setLayouts, setMovingInfo, setTargetPosition } from './actions.js';
import { clearMovingInfo, clearTargetInfo } from './actions.js';

import { changeUnitSelectModalState, changeSaveCompletedModalState, changeMessageModalState } from './actions.js';
import { setLoadState, changeMode } from './actions.js';

import Content from 'Common/Layout/Content';

import LocationOverlaySelector from 'Assets/Overlay/LocationOverlaySelector';
import RackTable from 'Assets/RackView/RackTable';
import RackPowerListBox from 'UnitMove/RackPowerListBox';
import MoveUnitInfo from 'UnitMove/MoveUnitInfo';
import TargetRackInfo from 'UnitMove/TargetRackInfo';
import MoveButton from 'UnitMove/MoveButton';
import ModeToggleButton from 'UnitMove/ModeToggleButton';
import Button from 'Common/Widget/Button';

import CompletedModal from 'UnitMove/Modal/CompletedModal';
import UnitSelectModal from 'UnitMove/Modal/UnitSelectModal';
import MessageModal from 'Assets/Modal/MessageModal';
import WaitingMessage from 'Assets/Modal/WaitingMessage';

import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';
import { isTouchDevice } from 'browserDeviceUtility';
import { hasRack, getLayoutObject } from 'assetUtility';
import { rackColumnMinCheck, rackRowMinCheck } from 'unitMountCheck';
import { FUNCTION_ID_MAP, LAVEL_TYPE, readOnlyByLevel, getAuthentication } from 'authentication';

const MODE_DRAG_AND_DROP = 1;
const MODE_BUTTON = 2;

/**
 * UnitMove画面のコンポーネント
 */
@DragDropContext(HTML5Backend)
class UnitMovePanel extends Component {

    static get MODE_LIST() {
        return [
            { value: MODE_DRAG_AND_DROP, text: 'ドラッグ＆ドロップ' },
            { value: MODE_BUTTON, text: '移動ボタン' }
        ]
    }

    /**
     * コンストラクタ
     */
    constructor(){
        super();
        this.state = {
            isTouchDevice: false,
            showModal: {
                unitSelect: false,
                completed: false
            }
        };
    }

    /**
     * 最初のレンダリング時にクライアントに一度だけ呼び出されます。
     * Componentがレンダリングされた直後に呼び出されるメソッドです。
     * ここでsetStateを行うと、renderがもう一度呼び出されるためあまり行わないほうがよいです。
     */
    componentDidMount() {
        this.loadInfo();
        this.loadAuthentication();
        this.setIsTouchDevice();
    }
    
    /**
     * render
     */
    render() {
        const { dualRack, locations, layouts, movingInfo, targetInfo } = this.props;
        const { level, loadAuthentication } = this.props.authentication;
        const { isLoading, modalInfo, mode, waitingInfo } = this.props;
        const { isTouchDevice } = this.state;
        const { leftRack, rightRack } = dualRack;
        const selectedUnit = this.getSelectUnitInfo(mode, movingInfo, targetInfo);
        const isReadOnly = readOnlyByLevel(this.props.authentication.isReadOnly, level, LAVEL_TYPE.operator);
        const loading = isLoading || !loadAuthentication;
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
                            isRightJustified={false}
                            selectedLocation={leftRack.location} 
                            selectedLayoutObject={leftRack.layoutObject} 
                            isReadOnly={loading}
                            onSelect={(value, position, layoutObject) => this.selectLocation(value, position, layoutObject, true)}
                        />
                        <RackTable isLeft={true} 
                                   className="mt-05 mb-05" 
                                   isLoading={loading}
                                   rack={leftRack.rack}
                                   showLocation={true} 
                                   location={leftRack.location.position}
                                   selectedUnit={selectedUnit.left}
                                   isDrag={mode===MODE_DRAG_AND_DROP} 
                                   onDrop={(dispSetId, position) => this.showUnitSelectModal(dispSetId, position, isReadOnly)}
                                   onBeginDrag={(dispSetId) => this.setMovingInfo(dispSetId, true)}
                                   onDragEnd={() => this.props.clearMovingInfo()}
                                   onSelectUnit={(unitPosition) => this.selectUnitPosition(unitPosition, true, isReadOnly)}
                        />
                        <RackPowerListBox isLoading={loading} powers={leftRack.rack.powers} rackPowerValues={leftRack.rackPowerValues} />
                    </Col>
                    <Col sm={4} md={6} className="asset-center-col-info" >
                        {!isTouchDevice&&!isReadOnly&&<ModeToggleButton defaultMode={MODE_DRAG_AND_DROP} modes={UnitMovePanel.MODE_LIST} onChange={(mode) => this.props.changeMode(mode)} />}
                        <MoveUnitInfo rackName={movingInfo.rack&&movingInfo.rack.rackName} 
                                      unitDispSetting={movingInfo.unitDispSetting} 
                                      isLeft={movingInfo.unitDispSetting&&movingInfo.isLeft} 
                                      isTouchDevice={isTouchDevice||isReadOnly}
                        />
                        <TargetRackInfo rack={targetInfo.rack} isLeft={targetInfo.rack&&targetInfo.isLeft} />
                        {mode===MODE_BUTTON&&!isReadOnly&&
                            <div className="ta-c mb-2 hidden-xs" >
                                <MoveButton disabled={this.invaildMoveButton()} 
                                            isLeftDirection={!movingInfo.isLeft} 
                                            onClick={() => this.props.changeUnitSelectModalState(true)} 
                                />
                                <Button iconId="erase"
                                        className="ml-05"
                                        bsStyle="lightgray"
                                        onClick={() => this.props.clearMovingInfo()} >クリア</Button>
                            </div>
                        }
                    </Col>
                    <Col sm={4} md={3} >
                        <LocationOverlaySelector 
                            key="right" 
                            container={this} 
                            locationList={locations}
                            layoutList={layouts}
                            hideBreadcrumb={true} 
                            isRightJustified    
                            selectedLocation={rightRack.location} 
                            selectedLayoutObject={rightRack.layoutObject} 
                            isReadOnly={loading}
                            onSelect={(value, position, layoutObject) => this.selectLocation(value, position, layoutObject, false)}
                        />
                        <Clearfix />
                        <RackTable isLeft={false} 
                                   className="mt-05 mb-05" 
                                   isLoading={loading}
                                   showLocation={true} 
                                   location={rightRack.location.position}
                                   rack={rightRack.rack}
                                   selectedUnit={selectedUnit.right}
                                   isDrag={mode===MODE_DRAG_AND_DROP} 
                                   onDrop={(dispSetId, position) => this.showUnitSelectModal(dispSetId, position, isReadOnly)}
                                   onBeginDrag={(dispSetId) => this.setMovingInfo(dispSetId, false)}
                                   onDragEnd={() => this.props.clearMovingInfo()}
                                   onSelectUnit={(unitPosition) => this.selectUnitPosition(unitPosition, false, isReadOnly)}
                        />
                        <RackPowerListBox isLoading={loading} powers={rightRack.rack.powers} rackPowerValues={rightRack.rackPowerValues} />
                    </Col>
                </Row>
                <UnitSelectModal show={modalInfo.unitSelect.show} 
                                 movingInfo={movingInfo}
                                 targetInfo={targetInfo}
                                 onCancel={() => this.cancelMoveUnit()} 
                                 onSave={(units) => this.saveUnitInfo(units)} 
                />
                <CompletedModal show={modalInfo.saveCompleted.show} 
                                locationId={modalInfo.saveCompleted.locationId}
                                dispSetId={modalInfo.saveCompleted.dispSetId}
                                onHide={() => this.hideCompletedModal()} />
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
        getAuthentication(FUNCTION_ID_MAP.unitMove, (auth) => {
            this.props.setAuthentication(auth);
        });
    }

    /********************************************
     * データ読み込み、保存、削除
     ********************************************/

    /**
     * 画面の初期データを非同期で読み込む
     * @param {number} locationId ロケーションID
     */
    loadInfo () {
        this.props.setLoadState(true);
        sendData(EnumHttpMethod.get, 'api/Unit', null, (unitInfo, networkError) => {
            if (networkError) {
                this.props.changeMessageModalState(true, 'エラー', NETWORKERROR_MESSAGE);
            } else if (unitInfo) {
                this.props.setLocations(unitInfo.lookUp.locations);
                this.props.setLayouts(unitInfo.lookUp.layouts);
            } else {
                this.props.changeMessageModalState(true, 'エラー', 'データ取得に失敗しました。');
            }
            this.props.setLoadState(false);
        });
    }
    
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
                this.props.setLoadState(false);
            } else if (rackInfo) {
                this.props.setRack(rackInfo.rack, isLeft);
                const { movingInfo } = this.props;
                
                if (movingInfo.unitDispSetting) {
                    this.props.setMovingInfo(movingInfo.unitDispSetting, movingInfo.rack, rackInfo.rack, isLeft);
                }
    
                this.props.setRackPowerValues(rackInfo.rackPowerValues, isLeft);
                needLayoutObject && this.props.setLayoutObject(getLayoutObject(rackInfo.rack), isLeft);
                
                if (callback) {                    
                    callback(rackInfo.rack.location);
                } else {
                    this.props.setLoadState(false);
                }
            } else {
                this.props.changeMessageModalState(true, 'エラー', 'データ取得に失敗しました。');
                this.props.setLoadState(false);
            }
        });
    }

    /**
     * ラック電源使用状況を取得する
     * @param {number} locationId ロケーションID
     * @param {boolean} isLeft 左側ラックかどうか
     * @param {function} callback コールバック関数
     */
    loadRackPowerValues (locationId, isLeft, callback) {
        const queryParameter = 'api/rack/getPowerValues?locationId=' + locationId.toString();
        sendData(EnumHttpMethod.get, queryParameter, null, (rackInfo, networkError) => {
            if (networkError) {
                this.props.changeMessageModalState(true, 'エラー', NETWORKERROR_MESSAGE);
                this.props.setLoadState(false);
            } else if (rackInfo) {
                this.props.setRackPowerValues(rackInfo.rackPowerValues, isLeft);
                if (callback) {
                    callback();
                } else {
                    this.props.setLoadState(false);
                }
            } else {
                this.props.changeMessageModalState(true, 'エラー', 'データ取得に失敗しました。');
                this.props.setLoadState(false);
            }
        });
    }

    /**
     * ユニットを保存する
     * @param {array} units ユニット一覧（搭載位置変更後）
     * @param {string} dispSetId 移動元の表示設定ID
     * @param {object} rack 移動先のラック情報
     */
    saveUnits(units, dispSetId, rack) {
        const unitSetQuery = {
            units: units,
            dispSetId: dispSetId,
            rack: rack
        };
        this.props.changeUnitSelectModalState(false);
        this.props.setWaitingState(true, 'save');
        sendData(EnumHttpMethod.post, 'api/unit/setUnits', unitSetQuery, (result, networkError) => {
            this.props.setWaitingState(false);
            if (!networkError && result.isSuccess) {
                this.props.changeSaveCompletedModalState(true, rack.location.locationId, result.registeredDispSetId);
            } else {
                this.props.changeMessageModalState(true, 'エラー', networkError ? NETWORKERROR_MESSAGE : result.message);
                if (this.props.mode === MODE_DRAG_AND_DROP) {
                    this.props.clearMovingInfo();
                }
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

            if (hasRack(this.props.movingInfo.rack) && this.props.movingInfo.isLeft == isLeft) {
                this.props.clearMovingInfo();
            } else if (hasRack(this.props.targetInfo.rack)  && this.props.targetInfo.isLeft == isLeft) {
                this.props.clearTargetInfo();
            }
            
            this.props.setLoadState(true);
            this.loadRack(value.locationId, needLayoutObject, isLeft, (location) => {                
                this.props.setLocation(location, position, isLeft);
                !needLayoutObject && this.props.setLayoutObject(layoutObject, isLeft);
                this.props.setLoadState(false);
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
     * @param {boolean} isReadOnly 読み取り専用かどうか
     */
    selectUnitPosition (unitPosition, isLeft, isReadOnly) {
        if (isReadOnly) {
            return;
        }

        const { movingInfo, targetInfo } = this.props;
        if (!movingInfo.unitDispSetting || movingInfo.isLeft === isLeft) {
            //移動元情報、移動先ラックをセットする。（ユニットが選択されているときのみ）
            if (unitPosition.id) {
                this.setMovingInfo(unitPosition.id, isLeft);
            }
        } else {
            const position = unitPosition.id ? this.getDispSetting(targetInfo.rack, unitPosition.id).position : unitPosition.position;
            if (this.canMoveUnit(movingInfo, unitPosition.id, position)) {
                //移動先情報をセットする
                this.props.setTargetPosition(unitPosition.id, position);
            }
        }
    }

    /**
     * ユニット移動できるか
     * @param {object} movingInfo 移動ユニット
     * @param {string} dispSetId 移動対象の表示設定ID
     * @param {object} position 移動対象のユニット位置情報
     */
    canMoveUnit(movingInfo, dispSetId, position) {
        if (movingInfo.unitDispSetting.dispSetId === dispSetId) {
            this.props.changeMessageModalState(true, '確認', '移動するユニットは選択できません。');
            return false;
        }

        const targetRack = this.props.targetInfo.rack;
        if (!(rackColumnMinCheck(movingInfo.unitDispSetting.units, targetRack.col, position.x) &&
              rackRowMinCheck(movingInfo.unitDispSetting.units, targetRack.row, position.y))) {
            this.props.changeMessageModalState(true, '確認', 'ラックのユニット数を超えるため、移動できません。');
            return false;
        }

        return true;
    }

    /********************************************
     * 移動情報関係
     ********************************************/

    /**
     * 移動ユニット、移動先ラック情報をセットする
     * @param {number} dispSetId ドラッグした表示設定グループID
     * @param {boolean} isLeft ドラッグしたが左側ラックか
     */
    setMovingInfo(dispSetId, isLeft) {
        const { dualRack } = this.props;
        const sourceRack = isLeft ? dualRack.leftRack.rack : dualRack.rightRack.rack;
        const targetRack = !isLeft ? dualRack.leftRack.rack : dualRack.rightRack.rack;
        const sourceDispSetting = this.getDispSetting(sourceRack, dispSetId)
        this.props.setMovingInfo(sourceDispSetting, sourceRack, targetRack, !isLeft);
    }

    /**
     * ユニット移動をキャンセルする
     */
    cancelMoveUnit() {
        if (this.props.mode === MODE_DRAG_AND_DROP) {
            this.props.clearMovingInfo();
        }
        this.props.changeUnitSelectModalState(false);
    }

    /**
     * ユニット情報を保存する
     * @param {array} units 保存するユニット
     */
    saveUnitInfo(units) {
        const { unitDispSetting } = this.props.movingInfo;
        const { rack } = this.props.targetInfo;
        this.saveUnits(units, unitDispSetting.dispSetId, rack);
    }

    /********************************************
     * 移動情報関係
     ********************************************/

    /**
     * ユニット選択モーダルを表示する
     * @param {string} dispSetId 移動先の表示設定ID
     * @param {object} unitPosition ユニット位置
     */
    showUnitSelectModal(dispSetId, unitPosition, isReadOnly){
        if (isReadOnly) {
            this.props.clearMovingInfo();
            this.props.clearTargetInfo();
            return;
        }

        const { movingInfo, targetInfo } = this.props;
        const position = dispSetId ? this.getDispSetting(targetInfo.rack, dispSetId).position : unitPosition;
        if (this.canMoveUnit(movingInfo, dispSetId, position )) {
            this.props.setTargetPosition(dispSetId, position);
            this.props.changeUnitSelectModalState(true);
        }
    }
    
    /**
     * 保存完了モーダルを非表示にする
     */
    hideCompletedModal() {   
        this.props.changeSaveCompletedModalState(false);
        this.props.clearMovingInfo();
        
        //ラックの再表示     
        const { leftRack, rightRack } = this.props.dualRack;
        this.props.setLoadState(true);
        var endLoading = false;
        this.loadRack(leftRack.rack.location.locationId, false, true, () => {
            if (endLoading) {
                this.props.setLoadState(false);
            } else {
                endLoading = true;
            }
        });
        this.loadRack(rightRack.rack.location.locationId, false, false, () => {
            if (endLoading) {
                this.props.setLoadState(false);
            } else {
                endLoading = true;
            }
        });
    }

    /********************************************
     * その他
     ********************************************/

    /**
     * タッチデバイスかどうかをセットする
     */
    setIsTouchDevice() {
        const isTouch = isTouchDevice();
        if (isTouch) {
            this.props.changeMode(MODE_BUTTON);
        } else {
            this.props.changeMode(MODE_DRAG_AND_DROP);
        }
        this.setState({isTouchDevice: isTouch})
    }

    /**
     * 表示設定グループを取得する
     * @param {object} rack ラック
     * @param {string} dispSetId 対象の表示設定ID
     */
    getDispSetting(rack, dispSetId) {
        if (!hasRack(rack)) {
            return null;
        }
        return rack.unitDispSettings.find((dispSetting) => dispSetting.dispSetId === dispSetId);
    }

    /**
     * 選択ユニット情報を取得する
     * @param {number} mode モード
     * @param {object} movingInfo 移動元情報
     * @param {object} targetInfo 移動先情報
     */
    getSelectUnitInfo(mode, movingInfo, targetInfo) {
        var selectUnit = { left: null, right: null };
        if (!(mode===MODE_DRAG_AND_DROP)) {
            let movingUnit = movingInfo.unitDispSetting ? { id: movingInfo.unitDispSetting.dispSetId, position: movingInfo.unitDispSetting.position } : null;
            let targetUnit = targetInfo.position ? { id: targetInfo.dispSetId, position: targetInfo.position } : null;
            selectUnit.left = movingInfo.isLeft ? movingUnit : targetUnit;
            selectUnit.right = !movingInfo.isLeft ? movingUnit : targetUnit;
        }
        return selectUnit;
    }

    /**
     * 移動ボタンが無効かどうか
     */
    invaildMoveButton() {
        const { movingInfo, targetInfo } = this.props;
        if (movingInfo.unitDispSetting && targetInfo.rack && targetInfo.position) {
            return false;
        }
        return true;
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
        dualRack: state.dualRack,
        locations: state.locations,
        layouts: state.layouts,
        movingInfo: state.movingInfo,
        targetInfo: state.targetInfo,
        isLoading: state.isLoading,
        modalInfo: state.modalInfo,
        mode: state.mode,
        waitingInfo: state.waitingInfo
    };
};

/**
 * 画面更新のアクションを設定します。
 * storeからActionを受け取り、propsに入れ込みます。
 */
const mapDispatchToProps = (dispatch) => {
    return {
        setAuthentication:(auth) => dispatch(setAuthentication(auth)),
        setLocations:(locations) => dispatch(setLocations(locations)),
        setLayouts:(layouts) => dispatch(setLayouts(layouts)),
        setLocation:(location, position, isLeft) => dispatch(setLocation(location, position, isLeft)),
        setLayoutObject:(layoutObject, isLeft) => dispatch(setLayoutObject(layoutObject, isLeft)),
        setRack:(rack, isLeft) => dispatch(setRack(rack, isLeft)),
        setRackPowerValues:(values, isLeft) => dispatch(setRackPowerValues(values, isLeft)),
        clearRack:(isLeft) => dispatch(clearRack(isLeft)),
        setMovingInfo:(dispSetting, sourceRack, targetRack, isLeftDirection) => dispatch(setMovingInfo(dispSetting, sourceRack, targetRack, isLeftDirection)),
        setTargetPosition:(dispSetId, position) => dispatch(setTargetPosition(dispSetId, position)),
        clearMovingInfo:() => dispatch(clearMovingInfo()),
        clearTargetInfo:() => dispatch(clearTargetInfo()),
        changeUnitSelectModalState:(show) => dispatch(changeUnitSelectModalState(show)),
        changeSaveCompletedModalState:(show, locationId, dispSetId) => dispatch(changeSaveCompletedModalState(show, locationId, dispSetId)),
        changeMessageModalState:(show, title, message, callback) => dispatch(changeMessageModalState(show, title, message, callback)),
        setLoadState:(isLoading) => dispatch(setLoadState(isLoading)),
        changeMode:(mode) => dispatch(changeMode(mode)),
        setWaitingState:(isWaiting, waitingType) => dispatch(setWaitingState(isWaiting, waitingType))
    };
};

// Wrap the component to inject dispatch and state into it
/**
 * mapStateToProps, mapDispatchToPropsをReduxと連携させる
 */
export default connect(mapStateToProps, mapDispatchToProps)(UnitMovePanel);

const unitSource = {
    beginDrag(props) {
        return props;
    }
}

function collect(connect, monitor) {
    return {
      connectDragSource: connect.dragSource(),
      isDragging: monitor.isDragging()
    }
}
