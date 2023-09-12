/**
 * Copyright 2017 DENSO Solutions
 * 
 * UserForm Reactコンポーネント
 *  
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import UserSelectModal from 'Assets/Modal/UserSelectModal';
import ChipForm from 'Assets/Condition/ChipForm';
import LabelForm from 'Common/Form/LabelForm';

export default class UserForm extends Component {

    constructor(props) {
        super(props)
        this.state = {
            showModal: false,
        }
    }

    /**
     * チップのリストを生成する
     * @param {any} loginUsers
     */
    createChipList(loginUsers) {
        return loginUsers.map((user) => { return { id: user.userId, name: user.userName } })
    }

    /**
     * チップの「×」ボタンクリック時
     * @param {any} id
     */
    handleRemoveChip(id) {
        if (this.props.onChange) {
            let loginUsers = this.props.checkedLoginUsers.slice();
            for (let i = 0; i < loginUsers.length; i++) {
                if (loginUsers[i].userId === id) {
                    loginUsers.splice(i, 1);
                    this.props.onChange(loginUsers);
                    return;
                }
            }
        }
    }

    /**
     * 適用ボタンクリックイベント
     * @param {any} val
     */
    handleSubmit(val) {
        this.setState({ showModal: false });

        if (this.props.onChange) {
            this.props.onChange(val);
        }
    }

    /**
     * アドオンボタンを取得
     * @param {boolean} clearButton クリアボタンを表示するか
     */
    getAddonButtons(clearButton, disabled) {
        var buttons = [{
            key: 'select',
            iconId: 'user',
            isCircle: true,
            tooltipLabel: 'ユーザー選択',
            disabled: disabled,
            onClick: () => this.setState({ showModal: true })
        }];
        
        clearButton && buttons.push({
            key: 'clear',
            buttonIconClass: 'fal fa-eraser',
            bsStyle: "lightgray",
            isCircle: true,
            tooltipLabel: 'クリア',
            disabled: disabled,
            onClick: () => this.props.onChange(null)
        });

        return buttons;
    }

    /**
     * render
     */
    render() {
        const { showModal } = this.state
        const { multiple, loginUserList, selectedLoginUser, checkedLoginUsers, validationState, helpText, search, disabled, label, clearButton, displayButton } = this.props

        return (
            <div>
                <UserSelectModal
                    showModal={showModal}
                    loginUserList={loginUserList}
                    checkedLoginUsers={checkedLoginUsers}
                    selectedLoginUser={selectedLoginUser}
                    checkbox={multiple}
                    onSubmit={(val) => this.handleSubmit(val)}
                    onCancel={() => this.setState({ showModal: false })}
                />
                {multiple ?
                    <ChipForm
                        disabled={disabled}
                        chips={this.createChipList(checkedLoginUsers)}
                        removeButton={true}
                        onRemoveClick={(id) => this.handleRemoveChip(id)}
                        onClick={search && (() => this.setState({showModal: true }))}
                        validationState={validationState}
                        helpText={helpText}
                        addonButton={!search && {
                            iconId: 'user',
                            isCircle: true,
                            tooltipLabel: 'ユーザー選択',
                            onClick: () => this.setState({ showModal: true })
                        }}
                    />
                :                
                    <LabelForm
                        label={label}
                        isReadOnly={disabled}
                        value={selectedLoginUser && selectedLoginUser.userName}
                        onClick={() => this.setState({ showModal: true })}
                        validationState={validationState}
                        helpText={helpText}
                        addonButton={(displayButton || !disabled) && this.getAddonButtons(clearButton, disabled)}
                    />
                }
            </div>
        )
    }
}

UserForm.propTypes = {
    multiple: PropTypes.bool,
    loginUserList: PropTypes.array,
    checkedLoginUsers: PropTypes.array,
    selectedLoginUser: PropTypes.object,
    onChange: PropTypes.func,
    validationState: PropTypes.string,
    helpText: PropTypes.string,
    displayButton: PropTypes.bool
}

UserForm.defaultProps = {
    multiple: true,
    loginUserList: [],
    checkedLoginUsers: [],
    displayButton: false,
    onChange: () => { },
}