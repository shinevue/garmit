/**
 * Copyright 2017 DENSO Solutions
 * 
 * OperationTypeSelectModal Reactコンポーネント
 *  
 */

import React, { Component } from 'react';
import { Modal } from 'react-bootstrap';

import Button from 'Common/Widget/Button';
import Icon from 'Common/Widget/Icon';
import CheckboxList from 'Common/Widget/CheckboxList';

import { OPERATION_TYPE } from 'constant';

export default class OperationTypeSelectModal extends Component {

    constructor(props) {
        super(props)
        this.state = {
            checkedOperationTypes: this.props.checkedOperationTypes
        }
    }

    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps(nextProps) {
        if (this.props.checkedOperationTypes !== nextProps.checkedOperationTypes
            || this.props.showModal !== nextProps.showModal) {
            this.setState({ checkedOperationTypes: nextProps.checkedOperationTypes });
        }
    }

    /**
     * 選択肢を生成する
     */
    makeOptions() {
        const options = [];

        for (let key of Object.keys(OPERATION_TYPE)) {
            options.push({ key: OPERATION_TYPE[key].value, name: OPERATION_TYPE[key].name });
        }

        return options;
    }

    render() {
        return (
            <Modal show={this.props.showModal} backdrop="static" onHide={() => this.props.onCancel()} bsSize="sm">
                <Modal.Header closeButton>
                    <Modal.Title>操作種別選択</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <CheckboxList
                        items={this.makeOptions()}
                        checkedItems={this.state.checkedOperationTypes}
                        onChange={(val) => this.setState({ checkedOperationTypes: val })}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        bsStyle="primary"
                        onClick={() => this.props.onSubmit(this.state.checkedOperationTypes)}
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
            </Modal>
        )
    }
}

OperationTypeSelectModal.propTypes = {
    showModal: PropTypes.bool,
    checkedOperationTypes: PropTypes.array,
    onSubmit: PropTypes.func,
    onCancel: PropTypes.func
}

OperationTypeSelectModal.defaultProps = {
    showModal: false,
    checkedOperationTypes: [],
    onSubmit: () => { },
    onCancel: () => { }
}