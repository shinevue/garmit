/**
 * @license Copyright 2019 DENSO
 * 
 * 電気錠付きラックオブジェクトレイヤ Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';

import RectObjectGroup from 'Assets/FloorMap/Object/RectObjectGroup/RectObjectGroup.jsx';
import { OBJECT_TYPE } from 'constant';

/**
 * 電気錠付きラックオブジェクトレイヤコンポーネント
 * @param {object} layoutObject 電気錠付きレイアウトオブジェクト情報
 * @param {bool} isTransmissive オブジェクトを透過するかどうか
 */
export default class KeyRackObject extends Component {
    
    /**********************************
    * 
    * ライフサイクルイベント
    * 
    **********************************/

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

    /**********************************
    * 
    * イベントハンドラ
    * 
    **********************************/

    /**
     * オブジェクトクリックイベント
     */
    handleClickObject(object, isDouble) {
        if (!isDouble) {
            //選択したオブジェクトを最前面に移動（枠を太くした場合に他のオブジェクトと重なるため）
            var g = document.getElementById(object.objectId);
            svgz_element(g).toTop();
        }
        
        if (this.props.onClickObject) {
            this.props.onClickObject(object, isDouble);
        }
    }

    /**
     * ダブルオブジェクトクリックイベント
     */
    handleDoubleClickObject(object) {
        if (this.props.onDoubleClickObject) {
            this.props.onDoubleClickObject(object);
        }
    }

    /**
     * render
     */
    render() {
        const { layoutObjects, isTransmissive, selectable } = this.props;

        return (
            <g id="keyRackObject">
                {layoutObjects &&
                    layoutObjects.map((object, index) => {
                        let className = "normal-object";
                        let textObjectClassName = "";
                        if (object.objectType === OBJECT_TYPE.valueLabel) {
                            textObjectClassName = object.foreColor;
                        }
                        return <RectObjectGroup
                                    id={object.objectId}
                                    className={className}
                                    textObjectClassName={textObjectClassName}
                                    isTransmissive={isTransmissive}
                                    selectable={selectable}
                                    {...object}
                                    onClickObject={(isDouble) => this.handleClickObject(object, isDouble)}
                               />
                    })
                }
            </g>
        );
    }

}

KeyRackObject.propTypes = {
    layoutObjects: PropTypes.array,     //レイアウトオブジェクト情報
    isTransmissive: PropTypes.bool,     //オブジェクトを透過させるかどうか
    handleClickObject:PropTypes.func    //オブジェクトクリックイベント関数
};

KeyRackObject.defaultProps = { selectable: true };