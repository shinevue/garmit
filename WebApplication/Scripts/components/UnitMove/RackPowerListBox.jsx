/**
 * @license Copyright 2018 DENSO
 * 
 * RackPowerListBox Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Panel, Form } from 'react-bootstrap';

import Box from 'Common/Layout/Box';
import BoxOpenButton from 'Common/Widget/BoxOpenButton';
import LabelForm from 'Common/Form/LabelForm';
import BarGraph from 'Common/Widget/BarGraph';

/**
 * ラック電源情報ボックスコンポーネント
 * @param {array} powers ラック電源情報リスト
 * @param {array} rackPowerValues ラック電源のバーグラフ情報リスト
 */
export default class RackPowerListBox extends Component {
    
    /**
     * render
     */
    render() {
        const { powers, rackPowerValues, isLoading } = this.props;
        return (
            <Box boxStyle='default' className='mb-1' defaultClose={true} isLoading={isLoading}>
                <Box.Header>
                    <Box.Title>ラック電源情報</Box.Title>
                </Box.Header >
                <Box.Body maxHeight={230}>
                    {(powers&&powers.length>0&&rackPowerValues&&rackPowerValues.length>0)?
                        powers.map((power, index) => {
                        var powerValues = rackPowerValues.find((value) => value.rackId == power.rackId && value.psNo === power.psNo);      
                        return powerValues && <PowerPanel power={power} values={powerValues} key={index} />
                        })
                      :
                      <div>電源がありません</div>
                    }
                </Box.Body>
            </Box>
        );
    }
}

/**
 * ラック電源パネル（1電源分の情報を表示）
 * @param {object} powers ラック電源情報
 * @param {object} values 電力バーグラフの表示値
 */
class PowerPanel extends Component {
    
    /**
     * render
     */
    render() {
        const { key, power, values } = this.props;
        const { name, outlets, outletCount } = power;
        const { ratedPowerBarGraphSet, measuredPowerBarGraphSet } = values;
        const emptyCount = outletCount - outlets.filter((outlet) => outlet.inUse).length;

        return(
            <Panel className="unitmove-rackpower-panel" header={name}>
                <Form>
                    <LabelForm label='空アウトレット数' value={emptyCount + '/' + outletCount} />
                    <BarGraph title="総消費電力(定格)"
                              description={ratedPowerBarGraphSet.maxNowValueString}
                              max={ratedPowerBarGraphSet.max} 
                              min={0}
                              label={ratedPowerBarGraphSet.barGraphItems[0].percentage}
                              value={ratedPowerBarGraphSet.barGraphItems[0].usage} 
                              bsStyle={ratedPowerBarGraphSet.barGraphItems[0].alarmName} 
                    />
                    <BarGraph title="総消費電力(実測)"
                              description={measuredPowerBarGraphSet.maxNowValueString}
                              max={measuredPowerBarGraphSet.max} 
                              min={0}
                              label={measuredPowerBarGraphSet.barGraphItems[0].percentage}
                              value={measuredPowerBarGraphSet.barGraphItems[0].usage} 
                              bsStyle={measuredPowerBarGraphSet.barGraphItems[0].alarmName} 
                    />
                </Form>
            </Panel>
        );
    }
}

RackPowerListBox.propTypes = {
    powers: PropTypes.arrayOf(PropTypes.shape({        
        rackId: PropTypes.string.isRequired,
        psNo: PropTypes.number.isRequired,
        name: PropTypes.string,
        outletCount: PropTypes.number,
        outlets: PropTypes.arrayOf(PropTypes.shape({
            outletNo: PropTypes.number.isRequired,
            inUse: PropTypes.bool
        }))
    })),
    rackPowerValues: PropTypes.arrayOf(PropTypes.shape({ 
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
    isLoading: PropTypes.bool
}