/**
 * @license Copyright 2019 DENSO
 * 
 * NetworkNameObject Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import RectObject from './RectObject';
import TextObject from './TextObject';

/**
 * ネットワーク名称コンポーネント
 * @param {string} id 
 * @param {object} position 位置
 * @param {object} size サイズ
 * @param {string} className
 * @param {boolean} selectable 選択可能かどうか
 */
export default class NetworkNameObject extends Component {
    
    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        this.state = { 

         };
    }

    /**
     * コンポーネントをアップデートするかどうか
     */
    shouldComponentUpdate(nextProps, nextState) {
        //異なるインスタンスでも値が同じであればアップデートしない
        if (JSON.stringify(nextProps) !== JSON.stringify(this.props)) {
            return true;
        }
    }

    /**
     * render
     */
    render() {
        const { id, dispName, name, className, position, size, selectable } = this.props;

        return (
            <g
                id={'network' + id}
                transform={"translate(" + position.x + "," + position.y + ")"}
                className={className}
                onClick={this.handleClickObject}
            >
                <RectObject 
                    id={'networkRect' + id}
                    className="network-name-rect"
                    position={{ x: 0, y: 0 }} 
                    size={size} 
                    selectable={selectable} 
                    isThrough={false}
                    tooltip={(name !== dispName)&&name}
                    overlayInfo={(name !== dispName)&&{ placement: 'bottom' }}
                />
                <TextObject 
                    id={'networkText' + id} 
                    className="network-name-text"
                    position={{ x: 0, y: 0 }} 
                    size={size} 
                    text={dispName} 
                    isBreakWord
                />
            </g>
        );      
    }

    /**
     * オブジェクトクリックイベントハンドラ
     */
    handleClickObject = (e) => {
        if (this.props.onClick) {
            this.props.onClick();
        }
        e && e.preventDefault();
    }
}


NetworkNameObject.propTypes = {
    id: PropTypes.string,
    className: PropTypes.string,
    position: PropTypes.shape({
        x: PropTypes.number,
        y: PropTypes.number
    }),
    size: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number
    }),
    selectable: PropTypes.bool,     //選択可能オブジェクトかどうか
};