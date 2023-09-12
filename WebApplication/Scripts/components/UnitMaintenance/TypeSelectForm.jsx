/**
 * Copyright 2017 DENSO Solutions
 * 
 * 種別選択フォーム Reactコンポーネント
 *  
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import AddableInputForm from 'Assets/AddableInputForm';
import DeletableInputForm from 'Assets/DeletableInputForm';
import Button from 'Common/Widget/Button';
import SelectForm from 'Common/Form/SelectForm';

export default class TypeSelectForm extends Component {

    constructor(props) {
        super(props)
        this.state = {
        }
    }

    //#region イベント関数
    /**
     * 追加ボタン押下イベント
     * @param {array} options 選択肢情報
     * @param {array} formInfo フォーム情報
     */
    handleAddForm(options, formInfo) {
        if (this.props.onChangeTypes) {
            let update = _.cloneDeep(formInfo);
            let addOptions = _.find(options, { disabled: false });
            update.push({ typeId: addOptions.value, name: addOptions.name });
            this.props.onChangeTypes(update);
        }
    }

    /**
     * 削除ボタン押下イベント
     * @param {number} index 削除対象フォームのインデックス
     * @param {number} formNumber 表示中フォームの数
     */
    handleDeleteForm(index, formNumber) {
        if (this.props.onChangeTypes) {
            let updateChoices = [];
            var choices = $.extend(true, [], this.props.formInfo);
            choices.forEach((item, idx) => {    //削除後の選択肢情報作成（削除、choiceNoをずらす）
                if (idx !== index) {
                    updateChoices.push(item);
                }
            });
            this.props.onChangeTypes(updateChoices);
        }
    }

    /**
     * 値変更イベント
     * @param {number} index 編集対象フォームのインデックス
     * @param {string} value 入力/選択された値
     */
    handleChange(index, value) {
        if (this.props.onChangeTypes) {
            let updateChoices = [];
            var choices = $.extend(true, [], this.props.formInfo);
            choices.forEach((item, idx) => {
                if (idx === index) {
                    item.typeId = Number(value.value);
                    item.name = value.name;
                }
                updateChoices.push(item);
            });
            this.props.onChangeTypes(updateChoices);
        }
    }
    //#endregion

    //#region render
    render() {
        const { formInfo, options, isReadOnly } = this.props;
        //選択済みの選択肢はdisableにする
        let optionsWithDisabled = _.cloneDeep(options);
        optionsWithDisabled.forEach((option) => {
            if (_.find(formInfo, (info) => { return info.typeId === option.value })) {
                option.disabled = true;
            }
            else {
                option.disabled = false;
            }
        })

        return (
            <AddableInputForm
                displayFormNumber={formInfo.length}
                maxNumber={options.length}
                isReadOnly={isReadOnly}
                onAddForm={() => this.handleAddForm(optionsWithDisabled, formInfo)}
            >
                <div>
                {formInfo && formInfo.length>0 &&
                    formInfo.map((info, index) => {
                        return (
                            <DeletableSelectForm
                                value={info}
                                isReadOnly={isReadOnly}
                                options={optionsWithDisabled}
                                onChange={(value) => this.handleChange(index, this.getMatchValue(options, Number(value)))}
                                onClickDelete={() => this.handleDeleteForm(index, formInfo.length)}
                            />
                        )
                    })
                }
                </div>
            </AddableInputForm>

        );
    }

     /**
     * typeIdが一致する選択肢情報を取得する
     */
    getMatchValue(options, selectValue) {
        const index = options.findIndex((item) => {
            return item.value === selectValue
        });
        if (index >= 0) {
            return options[index];
        }
    }
    //#endregion
}

TypeSelectForm.propTypes = {
    formInfo: PropTypes.array,                  //フォーム情報の配列
    options: PropTypes.array,                   //選択肢
    isReadOnly: PropTypes.bool,                 //読み取り専用かどうか
    onChangeTypes: PropTypes.func               //フォーム情報変更イベント関数
}

/**
 * 選択肢フォーム
 */
const DeletableSelectForm = (props) => {
    const { value, options, isReadOnly, onChange: handleChange } = props;
    const _options = _.cloneDeep(options);
    const index = _.findIndex(_options, { 'value': value.typeId });
    _.set(_options, [index, "disabled"], false);    //自分自身の選択値は選択可能とする
    return (
        <DeletableInputForm validationState={_.get(value, "validationState")} isReadOnly={isReadOnly} onClickDelete={() => props.onClickDelete()}>
            <SelectForm
                isRequired={true}
                value={value ? value.typeId:null }
                options={_options}
                isReadOnly={isReadOnly}
                onChange={(selectValue) => handleChange(selectValue)}
            />
        </DeletableInputForm>
    );
}