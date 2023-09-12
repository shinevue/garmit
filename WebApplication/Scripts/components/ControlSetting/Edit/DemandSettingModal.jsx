/**
 * @license Copyright 2020 DENSO
 * 
 * DemandSettingModal Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Modal } from 'react-bootstrap';
import GarmitBox from 'Assets/GarmitBox';
import { SaveButton, CancelButton } from 'Assets/GarmitButton';
import InputForm from 'Common/Form/InputForm';
import LabelForm from 'Common/Form/LabelForm';
import TextForm from 'Common/Form/TextForm';
import InputTable from 'Common/Form/InputTable';
import MessageModal from 'Assets/Modal/MessageModal';
import BoxGroup from 'Common/Layout/BoxGroup';

import { changeNumbarFormat, convertNumber } from 'numberUtility';
import { validateReal, VALIDATE_STATE } from 'inputCheck';

/**
 * デマンド（トリガー及びSOCポイントしきい値）編集モーダルコンポーネント
 * @param {boolean} show モーダルを表示する
 * @param {array} triggerTypes トリガー種別リスト
 * @param {object} demandSet デマンド設定情報
 * @param {object} selectedTriggerType 選択中のトリガー種別
 * @param {number} selectedPointNo 選択中のポイント番号
 * @param {function} onSave 保存ボタンクリック時に呼び出す
 * @param {function} onCancel キャンセルボタンクリック時に呼び出す
 */
export default class DemandSettingModal extends Component {

    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        this.state = {
            triggerThresholds: [],
            validate: [],
            messageModal: {
                showMessage: false,
                message: '',
                buttonStyle: null
            }
        };
    }

    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps( nextProps ){
        const { demandSet, selectedTriggerType, selectedPointNo } = nextProps;
        if (nextProps.show && nextProps.show !== this.props.show) {
            const selectedTriggerThreshold = demandSet.triggerThresholds && 
                                                demandSet.triggerThresholds.find((th) => th.triggerType.triggerId === selectedTriggerType.triggerId && th.pointNo === selectedPointNo)
            this.setState({
                triggerThresholds: demandSet.triggerThresholds ? _.cloneDeep(demandSet.triggerThresholds) : [],
                selectedTriggerThreshold: selectedTriggerThreshold,
                validate: this.initialValidateThresholds(demandSet.triggerThresholds),
                messageModal: {
                    showMessage: false,
                    message: '',
                    buttonStyle: null
                }
            })
        }

    }

    /**
     * render
     */
    render() {
        const { show, triggerTypes, demandSet } = this.props;
        const { triggerThresholds, validate, messageModal } = this.state;
        const socTriggerTypes = this.filterSocTriggerTypes(triggerTypes, triggerThresholds);
        return (
            <Modal dialogClassName="modal-xlg" show={show} backdrop="static" onHide={this.handleCancel}>
                <Modal.Header closeButton>
                    <Modal.Title>しきい値編集</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <DemandInfoForm contractPower={demandSet&&demandSet.contractPower} targetEnergy={demandSet&&demandSet.targetEnergy} />
                    <BoxGroup>
                        <TriggerThresholdBox 
                            triggerThresholds2D={this.makeTriggerThresholds2D(triggerThresholds, validate)} 
                            onChange={this.handleTriggerThresholdChanged}
                        />
                        {socTriggerTypes&&socTriggerTypes.length>0&&
                            <SocPointThresholdBox
                                triggerTypes={socTriggerTypes}
                                pointThresholds={this.makeSOCPointThresholds(triggerThresholds, validate)}
                                onChange={this.handleTriggerThresholdChanged}
                            />
                        }
                    </BoxGroup>
                </Modal.Body>
                <Modal.Footer>
                    <SaveButton disabled={this.invaild()} onClick={this.handleSave} />
                    <CancelButton onClick={this.handleCancel} />
                </Modal.Footer>                
                <MessageModal show={messageModal.showMessage} 
                              title={"確認"} 
                              bsSize="small"
                              buttonStyle={messageModal.buttonStyle}
                              onOK={this.handleOK}
                              onCancel={this.handleCancelMessage}>
                    {messageModal.message && messageModal.message.split(/\r\n|\n/).map((str) => <div>{str}</div>)}
                </MessageModal>
            </Modal>
        );
    }


    //#region イベント呼び出し

    /**
     * トリガーしきい値変更イベント
     */
    handleTriggerThresholdChanged = (value, triggerId, pointNo) => {
        this.setState({
            triggerThresholds: this.changeTriggerThresholds(value, triggerId, pointNo),
            validate: this.validateTriggerThreshold(value, triggerId, pointNo)
        });
    }

    /**
     * 保存ボタンクリックイベント
     */
    handleSave = () => {
        const { triggerThresholds, selectedTriggerThreshold: before } = this.state;
        const after = triggerThresholds.find((th) => th.triggerType.triggerId === before.triggerType.triggerId && th.pointNo === before.pointNo);
        const afterThreshold = (after && (after.threshold || after.threshold === 0)) ? convertNumber(after.threshold) : null;        
        if ((before.threshold || before.threshold === 0 ) && (!afterThreshold && afterThreshold !== 0)) {
            this.setState({ messageModal: { showMessage: true, buttonStyle: 'confirm', message: '選択中トリガーのしきい値が未設定に変更になりますが、よろしいですか？' }});
        } else {
            this.setState({ messageModal: { showMessage: true, buttonStyle: 'save', message: 'しきい値を保存します。よろしいですか？' }});
        }
    }

    /**
     * キャンセルボタンクリックイベント
     */
    handleCancel = () => {
        if (this.props.onCancel) {
            this.props.onCancel();
        }
    }


    /**
     * OKボタンクリックイベント
     */
    handleOK = () => {
        this.saveThresholds();
    }

    /**
     * メッセージモーダルのキャンセルイベント
     */
    handleCancelMessage = () => {
        this.setState({ messageModal: { showMessage: false, buttonStyle: null, message: '' }});
    }

    //#endregion

    //#region しきい値
    
    /**
     * しきい値を保存する
     */
    saveThresholds() {
        if (this.props.onSave) {
            var demandSet = _.cloneDeep(this.props.demandSet);
            demandSet.triggerThresholds = _.cloneDeep(this.state.triggerThresholds);
            this.setState({ messageModal: { showMessage: false, buttonStyle: null, message: '' }});
            this.props.onSave(demandSet);
        }
    }

    /**
     * トリガー閾値を2列ずつに分けたデータを作成する
     * @param {*} triggerThresholds 
     */
    makeTriggerThresholds2D(triggerThresholds, validate) {
        var new2DAaary = [];
        const DIVLENGTH = 2;
        const thresholds = triggerThresholds ? triggerThresholds.filter((th) => !th.pointNo && th.pointNo !== 0) : [];
        for(let i = 0; i < thresholds.length; i += DIVLENGTH){
         　 let splitThresholds = thresholds.slice(i, i + DIVLENGTH);
            if (splitThresholds) {
                const thresholds = this.makeTriggerThresholdsWithValidate(splitThresholds, validate);
                new2DAaary.push(thresholds);
            }
        }
        return new2DAaary;
    }

    /**
     * SOCポイントしきい値をポイントでまとめる
     * @param {*} triggerThresholds 
     */
    makeSOCPointThresholds(triggerThresholds, validate) {
        const pointNos = triggerThresholds ? triggerThresholds.map((th) => th.pointNo).filter((pointNo, i, self) => (pointNo || pointNo === 0) && self.indexOf(pointNo) == i) : [];
        return pointNos.map((pointNo) => {
            const thresholds = triggerThresholds.filter((th) => th.pointNo === pointNo);
            return {
                pointNo: pointNo,
                pointName: thresholds && thresholds.length > 0 && thresholds[0].pointName,
                triggerThresholds: this.makeTriggerThresholdsWithValidate(thresholds, validate)
            } 
        });
    }

    /**
     * 入力検証込みのトリガーしきい値情報を作成する
     * @param {array} triggerThresholds トリガーしきい値リスト
     * @param {array} validate 入力検証結果（全体）
     */
    makeTriggerThresholdsWithValidate(triggerThresholds, validate) {
        return triggerThresholds.map((th) => {
            let threshold = _.cloneDeep(th);
            threshold.validate = this.findValidate(validate, threshold.triggerType.triggerId, threshold.pointNo);
            return threshold;
        });               
    }
    
    /**
     * SOCポイントのトリガー種別のみに絞り込む
     * @param {array} triggerTypes トリガー種別リスト
     * @param {array} triggerThresholds トリガー種別一覧
     */
    filterSocTriggerTypes(triggerTypes, triggerThresholds) {
        if (triggerThresholds && triggerThresholds.length > 0) {
            return triggerTypes.filter((type) => 
                        triggerThresholds.some((th) => th.triggerType.triggerId === type.triggerId && (th.pointNo || th.pointNo === 0 ? true : false ))
                   );
        } else {
            return [];
        }
    }

    /**
     * トリガーしきい値を変更する
     * @param {*} value 変更後の値
     * @param {number} triggerId トリガー種別ID
     * @param {number} pointNo ポイント番号
     */
    changeTriggerThresholds(value, triggerId, pointNo) {
        var triggerThresholds = _.cloneDeep(this.state.triggerThresholds);
        const target = triggerThresholds.find((th) => th.triggerType.triggerId === triggerId && th.pointNo === pointNo);
        target.threshold = value;
        return triggerThresholds;
    }

    //#endregion

    //#region 入力検証

    /**
     * トリガーしきい値の検証結果初期化
     * @param {array} triggerThresholds トリガー閾値リスト
     */
    initialValidateThresholds(triggerThresholds) {
        return triggerThresholds && triggerThresholds.map((threshold) => {
            return {
                triggerId: threshold.triggerType.triggerId,
                pointNo: threshold.pointNo,
                validate: validateReal(threshold.threshold, 0, 999999, true)
            };
        })
    }

    /**
     * トリガーしきい値の入力検証
     * @param {string} value 対象値
     * @param {number} triggerId トリガー種別ID
     * @param {number} pointNo ポイント番号
     */
    validateTriggerThreshold(value, triggerId, pointNo) {
        var validate = _.cloneDeep(this.state.validate);
        const target = validate.find((vld) => vld.triggerId === triggerId && vld.pointNo === pointNo);
        target.validate = validateReal(value, 0, 999999, true);
        return validate;
    }

    /**
     * 検証結果を探す
     * @param {array} validate 検証結果リスト
     * @param {number} triggerId トリガーID
     * @param {number} pointNo ポイント番号
     */
    findValidate(validate, triggerId, pointNo) {
        const target = validate.find((vld) => vld.triggerId === triggerId && vld.pointNo === pointNo);
        return target && target.validate && _.cloneDeep(target.validate);
    }
    
    /**
     * 保存ボタンが無効かどうか
     */
    invaild() {
        const { validate } = this.state;
        return validate.some((vld) => vld.validate.state !== VALIDATE_STATE.success);
    }

    //#endregion
}

DemandSettingModal.propsTypes = {
    show: PropTypes.bool, 
    triggerTypes: PropTypes.array,
    demandSet: PropTypes.object,
    selectedTriggerType: PropTypes.object,
    selectedPointNo: PropTypes.number,
    onSave: PropTypes.func,
    onCancel: PropTypes.func
}

/**
 * デマンド情報(契約電力・目標電力)
 * @param {number} contractPower 契約電力
 * @param {number} targetEnergy 目標電力値
 */
const DemandInfoForm = ({ contractPower, targetEnergy }) => {
    return (
        <InputForm className="mb-2">
            <InputForm.Row>
                <InputForm.Col label="契約電力" columnCount={2} >
                    <LabelForm value={contractPower || contractPower == 0 ? changeNumbarFormat(contractPower, 2) + 'kW' : ''} />
                </InputForm.Col>
                <InputForm.Col label="目標電力量値" columnCount={2} >
                    <LabelForm value={targetEnergy || targetEnergy == 0 ? changeNumbarFormat(targetEnergy, 2) + 'kWh' : ''} />
                </InputForm.Col>
            </InputForm.Row>
        </InputForm>   
    );
}

/**
 * トリガーしきい値ボックス
 * @param {array} triggerThresholds2D 2次元トリガー閾値(2個ずつに分けたトリガー閾値)
 * @param {function} onChange しきい値変更時に呼びだす
 */
const TriggerThresholdBox = ({ triggerThresholds2D, onChange: handleChanged}) => {
    return (
        triggerThresholds2D && triggerThresholds2D.length>0&&
            <GarmitBox title="トリガーしきい値" >
                {triggerThresholds2D&&triggerThresholds2D.length>0&&
                    <InputForm>
                    {triggerThresholds2D.map((thresholds) => 
                        <InputForm.Row>
                        {thresholds.map((threshold) => 
                            <ThresholdColumn {...threshold} onChange={handleChanged} />
                        )}
                        </InputForm.Row>
                    )}
                    </InputForm>
                }
            </GarmitBox>
    );
}

/**
 * SOCポイントしきい値
 * @param {array} triggerTypes トリガー種別リスト（SOCポイント閾値のみ）
 * @param {array} pointThresholds ポイント毎の閾値リスト（ポイント毎にSOCポイントに分ける）
 * @param {function} onChange しきい値変更時に呼びだす
 */
const SocPointThresholdBox = ({triggerTypes, pointThresholds, onChange: handleChanged}) => {
    const dataRows = pointThresholds.map((pointThreshold) => { 
        const triggerThresholds = pointThreshold.triggerThresholds;
        let columnInfo = [
            { value: pointThreshold.pointName }
        ];

        triggerTypes.forEach((type) => {
            const threshold = triggerThresholds.find((th) => th.triggerType.triggerId === type.triggerId);
            columnInfo.push({
                value: threshold.threshold,
                onChange: (value) => handleChanged(value, type.triggerId, pointThreshold.pointNo),
                validationState: threshold.validate.state,
                helpText: threshold.validate.helpText,
                unit: type.unit
            });
        });

        return {  
            id: pointThreshold.pointNo,
            columnInfo: columnInfo
        } 
    });

    return (        
        <GarmitBox title="SOCポイントしきい値" >
            <InputTable
                headerInfo={[
                    { label: 'ポイント', columnSize: 4 },                    
                    ...triggerTypes.map((type) => ({ label: type.triggerName, columnSize: 2 }))
                ]}
                inputComponentList={[LabelForm, TextForm, TextForm, TextForm, TextForm]}
                data={dataRows}
            />
        </GarmitBox>
    );
}

/**
 * トリガー閾値カラム
 */
const ThresholdColumn = ({ triggerType, threshold, validate, onChange:handleChanged }) => {
    return (
        <InputForm.Col label={triggerType.triggerName} columnCount={2} >
            <TextForm
                value={threshold}
                onChange={(value) => handleChanged(value, triggerType.triggerId)}
                validationState={validate.state}
                helpText={validate.helpText}
                unit={triggerType.unit}
            />
        </InputForm.Col>
    )
}