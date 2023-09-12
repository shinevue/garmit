/**
 * @license Copyright 2018 DENSO
 * 
 * NetworkBox Reactコンポーネント
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Form } from 'react-bootstrap';
import HorizontalLabelForm from 'Common/Form/HorizontalLabelForm';
import Box from 'Common/Layout/Box';


/**
 * ネットワーク情報表示コンポーネント
 * @param {object} network 表示するネットワーク情報
 * @param {string} className 非表示とするかどうか
 */
export default class NetworkBox extends Component {
    
    /**
     * render
     */
    render() {
        const { network, className, isLoading } = this.props;
        return (
            <Box boxStyle="default" className={className} isLoading={isLoading} >
                <Box.Header>
                    <Box.Title>ネットワーク情報</Box.Title>
                </Box.Header >
                <Box.Body>
                    {network?
                        <Form horizontal className="pa-r-1 pa-l-1">
                            <StaticTextForm label="名称" value={network.name}/>
                            <StaticTextForm label="ケーブル種別" value={network.cableType.name} />
                            <StaticTextForm label="ケーブル規格" value={network.cableStandard}/>
                            <StaticTextForm label="通信速度" value={network.speed} />
                            <StaticTextForm label="帯域幅" value={network.bandWidth} />
                            <StaticTextForm label="備考" value={network.comment} className="text-break-word"/>
                        </Form>
                    :
                        <div>ネットワークを選択してください</div>
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
            <HorizontalLabelForm className={classNames('mb-05', 'text-break-word')} label={label} value={value} labelCol={{sm: 5}} valueCol={{sm: 7}} />
        );
    }
}

NetworkBox.propTypes = {
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
    className: PropTypes.string
}