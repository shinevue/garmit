/**
 * @license Copyright 2021 DENSO
 * 
 * ICCardEditBox Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import GarmitBox from 'Assets/GarmitBox';
import InputForm from 'Common/Form/InputForm';
import TextForm from 'Common/Form/TextForm';
import LabelFrom from 'Common/Form/LabelForm';
import CheckboxSwitch from 'Common/Widget/CheckboxSwitch';
import ToggleSwitch from 'Common/Widget/ToggleSwitch'
import EnterpriseForm from 'Assets/Condition/EnterpriseForm';
import UserForm from 'Assets/Condition/UserForm';
import LocationForm from 'Assets/Condition/LocationForm';
import DateTimeSpanForm from 'Common/Form/DateTimeSpanForm';
import CardIdForm from 'Assets/Form/CardIdForm';

import { validateCardId, validateCardName, validateEnterprise, validateUser, validateUserKana, validateValidStartDate, validateValidEndtDate, validateAllowLocations, hasEnterprise } from 'iccardUtility';
import { MAXLENGTH_CARD_ID, MAXLENGTH_CARD_NAME, MAXLENGTH_ENT_NAME, MAXLENGTH_USER_NAME, MAXLENGTH_USER_KANA } from 'iccardUtility';
import { VALID_DATE_FORMAT } from 'iccardUtility';
import { KEY_ICCARD_CARD_ID, KEY_ICCARD_CARD_NAME, KEY_ICCARD_ENTERPRISE, KEY_ICCARD_USER, KEY_ICCARD_USER_KANA  } from 'iccardUtility';
import { KEY_ICCARD_VALID_DATE, KEY_ICCARD_IS_INVALID, KEY_ICCARD_IS_ADMIN, KEY_ICCARD_ALLOW_LOCATIONS } from 'iccardUtility';
import { successResult, VALIDATE_STATE } from 'inputCheck';

/**
 * ICカード編集ボックス（単体）
 * @param {object} icCardEntity ICカード基本情報
 * @param {array} allowLocations 操作可能ラック一覧
 * @param {boolean} useEnterprise 所属から選択するかどうか
 * @param {boolean} useLoginUser ログインユーザーから選択するかどうか
 * @param {array} enterprises 所属一覧
 * @param {array} loginUsers ログインユーザー一覧
 * @param {array} locations 電気錠ラックロケーション一覧
 * @param {boolean} isLoading ロード中かどうか
 * @param {boolean} isReadOnly 読取専用かどうか
 * @param {function} onChange ICカード変更時に呼び出す
 * @param {function} onChangeUseEnterprise 「所属から選択する」変更時に呼び出す
 * @param {function} onChangeUseLoginUser 「ユーザーから選択する」変更時に呼び出す
 * @param {function} onChangeEnterprise 所属変更時に呼び出す
 * @param {function} onChangeInvalid 保存が無効かどうかの変更時に呼び出す
 */
export default class ICCardEditBox extends Component {
    
    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        const { icCardEntity, allowLocations, isReadOnly, useEnterprise, useLoginUser } = props;
        this.state = {
            validate: {
                cardId: !isReadOnly ? validateCardId(icCardEntity.cardId) : { state: null, helpText: null },
                cardName: !isReadOnly ? validateCardName(icCardEntity.cardName) : { state: null, helpText: null },
                enterprise: !isReadOnly ? validateEnterprise(icCardEntity.enterpriseId, icCardEntity.enterpriseName, useEnterprise) : { state: null, helpText: null },
                user: !isReadOnly ? validateUser(icCardEntity.userName, useLoginUser) : { state: null, helpText: null },
                userKana: !isReadOnly ? validateUserKana(icCardEntity.userKana) : { state: null, helpText: null },
                validStartDate: !isReadOnly ? validateValidStartDate(icCardEntity.validStartDate) : { state: null, helpText: null },
                validEndDate: !isReadOnly ? validateValidEndtDate(icCardEntity.validStartDate, icCardEntity.validEndDate) : { state: null, helpText: null },
                isInvalid: !isReadOnly ? successResult : { state: null, helpText: null },
                isAdmin: !isReadOnly ? successResult : { state: null, helpText: null },
                allowLocations: !isReadOnly ? validateAllowLocations(allowLocations, icCardEntity.isAdmin) : { state: null, helpText: null }
            }
        };
    }

    //#region React ライフサイクルメソッド

    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps( nextProps ){
        const beforeNo = this.props.icCardEntity && this.props.icCardEntity.cardNo;
        const nextICCardEntity = nextProps.icCardEntity;
        const nextAllowLocations = nextProps.allowLocations;
        const nextUseEnterprise = nextProps.useEnterprise;
        const nextUseLoginUser = nextProps.useLoginUser;
        const nextReadOnly = nextProps.isReadOnly;
        const nextNo = nextICCardEntity && nextICCardEntity.cardNo;
        if ((!beforeNo && nextNo) || (beforeNo !== nextNo)){
            this.setState({
                validate: {
                    cardId: nextICCardEntity && !nextReadOnly ? validateCardId(nextICCardEntity.cardId) : { state: null, helpText: null },
                    cardName: nextICCardEntity && !nextReadOnly ? validateCardName(nextICCardEntity.cardName) : { state: null, helpText: null },
                    enterprise: nextICCardEntity && !nextReadOnly ? validateEnterprise(nextICCardEntity.enterpriseId, nextICCardEntity.enterpriseName, nextUseEnterprise) : { state: null, helpText: null },
                    user: nextICCardEntity && !nextReadOnly ? validateUser(nextICCardEntity.userName, nextUseLoginUser) : { state: null, helpText: null },
                    userKana: nextICCardEntity && !nextReadOnly ? validateUserKana(nextICCardEntity.userKana) : { state: null, helpText: null },
                    validStartDate: nextICCardEntity && !nextReadOnly ? validateValidStartDate(nextICCardEntity.validStartDate) : { state: null, helpText: null },
                    validEndDate: nextICCardEntity && !nextReadOnly ? validateValidEndtDate(nextICCardEntity.validStartDate, nextICCardEntity.validEndDate) : { state: null, helpText: null },
                    isInvalid: nextICCardEntity && !nextReadOnly ? successResult : { state: null, helpText: null },
                    isAdmin: nextICCardEntity && !nextReadOnly ? successResult : { state: null, helpText: null },
                    allowLocations: nextAllowLocations && !nextReadOnly ? validateAllowLocations(nextAllowLocations, nextICCardEntity.isAdmin) : { state: null, helpText: null }
                }
            });
        } else if (this.props.useEnterprise !== nextUseEnterprise || 
                   this.props.icCardEntity.isAdmin !== nextICCardEntity.isAdmin ||
                   this.props.icCardEntity.enterpriseId !== nextICCardEntity.enterpriseId) {
            let validate = Object.assign({}, this.state.validate);
            validate[KEY_ICCARD_ENTERPRISE] = validateEnterprise(nextICCardEntity.enterpriseId, nextICCardEntity.enterpriseName, nextUseEnterprise);
            validate[KEY_ICCARD_USER] = validateUser(nextICCardEntity.userName, nextUseLoginUser);
            validate[KEY_ICCARD_ALLOW_LOCATIONS] = validateAllowLocations(nextAllowLocations, nextICCardEntity.isAdmin);
            this.setState({validate: validate}, this.onChangeInvalid(validate));
        } else if (this.props.useLoginUser !== nextUseLoginUser) {
            let validate = this.setValidate(validateUser(nextICCardEntity.userName, nextUseLoginUser), KEY_ICCARD_USER);
            this.onChangeInvalid(validate);
        }
    }

    //#endregion

    /**
     * render
     */
    render() {
        const { icCardType, icCardEntity, allowLocations, useEnterprise, useLoginUser, enterprises, loginUsers, locations, isLoading, isReadOnly } = this.props;
        if (icCardEntity) {
            var { cardNo, cardId, cardName, enterpriseId, enterpriseName, userId, userName, userKana, validStartDate, validEndDate, isInvalid, isAdmin } = icCardEntity;
        }
        const { validate } = this.state;
        const selectedEnterprise = useEnterprise && hasEnterprise(enterpriseId) ? { enterpriseId, enterpriseName} : null;
        const selectedUser = useLoginUser && userId ? loginUsers.find(user => user.userId === userId) : null;
        const selectable = useEnterprise ? hasEnterprise(enterpriseId) : true;
        return (
            <GarmitBox title="ICカード情報" isLoading={isLoading} >
                <InputForm>
                    <InputForm.Row>
                        <InputForm.Col label="カードID" columnCount={2} isRequired >
                            <CardIdForm
                                icCardType={icCardType}
                                value={cardId}
                                validationState={validate.cardId.state}
                                helpText={validate.cardId.helpText}
                                onChange={(value) => this.onChange(KEY_ICCARD_CARD_ID, value, validateCardId(value))}
                                maxlength={MAXLENGTH_CARD_ID}
                                disabled={isReadOnly}
                            />
                        </InputForm.Col>
                        <InputForm.Col label='カード番号' columnCount={2} >
                            <LabelFrom value={cardNo&&cardNo > 0 ? cardNo : ''} />
                        </InputForm.Col>
                    </InputForm.Row>
                    <InputForm.Row>
                        <InputForm.Col label="カード名称" columnCount={1} isRequired >
                            <TextForm 
                                value={cardName} 
                                isReadOnly={isReadOnly}
                                validationState={validate.cardName.state}
                                helpText={validate.cardName.helpText}
                                onChange={(value) => this.onChange(KEY_ICCARD_CARD_NAME, value, validateCardName(value))} 
                                maxlength={MAXLENGTH_CARD_NAME}
                            />
                        </InputForm.Col>
                    </InputForm.Row>
                    <InputForm.Row>
                        <InputForm.Col label="権限" columnCount={1} isRequired>
                            <ToggleSwitch   name="isAdmin" 
                                            defaultValue={true}
                                            value={isAdmin}
                                            swichValues={[{value: true, text: '管理者'}, {value: false, text: 'それ以外'}]}
                                            onChange={(checked) => this.onChange(KEY_ICCARD_IS_ADMIN, checked, successResult)}
                            />
                        </InputForm.Col>
                    </InputForm.Row>
                    <InputForm.Row>
                        <InputForm.Col label="会社名" columnCount={1} isRequired>
                            {!isAdmin&&
                                <div className="mb-1">
                                    <CheckboxSwitch text="所属から選択する" 
                                                    bsSize="sm"
                                                    checked={useEnterprise}
                                                    onChange={(checked) => this.onChangeUseEnterprise(checked)}
                                    />
                                </div>
                            }
                            {useEnterprise&&
                                <EnterpriseForm
                                    disabled={isReadOnly}
                                    enterpriseList={enterprises}
                                    selectedEnterprise={selectedEnterprise}
                                    clearButton={false}
                                    onChange={(value) => this.onChangeEnterprise(value, useEnterprise)}
                                    validationState={validate.enterprise.state}
                                    helpText={validate.enterprise.helpText}
                                />
                            }
                            {!useEnterprise&&
                                <TextForm 
                                    value={enterpriseName} 
                                    isReadOnly={isReadOnly}
                                    validationState={validate.enterprise.state}
                                    helpText={validate.enterprise.helpText}
                                    onChange={(value) => this.onChange(KEY_ICCARD_ENTERPRISE, { enterpriseId: null, enterpriseName: value }, validateEnterprise(null, value, useEnterprise))}
                                    maxlength={MAXLENGTH_ENT_NAME}
                                />
                            }
                        </InputForm.Col>
                    </InputForm.Row>
                    <InputForm.Row>
                        <InputForm.Col label="ユーザー名" columnCount={2} >
                            <div className="mb-1">
                                <CheckboxSwitch text="ユーザーから選択する" 
                                                bsSize="sm"
                                                checked={useLoginUser} 
                                                onChange={(checked) => this.onChangeUseLoginUser(checked)}                                />
                            </div>                            
                            {useLoginUser&&
                                <UserForm
                                    multiple={false}
                                    loginUserList={loginUsers}
                                    selectedLoginUser={selectedUser}
                                    clearButton
                                    displayButton
                                    validationState={validate.user.state}
                                    helpText={validate.user.helpText}
                                    onChange={(value) => this.onChange(KEY_ICCARD_USER, value ? value : { userId: null, userName: '' }, validateUser(value?value.userName:null, useLoginUser))}
                                    disabled={isReadOnly || !selectable}
                                />
                            }
                            {!useLoginUser&&
                                <TextForm 
                                    value={userName} 
                                    isReadOnly={isReadOnly}
                                    validationState={validate.user.state}
                                    helpText={validate.user.helpText}
                                    onChange={(value) => this.onChange(KEY_ICCARD_USER, { userId: null, userName: value }, validateUser(value, useLoginUser))} 
                                    maxlength={MAXLENGTH_USER_NAME}
                                />
                            }
                            {useLoginUser && !isReadOnly && !selectable &&
                                <div>※所属選択後、ユーザーが選択可能となります</div>
                            }
                        </InputForm.Col>
                        <InputForm.Col label="ユーザー名（フリガナ）" columnCount={2} >
                            <TextForm 
                                value={userKana} 
                                isReadOnly={isReadOnly}
                                validationState={validate.userKana.state}
                                helpText={validate.userKana.helpText}
                                onChange={(value) => this.onChange(KEY_ICCARD_USER_KANA, value, validateUserKana(value))} 
                                maxlength={MAXLENGTH_USER_KANA}
                            />
                        </InputForm.Col>
                    </InputForm.Row>
                    <InputForm.Row>
                        <InputForm.Col label="有効期間" columnCount={1} isRequired >
                            <DateTimeSpanForm
                                isReadOnly={isLoading}
                                timePicker={true}
                                format={VALID_DATE_FORMAT}
                                from={validStartDate}
                                validationFrom={validate.validStartDate}
                                to={validEndDate}
                                validationTo={validate.validEndDate}
                                onChange={(start, end) => this.onChangeValidDate(start, end)}
                            />
                        </InputForm.Col>
                    </InputForm.Row>
                    {!isAdmin&&
                        <InputForm.Row>
                            <InputForm.Col label="操作可能ラック" columnCount={1} isRequired>
                                <LocationForm
                                    multiple
                                    disabled={isReadOnly || !selectable}
                                    locationList={locations}
                                    checkedLocations={allowLocations || []}
                                    separateCheckMode={true}
                                    onChange={(value) => this.onChange(KEY_ICCARD_ALLOW_LOCATIONS ,value, validateAllowLocations(value, isAdmin))}
                                    validationState={validate.allowLocations.state}
                                    helpText={validate.allowLocations.helpText}
                                />
                                {!isReadOnly && !selectable &&
                                    <div>※所属選択後、操作可能ラックが選択可能となります</div>
                                }
                            </InputForm.Col>
                        </InputForm.Row>
                    }
                    <InputForm.Row>
                        <InputForm.Col label="有効にする" columnCount={1} isRequired>
                            <CheckboxSwitch text={!isInvalid?'ON':'OFF'} 
                                            checked={!isInvalid} 
                                            onChange={(checked) => this.onChange(KEY_ICCARD_IS_INVALID, !checked, successResult)}
                            />
                        </InputForm.Col>
                    </InputForm.Row>
                </InputForm>
            </GarmitBox>
        );
    }
    
    //#region 入力変更

    /**
     * 入力変更イベントを発生させる
     * @param {string} key 変更値のオブジェクトキー
     * @param {any} value 変更後の値
     * @param {object} validate 入力検証結果
     */
    onChange(key, value, validate){
        var validateResult = this.setValidate(validate, key);
        if (this.props.onChange) {
            this.props.onChange(key, value, this.invalid(validateResult));
        }
    }

    /**
     * 有効期間を変更する
     * @param {any} start 開始日時
     * @param {any} end 終了日時
     */
    onChangeValidDate(start, end) {
        var validate = Object.assign({}, this.state.validate);
        validate.validStartDate = validateValidStartDate(start);
        validate.validEndDate = validateValidEndtDate(start, end);
        this.setState({validate: validate});
        if (this.props.onChange) {
            this.props.onChange(KEY_ICCARD_VALID_DATE, { startDate: start, endDate: end }, this.invalid(validate));
        }
    }

    /**
     *  「所属から選択する」スイッチ変更
     * @param {boolean} useEnterprise 所属から選択するかどうか
     */
    onChangeUseEnterprise(useEnterprise) {
        if (this.onChangeUseEnterprise) {
            this.props.onChangeUseEnterprise(useEnterprise);
        }
    }
    /**
     * 「ユーザーから選択する」スイッチ変更
     * @param {boolean} useLoginUser ユーザーから選択するかどうか
     */
    onChangeUseLoginUser(useLoginUser) {
        if (this.onChangeUseLoginUser) {
            this.props.onChangeUseLoginUser(useLoginUser);
        }
    }

    /**
     * 所属変更
     * @param {object} enterprise 所属
     * @param {boolean} useEnterprise 所属から選択するかどうか
     */
    onChangeEnterprise(enterprise, useEnterprise) {
        this.onChange(KEY_ICCARD_ENTERPRISE, enterprise, validateEnterprise(enterprise.enterpriseId, enterprise.enterpriseName, useEnterprise));
        if (this.props.onChangeEnterprise) {
            this.props.onChangeEnterprise(enterprise.enterpriseId);
        }
    }

    /**
     * 保存が無効かどうかの変更
     * @param {object} validate 入力検証結果
     */
    onChangeInvalid(validate) {
        if (this.props.onChangeInvalid) {
            this.props.onChangeInvalid(this.invalid(validate));
        }
    }

    /**
     * 保存が無効かどうかを取得する
     * @param {object} validate 入力検証結果
     * @returns {boolean} 保存が無効かどうか
     */
    invalid(validate) {
        var invalid = false;
        for (const key in validate) {
            if (validate.hasOwnProperty(key) &&                 
                validate[key].state !== VALIDATE_STATE.success && validate[key].state !== null) {
                    invalid = true;
                    break; 
            }
        }
        return invalid;
    }

    //#endregion

    //#region 入力検証

    /**
     * 検証結果をセットする
     * @param {object} targetValidate 更新する検証結果
     * @param {string} key オブジェクトのキー
     * @returns {object} 更新後の検証結果
     */
    setValidate(targetValidate, key) {
        var validate = Object.assign({}, this.state.validate);
        if (validate.hasOwnProperty(key) && targetValidate) {
            validate[key] = targetValidate;
            this.setState({validate: validate});
        }        
        return validate;
    }

    //#endregion
}