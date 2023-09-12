/**
 * Copyright 2017 DENSO Solutions
 * 
 * ラックステータス表示（キャパシティ）レイヤ Reactコンポーネント
 *  
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import RectObjectGroup from 'Assets/FloorMap/Object/RectObjectGroup/RectObjectGroup.jsx';
import { LINK_TYPE } from 'constant';

/**
 * ラックステータス表示（キャパシティ）レイヤ
 * キャパシティ画面では更新がないためレイアウトオブジェクト情報はレイアウト選択時に取得したままとなる。
 * 位置が変更された場合、後で取得したラックステータス情報とずれが生じるため、
 * 位置情報はレイアウトオブジェクトの情報を使用する
 */
export default class RackStatus extends Component {

    constructor(props) {
        super(props);
        this.state = {
            rackStatusObjects: this.generateStatusObjects(this.props.rackStatusInfo, this.props.layoutObjects)
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
        if (JSON.stringify(this.props.rackStatusInfo) !== JSON.stringify(nextProps.rackStatusInfo)) {
            //アラーム発生中オブジェクト情報更新
            this.updateStatusObjects(nextProps.rackStatusInfo, nextProps.layoutObjects);
        }
    }

    /**
     * コンポーネントをアップデートするかどうか
     */
    shouldComponentUpdate(nextProps, nextState) {
        //異なるインスタンスでも中身が同じであればアップデートしない
        var prevDataJSON = JSON.stringify(nextProps);
        var dataJSON = JSON.stringify(this.props);

        if (prevDataJSON !== dataJSON) {
            return true;
        }
    }

    /**
     * render
     */
    render() {
        const { rackStatusObjects } = this.state;
        return (
            <g id="rackStatus">
                {rackStatusObjects &&
                    rackStatusObjects.map((object, index) => {
                        return <RectObjectGroup
                            id={"rackStatus" + object.layoutId + "-" + object.objectId}
                            className="normal-object"
                            {...object}
                            isTransmissive={false}
                            selectable={false}
                            isThrough={false}
                        />
                    })
                }
            </g>
        );
    }

    /**
     * 新たに受け取った発生中アラームオブジェクト情報を更新する
     * @param {array} rackStatusInfo 新たに受け取ったラックステータス情報
     * @param {array} sourceObjects レイアウトの全オブジェクト情報
     */
    updateStatusObjects(rackStatusInfo, sourceObjects) {
        this.setState({ rackStatusObjects: this.generateStatusObjects(rackStatusInfo, sourceObjects) });
    }

    /**
     * 新たに受け取った発生中アラームオブジェクト情報を生成する
     * @param {array} rackStatusInfo 新たに受け取ったラックステータス情報
     * @param {array} sourceObjects レイアウトの全オブジェクト情報
     */
    generateStatusObjects(rackStatusInfo, sourceObjects) {
        let update = [];
        for (let i = 0; rackStatusInfo.length > i; i++) {
            const match = this.findMatchData(sourceObjects, rackStatusInfo[i])
            if (match) {
                match.backColor = rackStatusInfo[i].backColor;
                update.push(match);
            }
            //一致するデータがない場合は追加しない
        }
        return update;
    }

    /**
     * 配列の中から一致するデータを探し出す
     * @param {array} sourceObjects
     * @param {object} update 
     */
    findMatchData(sourceObjects, update) {
        var match = sourceObjects.find((obj) => {
            return obj.layoutId === update.layoutId && obj.objectId === update.objectId;
        })
        return match ? _.cloneDeep(match) : match;
    }
}

RackStatus.propTypes = {
    layoutObjects: PropTypes.object,
    rackStatusObjects: PropTypes.object
};


