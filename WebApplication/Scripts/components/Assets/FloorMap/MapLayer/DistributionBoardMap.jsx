/**
 * Copyright 2017 DENSO Solutions
 * 
 * 分電盤図表示レイヤ Reactコンポーネント
 *  
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import ElecFacilityObjectGroup from 'Assets/FloorMap/ElecFacilityObjectGroup.jsx';
import BreakerObjectGroup from 'Assets/FloorMap/BreakerObjectGroup.jsx';

const COL_NUMBER = 6;   //電源設備ポイントを１行に並べる数
const BLANK_SPACE_HEIGHT = 15;  //電源設備エリアとブレーカーエリアの間のスペースの高さ


/**
 * 分電盤図表示レイヤ
 * @param {object} eGroupInfo 電源系統オブジェクト情報
 * @param {array} valueLabelData 電源系統に紐づくポイントの計測値情報
 * @param {object} size 描画エリアのオリジナルのサイズ
 */
export default class DistributionBoardMap extends Component {

    constructor(props) {
        super(props);

        const { eGroupInfo, valueLabelData, size } = this.props;
        //電源系統ポイント情報を取得する
        const pointData = this.setObjectWithValueInfo(valueLabelData, eGroupInfo)
        //電源系統オブジェクト配置情報を取得する
        const objectInfo = this.getPlacementInfo(eGroupInfo, size);

        this.state = {
            elecFacilitiesWithValue: pointData.elecFacilitiesWithValue,
            breakersWithValue: pointData.breakersWithValue,
            elecFacilityTableSize: this.assignFacilityTableSize(pointData.elecFacilitiesWithValue),   //電源設備エリアの行・列数
            breakerTableSize: this.extractMaxXYNumber(pointData.breakersWithValue), //ブレーカーテーブルの行・列数
            areaRatio: objectInfo.areaRatio,
            breakerStartPosition: objectInfo.breakerStartPosition,
           
        };
    }

    /**
     * コンポーネントが新しいpropsを受け取ると実行される
     */
    componentWillReceiveProps(nextProps) {
        //異なるインスタンスでも中身が同じであれば再計算しない
        var nextValueLabelData = JSON.stringify(nextProps.valueLabelData);
        var valueLabelData = JSON.stringify(this.props.valueLabelData);

        //新たな分電盤が選択された場合はポイント情報と配置情報を更新する
        if (nextProps.eGroupInfo && this.props.eGroupInfo !== nextProps.eGroupInfo) {
            this.setState(this.setObjectWithValueInfo(nextProps.valueLabelData, nextProps.eGroupInfo));
            this.setState(this.getPlacementInfo(nextProps.eGroupInfo, nextProps.size));
        }
        else if (nextValueLabelData !== valueLabelData) {   //値情報が更新されている場合、ポイント情報を更新する
            this.setState(this.setObjectWithValueInfo(nextProps.valueLabelData, nextProps.eGroupInfo));
        }
    }

    /**
    * コンポーネントをアップデートするかどうか
    */
    shouldComponentUpdate(nextProps, nextState) {
        //異なるインスタンスでも中身が同じであればアップデートしない
        var nextDataJSON = JSON.stringify(nextProps);
        var dataJSON = JSON.stringify(this.props);

        if (nextDataJSON !== dataJSON) {
            return true;
        }
    }

    /**
     * ブレーカーオブジェクトクリックイベント
     */
    handleClickBreaker(selectedObject, selectItemInfo) {
        if (this.props.onClickBreakerObject) {
            this.props.onClickBreakerObject(selectedObject, selectItemInfo);
        }
    }

    /**
     * render
     */
    render() {
        const { eGroupInfo, valueLabelData, size, isBreakerSelectable } = this.props;
        const { width, height } = size;
        const { elecFacilitiesWithValue, breakersWithValue, areaRatio, breakerStartPosition, elecFacilityTableSize, breakerTableSize } = this.state;

        if (_.size(elecFacilitiesWithValue) > 0 || _.size(breakersWithValue) > 0) {
            return (
                <g id="DistributionBoardMap">
                    <ElecFacilityObjectGroup
                        areaSize={{ width: width, height: areaRatio.facility }}
                        items={elecFacilitiesWithValue}
                        tableSize={elecFacilityTableSize}
                    />
                    <BreakerObjectGroup
                        isBreakerSelectable={isBreakerSelectable}
                        items={breakersWithValue}
                        startPosition={breakerStartPosition}
                        areaSize={{ width: width, height: areaRatio.breaker }}
                        tableSize={breakerTableSize}
                        onClickBreakerObject={(selectedObject, selectItemInfo) => this.handleClickBreaker(selectedObject, selectItemInfo)}
                    />
                </g>
            );
        }
        else {
            return <text x={width / 2} y={height / 2} textAnchor="middle">電源系統情報が登録されていません</text>
        }
    }

    /**
    * 電源系統オブジェクト情報に計測値情報をマージしたデータをセットする
    */
    setObjectWithValueInfo(valueLabelData, eGroupInfo) {
        //電源系統情報に測定値情報をくっつける
        const elecFacilitiesWithValue = this.margeElecFacilitiesValue(eGroupInfo.elecFacilities, valueLabelData);
        const breakersWithValue = this.margeBreakersValue(eGroupInfo.breakers, valueLabelData);

        return {
            elecFacilitiesWithValue: elecFacilitiesWithValue,
            breakersWithValue: breakersWithValue,
            elecFacilityTableSize: this.assignFacilityTableSize(elecFacilitiesWithValue),
            breakerTableSize: this.extractMaxXYNumber(breakersWithValue)
        };
    }

    /**
  　* 電源系統オブジェクト配置情報をセットする
    */
    getPlacementInfo(eGroupInfo, size) {
        //電源設備ポイントの数から電源設備オブジェクトの行数を計算する
        const elecFacilitiesMaxIndex = eGroupInfo.elecFacilities.length > 0 ? Math.max(...eGroupInfo.elecFacilities.map((x) => x.index)) : 0;
        const elecFacilityRow = this.calcElecfacilityRow(elecFacilitiesMaxIndex);
        const areaRatio = this.assignAreaRatio(elecFacilityRow, size);
        const breakerStartPosition = { x: 0, y: areaRatio.facility + BLANK_SPACE_HEIGHT };
        return {
            areaRatio: areaRatio,
            breakerStartPosition: breakerStartPosition,
        };
    }

    /**
     * ElecFacilitiesに計測値情報をマージ
     */
    margeElecFacilitiesValue(elecFacilities, valueLabelData) {
        let updateElecFacilities = _.cloneDeep(elecFacilities);
        if (updateElecFacilities) {
            for (var i = 0; updateElecFacilities.length > i; i++) {
                const targetPointInfo = updateElecFacilities[i].point;
                const matchValue = this.searchMatchPointInfo(targetPointInfo, valueLabelData);
                if (matchValue) {
                    updateElecFacilities[i].hasValue = true;
                    const dateValuePairs = Object.assign({}, matchValue.dateValuePairs[0]);
                    updateElecFacilities[i].displayString = dateValuePairs.displayString;
                    updateElecFacilities[i].scaledValue = dateValuePairs.scaledValue;
                    updateElecFacilities[i].alarmClassName = matchValue.alarmClassName;
                    updateElecFacilities[i].format = matchValue.format;
                    updateElecFacilities[i].unit = matchValue.unit;
                }
                else {
                    updateElecFacilities[i].hasValue = false;
                }
            }
        }
        return updateElecFacilities;
    }

    /**
     * ブレーカー情報に計測値情報をマージ
     */
    margeBreakersValue(breakers, valueLabelData) {
        let updateBreakers = _.cloneDeep(breakers);
        if (updateBreakers) {
            for (var i = 0; updateBreakers.length > i; i++) {
                const targetPoints = updateBreakers[i].points;
                const matchValue = this.searchMatchPointInfo(targetPoints[0], valueLabelData);
                if (matchValue) {
                    updateBreakers[i].hasValue = true;
                    const dateValuePairs = Object.assign({}, matchValue.dateValuePairs[0]);
                    updateBreakers[i].displayString = dateValuePairs.displayString;
                    updateBreakers[i].scaledValue = dateValuePairs.scaledValue;
                    updateBreakers[i].alarmClassName = matchValue.alarmClassName;
                    updateBreakers[i].format = matchValue.format;
                    updateBreakers[i].unit = matchValue.unit;
                }
                else {
                    updateBreakers[i].hasValue = false;
                }
            }
        }
        return updateBreakers;
    }

    /**
     * 電源設備オブジェクトの行数を計算する
     * @param facilitiesNum 紐づいている電源設備ポイントの数
     */
    calcElecfacilityRow(facilitiesNum) {
        if (facilitiesNum % COL_NUMBER === 0) {
            return facilitiesNum / COL_NUMBER;
        }
        else {
            return Math.ceil(facilitiesNum / COL_NUMBER);
        }
    }

    /**
     * 電源設備エリアとブレーカーエリアの比率を割り当てる
     */
    assignAreaRatio(elecFacilityRow, size) {
        return {
            facility: size.height * (elecFacilityRow / 9),
            breaker: size.height * (1 - elecFacilityRow / 9) - BLANK_SPACE_HEIGHT
        }
    }

    /**
     * ポイント情報が一致する電源系統情報を探す
     */
    searchMatchPointInfo(targetPointInfo, valueLabelData) {
        if (!valueLabelData || valueLabelData.length === 0 || !targetPointInfo) {
            return null;
        }
        return (valueLabelData.find((data) => {
            return data.point.pointNo === targetPointInfo.pointNo;
        }));
    }

    /**
     * 電源設備オブジェクトの行数と列数を割り当てる
     * @param {array} elecFacilitiesWithValue 電源系統オブジェクト情報
     */
    assignFacilityTableSize(elecFacilitiesWithValue) {
        //トータル行数と１列に並べる数からサイズを決定する
        const totalRow = (elecFacilitiesWithValue && elecFacilitiesWithValue.length > 0) ?
            Math.ceil(Math.max(...elecFacilitiesWithValue.map((x) => x.index)) / COL_NUMBER) : 0;

        return { col: COL_NUMBER, row: totalRow };
    }

    /**
     * アイテムリストの位置の中から行数・列数の最大値を取り出す
     */
    extractMaxXYNumber(items) {
        let maxCol = 0;
        let maxRow = 0;
        for (var i = 0; _.size(items) > i; i++) {
            if (maxCol < items[i].position.x) {
                maxCol = items[i].position.x;
            }
            if (maxRow < items[i].position.y) {
                maxRow = items[i].position.y;
            }
        }
        return { col: maxCol, row: maxRow };

    }
}

DistributionBoardMap.propTypes = {
    isBreakerSelectable: PropTypes.bool,
    eGroupInfo: PropTypes.object,
    valueLabelData: PropTypes.object,
    size: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number
    }),
    onClickBreakerObject: PropTypes.func
};

DistributionBoardMap.defaultProps = {
    isBreakerSelectable: false
}

