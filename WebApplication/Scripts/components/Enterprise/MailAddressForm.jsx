'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import PropTypes from 'prop-types';

import { FormGroup, FormControl, OverlayTrigger, Tooltip } from 'react-bootstrap';
import Button from 'Common/Widget/Button';

import { validateEmail, successResult } from 'inputCheck';

export default class MailAddressForm extends Component {

    constructor() {
        super();
        this.state = {

        };
    }

    /**
     * 追加ボタンクリック時
     */
    handleAddClick() {
        let addresses = this.props.addresses.slice()
        addresses.push("");
        this.props.onChange(addresses);
    }

    /**
     * 削除ボタンクリック時
     * @param {any} index
     */
    removeForm(index) {
        let addresses = this.props.addresses.slice()
        addresses.splice(index, 1)
        this.props.onChange(addresses);
    }

    /**
     * アドレスが変更された時
     * @param {any} val 変更後の値
     * @param {any} index 配列のインデックス
     */
    changeAddress(val, index) {
        let addresses = this.props.addresses.slice()
        addresses[index] = val;
        this.props.onChange(addresses);
    }

    /**
     * フォームを生成する
     */
    makeAddressForms() {
        const { addresses, maxCount, validation, isReadOnly, maxLength } = this.props;

        return addresses.map((address, i) => {
            const disabled = isReadOnly || addresses.length <= 1;
            return (
                <FormGroup validationState={!isReadOnly && validation[i] && validation[i].state} key={i}>
                    <div className={(i != maxCount - 1) ? "mb-05" : ""}>
                        <div className={addresses.length > 1 ? 'garmit-input-item' : ''}>
                            <FormControl
                                disabled={isReadOnly}
                                type="email"
                                maxlength={maxLength}
                                value={address}
                                onChange={(e) => this.changeAddress(e.target.value, i)}
                            />
                        </div>
                        {addresses.length > 1 &&
                            <div className='garmit-input-item garmit-input-addon va-t pa-r-0'>                                
                                <OverlayTrigger placement="bottom" overlay={<Tooltip>クリア</Tooltip>}>
                                    <Button
                                        disabled={disabled}
                                        iconId="erase"
                                        isCircle={true}
                                        bsStyle="lightgray"
                                        onClick={() => this.removeForm(i)}
                                    />
                                </OverlayTrigger>
                            </div>
                        }
                        {!isReadOnly && validation[i] && validation[i].helpText &&
                            <span className="help-block">{validation[i].helpText}</span>
                        }
                    </div>
                </FormGroup>
            );
        });
    }

    /**
     * render
     */
    render() {
        const { addresses, onChange, maxCount, isReadOnly } = this.props        

        return (
            <div>
                {this.makeAddressForms()}
                {(addresses.length < maxCount) &&
                    <OverlayTrigger placement="bottom" overlay={<Tooltip>追加</Tooltip>}>
                        <Button
                            disabled={isReadOnly}
                            className="mb-05"
                            iconId="add"
                            isCircle={true}
                            onClick={() => this.handleAddClick()}
                        />
                    </OverlayTrigger>
                }
            </div>
        );
    }
}

MailAddressForm.propTypes = {
    addresses: PropTypes.array,
    onChange: PropTypes.func,
    maxCount: PropTypes.number
}

MailAddressForm.defaultProps = {
    addresses: [],
    onChange: () => { },
    maxCount: 10
}