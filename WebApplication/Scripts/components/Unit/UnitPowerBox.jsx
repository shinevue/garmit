/**
 * @license Copyright 2018 DENSO
 * 
 * UnitPowerBox Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Box from 'Common/Layout/Box';
import UnitPowerList from './UnitPowerList';
import UnitPowerEditModal from './Modal/UnitPowerEditModal';

const MAX_UNITPOWER_COUNT = 10;

/**
 * ユニット電源設定ボックスコンポーネント
 * 項目を変更すると、ユニット電源の全てのデータがonChange()で返ります
 * @param {array} unitPowers ユニット電源リスト
 * @param {array} rackPowers ラック電源リスト
 * @param {array} excludedRackPower 除外するラック電源
 * @param {boolean} isLoading ロード中かどうか
 * @param {boolean} isReadOnly 読み取り専用かどうか
 * @param {function} onChange ユニット電源情報が変更されたときに呼び出す。ユニット電源情報の全てを返却する
 */
export default class UnitPowerBox extends Component {
    
    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        this.state = {
            edittingPower: null,
            rackPowers: [],
            showModal: false
        };
    }

    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps( nextProps ){
        const { id, powers, isReadOnly, rackPowers } = nextProps;
        if (id != this.props.id || isReadOnly != this.props.isReadOnly) {
            this.setState({
                edittingPower: null,
                rackPowers: JSON.parse(JSON.stringify(rackPowers))
            });
        }
    }

    /**
     * render
     */
    render() {
        const { id, unitPowers, excludedRackPower, isReadOnly, isLoading } = this.props;
        const { showModal, edittingPower, rackPowers } = this.state;

        return (
            <Box boxStyle='default' defaultClose={true} isLoading={isLoading}>
                <Box.Header>
                    <Box.Title>電源設定</Box.Title>
                </Box.Header >
                <Box.Body>
                    <UnitPowerList id={id}
                                   unitPowers={unitPowers} 
                                   isReadOnly={isReadOnly}
                                   onAdd={() => this.addPower()}
                                   onEdit={(power) => this.editPower(power)}
                                   onDelete={(powers) => this.deletePowers(powers)}
                    />
                    <UnitPowerEditModal showModal={showModal}
                                        power={edittingPower} 
                                        rackPowers={rackPowers}
                                        excludedRackPower={excludedRackPower}
                                        onApply={(power) => this.applyPowerChange(power)}
                                        onCancel={() => this.cancelPowerChange()}
                    />
                </Box.Body>
            </Box>
        );
    }

    /********************************************
     * イベント関数
     ********************************************/

    /**
     * ユニット電源を追加する
     */
    addPower() {        
        this.setState({edittingPower: this.getNewUnitPower(), showModal: true});
    }

    /**
     * ユニット電源を編集する
     * @param {object} power 編集するユニット電源
     */
    editPower(power) {
        this.setState({edittingPower: JSON.parse(JSON.stringify(power)), showModal: true});
    }
 
    /**
     * 電力の変更をキャンセルする
     */
    cancelPowerChange(){
        var obj = Object.assign({}, this.state);
        obj.edittingPower = null;
        this.setState({edittingPower: null, showModal:false});
    }

    /**
     * ユニット電源の変更を適用する
     * @param {object} power 変更後のユニット電源
     */
    applyPowerChange(value) {
        var workPowers = Object.assign([], this.props.unitPowers);
        var beforePower = null;
        const isUpdate = workPowers.some((power) => {
                            if (power.unitPsNo === value.unitPsNo) {
                                beforePower = JSON.parse(JSON.stringify(power));            //元の電源設定を保持
                                power.rackPower = Object.assign({}, value.rackPower);
                                power.outlet = Object.assign({}, value.outlet);
                                power.power = value.power;
                                power.useConf = value.useConf;
                            }
                            return (power.unitPsNo === value.unitPsNo);
                         });
        if (!isUpdate) {
            workPowers.push(Object.assign({}, value));
        }
        this.onChange(workPowers);

        const nextRackPowers = this.getRackPowers_outletUsageChange(beforePower, value);
        this.setState({edittingPower : value, rackPower: nextRackPowers, showModal:false});
    }

    /**
     * ユニット電源を削除する
     * @param {array} powers 削除するのユニット電源一覧
     */
    deletePowers(powers) {
        const nextPowers = this.props.unitPowers.filter((unitPower) => !powers.some((power) => power.unitPsNo === unitPower.unitPsNo));
        const nextRackPowers = this.getRackPowers_OutletNotInUse(powers);        //ラック電源の使用状況を変更する
        this.setState({rackPower: nextRackPowers});
        this.onChange(nextPowers);
    }

    /**
     * 削除したユニット電源のアウトレット使用状況をOFFにする
     * @param {array} powers 削除後のユニット電源一覧
     * @returns {array} アウトレットの使用状況を変更したラック電源
     */
    getRackPowers_OutletNotInUse(powers) {
        var { rackPowers } = this.state;
        rackPowers.forEach((rackPower) => {
            const targetPowers = powers.filter((unitPower) => unitPower.rackPower.psNo === rackPower.psNo);
            if (targetPowers) {
                rackPower.outlets.forEach((outlet) => {
                    if (targetPowers.some((item) => item.outlet.outletNo === outlet.outletNo)) {
                        outlet.inUse = false;
                    }
                });
            }
        });
        return rackPowers;
    }

    /**
     * ラック電源のアウトレットの使用状況を変更する
     * @param {object} current 今のユニット電源
     * @param {object} next 次のユニット電源
     * @param {array} アウトレットの使用状況を変更したラック電源
     */
    getRackPowers_outletUsageChange(current, next) {
        const { rackPowers } = this.state;
        if (current && 
            current.rackPower.psNo === next.rackPower.psNo &&
            current.outlet.outletNo === next.outlet.outletNo){
                return rackPowers;
        }

        rackPowers.forEach((rackPower) => {
            if ((current && current.rackPower.psNo === rackPower.psNo) || (next.rackPower.psNo === rackPower.psNo)) {
                rackPower.outlets.forEach((outlet) => {
                    if (next.outlet.outletNo === outlet.outletNo) {
                        outlet.inUse = true;
                    } else if (current && current.outlet.outletNo === outlet.outletNo) {
                        outlet.inUse = false;
                    }
                });
            }
        });

        return rackPowers;
    }

    /********************************************
     * その他関数
     ********************************************/

    /**
     * ユニット電源変更イベントを呼び出す
     * @param {object} powers ユニット電源リスト
     */
    onChange(powers) {        
        if (this.props.onChange) {
            this.props.onChange(powers);
        }
    }

    /**
     * 新しいユニット電源情報を取得する
     */
    getNewUnitPower() {
        const { id } = this.props;
        const nextPsNo = this.getMaxPsNo(this.props.unitPowers) + 1;
        return {
            unitId: id,
            rackPower: null,
            unitPsNo: nextPsNo,
            outlet: null,
            power: 0,
            useConf: 1
        }
    }
    
    /**
     * 最大の電源番号を取得する
     * @param {array} powers 電源リスト 
     */
    getMaxPsNo(powers) {
        return (powers && powers.length > 0) ? Math.max.apply(null, powers.map((p) => p.unitPsNo)) : 0;
    }
}

UnitPowerBox.propTypes = {
    id: PropTypes.string,
    unitPowers: PropTypes.arrayOf(PropTypes.shape({
        unitId: PropTypes.string.isRequired,
        unitPsNo: PropTypes.string.isRequired,
        outlet: PropTypes.shape({
            outletNo: PropTypes.number.isRequired,
        }),
        power: PropTypes.number.isRequired,
        useConf: PropTypes.number.isRequired,
        rackPower: PropTypes.shape({
            psNo: PropTypes.number.isRequired,
            name: PropTypes.string.isRequired
        })
    })),
    rackPowers: PropTypes.arrayOf(PropTypes.shape({        
        rackId: PropTypes.string.isRequired,
        psNo: PropTypes.number.isRequired,
        name: PropTypes.string,
        inletType: PropTypes.shape({
            connectorNo: PropTypes.number.isRequired,
            connectorName: PropTypes.string.isRequired
        }),
        outletCount: PropTypes.number,
        outlets: PropTypes.arrayOf(PropTypes.shape({
            outletNo: PropTypes.number.isRequired,
            outletType: PropTypes.shape({
                connectorNo: PropTypes.number.isRequired,
                connectorName: PropTypes.string.isRequired
            }),
            point: PropTypes.object
        })),
        comment: PropTypes.string,
        ratedCurrent: PropTypes.number,
        ratedVoltage: PropTypes.number,
        breaker: PropTypes.shape({
            BreakerNo: PropTypes.number.isRequired,
            BreakerName: PropTypes.string.isRequired,
            RatedCurrent: PropTypes.number.isRequired,
            RatedVoltage: PropTypes.number.isRequired
        }),
        useRackPowerThreshold: PropTypes.bool,
        errorThreshold: PropTypes.number,
        alarmThreshold: PropTypes.number
    })),
    excludedRackPower: PropTypes.shape({        
        rackId: PropTypes.string.isRequired,
        psNo: PropTypes.number.isRequired,
        name: PropTypes.string,
        inletType: PropTypes.shape({
            connectorNo: PropTypes.number.isRequired,
            connectorName: PropTypes.string.isRequired
        }),
        outletCount: PropTypes.number,
        outlets: PropTypes.arrayOf(PropTypes.shape({
            outletNo: PropTypes.number.isRequired,
            outletType: PropTypes.shape({
                connectorNo: PropTypes.number.isRequired,
                connectorName: PropTypes.string.isRequired
            }),
            point: PropTypes.object
        })),
        comment: PropTypes.string,
        ratedCurrent: PropTypes.number,
        ratedVoltage: PropTypes.number,
        breaker: PropTypes.shape({
            BreakerNo: PropTypes.number.isRequired,
            BreakerName: PropTypes.string.isRequired,
            RatedCurrent: PropTypes.number.isRequired,
            RatedVoltage: PropTypes.number.isRequired
        }),
        useRackPowerThreshold: PropTypes.bool,
        errorThreshold: PropTypes.number,
        alarmThreshold: PropTypes.number
    }),
    isReadOnly: PropTypes.isReadOnly,
    isLoading: PropTypes.bool,
    onChange: PropTypes.func
}