/**
 * @license Copyright 2018 DENSO
 * 
 * MoveButton Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Button from 'Common/Widget/Button';

/**
 * 移動ボタンコンポーネント
 * @param {boolean} isLeftDirection 左方向の移動かどうか
 * @param {boolean} disabled 使用不可かどうか
 * @param {function} onClick クリック時に呼び出す
 */
export default class MoveButton extends Component {

    /**
     * render
     */
    render() {
        const { isLeftDirection, disabled } = this.props;
        return (
            <Button iconId={isLeftDirection?"move-left":"move-right"} disabled={disabled} onClick={() => this.handleClick()} >移動</Button>
        );
    }

    /**
     * クリックイベント
     */
    handleClick(){
        if (this.props.onClick) {
            this.props.onClick();
        }
    }
}

MoveButton.propTypes = {
    isLeftDirection: PropTypes.bool,
    disabled: PropTypes.bool,
    onClick: PropTypes.func
}