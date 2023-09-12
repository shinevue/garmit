using garmit.DomainObject;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace garmit.Web.Models
{
    /// <summary>
    /// レイアウト情報取得時のパラメータ
    /// </summary>
    public class GetLayoutInfoQueryParameter
    {
        /// <summary>
        /// 選択中レイアウト情報
        /// </summary>
        public Layout LayoutInfo { get; set; }
        
        /// <summary>
        /// 換算するかどうか
        /// </summary>
        public bool IsConvert { get; set; }

        /// <summary>
        /// フロアマップオプション
        /// </summary>
        public FloorMapOption FloorMapOption { get; set; }

        /// <summary>
        /// ラックキャパシティオプション
        /// </summary>
        public RackCapacityOption RackCapacityOption { get; set; }

    }
}