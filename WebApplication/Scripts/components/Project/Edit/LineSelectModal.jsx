/**
 * @license Copyright 2020 DENSO
 * 
 * LineSelectModal Reactコンポーネント
 * 
 */
'use strict';

import React, { Component } from 'react';

import { Modal } from 'react-bootstrap';
import InputForm from 'Common/Form/InputForm';
import { ApplyButton, CancelButton } from 'Assets/GarmitButton';
import LabelForm from 'Common/Form/LabelForm';
import TextForm from 'Common/Form/TextForm';
import SelectForm from 'Common/Form/SelectForm';
import TextareaForm from 'Common/Form/TextareaForm';
import LocationForm from 'Assets/Condition/LocationForm';
import MessageModal from 'Assets/Modal/MessageModal';
import Loading from 'Common/Widget/Loading';

import { TempTypeRow, LeftTypeRow, SearchTypeRow } from 'Project/Edit/LineType/TypeRow';
import TempRow from 'Project/Edit/LineType/TempRow';
import FixSearchTypeRow from 'Project/Edit/LineType/FixSearchTypeRow';

import TempInOnlyLineConnectionSelectForm from 'Project/Edit/LineConnection/TempInOnlyLineConnectionSelectForm';
import TempPremiseOnlyLineConnectionSelectForm from 'Project/Edit/LineConnection/TempPremiseOnlyLineConnectionSelectForm';
import LineConnectionSelectForm from 'Project/Edit/LineConnection/LineConnectionSelectForm';
import LineConnectionInOnlySelectForm from 'Project/Edit/LineConnection/LineConnectionInOnlySelectForm';
import LineConnectionPremiseOnlySelectForm from 'Project/Edit/LineConnection/LineConnectionPremiseOnlySelectForm';
import LineConnectionSearchForm from 'Project/Edit/LineConnection/LineConnectionSearchForm';
import LineConnectionInOnlySearchForm from 'Project/Edit/LineConnection/LineConnectionInOnlySearchForm';
import LineConnectionPremiseOnlySearchForm from 'Project/Edit/LineConnection/LineConnectionPremiseOnlySearchForm';
import FixInOnlyLineConnectionForm from 'Project/Edit/LineConnection/FixInOnlyLineConnectionForm';
import FixPremiseOnlyLineConnectionForm from 'Project/Edit/LineConnection/FixPremiseOnlyLineConnectionForm';

import { convertNumber } from 'numberUtility';
import { getEmptyLineConnection, isFixProjectType, isSearchable } from 'projectLineUtility';
import { validateProjectLineId, validateProjectLineName, validateLocation } from 'projectLineUtility';
import { KEY_PROJECT_LINE_NAME, KEY_PROJECT_LOCATION } from 'projectLineUtility';
import { FIRST_SERIES_NO, SEQ_NO_IN_PATCHCABLE, START_SEQ_NO_IDF_PATCHCABLE } from 'projectLineUtility';
import { MAXLENGTH_PROJECT_LINE_ID, MAXLENGTH_PROJECT_LINE_NAME } from 'projectLineUtility';
import { PROJECT_DATE_FORMAT } from 'projectUtility';
import { PROJECT_TYPE, LINE_TEMP_TYPE, LINE_SEARCH_TYPE } from 'constant'
import { validateTextArea, successResult, VALIDATE_STATE } from 'inputCheck';

const MAXLENGTH_MEMO = 2000;

/**
 * 回線選択モーダルコンポーネント
 * @param {boolean} show モーダルを表示するかどうか
 * @param {object} line 編集する回線情報
 * @param {array} wiringTypes ワイヤリスト
 * @param {array} locations ロケーションリスト
 * @param {array} linePatchCableSelections 線番選択用局入/IDF線番リスト
 * @param {array} beforeLinePatchCableSelections 修正前線番選択用局入/IDF線番リスト
 * @param {array} usedPatchCables 他の回線で使用中の線番リスト
 * @param {array} usedBeforePatchCables 他の回線で使用中の修正前線番リスト
 * @param {object} searchedLine 検索した回線情報
 * @param {number} projectType 工事種別
 * @param {boolean} isLoading ロード中かどうか
 * @param {function} onApply 適用ボタンクリック時に呼び出す
 * @param {function} onCancel キャンセルボタンクリック時に呼び出す
 * @param {function} onAddPatchCable 配線盤線番選択追加時に呼び出す
 * @param {function} onClearPatchCables 線番クリア時に呼び出す
 * @param {function} onSelectInPatchboard 局入配線盤変更時に呼び出す
 * @param {function} onSelectInPatchCable 局入配線盤/線番変更時に呼び出す（局入で検索するもののみ使用）
 * @param {function} onSelectIdfPatchCable IDF配線盤/線番変更時に呼び出す（IDFで検索するもののみ使用）
 * @param {function} onClearLinePatchCables 回線選択の線番選択をクリアする
 * @param {function} onAddLinePatchCables 回線選択の線番選択を追加する
 * @param {function} onSearchLine 回線情報を検索する
 * @param {function} onChangeTempType 登録方法変更時に呼び出す（仮登録/新設の場合）
 * @param {function} onChangeSearchType 検索方法変更時に呼び出す（撤去/修正（仮登録）/修正（残置）の場合）
 * @param {function} onSelectBeforePatchCable 修正前の配線盤/線番変更時に呼び出す（修正（仮登録）/修正（残置）の場合）
 */
export default class LineSelectModal extends Component {
    
    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        const { line } = props;       
        this.state = { 
            editLine: _.cloneDeep(line),
            validate: {
                lineId1: line ? validateProjectLineId(line.lineId1, [line.lineId2, line.lineId3]) : { state: null, helpText: null }, 
                lineId2: line ? validateProjectLineId(line.lineId2, [line.lineId1, line.lineId3]) : { state: null, helpText: null }, 
                lineId3: line ? validateProjectLineId(line.lineId3, [line.lineId1, line.lineId2]) : { state: null, helpText: null }, 
                wiringType: line ? successResult : { state: null, helpText: null }, 
                lineName: line ? validateProjectLineName(line.lineName) : { state: null, helpText: null }, 
                location: line ? validateLocation(line.location) : { state: null, helpText: null }, 
                memo: line ? this.validateMemo(line.memo) : { state: null, helpText: null }
            },
            isErrorLineConnections: line && line.lineNo ? false : true,
            modalInfo: {
                show: false,
                message: '',
                callback: null
            },
            searchKey: {
                patchboardId: null,
                patchCableNo: null
            },
            fixSelectedPatchCable: this.getFixSelectedPatchCable(line&&line.beforeLineConnections, props.projectType, props.searchType),
            firstSeriesNo: 1,
            isReadOnly: false,
            overwrite: true,
            searching: false
        };
    }

    /**
     * 新しいpropsを受け取るときに呼び出されます。
     * propsによってstateを変更する場合はここでthis.setState()を行います。このsetStateでrenderを呼ぶことはありません。
     * @param {*} nextProps 新しいprops
     */
    componentWillReceiveProps( nextProps ){
        const nextLine = nextProps.line;
        if (nextProps.show && this.props.show !== nextProps.show) {
            const isReadOnly = isSearchable(nextProps.projectType, nextLine.hasTemp) && nextProps.searchedLine === null;
            this.setState({
                editLine: nextLine && _.cloneDeep(nextLine),
                validate: {
                    lineId1: nextLine && !isReadOnly ? validateProjectLineId(nextLine.lineId1, [nextLine.lineId2, nextLine.lineId3]) : { state: null, helpText: null }, 
                    lineId2: nextLine && !isReadOnly ? validateProjectLineId(nextLine.lineId2, [nextLine.lineId1, nextLine.lineId3]) : { state: null, helpText: null }, 
                    lineId3: nextLine && !isReadOnly ? validateProjectLineId(nextLine.lineId3, [nextLine.lineId1, nextLine.lineId2]) : { state: null, helpText: null }, 
                    wiringType: nextLine && !isReadOnly ? successResult : { state: null, helpText: null }, 
                    lineName: nextLine && !isReadOnly ? validateProjectLineName(nextLine.lineName) : { state: null, helpText: null }, 
                    location: nextLine && !isReadOnly ? validateLocation(nextLine.location) : { state: null, helpText: null }, 
                    memo: nextLine && !isReadOnly ? this.validateMemo(nextLine.memo) : { state: null, helpText: null }
                },
                isErrorLineConnections: nextProps.line && nextProps.line.projectLineNo ? false : true,
                searchKey: {
                    patchboardId: null,
                    patchCableNo: null
                },
                firstSeriesNo: 1,
                fixSelectedPatchCable: this.getFixSelectedPatchCable(nextLine&&nextLine.beforeLineConnections, nextProps.projectType, nextLine.searchType),
                isReadOnly: isReadOnly,
                overwrite: true,
                searching: false
            });
        } else if (nextProps.show && this.state.searching && nextProps.searchedLine) {
            const { searchKey } = this.state;
            const update = this.getSearchedLine(this.state.editLine, nextProps.searchedLine, this.state.overwrite, nextProps.projectType);
            this.setState({
                editLine: update,
                validate: Object.assign({}, this.state.validate, {
                    lineId1: validateProjectLineId(update.lineId1, [update.lineId2, update.lineId3]), 
                    lineId2: validateProjectLineId(update.lineId2, [update.lineId1, update.lineId3]), 
                    lineId3: validateProjectLineId(update.lineId3, [update.lineId1, update.lineId2]), 
                    wiringType: successResult, 
                    lineName: validateProjectLineName(update.lineName), 
                    location: validateLocation(update.location), 
                    memo: this.validateMemo(update.memo)
                }),
                firstSeriesNo: this.getFirstSeriesNo(update.lineConnections, nextProps.projectType, update.hasTemp , searchKey),
                fixSelectedPatchCable: searchKey&&{ patchboardId: searchKey.patchboardId, patchCableNo: { no: searchKey.patchCableNo } },
                isReadOnly: false,
                overwrite: true,
                searching: false
            });
        }
    }

    /**
     * render
     */
    render() {
        const { show, wiringTypes, locations, projectType, linePatchCableSelections, beforeLinePatchCableSelections, usedPatchCables, usedBeforePatchCables, isLoading, searchedLine } = this.props;
        const { editLine, validate, modalInfo, firstSeriesNo, fixSelectedPatchCable, isReadOnly, isErrorLineConnections } = this.state;
        if (editLine) {
            var { lineId1, lineId2, lineId3, wiringType, lineName, location, lineConnections, beforeLineConnections, memo, openDate,closeDate, tempType, hasTemp, searchType, leftType } = editLine;
        }
        const hasWireType = wiringType ? true : false;
        const notSearched = isSearchable(projectType, hasTemp) && searchedLine === null;
        return (
            <Modal bsSize="large" ref={(ref) => {this.modalRef = ref}} show={show} onHide={this.handleCancel} backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>回線詳細</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <InputForm className="line-input-form">
                        <InputForm.Row>
                            <InputForm.Col label="回線ID" columnCount={2} isRequired >
                                <TextForm
                                    formControlClassName="mb-05"
                                    value={lineId1} 
                                    isReadOnly={isReadOnly}
                                    validationState={validate.lineId1.state}
                                    helpText={validate.lineId1.helpText}
                                    onChange={(value) => this.changeLineId(value, lineId2, lineId3)} 
                                    maxlength={MAXLENGTH_PROJECT_LINE_ID}
                                />
                                <TextForm
                                    formControlClassName="mb-05"
                                    value={lineId2} 
                                    isReadOnly={isReadOnly}
                                    validationState={validate.lineId2.state}
                                    helpText={validate.lineId2.helpText}
                                    onChange={(value) => this.changeLineId(lineId1, value, lineId3)} 
                                    maxlength={MAXLENGTH_PROJECT_LINE_ID}
                                />
                                <TextForm 
                                    value={lineId3} 
                                    isReadOnly={isReadOnly}
                                    validationState={validate.lineId3.state}
                                    helpText={validate.lineId3.helpText}
                                    onChange={(value) => this.changeLineId(lineId1, lineId2, value)} 
                                    maxlength={MAXLENGTH_PROJECT_LINE_ID}
                                />
                            </InputForm.Col>
                            <InputForm.Col label="ワイヤ" columnCount={2}>
                                <SelectForm
                                    value={wiringType&&wiringType.typeId}
                                    isReadOnly={isReadOnly||notSearched}
                                    options={wiringTypes&&wiringTypes.map((type) => { return { value: type.typeId, name: type.name }})}
                                    onChange={(value) => this.changeWiringType(value, successResult)} 
                                    validationState={!notSearched ? validate.wiringType.state : null}
                                    helpText={!notSearched ? validate.wiringType.helpText : '未検索のため、変更できません'}
                                />
                            </InputForm.Col>
                        </InputForm.Row>
                        <InputForm.Row>
                            <InputForm.Col label="回線名" columnCount={1} >
                                <TextForm 
                                    value={lineName}
                                    isReadOnly={isReadOnly}
                                    validationState={validate.lineName.state}
                                    helpText={validate.lineName.helpText}
                                    onChange={(value) => this.changeValue(KEY_PROJECT_LINE_NAME, value, validateProjectLineName(value))} 
                                    maxlength={MAXLENGTH_PROJECT_LINE_NAME}
                                />
                            </InputForm.Col>
                        </InputForm.Row>
                        <InputForm.Row>
                            <InputForm.Col label="ロケーション" columnCount={1} isRequired>
                                <LocationForm 
                                    multiple={false}
                                    locationList={locations}
                                    selectedLocation={location}
                                    disabled={isReadOnly}
                                    onChange={(value) => this.changeValue(KEY_PROJECT_LOCATION, value, validateLocation(value))}
                                    validationState={validate.location.state}
                                    helpText={validate.location.helpText}
                                />
                            </InputForm.Col>
                        </InputForm.Row>
                        {projectType === PROJECT_TYPE.temp&&
                            <TempTypeRow
                                type={tempType}
                                onChange={(value) => this.changeTempType(value)}
                            />
                        }
                        {projectType === PROJECT_TYPE.new&&
                            <TempRow
                                hasTemp={hasTemp}
                                tempType={tempType}
                                onChange={(hasTemp, tempType) => this.changeTempType(tempType, hasTemp)}
                            />
                        }
                        {projectType === PROJECT_TYPE.remove&&
                            <SearchTypeRow
                                type={searchType}
                                onChange={(value) => this.changeSearchType(convertNumber(value))}
                            />
                        }
                        {isFixProjectType(projectType)&&
                            <FixSearchTypeRow 
                                searchType={searchType}
                                patchCables={beforeLinePatchCableSelections}
                                selectedPatchCable={fixSelectedPatchCable}
                                usedPatchCables={usedBeforePatchCables}
                                onChangeType={(value) => this.changeSearchType(convertNumber(value))}
                                onChange={() => this.changeBeforePatchCable()}
                                onSearch={(sequence) => this.searchLine(sequence)}
                            />
                        }
                        {projectType === PROJECT_TYPE.temp&&tempType===LINE_TEMP_TYPE.inOnly&&
                            <TempInOnlyLineConnectionSelectForm
                                lineConnections={lineConnections}
                                linePatchCableSelections={linePatchCableSelections}
                                usedPatchCables={usedPatchCables}
                                hasWireType={hasWireType}
                                onChange={(lineConnections, isError) => this.changeLineConnections(lineConnections, isError)}
                                onChangeError={(isError) => this.changeErrorLineConnections(isError)}
                            />
                        }
                        {projectType === PROJECT_TYPE.temp&&tempType===LINE_TEMP_TYPE.premiseOnly&&
                            <TempPremiseOnlyLineConnectionSelectForm
                                lineConnections={lineConnections}
                                linePatchCableSelections={linePatchCableSelections}
                                usedPatchCables={usedPatchCables}
                                hasWireType={hasWireType}
                                onChange={(lineConnections, isError, seriesNo, seqNo) => this.changeLineConnections(lineConnections, isError, seriesNo, seqNo)}
                                onClearIdfPatchCables={(seriesNo, seqNo, lineConnections, isError) => this.clearLineConnection(seriesNo, seqNo, lineConnections, isError)}
                                onAddIdfPatchCable={(seriesNo, patchboardId, lineConnections, isError, callback) => this.addPatchCable(seriesNo, patchboardId, lineConnections, isError, callback)}
                                onChangeError={(isError) => this.changeErrorLineConnections(isError)}
                            />
                        }
                        {projectType === PROJECT_TYPE.new&&!hasTemp&&
                            <LineConnectionSelectForm
                                lineConnections={lineConnections}
                                linePatchCableSelections={linePatchCableSelections}
                                usedPatchCables={usedPatchCables}
                                hasWireType={hasWireType}
                                onChange={(lineConnections, isError, seriesNo, seqNo) => this.changeLineConnections(lineConnections, isError, seriesNo, seqNo)}
                                onChangeInPatchborad={(seriesNo, patchboardId, lineConnections, isError) => this.changeInPatchborad(seriesNo, patchboardId, lineConnections, isError)}
                                onCopy={(seriesNo, seqNo, lineConnections, isError, isClear) => this.changeLineConnections(lineConnections, isError, seriesNo, seqNo, isClear)}
                                onClearIdfPatchCables={(seriesNo, seqNo, lineConnections, isError) => this.clearLineConnection(seriesNo, seqNo, lineConnections, isError)}
                                onAddIdfPatchCable={(seriesNo, patchboardId, lineConnections, isError, callback) => this.addPatchCable(seriesNo, patchboardId, lineConnections, isError, callback)}
                                onChangeError={(isError) => this.changeErrorLineConnections(isError)}
                            />
                        }
                        {projectType === PROJECT_TYPE.new&&hasTemp&&tempType===LINE_TEMP_TYPE.inOnly&&
                            <LineConnectionInOnlySelectForm
                                firstSeriesNo={firstSeriesNo}
                                lineConnections={lineConnections}
                                linePatchCableSelections={linePatchCableSelections}
                                usedPatchCables={usedPatchCables}
                                hasWireType={hasWireType}
                                notSearched={notSearched}
                                onChange={(lineConnections, isError, seriesNo, seqNo) => this.changeLineConnections(lineConnections, isError, seriesNo, seqNo)}
                                onChangeInPatchCable={(lineConnections, isError, seriesNo, seqNo) => this.changeInPatchCable(lineConnections, isError, seriesNo, seqNo)}
                                onSearch={(patchCableSequence) => this.searchLine(patchCableSequence)}
                                onCopy={(seriesNo, seqNo, lineConnections, isError, isClear) => this.changeLineConnections(lineConnections, isError, seriesNo, seqNo, isClear)}
                                onClearIdfPatchCables={(seriesNo, seqNo, lineConnections, isError) => this.clearLineConnection(seriesNo, seqNo, lineConnections, isError)}
                                onAddIdfPatchCable={(seriesNo, patchboardId, lineConnections, isError, callback) => this.addPatchCable(seriesNo, patchboardId, lineConnections, isError, callback)}
                                onChangeError={(isError) => this.changeErrorLineConnections(isError)}
                            />
                        }
                        {projectType === PROJECT_TYPE.new&&hasTemp&&tempType===LINE_TEMP_TYPE.premiseOnly&&
                            <LineConnectionPremiseOnlySelectForm
                                firstSeriesNo={firstSeriesNo}
                                lineConnections={lineConnections}
                                linePatchCableSelections={linePatchCableSelections}
                                usedPatchCables={usedPatchCables}
                                hasWireType={hasWireType}
                                notSearched={notSearched}
                                onChange={(lineConnections, isError) => this.changeLineConnections(lineConnections, isError)}
                                onChangeIdfPatchCable={(lineConnections, isError) => this.changeIdfPatchCable(lineConnections, isError)}
                                onSearch={(patchCableSequence) => this.searchLine(patchCableSequence)}
                                onChangeError={(isError) => this.changeErrorLineConnections(isError)}
                            />
                        }
                        {([PROJECT_TYPE.change, PROJECT_TYPE.left].includes(projectType) || (projectType===PROJECT_TYPE.remove&&searchType===LINE_SEARCH_TYPE.inUse))&&
                            <LineConnectionSearchForm
                                firstSeriesNo={firstSeriesNo}
                                lineConnections={lineConnections}
                                linePatchCableSelections={linePatchCableSelections}
                                usedPatchCables={usedPatchCables}
                                hasWireType={hasWireType}
                                notSearched={notSearched}
                                onChangeInPatchCable={(lineConnections, isError) => this.changeInPatchCable(lineConnections, isError)}
                                onSearch={(patchCableSequence) => this.searchLine(patchCableSequence)}
                            />
                        }
                        {projectType===PROJECT_TYPE.remove&&searchType===LINE_SEARCH_TYPE.inOnly&&
                            <LineConnectionInOnlySearchForm
                                firstSeriesNo={firstSeriesNo}
                                lineConnections={lineConnections}
                                linePatchCableSelections={linePatchCableSelections}
                                usedPatchCables={usedPatchCables}
                                hasWireType={hasWireType}
                                notSearched={notSearched}
                                onChangeInPatchCable={(lineConnections, isError) => this.changeInPatchCable(lineConnections, isError)}
                                onSearch={(patchCableSequence) => this.searchLine(patchCableSequence)}
                            />
                        }
                        {projectType===PROJECT_TYPE.remove&&searchType===LINE_SEARCH_TYPE.premiseOnly&&
                            <LineConnectionPremiseOnlySearchForm
                                firstSeriesNo={firstSeriesNo}
                                lineConnections={lineConnections}
                                linePatchCableSelections={linePatchCableSelections}
                                usedPatchCables={usedPatchCables}
                                hasWireType={hasWireType}
                                notSearched={notSearched}
                                onChangeIdfPatchCable={(lineConnections, isError) => this.changeIdfPatchCable(lineConnections, isError)}
                                onSearch={(patchCableSequence) => this.searchLine(patchCableSequence)}
                            />
                        }
                        {isFixProjectType(projectType)&&searchType===LINE_SEARCH_TYPE.inOnly&&
                            <FixInOnlyLineConnectionForm
                                firstSeriesNo={firstSeriesNo}
                                lineConnections={lineConnections}
                                linePatchCableSelections={linePatchCableSelections}
                                beforeLineConnections={beforeLineConnections}
                                usedPatchCables={usedPatchCables}
                                hasWireType={hasWireType}
                                isReadOnly={isReadOnly}
                                notSearched={notSearched}
                                onChange={(lineConnections, isError, seriesNo, seqNo) => this.changeLineConnections(lineConnections, isError, seriesNo, seqNo)}
                                onClearIdfPatchCables={(seriesNo, seqNo, lineConnections, isError) => this.clearLineConnection(seriesNo, seqNo, lineConnections, isError)}
                                onAddIdfPatchCable={(seriesNo, patchboardId, lineConnections, isError, callback) => this.addPatchCable(seriesNo, patchboardId, lineConnections, isError, callback)}
                                onChangeError={(isError) => this.changeErrorLineConnections(isError)}
                            />
                        }
                        {isFixProjectType(projectType)&&searchType===LINE_SEARCH_TYPE.premiseOnly&&
                            <FixPremiseOnlyLineConnectionForm
                                firstSeriesNo={firstSeriesNo}
                                lineConnections={lineConnections}
                                linePatchCableSelections={linePatchCableSelections}
                                beforeLineConnections={beforeLineConnections}
                                usedPatchCables={usedPatchCables}
                                hasWireType={hasWireType}
                                isReadOnly={isReadOnly}
                                notSearched={notSearched}
                                onChange={(lineConnections, isError) => this.changeLineConnections(lineConnections, isError)}
                            />
                        }
                        {!(projectType===PROJECT_TYPE.temp||(projectType===PROJECT_TYPE.new&&!hasTemp))&&
                            <InputForm.Row>
                                <InputForm.Col label="開通年月日" columnCount={1} >
                                    <LabelForm 
                                        value={openDate&&openDate.format(PROJECT_DATE_FORMAT)||'(未登録)'}
                                    />
                                </InputForm.Col>
                            </InputForm.Row>
                        }
                        {(projectType===PROJECT_TYPE.fix_left||(projectType===PROJECT_TYPE.remove&&[LINE_SEARCH_TYPE.inOnly, LINE_SEARCH_TYPE.premiseOnly].includes(searchType)))&&
                            <InputForm.Row>
                                <InputForm.Col label="廃止年月日" columnCount={1} >
                                    <LabelForm 
                                        value={closeDate&&closeDate.format(PROJECT_DATE_FORMAT)||'(未登録)'}
                                    />
                                </InputForm.Col>
                            </InputForm.Row>
                        }
                        <InputForm.Row>
                            <InputForm.Col label="備考" columnCount={1} isRequired>
                                <TextareaForm 
                                    value={memo} 
                                    validationState={validate.memo.state}
                                    helpText={validate.memo.helpText}
                                    isReadOnly={isReadOnly}
                                    onChange={(value) => this.changeValue('memo', value, this.validateMemo(value))}
                                    maxlength={MAXLENGTH_MEMO}
                                    showTextLength
                                />
                            </InputForm.Col>
                        </InputForm.Row>                        
                        {projectType === PROJECT_TYPE.left&&
                            <LeftTypeRow type={leftType} onChange={(value) => this.changeValue('leftType', convertNumber(value), successResult)} />
                        }
                        <Loading isLoading={isLoading} />
                    </InputForm>
                </Modal.Body>
                <Modal.Footer>
                    <ApplyButton disabled={isLoading||notSearched||this.invalid(validate, isErrorLineConnections)} onClick={() => this.handleApply()} />
                    <CancelButton onClick={this.handleCancel} />
                </Modal.Footer>
                <MessageModal show={modalInfo.show} 
                              title={modalInfo.title} 
                              bsSize="small"
                              buttonStyle={modalInfo.buttonStyle}
                              onHide={modalInfo.buttonStyle === 'yesNo' ? () => this.hideMessageModal() : null}
                              onOK={() => modalInfo.callback ? modalInfo.callback(true) : this.hideMessageModal()}
                              onCancel={() => modalInfo.buttonStyle === 'yesNo' && modalInfo.callback ? modalInfo.callback(false) : this.hideMessageModal()}>
                    {modalInfo.message && modalInfo.message.split(/\r\n|\n/).map((str) => <div>{str}</div>)}
                </MessageModal>
            </Modal>
        );
    }
    
    //#region イベントハンドラ

    /**
     * 適用ボタンクリック
     */
    handleApply = () => {
        if (this.props.onApply) {
            const { editLine } = this.state;
            this.props.onApply(editLine);
        }
    }

    /**
     * キャンセルボタンクリック
     */
    handleCancel = () => {
        if (this.props.onCancel) {
            this.props.onCancel();
        }
    }

    //#endregion

    //#region イベント呼び出し

    /**
     * IDF線番選択肢をクリアする
     * @param {number} seriesNo 局入連番No
     * @param {number} seqNo クリアする開始番号
     */
    onClearPatchCables(seriesNo, seqNo) {
        if (this.props.onClearPatchCables) {
            this.props.onClearPatchCables(seriesNo, seqNo);
        }
    }

    /**
     * 局入配線盤選択時に呼び出す ※新設（仮登録なし）のみ
     * @param {number} seriesNo 局入連番No
     * @param {number} patchboardId 局入配線盤ID
     */
    onSelectInPatchboard(seriesNo, patchboardId) {
        if (this.props.onSelectInPatchboard) {
            this.props.onSelectInPatchboard(seriesNo, patchboardId);
        }
    }

    /**
     * 局入配線盤/線番変更時に呼び出す　※新設（局入のみ） / 撤去（使用中・局入のみ） / 変更 / 残置
     */
    onSelectInPatchCable() {
        if (this.props.onSelectInPatchCable) {
            this.props.onSelectInPatchCable();
        }
    }

    /**
     * IDF配線盤/線番変更時に呼び出す　※新設（構内のみ） / 撤去（構内のみ）のみ
     */
    onSelectIdfPatchCable() {
        if (this.props.onSelectIdfPatchCable) {
            this.props.onSelectIdfPatchCable();
        }
    }

    /**
     * 登録方法を変更する（仮登録/新設）
     * @param {number} tempType 登録方法
     * @param {boolean} hasTemp 仮登録ありかどうか
     * @param {boolean} hasWireType ワイヤありかどうか
     */
    onChangeTempType(tempType, hasTemp, hasWireType) {
        if (this.props.onChangeTempType) {
            this.props.onChangeTempType(this.props.projectType, tempType, hasTemp, hasWireType);
        }
    }

    /**
     * 検索方法を変更する（撤去/修正（仮登録）/修正（残置））
     * @param {number} searchType 検索方法
     * @param {boolean} hasWireType ワイヤありかどうか
     */
    onChangeSearchType(searchType, hasWireType) {
        if (this.props.onChangeSearchType) {
            this.props.onChangeSearchType(this.props.projectType, searchType, hasWireType);
        }
    }

    /**
     * 検索欄の配線盤/線番変更時に呼び出す　※修正（仮登録）/ 修正（残置）のみ
     */
    onSelectBeforePatchCable() {
        if (this.props.onSelectBeforePatchCable) {
                this.props.onSelectBeforePatchCable();
        }
    }

    //#endregion
    
    //#region 入力変更

    /**
     * 値を変更する
     * @param {string} key 対象キー
     * @param {string} value 変更後の値
     * @param {object} validate 検証結果
     */
    changeValue(key, value, validate) {
        const { editLine } = this.state;
        let update = _.cloneDeep(editLine);
        _.set(update, key, value);
        var validateResult = this.getValidate(validate, key);
        if (key === 'wiringType') {
            if (!value && editLine[key]) {
                update.lineConnections.pop();
                this.props.onClearLinePatchCables && this.props.onClearLinePatchCables(2);
            } else if ( !editLine[key] && value ) {
                update.lineConnections.push(this.getSecondEmptyLineConnection(this.props.projectType, update.tempType, update.searchType));
                this.props.onAddLinePatchCables && this.props.onAddLinePatchCables(2, update.tempType);
            }
        }
        this.setState({
            editLine: update,
            validate: validateResult
        });
    }

    /**
     * 回線IDを変更する
     * @param {string} lineId1 回線ID1
     * @param {string} lineId2 回線ID2
     * @param {string} lineId3 回線ID3
     */
    changeLineId(lineId1, lineId2, lineId3) {
        var validate = _.cloneDeep(this.state.validate);
        let update = _.cloneDeep(this.state.editLine);
        update.lineId1 = lineId1;
        update.lineId2 = lineId2;
        update.lineId3 = lineId3;
        validate.lineId1 = validateProjectLineId(lineId1, [lineId2, lineId3]);
        validate.lineId2 = validateProjectLineId(lineId2, [lineId1, lineId3]);
        validate.lineId3 = validateProjectLineId(lineId3, [lineId1, lineId2]);
        this.setState({
            editLine: update,
            validate: validate
        });
    }

    /**
     * ワイヤを変更する
     * @param {string} value 変更後のワイヤ種別ID 
     * @param {object} validate 検証結果
     */
    changeWiringType(value, validate) {
        const { wiringTypes, projectType } = this.props
        const { hasTemp } = this.state.editLine;
        const wiringType = wiringTypes ? wiringTypes.find((type) => type.typeId === convertNumber(value)) : null;
       
        const beforeWiringType = this.state.editLine.wiringType;
        if (isSearchable(projectType, hasTemp) && this.props.searchedLine) {
             //検索済みでワイヤ有無を変更する場合はエラーとする
            if (!beforeWiringType && wiringType) {
                this.showErrorMessageModal('検索済みの線番がワイヤ設定なしのため、変更できません。');
            } else if (!wiringType && beforeWiringType) {
                this.showErrorMessageModal('検索済みの線番にてワイヤ設定ありのため、ワイヤ選択なしには変更できません。')
            } else {
                this.changeValue('wiringType', wiringType, validate);
            }            
        } else {
            this.changeValue('wiringType', wiringType, validate);
        }
             
    }

    /**
     * 線番(2)の空の回線線番情報を取得する
     * @param {number} projectType 工事種別
     * @param {number} tempType 仮登録方法
     * @param {number} searchType 検索方法
     */
    getSecondEmptyLineConnection(projectType, tempType, searchType) {
        var lineConnection;
        if ([PROJECT_TYPE.new, PROJECT_TYPE.change, PROJECT_TYPE.left].includes(projectType) || (projectType===PROJECT_TYPE.remove&&searchType===LINE_SEARCH_TYPE.inUse)) {
            lineConnection = getEmptyLineConnection(2);
        } else {
            let seqNo = SEQ_NO_IN_PATCHCABLE;
            if (tempType !== undefined && tempType !== null) {
                seqNo = (tempType === LINE_TEMP_TYPE.inOnly) ? SEQ_NO_IN_PATCHCABLE : START_SEQ_NO_IDF_PATCHCABLE;
            } else {
                seqNo = (searchType === LINE_SEARCH_TYPE.inOnly) ? SEQ_NO_IN_PATCHCABLE : START_SEQ_NO_IDF_PATCHCABLE;
                if (isFixProjectType(projectType)) {    
                    seqNo = searchType === LINE_SEARCH_TYPE.inOnly ? START_SEQ_NO_IDF_PATCHCABLE : SEQ_NO_IN_PATCHCABLE;
                }
            }
            lineConnection = getEmptyLineConnection(2, true, seqNo);
        }
        return lineConnection;
    }

    /**
     * 登録方法を変更する（仮登録/新設）
     * @param {number} tempType 登録方法
     * @param {boolean} hasTemp 仮登録ありかどうか
     */
    changeTempType(tempType, hasTemp = null) {
        const { editLine } = this.state;
        let update = _.cloneDeep(editLine);
        update.tempType = hasTemp !== false ? convertNumber(tempType) : null;
        update.hasTemp = hasTemp;
        if (this.props.projectType === PROJECT_TYPE.new) {
            update.lineConnections = [ getEmptyLineConnection(1) ]
            update.wiringType && update.lineConnections.push(getEmptyLineConnection(2));
        } else {
            const seqNo = tempType === LINE_TEMP_TYPE.inOnly ? SEQ_NO_IN_PATCHCABLE : START_SEQ_NO_IDF_PATCHCABLE;
            update.lineConnections = [ getEmptyLineConnection(1, true, seqNo) ];
            update.wiringType && update.lineConnections.push(getEmptyLineConnection(2, true, seqNo));
        }

        this.setState({
            editLine: update,
            isErrorLineConnections: true,
            searchKey: {
                patchboardId: null,
                patchCableNo: null
            }
        }, this.onChangeTempType(tempType, hasTemp, update.wiringType ? true : false));
    }

    /**
     * 検索方法を変更する（撤去/修正（仮登録）/修正（残置））
     * @param {number} searchType 検索方法
     */
    changeSearchType(searchType) {
        const { editLine } = this.state;
        const { projectType } = this.props;
        let update = _.cloneDeep(editLine);
        update.searchType = searchType;
        if ([PROJECT_TYPE.change, PROJECT_TYPE.left].includes(projectType) || (projectType===PROJECT_TYPE.remove&&searchType===LINE_SEARCH_TYPE.inUse)) {
            update.lineConnections = [ getEmptyLineConnection(1) ]
            update.wiringType && update.lineConnections.push(getEmptyLineConnection(2));
        } else {
            let seqNo = searchType === LINE_SEARCH_TYPE.inOnly ? SEQ_NO_IN_PATCHCABLE : START_SEQ_NO_IDF_PATCHCABLE;
            if (isFixProjectType(projectType)) {    
                seqNo = searchType === LINE_SEARCH_TYPE.inOnly ? START_SEQ_NO_IDF_PATCHCABLE : SEQ_NO_IN_PATCHCABLE;
                update.beforeLineConnections = [];
            }
            update.lineConnections = [ getEmptyLineConnection(1, true, seqNo) ];
            update.wiringType && update.lineConnections.push(getEmptyLineConnection(2, true, seqNo));
        }
        this.setState({
            editLine: update,
            isErrorLineConnections: true,
            searchKey: {
                patchboardId: null,
                patchCableNo: null
            },
            fixSelectedPatchCable: null
        }, this.onChangeSearchType(searchType, update.wiringType ? true : false));
    }

    /**
     * 検索欄の修正前配線盤/線番変更
     */
    changeBeforePatchCable() {
        const { editLine } = this.state;
        let update = _.cloneDeep(editLine);
        update.beforeLineConnections = [];
        this.setState({
            editLine: update,
            searchKey: {
                patchboardId: null,
                patchCableNo: null
            },
        }, this.onSelectBeforePatchCable())
    }

    /**
     * 保存が無効かどうかを取得する
     * @param {object} validate 入力検証結果
     * @param {boolean} isErrorLineConnections 線番欄がエラーかどうか
     * @returns {boolean} 保存が無効かどうか
     */
    invalid(validate, isErrorLineConnections) {
        var invalid = false;
        for (const key in validate) {
            if (validate.hasOwnProperty(key)) {
                if (validate[key].state !== VALIDATE_STATE.success) {
                    invalid = true;
                    break;
                }
            }
        }
        if (!invalid) {
            invalid = isErrorLineConnections;
        }
        return invalid;
    }
    
    //#endregion

    //#region 検索した回線情報関係

    /**
     * 検索した回線情報を取得する
     * @param {object} before 変更前
     * @param {object} line 更新する元データ
     * @param {number} projectType 工事種別
     */
    getSearchedLine(before, line, overwrite, projectType) {
        const update = _.cloneDeep(before);
        if (overwrite) {
            update.lineNo = line.lineNo;
            update.lineId1 = line.lineId1;
            update.lineId2 = line.lineId2;
            update.lineId3 = line.lineId3;
            update.lineName = line.lineName;
            update.location = line.location ? _.cloneDeep(line.location) : null;
            update.memo = line.memo;
        }
        update.wiringType = line.wiringType ? _.cloneDeep(line.wiringType) : null;
        if (!isFixProjectType(projectType)) {
            if (projectType === PROJECT_TYPE.new) {
                update.lineConnections = this.getUpdateLineConnectionsByTempType(line.lineConnections, update.tempType);
            } else {
                update.lineConnections = line.lineConnections ? _.cloneDeep(line.lineConnections) : [];
            }
        } else {
            update.beforeLineConnections = line.lineConnections ? _.cloneDeep(line.lineConnections) : [];

            //LineConnection(変更後の線番情報)も更新
            if (update.lineConnections.length !== update.beforeLineConnections.length) {
                let isAdd = update.lineConnections.length < update.beforeLineConnections.length;
                update.lineConnections = this.getUpdateSecondLineConnectionsBySearchType(update.lineConnections, update.searchType, isAdd);
            }
        }
        update.openDate = line.openDate;
        update.closeDate = line.closeDate;
        return update;
    } 

    /**
     * 更新した回線線番情報を取得する
     * @param {number} seriesNo 局入系統No
     * @param {array} patchCableSequences 回線線番情報
     * @returns 回線線番情報（LineConnection型）
     */
    getUpdateLineConnectionsByTempType(searchedlineConnections, tempType) {
        return searchedlineConnections.map((item) => {
            let updateConnection = _.cloneDeep(item);
            if (tempType === LINE_TEMP_TYPE.inOnly) {
                updateConnection.patchCableSequences.push({
                    seqNo: START_SEQ_NO_IDF_PATCHCABLE,
                    patchboardId: null,
                    patchboardName: null,
                    patchCableNo: null
                })
            } else {
                updateConnection.patchCableSequences.unshift({
                    seqNo: SEQ_NO_IN_PATCHCABLE,
                    patchboardId: null,
                    patchboardName: null,
                    patchCableNo: null
                })
            }
            return updateConnection;
        });
    }

    /**
     * 線番(2)の回線情報を更新する
     * @param {array} lineConnections 回線情報一覧
     * @param {number} searchType 検索方法
     * @param {boolean} isAdd 追加かどうか
     */
    getUpdateSecondLineConnectionsBySearchType(lineConnections, searchType, isAdd) {
        var updates = _.cloneDeep(lineConnections);
        var seqNo = searchType === LINE_SEARCH_TYPE.inOnly ? START_SEQ_NO_IDF_PATCHCABLE : SEQ_NO_IN_PATCHCABLE;
        if (isAdd) {
            updates.push(getEmptyLineConnection(2, true, seqNo));
        } else {
            updates.pop();
        }        
        return updates;
    }

    //#endregion

    //#region 線番選択関係

    /**
     * 線番一覧をstateにセットする
     * @param {array} lineConnections 線番一覧
     * @param {boolean} isError 線番欄がエラーかどうか
     * @param {function} callback コールバック関数
     */
    setLineConnections(lineConnections, isError, callback) {
        let update = _.cloneDeep(this.state.editLine);
        update.lineConnections = _.cloneDeep(lineConnections);
        this.setState({
            editLine: update,
            isErrorLineConnections: isError,
            searchKey: {
                patchboardId: null,
                patchCableNo: null
            }
        }, callback && callback());
    }

    /**
     * 線番一覧を変更する
     * @param {array} lineConnections 線番一覧
     * @param {boolean} isError 線番欄がエラーかどうか
     * @param {number} seriesNo 局入系統No
     * @param {number} seqNo 変更した回線線番No
     * @param {boolean} isClear クリアするかどうか
     */
    changeLineConnections(lineConnections, isError, seriesNo = null, seqNo = null, isClear = true) {
        this.setLineConnections(lineConnections, isError, () => {
            if (seqNo && seqNo >= START_SEQ_NO_IDF_PATCHCABLE) {
                isClear && this.onClearPatchCables(seriesNo, seqNo + 1);
            }
        });
    }

    /**
     * 局入配線盤選択を変更する（工事種別：新設（仮登録なし））
     * @param {number} seriesNo 局入系統No
     * @param {number} patchboardId 配線盤ID
     * @param {array} lineConnections 線番一覧
     * @param {boolean} isError 線番欄がエラーかどうか
     */
    changeInPatchborad(seriesNo, patchboardId, lineConnections, isError) {
        this.setLineConnections(lineConnections, isError, () => this.onSelectInPatchboard(seriesNo, patchboardId));
    }

    /**
     * 局入配線盤/線番選択を変更する（工事種別：新設（局入のみ） / 撤去（使用中・局入のみ））
     * @param {array} lineConnections 線番一覧
     * @param {boolean} isError 線番欄がエラーかどうか
     */
    changeInPatchCable(lineConnections, isError) {
        this.setLineConnections(lineConnections, isError, () => this.onSelectInPatchCable())
    }

    /**
     * IDF配線盤/線番選択を変更する（工事種別：新設（構内のみ）/ 撤去（構内のみ））
     * @param {array} lineConnections 線番一覧
     * @param {boolean} isError 線番欄がエラーかどうか
     */
    changeIdfPatchCable(lineConnections, isError) {
        this.setLineConnections(lineConnections, isError, () => this.onSelectIdfPatchCable())
    }
    
    /**
     * 回線線番をクリアする
     * @param {number} seriesNo 局入系統No
     * @param {number} seqNo クリアする回線線番No
     * @param {array} lineConnections 線番一覧
     * @param {boolean} isError 線番欄がエラーかどうか
     */
    clearLineConnection(seriesNo, seqNo, lineConnections, isError) {
        this.setLineConnections(lineConnections, isError, () => this.onClearPatchCables(seriesNo, seqNo));
    }

    /**
     * 回線線番を追加する
     * @param {number} seriesNo 局入系統No
     * @param {number} patchboardId 配線盤ID
     * @param {array} lineConnections 線番一覧
     * @param {boolean} isError 線番欄がエラーかどうか
     * @param {function} callback コールバック関数
     */
    addPatchCable(seriesNo, patchboardId, lineConnections, isError, callback) {      
        if (this.props.onAddPatchCable) {
            this.props.onAddPatchCable(seriesNo, patchboardId, (isSuccess) => {
                if (isSuccess) {
                    this.setLineConnections(lineConnections, isError);
                    callback && callback();
                }
            });
        }
    }

    /**
     * 回線情報を検索する
     * @param {number} patchCableSequence 検索する回線情報
     */
    searchLine(patchCableSequence) {
        const { projectType } = this.props;
        const { editLine } = this.state;
        const searchLineFunction = (overwrite) => {
            if (this.props.onSearchLine) {
                this.setState({ 
                    searchKey: { 
                        patchboardId: patchCableSequence.patchboardId , 
                        patchCableNo: patchCableSequence.patchCableNo.no 
                    }, 
                    overwrite, 
                    searching: true 
                }, () => {
                    this.props.onSearchLine(patchCableSequence.patchboardId, patchCableSequence.patchCableNo.no, projectType, editLine.tempType, editLine.searchType);
                    this.hideMessageModal();
                });
            }
        }
        
        if (!this.state.isReadOnly) {
            this.showYesNoModal('線番/ワイヤは検索した回線情報が適用されます。\r\n回線ID/回線名/ロケーション/備考も上書きしてよろしいですか？', searchLineFunction);
        } else {
            searchLineFunction(true);
        }
    }

    /**
     * 回線線番欄のエラーを変更する
     * @param {boolean} isError エラーかどうか
     */
    changeErrorLineConnections(isError) {
        this.setState({
            isErrorLineConnections: isError
        });
    }
    
    //#endregion

    //#region 入力検証

    /**
     * 備考の入力検証
     * @param {string} memo 備考
     * @returns { state:'', helpText:'' }　検証結果
     */
    validateMemo(memo) {
        return validateTextArea(memo, MAXLENGTH_MEMO, false);    
    }

    /**
     * 検証結果を取得する
     * @param {object} targetValidate 更新する検証結果
     * @param {string} key オブジェクトのキー
     * @returns {object} 更新後の検証結果
     */
    getValidate(targetValidate, key) {
        var validate = Object.assign({}, this.state.validate);
        if (validate.hasOwnProperty(key) && targetValidate) {
            validate[key] = targetValidate;
        }        
        return validate;
    }

    //#endregion

    //#region メッセージモーダル

    /**
     * メッセージモーダルを閉じる
     */
    hideMessageModal() {
        this.setState({ modalInfo: { show: false, title: '', buttonStyle:'message',  callback: null,  message: '' }});
    }

    /**
     * 確認メッセージを表示する
     * @param {string} message メッセージ
     */
    showConfirmModal(message, callback) {
        this.setState({ 
            modalInfo: { 
                show: true, 
                title: '確認', 
                buttonStyle:'confirm', 
                message: message,
                callback: callback,  

            }
        });
    }

    /**
     * エラーメッセージを表示する
     * @param {string} message メッセージ
     */
    showErrorMessageModal(message, callback) {
        this.setState({ 
            modalInfo: { 
                show: true, 
                title: 'エラー', 
                buttonStyle:'message', 
                message: message,
                callback: callback,  
            }
        });
    }

    /**
     * YesNo確認モーダルを表示する
     * @param {string} message 確認メッセージ
     * @param {function} callback 確認後のコールバック関数
     */
    showYesNoModal(message, callback) {
        this.setState({ 
            modalInfo: { 
                show: true, 
                title: '確認', 
                buttonStyle:'yesNo', 
                message: message,
                callback: callback
            }
        });
    }

    //#endregion

    //#region その他

    
    /**
     * 線番(1)に表示する局入連番を取得する
     * @param {array} lineConnections 回線接続一覧
     * @param {number} projectType 工事種別
     * @param {number} hasTemp 仮登録ありかどうか
     * @param {object} searchKey 検索したキー
     */
    getFirstSeriesNo(lineConnections, projectType, hasTemp, searchKey) {
        var seriseNo = FIRST_SERIES_NO;
        if (isSearchable(projectType, hasTemp) && !isFixProjectType(projectType) && lineConnections && searchKey.patchboardId !== null && searchKey.patchCableNo !== null ) {
            const searchConnection = lineConnections.find((connection) => connection.patchCableSequences.some((sequence) => sequence.patchboardId === searchKey.patchboardId && (sequence.patchCableNo && sequence.patchCableNo.no === searchKey.patchCableNo)));
            seriseNo = searchConnection ? searchConnection.seriesNo : seriseNo;
        }
        return seriseNo;

        
    }

    /**
     * 工事種別：修正にて、検索欄の選択中の線番情報を取得する
     * @param {array} lineConnections 回線接続一覧
     * @param {number} projectType 工事種別
     * @param {number} searchType 検索方法
     */
    getFixSelectedPatchCable(lineConnections, projectType, searchType) {
        var patchCable = null;
        if (isFixProjectType(projectType)) {
            let lineConnection = lineConnections && lineConnections.find((connection) => connection.seriesNo === FIRST_SERIES_NO);
            if (searchType === LINE_SEARCH_TYPE.inOnly) {
                patchCable = lineConnection && lineConnection.patchCableSequences.find((sequence) => sequence.seqNo === SEQ_NO_IN_PATCHCABLE);
            } else {
                let seqNos = lineConnection && lineConnection.patchCableSequences.map((sequence) => sequence.seqNo);
                let maxSeqNo = seqNos && seqNos.length > 0 ? Math.max.apply(null, seqNos) : 0;
                patchCable = lineConnection && lineConnection.patchCableSequences.find((sequence) => sequence.seqNo === maxSeqNo);
            }
        }
        return patchCable;
    }

    //#endregion

}

LineSelectModal.propTypes = {
    show: PropTypes.bool,
    line: PropTypes.object,
    wiringTypes: PropTypes.array,
    locations: PropTypes.array,
    linePatchCableSelections: PropTypes.array,
    beforeLinePatchCableSelections: PropTypes.array,
    usedPatchCables: PropTypes.array,
    usedBeforePatchCables: PropTypes.array,
    searchedLine: PropTypes.object,
    projectType: PropTypes.number,
    isLoading: PropTypes.bool,
    onApply: PropTypes.func,
    onCancel: PropTypes.func,
    onAddPatchCable: PropTypes.func,
    onClearPatchCables: PropTypes.func,
    onSelectInPatchboard: PropTypes.func,
    onSelectInPatchCable: PropTypes.func,
    onSelectIdfPatchCable: PropTypes.func,
    onClearLinePatchCables: PropTypes.func,
    onAddLinePatchCables: PropTypes.func,
    onSearchLine: PropTypes.func,
    onChangeTempType: PropTypes.func,
    onChangeSearchType: PropTypes.func,
    onSelectBeforePatchCable: PropTypes.func,
}