/**
 * Copyright 2017 DENSO Solutions
 * 
 * 選択肢情報編集フォーム Reactコンポーネント
 *  
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import AddableInputForm from 'Assets/AddableInputForm';
import DeletableInputForm from 'Assets/DeletableInputForm';
import Button from 'Common/Widget/Button';
import TextForm from 'Common/Form/TextForm';

export default class OptionInfoEditForm extends Component {

    constructor(props) {
        super(props)
        this.state = {
        }
    }

    //#region イベント関数
    /**
     * 削除ボタン押下イベント
     * @param {number} index 削除対象フォームのインデックス
     * @param {string} type フォームの種別
     */
    handleDeleteForm(index, type) {
        let updateChoices = [];
        var choices = $.extend(true, [], this.props.formInfo);

        choices.forEach((item, idx) => {    //削除後の選択肢情報作成
            if (idx !== index) {
                updateChoices.push({ itemId: item.itemId, choiceNo: item.choiceNo, choiceName: item.choiceName });
            }
        });    
        if (this.props.onChangeChoices && updateChoices.length >0) {
            this.props.onChangeChoices(updateChoices);
        }
    }

    /**
     * 値変更イベント
     * @param {number} index 編集対象フォームのインデックス
     * @param {string} value 入力/選択された値
     */
    handleChange(index, value) {
        let updateChoices = [];
        var choices = $.extend(true, [], this.props.formInfo);
        choices.forEach((item, idx) => {    //変更後の選択肢情報作成
            const updateName = index === idx ? value : item.choiceName
            updateChoices.push({
                itemId: item.itemId,
                choiceNo: item.choiceNo,
                choiceName: updateName
            });
        });
        if (this.props.onChangeChoices) {
            this.props.onChangeChoices(updateChoices);
        }
    }
    //#endregion

    //#region render
    render() {
        const { maxNumber, formInfo, className, placeholder, isReadOnly, disabled } = this.props;
        const { dispNumber } = this.state;

        return (
            <AddableInputForm
                displayFormNumber={formInfo.length}
                maxNumber={50}
                isReadOnly={isReadOnly}
                onAddForm={() => this.props.onAddForm && this.props.onAddForm()}
            >
                <div>
                {formInfo && formInfo.length>0 &&
                    formInfo.map((info, index) => {
                        return (
                            <DeletableTextForm
                                value={info}
                                isReadOnly={isReadOnly}
                                disabled={disabled}
                                onChange={(value) => this.handleChange(index, value)}
                                onClickDelete={() => this.handleDeleteForm(index)}
                            />
                        )
                    })
                }
                </div>
            </AddableInputForm>

        );
    }
    //#endregion
}

OptionInfoEditForm.propTypes = {
    maxNumber: PropTypes.number,                //フォームを最大何個表示させるか
    formInfo: PropTypes.array,                  //フォーム情報の配列
    className: PropTypes.string,                //テキストボックスまたはセレクトフォームに指定するクラス名称
    placeholder:PropTypes.string,               //プレースホルダー（テキストボックスのみ）
    isReadOnly: PropTypes.bool,                 //読み取り専用かどうか
    disabled: PropTypes.bool,                   //無効かどうか
    onAddForm: PropTypes.func                   //フォーム追加イベント関数
}

/**
 * テキストフォーム
 */
const DeletableTextForm = (props) => {
    const { value, isReadOnly, disabled, onChange: handleChange } = props;
    return (
        <DeletableInputForm validationState={_.get(value, "validationState")} isReadOnly={isReadOnly} onClickDelete={() => props.onClickDelete()}>
            <TextForm
                className={classNames({ 'disable-formgroup': disabled }, "mb-0") }
                value={value ? value.choiceName : null}
                placeholder="項目名"
                isReadOnly={isReadOnly}
                onChange={(value) => handleChange(value)}
                maxlength={32}
            />
        </DeletableInputForm>
    );
}