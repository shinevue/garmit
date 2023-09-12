/**
 * @license Copyright 2018 DENSO
 * 
 * アセットの詳細項目 Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Box from 'Common/Layout/Box';
import BoxGroup from 'Common/Layout/BoxGroup';

import InputForm from 'Common/Form/InputForm';
import TextForm from 'Common/Form/TextForm';
import SelectForm from 'Common/Form/SelectForm';
import TextareaForm from 'Common/Form/TextareaForm';
import DateTimeForm from 'Common/Form/DateTimeForm';

import { validateText, validateInteger, validateRealFormat, validateDate, validateTextArea, VALIDATE_STATE } from 'inputCheck';
import { compareAscending } from 'sortCompare';

import { hasTimeFormat } from 'datetimeUtility';
import { TYPE, MAXLENGTH_EXTENDED_DATA } from 'extendedDataUtility';

/**
 * アセットの詳細項目コンポーネントを定義します。
 * 項目を変更すると、詳細項目全てのデータがonChange()で返ります
 * @param {string} title ボックスのタイトル
 * @param {boolean} isReadOnly 読み取り専用かどうか
 * @param {boolean} isLoading ロード中かどうか
 * @param {string} id 詳細情報の認証ID（ラックIDもしくはユニットID）
 * @param {number} unitTypeId ユニット種別ID
 * @param {array} pages 詳細ページ・項目情報
 * @param {boolen} isSysAdmin システム管理者かどうか
 * @param {boolean} defaultClose デフォルトでボックスを閉じるか
 * @param {boolean} showAllPages 全てのページを表示するか
 * @param {function} onChange 項目が変更されたときに呼び出す。詳細項目全てを返却する。
 */
export default class AssetDetailBox extends Component {
    
    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        this.state = {
            selectedPageNo: 1
        };
    }

    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps(nextProps) {
        const { id, pages, unitTypeId, isReadOnly, isSysAdmin } = nextProps;
        if (id != this.props.id || unitTypeId !== this.props.unitTypeId) {
            this.setState({
                selectedPageNo: this.getFirstPageNo(pages, unitTypeId, isSysAdmin)
            });
        }
        
        //ユニット種別変更時は使用していないデータはクリアする
        if (unitTypeId !== this.props.unitTypeId) {
            this.changeUnitTypePages(unitTypeId, pages);
        }
    }

    /**
     * render
     */
    render() {
        const { title, pages, isReadOnly, isLoading, unitTypeId, isSysAdmin, defaultClose, showAllPages } = this.props;
        const { selectedPageNo } = this.state;
        const enablePages = this.getEnablePages(pages, unitTypeId, isSysAdmin);    
        const selectedPage = this.getPage(enablePages, selectedPageNo);
        
        return (
            showAllPages ?
                <BoxGroup>
                    {(enablePages && enablePages.length > 0) && enablePages.map((p) => 
                        <Box boxStyle="default" isCollapsible={true} defaultClose={defaultClose} isLoading={isLoading}>
                            <Box.Header>
                                <Box.Title>{p.name}</Box.Title>
                            </Box.Header>
                            <Box.Body>
                                <InputForm>
                                    {this.createPageControls(p.extendedItems, isReadOnly, isSysAdmin)}
                                </InputForm>
                            </Box.Body>
                        </Box>
                    )}
                </BoxGroup>
            :
                <Box boxStyle='default' className='mb-0' isCollapsible={true} defaultClose={defaultClose} isLoading={isLoading}>
                    <Box.Header>
                        <Box.Title>{title}</Box.Title>
                    </Box.Header >
                    <Box.Body>
                        {(enablePages&&enablePages.length>0)?
                            <InputForm>
                                <InputForm.Row>
                                    <InputForm.Col label='表示ページ' columnCount={1} >
                                        <SelectForm value={selectedPageNo?selectedPageNo:-1} 
                                                    isRequired={true}
                                                    onChange={(v) => this.handlePageChanged(v)} 
                                                    options={enablePages.map((p) => { 
                                                        return {value: p.pageNo, name: p.name};
                                                    })}
                                        />           
                                    </InputForm.Col>
                                </InputForm.Row>
                                {this.createPageControls(selectedPage ? selectedPage.extendedItems : [], isReadOnly, isSysAdmin)}
                            </InputForm>
                            :
                            <div>詳細情報の設定がありません。</div>
                        }
                    </Box.Body>
                </Box>
        );
    }

    /**
     * ページのコントロールを作成する
     * @param {array} items ページ内の項目一覧 
     * @param {boolean} isReadOnly 読み取り専用かどうか
     * @returns {element} ページのコントロール
     */
    createPageControls(items, isReadOnly, isSysAdmin) {
        var formRows = [];
        var formCols = [];
        const enableItems = items ? items.filter((i) => i.enable === true && (!i.isSysAdmin || isSysAdmin)) : undefined;
        var maxPosition = enableItems ? Math.max.apply(null, enableItems.map((i) => i.position)) : 0;
        if (maxPosition % 2 !== 0) {
            maxPosition++;
        }
        for (let index = 1; index <= maxPosition; index++) {
            const item = enableItems ? enableItems.find((i) => i.position === index) : undefined;            
            formCols.push(<DetailItem {...item} index={index} isReadOnly={isReadOnly} onChange={(id, value, isError) => this.handleItemChanged(id, value, isError)} />);

            if (index%2 === 0) {
                formRows.push(
                    <InputForm.Row>
                        {formCols}
                    </InputForm.Row>
                );
                formCols = [];
            }
        }
        return formRows;
    }

    /**
     * タイマーを作成する
     * @param isLoading ロード中かどうか 
     * @return タイマー
     */
    makeTimer(isLoading){
        var timer = "";
        if (isLoading) {
            timer = <div className="overlay"><i className="fa fa-refresh fa-spin"></i></div>;
        }
        return timer;
    }

    /********************************************
     * イベント関数
     ********************************************/

    /**
     * ページ変更イベント
     * @param {number} value 変更後のページ番号
     */
    handlePageChanged(value){
        var obj =  Object.assign({}, this.state);
        obj.selectedPageNo = parseInt(value);
        this.setState(obj);
    }

    /**
     * 項目変更イベント
     * @param {number} id 項目ID
     * @param {object} value 変更後の値
     * @param {boolean} isError エラーかどうか
     */
    handleItemChanged(id, value, isError){
        if (this.props.onChange) {
            const workPages = Object.assign([], this.props.pages);
           
            workPages.some((page) => {
                const workItems = Object.assign([], page.extendedItems);
                const isExist = workItems.some((item) => {
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
                if (isExist) {
                    page.isError = isError;
                }

                return isExist;
            });

            const error = workPages ? workPages.some((page) => page.isError) : false;
            this.props.onChange( workPages, error );
        }
    }

    /********************************************
     * その他関数
     ********************************************/

    /**
     * enable=trueのページの最小の値を表示する
     * @param {array} pages ページリスト
     * @param {number} unitTypeId ユニット種別ID
     * @param {boolean} isSysAdmin 管理者かどうか
     * @returns {number} 最小ページ番号
     */
    getFirstPageNo(pages, unitTypeId, isSysAdmin) {
        var enablePages = this.getEnablePages(pages, unitTypeId, isSysAdmin);
        if (enablePages && enablePages.length > 0) {
            enablePages = enablePages.sort((currnet, next) => compareAscending(currnet.pageNo, next.pageNo));
            return enablePages[0].pageNo;
        } else {
            return -1;
        }
    }

    /**
     * 指定されたページ番号のページ情報を取得する
     * @param {array} pages ページリスト 
     * @param {number} targetPageNo ページ番号
     * @returns {object} ページ情報
     */
    getPage(pages, targetPageNo){
        return pages.find((page) => page.pageNo === targetPageNo);
    }

    /**
     * enable=trueのページリストを取得する
     * @param {array} pages ページリスト
     * @param {number} unitTypeId ユニット種別
     * @param {boolean} isSysAdmin 管理者かどうか
     * @returns {array} 有効なページリスト
     */
    getEnablePages(pages, unitTypeId, isSysAdmin) {
        return pages.filter((page) => this.isEnableUnitType(page.unitTypes, unitTypeId) && 
                                      this.containEnableItem(page.extendedItems, isSysAdmin));
    }

    /**
     * ユニット種別一覧内に指定のユニット種別があるかどうか
     * @param {array} unitTypes ユニット種別一覧
     * @param {number} unitTypeId ユニット種別ID
     * @returns {boolean} ユニット種別があるかどうか（ユニット種別がない場合はtrueとする）
     */
    isEnableUnitType(unitTypes, unitTypeId) {
        return unitTypes&&unitTypeId ? unitTypes.some((type) => type.typeId === unitTypeId) : true;
    }

    /**
     * 有効な項目が含まれているかどうか
     * @param {array} items 項目一覧
     * @param {boolean} isSysAdmin 管理者かどうか
     * @returns {boolean} 有効な項目が含まれているかどうか 
     */
    containEnableItem(items, isSysAdmin) {
        return items ? items.some((item) => item.enable && (isSysAdmin || !item.isSysAdmin)) : false;        
    }

    /**
     * ユニット種別のページを変更する
     * @param {number} unitTypeId ユニット種別ID
     * @param {array} pages ページ情報リスト
     */
    changeUnitTypePages(unitTypeId, pages) {
        if (this.props.onChange) {
            const workPages = Object.assign([], pages);           
            workPages.forEach((page) => {
                //使用しないページのデータはクリアする
                if (!this.isEnableUnitType(page.unitTypes, unitTypeId)) {
                    const workItems = Object.assign([], page.extendedItems);
                    workItems.forEach((item) => {
                        if (item.enable === true) {
                            item.value = null;
                            item.isError = false;           
                        }                           
                    });
                }
            });

            const error = workPages ? workPages.some((page) => page.isError) : false;
            this.props.onChange( workPages, error );
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
        const { itemId, name, position, value, type, format, choices, isReadOnly } = this.props;
        const validate = this.validate(value, type, format, isReadOnly);
        var label = name ? '(' + position + ')' + name : undefined;
        return (
            <InputForm.Col label={label} columnCount={2}>
                {itemId&&this.createControl(itemId, type, value, format, choices, isReadOnly, validate)}
            </InputForm.Col>
        );
    }

    /**
     * コントロールを作成する
     * @param {number} id 項目ID
     * @param {number} type 項目種別
     * @param {object} value 値
     * @param {string} formatStr フォーマット書式
     * @param {array} choices 選択肢一覧
     * @param {boolean} isReadOnly 読み取り専用かどうか
     * @param {object} validate 検証結果
     * @returns {element} 作成したコントロール
     */
    createControl(id, type, value, formatStr, choices, isReadOnly, validate){
        if (!value &&
            (type === TYPE.text || type === TYPE.integer || type === TYPE.real || type == TYPE.textArea)) {
            value = '';
        }

        switch (type) {
            case TYPE.text:
            case TYPE.integer:
                return <TextForm id={id} 
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
                                   value={value} 
                                   isReadOnly={isReadOnly} 
                                   validationState={validate.state}
                                   helpText={validate.helpText}
                                   onChange={(v) => this.handleItemChanged(id, v)} 
                                   options={choices.map((c) => { return {value: c.choiceNo, name: c.choiceName}; })} 
                />;
            case TYPE.textArea:
                return <TextareaForm id={id} 
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
     * @returns {object} 検証結果
     */
    validate(value, type, format, isReadOnly) {
        if (!isReadOnly) {
            switch (type) {
                case TYPE.text:
                    return validateText(value, MAXLENGTH_EXTENDED_DATA.text, true);
                case TYPE.integer:
                    return validateInteger(value, -10000000, 10000000, true);
                case TYPE.real:
                    return validateRealFormat(value, -10000000, 10000000, true, format);
                case TYPE.dateTime:
                    return validateDate(value, format, true);
                case TYPE.textArea:
                    return validateTextArea(value, MAXLENGTH_EXTENDED_DATA.textArea, true);
                default:
                    return { state: VALIDATE_STATE.success };           //日付時刻、選択肢は不正の値が入力できないため、常にOKとする
            }
        }
        return { state: null };
    }

    /**
     * エラーかどうか
     * @param {object} value 対象の値
     * @returns {boolean} エラーかどうか
     */
    isError(value) {
        const { type, format, isReadOnly } = this.props;
        const validate = this.validate(value, type, format, isReadOnly);
        return !(validate.state === VALIDATE_STATE.success);
    }
    
}

AssetDetailBox.propTypes = {
    title: PropTypes.string,
    isReadOnly: PropTypes.bool,
    isLoading: PropTypes.bool,
    defaultClose: PropTypes.bool,
    id: PropTypes.number.isRequired,
    unitTypeId: PropTypes.number,
    pages: PropTypes.arrayOf(PropTypes.shape({
        pageNo: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        unitTypes: PropTypes.arrayOf(PropTypes.shape({
            typeId: PropTypes.number.isRequired,
            name: PropTypes.string.isRequired
        })),
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
            }))
        }))
    })),
    isSysAdmin: PropTypes.bool,
    showAllPages: PropTypes.bool,
    onChange: PropTypes.func
}

AssetDetailBox.defaultProps = {
    defaultClose: true
}