/**
 * @license Copyright 2017 DENSO
 * 
 * HelpMenu Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';

/**
 * ヘルプメニューコンポーネント
 */
export default class HelpMenu extends Component {
    
    /**
     * ヘルプメニュー
     */
    static get HELP_MENUS() {
        return [
            { url: '/Files/Manual.pdf', name: 'マニュアル', target: '_blank' },
            { url: '/License', name: 'ライセンスについて' }
        ];
    }

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
        return (
            <div className="main-sidebar__help">
                <a href="#"><span className="main-sidebar__help-icon"><i className="material-icons">help</i></span></a>
                <div className="main-sidebar__help-child">
                    <svg id="help-right-triangle" className="main-sidebar__help-child-arrow" data-name="" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 45">
                        <filter id="drop-shadow" x="-100%" y="-100%" width="300%" height="300%">
                            <feGaussianBlur in="SourceAlpha" result="blur" stdDeviation="2" />
                            <feOffset result="offsetBlur" dx="3" dy="3" />
                            <feComponentTransfer>
                                <feFuncA type="linear" slope="0.16" />
                            </feComponentTransfer>
                            <feMerge>
                                <feMergeNode />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                        <clipPath id="clip">
                            <rect x="0" y="0" width="24" height="45" />
                        </clipPath>
                        <g clip-path="url(#clip)">
                            <polygon points="0 12.5 0 32.5 16 22.5 0 12.5" filter="url(#drop-shadow)" />
                        </g>
                    </svg>
                    <ul>
                        {HelpMenu.HELP_MENUS.map((menu) => <li><a href={menu&&menu.url?menu.url:'#'} target={menu.target}>{menu.name}</a></li>)}
                    </ul>
                </div>
            </div>
        );
    }
}