using garmit.DomainObject;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace garmit.Web.Models
{
    /// <summary>
    /// 温度分布図情報取得時のパラメータ
    /// </summary>
    public class GetTempMapQueryParameter
    {
        /// <summary>
        /// 選択中レイアウト情報
        /// </summary>
        public Layout LayoutInfo { get; set; }
        
        /// <summary>
        /// 測定ポイントを表示するかどうかどうか
        /// </summary>
        public bool NeedsKnownPointMark { get; set; }

    }
}