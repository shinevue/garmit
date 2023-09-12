/**
 * @copyright 2019 DENSO
 * 
 * ImageObject(ネットワーク経路表示用) Reactコンポーネント
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
    shouldComponentUpdate(nextProps) {
        //異なるインスタンスでも中身が同じであればアップデートしない
        if (JSON.stringify(nextProps) !== JSON.stringify(this.props)) {
            return true;
        }
    }

    /**
     * render
     */
    render() {
        const { position, size, imagePath, preserveAspectRatio } = this.props;

        return (
            <image x={position.x} y={position.y}
                height={size.height} width={size.width}
                xlinkHref={imagePath}
                className="through-object"
                preserveAspectRatio={preserveAspectRatio}
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
    imagePath: PropTypes.string,
    preserveAspectRatio: PropTypes.string
};