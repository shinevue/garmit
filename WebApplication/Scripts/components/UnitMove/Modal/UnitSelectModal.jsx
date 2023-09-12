/**
 * @license Copyright 2018 DENSO
 * 
 * UnitSelectModal Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal, FormGroup, ControlLabel, HelpBlock, Checkbox, ButtonToolbar } from 'react-bootstrap';
import LabelForm from 'Common/Form/LabelForm';
import Button from 'Common/Widget/Button';

import { getDuplicateDispSettings } from 'unitMountCheck';
import { errorResult } from 'inputCheck';

/**
 * ユニット選択モーダルコンポーネント
 * @param {object} movingInfo 移動元情報
 * @param {object} targetInfo 移動先情報
 * @param {function} onSave 移動ボタンを押下したときに呼び出す
 * @param {function} onCancel キャンセルボタンを押下したときに呼び出す
 */
export default class UnitSelectModal extends Component {

    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        this.state = { 
            units: [],
            margeUnitDispSettings: [],
            validate: { state: null, helpText: null }
        };
    }

    /********************************************
     * React ライフサイクルメソッド
     ********************************************/

    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps( nextProps ){
        if (nextProps.show) {
            const { targetInfo, movingInfo } = nextProps;
            const { unitDispSetting } = movingInfo;
            var units = JSON.parse(JSON.stringify(unitDispSetting.units));
            units.forEach((unit) => unit.checked = true);       //全ユニットにチェックを入れる

            //ラックのユニット数を超えているユニットを取得
            units = this.getErrorCheckUnits(units, targetInfo.rack, targetInfo.position);
            var validate = this.validate(units);

            //マージするユニットを取得
            const margeUnitDispSettings = this.getDuplicateDispSettings(units, targetInfo.rack, targetInfo.position);

            this.setState({ units: units, validate: validate, margeUnitDispSettings: margeUnitDispSettings });
        }
    }

    /**
     * render
     */
    render() {
        const { show, movingInfo, targetInfo } = this.props;
        const { units, margeUnitDispSettings, validate } = this.state;
        const movingDispSetting = movingInfo.unitDispSetting;
        return (
            <Modal className="unitmove-unit-select" show={show} backdrop="static" onHide={() => this.onCancel()} >
                <Modal.Header>
                    <Modal.Title>移動ユニット選択</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="mb-05">移動するユニットを選んでください。</p>
                    {!this.isSameRack(movingInfo.rack, targetInfo.rack)&&
                        <p className="text-red">※電源設定、ネットワーク設定はクリアされます。</p>
                    }
                    <LabelForm className="mt-2" 
                               label="ラック" 
                               value={this.getRackName(movingInfo.rack) + ' ⇒ ' + this.getRackName(targetInfo.rack)} 
                    />
                    <LabelForm label="搭載位置" 
                               value={this.getPositionString(movingDispSetting&&movingDispSetting.position) + ' ⇒ ' + this.getPositionString(targetInfo.position)} 
                    />
                    <UnitCheckBoxListForm units={units}
                                          validationState={validate.state}
                                          helpText={validate.helpText}
                                          onChangeChecked={(units) => this.changeUnitSelect(units)}
                    />
                    {margeUnitDispSettings&&margeUnitDispSettings.length>0&&
                        <MargeUnitDispSettingPanel margeUnitDispSettings={margeUnitDispSettings} />
                    }
                </Modal.Body>
                <Modal.Footer>
                    <Button bsStyle="success" disabled={this.invaild()} onClick={() => this.handleSave()}>移動</Button>
                    <Button iconId="uncheck" bsStyle="lightgray" onClick={() => this.onCancel()}>キャンセル</Button>
                </Modal.Footer>
            </Modal>
        );
    }

    /********************************************
     * ユニット選択変更
     ********************************************/

    /**
     * ユニット選択を変更する
     * @param {array} units ユニット一覧
     */
    changeUnitSelect(units) {
        const { targetInfo } = this.props;
        units = this.getErrorCheckUnits(units, targetInfo.rack, targetInfo.position);
        var validate = this.validate(units);
        const margeUnitDispSettings = this.getDuplicateDispSettings(units, targetInfo.rack, targetInfo.position);
        this.setState({ units: units, validate: validate, margeUnitDispSettings: margeUnitDispSettings });
    }

    /********************************************
     * 入力検証関係
     ********************************************/

    /**
     * エラーチェックをしたラックを取得する
     * @param {array} units ユニットリスト
     * @param {object} targetRack 移動先のラック
     * @param {object} targetPosition 移動先の位置
     * @returns {array} エラーチェック後のユニットリスト
     */
    getErrorCheckUnits(units, targetRack, targetPosition){
        var allChecked = units.every((unit) => unit.checked);
        return units.map((unit) => {
            if (unit.checked) {
                if (!allChecked && (unit.frontFlg || unit.rearFlg)) {
                    unit.isError = true;
                    unit.canMove = false;
                } else {
                    unit.isError = !this.unitSizeCheck(unit, targetRack.col, targetRack.row, targetPosition);
                    unit.canMove = true;
                }
            } else {
                unit.isError = false;
                unit.canMove = true;
            }
            return unit;
        });
    }

    /**
     * ユニットサイズがラックのサイズを超えていないかチェックする
     * @param {object} unit ユニット
     * @param {number} rackCol ラックの列数
     * @param {number} rackRow ラックの行数
     * @param {object} targetPosition 移動する位置
     * @returns {boolean} 超えていなかったらtrue
     */
    unitSizeCheck(unit, rackCol, rackRow, targetPosition) {
        if (rackCol < (unit.size.width + targetPosition.x - 1)) {
            return false;
        }

        if (rackRow < (unit.size.height + targetPosition.y - 1)) {
            return false;
        }

        return true;
    }

    /**
     * ユニットの検証を行う
     * @param {array} units ユニット一覧
     * @returns 検証結果
     */
    validate(units) {
        var validate = { state: null, helpText: null }
        if (units.every((unit) => !unit.checked)) {
            validate = errorResult('ユニットを選択してください。');
        } else if (units.some((unit) => !unit.canMove)) {
            validate = errorResult('表示設定で前面ユニットもしくは背面ユニットに設定されているユニットは移動できません。（全ユニット移動時は移動可能です。）')
        } else if (units.some((unit) => unit.isError)) {
            validate = errorResult('ラックのユニット数を超えているユニットがあります。');
        }
        return validate;
    }

    /**
     * 重複している表示設定グループを取得する
     * @param {array} units ユニットリスト
     * @param {object} targetRack 移動先のラック
     * @param {object} targetPosition 移動先の位置
     * @returns {array} エラーチェック後のユニットリスト
     */
    getDuplicateDispSettings(units, targetRack, targetPosition) {
        const checkedUnits = units.filter((unit) => unit.checked);
        const heights = checkedUnits.map((unit) => unit.size.height);
        const widths = checkedUnits.map((unit) => unit.size.width);
        const maxSize = { height: Math.max.apply(null, heights), width: Math.max.apply(null, widths) };
        return getDuplicateDispSettings(targetPosition, maxSize, targetRack.unitDispSettings);
    }

    
    /********************************************
     * イベント発生
     ********************************************/

    /**
     * キャンセルイベントを発生させる
     */
    onCancel(){
        if (this.props.onCancel) {
            this.props.onCancel();
        }
    }

    /**
     * 保存イベントを発生させる
     */
    handleSave() {
        if (this.props.onSave) {
            const units = this.state.units.filter((unit) => unit.checked);
            units.forEach((unit) => {
                unit.position = Object.assign({}, this.props.targetInfo.position);  //搭載位置を入れ替える
            })
            this.props.onSave(units);
        }
    }

    /********************************************
     * その他
     ********************************************/
    
    /**
     * ラック名称を取得する
     * @param {object} rack ラック情報
     */
    getRackName(rack) {
        if (rack) {
            return rack.rackName;
        }
        return '';
    }

    /**
     * 搭載位置文字列を取得する
     * @param {object} position 搭載位置
     */
    getPositionString(position) {
        if (position) {
            return position.y + 'U×' + position.x + '列';
        }
        return '';
    }

    /**
     * 同じラックかどうか
     * @param {object} sourceRack 移動元ラック
     * @param {object} targetRack 移動先ラック
     */
    isSameRack(sourceRack, targetRack) {
        if (this.getRackId(sourceRack) === this.getRackId(targetRack)) {
            return true;
        }
        return false;
    }

    /**
     * ラックIDを取得する
     * @param {object} rack ラック情報
     */
    getRackId(rack) {
        if (rack && rack.rackId) {
            return rack.rackId;
        }
        return ''
    }

    /**
     * 移動ボタンが無効かどうか
     */
    invaild() {
        const { units, validate } = this.state;
        return !(validate.state === null && units.some((unit) => unit.checked));
    }
}

/**
 * ユニットのチェックボックスリストフォーム
 * @param {array} units ユニットリスト
 * @param {function} onChangeChecked チェック変更イベント
 */
class UnitCheckBoxListForm extends Component {
    render() {
        const { units, validationState, helpText } = this.props;
        const cannotMove = units.some((unit) => unit.checked && !unit.canMove);
        return (
            <FormGroup className="mb-0" validationState={validationState} >
                <ControlLabel>移動対象</ControlLabel>
                <ButtonToolbar className="pull-right">
                    <Button bsSize="xs" onClick={() => this.changeAllChecked(true)} >全選択</Button>
                    <Button bsSize="xs" onClick={() => this.changeAllChecked(false)} >全解除</Button>
                </ButtonToolbar>
                <div className={"multi-lines-panel"}>
                    {units.map((item) => 
                        <UnitCheckBox checked={item.checked} 
                                      unitId={item.unitId} 
                                      label={item.name+' ('+ item.size.height + 'U×' + item.size.width + '列)'} 
                                      isError={cannotMove ? !item.canMove : item.isError}
                                      frontFlg={units.length>1?item.frontFlg:false}
                                      rearFlg={units.length>1?item.rearFlg:false}
                                      onChange={(checked) => this.handleChangeChecked(checked, item.unitId)} 
                        />
                    )}
                </div>
                {helpText&&<HelpBlock>{helpText}</HelpBlock>}
            </FormGroup>
        );
    }

    /**
     * チェックの変更イベント
     * @param {boolean} checked チェック状態
     * @param {string} unitId ユニットID
     */
    handleChangeChecked(checked, unitId) {
        var workUnits = JSON.parse(JSON.stringify(this.props.units));
        var item = workUnits.find((unit) => unit.unitId === unitId);
        item.checked = checked;
        this.onChangeChecked(workUnits);
    }

    /**
     * 全チェックする
     * @param {boolean} checked 変更後のチェック状態
     */
    changeAllChecked(checked){
        const workUnits = JSON.parse(JSON.stringify(this.props.units));
        workUnits.forEach((unit) => {
            unit.checked = checked;
        });
        this.onChangeChecked(workUnits);
    }

    /**
     * チェック変更イベントを呼び出す
     * @param {array} units 変更後のユニット一覧
     */
    onChangeChecked(units) {
        if (this.props.onChangeChecked) {
            this.props.onChangeChecked(units);
        }
    }
}

/**
 * ユニットのチェックボックス
 * @param {boolean} checked チェックされているか
 * @param {string} unitId ユニットID
 * @param {boolean} isError エラーかどうか
 * @param {function} onChange チェックが変更されたときに呼び出す
 */
class UnitCheckBox extends Component {
    render() {
        const { checked, unitId, label, isError, canMove, frontFlg, rearFlg } = this.props;
        var addText = frontFlg ? '(前面)' : '';
        addText += rearFlg ? '(背面)' : '';
        if (addText) {
            addText = ' ' + addText;
        }
        return (
            <Checkbox className={isError&&'text-error'} 
                      name="unitSelect"
                      checked={checked} 
                      value={unitId} 
                      onChange={(e) => this.handleChanged(e.target.checked)}>{label + addText}
            </Checkbox>
        );
    }

    /**
     * チェックの変更イベント
     * @param {boolean} checked チェックされたかどうか 
     */
    handleChanged(checked){
        if (this.props.onChange) {
            this.props.onChange(checked);
        }
    }
}

/**
 * マージされるユニット表示設定グループ情報を表示するパネル
 * @param {array} margeUnitDispSettings マージされるユニット表示設定グループリスト
 */
class MargeUnitDispSettingPanel extends Component {
    render() {
        const { margeUnitDispSettings } = this.props;
        return (
            <div className="mt-1">
                <strong>
                    <div>!!!注意!!!</div>
                    {margeUnitDispSettings.length == 1?
                        <div>移動すると、下記と統合されます。ご注意ください。</div>
                    :
                        <div>移動すると、下記が統合されます。ご注意ください。</div>
                    }
                </strong>
                <div className="multi-lines-panel" >
                    <ul>
                        {margeUnitDispSettings&&margeUnitDispSettings.map((dispSetting) => 
                            <li>{dispSetting.frontDispData.dispName + ' (位置：' + dispSetting.position.y + 'U×' + dispSetting.position.x + '列)' }</li>
                        )}
                    </ul>
                </div>
            </div>
        );
    }
}

UnitSelectModal.propTypes = {
    movingInfo: PropTypes.shape({
        unitDispSetting: PropTypes.object,
        rack: PropTypes.object
    }),    
    targetInfo: PropTypes.shape({
        rack: PropTypes.object,
        dispSetId: PropTypes.string,
        position: PropTypes.object
    }),
    onSave: PropTypes.func,
    onCancel: PropTypes.func
};