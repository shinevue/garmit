/**
 * @license Copyright 2018 DENSO
 * 
 * ConnectLine Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';

/**
 * ネットワークの接続線コンポーネント
 * @param {boolean} isConnect 接続中かどうか（片方接続は除く）
 * @param {object} connectStatus 左右ラック・ユニットの接続状態
 */
export default class ConnectLine extends Component {
    
    /**
     * render
     */
    render() {
        const { isConnect, connectStatus } = this.props;
        return (
            <div className='network-connect-panel'>
                <svg className='network-connect-svg' width='100%' height='100%'>
                    {connectStatus.left ?
                        <defs>
                            <linearGradient id='verticalGradient' >
                                <stop offset='0' stop-color='darkgray'/>
                                <stop offset='0.5' stop-color='transparent'/>
                            </linearGradient>
                            <linearGradient id="horizontalGradient" gradientTransform="rotate(90)">
                                <stop offset="0" stop-color="darkgray"/>
                                <stop offset="0.5" stop-color="transparent"/>
                            </linearGradient>
                        </defs>
                        :
                        <defs>
                            <linearGradient id='verticalGradient' >
                                <stop offset='0.5' stop-color='transparent'/>
                                <stop offset='1' stop-color='darkgray'/>
                            </linearGradient>
                            <linearGradient id="horizontalGradient" gradientTransform="rotate(90)">
                                <stop offset="0.5" stop-color="transparent"/>
                                <stop offset="1" stop-color="darkgray"/>
                            </linearGradient>
                        </defs>

                    }
                    {isConnect&&<rect className='network-connect-line' x='0' y='0' width='100%' height='100%' fill='darkgray' />}
                    {(!isConnect && (connectStatus.left||connectStatus.right) )&&<rect className='network-connect-line line-middle' x='0' y='0' width='100%' height='100%' fill='darkgray' />}
                </svg>
            </div>
        );
    }
}

ConnectLine.propTypes = {
    isConnect: PropTypes.bool,
    connectStatus: PropTypes.bool
}