/**
 * @license Copyright 2018 DENSO
 * 
 * UnitBox Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form } from 'react-bootstrap';
import Box from 'Common/Layout/Box';
import HorizontalLabelForm from 'Common/Form/HorizontalLabelForm';

/**
 * ユニット情報を表示するコンポーネント
 * @param {string} title タイトル
 * @param {string} rackName ラック名称
 * @param {object} unit ユニット情報
 * @param {object} port ポート情報
 * @param {number} portIndex ポートインデックス
 */
export default class UnitBox extends Component {
    
    /**
     * render
     */
    render() {
        const { title, rackName, unit, port, portIndex, isLoading, isAllowed } = this.props;
        return (
            <Box boxStyle="default" isLoading={isLoading} >
                <Box.Header>
                    <Box.Title>{title}</Box.Title>
                </Box.Header >
                <Box.Body>
                    {isAllowed?
                        <Form horizontal className="pa-r-1 pa-l-1">
                            <StaticTextForm label="ラック" value={rackName} />
                            <StaticTextForm label="名称" value={unit&&unit.name} />
                            <StaticTextForm label="種別" value={unit&&unit.type.name} />
                            <StaticTextForm label="搭載位置" value={unit&&(unit.position.y + 'U × ' + unit.position.x + '列')}/>
                            <StaticTextForm label="ポート" value={port&&(port.portNo + '(' + port.name + ')')}/>
                            <StaticTextForm label="ポート詳細番号" value={portIndex}/>
                            {port&&port.ipAddresses&&port.ipAddresses.length>0&&
                                port.ipAddresses.map((ipAddress) => 
                                    <StaticTextForm  label="IPアドレス" value={ipAddress&&ipAddress.address} />
                                )
                            }
                        </Form>
                    :
                        <div className="pa-r-1 pa-l-1" >ユニットの権限がありません</div>

                    }
                </Box.Body>
            </Box>
        );
    }
}

/**
 * ラベルフォーム
 * @param {string} label フォームのタイトル
 * @param {string} value 表示するデータ
 */
class StaticTextForm extends Component {
    render(){
        const { label, value } = this.props;
        return (
            <HorizontalLabelForm className="mb-05" label={label} value={value} labelCol={{sm: 5}} valueCol={{sm: 7}} />
        );
    }
} 

UnitBox.propTypes = {
    title: PropTypes.string.isRequired,
    rackName: PropTypes.string.isRequired,
    unit: PropTypes.shape({
        name: PropTypes.string.isRequired,
        type: PropTypes.shape({
            name: PropTypes.string.isRequired
        }),
        position: PropTypes.shape({
            x: PropTypes.number.isRequired,
            y: PropTypes.number.isRequired
        })
    }).isRequired,
    port: PropTypes.shape({
        portNo: PropTypes.number,
        name: PropTypes.string,
        ipAddresses: PropTypes.arrayOf(PropTypes.shape({
            address: PropTypes.string
        }))
    }).isRequired,
    portIndex: PropTypes.number.isRequired
}