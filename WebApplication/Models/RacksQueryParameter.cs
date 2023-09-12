using garmit.DomainObject;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace garmit.Web.Models
{
    /// <summary>
    /// ラック（複数）のパラメータ
    /// </summary>
    public class RacksQueryParameter
    {
        /// <summary>
        /// ロケーションID
        /// </summary>
        public IEnumerable<string> RackIds { get; set; }

        /// <summary>
        /// レイアウトオブジェクトが必要かどうか
        /// </summary>
        public bool NeedLayoutObject { get; set; }
    }
}