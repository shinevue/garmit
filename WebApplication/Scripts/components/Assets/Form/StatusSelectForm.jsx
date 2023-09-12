/**
 * @license Copyright 2017 DENSO
 * 
 * ステータス選択ドロップダウンフォームのコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormGroup, ControlLabel, Dropdown, MenuItem, HelpBlock } from 'react-bootstrap';

/**
 * ステータス選択ドロップダウンフォームのコンポーネント
 * @param {string}　label フォームのタイトル
 * @param {shape}　value 選択した値
 * @param {array} statusList 選択肢リスト
 * @param {oneOf}　validationState 検証結果（success, warning, error, null）
 * @param {string}　helpText 入力欄の説明。例：入力エラー時にエラー内容を表示する。
 * @param {function}　onChange テキスト変更イベント
 * @param {boolean}　isReadOnly 読み取り専用かどうか
 * @param {string} className className
 * @param {boolean} isRequired 必須項目かどうか（「選択してください」を出すかどうか決める）
 */
export default class StatusSelectForm extends Component {
    
    /**
     * render
     */
    render() {
        const { label, value, statusList, helpText, validationState, className, style, isRequired, isReadOnly } = this.props;
        if (!isRequired && (statusList.length <= 0||statusList[0].statusId !== -1)) {
            statusList.unshift({
                statusId: -1,
                name: '選択してください'
            });
        }
        const selectItem = value ? value : { statusId: -1, name: '選択してください' } ;
        return (
            <FormGroup validationState={validationState} className={className} style={style}>
                {label && <ControlLabel>{label}</ControlLabel>}
                <div>
                    <Dropdown id='dropdown-status' className='dropdown-status' disabled={isReadOnly} onSelect={(v) => this.handleChanged(v)} >
                        <Dropdown.Toggle>
                            {selectItem.color&&<StatusPreview color={selectItem.color} />}
                            {selectItem.name}
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            {statusList&&statusList.map((i) => <DropdownItem {...i} isActive={selectItem.statusId ===i.statusId} onSelect={(v) => this.handleChanged(v)}></DropdownItem>)} 
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
                {helpText&&<HelpBlock>{helpText}</HelpBlock>}
            </FormGroup>
        );
    }

    
    /**
     * 値変更イベント
     * @param {*} value 
     */
    handleChanged(value) {
        if ( this.props.onChange ) {
            this.props.onChange( value );
        }
    }
}

class DropdownItem extends Component {
    render() {
        const { statusId, name, color, isActive } = this.props;
        return (<MenuItem eventKey={statusId} active={isActive} onSelect={() => this.handleOnSelect()}>
                    {color && <StatusPreview color={color} /> }
                    {name}
                </MenuItem>
        );
    }
    
    /**
     * 選択イベント発生
     * @param {*} value 
     */
    handleOnSelect() {
        if ( this.props.onSelect ) {
            this.props.onSelect(this.props);
        }
    }
}

class StatusPreview extends Component {
    render() {
        const { color } = this.props;
        return (
            <div className='dropdown-preview ' style={{backgroundColor: color}} />
        );
    }
}

StatusSelectForm.propTypes = {
    label: PropTypes.string,
    value: PropTypes.shape({
        statusId: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        color: PropTypes.string.isRequired
    }),
    statusList: PropTypes.arrayOf( PropTypes.shape({
        statusId: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        color: PropTypes.string.isRequired
    })),
    placeholder: PropTypes.string,
    validationState: PropTypes.oneOf(['success', 'warning', 'error', null]),
    helpText: PropTypes.string,
    onChange: PropTypes.func,
    isReadOnly: PropTypes.bool,
    className: PropTypes.string,
    isRequired : PropTypes.bool
}
