/**
 * Copyright 2017 DENSO Solutions
 * 
 * テンプレート選択モーダル Reactコンポーネント
 *  
 */

import React, { Component } from 'react';
import { sendData, EnumHttpMethod, NETWORKERROR_MESSAGE } from 'http-request';
import { showErrorModalInfo, closeModalInfo } from 'messageModalUtility';

import { Button, Modal, FormControl, FormGroup, Checkbox, Grid, Row, Col } from 'react-bootstrap';

import TextForm from 'Common/Form/TextForm';
import TextareaForm from 'Common/Form/TextareaForm';

import SearchConditionBox from 'Assets/Condition/SearchConditionBox';
import ListDisplayTable, { makeComponentColumn } from 'Assets/ListDisplayTable';
import { ApplyButton, CancelButton } from 'Assets/GarmitButton';
import GarmitBox from 'Assets/GarmitBox';
import MessageModal from 'Assets/Modal/MessageModal';

const RACK_HEADER_SET = ["テンプレート名称", "ユニット数", "ラック種別", "ラック重量", "耐荷重", "メモ"];
const UNIT_HEADER_SET = ["テンプレート名称", "ユニット名称", "ユニット数", "ユニット種別", "重量", "定格電力", "ポート数", "メモ"];
const RACK_COLUMN_DEFS = [{ width: "30%", targets: 5 }];
const UNIT_COLUMN_DEFS = [{ width: "20%", targets: 7 }];

export default class TemplateSelectModal extends Component {

    constructor(props) {
        super(props)
        this.state = {
            data: null,
            isLoading: false,
            templateList: null,
            selectRowIndex:null,
            messageModalInfo: {
                show: false,
                title: null,
                message: null,
                buttonStyle: null
            }
        }
    }

    /**
     * 新たなPropsを受け取ったときに実行される
     */
    componentWillReceiveProps(nextProps) {
        if (!this.props.showModal && nextProps.showModal) {
            this.setState({ 
                data: null, 
                isLoading: false, 
                selectRowIndex: null, 
                messageModalInfo: {
                    show: false,
                    title: null,
                    message: null,
                    buttonStyle: null
                }
            });
        }
    }

    //#region イベントハンドラ
    /**
     * 検索ボタンクリックイベント
     */
    handleSearchClick = (condition) => {
        const { isRack } = this.props;
        this.setState({ isLoading: true });
        let url = '../api/template/';
        url += isRack ? 'getRackTemplateList' : 'getUnitTemplateList'
        sendData(EnumHttpMethod.post, url, condition, (result, networkError) => {
            if (networkError) {
                this.setState({ isLoading: false, messageModalInfo: showErrorModalInfo(NETWORKERROR_MESSAGE) });
            } else if (result) {
                const templateList = isRack ? result.template.rackTemplates : result.template.unitTemplates;
                this.setState({ templateList: templateList, data: this.convertRackData(templateList), selectRowIndex:null });
            } else {
                this.setState({ messageModalInfo: showErrorModalInfo('テンプレート一覧の取得に失敗しました。') });
            }
            this.setState({isLoading:false});
        });
    }

    /**
     * ListDisplay表示用に変換する
     */
    convertRackData(templateInfo) {
        let ret = [];
        if (this.props.isRack) {
            templateInfo.map((obj) => {
                ret.push({
                    cells: [
                        { value: obj.templateName },
                        { value: obj.row + "行×" + obj.col + "列" },
                        { value: obj.type.name },
                        { value: obj.weight },
                        { value: obj.load },
                        { Component: TextareaFormColumn, value: obj.templateMemo, disableFocus:true, style: { width: "100%", backgroundColor: "white" }}
                    ]
                })
            })
        }
        else {
            templateInfo.map((obj) => {
                ret.push({
                    cells: [
                        { value: obj.templateName },
                        { value: obj.name },
                        { value: obj.row + "行×" + obj.col + "列" },
                        { value: obj.type.name },
                        { value: obj.weight },
                        { value: obj.ratedPower },
                        { value: obj.portCount },
                        { Component: TextareaFormColumn, value: obj.templateMemo, disableFocus: true, style: { width: "100%", backgroundColor:"white"}}
                    ]
                })
            })
        }
        return ret;
    }

    /**
    * 行クリックイベント
    */
    handleSelectRow = (selectRowIndex) => {
        this.setState({ selectRowIndex: selectRowIndex });
    }

    /**
     * キャンセルボタンクリックイベント
     */
    handleCancel = () => {
        if (this.props.onCancel) {
            this.props.onCancel();
        }
    }

    /**
     * 適用ボタンクリックイベント
     */
    handleSelect = () => {
        if (this.props.onSelect) {
            this.props.onSelect(this.state.templateList[this.state.selectRowIndex]);
        }
        this.setState({ isLoading: true });
    }
    //#endregion

    /**
     * render
     */
    render() {
        const { showModal, isRack } = this.props;
        const { isLoading, data, selectRowIndex, messageModalInfo } = this.state;

        return (
            <Modal show={showModal} onHide={this.handleCancel} dialogClassName="modal-xlg" backdrop="static" >
                <Modal.Header closeButton>
                    <Modal.Title>テンプレート選択</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <SearchConditionBox
                        isLoading={isLoading}
                        targets={["templateName", "templateMemo"]}
                        onSearchClick={this.handleSearchClick}
                    />
                    <GarmitBox title='検索結果' isLoading={isLoading}>
                        {data &&
                                <ListDisplayTable
                                    id="templateList"
                                    isLoading={isLoading}
                                    data={data}
                                    headerSet={isRack ? RACK_HEADER_SET : UNIT_HEADER_SET}
                                    useCheckbox={false}
                                    selectable={true}
                                    onSelectRow={this.handleSelectRow}
                                />
                            }
                    </GarmitBox>
                </Modal.Body>
                <Modal.Footer>
                    <ApplyButton onClick={this.handleSelect} disabled={selectRowIndex === null || selectRowIndex === undefined} />
                    <CancelButton onClick={this.handleCancel} />
                </Modal.Footer>
                <MessageModal
                    {...messageModalInfo}
                    bsSize={"sm"}
                    onCancel={() => this.setState({ messageModalInfo: closeModalInfo() })}
                >{messageModalInfo.message}
                </MessageModal>
            </Modal>
        )
    }
}

TemplateSelectModal.propTypes = {
    showModal: PropTypes.bool,
	isRack:PropTypes.bool,
    onSelect: PropTypes.func,
    onCancel:PropTypes.func
}

/**
* テキストエリアカラム
*/
const TextareaFormColumn = makeComponentColumn(TextareaForm);