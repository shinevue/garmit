/**
 * Copyright 2017 DENSO Solutions
 * 
 * ユニット選択モーダル Reactコンポーネント
 */

import React, { Component } from 'react';

import { Modal, Checkbox } from 'react-bootstrap';

import Box from 'Common/Layout/Box';
import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';

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
export default class UnitSelectModal extends Component {

    constructor(props) {
        super(props)
        this.state = {
            units: null,
            checkedIds: [],
            checkRacks: false,
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
            this.setState({ units: null, checkedIds: [], checkRacks: false });
        }
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
     * 検索ボタンがクリックされた時
     * @param {any} condition
     */
    onSearchClick(condition) {
        this.loadUnits(condition);
    }

    /**
     * 適用ボタンクリックイベント
     */
    onSubmit() {
        const { units, checkedIds, checkRacks } = this.state;
        const checkedUnits = units && units.filter((unit) => checkedIds.indexOf(unit.unitId) >= 0);

        if (checkRacks) {
            const racks = [];
            checkedUnits.forEach((unit) => {
                if (unit.unitDispSetting.rackId
                    && !racks.some((rack) => rack.rackId == unit.unitDispSetting.rackId)) {
                    racks.push({
                        systemId: unit.systemId,
                        rackId: unit.unitDispSetting.rackId,
                        rackName: unit.rackName,
                        location: unit.location
                    });
                }
            });
            this.props.onSubmit(checkedUnits, racks);
        } else {
            this.props.onSubmit(checkedUnits);
        }
    }

    /**
     * ユニット一覧を読み込む
     * @param {any} condition
     */
    loadUnits(condition) {
        const { enterprise } = this.props;
        const searchCondition = condition;
        searchCondition.enterprises = [enterprise];

        this.setState({ isLoading: true }, () => {
            sendData(EnumHttpMethod.post, '/api/unit/getUnits', searchCondition, (info, networkError) => {
                this.setState({ isLoading: false });
                if (info) {
                    this.setState({ units: info.units });
                }
                if (networkError) {
                    this.showNetWorkErrorMessage();
                }
            });
        });

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
        const { isLoading, units, checkedIds, checkRacks, message } = this.state;

        const data = units && units.map((unit) => (
            { id: unit.unitId, cells: [unit.name, unit.rackName, this.createLocationsString(unit.location)] }
        ));

        return (
            <Modal bsSize="large" show={showModal} onHide={() => this.props.onHide()} backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>ユニット選択</Modal.Title>
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
                            <Box.Title>ユニット一覧</Box.Title>
                        </Box.Header>
                        <Box.Body>
                            {units ?
                                <ListTable
                                    headers={['ユニット名称', 'ラック名称', 'ロケーション']}
                                    data={data}
                                    noDataMessage="表示するユニットがありません"
                                    checkedIds={checkedIds}
                                    onCheckChange={(ids) => this.setState({ checkedIds: ids })}
                                />
                                :
                                <span>ユニットがありません</span>
                            }
                        </Box.Body>
                    </Box>
                    <Checkbox
                        checked={checkRacks}
                        onClick={() => this.setState({ checkRacks: !checkRacks })}
                    >
                        選択したユニットがマウントされているラックも選択する
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

UnitSelectModal.propTypes = {
    showModal: PropTypes.bool,
    lookUp: PropTypes.object,
    multiSelect: PropTypes.bool,
    onSubmit: PropTypes.func,
    onHide: PropTypes.func,
}