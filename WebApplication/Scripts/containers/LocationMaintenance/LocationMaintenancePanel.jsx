/**
 * @license Copyright 2017 DENSO
 * 
 * LocationMaintenance画面
 * 
 * 画面のコンテナとして。Reduxに依存したコードを記述します。
 * 画面のロジックはここに記述します。（適宜ファイル分割は行うこと）
 * 
 */
'use strict';

//#region import
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FUNCTION_ID_MAP, LAVEL_TYPE, getAuthentication } from 'authentication';
import { setAuthentication } from 'Authentication/actions.js';

import { Button, Row, Col, Grid, ButtonToolbar, DropdownButton, MenuItem } from 'react-bootstrap';

import { bindActionCreators } from 'redux';
import * as Actions from './actions.js';
import { setWaitingState } from 'WaitState/actions.js';
import { changeModalState, closeModal, successSave, showErrorMessage  } from 'ModalState/actions.js';
import { changeLoadState } from 'LoadState/actions.js';

import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';

import Content from 'Common/Layout/Content';
import Box from 'Common/Layout/Box';

import MessageModal from 'Assets/Modal/MessageModal';
import WaitingMessage from 'Assets/Modal/WaitingMessage';

import LocationListBox from 'LocationMaintenance/LocationListBox';
import LocationEditBox from 'LocationMaintenance/LocationEditBox';

import { getIsReadOnly, getMatchStatus, getMatchType, getNewNodeInfo, isAllowedAllSiblings, getLocationByPosition, getPositionByLocation } from 'locationMaintenanceUtility';
import { ADDING_NODE_POSITION } from 'treeViewUtility';
//#endregion

/**
 * LocationMaintenance画面のコンポーネント
 */
class LocationMaintenancePanel extends Component {

    /**
     * コンストラクタ
     */
    constructor(){
        super();
        this.state = {
            isSortMode: false,          //並べ替えモードかどうか
            isAddMode: false,           //ノード追加モードかどうか
            isAddChildMode: false,      //子ノード追加モードかどうか
            haveAllSiblingsAuth: false, //選択中ノードの全兄弟の権限があるかどうか（並べ替え可能＆ノード追加可能）
            addingNodePosition: ADDING_NODE_POSITION.top    //追加ノードの位置
         };
    }

    //#region ライフサイクル関数
    /**
     * 最初のレンダリング時にクライアントに一度だけ呼び出されます。
     * Componentがレンダリングされた直後に呼び出されるメソッドです。
     * ここでsetStateを行うと、renderがもう一度呼び出されるためあまり行わないほうがよいです。
     */
    componentDidMount() {
        this.loadAuthentication();  //権限取得
        this.getLocationList(); //ロケーション一覧取得
    }
    //#endregion

    //#region データ送受信
    /**
     * 権限情報を読み込む
     */
    loadAuthentication() {
        getAuthentication(FUNCTION_ID_MAP.locationEdit, (auth) => {
            this.props.setAuthentication(auth);
        });
    }

    /**
     * ロケーション一覧取得
     */
    getLocationList(callback) {
        this.props.changeLoadState();
        sendData(EnumHttpMethod.get, '../api/location', null, (data, networkError) => {
            if (!networkError) {
                if (data && data.lookUp) {
                    this.props.setLocationList(data.lookUp.locations);
                    this.props.setLookUp(data.lookUp);
                }
                else {                    
                    this.props.changeModalState({ show: true, title: "エラー", message: "初期情報の取得に失敗しました。" });
                }
            } else {
                this.props.changeModalState({ show: true, title: "エラー", message: NETWORKERROR_MESSAGE });
            }
            callback && callback(data && data.lookUp && data.lookUp.locations);
            this.props.changeLoadState();
        });
    }

    /**
     * 選択中ロケーションのレベルを並べ替え可能かどうか
     */
    getCanSort() {
        this.props.changeLoadState();
        sendData(EnumHttpMethod.post, '../api/location/allow', this.props.selectLocation.location, (data, networkError) => {
            if (!networkError) {
                if (data) {
                    this.props.setSortLocations(data);
                    this.setState({ isSortMode: true });
                }
                else {
                    this.props.changeModalState({ show: true, title: "並べ替え不可", message: "並べ替え対象ロケーションの全権限がないため、並べ替えできません。" });
                }
            } else {
                this.props.changeModalState({ show: true, title: "エラー", message: NETWORKERROR_MESSAGE });
            }
            
            this.props.changeLoadState();
        });
    }

    /**
     * 並べ替え後の並べ替え対象ロケーション情報を送信する
     */
    postSortLocations(sortedLocations) {
        this.props.changeLoadState();
        this.props.setWaitingState(true, 'save');
        let postData = _.cloneDeep(sortedLocations);
        sendData(EnumHttpMethod.post, '../api/location/sort', postData, (data, networkError) => {
            this.props.setWaitingState(false);
            if (!networkError) {
                if (data.isSuccess) {
                    this.props.successSave({ targetName: "並べ替えたロケーション情報" })
                    this.props.setSortLocations(null);
                    this.reload();
                    this.setState({ isSortMode: false });
                }
                else {
                    this.props.showErrorMessage({ message: "並べ替えたロケーション情報の保存に失敗しました。" });
                }
            } else {
                this.props.changeModalState({ show: true, title: "エラー", message: NETWORKERROR_MESSAGE });
            }
            this.props.changeLoadState();
        });
    }

    /**
     * 編集中ロケーション情報を送信する
     */
    postEditInfo() {
        const { editLocation, selectLocation } = this.props;
        const { addingNodePosition } = this.state;

        const sendingData = {
            location: editLocation,
            selectedLocationId: selectLocation.location.locationId,
            locationNodeAddPosition: addingNodePosition
        }

        this.props.changeLoadState();
        this.props.setWaitingState(true, 'save');

        
        sendData(EnumHttpMethod.post, '../api/location/update', sendingData, (data, networkError) => {
            this.props.setWaitingState(false);
            if (!networkError) {
                if (_.get(data, "requestResult.isSuccess")) {
                    this.props.changeModalState({ show: true, title: "保存成功", message: _.get(data, "requestResult.message") });
                    if (_.get(data, "locations") && _.get(data, "locations").length > 0) {
                        this.props.setSelectLocation({ location: _.get(data, "locations")[0], position: getPositionByLocation(_.get(data, "locations")[0]) });
                    }
                    this.reload();
                }
                else {
                    const message = _.get(data, "requestResult.message", "ロケーション情報の保存に失敗しました。");
                    this.props.changeModalState({ show: true, title: "保存失敗", message: message });
                }
            } else {
                this.props.changeModalState({ show: true, title: "エラー", message: NETWORKERROR_MESSAGE });
            }            
            this.props.changeLoadState();
        });
    }

    /**
     * 削除するロケーション情報を送信する
     */
    postDeleteLocation() {
        const postData = this.props.selectLocation.location;
        this.props.changeLoadState();
        this.props.setWaitingState(true, 'delete');
        sendData(EnumHttpMethod.post, '../api/location/delete', postData, (data, networkError) => {
            this.props.setWaitingState(false);
            if (!networkError) {
                if (_.get(data, "requestResult.isSuccess")) {
                    this.props.changeModalState({ show: true, title: "削除成功", message: _.get(data, "requestResult.message") });
                    this.props.setSelectLocation({
                        location: this.props.selectLocation.location.parent || null,
                        position: this.props.selectLocation.location.parent ? getPositionByLocation(this.props.selectLocation.location.parent) : null
                    });
                    this.reload(true);
                }
                else {
                    const message = _.get(data, "requestResult.message", "ロケーションの削除に失敗しました。");
                    this.props.changeModalState({ show: true, title: "削除失敗", message: message });
                }
            } else {
                this.props.changeModalState({ show: true, title: "エラー", message: NETWORKERROR_MESSAGE });
            }            
            this.props.changeLoadState();
        });
    }
    //#endregion

    //#region イベントハンドラ

    //#region ロケーション一覧イベントハンドラ
    /**
     * ロケーション選択イベントハンドラ
     * @param {object} loaction 選択ロケーション
     * @param {array} position 選択ロケーションまでの親ロケーションリスト
     */
    handleSelectLocation(location, position) {
        if (location.icon) {    //権限無しロケーション
            this.props.setSelectLocation({ location: null, position: null });
            this.setState({ haveAllSiblingsAuth: false });
        }
        else {                  //許可ロケーション
            this.props.setSelectLocation({ location: location, position: position });
            //全兄弟の権限があるかどうか有効状態変更
            let haveAllSiblingsAuth = this.state.haveAllSiblingsAuth;
            const { isAllowed, siblings } = isAllowedAllSiblings(this.props.locationList, position);
            this.setState({ haveAllSiblingsAuth: isAllowed });
        }
    }

    /**
     * 並べ替えボタンクリックイベントハンドラ
     */
    handleClickSort() {
        this.getCanSort();
    }

    /**
     * 並べ替えキャンセルイベントハンドラ
     */
    handleCancelSort() {
        this.props.setSortLocations(null);
        this.setState({ isSortMode: false });
    }

    /**
     * 並べ替え保存イベントハンドラ
     * @param {array} sortedLocations 並べ替え後の並べ替え対象ロケーション配列
     */
    handleSaveSort(sortedLocations) {
        this.postSortLocations(sortedLocations);    
    }

    //#endregion

    //#region ノード追加イベントハンドラ
    /**
     * ノード追加ボタン押下イベントハンドラ
     */
    handleClickAddNode(addingNodePosition) {
        this.props.setEditLocation(getNewNodeInfo(false, this.props.selectLocation.location));  //編集対象情報設定
        this.setState({ isAddMode: true, addingNodePosition: addingNodePosition });
    }

    /**
     * 子ノード追加ボタン押下イベントハンドラ
     */
    handleClickAddChild(addingNodePosition) {
        if (this.props.selectLocation.location.isRack) {
            this.props.changeModalState({ show: true, title: "エラー", message: "ラックとして登録しているロケーションに子ノードは追加できません。" });
        }
        else {
            this.props.setEditLocation(getNewNodeInfo(true, this.props.selectLocation.location));  //編集対象情報設定
            this.setState({ isAddChildMode: true, addingNodePosition: addingNodePosition });
        }
    }
    //#endregion

    //#region ロケーション編集イベントハンドラ
    /**
     * ラックとして登録ラジオボタン変更イベントハンドラ
     * @param {bool} value 変更後の値
     */
    handleChangeIsRack(value) {
        if (!this.state.isAddMode && !this.state.isAddChildMode && _.get(this.props, "selectLocation.location.hasChild")) {
            this.props.changeModalState({ show: true, title: "エラー", message: "子ノードを持つロケーションはラックとして登録できません。" });
        }
        else {
            this.props.changeIsRack(value);

            //ラック情報変更
            if (value) {    //初期値設定
                this.updateRackInfo(this.props.lookUp.rackTypes[0], this.props.lookUp.rackStatuses[0]);
            }
            else {          //値クリア
                this.updateRackInfo(null, null);
            }
        }
    }

    /**
     * ラック種別変更イベントハンドラ
     * @param {number} selectId 変更後のtypeId値
     */
    handleChangeRackType(selectId) {
        const rackType = getMatchType(selectId, this.props.lookUp.rackTypes);
        this.updateRackInfo(rackType, this.props.editLocation.rack.status);
    }

    /**
     * ラック利用状況変更イベントハンドラ
     * @param {number} selectId 変更後のstatusId値
     */
    handleChangeRackStatus(selectId) {
        const rackStatus = getMatchStatus(selectId, this.props.lookUp.rackStatuses);
        this.updateRackInfo(this.props.editLocation.rack.type, rackStatus);
    }

    /**
     * 保存ボタン押下イベントハンドラ
     */
    handleClickSave() {
        this.postEditInfo();
    }

    /**
     * 削除ボタン押下イベントハンドラ
     */
    handleClickDelete() {
        if (_.get(this.props, "selectLocation.location.hasChild")) {
            this.props.changeModalState({ show: true, title: "エラー", message: "子ノードが存在するため削除できません。" });
        }
        else {
            this.postDeleteLocation();
        }
    }

    /**
     * キャンセルボタン押下イベントハンドラ
     */
    handleClickCancel() {
        this.props.setEditLocation(this.props.selectLocation.location); //編集前の値を再セット
        if (this.state.isAddMode || this.state.isAddChildMode) {
            this.setState({ isAddMode: false, isAddChildMode: false });
        }
    }
    //#endregion

    //#endregion

    //#region render
    /**
     * render
     */
    render() {
        const { isReadOnly, level, loadAuthentication } = this.props.authentication;
        const { isWaiting, waitingType } = this.props.waitingInfo;
        const { locationList, lookUp, selectLocation, sortLocations, editLocation, isLoading, modalState } = this.props; 
        const { rackTypes, rackStatuses } = lookUp;
        const { isSortMode, isAddMode, isAddChildMode, haveAllSiblingsAuth, addingNodePosition } = this.state;

        const loading = isLoading || !loadAuthentication;
        const addDeleteDisabled = getIsReadOnly(isReadOnly, level, "addDelete");

        return (
            <Content>
                <Row>
                    <Col md={4}>
                        {locationList &&
                            <LocationListBox
                                hideOperationButton={getIsReadOnly(isReadOnly, level, "sort") }
                                isReadOnly={!selectLocation.location || !haveAllSiblingsAuth}
                                isLoading={loading}
                                locations={locationList}
                                selectLocation={selectLocation && selectLocation.location}
                                selectLocPosition={selectLocation && selectLocation.position}
                                sortLocations={sortLocations}
                                isSortMode={isSortMode}
                                isAddMode={isAddMode}
                                isAddChildMode={isAddChildMode}
                                addingNodePosition={addingNodePosition}
                                onSelectLocation={(location, position) => this.handleSelectLocation(location, position)}
                                onClickSort={() => this.handleClickSort()}
                                onClickCancel={() => this.handleCancelSort()}
                                onClickSave={(sortedLocations) => { this.handleSaveSort(sortedLocations) }}
                            />
                        }
                    </Col>
                    <Col md={8}>
                        <AddButtonGroup
                            hide={addDeleteDisabled}
                            isLoading={loading}
                            disableAddNode={!haveAllSiblingsAuth} 
                            isReadOnly={selectLocation.location && this.isNormalMode() ? false : true}
                            onClickAddNode={(addingNodePosition) => this.handleClickAddNode(addingNodePosition)}
                            onClickAddChild={(addingNodePosition) => this.handleClickAddChild(addingNodePosition)}
                        />
                        <LocationEditBox
                            isReadOnly={{ edit: getIsReadOnly(isReadOnly, level, "edit"), addDelete: addDeleteDisabled }}
                            isLoading={loading}
                            rackTypes={rackTypes}
                            rackStatuses={rackStatuses}
                            editable={selectLocation.location && !isSortMode ? true : false}
                            hideDeleteButton={isAddMode || isAddChildMode }
                            title={isAddMode || isAddChildMode ? "新規ノード":selectLocation.location ? selectLocation.location.name :"未選択"}
                            name={editLocation && editLocation.name}
                            isRack={editLocation && editLocation.isRack}
                            rack={editLocation && editLocation.rack}
                            onChangeName={(value) => this.props.changeLocationName(value)}
                            onChangeIsRack={(value) => this.handleChangeIsRack(value)}
                            onChangeRackType={(value) => this.handleChangeRackType(value)}
                            onChangeRackStatus={(value) => this.handleChangeRackStatus(value)}
                            onClickSave={() => this.handleClickSave()}
                            onClickDelete={() => this.handleClickDelete()}
                            onClickCancel={() => this.handleClickCancel()}
                        />
                    </Col>
                </Row>
                <MessageModal
                    {...modalState}
                    children={modalState.message && modalState.message.split(/\r\n|\n/).map((str) => <div>{str}</div>)}
                    onCancel={() => this.props.closeModal()}
                />
                <WaitingMessage show={isWaiting} type={waitingType} />
            </Content>
        );
    }
    //#endregion

    //#region その他関数
    /**
     * 画面情報再読み込み・選択状態クリア
     */
    reload(isDelete) {
        this.getLocationList((locationList) => {
            const { isAddMode, isAddChildMode } = this.state;
            if (this.props.selectLocation.position && locationList) {
                this.handleSelectLocation(getLocationByPosition(locationList, this.props.selectLocation.position), this.props.selectLocation.position);
            }
            this.setState({ disableAddNode: false, isAddMode: false, isAddChildMode: false });
        });
    }

    /**
     * 通常のモードかどうか
     */
    isNormalMode() {
        if (!this.state.isSortMode && !this.state.isAddMode && !this.state.isAddChildMode) {
            return true;
        }
        return false;
    }

    /**
     * ラック情報更新
     * @param {object} type 変更後のラックタイプ情報
     * @param {object} status 変更後のラック種別情報
     */
    updateRackInfo(type, status) {
        let rack = Object.assign({}, this.props.editLocation.rack);
        rack.type = type
        rack.status = status;
        this.props.changeRackInfo(rack);
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
        locationList: state.locationList,
        lookUp: state.lookUp,
        selectLocation: state.selectLocation,
        sortLocations: state.sortLocations,
        editLocation: state.editLocation,
        waitingInfo: state.waitingInfo,
        modalState:state.modalState,
        isLoading:state.isLoading
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
        setWaitingState: (isWaiting, waitingType) => dispatch(setWaitingState(isWaiting, waitingType)),
        changeModalState: (state) => dispatch(changeModalState(state)),
        successSave: (data) => dispatch(successSave(data)),
        showErrorMessage: (data) => dispatch(showErrorMessage(data)),
        closeModal: () => dispatch(closeModal()),
        changeLoadState: () => dispatch(changeLoadState())
    };
};

// Wrap the component to inject dispatch and state into it
/**
 * mapStateToProps, mapDispatchToPropsをReduxと連携させる
 */
export default connect(mapStateToProps, mapDispatchToProps)(LocationMaintenancePanel);

/**
 * ノード追加/子ノード追加ボタングループ
 */
const AddButtonGroup = ({ hide, isLoading, disableAddNode, isReadOnly, onClickAddNode: handleClickAddNode, onClickAddChild: handleClickAddChild }) => {
    if (!hide) {
        return (
            <ButtonToolbar className="mb-05">
                <DropdownButton
                    bsStyle="primary"
                    disabled={isLoading || disableAddNode || isReadOnly ? true : false}
                    title={<span><i className="fal fa-plus" /> ノード追加</span>}
                    onSelect={(eventKey) => handleClickAddNode(eventKey)}
                >
                    <MenuItem eventKey={ADDING_NODE_POSITION.top}>最上部へ追加</MenuItem>
                    <MenuItem eventKey={ADDING_NODE_POSITION.above}>1つ上へ追加</MenuItem>
                    <MenuItem eventKey={ADDING_NODE_POSITION.below}>1つ下へ追加</MenuItem>
                    <MenuItem eventKey={ADDING_NODE_POSITION.bottom}>最下部へ追加</MenuItem>
                </DropdownButton>
                <DropdownButton
                    bsStyle="primary"
                    disabled={isLoading || isReadOnly ? true : false}
                    title={<span><i className="fal fa-plus" /> 子ノード追加</span>}
                    onSelect={(eventKey) => handleClickAddChild(eventKey)}
                >
                    <MenuItem eventKey={ADDING_NODE_POSITION.top}>最上部へ追加</MenuItem>
                    <MenuItem eventKey={ADDING_NODE_POSITION.bottom}>最下部へ追加</MenuItem>
                </DropdownButton>
            </ButtonToolbar>
        );
    }
    return false;
}

 