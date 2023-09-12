/**
 * Copyright 2017 DENSO Solutions
 * 
 * 演算設定モーダル Reactコンポーネント
 *  
 */
'use strict';

import React, { Component } from 'react';
import { Modal, Row, Col, FormGroup } from 'react-bootstrap';
import { OPERATION, OPERAND_TYPE, CALC_TYPE, SUM_TYPE, SUM_TYPE_OPTIONS, GROUPALARM_OPTIONS, validateConstantValue } from 'expressionUtility';
import Icon from 'Common/Widget/Icon';
import Button from 'Common/Widget/Button';
import ToggleSwitch from 'Common/Widget/ToggleSwitch';
import CheckboxSwitch from 'Common/Widget/CheckboxSwitch';
import SelectForm from 'Common/Form/SelectForm';
import TextForm from 'Common/Form/TextForm';
import { CancelButton, ApplyButton } from 'Assets/GarmitButton';
import AddPointContents from 'Point/CalcPointSetting/AddPointContents';
import ConstValueContents from 'Point/CalcPointSetting/AddConstValueContents.jsx';

/**
 * 演算設定モーダル
 */
export default class CalcSettingModal extends Component {

    constructor(props) {
        super(props);
        this.state = this.getInitialState(this.props.calcInfo, this.props.isGroupAlarm);
    }

    /**
     * 新しいpropsを受け取ると実行される
     * @param {any} nextProps
     */
    componentWillReceiveProps(nextProps) {
        if (nextProps.show && !this.props.show) {
            // モーダルを開く
            this.setState(this.getInitialState(nextProps.calcInfo, nextProps.isGroupAlarm));
        }
    }

    //#region イベントハンドラ
    /**
     * 演算対象ポイント種別変更イベント
     */
    handleChangeType(type) {
        this.setState({
            operandType: type,
            constValues: [this.getEmptyConstantValue()],
            sumType: SUM_TYPE.total,
            applicable: type === OPERAND_TYPE.point || this.props.isGroupAlarm ? true : false,
            isCoef: false
        });
    }

    /**
     * ボタンクリックイベント
     */
    handleClick(type, data) {
        switch (type) {
            case OPERATION.add:
                this.addConstantValue();            //固定値追加ボタン押下時
                break;
            case OPERATION.delete:
                this.deleteConstantValue(data);    //固定値削除ボタン押下時
                break;
            case OPERATION.apply:
                if (this.props.onClick) {
                    this.props.onClick(type, this.state); //適用ボタン押下時
                }
                break;
            case OPERATION.cancel:
                if (this.props.onClick) {
                    this.props.onClick(type, data); //その他ボタン押下時（キャンセル、×）
                }
                break;
            default: break;
        }
    }

    /**
     * 固定値変更イベント
     * @param {int} index　変更された固定値のインデックス
     * @param {int} value  変更された値
     */
    handleChangeConstantValue(index, value) {
        let update = $.extend(true, [], this.state.constValues);
        update[index].value = value;
        update[index] = Object.assign({}, update[index], validateConstantValue(value));
        this.setState({ constValues: update, applicable: _.every(update, {'state':'success'}) });
    }
    //#endregion

    //#region render
    /**
     * render
     */
    render() {
        const { isLoading, isGroupAlarm, show, calcInfo } = this.props;
        const { operandType, sumType, calcType, constValues, isAbsolute, isCoef, applicable } = this.state;

        return (
            <Modal bsSize="sm" show={show} onHide={() => this.handleClick(OPERATION.cancel)} backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>演算設定</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {!isGroupAlarm &&
                        <OperandTypeSwitch
                            disabled={isLoading}
                            selectValue={operandType}
                            onChange={(value) => this.handleChangeType(value)}
                        />
                    }
                    {calcInfo.paramNo !== 1 &&
                        <OperandSelectForm calcType={calcType} onClick={(selected) => this.setState({ calcType: selected })} />
                    }
                    <SumTypeSelectForm
                        isGroupAlarm={isGroupAlarm}
                        isFixed={operandType === OPERAND_TYPE.constant && constValues.length<=1}
                        value={sumType}
                        isReadOnly={isLoading}
                        onChange={(selected) => this.setState({ sumType: !isNaN(selected) && Number(selected) })}
                    />
                    {operandType === OPERAND_TYPE.constant &&
                        <ConstantForm
                            constValues={constValues}
                            onClick={(type, index) => this.handleClick(type, index)}
                            onChange={(index, value) => this.handleChangeConstantValue(index, value)}
                        />
                    }
                    {!isGroupAlarm &&
                        <SwitchGroup
                            showIsCoefSwitch={operandType === OPERAND_TYPE.point}
                            disabled={isLoading}
                            isAbsolute={isAbsolute}
                            isCoef={isCoef}
                            onChangeCalcPoint={(checked) => this.setState({isAbsolute:checked})}
                            onChangeIsCoef={(checked) => this.setState({isCoef:checked})}
                        />
                    }
                </Modal.Body>
                <ModalFooter
                    isLoading={isLoading}
                    applicable={applicable}
                    onClick={(type) => this.handleClick(type)}
                />
            </Modal>
        )
    }
    //#endregion

    //#region その他関数
    /**
     * stateの初期値を取得する
     */
    getInitialState(calcInfo, isGroupAlarm) {
        const calcDetails = _.get(calcInfo, "calcDetails", []); 
        const constValues = calcDetails.map((info) => {
            const validation = validateConstantValue(info.constValue);
            return { ...validation, value: info.constValue };
        });
        const operandType = _.get(calcDetails, "[0].valueType", OPERAND_TYPE.point);
        const calcType = calcInfo.paramNo === 1 ? null : calcInfo.calcType ? calcInfo.calcType : CALC_TYPE.plus.id;
        const applicable = operandType === OPERAND_TYPE.point || isGroupAlarm ? true : _.every(constValues, { "state": "success" });
        const isCoef = _.get(calcInfo, "isCoef", null);
        return {
            operandType: operandType,
            calcType: calcType,
            sumType: calcInfo.sumType !== 0 && calcInfo.sumType ? calcInfo.sumType : SUM_TYPE.total,
            constValues: isGroupAlarm ? null: constValues.length >0 ? constValues : [this.getEmptyConstantValue()],
            isAbsolute: calcInfo.isAbsolute,
            isCoef: isCoef === null ? _.get(calcInfo, "calcDetails[0].isCoef", false):isCoef,   //未設定の場合は一番目の値の換算値状態使用
            applicable: applicable
        };
    }

    /**
     * 固定値追加
     */
    addConstantValue() {
        let update = $.extend(true, [], this.state.constValues);
        update.push(this.getEmptyConstantValue());
        this.setState({ constValues: update, applicable: _.every(update, { 'state': 'success' })  });
    }

    /**
     * 空の固定値取得
     */
    getEmptyConstantValue() {
        const validation = validateConstantValue(null);
        return { ...validation, value: "" };
    }

    /**
     * 固定値削除
     */
    deleteConstantValue(index) {
        let update = $.extend(true, [], this.state.constValues);
        if (update.length > 1) {    //常に1つは表示する
            update.splice(index, 1);    //対象インデックスの値を削除
            this.setState({ constValues: update, applicable: _.every(update, { 'state': 'success' })  });
        }
    }
    //#endregion
}

CalcSettingModal.propTypes = {
    show: PropTypes.bool,               //モーダルを表示するかどうか
    isGroupContents: PropTypes.bool,    //グループアラームモードかどうか
    isLoading: PropTypes.bool,          //ロード中かどうか
    calcInfo: PropTypes.Object,         //演算式情報
    onClick: PropTypes.func,            //ボタン押下イベント関数
    onChangeCalcPoint: PropTypes.func,  //calcPoint情報変更イベント関数
}

//#region SFC
/**
* 演算項種別選択スイッチ
*/
const OperandTypeSwitch = (props) => {
    const swichValues = [
        { value: OPERAND_TYPE.point, text: "ポイント" },
        { value: OPERAND_TYPE.constant, text: "固定値" }
    ];

    return (
        <div className="mb-1">
            <ToggleSwitch
                disbled={props.disabled}
                name="typeSelectSwitch"
                swichValues={swichValues}
                value={props.selectValue}
                onChange={(value) => props.onChange && props.onChange(value)}
            />
        </div>
    );
}

/**
* 絶対値・換算値スイッチグループ
*/
const SwitchGroup = ({ showIsCoefSwitch, isLoading, isAbsolute, isCoef, onChangeCalcPoint:handleChangeCalcPoint, onChangeIsCoef:handleChangeIsCoef }) => {
    return (
        <div className="flex-center-left mt-1">
            <div className="mr-05">
                <CheckboxSwitch
                    disabled={isLoading}
                    text="絶対値"
                    checked={isAbsolute}
                    onChange={handleChangeCalcPoint}
                />
            </div>
            {showIsCoefSwitch &&
                <CheckboxSwitch
                    disabled={isLoading}
                    text="換算値"
                    checked={isCoef}
                    onChange={handleChangeIsCoef}
                />
            }
        </div>
    );
}

/**
* 演算子選択フォーム
*/
const OperandSelectForm = ({ calcType, onClick:handleClick }) => {
    return (
        <Row className="flex-center">
            <Col xs={4}>
                <label>演算：</label>
            </Col>
            <Col xs={8}>
                <OperatorButtonGroup calcType={calcType} onClick={handleClick} />
            </Col>
        </Row>
    );
}

/**
* 演算子ボタングループ
*/
const OperatorButtonGroup = ({ calcType, onClick:handleClick }) => {
    return (
        <FormGroup className="flex-center mlr-05">
            <OperatorButton
                operand={CALC_TYPE.plus}
                calcType={calcType}
                onClick={handleClick.bind(this, CALC_TYPE.plus.id)}
            />
            <OperatorButton
                operand={CALC_TYPE.minus}
                calcType={calcType}
                onClick={handleClick.bind(this, CALC_TYPE.minus.id)}
            />
            <OperatorButton
                operand={CALC_TYPE.times}
                calcType={calcType}
                onClick={handleClick.bind(this, CALC_TYPE.times.id)}
            />
            <OperatorButton
                operand={CALC_TYPE.divide}
                calcType={calcType}
                onClick={handleClick.bind(this, CALC_TYPE.divide.id)}
            />
        </FormGroup>
    );
}

/**
* 演算子ボタン
*/
const OperatorButton = (props) => {
    const { operand, calcType, onClick:handleClick } = props;
    return (
        <Button
            style={{ width: "40px" }}
            bsStyle={calcType === operand.id ? "warning" : "default"}
            onClick={handleClick}
        >
            {operand.value}
        </Button>
    );
};

/**
* 集計種別選択フォーム
*/
const SumTypeSelectForm = ({ isGroupAlarm, value, isReadOnly, isFixed, onChange:handleChange }) => {
    return (
        <Row className="flex-center">
            <Col xs={4}>
                <label>集計：</label>
            </Col>
            <Col xs={8}>
                {isFixed ?
                    <TextForm isReadOnly={true} value="なし" />
                    :
                    <SelectForm
                        value={value}
                        options={isGroupAlarm ? GROUPALARM_OPTIONS:SUM_TYPE_OPTIONS}
                        isReadOnly={isReadOnly}
                        isRequired={true}
                        onChange={handleChange}
                    />
                }
            </Col>
        </Row>
    );
}

/**
* 固定値フォーム
*/
const ConstantForm = ({ constValues, onClick: handleClick, onChange:handleChange }) => {
    return (
        <Row>
            <Col xs={4}>
                <label>固定値：</label>
            </Col>
            <Col xs={8}>
                <ConstValueContents valueList={constValues} onClick={handleClick} onChange={handleChange} />
            </Col>
        </Row>
    );
}

/**
* モーダルフッター
*/
const ModalFooter = ({ isLoading, applicable, onClick:handleClick }) => {
    return (
        <Modal.Footer>
            <ApplyButton
                disabled={isLoading || !applicable}
                onClick={() => handleClick(OPERATION.apply)}
            />
            <CancelButton
                disabled={isLoading}
                onClick={() => handleClick(OPERATION.cancel)}
            />
        </Modal.Footer>
    );
}
//#endregion