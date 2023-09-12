/**
 * @license Copyright 2017 DENSO
 * 
 * RackPower Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Box from 'Common/Layout/Box';
import InputForm from 'Common/Form/InputForm';
import SelectForm from 'Common/Form/SelectForm';
import LabelForm from 'Common/Form/LabelForm';
import MessageModal from 'Assets/Modal/MessageModal';
import RackPowerForm from './RackPowerForm';

import { MESSAGEMODAL_BUTTON } from 'constant';
import { compareAscending } from 'sortCompare';
import { LAVEL_TYPE, readOnlyByLevel } from 'authentication';

const MAX_RACKPOWER_COUNT = 10;

/**
 * ラック電源コンポーネントを定義します。
 * 項目を変更すると、ラック電源の全てのデータがonChange()で返ります
 * @param {array} powers ラック電源情報リスト
 * @param {array} connectors 電源コネクタリスト
 * @param {boolean} isLoading ロード中かどうか
 * @param {boolean} isEditableComment コメントのみ編集可能か
 * @param {boolean} isReadOnly 読み取り専用かどうか
 * @param {number} level 権限レベル
 * @param {object} lookUp 検索条件指定用のルックアップ
 * @param {function} onChange ラック電源情報が変更されたときに呼び出します。ラック電源情報をすべて返却する。
 */
export default class RackPowersBox extends Component {
    
    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        this.state = {
            selectedPsNo: null,
            showMessage: false,
            isError: false
        };
    }

    /********************************************
     * React ライフサイクルメソッド
     ********************************************/

    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps( nextProps ){
        const { rackId, powers, isReadOnly } = nextProps;
        if (rackId != this.props.rackId) {
            this.setState({
                selectedPsNo: (powers && powers.length > 0) ? this.getMinPsNo(powers) : null,
                isError: false
            });
        } else if (isReadOnly != this.props.isReadOnly) {
            this.setState({
                isError: false
            });
        }
    }

    /**
     * render
     */
    render() {
        const { powers, connectors, lookUp, isReadOnly, level, isLoading } = this.props;
        const { selectedPsNo, isError, showMessage } = this.state;
        const selectedPower = powers ? powers.find((power) => power.psNo === selectedPsNo) : null;
        const hasPowers = powers && powers.length > 0;

        const readOnly = readOnlyByLevel(isReadOnly, level, LAVEL_TYPE.manager);

        return (
            <Box boxStyle='default' className='mb-0' isCollapsible={true} defaultClose={true} isLoading={isLoading}>
                <Box.Header>
                    <Box.Title>電源設定</Box.Title>
                </Box.Header >
                <Box.Body>
                    <InputForm>
                        <InputForm.Row>
                            <InputForm.Col label="電源No." columnCount={1} >
                                {hasPowers ?
                                    <SelectForm value={selectedPsNo} onChange={(psNo) => this.handlePsNoChanged(psNo)} 
                                                options={powers&&powers.map((p) => { 
                                                    return {value: p.psNo, name: p.psNo.toString() + '：' + p.name};
                                                })}
                                                isButtonOnlyControl={true}
                                                isRequired={true}
                                                addonButton={this.addonButton(readOnly, true)} 
                                    />
                                :
                                    <LabelForm value="(なし)"
                                               addonButton={this.addonButton(readOnly, false)}
                                    />
                                }
                                {isError&&
                                    <div className="mt-05 text-red">!!!入力エラーの箇所があるため、電源選択及び追加はできません!!!</div>
                                }
                            </InputForm.Col>
                        </InputForm.Row>
                        {selectedPower&&
                            <RackPowerForm power={selectedPower} 
                                           isReadOnly={isReadOnly} 
                                           level={level}
                                           connectors={connectors}
                                           lookUp={lookUp}
                                           onChange={(value, isError) => this.handleItemChanged(selectedPower.psNo, value, isError)} />    
                        }
                    </InputForm>
                    <MessageModal show={showMessage} 
                                  title='確認' 
                                  bsSize='small'
                                  buttonStyle={MESSAGEMODAL_BUTTON.confirm}
                                  onOK={() => this.removeRackPower()} 
                                  onCancel={() => this.changeComfirmShowState()} >
                                  {showMessage&&this.removeMessage(selectedPower)}
                    </MessageModal>
                </Box.Body>
            </Box>
        );
    }

    /**
     * ラック電源選択のアドオンボタンを作成する
     * @param {boolean} isReadOnly 読み取り専用かどうか
     * @param {boolean} hasPowers 電源があるかどうか
     * @returns {object} アドオンボタン様のオブジェクト
     */
    addonButton(isReadOnly, hasPowers) {
        var buttons = null;
        if (!isReadOnly) {
            buttons = [];
            buttons.push({ key:1, iconId:'add', label:'電源追加', onClick: () => this.addRackPower() });
            
            if (hasPowers) {
                buttons.push({ key:2, iconId:'delete', label:'削除', onClick: () => this.changeComfirmShowState() });
            }
        }
        return buttons;
    }

    /**
     * 削除メッセージ
     */
    removeMessage(selectedPower) {
        var messages = [];
        messages.push(<div>選択中のラック電源を削除します。</div>);
        messages.push(<div>よろしいですか？</div>);
                
        if (selectedPower.isInUse ||
            (selectedPower.outlets && selectedPower.outlets.some((outlet) => outlet.inUse))
            ) {
            messages.push(<strong><div className="mt-1" >!!!注意!!!</div></strong>);
            messages.push(<strong>
                            <div>ユニットにて使用中です。</div>
                            <div>ユニットの電源設定も削除されます。</div>
                        </strong>);
        }
        messages.push(<div></div>);
        return messages;
    }

    /********************************************
     * イベント関数
     ********************************************/
    
    /**
     * 電源No.変更イベント
     * @param {string} psNo 変更後の電源番号
     */
    handlePsNoChanged(psNo) {

        if(this.state.isError){
            alert('入力エラーの箇所があるため、操作できません');
            return;
        }

        this.updateState({selectedPsNo: parseInt(psNo)});
    }

    /**
     * 項目変更イベント
     * @param {object} value 変更後の値
     * @param {boolean} isError エラーかどうか
     */
    handleItemChanged(psNo, value, isError){
        const workPowers = Object.assign([], this.props.powers);
           
        workPowers.some((power) => {
            if (power.psNo === psNo) {
                power.name = value.name;
                power.inletType = Object.assign({}, value.inletType);
                power.outletCount = value.outletCount;
                power.outlets = value.outlets ? value.outlets.concat() : [];
                power.comment = value.comment;
                power.ratedCurrent = value.ratedCurrent;
                power.ratedVoltage = value.ratedVoltage;
                power.breaker = value.breaker;
                power.useBreakerThreshold = value.useBreakerThreshold;
                power.errorThreshold = value.errorThreshold;
                power.alarmThreshold = value.alarmThreshold;
                power.isError = isError;
            }
            return (power.psNo === psNo);
        });

        const error = workPowers ? workPowers.some((power) => power.isError) : false;
        this.updateState({isError: error});
        this.onChange(workPowers, error);
    }
    
    /**
     * ラック電源を追加する
     */
    addRackPower() {  
        
        if(this.state.isError){
            alert('入力エラーの箇所があるため、操作できません');
            return;
        }

        var nextPowers = Object.assign([], this.props.powers);

        if (nextPowers&&nextPowers.length >= MAX_RACKPOWER_COUNT) {
            alert('ラック電源の登録は' + MAX_RACKPOWER_COUNT.toString() + '個までのため、これ以上登録できません。')
        }

        const newPower = this.getNewRackPower();
        nextPowers.push(newPower);
        
        this.updateState({selectedPsNo: newPower.psNo, isError: true});
        this.onChange(nextPowers, true);
    }

    /**
     * ラック電源を削除する
     */
    removeRackPower() {
        const { selectedPsNo, showMessage } = this.state;
        var workPowers = Object.assign([], this.props.powers);
        workPowers = workPowers.filter((power) => {
           return !(power.psNo === selectedPsNo)
        });

        var nextPsNo = this.getNextPageNo(workPowers, selectedPsNo);
        this.updateState({selectedPsNo: nextPsNo, isError: false, showMessage: !showMessage});
        this.onChange(workPowers, false);
    }

    /**
     * 項目変更イベントを発生させる
     * @param {array} value 変更後のデータ 
     * @param {boolean} isError エラーを含んでいるかどうか
     */
    onChange(value, isError) {
        if (this.props.onChange) {
            this.props.onChange(value, isError);
        }
    }

    /********************************************
     * state変更
     ********************************************/
    
    /**
     * stateを更新する
     * @param {object} keyValues 変更後の値とキー
     */
    updateState(keyValues){
        var obj =  Object.assign({}, this.state);
        for (const key in keyValues) {
            if (obj.hasOwnProperty(key)) {
                obj[key] = keyValues[key]; 
            }
        }
        this.setState(obj);
    }

    /**
     * 確認メッセージの表示を切り替える
     */
    changeComfirmShowState() {
        this.updateState({showMessage: !this.state.showMessage});
    }
    

    /********************************************
     * その他関数
     ********************************************/
    
    /**
     * 新しいラック電源情報を取得する
     */
    getNewRackPower() {
        const { rackId } = this.props;
        const nextPsNo = this.getMaxPsNo(this.props.powers) + 1;
        return {
            rackId: rackId,
            psNo: nextPsNo,
            name: '',
            inletType: null,
            outletCount: 0,
            outlets: [],
            comment: '',
            ratedCurrent: '',
            ratedVoltage: '',
            breaker: null,
            useBreakerThreshold: false,
            errorThreshold: '',
            alarmThreshold: ''
        }
    }
    
    /**
     * 最小の電源番号を取得する
     * @param {array} powers 電源リスト 
     */
    getMinPsNo(powers) {
        return (powers && powers.length > 0) ? Math.min.apply(null, powers.map((p) => p.psNo)) : 0;
    }
    
    /**
     * 最大の電源番号を取得する
     * @param {array} powers 電源リスト 
     */
    getMaxPsNo(powers) {
        return (powers && powers.length > 0) ? Math.max.apply(null, powers.map((p) => p.psNo)) : 0;
    }

    /**
     * 次の電源番号を取得する
     * @param {array} powers 電源一覧
     * @param {number} beforePsNo 前の電源番号 
     * @returns {number} 次の電源番号
     */
    getNextPageNo(powers, beforePsNo) {
        var nextNo = this.getMinPsNo(powers);
        powers = powers.sort((current, next) => compareAscending(current.psNo, next.psNo));
        powers.some((item) => {
            if (item.psNo > beforePsNo) {
                nextNo = item.psNo;
                return true;
            }
            return false;
        });
        return nextNo === 0 ? null : nextNo;
    }

}

RackPowersBox.propTypes = {
    rackId: PropTypes.string,
    powers: PropTypes.arrayOf(PropTypes.shape({        
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
        useBreakerThreshold: PropTypes.bool,
        errorThreshold: PropTypes.number,
        alarmThreshold: PropTypes.number
    })),
    connectors: PropTypes.arrayOf(PropTypes.shape({
        connectorNo: PropTypes.number.isRequired,
        connectorName: PropTypes.string.isRequired
    })),
    lookUp: PropTypes.object,
    level: PropTypes.number,
    isReadOnly: PropTypes.bool,
    isEditableComment: PropTypes.bool,
    isLoading: PropTypes.bool,
    onChange: PropTypes.func
}