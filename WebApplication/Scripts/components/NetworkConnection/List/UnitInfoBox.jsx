/**
 * @license Copyright 2018 DENSO
 * 
 * UnitInfoBox Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form } from 'react-bootstrap';

import Box from 'Common/Layout/Box';
import BoxColseButton from 'Common/Widget/BoxColseButton';
import HorizontalLabelForm from 'Common/Form/HorizontalLabelForm';

/**
 * ユニット情報コンポーネント
 * @param {boolean} isHidden 非表示とするかどうか
 * @param {object} unit 表示するユニット情報
 */
export default class UnitInfoBox extends Component {
    
    /**
     * render
     */
    render() {
        const { isHidden, unit } = this.props;
        return (
            <Box boxStyle="default" className={'mb-05' + (isHidden?' hidden':'') }>
                <Box.Header>
                    <Box.Title>ユニット情報</Box.Title>
                </Box.Header >
                <Box.Body>
                    <Form horizontal>
                        <StaticTextForm  label="ユニット" value={unit&&unit.name}/>
                        <StaticTextForm  label="ポート数" value={unit&&unit.portCount}/>
                    </Form>
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
            <HorizontalLabelForm className="text-break-word " label={label} value={value} labelCol={{sm: 5}} valueCol={{sm: 7}} />
        );
    }
}

UnitInfoBox.propTypes = {
    isHidden: PropTypes.bool,
    unit: PropTypes.shape({
        name: PropTypes.string.isRequired,
        portCount: PropTypes.number.isRequired
    })
}