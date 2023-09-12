/**
 * @license Copyright 2017 DENSO
 * 
 * Rack画面
 * 
 * 画面のコンテナとして。Reduxに依存したコードを記述します。
 * 画面のロジックはここに記述します。（適宜ファイル分割は行うこと）
 * 
 */
'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import { Row, Col, ButtonToolbar} from 'react-bootstrap';

import { setAuthentication } from 'Authentication/actions.js';
import { setLocations, setLayouts, selectLocation, clearLocation, selectLayoutObject, clearLayoutObject } from 'LocationSelector/actions.js';
import { setLookUp } from 'SearchCondition/actions.js';
import { setWaitingState } from 'WaitState/actions.js';
import { setMasterData, setLoadState, setLoadState_PowerBarOnly, setLoadState_RackOnly, setEditMode } from './actions.js';
import { setSelectedRack, setRackPowerValues, clearSelectRack } from './actions.js';
import { setEditingRack, changeRackOverview, changeRackDetail, changeRackPowers, changeRackLinks } from './actions.js';
import { changeSelectTemplateModalState, changeAddTemplateModalState, changeDeleteComfirmModalState, changeMessageModalState, changeConfirmModalState } from './actions.js';
import { changeReportOutputModalState, changeReportHistoryModalState, changeReportFormatModalState, setLoginUser } from './actions.js';
import { applyTemplate, setApplayTemplateState } from './actions.js'

import Content from 'Common/Layout/Content';
import BoxGroup from 'Common/Layout/BoxGroup';
import LocationOverlaySelector from 'Assets/Overlay/LocationOverlaySelector';
import RackTable from 'Assets/RackView/RackTable';

import RackOverview from 'Rack/RackOverview';
import AssetDetailBox from 'Assets/AssetDetailBox';
import RackPowersBox from 'Rack/RackPowersBox';
import LinkSettingPanel from 'Assets/LinkSettingPanel';

import TemplateAddModal from 'Assets/Modal/TemplateAddModal';
import TemplateSelectModal from 'Assets/Modal/TemplateSelectModal';
import MessageModal from 'Assets/Modal/MessageModal';
import WaitingMessage from 'Assets/Modal/WaitingMessage';
import RackReportOutputModal from 'Assets/Modal/RackReportOutputModal';
import RackReportHistoryModal from 'Assets/Modal/RackReportHistoryModal';
import RackReportFormatModal from 'Assets/Modal/RackReportFormatModal';

import LinkButton from 'Common/Widget/LinkButton';
import Button from 'Common/Widget/Button';

import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';
import { setSessionStorage, getSessionStorage, STORAGE_KEY } from 'webStorage';
import { convertDateTimeExtendedData, convertNumberExtendedData, hasRack, hasRackView, getLayoutObject } from 'assetUtility';
import { FUNCTION_ID_MAP, LAVEL_TYPE, readOnlyByLevel, getAuthentication } from 'authentication';
import { MESSAGEMODAL_BUTTON } from 'constant';

/**
 * Rack画面のコンポーネント
 */
class RackPanel extends Component {

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
     * Componentがレンダリングされた直後に呼び出される
     */
    componentDidMount() {
        const locationId = getSessionStorage(STORAGE_KEY.locationId);   //他の画面から渡されたロケーションIDを取得
        this.loadAuthentication();
        this.loadInfo(locationId);
        this.loadLoginUser();
        garmitFrame.refresh();        
    }
    
    /**
     * render
     */
    render() {
        const { locationSelector, masterInfo, searchCondition, selectedRack, rackPowerValues, loginUser } = this.props;
        const { editingRack } = this.props;
        const { isEditing, isLoading, modalInfo, isApplyTemplate, waitingInfo } = this.props;
        const { isReadOnly, level, loadAuthentication } = this.props.authentication;
        const { locations, selectedLocation, layouts, selectedLayoutObject } = locationSelector;
        const { rackStatuses, rackTypes, connectors } = masterInfo;
        const isSelectLocation = selectedLocation && selectedLocation.location !== null && selectedLocation.location.isAllowed;
        const isSelectRack = hasRack(selectedRack);
        const isExistRackView = hasRackView(selectedRack);
        const rack = isEditing ? editingRack : selectedRack;
        const loading = isLoading.rack || !loadAuthentication;

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
                    <Col sm={5} md={3}>
                        <div className="scroll-pane scroll-pane-sm" >
                            <div className="scroll-pane-inner">
                            <RackTable rack={selectedRack}
                                    showQuickLauncher
                                    isReadOnly={isEditing}
                                    isLoading={loading}
                                    onSelectUnit={(unitPosition) => this.selectUnitDispSetting(unitPosition)}     
                            />
                            </div>
                        </div>
                    </Col>
                    <Col sm={7} md={9} >
                        <div className="mb-05">
                            <LinkButton iconClass="fal fa-angle-double-right"
                                        disabled={loading||(!isExistRackView)||isEditing}
                                        className="asset-transition-link"
                                        onClick={() => this.dispUnitPage()}
                            >
                                ユニット画面へ
                            </LinkButton>

                            {!isEditing &&
                                <div className="pull-right">
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
                                    {!isReadOnly &&
                                        <ButtonToolbar className="pull-left ml-05">
                                            {!this.readOnlyForEditButton(isReadOnly, isSelectRack, level) &&
                                                <Button clas iconId="edit" disabled={loading || (!isSelectLocation)} onClick={() => this.changeEditMode(selectedLocation.location)} >編集</Button>
                                            }
                                            {!readOnlyByLevel(isReadOnly, level, LAVEL_TYPE.manager) &&
                                                <Button iconId="delete"
                                                    disabled={loading || (!isSelectRack)}
                                                    onClick={() => this.props.changeDeleteComfirmModalState(true, '選択中のラックを削除します。よろしいですか？', 'ラック内のラック電源、ユニットも全て削除されます。')} >
                                                    削除
                                                </Button>
                                            }
                                        </ButtonToolbar>
                                    }
                                </div>
                            }
                            {isEditing&&
                                <ButtonToolbar className="pull-right" >
                                    <Button iconId="save" onClick={() => this.handleSaveButtonClick()} bsStyle="success" disabled={this.invalid()||loading} >
                                        <span> 保存</span>
                                    </Button>
                                    <Button iconId="cancel" disabled={loading} onClick={() => this.cancelEditRack()}>
                                        <span>キャンセル</span>
                                    </Button>
                                </ButtonToolbar>
                            }
                        </div>
                        <div className="scroll-pane scroll-pane-sm">
                            <div className="scroll-pane-inner">
                            <BoxGroup>
                                <RackOverview rack={rack} 
                                            rackPowerBarGraphList={rackPowerValues} 
                                            rackStatuses={rackStatuses} 
                                            rackTypes={rackTypes}
                                            isReadOnly={!isEditing}
                                            level={level}
                                            isLoading={{rack: loading, powerBar: isLoading.powerBar}}
                                            isApplyTemplate={isApplyTemplate}
                                            onChange={(value, invalid) => this.hanldeOutviewChanged(value, invalid)}
                                            onSelectTemplate={() => this.props.changeSelectTemplateModalState(true)}
                                />
                                <AssetDetailBox title="ラック詳細" 
                                                id={rack.rackId}
                                                pages={rack.extendedPages}
                                                isLoading={loading}
                                                isReadOnly={readOnlyByLevel(!isEditing, level, LAVEL_TYPE.operator)} 
                                                level={level}
                                                onChange={(pages, isError) => this.handleDetailItemChanged(pages, isError)}
                                />
                                <RackPowersBox rackId={rack&&rack.rackId}
                                            powers={rack.powers} 
                                            connectors={connectors}
                                            isLoading={loading}
                                            isReadOnly={!isEditing}
                                            lookUp={searchCondition.lookUp}
                                            level={level}
                                            onChange={(powers, isError) => this.handlePowerItemChanged(powers, isError)}
                                />
                                <LinkSettingPanel links={rack.links} 
                                                defaultClose={true} 
                                                isLoading={loading}
                                                isReadOnly={readOnlyByLevel(!isEditing, level, LAVEL_TYPE.operator)}
                                                level={level}
                                                onChange={(links, isError) => this.handleLinkItemChanged(links, isError)}
                                />
                            </BoxGroup>
                            {!readOnlyByLevel(isReadOnly, level, LAVEL_TYPE.operator) &&
                                <Button className="pull-right mtb-1"
                                        iconId="add"
                                        disabled={loading||(!isExistRackView)||isEditing} 
                                        onClick={() => this.props.changeAddTemplateModalState(true)} >
                                    テンプレートへ追加
                                </Button>
                            }
                            </div>
                        </div>
                        <TemplateSelectModal showModal={modalInfo.selectTemplate.show} 
                                             isRack={true}
                                             onSelect={(value) => this.handleTemplateSelect(value)}  
                                             onCancel={() => this.props.changeSelectTemplateModalState(false)} 
                        />
                        <TemplateAddModal showModal={modalInfo.addTemplate.show} 
                                          onSave={(value) => this.handleTemplateSave(value)} 
                                          onCancel={() => this.props.changeAddTemplateModalState(false)} 
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
                        <MessageModal show={modalInfo.delete.show} 
                                      title="削除"
                                      bsSize="small"
                                      buttonStyle="delete" 
                                      onOK={() => this.deleteRack()} 
                                      onCancel={() => this.props.changeDeleteComfirmModalState(false)} >
                                      {modalInfo.delete.show&&
                                        this.makeMessage(modalInfo.delete.message, modalInfo.delete.attenstion)
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
                        <MessageModal show={modalInfo.confirm.show}
                                      title={modalInfo.confirm.title}
                                      bsSize="small"
                                      buttonStyle={modalInfo.confirm.type} 
                                      onOK={() => {modalInfo.confirm.callback ? modalInfo.confirm.callback() : this.props.changeConfirmModalState(false)}}
                                      onCancel={() => this.props.changeConfirmModalState(false)} >
                                      {modalInfo.confirm.show&&
                                        this.makeMessage(modalInfo.confirm.message)
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
        getAuthentication(FUNCTION_ID_MAP.rack, (auth) => {
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
    loadInfo (locationId) {
        var url = 'api/rack';
        if (locationId) {
            url += '?locationId=' + locationId;
        }
        this.props.setLoadState(true);
        sendData(EnumHttpMethod.get, url, null, (rackInfo, networkError) => {
            if (networkError) {
                this.props.changeMessageModalState(true, 'エラー', NETWORKERROR_MESSAGE);
            } else if (rackInfo) {
                this.props.setLocations(rackInfo.lookUp.locations);
                this.props.setLayouts(rackInfo.lookUp.layouts);
                this.props.setMasterData(rackInfo.lookUp);
                this.props.setLookUp(rackInfo.lookUp);
                
                //ロケーション指定なし or ラック権限あり
                if (!locationId || (rackInfo.rack && rackInfo.rack.location.isAllowed)) {                    
                    this.props.setSelectedRack(rackInfo.rack);
                    this.props.setRackPowerValues(rackInfo.rackPowerValues);
                }
    
                if (locationId) {
                    if (rackInfo.rack.location.isAllowed) {
                        this.props.selectLocation(rackInfo.rack.location);                        
                        this.props.selectLayoutObject(getLayoutObject(rackInfo.rack));
                    } else {
                        this.props.changeMessageModalState(true, 'エラー', '該当ラックの権限がありません。');
                    }
                }
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
     */
    loadRack (locationId, needLayoutObject, callback) {
        const postData = { locationId, needLayoutObject };
        sendData(EnumHttpMethod.post, '/api/rack/getRack', postData, (rackInfo, networkError) => {
            if (networkError) {
                this.props.changeMessageModalState(true, 'エラー', NETWORKERROR_MESSAGE);
            } else if (rackInfo) {
                this.props.setSelectedRack(rackInfo.rack);
                this.props.setRackPowerValues(rackInfo.rackPowerValues);
                needLayoutObject && this.props.selectLayoutObject(getLayoutObject(rackInfo.rack));
                callback && callback(rackInfo.rack.location);
            } else {
                this.props.changeMessageModalState(true, 'エラー', 'データ取得に失敗しました。');
            }
            this.props.setLoadState(false);
        });
    }

    /**
     * ラック電源使用状況を取得する
     * @param {number} locationId ロケーションID
     */
    loadRackPowerValues (locationId) {
        const queryParameter = 'api/rack/getPowerValues?locationId=' + locationId.toString();
        sendData(EnumHttpMethod.get, queryParameter, null, (rackInfo, networkError) => {
            if (networkError) {
                this.props.changeMessageModalState(true, 'エラー', NETWORKERROR_MESSAGE);
            } else if (rackInfo) {
                this.props.setRackPowerValues(rackInfo.rackPowerValues);
            } else {
                this.props.changeMessageModalState(true, 'エラー', 'データ取得に失敗しました。');
            }
            this.props.setLoadState_PowerBarOnly(false);
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
     * テンプレートを保存する
     * @param {object} template 保存するテンプレート情報
     */
    saveTemplate(template) {
        this.props.setWaitingState(true, 'save');
        sendData(EnumHttpMethod.post, 'api/template/setRackTemplate', template, (result, networkError) => {
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

    /**
     * ラックデータを保存する
     */
    saveRack() {
        this.props.setWaitingState(true, 'save');

        const { selectedLocation } = this.props.locationSelector;
        var { editingRack } = this.props;
        if (!editingRack.location) {
            editingRack.location = Object.assign({}, selectedLocation.location);
        }

        //数値を変換する
        if(editingRack.extendedPages) {
            editingRack.extendedPages = convertNumberExtendedData(editingRack.extendedPages);
        }
        
        sendData(EnumHttpMethod.post, 'api/rack/setRack', editingRack, (result, networkError) => {
            this.props.setWaitingState(false);
            if (networkError) {
                this.props.changeMessageModalState(true, 'エラー', NETWORKERROR_MESSAGE);
            } else if (result.isSuccess) {
                this.props.changeMessageModalState(true, '保存完了', result.message, () => {
                    //ラック再読み込み
                    const locationId = this.props.locationSelector.selectedLocation.location.locationId;
                    this.props.setLoadState(true);
                    this.loadRack(locationId, false); 
                    this.props.changeMessageModalState(false);
                    this.props.setEditMode(false);
                });                 
            } else {
                this.props.changeMessageModalState(true, 'エラー', result.message);
            }
        });
    }

    /**
     * ラックを削除する
     */
    deleteRack() {
        this.props.changeDeleteComfirmModalState(false);
        this.props.setWaitingState(true, 'delete');
        sendData(EnumHttpMethod.post, 'api/rack/deleteRack', this.props.editingRack, (result, networkError) => {
            this.props.setWaitingState(false);
            if (networkError) {
                this.props.changeMessageModalState(true, 'エラー', NETWORKERROR_MESSAGE);
            } else if (result.isSuccess) {
                this.props.changeMessageModalState(true, '削除完了', 'ラック削除が完了しました。', () => {
                    //ラック再読み込み
                    const locationId = this.props.locationSelector.selectedLocation.location.locationId;
                    this.props.setLoadState(true);
                    this.loadRack(locationId, false);
                    this.props.changeMessageModalState(false);
                });                
            } else {
                this.props.changeMessageModalState(true, 'エラー', result.message);
            }
        });
    }
 
    /********************************************
     * ロケーション選択
     ********************************************/

    /**
     * ロケーションを選択する
     * @param {object} value ロケーション情報 
     * @param {array} position ロケーションの位置情報（レイアウトオブジェクトが指定されていたら、nullが来る）
     * @param {object} layoutObject レイアウトオブジェクト
     */
    selectLocation(value, position, layoutObject){
        if (value.locationId && value.isAllowed) {
            const needLayoutObject = !layoutObject;
            this.props.setLoadState(true);
            this.loadRack(value.locationId, needLayoutObject, (location) => {
                this.props.selectLocation(location, position);
                !needLayoutObject && this.props.selectLayoutObject(layoutObject);
            });
        }
    }

    /********************************************
     * ユニット表示設定グループ選択
     ********************************************/
    
    /**
     * ユニット表示設定グループを選択する
     * @param {object} unitPosition ユニット位置情報（id: 表示設定ID、positoon: { x, y }： 選択位置) 
     */
    selectUnitDispSetting(unitPosition) {
        if (unitPosition.id) {
            this.props.changeConfirmModalState(true, '確認', 'ユニット画面に遷移しますか？', MESSAGEMODAL_BUTTON.confirm, () => this.dispUnitPage(unitPosition.id));
        }
    }
    
    /********************************************
     * ラック編集関係
     ********************************************/

    /**
     * ラック編集モードに変更する
     * @param {object} location 選択中のロケーション
     */
    changeEditMode(location) {        
        if (!location.children || location.children.length <= 0) {
            this.props.setEditMode(true)
        } else {
            this.props.changeMessageModalState(true, 'エラー', '子ノードを持つロケーションはラックとして登録できません。');
        }
    }

    /**
     * ラックの編集をキャンセルする
     */
    cancelEditRack(){
        this.props.setEditingRack(this.props.selectedRack);  //元に戻す
        this.props.setEditMode(false);
    }

    /**
     * ラック概要の変更イベント
     * @param {object} rack 変更後のラック情報
     * @param {boolean} invalid 保存が無効かどうか
     */
    hanldeOutviewChanged(rack, invalid){
        this.props.changeRackOverview(rack, invalid);
        if (this.props.isApplyTemplate) {
            this.props.setApplayTemplateState(false);
        }
    }
    
    /**
     * ラック詳細の変更イベント
     * @param {array} pages 変更後のラック詳細情報
     * @param {boolean} invalid 保存が無効かどうか
     */
    handleDetailItemChanged(pages, invalid) {
        this.props.changeRackDetail(pages, invalid);
    }

    /**
     * ラック電源の変更イベント
     * @param {array} powers 変更後のラック電源情報
     * @param {boolean} invalid 保存が無効かどうか
     */
    handlePowerItemChanged(powers, invalid) {
        this.props.changeRackPowers(powers, invalid);
    }

    /**
     * リンク情報の変更イベント
     * @param {array} links 変更後のリンク情報
     * @param {boolean} invalid 保存が無効かどうか
     */
    handleLinkItemChanged(links, invalid) {
        this.props.changeRackLinks(links, invalid);
    }

    /********************************************
     * テンプレート関係
     ********************************************/

    /**
     * テンプレート追加モーダルの保存ボタン押下イベント
     * @param {object} template テンプレート情報（テンプレート名称とテンプレートメモのみ）
     */
    handleTemplateSave(template){
        const { selectedRack } = this.props;
        const newTemplate = this.makeTemplate(template, selectedRack);
        this.props.changeAddTemplateModalState();
        
        this.saveTemplate(newTemplate);
    }

    /**
     * テンプレートを作成する
     * @param {object} template テンプレート情報（テンプレート名称とテンプレートメモのみ）
     * @param {object} rack テンプレート化するラック
     */
    makeTemplate(template, rack){
        return {
            ...template,
            row: rack.row,
            col: rack.col,
            load: rack.load,
            weight: rack.weight,
            status: Object.assign({}, rack.status),
            type: Object.assign({}, rack.type),
            extendedPages: convertDateTimeExtendedData(JSON.parse(JSON.stringify(rack.extendedPages)))
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

    /**
     * ユニット画面に遷移する
     * @param {string} dispSetId 表示設定グループID
     */
    dispUnitPage(dispSetId){
        const { selectedLocation } = this.props.locationSelector;

        //sessionStorageにロケーションIDを格納
        setSessionStorage(STORAGE_KEY.locationId, selectedLocation.location.locationId);

        if (dispSetId) {
            setSessionStorage(STORAGE_KEY.dispSetId, dispSetId);
        }

        window.location.href = '/Unit';         //画面遷移
    }

    /********************************************
     * その他
     ********************************************/
     
    /**
     * 編集ボタンの読み取り専用かどうか
     * @param {boolean} isReadOnly 読み取り専用かどうか
     * @param {boolean} isSelectedRack ラックが選択されているかどうか
     * @param {number} level 権限レベル
     * @returns {boolean} 読み取り専用かどうか
     */
    readOnlyForEditButton(isReadOnly, isSelectedRack, level) {
        if (!(isSelectedRack || isReadOnly)) {
            return readOnlyByLevel(isReadOnly, level, LAVEL_TYPE.manager);
        }
        return isReadOnly;
    }

    /**
     * 保存ボタンクリックイベント
     */
    handleSaveButtonClick() {
        this.props.changeConfirmModalState(
            true, 
            '保存確認', 
            'ラックを保存します。よろしいでしょうか？', 
            MESSAGEMODAL_BUTTON.save,
            () => {
                this.saveRack();
                this.props.changeConfirmModalState(false);
            }
        );
    }
    
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
        searchCondition: state.searchCondition,
        masterInfo: state.masterInfo,
        selectedRack: state.selectedRack,
        rackPowerValues: state.rackPowerValues,
        editingRack: state.editingRack,
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
        setLookUp:(lookUp) => dispatch(setLookUp(lookUp)),
        setSearchCondition: (searchCondition) => dispatch(setSearchCondition(searchCondition)),
        setSelectedRack:(rack) => dispatch(setSelectedRack(rack)),
        setRackPowerValues:(values) => dispatch(setRackPowerValues(values)),
        clearSelectRack:() => dispatch(clearSelectRack()),
        setEditingRack:(rack) => dispatch(setEditingRack(rack)),
        changeRackOverview:(rack, invalid) => dispatch(changeRackOverview(rack, invalid)),
        changeRackDetail:(detailData, invalid) => dispatch(changeRackDetail(detailData, invalid)),
        changeRackPowers:(powers, invalid) => dispatch(changeRackPowers(powers, invalid)),
        changeRackLinks:(links, invalid) => dispatch(changeRackLinks(links, invalid)),
        setEditMode:(isEditing) => dispatch(setEditMode(isEditing)),
        setLoadState:(isLoading) => dispatch(setLoadState(isLoading)),
        setLoadState_PowerBarOnly:(isLoading) => dispatch(setLoadState_PowerBarOnly(isLoading)), 
        setLoadState_RackOnly:(isLoading) => dispatch(setLoadState_RackOnly(isLoading)),
        changeSelectTemplateModalState:(show) => dispatch(changeSelectTemplateModalState(show)),
        changeAddTemplateModalState:(show) =>  dispatch(changeAddTemplateModalState(show)),
        changeDeleteComfirmModalState:(show, message, attenstion) => dispatch(changeDeleteComfirmModalState(show, message, attenstion)),
        changeMessageModalState:(show, title, message, callback) => dispatch(changeMessageModalState(show, title, message, callback)),
        changeConfirmModalState: (show, title, message, type, callback) => dispatch(changeConfirmModalState(show, title, message, type, callback)),
        changeReportOutputModalState: (show) => dispatch(changeReportOutputModalState(show)),
        changeReportHistoryModalState: (show) => dispatch(changeReportHistoryModalState(show)),
        changeReportFormatModalState: (show) => dispatch(changeReportFormatModalState(show)),
        applyTemplate:(template) => dispatch(applyTemplate(template)),
        setApplayTemplateState:(isApplayTemplate) => dispatch(setApplayTemplateState(isApplayTemplate)),
        setWaitingState: (isWaiting, waitingType) => dispatch(setWaitingState(isWaiting, waitingType)),
        setLoginUser: (loginUser) => dispatch(setLoginUser(loginUser))
    };
};

/**
 * mapStateToProps, mapDispatchToPropsをReduxと連携させる
 */
export default connect(mapStateToProps, mapDispatchToProps)(RackPanel);

 