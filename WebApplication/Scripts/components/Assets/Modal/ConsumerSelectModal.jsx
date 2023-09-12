/**
 * Copyright 2019 DENSO
 * 
 * コンシューマー選択モーダル Reactコンポーネント
 *  
 */

import React, { Component } from 'react';

import { Modal, FormControl, FormGroup, ControlLabel, Grid, Row, Col, Checkbox } from 'react-bootstrap';

import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';
import CheckboxList from 'Common/Widget/CheckboxList'

export default class ConsumerSelectModal extends Component {

    constructor(props) {
        super(props)
        this.state = {
            searchWord: "",
            checkedConsumers: this.props.checkedConsumers
        }
    }

    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps(nextProps) {
        if (this.props.checkedConsumers !== nextProps.checkedConsumers
            || this.props.showModal !== nextProps.showModal) {
            this.setState({ checkedConsumers: nextProps.checkedConsumers });
        }

        if (this.props.showModal !== nextProps.showModal && nextProps.showModal == false) {
            this.setState({ searchWord: "" });
        }
    }

    /**
     * 検索ワード変更イベント
     * @param {any} e
     */
    onSearchWordChange(e) {
        this.setState({ searchWord: e.target.value });
    }

    /**
     * チェックボックスのアイテムを生成する
     */
    createCheckboxItems() {
        const filteredConsumers = this.getFilteredConsumers();

        filteredConsumers.sort((a, b) => {
            if (a.consumerName < b.consumerName) {
                return -1;
            }
            if (a.consumerName > b.consumerName) {
                return 1;
            }
            return 0;
        });

        const checkboxItems = filteredConsumers.map((consumer) => {
            return { key: consumer.consumerId, name: consumer.consumerName };
        })
        return checkboxItems;
    }

    /**
     * 適用ボタンクリック
     */
    handleSubmit() {
        if (this.props.onSubmit) {
            this.props.onSubmit(this.state.checkedConsumers);
        }
    }

    /**
     * キャンセルボタンクリック
     */
    handleCancel() {
        if (this.props.onCancel) {
            this.props.onCancel();
        }
    }

    /**
     * チェックボックスのチェックが変化したとき
     * @param {any} checkedItems
     */
    checkChanged(checkedItems) {
        const checkedConsumers = this.props.consumerList.filter((consumer) => {
            return (checkedItems.indexOf(consumer.consumerId) >= 0);
        })

        this.setState({ checkedConsumers: checkedConsumers });
    }

    /**
     * すべてチェックがクリックされた時
     */
    onAllCheckboxClick() {
        let checkedConsumers = [];

        if (!this.isAllChecked()) {
            checkedConsumers = this.getFilteredConsumers();
        }

        this.setState({ checkedConsumers: checkedConsumers });
    }

    /**
     * コンシューマーを絞り込む
     */
    getFilteredConsumers() {
        return this.props.consumerList ? this.props.consumerList.filter((item) => {
            return (item.consumerName.indexOf(this.state.searchWord) >= 0);
        }) : [];
    }

    /**
     * すべてチェックされているか
     */
    isAllChecked() {
        const filteredConsumers = this.getFilteredConsumers();
        return !filteredConsumers.some((consumer) => !this.state.checkedConsumers.some((u) => u.consumerId === consumer.consumerId));
    }

    render() {
        const { showModal, consumerList } = this.props;
        const { checkedConsumers } = this.state;

        const checkboxItems = this.createCheckboxItems();

        return (
            <Modal show={showModal} backdrop="static" onHide={() => this.handleCancel()}>
                <Modal.Header closeButton>
                    <Modal.Title>コンシューマー選択</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Grid fluid>
                        <Row>
                            <Col md={12}>
                                <FormGroup>
                                    <ControlLabel>検索:</ControlLabel>
                                    <FormControl
                                        type="text"
                                        onChange={(e) => this.onSearchWordChange(e)}
                                        placeholder="search"
                                    />
                                    <FormControl.Feedback >
                                        <span>
                                            <Icon className="fal fa-search" />
                                        </span>
                                    </FormControl.Feedback>
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={12}>
                                {(checkboxItems.length != 0) ?
                                    <div>
                                        <Checkbox
                                            checked={this.isAllChecked()}
                                            onClick={() => this.onAllCheckboxClick()}
                                        >
                                            <b>すべて</b>
                                        </Checkbox>
                                        <CheckboxList
                                            items={checkboxItems}
                                            checkedItems={checkedConsumers.map((consumer) => consumer.consumerId)}
                                            onChange={(keys) => this.checkChanged(keys)}
                                            maxHeight={500}
                                        />
                                    </div>
                                    :
                                    <div>該当するコンシューマーがありません</div>
                                }
                            </Col>
                        </Row>
                    </Grid>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        bsStyle="primary"
                        onClick={() => this.handleSubmit()}
                    >
                        <Icon className="fal fa-circle mr-05" />
                        <span>適用</span>
                    </Button>
                    <Button
                        iconId="uncheck"
                        bsStyle="lightgray"
                        onClick={() => this.handleCancel()}
                    >
                        <span>キャンセル</span>
                    </Button>
                </Modal.Footer>
            </Modal>
        )
    }
}

ConsumerSelectModal.propTypes = {
    showModal: PropTypes.bool,
    consumerList: PropTypes.array,
    checkedConsumers: PropTypes.array,
    onSubmit: PropTypes.func,
    onCancel: PropTypes.func
}

ConsumerSelectModal.defaultProps = {
    showModal: false,
    consumerList: [],
    checkedConsumers: [],
    onSubmit: () => { },
    onCancel: () => { }
}