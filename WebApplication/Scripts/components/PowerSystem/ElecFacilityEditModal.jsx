/**
 * @license Copyright 2017 DENSO
 * 
 * BreakerEditModal Reactコンポーネント
 * <BreakerEditModal />
 *  
 * Reactに関する情報は、 https://reactjs.org/ を参照してください。
 * 
 * Componentのライフサイクルは、下記を参考にしてください。
 * http://qiita.com/kawachi/items/092bfc281f88e3a6e456
 * https://qiita.com/yukika/items/1859743921a10d7e3e6b
 * https://reactjs.org/docs/react-component.html （公式サイト）
 * 
 * React-Bootstrapについては下記を参考にしてください。
 * https://react-bootstrap.github.io/components.html
 * 
 * コーディング規約は、http://qiita.com/koukun/items/e64762e407b8dd5e0247 を参考にしてください。
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Modal, FormGroup, InputGroup, FormControl, HelpBlock, ButtonToolbar, OverlayTrigger, Tooltip } from 'react-bootstrap';

import { validateText, validateSelect, validateInteger, validateReal, successResult, errorResult, VALIDATE_STATE } from 'inputCheck';

import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';
import InputForm from 'Common/Form/InputForm';
import LabelForm from 'Common/Form/LabelForm';
import TextForm from 'Common/Form/TextForm';
import SelectForm from 'Common/Form/SelectForm';
import PointSelectModal from 'Assets/Modal/PointSelectModal';
import ChipForm from 'Assets/Condition/ChipForm';


const INITIAL_INPUTCHECK = {
    index: { state: "", helpText: "" },
    elementName:    { state: "", helpText: "" },
    point:   { state: "", helpText: "" }
}

const maxlength = {
    elementName: 20
}

/**
 * ブレーカー編集モーダルを定義します。
 * <ContentHeader></ContentHeader>
 */
export default class BreakerSelectModal extends Component {

    //MEMO 任意のstaticメソッドはここに追加します。

    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        //TODO：stateの初期化処理などをここに記述します
        this.state = {
            editedElecFacility: Object.assign({}, props.elecFacility),
            inputCheck: INITIAL_INPUTCHECK,
            showPointSelectModal: false
        };
    }

    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps(nextProps) {
        if (nextProps.elecFacility != this.props.elecFacility || nextProps.elecFacilities != this.props.elecFacilities || (!nextProps.showModal && this.props.showModal)) {
            this.setState({ inputCheck: this.initValidation(nextProps.elecFacility, nextProps.elecFacilities), editedElecFacility: Object.assign({}, nextProps.elecFacility) });
        }
    }

    /**
     * 初期入力チェック
     */
    initValidation(elecFacility, elecFacilities) {
        if (elecFacility) {
            const inputCheck = Object.assign({}, this.state.inputCheck);
            for (let key of Object.keys(inputCheck)) {
                inputCheck[key] = this.validateValue(elecFacility[key], key, elecFacility, elecFacilities);
            }
            return inputCheck;
        } else {
            return INITIAL_INPUTCHECK;
        }
    }

    /**
     * 編集されたとき
     * @param {any} val
     * @param {any} key
     */
    onEdit(val, key) {
        const elecFacility = Object.assign({}, this.state.editedElecFacility);
        elecFacility[key] = val;

        const inputCheck = Object.assign({}, this.state.inputCheck);
        inputCheck[key] = this.validateValue(val, key);

        this.setState({ editedElecFacility: elecFacility, inputCheck: inputCheck });
    }

    /**
     * 入力値を検証する
     * @param {any} val
     * @param {any} key
     */
    validateValue(val, key, elecFacility = this.props.elecFacility, elecFacilities = this.props.elecFacilities) {
        switch (key) {
            case 'index':
                const validate = validateInteger(val, 1, 18, false);
                if (validate.state == VALIDATE_STATE.error) {
                    return validate;
                }
                if (elecFacilities && elecFacilities.some((fac) => fac.index == val && elecFacility.index != val)) {
                    return errorResult('重複する値は指定できません');
                }
                return successResult;

            case 'elementName':
                return validateText(val, maxlength.elementName, false);

            case 'point':
                if (val) {
                    if (elecFacilities && elecFacilities.some((fac) => fac.point.pointNo == val.pointNo && (!elecFacility.point || elecFacility.point.pointNo != val.pointNo))) {
                        return errorResult('重複するポイントは指定できません');
                    }
                    return successResult;
                } else {
                    return errorResult('必須項目です');
                }

            default:
                return successResult;
        }
    }

    /**
     * Positionの入力値を検証する
     * @param {any} val
     */
    validatePosition(val) {
        let validate;

        //行のチェック
        validate = validateInteger(val.x, 1, 100);    // TODO: max＆min確認
        if (validate.state !== VALIDATE_STATE.success) {
            validate.helpText = validate.helpText && ('行：' + validate.helpText);
            return validate;
        }

        //列のチェック
        validate = validateInteger(val.y, 1, 4); // TODO: max＆min確認
        if (validate.state !== VALIDATE_STATE.success) {
            validate.helpText = validate.helpText && ('列：' + validate.helpText);
            return validate;
        }

        return validate;
    }

    /**
     * 適用ボタンクリック
     */
    handleSubmit() {
        if (this.props.onSubmit) {
            this.props.onSubmit(this.state.editedElecFacility);
        }
    }

    /**
     * キャンセルボタンクリック
     */
    handleCancel() {
        if (this.props.onCancel) {
            this.props.onCancel();
        }
    }

    /**
     * ポイントが選択された時
     * @param {any} points
     */
    onSelectPoints(point) {
        this.setState({ showPointSelectModal: false }, () => {
            this.onEdit({ systemId: point.systemId, pointNo: point.pointNo, pointName: point.pointName }, 'point');
        });
    }

    /**
     * 適用ボタンが使用可がどうか
     */
    isEnableApply() {
        for (let key of Object.keys(this.state.inputCheck)) {
            if (this.state.inputCheck[key].state === VALIDATE_STATE.error) {
                return false;
            }
        }
        return true;
    }

    /**
     * render
     */
    render() {
        const { showModal, isReadOnly } = this.props;
        const { editedElecFacility, inputCheck, showPointSelectModal } = this.state;

        return (
            <Modal bsSize="large" show={showModal} onHide={() => this.handleCancel()} backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>電源系統計測ポイント編集</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <InputForm >
                        <InputForm.Row>
                            <InputForm.Col label="インデックス" columnCount={2} isRequired={true}>
                                <TextForm
                                    value={editedElecFacility.index}
                                    onChange={(v) => this.onEdit(v, 'index')}
                                    validationState={inputCheck.index.state}
                                    helpText={inputCheck.index.helpText}
                                />
                            </InputForm.Col>
                            <InputForm.Col label="表示名称" columnCount={2} isRequired={true}>
                                <TextForm
                                    value={editedElecFacility.elementName}
                                    maxlength={maxlength.elementName}
                                    onChange={(v) => this.onEdit(v, 'elementName')}
                                    validationState={inputCheck.elementName.state}
                                    helpText={inputCheck.elementName.helpText}
                                />
                            </InputForm.Col>
                        </InputForm.Row>
                        <InputForm.Row>
                            <InputForm.Col label='ポイント' columnCount={1} isRequired={true}>
                                <LabelForm

                                    value={editedElecFacility.point && editedElecFacility.point.pointName}
                                    addonButton={[
                                        {
                                            key: 'select',
                                            iconId: 'link',
                                            isCircle: true,
                                            tooltipLabel: 'ポイント選択',
                                            onClick: () => this.setState({ showPointSelectModal: true })
                                        }
                                    ]}
                                    helpText={inputCheck.point.helpText}
                                    validationState={inputCheck.point.state}
                                />
                                <PointSelectModal
                                    showModal={showPointSelectModal}
                                    onSubmit={(points) => this.onSelectPoints(points)}
                                    onCancel={() => this.setState({ showPointSelectModal: false })}
                                />
                            </InputForm.Col>
                        </InputForm.Row>
                    </InputForm>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        bsStyle="primary"
                        disabled={!this.isEnableApply()}
                        onClick={() => this.handleSubmit()}
                    >
                        <Icon className="fal fa-circle mr-05" />
                        <span>適用</span>
                    </Button>
                    <Button
                        iconId="uncheck"
                        bsStyle="lightgray"
                        onClick={() => this.handleCancel()}
                    >
                        <span>キャンセル</span>
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }
}