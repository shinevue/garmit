/**
 * Copyright 2017 DENSO Solutions
 * 
 * オブジェクト設定ボックス Reactコンポーネント
 *  
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import CheckboxSwitch from 'Common/Widget/CheckboxSwitch';
import TextForm from 'Common/Form/TextForm';
import LabelForm from 'Common/Form/LabelForm';
import SelectForm from 'Common/Form/SelectForm';
import InputForm from 'Common/Form/InputForm';
import ColorForm from 'Common/Form/ColorForm';
import Position2DForm from 'Common/Form/Position2DForm';
import Size2DForm from 'Common/Form/Size2DForm';

import { CancelButton, DeleteButton, AddButton, ApplyButton, EditButton, LinkSelectCircleButton, LocationSelectCircleButton, ImageSelectCircleButton, LayoutSelectCircleButton, PowerSelectCircleButton, RemoveCircleButton } from 'Assets/GarmitButton';
import GarmitBox from 'Assets/GarmitBox';
import PointSelectModal from 'Assets/Modal/PointSelectModal';
import LocationSelectModal from 'Assets/Modal/LocationSelectModal';
import LayoutSelectModal from 'Assets/Modal/LayoutSelectModal';
import EgroupSelectModal from 'Assets/Modal/EgroupSelectModal';
import MessageModal from 'Assets/Modal/MessageModal';

import ImageSelectModal from 'Graphic/ImageSelectModal';

import { OBJECT_TYPE, OBJECT_TYPE_OPTIONS, LINK_TYPE, LINK_TYPE_OPTIONS } from 'graphicUtility';
import { canSettingIsMultiRack, canSettingIsMultiRackByLayout } from 'graphicUtility';

const INIT_MODAL_INFO = {
    show: false,
    title: "",
    children: ""
}

/**
 * オブジェクト情報ボックス
 */
export default class ObjectSettingBox extends Component {

    constructor() {
        super();
        this.state = {
            showModal: {
                image: false,
                point: false,
                location: false,
                layout: false,
                egroup:false
            },
            messageModalInfo: INIT_MODAL_INFO
        };
    }

    //#region イベントハンドラ
    /**
     * 背景画像選択イベント
     */
    handleSelectImage = (selected) => {
        this.setState({ showModal: Object.assign({}, this.state.showModal, { image: false }) });
        if (this.props.common.onChange) {
            this.props.common.onChange("backgroundImage", selected);
        }
    }

    /**
     * リンク先選択モーダル適用イベント
     */
    handleApplyLink = (type, selected) => {
         if (type === "layout" && selected.layoutId === this.props.selectLayoutId) {
            this.setState({
                messageModalInfo: {
                    bsSize: "sm",
                    buttonStyle: "message",
                    show: true,
                    title: "選択不可",
                    children: "編集中レイアウトをリンク先レイアウトとして選択することはできません。"
                }
            });
        }
        else if (this.props.common.onChange) {
            if (type === "point") {
                 let selectedPoint = _.pick(selected, ["pointNo", "pointName"]);
                 selectedPoint.systemId = _.get(application, "systemId");
                 this.props.common.onChange(type, selectedPoint);

            }
            else {
                this.props.common.onChange(type, selected);
             }
            let showModal = _.cloneDeep(this.state.showModal);
            showModal = _.set(showModal, type, false);
            this.setState({ showModal: showModal });
        }
    }

    /**
     * リンク先クリアボタンクリックイベント
     */
    handleClickClear = (type) => {
        if (this.props.common.onChange) {
            this.props.common.onChange(type, null);
        }
    }

    /**
     * 選択モーダルクローズイベント
     */
    handleCloseSelectModal = (type) => {
        switch (type) {
            case "image":
                this.setState({ showModal: Object.assign({}, this.state.showModal, { image: false}) });
                break;
            case "point":
                this.setState({ showModal: Object.assign({}, this.state.showModal, { point: false }) });
                break;
            case "location":
                this.setState({ showModal: Object.assign({}, this.state.showModal, { location: false }) });
                break;
            case "layout":
                this.setState({ showModal: Object.assign({}, this.state.showModal, { layout: false }) });
                break;
            case "egroup":
                this.setState({ showModal: Object.assign({}, this.state.showModal, { egroup: false }) });
                break;
            default: break;
        }
    }

    /**
     * 選択ボタンクリックイベント
     */
    handleClickSelect = (type) => {
        switch (type) {
            case "image":
                this.setState({ showModal: Object.assign({}, this.state.showModal, { image: true }) });
                break;
            case "point":
                this.setState({ showModal: Object.assign({}, this.state.showModal, { point: true }) });
                break;
            case "location":
                this.setState({ showModal: Object.assign({}, this.state.showModal, { location: true }) });
                break;
            case "layout":
                this.setState({ showModal: Object.assign({}, this.state.showModal, { layout: true }) });
                break;
            case "egroup":
                this.setState({ showModal: Object.assign({}, this.state.showModal, { egroup: true }) });
                break;
            default: break;
        }
    }

    /**
     * 操作ボタンクリックイベント
     */
    handleClick=(operation)=> {
        if (this.props.onClick) {
            this.props.onClick(operation);
        }
    }
  
    //#endregion

    /**
     * render
     */
    render() {
        const { isOnlyValueLabel, isReadOnly, isEditMode, lookUp, selectObjects, info, isLoading, common } = this.props;
        const { showModal, messageModalInfo } = this.state;
        const isSelect = selectObjects.length > 0 ? true : false;
        const isMultiSelect = selectObjects.length > 1 ? true : false;
        return (
            <GarmitBox title='オブジェクト設定' isLoading={isLoading}>
                <div>
                    <div className="flex-center-end mb-05">
                        <SelectStateMessage isSelect={isSelect} isMultiSelect={isMultiSelect} isEditMode={info.isEditMode} />                       
                        <EditDeleteButtonGroup
                            show={!info.isEditMode && isEditMode}
                            isLoading={isLoading}
                            isSelect={isSelect}
                            onClickEdit={this.handleClick.bind(this, "edit")}
                            onClickDelete={this.handleClick.bind(this, "deleteObject")}
                        />
                    </div>
                    <ObjectSettingBoxBody
                        isMultiSelect={isMultiSelect}
                        isBoxEditMode={info.isEditMode}
                        isOnlyValueLabel={isOnlyValueLabel}
                        lookUp={lookUp}
                        common={common}
                        info={info}
                        showModal={showModal}
                        onSelectImage={this.handleSelectImage}
                        onApplyLink={this.handleApplyLink}
                        onCloseModal={this.handleCloseSelectModal}
                        onClick={this.handleClickSelect}
                        onClickClear={this.handleClickClear}
                    />
                    <MessageModal {...messageModalInfo} onCancel={() => { this.setState({ messageModalInfo: INIT_MODAL_INFO }) }} />
                </div>
                {info.isEditMode &&
                    <div className="pull-right mt-1">
                        <ObjectAddButton isMultiSelect={isMultiSelect}className="mr-05" disabled={isReadOnly || info.validation.state !== "success"} onClick={this.handleClick.bind(this, "addObject")} />
                        <ApplyButton className="mr-05" disabled={isReadOnly || !isSelect || info.validation.state !== "success"} onClick={this.handleClick.bind(this, "applyObject")} />
                        <CancelButton disabled={isReadOnly} onClick={this.handleClick.bind(this, "cancelObject")} />
                    </div>
                }
            </GarmitBox>
        );
    }
}

ObjectSettingBox.propTypes = {
    isOnlyValueLabel:PropTypes.bool,    //測定値ラベルのみ選択中かどうか
    isReadOnly: PropTypes.bool,     //読み取り専用ユーザーかどうか
    isEditMode: PropTypes.bool,     //レイアウト編集モードかどうか
    selectLayoutId:PropTypes.number,
    lookUp: PropTypes.shape({
        locations: PropTypes.array,
        layouts: PropTypes.array,
        egroups:PropTypes.array
    }),
    selectObjects: PropTypes.array,
    info: PropTypes.object,
    isLoading: PropTypes. bool,
    common: PropTypes.shape({
        isReadOnly: PropTypes.bool, //オブジェクト設定ボックスが読み取り専用状態かどうか（権限、編集モードを考慮）
        onChange: PropTypes.func,
        onCheckChange: PropTypes.func
    })
};

//#region SFC
/**
 * オブジェクト選択状態メッセージ
 */
const SelectStateMessage = ({ isSelect, isMultiSelect, isEditMode}) => {
    return (
        <div>
            {isSelect && !isMultiSelect && <span style={{ color: "red" }}>オブジェクト選択中</span>}
            {isMultiSelect && !isEditMode && <span style={{ color: "red" }}>赤枠オブジェクト情報表示中</span>}
            {isMultiSelect && isEditMode && 　<span style={{ color: "red" }}>オブジェクト複数選択中※チェックされている項目のみ変更が反映されます。</span>}
        </div>
    );
}

/**
 * オブジェクト追加ボタン
 */
const ObjectAddButton = (props) => {
    if (props.isMultiSelect) {
        return <div />
    }
    return (
        <AddButton {...props} />
    );
}

/**
 * 編集削除ボタングループ
 */
const EditDeleteButtonGroup = ({ show, isLoading, isSelect, onClickEdit:handleClickEdit, onClickDelete:handleClickDelete }) => {
    if (!show) {
        return <div />;
    }
    else {
        return (
            <div className="pull-right">
                <EditButton disabled={isLoading} className="mr-05" onClick={handleClickEdit} />
                <DeleteButton disabled={isLoading || !isSelect} onClick={handleClickDelete} />
            </div>
        );
    }
}

/**
 * オブジェクト設定ボックスbody
 */
const ObjectSettingBoxBody = ({ isMultiSelect, isBoxEditMode, isOnlyValueLabel, lookUp, common, info, showModal, onSelectImage: handleSelectImage, onCloseModal: handleCloseModal, onClick: handleClick, onClickClear:handleClickClear, onApplyLink:handleApplyLink }) => {
    const selectObjectType = info && _.get(info.data, 'objectType');
    const selectLinkType = info && _.get(info.data, 'linkType');
    const showCheckBox = isMultiSelect && isBoxEditMode;
    const commonProps = { ...common, showCheckBox: showCheckBox };
    
    var canSetMultiRack = false;
    if (selectLinkType === LINK_TYPE.location) {
        const selectLocation = info && _.get(info.data, 'location');
        canSetMultiRack = canSettingIsMultiRack(selectLocation);
    } else if (selectLinkType === LINK_TYPE.layout) {
        const selectLayout = info && _.get(info.data, 'layout');
        canSetMultiRack = canSettingIsMultiRackByLayout(selectLayout);
    }

    return (
        <InputForm>
            <SettingRow1
                {...commonProps}
                objectValue={info && _.pick(info.data, ['size', 'position'])}
                validation={info && _.pick(info.validation, ['size', 'position'])}
                checked={info && info.checked}
            />
            <SettingRow2
                {...commonProps}
                objectValue={info && _.pick(info.data, ['border', 'borderColor'])}
                validation={info && _.pick(info.validation, ['border', 'borderColor'])}
                checked={info && info.checked}
            />
            <SettingRow3
                {...commonProps}
                objectValue={info && _.pick(info.data, ['backColor', 'monitor'])}
                validation={info && _.pick(info.validation, 'backColor')}
                type={selectObjectType}
                checked={info && info.checked}
            />
            <SettingRow4
                {...commonProps}
                objectValue={info && _.pick(info.data, ['objectType', 'fontSize'])}
                validation={info && _.pick(info.validation, ['objectType', 'fontSize'])}
                checked={info && info.checked}
            />
            <TextRow
                {...commonProps}
                isEditMode={isBoxEditMode}
                isMultiSelect={isMultiSelect}
                isOnlyValueLabel={isOnlyValueLabel}
                objectValue={info && _.pick(info.data, ['displayText', 'foreColor'])}
                type={selectObjectType}
                validation={info && _.pick(info.validation, ['displayText', 'foreColor'])}
                checked={info && info.checked}
            />
            {!showCheckBox &&
                <BackgroundImageRow
                    {...commonProps}
                    objectValue={info && _.pick(info.data, ['backgroundImage', 'backgroundImageUrl'])}
                    type={selectObjectType}
                    checked={info && info.checked}
                    showModal={showModal.image}
                    onClick={handleClick}
                    onClickClear={handleClickClear}
                    onSelectImage={handleSelectImage}
                    onCloseModal={handleCloseModal}
                />
            }
            {!showCheckBox &&
                <LinkTypeRow
                    {...commonProps}
                    lookUp={lookUp}
                    objectValue={info && _.pick(info.data, ['linkType', 'point', 'egroup', 'layout', 'location', 'objectType'])}
                    validation={info && _.pick(info.validation, 'linkType')}
                    showModal={_.pick(showModal, ["point", "layout", "location", "egroup"])}
                    onClick={handleClick}
                    onClickClear={handleClickClear}
                    onCloseModal={handleCloseModal}
                    onApplyLink={handleApplyLink}
                />
            }
            {!showCheckBox && 
             (selectLinkType === LINK_TYPE.location || selectLinkType === LINK_TYPE.layout) &&
             canSetMultiRack &&
                <MultiRackRow
                    {...commonProps}
                    objectValue={info && _.pick(info.data, ['isMultiRack'])}
                />
            }
        </InputForm>
    );
}

/**
 * 位置サイズ設定行
 */
const SettingRow1 = ({ objectValue, validation, checked, showCheckBox, isReadOnly, onChange: handleChange, onCheckChange: handleCheckChange }) => {
    return (
        <InputForm.Row>
            {!showCheckBox &&
                <PositionColumn
                    value={{ x: _.get(objectValue, "position.x", 0), y: _.get(objectValue, "position.y", 0) }}
                    validation={validation && validation.position}
                    isReadOnly={isReadOnly}
                    onChange={handleChange.bind(this, "position")}
                />
            }
            <SizeColumn
                checked={_.includes(checked, "size")}
                value={{ width: _.get(objectValue, "size.width", 0), height: _.get(objectValue, "size.height", 0) }}
                validation={validation && validation.size}
                showCheckBox={showCheckBox}
                isReadOnly={isReadOnly}
                onChange={handleChange.bind(this, "size")}
                onCheckChange={handleCheckChange.bind(this, "size")}
            />
        </InputForm.Row>
    );
}

/**
 * 位置設定カラム
 */
const PositionColumn = (props) => {
    const { validation } = props;
    let helpText = "";
    if (validation && validation.state !== "success") {
        if (validation.x.state !== "success") {
            helpText = "X:" + validation.x.helpText;
        }
        else {
            helpText = "Y:" + validation.y.helpText;
        }
    }
    return (
        <InputForm.Col
            label="位置"
            columnCount={2}
            isRequired={true}
        >
            <Position2DForm {...props} validationState={validation && validation.state} helpText={validation && helpText} />
        </InputForm.Col>
    );
}

/**
 * サイズ設定カラム
 */
const SizeColumn = (props) => {
    const { isReadOnly, checked, validation, showCheckBox, onCheckChange: handleCheckChange } = props;
    let helpText = "";
    if (validation && validation.state !== "success") {
        if (validation.width.state !== "success") {
            helpText = "横:" + validation.width.helpText;
        }
        else {
            helpText = "縦:" + validation.height.helpText;
        }
    }
    return (
        <InputForm.Col
            checked={checked}
            label="サイズ"
            columnCount={2}
            isRequired={true}
            checkbox={showCheckBox}
            onCheckChange={handleCheckChange}
        >
            <Size2DForm {...props}
                isReadOnly={(showCheckBox && !checked) || isReadOnly}
                validationState={validation && validation.state}
                helpText={validation && helpText} />
        </InputForm.Col>
    );
}

/**
 * 枠設定行
 */
const SettingRow2 = ({ checked, objectValue, validation, showCheckBox, isReadOnly, onChange: handleChange, onCheckChange: handleCheckChange }) => {
    const colorChecked = _.includes(checked, "borderColor");
    const borderChecked = _.includes(checked, "border")
    return (
        <InputForm.Row>
            <InputForm.Col checked={colorChecked} label="枠色" columnCount={2} isRequired={true} checkbox={showCheckBox} onCheckChange={handleCheckChange.bind(this, "borderColor")}>
                <ColorForm color={_.get(objectValue, "borderColor")} validationState={_.get(validation, "borderColor.state")} helpText={_.get(validation, "borderColor.helpText")}  isReadOnly={(showCheckBox && !colorChecked)||isReadOnly} onChange={handleChange.bind(this, "borderColor")} />
            </InputForm.Col>
            <InputForm.Col checked={borderChecked} label="枠幅" columnCount={2} isRequired={true} checkbox={showCheckBox} onCheckChange={handleCheckChange.bind(this, "border")}>
                <TextForm value={_.get(objectValue, "border")} validationState={_.get(validation, "border.state")} helpText={_.get(validation, "border.helpText")} isReadOnly={(showCheckBox && !borderChecked) || isReadOnly} onChange={handleChange.bind(this, "border")} />
            </InputForm.Col>
        </InputForm.Row>
    );
}

/**
 * オブジェクトカラー監視状態設定行
 */
const SettingRow3 = ({ checked, validation, objectValue, type, showCheckBox, isReadOnly, onChange: handleChange, onCheckChange: handleCheckChange }) => {
    const backColorChecked = _.includes(checked, "backColor");
    const monitorChecked = _.includes(checked, "monitor");
    return (
        <InputForm.Row>
            <InputForm.Col checked={backColorChecked} label="背景色" columnCount={2} isRequired={true} checkbox={showCheckBox} onCheckChange={handleCheckChange.bind(this, "backColor")}>
                <ColorForm color={_.get(objectValue, "backColor")} validationState={_.get(validation, "backColor.state")} helpText={_.get(validation, "backColor.helpText")} isReadOnly={(showCheckBox && !backColorChecked) || isReadOnly} onChange={handleChange.bind(this, "backColor")} />
            </InputForm.Col>
            <InputForm.Col checked={monitorChecked} label="監視状態" columnCount={2} isRequired={true} checkbox={showCheckBox} onCheckChange={handleCheckChange.bind(this, "monitor")}>
                <CheckboxSwitch
                    bsSize="md"
                    text="監視する"
                    checked={_.get(objectValue, "monitor")}
                    disabled={(showCheckBox && !monitorChecked) || isReadOnly}
                    onChange={handleChange.bind(this, "monitor")}
                />
            </InputForm.Col>
        </InputForm.Row>
    );
}

/**
 * オブジェクト種別オプション情報行
 */
const SettingRow4 = ({ checked, objectValue, showCheckBox, isReadOnly, validation, onChange: handleChange, onCheckChange: handleCheckChange }) => {
    const sizeChecked = _.includes(checked, "fontSize");
    return (
        <InputForm.Row>
            {!showCheckBox &&
                <InputForm.Col label="種別" columnCount={2} isRequired={true}>
                    <SelectForm
                        value={_.get(objectValue, "objectType")}
                        options={OBJECT_TYPE_OPTIONS}
                        isRequired={true}
                        isReadOnly={isReadOnly}
                        validationState={_.get(validation, 'objectType.state')}
                        helpText={_.get(validation, 'objectType.helpText')}
                        onChange={handleChange.bind(this, "objectType")}
                    />
                </InputForm.Col>
            }
            <InputForm.Col
                checked={sizeChecked}
                label="文字サイズ"
                columnCount={2}
                isRequired={true}
                checkbox={showCheckBox}
                onCheckChange={handleCheckChange.bind(this, "fontSize")}
            >
                <TextForm
                    value={_.get(objectValue, "fontSize")}
                    validationState={_.get(validation, 'fontSize.state')}
                    helpText={_.get(validation, 'fontSize.helpText')}
                    isReadOnly={(showCheckBox && !sizeChecked) || isReadOnly}
                    onChange={handleChange.bind(this, "fontSize")}
                />
            </InputForm.Col>
        </InputForm.Row>
    );
}

/**
 * テキスト情報設定行
 */
const TextRow = ({ isEditMode, isMultiSelect, isOnlyValueLabel, checked, objectValue, showCheckBox, type, isReadOnly, validation, onChange: handleChange, onCheckChange: handleCheckChange }) => {
    if ((isMultiSelect && (isEditMode && isOnlyValueLabel) || (!isEditMode && type === OBJECT_TYPE.valueLabel))
        || (!isMultiSelect && type === OBJECT_TYPE.valueLabel)) {
        return false;
    }
    const textChecked = _.includes(checked, "displayText");
    const colorChecked = _.includes(checked, "foreColor");
    return (
        <InputForm.Row>
            <InputForm.Col
                checked={textChecked}
                label="表示文字"
                columnCount={2}
                isRequired={false}
                checkbox={showCheckBox}
                onCheckChange={handleCheckChange.bind(this, "displayText")}
            >
                <TextForm maxlength={50} value={_.get(objectValue, "displayText")} validationState={_.get(validation, 'displayText.state')} helpText={_.get(validation, 'displayText.helpText')} isReadOnly={(showCheckBox && !textChecked) || isReadOnly} onChange={handleChange.bind(this, "displayText")} />
            </InputForm.Col>
            <InputForm.Col
                checked={colorChecked}
                label="文字色"
                columnCount={2}
                isRequired={true}
                checkbox={showCheckBox}
                onCheckChange={handleCheckChange.bind(this, "foreColor")}
            >
                <ColorForm
                    color={_.get(objectValue, "foreColor")}
                    isReadOnly={(showCheckBox && !colorChecked) || isReadOnly}
                    validationState={_.get(validation, 'foreColor.state')}
                    helpText={_.get(validation, 'foreColor.helpText')}
                    onChange={handleChange.bind(this, "foreColor")}
                />
            </InputForm.Col>
        </InputForm.Row>
    );
}

/**
 * 背景画像設定行
 */
const BackgroundImageRow = ({ checked, objectValue, showCheckBox, type, isReadOnly, showModal, onSelectImage: handleSelectImage, onCheckChange: handleCheckChange, onCloseModal: handleCloseModal, onClick: handleClick, onClickClear: handleClickClear }) => {
    if (type === OBJECT_TYPE.picture) {
        const backgroundImage = _.get(objectValue, "backgroundImage");
        const backgroundImageUrl = _.get(objectValue, "backgroundImageUrl");
        const imageChecked = _.includes(checked, "image");
        const disabled = (showCheckBox && !imageChecked) || isReadOnly;
        return (
            <InputForm.Row>
                <InputForm.Col checked={imageChecked} label="画像" columnCount={2} isRequired={false} checkbox={showCheckBox} onCheckChange={handleCheckChange.bind(this, "image")}>
                    <div className="flex-center-end">
                        <LabelForm value={backgroundImage} isReadOnly={(showCheckBox && !imageChecked) || isReadOnly} />
                        {!isReadOnly &&
                            <div style={{ float: 'left' }}>
                                <ImageSelectCircleButton disabled={disabled} className='mr-05' onClick={handleClick.bind(this, "image")} />
                                <RemoveCircleButton disabled={disabled} onClick={handleClickClear.bind(this, "backgroundImage")} />
                            </div>
                        }
                    </div>
                </InputForm.Col>
                <ImageSelectModal
                    showModal={showModal}
                    selected={{ fileName: backgroundImage, url: backgroundImageUrl }}
                    onClose={handleCloseModal.bind(this, "image")}
                    onApply={handleSelectImage}
                />
            </InputForm.Row>
        );
    }
    return false;
}


/**
 * 分割ラック行
 */
const MultiRackRow = ({ objectValue, isReadOnly, onChange: handleChange }) => {
    return (        
        <InputForm.Row>
            <InputForm.Col label="分割ラック" columnCount={2} >
                <CheckboxSwitch
                    bsSize="md"
                    text="設定する"
                    checked={_.get(objectValue, "isMultiRack")}
                    disabled={isReadOnly}
                    onChange={handleChange.bind(this, "isMultiRack")}
                />
            </InputForm.Col>
        </InputForm.Row>
    );
}

/**
 * リンク種別行
 */
const LinkTypeRow = ({ validation, lookUp, showModal, objectValue, showCheckBox, value, isReadOnly, onChange: handleChange, onCloseModal: handleCloseModal, onClick: handleClick, onClickClear: handleClickClear, onApplyLink:handleApplyLink }) => {
    return (
        <InputForm.Row>
            <InputForm.Col label="リンク種別" columnCount={2} isRequired={true}>
                <SelectForm
                    label=""
                    value={_.get(objectValue, "linkType")}
                    options={LINK_TYPE_OPTIONS}
                    isRequired={true}
                    validationState={_.get(validation, "linkType.state")}
                    helpText={_.get(validation, "linkType.helpText")}
                    isReadOnly={isReadOnly || _.get(objectValue, "objectType") === OBJECT_TYPE.valueLabel}
                    onChange={handleChange.bind(this, "linkType")}
                />
            </InputForm.Col>
            <LinkSettingColumn
                lookUp={lookUp}
                showModal={showModal}
                type={_.get(objectValue, "linkType")}
                value={_.pick(objectValue, ["point", "layout", "location", "egroup"])}
                common={{ isReadOnly: isReadOnly, showCheckBox: showCheckBox, onClose: handleCloseModal, onClick: handleClick, onClickClear:handleClickClear, onApplyLink: handleApplyLink}}
            />
        </InputForm.Row>
    );
}

/**
 * リンク先設定カラム
 */
const LinkSettingColumn = ({ lookUp, showModal, type, value, common }) => {
    switch (type) {
        case LINK_TYPE.point:
            return <PointSelectColumn {...common} point={_.get(value, "point")} showModal={_.get(showModal, "point")} />
        case LINK_TYPE.location:
            return <LocationSelectColumn {...common} locationList={lookUp.locations} location={_.get(value, "location")} showModal={_.get(showModal, "location")} />
        case LINK_TYPE.layout:
            return <LayoutSelectColumn {...common} layoutList={lookUp.layouts} layout={_.get(value, "layout")} showModal={_.get(showModal, "layout")} />
        case LINK_TYPE.egroup:
            return <EgroupSelectColumn {...common} egroupList={lookUp.egroups} egroup={_.get(value, "egroup")} showModal={_.get(showModal, "egroup")} />
        case LINK_TYPE.nothing:
        default:
            return <div />;
    }
}

/**
 * ポイント設定カラム
 */
const PointSelectColumn = ({ showModal, point, isReadOnly, lookUp, onClose: handleClose, onClick: handleClick, onClickClear:handleClickClear, onApplyLink: handleApplyLink}) => {
    return (
        <InputForm.Col label="ポイント" columnCount={2} isRequired={false}>
            <div className="flex-center-end">
                <LabelForm value={_.get(point, "pointName")} isReadOnly={isReadOnly} />
                {!isReadOnly &&
                    <div style={{ float: 'left' }}>
                        <LinkSelectCircleButton className='mr-05' onClick={handleClick.bind(this, "point")} />
                        <RemoveCircleButton onClick={handleClickClear.bind(this, "point")} />
                    </div>
                }
            </div>
            <PointSelectModal
                showModal={showModal}
                lookUp={lookUp}
                isMultiSelect={false}
                onSubmit={handleApplyLink.bind(this, "point")}
                onCancel={handleClose.bind(this, "point")}
            />
        </InputForm.Col>
    );
}

/**
 * ロケーション設定カラム
 */
const LocationSelectColumn = ({ showModal, locationList, location, isReadOnly, onClose: handleClose, onClick: handleClick, onClickClear:handleClickClear, onApplyLink: handleApplyLink}) => {
    return (
        <InputForm.Col label="ロケーション" columnCount={2} isRequired={false}>
            <div className="flex-center-end">
                <LabelForm value={_.get(location, "name")} isReadOnly={isReadOnly} />
                {!isReadOnly &&
                    <div style={{ float: 'left' }}>
                        <LocationSelectCircleButton className='mr-05' onClick={handleClick.bind(this, "location")} />
                        <RemoveCircleButton onClick={handleClickClear.bind(this, "location")} />
                    </div>
                }
            </div>
            <LocationSelectModal
                showModal={showModal}
                checkbox={false}
                separateCheckMode={true}
                locationList={locationList}
                selectedLocation={location}
                onSubmit={handleApplyLink.bind(this, "location")}
                onCancel={handleClose.bind(this, "location")}
            />
        </InputForm.Col>
    );
}

/**
 * レイアウト設定カラム
 */
const LayoutSelectColumn = ({ showModal, layoutList, layout, isReadOnly, onClose: handleClose, onClick: handleClick, onClickClear:handleClickClear, onApplyLink: handleApplyLink}) => {
    return (
        <InputForm.Col label="レイアウト" columnCount={2} isRequired={false} >
            <div className="flex-center-end">
                <LabelForm value={_.get(layout, "layoutName")} isReadOnly={isReadOnly} />
                {!isReadOnly &&
                    <div style={{ float: 'left' }}>
                        <LayoutSelectCircleButton className='mr-05' onClick={handleClick.bind(this, "layout")} />
                        <RemoveCircleButton onClick={handleClickClear.bind(this, "layout")} />
                    </div>
                }
            </div>
            <LayoutSelectModal
                showModal={showModal}
                layoutList={layoutList}
                selectedLayout={layout}
                onSelect={handleApplyLink.bind(this, "layout")}
                onCancel={handleClose.bind(this, "layout")}
            />
        </InputForm.Col>
    );
}

/**
 * 電源系統設定カラム
 */
const EgroupSelectColumn = ({ showModal, egroupList, egroup, isReadOnly, onClose: handleClose, onClick: handleClick, onClickClear:handleClickClear, onApplyLink: handleApplyLink}) => {
    return (
        <InputForm.Col label="電源系統" columnCount={2} isRequired={false} >
            <div className="flex-center-end">
                <LabelForm value={_.get(egroup, "egroupName")} isReadOnly={isReadOnly} />
                {!isReadOnly &&
                    <div style={{ float: 'left' }}>
                        <PowerSelectCircleButton className='mr-05' onClick={handleClick.bind(this, "egroup")} />
                        <RemoveCircleButton onClick={handleClickClear.bind(this, "egroup")} />
                    </div>
                }
            </div>
            <EgroupSelectModal
                showModal={showModal}
                checkbox={false}
                defaultCollapse={true}
                searchable={true}
                egroupList={egroupList}
                selectedEgroup={egroup}
                isMultiSelect={false}
                onSubmit={handleApplyLink.bind(this, "egroup")}
                onCancel={handleClose.bind(this, "egroup")}
            />
        </InputForm.Col>
    );
}

//#endregion