/**
 * Copyright 2017 DENSO Solutions
 * 
 * 四角形オブジェクトグループ Reactコンポーネント
 *  
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import TextObject from 'Assets/FloorMap/Object/RectObjectGroup/TextObject.jsx';
import ImageObject from 'Assets/FloorMap/Object/RectObjectGroup/ImageObject.jsx';
import RectObject from 'Assets/FloorMap/Object/RectObjectGroup/RectObject.jsx';
import { OBJECT_TYPE } from 'graphicUtility';

const FRAME_BORDER_WIDTH = 2;

/**
 * 四角形オブジェクトグループ
 * <RectObjectGroup />
 * @param {string} id
 * @param {string} className
 * @param {string} position
 * @param {string} size
 * @param {bool} isTransmissive オブジェクトを透過するかどうか
 * @param {string} backColor
 * @param {string} foreColor
 * @param {string} displayText
 * @param {bool} selectable
 * @param {number} linkType オブジェクトのリンク種別
 */
export default class RectObjectGroup extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    /**
     * オブジェクトクリックイベントハンドラ
     */
    handleClickObject = (isDouble, isRight, e) => {
        if (this.props.onClickObject) {
            this.props.onClickObject(isDouble, isRight);
        }
        e && e.preventDefault();
    }


    /**
     * render
     */
    render() {
        const { id, groupClassName, isTransmissive, className, position, size, backColor, foreColor, fontSize, displayText, border, selectable, linkType, backgroundImageUrl, textObjectClassName, showFrame, frameColor, objectType } = this.props;

        return (
            <g id={id}
                transform={"translate(" + (position.x + border * 0.5) + "," + (position.y + border * 0.5) + ")"}
                className={groupClassName}
                onClick={selectable&&this.handleClickObject.bind(this, false, false)}
                onDoubleClick={selectable&&this.handleClickObject.bind(this, true, false)}
                onContextMenu={this.handleClickObject.bind(this, false, true)}
            >
                <RectObject {...this.props} isTransmissive={isTransmissive} position={{ x: 0, y: 0 }} />
                {objectType === OBJECT_TYPE.picture && backgroundImageUrl &&
                    <ImageObject class="selectable-object" position={{ x: 0, y: 0 }} size={size} backgroundImagePath={backgroundImageUrl} />
                }
                {displayText &&
                    <TextObject className={textObjectClassName} position={{ x: 0, y: 0 }} size={size} fontColor={foreColor} fontSize={fontSize} text={displayText} index={id} />
                }
                {showFrame &&
                    <RectObject
                        id={"flame-" + id}
                        position={{ x: -(border / 2 + FRAME_BORDER_WIDTH / 2), y: -(border / 2 + FRAME_BORDER_WIDTH / 2) }}
                        size={{ width: size.width + border + FRAME_BORDER_WIDTH, height: size.height + border + FRAME_BORDER_WIDTH }}
                        backColor="transparent"
                        borderColor={frameColor}
                        border={FRAME_BORDER_WIDTH}
                        selectable={false}
                        isThrough={true}
                    />
                }
            </g>
        );
    }
}

RectObjectGroup.propTypes = {
    id: PropTypes.string,
    groupClassName: PropTypes.string,   //gタグに指定するクラス名称
    isTransmissive: PropTypes.bool, //オブジェクトを透過するかどうか
    className: PropTypes.string,
    position: PropTypes.string,
    size: PropTypes.string,
    backColor: PropTypes.string,
    foreColor: PropTypes.string,
    fontSize: PropTypes.number,
    displayText: PropTypes.string,
    border: PropTypes.number,
    selectable: PropTypes.bool,
    popoverInfo: PropTypes.obj, //ポップオーバーを表示する場合、ポップオーバー情報
    tooltip: PropTypes.string,  //ツールチップを表示する場合、表示する文字列
    linkType: PropTypes.number,
    backgroundImage: PropTypes.string,
    textObjectClassName: PropTypes.string,  //textタグに指定するクラス名称
    showFrame: PropTypes.bool,      //枠を表示するか
    frameColor: PropTypes.string,    //枠の色
    onClickObject: PropTypes.func
};
RectObjectGroup.defaultProps = { border: 0.5 };