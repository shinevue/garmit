/**
 * @license Copyright 2020 DENSO
 * 
 * ProjectBox Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import InputForm from 'Common/Form/InputForm';
import TextForm from 'Common/Form/TextForm';
import DateTimeForm from 'Common/Form/DateTimeForm';
import TextareaForm from 'Common/Form/TextareaForm';
import GarmitBox from 'Assets/GarmitBox';

import { validateDate, VALIDATE_STATE } from 'inputCheck';
import { PROJECT_TYPE } from 'constant';
import { MAXLENGTH_PROJECT_NO, MAXLENGTH_USER_NAME, MAXLENGTH_CHARGE_NAME, MAXLENGTH_MEMO, PROJECT_DATE_FORMAT } from 'projectUtility';
import { validateProjectNo, validateUserName, validateChargeName, validateMemo } from 'projectUtility';
import { OPENDATE_PROJECT_TYPES, CLOSEDATE_PROJECT_TYPES } from 'projectUtility';

/**
 * 案件概要ボックス
 * @param {object} project 案件情報
 * @param {boolean} isLoading ロード中かどうか
 * @param {boolean} fixedflg 確定済みかどうか
 * @param {boolean} isReadOnly 読取専用かどうか
 * @param {function} onChange 案件変更時に呼び出す
 */
export default class ProjectBox extends Component {
    
    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        const { project, fixedflg, isReadOnly } = props;
        this.state = {
            validate: {
                projectNo: project && !fixedflg && !isReadOnly ? validateProjectNo(project.projectNo) : { state: null, helpText: null },
                receptDate: project && !fixedflg && !isReadOnly ? validateDate(project.receptDate, PROJECT_DATE_FORMAT, false) : { state: null, helpText: null },
                userName: project && !fixedflg && !isReadOnly ? validateUserName(project.userName) : { state: null, helpText: null },
                chargeName: project && !fixedflg && !isReadOnly ? validateChargeName(project.chargeName) : { state: null, helpText: null },
                compreqDate: project && !fixedflg && !isReadOnly ? validateDate(project.compreqDate, PROJECT_DATE_FORMAT, false) : { state: null, helpText: null },
                openDate: project && !fixedflg && !isReadOnly ? validateDate(project.openDate, PROJECT_DATE_FORMAT, true) : { state: null, helpText: null },
                closeDate: project && !fixedflg && !isReadOnly ? validateDate(project.closeDate, PROJECT_DATE_FORMAT, true) : { state: null, helpText: null },
                observeDate: project && !fixedflg && !isReadOnly ? validateDate(project.observeDate, PROJECT_DATE_FORMAT, true) : { state: null, helpText: null },
                memo: project && !isReadOnly ? validateMemo(project.memo) : { state: null, helpText: null }
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
        const beforeId = this.props.project && this.props.project.projectId;
        const nextProject = nextProps.project;
        const nextFixedflg = nextProps.fixedflg;
        const nextReadOnly = nextProps.isReadOnly;
        const nextId = nextProject && nextProject.projectId;
        if ((!beforeId && nextId) || (beforeId !== nextId)){
            this.setState({
                validate: {
                    projectNo: nextProject && !nextFixedflg && !nextReadOnly ? validateProjectNo(nextProject.projectNo) : { state: null, helpText: null },
                    receptDate: nextProject && !nextFixedflg && !nextReadOnly ? validateDate(nextProject.receptDate, PROJECT_DATE_FORMAT, false) : { state: null, helpText: null },
                    userName: nextProject && !nextFixedflg && !nextReadOnly ? validateUserName(nextProject.userName) : { state: null, helpText: null },
                    chargeName: nextProject && !nextFixedflg && !nextReadOnly ? validateChargeName(nextProject.chargeName) : { state: null, helpText: null },
                    compreqDate: nextProject && !nextFixedflg && !nextReadOnly ? validateDate(nextProject.compreqDate, PROJECT_DATE_FORMAT, false) : { state: null, helpText: null },
                    openDate: nextProject && !nextFixedflg && !nextReadOnly ? validateDate(nextProject.openDate, PROJECT_DATE_FORMAT, true) : { state: null, helpText: null },
                    closeDate: nextProject && !nextFixedflg && !nextReadOnly ? validateDate(nextProject.closeDate, PROJECT_DATE_FORMAT, true) : { state: null, helpText: null },
                    observeDate: nextProject && !nextFixedflg && !nextReadOnly ? validateDate(nextProject.observeDate, PROJECT_DATE_FORMAT, true) : { state: null, helpText: null },
                    memo: nextProject && !nextFixedflg && !nextReadOnly ? validateMemo(nextProject.memo) : { state: null, helpText: null }
                }
            });
        } else if (nextProject && nextProject.projectType !== this.props.project.projectType) {
            const updateValidate = _.cloneDeep(this.state.validate);
            updateValidate.openDate = !nextFixedflg && !nextReadOnly ? validateDate(nextProject.openDate, PROJECT_DATE_FORMAT, true) : { state: null, helpText: null };
            updateValidate.closeDate = !nextFixedflg && !nextReadOnly ? validateDate(nextProject.closeDate, PROJECT_DATE_FORMAT, true) : { state: null, helpText: null };
            this.setState({
                validate: updateValidate
            });
        }
    }

    //#endregion

    /**
     * render
     */
    render() {
        const { project, isLoading, fixedflg, isReadOnly } = this.props;
        if (project) {
            var { projectType, projectNo, receptDate, userName, chargeName, compreqDate, openDate, closeDate, observeDate, memo } = project;
        }
        const { validate } = this.state;
        return (
            <GarmitBox title="案件概要" isLoading={isLoading} >
                <InputForm>
                    <InputForm.Row>
                        <InputForm.Col label="工事番号" columnCount={2} isRequired >
                            <TextForm 
                                value={projectNo} 
                                isReadOnly={fixedflg||isReadOnly}
                                validationState={validate.projectNo.state}
                                helpText={validate.projectNo.helpText}
                                onChange={(value) => this.onChange('projectNo', value, validateProjectNo(value))} 
                                maxlength={MAXLENGTH_PROJECT_NO}
                            />
                            </InputForm.Col>
                        <InputForm.Col label="受付年月日" columnCount={2} isRequired >
                            <DateTimeForm
                                value={receptDate}
                                format={PROJECT_DATE_FORMAT}
                                timePicker={false}
                                isReadOnly={fixedflg||isReadOnly}
                                validationState={validate.receptDate.state}
                                helpText={validate.receptDate.helpText}
                                onChange={(value) => this.onChange('receptDate', value, validateDate(value, PROJECT_DATE_FORMAT, false))}
                            />
                        </InputForm.Col>
                    </InputForm.Row>
                    <InputForm.Row>
                        <InputForm.Col label="ユーザー名" columnCount={2} isRequired >
                            <TextForm 
                                value={userName} 
                                isReadOnly={fixedflg||isReadOnly}
                                validationState={validate.userName.state}
                                helpText={validate.userName.helpText}
                                onChange={(value) => this.onChange('userName', value, validateUserName(value))} 
                                maxlength={MAXLENGTH_USER_NAME}
                            />
                        </InputForm.Col>
                        <InputForm.Col label="担当者" columnCount={2} isRequired >
                            <TextForm 
                                value={chargeName} 
                                isReadOnly={fixedflg||isReadOnly}
                                validationState={validate.chargeName.state}
                                helpText={validate.chargeName.helpText}
                                onChange={(value) => this.onChange('chargeName', value, validateChargeName(value))} 
                                maxlength={MAXLENGTH_CHARGE_NAME}
                            />
                        </InputForm.Col>
                    </InputForm.Row>
                    <InputForm.Row>
                        <InputForm.Col label="工事完了希望日" columnCount={projectType!==PROJECT_TYPE.change?3:2} isRequired >
                            <DateTimeForm
                                value={compreqDate}
                                isReadOnly={fixedflg||isReadOnly}
                                format={PROJECT_DATE_FORMAT}
                                timePicker={false}
                                validationState={validate.compreqDate.state}
                                helpText={validate.compreqDate.helpText}
                                onChange={(value) => this.onChange('compreqDate', value, validateDate(value, PROJECT_DATE_FORMAT, false))}
                            />
                        </InputForm.Col>
                        {CLOSEDATE_PROJECT_TYPES.includes(projectType)&&
                            <InputForm.Col label="廃止年月日" columnCount={3}>
                                <DateTimeForm
                                    value={closeDate}
                                    isReadOnly={fixedflg||isReadOnly}
                                    format={PROJECT_DATE_FORMAT}
                                    timePicker={false}
                                    validationState={validate.closeDate.state}
                                    helpText={validate.closeDate.helpText}
                                    onChange={(value) => this.onChange('closeDate', value, validateDate(value, PROJECT_DATE_FORMAT, true))}
                                />
                            </InputForm.Col>
                        }
                        {OPENDATE_PROJECT_TYPES.includes(projectType)&&
                            <InputForm.Col label="開通年月日" columnCount={3}>
                                <DateTimeForm
                                    value={openDate}
                                    isReadOnly={fixedflg||isReadOnly}
                                    format={PROJECT_DATE_FORMAT}
                                    timePicker={false}
                                    validationState={validate.openDate.state}
                                    helpText={validate.openDate.helpText}
                                    onChange={(value) => this.onChange('openDate', value, validateDate(value, PROJECT_DATE_FORMAT, true))}
                                />
                            </InputForm.Col>
                        }
                        <InputForm.Col label="工事立会日" columnCount={projectType!==PROJECT_TYPE.change?3:2} >
                            <DateTimeForm
                                value={observeDate}
                                isReadOnly={fixedflg||isReadOnly}
                                format={PROJECT_DATE_FORMAT}
                                timePicker={false}
                                validationState={validate.observeDate.state}
                                helpText={validate.observeDate.helpText}
                                onChange={(value) => this.onChange('observeDate', value, validateDate(value, PROJECT_DATE_FORMAT, true))}
                            />
                        </InputForm.Col>
                    </InputForm.Row>
                    <InputForm.Row>
                        <InputForm.Col label="備考" columnCount={1} >
                            <TextareaForm 
                                value={memo} 
                                validationState={validate.memo.state}
                                helpText={validate.memo.helpText}
                                isReadOnly={isReadOnly}
                                onChange={(value) => this.onChange('memo', value, validateMemo(value))}
                                maxlength={MAXLENGTH_MEMO}
                                showTextLength
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

ProjectBox.propsTypes = {
    project: PropTypes.object,
    isLoading: PropTypes.bool,
    fixedflg: PropTypes.bool,
    isReadOnly: PropTypes.bool,
    onChange: PropTypes.func
}