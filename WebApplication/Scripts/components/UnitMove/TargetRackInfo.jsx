/**
 * @license Copyright 2018 DENSO
 * 
 * TargetRackInfo Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Panel, Col, Form } from 'react-bootstrap';
import AssetArrow from 'Assets/AssetArrow';
import HorizontalLabelForm from 'Common/Form/HorizontalLabelForm';
import LoadBarGraph from 'Assets/Graph/LoadBarGraph';
import { hasRack } from 'assetUtility';

/**
 * 移動先ラック情報表示コンポーネント
 * @param {object} rack ラック情報
 * @param {boolean} isLeft 移動先ラックが左側のラックかどうか
 */
export default class TargetRackInfo extends Component {
    
    /**
     * render
     */
    render() {
        const { rack, isLeft } = this.props;
        const isRack = hasRack(rack);
        return (
            <div className='asset-panel-group ' >
                {isRack&&isLeft&&
                    <div className='asset-panel-item asset-panel-addon hidden-xs'>
                        <AssetArrow className="unitmove-arrow-left" direction='left' />
                    </div>
                }
                <div className={classNames('asset-panel-item', (isRack ? (isLeft?'pa-right':'pa-left') : ''))}>
                    <Panel bsStyle={isRack?'primary':'default'} header='移動先ラック'>
                        <Form className='row' horizontal>
                            <Col md={6}>
                                <StaticTextForm label='ラック名称' value={isRack&&rack.rackName}/>
                            </Col>
                            <Col md={6}>
                                <StaticTextForm label='ユニット数' value={isRack&&(rack.row + 'U × ' + rack.col + '列')}/>
                            </Col>                       
                        </Form>
                        {isRack&&
                            <Form className='unitmove-loadgraph-form'>
                                <LoadBarGraph title='荷重' {...rack.loadBarGraphSet} />
                            </Form>
                        }
                    </Panel>
                </div>
                {isRack&&!isLeft&&
                    <div className='asset-panel-item asset-panel-addon hidden-xs'>
                        <AssetArrow className="unitmove-arrow-right" direction='right' />
                    </div>
                }
            </div>
        );
    }
}

/**
 * ラベルフォーム
 * @param {string} label フォームのタイトル
 * @param {string} value 表示文字列
 */
class StaticTextForm extends Component {
    render(){
        const { label, value } = this.props;
        return (
            <HorizontalLabelForm label={label} value={value} labelCol={{md: 5}} valueCol={{md: 7}} />
        );
    }
}

TargetRackInfo.propTypes = {
    rack: PropTypes.shape({
        rackId: PropTypes.string.isRequired,
        rackName: PropTypes.string.isRequired,
        row: PropTypes.number.isRequired,
        col: PropTypes.number.isRequired,
        loadBarGraphSet: PropTypes.shape({
            max: PropTypes.number.isRequired,
            maxNowValueString: PropTypes.string.isRequired,
            barGraphItems: PropTypes.arrayOf(PropTypes.shape({
                usage: PropTypes.number.isRequired,
                percentage: PropTypes.string.isRequired,
                alarmName: PropTypes.string.isRequired
            }))
        })
    }),
    isLeft: PropTypes.bool
}