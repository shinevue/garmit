/**
 * @license Copyright 2021 DENSO
 * 
 * ICTerminalSelectModal Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';
import { Modal, FormControl, FormGroup, ControlLabel, Checkbox, Grid, Row, Col } from 'react-bootstrap';

import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';
import CheckboxList from 'Common/Widget/CheckboxList';
import RadioButtonList from 'Common/Widget/RadioButtonList';

import { compareAscending } from 'sortCompare';

/**
 * 読み取り端末選択モーダル
 * @param {boolean} showModal モーダルを表示するかどうか
 * @param {array} icTerminalList 読み取り端末一覧
 * @param {array} checkedICTerminals チェック中の読み取り端末一覧(checkbox=trueの場合に使用)
 * @param {object} selectedICTerminal 選択中の読み取り端末(checkbox=falseの場合に使用)
 * @param {boolean} checkbox チェックボックス表示か（複数選択時、trueとする）
 * @param {funciton} onSubmit 適用ボタンクリック時に呼び出す
 * @param {funciton} onCancel キャンセルボタンクリック時に呼び出す
 */
export default class ICTerminalSelectModal extends Component {
    
    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        this.state = {
            searchWord: "",
            checkedICTerminals: this.props.checkedICTerminals,
            selectedICTerminal: this.props.selectedICTerminal
        };
    }

    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps(nextProps) {
        if (this.props.checkedICTerminals !== nextProps.checkedICTerminals
            || this.props.selectedICTerminal !== nextProps.selectedICTerminal
            || this.props.showModal !== nextProps.showModal) {
            this.setState({ checkedICTerminals: nextProps.checkedICTerminals, selectedICTerminal: nextProps.selectedICTerminal });
        }
        if (this.props.showModal !== nextProps.showModal && nextProps.showModal == false) {
            this.setState({ searchWord: '' });
        }
    }

    /**
     * render
     */
    render() {
        const { showModal, icTerminalList, checkbox } = this.props;
        const { checkedICTerminals, selectedICTerminal } = this.state;

        const checkboxItems = this.createCheckboxItems();

        return (
            <Modal show={showModal} backdrop="static" onHide={() => this.handleCancel()}>
                <Modal.Header closeButton>
                    <Modal.Title>読み取り端末選択</Modal.Title>
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
                                    (checkbox?
                                        <div>
                                            <Checkbox
                                                checked={this.isAllChecked()}
                                                onClick={() => this.onAllCheckboxClick()}
                                            >
                                                <b>すべて</b>
                                            </Checkbox>
                                            <CheckboxList
                                                items={checkboxItems}
                                                checkedItems={checkedICTerminals.map((terminal) => terminal.termNo)}
                                                onChange={(keys) => this.checkChanged(keys)}
                                                maxHeight={500}
                                            />
                                        </div>
                                        :
                                        <RadioButtonList
                                            items={checkboxItems}
                                            selectedItem={selectedICTerminal && selectedICTerminal.termNo}
                                            onChange={(key) => this.selectChanged(key)}
                                        />
                                    )
                                    :
                                    <div>該当する端末がありません</div>
                                }
                            </Col>
                        </Row>
                    </Grid>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        bsStyle="primary"
                        disabled={ checkbox ? false : !selectedICTerminal }
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
        );
    }
    
    //#region イベント

    /**
     * 検索ワード変更イベント
     * @param {any} e
     */
    onSearchWordChange(e) {
        this.setState({ searchWord: e.target.value }, () => {
            this.uncheckHiddenICTerminals();
        });
    }

    /**
     * 適用ボタンクリック
     */
     handleSubmit() {
        if (this.props.onSubmit) {
            if (this.props.checkbox) {
                this.props.onSubmit(this.state.checkedICTerminals);
            } else {
                this.props.onSubmit(this.state.selectedICTerminal);
            }
        }
    }

    /**
     * キャンセルボタンクリック
     */
    handleCancel() {
        if (this.props.onCancel) {
            this.props.onCancel()
        }
        this.setState({ selectedICTerminal: null });
    }

    /**
     * チェックボックスのチェックが変化したとき
     * @param {any} checkedItems チェック
     */
    checkChanged(checkedItems) {
        const { icTerminalList } = this.props

        const checkedICTerminals = icTerminalList.filter((terminal) => {
            return (checkedItems.indexOf(terminal.termNo) >= 0);
        })

        this.setState({ checkedICTerminals: checkedICTerminals });
    }

    /**
     * ラジオボタンの選択が変化したとき
     * @param {number} targetTermNo 端末番号
     */
    selectChanged(targetTermNo) {
        const { icTerminalList } = this.props;
        const selectedICTerminal = icTerminalList.find((terminal) => terminal.termNo === targetTermNo);
        this.setState({ selectedICTerminal });
    }

    /**
     * すべてチェックがクリックされた時
     */
    onAllCheckboxClick() {
        let checkedICTerminals = [];

        if (!this.isAllChecked()) {
            checkedICTerminals = this.getFilteredICTerminals();
        }  

        this.setState({ checkedICTerminals: checkedICTerminals });
    }

    //#endregion
    
    //#region その他関数

    /**
     * フィルター後の端末ー一覧を取得する
     */
    getFilteredICTerminals() {
        const { icTerminalList } = this.props;
        const { searchWord } = this.state;

        return icTerminalList ? icTerminalList.filter((item) => item.termName.indexOf(searchWord) >= 0) : [];
    }

    /**
     * チェックボックスのアイテムを生成する
     */
    createCheckboxItems() {
        const filteredICTerminals = this.getFilteredICTerminals();
        filteredICTerminals.sort((current, next) => compareAscending(current.termName, next.termName));       //端末名でソート
        return filteredICTerminals.map((terminal) => ({ key: terminal.termNo, name: terminal.termName}));        
    }

    /**
     * 非表示の端末のチェックを外す
     */
    uncheckHiddenICTerminals() {
        const filteredICTerminals = this.getFilteredICTerminals();
        const checkedICTerminals = this.state.checkedICTerminals.filter((terminal) => filteredICTerminals.some((t) => t.termNo === terminal.termNo));
        const selectedICTerminal = this.state.selectedICTerminal && filteredICTerminals.find((terminal) => terminal.userId === this.state.selectedICTerminal.terminal); 
        this.setState({ checkedICTerminals: checkedICTerminals, selectedICTerminal });
    }

    /**
     * すべてチェックされているか
     */
    isAllChecked() {
        const filteredICTerminals = this.getFilteredICTerminals();
        return !filteredICTerminals.some((terminal) => !this.state.checkedICTerminals.some((t) => t.termNo === terminal.termNo));
    }

    //#endregion

}

ICTerminalSelectModal.propTypes = {
    showModal: PropTypes.bool,
    icTerminalList: PropTypes.array,
    checkedICTerminals: PropTypes.array,
    selectedICTerminal: PropTypes.object,
    checkbox: PropTypes.bool,
    onSubmit: PropTypes.func,
    onCancel: PropTypes.func
}

ICTerminalSelectModal.defaultProps = {
    showModal: false,
    icTerminalList: [],
    checkedICTerminals: [],
    checkbox: true,
    selectedICTerminal: null,
    onSubmit: () => { },
    onCancel: () => { }
}