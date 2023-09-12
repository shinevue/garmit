/**
 * @license Copyright 2017 DENSO
 * 
 * LocationOverlaySelector Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Overlay, Popover, ButtonToolbar, Clearfix} from 'react-bootstrap';
import Icon from 'Common/Widget/Icon';
import LocationTreeView from 'Assets/TreeView/LocationTreeView';
import LocationBreadcrumb from '../LocationBreadcrumb';
import { FloorMapToolTipButton } from 'Assets/GarmitButton';

import FloorMapSelectModal from 'Assets/Modal/FloorMapSelectModal';

/**
 * ロケーション選択パネル
 * @param {array} locationList ロケーションリスト
 * @param {array} layoutList レイアウトリスト
 * @param {object} selectedLocation 選択中のロケーション
 * @param {object} selectedLayoutObject 選択中のレイアウトオブジェクト
 * @param {function} onSelect ロケーション選択時に呼び出す
 * @param {function} container オーバーレイのコンテナ
 * @param {boolean} isRightJustified 右寄せにするかどうか（falseの場合は左寄せ）
 * @param {boolean} isInlineBreadcrumb ロケーションパンくずリストをインライン表示とするか。インラインでない場合は縦に並ぶ
 * @param {boolean} isReadOnly 読取り専用かどうか
 * @param {boolean} isLoading ロード中かどうか
 */
export default class LocationOverlaySelector extends Component {
    
    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        this.target = null;
        this.locationPanel = null;
        this.overleyPanel = null;
        this.state = {
            show: false,
            showFloorMapModal: false
        };
    }

    /**
     * フロアマップボタン
     * @param {boolean} isReadOnly 読み取り専用かどうか
     */
    floorMapButton(isReadOnly) {
        return (
            <FloorMapToolTipButton 
                onClick={() => this.showFloorMapModal()}
                disabled={isReadOnly}
            />
        )
    }

    /**
     * ロケーション選択ボタン
     * @param {boolean} isPullRight 右寄せかどうか
     * @param {boolean} isReadOnly 読み取り専用かどうか
     */
    locationButton (isPullRight, isReadOnly) {
        return (
            <Button ref={(ref) => { this.target = ref }}
                    className={isPullRight?'ml-0 mr-05':'ml-05'}
                    onClick={(e) => this.toggle(e)}
                    disabled={isReadOnly}
            >
                <Icon className={'fas fa-play' + (isPullRight?' fa-rotate-180':'')} />
            </Button>
        )
    }

    /**
     * ロケーション選択のラベル
     * @param {boolean} isPullRight 右寄せかどうか
     */
    locationLabel (isPullRight) {
        return (
            <span className={'button-inline-span' + (isPullRight?' mr-05':' ml-05')} >ロケーション選択</span>
        );
    }

    /**
     * ロケーション選択コンポーネント
     * @param {boolean} isRightJustified 右寄せかどうか
     * @param {boolean} hasLayouts レイアウトがあるかどうか
     * @param {boolean} isReadOnly 読み取り専用かどうか
     */
    setComponents(isRightJustified, hasLayouts, isReadOnly){
        var components = [];
        if (isRightJustified) {
            components.push(this.locationLabel(isRightJustified, isReadOnly));
            components.push(this.locationButton(isRightJustified, isReadOnly));
            hasLayouts && components.push(this.floorMapButton(isReadOnly));
        } else {
            hasLayouts && components.push(this.floorMapButton(isReadOnly));
            components.push(this.locationButton(isRightJustified, isReadOnly));
            components.push(this.locationLabel(isRightJustified, isReadOnly));
        }
        return components;
    }

    /**
     * render
     */
    render() {
        const { container, hideBreadcrumb, isRightJustified, locationList, selectedLocation, layoutList, selectedLayoutObject, isReadOnly, isLoading } = this.props;
        const { show, showFloorMapModal } = this.state;
        const hasLayouts = layoutList && layoutList.length > 0;
        return (
            <div ref={(ref) => { this.locationPanel = ref }} className={'location-select' + (hideBreadcrumb?' mt-05':'')}>
                {isRightJustified?
                    <div className='pull-right'>
                        {this.setComponents(isRightJustified, hasLayouts, isReadOnly)}
                    </div>
                    :
                    this.setComponents(isRightJustified, hasLayouts, isReadOnly)
                }
                {isRightJustified&&<Clearfix />}
                {!hideBreadcrumb&&selectedLocation.position.length > 0&&<LocationBreadcrumb locationList={selectedLocation.position} />}
                <Overlay show={show} 
                         target={this.target}   
                         placement={isRightJustified?"left":"right"}
                         container={container||this}
                         containerPadding={20}
                         rootClose
                         onEntering={() => this.locationPanelEntering()}
                         onHide={() => this.locationPanelHide()}>
                    <div ref={(ref) => { this.overleyPanel = ref }}
                         className='overlay-right-panel' >
                        <LocationTreeView 
                            locationList={locationList} 
                            selectedLocation={selectedLocation.location} 
                            showCheckbox={false} 
                            maxHeight={600} 
                            showAllExpandButton={true} 
                            onLocationSelect={(value, position) => this.handleSelect(value, position) } 
                        />
                    </div>
                </Overlay>
                <FloorMapSelectModal 
                    showModal={showFloorMapModal}
                    isLoading={isLoading}
                    idKey={!isRightJustified?1:2}
                    layoutList={layoutList}
                    selectedLayoutObject={selectedLayoutObject}
                    onApply={(layoutObject) => this.handleSelectLayoutObject(layoutObject)}
                    onCancel={() => this.hideFloorMapModal()} 
                />
            </div>
        );
    }
    
    /**
     * ロケーション選択イベント発生
     * @param {object} value 選択したロケーション
     * @param {array} position ロケーションの位置
     * @param {object} layoutObject レイアウトオブジェクト
     */
    onSelect(value, position, layoutObject){
        if (this.props.onSelect) {
            this.props.onSelect(value, position, layoutObject);
        }
    }

    //#region ロケーションパネル

    /**
     * ロケーションパネルの表示切替
     */
    toggle(e){
        this.setState({
            show : !(this.state.show),
        });
    }

    /**
     * ロケーションパネルを閉じたときのイベント
     */
    locationPanelHide(){
        this.setState({
            show : false
        });
    }

    /**
     * ロケーションパネルの遷移を開始するイベント
     */
    locationPanelEntering(){
        var element = this.overleyPanel;
        var top = this.getLocationPanelTopPosition();
        if (element&&top) {
            //縦の位置を変更する（パネルの真ん中の位置で表示されてしまうため）
            element.style.top = top + 'px';     
            element.positiontop = top;
        }
    }

    /**
     * ロケーション選択イベントハンドラ
     * @param {object} value 選択したロケーション
     * @param {array} position ロケーションの位置
     */
    handleSelect(value, position){
        this.locationPanelHide();       //ロケーションパネルを閉じる
        this.onSelect(value, position, null);
    }

    /**
     * ロケーションパネルの縦位置を取得する
     */
    getLocationPanelTopPosition(){
        //ロケーションパネル全体のTOP位置を取得
        var element = this.locationPanel;
        var rect = element.getBoundingClientRect();
        var offset = (window.pageYOffset !== undefined) ? 
                        window.pageYOffset 
                    : 
                        (document.documentElement || document.body.parentNode || document.body).scrollTop;
        return rect.top + offset;
    }

    //#endregion

    //#region フロアマップ選択モーダル関連

    /**
     * レイアウトオブジェクト選択イベント
     * @param {object} layoutObject 選択したレイアウトオブジェクト
     */
    handleSelectLayoutObject(layoutObject) {
        this.hideLocationPanelAndFloorMapModal();
        const location = _.cloneDeep(layoutObject.location);
        location.isAllowed = layoutObject.isAllowed;
        this.onSelect(location, null, layoutObject);
    }

    /**
     * ロケーションパネルとフロアマップ選択モーダルを閉じる
     */
    hideLocationPanelAndFloorMapModal() {        
        this.setState({
            show : false,
            showFloorMapModal: false
        });
    }

    /**
     * フロアマップ選択モーダルを表示する
     */
    showFloorMapModal() {
        this.setState({
            showFloorMapModal: true
        })
    }

    /**
     * フロアマップ選択モーダルを閉じる
     */
    hideFloorMapModal() {
        this.setState({
            showFloorMapModal: false
        })
    }

    //#endregion

}

LocationOverlaySelector.propTypes = {
    locationList: PropTypes.arrayOf(
        PropTypes.shape({
            locationId: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            children: PropTypes.arrayOf(PropTypes.object),
            isChecked: PropTypes.bool,
            dispIndex: PropTypes.number,
            isRack: PropTypes.bool
        })
    ),
    selectedLocation: PropTypes.shape({
        locationId: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        children: PropTypes.arrayOf(PropTypes.object),
        isChecked: PropTypes.bool,
        dispIndex: PropTypes.number,
        isRack: PropTypes.bool,
        position: PropTypes.arrayOf({
            id: PropTypes.number.isRequired,
            name: PropTypes.string.isRequired
        })
    }),
    layoutList: PropTypes.array,
    selectedLayoutObject: PropTypes.object,
    onSelect: PropTypes.func,
    container: PropTypes.object,
    isRightJustified: PropTypes.bool,
    isInlineBreadcrumb: PropTypes.bool,
    isReadOnly: PropTypes.bool,
    isLoading: PropTypes.bool
}