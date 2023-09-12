/**
 * @license Copyright 2018 DENSO
 * 
 * DsettingUnitSelectForm Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import InputForm from 'Common/Form/InputForm';
import SelectForm from 'Common/Form/SelectForm';

import { validateSelect } from 'inputCheck';
import { compareAscending } from 'sortCompare';

/**
 * 表示設定の前面背面ユニットを選択するフォームコンポーネント
 * @param {object} frontUnit 前面ユニット
 * @param {object} rearUnit 背面ユニット
 * @param {array} units ユニット一覧
 * @param {boolean} isReadOnly 読み取り専用かどうか
 * @param {function} onSelect ユニット選択時に呼び出す
 */
export default class DsettingUnitSelectForm extends Component {
    
    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);

        const { frontUnit, rearUnit, isReadOnly } = props;
        this.state = { 
            validate: this.validateAllItems(frontUnit, rearUnit, isReadOnly)
        };
    }

    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps( nextProps ){
        const { frontUnit, rearUnit, isReadOnly } = nextProps;
        this.setState({validate:  this.validateAllItems(frontUnit, rearUnit, isReadOnly)});
    }

    /**
     * render
     */
    render() {
        const { frontUnit, rearUnit, units, isReadOnly } = this.props;
        const { validate } = this.state;
        const sortUnits = units.sort((current, next) => compareAscending(current.unitNo, next.unitNo));
        return (
            <InputForm>
                <InputForm.Row>
                    <InputForm.Col label="前面ユニット" columnCount={2}>
                        <SelectForm value={frontUnit&&frontUnit.unitId} 
                                    isReadOnly={isReadOnly}
                                    options={
                                        sortUnits.map((i) => {return { value: i.unitId, name: i.unitNo + '：' + i.name }})
                                    } 
                                    validationState={validate.frontUnit.state}
                                    helpText={validate.frontUnit.helpText}
                                    onChange={(unitId) => this.selectUnit(unitId, true)} />
                    </InputForm.Col>
                    <InputForm.Col label="背面ユニット" columnCount={2}>
                        <SelectForm value={rearUnit&&rearUnit.unitId} 
                                    isReadOnly={isReadOnly}
                                    options={
                                        sortUnits.map((i) => {return { value: i.unitId, name: i.unitNo + '：' + i.name }})
                                    } 
                                    validationState={validate.rearUnit.state}
                                    helpText={validate.rearUnit.helpText}
                                    onChange={(unitId) => this.selectUnit(unitId, false)} 
                        />
                    </InputForm.Col>
                </InputForm.Row>
            </InputForm>
        );
    }
    
    /**
     * ユニットを選択する。
     * @param {string} unitId ユニットID
     * @param {boolean} isFront 前面か背面か
     */
    selectUnit(unitId, isFront) {
        const { units } = this.props;
        const target = units.find((unit) => unit.unitId === unitId);
        if (this.props.onSelect) {
            const frontUnit = isFront ? target : this.props.frontUnit;
            const rearUnit = !isFront ? target : this.props.rearUnit;
            this.props.onSelect(target, this.isError(frontUnit, rearUnit), isFront);
        }
    }

    /**
     * エラーかどうか
     * @param {object} frontUnit 前面ユニット
     * @param {object} rearUnit 背面ユニット
     * @returns {boolean} エラーかどうか
     */
    isError(frontUnit, rearUnit) {
        if (!(frontUnit && rearUnit)) {
            return true;
        }
        return false;
    }

    /**
     * 全項目の入力検証
     * @param {object} frontUnit 前面ユニット
     * @param {object} rearUnit 背面ユニット
     * @param {boolean} isReadOnly 読み取り専用かどうか
     */
    validateAllItems(frontUnit, rearUnit, isReadOnly) {
        var validate = {
            frontUnit: { state: null },
            rearUnit: { state: null }
        };
        if (!isReadOnly) {
            validate = {
                frontUnit: validateSelect(frontUnit&&frontUnit.unitId),
                rearUnit: validateSelect(rearUnit&&rearUnit.unitId)
            };
        }
        return validate;
    }

}

DsettingUnitSelectForm.propTypes = {
    frontUnit: PropTypes.shape({
        unitId: PropTypes.string.isRequired,
        unitNo: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        frontFlg: PropTypes.bool,
        rearFlg: PropTypes.bool
    }),
    rearUnit: PropTypes.shape({
        unitId: PropTypes.string.isRequired,
        unitNo: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        frontFlg: PropTypes.bool,
        rearFlg: PropTypes.bool
    }),
    units: PropTypes.arrayOf(PropTypes.shape({
        unitId: PropTypes.string.isRequired,
        unitNo: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        frontFlg: PropTypes.bool,
        rearFlg: PropTypes.bool
    })),
    isReadOnly: PropTypes.bool,
    onSelect: PropTypes.func
}