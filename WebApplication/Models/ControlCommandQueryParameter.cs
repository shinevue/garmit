using garmit.DomainObject;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using static garmit.DomainObject.Enumeration;

namespace garmit.Web.Models
{
    /// <summary>
    /// 制御設定用パラメータ
    /// </summary>
    public class ControlCommandQueryParameter
    {
        /// <summary>
        /// 制御ID（単体） ※制御コマンドもトリガー制御もどちらでも使用
        /// </summary>
        public int ControlId { get; set; }

        /// <summary>
        /// 制御IDリスト（複数） ※制御コマンドもトリガー制御もどちらでも使用
        /// </summary>
        public IEnumerable<int> ControlIds { get; set; }
        
        /// <summary>
        /// 検索対象のロケーションIDリスト ※実行制御の選択肢取得時に使用
        /// </summary>
        public IEnumerable<int> LocationIds { get; set; }

        /// <summary>
        /// 編集画面で選択したロケーションID
        /// </summary>
        public int LocationId { get; set; }

        /// <summary>
        /// 編集画面で選択したトリガーID
        /// </summary>
        public TriggerId_e? TriggerId { get; set; }

        /// <summary>
        /// 検索対象の所属IDリスト
        /// </summary>
        public IEnumerable<int> EnterpriseIds { get; set; }


    }
}