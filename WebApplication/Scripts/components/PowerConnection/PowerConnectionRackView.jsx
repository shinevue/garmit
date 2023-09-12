/**
 * @license Copyright 2018 DENSO
 * 
 * 電源接続ラックビューコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import RackTable from 'Assets/RackView/RackTable';
import { locationTreeToArray } from 'locationBreadcrumb';

/**
 * 電源接続ラックビューコンポーネント
 */
export default class PowerConnectionRackView extends Component {

    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        this.state = {
            selectTabIndex: 0,
            highlightUnits: null
        }
    }

    /**
     * 新たなPropsを受け取ったときに実行
     */
    componentWillReceiveProps(nextProps) {
        if (this.props.selectBreaker !== nextProps.selectBreaker) { //選択ブレーカー変更時
            this.setState({ highlightUnits: this.getAllUnitsInfo(nextProps.selectBreaker), selectTabIndex: 0 });
        }
    }

    /**
     * 全接続先ラック情報を配列で取得
     */
    getAllUnitsInfo(selectBreaker) {
        const unitList = _.get(selectBreaker, "rackPowerConnectedUnitList");
        let highlightUnits = [];
        if (unitList) {
            highlightUnits = _.flatMap(unitList, (info) => { return info.units });
        }
        return highlightUnits;
    }

    /**
     * ラック名称タブクリックイベント
     */
    handleClickRackPowerTab = (rackPower, index) => {
        if (index !== 0) {
            this.setState({ highlightUnits: rackPower.units, selectTabIndex: index });
        }
        else {  //「全て」選択時
            this.setState({ highlightUnits: this.getAllUnitsInfo(this.props.selectBreaker), selectTabIndex: index });
        }
    }

    /**
     * render
     */
    render() {
        const { selectBreaker, isLeft } = this.props;
        const { selectTabIndex, highlightUnits } = this.state;
        let location = null;

        if (selectBreaker) {
            if (_.get(selectBreaker, "connectedRack.location")) {
                location = selectBreaker.connectedRack.location;
            }
            return (
                <div className="flex-top-left">
                    <RackTable
                        rack={_.get(selectBreaker, "connectedRack")}
                        isReadOnly={true}
                        highlightUnits={highlightUnits}
                        showLocation={true}
                        location={location && locationTreeToArray(location, [])}
                        isLeft={isLeft}
                        emptyRackMessage="電源に紐づくラックがありません。"
                    />
                    <div>
                        {_.size(_.get(selectBreaker, "rackPowerConnectedUnitList")) > 0 &&
                            <NameTagGroup
                                isLeft={isLeft}
                                unitList={selectBreaker.rackPowerConnectedUnitList}
                                selectTabIndex={selectTabIndex}
                                onClick={this.handleClickRackPowerTab}
                            />
                        }
                    </div>
                </div>
            );
        }
        else {
            return <div />
        }
    }

}

PowerConnectionRackView.propTypes = {
    selectBreaker: PropTypes.shape({
        connectedRack: PropTypes.shape({
            rackName: PropTypes.string   //選択ブレーカーに紐づいているラック情報
        }),
        rackPowerConnectedUnitList: PropTypes.shape({
            rackPower: PropTypes.obj,   //選択ブレーカーに紐づいているラック電源情報
            units: PropTypes.array,     //接続先ユニット情報
        }),
    }),
    isLeft: PropTypes.bool  //左側ラックフラグ
}


/**
* ラック電源名称タググループ
*/
const NameTagGroup = ({ isLeft, unitList, selectTabIndex, onClick: handleClick }) => {
    let tabList = _.cloneDeep(unitList);
    tabList.unshift({ rackPower: { name: "全て" } });
    const unitPartitionList = _.chunk(tabList, 5); //5個ずつに分ける（1行分）

    return (
        <div className="flex-top-left">
            {unitPartitionList.map((info, index) => {
                return <NameTagRow rowIndex={index} selectTabIndex={selectTabIndex} rowInfo={info} isLeft={isLeft} onClick={handleClick} />
            })}
        </div>
    );
}

/**
* ラック電源名称タグ行
*/
const NameTagRow = ({ selectTabIndex, rowIndex, rowInfo, isLeft, isSelect, onClick: handleClick }) => {
    return (
        <div className="flex-column">
            {rowInfo.map((info, index) => {
                const originalIndex = index + rowIndex * 5; //元の接続先ユニット配列（rackPowerConnectedUnitList）でのインデックス
                return (
                    <div
                        className={
                            classNames
                                ("elecname-tab",
                                { "elecname-tab-left": isLeft },
                                { "elecname-tab-right": !isLeft },
                                { "select": selectTabIndex === originalIndex }
                                )
                        }
                        onClick={handleClick.bind(this, info, originalIndex)}
                    >
                        {_.get(info, "rackPower.name")}
                    </div>
                );
            })
            }
        </div>
    );
}