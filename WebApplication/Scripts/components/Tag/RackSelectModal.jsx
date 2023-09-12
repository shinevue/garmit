/**
 * Copyright 2017 DENSO Solutions
 * 
 * ユニット選択モーダル Reactコンポーネント
 */

import React, { Component } from 'react';

import { Modal, Checkbox } from 'react-bootstrap';

import Box from 'Common/Layout/Box';
import BoxColseButton from 'Common/Widget/BoxColseButton';
import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';

import DataTable from 'Common/Widget/DataTable';

import SearchConditionBox from 'Assets/Condition/SearchConditionBox';
import MessageModal from 'Assets/Modal/MessageModal';

import ListTable from 'Tag/ListTable';

import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';

/**
 * UnitSelectModal
 * @param {bool} showModal モーダルを表示するか
 * @param {object} lookUp マスターデータ
 * @param {func} onSubmit 適用ボタンクリック時に呼ぶ関数
 * @param {func} onHide キャンセルボタンクリック時に呼ぶ関数
 */
export default class RackSelectModal extends Component {

    constructor(props) {
        super(props)
        this.state = {
            racks: null,
            checkedIds: [],
            checkUnits: false,
            message: {}
        }
    }

    /**
     * 新しいpropsを受け取ると実行される
     * @param {any} nextProps
     */
    componentWillReceiveProps(nextProps) {
        // モーダルが閉じるとき
        if (!nextProps.showModal && this.props.showModal) {
            this.setState({ racks: null, checkedIds: [], checkUnits: false });
        }
    }

    /**
     * 検索ボタンがクリックされた時
     * @param {any} condition
     */
    onSearchClick(condition) {
        this.loadRacks(condition);
    }

    /**
     * 適用ボタンクリックイベント
     */
    onSubmit() {
        if (this.props.onSubmit) {
            const { racks, checkedIds, checkUnits } = this.state;
            const checkedRacks = racks && racks.filter((rack) => checkedIds.indexOf(rack.rackId) >= 0);
            this.props.onSubmit(checkedRacks, checkUnits && this.getUnitList(checkedRacks));
        }
    }

    /**
     * ラックリストを読み込む
     * @param {any} condition
     */
    loadRacks(condition) {
        const { enterprise } = this.props;
        const searchCondition = condition;
        searchCondition.enterprises = [enterprise];

        this.setState({ isLoading: true }, () => {
            sendData(EnumHttpMethod.post, '/api/rack/getRacks', searchCondition, (info, networkError) => {
                this.setState({ isLoading: false });
                if (info) {
                    this.setState({ racks: info.racks });
                }
                if (networkError) {
                    this.showNetWorkErrorMessage();
                }                
            });
        });
    }

    /**
     * ロケーションの表示文字列を生成する
     * @param {any} location
     */
    createLocationsString(location) {
        let tmpLoc = location;
        let locStr = '';
        while (tmpLoc) {
            locStr = tmpLoc.name + ' ' + locStr;
            tmpLoc = tmpLoc.parent;
        }
        return locStr;
    }

    /**
     * ユニットのリストを取得する
     * @param {any} racks
     */
    getUnitList(racks) {
        if (!racks) {
            return;
        }

        const units = [];

        racks.forEach((rack) => {
            rack.unitDispSettings.forEach((unitDispSetting) => {
                unitDispSetting.units.forEach((unit) => {
                    units.push(unit);
                });
            });
        });

        return units;
    }

    /**
     * エラーメッセージを表示する
     * @param {any} message
     */
    showErrorMessage(message) {
        this.setState({
            message: {
                show: true,
                buttonStyle: 'message',
                title: 'エラー',
                message: message,
                onCancel: () => this.clearMessage()
            }
        });
    }

    /**
     * ネットワークエラーメッセージを表示する
     */
    showNetWorkErrorMessage() {
        this.showErrorMessage(NETWORKERROR_MESSAGE);
    }

    /**
     * メッセージをクリアする
     */
    clearMessage() {
        this.setState({ message: Object.assign({}, this.state.message, { show: false }) });
    }

    /**
     * render
     */
    render() {
        const { showModal, onSubmit, onHide, lookUp } = this.props;
        const { isLoading, racks, checkedIds, checkUnits, message } = this.state;

        const data = racks && racks.map((rack) => (
            { id: rack.rackId, cells: [rack.rackName, this.createLocationsString(rack.location)] }
        ));
        
        return (
            <Modal bsSize="large" show={showModal} onHide={() => this.props.onHide()} backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>ラック選択</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <SearchConditionBox
                        isLoading={isLoading}
                        targets={['locations', 'hashTags']}
                        lookUp={lookUp}
                        onSearchClick={(condition) => this.onSearchClick(condition)}
                    />
                    <Box isLoading={isLoading} >
                        <Box.Header>
                            <Box.Title>ラック一覧</Box.Title>
                        </Box.Header>
                        <Box.Body>
                        {racks ?
                            <ListTable
                                headers={['ラック名称', 'ロケーション']}
                                data={data}
                                noDataMessage="表示するラックがありません"
                                checkedIds={checkedIds}
                                onCheckChange={(ids) => this.setState({checkedIds: ids})}
                            />
                            :
                            <span>ラックがありません</span>
                        }
                        </Box.Body>
                    </Box>
                    <Checkbox
                        checked={checkUnits}
                        onClick={() => this.setState({ checkUnits: !checkUnits })}
                    >
                        選択したラックにマウントされているユニットも選択する
                    </Checkbox>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        bsStyle="primary"
                        onClick={() => this.onSubmit()}
                        disabled={checkedIds.length === 0}
                    >
                        <Icon className="fal fa-circle mr-05" />
                        <span>適用</span>
                    </Button>
                    <Button
                        iconId="uncheck"
                        bsStyle="lightgray"
                        onClick={() => this.props.onHide()}
                    >
                        <span>キャンセル</span>
                    </Button>
                </Modal.Footer>
                <MessageModal
                    show={message.show}
                    title={message.title}
                    bsSize="small"
                    buttonStyle={message.buttonStyle}
                    onOK={message.onOK}
                    onCancel={message.onCancel}
                >
                    {message.message}
                </MessageModal>
            </Modal>
        )
    }
}

RackSelectModal.propTypes = {
    showModal: PropTypes.bool,
    lookUp: PropTypes.object,
    multiSelect: PropTypes.bool,
    onSubmit: PropTypes.func,
    onHide: PropTypes.func,
}