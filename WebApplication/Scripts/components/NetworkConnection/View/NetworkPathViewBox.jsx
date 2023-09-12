/**
 * @license Copyright 2018 DENSO
 * 
 * NetworkPathDisplayBox Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Box from 'Common/Layout/Box';
import NetworkPathView from 'NetworkConnection/View/NetworkPathView/NetworkPathView';

/**
 * ネットワーク経路表示ボックス
 * @param {boolean} isLoading ロード中かどうか
 * @param {object} networkPath ネットワーク経路（Form/To入り）
 * @param {object} selectedNetworkId 選択したネットワークID
 * @param {function} onSelect ネットワーク経路選択時に呼び出す
 */
export default class NetworkPathViewBox extends Component {
    
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
        const { isLoading, networkPath, selectedNetworkId } = this.props;
        return (
            <Box boxStyle='default' isLoading={isLoading} isSolid={true}>
                <Box.Header>
                    <Box.Title>ネットワーク経路図</Box.Title>
                </Box.Header >
                <Box.Body>
                    <div ref="networkPathViewBoxBody" className="network-view">
                        <NetworkPathView networkPath={networkPath} 
                                         selectedNetworkId={selectedNetworkId}
                                         onSelect={(networkPath, isExchange) => this.onSelect(networkPath, isExchange)} />
                    </div>
                </Box.Body>
            </Box>
        );
    }

    /**
     * 選択ネットワークの変更イベント
     * @param {object} networkPath 選択したネットワーク経路
     * @param {boolean} isExchange 接続元と先で高価が必要かどうか
     */
    onSelect(networkPath, isExchange) {
        if (this.props.onSelect) {
            this.props.onSelect(networkPath, isExchange);
        }
    }
}

NetworkPathViewBox.propTypes = {
    isLoading:PropTypes.bool,
    networkPath: PropTypes.shape({
        network: PropTypes.shape({
            networkId: PropTypes.number.isRequired,
            name: PropTypes.string.isRequired,
            cableType: PropTypes.shape({
                cableId: PropTypes.number.isRequired,
                name: PropTypes.string.isRequired
            }).isRequired,
            cableStandard: PropTypes.string,
            speed: PropTypes.string,
            bandWidth: PropTypes.string,
            comment: PropTypes.string
        }),
        rackFrom: PropTypes.shape({ 
            rackName: PropTypes.string 
        }),
        unitFrom: PropTypes.shape({ 
            unitId: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired, 
            type: PropTypes.shape({ 
                name: PropTypes.string
            }).isRequired
        }),
        portFrom: PropTypes.shape({ 
            portNo: PropTypes.number.isRequired, 
            name: PropTypes.string 
        }),
        portIndexFrom: PropTypes.number.isRequired, 
        rackTo: PropTypes.shape({ 
            rackName: PropTypes.string 
        }),
        unitTo: PropTypes.shape({ 
            unitId: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired, 
            type: PropTypes.shape({ 
                name: PropTypes.string
            }).isRequired
        }),
        portTo: PropTypes.shape({ 
            portNo: PropTypes.number.isRequired, 
            name: PropTypes.string 
        }),
        portIndexTo: PropTypes.number.isRequired
    }),
    selectedNetworkId: PropTypes.number,
    onSelect: PropTypes.func
};
