/**
 * @license Copyright 2019 DENSO
 * 
 * 電気錠ステータス（LOCK以外）レイヤ Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import RectObject from 'Assets/FloorMap/Object/RectObjectGroup/RectObject.jsx';

/**
 * 電気錠ステータス（LOCK以外）レイヤ
 * @param {array} exceptLockStateObjects 電気錠（LOCK以外）のオブジェクト
 */
export default class KeyStatus extends Component {
    
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
        const { exceptLockStateObjects } = this.props;
        return (
            <g id="keyStatus">
                {exceptLockStateObjects&&exceptLockStateObjects.length>0&&
                    exceptLockStateObjects.map((obj) => {
                        return <KeyStatusObject {...obj} />
                    })
                }
            </g>
        );
    }
}

KeyStatus.propTypes = {
    exceptLockStateObjects: PropTypes.array
};

/**
 * 電気錠状態オブジェクト
 */
const KeyStatusObject = ({ layoutId, objectId, position, size, backColor, borderColor, border }) => {
    return (
        <RectObject
            id={"keyStatus" + layoutId + "-" + objectId}
            className="key-status-object"
            position={{ x: position.x + 0.5, y: position.y + 0.5}}
            size={size}
            backColor={backColor}
            borderColor={borderColor}
            border={border}
            selectable={false}
            isThrough={true}
        />
    );
 }