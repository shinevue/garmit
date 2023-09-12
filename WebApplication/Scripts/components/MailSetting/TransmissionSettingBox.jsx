'use strict';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import PropTypes from 'prop-types';

import { Radio } from 'react-bootstrap';

import Box from 'Common/Layout/Box';

import InputForm from 'Common/Form/InputForm';
import TextForm from 'Common/Form/TextForm';
import PasswordForm from 'Common/Form/PasswordForm';


export default class TransmissionSettingBox extends Component {

    constructor(props) {
        super(props);
        this.state = {

        };
    }

    /**
     * render
     */
    render() {
        const { isLoading, isReadOnly, systemSet, inputCheck, onEdit, maxlength } = this.props;

        return (
            <Box boxStyle='default' isLoading={isLoading}>
                <Box.Header>
                    <Box.Title>メール送信設定</Box.Title>
                </Box.Header >
                <Box.Body>
                {systemSet &&
                    <InputForm>
                        <InputForm.Row>
                            <InputForm.Col label="メールサーバ" columnCount={2}>
                                <TextForm
                                    isReadOnly={isReadOnly}
                                    value={systemSet.mailServer}
                                    maxlength={maxlength.mailServer}
                                    validationState={!isReadOnly && inputCheck.mailServer.state}
                                    helpText={!isReadOnly && inputCheck.mailServer.helpText}
                                    onChange={(val) => onEdit(val, 'mailServer')}
                                />
                            </InputForm.Col>
                            <InputForm.Col label="ポート番号" columnCount={2}>
                                <TextForm
                                    isReadOnly={isReadOnly}
                                    value={systemSet.mailPort}
                                    validationState={!isReadOnly && inputCheck.mailPort.state}
                                    helpText={!isReadOnly && inputCheck.mailPort.helpText}
                                    onChange={(val) => onEdit(val, 'mailPort')}
                                />
                            </InputForm.Col>
                        </InputForm.Row>
                        <InputForm.Row>
                            <InputForm.Col label="SMTP認証" columnCount={2} isRequired={true}>
                                <Radio inline
                                    name="smtp-auth"
                                    disabled={isReadOnly}
                                    checked={!systemSet.useSmtpAuth}
                                    onClick={(val) => onEdit(false, 'useSmtpAuth')}
                                >
                                    認証なし
                                </Radio>
                                <Radio inline
                                    name="smtp-auth"
                                    disabled={isReadOnly}
                                    checked={systemSet.useSmtpAuth}
                                    onClick={(val) => onEdit(true, 'useSmtpAuth')}
                                >
                                    認証あり
                                </Radio>
                            </InputForm.Col>
                            <InputForm.Col label="SSL使用" columnCount={2} isRequired={true}>
                                <Radio inline
                                    name="ssl-use"
                                    disabled={isReadOnly}
                                    checked={!systemSet.useSsl}
                                    onClick={(val) => onEdit(false, 'useSsl')}
                                >
                                    使用しない
                                </Radio>
                                <Radio inline
                                    name="ssl-use"
                                    disabled={isReadOnly}
                                    checked={systemSet.useSsl}
                                    onClick={(val) => onEdit(true, 'useSsl')}
                                >
                                    使用する
                                </Radio>
                            </InputForm.Col>
                        </InputForm.Row>
                        <InputForm.Row>
                            <InputForm.Col label="SMTP認証ユーザ" columnCount={2} isRequired={systemSet.useSmtpAuth}>
                                <TextForm
                                    isReadOnly={isReadOnly || !systemSet.useSmtpAuth}
                                    value={systemSet.mailUser}
                                    maxlength={maxlength.mailUser}
                                    validationState={!isReadOnly && systemSet.useSmtpAuth && inputCheck.mailUser.state}
                                    helpText={!isReadOnly && systemSet.useSmtpAuth && inputCheck.mailUser.helpText}
                                    onChange={(val) => onEdit(val, 'mailUser')}
                                />
                            </InputForm.Col>
                            <InputForm.Col label="SMTP認証パスワード" columnCount={2} isRequired={systemSet.useSmtpAuth}>
                                <PasswordForm
                                    isReadOnly={isReadOnly || !systemSet.useSmtpAuth}
                                    value={systemSet.mailPassword}
                                    maxlength={maxlength.mailPassword}
                                    validationState={!isReadOnly && systemSet.useSmtpAuth && inputCheck.mailPassword.state}
                                    helpText={!isReadOnly && systemSet.useSmtpAuth && inputCheck.mailPassword.helpText}
                                    onChange={(val) => onEdit(val, 'mailPassword')}
                                />
                            </InputForm.Col>
                        </InputForm.Row>
                        <InputForm.Row>
                            <InputForm.Col label="メール送信元" columnCount={1}>
                                <TextForm
                                    isReadOnly={isReadOnly}
                                    type="email"
                                    value={systemSet.mailFrom}
                                    maxlength={maxlength.mailFrom}
                                    validationState={!isReadOnly && inputCheck.mailFrom.state}
                                    helpText={!isReadOnly && inputCheck.mailFrom.helpText}
                                    onChange={(val) => onEdit(val, 'mailFrom')}
                                />
                            </InputForm.Col>
                        </InputForm.Row>
                    </InputForm>
                }
                </Box.Body>
            </Box>
        );
    }
}