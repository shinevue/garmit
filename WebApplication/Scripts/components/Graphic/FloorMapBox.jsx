/**
 * Copyright 2017 DENSO Solutions
 * 
 * フロアマップボックス Reactコンポーネント
 *  
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { ReactSVGPanZoom } from 'react-svg-pan-zoom';
import { DRAW_AREA_SIZE, BORDER_WIDTH } from 'constant';

import { SelectClearButton } from 'Assets/GarmitButton';
import GarmitBox from 'Assets/GarmitBox';
import { ImageLayer, FloorMapToolButtonGroup, BackForwardButton } from 'Assets/FloorMap/FloorMap';

import MaintenanceObject from 'Graphic/MaintenanceObject';


/**
 * フロアマップボックス
 */
export default class FloorMapBox extends Component {

    constructor() {
        super();
        this.state = {
        };
    }

    /**
     * 選択レイアウトが変更されたらViewerリセット
     */
    componentWillReceiveProps(nextProps) {
        if (_.get(this.props.selectLayout, "layoutId") !== _.get(nextProps.selectLayout, "layoutId")) {
            if (this.Viewer) {
                this.Viewer.reset();
            }
        }
    }

    /**
     * 戻る・進むボタンクリックイベント
     */
    handleClickMapButton = (type) => {
        if (this.props.onClickMapButton) {
            this.props.onClickMapButton(type)
        }
    }

    /**
     * レイアウトオブジェクトクリック・移動・リサイズイベント
     */
    handleChangeMapObject = (changeInfo) => {
        if (this.props.onChangeMapObject) {
            this.props.onChangeMapObject(changeInfo);
        }
    }

    /**
     * 選択解除ボタンクリッククリックイベント
     */
    handleClickClear = () => {
        if (this.props.onClickClear) {
            this.props.onClickClear();
        }
    }

    /**
     * render
     */
    render() {
        const { isReadOnly, isLoading, isEditMode, selectLayout } = this.props;
        const { canBack, canForward, selectObjectsIdList, mapSetting, drawingArea, layoutObjects, backgroundUrl } =this.props;
        const isShowMap = isEditMode || selectLayout ? true : false;
        const isShowGridLine = isEditMode && _.get(mapSetting, "show") && mapSetting.gridSize && _.get(mapSetting.gridSizeValidation, "state") === "success";
        return (
            <GarmitBox title='フロアマップ' isLoading={isLoading}>
                <div id="floorMapBoxBody">
                    {isShowMap &&
                        <div>
                            <MapButtonGroup isReadOnly={isReadOnly} canBack={canBack} canForward={canForward} Viewer={this.Viewer} onClick={this.handleClickMapButton} />
                            <div className="flex-center" style={{ "border-style": "solid", width: drawingArea.width }}>
                                <ReactSVGPanZoom
                                    width={drawingArea.width - BORDER_WIDTH * 2} height={drawingArea.height}
                                    background="white"
                                    scaleFactorOnWheel={1.1}
                                    detectAutoPan={false}
                                    disableDoubleClickZoomWithToolAuto={true}
                                    tool="none"
                                    toolbarPosition="none"
                                    miniaturePosition="none"
                                    ref={Viewer => this.Viewer = Viewer}
                                >
                                    <svg width={drawingArea.width} height={drawingArea.height}>
                                        <svg
                                            id="drawing"
                                            width={drawingArea.width - (BORDER_WIDTH * 2)}
                                            height={drawingArea.height}
                                            viewBox={"0 0 " + DRAW_AREA_SIZE.width + " " + DRAW_AREA_SIZE.height}
                                        >
                                            <rect id="grid" width="100%" height="100%" fill={isShowGridLine?"url(#gridLine)":"white"} />
                                            <GridLine
                                                show={isShowGridLine}
                                                gridSize={mapSetting.gridSize}
                                            />
                                            <BackgroundImage url={backgroundUrl} size={DRAW_AREA_SIZE} />
                                            <MaintenanceObjectLayer
                                                mapSetting={mapSetting}
                                                selectObjectsIdList={selectObjectsIdList}
                                                layoutObjects={layoutObjects}
                                                isEditMode={isEditMode}
                                                onChangeMapObject={this.handleChangeMapObject}
                                            />
                                        </svg>
                                    </svg>
                                </ReactSVGPanZoom>
                            </div>
                        </div>
                    }
                    {isShowMap && !isReadOnly && <SelectClearButton className="mt-05 pull-right" disabled={!isEditMode} onClick={this.handleClickClear} />}
                </div>
            </GarmitBox>
        );
    }
}

FloorMapBox.propTypes = {
    isReadOnly: PropTypes.bool,
    selectLayout: PropTypes.object,
    canBack: PropTypes.bool,
    canForward: PropTypes.bool,
    selectObjectsIdList: PropTypes.array,
    mapSetting: PropTypes.object,
    drawingArea: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number
    }),
    isLoading: PropTypes.bool,
    isEditMode: PropTypes.bool,
    backgroundUrl: PropTypes.string,
    layoutObjects: PropTypes.array,
    onClickClear: PropTypes.func,
    onChangeMapObject: PropTypes.func,
    onClickMapButton:PropTypes.func
};

/**
 * グリッド
 */
const GridLine = ({ show, gridSize }) => {
    return (
        <defs>
            {show &&
                <pattern id="gridLine" x={0} y={0} width={(gridSize.width || DRAW_AREA_SIZE.width)} height={(gridSize.height || DRAW_AREA_SIZE.height)} patternUnits="userSpaceOnUse" >
                    <line x1={(gridSize.width || 0)} y1={0} x2={(gridSize.width || 0)} y2={(gridSize.height || DRAW_AREA_SIZE.height)} stroke="black" strokeWidth={0.3} />
                    {gridSize.height && <line x1={0} y1={0} x2={DRAW_AREA_SIZE.width} y2={0} stroke="black" strokeWidth={0.3} />}
                    {gridSize.height && <line x1={0} y1={(gridSize.height || 0)} x2={(gridSize.width || DRAW_AREA_SIZE.width)} y2={(gridSize.height || 0)} stroke="black" strokeWidth={0.3} />}
                    {gridSize.width && <line x1={0} y1={0} x2={0} y2={DRAW_AREA_SIZE.height} stroke="black" strokeWidth={0.3} />}
                </pattern>
            }
        </defs>
    );
}

/**
 * 背景図
 */
const BackgroundImage = ({ url, size }) => {
    if (url) {
        return <image {...size} href={url} />
    }
    return <div />
}

/**
 * マップボタングループ
 */
const MapButtonGroup = ({ isReadOnly, canBack, canForward, Viewer, onClick: handleClick }) => {
    return (
        <div className="flex-center-end">
            {!isReadOnly ?
                <BackForwardButton
                    canBack={canBack}
                    canForward={canForward}
                    Viewer={Viewer}
                    onClick={handleClick}
                />
                : <div />
            }
            <FloorMapToolButtonGroup Viewer={Viewer} />
        </div>
    );
}

/**
 * メンテナンスオブジェクトレイヤ
 */
const MaintenanceObjectLayer = ({ mapSetting, selectObjectsIdList, layoutObjects, isEditMode, onClick: handleClick, onChangeMapObject: handleChangeMapObject }) => {
    if (layoutObjects.length >0) {
        return (
            <g id="maintenanceObject">
                {layoutObjects.map((object) => {
                    return (
                        <MaintenanceObject
                            mapSetting={mapSetting}
                            objectInfo={object}
                            isEditMode={isEditMode}
                            isSelect={_.includes(selectObjectsIdList, object.objectId)}
                            isFirstSelect={selectObjectsIdList[0] === object.objectId}
                            onChangeMapObject={handleChangeMapObject}
                        />
                    );
                })
                }
            </g>
        );
    }
    return <div />
}
