/**
 * @license Copyright 2018 DENSO
 * 
 * ユニット選択フォーム Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import InputForm from 'Common/Form/InputForm';
import SelectForm from 'Common/Form/SelectForm';
import LabelForm from 'Common/Form/LabelForm';
import { hasUnit } from 'assetUtility';
import { compareAscending } from 'sortCompare';

/**
 * ユニット選択フォームコンポーネント
 * @param {string} className className
 * @param {array} units ユニットリスト
 * @param {boolean} isReadOnly 読み取り専用かどうか
 * @param {object} selectedUnit 選択中のユニット
 * @param {function} onSelectUnit ユニットを選択したときに呼び出す
 * @param {function} onAddUnit 追加ボタン押下時に呼び出す
 * @param {function} onDeleteUnit 削除ボタン押下時に呼び出す
 */
export default class UnitSelectForm extends Component {

    /**
     * render
     */
    render() {
        const { className, units, isReadOnly, selectedUnit, isLoading } = this.props;
        const isSelectedUnit = hasUnit(selectedUnit);
        const isSelectedPosition = this.isSelectedPosition(selectedUnit);
        const hasUnits = units.some((unit) => unit.unitId);
        const sortUnits = units.sort((current, next) => compareAscending(current.unitNo, next.unitNo));

        return (
            <InputForm className={className}>
                <InputForm.Row>
                    <InputForm.Col label='ユニット選択' columnCount={1} >
                        {hasUnits&&isSelectedUnit?
                            <SelectForm value={isSelectedUnit ? selectedUnit.unitId : null} 
                                        isReadOnly={isReadOnly||isLoading}
                                        isRequired={true}
                                        options={sortUnits.map((i) => {return { value: i.unitId, name: i.unitNo + '：' + i.name }})} 
                                        onChange={(value) => this.onSelectUnit(value)}
                                        addonButton={!isReadOnly&&this.addonButtons(isSelectedUnit, isLoading)}
                            />
                        :
                            <LabelForm value={isReadOnly&&isSelectedPosition?"(新規ユニット)":"(なし)"} addonButton={!isReadOnly&&this.addonButtons(isSelectedUnit, isLoading)} />
                        }
                        
                    </InputForm.Col>
                </InputForm.Row>
            </InputForm>
        );
    }

    /**
     * 位置の選択がされているかどうか
     * @param {object} unit 
     */
    isSelectedPosition(unit) {
        if (unit&&unit.position) {
            if (unit.position.x&&unit.position.y) {
                return true;
            }
        } 
        return false;
    }

    /**
     * ボタンを作成する
     * @param {boolean} isSelectedUnit 選択中ユニットがあるかどうか
     * @param {boolean} isLoading ロード中かどうか
     */
    addonButtons(isSelectedUnit, isLoading){
        var buttons = [];
        buttons.push({
            key:1, 
            iconId: 'add',
            label:'追加', 
            bsStyle:'primary', 
            disabled: isLoading,
            onClick:() => this.onAddUnit() 
        });

        if (isSelectedUnit) {
            buttons.push({
                key:2, 
                iconId: 'delete',
                label:'削除', 
                disabled: isLoading,
                onClick:() => this.onDeleteUnit() 
            });
        }

        return buttons;
    }

    /**
     * ユニット選択イベントを発生させる
     * @param {string} unitId ユニットID
     */
    onSelectUnit(unitId){
        if (this.props.onSelectUnit) {
            this.props.onSelectUnit(unitId);
        }
    }

    /**
     * 削除イベントを発生させる
     */
    onDeleteUnit(){
        if (this.props.onDeleteUnit) {
            this.props.onDeleteUnit();
        }
    }

    /**
     * 追加イベントを発生させる
     */
    onAddUnit(){
        if (this.props.onAddUnit) {
            this.props.onAddUnit();
        }
    }
}

UnitSelectForm.propTypes = {
    className: PropTypes.string,
    units: PropTypes.arrayOf(PropTypes.shape({
        unitId: PropTypes.string.isRequired,
        unitNo: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
    })),
    isReadOnly: PropTypes.bool,
    selectedUnit: PropTypes.shape({
        unitId: PropTypes.string.isRequired,
        unitNo: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
    }),
    onSelectUnit: PropTypes.func,
    onAddUnit: PropTypes.func,
    onDeleteUnit: PropTypes.func
}