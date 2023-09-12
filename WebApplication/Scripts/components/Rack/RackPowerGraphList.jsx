/**
 * @license Copyright 2018 DENSO
 * 
 * ラック電源使用率バーグラフリストコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types'
import { Form } from 'react-bootstrap';
import BarGraph from 'Common/Widget/BarGraph';
import SelectForm from 'Common/Form/SelectForm';

const VALUE_TYPE = {
    rated: 'rated',
    measured: 'measured'
}

const TYPE_LIST = [
    { value: VALUE_TYPE.rated, name: '定格値' }, 
    { value: VALUE_TYPE.measured, name: '実測値' }
];

/**
 * ラック電源使用率バーグラフリストコンポーネント
 * @param {array} rackPowerBarGraphList ラック電源バーグラフリスト
 * @param {boolean} isReadOnly 読み取り専用かどうか
 */
export default class RackPowerGraphList extends Component {
    
    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        this.state = {
            valueType : VALUE_TYPE.rated
        }
    }

    /**
     * render
     */
    render() {
        const { rackPowerBarGraphList, isReadOnly } = this.props;
        const { valueType } = this.state;

        return (rackPowerBarGraphList&&rackPowerBarGraphList.length>0&&
                    <Form className='rack-bargraph-from'>
                        <SelectForm className='mb-05' 
                                    style={{ display: 'inline-block' }} 
                                    value={valueType} 
                                    options={TYPE_LIST} 
                                    onChange={(v) => this.valueTypeChanged(v)}
                                    isRequired={true}
                                    isReadOnly={isReadOnly}/>
                        {rackPowerBarGraphList.map((item) => this.makePowerBarGraph(item, valueType))}
                    </Form>
        );
    }

    /**
     * ラック電源のバーグラフを作成する
     * @param {object} rackPowerBarGraph ラック電源のバーグラフ情報
     * @param {string} valueType データ種別
     * @returns {element} ラック電源バーグラフコンポーネント
     */
    makePowerBarGraph(rackPowerBarGraph, valueType){
        var targetGraphSet = {
            max: 0,
            maxNowValueString: ''
        };
        var targetBarGraphItem = {
            usage: 0,
            percentage: '',
            alarmName: 'success'
        };

        if (valueType === VALUE_TYPE.rated && rackPowerBarGraph.ratedPowerBarGraphSet) {
            targetGraphSet = rackPowerBarGraph.ratedPowerBarGraphSet;
        } else if (valueType === VALUE_TYPE.measured && rackPowerBarGraph.measuredPowerBarGraphSet) {
            targetGraphSet = rackPowerBarGraph.measuredPowerBarGraphSet
        }

        if (targetGraphSet.barGraphItems&&targetGraphSet.barGraphItems.length > 0) {
            targetBarGraphItem = targetGraphSet.barGraphItems[0];
        }

        return <BarGraph title={rackPowerBarGraph.powerName}
                         description={targetGraphSet.maxNowValueString}
                         max={targetGraphSet.max} 
                         min={0}
                         label={targetBarGraphItem.percentage}
                         value={targetBarGraphItem.usage} 
                         bsStyle={targetBarGraphItem.alarmName} />
                

    }

    /**
     * データ種別変更イベント
     * @param {string} value 変更後の値
     */
    valueTypeChanged(value){
        this.setState({valueType: value})
    }
}

RackPowerGraphList.propTypes = {
    rackPowerBarGraphList: PropTypes.arrayOf(PropTypes.shape({
        powerName: PropTypes.string.isRequired,
        psNo: PropTypes.number.isRequired,
        rackId: PropTypes.number.isRequired,
        ratedPowerBarGraphSet: PropTypes.shape({
            max: PropTypes.number.isRequired,
            maxNowValueString: PropTypes.string.isRequired,
            barGraphItems: PropTypes.arrayOf(PropTypes.shape({
                usage: PropTypes.number.isRequired,
                percentage: PropTypes.string.isRequired,
                alarmName: PropTypes.string.isRequired
            }))
        }),
        measuredPowerBarGraphSet: PropTypes.shape({
            max: PropTypes.number.isRequired,
            maxNowValueString: PropTypes.string.isRequired,
            barGraphItems: PropTypes.arrayOf(PropTypes.shape({
                usage: PropTypes.number.isRequired,
                percentage: PropTypes.string.isRequired,
                alarmName: PropTypes.string.isRequired
            }))
        })
    })),
    isReadOnly: PropTypes.bool
}