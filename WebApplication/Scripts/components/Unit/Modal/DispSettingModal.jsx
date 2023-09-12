/**
 * @license Copyright 2018 DENSO
 * 
 * DispSettingModal Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Checkbox, Modal } from 'react-bootstrap';

import DsettingUnitSelectForm from 'Unit/DsettingUnitSelectForm';
import DsettingGroupForm from 'Unit/DsettingGroupForm';
import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';

import { convertDateTimeExtendedData } from 'assetUtility';

/**
 * 表示設定モーダルコンポーネント
 * @param {object} unitDispSetting 表示設定情報
 * @param {array} unitImages ユニット画像一覧
 * @param {boolean} showModal モーダルを表示するかどうか
 * @param {function} onSave 保存ボタンクリック時に呼び出す
 * @param {function} onCancel キャンセルボタンクリック時に呼び出す
 */
export default class DispSettingModal extends Component {
    
    /**
     * 表示データ（初期値）
     */
    static get INITIAL_DISP_DATA() {
        return {
            dispName: '',
            fontSize: 12,
            textColor: '#000000',
            backColor: '#FFFFFF',
            unitImage: null
        };
    }

    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        this.state = {
            unitDispSetting: {
                dispSetId: '',
                frontDispData: {},
                rearDispData: {},
                isDsettingGroup: false,
                units: []
            },
            isError: false
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
        if (nextProps.showModal) {
            var unitDispSetting = Object.assign({}, this.state.unitDispSetting);
            unitDispSetting = JSON.parse(JSON.stringify(nextProps.unitDispSetting));            //ディープコピー
            unitDispSetting.units.forEach(unit => {
                unit.extendedPages = convertDateTimeExtendedData(unit.extendedPages);       //日付時刻のデータは変換する
            });
    
            if (!unitDispSetting.isDsettingGroup) {
                unitDispSetting.frontDispData = DispSettingModal.INITIAL_DISP_DATA;
                unitDispSetting.rearDispData = DispSettingModal.INITIAL_DISP_DATA;
            }
    
            this.setState({unitDispSetting: unitDispSetting, isError: false});
        }
    }

    /**
     * render
     */
    render() {
        const { showModal, unitImages } = this.props;
        const { unitDispSetting, isError } = this.state;
        const { isDsettingGroup, frontDispData, rearDispData, units } = unitDispSetting;

        const frontUnit = this.getUnit(unitDispSetting.units, 'frontFlg');
        const rearUnit = this.getUnit(unitDispSetting.units, 'rearFlg');
        
        return (
            <Modal bsSize="large" show={showModal} backdrop="static" onHide={() => this.handleCancel()}>
                <Modal.Header closeButton>
                    <Modal.Title>表示設定</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <DsettingUnitSelectForm frontUnit={frontUnit}
                                            rearUnit={rearUnit}
                                            units={units}
                                            isReadOnly={isDsettingGroup}
                                            onSelect={(unit, isError, isFront) => this.selectUnit(unit, isError, isFront)}
                    />
                    <Checkbox className="ml-05 mt-2" 
                             checked={isDsettingGroup} 
                             onChange={(e) => this.originalSettingChanged(e.target.checked)} >
                                独自設定とする
                    </Checkbox>
                    {isDsettingGroup&&
                        <DsettingGroupForm dispSetId={unitDispSetting.dispSetId}
                                           frontDispData={frontDispData}
                                           rearDispData={rearDispData}
                                           unitImages={unitImages}
                                           onChange={(frontDispData, rearDispData, isError) => this.changeDsettingGroup(frontDispData, rearDispData, isError)}
                        />
                    }
                </Modal.Body>
                <Modal.Footer>
                    <Button bsStyle="success" disabled={isError} onClick={() => this.handleSave()}>
                        <Icon className="fal fa-save" />
                        <span> 保存</span>
                    </Button>
                    <Button iconId="uncheck" bsStyle="lightgray" onClick={() => this.handleCancel()}>キャンセル</Button>
                </Modal.Footer>
            </Modal>
        );
    }

    /**
     * ユニットを選択する
     * @param {object} value 変更後のユニット
     * @param {boolean} isError エラーかどうか
     * @param {boolean} isFront 前面かどうか
     */
    selectUnit(value, isError, isFront) {
        const key = isFront ? 'frontFlg' : 'rearFlg';
        var obj = Object.assign({} , this.state);
        var units = obj.unitDispSetting.units;
        units.forEach((unit) => {
            if (value && unit.unitId === value.unitId) {
                unit[key] = true;
            } else {
                unit[key] = false;
            }
        });
        obj.isError = isError;
        this.setState(obj);
    }

    /**
     * 独自設定とするかどうかを変更する
     * @param {boolean} checked 「独自設定とする」チェックボックスのチェック状態
     */
    originalSettingChanged(checked) {
        var obj =  Object.assign({}, this.state);
        var unitDispSetting = obj.unitDispSetting;
        unitDispSetting.isDsettingGroup = checked;
        if (checked) {
            unitDispSetting.units.forEach((unit) => {
                unit.frontFlg = false;
                unit.rearFlg = false;
            });
            unitDispSetting.frontDispData = DispSettingModal.INITIAL_DISP_DATA;
            unitDispSetting.rearDispData = DispSettingModal.INITIAL_DISP_DATA;
        }
        obj.isError = true;
        this.setState(obj);
    }

    /**
     * 独自設定の値変更イベント
     * @param {object} frontDispData 変更後の前面表示データ
     * @param {object} rearDispData 変更後の背面表示データ
     * @param {*} isError 
     */
    changeDsettingGroup(frontDispData, rearDispData, isError) {
        var obj = Object.assign({} , this.state);
        var unitDispSetting = obj.unitDispSetting;
        unitDispSetting.frontDispData = Object.assign({}, frontDispData);
        unitDispSetting.rearDispData = Object.assign({}, rearDispData);
        obj.isError = isError;
        this.setState(obj);
    }

    /**
     * 保存ボタン押下イベント
     */
    handleSave() {
        if (this.props.onSave) {
            this.props.onSave(Object.assign({}, this.state.unitDispSetting));
        }
    }

    /**
     * キャンセルボタン押下イベント
     */
    handleCancel() {
        if (this.props.onCancel) {
            this.props.onCancel();
        }
    }

    /**
     * 前面か背面のユニットを取得する
     * @param {array} units ユニット一覧
     * @param {string} key キー
     */
    getUnit(units, key) {
        return units.find((unit) => unit[key] === true);
    }

}

DispSettingModal.propTypes = {
    unitDispSetting: PropTypes.arrayOf(PropTypes.shape({      //ラック搭載図に表示する表示ユニット情報
        dispSetId: PropTypes.string.isRequired,
        isDsettingGroup: PropTypes.bool,
        frontDispData: PropTypes.shape({             //前面の表示設定
            dispName: PropTypes.string.isRequired,
            fontSize: PropTypes.number.isRequired,
            textColor: PropTypes.string.isRequired,
            backColor: PropTypes.string.isRequired,
            unitImage: PropTypes.shape({
                url: PropTypes.string.isRequired
            })
        }),
        rearDispData: PropTypes.shape({              //背面の表示設定
            dispName: PropTypes.string.isRequired,
            fontSize: PropTypes.number.isRequired,
            textColor: PropTypes.string.isRequired,
            backColor: PropTypes.string.isRequired,
            unitImage: PropTypes.shape({
                url: PropTypes.string.isRequired
            })
        }),
        units: PropTypes.arrayOf(PropTypes.shape({
            unitId: PropTypes.string.isRequired,
            unitNo: PropTypes.number.isRequired,
            name: PropTypes.string.isRequired,
            frontFlg: PropTypes.bool,
            rearFlg: PropTypes.bool
        }))
    })),
    unitImages: PropTypes.arrayOf(PropTypes.shape({
        imageId: PropTypes.string.isRequired,
        type: PropTypes.object.isRequired,
        name: PropTypes.string.isRequired,
        FileName: PropTypes.string.isRequired,
        rearFlg: PropTypes.bool.isRequired,
        url: PropTypes.string.isRequired
    })),
    showModal:PropTypes.bool,
    onSave: PropTypes.func,
    onCancel: PropTypes.func
}