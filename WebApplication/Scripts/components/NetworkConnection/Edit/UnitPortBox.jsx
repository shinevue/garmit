/**
 * @license Copyright 2018 DENSO
 * 
 * UnitPortBox Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Panel, Col, Form, Checkbox } from 'react-bootstrap';
import AssetArrow from 'Assets/AssetArrow';

import SelectForm from 'Common/Form/SelectForm';
import TextForm from 'Common/Form/TextForm';
import Button from 'Common/Widget/Button';
import Loading from 'Common/Widget/Loading';

import { validateInteger, VALIDATE_STATE, errorResult, successResult } from 'inputCheck';
import { convertNumber } from 'numberUtility';

/**
 * ユニット・ポート選択コンポーネント
 * @param {number} networkId ネットワークID
 * @param {object} unitDispSetting ユニット表示設定グループ
 * @param {object} unit ユニット情報
 * @param {object} port ポート情報
 * @param {number} portIndex ポートインデックス
 * @param {boolean} isLeft 左側かどうか
 * @param {boolean} isReadOnly 読み取り専用かどうか
 * @param {boolean} isConnect 接続中かどうか
 * @param {boolean} isEditMode 編集モード（編集モード：true、削除モード：false）
 * @param {boolean} isLoading ロード中かどうか
 * @param {function} onChangeUnit ユニットが変更されたときに呼び出す
 * @param {function} onChangePort ポートが変更されたときに呼び出す
 * @param {function} onChangePortIndex ポートインデックスが変更されたときに呼び出す
 * @param {function} onDisconnect 解除ボタンを押下したときに呼び出す
 */
export default class UnitPortBox extends Component {
    
    /**
     * 検証結果（初期値）
     */
    static get INITIAL_VALIDATE() {
        return {
            unit: { state: null, helpText: null },
            port: { state: null, helpText: null },
            portIndex: { state: null, helpText: null }
        };
    }

    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        var validate = UnitPortBox.INITIAL_VALIDATE;
        var beforePort = {
            unit: props.unit && JSON.parse(JSON.stringify(props.unit)),
            port: props.port && JSON.parse(JSON.stringify(props.port)),
            portIndex: props.portIndex ? props.portIndex : null
        }
        if (!(props.isReadOnly || props.isConnect)) {
            validate = this.validateAllItems(props.unit, props.port, props.portIndex, beforePort, props.networkId);
        }
        this.state = {
            validate: validate,
            beforePort: beforePort
        }
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
        const { networkId, unit, port, portIndex, isReadOnly, isConnect } = nextProps;
        const { beforePort } = this.state;
        if (isReadOnly || isConnect) {
            this.setState({
                validate: UnitPortBox.INITIAL_VALIDATE
            });
        } else {
            this.setState({
                validate: this.validateAllItems(unit, port, portIndex, beforePort, networkId)
            });
        }
    }

    /**
     * render
     */
    render() {
        const { networkId, unitDispSetting, unit, port, portIndex, isLeft, isReadOnly, isConnect, isEditMode, isLoading } = this.props;
        const { validate } = this.state;
        const readOnly = (isReadOnly || isConnect);
        const portIndexList = this.getPortIndexAfterChanged(this.getPortIndexList(port, networkId), portIndex, validate.portIndex);
        return (
            <div className="asset-panel-group" >
                {isLeft&&this.arrow(isLeft)}
                <div className="asset-panel-item">
                    <Panel header={isLeft?'ユニット・ポート選択(接続元)':'ユニット・ポート選択(接続先)'} className="mb-0">
                        <Form onSubmit={(e) => this.handleSubmit(e)}>
                            <SelectForm label="ユニット選択" 
                                        value={unit&&unit.unitId}
                                        options={unitDispSetting && unitDispSetting.units &&
                                            unitDispSetting.units.map((i) => {return { value: i.unitId, name: i.unitNo + '：' + i.name }})
                                        } 
                                        onChange={(value) => this.selectUnit(value)}
                                        isReadOnly={readOnly}
                                        validationState={validate.unit.state}
                                        helpText={validate.unit.helpText}
                            />
                            <SelectForm label={'ポート選択（ポート数：' + ((unit&&unit.portCount > 0)?unit.portCount:'0') + '）'} 
                                        value={port&&port.portSeqNo}
                                        options={unit&&unit.ports&&this.getPortOptionList(unit.ports, networkId, readOnly)} 
                                        onChange={(value) => this.selectPort(value)}
                                        isReadOnly={readOnly||(unit?false:true)}
                                        validationState={validate.port.state}
                                        helpText={validate.port.helpText}
                            />
                            {(portIndexList && (!readOnly || (readOnly&&portIndexList.length > 1)))&&
                                <TextForm label={'ポート詳細番号（詳細番号数：'+ portIndexList.length +'）'} 
                                          value={portIndex} 
                                          onChange={(value) => this.changePortIndex(value)}
                                          isReadOnly={readOnly||(port?false:true)} 
                                          validationState={validate.portIndex.state}
                                          helpText={validate.portIndex.helpText}
                                />
                            }
                        </Form>
                        <div>
                            {isConnect&&isEditMode&&
                                <Button iconId="disconnect" 
                                        className={isLeft?'':'pull-right'} 
                                        onClick={() => this.onDisconnect()} >解除
                                </Button>
                            }
                        </div>
                        <Loading isLoading={isLoading} />
                    </Panel>
                </div>
                {!isLeft&&this.arrow(isLeft)}
            </div>
        );
    }
    
    /********************************************
     * 入力検証
     ********************************************/
    /**
     * ユニット選択の入力検証
     * @param {object} unit ユニット情報
     * @returns { state:'', helpText:'' }　検証結果
     */
    validateUnit(unit) {
        return unit ? successResult : errorResult();
    }

    /**
     * ポート番号選択の入力検証
     * @param {object} port ポート情報
     * @returns { state:'', helpText:'' }　検証結果
     */
    validatePort(port) {
        return port ? successResult : errorResult();
    }

    /**
     * ポートインデックスの入力検証
     * @param {number} portIndex ポートインデックス
     * @param {object} unit 選択ユニット情報
     * @param {object} port 選択ポート情報
     * @param {object} beforePort 元のネットワークポート情報
     * @param {number} networkId ネットワークID
     */
    validatePortIndex(portIndex, unit, port, beforePort, networkId) {
        var validate = validateInteger(portIndex, 1, 100, false);
        
        //ポートインデックスの重複チェック
        const portIndexList = this.getPortIndexList(port, networkId);
        if (portIndexList.some((i) => i === convertNumber(portIndex))) {
            if (!(beforePort.unit && beforePort.unit.unitId === unit.unitId &&
                  beforePort.port.portSeqNo === port.portSeqNo &&
                  convertNumber(beforePort.portIndex) === convertNumber(portIndex))) {
                validate = errorResult('ポート詳細番号が重複しています。')
            }
        }
        return validate;
    }

    /**
     * 全項目の入力検証
     * @param {object} unit ユニット情報
     * @param {object} port ポート情報
     * @param {object} portIndex ポートインデックス情報
     * @param {object} beforePort 元のネットワークポート情報
     * @param {number} networkId ネットワークID
     * @returns {object} 検証結果
     */
    validateAllItems(unit, port, portIndex, beforePort, networkId) {
        return {
            unit: this.validateUnit(unit),
            port: this.validatePort(port),
            portIndex: this.validatePortIndex(portIndex, unit, port, beforePort, networkId)
        };
    }
    
    /**
     * 検証結果を取得する
     * @param {object} unit ユニット情報
     * @param {object} port ポート情報
     * @param {object} portIndex ポートインデックス情報
     * @param {number} networkId ネットワークID
     * @returns {object} 検証結果
     */
    getValidate(unit, port, portIndex, networkId) {        
       const {  beforePort } = this.state;
       var validate = this.validateAllItems(unit, port, portIndex, beforePort, networkId);
       return validate;
    }


    /********************************************
     * イベント関数
     ********************************************/

    /**
     * ユニットを選択する
     * @param {string} unitId ユニットID
     */
    selectUnit(unitId){
        const { unitDispSetting, port, portIndex } = this.props;
        const unit = unitDispSetting.units.find((item) => item.unitId ===  unitId);
        if (this.props.onChangeUnit) {
            this.props.onChangeUnit(unit, true);            //ユニットを切り替えたときポートはnullになるため、常に保存は無効
        }
    }

    /**
     * ポートを選択する
     * @param {number} portSeqNo ポート連番
     */
    selectPort(portSeqNo){      
        const { unit, networkId } = this.props;  
        const { beforePort } = this.state;
        const port = unit.ports.find((item) => item.portSeqNo ===  convertNumber(portSeqNo));
        var portIndex = this.getPortIndex(unit, port, beforePort, networkId)
        let validate = this.getValidate(unit, port, portIndex, networkId);
        if (this.props.onChangePort) {
            this.props.onChangePort(port, portIndex, this.invalid(validate));
        }
    }

    /**
     * ポートインデックスを取得する
     * @param {object} unit ユニット
     * @param {object} port ポート
     * @param {object} beforePort 前回のポート情報
     * @param {number} networkId ネットワークID
     */
    getPortIndex(unit, port, beforePort, networkId) {

        if (beforePort.unit && beforePort.unit.unitId === unit.unitId &&
            beforePort.port.portSeqNo === port.portSeqNo) {
                return beforePort.portIndex;
        }

        const portIndexList = this.getPortIndexList(port, networkId);
        var portIndex = 1;
        if (portIndexList.length > 0) {
            portIndex = Math.max.apply(null, portIndexList) + 1;
        } else if (!port) {
            portIndex = null;
        }

        return portIndex;
    }

    /**
     * ポートインデックスの入力変更
     * @param {string||number} portIndex ポートインデックス
     */
    changePortIndex(portIndex) {
        const { unit, port, networkId } = this.props;
        const { beforePort } = this.state;
        let validate = this.getValidate(unit, port, portIndex, networkId);
        if (this.props.onChangePortIndex) {
            this.props.onChangePortIndex(portIndex, this.invalid(validate));
        }
    }

    /**
     * Submitイベントハンドラ
     * @param {*} e 
     */
    handleSubmit(e) {
        e.preventDefault();
        return false;           //リロードしない
    }
    
    /********************************************
     * その他
     ********************************************/
    
    /**
     * 矢印を作成する
     * @param {boolean} isLeft 左側かどうか
     */
    arrow(isLeft) {
        return (
            <div className="asset-panel-item asset-panel-addon hidden-xs">
                <AssetArrow direction={isLeft ? 'left' : 'right'} />
            </div>
        );
    }

    /**
     * ポートインデックスリストを取得する
     * @param {object} port ポート情報
     * @param {number} networkId 更新中のネットワークID
     */
    getPortIndexList(port, networkId) {
        const networks = port ? port.networks.filter((nw) => nw.networkId !== networkId) : [];
        return networks.map((nw) => nw.portIndex);
    }

    /**
     * 変更後のポートインデックスを取得する
     * @param {array} portIndexList ポートインデックスリスト
     * @param {number} portIndex ポートインデックス
     * @param {object} portIndexValidate ポートインデックスの検証結果
     */
    getPortIndexAfterChanged(portIndexList, portIndex, portIndexValidate) {
        var indexList = portIndexList.concat();
        var index = portIndex;
        if (portIndexValidate.state === VALIDATE_STATE.success) {
            index =  parseInt(portIndex);
        }
        if (indexList.indexOf(index) < 0) {
            indexList.push(index);
        }
        return indexList
    }

    /**
     * ポート選択の選択肢を取得する
     * @param {array} ports ポート一覧
     * @param {number} networkId ネットワークID
     */
    getPortOptionList(ports, networkId, isReadOnly) {
        return ports.map((i) => {
            let networks = i.networks.filter((nw) => nw.networkId !== networkId);
            return { 
                value: i.portSeqNo, 
                name: i.portNo + '：' + i.name +(!isReadOnly && networks.length > 0 ? ' ★' : '') 
            }
        });                                        
    }

    /**
     * 保存が無効かどうかを取得する
     * @param {object} validate 入力検証結果
     * @returns {boolean} 保存が無効かどうか
     */
    invalid(validate) {
        var invalid = false;
        for (const key in validate) {
            if (validate.hasOwnProperty(key) && 
                validate[key].state !== VALIDATE_STATE.success) {
                    invalid = true;
                    break; 
            }
        }
        return invalid;
    }
    
    /**
     * 接続解除イベントの呼び出し
     */
    onDisconnect() {
        if (this.props.onDisconnect) {
            this.props.onDisconnect()
        }
    }
}

UnitPortBox.propTypes = {
    networkId: PropTypes.number,
    unitDispSetting: PropTypes.shape({
        dispSetId: PropTypes.string.isRequired,
        units: PropTypes.arrayOf(PropTypes.shape({
            unitId: PropTypes.string.isRequired,
            unitNo: PropTypes.number.isRequired,
            name: PropTypes.string.isRequired,
            ports:PropTypes.array
        }))
    }),
    unit: PropTypes.shape({
        unitId: PropTypes.string.isRequired,
        unitNo: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        ports:PropTypes.arrayOf(PropTypes.shape({
            portSeqNo: PropTypes.string.isRequired,
            portNo: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            networks: PropTypes.array
        }))
    }),
    port:PropTypes.shape({
        portSeqNo: PropTypes.string.isRequired,
        portNo: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        networks: PropTypes.arrayOf(PropTypes.shape({
            networkId: PropTypes.string.isRequired,
            portIndex: PropTypes.number
        }))
    }),
    portIndex: PropTypes.number,
    isLeft: PropTypes.bool,
    isReadOnly: PropTypes.bool,
    isConnect: PropTypes.bool,
    isEditMode: PropTypes.bool,
    isLoading: PropTypes.bool,
    onChangeUnit: PropTypes.func,
    onChangePort: PropTypes.func,
    onChangePortIndex: PropTypes.func, 
    onDisconnect: PropTypes.func
}