/**
 * @license Copyright 2018 DENSO
 * 
 * NetworkInfoBox Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Col, Form } from 'react-bootstrap';
import HorizontalLabelForm from 'Common/Form/HorizontalLabelForm';
import Box from 'Common/Layout/Box';

/**
 * ネットワーク情報表示コンポーネント
 * @param {boolean} isHidden 非表示とするかどうか
 * @param {object} network 表示するネットワーク情報
 */
export default class NetworkInfoBox extends Component {
    
    /**
     * render
     */
    render() {
        const { isHidden, network } = this.props;
        return (
            <Box boxStyle="default"  className={'mb-05' + (isHidden?' hidden':'') }>
                <Box.Header>
                    <Box.Title>ネットワーク情報</Box.Title>
                </Box.Header >
                <Box.Body>
                    {network?
                        <Form horizontal>
                            <Col md={6}>
                                <StaticTextForm label="名称" value={network.name}/>
                                <StaticTextForm label="ケーブル種別" value={network.cableType.name} />
                                <StaticTextForm label="ケーブル規格" value={network.cableStandard}/>
                            </Col>
                            <Col md={6}>
                                <StaticTextForm label="通信速度" value={network.speed} />
                                <StaticTextForm label="帯域幅" value={network.bandWidth} />
                                <StaticTextForm label="備考" value={network.comment} />
                            </Col>                       
                        </Form>
                    :
                        <div>ネットワーク情報がありません</div>
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
        const { className, label, value } = this.props;
        return (
            <HorizontalLabelForm className={"text-break-word " + className} label={label} value={value} labelCol={{md: 5}} valueCol={{md: 7}} />
        );
    }
}

NetworkInfoBox.propTypes = {
    isHidden: PropTypes.bool,
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
    })
}