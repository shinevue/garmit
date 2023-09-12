/**
 * @license Copyright 2018 DENSO
 * 
 * 共通定数(constant.js)
 * 
 */

'use strict';

/********************************************
 * 自動更新
 ********************************************/

/**
 * トップメニュー、アラームサイドバーの自動更新時間（msec）
 */
export const ALARM_UPDATE_INTERVAL = 30000;

/**
 * 自動更新時間(msec)
 */
export const AUTO_UPDATE_VALUES = {
    none: 0,
    fast: 30000,
    slow: 60000
};

/********************************************
 * 検索条件
 ********************************************/
 export const SEARCH_CONDITION_TARGET_NAME_LIST = {
    locations: "ロケーション",
    enterprises: "所属",
    tags: "タグ",
    egroups: "電源系統",
    functions: "操作機能",
    operationTypes: "操作種別",
    loginUsers: "ユーザー",
    hashTags: "ハッシュタグ",
    templateName: "テンプレート名称",
    templateMemo: "テンプレートメモ",
    consumers: "コンシューマー",
    patchboardNames: "配線盤名称",
    patchboardTypes: "配線盤種別",
    patchCableTypes: "ケーブル種別",
    projectTypes: "工事種別",
    projectNos: "工事番号",
    lineTypes: "回線種別",
    lineNames: "回線名", 
    lineIds: "回線ID",
    idfConnects: "IDF線番",
    userNames: "ユーザー名",
    inConnects: "局入線番",
    relConnects: "中継線番", 
    memos: "備考",
    cardIds: 'カードID',
    cardNames: 'カード名称',
    enterpriseNames: '会社名',
    userKanas: 'ユーザー名（フリガナ）',
    allowLocations: '操作可能ラック',
    icTerminals: '読み取り端末'
};

/********************************************
 * アラーム関係
 ********************************************/

/**
 * アラームカテゴリ
 */
export const ALARM_CATEGORY = {
    systemError: 1,		//システムエラー
    error: 2,			//異常
    alarm: 3			//注意
};

/**
 * アラーム種別
 */
export const ALARM_NAME = {
    upperError: "上限異常",
    lowerError: "下限異常",
    upperAlarm: "上限注意",
    lowerAlarm: "下限注意",
    breakOpen: "こじ開け",
    keyOpenOver: "開錠超過",
    expired: "期限超過",
    beforeExpired: "期限超過前",
    loadOver: "荷重制限超過",
    beforeLoadOver: "荷重制限超過前",
    slaveTerminalError: "スレーブ機器異常",
    connectionError: "通信異常",
    downloadError: "ファイルDL異常",
    mailError: "メール送信異常",
    bufferDataError: "データ収集異常（バッファ）",
    realDataError: "データ収集異常（瞬時）",
    summaryDataError: "データ収集異常（集計）",
    reportOutputError: "レポート出力異常"
};

/********************************************
 * アセット関係
 ********************************************/

/**
 * IPアドレスの種別リスト
 */
export const IP_ADDRESS_TYPE_MAP = [
    { value: 0, name: 'IPv4' },
    { value: 1, name: 'IPv6' }
];

/**
 * テンプレート種別 
 */
export const TEMPLATE_TYPE = {
    rack: 'rack',
    unit: 'unit'
}

/********************************************
 * 電源関係
 ********************************************/

/**
 * 分岐電源のステータス
 */
export const BREAKER_STATUS = [
    { value: 0, name: '未使用' },
    { value: 1, name: '使用中' }
];

/**
 * 配電方式
 */
export const POWER_DISTRIBUTION_SYSTEM = [
    { value: 0, name: '対象外' },
    { value: 1, name: '単相2線' },
    { value: 2, name: '単相3線' },
    { value: 3, name: '三相3線' },
    { value: 4, name: '三相4線' }
];

/********************************************
 * ポイント・計測値・集計関係
 ********************************************/

/**
 * ポイント種別
 */
export const POINT_TYPE = {
    normal: 0,
    calc: 1,
    virtualCalc: 2
};


export const POINT_TYPE_OPTIONS = [
    { value: POINT_TYPE.normal, name: '測定' },
    { value: POINT_TYPE.calc, name: '演算' },
    { value: POINT_TYPE.virtualCalc, name: '仮想演算' }
];

/**
 * 換算種別
 */
export const CONVERSION_TYPE = [
    { value: 0, name: '＋' },
    { value: 1, name: '－' },
    { value: 2, name: '×' },
    { value: 3, name: '÷' }
];

/**
 * 計測値種別
 */
export const MEASURED_DATA_TYPE = {
    realTime: 0,    // リアルタイムデータ
    summary: 1      // サマリーデータ
}

/**
 * 計測値種別一覧
 */
export const MDATA_TYPE_OPTIONS = { realTime: "RealTime", summary: "Summary" };


/**
 * 集計種別
 */
export const SUMMARY_TYPE = {
    max: 0,
    min: 1,
    average: 2,
    snap: 3,
    diff: 4
}

/**
 * 集計種別のオプション
 */
export const SUMMARY_TYPE_OPTION = [
    { value: SUMMARY_TYPE.max, name: "最大" },
    { value: SUMMARY_TYPE.min, name: "最小" },
    { value: SUMMARY_TYPE.average, name: "平均" },
    { value: SUMMARY_TYPE.snap, name: "瞬時" },
    { value: SUMMARY_TYPE.diff, name: "差分" },
];

/********************************************
 * フロアマップ
 ********************************************/

export const BORDER_WIDTH = 2.4;       //描画エリアのボーダーサイズ
export const MINIATURE_HEIGHT = 86;    //ミニチュアオブジェクトの高さ

export const MAP_DRAWING_AREA_INIT = {
    width: 640,
    height: 500
}

/**
 * 描画エリアサイズサイズ
 */
export const DRAW_AREA_SIZE = {
    width: 640,
    height:480
}

/**
 * オブジェクト種別
 */
export const OBJECT_TYPE = {
    label: 1,         //ラベル
    picture: 2,       //ピクチャ
    valueLabel: 3     //測定値ラベル
}

/**
 * オブジェクトのリンク種別
 */
export const LINK_TYPE = {
    none: 0,        //リンクなし
    point: 1,       //ポイント
    location: 2,    //ロケーション
    layout: 3,      //レイアウト
    egroup: 4        //分電盤
}

/**
 * フロアマップオプションID
 */
export const FLOORMAP_OPTIONS = {
    alarm: { optionId: 1 , text:"アラーム表示" },  
    tempmap: { optionId: 2, text: "温度分布", switchInfo: { text:"測定ポイント表示"} },    
    elecKey: { optionId: 5, text: "電気錠" }                  
}

/**
 * ラックキャパシティオプションID
 */
export const RACK_CAPACITY_OPTIONS = {
    rackStatus: { optionId: 1, text: "ラックステータス" },
}

/**
 * マップ遷移種別
 */
export const MAP_TRANSITION_TYPE = {
    back: 0,        //戻る
    forward: 1,     //進む
    referrer: 2,    //リンク元レイアウトに戻る
}

/**
 * マップツールボタン種別
 */
export const MAP_TOOL_TYPE = {
    back: 0,        //戻る
    forward: 1,     //進む
    referrer: 2,    //リンク元レイアウトに戻る
}

/********************************************
 * 日付関連
 ********************************************/

/**
 * 日付時刻フォーマット
 */
export const DATE_TIME_FORMAT = {
    dateTime: "YYYY/MM/DD HH:mm",
    dateHour: "YYYY/MM/DD HH:00",
    date: "YYYY/MM/DD",
    month: "YYYY/MM",
    year: "YYYY"
}

export const CSV_DATE_TIME_FORMAT = {
    dateTime: "YYYYMMDDHHmm",
    date: "YYYYMMDD",
    month: "YYYYMM",
    year: "YYYY"
}

/********************************************
 * レポート
 ********************************************/

/**
 * レポート種別一覧
 */
export const REPORT_TYPE_OPTIONS = {
    daily: "Daily",
    monthly: "Monthly",
    annual: "Annual",
    period: "Period"
};

/**
 * リアルタイム用レポート種別一覧
 */
export const REALTIME_OPTIONS = [
    { value: REPORT_TYPE_OPTIONS.daily, name: "日報", format: DATE_TIME_FORMAT.date },
    { value: REPORT_TYPE_OPTIONS.period, name: "期間", format: DATE_TIME_FORMAT.dateTime}
];

/**
 * ダイジェスト用レポート種別一覧
 */
export const DIGEST_OPTIONS = [
    { value: REPORT_TYPE_OPTIONS.daily, name: "日報", format: DATE_TIME_FORMAT.date },
    { value: REPORT_TYPE_OPTIONS.monthly, name: "月報", format: DATE_TIME_FORMAT.month },
    { value: REPORT_TYPE_OPTIONS.annual, name: "年報", format: DATE_TIME_FORMAT.year },
    { value: REPORT_TYPE_OPTIONS.period, name: "期間", format: DATE_TIME_FORMAT.dateHour }
];

/**
 * レポート間隔一覧
 */
export const EXPORT_SPAN = {
    none: { value: "None", name: "指定なし" },
    oneMinute: { value: "OneMinute", name: "1分" },
    fiveMinutes: { value: "FiveMinutes", name: "5分" },
    tenMinutes: { value: "TenMinutes", name: "10分" }
}

export const EXPORT_SPAN_OPTIONS = [EXPORT_SPAN.none, EXPORT_SPAN.oneMinute, EXPORT_SPAN.fiveMinutes, EXPORT_SPAN.tenMinutes];


/********************************************
 * レポートスケジュール
 ********************************************/

/**
 * 計測値種別
 */
export const VALUE_TYPE = {
    realTime: 1,    // リアルタイムデータ
    summary: 2      // サマリーデータ
}

/**
 * 計測値種別一覧
 */
export const VALUE_TYPE_OPTIONS = [
    { value: VALUE_TYPE.realTime, text: "リアルタイム" },
    { value: VALUE_TYPE.summary, text: "ダイジェスト" }
]

/**
 * 出力種別
 */
export const REPORT_OUTPUT_TYPE = {
    daily: 1,
    monthly: 2,
    annual: 3,
    period: 4
};

/**
 * リアルタイム用出力種別のオプション
 */
export const REALTIME_OUTPUT_OPTIONS = [
    { value: REPORT_OUTPUT_TYPE.daily, name: "日報" },
    { value: REPORT_OUTPUT_TYPE.period, name: "期間" },
];

/**
 * ダイジェスト用出力種別のオプション
 */
export const DIGEST_OUTPUT_OPTIONS = [
    { value: REPORT_OUTPUT_TYPE.daily, name: "日報" },
    { value: REPORT_OUTPUT_TYPE.monthly, name: "月報" },
    { value: REPORT_OUTPUT_TYPE.annual, name: "年報" },
    { value: REPORT_OUTPUT_TYPE.period, name: "期間" },
];

/**
 * 集計種別
 */
export const OUTPUT_SUMMARY_TYPE = {
    max: 1,
    min: 2,
    average: 3,
    snap: 4,
    diff: 5
}

/**
 * 集計種別のオプション
 */
export const OUTPUT_SUMMARY_TYPE_OPTION = [
    { value: OUTPUT_SUMMARY_TYPE.max, name: "最大" },
    { value: OUTPUT_SUMMARY_TYPE.min, name: "最小" },
    { value: OUTPUT_SUMMARY_TYPE.average, name: "平均" },
    { value: OUTPUT_SUMMARY_TYPE.snap, name: "瞬時" },
    { value: OUTPUT_SUMMARY_TYPE.diff, name: "差分" },
];

/**
 * 出力間隔
 */
export const RECORD_INTERVAL = {
    none: null,
    oneMinute: 1,
    fiveMinutes: 5,
    tenMinutes: 10
};

/**
 * 出力間隔のオプション
 */
export const RECORD_INTERVAL_OPTIONS = [
    { value: RECORD_INTERVAL.none, name: "指定なし" },
    { value: RECORD_INTERVAL.oneMinute, name: "1分" },
    { value: RECORD_INTERVAL.fiveMinutes, name: "5分" },
    { value: RECORD_INTERVAL.tenMinutes, name: "10分" }
];

/********************************************
 * アセットレポート
 ********************************************/

/**
 * アセットレポートの出力対象
 */
export const ASSET_REPORT_TYPE = {
    rack: 1,
    unit: 2
}

/**
 * レポートの出力方法種別
 */
export const ASSET_REPORT_OUTPUT_TYPE = {
    only: 1,        //ラックもしくはユニットのみ
    all: 2,         //まとめて出力
    each: 3         //分けて出力
}

/********************************************
 * インポート
 ********************************************/

/**
 * インポート種別
 */
export const IMPORT_TYPE = {
    rack: 1,
    unit: 2,
    point: 3,
    icCard: 4
};

export const EXPORT_TYPE = {
    rack: 11,
    rackPower: 12,
    rackOutlet: 13,
    rackLink: 14,
    unit: 21,
    unitPower: 22,
    unitLink: 23,
    unitPort: 24,
    unitIPAddress: 25,
    point: 31,
    icCard: 41
};

export const EXPORT_TYPE_OPTIONS = [
    { type: IMPORT_TYPE.rack, value: EXPORT_TYPE.rack, name: 'ラック情報' },
    { type: IMPORT_TYPE.rack, value: EXPORT_TYPE.rackPower, name: '電源情報' },
    { type: IMPORT_TYPE.rack, value: EXPORT_TYPE.rackOutlet, name: 'アウトレット情報' },
    { type: IMPORT_TYPE.rack, value: EXPORT_TYPE.rackLink, name: 'リンク情報' },
    { type: IMPORT_TYPE.unit, value: EXPORT_TYPE.unit, name: 'ユニット情報' },
    { type: IMPORT_TYPE.unit, value: EXPORT_TYPE.unitPower, name: '電源情報' },
    { type: IMPORT_TYPE.unit, value: EXPORT_TYPE.unitLink, name: 'リンク情報' },
    { type: IMPORT_TYPE.unit, value: EXPORT_TYPE.unitPort, name: 'ポート情報' },
    { type: IMPORT_TYPE.unit, value: EXPORT_TYPE.unitIPAddress, name: 'IPアドレス情報' },
    { type: IMPORT_TYPE.point, value: EXPORT_TYPE.point, name: 'ポイント情報' },
    { type: IMPORT_TYPE.icCard, value: EXPORT_TYPE.icCard, name: 'ICカード情報' }
];

export const REQUIRED_TYPE = {
    notRequired: 0,
    requiredAtCreate: 1,
    requiredAtUpdate: 2
};

/********************************************
 * 検索結果一覧
 ********************************************/

/**
 * HoverButtonの操作タイプ
 */
export const BUTTON_OPERATION_TYPE = {
    edit: 1,           //編集ボタン
    delete: 2,         //削除ボタン
    pointDetail: 3,    //ポイント詳細表示ボタン
    graphDisp: 4,      //グラフ表示ボタン
    confirm: 5,        //確認ボタン
    linkToFloorMap: 6,
    linkToRack: 7,
    linkToUnit: 8,
    linkToDatagate: 9,
    gateStatus: 10,
    detail: 11,
    download: 12,
    linkToReportSchedule: 13,
    linkToConsumer: 16,
    linkToElectricLockMap: 17,
    lock: 18,
    unlock: 19,
    linkToProject: 20,
    linkToLine: 21,
    linkToPatchboard: 22
};

/**
 * 検索結果のセル種別
 */
export const SEARCHRESULT_CELL_TYPE = {
    string: 1,
    link: 2,
    image: 3,
    assetReportSubInfoButton: 4,
    button: 5,
    buttons: 6
}

/**
 * セル内のボタンの操作タイプ
 */
export const CELL_BUTTON_OPERATION_TYPE = {
    off: 0,         //停止ボタン
    on: 1           //実行ボタン
};

/********************************************
 * 権限
 ********************************************/

/**
 * 企業の参照レベル
 */
export const ENTERPRISE_LEVEL = [
    { value: 1, name: 'システム管理者' },
    { value: 2, name: '運用管理者' },
    { value: 3, name: '運用者' },
    { value: 4, name: '参照' }
];

/********************************************
 * 制御コントロール
 ********************************************/

/**
 * 制御コントロールモード
 */
export const CONTROL_MODE = {
    command: 0,             //制御コマンド（個別制御）
    trigger: 1              //トリガー制御（デマンド/発電量）
};

/**
 * 制御コントロールモードのオプション
 */
export const CONTROL_MODE_OPTIONS = [
    { value: CONTROL_MODE.command, text: '個別' },
    { value: CONTROL_MODE.trigger, text: 'デマンド/発電量' }
];

/**
 * トリガー種別の警報電力超過なし
 */
export const TRIGGER_TYPE_ALARM_POWER_NONE = 0;

/********************************************
 * 機器
 ********************************************/

/**
 * 機器のプロトコル種別
 */
export const DATAGATE_PROTOCOL_TYPE = {
    snmpv1: 1,
    snmpv2: 2,
    modbusTCP: 11,
    anywireModbus: 12,
    batteryMonitor: 51,
    mqtt: 21
};

/********************************************
 * 送信コマンド
 ********************************************/

/**
 * 送信方法
 */
export const SENDCOMMAND_SEND_MODE = {
    none: 0,        //指定なし
    set: 1,
    trap: 2
};

/**
 * 送信方法のオプション
 */
export const SENDCOMMAND_SEND_MODE_OPTIONS = [ 
    { value: SENDCOMMAND_SEND_MODE.set, name: 'Set' },
    { value: SENDCOMMAND_SEND_MODE.trap, name: 'Trap' }
]

/**
 * 送信タイプ
 */
export const SENDCOMMAND_VALUE_TYPE = {
    integer: 1,
    displayString: 2,
    notification: 3
}

/**
 * 送信値タイプのオプション
 */
export const SENDCOMMAND_VALUE_TYPE_OPTIONS = [ 
    { value: SENDCOMMAND_VALUE_TYPE.integer, name: '数値' },
    { value: SENDCOMMAND_VALUE_TYPE.displayString, name: '文字列' },
    { value: SENDCOMMAND_VALUE_TYPE.notification, name: '通知' }
];

/**
 * 送信方法：SETの場合に除外する送信タイプ
 */
export const EXCLUDED_SET_VALUE_TYPES = [
    SENDCOMMAND_VALUE_TYPE.notification
];

/********************************************
 * デマンドグラフ・サマリ関連
 ********************************************/

export const DISPLAY_TIME_SPANS = {
    halfAnHour: 1,
    hour: 2,
    day_byHalfAnHour: 3,
    day_byHour: 4,
    month: 5,
    year: 6    
};

/********************************************
 * 電気錠
 ********************************************/

/**
 * 電気錠ステータスID
 */
export const LOCK_STATUS_ID = {
    notMeasured: 1,
    lock: 2,
    unlock: 3,
    open: 4,
    error: 5,
    lockedOpen: 6
}

/**
 * 電気錠操作対象
 */
export const ELECTRIC_RACK_TARGET = {
    none: 0,
    front: 1,
    rear: 2,
    both: 3
}

/**
 * 鍵種別
 */
export const KEY_TYPE_ID = {
    physicalKey: 1,
    electricKey: 2 
}

/**
 * 鍵種別のオプション
 */
export const KEY_TYPE_OPTIONS = [ 
    { value: KEY_TYPE_ID.electricKey, text: '電気錠' },
    { value: KEY_TYPE_ID.physicalKey, text: '物理錠' }
];

/********************************************
 * 案件（回線管理）
 ********************************************/

/**
 * 工事種別
 */
export const PROJECT_TYPE = {
    new: 0,
    change: 1,
    remove: 2,
    temp: 3,
    left: 4,
    fix_temp: 5,
    fix_left: 6
}

/**
 * 工事種別一覧
 */
export const PROJECT_TYPE_LIST = [
    { typeId: PROJECT_TYPE.temp, name: '仮登録' },
    { typeId: PROJECT_TYPE.new, name: '新設' },
    { typeId: PROJECT_TYPE.change, name: '変更' },
    { typeId: PROJECT_TYPE.left, name: '残置' },
    { typeId: PROJECT_TYPE.remove, name: '撤去' },
    { typeId: PROJECT_TYPE.fix_temp, name: '修正（仮登録）' },
    { typeId: PROJECT_TYPE.fix_left, name: '修正（残置）' },
]

/**
 * 工事種別オプション
 */
export const PROJECT_TYPE_OPTIONS = [
    { value: PROJECT_TYPE.temp, text: '仮登録' },
    { value: PROJECT_TYPE.new, text: '新設' },
    { value: PROJECT_TYPE.change, text: '変更' },
    { value: PROJECT_TYPE.left, text: '残置' },
    { value: PROJECT_TYPE.remove, text: '撤去' },
    { value: PROJECT_TYPE.fix_temp, text: '修正（仮登録）' },
    { value: PROJECT_TYPE.fix_left, text: '修正（残置）' },
];

/**
 * 回線の仮登録方法
 */
export const LINE_TEMP_TYPE = {
    inOnly: 0,
    premiseOnly: 1
}

/**
 * 回線の仮登録方法のオプション
 */
export const LINE_TEMP_TYPE_OPTIONS = [
    { value: LINE_TEMP_TYPE.inOnly, text: '局入のみ' },
    { value: LINE_TEMP_TYPE.premiseOnly, text: '構内のみ' }
]

/**
 * 回線の検索方法
 */
export const LINE_SEARCH_TYPE = {
    inOnly: 0,
    premiseOnly: 1,
    inUse: 2
}

/**
 * 回線検索方法のオプション
 */
export const LINE_SEARCH_TYPE_OPTIONS = [
    { value: LINE_SEARCH_TYPE.inUse, text: '使用中' },
    { value: LINE_SEARCH_TYPE.inOnly, text: '局入のみ' },
    { value: LINE_SEARCH_TYPE.premiseOnly, text: '構内のみ' }
]

/**
 * 回線検索方法（工事種別：修正）のオプション
 */
export const LINE_FIX_SEARCH_TYPE_OPTIONS = [
    { value: LINE_SEARCH_TYPE.inOnly, text: '局入のみ' },
    { value: LINE_SEARCH_TYPE.premiseOnly, text: '構内のみ' }
]

/**
 * 回線の残置方法
 */
export const LINE_LEFT_TYPE = {
    inOnly: 0,
    premiseOnly: 1
}

/**
 * 回線残置方法のオプション
 */
export const LINE_LEFT_TYPE_OPTIONS = [
    { value: LINE_LEFT_TYPE.inOnly, text: '局入のみ' },
    { value: LINE_LEFT_TYPE.premiseOnly, text: '構内のみ' }
]


/**
 * 回線状態ステータス
 */
export const LINE_STATUS = {
	notUse: 0,
	use: 1,
	inOnly: 2,
	premiseOnly: 3
}

/********************************************
 * ダッシュボード
 ********************************************/
export const DASHBOARD_POSITION = {
    top:            0,
    middleLeft:    11,
    middleRight:   19,
    bottom:        20,
    disable:     -999
};

export const DASHBOARD_FUNCTION = {
    informations: 1,
    schedules:    2,
    navigations:  3,
    incidentLog:  4,
    operationLog: 5,
    links:        6
};

/********************************************
 * ICカード読取り
 ********************************************/
export const ICCARD_TYPE = Object.freeze({
    FELICA : 0,
    MIFARE : 1,
    TYPE_B : 2,
});

/********************************************
 * その他
 ********************************************/

/**
 * メッセージモーダルのボタンスタイル
 */
export const MESSAGEMODAL_BUTTON = {
    message: 'message',
    confirm: 'confirm',
    delete: 'delete',
    save: 'save'
};

/**
 * 操作種別
 */
export const OPERATION_TYPE = {
    create: { value: 1, name: '新規' },
    edit: { value: 2, name: '編集' },
    delete: { value: 3, name: '削除' },
    login: { value: 4, name: 'ログイン' },
    logout: { value: 5, name: 'ログアウト' },
    unlock: { value: 6, name: '開錠' },
    lock: { value: 7, name: '施錠' }
};

/**
 * ログイン種別
 */
export const LOGIN_TYPE = {
    userId: 1,
    mailAddress: 2
}

/**
 * ショートカットキー一覧
 */
export const HOT_KEYS = {
    add: "alt+n",					//新規登録
    search: "ctrl+shift+f",         //検索
    clearCond: "ctrl+shift+space",  //検索条件クリア
    edit: "ctrl+shift+e",           //（一括）編集
    delete: "alt+delete",           //（一括）削除
    upload: "alt+o",                //（一括）アップロード
    confirm: "alt+c",               //（一括）確認
    outputReport: "alt+r",          //レポート出力
    save: "alt+s",                  //保存
    update: "alt+f5"                //手動更新
}