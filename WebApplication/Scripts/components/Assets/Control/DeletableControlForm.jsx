/**
 * @license Copyright 2019 DENSO
 * 
 * DeletableControlForm Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import classNames from 'classnames'
import { FormGroup, FormControl, HelpBlock } from 'react-bootstrap';
import { ClearCircleButton } from 'Assets/GarmitButton';

import { convertNumber } from 'numberUtility';
import { VALIDATE_STATE, errorResult, validateSelect } from 'inputCheck';

/**
 * 削除可能な制御選択フォーム
 * @param {string} className クラス
 * @param {array} locations ロケーション一覧
 * @param {array} controls 制御一覧
 * @param {object} controlOperation 選択中の制御
 * @param {array} controlCmdIds 選択中の制御IDリスト
 * @param {function} onChange 変更時に呼び出す
 * @param {function} onDelete クリア時に呼び出す
 */
export default class DeletableControlForm extends Component {
    
    /**
     * render
     */
    render() {
        const { className, locationId, controlOperation, locations, controls, controlCmdIds, index, isReadOnly } = this.props;
        const validate = this.validate(locationId, controlOperation, controlCmdIds, index);
        const filterControls = locationId && controls && controls.filter((ctl) => ctl.pointLocations.find((loc) => loc.locationId === locationId));
        const classes = {
            'garmit-input-group': isReadOnly
        }
        return (
            <FormGroup validationState={validate&&validate.state}>
                <div className={classNames(className, classes)}>
                    <div className='garmit-input-item control-select-item'>
                        <FormControl
                            disabled={isReadOnly}
                            componentClass="select"
                            value={locationId||-1}
                            onChange={(e) => this.changeLocation(e.target.value)}
                        >
                            <option value={-1} >選択してください</option>
                            {locations && locations.map((loc) => <option value={loc.locationId} >{loc.name}</option>)}
                        </FormControl>
                    </div>
                    <div className='garmit-input-item control-select-item'>
                        <FormControl
                            disabled={isReadOnly}
                            componentClass="select"
                            value={controlOperation?controlOperation.controlCmdId:-1}
                            onChange={(e) => this.changeControlCommand(e.target.value)}
                        >
                            <option value={-1} >選択してください</option>
                            {filterControls && filterControls.map((ctl) => <option value={ctl.controlCmdId} >{ctl.controlCmdName}</option>)}
                        </FormControl>
                    </div>
                    {!isReadOnly&&
                        <div className='garmit-input-item garmit-input-addon va-t pa-r-0'>
                            <ClearCircleButton onClick={() => this.onDelete() } />
                        </div>
                    }
                    <HelpBlock>{validate ? validate.helpText : null}</HelpBlock>
                </div>
            </FormGroup>
        );
    }

    //#region 選択変更

    /**
     * ロケーションを変更する
     * @param {*} locationId 
     */
    changeLocation(value) {
        const { locations, locationId, controlCmdIds, index } = this.props;
        const targetLocation = locations.find((loc) => loc.locationId === convertNumber(value));
        if (!targetLocation || locationId !== targetLocation.locationId) {
            const validate = this.validate(value, null, controlCmdIds, index);
            const locationId = targetLocation ? targetLocation.locationId : null;
            this.onChange(null, locationId, validate);       //ロケーションが変更されたときは、制御コマンドもクリア
        }
    }

    /**
     * 制御コマンドを変更する
     * @param {*} controlId 
     */
    changeControlCommand(controlId) {
        const { locationId, controls, controlCmdIds, index } = this.props;
        const targetControl = controls.find((ctl) => ctl.controlCmdId === convertNumber(controlId));
        const validate = this.validate(locationId, targetControl, controlCmdIds, index);
        this.onChange(targetControl, this.props.locationId, validate);
    }

    //#endregion

    //#region イベントハンドラ

    /**
     * 変更イベント呼び出し
     * @param {object} controlCommand 変更後の制御コマンド情報
     */
    onChange(controlCommand, locationId, validate) {
        if (this.props.onChange) {
            this.props.onChange(controlCommand, locationId, this.invalid(validate));
        }
    }

    /**
     * 削除ボタンをクリックする
     */
    onDelete() {
        if (this.props.onDelete) {
            this.props.onDelete();
        }
    }

    //#endregion

    //#region 入力検証

    /**
     * ロケーションの検証結果
     * @param {number} locationId ロケーションID
     */
    validateLocation(locationId) {
        var validate = validateSelect(locationId);
        if (validate.state !== VALIDATE_STATE.success) {
            validate.helpText = 'ロケーションは' + validate.helpText;
        }
        return validate;
    }

    /**
     * 制御コマンドの検証結果
     * @param {object} value 制御コマンド情報
     * @param {array} Ids 制御IDリスト（重複チェック用）
     */
    validateControlCommand(value, Ids, index) {
        var validate = validateSelect(value&&value.controlCmdId);
        if (validate.state !== VALIDATE_STATE.success) {
            validate.helpText = '制御は' + validate.helpText;
        }

        if (validate.state === VALIDATE_STATE.success &&
            Ids&&Ids.some((id) => {
                return ( id.controlCmdId !== null && id.controlCmdId === value.controlCmdId && index !== id.index )
            })) {
                validate = errorResult('制御が重複しています。')
        } 
                
        return validate;
    }

    /**
     * 入力検証
     * @param {number} locationId ロケーションID
     * @param {object} controlCommand 制御コマンド
     * @param {array} 選択中のIDリスト
     * @returns {object} 検証結果
     */
    validate(locationId, controlCommand, controlCmdIds, index){
        let validate = this.validateLocation(locationId);
        if (validate.state === VALIDATE_STATE.success) {
            validate = this.validateControlCommand(controlCommand, controlCmdIds, index);
        }
        return validate;
    }

    /**
     * 保存が無効かどうかを取得する
     * @param {object} validate 入力検証結果
     * @returns {boolean} 保存が無効かどうか
     */
    invalid(validate) {
        return !(validate.state === VALIDATE_STATE.success)
    }

    //#endregion
}

DeletableControlForm.propsTypes = {
    className: PropTypes.string,
    locations: PropTypes.array,
    controls: PropTypes.array,
    locationId: PropTypes.number,
    controlOperation: PropTypes.shape({
        controlCmdId: PropTypes.number,
        controlCmdName: PropTypes.string,
        pointNo: PropTypes.number,
        pointName: PropTypes.string,
        pointLocations: PropTypes.locations,
        pulseSet: PropTypes.number,
        pulseWidth: PropTypes.number,
        output: PropTypes.number
    }),
    controlCmdIds: PropTypes.array,
    onChange: PropTypes.func,
    onDelete: PropTypes.func
}
