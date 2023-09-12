/**
 * @license Copyright 2018 DENSO
 * 
 * FunctionListItem Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

/**
 * 機能のListItemコンポーネント
 * @param {object} function 機能情報
 * @param {function} onClick クリックイベント
 */
export default class FunctionListItem extends Component {

    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
    }

    /**
     * render
     */
    render() {
        const func = this.props.function;
        return (
            <li>
                <a href={func&&func.url?func.url:'#'} onClick={() => this.handleClick()}>
                    <span className={classNames('icn', func.iconClass)}>{func.name}</span>
                </a>
            </li>                            
        );
    }

    /**
     * クリックイベントを発生させる
     */
    handleClick () {
        if (this.props.onClick) {
            this.props.onClick();
        }
    }
}

FunctionListItem.propTypes = {
    function: PropTypes.shape({
        functionId: PropTypes.number,
        name: PropTypes.string,
        url: PropTypes.string,
        iconClass: PropTypes.string
    }),
    onClick: PropTypes.func
}