using garmit.DomainObject;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace garmit.Web.Models
{
    /// <summary>
    /// ラックのパラメータ
    /// </summary>
    public class RackQueryParameter
    {
        /// <summary>
        /// ロケーションID
        /// </summary>
        public int LocationId { get; set; }

        /// <summary>
        /// レイアウトオブジェクトが必要かどうか
        /// </summary>
        public bool NeedLayoutObject { get; set; }
    }
}