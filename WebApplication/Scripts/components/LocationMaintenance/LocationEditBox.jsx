/**
 * Copyright 2017 DENSO Solutions
 * 
 * ロケーション編集ボックス Reactコンポーネント
 *  
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { FormGroup, Checkbox, Radio } from 'react-bootstrap';

import InputForm from 'Common/Form/InputForm';
import TextForm from 'Common/Form/TextForm';
import SelectForm from 'Common/Form/SelectForm';
import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';

import GarmitBox from 'Assets/GarmitBox';
import {SaveButton, DeleteButton, CancelButton} from 'Assets/GarmitButton';
import MessageModal from 'Assets/Modal/MessageModal';
import StatusSelectForm from 'Assets/Form/StatusSelectForm';

import { validateText, errorResult, VALIDATE_STATE } from 'inputCheck';

const NAME_MAX_LENGTH = 32; //ラック名称最大文字数

/**
 * ロケーション編集ボックス
 */
export default class LocationEditBox extends Component {

    constructor(props) {
        super(props);
        this.state = {
            validateName: this.validateName(props.name),
            showDeleteModal: false,
            showSaveModal:false
        };
    }

    //#region ライフサイクル関数
    /**
     * コンポーネントをアップデートするかどうか
     */
    shouldComponentUpdate(nextProps, nextState) {
        if(this.props !== nextProps || this.state !== nextState){
            return true;
        }
    }

    /**
     * componentWillReceiveProps
     */
    componentWillReceiveProps(nextProps) {
        if (this.props.name !== nextProps.name) {
            this.setState({ validateName: this.validateName(nextProps.name) });
        }
    }

    //#endregion

    //#region イベントハンドラ
    /**
     * 名称変更イベントハンドラ
     * @param {string} name 変更後の名称
     */
    handleChangeName(name) {
        this.setState({ validateName: this.validateName(name) });
        if (this.props.onChangeName) {
            this.props.onChangeName(name);
        }
    }

    /**
     * ラックとして登録変更イベントハンドラ
     * @param {value} 変更後の値
     */
    handleChangeIsRack(value) {        
        if (this.props.onChangeIsRack) {
            this.props.onChangeIsRack(value);
        }
    }

    /**
     * ラック種別変更イベントハンドラ
     * @param {value} 変更後の値
     */
    handleChangeRackType(value) {
        if (this.props.onChangeRackType) {
            this.props.onChangeRackType(Number(value));
        }
    }

    /**
     * ラック利用状況変更イベントハンドラ
     * @param {value} 変更後の値
     */
    handleChangeRackStatus(value) {
        if (this.props.onChangeRackStatus) {
            this.props.onChangeRackStatus(value);
        }
    }

    /**
     * ロケーション編集ボックスボタン押下イベントハンドラ
     */
    handleClick(type) {
        switch (type) {
            case "save":
                this.setState({ showSaveModal: true });
                break;
            case "delete":
                this.setState({ showDeleteModal: true })
                break;
            case "cancel":
                if (this.props.onClickCancel) {
                    this.props.onClickCancel();
                }
                break;
            default: break;
        }
    }

    /**
     * モーダル内保存ボタン押下イベントハンドラ
     */
    handleClickSave() {
        this.setState({ showSaveModal: false });
        if (this.props.onClickSave) {
            this.props.onClickSave();
        }
    }

    /**
     * モーダル内削除ボタン押下イベントハンドラ
     */
    handleClickDelete() {
        this.setState({ showDeleteModal: false });
        if (this.props.onClickDelete) {
            this.props.onClickDelete();
        }
    }
    //#endregion

    //#region render
    /**
     * render
     */
    render() {
        const { name, isRack, editable, rackStatuses, rackTypes, rack, title, isLoading, isReadOnly, hideDeleteButton } = this.props;
        const { validateName, showDeleteModal, showSaveModal } = this.state;

        return (
            <GarmitBox
                isLoading={isLoading}
                title={"ロケーション編集(" + title + ")"}
            >
                <div>
                    <Body
                        isReadOnly={isReadOnly.edit ? true : !editable}
                        name={name}
                        editable={editable}
                        validateName={validateName}
                        isRack={isRack}
                        rack={rack}
                        rackStatuses={rackStatuses}
                        rackTypes={rackTypes}
                        onChangeName={(value) => this.handleChangeName(value)}
                        onChangeIsRack={(isRack) => this.handleChangeIsRack(isRack)}
                        onChangeRackType={(value) => this.handleChangeRackType(value)}
                        onChangeRackStatus={(value) => this.handleChangeRackStatus(value)}
                    />
                    <MessageModal
                        title={"保存確認"}
                        show={showSaveModal}
                        bsSize={'sm'}
                        buttonStyle={'save'}
                        onCancel={() => this.setState({ showSaveModal: false })}
                        onOK={() => this.handleClickSave()}
                    >編集中ロケーション情報を保存しますか？</MessageModal>
                    <MessageModal
                        title={"削除確認"}
                        show={showDeleteModal}
                        bsSize={'sm'}
                        buttonStyle={'delete'}
                        onCancel={() => this.setState({ showDeleteModal: false })}
                        onOK={() => this.handleClickDelete()}
                    >選択中ロケーションを削除しますか？</MessageModal>
                </div>
                {(!isReadOnly.edit || !isReadOnly.addDelete) &&
                    <ButtonGroup
                        hideDeleteButton={hideDeleteButton}
                        isReadOnly={isReadOnly}
                        editable={editable}
                        validateState={validateName.state}
                        onClick={(type) => this.handleClick(type)}
                    />
                }
            </GarmitBox>
        );
    }
    //#endregion

    //#region その他関数
    /**
     * 名称入力チェック
     * @param {string} name 変更後の名称
     */
    validateName(name) {
        const result = validateText(name, NAME_MAX_LENGTH, false);
        if (result.state == VALIDATE_STATE.success && name.match(/\//)) {
            return errorResult('使用不可文字が含まれています');
        }
        return result;
    }
    //#endregion
}

LocationEditBox.propTypes = {
    title:PropTypes.string,             //編集対象ラック名称
    rackTypes: PropTypes.array,         //ラック種別一覧
    rackStatuses: PropTypes.array,      //ラック利用状況一覧
    editable: PropTypes.bool,           //編集可能かどうか
    name: PropTypes.string,             //編集中ロケーション名称
    isRack: PropTypes.bool,             //ラックとして登録するかどうか
    rack: PropTypes.object,             //編集中ラック情報（ラック種別と利用状況）
    isLoading: PropTypes.bool,          //ロード中かどうか
    isReadOnly: PropTypes.arrayOf({     //読み取り専用かどうか
        edit: PropTypes.bool,           //編集
        addDelete:PropTypes.bool        //（追加）削除
    }),         
    hideDeleteButton: PropTypes.bool,   //削除ボタンを非表示にするかどうか
    onChangeName: PropTypes.func,       //ロケーション名称変更イベント関数
    onChangeIsRack: PropTypes.func,     //ラックとして登録変更イベント関数
    onChangeRackType: PropTypes.func,   //ラック種別変更イベント関数
    onChangeRackStatus: PropTypes.func, //ラック利用状況変更イベント関数
    onClickSave: PropTypes.func,        //保存ボタンクリックイベント関数
    onClickDelete: PropTypes.func,      //削除ボタンクリックイベント関数
    onClickCancel: PropTypes.func,      //キャンセルボタンクリックイベント関数
};

//#region SFC
/**
* BoxBody
*/
const Body = (props) => {
    const { isReadOnly, name, editable, validateName, isRack, rack, rackStatuses, rackTypes } = props;
    const { onChangeName: handleChangeName } = props;
    const { onChangeIsRack: handleChangeIsRack } = props;
    const { onChangeRackType: handleChangeRackType } = props;
    const { onChangeRackStatus: handleChangeRackStatus } = props;
    return (
        <InputForm>
            <BasicInfoRow
                isReadOnly={isReadOnly}
                name={name}
                editable={editable}
                validateName={editable && validateName}
                isRack={isRack}
                onChangeName={(value) => handleChangeName(value)}
                onChangeIsRack={(value) => handleChangeIsRack(value)}
            />
            <RackInfoRow
                isRack={isRack}
                isReadOnly={isReadOnly}
                rack={rack}
                rackTypes={rackTypes}
                rackStatuses={rackStatuses}
                onChangeRackType={(value) => handleChangeRackType(value)}
                onChangeRackStatus={(value) => handleChangeRackStatus(value)}
            />
            
        </InputForm>
    );
}

/**
* 基本情報行
*/
const BasicInfoRow = (props) => {
    const { isReadOnly, name, editable, validateName, isRack } = props;
    const { onChangeName: handleChangeName } = props;
    const { onChangeIsRack: handleChangeIsRack } = props;
    return (
        <InputForm.Row>
            <InputForm.Col label='名称' columnCount={2} isRequired={true}>
                <TextForm
                    isReadOnly={isReadOnly}
                    value={name}
                    validationState={editable && validateName.state}
                    maxlength={32}
                    helpText={editable && validateName.helpText}
                    onChange={(value) => handleChangeName(value)}
                />
                <input type="text" style={{ display: 'none' }} />
            </InputForm.Col>
            <InputForm.Col label='ラックとして登録' columnCount={2} isRequired={false}>
                <Radio
                    disabled={isReadOnly}
                    checked={isRack}
                    onClick={() => handleChangeIsRack(true)}
                    inline
                >
                    する
                    </Radio>
                <Radio
                    disabled={isReadOnly}
                    checked={!isRack}
                    onClick={() => handleChangeIsRack(false)}
                    inline
                >
                    しない
                    </Radio>
            </InputForm.Col>
        </InputForm.Row>
    );
}

/**
* ラック情報行
*/
const RackInfoRow = (props) => {
    const { isRack, isReadOnly, rack, rackTypes, rackStatuses } = props;
    const { onChangeRackType: handleChangeRackType } = props;
    const { onChangeRackStatus: handleChangeRackStatus } = props;

    if (isRack) {
        return (
            <InputForm.Row>
                <InputForm.Col label='ラック種別' columnCount={2} isRequired={false}>
                    <SelectForm
                        isReadOnly={isReadOnly}
                        isRequired={true}
                        value={rack && rack.type && rack.type.typeId}
                        options={rackTypes}
                        onChange={(value) => handleChangeRackType(value)}
                    />
                </InputForm.Col>
                <InputForm.Col label='ラックステータス' columnCount={2} isRequired={false}>
                    <StatusSelectForm
                        value={rack && rack.status}
                        statusList={rackStatuses}
                        isReadOnly={isReadOnly}
                        isRequired={true}
                        onChange={(e) => handleChangeRackStatus(e.value)}
                    />
                </InputForm.Col>
            </InputForm.Row>
        );
    }
    return null;
}

/**
* ボタングループ
*/
const ButtonGroup = ({ hideDeleteButton, isReadOnly, editable, validateState, onClick:handleClick}) => {
    return (
        <div className="pull-right mt-1">
            {!isReadOnly.edit &&
                <SaveButton
                    className="mr-05"
                    disabled={!editable || validateState !== "success"}
                    onClick={() => handleClick("save")}
                />
            }
            {!isReadOnly.addDelete && !hideDeleteButton &&
                <DeleteButton
                    className="mr-05"
                    disabled={!editable}
                    onClick={() => handleClick("delete")}
                />
            }
            {!isReadOnly.edit &&
                <CancelButton
                    disabled={!editable}
                    onClick={() => handleClick("cancel")}
                />
            }
        </div>
    );
}
//#endregion