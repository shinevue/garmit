/**
 * Copyright 2017 DENSO Solutions
 * 
 * LocationForm Reactコンポーネント
 *  
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import LocationSelectModal from 'Assets/Modal/LocationSelectModal';
import ChipForm from 'Assets/Condition/ChipForm';
import LabelForm from 'Common/Form/LabelForm';
import TextForm from 'Common/Form/TextForm';

/**
 * LocationForm
 * @param {array} locationList ロケーションツリーに表示するロケーションのリスト
 * @param {array} selectedLocationIds 選択中のロケーションのID
 */
export default class LocationForm extends Component {

    constructor(props) {
        super(props);

        const { checkedLocations, locationList, separateCheckMode } = props;
        this.state = {
            showModal: false,
            checkedAllLocations: separateCheckMode ? checkedLocations : this.getCheckedAllLocations(checkedLocations, locationList)
        }
    }

    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps( nextProps ){
        if (nextProps.checkedLocations !== this.props.checkedLocations) {
            this.setState({ 
                checkedAllLocations: nextProps.separateCheckMode ?
                        nextProps.checkedLocations
                        :
                        this.getCheckedAllLocations(nextProps.checkedLocations, nextProps.locationList) 
                        
            });
        }
    }

    /**
     * 全チェックロケーションを取得する
     * @param {array} targetLocations チェック対象のロケーションリスト（配列）
     * @param {array} allLocations 全ロケーションリスト（階層構造）
     */
    getCheckedAllLocations(targetLocations, allLocations) {
        var locations = this.getParentLocations(targetLocations, allLocations);
        locations.concat(this.getChildrenLocations(targetLocations));
        return locations;
    }

    /**
     * 親ノードのチェックロケーションを取得する（自分時自身も含む）
     * @param {array} targetLocations チェック対象のロケーションリスト（配列）
     * @param {array} allLocations 全ロケーションリスト（階層構造）
     */
    getParentLocations(targetLocations, allLocations){
        var locations = Object.assign([], targetLocations);
        if (Array.isArray(allLocations)) {
            allLocations.forEach((location) => {
                const { children } = location;
                if (children && children.length > 0) {
                    locations = this.getParentLocations(locations, location.children);
                    if (children.every((child) => locations.some((loc) => loc.locationId === child.locationId)) &&
                        !locations.some((loc) => loc.locationId === location.locationId)) {
                        locations.push(location);
                    }
                }
            });
        }
        return locations;
    }

    /**
     * 子ロケーションを取得する（自分時自身は含まない）
     * @param {array} targetLocations 対象ロケーションリスト
     */
    getChildrenLocations(targetLocations) {
        var locations = [];
        targetLocations.forEach((location) => {
            const { children } = location;
            if (children && children.length > 0) {
                locations.concat(this.getChildrenLocations(children));      //再帰処理
            }
        });
        return locations;
    }

    /**
     * 適用ボタンクリック
     * @param {any} val
     */
    handleSubmit(val) {
        this.setState({ showModal: false });
        this.props.onChange(val)
    }

    /**
     * タグ「×」ボタンクリック
     * @param {any} id
     */
    handleRemoveTag(id) {
        const { checkedLocations, separateCheckMode } = this.props;
        const { checkedAllLocations } = this.state;
        const removeIds = [id];
        var target = checkedLocations.find((loc) => loc.locationId === id);
        if (!target) {
            target = checkedAllLocations.find((loc) => loc.locationId === id);
        }

        if (!separateCheckMode) {
            Array.prototype.push.apply(removeIds, this.getUnderLocationIds(target));
        }

        const removedList = this.removeLocations(checkedLocations, removeIds);
        this.props.onChange(removedList);
    }

    /**
     * フォームに表示するタグリストを生成
     */
    createChipList() {
        var displayList;
        if (this.props.separateCheckMode) {
            displayList = this.state.checkedAllLocations;
        } else {
            const childrenIds = [];
            this.state.checkedAllLocations.forEach((loc) => {
                const location = this.getLocation(loc.locationId, this.props.locationList);
                Array.prototype.push.apply(childrenIds, this.getChildrenLocationIds(location));
            });
            displayList = this.removeLocations(this.state.checkedAllLocations, childrenIds);
        }

        return displayList.map((loc) => {
            return { id: loc.locationId, name: this.createDisplayString(loc) }
        });        
    }

    /**
     * ロケーションの表示用文字列を生成する
     * @param {any} location
     */
    createDisplayString(location) {
        let displayString = location.name;
        let tmpLoc = location;

        while (tmpLoc.parent) {
            tmpLoc = tmpLoc.parent;
            displayString = tmpLoc.name + ' / ' + displayString;
        }

        return displayString;
    }

    /**
     * IDからロケーションを探して取得
     * @param {any} id
     * @param {any} locations
     */
    getLocation(id, locations) {
        for (let i = 0; i < locations.length; i++) {
            if (locations[i].locationId === id) {
                return locations[i];
            } else if (locations[i].children && locations[i].children.length) {
                const location = this.getLocation(id, locations[i].children);
                if (location) {
                    return location;
                }
            }
        }
    }

    /**
     * ターゲットのロケーションの子ロケーションのIDを取得
     * @param {any} location
     */
    getChildrenLocationIds(location) {
        if (!location.children) {
            return [];
        }

        return location.children.map((loc) => loc.locationId);
    }

    /**
     * ターゲットのロケーションの配下にあるロケーションのIDを取得
     * @param {any} location
     */
    getUnderLocationIds(location) {
        if (!location.children) {
            return [];
        }

        const underLocIds = []
        location.children.forEach((loc) => {
            if (loc.children) {
                loc.children.forEach((child) => {
                    const ids = this.getUnderLocationIds(child);
                    Array.prototype.push.apply(underLocIds, ids);
                    underLocIds.push(child.locationId);
                })
            }
            underLocIds.push(loc.locationId);
        })
        return underLocIds;
    }

    /**
     * IDで指定したロケーションをリストから削除したロケーションリストを返す
     * @param {any} locations (ツリー構造ではない)
     * @param {any} ids IDのリスト
     */
    removeLocations(locations, ids) {
        return locations.filter((loc) => (ids.indexOf(loc.locationId) === -1));
    }

    /**
     * アドオンボタンを取得
     * @param {boolean} clearButton クリアボタンを表示するか
     */
    getAddonButtons(clearButton) {
        var buttons = [{
            key: 'select',
            iconId: 'location-select',
            isCircle: true,
            tooltipLabel: 'ロケーション選択',
            onClick: () => this.setState({ showModal: true })
        }];
        
        clearButton && buttons.push({
            key: 'clear',
            buttonIconClass: 'fal fa-eraser',
            bsStyle: "lightgray",
            isCircle: true,
            tooltipLabel: 'クリア',
            onClick: () => this.props.onChange(null)
        });

        return buttons;
    }

    /**
     * render
     */
    render() {
        const { multiple, locationList, selectedLocation, checkedLocations, validationState, helpText, search, disabled, separateCheckMode, label, clearButton } = this.props
        const { showModal } = this.state

        return (
            <div className={this.props.className}>
                <LocationSelectModal
                    showModal={showModal}
                    locationList={locationList}
                    selectedLocation={selectedLocation}
                    checkedLocations={checkedLocations}
                    checkbox={multiple}
                    defaultCollapse={true}
                    searchable={true}
                    separateCheckMode={separateCheckMode}
                    onSubmit={(val) => this.handleSubmit(val)}
                    onCancel={() => this.setState({ showModal: false })}
                />
                {multiple ?
                    <ChipForm
                        disabled={disabled}
                        chips={this.createChipList()}
                        removeButton={true}
                        onRemoveClick={(id) => this.handleRemoveTag(id)}
                        onClick={search && (() => this.setState({ showModal: true }))}
                        validationState={validationState}
                        helpText={helpText}
                        addonButton={!search && {
                            iconId: 'location-select',
                            isCircle: true,
                            tooltipLabel: 'ロケーション選択',
                            onClick: () => this.setState({ showModal: true })
                        }}
                    />
                    :
                    <LabelForm
                        label={label}
                        likeTextForm={search}
                        disabled={disabled}
                        value={selectedLocation && this.createDisplayString(selectedLocation)}
                        onClick={() => this.setState({ showModal: true })}
                        validationState={validationState}
                        helpText={helpText}
                        addonButton={!disabled && this.getAddonButtons(clearButton)}
                    />
                    
                }
            </div>
        )
    }
}

LocationForm.propTypes = {
    multiple: PropTypes.bool,
    onChange: PropTypes.func,
    locationList: PropTypes.array,
    checkedLocations: PropTypes.array,
    selectedLocation: PropTypes.object,
    validationState: PropTypes.string,
    helpText: PropTypes.string,
    separateCheckMode: PropTypes.bool,
    clearButton: PropTypes.bool
}

LocationForm.defaultProps = {
    multiple: false,
    onChange: () => { },
    locationList: [],
    checkedLocations: [],
    clearButton: false
}