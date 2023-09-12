/**
 * @license Copyright 2017 DENSO
 * 
 * MultiSelectForm Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import PropTypes from 'prop-types';

import { FormGroup, ControlLabel, HelpBlock } from 'react-bootstrap';

/**
 * 複数選択フォームのコンポーネント
 */
export default class MultiSelectForm extends Component {

    constructor(props) {
        super(props);
        this.state = {
            value: props.value || props.initValue
        };
        this.$multiselect;
        this.isShown = false;
    }

    /**
     * コンポーネントがマウントされた時
     */
    componentDidMount() {
        this.setMultiSelect();  
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.value && JSON.stringify(nextProps.value) !== JSON.stringify(this.state.value)) {
            this.setState({ value: nextProps.value }, () => this.setMultiSelect());
            
        }
    }

    /**
     * コンポーネントが更新された時
     */
    componentDidUpdate() {
        this.setMultiSelect();
    }

    /**
     * チェック状態が変化したとき
     * @param {any} option
     * @param {any} checked
     */
    onChange(option, checked) {
        const value = this.state.value.slice();
        if (checked) {
            if (value.indexOf(option) < 0) value.push(option);
        } else {
            value.splice(value.indexOf(option), 1);
        }

        this.changeValue(value);
    }

    /**
     * すべてチェックがチェックされた時
     */
    onSelectAll() {
        const all = this.props.options.map((option) => option.value);
        this.changeValue(all);
    }

    /**
     * すべてチェックのチェックが外された時
     */
    onDeselectAll() {
        this.changeValue([]);
    }

    /**
     * セットする
     */
    setMultiSelect() {
        if (this.$multiselect) {
            this.$multiselect.multiselect('rebuild')
        } else {
            this.$multiselect = $(findDOMNode(this.refs.multiselect)).multiselect({
                maxHeight: 200,
                buttonClass: 'form-control',
                includeSelectAllOption: true,
                selectAllText: 'すべて',
                allSelectedText: 'すべて',
                nonSelectedText: '(未選択)',
                selectAllNumber: false,
                onChange: (option, checked) => this.onChange($(option).val(), checked),
                onSelectAll: () => this.onSelectAll(),
                onDeselectAll: () => this.onDeselectAll(),
                onDropdownShow: () => { this.isShown = true },
                onDropdownHide: () => { this.isShown = false },
                buttonText: (options, select) => {
                    if (options.length === 0) {
                        return '(未選択)';
                    } else if (options.length === this.props.options.length) {
                        return 'すべて'
                    } else if (!this.props.itemAllVisible && options.length > 3) {
                        return `${options.length}項目選択中`;
                    } else {
                        const labels = [];
                        options.each((i, option) => {
                            labels.push(option.label);
                        });
                        return labels.join(', ') + '';
                    }
                }
            });
        }

        // 初期選択状態を設定
        const { options } = this.props;
        const { value } = this.state;
        const deselectOption = options.filter((option) => value.indexOf(option.value) < 0);
        this.$multiselect.multiselect('select', value);
        this.$multiselect.multiselect('deselect', deselectOption.map((option) => option.value));
        if (this.props.disabled) {
            this.$multiselect.multiselect('disable');
        } else {
            this.$multiselect.multiselect('enable');
        }
        if (this.isShown) {
            this.show();
        } else {
            this.hide();
        }    
	}

    /**
     * ドロップダウンを開く
     */
    show() {
        var $form = $(findDOMNode(this.refs.multiselectform));
        $form.find('.btn-group').addClass('open');
        $form.find('button').attr({ 'aria-expanded': true });
    }

    /**
     * ドロップダウンを閉じる
     */
    hide() {
        var $form = $(findDOMNode(this.refs.multiselectform));
        $form.find('.btn-group').removeClass('open');
        $form.find('button').attr({ 'aria-expanded': false });
    }

    /**
     * 値を変更する
     * @param {any} value
     */
    changeValue(value) {
        this.setState({ value: value }, () => {
            this.props.onChange(value);
        });
    }

    /**
     * render
     */
    render() {
        const { options, label, className, validationState, helpText } = this.props;
        return (
            <FormGroup validationState={validationState} className={className} ref="multiselectform" >
                {label && <ControlLabel>{label}</ControlLabel>}
                <select multiple="multiple" ref="multiselect">
                    {options && options.map((option) =>
                        <option value={option.value}>{option.name}</option>)}
                </select>
                {helpText&&<HelpBlock>{helpText}</HelpBlock>}
            </FormGroup>
        );
    }
}

MultiSelectForm.propTypes = {
    options: PropTypes.array,
    initValue: PropTypes.array,
    onChange: PropTypes.func,
    itemAllVisible: PropTypes.bool
}

MultiSelectForm.defaultProps = {
    options: [],
    initValue: [],
    onChange: () => { },
    itemAllVisible: false
}