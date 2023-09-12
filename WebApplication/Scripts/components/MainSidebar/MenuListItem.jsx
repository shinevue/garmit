/**
 * @license Copyright 2018 DENSO
 * 
 * MenuListItem Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import FunctionListItem from './FunctionListItem';

/**
 * メニューのListItemコンポーネント
 * @param {number} id メニューID
 * @param {string} name メニュー名
 * @param {string} iconClass アイコンclass名
 * @param {object} function メニューの機能
 * @param {object} functions メニューの子機能
 * @param {function} onFunctionClick 機能クリックイベント
 */
export default class MenuListItem extends Component {
    
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
        const { name, iconClass, functions } = this.props;
        const menuFunction = this.props.function;
        const hasFunctions = this.hasFunctions(functions);
        return (
            <li className={hasFunctions?'gnav-parent': ''}>
                <a href={menuFunction&&menuFunction.url?menuFunction.url:'#'} 
                   className={classNames('garmit-menu-item', iconClass)}>
                    {name}
                </a>
                {hasFunctions&&
                    <ul className="gnav-child">
                        {functions.map((func) => 
                            <FunctionListItem key={func.functionId} 
                                              function={func} 
                                              onClick={() => this.handleFunctionClick(func.onClick)} />)}
                    </ul>
                }
            </li>                  
        );
    }

    /**
     * 子機能があるかどうか
     * @param {*} functions 
     */
    hasFunctions(functions){
        if (functions&&functions.length>0) {
            return true;
        }
        return false;
    }

    /**
     * 機能メニューのクリックイベント
     */
    handleFunctionClick(onClick) {
        if (onClick) {
            onClick();
        }
    }
}

MenuListItem.propTypes = {
    id: PropTypes.number.isRequired,
    name: PropTypes.string,
    iconClass: PropTypes.string,
    function: PropTypes.shape({
        functionId: PropTypes.number,
        name: PropTypes.string,
        url: PropTypes.string,
        iconClass: PropTypes.string
    }),
    functions: PropTypes.arrayOf(PropTypes.shape({
        functionId: PropTypes.number,
        name: PropTypes.string,
        url: PropTypes.string,
        iconClass: PropTypes.string,
        onClick: PropTypes.func
    }))
}