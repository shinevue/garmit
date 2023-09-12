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

import { Modal, InputGroup, FormControl } from 'react-bootstrap';
import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';

import { validateText, validateSelect, validateInteger, validateReal, successResult, errorResult, VALIDATE_STATE } from 'inputCheck';
import { BREAKER_STATUS } from 'constant';
import { LAVEL_TYPE } from 'authentication';

import InputForm from 'Common/Form/InputForm';
import LabelForm from 'Common/Form/LabelForm';
import TextForm from 'Common/Form/TextForm';
import Text2DForm from 'Common/Form/Text2DForm';
import SelectForm from 'Common/Form/SelectForm';
import PointSelectModal from 'Assets/Modal/PointSelectModal';
import ChipForm from 'Assets/Condition/ChipForm';

const INITIAL_INPUTCHECK = {
    breakerName: { state: "", helpText: "" },
    ratedCurrent: { state: "", helpText: "" },
    ratedVoltage: { state: "", helpText: "" },
    position: { state: "", helpText: "" },
    breakerStatus: { state: "", helpText: "" },
    points: { state: "", helpText: "" },
};

const maxlength = {
    breakerName: 20
};

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
            tmpBreaker: Object.assign({}, props.breaker),
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
        if (nextProps.breaker !== this.props.breaker || (!nextProps.showModal && this.props.showModal)) {
            this.setState({ inputCheck: this.initValidation(nextProps.breaker, nextProps.breakers, nextProps.egroup), tmpBreaker: Object.assign({}, nextProps.breaker) });
        }
    }

    /**
     * 初期入力チェック
     */
    initValidation(breaker, breakers, egroup) {
        if (breaker) {
            const inputCheck = Object.assign({}, this.state.inputCheck);
            for (let key of Object.keys(inputCheck)) {
                inputCheck[key] = this.validateValue(breaker[key], key, breaker, breakers, egroup);
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
        const breaker = Object.assign({}, this.state.tmpBreaker);
        breaker[key] = val;

        const inputCheck = Object.assign({}, this.state.inputCheck);
        inputCheck[key] = this.validateValue(val, key);

        this.setState({ tmpBreaker: breaker, inputCheck: inputCheck });
    }

    /**
     * 入力値を検証する
     * @param {any} val
     * @param {any} key
     */
    validateValue(val, key, breaker = this.props.breaker, breakers = this.props.breakers, egroup = this.props.egroup) {
        switch (key) {
            case 'breakerName':
                return validateText(val, maxlength.breakerName, false);

            case 'ratedCurrent':
            case 'ratedVoltage':
                return validateInteger(val, 0, 10000, true);

            case 'position':
                return this.validatePosition(val, breaker, breakers, egroup);

            case 'breakerStatus':
                return validateSelect(val);

            default:
                return successResult;
        }
    }

    /**
     * Positionの入力値を検証する
     * @param {any} val
     */
    validatePosition(val, breaker, breakers, egroup) {
        let validate;

        //行のチェック
        validate = validateInteger(val.y, 1, (egroup && egroup.rowCount) || 1);
        if (validate.state !== VALIDATE_STATE.success) {
            validate.helpText = validate.helpText && ('行：' + validate.helpText);
            return validate;
        }

        //列のチェック
        validate = validateInteger(val.x, 1, (egroup && egroup.colCount) || 1);
        if (validate.state !== VALIDATE_STATE.success) {
            validate.helpText = validate.helpText && ('列：' + validate.helpText);
            return validate;
        }

        //位置の重複チェック
        if (breakers && breakers.some((br) => br.position.x == val.x && br.position.y == val.y && br != breaker)) {
            return errorResult('重複する位置は指定できません');
        }

        return validate;
    }

    /**
     * 適用ボタンクリック
     */
    handleSubmit() {
        if (this.props.onSubmit) {
            this.props.onSubmit(this.state.tmpBreaker);
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
    onSelectPoints(points) {
        this.setState({ showPointSelectModal: false }, () => {
            this.onEdit(points, 'points');
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
        const { showModal, level } = this.props;
        const { tmpBreaker, inputCheck, showPointSelectModal } = this.state;

        return (
            <Modal bsSize="large" show={showModal} onHide={() => this.handleCancel()} backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>分岐電源編集</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <InputForm >
                        <InputForm.Row>
                            <InputForm.Col label="電源名称" columnCount={2} isRequired={true}>
                                <TextForm
                                    value={tmpBreaker.breakerName}
                                    maxlength={maxlength.breakerName}
                                    onChange={(v) => this.onEdit(v, 'breakerName')}
                                    validationState={inputCheck.breakerName.state}
                                    helpText={inputCheck.breakerName.helpText}
                                />
                            </InputForm.Col>
                            <InputForm.Col label="ステータス" columnCount={2} isRequired={true}>
                                <SelectForm
                                    isReadOnly={level === LAVEL_TYPE.operator}
                                    value={tmpBreaker.breakerStatus}
                                    options={BREAKER_STATUS}
                                    onChange={(v) => this.onEdit(v, 'breakerStatus')}
                                    validationState={inputCheck.breakerStatus.state}
                                    helpText={inputCheck.breakerStatus.helpText}
                                />
                            </InputForm.Col>
                        </InputForm.Row>
                        <InputForm.Row>
                            <InputForm.Col label="表示位置" columnCount={2} isRequired={true}>
                                <Text2DForm
                                    value={tmpBreaker.position && { col: tmpBreaker.position.x, row: tmpBreaker.position.y }}
                                    onChange={(v) => this.onEdit({ x: v.col, y: v.row }, 'position')}
                                    validationState={inputCheck.position.state}
                                    helpText={inputCheck.position.helpText}
                                />
                            </InputForm.Col>
                            <InputForm.Col label='ポイント' columnCount={2} isRequired={false}>
                                <LabelForm
                                    value={tmpBreaker.points && tmpBreaker.points[0] && tmpBreaker.points[0].pointName}
                                    addonButton={[
                                        {
                                            key: 'select',
                                            iconId: 'link',
                                            isCircle: true,
                                            tooltipLabel: 'ポイント選択',
                                            onClick: () => this.setState({ showPointSelectModal: true })
                                        },
                                        {
                                            key: 'clear',
                                            iconId: 'erase',
                                            isCircle: true,
                                            tooltipLabel: 'クリア',
                                            onClick: () => this.onEdit([], 'points')
                                        }
                                    ]}
                                    validationState={inputCheck.points.state}
                                    helpText={inputCheck.points.helpText}
                                />
                                <PointSelectModal
                                    showModal={showPointSelectModal}
                                    onSubmit={(point) => this.onSelectPoints([point])}
                                    onCancel={() => this.setState({ showPointSelectModal: false })}
                                />
                            </InputForm.Col>
                        </InputForm.Row>
                        <InputForm.Row>
                            <InputForm.Col label="定格電流値" columnCount={2} isRequired={false}>
                                <TextForm
                                    value={tmpBreaker.ratedCurrent}
                                    unit="A"
                                    onChange={(v) => this.onEdit(v, 'ratedCurrent')}
                                    validationState={inputCheck.ratedCurrent.state}
                                    helpText={inputCheck.ratedCurrent.helpText}
                                />
                            </InputForm.Col>
                            <InputForm.Col label="定格電圧値" columnCount={2} isRequired={false}>
                                <TextForm
                                    value={tmpBreaker.ratedVoltage}
                                    unit="V"
                                    onChange={(v) => this.onEdit(v, 'ratedVoltage')}
                                    validationState={inputCheck.ratedVoltage.state}
                                    helpText={inputCheck.ratedVoltage.helpText}
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