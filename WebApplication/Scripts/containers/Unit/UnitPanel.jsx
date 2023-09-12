/**
 * @license Copyright 2018 DENSO
 * 
 * Unit画面
 * 
 * 画面のコンテナとして。Reduxに依存したコードを記述します。
 * 画面のロジックはここに記述します。（適宜ファイル分割は行うこと）
 * 
 */
'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import { Row, Col, ButtonToolbar } from 'react-bootstrap';

import { setAuthentication } from 'Authentication/actions.js';
import { setLocations, setLayouts, selectLocation, clearLocation, selectLayoutObject, clearLayoutObject } from 'LocationSelector/actions.js';
import { setWaitingState } from 'WaitState/actions.js';
import { setMasterData, setUnitImages } from './actions.js';
import { setLoadState, setEditMode } from './actions.js';
import { setSelectedRack, setSelectedDispSetting, setSelectedUnit, clearSelectRack } from './actions.js';
import { setEditingUnit, changeUnitOverview, changeUnitDetail, changeUnitPowers, changeUnitLinks, changeUnitNetwork, changeUnitDispSetting } from './actions.js';
import { changeDispSettingModalState, changeSelectTemplateModalState, changeAddTemplateModalState, changeConfirmModalState, changeMessageModalState } from './actions.js';
import { changeReportOutputModalState, changeReportHistoryModalState, changeReportFormatModalState, setLoginUser } from './actions.js';
import { applyTemplate, setApplayTemplateState } from './actions.js';

import Content from 'Common/Layout/Content';
import BoxGroup from 'Common/Layout/BoxGroup';
import LocationOverlaySelector from 'Assets/Overlay/LocationOverlaySelector';
import RackTable from 'Assets/RackView/RackTable';

import UnitSelectForm from 'Unit/UnitSelectForm';
import UnitOverviewBox from 'Unit/UnitOverviewBox';
import AssetDetailBox from 'Assets/AssetDetailBox';
import UnitPowerBox from 'Unit/UnitPowerBox';
import LinkSettingPanel from 'Assets/LinkSettingPanel';
import UnitNetworkBox from 'Unit/UnitNetworkBox';

import TemplateAddModal from 'Assets/Modal/TemplateAddModal';
import TemplateSelectModal from 'Assets/Modal/TemplateSelectModal';
import DispSettingModal from 'Unit/Modal/DispSettingModal';
import MessageModal from 'Assets/Modal/MessageModal';
import WaitingMessage from 'Assets/Modal/WaitingMessage';
import RackReportOutputModal from 'Assets/Modal/RackReportOutputModal';
import RackReportHistoryModal from 'Assets/Modal/RackReportHistoryModal';
import RackReportFormatModal from 'Assets/Modal/RackReportFormatModal';

import LinkButton from 'Common/Widget/LinkButton';
import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';

import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';
import { convertDateTimeExtendedData, convertNumberExtendedData, hasRack, hasUnit, hasUnitDispSetting, getLayoutObject } from 'assetUtility';
import { MESSAGEMODAL_BUTTON } from 'constant';
import { getMultiSessionStorage, setSessionStorage, STORAGE_KEY } from 'webStorage';
import { FUNCTION_ID_MAP, LAVEL_TYPE, readOnlyByLevel, getAuthentication } from 'authentication';

/**
 * Unit画面のコンポーネント
 */
class UnitPanel extends Component {

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
        //画面遷移時保存したキーを取得して、再表示する
        const keyVakues = getMultiSessionStorage([STORAGE_KEY.locationId, STORAGE_KEY.dispSetId, STORAGE_KEY.unitId]);
        this.loadAuthentication();
        this.loadInfo(keyVakues[STORAGE_KEY.locationId], keyVakues[STORAGE_KEY.dispSetId], keyVakues[STORAGE_KEY.unitId]);
        this.loadLoginUser();
    }
    
    /**
     * render
     */
    render() {
        const { locationSelector, masterInfo, loginUser } = this.props;
        const { selectedRack, selectedRackPowers, selectedDispSetting, selectedUnit } = this.props;
        const { editingUnit, editingDispSetting } = this.props;
        const { isEditing, isLoading, isApplyTemplate, modalInfo, waitingInfo } = this.props;
        const { isReadOnly, level, loadAuthentication } = this.props.authentication;
        
        const { locations, selectedLocation, layouts, selectedLayoutObject } = locationSelector;
        const { unitStatuses, unitTypes, networkConnectors, unitImages } = masterInfo;
        const { units } = selectedDispSetting

        const loading = isLoading || !loadAuthentication;

        const selectUnitPostion = {
            id: selectedDispSetting.dispSetId,
            position: Object.assign({}, selectedDispSetting.position)
        };

        const isSelectRack = hasRack(selectedRack);
        const isSelectedUnitPositon = this.isUnitPosition(selectedDispSetting.position);
        const isSelectUnit = hasUnit(selectedUnit);
        const unit = isEditing ? editingUnit : selectedUnit;
        const dispSetting = isEditing ? editingDispSetting : selectedDispSetting;

        return (
            <Content>
                <Row className="mb-05">
                    <Col md={12}>
                        <LocationOverlaySelector 
                            container={this} 
                            locationList={locations}
                            layoutList={layouts}
                            selectedLocation={selectedLocation}
                            selectedLayoutObject={selectedLayoutObject}
                            onSelect={(value, position, layoutObject) => this.selectLocation(value, position, layoutObject)}
                            isReadOnly={loading||isEditing}
                            isLoading={loading}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col sm={5} md={3} >
                        <div className="scroll-pane scroll-pane-sm" >
                            <div className="scroll-pane-inner">
                                <RackTable rack={selectedRack} 
                                        　 selectedUnit={selectUnitPostion}
                                        showUnitQuickLauncher
                                        isLoading={loading}
                                        isUnitReadOnly={loading||isEditing}
                                        onSelectUnit={(unitPosition) => this.selectUnitPosition(unitPosition)}           
                                />
                            </div>
                        </div>
                    </Col>
                    <Col sm={7} md={9} >
                        <div className="mb-05">
                            <LinkButton iconClass="fal fa-angle-double-right"
                                        disabled={loading||isEditing||(!isSelectRack)}
                                        className="asset-transition-link"
                                        onClick={() => this.dispRackPage()}
                            >
                                ラック画面へ
                            </LinkButton>
                            <div className="pull-right">
                                {!isEditing &&
                                    <ButtonToolbar className="pull-left">
                                        <Button
                                            iconId="report-output"
                                            disabled={loading || !isSelectRack}
                                            onClick={() => this.props.changeReportOutputModalState(true)}
                                        >
                                            帳票出力
                                    </Button>
                                        <Button
                                            iconId="report-output"
                                            disabled={loading || !isSelectRack}
                                            onClick={() => this.props.changeReportHistoryModalState(true)}

                                        >
                                            帳票履歴
                                    </Button>
                                        <Button
                                            iconId="edit"
                                            disabled={loading}
                                            onClick={() => this.props.changeReportFormatModalState(true)}
                                        >
                                            帳票フォーマット
                                    </Button>
                                    </ButtonToolbar>
                                }
                                {(!isReadOnly&&isSelectUnit&&(!isEditing||loading))&&
                                    <ButtonToolbar className="pull-left ml-05" >
                                        <Button iconId="edit"  disabled={loading} onClick={() => this.editUnit()} >編集</Button>
                                        {!readOnlyByLevel(isReadOnly, level, LAVEL_TYPE.operator)&&
                                            <Button iconId="category-setting" disabled={loading} onClick={() => this.props.changeDispSettingModalState(true)} >表示変更</Button>
                                        }
                                    </ButtonToolbar>
                                }
                            </div>
                            {isEditing&&
                                <ButtonToolbar className="pull-right" >
                                    <Button onClick={() => this.handleSaveButtonClick()} 
                                            bsStyle="success" 
                                            disabled={this.invalid()}>
                                            <Icon className="fal fa-save" />
                                            <span> 保存</span>
                                    </Button>
                                    <Button iconId="uncheck" bsStyle="lightgray" onClick={() => this.cancelEditUnit()}>キャンセル</Button>
                                </ButtonToolbar>}
                        </div>
                        <UnitSelectForm className="mb-05" 
                            units={units} 
                            selectedUnit={selectedUnit} 
                            isReadOnly={!(!readOnlyByLevel(isReadOnly, level, LAVEL_TYPE.operator)&&isSelectedUnitPositon&&(!isEditing||loading))}
                            isLoading={loading}
                            onSelectUnit={(unitId) => this.selectUnit(unitId) } 
                            onAddUnit={() => this.editNewUnit() }
                            onDeleteUnit={() => this.props.changeConfirmModalState(true, '削除', '選択中のユニットを削除します。よろしいですか？', '電源設定、ネットワーク設定等もすべて削除されます。', MESSAGEMODAL_BUTTON.delete)}
                        />                        
                        <div className="scroll-pane scroll-pane-sm" >
                            <div className="scroll-pane-inner">
                        <BoxGroup>
                            <UnitOverviewBox unit={unit} 
                                            unitDispSetting={dispSetting}
                                            mountDispSettings={selectedRack.unitDispSettings}
                                            unitStatuses={unitStatuses}
                                            unitTypes={unitTypes}
                                            unitImages={unitImages}
                                            rackPowers={selectedRackPowers}
                                            rackSize={{height: selectedRack.row, width: selectedRack.col}}
                                            isReadOnly={!isEditing} 
                                            level={level}
                                            isLoading={loading}
                                            isApplyTemplate={isApplyTemplate}
                                            onChange={(value, invalid, dispSetting, margingDispSettings) => this.hanldeOutviewChanged(value, invalid, dispSetting, margingDispSettings)}
                                            onSelectTemplate={() => this.props.changeSelectTemplateModalState(true)}
                            />
                            <AssetDetailBox title="ユニット詳細" 
                                            id={unit.unitId}
                                            pages={unit.extendedPages}
                                            isLoading={loading}
                                            isReadOnly={readOnlyByLevel(!isEditing, level, LAVEL_TYPE.operator)}
                                            unitTypeId={unit.type&&unit.type.typeId}
                                            onChange={(pages, isError) => this.handleDetailItemChanged(pages, isError)}
                            />
                            <UnitPowerBox id={unit.unitId}
                                        unitPowers={unit.unitPowers}
                                        rackPowers={selectedRackPowers}
                                        excludedRackPower={unit.rackPower}
                                        isLoading={loading}
                                        isReadOnly={readOnlyByLevel(!isEditing, level, LAVEL_TYPE.operator)}
                                        onChange={(powers) => this.handlePowerItemChanged(powers)}
                            />
                            <LinkSettingPanel links={unit.links} 
                                            defaultClose={true} 
                                            isLoading={loading}
                                            isReadOnly={readOnlyByLevel(!isEditing, level, LAVEL_TYPE.operator)}
                                            onChange={(links, isError) => this.handleLinkItemChanged(links, isError)}
                            />
                            <UnitNetworkBox id={unit.unitId}
                                            portCount={unit.portCount}
                                            ports={unit.ports}
                                            ipAddresses={unit.ipAddresses}
                                            connectors={networkConnectors}
                                            isLoading={loading}
                                            isReadOnly={readOnlyByLevel(!isEditing, level, LAVEL_TYPE.operator)}
                                            isApplyTemplate={isApplyTemplate}
                                            onChange={(portCount, ports, ipAddresses, isError) => this.handleNetworkItemChanged(portCount, ports, ipAddresses, isError)}
                            />
                        </BoxGroup>
                        {!isReadOnly&&
                            <Button className="pull-right mtb-1" 
                                    iconId="add"
                                    disabled={loading||isEditing|!isSelectUnit}
                                    onClick={() => this.props.changeAddTemplateModalState(true)} >
                                    テンプレートへ追加
                            </Button>
                        }
                            </div>
                        </div>
                        <TemplateSelectModal showModal={modalInfo.selectTemplate.show} 
                                             isRack={false}
                                             onSelect={(template) => this.handleTemplateSelect(template)}
                                             onCancel={() => { this.props.changeSelectTemplateModalState(false) }} 
                        />
                        <TemplateAddModal showModal={modalInfo.addTemplate.show} 
                                          onSave={(template) => this.handleTemplateSave(template)}
                                          onCancel={() => this.props.changeAddTemplateModalState(false)} 
                        />
                        <DispSettingModal showModal={modalInfo.dispSetting.show} 
                                          unitDispSetting={editingDispSetting}
                                          unitImages={unitImages}
                                          onSave={(dispSetting) => this.saveUnitDispSetting(dispSetting)}
                                          onCancel={() => this.props.changeDispSettingModalState(false)} 
                        />
                        <RackReportOutputModal
                            show={modalInfo.rackReportOutput.show}
                            onHide={() => this.props.changeReportOutputModalState(false)}
                            enterprises={loginUser && loginUser.enterprises}
                            mainEnterprise={loginUser && loginUser.mainEnterprise}
                            rack={selectedRack}
                        />
                        <RackReportHistoryModal
                            show={modalInfo.rackReportHistory.show}
                            onHide={() => this.props.changeReportHistoryModalState(false)}
                            rack={selectedRack}
                            authentication={this.props.authentication}
                        />
                        <RackReportFormatModal
                            show={modalInfo.rackReportFormat.show}
                            onHide={() => this.props.changeReportFormatModalState(false)}
                            authentication={this.props.authentication}
                            enterprises={loginUser && loginUser.enterprises}
                            mainEnterprise={loginUser && loginUser.mainEnterprise}
                        />
                        <MessageModal show={modalInfo.confirm.show} 
                                      title={modalInfo.confirm.title}
                                      bsSize="small"
                                      buttonStyle={modalInfo.confirm.type} 
                                      onOK={() => {modalInfo.confirm.type===MESSAGEMODAL_BUTTON.delete ? this.deleteUnit() : this.saveUnit() }} 
                                      onCancel={() => this.props.changeConfirmModalState(false)} >
                                      {modalInfo.confirm.show&&
                                        this.makeMessage(modalInfo.confirm.message, modalInfo.confirm.attenstion)
                                      }
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
                    </Col>
                </Row>
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
        getAuthentication(FUNCTION_ID_MAP.unit, (auth) => {
            this.props.setAuthentication(auth);
        });
    }

    /********************************************
     * データ読み込み、保存、削除
     ********************************************/

    /**
     * 画面の初期データを非同期で読み込む
     * @param {number} locationId ロケーションID
     * @param {string} dispSetId ユニット表示設定グループID
     * @param {string} unitId ユニットID
     */
    loadInfo (locationId, dispSetId, unitId) {
        this.props.setLoadState(true);
        sendData(EnumHttpMethod.get, 'api/Unit', null, (unitInfo, networkError) => {
            if (networkError) {
                this.props.changeMessageModalState(true, 'エラー', NETWORKERROR_MESSAGE);
                this.props.setLoadState(false);
            } else if (unitInfo) {
                this.props.setLocations(unitInfo.lookUp.locations);
                this.props.setMasterData(unitInfo.lookUp);
                this.props.setLayouts(unitInfo.lookUp.layouts);
                
                if (locationId) {
                    this.loadRack(locationId, dispSetId, unitId, true, true);
                } else {
                    this.selectFirstUnit(unitInfo.lookUp.blankUnitDispSetting.units);
                    this.loadUnitImages();
                }
            } else {
                this.props.changeMessageModalState(true, 'エラー', 'データ取得に失敗しました。');
                this.props.setLoadState(false);
            }
        });
    }

    /**
     * ユニット画像一覧を取得する
     */
    loadUnitImages() {
        sendData(EnumHttpMethod.get, 'api/image/getUnitImages', null, (imageInfo, networkError) => {
            if (networkError) {
                this.props.changeMessageModalState(true, 'エラー', NETWORKERROR_MESSAGE);
            } else if (imageInfo) {
                this.props.setUnitImages(imageInfo.unitImages);
            } else {
                this.props.changeMessageModalState(true, 'エラー', 'データ取得に失敗しました。');
            }
            this.props.setLoadState(false);
        });
        
    }

    /**
     * ラック情報を取得する
     * @param {number} locationId ロケーションID
     * @param {string} dispSetId 表示設定ID
     * @param {string} unitId ユニットID
     * @param {boolean} needLayoutObject レイアウトオブジェクトが必要かどうか
     * @param {boolean} isInitial 初期処理時の呼び出しかどうか
     */
    loadRack (locationId, dispSetId, unitId, needLayoutObject, isInitial, callback) {
        const postData = { locationId, needLayoutObject };
        sendData(EnumHttpMethod.post, '/api/rack/getRack', postData, (rackInfo, networkError) => {
            if (networkError) {
                this.props.changeMessageModalState(true, 'エラー', NETWORKERROR_MESSAGE);
                this.props.setLoadState(false);
            } else if (rackInfo) {
                this.props.setSelectedRack(rackInfo.rack);
                this.loadUnitDispSetting((dispSetId ? dispSetId : ''), { x: 0, y: 0 }, unitId);                
                
                if (isInitial) {                    
                    if (rackInfo.rack.location.isAllowed) {
                        this.props.selectLocation(rackInfo.rack.location);
                        needLayoutObject && this.props.selectLayoutObject(getLayoutObject(rackInfo.rack));
                    } else {
                        this.props.changeMessageModalState(true, 'エラー', '該当ラックの権限がありません。');
                    }
                    this.loadUnitImages();
                } else {
                    needLayoutObject && this.props.selectLayoutObject(getLayoutObject(rackInfo.rack));
                }
                
                callback && callback(rackInfo.rack.location);                
            } else {
                this.props.changeMessageModalState(true, 'エラー', 'データ取得に失敗しました。');
                this.props.setLoadState(false);
            }
        });
    }

    /**
     * ユニット表示設定グループを取得する
     * @param {string} dispSetId 表示設定ID
     * @param {object} position 選択した位置（x, y）
     * @param {string} unitId ユニットID（選択するユニットID）
     */
    loadUnitDispSetting(dispSetId, position, unitId) {
        const queryParameter = 'api/unit/getUnit?dispSetId=' + dispSetId;
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
                this.props.setSelectedDispSetting(unitDispSetting);
                
                //ユニット選択
                if (unitId) {
                    this.selectUnit(unitId, unitDispSetting.units);
                } else {
                    this.selectFirstUnit(unitDispSetting.units);
                }

            } else {
                this.props.changeMessageModalState(true, 'エラー', 'データ取得に失敗しました。');
            }

            this.props.setLoadState(false);
        });
    }

    /**
     * ログインユーザー情報を取得する
     */
    loadLoginUser() {
        sendData(EnumHttpMethod.get, 'api/user/getLoginUser', null, (loginUser, networkError) => {
            if (networkError) {
                this.props.changeMessageModalState(true, 'エラー', NETWORKERROR_MESSAGE);
            } else if (loginUser) {
                this.props.setLoginUser(loginUser);
            } else {
                this.props.changeMessageModalState(true, 'エラー', 'データ取得に失敗しました。');
            }
        });
    }

    /**
     * ユニットを保存する
     */
    saveUnit() {
        var unit = this.props.editingUnit;

        //新規表示設定グループ、新規ユニットの場合はFrontFlgとrearFlgをtrue
        if (!hasUnitDispSetting(this.props.editingDispSetting) && !hasUnit(unit)) {
            unit.frontFlg = true;
            unit.rearFlg = true;
        }

        //数値を変換する
        if(unit.extendedPages) {
            unit.extendedPages = convertNumberExtendedData(unit.extendedPages);
        }

        const unitParam = { unit: unit, rackId: this.props.selectedRack.rackId };
        
        this.props.changeConfirmModalState(false);
        this.props.setWaitingState(true, 'save');
        sendData(EnumHttpMethod.post, 'api/unit/setUnit', unitParam, (result, networkError) => {
            this.props.setWaitingState(false);
            if (networkError) {
                this.props.changeMessageModalState(true, 'エラー', NETWORKERROR_MESSAGE);
            } else if (result && result.isSuccess) {
                this.props.changeMessageModalState(true, '保存完了', 'ユニットの保存が完了しました。', () => {
                    //ラック再読み込み
                    const locationId = this.props.locationSelector.selectedLocation.location.locationId;
                    this.props.setLoadState(true);
                    this.loadRack(locationId, result.registeredDispSetId, result.registeredUnitId, false);
                    this.props.changeMessageModalState(false);
                    this.props.setEditMode(false);
                });                 
            } else {
                this.props.changeMessageModalState(true, 'エラー', result.message);
            }
        });
    
    }

    /**
     * ユニットを削除する
     */
    deleteUnit() {
        this.props.changeConfirmModalState(false);
        this.props.setWaitingState(true, 'delete');
        sendData(EnumHttpMethod.post, 'api/unit/deleteUnit', this.props.editingUnit, (result, networkError) => {
            this.props.setWaitingState(false);
            if (networkError) {
                this.props.changeMessageModalState(true, 'エラー', NETWORKERROR_MESSAGE);
            } else if (result && result.isSuccess) {
                this.props.changeMessageModalState(true, '削除完了', 'ユニット削除が完了しました。', () => {
                    //ラック・ユニットの再読み込み
                    const locationId = this.props.locationSelector.selectedLocation.location.locationId;
                    this.props.setLoadState(true);
                    this.loadRack(locationId, result.registeredDispSetId, null, false);
                    this.props.changeMessageModalState(false);
                    this.props.setEditMode(false);
                });                
            } else {
                this.props.changeMessageModalState(true, 'エラー', result.message);
            }
        });
    }

    /**
     * 表示設定を保存する
     * @param {object} dispSetting 表示設定情報
     */
    saveUnitDispSetting(dispSetting) {
        this.props.changeDispSettingModalState(false);
        this.props.setWaitingState(true, 'save');
        sendData(EnumHttpMethod.post, 'api/unit/setUnitDispSetting', dispSetting, (result, networkError) => {
            this.props.setWaitingState(false);
            if (networkError) {
                this.props.changeMessageModalState(true, 'エラー', NETWORKERROR_MESSAGE);
            } else if (result.isSuccess) {
                this.props.changeMessageModalState(true, '保存完了', '表示設定の保存が完了しました。', () => {
                    //ラック・ユニットの再読み込み
                    const locationId = this.props.locationSelector.selectedLocation.location.locationId;
                    this.props.setLoadState(true);
                    this.loadRack(locationId, result.registeredDispSetId, this.props.selectedUnit.unitId, false);
                    this.props.changeMessageModalState(false);
                    this.props.setEditMode(false);
                });  
            } else {
                this.props.changeMessageModalState(true, 'エラー', result.message);
            }
        });
    }
    
    /**
     * テンプレートを保存する
     * @param {object} template 保存するテンプレート情報
     */
    saveTemplate(template) {
        this.props.setWaitingState(true, 'save');
        sendData(EnumHttpMethod.post, 'api/template/setUnitTemplate', template, (result, networkError) => {
            if (networkError) {
                this.props.changeMessageModalState(true, 'エラー', NETWORKERROR_MESSAGE);
            } else if (result) {
                this.props.changeMessageModalState(true, '保存完了', 'テンプレートを登録しました。');
            } else {
                this.props.changeMessageModalState(true, 'エラー', 'テンプレート登録に失敗しました。');
            }
            this.props.setWaitingState(false);
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
     */
    selectLocation(value, position, layoutObject){
        if (value.locationId && value.isAllowed) {
            const needLayoutObject = !layoutObject;
            this.props.setLoadState(true);
            this.loadRack(value.locationId, null, null, needLayoutObject, false, (location) => {
                this.props.selectLocation(location, position);
                !needLayoutObject && this.props.selectLayoutObject(layoutObject);
            });
        }
    }

    /********************************************
     * ユニット選択関係
     ********************************************/

    /**
     * ユニット位置を選択する
     * @param {object} unitPosition ユニット位置情報（id: 表示設定ID、positoon: { x, y }： 選択位置) 
     */
    selectUnitPosition(unitPosition) {
        this.props.setLoadState(true);
        this.loadUnitDispSetting(unitPosition.id, unitPosition.position);
    }

    /**
     * ユニット選択
     * @param {string} unitId ユニットID
     * @param {array} units ユニット一覧（指定がない場合は、propsのものを使う）
     */
    selectUnit(unitId, units) {
        if (!units) {
            units = this.props.selectedDispSetting.units;
        }
        const unit = units.find((item) => item.unitId ===  unitId);
        this.props.setSelectedUnit(unit);
    }

    /**
     * 表示設定グループ内の最初のユニットを選択する
     * @param {array} units ユニットリスト
     */
    selectFirstUnit(units) {
        const unitNoList = units.map((unit) => unit.unitNo);
        const minUnitNo = Math.min.apply(null, unitNoList);
        if (minUnitNo <= 0) {
            var unit = units.find((unit) => unit.unitNo ===  minUnitNo);
        } else {
            var unit = units[0];
        }        
        this.props.setSelectedUnit(unit);
    }

    /********************************************
     * ユニット編集関係
     ********************************************/

    /**
     * ユニットを編集する
     */
    editUnit() {
        this.props.setEditingUnit(this.props.selectedUnit, this.props.selectedDispSetting);
        this.props.setEditMode(true);
    }

    /**
     * ユニットの編集をキャンセルする
     */
    cancelEditUnit(){
        this.props.setEditingUnit(this.props.selectedUnit, this.props.selectedDispSetting);  //元に戻す
        this.props.setEditMode(false);
    }

    /**
     * 新しいユニットを編集状態にする
     */
    editNewUnit(){
        const { selectedDispSetting } = this.props;
        const { dispSetId, position, units } = selectedDispSetting;
        var unit;
        if (!dispSetId) {
            unit = Object.assign({}, units[0], {
                unitNo: 1,
                name: '',
                type: this.getMinUnitType()
            });
        } else {
            unit =this.getNewUnit(position, this.getMiniEmptyUnitNo(units), units[0].extendedPages, units[0].unitDispSetting);
        }
        this.props.setEditingUnit(unit, selectedDispSetting);
        this.props.setEditMode(true);
    }

    /**
     * 新しいユニットを取得する
     * @param {object} position ユニット位置
     * @param {number} nextUnitNo 次のユニット番号
     * @param {array} pages ユニット詳細ページ
     * @param {object} dispSetting 表示設定
     * @returns {object} 新しいユニット情報
     */
    getNewUnit(position, nextUnitNo, pages, dispSetting) {
        var newUnit = {
            unitId: '',
            unitNo: nextUnitNo,
            type: this.getMinUnitType(),
            position: Object.assign({}, position),
            size: { height: 1, width: 1 },
            name: '',
            textColor: '#000000',
            backColor: '#FFFFFF',
            fontSize: 12,
            frontUnitImage: null,
            rearUnitImage: null,
            weight: 0,
            portCount: 0,
            ratedPower: 0,
            extendedPages: JSON.parse(JSON.stringify(pages)),
            links: [],
            unitPowers: [],
            ports: [],
            ipAddresses: [],
            timeLines: [],
            points: [],
            comment: '',
            unitDispSetting: Object.assign({}, dispSetting)
        }

        //ユニット詳細のvalueをnullにする
        newUnit.extendedPages.forEach((page) => {
            if (page.extendedItems) {
                page.extendedItems.forEach((item) => {
                    item.value = null;
                });
            }
        });

        return newUnit;
    }

    /**
     * 最小のユニット種別を取得する
     */
    getMinUnitType() {
        const { unitTypes } = this.props.masterInfo;    
        var type = null;    
        if (!unitTypes) {
            return null;
        }

        const typeIdList = unitTypes.map((unitType) => unitType.typeId);
        const minTypeId = Math.min.apply(null, typeIdList);

        if (minTypeId > 0) {
            type = unitTypes.find((unitType) => unitType.typeId ===  minTypeId);
        }
        
        return type;
    }   

    /**
     * 一番小さい空のユニット番号を取得する
     * @param {array} units ユニット一覧
     * @return {number} 最小番号（番号群がなかった場合は1を返す）
     */
    getMiniEmptyUnitNo(units){
        if (units && units.length > 0) {
            const unitNoList = units.map((unit) => unit.unitNo);
            const maxNumber = Math.max.apply(null, unitNoList);
            for (var i = 1; i <= (maxNumber + 1); i++) {
                if (unitNoList.indexOf(i) < 0) {
                    return i;
                }
            }
        }
        return 1;
    }

    /**
     * ユニット概要の変更イベント
     * @param {object} unit 変更後のユニット情報
     * @param {boolean} invalid 保存が無効かどうか
     * @param {string} dispSetting 表示設定グループ
     * @param {array} margingDispSettings 結合する表示設定グループ配列
     */
    hanldeOutviewChanged(unit, invalid, dispSetting, margingDispSettings){
        this.props.changeUnitOverview(unit, invalid);
        if (dispSetting) {
            this.props.changeUnitDispSetting(dispSetting, margingDispSettings);
        }
        if (this.props.isApplyTemplate) {
            this.props.setApplayTemplateState(false);
        }
    }

    /**
     * ユニット詳細の変更イベント
     * @param {array} pages 変更後のラック詳細情報
     * @param {boolean} invalid 保存が無効かどうか
     */
    handleDetailItemChanged(pages, invalid) {
        this.props.changeUnitDetail(pages, invalid);
    }

    /**
     * ユニット電源の変更イベント
     * @param {array} powers 変更後のユニット電源情報
     */
    handlePowerItemChanged(powers) {
        this.props.changeUnitPowers(powers, false);          //保存は常に有効
    }

    /**
     * リンク情報の変更イベント
     * @param {array} links 変更後のリンク情報
     * @param {boolean} invalid 保存が無効かどうか
     */
    handleLinkItemChanged(links, invalid) {
        this.props.changeUnitLinks(links, invalid);
    }

    /**
     * ネットワーク情報の変更イベント
     * @param {*} value 変更後の情報
     * @param {string} key ネットワーク情報のキー
     * @param {boolean} invalid 保存が無効化どうか
     */
    handleNetworkItemChanged(value, key, invalid){
        this.props.changeUnitNetwork(value, key, invalid);
        if (this.props.isApplyTemplate) {
            this.props.setApplayTemplateState(false);
        }
    }

    /********************************************
     * ユニット保存関係
     ********************************************/

    /**
     * 保存ボタンの押下イベント
     */
    handleSaveButtonClick() {
        var attenstion = null;
        if (this.props.margingDispSettings && this.props.margingDispSettings.length > 1) {
            attenstion = '複数の表示設定が統合されます。ユニット番号は自動割付されます。'            
        } 

        //更新前後でunitDispSetting.dispSetIdが異なる、かつ、更新前のunitDispSetting配下のユニットが1つのときは移動の注意喚起をする
        if (!attenstion && hasUnitDispSetting(this.props.selectedDispSetting)) {
            if (this.props.selectedDispSetting.dispSetId !== this.props.editingDispSetting.dispSetId &&
                this.props.selectedDispSetting.units.length === 1) {
                    attenstion = 'ユニットを移動します。ユニット番号は自動割付されます。'
            }
        }                

        this.props.changeConfirmModalState(
            true, 
            '保存確認', 
            'ユニットを保存します。よろしいでしょうか？', 
            attenstion, 
            MESSAGEMODAL_BUTTON.save
        );
    }
       
    /********************************************
     * テンプレート関係
     ********************************************/

     /**
     * テンプレート追加モーダルの保存ボタン押下イベント
     * @param {object} template テンプレート情報（テンプレート名称とテンプレートメモのみ）
     */
    handleTemplateSave(template){
        const { selectedUnit } = this.props;
        const newTemplate = this.makeTemplate(template, selectedUnit);
        this.props.changeAddTemplateModalState(false);
        
        this.saveTemplate(newTemplate);
    }

    /**
     * テンプレートを作成する
     * @param {object} template テンプレート情報（テンプレート名称とテンプレートメモのみ）
     * @param {object} unit テンプレート化するラック
     */
    makeTemplate(template, unit){
        return {
            ...template,
            row: unit.size.height,
            col: unit.size.width,
            name: unit.name,
            type: Object.assign({}, unit.type),
            fontSize: unit.fontSize,
            weight: unit.weight,
            textColor: unit.textColor,
            backColor: unit.backColor,
            portCount: unit.portCount,
            ratedPower: unit.ratedPower,
            frontUnitImage: unit.frontUnitImage && Object.assign({}, unit.frontUnitImage),
            rearUnitImage: unit.rearUnitImage && Object.assign({}, unit.rearUnitImage),
            extendedPages: convertDateTimeExtendedData(JSON.parse(JSON.stringify(unit.extendedPages)))
        }
    }

    /**
     * テンプレート選択イベント
     * @param {object} template 適用するテンプレート
     */
    handleTemplateSelect(template) {
        this.props.applyTemplate(template);
        this.props.changeSelectTemplateModalState(false);  
    }


    /********************************************
     * ページ遷移
     ********************************************/

    dispRackPage() {
        //sessionStorageにロケーションIDを格納
        const location = this.props.locationSelector.selectedLocation.location;
        setSessionStorage(STORAGE_KEY.locationId, location.locationId);
        
        //画面遷移
        window.location.href = '/Rack';
    }
    
    /********************************************
     * その他
     ********************************************/
    
    /**
     * 保存が無効かどうか
     */
    invalid(){
        const { invalid } = this.props;
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
     * ユニット位置を選択しているかどうか
     * @param {*} position 
     */
    isUnitPosition(position) {
        if (position && position.x && position.y) {
            return true;
        }
        return false;
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
        locationSelector: state.locationSelector,
        masterInfo: state.masterInfo,
        selectedRack: state.selectedRack,
        selectedRackPowers: state.selectedRackPowers,
        selectedDispSetting: state.selectedDispSetting,
        selectedUnit: state.selectedUnit,
        editingUnit: state.editingUnit,
        editingDispSetting: state.editingDispSetting,
        margingDispSettings: state.margingDispSettings,
        invalid: state.invalid,
        isEditing: state.isEditing,
        isLoading: state.isLoading,
        modalInfo: state.modalInfo,
        isApplyTemplate: state.isApplyTemplate,
        waitingInfo: state.waitingInfo,
        loginUser: state.loginUser
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
        selectLocation:(location, position) => dispatch(selectLocation(location, position)),
        clearLocation:() => dispatch(clearLocation()),
        selectLayoutObject:(layoutObject) => dispatch(selectLayoutObject(layoutObject)),
        clearLayoutObject:() => clearLayoutObject(),
        setMasterData:(lookUp) => dispatch(setMasterData(lookUp)),
        setUnitImages:(unitImages) => dispatch(setUnitImages(unitImages)),
        setSelectedRack:(rack) => dispatch(setSelectedRack(rack)),
        clearSelectRack:() => dispatch(clearSelectRack()),
        setSelectedDispSetting:(dispSetting) => dispatch(setSelectedDispSetting(dispSetting)),
        setSelectedUnit:(unit) => dispatch(setSelectedUnit(unit)),
        setEditingUnit:(unit, dispSetting) => dispatch(setEditingUnit(unit, dispSetting)),
        changeUnitOverview:(unit, dispSetId, margingDispSetIds, invalid) => dispatch(changeUnitOverview(unit, dispSetId, margingDispSetIds, invalid)),
        changeUnitDetail:(detailData, invalid) => dispatch(changeUnitDetail(detailData, invalid)),
        changeUnitPowers:(powers, invalid) => dispatch(changeUnitPowers(powers, invalid)),
        changeUnitLinks:(links, invalid) => dispatch(changeUnitLinks(links, invalid)),
        changeUnitNetwork:(network, key, invalid)  => dispatch(changeUnitNetwork(network, key, invalid) ),
        changeUnitDispSetting:(dispSetting, margingDispSettings) => dispatch(changeUnitDispSetting(dispSetting, margingDispSettings)),
        applyTemplate:(template) => dispatch(applyTemplate(template)),
        setEditMode:(isEditing) => dispatch(setEditMode(isEditing)),
        setLoadState:(isLoading) => dispatch(setLoadState(isLoading)),
        setApplayTemplateState:(isApplayTemplate) => dispatch(setApplayTemplateState(isApplayTemplate)),
        changeDispSettingModalState:(show) => dispatch(changeDispSettingModalState(show)),
        changeSelectTemplateModalState:(show) => dispatch(changeSelectTemplateModalState(show)),
        changeAddTemplateModalState:(show) =>  dispatch(changeAddTemplateModalState(show)),
        changeConfirmModalState:(show, title, message, attenstion, type) => dispatch(changeConfirmModalState(show, title, message, attenstion, type)),
        changeMessageModalState:(show, title, message, callback) => dispatch(changeMessageModalState(show, title, message, callback)),
        setWaitingState: (isWaiting, waitingType) => dispatch(setWaitingState(isWaiting, waitingType)),
        changeReportOutputModalState: (show) => dispatch(changeReportOutputModalState(show)),
        changeReportHistoryModalState: (show) => dispatch(changeReportHistoryModalState(show)),
        changeReportFormatModalState: (show) => dispatch(changeReportFormatModalState(show)),
        setLoginUser: (loginUser) => dispatch(setLoginUser(loginUser))
    };
};

// Wrap the component to inject dispatch and state into it
/**
 * mapStateToProps, mapDispatchToPropsをReduxと連携させる
 */
export default connect(mapStateToProps, mapDispatchToProps)(UnitPanel);

 