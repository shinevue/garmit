/**
 * Copyright 2017 DENSO Solutions
 * 
 * フロアマップ Reactコンポーネント
 *  
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { changeTool, Toolbar } from 'react-svg-pan-zoom';
import { ButtonGroup, ButtonToolbar, Checkbox, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { ReactSVGPanZoom } from 'react-svg-pan-zoom';

import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';

import AlarmBadge from 'Assets/FloorMap/MapLayer/AlarmBadge.jsx';
import LayoutObject from 'Assets/FloorMap/MapLayer/LayoutObject.jsx';
import RackStatus from 'Assets/FloorMap/MapLayer/RackStatus.jsx';
import EmptyRackGroup from 'Assets/FloorMap/MapLayer/EmptyRackGroup.jsx';
import DistributionBoardMap from 'Assets/FloorMap/MapLayer/DistributionBoardMap.jsx';
import KeyRackObject from 'Assets/FloorMap/MapLayer/KeyRackObject.jsx';
import CheckObjectBadge from 'Assets/FloorMap/MapLayer/CheckObjectBadge.jsx';
import KeyStatus from 'Assets/FloorMap/MapLayer/KeyStatus.jsx';
import RackStatusLegend from 'Assets/FloorMap/RackStatusLegend.jsx';
import KeyStatusLegend from 'Assets/FloorMap/KeyStatusLegend.jsx';
import { DRAW_AREA_SIZE, MAP_TRANSITION_TYPE, FLOORMAP_OPTIONS, RACK_CAPACITY_OPTIONS, BORDER_WIDTH, MINIATURE_HEIGHT, LINK_TYPE } from 'constant';
import MessageModal from 'Assets/Modal/MessageModal';

import CheckboxSwitch from 'Common/Widget/CheckboxSwitch';

/**
 * フロアマップ
 */
export default class FloorMap extends Component {

    constructor(props) {
        super(props);
        this.state = {
            activeTool: "auto",
            showTempValuePoint: false,
            selectCamera: null, //選択されているカメラのID(ME)
            canMultiSelect: props.isElecKey ? true : false,
            dragInfo: {
                isMouseDown: false,
                targetUnitId: null,
                coords: {}, 
                xDiff: 0,
                yDiff: 0
            }
        };
    }

    //#region ライフサイクルイベント
    /**********************************
    * 
    * ライフサイクルイベント
    * 
    **********************************/
    /**
     * ComponentがDOMツリーに追加された後に一度だけ呼ばれます。
     */
    componentDidMount() {
        //凡例作成エリアを挿入用のコンテナーをマウントしておく
        var container = document.createElement('g');
        container.id = "legendContainer";

        if (this.props.isElecKey) {
            var divContainer = document.createElement('div');
            divContainer.id = 'keyLegendDivContainer'
            container.appendChild(divContainer);
        }
    
        const svgAreaId = 'svgArea' + (this.props.idKey||'');
        $('#' + svgAreaId + ' > div > div:last-child')[0].appendChild(container);
    }

    /**
     * Componentが更新された後に呼ばれます。初回時には呼ばれません。
     */
    componentDidUpdate(prevProps) {
        const { floorMapOptionInfo, rackCapacityOptionInfo, isElecKey, keyStatusItems } = this.props;
        const { floorMapOptionInfo: prevFloorMapOptionInfo, rackCapacityOptionInfo: prevRackCapacityOptionInfo, isElecKey: prevIsElecKey } = prevProps;

        if (isElecKey !== undefined && prevIsElecKey !== undefined) { //電気錠画面
           this.toggleKeyStatusLegend(isElecKey, prevIsElecKey, keyStatusItems);
        }
        if (rackCapacityOptionInfo && prevRackCapacityOptionInfo) {    //ラックキャパシティ画面
            const rackCapacityId = RACK_CAPACITY_OPTIONS.rackStatus.optionId;
            const dispRackStatus = _.get(_.find(rackCapacityOptionInfo, { 'optionId': rackCapacityId }), 'check');
            const dispRackStatusBefore = _.get(_.find(prevRackCapacityOptionInfo, { 'optionId': rackCapacityId }), 'check');
            this.toggleRackStatusLegend(dispRackStatus, dispRackStatusBefore);
        }
    }

    /**
     * Propsが更新されたときに呼ばれます。
     */
    componentWillReceiveProps(nextProps) {
        if (JSON.stringify(this.props.selectLayout) != JSON.stringify(nextProps.selectLayout)
            || _.get(this.props, "selectObjectInfo.objectLinkInfo.selectedEgroup", null) !== _.get(nextProps, "selectObjectInfo.objectLinkInfo.selectedEgroup", null)) {
            this.Viewer.fitToViewer();  //レイアウト変更時は拡大縮小解除
        }
    }
    //#endregion

    //#region イベントハンドラ
    /**********************************
    * 
    * イベントハンドラ
    * 
    **********************************/

    /**
    * 空きラック選択イベントハンドラ
    */
    handleSelectEmptyRack(selectObject, groupObjects) {
        if (this.props.onSelectEmptyRack) {
            this.props.onSelectEmptyRack(selectObject, groupObjects);
        }
    }

    /**
    * レイアウトオブジェクトクリックイベントハンドラ
    * @param {object} selectObject クリックされたオブジェクト
    * @param {bool} isDouble ダブルクリックかどうか
    */
    handleClickLayoutObject(selectObject, isDouble) {
        if (this.props.onClickObject) {
            this.props.onClickObject(selectObject, isDouble)
        }
    }

    /**
    * レイアウトオブジェクトダブルクリックイベントハンドラ
    * @param {object} selectObject クリックされたオブジェクト
    */
    handleDoubleClickObject(selectObject) {
        if (this.props.onDoubleClickObject) {
            this.props.onDoubleClickObject(selectObject);
        }
    }

    /**
     * 鍵付きラッククリックイベントハンドラ
     * @param {object} selectObject クリックされたオブジェクト
     */
    handleClickKeyRackObject(selectObject) {
        if (this.props.onClickKeyRackObject) {
            this.props.onClickKeyRackObject(selectObject);
        }
    }

    /**
     * 電気錠ラックオブジェクトイベントを呼び出す
     * @param {array} selectObjects 選択オブジェクトリスト
     */
    onSelectKeyRackObjects(selectObjects) {
        if (this.props.onSelectKeyRackObjects) {
            this.props.onSelectKeyRackObjects(selectObjects);
        }
    }

    /**
    * ツール変更イベントハンドラ
    * @param {string} select 選択されたツール('auto', 'zoom-in','zoom-out'のどれか)
    */
    handleChangeTool(select) {
        this.setState({ activeTool: select });
        this.Viewer.changeTool(select);
    }

    /**
    * マップ遷移ボタンクリックイベントハンドラ
    * @param {int} type 遷移種別
    */
    handleClickMapTransition(type) {
        if (this.props.onClickMapTransition) {
            this.props.onClickMapTransition(type);
        }
    }


    /**
    * カメラクリックイベント(ME)
    */
    //handleClickCamera = (selectId) => {
    //    const selectCamera = _.find(this.props.cameraList, { 'id': selectId });
    //    this.setState({ selectCamera: selectCamera, show: true});
    //}
    //#endregion

    //#region render
    /**
     * render
     */
    render() {
        const { drawingArea, canBack, canForward, selectObjectInfo, floorMapOptionInfo, idKey } = this.props;
        const { isElecKey, elecKeyObjects, selectKeyRackObjects } = this.props;
        const { authCheckable, selectableLinkTypes } = this.props;
        const { width, height } = drawingArea;
        //const { cameraList = null } = this.props;
        //const { selectCamera, show } = this.state;    //ME
        const { activeTool, showTempValuePoint } = this.state;
        const { canMultiSelect } = this.state;
        const normalMapProps = _.pick(this.props, ["tempmapImagePath", "rackStatusObjects", "emptyRackGroupList", "selectEmptyRackGroup", "linkEgroupObjects", "selectLayout"]);
        const isEgroupMap = _.get(selectObjectInfo, "objectLinkInfo.selectedEgroup", false);
        const selectableEgroupMap = !selectableLinkTypes || selectableLinkTypes.includes(LINK_TYPE.egroup);
        return (
            <div>
                {isElecKey && elecKeyObjects && !isEgroupMap &&
                    <OptionToolBar 
                        canMultiSelect={canMultiSelect} 
                        onChangeSelectMode={() => this.setState({ canMultiSelect: !canMultiSelect })} 
                    />
                }
                <FloorMapToolBar
                    isEgroupMap={isEgroupMap}
                    canBack={canBack}
                    canForward={canForward}
                    showReferrerButton={selectableEgroupMap}
                    showTempValuePoint={showTempValuePoint}
                    onClick={(type) => this.handleClickMapTransition(type)}
                    Viewer={this.Viewer}
                />
                <div className="flex-center">
                    {drawingArea &&
                        <div id={'svgArea' + (idKey||'')} style={{ "border-style": "solid", width: width }}
                        >
                            <ReactSVGPanZoom
                                width={width - BORDER_WIDTH * 2} height={height + MINIATURE_HEIGHT}
                                background={canMultiSelect?"#ddd":"white"}
                                scaleFactorOnWheel={1.1}
                                detectAutoPan={false}
                                disableDoubleClickZoomWithToolAuto={true}
                                tool={canMultiSelect?"none":"auto"}
                                toolbarPosition="none"
                                miniaturePosition="left"
                                ref={this.setViewer}
                            >
                                <svg width={width} height={height}>
                                    <MapSVG
                                        selectObjectInfo={selectObjectInfo}
                                        normalMapProps={normalMapProps}
                                        drawingArea={drawingArea}
                                        floorMapOptionInfo={floorMapOptionInfo}
                                        authCheckable={authCheckable}
                                        isElecKey={isElecKey}
                                        elecKeyObjects={elecKeyObjects}
                                        selectKeyRackObjects={selectKeyRackObjects}
                                        //cameraList={cameraList} //ME
                                        //selectCameraId={_.get(selectCamera,"id")}
                                        canMultiSelect={canMultiSelect}
                                        selectableLinkTypes={selectableLinkTypes}
                                        onClickLayoutObject={(selectObject, isDouble) => this.handleClickLayoutObject(selectObject, isDouble)}
                                        onSelectEmptyRack={(selectObject, groupObjects) => this.handleSelectEmptyRack(selectObject, groupObjects)}
                                        onClickKeyRackObject={(selectObject) => this.handleClickKeyRackObject(selectObject)}
                                        onSelectKeyRackObjects={(selectObjects) => this.onSelectKeyRackObjects(selectObjects)}
                                        //onClickCamera={this.handleClickCamera} //ME
                                    />
                                </svg>
                            </ReactSVGPanZoom>
                        </div>
                    }
                </div>
                {/*<MessageModal bsSize="lg" title={_.get(selectCamera, 'name')} show={show} onCancel={() => this.setState({ selectCamera:null, show: false })}>
                    <div class="contents">
                        <div class="svg-wrapper">
                            <svg width="600" height="480" viewBox="0 0 600 480">
                                <image href={_.get(selectCamera, 'imagePath')} />
                            </svg>
                        </div>
                    </div>
                </MessageModal>*/}
            </div>
        );
    }
    //#endregion

    //#region その他関数
    ///**
    // * レイアウトオブジェクトから必要な情報を取り出して元オブジェクト情報生成
    // */
    //generateSourceObjects(layoutObjects) {
    //    if (!layoutObjects || layoutObjects.length === 0) {
    //        return null;
    //    }
    //    else {
    //        const sourceObjects = layoutObjects.map((object) => {
    //            return {
    //                layoutId: object.layoutId,
    //                objectId: object.objectId,
    //                position: object.position,
    //                size: object.size
    //            };
    //        })
    //        return sourceObjects;
    //    }
    //}

    /**
    * 電気錠ステータス凡例表示切替
    */
    toggleKeyStatusLegend(dispElecKey, dispElecKeyBefore, keyStatusItems) {
        if (dispElecKey) {
            //電気錠表示
            ReactDOM.render(
                <KeyStatusLegend keyStatusItems={keyStatusItems} />,
                document.getElementById('keyLegendDivContainer')
            );
        }
        else {
            //電気錠非表示
            ReactDOM.unmountComponentAtNode(document.getElementById('keyLegendDivContainer'));
        }
    }

    /**
     * ラックステータス凡例表示切替
     */
    toggleRackStatusLegend(dispRackStatus, dispRackStatusBefore) {
        if (dispRackStatus && !dispRackStatusBefore) {
            //ラックステータス表示
            ReactDOM.render(
                <RackStatusLegend rackStatusLegend={this.props.rackStatusLegend} />,
                document.getElementById('legendContainer')
            );
        }
        else if (!dispRackStatus && dispRackStatusBefore) {
            //ラックステータス非表示
            ReactDOM.unmountComponentAtNode(document.getElementById('legendContainer'));
        }
    }

    /**
     * Viewerをセットする
     * @param {object} viewer 
     */
    setViewer = (viewer) => {
        if (!this.Viewer) {
            this.Viewer = viewer;
        }
    }
    //#endregion

}

FloorMap.propTypes = {
    floorMapOptionInfo: PropTypes.array,     //マップ表示/非表示情報
    drawingArea: PropTypes.shape({          //描画領域情報
        width: PropTypes.number,
        height: PropTypes.number,
    }),
    rackStatusObjects: PropTypes.array,     //ラックステータスオブジェクト情報
    emptyRackGroupList: PropTypes.array,    //空きラックグループ一覧（二次元配列）
    selectEmptyRackGroup: PropTypes.array,   //選択中空きラックグループ
    linkEgroupObjects: PropTypes.array,     //選択中空きラックグループに紐づく分電盤情報
    backgroundImagePath: PropTypes.string,  //背景図格納先パス
    maskImagePath: PropTypes.string,        //マスク画像格納先パス
    tempmapImagePath: PropTypes.string,     //温度分布画像格納先パス
    selectLayout: PropTypes.object,         //選択レイアウト情報
    selectObjectId: PropTypes.number,       //選択オブジェクトのオブジェクトID
    rackStatusLegend: PropTypes.arrayOf({   //ラックステータス凡例
        name: PropTypes.string,
        color: PropTypes.string
    }),
    canBack: PropTypes.bool,                //戻るボタンが有効かどうか
    canForward: PropTypes.bool,             //進むボタンが有効かどうか
    authCheckable: PropTypes.bool,          //オブジェクトの権限チェック可能かどうか
    onClickObject: PropTypes.func,          //オブジェクト選択イベント関数
    onSelectEmptyRack: PropTypes.func,      //空きラック選択イベント関数
    onClickMapTransition: PropTypes.func    //マップ遷移ボタン(戻る・進む・リンク元に戻る)ボタンクリックイベント関数
};

//#region マップSFC

/**
 * マップ表示SVG
 */
const MapSVG = (props) => {
    const { normalMapProps, drawingArea, selectObjectInfo, floorMapOptionInfo, canMultiSelect, authCheckable, selectableLinkTypes } = props;
    const { onClickLayoutObject: handleClickLayoutObject, onSelectEmptyRack: handleSelectEmptyRack } = props;
    const { isElecKey, elecKeyObjects, selectKeyRackObjects, onClickKeyRackObject: handleClickKeyRackObject, onSelectKeyRackObjects: handleSelectKeyRackObjects } = props;
    //const { cameraList, selectCameraId, onClickCamera: handleClickCamera } = props;   //ME
    const eGroupObjects = _.get(selectObjectInfo, "objectLinkInfo.selectedEgroup");

    if (eGroupObjects) {
        return <EgroupMap drawingArea={drawingArea} eGroupObjects={selectObjectInfo.objectLinkInfo} />
    }
    else {
        return (
            <NormalMap
                {...normalMapProps}
                selectObjectId={_.get(selectObjectInfo, "selectObject.objectId")}
                drawingArea={drawingArea}
                floorMapOptionInfo={floorMapOptionInfo}
                authCheckable={authCheckable}
                selectableLinkTypes={selectableLinkTypes}
                isElecKey={isElecKey}
                elecKeyObjects={elecKeyObjects}
                selectKeyRackObjects={selectKeyRackObjects}
                //cameraList={cameraList}
                //selectCameraId={selectCameraId}
                canMultiSelect={canMultiSelect}
                onClickLayoutObject={(selectObject, isDouble) => handleClickLayoutObject(selectObject, isDouble)}
                onSelectEmptyRack={(selectObject, groupObjects) => handleSelectEmptyRack(selectObject, groupObjects)}
                onClickKeyRackObject={(selectObject) => handleClickKeyRackObject(selectObject)}
                onSelectKeyRackObjects={(selectObjects) => handleSelectKeyRackObjects(selectObjects)}
                //onClickCamera={handleClickCamera}
            />
        );
    }
}

/**
 * 通常マップ
 */
class NormalMap extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
            dragInfo: {
                isMouseDown: false,
                rectPoint: { x: 0, y: 0 },
                rectSize: { width: 0, height: 0 },
                coords: {}, 
                xDiff: 0,
                yDiff: 0
            }
        };
    }

    render() {
        const { drawingArea, tempmapImagePath, rackStatusObjects, selectLayout, selectObjectId, floorMapOptionInfo, authCheckable, selectableLinkTypes } = this.props;
        const { onClickLayoutObject: handleClickLayoutObject, onSelectEmptyRack: handleSelectEmptyRack } = this.props;
        const { rectPoint, rectSize } = this.state.dragInfo;
        const backgroundImageUrl = _.get(selectLayout, "backgroundImageUrl");
        const layoutObjects = _.get(selectLayout, 'layoutObjects', []);
        let emptyRackGroupProps = _.pick(this.props, ["emptyRackGroupList", "selectEmptyRackGroup", "linkEgroupObjects"]);
        emptyRackGroupProps.layoutObjects = layoutObjects;
        let tempmapOption = _.find(floorMapOptionInfo, { 'optionId': FLOORMAP_OPTIONS.tempmap.optionId });
        
        //ME
        //const { cameraList, selectCameraId, onClickCamera:handleClickCamera } = props;
    
        //電気錠
        const { isElecKey, elecKeyObjects, selectKeyRackObjects, onClickKeyRackObject: handleClickKeyRackObject } = this.props; 
        const keyRackObjects = _.get(elecKeyObjects, "keyRackObjects");
        const exceptLockStateObjects = _.get(elecKeyObjects, "exceptLockStateObjects");
    
        return (
            <svg
                width={drawingArea.width - (BORDER_WIDTH * 2)}
                height={drawingArea.height}
                viewBox={"0 0 " + DRAW_AREA_SIZE.width + " " + DRAW_AREA_SIZE.height}
                ref={element => this.mapSvg = element}
                onMouseDown={(e) => this.handleMouseDown(e)}
                onMouseMove={(e) => this.handleMouseMove(e)}
                onMouseUp={(e) => this.handleMouseUp(e)}
                onMouseLeave={() => this.handleMouseLeave()}
            >
                <ImageLayer id="tempmapImage" imagePath={tempmapImagePath} />
                <ImageLayer id="backgroundImage" imagePath={backgroundImageUrl} />
                <LayoutObjectsLayer
                    layoutObjects={layoutObjects}
                    selectObjectId={selectObjectId}
                    isTransmissive={tempmapOption && tempmapOption.check === true}
                    selectable={!isElecKey}
                    selectableLinkTypes={selectableLinkTypes}
                    authCheckable={authCheckable}
                    onClickObject={(selectObject, isDouble) => handleClickLayoutObject(selectObject, isDouble)}
                />
                <KeyRackObjectsLayer
                    keyRackObjects={keyRackObjects}
                    onClickObject={(selectObject) => handleClickKeyRackObject(selectObject)}
                />
                <KeyStatusObjectsLayer exceptLockStateObjects={exceptLockStateObjects} />
                <RackStatusLayer layoutObjects={layoutObjects} rackStatusObjects={rackStatusObjects} />
                <EmptyRackGroupLayer
                    emptyRackGroupProps={emptyRackGroupProps}
                    onSelectEmptyRack={(selectObject, groupObjects) => handleSelectEmptyRack(selectObject, groupObjects)}
                    onClickEgroup={(selectObject) => handleClickLayoutObject(selectObject, true)}
                />
                <AlarmBadgeLayer 
                    layoutObjects={layoutObjects} 
                    optionInfo={_.find(floorMapOptionInfo, { 'optionId': FLOORMAP_OPTIONS.alarm.optionId })} 
                    authCheckable={authCheckable}
                />
                <SelectKeyRackObjects selectObjects={selectKeyRackObjects} />
                {/*cameraList && <CameraObjectLayer cameraList={cameraList} selectCameraId={selectCameraId} onClick={handleClickCamera} />*/}
                <RangeSelectRectLayer position={rectPoint} size={rectSize} />
            </svg>
        );
    }
    
    //#region ドラッグ＆ドロップ

    /********************************************
     * ドラッグ＆ドロップ
     ********************************************/
    
    /**
     * SVG内でのマウスダウンイベント
     */
    handleMouseDown(e) {
        if (this.props.canMultiSelect && this.mapSvg) {
            var point = this.svgPoint(e.clientX, e.clientY);
            this.setState({
                dragInfo: Object.assign({}, this.state.dragInfo, {
                    isMouseDown: true,
                    rectPoint:{
                        x: point.x,
                        y: point.y
                    },
                    rectSize: { width: 0, height: 0 },
                    coords: {
                        x: point.x,
                        y: point.y
                    },
                    xDiff: 0,
                    yDiff: 0
                })
            });
        }
    }

    /**
     * SVG内でのマウスムーブイベント
     */
    handleMouseMove(e) {
        const { dragInfo } = this.state;
        if (dragInfo.isMouseDown) {
            var point = this.svgPoint(e.clientX, e.clientY);
            const { rectPoint, coords } = dragInfo;
            const width = (point.x - rectPoint.x > 0) ? point.x - rectPoint.x : 0;
            const height = (point.y - rectPoint.y > 0) ? point.y - rectPoint.y : 0;
            const xDiff = coords.x - point.x;
            const yDiff = coords.y - point.y;
            this.setState({
                dragInfo: Object.assign({}, dragInfo, {
                    rectSize: { width: width, height: height },
                    coords: {
                        x: point.x,
                        y: point.y
                    },
                    xDiff: xDiff,
                    yDiff: yDiff
                })
            });
        }
    }

    /**
     * SVG内でのマウスアップイベント
     */
    handleMouseUp(e) {
        const { dragInfo } = this.state;
        if (dragInfo.isMouseDown) {
            var point = this.svgPoint(e.clientX, e.clientY);
            const { rectPoint } = dragInfo;
            const width = (point.x - rectPoint.x > 0) ? point.x - rectPoint.x : 0;
            const height = (point.y - rectPoint.y > 0) ? point.y - rectPoint.y : 0;

            const { elecKeyObjects } = this.props;
            const keyRackObjects = _.get(elecKeyObjects, "keyRackObjects");
            var selectObjects = keyRackObjects ? _.cloneDeep(keyRackObjects).filter((obj) => {
                const { position, size } = obj;
                if (position.x >= rectPoint.x && 
                    position.x <= rectPoint.x + width - size.width &&
                    position.y >= rectPoint.y && 
                    position.y <= rectPoint.y + height - size.height
                    ) {
                        return true;
                } else {
                    return false
                }
            }) : [];

            if (this.props.onSelectKeyRackObjects) {
                this.props.onSelectKeyRackObjects(selectObjects);
            }
            this.resetDragInfo();
        }
    }

    /**
     * SVG領域からマウスが外れたときのイベント
     */
    handleMouseLeave() {
        if (this.state.dragInfo.isMouseDown) {
            this.resetDragInfo();
        }
    }

    /**
     * SVGポイントを取得する
     * @param {number} x スクリーン上の位置X
     * @param {number} y スクリーン上の位置Y
     */
    svgPoint(x, y) {
        var point = this.mapSvg.createSVGPoint();      
        point.x = x;
        point.y = y;      
        return point.matrixTransform(this.mapSvg.getScreenCTM().inverse());
    }

    /**
     * ドラッグ情報をリセットする
     */
    resetDragInfo() {
        this.setState({
            dragInfo: {
                isMouseDown: false,
                rectPoint: { x: 0, y: 0 },
                rectSize: { width: 0, height: 0 },
                coords: {}, 
                xDiff: 0,
                yDiff: 0
            }
        });
    }

    //#endregion
}

/**
 * 分電盤マップ
 */
const EgroupMap = ({ drawingArea, eGroupObjects }) => {
    const { selectedEgroup, measuredValues } = eGroupObjects;
    if (selectedEgroup) {
        return (
            <svg
                width={drawingArea.width - (BORDER_WIDTH * 2)}
                height={drawingArea.height}
                viewBox={"0 0 " + DRAW_AREA_SIZE.width + " " + DRAW_AREA_SIZE.height}>
                <DistributionBoardMap
                    eGroupInfo={_.get(eGroupObjects, "selectedEgroup")}
                    valueLabelData={_.get(eGroupObjects, "measuredValues")}
                    size={{ width: DRAW_AREA_SIZE.width, height: DRAW_AREA_SIZE.height }}
                />
            </svg>
        );
    }
    
}
//#endregion

//#region レイヤSFC
/**
 * 画像表示レイヤ
 * @param {string} id グループのID
 * @param {string} imagePath 画像の格納先
 */
export const ImageLayer = ({ id, imagePath }) => {
    //キャッシュを無効にするためにクエリに日付を付ける
    return (
        <g id={id}>
            {imagePath ?
                <image width={DRAW_AREA_SIZE.width} height={DRAW_AREA_SIZE.height} xlinkHref={imagePath + "?" + Date.now()} />
                :
                <rect width={DRAW_AREA_SIZE.width} height={DRAW_AREA_SIZE.height} fill="transparent" />   
            }
        </g>
    );
}

/**
 * レイアウトクオブジェクトレイヤ
 */
export const LayoutObjectsLayer = ({ layoutObjects, selectObjectId, isTransmissive, selectable, selectableLinkTypes, authCheckable, onClickObject: handleClickLayoutObject }) => {
    if (layoutObjects) {
        return (
            <LayoutObject
                layoutObjects={layoutObjects}
                selectObjectId={selectObjectId}
                isTransmissive={isTransmissive}
                selectable={selectable}
                selectableLinkTypes={selectableLinkTypes}
                authCheckable={authCheckable}
                onClickObject={(selectObject, isDouble) => handleClickLayoutObject(selectObject, isDouble)}
            />
        );
    }
    return <div />
}

/**
* 電気錠付きラックオブジェクトレイヤ
*/
const KeyRackObjectsLayer = ({ keyRackObjects, onClickObject: handleClickKeyRackObject }) => {
   if (keyRackObjects) {
       return (
           <KeyRackObject
               layoutObjects={keyRackObjects}
               selectable={true}
               onClickObject={(selectObject) => handleClickKeyRackObject(selectObject)}
           />
       );
   }
   return <div />
}

/**
* 電気錠付きラック選択オブジェクトレイヤ
*/
const SelectKeyRackObjects = ({ selectObjects }) => {
    const checkObjects = selectObjects && _.cloneDeep(selectObjects)
    return <CheckObjectBadge checkObjects={checkObjects} />
}

/**
* 施錠以外キー状態オブジェクトレイヤ
*/
const KeyStatusObjectsLayer = ({ exceptLockStateObjects }) => {
    return (
        <KeyStatus exceptLockStateObjects={exceptLockStateObjects} />
   );
}

/**
 * ラックステータスレイヤ
 */
const RackStatusLayer = ({ layoutObjects, rackStatusObjects }) => {
    if (layoutObjects && rackStatusObjects) {
        return (
            <RackStatus
                layoutObjects={layoutObjects}
                rackStatusInfo={rackStatusObjects}
            />
        );
    }
    return <div />
}

/**
 * 空きラックグループレイヤ
 */
const EmptyRackGroupLayer = (props) => {
    const { emptyRackGroupProps } = props;
    const { onSelectEmptyRack: handleSelectEmptyRack, onClickEgroup: handleClickLayoutObject } = props;
    if (_.size(_.get(emptyRackGroupProps, "layoutObjects")) > 0 && _.size(_.get(emptyRackGroupProps, "emptyRackGroupList")) > 0) {
        return (
            <EmptyRackGroup
                {...emptyRackGroupProps}
                onSelectEmptyRack={(selectObject, groupObjects) => handleSelectEmptyRack(selectObject, groupObjects)}
                onClickEgroup={(selectObject) => handleClickLayoutObject(selectObject)}
            />
        );
    }
    return <div />
}

/**
 * アラームバッチレイヤ
 */
export const AlarmBadgeLayer = ({ layoutObjects, optionInfo, authCheckable }) => {
    const alarmObjects = _.filter(layoutObjects, (obj) => {
        const isAllowed = !authCheckable || obj.isAllowed;      //アラームバッチを表示するかどうか
        return isAllowed && (obj.alarmFlg || obj.errorFlg);     //アラームが発生しているオブジェクトのみに絞る
    })
    return (
        <AlarmBadge alarmObjects={alarmObjects} show={_.get(optionInfo, 'check')} />
    );
}

/**
 * カメラオブジェクトレイヤ
 */
export const CameraObjectLayer = ({ cameraList, selectCameraId, onClick:handleClick }) => {
    return (
        <g id="cameraLayer">
            {cameraList.map((camera) => {
                return (
                    <CameraSvgObject
                        x={camera.position.x}
                        y={camera.position.y}
                        rotate={camera.rotate}
                        selected={camera.id === selectCameraId}
                        onClick={handleClick && handleClick.bind(this, camera.id)}
                    />
                );
            })
            }
        </g>
    );
}

/**
 * カメラオブジェクト
 */
const CameraSvgObject = ({ x, y, rotate, selected, onClick: handleClick  }) => {
    const height = 40;
    const width = 40;
    const href = "./Content/image/" + (selected ? "camera_select.svg" : "camera.svg");
    return (
        <g transform={"rotate(" + rotate + "," + (x + height / 2) + "," + (y + width / 2) + ")"}>
            <image x={x} y={y} height={height} width={width} href={href} onClick={handleClick} />
        </g>
    );
}

/**
 * 範囲選択オブジェクトレイヤ
 */
const RangeSelectRectLayer = ({ position, size }) => {
    return (
        <g id="rangeSelectRect" transform={"translate(" + (position.x + 3 * 0.5) + "," + (position.y + 3 * 0.5) + ")"}>
            <rect 
                width={size.width} 
                height={size.height} 
                fill="rgba(87,179,249,0.5)" 
                stroke="#000000" 
                stroke-width="1" 
                stroke-dasharray="3" 
                x={0} 
                y={0} 
            />
        </g>
    );
}

//#endregion

//#regionマップツールバーSFC

/**
 * フロアマップツールバー
 */
const FloorMapToolBar = ({ isEgroupMap, canBack, canForward, showReferrerButton, Viewer, onClick: handleClick }) => {
    return (
        <div className="flex-between-end">
            <TransitionButtonGroup
                isEgroupMap={isEgroupMap}
                canBack={canBack}
                canForward={canForward}
                showReferrerButton={showReferrerButton}
                onClick={(type) => handleClick(type)}
            />
            <FloorMapToolButtonGroup Viewer={Viewer} />
        </div>
    );
}

/**
 * 画面遷移ボタングループ
 */
const TransitionButtonGroup = ({ isEgroupMap, canBack, canForward, showReferrerButton, onClick: handleClick }) => {
    return (
        <ButtonToolbar>
            {showReferrerButton&&
                <OverlayTrigger placement="bottom" overlay={isEgroupMap ? <Tooltip>リンク元レイアウトに戻る</Tooltip> : <div />}>
                    <Button bsStyle="primary" disabled={!isEgroupMap} onClick={() => handleClick(MAP_TRANSITION_TYPE.referrer)} >
                        <Icon className="fal fa-clone" />
                    </Button>
                </OverlayTrigger>
            }
            <BackForwardButton
                disabled={isEgroupMap}
                canBack={canBack}
                canForward={canForward}
                onClick={(type) => handleClick(type)}
            />
        </ButtonToolbar >
    );
}

/**
 * マップツールボタングループ
 */
export const FloorMapToolButtonGroup = ({ Viewer }) => {
    return (
        <ButtonToolbar>
            <ButtonGroup>
                <Button onClick={() => Viewer.zoomOnViewerCenter(1.1)} >
                    <Icon className="fal fa-search-plus" />
                </Button>
                <Button onClick={() => Viewer.zoomOnViewerCenter(0.9)}>
                    <Icon className="fal fa-search-minus" />
                </Button>
            </ButtonGroup>
            <ButtonGroup>
                <Button onClick={() => Viewer.fitToViewer()}>
                    <Icon className="fal fa-arrows-alt" />
                </Button>
            </ButtonGroup>
        </ButtonToolbar>
    );
}

/**
 * フロアマップ戻る・進むボタングループ
 */
export const BackForwardButton = (props) => (
    <ButtonGroup>
        <Button bsStyle="primary" disabled={props.disabled ? props.disabled : !props.canBack} onClick={() => props.onClick(MAP_TRANSITION_TYPE.back)} >
            <Icon className="fal fa-arrow-left" />
        </Button>
        <Button bsStyle="primary" disabled={props.disabled ? props.disabled : !props.canForward} onClick={() => props.onClick(MAP_TRANSITION_TYPE.forward)}>
            <Icon className="fal fa-arrow-right" />
        </Button>
    </ButtonGroup>
)

//#endregion

//#region オプションツールバー

/**
 * オプションツールバー
 */
const OptionToolBar = ({ canMultiSelect, onChangeSelectMode: handleChangeSelectMode }) => {
    return (
        <div className="mb-05">
            <CheckboxSwitch text="複数選択" checked={canMultiSelect} bsSize="sm" onChange={() => handleChangeSelectMode()} />
        </div>
    );
}

//#endregion