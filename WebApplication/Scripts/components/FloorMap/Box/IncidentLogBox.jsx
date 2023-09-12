/**
 * Copyright 2017 DENSO Solutions
 * 
 * インシデントボックス Reactコンポーネント
 *  
 */
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Box from 'Common/Layout/Box';
import BoxColseButton from 'Common/Widget/BoxColseButton';
import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';
import GarmitBox from 'Assets/GarmitBox';
import ListDisplayTable, { makeComponentColumn } from 'Assets/ListDisplayTable';
import LocationDetailModal from 'Assets/Modal/LocationDetailModal';
import { getByte, cutStringByByte } from 'stringUtility';

const LOCATION_COL_INDEX = 1; //ロケーションカラムインデックス

/**
 * インシデントボックス
 * <IncidentLogBox incidentInfo={incidentInfo} isLoading={isLoading}></IncidentLogBox>
 * @param {array} incidentInfo 発生中インシデント情報
 * @param {bool} isLoading ロード中かどうか
 */
export default class IncidentLogBox extends Component {

    constructor() {
        super();
        const rows = _.get(this.props, "incideitInfo.rows");
        this.state = {
            convertedRows: rows && this.convertRows(rows),
            showModal: false,
            locationList: []
        };
    }

    /**
     * 新たなPropsが渡されたときに呼ばれる関数
     */
    componentWillReceiveProps(nextProps) {
        if (_.get(nextProps, "incidentInfo.rows") &&
            _.get(this.props, "incidentInfo.rows") !== _.get(nextProps, "incidentInfo.rows")) {
            this.setState({ convertedRows: this.convertRows(nextProps.incidentInfo.rows) });
        }
    }

    /**
     * 「インシデントログへ」ボタン押下イベント
     */
    handleMoveIncident() {
        if (this.props.onClickToIncident) {
            this.props.onClickToIncident();
        }
    }

    /**
     * 「ロケーション詳細ボタン押下イベント
     */
    handleClickDetail = (location) => {
        this.setState({ showModal: true, locationList: _.split(location, '\n') });
    }

    /**
     * ロケーション詳細モーダルクローズイベント
     */
    handleCloseModal = () => {
        this.setState({ showModal: false, locationList: [] });
    }

    /**
     * render
     */
    render() {
        const { incidentInfo, isLoading, show } = this.props;
        const { headers } = incidentInfo;
        const { convertedRows, showModal, locationList } = this.state;

        if (show) {
            return (
                <GarmitBox
                    isLoading={isLoading}
                    title="インシデントログ"
                >
                    <div>
                        {headers &&
                            <ListDisplayTable id="incidentLogTable" data={convertedRows} headerSet={headers} useCheckbox={false} selectable={false} />
                        }
                        <LocationDetailModal show={showModal} onCancel={this.handleCloseModal} locationList={locationList} />
                    </div>
                    <Button className='btn-garmit-incident-log pull-right' onClick={() => this.handleMoveIncident()}>インシデントログ</Button>
                </GarmitBox>
            );
        }
        return null;
    }

    /**
     * rowsデータを表示用にコンバートする
     * （ロケーションカラムのコンポーネントにLocationColumnを指定）
     */
    convertRows(rows) {
        return _.cloneDeep(rows).map((row) => {
            _.set(row, ['cells', LOCATION_COL_INDEX, 'Component'], LocationOmitColumn);
            _.set(row, ['cells', LOCATION_COL_INDEX, 'onClickDetail'], this.handleClickDetail);
            return row;
        })
    }
}

IncidentLogBox.propTypes = {
    incidentInfo: PropTypes.shape({
        rows: PropTypes.array,
        headers: PropTypes.arrayOf(PropTypes.string)
    }),
    isLoading: PropTypes.bool,
    show: PropTypes.bool,
    onClickToIncident: PropTypes.func
};

/**
* ロケーション省略表示コンポーネント
*/
const LocationColumn = (props) => {
    const { value, onClickDetail: handleClickDetail } = props;
    const replaced = value && value.split(/\n/g);
    let displayString = _.get(replaced, 0);
    let showEllipsisIcon = false;
    if (_.size(replaced) > 1) {
        displayString = displayString + "...";
        showEllipsisIcon = true;
    }
    return (
        <div>
            {displayString}
            {showEllipsisIcon &&
                <i className='icon-garmit-detail hover-icon pull-right' onClick={handleClickDetail.bind(this, value)}></i>
            }
        </div>
    );
}

/**
* ロケーション省略表示カラム
*/
const LocationOmitColumn = makeComponentColumn(LocationColumn);