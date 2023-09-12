/**
 * Copyright 2017 DENSO Solutions
 * 
 * データ/書式インプットフォーム Reactコンポーネント
 *  
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Grid, Row, Col, Checkbox, FormGroup } from 'react-bootstrap';

import InputTable from 'Common/Form/InputTable';
import TextForm from 'Common/Form/TextForm';
import SelectForm from 'Common/Form/SelectForm';
import DateTimePicker from 'Common/Widget/DateTimePicker';

import OptionInfoEditForm from 'Assets/RackUnitPageSetting/OptionInfoEditForm';
import DateTimeFormatSelectForm from 'Assets/RackUnitPageSetting/DateTimeFormatSelectForm';

import { validateText, validateInteger } from 'inputCheck';
import { getDateFormat, getTimeFormat, hasTimeFormat } from 'datetimeUtility';

export default class DataFormtInputForm extends Component {

    constructor(props) {
        super(props)
        this.state = {
            
        }
    }    

    /**********************************
    * 
    * イベントハンドラ
    * 
    **********************************/

    /**
     *日付時刻フォーマット変更イベント
     */
    handleChangeDateTimeFormat(format) {
        if (this.props.onChange) {
            this.props.onChange({ dateTimeFormat:format });
        }
    }

    /**
     * 実数フォーマット変更イベント
     */
    handlChangeRealFormat(format) {
        if (this.props.onChange) {
            this.props.onChange({ realFormat: format });
        }
    }

    /**
     * 選択肢情報変更イベント
     * @param {array} nextChoices 選択肢情報
     */
    handleChangeChoices(nextChoices) {
        if (this.props.onChange) {
            this.props.onChange({ choices:nextChoices });
        }
    }

    /**
     * 選択肢追加イベント
     */
    handleAddForm() {
        if (this.props.onChange) {
            const choices = this.props.option.choices;
            const choiceNo = _.maxBy(choices, 'choiceNo').choiceNo+1;
            let update = _.cloneDeep(choices);
            update.push(this.getEmptySelectForm(this.props.itemId, choiceNo));
            this.props.onChange({ choices: update });
        }
    }

    /**
     * render
     */
    render() {
        const { type, disabled, isReadOnly, option } = this.props;

        if (type === 3) {         //日付時刻型
            return (
                <DateTimeFormatSelectForm
                    isReadOnly={isReadOnly}
                    isTimeOnly={option.checked}
                    dateFormatValue={option.dateFormatValue}
                    timeFormatValue={option.timeFormatValue}
                    disabled={disabled}
                    onChangeFormat={(format)=>this.handleChangeDateTimeFormat(format)}
                />
            );
        }
        if (type === 2) {         //実数型
            return (
                <TextForm
                    isReadOnly={isReadOnly}
                    className={classNames({ 'disable-formgroup': disabled })}
                    validationState={option.validationState.state}
                    helpText={option.validationState.helpText}
                    value={option.format}
                    placeholder="#0.0"
                    onChange={(value) => this.handlChangeRealFormat(value)}
                    maxlength={32}
                />
            );
        }
        else if (type === 4) {    //選択肢型
            return (
                <OptionInfoEditForm
                    isReadOnly={isReadOnly}
                    disabled={disabled}
                    maxLength={32}  //選択肢の長さの最大
                    formInfo={option.choices}
                    onAddForm={() => this.handleAddForm()}
                    onChangeChoices={(nextChoices) => this.handleChangeChoices(nextChoices)}
                />
            );
        }
        return <div />            //それ以外
    }

    /**
     * 選択肢の中からname一致する選択肢のvalueを返却する
     * @param {string} format 検索するフォーマット
     * @param {array} options　選択肢一覧
     */
    getMatchFormatValue(format, options) {
        var match = options.find((option) => {
            return format === option.name;
        });
        return match ? match.value : -1; //一致するものがなければ-1を返す
    }

    /**
     * 空の選択肢情報を追加する
     * @param {number} itemId
      * @param {number} choiceNo
     */
    getEmptySelectForm(itemId, choiceNo) {
        return { itemId: itemId, choiceNo: choiceNo, choiceName: "" };
    }
}

DataFormtInputForm.propTypes = {
    isReadOnly:PropTypes.bool,  //読み取り専用かどうか
    disabled: PropTypes.bool,   //無効状態かどうか（列の背景色変更）
    type: PropTypes.number,
    format: PropTypes.string,
    choices: PropTypes.array,
    validationState: PropTypes.shape({
        state: PropTypes.string,
        helpText: PropTypes.string
    }),
    changeRealFormat: PropTypes.func,
    onChangeFormatCheck: PropTypes.func
}