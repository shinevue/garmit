/**
 * @license Copyright 2020 DENSO
 * 
 * LineBulkModal Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import { Modal } from 'react-bootstrap';
import InputForm from 'Common/Form/InputForm';
import { ApplyButton, CancelButton } from 'Assets/GarmitButton';
import TextForm from 'Common/Form/TextForm';
import LocationForm from 'Assets/Condition/LocationForm';

import { KEY_PROJECT_LINE_ID, KEY_PROJECT_LINE_ID_1, KEY_PROJECT_LINE_ID_2, KEY_PROJECT_LINE_ID_3, KEY_PROJECT_LINE_NAME, KEY_PROJECT_LOCATION, MAXLENGTH_PROJECT_LINE_ID, MAXLENGTH_PROJECT_LINE_NAME } from 'projectLineUtility';
import { validateProjectLineId, validateProjectLineName, validateLocation } from 'projectLineUtility';
import { successResult, VALIDATE_STATE } from 'inputCheck';

/**
 * 回線一括編集モーダル
 * @param {boolean} show モーダルを表示するかどうか
 * @param {array} locations ロケーションリスト
 * @param {function} onApply 適用ボタンクリック時に呼び出す
 * @param {function} onCancel キャンセルボタンクリック時に呼び出す
 */
export default class LineBulkModal extends Component {
    
    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        this.state = {
            editKeys: [],
            editLine: {
                lineId1: null,
                lineId2: null,
                lineId3: null,
                lineName: null,
                location: null
            },
            validate: {
                lineId1: { state: null, helpText: null },
                lineId2: { state: null, helpText: null },
                lineId3: { state: null, helpText: null },
                lineName: { state: null, helpText: null },
                location: { state: null, helpText: null }
            }
        };
    }

    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps( nextProps ){
        if (this.props.show !== nextProps.show && nextProps.show === true) {
            this.setState({
                editKeys: [],
                editLine: {
                    lineId1: null,
                    lineId2: null,
                    lineId3: null,
                    lineName: null,
                    location: null
                },
                validate: {
                    lineId1: { state: null, helpText: null },
                    lineId2: { state: null, helpText: null },
                    lineId3: { state: null, helpText: null },
                    lineName: { state: null, helpText: null },
                    location: { state: null, helpText: null }
                }
            });
        }
    }

    /**
     * render
     */
    render() {
        const { show, locations } = this.props;
        const { editKeys, editLine } = this.state;
        if (editLine) {
            var { lineId1, lineId2, lineId3, lineName, location } = editLine;
        }
        const { validate } = this.state;
        var checked = {
            lineId: editKeys.indexOf(KEY_PROJECT_LINE_ID_1)>=0 && editKeys.indexOf(KEY_PROJECT_LINE_ID_2)>=0 && editKeys.indexOf(KEY_PROJECT_LINE_ID_3)>=0 ,
            lineName: editKeys.indexOf(KEY_PROJECT_LINE_NAME)>=0,
            location: editKeys.indexOf(KEY_PROJECT_LOCATION)>=0
        };

        return (
            <Modal bsSize="large" show={show} onHide={this.handleCancel} backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>回線詳細</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <InputForm >
                        <InputForm.Row>
                            <InputForm.Col 
                                label="回線ID" 
                                columnCount={1}
                                checkbox
                                checked={checked[KEY_PROJECT_LINE_ID]}
                                onCheckChange={(checked) => this.changeCheckedLineId(checked, lineId1, lineId2, lineId3)}
                            >
                                <TextForm 
                                    formControlClassName="mb-05"
                                    value={lineId1} 
                                    isReadOnly={!checked[KEY_PROJECT_LINE_ID]}
                                    validationState={validate.lineId1.state}
                                    helpText={validate.lineId1.helpText}
                                    onChange={(value) => this.changeLineId(value, lineId2, lineId3)}
                                    maxlength={MAXLENGTH_PROJECT_LINE_ID}
                                />
                                <TextForm 
                                    formControlClassName="mb-05"
                                    value={lineId2} 
                                    isReadOnly={!checked[KEY_PROJECT_LINE_ID]}
                                    validationState={validate.lineId2.state}
                                    helpText={validate.lineId2.helpText}
                                    onChange={(value) => this.changeLineId(lineId1, value, lineId3)} 
                                    maxlength={MAXLENGTH_PROJECT_LINE_ID}
                                />
                                <TextForm 
                                    formControlClassName="mb-05"
                                    value={lineId3} 
                                    isReadOnly={!checked[KEY_PROJECT_LINE_ID]}
                                    validationState={validate.lineId3.state}
                                    helpText={validate.lineId3.helpText}
                                    onChange={(value) => this.changeLineId(lineId1, lineId2, value)} 
                                    maxlength={MAXLENGTH_PROJECT_LINE_ID}
                                />
                            </InputForm.Col>
                        </InputForm.Row>
                        <InputForm.Row>
                            <InputForm.Col
                                label="回線名"
                                columnCount={1} 
                                checkbox
                                checked={checked[KEY_PROJECT_LINE_NAME]}
                                onCheckChange={(checked) => this.changeChecked(KEY_PROJECT_LINE_NAME, checked, validateProjectLineName(lineName))}
                            >
                                <TextForm 
                                    value={lineName} 
                                    isReadOnly={!checked[KEY_PROJECT_LINE_NAME]}
                                    validationState={validate.lineName.state}
                                    helpText={validate.lineName.helpText}
                                    onChange={(value) => this.changeValue(KEY_PROJECT_LINE_NAME, value, validateProjectLineName(value))} 
                                    maxlength={MAXLENGTH_PROJECT_LINE_NAME}
                                />
                            </InputForm.Col>
                        </InputForm.Row>
                        <InputForm.Row>
                            <InputForm.Col 
                                label="ロケーション"
                                columnCount={1} 
                                checkbox
                                checked={checked[KEY_PROJECT_LOCATION]}
                                onCheckChange={(checked) => this.changeChecked(KEY_PROJECT_LOCATION, checked, validateLocation(location))}
                            >
                                <LocationForm 
                                    multiple={false}
                                    locationList={locations}
                                    selectedLocation={location}
                                    disabled={!checked[KEY_PROJECT_LOCATION]}
                                    onChange={(value) => this.changeValue(KEY_PROJECT_LOCATION, value, validateLocation(value))}
                                    validationState={validate.location.state}
                                    helpText={validate.location.helpText}
                                />
                            </InputForm.Col>
                        </InputForm.Row>
                    </InputForm>
                </Modal.Body>
                <Modal.Footer>
                    <ApplyButton disabled={this.invalid(validate, editKeys)} onClick={this.handleApply} />
                    <CancelButton onClick={this.handleCancel} />
                </Modal.Footer>
            </Modal>
        );
    }

    //#region イベントハンドラ

    /**
     * 適用ボタンクリック
     */
    handleApply = () => {
        if (this.props.onApply) {
            const { editKeys, editLine } = this.state;
            this.props.onApply(editKeys, editLine);
        }
    }

    /**
     * キャンセルボタンクリック
     */
    handleCancel = () => {
        if (this.props.onCancel) {
            this.props.onCancel();
        }
    }

    //#endregion
    
    //#region 入力変更

    /**
     * チェック状態を変更する
     * @param {string} key 対象キー
     * @param {boolean} checked チェック状態
     * @param {object} validate 検証結果
     */
    changeChecked(key, checked, validate) {
        const editKeys = this.changeEditKeys(key, checked, this.state.editKeys);        
        const validateResult = this.getValidate(validate, key, editKeys);        
        this.setState({
            editKeys: editKeys,
            validate: validateResult
        });
    }

    /**
     * 回線IDのチェック状態を変更する
     * @param {boolean} checked チェック状態
     * @param {string} lineId1 回線ID1
     * @param {string} lineId2 回線ID2
     * @param {string} lineId3 回線ID3
     */
    changeCheckedLineId(checked, lineId1, lineId2, lineId3) {
        var editKeys = this.changeEditKeys_LineId(checked, this.state.editKeys);

        var validate = _.cloneDeep(this.state.validate);
        if (checked) {
            validate.lineId1 = validateProjectLineId(lineId1, [lineId2, lineId3]);
            validate.lineId2 = validateProjectLineId(lineId2, [lineId1, lineId3]);
            validate.lineId3 = validateProjectLineId(lineId3, [lineId1, lineId2]);
        } else {
            validate.lineId1 = { state: null, helpText: null };
            validate.lineId2 = { state: null, helpText: null };
            validate.lineId3 = { state: null, helpText: null };
        }
        
        this.setState({
            editKeys: editKeys,
            validate: validate
        });
    }

    /**
     * 値を変更する
     * @param {string} key 対象キー
     * @param {string} value 変更後の値
     * @param {object} validate 検証結果
     */
    changeValue(key, value, validate) {
        const { editKeys, editLine } = this.state;
        let update = _.cloneDeep(editLine);
        _.set(update, key, value);
        const validateResult = this.getValidate(validate, key, editKeys);
        this.setState({
            editLine: update,
            validate: validateResult
        });
    }
    
    /**
     * 回線IDを変更する
     * @param {string} lineId1 回線ID1
     * @param {string} lineId2 回線ID2
     * @param {string} lineId3 回線ID3
     */
    changeLineId(lineId1, lineId2, lineId3) {
        var validate = _.cloneDeep(this.state.validate);
        let update = _.cloneDeep(this.state.editLine);
        update.lineId1 = lineId1;
        update.lineId2 = lineId2;
        update.lineId3 = lineId3;
        validate.lineId1 = validateProjectLineId(lineId1, [lineId2, lineId3]);
        validate.lineId2 = validateProjectLineId(lineId2, [lineId1, lineId3]);
        validate.lineId3 = validateProjectLineId(lineId3, [lineId1, lineId2]);
        this.setState({
            editLine: update,
            validate: validate
        });
    }

    
    /**
     * 保存が無効かどうかを取得する
     * @param {object} validate 入力検証結果
     * @returns {boolean} 保存が無効かどうか
     */
    invalid(validate, keys) {
        if (keys.length === 0) {
            return true;
        }

        var invalid = false;
        for (const key in validate) {
            if (validate.hasOwnProperty(key) && 
                keys.indexOf(key)>=0 &&                 //チェックされているもののみに絞り込む
                validate[key].state !== VALIDATE_STATE.success) {
                    invalid = true;
                    break; 
            }
        }

        return invalid;
    }

    /**
     * 編集対象のキーリストを変更する
     * @param {string} key 変更対象のキー文字列
     * @param {boolean} checked チェック状態
     * @param {array} editKeys 変更前のキーリスト
     */
    changeEditKeys(key, checked, editKeys) {
        let keys = editKeys.concat();
        if (checked) {
            editKeys.indexOf(key) < 0 && keys.push(key);
        } else {
            keys = keys.filter((fkey) => fkey !== key);
        }
        return keys;
    }

    /**
     * 編集対象のキーリストを変更する（回線ID）
     * @param {boolean} checked チェック状態
     * @param {array} editKeys 編集対象キーリスト
     * @returns 
     */
    changeEditKeys_LineId(checked, editKeys) {
        for (let i = 1; i <= 3; i++) {
            editKeys = this.changeEditKeys(KEY_PROJECT_LINE_ID + i.toString(), checked, editKeys);
        }
        return editKeys;
    }

    //#endregion

    //#region 入力検証

    /**
     * 検証結果を取得する
     * @param {object} targetValidate 更新する検証結果
     * @param {string} targetKey オブジェクトのキー
     * @param {array} editKeys　編集対象キーリスト
     * @param {object} beforeValidate 変更前の検証結果（指定がない時はstateから変更）
     * @returns {object} 更新後の検証結果
     */
    getValidate(targetValidate, targetKey, editKeys) {
        var validate = _.cloneDeep(this.state.validate);
        for (const key in validate) {
            if (editKeys.indexOf(key)>=0) {
                if (key === targetKey) {
                    validate[key] = targetValidate || successResult;
                }
            } else {
                validate[key] = { state: null, helpText: null };        
            }
        }
        return validate;
    }

    //#endregion
}

LineBulkModal.propTypes = {
    show: PropTypes.bool,
    locations: PropTypes.array,
    onApply: PropTypes.func,
    onCancel: PropTypes.func
}