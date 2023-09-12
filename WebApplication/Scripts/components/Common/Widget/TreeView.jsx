/**
 * @license Copyright 2018 DENSO
 * 
 * ツリービュー表示
 * bootstrap-treeviewを使用。
 * 
 */
'use strict';
 
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormGroup, ControlLabel, FormControl, InputGroup, OverlayTrigger, Button, Tooltip, ButtonGroup, ButtonToolbar, ListGroup, ListGroupItem } from 'react-bootstrap';
import Icon from 'Common/Widget/Icon';
import { escapeHtml, escapeRegExp } from 'stringUtility';
import { compareDescending } from 'sortCompare';

/**
 * ツリービューを表示します。
 * 表示させる場合、ノードデータの配列を渡す必要があります。
 * @param {array} data ノードデータ
 * @param {boolean} showCheckbox チェックボックスを表示するか
 * @param {boolean} expandAll すべて展開するか、すべて閉じるか
 * @param {function} onNodeSelect ノード選択時に呼び出す
 * @param {function} onNodeCheckChanged ノードのチェック状態が変更されたときに呼び出す
 * @param {function} onNodeExpand ノードが展開されたときに呼び出す
 * @param {function} onNodeCollapse ノードが閉じたときに呼び出す
 * @param {boolean} searchable 検索可能とするかどうか
 * @param {boolean} defaultCollapse 初期状態を閉じた状態にするかどうか
 * @param {number} maxHeight ツリービューの高さ（検索ボックスは含まない）
 * @param {number} levels デフォルトでノードを開いておくツリーの深さ(デフォルト1)
 */
export default class TreeView extends Component {

    /**
     * コンストラクタ
     */
    constructor(props) {
        super(props);
        this.state = {
            searchString: '',
            searchResults: []
        };
    }

    /**
     * Componentがマウントされるときに1度だけ呼ばれます。
     */
    componentDidMount(){
        const { data, defaultCollapse } = this.props;
        if(data){
            this.updateTreeView(data);
            if (defaultCollapse) {
                this.collapseAll(); //ノードをすべて閉じた状態で初期表示
            }
        }
    }

    /**
     * Componentをアップデートするかどうか。
     * @param prevProps アップデート前のprops
     * @param prevState アップデート前のstate
     */
    shouldComponentUpdate(prevProps, prevState) {
        //データが変更されている場合はアップデート
        if (this.props !== prevProps) {
            return true;
        }
        if (this.state.searchString !== prevState.searchString
            || this.state.searchResults !== prevState.searchResults
            || this.state.searchMode !== prevState.searchMode
        ) {
            return true;
        }
    }

    /**
     * Componentがアップデートされる前に呼ばれます。
     * @param {any} nextProps
     * @param {any} nextState
     */
    componentWillUpdate(nextProps, nextState) {
        if (nextState.searchMode && !this.state.searchMode) {
            //this.remove();
        }
    }

    /**
     * Componentがアップデートさえたときに呼ばれます。
     * @param prevProps アップデート前のprops
     * @param prevState アップデート前のstate
     */
    componentDidUpdate(prevProps, prevState) {
        //データが変更されている場合のみツリービューを更新する
        if (JSON.stringify(this.props.data) !== JSON.stringify(prevProps.data)) {
            this.updateTreeView(this.props.data);
        }
    }

    /**
     * Componentが新たなPropsを受け取ったときに呼ばれます。
     * @param nextProps アップデート後のprops
     */
    componentWillReceiveProps(nextProps) {
        if (nextProps.checkMode !== this.props.checkMode) { //モードが変更された場合
            if (nextProps.checkMode === "individual") {
                this.clearLinkageNodeState();
            }
            else {
                this.changeLinkageNode(this.state.searchResults);
            }
        }
    }

    /*********************************************
     * ツリービューの更新
     *********************************************/
    
    /**
     * ツリービューを更新する
     * @param {array} data ツリーデータ
     */
    updateTreeView(data) {
        const { showCheckbox, levels, isGetDuplicateSelectEvent, disabled } = this.props;

        const tree = $(this.refs.tree);
        tree.treeview({
            data: this.escapeHtmlData(data),
            showCheckbox: showCheckbox,
            multiSelect: showCheckbox||isGetDuplicateSelectEvent? true:false,
            levels: levels ? levels : 1,
            expandIcon: "fal fa-plus",
            collapseIcon: "fal fa-minus",
            checkedIcon: 'fal fa-check-square tree-checkbox',
            uncheckedIcon: 'fal fa-square tree-checkbox',
            highlightSelected: showCheckbox? false:true,
        }).on('nodeSelected', (event, node) => {
            if (showCheckbox || this.props.disabled || node.unselectable) {
                //チェックボックス表示時はselectしない
                this.unselectNode(node.nodeId, true);
            }
            else {
                const selectedNodes = this.getSelectedNodes();
                if (selectedNodes) {
                    //選択状態を解除する。（1つのみの選択状態を有効とする）
                    selectedNodes.forEach((item) => {
                        if (node.nodeId !== item.nodeId) {
                            this.unselectNode(item.nodeId);
                        }
                    })
                    this.handleNodeSelect(node);
                }
            }
        }).on('nodeUnselected', (event, node) => {
            if (showCheckbox || this.props.disabled || node.unselectable) {
                //チェックボックス表示時はselectしない
                this.selectNode(node.nodeId, true);
            }
            else{
                //チェックボックス表示時以外
                if (this.getSelectedNodes().length === 0) {
                    this.selectNode(node.nodeId, true); //選択状態解除を無効化する（選択したノードを再度クリックすると、選択状態が解除されてしまうため。）
                    if (isGetDuplicateSelectEvent) {
                        this.handleNodeSelect(node);
                    }
                }
            }
        }).on('nodeChecked ', (event, node) => {
            this.updateCheckState(node);
            this.changeLinkage(this.state.searchResults);
            this.handleChangeNodeChecked(this.getCheckedNodes());
        }).on('nodeUnchecked ', (event, node) => {
            this.updateCheckState(node);
            this.changeLinkage(this.state.searchResults);
            this.handleChangeNodeChecked(this.getCheckedNodes());
        }).on('nodeCollapsed', (event, node) => {
            this.handleCollapseNode(node);
        }).on('nodeExpanded',  (event, node) => {
            this.handleExpandNode(node);
        }).on('searchComplete ', (event, results) => {
            if (showCheckbox) {
                this.setState({ searchResults: $.extend(true, [], results) });
                this.handleSearchComplete(results);
            } else {
                $(this.refs.tree).find('.search-result').get(0).scrollIntoView(true);
            }
        }).on('searchCleared  ', (event, results) => {
            if (showCheckbox) {
                this.collapseAll();
                this.changeAllNodeChecked(false);
                this.handleSearchCleared(results);
            }
        });

        this.revealNode();
    }

    /**
     * エスケープ処理を行う
     * @param {array} data ツリーデータ
     */
    escapeHtmlData(data) {
        var treeData = [];
        if (data && data.length > 0) {
            treeData = data.map((node) => {
                node.text = escapeHtml(node.text)
                if (node.nodes && node.nodes.length > 0) {
                    node.nodes = this.escapeHtmlData(node.nodes);      //再帰処理
                }                
                return node;
            });         
        }
        return treeData;
    }

    /**
     * ルートノードから選択されたノードを展開する
     */
    revealNode(){
        var selectedNodes = this.getSelectedNodes();
        if (!(selectedNodes.length == 0)) {
            $(this.refs.tree).treeview('revealNode', [selectedNodes[0].nodeId, { silent: true } ]);
        }
    }

    /**
     * ノードを選択状態にする
     * @param {number} nodeId ノードID
     */
    selectNode(nodeId, silent = false) {
        $(this.refs.tree).treeview('selectNode', [nodeId, { silent: silent }]);
    }

    /**
     * ノードを未選択状態にする
     * @param {number} nodeId ノードID
     */
    unselectNode(nodeId, silent = false){
        $(this.refs.tree).treeview('unselectNode', [nodeId, { silent: silent }]);
    }

    /*********************************************
     * ツリービューの関数
     *********************************************/
    
    /**
     * ノードをすべて展開する
     */
    expandAll(){
        $(this.refs.tree).treeview('expandAll');
    }

    /**
     * 指定されたノードまで展開する
     * @param {number} nodeId ノードID 
     */
    expandNode(nodeId) {
        $(this.refs.tree).treeview('revealNode', nodeId);
    }

    /**
    * 指定されたノードを展開する
    * @param {number} nodeId ノードID 
    */
    expandTargetNode(nodeId) {
        $(this.refs.tree).treeview('expandNode', nodeId);
    }

    /**
     * ノードをすべて閉じる
     */
    collapseAll(){
        $(this.refs.tree).treeview('collapseAll');
    }

    /**
     * すべてのノードを無効にする
     */
    disableAll() {
        $(this.refs.tree).treeview('disableAll');
    }

    /**
     * すべてのノードを有効にする
     */
    enableAll() {
        $(this.refs.tree).treeview('enableAll');
    }

    remove() {
        $(this.refs.tree).treeview('remove');
    }

    /**
     * 選択されたノードを取得する
     * @returns {array} 選択されたノードの配列
     */
    getSelectedNodes(){
        return $(this.refs.tree).treeview('getSelected');
    }
    
    /**
     * チェックされたノードを取得する
     * @returns {array} チェックされたノード全て
     */
    getCheckedNodes(){
        return $(this.refs.tree).treeview('getChecked');
    }

    /**
     * 指定されたノードを取得する
     * @returns {number} nodeId 
     */
    getNode(nodeId) {
        return $(this.refs.tree).treeview('getNode', nodeId);
    }

    /**
     * 有効なノードを取得する
     * @param {any} nodeId
     */
    getEnableNode(nodeId) {
        return $(this.refs.tree).treeview('getEnabled', nodeId);
    }

    /**
     * 展開されているノードを取得する
     */
    getExpanded() {
        return $(this.refs.tree).treeview('getExpanded');
    }

    /*********************************************
     * チェック状態の変更
     *********************************************/
    
    /**
     * チェック状態の変更に合わせて親と子のチェック状態を更新する
     * @param node チェックが変更されたノード
     */
    updateCheckState(node){        
        if (this.props.checkMode === "collective") {
            //まとめてチェックの場合
            this.updateParentCheckedState(node); //親ノードのチェック状態変更    
            this.updateChildrenCheckedState(node, node.state.checked); //子ノードのチェック状態変更
        }
    }

    /**
     * チェック状態の変更に合わせて親と子のチェック状態を更新する
     * @param {*} nodes チェックが変更されたノード
     */
    updateMultiCheckState(nodes, isCheck) {
        let childnodes = [];
        if (this.props.checkMode === "collective") {
            nodes.forEach((node) => {
                childnodes = childnodes.concat(this.getChildrenNodes(node));             
            });
            this.changeNodeMultiChecked(childnodes, isCheck);
            
            let targetNodes = this.getFilterNodesByParentId(nodes).sort((current, next) => compareDescending(current.level, next.level));
            targetNodes.forEach((node) => {
                this.updateParentCheckedState(node); //親ノードのチェック状態変更 
            });
        }        
    }

    /**
     * 親ノードのチェック状態を変更する
     * @param {object} targetNode 対象ノード
     */
    updateParentCheckedState(targetNode){
        var parent = (targetNode.parentId !== undefined) ? $(this.refs.tree).treeview('getParent', [targetNode]) : undefined;
        var checked = true;

        if (parent) {
            //兄弟ノードのチェック状態を確認
            var nodes = parent.nodes;
            if (nodes) {
                nodes.forEach(node => {
                    if (!node.state.checked) {
                        checked = false;
                    }
                });
            }

            //親ノードのチェック状態を変更
            if (parent.state.checked !== checked) {
                this.changeNodeChecked(parent, checked);
            }

            //親ノードの親も更新
            this.updateParentCheckedState(parent);
        }
    }

    /**
     * 子ノードの状態を変更する
     * @param {object} targetNode 対象ノード
     * @param {boolean} checked チェックするかどうか

     */
    updateChildrenCheckedState(targetNode, checked){      
        this.changeNodeMultiChecked(this.getChildrenNodes(targetNode), checked);
    }

    /**
     * 子ノードを取得する
     * @param {object} targetNode 対象ノード
     * @returns {array} 子ノード群
     */
    getChildrenNodes(targetNode) {
        if (!targetNode.nodes) {
            return [];
        } 
        var childrenNodes = targetNode.nodes;
        targetNode.nodes.forEach((n) => {
            childrenNodes = childrenNodes.concat(this.getChildrenNodes(n));
        });
        return childrenNodes;
    }
    
    /**
     * ノードのチェック状態を変更する（指定されたノードのみ。親や子ノードは含まれない）
     * @param node 対象ノード
     * @param checked チェックするかどうか
     */
    changeNodeChecked(node, checked){
        if (checked) {
            $(this.refs.tree).treeview('checkNode', [ node.nodeId, { silent: true } ]);
        } else {
            $(this.refs.tree).treeview('uncheckNode', [ node.nodeId, { silent: true } ]); 
        }
    }

    /**
     * ノードのチェック状態を変更する（指定されたノードのみ。親や子ノードは含まれない）
     * @param node 対象ノード
     * @param checked チェックするかどうか
     */
    changeNodeMultiChecked(nodes, checked){
        var nodeIds = _.map(nodes, 'nodeId');
        if (checked) {
            $(this.refs.tree).treeview('checkNode', [ nodeIds, { silent: true } ]);
        } else {
            $(this.refs.tree).treeview('uncheckNode', [ nodeIds, { silent: true } ]); 
        }
    }

    /**
     * 全てノードのチェック状態を変更する
     * @param {any} checked
     * @param {any} silent
     */
    changeAllNodeChecked(checked, silent=false) {
        if (checked) {
            $(this.refs.tree).treeview('checkAll', { silent: silent });
        } else {
            $(this.refs.tree).treeview('uncheckAll', { silent: silent });
        }
    }
    
    /*********************************************
     * ノードの配置
     *********************************************/
    
    /**
     * ノードの配置を取得する
     * @param node 対象ノード
     */
    getNodePosition(node) {
        var position = [];

        position.unshift(node);
        if (node.parentId !== undefined) {
            var parent = $(this.refs.tree).treeview('getParent', node);
            position.unshift(...this.getNodePosition(parent));
        }

        return position;
    }

    /*********************************************
     * イベント発生
     *********************************************/
    
    /**
     * ノード選択イベントを発生させる
     * @param node 選択されたノード
     */
    handleNodeSelect(node){
        if (this.props.onNodeSelect) {
            var positionList = this.getNodePosition(node);      //ツリーの配置
            this.props.onNodeSelect(node, positionList);
        }
    }
    
    /**
     * ノードのチェック変更イベントを発生させる
     * @param node チェックされたノード全て
     */
    handleChangeNodeChecked(nodes){
        if (this.props.onNodeCheckChanged) {
            this.props.onNodeCheckChanged(nodes);
        }
    }

    /**
     * ノード展開イベントを発生させる
     * @param node 対象ノード
     */
    handleExpandNode(node){
        if (this.props.onNodeExpand) {
            this.props.onNodeExpand(node);
        }
    }

    /**
     * ノード閉じるイベントを発生させる
     * @param node 対象ノード
     */
    handleCollapseNode(node){
        if (this.props.onNodeCollapse) {
            this.props.onNodeCollapse(node);
        }
    }

    /**
     * 検索完了イベントを発生させる
     * @param results 検索結果
     */
    handleSearchComplete(results) {
        if (this.props.onSarchComplete) {
            this.props.onSearchComplete(results);
        }
    }

    /**
     * 検索クリアイベントを発生させる
     */
    handleSearchCleared(results) {
        if (this.props.onSearchCleared) {
            this.props.onSearchCleared(results);
        }
    }

    /*********************************************
     * 検索
     *********************************************/
    
    /**
     * ノードを検索する
     * @param {string} searchString　検索文字列
     */
    searchNodes(searchString) {
        var options = {
            ignoreCase: true,       //大文字と小文字を区別しない
            exactMatch: false,      //like or equals 
            revealResults: true     //一致するノードを表示
        };
        let escapeSearchString = escapeRegExp(searchString)
        escapeSearchString = escapeHtml(escapeSearchString);
        let searchWords = escapeSearchString.split(/\s+/);
        let searchPattern = '';
        if (searchWords.length == 1) {
            searchPattern = searchWords[0];
        } else {
            searchWords.forEach((word) => {
                searchPattern += `(?=.*${word})`;
            });
            searchPattern += '.';
        }
        $(this.refs.tree).treeview('search', [searchPattern, options]);
    }

    /**
     * 検索をクリアする
     */
    clearSearch() {
        $(this.refs.tree).treeview('clearSearch');
    }

    /**
     * 検索フォーム入力イベントハンドラ
     * @param {string} inputString 入力文字列
     */
    handleChange(inputString) {
        this.setState({ searchString: inputString });
    }

    /**
     * 検索ボタンクリックイベントハンドラ
     */
    handleClickSearch() {
        if (this.props.showCheckbox) {
            this.setState({ searchMode: true });
            this.props.onSearchModeChanged(true);
            this.changeAllNodeChecked(false);
        }
        this.searchNodes(this.state.searchString);
    }

    /**
     * 検索クリアボタンクリックイベントハンドラ
     */
    handleClickSearchClear() {
        this.setState({ searchString: '', searchMode: false });
        this.props.onSearchModeChanged(false);
        this.clearSearch();
    }

    /**
     * 検索結果にチェックを入れる/はずすボタンクリックイベントハンドラ
     * @param string 入力文字列
     */
    handleClickAllCheck(isCheck) {
        const { searchResults } = this.state;
        if (searchResults.length > 0) {
            var targetNodes = [];
            const newSearchResults = searchResults.map((node) => {
                //チェックが変更されていたときのみチェックを変更する
                if (node.state.checked !== isCheck) {
                    targetNodes.push(node);
                    const obj = jQuery.extend(true, {}, node);
                    obj.state.checked = isCheck;
                    return obj;
                }
                return node;
            });
            this.setState({ searchResults: newSearchResults });
            this.changeNodeMultiChecked(targetNodes, isCheck);
            this.handleChangeNodeChecked(this.getCheckedNodes());       //チェック変更イベントを発生させる
        }
    }

    /**
     * 検索結果の1つにチェックを入れる/はずすクリックイベントハンドラ
     */
    handleClickCheck(isCheck, node) {
        const { searchResults } = this.state;

        const newSearchResults = searchResults.map((n) => {
            if (n.id === node.id) {
                const obj = jQuery.extend(true, {}, n);
                obj.state.checked = isCheck;
                return obj;
            }
            return n;
        });

        this.setState({ searchResults: newSearchResults });
        this.changeNodeMultiChecked([node], isCheck);
        this.handleChangeNodeChecked(this.getCheckedNodes());
    }

    /**
     * 検索結果に連動してチェックされるノードの状態変更
     * @param results 検索結果
     */
    changeLinkageNode(results) {
        const m_treeview = $(this.refs.tree).data('treeview');

        if (results.length > 0) {
            this.updateChildrenNodeState(results, m_treeview);     //子ノード更新
            this.updateParentNodeState(results, m_treeview);    //親ノード更新
        }

    }

    /**
     * 検索結果に連動してチェックされるノードの検索状態をクリアする
     */
    clearLinkageNodeState(updateData) {
        const m_treeview = $(this.refs.tree).data('treeview');
        const redCheckboxNodes = m_treeview.getSelected();
        redCheckboxNodes &&
            m_treeview.unselectNode(_.map(redCheckboxNodes, 'nodeId'), { silent:true });
    }

    /*********************************************
     * まとめてチェックモードの場合に使用する関数
     *********************************************/

    /**
    * 連動してチェックされるノードの状態を変更する
    * @param {object} results 検索にヒットしたノードの配列
    */
    changeLinkage(results) {
        if (this.props.checkMode === 'collective') {
            this.clearLinkageNodeState();
            this.changeLinkageNode($.extend(true, [], results));
        }
    }

    /**
    * 親ノードの状態を変更する
    * @param {object} results 検索にヒットしたノードの配列
    */
    updateParentNodeState(results, treeview) {
        let selected = [];
        results.forEach((node) => {
            selected = selected.concat(this.getUpdateTargetParentNodeIds(node, results, treeview));
        });
        selected = this.filterUniqueId(selected); 
        treeview.selectNode(selected, { silent: true } );
    }

    /**
    * 親ノードの状態を変更する対象のノードIDを取得する
    * @param {object} targetNode 対象ノード
    * @param {object} results 検索にヒットしたノードの配列
    */
    getUpdateTargetParentNodeIds(targetNode, results, treeview) {
        var parent = (targetNode.parentId !== undefined) ? treeview.getParent(targetNode) : undefined;
        let selected = [];

        if (parent) {
            //親ノードを持つ場合
            if (!this.existMatchNode(parent.nodeId, results) && !parent.state.selected) {
                //親ノードが検索結果にヒットしていないかつ選択状態じゃない場合
                var nodes = parent.nodes;   //対象ノードの兄弟ノード取得
                if (nodes) {
                    const existNotTarget= nodes.some((node) => {
                        if (!this.existMatchNode(node.nodeId, results) && !node.state.selected) {
                            //検索条件にヒットしていないかつ選択状態でもないものがある場合親ノードは選択状態にしない
                            return true;
                        };
                    })
                    if (!existNotTarget) {  //すべての子ノードがチェック対象となる場合
                        selected.push(parent.nodeId);
                    }
                }
                //親ノードの親も更新
                selected.concat(this.getUpdateTargetParentNodeIds(parent, results, treeview));
            }            
        }

        return selected;
    }

    /**
     * ノードIDが一致するノードが配列内にあるかどうか
     * @param {object} targetId 検索元ノードID
     * @param {array} array 検索先配列
     */
    existMatchNode(targetId, array) {
        return array.some((node) => {
            return node.nodeId === targetId;
        });
    }

    /**
     * 子ノードを展開してチェックボックスを赤く（選択状態に）する
     * @param {object} results 検索にヒットしたノードの配列
     */
    updateChildrenNodeState(results, treeview) {
        let selected = [];
        let expanded = [];
        results.forEach((node) => {
            let updateTargetIds = this.getUpdateTargetChildrenNodeIds(node, results);
            selected = selected.concat(updateTargetIds.selected);
            expanded = expanded.concat(updateTargetIds.expanded);
        });
        selected = this.filterUniqueId(selected);
        expanded = this.filterUniqueId(expanded);
        treeview.selectNode(selected, { silent: true} );
        treeview.expandNode(expanded);
    }

    /**
     * 子ノードを展開、選択状態にする対象のノードIdを取得する
     * @param {object} targetNode 対象ノード
     * @param {object} results 検索にヒットしたノードの配列
     */
    getUpdateTargetChildrenNodeIds(targetNode, results) {
        let selected = [];
        let expanded = [];
        
        if (targetNode.nodes) {
            //検索にヒットしたノードが子ノードを持つ場合
            targetNode.nodes.forEach((target) => {
                if (!this.existMatchNode(target.nodeId, results) && !target.state.selected) {   //ヒットしていない
                    selected.push(target.nodeId);   //選択状態にする
                    let childrenNodeIds = this.getUpdateTargetChildrenNodeIds(target, results);       //再帰処理
                    selected = selected.concat(childrenNodeIds.selected);
                    expanded = expanded.concat(childrenNodeIds.expanded);
                }
            })
        }
        else {
            //一番下の階層に到達したらノード展開
            if (!targetNode.state.expanded) {
                expanded.push(targetNode.nodeId);
            }
        }

        return { selected: selected, expanded: expanded };      
    }
    
    /**
     * 親ノードIDが重複しないノードを取得する
     * @param {*} nodes 対象ノード一覧
     */
    getFilterNodesByParentId(nodes) {
        var arrObj = {};
        var retNodes = [];
        for (let i = 0; i < nodes.length; i++) {
            arrObj[nodes[i].parentId] = nodes[i];            
        }
        for (const key in arrObj) {
            if (arrObj.hasOwnProperty(key)) {
                retNodes.push(arrObj[key]);                
            }
        }
        return retNodes;
    }

    /**
     * 重複したIDを排除した配列を取得する
     * @param {array} targetArray 対象の配列
     */
    filterUniqueId(targetArray) {
        return targetArray.filter((x, i, self) => self.indexOf(x) === i);
    }

    /**
     * パンくず文字列を生成
     * @param {any} node
     */
    createBreadCrumbString(node) {
        let nameKey = '';
        for (let k of Object.keys(node)) {
            if (k != 'text' && node.text === node[k]) {
                nameKey = k;
                break;
            }
        }

        let str = node[nameKey];
        let temp = node.parent;
        while (temp) {
            str = `${temp[nameKey]} > ${str}`;
            temp = temp.parent;
        }
        return str;
    }

    /**
     * render
     */
    render() {
        const { searchable, showCheckbox, maxHeight, searchFormClassName, disabled } = this.props;
        const { searchMode, searchResults, searchString } = this.state;

        const style = maxHeight && { 'max-height': maxHeight + 'px', overflow: 'auto' };

        return (
            <div>
                {searchable&&
                    <SearchForm
                        className={searchFormClassName}
                        showCheckButton={showCheckbox}
                        searchString={searchString}
                        isReadOnly={disabled}
                        searchMode={searchMode}
                        onChange={(value) => this.handleChange(value)}
                        onSearchClick={() => this.handleClickSearch()}
                        onSearchClearClick={() => this.handleClickSearchClear()}
                        onCheckButtonClick={(isCheck) => this.handleClickAllCheck(isCheck)}
                    />
                }
                {searchMode &&
                    <ListGroup className="treeview" style={style}>
                        {(searchResults && searchResults.length) ?
                            searchResults.map((result) => {
                                const checked = result.state.checked;
                                const iconClass = checked ? 'fa-check-square' : 'fa-square';
                                return (
                                    <ListGroupItem>
                                        <span
                                            className={classNames('tree-checkbox icon fal', iconClass)}
                                            onClick={() => this.handleClickCheck(!checked, result)}
                                        ></span>
                                        {this.createBreadCrumbString(result)}
                                    </ListGroupItem>
                                );
                            })
                            :
                            <ListGroupItem>該当なし</ListGroupItem>
                        }
                    </ListGroup>
                }
                <div ref="tree" className="treeview" style={Object.assign({}, style, { display: searchMode ? 'none' : 'block'})}></div>

            </div>
        );
    }
}

/**
 * 検索フォーム
 * <SearchForm />
 * @param {string} searchString 検索文字列
 * @param {boolean} showCheckButton チェックボタンを表示するかどうか
 * @param {boolean} isReadOnly 読み取り専用かどうか
 * @param {function} onChange 検索文字列の変更時に呼び出す
 * @param {function} onCheckButtonClick チェックボタンクリック時に呼び出す（引数：true → チェックを入れる、false → チェックを解除）
 */
const SearchForm = ({ className, searchString, searchMode, showCheckButton, isReadOnly, onChange, onCheckButtonClick, onSearchClick, onSearchClearClick }) => (
    <FormGroup className={className}>
        <ControlLabel pullright>検索:</ControlLabel>
        {showCheckButton?
            <InputGroup>
                <SearchControl 
                    searchString={searchString} 
                    onChange={(v) => onChange(v)}
                />
                <InputGroup.Button>
                    <OverlayButton isReadOnly={isReadOnly} iconClass="fal fa-search" description="検索" onClick={() => onSearchClick()} />
                    <OverlayButton isReadOnly={isReadOnly || !searchMode} iconClass="fal fa-undo" description="ツリー表示に戻る" onClick={() => onSearchClearClick()} />
                    <OverlayButton isReadOnly={isReadOnly || !searchMode} iconClass="fal fa-check" description="検索結果にチェックを入れる" onClick={() => onCheckButtonClick(true)} />
                    <OverlayButton isReadOnly={isReadOnly || !searchMode} iconClass="fal fa-times" description="検索結果のチェックを解除する" onClick={() => onCheckButtonClick(false)} />
                </InputGroup.Button>
            </InputGroup>
            :
            <InputGroup style={{ width: '100%' }}>
                <SearchControl
                    searchString={searchString}
                    onChange={(v) => onChange(v)}
                    isReadOnly={isReadOnly}
                />
                <InputGroup.Button>
                    <OverlayButton isReadOnly={isReadOnly} iconClass="fal fa-search" description="検索" onClick={() => onSearchClick()} />
                </InputGroup.Button>
            </InputGroup>
        }
    </FormGroup>
);

/**
 * 検索テキストボックス
 * <SearchControl />
 * @param {string} searchString 検索文字列
 * @param {function} onChange 検索文字列の変更時に呼び出す
 */
const SearchControl = ({searchString, onChange, isReadOnly}) => (
    <FormControl type="text"
                 value={searchString}
                 placeholder="search"
                 onChange={(e) => onChange(e.target.value)}
                 disabled={isReadOnly}
    />
);

/**
 * 説明付きボタン
 * <OverlayButton />
 * @param {string} iconClass アイコンクラス
 * @param {string} description ボタンの説明
 * @param {boolean} isReadOnly 読み取り専用かどうか
 * @param {function} onClick ボタンクリック時に呼び出す
 */
const OverlayButton = ({ iconClass, description, isReadOnly, onClick }) => (
    <OverlayTrigger placement="bottom" overlay={<Tooltip style={isReadOnly && { display: 'none' }}>{ description }</Tooltip >}>
        <Button onClick={() => onClick()} disabled={isReadOnly}>
            <Icon className={iconClass}/>
        </Button>
    </OverlayTrigger>
);

TreeView.PropTypes = {
    data: PropTypes.arrayOf(
        PropTypes.shape({
            text: PropTypes.string,
            nodes: PropTypes.arrayOf(PropTypes.object),
            tag: PropTypes.string,
            state: PropTypes.shape({
                checked: PropTypes.bool,
                selected: PropTypes.bool,
                expanded: PropTypes.bool
            })
        })
    ),
    showCheckbox: PropTypes.bool,
    expandAll: PropTypes.bool,
    onNodeSelect: PropTypes.func,
    onNodeCheckChanged: PropTypes.func,
    onNodeExpand: PropTypes.func,
    onNodeCollapse: PropTypes.func,
    searchable: PropTypes.bool,
    defaultCollapse:PropTypes.bool,
    maxHeight: PropTypes.number,
    levels: PropTypes.number,               //デフォルトでノードを開いておくツリーの深さ(デフォルト1)
    checkMode: PropTypes.oneOf(['individual', 'collective']),  //チェックモード(デフォルトはまとめてチェック)
    searchFormClassName: PropTypes.string,    //検索フォームのクラスネーム
    isGetDuplicateSelectEvent:PropTypes.bool  //選択中ノードが再度クリックされた場合にイベントを発生させるかどうか
}

TreeView.defaultProps = {
    checkMode: 'collective'
}