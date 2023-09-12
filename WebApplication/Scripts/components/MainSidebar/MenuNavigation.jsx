/**
 * @license Copyright 2017 DENSO
 * 
 * MenuNavigation Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import MenuListItem from './MenuListItem';

/**
 * メニューのナビゲーションコンポーネント
 * @param {array} menus メニューリスト
 */
export default class MenuNavigation extends Component {
    
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
        const { menus } = this.props;
        return (
            <div className="gnav">
                <ul className="gnav-wrap">
                    {menus.map((menu) => 
                        <MenuListItem id={menu.menuId} name={menu.name} iconClass={menu.iconClass} function={menu.function} functions={menu.functions} />)
                    }
                </ul>
            </div>
        );
    }
}

MenuNavigation.propTypes = {
    menus: PropTypes.shape({
        menuId: PropTypes.number,
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
            iconClass: PropTypes.string            
        })),
        level: PropTypes.number,
        dispIndex: PropTypes.number
    })
}