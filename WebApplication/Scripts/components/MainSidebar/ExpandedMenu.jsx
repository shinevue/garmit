/**
 * @license Copyright 2017 DENSO
 * 
 * ExpandedMenu Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import MenuListItem from './MenuListItem';

/**
 * 拡張メニューコンポーネント
 * @param {object} menu メニュー情報
 */
export default class ExpandedMenu extends Component {
    
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
        const { menu } = this.props;
        return (
            <div className="main-sidebar__expanded-list">
                <span className="main-sidebar__expanded-title">
                    <span className={classNames('garmit-menu-item', menu.iconClass)}>{menu.name}</span>
                </span>
                {menu.functions&&menu.functions.length>0&&
                    <div className="main-sidebar__expanded-wrap">
                        <ul>
                            {menu.functions.map((func) => 
                                <MenuListItem id={func.id} name={func.name} iconClass={func.iconClass} function={func} />)}
                            {menu.functions.length % 2 != 0 &&
                                <li></li>
                            }
                        </ul>
                    </div>
                }
            </div>
        );
    }
}

ExpandedMenu.propTypes = {
    menu: PropTypes.shape({
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