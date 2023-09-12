/**
 * @license Copyright 2018 DENSO
 * 
 * グラフィック画面
 * 
 * 画面のコンテナとして。Reduxに依存したコードを記述します。
 * 画面のロジックはここに記述します。（適宜ファイル分割は行うこと）
 * 
 */
'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import { FUNCTION_ID_MAP, LAVEL_TYPE, getAuthentication } from 'authentication';
import { setAuthentication } from 'Authentication/actions.js';

import { bindActionCreators } from 'redux';
import * as Actions from './actions';
import { closeModal, requestShowModal } from 'ModalState/actions';
import { setDrawingArea } from 'FloorMapCommon/actions';

import { Row, Col } from 'react-bootstrap';
import Content from 'Common/Layout/Content';
import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';
import CheckboxSwitch from 'Common/Widget/CheckboxSwitch';
import Size2DForm from 'Common/Form/Size2DForm';
import InputForm from 'Common/Form/InputForm';

import GarmitBox from 'Assets/GarmitBox';
import LayoutSelectForm from 'Assets/FloorMap/LayoutSelectForm';
import { SaveButton, CancelButton, DeleteButton, EditButton, AddButton, SelectClearButton, ApplyButton } from 'Assets/GarmitButton';
import MessageModal from 'Assets/Modal/MessageModal';
import WaitingMessage from 'Assets/Modal/WaitingMessage';

import FloorMapBox from 'Graphic/FloorMapBox';
import LayoutSettingBox from 'Graphic/LayoutSettingBox';
import ObjectSettingBox from 'Graphic/ObjectSettingBox';
import ImageSelectModal from 'Graphic/ImageSelectModal';
import MaintenanceObject from 'Graphic/MaintenanceObject';

import { getMatchLayout } from 'treeViewUtility';
import { isNumber } from 'numberUtility';
import { OBJECT_TYPE, OBJECT_TYPE_OPTIONS, LINK_TYPE, LINK_TYPE_OPTIONS, getMatchLayoutObject, getSelectObjectInfo, hasValue, getAddObjectId } from 'graphicUtility';
import { DRAW_AREA_SIZE, BORDER_WIDTH, MINIATURE_HEIGHT, MAP_TRANSITION_TYPE } from 'constant';
import { sendData, EnumHttpMethod } from 'http-request';

/**
 * グラフィック画面のコンポーネント
 */
class GraphicPanel extends Component {

    /**
     * コンストラクタ
     */
    constructor() {
        super();
        this.state = {
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
        this.props.requestInitialInfo();
        this.setDrawingArea();

        //画面サイズ変更イベントを設定
        window.addEventListener('resize', () => {
            this.setDrawingArea();
        });
    }

    //#endregion

    //#region イベントハンドラ
    //#region フロアマップボックスイベント
    /**
     * レイアウトオブジェクトクリック・移動・リサイズイベント
     */
    handleChangeMapObject = (changeInfo) => {
        this.props.requestChangeMap(changeInfo);
    }

    /**
     * 戻る・進むボタンクリックイベント
     */
    handleClickMapButton = (type) => {
        if (type === MAP_TRANSITION_TYPE.forward) {
            this.props.requestRedo();
        }
        else if (type === MAP_TRANSITION_TYPE.back) {
            this.props.requestUndo();
        }
    }

    /**
     * 選択解除ボタンクリッククリックイベント
     */
    handleClickClear = () => {
        const { editing, selectObjectsIdList } = this.props;
        const selectObjects = getSelectObjectInfo(editing.layoutObjects, selectObjectsIdList);
        this.props.requestDeselectObjects(selectObjects);
    }
    //#endregion

    //#region パネルイベント
    /**
     * 選択レイアウト変更イベント
     */
    handleChangeLayout = (selectLayout) => {
        const children = _.get(selectLayout, "children");
        this.props.requestSelectLayout({
            layoutId: _.get(selectLayout, 'layoutId'),
            hasChild: _.size(children) > 0 ? true : false   //子レイアウトがあるかどうか（削除可能判定に使用）
        });
    }

    /**
     * レイアウト操作ボタンクリックイベント
     */
    handleCilckOperationButton = (operation) => {
        switch (operation) {
            case "deleteLayout":
            case "saveLayout":
                this.props.requestShowModal(operation);
                break;
            case "cancelLayout":
                this.props.requestShowModal(operation);
                break;
            case "addLayout":
                this.props.requestChangeMode({ isEditMode: true, isAdd: true });
                break;
            case "editLayout":
                this.props.requestChangeMode({ isEditMode: true, isAdd: false });
                break;
        }
    }
    //#endregion

    //#region マップ操作ボックスイベント
    /**
     * マップ設定編集イベント
     */
    handleChangeMapSetting = (key, changed) => {
        this.props.changeMapSetting({ key: key, value: changed });
    }
    //#endregion

    //#region レイアウト設定ボックスイベント
    /**
     * レイアウト設定編集イベント
     */
    handleChangeLayoutSetting = (changeObject) => {
        this.props.changeLayoutSetting(changeObject);
    }
    //#endregion

    //#region オブジェクト設定ボックスイベント
    /**
     * オブジェクト設定編集イベント
     */
    handleChangeObjectSetting = (changeObject, e) => {
        this.props.requestChangeObject({ item: changeObject, value: e });
    }

    /**
    * オブジェクト設定チェック状態編集イベント
    */
    handleChangeMultiApply = (changed, value) => {
        this.props.changeMultiApply({ item: changed, value: value });
    }

    /**
     * オブジェクト操作ボタンクリックイベント
     */
    handleClickObjectOperation = (operation) => {
        switch (operation) {
            case "edit":
                this.props.requestObjBoxEditMode();
                break;
            case "addObject":
                this.props.requestAddObject();
                break;
            case "deleteObject":
                this.props.requestShowModal(operation);
                break;
            case "applyObject":
                this.props.requestShowModal(operation);
                break;
            case "cancelObject":
                this.props.requestCancelSetting();
                break;
            default: break;
        }
    }
    //#endregion

    //#region メッセージモーダルイベント
    /**
     * モーダルOKボタンクリックイベント
     */
    handleClickOK = () => {
        const { selectLayout, editing, selectObjectsIdList, objectSettingBox, modalState } = this.props;
        this.props.closeModal();
        switch (modalState.okOperation) {
            case "deleteLayout":
                this.props.requestDeleteLayout(selectLayout);
                break;
            case "saveLayout":
                this.props.requestSaveLayout(editing);
                break;
            case "cancelLayout":
                this.props.requestChangeMode({ isEditMode: false });
                break;
            case "deleteObject":
                //選択中オブジェクトIDから削除対象オブジェクト情報取得
                const deleteObjects = getSelectObjectInfo(editing.layoutObjects, selectObjectsIdList);
                this.props.requestDeleteObject(deleteObjects);
                break;
            case "applyObject":
                const selectObjects = getSelectObjectInfo(editing.layoutObjects, selectObjectsIdList);
                this.props.requestApplyChange(selectObjects);
                break;
            default: break;
        }
    }

    /**
     * モーダルクローズボタンクリックイベント
     */
    handleClosMessageModal = () => {
        this.props.closeModal();
    }
    //#endregion
    //#endregion

    //#region render
    /**
     * render
     */
    render() {
        const { title, show, message, buttonStyle } = this.props.modalState;
        const { isOnlyValueLabel, lookUp, isReadOnly, selectLayout, editing, selectObjectsIdList, objectSettingBox, isEditMode, isLoading, modalInfo, drawingArea, mapSetting, logInfo, waitingInfo, modalState } = this.props;
        const { loadAuthentication } = this.props.authentication;
        const { isEditMode: isObjBoxEditMode } = objectSettingBox;
        const { locations, layouts, egroups } = lookUp;
        const isAddLayoutMode = editing && editing.layoutId === -1 ? true : false;
        const loading = isLoading || !loadAuthentication;

        return (
            <Content>
                <div className="flex-top-between">
                    <div className="flex-center">
                        <LayoutSelectForm
                            isAddMode={isAddLayoutMode}
                            isReadOnly={loading || isEditMode}
                            layoutList={layouts}
                            selectLayout={selectLayout}
                            onChangeSelectLayout={this.handleChangeLayout}
                        />
                    </div>
                    {!isReadOnly &&
                        <OperationButtonGroup
                            isEditMode={isEditMode}
                            canSave={!isObjBoxEditMode && _.get(this.props.editing, 'nameValidation.state') === 'success' ? true : false}
                            isSelectLayout={selectLayout ? true : false}
                            disableDelete={_.get(selectLayout, "hasChild", true)}
                            isLoading={loading}
                            onClick={this.handleCilckOperationButton}
                        />
                    }
                </div>
                <Row>
                    <Col lg={6} md={12}>
                        <FloorMapBox
                            isReadOnly={isReadOnly}
                            selectLayout={selectLayout}
                            canBack={logInfo.canBack}
                            canForward={logInfo.canForward}
                            selectObjectsIdList={selectObjectsIdList}
                            mapSetting={mapSetting}
                            drawingArea={drawingArea}
                            isLoading={loading}
                            isEditMode={isEditMode}
                            backgroundUrl={isEditMode ? _.get(editing, "backgroundImageUrl") : _.get(selectLayout, "backgroundImageUrl")}
                            layoutObjects={isEditMode ? _.get(editing, "layoutObjects", []) : _.get(selectLayout, "layoutObjects", [])}
                            onClickClear={this.handleClickClear}
                            onChangeMapObject={this.handleChangeMapObject}
                            onClickMapButton={this.handleClickMapButton}
                        />
                    </Col>
                    <Col lg={6} md={12} >
                        {!isReadOnly &&
                            <MapSettingBox
                                {...mapSetting}
                                maxSize={DRAW_AREA_SIZE}
                                isLoading={loading}
                                isReadOnly={!isEditMode}
                                onChange={this.handleChangeMapSetting}
                            />
                        }
                        <LayoutSettingBox
                            isReadOnly={isReadOnly}
                            layoutList={layouts}
                            locationList={locations}
                            layoutInfo={_.pick(selectLayout, ['layoutName', 'backgroundImage', 'backgroundImageUrl', 'backgroundMaskImage', 'backgroundMaskImageUrl', 'parent', 'location'])}
                            editingInfo={_.pick(editing, ['layoutId', 'layoutName', 'nameValidation', 'backgroundImage', 'backgroundImageUrl', 'backgroundMaskImage', 'backgroundMaskImageUrl', 'parent', 'location'])}
                            isLoading={loading}
                            isEditMode={isEditMode}
                            onChangeLayoutSetting={this.handleChangeLayoutSetting}
                        />
                        {!isReadOnly &&
                            <ObjectSettingBox
                                isOnlyValueLabel={isOnlyValueLabel}
                                isReadOnly={isReadOnly}
                                isEditMode={isEditMode}
                                selectLayoutId={_.get(selectLayout, 'layoutId')}
                                lookUp={lookUp}
                                selectObjects={selectObjectsIdList}
                                info={objectSettingBox}
                                isLoading={loading}
                                common={{ isReadOnly: isReadOnly || !isObjBoxEditMode, onChange: this.handleChangeObjectSetting, onCheckChange: this.handleChangeMultiApply }}
                                onClick={this.handleClickObjectOperation}
                            />
                        }
                    </Col>
                </Row>
                <MessageModal
                    {...modalState}                    
                    onOK={this.handleClickOK}
                    onCancel={this.handleClosMessageModal}
                >
                    {message && message.split(/\r\n|\n/).map((str) => <div>{str}</div>)}
                </MessageModal>
                <WaitingMessage show={waitingInfo.isWaiting} type={waitingInfo.waitingType} />
            </Content>
        );
    }
    //#endregion

    //#region その他関数
    /**
     * 権限情報を読み込む
     */
    loadAuthentication() {
        getAuthentication(FUNCTION_ID_MAP.graphicEdit, (auth) => {
            this.props.setAuthentication(auth);
        });
    }

    /**
     * 描画エリアの幅と高さをセットする
     */
    setDrawingArea() {
        const { width, height } = this.props.drawingArea;

        //フロアマップボックスの幅から描画エリアの幅と高さを取得
        var boxBody = $("#floorMapBoxBody").parents(".box-body")[0];
        const newWidth = boxBody.clientWidth - 20;
        const newHeight = newWidth * height / width;
        var data = {
            width: newWidth,
            height: newHeight
        }
        this.props.setDrawingArea(data);
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
        isReadOnly: state.isReadOnly,
        lookUp: state.lookUp,
        selectLayout: state.selectLayout,
        layoutObjects: state.layoutObjects,
        editing: state.editing,
        selectObjectsIdList: state.selectObjectsIdList,
        isOnlyValueLabel: state.isOnlyValueLabel,
        mapSetting: state.mapSetting,
        objectSettingBox: state.objectSettingBox,
        logInfo: state.logInfo,
        isLoading: state.isLoading,
        modalState: state.modalState,
        isEditMode: state.isEditMode,
        drawingArea: state.floorMapInfo.drawingArea,
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
        setAuthentication: (auth) => dispatch(setAuthentication(auth)),
        closeModal: () => dispatch(closeModal()),
        requestShowModal: (data) => dispatch(requestShowModal(data)),
        setDrawingArea: (size) => dispatch(setDrawingArea(size))
    };
};

// Wrap the component to inject dispatch and state into it
/**
 * mapStateToProps, mapDispatchToPropsをReduxと連携させる
 */
export default connect(mapStateToProps, mapDispatchToProps)(GraphicPanel);

//#region 操作ボタンSFC
/**
 * 操作ボタンセレクタ
 */
const OperationButtonGroup = ({ isEditMode, canSave, isLoading, isSelectLayout, disableDelete, onClick: handleClick }) => {
    if (isEditMode) {
        return <EditModeButtonGroup canSave={canSave} disabled={isLoading} onClick={handleClick} />
    }
    return <ViewModeButtonGroup isLoading={isLoading} isSelectLayout={isSelectLayout} disableDelete={disableDelete} onClick={handleClick} />
}

/**
 * 閲覧モードボタングループ
 */
const ViewModeButtonGroup = ({ isLoading, isSelectLayout, disableDelete, onClick: handleClick }) => (
    <div>
        <Button bsStyle="primary" className="mr-05" disabled={isLoading} onClick={handleClick.bind(this, "addLayout")}>
            <Icon className="fal fa-plus mr-05" />レイアウト追加
        </Button>
        <EditButton className="mr-05" disabled={isLoading || !isSelectLayout} onClick={handleClick.bind(this, "editLayout")} />
        <DeleteButton disabled={isLoading || !isSelectLayout || disableDelete} onClick={handleClick.bind(this, "deleteLayout")} />
    </div>
);

/**
 * 編集モードボタングループ
 */
const EditModeButtonGroup = ({ disabled, canSave, onClick: handleClick }) => (
    <div>
        <SaveButton className="mr-05" disabled={!canSave || disabled} onClick={handleClick.bind(this, "saveLayout")} />
        <CancelButton disabled={disabled} onClick={handleClick.bind(this, "cancelLayout")} />
    </div>
);
//#endregion

//#region マップ設定ボックス
/**
 * マップ設定ボックス
 */
const MapSettingBox = (props) => {
    const { show, isSnap, gridSize, maxSize, isLoading, isReadOnly, onChange: handleChange } = props;
    return (
        <GarmitBox title='マップ設定' isLoading={isLoading}>
            <div>
                <label>グリッド設定:</label>
                <InputForm>
                    <InputForm.Row>
                        <ShowSnapCol show={show} isSnap={isSnap} isReadOnly={isReadOnly} onChange={handleChange} />
                        <GridSizeCol {...props} />
                    </InputForm.Row>
                </InputForm>
            </div>
        </GarmitBox>
    );
}

/**
 * グリッドサイズ設定行
 */
const ShowSnapCol = ({ show, isSnap, isReadOnly, onChange: handleChange }) => {
    return (
        <InputForm.Col label="表示・吸着" columnCount={2} isRequired={false}>
            <span className="mr-05">
                <CheckboxSwitch
                    bsSize="md"
                    text="表示する"
                    checked={show}
                    disabled={isReadOnly}
                    onChange={handleChange.bind(this, "show")}
                />
            </span>
            <span className="mr-05" id="isSnap">
                <CheckboxSwitch
                    bsSize="md"
                    text="吸着する"
                    checked={isSnap}
                    disabled={!show || isReadOnly}
                    onChange={handleChange.bind(this, "isSnap")}
                />
            </span>
        </InputForm.Col>
    );
}

/**
 * グリッドサイズ設定行
 */
const GridSizeCol = ({ gridSize, gridSizeValidation: validation, maxSize, isReadOnly, onChange: handleChange }) => {
    let state = validation.state;
    let helpText = "";
    if (state !== "success") {
        const isRowError = validation.width.state === "success" ? false : true;
        if (isRowError) {
            helpText = "横:" + validation.width.helpText;
        }
        else {
            helpText = "縦:" + validation.height.helpText;
        }
    }
    return (
        <InputForm.Col label="間隔" columnCount={2} isRequired={false}>
            <Size2DForm
                id="gridSize"
                value={gridSize}
                onChange={handleChange.bind(this, "gridSize")}
                isReadOnly={isReadOnly}
                validationState={!isReadOnly && state}
                helpText={!isReadOnly && helpText}
            />
        </InputForm.Col>
    );
}

//#endregion