/**
 * Copyright 2017 DENSO Solutions
 * 
 * レイアウト設定ボックス Reactコンポーネント
 *  
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Icon from 'Common/Widget/Icon';
import TextForm from 'Common/Form/TextForm';
import LabelForm from 'Common/Form/LabelForm';
import InputForm from 'Common/Form/InputForm';

import GarmitBox from 'Assets/GarmitBox';
import { RemoveCircleButton, LayoutSelectCircleButton, ImageSelectCircleButton, LocationSelectCircleButton } from 'Assets/GarmitButton';
import LayoutSelectModal from 'Assets/Modal/LayoutSelectModal';
import MessageModal from 'Assets/Modal/MessageModal';
import LocationSelectModal from 'Assets/Modal/LocationSelectModal';

import ImageSelectModal from 'Graphic/ImageSelectModal';

import { getMatchLayout } from 'treeViewUtility';

const INIT_MODAL_INFO = {
    show: false,
    title: "",
    children: ""
}

/**
 * オブジェクト情報ボックス
 */
export default class LayoutSettingBox extends Component {

    constructor() {
        super();
        this.state = {
            showLayoutModal: false,
            showImageModal: false,
            showMaskModal: false,
            showLocationModal: false,
            messageModalInfo: INIT_MODAL_INFO
        };
    }

    //#region イベントハンドラ
    /**
    * レイアウト名称変更イベント
    */
    handleChangeLayoutName = (changed) => {
        if (this.props.onChangeLayoutSetting) {
            this.props.onChangeLayoutSetting({ layoutName: changed });
        }
    }

    /**
    * レイアウト選択モーダルクローズイベント
    */
    handleCloseLayoutModal = () => {
        this.setState({ showLayoutModal: false });
    }

    /**
    * 親レイアウト選択ボタンクリックイベント
    */
    handleClickSelectLayout = () => {
        this.setState({ showLayoutModal: true })
    }

    /**
    * 親レイアウトクリア選択ボタンクリックイベント
    */
    handleClickClearLayout = () => {
        if (this.props.onChangeLayoutSetting) {
            this.props.onChangeLayoutSetting({ parent: null });
        }
    }

    /**
    * 親レイアウト選択イベント
    */
    handleSelectLayout = (selected) => {
        if (selected.layoutId === this.props.editingInfo.layoutId) {
            this.setState({
                messageModalInfo: {
                    bsSize: "sm",
                    buttonStyle: "message",
                    show: true,
                    title: "選択不可",
                    children: "編集中レイアウトを親レイアウトとして選択することはできません。"
                }
            });
        }
        else {
            if (this.props.onChangeLayoutSetting) {
                this.props.onChangeLayoutSetting({ parent: getMatchLayout(selected.layoutId, this.props.layoutList) });
            }
            this.setState({ showLayoutModal: false });
        }
    }

    /**
    * 背景画像選択イベント
    */
    handleSelectImage = (fileInfo) => {
        if (this.props.onChangeLayoutSetting) {
            this.props.onChangeLayoutSetting({ backgroundImage: fileInfo.fileName, backgroundImageUrl: fileInfo.url });
        }
        this.setState({ showImageModal: false });
    }

    /**
    * 背景画像選択モーダル表示状態変更イベント
    */
    handleChangeImageModalShow = (show) => {
        this.setState({ showImageModal: show });
    }

    /**
    * 背景画像クリアイベント
    */
    handleClearImage = () => {
        if (this.props.onChangeLayoutSetting) {
            this.props.onChangeLayoutSetting({ backgroundImage: null, backgroundImageUrl: null });
        }
    }

    /**
    * マスク画像選択イベント
    */
    handleSelectMaskImage = (fileInfo) => {
        if (this.props.onChangeLayoutSetting) {
            this.props.onChangeLayoutSetting({ backgroundMaskImage: fileInfo.fileName, backgroundMaskImageUrl: fileInfo.url });
        }
        this.setState({ showMaskModal: false });
    }

    /**
    * マスク画像選択モーダル表示状態変更イベント
    */
    handleChangeMaskImageModalShow = (show) => {
        this.setState({ showMaskModal: show });
    }

    /**
    * マスク画像クリアイベント
    */
    handleClearMaskImage = () => {
        if (this.props.onChangeLayoutSetting) {
            this.props.onChangeLayoutSetting({ backgroundMaskImage: null, backgroundMaskImageUrl: null });
        }
    }

    /**
    * ロケーション変更イベント
    */
    handleChangeLocation = (selected) => {
        if (this.props.onChangeLayoutSetting) {
            this.props.onChangeLayoutSetting({ location: selected ? _.pick(selected, ['systemId', 'locationId', 'name']):null });
        }
        this.setState({ showLocationModal: false });
    }

    /**
    * ロケーション選択モーダル表示状態変更イベント
    */
    handleChangeLocationModalShow = (show) => {
        this.setState({ showLocationModal: show });
    }

    //#endregion

    /**
     * render
     */
    render() {
        const { isReadOnly, layoutList, layoutInfo, editingInfo, isLoading, isEditMode, locationList } = this.props;
        const { showLayoutModal, showImageModal, showMaskModal, showLocationModal, messageModalInfo } = this.state;
        const layoutName = isEditMode ? _.get(editingInfo, "layoutName") : _.get(layoutInfo, "layoutName");
        const location = isEditMode ? _.get(editingInfo, "location") : _.get(layoutInfo, "location");
        const nameValidation = isEditMode && _.get(editingInfo, "nameValidation");
        const backgroundImage = isEditMode ? _.get(editingInfo, "backgroundImage") : _.get(layoutInfo, "backgroundImage");
        const backgroundMaskImage = isEditMode ? _.get(editingInfo, "backgroundMaskImage") : _.get(layoutInfo, "backgroundMaskImage");
        const parent = isEditMode ? _.get(editingInfo, "parent") : _.get(layoutInfo, "parent");

        return (
            <GarmitBox title='レイアウト設定' isLoading={isLoading}>
                <InputForm>
                    <InputForm.Row>
                        <LayoutNameCol layoutName={layoutName} validationState={nameValidation} isReadOnly={!isEditMode} onChange={this.handleChangeLayoutName} />
                        <ParentLayoutCol
                            hideButtons={isReadOnly}
                            parent={parent}
                            isReadOnly={!isEditMode}
                            layoutList={layoutList}
                            showLayoutModal={showLayoutModal}
                            onClickSelectLayout={this.handleClickSelectLayout}
                            onClickClearLayout={this.handleClickClearLayout}
                            onSelectLayout={this.handleSelectLayout}
                            onCloseLayoutModal={this.handleCloseLayoutModal} />
                    </InputForm.Row>
                    <InputForm.Row>
                        <BackImageCol
                            hideButtons={isReadOnly}
                            backgroundImage={backgroundImage}
                            backgroundImageUrl={editingInfo.backgroundImageUrl}
                            isReadOnly={!isEditMode}
                            showModal={showImageModal}
                            onChangeShow={this.handleChangeImageModalShow}
                            onClearImage={this.handleClearImage}
                            onSelectImage={this.handleSelectImage}
                        />
                        <MaskImageCol
                            hideButtons={isReadOnly}
                            backgroundMaskImage={backgroundMaskImage}
                            backgroundMaskImageUrl={editingInfo.backgroundMaskImageUrl}
                            isReadOnly={!isEditMode}
                            showModal={showMaskModal}
                            onChangeShow={this.handleChangeMaskImageModalShow}
                            onSelectImage={this.handleSelectMaskImage}
                            onClearMaskImage={this.handleClearMaskImage}
                        />
                    </InputForm.Row>
                    <InputForm.Row>
                        <LocationCol
                            hideButtons={isReadOnly}
                            showModal={showLocationModal}
                            locationList={locationList}
                            location={location}
                            isReadOnly={!isEditMode}
                            onChange={this.handleChangeLocation}
                            onChangeShow={this.handleChangeLocationModalShow}
                        />
                    </InputForm.Row>
                    <MessageModal {...messageModalInfo} onCancel={() => { this.setState({ messageModalInfo: INIT_MODAL_INFO }) }} />
                </InputForm>
            </GarmitBox>
        );
    }
}

LayoutSettingBox.propTypes = {
    isReadOnly: PropTypes.bool, //読み取り専用ユーザーかどうか
    layoutList: PropTypes.array,
    layoutInfo: PropTypes.object,
    locationList: PropTypes.array,
    editingInfo: PropTypes.object,
    isLoading: PropTypes.bool,
    isEditMode: PropTypes.bool
};

//#region SFC
/**
* レイアウト名称カラム
*/
const LayoutNameCol = ({ layoutName, validationState, isReadOnly, onChange: handleChange }) => {
    return (
        <InputForm.Col label="名称" columnCount={2} isRequired={true}>
            <TextForm maxlength={30} value={layoutName} validationState={validationState.state} helpText={validationState.helpText} isReadOnly={isReadOnly} onChange={handleChange} />
        </InputForm.Col>
    );
}

/**
* 親レイアウトカラム
*/
const ParentLayoutCol = (props) => {
    const { hideButtons, parent, isReadOnly, layoutList, showLayoutModal } = props;
    const { onClickSelectLayout: handleClickSelectLayout, onClickClearLayout: handleClickClear } = props;
    const { onSelectLayout: handleSelectLayout, onCloseLayoutModal: handleCloseLayoutModal } = props;

    return (
        <InputForm.Col label="親レイアウト" columnCount={2} isRequired={false}>
            <div className='flex-center-end'>
                <LabelForm value={_.get(parent, "layoutName")} />
                {!hideButtons &&
                    <div style={{ float: 'left' }}>
                        <LayoutSelectCircleButton disabled={isReadOnly} className='mr-05' onClick={handleClickSelectLayout} />
                        <RemoveCircleButton disabled={isReadOnly} onClick={handleClickClear} />
                    </div>
                }
            </div>
            <LayoutSelectModal
                layoutList={layoutList}
                showModal={showLayoutModal}
                selectedLayout={parent}
                onSelect={handleSelectLayout}
                onCancel={handleCloseLayoutModal}
            />
        </InputForm.Col>
    );
}

/**
* 背景図カラム
*/
const BackImageCol = (props) => {
    const { hideButtons, backgroundImage, backgroundImageUrl, isReadOnly, showModal } = props;
    const { onChangeShow: handleChangeShow, onClearImage: handleClearImage } = props;
    const { onSelectImage: handleSelectImage } = props;
    return (
        <InputForm.Col label="背景図" columnCount={2} isRequired={false}>
            <div className="flex-center-end">
                <LabelForm value={backgroundImage} />
                {!hideButtons &&
                    <div style={{ float: 'left' }}>
                        <ImageSelectCircleButton disabled={isReadOnly} className='mr-05' onClick={handleChangeShow.bind(this, true)} />
                        <RemoveCircleButton disabled={isReadOnly} onClick={handleClearImage} />
                    </div>
                }
            </div>
            <ImageSelectModal
                showModal={showModal}
                selected={{ fileName: backgroundImage, url: backgroundImageUrl }}
                onClose={handleChangeShow.bind(this, false)}
                onApply={handleSelectImage}
            />
        </InputForm.Col>
    );
}

/**
* マスク画像カラム
*/
const MaskImageCol = (props) => {
    const { hideButtons, backgroundMaskImage, backgroundMaskImageUrl, isReadOnly, showModal } = props;
    const { onChangeShow: handleChangeShow, onClearMaskImage: handleClearMaskImage } = props;
    const { onSelectImage: handleSelectImage } = props;

    return (
        <InputForm.Col label="マスク画像" columnCount={2} isRequired={false}>
            <div className="flex-center-end">
                <LabelForm value={backgroundMaskImage} />
                {!hideButtons &&
                    < div style={{ float: 'left' }}>
                        <ImageSelectCircleButton disabled={isReadOnly} className='mr-05' onClick={handleChangeShow.bind(this, true)} />
                        <RemoveCircleButton disabled={isReadOnly} onClick={handleClearMaskImage} />
                    </div>
                }
            </div>
            <ImageSelectModal
                showModal={showModal}
                selected={{ fileName: backgroundMaskImage, url: backgroundMaskImageUrl }}
                onClose={handleChangeShow.bind(this, false)}
                onApply={handleSelectImage}
            />
        </InputForm.Col>
    );
}

/**
* ロケーションカラム
*/
const LocationCol = ({ hideButtons, showModal, locationList, location, isReadOnly, onChange: handleChange, onChangeShow: handleChangeShow }) => {
    return (
        <InputForm.Col label="ロケーション" columnCount={2} isRequired={false}>
            <div className="flex-center-end">
                <LabelForm value={location && location.name} />
                {!hideButtons &&
                    < div style={{ float: 'left' }}>
                        <LocationSelectCircleButton disabled={isReadOnly} className='mr-05' onClick={handleChangeShow.bind(this, true)} />
                        <RemoveCircleButton disabled={isReadOnly} onClick={handleChange.bind(this, null)} />
                    </div>
                }
            </div>
            <LocationSelectModal
                showModal={showModal}
                checkbox={false}
                separateCheckMode={true}
                locationList={locationList}
                selectedLocation={location}
                onSubmit={handleChange}
                onCancel={handleChangeShow.bind(this, false)}
            />
        </InputForm.Col>
    );
}
//#endregion