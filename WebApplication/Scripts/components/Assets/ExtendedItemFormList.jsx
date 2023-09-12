/**
 * @license Copyright 2020 DENSO
 * 
 * 詳細項目リスト Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import TextForm from 'Common/Form/TextForm';
import SelectForm from 'Common/Form/SelectForm';
import TextareaForm from 'Common/Form/TextareaForm';
import DateTimeForm from 'Common/Form/DateTimeForm';

import { VALIDATE_STATE } from 'inputCheck';
import { validateExtendedItem, isErrorExtendedItems } from 'assetUtility';
import { hasTimeFormat } from 'datetimeUtility';
import { TYPE, MAXLENGTH_EXTENDED_DATA } from 'extendedDataUtility';
import { compareAscending } from 'sortCompare';

/**
 * 詳細項目リストコンポーネント
 * InputFormタグは使用していない
 * 項目を変更すると、詳細項目全てのデータをonChange()で返却する
 * @param {array} extendedItems 詳細項目一覧
 * @param {boolean} isReadOnly 読み取り専用かどうか
 * @param {boolen} isSysAdmin システム管理者かどうか
 * @param {function} onChange 項目が変更されたときに呼び出す。詳細項目全てを返却する。
 */
export default class ExtendedItemFormList extends Component {
    
    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
    }

    /**
     * render
     */
    render() {
        const { extendedItems, isReadOnly, isSysAdmin } = this.props;
        var items = extendedItems ? extendedItems.filter((i) => i.enable === true && (!i.isSysAdmin || isSysAdmin)) : undefined;        
        items = items.sort((currnet, next) => compareAscending(currnet.position, next.position));
        return (
            <div>
                {items&&items.length>0&&
                    items.map((item) => 
                        <DetailItem {...item} isReadOnly={isReadOnly} onChange={(id, value, isError) => this.handleItemChanged(id, value, isError)} />
                    )
                }
            </div>
        );
    }

    /********************************************
     * イベント関数
     ********************************************/

    /**
     * 項目変更イベント
     * @param {number} id 項目ID
     * @param {object} value 変更後の値
     * @param {boolean} isError エラーかどうか
     */
    handleItemChanged(id, value, isError){
        if (this.props.onChange) {
            const workItems = Object.assign([], this.props.extendedItems);
            workItems.some((item) => {
                if (item.itemId === id) {
                    if (item.type === TYPE.select && value < 0){
                        item.value = null;
                    } else {
                        item.value = value;
                    }
                    item.isError = isError;           
                }  
                return (item.itemId === id);                                  
            });
            const error = workItems ? isErrorExtendedItems(workItems) : false;
            this.props.onChange( workItems, error );
        }
    }
}


/**
 * 詳細情報の入力欄（1セル分）コンポーネント
 * @param {number} itemId 項目ID
 * @param {string} name 項目名
 * @param {object} value 値
 * @param {number} position 表示位置
 * @param {number} type 詳細種別
 * @param {string} format フォーマット
 * @param {boolean} enable 有効/無効
 * @param {object} choices 選択肢一覧
 * @param {boolean} isReadOnly 読み取り専用かどうか
 * @param {function} onChange 項目変更時に呼び出す
 */
class DetailItem extends Component {

    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
    }

    /**
     * render
     */
    render() {
        const { itemId, name, position, value, type, format, choices, isReadOnly, isRequired } = this.props;
        const validate = this.validate(value, type, format, isReadOnly, isRequired);
        return (this.createControl(itemId, type, name, value, format, choices, isReadOnly, validate, isRequired));
    }

    /**
     * コントロールを作成する
     * @param {number} id 項目ID
     * @param {number} type 項目種別
     * @param {string} name 項目名
     * @param {object} value 値
     * @param {string} formatStr フォーマット書式
     * @param {array} choices 選択肢一覧
     * @param {boolean} isReadOnly 読み取り専用かどうか
     * @param {object} validate 検証結果
     * @param {boolean} isRequired 必須項目かどうか
     * @returns {element} 作成したコントロール
     */
    createControl(id, type, name, value, formatStr, choices, isReadOnly, validate, isRequired){
        if (!value &&
            (type === TYPE.text || type === TYPE.integer || type === TYPE.real || type == TYPE.textArea)) {
            value = '';
        }
        
        const labelName = name + (!isReadOnly&&isRequired ? '*' : '');

        switch (type) {
            case TYPE.text:
            case TYPE.integer:
                return <TextForm id={id} 
                                 label={labelName}
                                 value={value} 
                                 isReadOnly={isReadOnly} 
                                 placeholder={formatStr} 
                                 validationState={validate.state}
                                 helpText={validate.helpText}
                                 onChange={(v) => this.handleItemChanged(id, v)} 
                                 maxlength={MAXLENGTH_EXTENDED_DATA.text}
                        />;
            case TYPE.real:
                return <TextForm id={id} 
                                 label={labelName}
                                 value={isReadOnly ? 
                                        (value ? format(formatStr, value) : null)  : value} 
                                 isReadOnly={isReadOnly}
                                 placeholder={formatStr} 
                                 validationState={validate.state}
                                 helpText={validate.helpText}
                                 onChange={(v) => this.handleItemChanged(id, v)} 
                        />;
            case TYPE.dateTime:
                return <DateTimeForm id={id} 
                                     label={labelName}
                                     value={value} 
                                     timePicker={hasTimeFormat(formatStr)} 
                                     isReadOnly={isReadOnly}
                                     format={formatStr} 
                                     validationState={validate.state}
                                     helpText={validate.helpText}
                                     onChange={(v) => this.handleItemChanged(id, v)} 
                        />;
            case TYPE.select:
                return <SelectForm id={id} 
                                   label={labelName}
                                   value={value} 
                                   isReadOnly={isReadOnly}
                                   validationState={validate.state}
                                   helpText={validate.helpText}
                                   onChange={(v) => this.handleItemChanged(id, v)} 
                                   options={choices.map((c) => { return {value: c.choiceNo, name: c.choiceName}; })} 
                />;
            case TYPE.textArea:
                return <TextareaForm id={id} 
                                     label={labelName}
                                     value={value} 
                                     isReadOnly={isReadOnly}
                                     placeholder={formatStr} 
                                     validationState={validate.state}
                                     helpText={validate.helpText}
                                     onChange={(v) => this.handleItemChanged(id, v)} 
                                     maxlength={MAXLENGTH_EXTENDED_DATA.textArea}
                        />;
        }
    }

    /********************************************
     * 入力変更時のイベント発生
     ********************************************/

    /**
     * 項目の変更イベントを発生させる
     * @param {number} id 項目ID
     * @param {object} value 変更後の値
     */
    handleItemChanged(id, value){
        if (this.props.onChange) {
            this.props.onChange(id, value, this.isError(value));
        }
    }
    
    /********************************************
     * 入力検証
     ********************************************/
    
    /**
     * 入力検証する
     * @param {object} value 値 
     * @param {number} type 種別
     * @param {string} format フォーマット
     * @param {boolean} isReadOnly 読み取り専用かどうか
     * @param {boolean} isRequired 必須かどうか
     * @returns {object} 検証結果
     */
    validate(value, type, format, isReadOnly, isRequired) {
        if (!isReadOnly) {
            return validateExtendedItem(value, type, format, isRequired);
        }
        return { state: null };
    }

    /**
     * エラーかどうか
     * @param {object} value 対象の値
     * @returns {boolean} エラーかどうか
     */
    isError(value) {
        const { type, format, isReadOnly, isRequired } = this.props;
        const validate = this.validate(value, type, format, isReadOnly, isRequired);
        return !(validate.state === VALIDATE_STATE.success);
    }
    
}

ExtendedItemFormList.propTypes = {
    extendedItems: PropTypes.arrayOf(PropTypes.shape({
        itemId: PropTypes.number.isRequired,
        name: PropTypes.string,
        value: PropTypes.object,            //各データごとに違う
        position: PropTypes.number,
        type: PropTypes.number.isRequired,
        format: PropTypes.string,
        alarm: PropTypes.bool,
        noticeDays: PropTypes.number,
        enable: PropTypes.bool.isRequired,
        choices: PropTypes.arrayOf(PropTypes.shape({
            choiceNo: PropTypes.number.isRequired,
            choiceName: PropTypes.string.isRequired
        })),
        isRequired: PropTypes.bool
    })),
    isReadOnly: PropTypes.bool,
    isSysAdmin: PropTypes.bool,
    onChange: PropTypes.func
}
