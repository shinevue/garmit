/**
 * Copyright 2018 DENSO Solutions
 * 
 * 自動更新切り替えボタン Reactコンポーネント
 *  
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { ButtonToolbar } from 'react-bootstrap';

import ToggleSwitch from 'Common/Widget/ToggleSwitch';
import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';

import { UpdateHotKeyButton, UpdateButton } from 'Assets/GarmitButton';

import { AUTO_UPDATE_VALUES } from 'constant';

export default class AutoUpdateButtonGroup extends Component {

    constructor(props) {
        super(props)
        this.state = {
            value: props.value || AUTO_UPDATE_VALUES.none
        }
    }

    /**
     * コンポーネントが新しいPropsを受け取るとき
     * @param {any} nextProps
     */
    componentWillReceiveProps(nextProps) {
        if (nextProps.value != null && nextProps.value !== this.state.value) {
            this.setState({ value: nextProps.value });
        }
    }

    /**
     * チェック状態が変化したとき
     * @param {any} val
     */
    onChange(val) {
        this.setState({ value: val }, () => {
            if (this.props.onChange) {
                this.props.onChange(val);
            }
        });
    }

    /**
     * render
     */
    render() {
        const { disabled, onlyManual, useHotKeys } = this.props;
        const { value } = this.state;

        return (
            <span>
                {!onlyManual &&
                    <span>
                        <span className="mr-05">自動更新：</span>
                        <span className="mr-05">
                            <ToggleSwitch
                                value={value}
                                bsSize="sm"
                                name="updateInterval"
                                disbled={disabled}
                                swichValues={[
                                    { value: AUTO_UPDATE_VALUES.none, text: '更新なし' },
                                    { value: AUTO_UPDATE_VALUES.fast, text: '30秒' },
                                    { value: AUTO_UPDATE_VALUES.slow, text: '60秒' }
                                ]}
                                onChange={(val) => this.onChange(val)}
                            />
                        </span>
                    </span>
                }
                <span>
                    {useHotKeys ?
                        <UpdateHotKeyButton
                            bsSize="sm"
                            disabled={disabled}
                            onClick={() => this.props.onManualUpdateClick()}
                        />
                        :
                        <UpdateButton
                            bsSize="sm"
                            disabled={disabled}
                            onClick={() => this.props.onManualUpdateClick()}
                        />
                    }
                </span>
            </span>
        )
    }
}