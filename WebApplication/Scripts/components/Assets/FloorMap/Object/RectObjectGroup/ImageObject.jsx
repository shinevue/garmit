/**
 * Copyright 2017 DENSO Solutions
 * 
 * 画像オブジェクト Reactコンポーネント
 *  
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * 画像オブジェクト
 * <ImageObject></ImageObject>
 * @param {string} position
 * @param {string} size
 * @param {string} backgroundImagePath 画像のパス 
 */
export default class ImageObject extends Component{
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    /**
     * コンポーネントをアップデートするかどうか
     */
    shouldComponentUpdate(nextProps, nextState) {
        //異なるインスタンスでも中身が同じであればアップデートしない
        if (JSON.stringify(nextProps) !== JSON.stringify(this.props)) {
            return true;
        }
    }

    /**
     * オブジェクトクリックイベントハンドラ
     */
    clickObject(id) {
        if (this.props.clickObject) {
            this.props.clickObject(id, this.props.linkType);
        }
    }

    /**
     * render
     */
    render() {
        const { position, size, backgroundImagePath } = this.props;

        return (
            <image x={position.x + 1} y={position.y + 1}
                height={size.height - 2} width={size.width - 2}
                xlinkHref={backgroundImagePath}
                className="through-object"
            />
        );
    }
}

ImageObject.propTypes = {
    position: PropTypes.shape({
        x: PropTypes.number,
        y: PropTypes.number
    }),
    size: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number
    }),
    backgroundImagePath: PropTypes.string
};