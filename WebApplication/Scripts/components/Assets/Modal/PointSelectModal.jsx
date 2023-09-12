/**
 * Copyright 2017 DENSO Solutions
 * 
 * ポイント選択モーダル Reactコンポーネント
 *  
 */

import React, { Component } from 'react';

import { Modal } from 'react-bootstrap';

import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';
import SearchConditionBox from 'Assets/Condition/SearchConditionBox';
import PointListBox from 'Assets/PointListBox';
import MessageModal from 'Assets/Modal/MessageModal';

import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';

/**
 * PointSelectModal
 * @param {bool} showModal モーダルを表示するか
 * @param {bool} multiSelect 複数選択可かどうか
 * @param {object} lookUp マスターデータ
 * @param {func} onSubmit 適用ボタンクリック時に呼ぶ関数
 * @param {func} onCancel キャンセルボタンクリック時に呼ぶ関数
 */
export default class PointSelectModal extends Component {

    constructor(props) {
        super(props)
        this.state = {
            points: null,
            selectedPoint: null,
            checkedPoints: [],
            searchCondition: null,
            isLoading: false,
            lookUp: props.lookUp,
            message: {}
        }
    }

    componentDidMount() {

    }

    /**
     * 新しいpropsを受け取ると実行される
     * @param {any} nextProps
     */
    componentWillReceiveProps(nextProps) {
        // モーダルが閉じるとき
        if (!nextProps.showModal && this.props.showModal) {
            this.setState({ points: null, selectedPoint: null, checkedPoints: [] });
        }

        // モーダルが開くとき
        if (nextProps.showModal && !this.props.showModal) {
            if (this.state.lookUp == null) {
                this.loadLookUp();
            }
        }

        if (nextProps.lookUp && nextProps.lookUp !== this.props.lookUp) {
            this.setState({ lookUp: nextProps.lookUp });
        }
    }
    

    /**
     * 検索ボタンクリック時
     * @param {any} condition
     */
    handleSearchClick(condition) {
        const searchCondition = this.props.additionalCondition ? Object.assign({}, condition, this.props.additionalCondition) : condition;
        this.loadPoints(searchCondition);
    }

    /**
     * 適用ボタンクリックイベント
     */
    handleSubmit() {
        if (this.props.onSubmit) {
            if (this.props.multiSelect) {
                this.props.onSubmit(this.state.checkedPoints);
            } else {
                this.props.onSubmit(this.state.selectedPoint);
            }
        }
    }

    /**
     * キャンセルボタンクリックイベント
     */
    handleCancel() {
        if (this.props.onCancel) {
            this.props.onCancel();
        }
    }

    /**
     * ポイントを取得する
     * @param {any} searchCondition
     */
    loadPoints(searchCondition) {
        this.setState({ isLoading: true }, () => {
            sendData(EnumHttpMethod.post, '/api/Point/getPointsByLookUp', searchCondition, (points, networkError) => {
                this.setState({ isLoading: false });
                if (points) {
                    this.setState({ points: points });
                }
                if (networkError) {
                    this.showNetWorkErrorMessage();
                }

            });
        });
    }

    /**
     * マスタデータを取得する
     */
    loadLookUp() {
        this.setState({ isLoading: true }, () => {
            sendData(EnumHttpMethod.get, '/api/Point', null, (lookUp, networkError) => {
                this.setState({ isLoading: false });
                if (lookUp) {
                    this.setState({ lookUp: lookUp });
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
        const { showModal, onSubmit, onCancel, multiSelect, targets } = this.props;
        const { points, selectedPoint, checkedPoints, isLoading, searchCondition, lookUp, message } = this.state;

        const enableApply = (multiSelect && checkedPoints && checkedPoints.length > 0) || (!multiSelect && selectedPoint);

        return (
            <Modal bsSize="large" show={showModal} backdrop="static" onHide={() => this.props.onCancel()}>
                <Modal.Header closeButton>
                    <Modal.Title>ポイント選択</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <SearchConditionBox
                        isLoading={isLoading}
                        targets={targets || ['locations', 'enterprises', 'tags', 'egroups', 'hashTags']}
                        lookUp={lookUp}
                        searchCondition={searchCondition}
                        onSearchClick={(condition) => this.handleSearchClick(condition)}
                        onChange={(condition) => this.setState({ searchCondition: condition })}
                    />
                    <PointListBox
                        isLoading={isLoading}
                        checkbox={multiSelect}
                        points={points}
                        selectedPoint={selectedPoint}
                        checkedPoints={checkedPoints}
                        onSelectedPointChange={(point) => this.setState({ selectedPoint: point })}
                        onCheckedPointsChange={(points) => this.setState({ checkedPoints: points })}
                    />
                    
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        bsStyle="primary"
                        onClick={() => this.handleSubmit()}
                        disabled={!enableApply}
                    >
                        <Icon className="fal fa-circle mr-05" />
                        <span>適用</span>
                    </Button>
                    <Button
                        iconId="uncheck"
                        bsStyle="lightgray"
                        onClick={() => this.props.onCancel()}
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

PointSelectModal.propTypes = {
    showModal: PropTypes.bool,
    lookUp: PropTypes.object,
    multiSelect: PropTypes.bool,
    onSubmit: PropTypes.func,
    onCancel: PropTypes.func,
}