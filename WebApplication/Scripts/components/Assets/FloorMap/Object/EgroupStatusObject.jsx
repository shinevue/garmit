/**
 * Copyright 2017 DENSO Solutions
 * 
 * 分電盤状態のオブジェクト（マウスオーバーで計測値・定格値表示）
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import RectObjectGroup from 'Assets/FloorMap/Object/RectObjectGroup/RectObjectGroup.jsx';
import EGroupPopoverContent from 'Assets/FloorMap//EGroupPopoverContent.jsx';


/**
 * 分電盤状態のオブジェクト（マウスオーバーで計測値・定格値表示）
 * @param {array} egroupObjects 空きラックオブジェクトの配列
 */
export default class EgroupStatusObject extends Component {

    constructor(props) {
        super(props);
        this.state = {
            egroupObjects:this.props.egroupObjects
        };
    }

    /**********************************
    * 
    * ライフサイクルイベント
    * 
    **********************************/

    /**
     * Propsが更新されたときに呼ばれます。
     */
    componentWillReceiveProps(nextProps) {
        if (JSON.stringify(this.props.egroupObjects) !== JSON.stringify(nextProps.egroupObjects)) {
            //電源系統オブジェクト情報が変更されている場合
            this.setState({ egroupObjects: nextProps.egroupObjects });
        }
    }

    /**
     * コンポーネントをアップデートするかどうか
     */
    shouldComponentUpdate(nextProps, nextState) {
        if (JSON.stringify(this.state.egroupObjects) !== JSON.stringify(nextState.egroupObjects)){
            //分電盤情報が変更された場合
            return true;
        }
    }

    /**********************************
    * 
    * イベントハンドラ
    * 
    **********************************/

    /**
    * 電源系統オブジェクト選択イベント
    * @param {object} selectObject　選択したオブジェクト
    */
    handleClickEgroup(selectObject) {
        if (this.props.onClickEgroup) {
            this.props.onClickEgroup(selectObject);
        }
    }

    /**
     * render
     */
    render() {
        const { egroupObjects } = this.state;
        const newObject = $.extend(true, [], egroupObjects);
        return newObject.map((object, index) => {
            const popoverInfo = object.egroup;
            return (
                <RectObjectGroup
                    id={"egroupStatus" + object.layoutId + "-" + object.objectId}
                    className="normal-object"
                    {...object}
                    backColor="red"
                    selectable={true}
                    popoverInfo={{
                        component: EGroupPopoverContent,
                        name: popoverInfo.egroupName,
                        rating: popoverInfo.ratedCurrent,
                        value: popoverInfo.monitoredBreakerCurrentTotal
                    }}
                    onClickObject={(isDouble) => isDouble && this.handleClickEgroup(object)}
                />
            );
        })
    }
}

EgroupStatusObject.propTypes = {
    egroupObjects: PropTypes.array,
    onClickEgroup:PropTypes.func
};

