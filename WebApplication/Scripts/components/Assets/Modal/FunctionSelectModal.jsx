/**
 * Copyright 2017 DENSO Solutions
 * 
 * FunctionSelectModal Reactコンポーネント
 *  
 */

import React, { Component } from 'react';
import { Modal, FormControl, FormGroup, ControlLabel, Checkbox, Grid, Row, Col } from 'react-bootstrap';

import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';
import CheckboxList from 'Common/Widget/CheckboxList'

export default class FunctionSelectModal extends Component {

    constructor(props) {
        super(props)
        this.state = {
            searchWord: "",
            checkedFunctions: this.props.checkedFunctions,
        }
    }

    /**
     * 最初のレンダリング時にクライアントに一度だけ呼び出されます。
     * Componentがレンダリングされた直後に呼び出されるメソッドです。
     * ここでsetStateを行うと、renderがもう一度呼び出されるためあまり行わないほうがよいです。
     */
    componentDidMount() {
    }

    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps(nextProps) {
        if (this.props.checkedFunctions !== nextProps.checkedFunctions
            || this.props.showModal !== nextProps.showModal) {
            this.setState({ checkedFunctions: nextProps.checkedFunctions });
        }
    }

    /**
     * Componentがアンマウントされるときに呼び出されます。
     * リソースの開放などを記述します。
     */
    componentWillUnmount() {
    }

    /**
     * コンポーネントのstateが変更されたときに呼ばれます。
     * パフォーマンス・チューニング時に行います
     * @param nextProps 次のprops
     * @param nextState 次のstate
     */
    shouldComponentUpdate(nextProps, nextState) {
        return true;
    }

    /**
     * 検索ワード変更イベント
     * @param {any} e
     */
    onSearchWordChange(e) {
        this.setState({ searchWord: e.target.value }, () => {
            this.uncheckHiddenFunctions();
        });
    }

    /**
     * すべてチェックがクリックされた時
     */
    onAllCheckboxClick() {
        let checkedFunctions = [];

        if (!this.isAllChecked()) {
            checkedFunctions = this.getFilteredFunctions();
        }

        this.setState({ checkedFunctions: checkedFunctions });
    }

    /**
     * フィルター後の機能一覧を取得する
     */
    getFilteredFunctions() {
        const { functionList } = this.props;
        const { searchWord } = this.state;

        return functionList ? functionList.filter((item, index) => item.name.indexOf(searchWord) >= 0) : [];
    }

    /**
     * チェックボックスのアイテムを生成する
     */
    createCheckboxItems() {
        const filteredFunctions = this.getFilteredFunctions();
        return filteredFunctions.map((func) => ({ key: func.functionId, name: func.name }));
    }

    /**
     * 非表示の機能のチェックを外す
     */
    uncheckHiddenFunctions() {
        const filteredFunctions = this.getFilteredFunctions();
        const checkedFunctions = this.state.checkedFunctions.filter((func) => filteredFunctions.some((f) => f.functionId === func.functionId));
        this.setState({ checkedFunctions: checkedFunctions });
    }

    /**
     * 適用ボタンクリック
     */
    handleSubmit() {
        if (this.props.onSubmit) {
            this.props.onSubmit(this.state.checkedFunctions)
        }
    }

    /**
     * キャンセルボタンクリック
     */
    handleCancel() {
        if (this.props.onCancel) {
            this.props.onCancel()
        }
    }

    /**
     * チェックボックスのチェックが変化したとき
     * @param {any} checkedItems
     */
    checkChanged(checkedItems) {
        const { functionList } = this.props

        const checkedFunctions = functionList.filter((func) => {
            return (checkedItems.indexOf(func.functionId) > -1);
        })

        this.setState({ checkedFunctions: checkedFunctions });
    }

    /**
     * すべてチェックされているか
     */
    isAllChecked() {
        const filteredFunctions = this.getFilteredFunctions();
        return !filteredFunctions.some((func) => !this.state.checkedFunctions.some((f) => f.functionId === func.functionId));
    }

    /**
     * render
     */
    render() {
        const { showModal, functionList } = this.props;
        const { checkedFunctions } = this.state;

        const checkboxItems = this.createCheckboxItems();

        return (
            <Modal show={showModal} backdrop="static" onHide={() => this.handleCancel()}>
                <Modal.Header closeButton>
                    <Modal.Title>操作機能選択</Modal.Title>
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
                                            checkedItems={checkedFunctions.map((func) => func.functionId)}
                                            onChange={(keys) => this.checkChanged(keys)}
                                            maxHeight={500}
                                        />
                                    </div>
                                        :
                                    <div>該当する機能がありません</div>
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