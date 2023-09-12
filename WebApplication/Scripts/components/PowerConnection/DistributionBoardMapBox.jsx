/**
 * @license Copyright 2018 DENSO
 * 
 * 分電盤図表示ボックスコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import DistributionBoardMap from 'Assets/FloorMap/MapLayer/DistributionBoardMap';
import RectObject from 'Assets/FloorMap/Object/RectObjectGroup/RectObject';
import GarmitBox from 'Assets/GarmitBox';

const BLUE = false; //青（左側選択とみなす isRight = false）
const RED = true    //赤(右側選択とみなす isRight = true)
/**
 * 分電盤図表示ボックスビューコンポーネント
 */
export default class DistributionBoardMapBox extends Component {

    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        this.state = {
            nextSelect: BLUE    //ブレーカーが1列の場合の次回選択判定用
        }
    }

    /**
     * ブレーカー選択イベント
     */
    handleClickBreaker(selectObject, selectItemInfo) {
        if (this.props.onClickBreakerObject) {
            //未選択の場合のみ親に伝える
            if (selectItemInfo.breakerNo !== _.get(this.props.leftBreaker, "breakerNo") && selectItemInfo.breakerNo !== _.get(this.props.rightBreaker, "breakerNo")) {
                //位置が半分より右側か左側かを判定する
                const isRight = this.isRightObject(selectObject);
                this.props.onClickBreakerObject(isRight, selectObject, selectItemInfo);
            }
        }
    }

    /**
     * render
     */
    render() {
        const { selectedEgroup, isLoading, originalSize, displaySize, valueLabelData, leftBreaker, rightBreaker } = this.props;
        const egroupName = selectedEgroup ? selectedEgroup.egroupName : "未選択";
        return (
            <GarmitBox
                isLoading={isLoading}
                title={"電源系統図：【" + egroupName + "】"}
            >
                {selectedEgroup && selectedEgroup.egroupId !== -1 &&
                    <div id="elecDrawBoxBody">
                        <div id="svgArea" style={{ "background-color": "#f7f7f7" }} className="flex-center">
                            <svg
                                width={displaySize.width}
                                height={displaySize.height}
                                viewBox={"0 0 " + originalSize.width + " " + originalSize.height}>>
                                {selectedEgroup &&
                                    <DistributionBoardMap
                                        ref="egroupMap"
                                        isBreakerSelectable={true}
                                        eGroupInfo={selectedEgroup}
                                        valueLabelData={valueLabelData}
                                        size={{ width: originalSize.width, height: originalSize.height }}
                                        onClickBreakerObject={(selectObject, selectItemInfo) => this.handleClickBreaker(selectObject, selectItemInfo)}
                                    />
                                }
                                {leftBreaker && this.makeSelectObject(leftBreaker.selectedObject, "left")}                                                  }
                                {rightBreaker && this.makeSelectObject(rightBreaker.selectedObject, "right")}
                            </svg>
                        </div>
                    </div>
                }
            </GarmitBox>
        );
    }

    /**
     * 選択中オブジェクトの枠を作成する
     * @param {object} selectRect クリックされたオブジェクト情報
     * @param {string} position right/left
     */
    makeSelectObject(selectRect, position) {
        var object = "";
        if (selectRect) {
            return (
                <RectObject
                    id={position}
                    position={selectRect.position}
                    size={selectRect.size}
                    isTransmissive={true}
                    selectable={false}
                    isThrough={true}
                    className={position === "right" ? "select-breaker-right" : "select-breaker-left"}
                />
            );
        }

    }

    /**
     * 選択されたオブジェクトが半分より右側どうかを判定する
     * @param {object} selectObject クリックされたオブジェクト情報
     */
    isRightObject(selectObject) {
        if (this.refs.egroupMap.state.breakerTableSize.col === 1) {   //一列の場合
            const isRight = this.state.nextSelect;
            this.setState({ nextSelect: !isRight });    //次回選択色変更
            return isRight;
        }
        else if (Number(selectObject.position.x) > this.props.originalSize.width / 2) {
            return true;
        }
        else {
            return false;
        }
    }
}

DistributionBoardMapBox.propTypes = {
    selectedEgroup: PropTypes.object,
    valueLabelData: PropTypes.array,
    leftBreaker: PropTypes.object,
    rightBreaker: PropTypes.object,
    originalSize: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number
    }),
    displaySize: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number
    }),
    isLoading: PropTypes.bool,
    onClickBreakerObject: PropTypes.func
}